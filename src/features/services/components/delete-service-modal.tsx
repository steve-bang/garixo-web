'use client';

import { Modal } from '@/components/ui/modal';
import { Button } from '@/components/ui/button';
import type { Service } from '@/features/services/types';

type DeleteServiceModalProps = {
  open: boolean;
  service: Service | null;
  onClose: () => void;
  onConfirm: (id: string) => Promise<void>;
};

export function DeleteServiceModal({ open, service, onClose, onConfirm }: DeleteServiceModalProps): JSX.Element | null {
  if (!service) {
    return null;
  }

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Delete Service?"
      width="md"
      footer={
        <>
          <Button variant="secondary" onClick={onClose}>
            Cancel
          </Button>
          <Button variant="destructive" onClick={() => void onConfirm(service.id)}>
            Delete
          </Button>
        </>
      }
    >
      <p className="text-small text-text-muted">This action cannot be undone.</p>
    </Modal>
  );
}
