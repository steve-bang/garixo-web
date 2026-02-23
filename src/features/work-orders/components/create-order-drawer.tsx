'use client';

import { Drawer } from '@/components/ui/drawer';
import { CreateOrderForm } from '@/features/work-orders/components/create-order-form';
import type { CreateWorkOrderInput } from '@/features/work-orders/schema';
import type { OrderService, Worker } from '@/features/work-orders/types';

type Props = {
  open: boolean;
  workers: Worker[];
  availableServices: OrderService[];
  onClose: () => void;
  onSubmit: (payload: CreateWorkOrderInput) => Promise<void>;
};

export function CreateOrderDrawer({
  open,
  workers,
  availableServices,
  onClose,
  onSubmit
}: Props): JSX.Element | null {
  return (
    <Drawer
      open={open}
      onClose={onClose}
      title="Create Work Order"
      description="Create and assign a new workshop job."
      width="lg"
    >
      <CreateOrderForm
        workers={workers}
        availableServices={availableServices}
        onSubmit={onSubmit}
        onCancel={onClose}
      />
    </Drawer>
  );
}
