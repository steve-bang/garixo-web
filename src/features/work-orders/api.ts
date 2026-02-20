export {
  cancelWorkOrder,
  createWorkOrder,
  getWorkOrderById,
  getWorkOrders,
  payWorkOrder,
  updateWorkOrder,
  updateWorkOrderStatus
} from '@/features/work-orders/service';

export const workOrdersQueryKey = ['work-orders'] as const;
