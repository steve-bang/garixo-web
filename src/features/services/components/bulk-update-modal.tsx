'use client';

import { JSX, useMemo, useState } from 'react';

import { Modal } from '@/components/ui/modal';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import type { Service } from '@/features/services/types';
import { formatCurrency } from '@/features/services/utils';

type BulkUpdateModalProps = {
  open: boolean;
  services: Service[];
  onClose: () => void;
  onConfirm: (percentage: number) => Promise<void>;
};

export function BulkUpdateModal({ open, services, onClose, onConfirm }: BulkUpdateModalProps): JSX.Element | null {
  const [mode, setMode] = useState<'5' | '10' | 'custom'>('5');
  const [customValue, setCustomValue] = useState('');

  const percentage = mode === 'custom' ? Number(customValue || 0) : Number(mode);
  const activeServices = services.filter((item) => item.status === 'ACTIVE').slice(0, 3);

  const preview = useMemo(
    () =>
      activeServices.map((service) => ({
        ...service,
        nextPrice: Math.round(service.price * (1 + percentage / 100))
      })),
    [activeServices, percentage]
  );

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Bulk Update Price"
      width="lg"
      footer={
        <>
          <Button variant="secondary" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={() => void onConfirm(percentage)}>Confirm</Button>
        </>
      }
    >
      <div className="flex flex-wrap gap-s2">
        <Button variant={mode === '5' ? 'default' : 'secondary'} onClick={() => setMode('5')}>
          +5%
        </Button>
        <Button variant={mode === '10' ? 'default' : 'secondary'} onClick={() => setMode('10')}>
          +10%
        </Button>
        <Button variant={mode === 'custom' ? 'default' : 'secondary'} onClick={() => setMode('custom')}>
          Custom %
        </Button>
        {mode === 'custom' ? (
          <Input className="h-10 w-[140px]" inputMode="decimal" value={customValue} onChange={(event) => setCustomValue(event.target.value)} />
        ) : null}
      </div>

      <div className="mt-s4 space-y-s2">
        <p className="text-small font-medium text-text-secondary">Preview (3 services)</p>
        {preview.map((item) => (
          <div key={item.id} className="flex items-center justify-between rounded-md border border-border bg-surface-hover px-s3 py-s2 text-small">
            <span>{item.name}</span>
            <span className="tabular-nums text-text-secondary">
              {formatCurrency(item.price)} {'>'} {formatCurrency(item.nextPrice)}
            </span>
          </div>
        ))}
      </div>
    </Modal>
  );
}
