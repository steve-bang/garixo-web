'use client';

import { Modal } from '@/components/ui/modal';
import { Button } from '@/components/ui/button';
import type { InventoryItem } from '@/features/inventory/types';

type DeleteItemModalProps = {
  open: boolean;
  item: InventoryItem | null;
  onClose: () => void;
  onConfirm: (id: string) => Promise<void>;
};

export function DeleteItemModal({ open, item, onClose, onConfirm }: DeleteItemModalProps): JSX.Element | null {
  if (!item) {
    return null;
  }

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Delete this item?"
      width="md"
      footer={
        <>
          <Button variant="secondary" onClick={onClose}>
            Cancel
          </Button>
          <Button variant="destructive" onClick={() => void onConfirm(item.id)}>
            Delete
          </Button>
        </>
      }
    >
      <p className="text-small text-text-muted">This action cannot be undone.</p>
    </Modal>
  );
}
