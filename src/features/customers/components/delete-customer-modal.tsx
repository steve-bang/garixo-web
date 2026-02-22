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

export function DeleteCustomerModal({
  open,
  customer,
  onClose,
  onConfirm
}: DeleteCustomerModalProps): JSX.Element | null {
  const [confirmValue, setConfirmValue] = useState('');
  const [submitError, setSubmitError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (!open) {
      return;
    }

    setConfirmValue('');
    setSubmitError('');
    setIsSubmitting(false);
  }, [open]);

  if (!customer) {
    return null;
  }

  const disabled = confirmValue.trim() !== customer.name;

  const handleConfirm = async () => {
    if (isSubmitting) {
      return;
    }

    setSubmitError('');
    setIsSubmitting(true);

    try {
      await onConfirm(customer.id);
    } catch (error) {
      setSubmitError(
        error instanceof Error
          ? error.message
          : 'Could not remove this customer.'
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const vehicleCount = customer.vehicles.length;
  const vehicleLabel = `${vehicleCount} vehicle${vehicleCount === 1 ? '' : 's'}`;

  return (
    <Modal
      open={open}
      onClose={isSubmitting ? () => undefined : onClose}
      title="Remove Customer?"
      width="md"
      footer={
        <>
          <Button variant="secondary" onClick={onClose} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button
            variant="destructive"
            disabled={disabled || isSubmitting}
            onClick={handleConfirm}
          >
            {isSubmitting ? 'Removing...' : 'Remove Customer'}
          </Button>
        </>
      }
    >
      <div className="space-y-s2">
        <p className="text-small text-text-muted">
          You are about to remove{' '}
          <span className="font-medium text-text-primary">{customer.name}</span>
          .
        </p>
        <p className="text-small text-text-muted">
          This customer currently has{' '}
          <span className="font-medium text-text-primary">{vehicleLabel}</span>.
        </p>
        <p className="text-small text-text-muted">
          This action cannot be undone.
        </p>
      </div>

      <div className="mt-s4 space-y-s1">
        <label className="text-small font-medium text-text-secondary">
          Type customer name to confirm
        </label>
        <Input
          className="h-11"
          value={confirmValue}
          onChange={(event) => setConfirmValue(event.target.value)}
          disabled={isSubmitting}
        />
      </div>

      {submitError ? (
        <p className="mt-s2 text-caption text-state-error">{submitError}</p>
      ) : null}
    </Modal>
  );
}
