'use client';

import { useEffect, useState } from 'react';

import { Modal } from '@/components/ui/modal';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import type { Customer } from '@/features/customers/types';

type DeleteCustomerModalProps = {
  open: boolean;
  customer: Customer | null;
  onClose: () => void;
  onConfirm: (id: string) => Promise<void>;
};

export function DeleteCustomerModal({ open, customer, onClose, onConfirm }: DeleteCustomerModalProps): JSX.Element | null {
  const [confirmValue, setConfirmValue] = useState('');
  const [submitError, setSubmitError] = useState('');

  useEffect(() => {
    if (!open) {
      return;
    }

    setConfirmValue('');
    setSubmitError('');
  }, [open]);

  if (!customer) {
    return null;
  }

  const disabled = confirmValue.trim() !== customer.name;

  const handleConfirm = async () => {
    setSubmitError('');

    try {
      await onConfirm(customer.id);
    } catch (error) {
      setSubmitError(error instanceof Error ? error.message : 'Could not delete customer.');
    }
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Delete this customer?"
      width="md"
      footer={
        <>
          <Button variant="secondary" onClick={onClose}>
            Cancel
          </Button>
          <Button variant="destructive" disabled={disabled} onClick={handleConfirm}>
            Delete
          </Button>
        </>
      }
    >
      <p className="text-small text-text-muted">This action cannot be undone.</p>

      <div className="mt-s4 space-y-s1">
        <label className="text-small font-medium text-text-secondary">Type customer name to confirm</label>
        <Input className="h-11" value={confirmValue} onChange={(event) => setConfirmValue(event.target.value)} />
      </div>

      {submitError ? <p className="mt-s2 text-caption text-state-error">{submitError}</p> : null}
    </Modal>
  );
}
