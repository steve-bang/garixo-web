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

export function formatCurrencyVnd(value: number): string {
  return `${new Intl.NumberFormat('vi-VN').format(value)} đ`;
}

export function formatDate(value?: string | null): string {
  if (!value) {
    return '-';
  }

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return '-';
  }

  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: '2-digit',
    year: 'numeric'
  }).format(date);
}

export function calculateAverageTicket(customer: Customer): number {
  if (customer.totalVisits <= 0) {
    return 0;
  }

  return Math.round(customer.totalSpent / customer.totalVisits);
}
