export {
  createCustomer,
  deleteCustomer,
  getCustomerById,
  getCustomers,
  updateCustomer
} from '@/features/customers/service';

export const customersQueryKey = ['customers'] as const;
