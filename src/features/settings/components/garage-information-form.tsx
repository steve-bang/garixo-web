'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { Building, Image as ImageIcon, Upload, X } from 'lucide-react';
import Image from 'next/image';
import { useEffect, useMemo, useRef, useState, type ChangeEvent, type DragEvent } from 'react';
import { useForm } from 'react-hook-form';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { garageInformationSchema, type GarageInformationFormValues } from '@/features/settings/garage-information.schema';
import { getGarageSettings, updateGarageSettings } from '@/features/settings/garage-information.service';
import type { GarageSettings } from '@/features/settings/garage-information.types';

function formatPhoneInput(input: string): string {
  const digits = input.replace(/\D/g, '').slice(0, 15);
  if (digits.length <= 3) return digits;
  if (digits.length <= 6) return `${digits.slice(0, 3)} ${digits.slice(3)}`;
  if (digits.length <= 10) return `${digits.slice(0, 3)} ${digits.slice(3, 6)} ${digits.slice(6)}`;
  return `${digits.slice(0, 3)} ${digits.slice(3, 6)} ${digits.slice(6, 10)} ${digits.slice(10)}`;
}

function toDefaults(settings: GarageSettings): GarageInformationFormValues {
  return {
    garageName: settings.garageName,
    phone: settings.phone ?? '',
    email: settings.email ?? '',
    address: settings.address ?? '',
    workingHours: settings.workingHours ?? '',
    logoUrl: settings.logoUrl ?? ''
  };
}

