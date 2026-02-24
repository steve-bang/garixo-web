import type { Customer, SpendingTier } from '@/features/customers/types';

export function getSpendingTier(totalSpent: number): SpendingTier {
  if (totalSpent < 5_000_000) {
    return 'LOW';
  }

  if (totalSpent < 20_000_000) {
    return 'MEDIUM';
  }

  return 'HIGH';
}

export function calculateAverageTicket(customer: Customer): number {
  if (customer.totalVisits <= 0) {
    return 0;
  }

  return Math.round(customer.totalSpent / customer.totalVisits);
}
