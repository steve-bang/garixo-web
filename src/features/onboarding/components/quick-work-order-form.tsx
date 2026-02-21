'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { z } from 'zod';

import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { createFirstWorkOrder } from '@/features/onboarding/service';

const quickOrderSchema = z.object({
  customerName: z.string().trim().min(1, 'Customer name is required.'),
  licensePlate: z.string().trim().min(1, 'License plate is required.'),
  service: z.string().trim().optional(),
  notes: z.string().trim().optional()
});

type QuickOrderValues = z.infer<typeof quickOrderSchema>;

export function QuickWorkOrderForm(): JSX.Element {
  const router = useRouter();
  const toast = useToast();

  const form = useForm<QuickOrderValues>({
    resolver: zodResolver(quickOrderSchema),
    defaultValues: {
      customerName: '',
      licensePlate: '',
      service: '',
      notes: ''
    }
  });

  const onSubmit = form.handleSubmit(async (values) => {
    await createFirstWorkOrder({
      customerName: values.customerName,
      licensePlate: values.licensePlate,
      service: values.service,
      notes: values.notes
    });
    toast.success('Work order created successfully.');
    router.push('/dashboard');
  });

  return (
    <Card className="mx-auto w-full max-w-[640px] space-y-s6 p-s6">
      <div className="space-y-s1">
        <h1 className="text-h1">Create First Work Order</h1>
        <p className="text-small text-text-secondary">You can add more details later.</p>
      </div>

      <form className="space-y-s4" onSubmit={onSubmit}>
        <div className="space-y-s1">
          <label className="text-small font-medium text-text-secondary">Customer Name</label>
          <Input className="h-11" {...form.register('customerName')} />
          {form.formState.errors.customerName ? (
            <p className="text-caption text-state-error">{form.formState.errors.customerName.message}</p>
          ) : null}
        </div>

        <div className="space-y-s1">
          <label className="text-small font-medium text-text-secondary">License Plate</label>
          <Input className="h-11" {...form.register('licensePlate')} />
          {form.formState.errors.licensePlate ? (
            <p className="text-caption text-state-error">{form.formState.errors.licensePlate.message}</p>
          ) : null}
        </div>

        <div className="space-y-s1">
          <label className="text-small font-medium text-text-secondary">Service</label>
          <Input className="h-11" {...form.register('service')} />
        </div>

        <div className="space-y-s1">
          <label className="text-small font-medium text-text-secondary">Notes</label>
          <Textarea rows={3} {...form.register('notes')} />
        </div>

        <Button type="submit" className="h-12 w-full" disabled={form.formState.isSubmitting}>
          {form.formState.isSubmitting ? 'Creating...' : 'Create Work Order'}
        </Button>
      </form>
    </Card>
  );
}
