'use client';

import { useState } from 'react';

import { Modal } from '@/components/ui/modal';
import { Button } from '@/components/ui/button';
import { Select } from '@/components/ui/select';
import type { PaymentMethod, WorkOrder } from '@/features/work-orders/types';
import { formatCurrencyUsd } from '@/lib/utils/format';

type Props = {
  open: boolean;
  order: WorkOrder | null;
  onClose: () => void;
  onConfirm: (id: string, method: PaymentMethod) => Promise<void>;
};

export function PaymentModal({
  open,
  order,
  onClose,
  onConfirm
}: Props): JSX.Element | null {
  const [method, setMethod] = useState<PaymentMethod>('CASH');
  const [error, setError] = useState('');

  if (!order) return null;

  const servicesTotal = order.services.reduce(
    (sum, item) => sum + item.price,
    0
  );
  const partsTotal = order.parts.reduce(
    (sum, item) => sum + item.quantity * item.unitPrice,
    0
  );

  const submit = async () => {
    setError('');

    try {
      await onConfirm(order.id, method);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Could not process payment.');
    }
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Confirm Payment"
      width="md"
      footer={
        <>
          <Button variant="secondary" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={submit}>Confirm Payment</Button>
        </>
      }
    >
      <p className="text-small text-text-muted">
        {order.orderCode} - {order.plateNumber}
      </p>

      <div className="mt-s4 space-y-s2 text-small">
        <div className="flex justify-between">
          <span>Services total</span>
          <span>{formatCurrencyUsd(servicesTotal)}</span>
        </div>
        <div className="flex justify-between">
          <span>Parts total</span>
          <span>{formatCurrencyUsd(partsTotal)}</span>
        </div>
        <div className="flex justify-between font-semibold">
          <span>Grand total</span>
          <span>{formatCurrencyUsd(order.totalAmount)}</span>
        </div>
      </div>

      <div className="mt-s4 space-y-s1">
        <label className="text-small font-medium text-text-secondary">
          Payment Method
        </label>
        <Select
          className="h-11 w-full rounded-md border border-input-border bg-input px-s3 text-small"
          value={method}
          onChange={(e) => setMethod(e.target.value as PaymentMethod)}
        >
          <option value="CASH">Cash</option>
          <option value="BANK_TRANSFER">Bank Transfer</option>
          <option value="QR">QR</option>
        </Select>
      </div>

      {error ? (
        <p className="mt-s2 text-caption text-state-error">{error}</p>
      ) : null}
    </Modal>
  );
}
