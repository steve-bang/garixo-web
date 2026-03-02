'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { Upload } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { useForm } from 'react-hook-form';

import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { useCreateSupportTicket } from '@/features/support/hooks';
import { SupportRequestError } from '@/features/support/service';
import {
  createSupportTicketSchema,
  type CreateSupportTicketInput
} from '@/features/support/schema';
import { useToast } from '@/hooks/use-toast';

type SupportTicketFormProps = {
  onSubmitted?: () => void;
};

export function SupportTicketForm({
  onSubmitted
}: SupportTicketFormProps): JSX.Element {
  const SUCCESS_COOLDOWN_MS = 15 * 1000;
  const toast = useToast();
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [screenshotFile, setScreenshotFile] = useState<File | null>(null);
  const [isCooldown, setIsCooldown] = useState(false);
  const createMutation = useCreateSupportTicket();

  useEffect(() => {
    if (!isCooldown) {
      return;
    }

    const timer = setTimeout(() => {
      setIsCooldown(false);
    }, SUCCESS_COOLDOWN_MS);

    return () => clearTimeout(timer);
  }, [isCooldown]);

  const form = useForm<CreateSupportTicketInput>({
    resolver: zodResolver(createSupportTicketSchema),
    defaultValues: {
      shortDescription: '',
      message: '',
      type: 'problem'
    }
  });

  const onPickScreenshot = (file: File | null) => {
    if (!file) {
      setScreenshotFile(null);
      return;
    }

    if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) {
      toast.error('Please upload JPG, PNG, or WEBP.');
      return;
    }

    if (file.size > 3 * 1024 * 1024) {
      toast.error('Screenshot must be 3MB or smaller.');
      return;
    }

    setScreenshotFile(file);
  };

  const onSubmit = form.handleSubmit(async (values) => {
    try {
      await createMutation.mutateAsync({
        ...values,
        screenshotFile
      });

      form.reset({
        shortDescription: '',
        message: '',
        type: 'problem'
      });
      setScreenshotFile(null);
      setIsCooldown(true);
      toast.success('Thanks. Your support request has been sent.');
      onSubmitted?.();
    } catch (error) {
      if (error instanceof SupportRequestError && error.status === 429) {
        toast.error(
          'You have sent several requests in a short time. Please wait a few minutes and try again.'
        );
        return;
      }
      toast.error(
        error instanceof Error
          ? error.message
          : 'Could not send your request right now.'
      );
    }
  });

  return (
    <Card className="p-s6">
      <form className="space-y-s4" onSubmit={onSubmit}>
        <div className="grid gap-s4 md:grid-cols-2">
          <div className="space-y-s1">
            <label
              htmlFor="ticketType"
              className="text-small font-medium text-text-primary"
            >
              Request type
            </label>
            <Select id="ticketType" {...form.register('type')}>
              <option value="problem">Report a problem</option>
              <option value="question">Ask a question</option>
              <option value="feature">Request a feature</option>
            </Select>
          </div>
        </div>

        <div className="space-y-s1">
          <label
            htmlFor="shortDescription"
            className="text-small font-medium text-text-primary"
          >
            Short description <span className="text-state-error">*</span>
          </label>
          <Input
            id="shortDescription"
            placeholder="Example: Invoice email did not send"
            {...form.register('shortDescription')}
          />
          {form.formState.errors.shortDescription ? (
            <p className="text-caption text-state-error">
              {form.formState.errors.shortDescription.message}
            </p>
          ) : null}
        </div>

        <div className="space-y-s1">
          <label
            htmlFor="message"
            className="text-small font-medium text-text-primary"
          >
            Detailed message <span className="text-state-error">*</span>
          </label>
          <Textarea
            id="message"
            rows={5}
            placeholder="Tell us what you expected and what happened."
            {...form.register('message')}
          />
          {form.formState.errors.message ? (
            <p className="text-caption text-state-error">
              {form.formState.errors.message.message}
            </p>
          ) : null}
        </div>

        <div className="space-y-s2">
          <p className="text-small font-medium text-text-primary">
            Screenshot (optional)
          </p>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp"
            className="hidden"
            onChange={(event) =>
              onPickScreenshot(event.target.files?.[0] ?? null)
            }
          />
          <div className="flex flex-wrap items-center gap-s2">
            <Button
              type="button"
              variant="secondary"
              onClick={() => fileInputRef.current?.click()}
            >
              <Upload className="size-4" />
              Upload Screenshot
            </Button>
            {screenshotFile ? (
              <span className="text-small text-text-secondary">
                {screenshotFile.name}
              </span>
            ) : (
              <span className="text-small text-text-muted">
                JPG, PNG, WEBP up to 3MB
              </span>
            )}
          </div>
        </div>

        <div className="flex justify-end border-t border-border pt-s4">
          <div className="space-y-s1 text-right">
            <Button
              type="submit"
              disabled={createMutation.isPending || isCooldown}
            >
              {createMutation.isPending ? 'Sending...' : 'Send Request'}
            </Button>
            {isCooldown ? (
              <p className="text-caption text-text-muted">
                Please wait a few seconds before sending another request.
              </p>
            ) : null}
          </div>
        </div>
      </form>
    </Card>
  );
}
