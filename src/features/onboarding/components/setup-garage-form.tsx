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
  initialPhone: string;
};

function SetupSuccess(): JSX.Element {
  return (
    <Card className="w-full max-w-[520px] p-s8 text-center animate-modal-fade-in">
      <div className="mx-auto mb-s3 grid size-12 place-items-center rounded-full bg-success-100 text-success-700">
        <CheckCircle2 className="size-6" />
      </div>
      <h2 className="text-h2">Your garage is ready</h2>
    </Card>
  );
}

export function SetupGarageForm({ initialPhone }: SetupGarageFormProps): JSX.Element {
  const router = useRouter();
  const [success, setSuccess] = useState(false);

  const form = useForm<SetupFormValues>({
    resolver: zodResolver(setupSchema),
    defaultValues: {
      garageName: '',
      address: '',
      phone: initialPhone
    }
  });

  const onSubmit = form.handleSubmit(async (values) => {
    await submitGarageSetup(values);
    setSuccess(true);
    window.setTimeout(() => {
      router.push('/dashboard');
    }, 1100);
  });

  if (success) {
    return <SetupSuccess />;
  }

  return (
    <Card className="w-full max-w-[520px] space-y-s6 p-s8">
      <div className="space-y-s2">
        <h1 className="text-h1">Setup Your Garage</h1>
        <p className="text-small text-text-secondary">A few quick details to start working.</p>
      </div>

      <form className="space-y-s4" onSubmit={onSubmit}>
        <div className="space-y-s1">
          <label className="text-small font-medium text-text-secondary">Garage Name</label>
          <Input className="h-11" placeholder="Garage Auto Pro" {...form.register('garageName')} />
          {form.formState.errors.garageName ? (
            <p className="text-caption text-state-error">{form.formState.errors.garageName.message}</p>
          ) : null}
        </div>

        <div className="space-y-s1">
          <label className="text-small font-medium text-text-secondary">Address</label>
          <Input className="h-11" placeholder="Optional" {...form.register('address')} />
        </div>

        <div className="space-y-s1">
          <label className="text-small font-medium text-text-secondary">Phone</label>
          <Input className="h-11" {...form.register('phone')} />
        </div>

        <Button type="submit" className="h-12 w-full" disabled={form.formState.isSubmitting}>
          {form.formState.isSubmitting ? 'Starting...' : 'Start Working'}
        </Button>
      </form>
    </Card>
  );
}
