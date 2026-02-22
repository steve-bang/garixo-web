'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { CheckCircle2 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';

import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { submitGarageSetup } from '@/features/onboarding/service';

const setupSchema = z.object({
  garageName: z.string().trim().min(1, 'Garage name is required.'),
  address: z.string().trim().optional(),
  phone: z.string().trim().min(1, 'Phone is required.')
});

type SetupFormValues = z.infer<typeof setupSchema>;

type SetupGarageFormProps = {
  initialGarageName?: string;
};

function SetupSuccess({ garageName }: { garageName?: string }): JSX.Element {
  return (
    <Card className="animate-modal-fade-in w-full max-w-[680px] p-s8 text-center md:p-s10">
      <div className="mb-s5 mx-auto grid size-16 place-items-center rounded-full bg-success-100 text-success-700 motion-safe:animate-pulse">
        <CheckCircle2 className="size-8" />
      </div>

      <h2 className="text-h1">Your garage is ready</h2>
      <p className="mt-s3 text-body text-text-primary">
        {garageName ? (
          <>
            <span className="font-semibold">{garageName}</span> is now set up
            and ready to run smoothly.
          </>
        ) : (
          'Your garage is now set up and ready to run smoothly.'
        )}
      </p>
      <p className="mx-auto mt-s3 max-w-[540px] text-small text-text-secondary">
        Great start. You can now create your first work order, track daily jobs,
        and keep everything organized in one clear system.
      </p>

      <div className="mt-s6 flex items-center justify-center gap-s2">
        <span className="size-2 rounded-full bg-primary-600 motion-safe:animate-pulse" />
        <span className="size-2 rounded-full bg-primary-300 motion-safe:animate-pulse" />
        <span className="size-2 rounded-full bg-primary-200 motion-safe:animate-pulse" />
      </div>
      <p className="mt-s3 text-caption text-text-muted">
        Redirecting you to dashboard...
      </p>
    </Card>
  );
}

export function SetupGarageForm({
  initialGarageName
}: SetupGarageFormProps): JSX.Element {
  const router = useRouter();
  const [success, setSuccess] = useState(false);
  const [successGarageName, setSuccessGarageName] = useState<string>('');
  const hasPresetGarageName = Boolean(initialGarageName?.trim());
  const [showGarageNameField, setShowGarageNameField] =
    useState(!hasPresetGarageName);

  const form = useForm<SetupFormValues>({
    resolver: zodResolver(setupSchema),
    defaultValues: {
      garageName: initialGarageName?.trim() ?? '',
      address: '',
      phone: ''
    }
  });

  const onSubmit = form.handleSubmit(async (values) => {
    await submitGarageSetup(values);
    setSuccessGarageName(values.garageName.trim());
    setSuccess(true);
    window.setTimeout(() => {
      router.push('/dashboard');
    }, 1100);
  });

  if (success) {
    return <SetupSuccess garageName={successGarageName} />;
  }

  return (
    <Card className="w-full max-w-[520px] space-y-s6 p-s8">
      <div className="space-y-s2">
        <h1 className="text-h1">Setup Your Garage</h1>
        <p className="text-small text-text-secondary">
          A few quick details to start working.
        </p>
      </div>

      <form className="space-y-s4" onSubmit={onSubmit}>
        {hasPresetGarageName && !showGarageNameField ? (
          <div className="rounded-md border border-border bg-surface-default p-s3">
            <p className="text-small text-text-secondary">
              Welcome back. We found your garage name as{' '}
              <span className="font-medium text-text-primary">
                {initialGarageName}
              </span>
              . You can keep it or change it now.
            </p>
            <Button
              type="button"
              variant="secondary"
              className="mt-s3 h-10"
              onClick={() => setShowGarageNameField(true)}
            >
              Change Garage Name
            </Button>
          </div>
        ) : (
          <div className="space-y-s1">
            <label className="text-small font-medium text-text-secondary">
              Garage Name
            </label>
            <Input
              className="h-11"
              placeholder="Garage Auto Pro"
              {...form.register('garageName')}
            />
            {form.formState.errors.garageName ? (
              <p className="text-caption text-state-error">
                {form.formState.errors.garageName.message}
              </p>
            ) : null}
          </div>
        )}

        <div className="space-y-s1">
          <label className="text-small font-medium text-text-secondary">
            Address
          </label>
          <Input
            className="h-11"
            placeholder="Optional"
            {...form.register('address')}
          />
        </div>

        <div className="space-y-s1">
          <label className="text-small font-medium text-text-secondary">
            Phone
          </label>
          <Input
            className="h-11"
            {...form.register('phone')}
            placeholder="+1 (555) 210-8890"
          />
        </div>

        <Button
          type="submit"
          className="h-12 w-full"
          disabled={form.formState.isSubmitting}
        >
          {form.formState.isSubmitting ? 'Starting...' : 'Start Working'}
        </Button>
      </form>
    </Card>
  );
}
