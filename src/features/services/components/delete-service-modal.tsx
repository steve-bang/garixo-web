'use client';

import { useState } from 'react';

import { Modal } from '@/components/ui/modal';
import { Button } from '@/components/ui/button';
import type { Service } from '@/features/services/types';

type DeleteServiceModalProps = {
  open: boolean;
  service: Service | null;
  onClose: () => void;
  onConfirm: (id: string) => Promise<void>;
};

export function DeleteServiceModal({
  open,
  service,
  onClose,
  onConfirm
}: DeleteServiceModalProps): JSX.Element | null {
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!service) {
    return null;
  }

  const handleConfirm = async (): Promise<void> => {
    if (isSubmitting) {
      return;
    }

    setIsSubmitting(true);
    try {
      await onConfirm(service.id);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal
      open={open}
      onClose={isSubmitting ? () => undefined : onClose}
      title="Delete Service?"
      width="md"
      footer={
        <>
          <Button variant="secondary" onClick={onClose} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button
            variant="destructive"
            onClick={() => void handleConfirm()}
            disabled={isSubmitting}
          >
            {isSubmitting ? 'Deleting...' : 'Delete'}
          </Button>
        </>
      }
    >
      <p className="text-small text-text-muted">
        This action cannot be undone.
      </p>
    </Modal>
  );
}
