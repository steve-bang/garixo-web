'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { Building2, Image as ImageIcon, Upload } from 'lucide-react';
import Image from 'next/image';
import { useEffect, useRef, useState, type ChangeEvent } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';

const garageInformationSchema = z.object({
  garageName: z.string().trim().min(1, 'Garage name is required.'),
  phone: z
    .string()
    .trim()
    .optional()
    .refine((value) => !value || /^\d{10,15}$/.test(value), 'Invalid phone format.'),
  email: z
    .string()
    .trim()
    .optional()
    .refine((value) => !value || z.string().email().safeParse(value).success, 'Invalid email format.'),
  address: z.string().trim().optional(),
  workingHours: z.string().trim().optional(),
  logoUrl: z.string().optional()
});

type GarageInformationFormValues = z.infer<typeof garageInformationSchema>;

const defaultValues: GarageInformationFormValues = {
  garageName: 'Garixo Auto Center',
  phone: '5553021188',
  email: 'owner@garixo.com',
  address: '812 Harbor Industrial Road, Austin, TX',
  workingHours: 'Mon - Sat: 8:00 AM - 6:00 PM',
  logoUrl: ''
};

function sanitizePhone(input: string): string {
  return input.replace(/\D/g, '').slice(0, 15);
}

async function saveGarageInformation(values: GarageInformationFormValues): Promise<void> {
  await new Promise((resolve) => setTimeout(resolve, 900));
  void values;
}

export function GarageInformationForm(): JSX.Element {
  const toast = useToast();
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [logoPreviewUrl, setLogoPreviewUrl] = useState<string>('');

  const form = useForm<GarageInformationFormValues>({
    resolver: zodResolver(garageInformationSchema),
    defaultValues,
    mode: 'onBlur'
  });

  const isDirty = form.formState.isDirty;

  useEffect(() => {
    const onBeforeUnload = (event: BeforeUnloadEvent) => {
      if (!isDirty) {
        return;
      }

      event.preventDefault();
      event.returnValue = '';
    };

    window.addEventListener('beforeunload', onBeforeUnload);
    return () => window.removeEventListener('beforeunload', onBeforeUnload);
  }, [isDirty]);

  useEffect(() => {
    return () => {
      if (logoPreviewUrl.startsWith('blob:')) {
        URL.revokeObjectURL(logoPreviewUrl);
      }
    };
  }, [logoPreviewUrl]);

  const onSelectLogo = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];

    if (!file) {
      return;
    }

    if (logoPreviewUrl.startsWith('blob:')) {
      URL.revokeObjectURL(logoPreviewUrl);
    }

    const previewUrl = URL.createObjectURL(file);
    setLogoPreviewUrl(previewUrl);
    form.setValue('logoUrl', previewUrl, { shouldDirty: true });
  };

  const onSubmit = form.handleSubmit(async (values) => {
    await saveGarageInformation(values);
    form.reset(values);
    toast.success('Garage information updated.');
  });

  return (
    <div className="mx-auto max-w-[820px] space-y-s4">
      <header className="space-y-s1">
        <div className="flex items-center gap-s2">
          <Building2 className="size-5 text-text-secondary" />
          <h2 className="text-h2">Garage Information</h2>
        </div>
        <p className="text-small text-text-muted">Update your business details shown across the system.</p>
      </header>

      <form className="space-y-s4 pb-24" onSubmit={onSubmit}>
        <Card className="p-s6">
          <div className="mb-s4">
            <h3 className="text-h3">Basic Info</h3>
          </div>

          <div className="space-y-s4">
            <div className="space-y-s1">
              <label htmlFor="garageName" className="text-small font-medium text-text-secondary">
                Garage Name
              </label>
              <Input
                id="garageName"
                className="h-11"
                {...form.register('garageName')}
                aria-invalid={Boolean(form.formState.errors.garageName)}
              />
              {form.formState.errors.garageName ? (
                <p className="text-caption text-state-error">{form.formState.errors.garageName.message}</p>
              ) : null}
            </div>

            <div className="space-y-s2">
              <p className="text-small font-medium text-text-secondary">Logo Upload</p>
              <div className="flex flex-col items-start gap-s3 sm:flex-row sm:items-center">
                <div className="grid size-[120px] place-items-center overflow-hidden rounded-md border border-border bg-surface-hover">
                  {logoPreviewUrl ? (
                    <Image src={logoPreviewUrl} alt="Garage logo preview" width={120} height={120} className="h-full w-full object-cover" />
                  ) : (
                    <div className="flex flex-col items-center gap-s1 text-text-muted">
                      <ImageIcon className="size-5" />
                      <span className="text-caption">No logo</span>
                    </div>
                  )}
                </div>

                <div>
                  <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={onSelectLogo} />
                  <Button type="button" variant="secondary" onClick={() => fileInputRef.current?.click()}>
                    <Upload className="size-4" />
                    Upload Logo
                  </Button>
                </div>
              </div>
            </div>

            <div className="space-y-s1">
              <label htmlFor="phone" className="text-small font-medium text-text-secondary">
                Phone
              </label>
              <Input
                id="phone"
                className="h-11"
                inputMode="numeric"
                {...form.register('phone', {
                  setValueAs: (value) => sanitizePhone(String(value ?? ''))
                })}
                aria-invalid={Boolean(form.formState.errors.phone)}
              />
              {form.formState.errors.phone ? (
                <p className="text-caption text-state-error">{form.formState.errors.phone.message}</p>
              ) : null}
            </div>

            <div className="space-y-s1">
              <label htmlFor="email" className="text-small font-medium text-text-secondary">
                Email
              </label>
              <Input
                id="email"
                className="h-11"
                type="email"
                {...form.register('email')}
                aria-invalid={Boolean(form.formState.errors.email)}
              />
              {form.formState.errors.email ? (
                <p className="text-caption text-state-error">{form.formState.errors.email.message}</p>
              ) : null}
            </div>

            <div className="space-y-s1">
              <label htmlFor="address" className="text-small font-medium text-text-secondary">
                Address
              </label>
              <Input id="address" className="h-11" {...form.register('address')} />
            </div>

            <div className="space-y-s1">
              <label htmlFor="workingHours" className="text-small font-medium text-text-secondary">
                Working Hours
              </label>
              <Input id="workingHours" className="h-11" {...form.register('workingHours')} />
            </div>
          </div>
        </Card>

        <div className="sticky bottom-0 z-20 border-t border-border bg-background-primary/95 backdrop-blur-sm">
          <div className="mx-auto flex max-w-[820px] items-center justify-between gap-s3 px-s4 py-s3">
            <div>{isDirty ? <Badge variant="warning">Unsaved changes</Badge> : null}</div>
            <Button type="submit" className="min-w-[160px]" disabled={!isDirty || form.formState.isSubmitting}>
              {form.formState.isSubmitting ? 'Saving...' : 'Save'}
            </Button>
          </div>
        </div>
      </form>
    </div>
  );
}
