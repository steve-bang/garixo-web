'use client';

import { useState } from 'react';

import { Modal } from '@/components/ui/modal';
import { Button } from '@/components/ui/button';
import type { WorkOrder } from '@/features/work-orders/types';

type Props = {
  open: boolean;
  order: WorkOrder | null;
  onClose: () => void;
  onConfirm: (id: string, reason: string) => Promise<void>;
};

export function CancelOrderModal({ open, order, onClose, onConfirm }: Props): JSX.Element | null {
  const [reason, setReason] = useState('');
  const [error, setError] = useState('');

  if (!order) return null;

  const submit = async () => {
    setError('');
    if (!reason.trim()) {
      setError('Cancellation reason is required.');
      return;
    }

    try {
      await onConfirm(order.id, reason);
      setReason('');
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Could not cancel order.');
    }
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Cancel this order?"
      width="md"
      footer={
        <>
          <Button variant="secondary" onClick={onClose}>
            Cancel
          </Button>
          <Button variant="destructive" onClick={submit}>
            Confirm Cancel
          </Button>
        </>
      }
    >
      <p className="text-small text-text-muted">
        {order.orderCode} - {order.plateNumber}
      </p>

      <div className="mt-s4 space-y-s1">
        <label className="text-small font-medium text-text-secondary">Reason</label>
        <textarea
          className="min-h-[96px] w-full rounded-md border border-input-border bg-input px-s3 py-s2 text-small"
          value={reason}
          onChange={(e) => setReason(e.target.value)}
        />
      </div>

      {error ? <p className="mt-s2 text-caption text-state-error">{error}</p> : null}
    </Modal>
  );
}