export function GarageInformationForm(): JSX.Element {
  const toast = useToast();
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const [isLoading, setLoading] = useState(true);
  const [isLoadError, setLoadError] = useState(false);
  const [savedSettings, setSavedSettings] = useState<GarageSettings | null>(null);
  const [logoPreviewUrl, setLogoPreviewUrl] = useState<string>('');
  const [selectedLogoFile, setSelectedLogoFile] = useState<File | null>(null);
  const [removeLogo, setRemoveLogo] = useState(false);
  const [isDragging, setDragging] = useState(false);

  const form = useForm<GarageInformationFormValues>({
    resolver: zodResolver(garageInformationSchema),
    defaultValues: {
      garageName: '',
      phone: '',
      email: '',
      address: '',
      workingHours: '',
      logoUrl: ''
    },
    mode: 'onChange'
  });

  const isDirty = form.formState.isDirty || selectedLogoFile !== null || removeLogo;

  const loadSettings = async () => {
    setLoadError(false);
    setLoading(true);
    try {
      const data = await getGarageSettings();
      setSavedSettings(data);
      form.reset(toDefaults(data));
      setLogoPreviewUrl(data.logoUrl ?? '');
      setSelectedLogoFile(null);
      setRemoveLogo(false);
    } catch {
      setLoadError(true);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadSettings();
  }, []);

  useEffect(() => {
    const onBeforeUnload = (event: BeforeUnloadEvent) => {
      if (!isDirty) return;
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

  const onPickFile = (file: File | null) => {
    if (!file) return;

    if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) {
      toast.error('Please upload PNG, JPG, or WEBP.');
      return;
    }

    if (file.size > 2 * 1024 * 1024) {
      toast.error('Logo must be 2MB or smaller.');
      return;
    }

    if (logoPreviewUrl.startsWith('blob:')) {
      URL.revokeObjectURL(logoPreviewUrl);
    }

    const previewUrl = URL.createObjectURL(file);
    setSelectedLogoFile(file);
    setRemoveLogo(false);
    setLogoPreviewUrl(previewUrl);
    form.setValue('logoUrl', previewUrl, { shouldDirty: true });
  };

  const onSelectLogo = (event: ChangeEvent<HTMLInputElement>) => {
    onPickFile(event.target.files?.[0] ?? null);
  };

  const onDropLogo = (event: DragEvent<HTMLButtonElement>) => {
    event.preventDefault();
    setDragging(false);
    onPickFile(event.dataTransfer.files?.[0] ?? null);
  };

  const removeSelectedLogo = () => {
    if (logoPreviewUrl.startsWith('blob:')) {
      URL.revokeObjectURL(logoPreviewUrl);
    }

    setSelectedLogoFile(null);
    setRemoveLogo(true);
    setLogoPreviewUrl('');
    form.setValue('logoUrl', '', { shouldDirty: true });
  };

  const onSubmit = form.handleSubmit(async (values) => {
    const previousLogoUrl = savedSettings?.logoUrl ?? '';

    try {
      const updated = await updateGarageSettings({
        garageName: values.garageName.trim(),
        phone: values.phone?.trim() ?? '',
        email: values.email?.trim().toLowerCase() ?? '',
        address: values.address?.trim() ?? '',
        workingHours: values.workingHours?.trim() ?? '',
        logoFile: selectedLogoFile,
        removeLogo
      });

      setSavedSettings(updated);
      form.reset(toDefaults(updated));
      setSelectedLogoFile(null);
      setRemoveLogo(false);
      setLogoPreviewUrl(updated.logoUrl ?? '');
      toast.success('Garage information updated successfully.');
    } catch (error) {
      if (selectedLogoFile || removeLogo) {
        setLogoPreviewUrl(previousLogoUrl);
      }
      toast.error(error instanceof Error ? error.message : 'Could not update garage information.');
    }
  });

  const emailError = form.formState.touchedFields.email ? form.formState.errors.email?.message : undefined;

  const saveDisabled = !isDirty || form.formState.isSubmitting;

  const logoLabel = useMemo(() => {
    if (logoPreviewUrl) return 'Change Logo';
    return 'Upload Logo';
  }, [logoPreviewUrl]);

  if (isLoading) {
    return (
      <div className="mx-auto max-w-[720px] space-y-s4">
        <div className="space-y-s2">
          <div className="h-6 w-44 animate-pulse rounded-md bg-surface-hover" />
          <div className="h-4 w-80 animate-pulse rounded-md bg-surface-hover" />
        </div>
        <Card className="space-y-s4 p-s6">
          <div className="h-8 w-full animate-pulse rounded-md bg-surface-hover" />
          <div className="h-8 w-full animate-pulse rounded-md bg-surface-hover" />
          <div className="h-8 w-full animate-pulse rounded-md bg-surface-hover" />
          <div className="h-8 w-full animate-pulse rounded-md bg-surface-hover" />
        </Card>
      </div>
    );
  }

  if (isLoadError) {
    return (
      <div className="mx-auto max-w-[720px]">
        <Card className="space-y-s3 p-s6">
          <p className="text-small text-state-error">Could not load garage information.</p>
          <Button type="button" onClick={() => void loadSettings()}>
            Try Again
          </Button>
        </Card>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-[720px] space-y-s4">
      <header className="space-y-s2 border-b border-border pb-s4">
        <div className="flex items-center gap-s2">
          <Building className="size-5 text-text-secondary" />
          <h2 className="text-h2">Garage Information</h2>
        </div>
        <p className="text-small text-text-muted">This information will appear on invoices and system records.</p>
      </header>

      <Card className="p-s6">
        <form className="space-y-s6" onSubmit={onSubmit}>
          <section className="grid gap-s4 lg:grid-cols-[140px_1fr]">
            <div className="space-y-s2">
              <p className="text-small font-medium text-text-secondary">Logo</p>
              <button
                type="button"
                className="group relative grid size-[120px] place-items-center overflow-hidden rounded-md border border-dashed border-border bg-surface-hover"
                onDragOver={(event) => {
                  event.preventDefault();
                  setDragging(true);
                }}
                onDragLeave={() => setDragging(false)}
                onDrop={onDropLogo}
                onClick={() => fileInputRef.current?.click()}
              >
                {logoPreviewUrl ? (
                  <>
                    <Image src={logoPreviewUrl} alt="Garage logo preview" width={120} height={120} className="h-full w-full object-cover" />
                    <span className="absolute inset-0 hidden place-items-center bg-black/40 text-caption font-medium text-white group-hover:grid">
                      Change Logo
                    </span>
                  </>
                ) : (
                  <div className="flex flex-col items-center gap-s1 text-text-muted">
                    <ImageIcon className="size-5" />
                    <span className="text-caption">No logo</span>
                  </div>
                )}

                {isDragging ? <span className="absolute inset-0 border-2 border-dashed border-primary-600" /> : null}
              </button>

              <input
                ref={fileInputRef}
                type="file"
                accept="image/jpeg,image/png,image/webp"
                className="hidden"
                onChange={onSelectLogo}
              />

              <Button type="button" variant="secondary" size="sm" onClick={() => fileInputRef.current?.click()} className='text-xs'>
                <Upload className="size-4" />
                {logoLabel}
              </Button>

              {logoPreviewUrl ? (
                <Button type="button" variant="ghost" size="sm" onClick={removeSelectedLogo}>
                  <X className="size-4" />
                  Remove
                </Button>
              ) : null}

              <p className="text-caption text-text-muted">Max 2MB, PNG/JPG.</p>
            </div>

            <div className="space-y-s1">
              <label htmlFor="garageName" className="text-small font-medium text-text-secondary">
                Garage Name
              </label>
              <Input
                id="garageName"
                className="h-12 text-[15px]"
                placeholder="Garage Auto Pro"
                {...form.register('garageName')}
                aria-invalid={Boolean(form.formState.errors.garageName)}
              />
              {form.formState.errors.garageName ? (
                <p className="text-caption text-state-error">{form.formState.errors.garageName.message}</p>
              ) : null}
            </div>
          </section>

          <section className="space-y-s4">
            <h3 className="text-small font-semibold text-text-primary">Contact Information</h3>

            <div className="space-y-s1">
              <label htmlFor="address" className="text-small font-medium text-text-secondary">
                Address
              </label>
              <Textarea id="address" rows={2} placeholder="Garage address" {...form.register('address')} />
            </div>

            <div className="space-y-s1">
              <label htmlFor="phone" className="text-small font-medium text-text-secondary">
                Phone
              </label>
              <Input
                id="phone"
                className="h-11"
                inputMode="tel"
                placeholder="0901234567"
                value={form.watch('phone') ?? ''}
                onChange={(event) => form.setValue('phone', formatPhoneInput(event.target.value), { shouldDirty: true, shouldTouch: true })}
              />
            </div>

            <div className="space-y-s1">
              <label htmlFor="email" className="text-small font-medium text-text-secondary">
                Email
              </label>
              <Input id="email" className="h-11" type="email" placeholder="owner@garage.com" {...form.register('email')} />
              {emailError ? (
                <p className="text-caption text-state-error">{emailError}</p>
              ) : (
                <p className="text-caption text-text-muted">Use a valid email for invoices and notifications.</p>
              )}
            </div>
          </section>

          <section className="space-y-s4">
            <h3 className="text-small font-semibold text-text-primary">Working Hours</h3>
            <div className="space-y-s1">
              <label htmlFor="workingHours" className="text-small font-medium text-text-secondary">
                Working Hours
              </label>
              <Input id="workingHours" className="h-11" placeholder="Mon - Sat: 8:00 AM - 6:00 PM" {...form.register('workingHours')} />
            </div>
          </section>

          <div className="space-y-s2 border-t border-border pt-s4">
            {isDirty ? <Badge variant="warning">Unsaved changes</Badge> : null}
            <Button type="submit" className="h-11 w-full" disabled={saveDisabled}>
              {form.formState.isSubmitting ? 'Saving...' : 'Save Changes'}
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
}
