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

export function DeleteStaffModal({ open, staff, onClose, onConfirm }: DeleteStaffModalProps): JSX.Element | null {
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
      setError('Please type the exact staff name to confirm.');
      return;
    }

    setSubmitting(true);

    try {
      await onConfirm(staff.id);
      setConfirmText('');
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : 'Could not delete staff.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Confirm Delete"
      width="md"
      footer={
        <>
          <Button variant="secondary" onClick={onClose}>
            Cancel
          </Button>
          <Button variant="destructive" onClick={handleConfirm} disabled={isSubmitting}>
            {isSubmitting ? 'Deleting...' : 'Confirm Delete'}
          </Button>
        </>
      }
    >
      <div className="space-y-s2">
        <p className="text-small text-text-muted">
          Type <span className="font-medium text-text-primary">{staff.fullName}</span> to set this profile as INACTIVE.
        </p>
        <Input className="h-11" value={confirmText} onChange={(event) => setConfirmText(event.target.value)} />
        {error ? <p className="text-caption text-state-error">{error}</p> : null}
      </div>
    </Modal>
  );
}
