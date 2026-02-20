'use client';

import { useState } from 'react';

import { Modal } from '@/components/ui/modal';
import { Button } from '@/components/ui/button';
import type { Vehicle } from '@/features/vehicles/types';

type DeleteVehicleModalProps = {
  open: boolean;
  vehicle: Vehicle | null;
  onClose: () => void;
  onConfirm: (id: string) => Promise<void>;
};

export function DeleteVehicleModal({ open, vehicle, onClose, onConfirm }: DeleteVehicleModalProps): JSX.Element | null {
  const [submitError, setSubmitError] = useState('');

  if (!vehicle) {
    return null;
  }

  const handleConfirm = async () => {
    setSubmitError('');

    try {
      await onConfirm(vehicle.id);
    } catch (error) {
      setSubmitError(error instanceof Error ? error.message : 'Could not delete vehicle.');
    }
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Delete vehicle?"
      width="md"
      footer={
        <>
          <Button variant="secondary" onClick={onClose}>
            Cancel
          </Button>
          <Button variant="destructive" onClick={handleConfirm}>
            Delete
          </Button>
        </>
      }
    >
      <p className="text-small text-text-muted">This action cannot be undone.</p>

      {submitError ? <p className="mt-s2 text-caption text-state-error">{submitError}</p> : null}
    </Modal>
  );
}
