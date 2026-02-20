'use client';

import { useEffect, useState } from 'react';

import { Modal } from '@/components/ui/modal';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import type { InventoryItem } from '@/features/inventory/types';

type AdjustStockModalProps = {
  open: boolean;
  item: InventoryItem | null;
  onClose: () => void;
  onConfirm: (payload: { id: string; type: 'ADD' | 'REDUCE'; amount: number; reason?: string }) => Promise<void>;
};

export function AdjustStockModal({ open, item, onClose, onConfirm }: AdjustStockModalProps): JSX.Element | null {
  const [type, setType] = useState<'ADD' | 'REDUCE'>('ADD');
  const [amountInput, setAmountInput] = useState('');
  const [reason, setReason] = useState('');
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!open) {
      return;
    }

    setType('ADD');
    setAmountInput('');
    setReason('');
    setError('');
    setSaving(false);
  }, [open, item?.id]);

  if (!item) {
    return null;
  }

  const amount = Number(amountInput);

  const handleConfirm = async () => {
    setError('');

    if (!Number.isFinite(amount) || amount <= 0) {
      setError('Amount must be greater than 0.');
      return;
    }

    if (type === 'REDUCE' && amount > item.quantity) {
      setError('Not enough quantity in stock.');
      return;
    }

    setSaving(true);

    try {
      await onConfirm({ id: item.id, type, amount, reason: reason || undefined });
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : 'Could not adjust quantity.');
      setSaving(false);
      return;
    }

    setSaving(false);
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Adjust Quantity"
      width="md"
      footer={
        <>
          <Button variant="secondary" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handleConfirm} disabled={saving}>
            {saving ? 'Updating...' : 'Confirm'}
          </Button>
        </>
      }
    >
      <div className="space-y-s3">
        <p className="text-small text-text-muted">Current Quantity: {item.quantity}</p>

        <div className="flex gap-s2">
          <Button variant={type === 'ADD' ? 'default' : 'secondary'} onClick={() => setType('ADD')}>
            Add
          </Button>
          <Button variant={type === 'REDUCE' ? 'default' : 'secondary'} onClick={() => setType('REDUCE')}>
            Reduce
          </Button>
        </div>

        <div className="space-y-s1">
          <label className="text-small font-medium text-text-secondary">Amount</label>
          <Input className="h-11" inputMode="numeric" value={amountInput} onChange={(event) => setAmountInput(event.target.value)} />
        </div>

        <div className="space-y-s1">
          <label className="text-small font-medium text-text-secondary">Reason (optional)</label>
          <Input className="h-11" value={reason} onChange={(event) => setReason(event.target.value)} />
        </div>

        {error ? <p className="text-caption text-state-error">{error}</p> : null}
      </div>
    </Modal>
  );
}
