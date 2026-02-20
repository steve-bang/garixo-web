'use client';

import { useMemo, useState } from 'react';

import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import type { CreateWorkOrderInput } from '@/features/work-orders/schema';
import type { OrderService, PriorityLevel, Worker } from '@/features/work-orders/types';
import { formatCurrencyVnd } from '@/features/work-orders/utils';

type CreateOrderFormProps = {
  workers: Worker[];
  onSubmit: (payload: CreateWorkOrderInput) => Promise<void>;
  onCancel: () => void;
};

const serviceCatalog: OrderService[] = [
  { id: 'svc-1', name: 'Oil Change', price: 800000 },
  { id: 'svc-2', name: 'Brake Service', price: 1400000 },
  { id: 'svc-3', name: 'Engine Diagnostic', price: 1100000 },
  { id: 'svc-4', name: 'Battery Replacement', price: 2200000 },
  { id: 'svc-5', name: 'AC Service', price: 900000 }
];

export function CreateOrderForm({ workers, onSubmit, onCancel }: CreateOrderFormProps): JSX.Element {
  const [step, setStep] = useState(1);
  const [plateNumber, setPlateNumber] = useState('');
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [services, setServices] = useState<OrderService[]>([]);
  const [workerId, setWorkerId] = useState('');
  const [priority, setPriority] = useState<PriorityLevel>('NORMAL');
  const [estimatedTimeMinutes, setEstimatedTimeMinutes] = useState('120');
  const [notes, setNotes] = useState('');
  const [submitError, setSubmitError] = useState('');
  const [isSubmitting, setSubmitting] = useState(false);

  const total = useMemo(() => services.reduce((sum, item) => sum + item.price, 0), [services]);
  const canStep1 = plateNumber.trim() && customerName.trim() && customerPhone.trim();
  const canStep2 = services.length > 0;

  const reset = () => {
    setStep(1);
    setPlateNumber('');
    setCustomerName('');
    setCustomerPhone('');
    setServices([]);
    setWorkerId('');
    setPriority('NORMAL');
    setEstimatedTimeMinutes('120');
    setNotes('');
    setSubmitError('');
  };

  const handleCreate = async () => {
    setSubmitError('');
    setSubmitting(true);

    try {
      const worker = workers.find((item) => item.id === workerId);

      await onSubmit({
        plateNumber,
        customerName,
        customerPhone,
        services,
        parts: [],
        workerId: worker?.id,
        workerName: worker?.name,
        priority,
        estimatedTimeMinutes: Number(estimatedTimeMinutes) || undefined,
        notes
      });

      reset();
    } catch (error) {
      setSubmitError(error instanceof Error ? error.message : 'Could not create order.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-s4">
      <p className="text-small text-text-muted">Step {step} of 3</p>

      {step === 1 ? (
        <Card className="space-y-s3 p-s4">
          <h4 className="text-small font-semibold">Vehicle & Customer</h4>
          <div className="space-y-s1">
            <label className="text-small font-medium text-text-secondary">Plate Number</label>
            <Input className="h-11" value={plateNumber} onChange={(e) => setPlateNumber(e.target.value.toUpperCase())} />
          </div>
          <div className="space-y-s1">
            <label className="text-small font-medium text-text-secondary">Customer Name</label>
            <Input className="h-11" value={customerName} onChange={(e) => setCustomerName(e.target.value)} />
          </div>
          <div className="space-y-s1">
            <label className="text-small font-medium text-text-secondary">Customer Phone</label>
            <Input className="h-11" value={customerPhone} onChange={(e) => setCustomerPhone(e.target.value)} />
          </div>
        </Card>
      ) : null}

      {step === 2 ? (
        <Card className="space-y-s3 p-s4">
          <h4 className="text-small font-semibold">Add Services</h4>
          <div className="space-y-s2">
            {serviceCatalog.map((service) => {
              const exists = services.some((x) => x.id === service.id);
              return (
                <button
                  key={service.id}
                  type="button"
                  className="flex w-full items-center justify-between rounded-md border border-border px-s3 py-s2 text-left hover:bg-surface-hover"
                  onClick={() => {
                    if (exists) {
                      setServices((prev) => prev.filter((x) => x.id !== service.id));
                    } else {
                      setServices((prev) => [...prev, service]);
                    }
                  }}
                >
                  <span className="text-small">{service.name}</span>
                  <span className="text-small text-text-secondary">{formatCurrencyVnd(service.price)}</span>
                </button>
              );
            })}
          </div>
          <p className="text-small font-medium">Total: {formatCurrencyVnd(total)}</p>
        </Card>
      ) : null}

      {step === 3 ? (
        <Card className="space-y-s3 p-s4">
          <h4 className="text-small font-semibold">Assign & Confirm</h4>

          <div className="space-y-s1">
            <label className="text-small font-medium text-text-secondary">Assign Worker</label>
            <select
              className="h-11 w-full rounded-md border border-input-border bg-input px-s3 text-small"
              value={workerId}
              onChange={(e) => setWorkerId(e.target.value)}
            >
              <option value="">Unassigned</option>
              {workers.map((worker) => (
                <option key={worker.id} value={worker.id}>
                  {worker.name} ({worker.activeJobs})
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-s1">
            <label className="text-small font-medium text-text-secondary">Priority</label>
            <select
              className="h-11 w-full rounded-md border border-input-border bg-input px-s3 text-small"
              value={priority}
              onChange={(e) => setPriority(e.target.value as PriorityLevel)}
            >
              <option value="NORMAL">Normal</option>
              <option value="HIGH">High</option>
              <option value="URGENT">Urgent</option>
            </select>
          </div>

          <div className="space-y-s1">
            <label className="text-small font-medium text-text-secondary">Estimated Time (minutes)</label>
            <Input className="h-11" value={estimatedTimeMinutes} onChange={(e) => setEstimatedTimeMinutes(e.target.value)} />
          </div>

          <div className="space-y-s1">
            <label className="text-small font-medium text-text-secondary">Notes</label>
            <textarea
              className="min-h-[92px] w-full rounded-md border border-input-border bg-input px-s3 py-s2 text-small"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
            />
          </div>

          <p className="text-small font-medium">Order Total: {formatCurrencyVnd(total)}</p>
        </Card>
      ) : null}

      {submitError ? <p className="text-caption text-state-error">{submitError}</p> : null}

      <div className="flex items-center justify-between gap-s2">
        <Button variant="secondary" onClick={step === 1 ? onCancel : () => setStep((prev) => Math.max(prev - 1, 1))} disabled={isSubmitting}>
          {step === 1 ? 'Cancel' : 'Back'}
        </Button>

        {step < 3 ? (
          <Button
            disabled={isSubmitting || (step === 1 && !canStep1) || (step === 2 && !canStep2)}
            onClick={() => setStep((prev) => Math.min(prev + 1, 3))}
          >
            Next
          </Button>
        ) : (
          <Button onClick={handleCreate} disabled={isSubmitting}>
            {isSubmitting ? 'Creating...' : 'Create'}
          </Button>
        )}
      </div>
    </div>
  );
}
