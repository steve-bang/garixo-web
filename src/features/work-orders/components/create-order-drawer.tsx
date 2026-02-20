'use client';

import { Drawer } from '@/components/ui/drawer';
import { CreateOrderForm } from '@/features/work-orders/components/create-order-form';
import type { CreateWorkOrderInput } from '@/features/work-orders/schema';
import type { Worker } from '@/features/work-orders/types';

type Props = {
  open: boolean;
  workers: Worker[];
  onClose: () => void;
  onSubmit: (payload: CreateWorkOrderInput) => Promise<void>;
};

export function CreateOrderDrawer({ open, workers, onClose, onSubmit }: Props): JSX.Element | null {
  return (
    <Drawer
      open={open}
      onClose={onClose}
      title="Create Work Order"
      description="Create and assign a new workshop job."
      width="lg"
    >
      <CreateOrderForm workers={workers} onSubmit={onSubmit} onCancel={onClose} />
    </Drawer>
  );
}
