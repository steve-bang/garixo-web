'use client';

import { useEffect, useState } from 'react';

import { Modal } from '@/components/ui/modal';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import type { Staff } from '@/features/staff/types';

type DeleteStaffModalProps = {
  open: boolean;
  staff: Staff | null;
  onClose: () => void;
  onConfirm: (id: string) => Promise<void>;
};

export function DeleteStaffModal({
  open,
  staff,
  onClose,
  onConfirm
}: DeleteStaffModalProps): JSX.Element | null {
  const [confirmText, setConfirmText] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!open) {
      return;
    }

    setConfirmText('');
    setError('');
  }, [open, staff?.id]);

  if (!staff) {
    return null;
  }

  const canConfirm = confirmText.trim() === staff.fullName;

  const handleConfirm = async () => {
    setError('');

    if (!canConfirm) {
      setError('Please type the staff name exactly to continue.');
      return;
    }

    setSubmitting(true);

    try {
      await onConfirm(staff.id);
      setConfirmText('');
    } catch (submitError) {
      setError(
        submitError instanceof Error
          ? submitError.message
          : 'Could not remove this staff member.'
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Remove Staff Member"
      width="md"
      footer={
        <>
          <Button variant="secondary" onClick={onClose} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button
            variant="destructive"
            onClick={handleConfirm}
            disabled={isSubmitting}
          >
            {isSubmitting ? 'Removing...' : 'Remove Staff'}
          </Button>
        </>
      }
    >
      <div className="space-y-s2">
        <p className="text-small text-text-muted">
          You are about to remove{' '}
          <span className="font-medium text-text-primary">
            {staff.fullName}
          </span>{' '}
          from your team list.
        </p>
        <p className="text-small text-text-muted">
          Type the staff name to confirm:
        </p>
        <Input
          className="h-11"
          value={confirmText}
          onChange={(event) => setConfirmText(event.target.value)}
        />
        {error ? (
          <p className="text-caption text-state-error">{error}</p>
        ) : null}
      </div>
    </Modal>
  );
}
