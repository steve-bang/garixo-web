import type { InventoryItem, StockStatus } from '@/features/inventory/types';

export function getStockStatus(item: InventoryItem): StockStatus {
  if (item.quantity === 0) {
    return 'OUT_OF_STOCK';
  }

  if (item.quantity <= item.minLevel) {
    return 'LOW_STOCK';
  }

  return 'IN_STOCK';
}

export function parseCurrencyInput(value: string): number {
  const normalized = value.replace(/[^\d.]/g, '');
  const parsed = Number(normalized);
  return Number.isFinite(parsed) ? parsed : 0;
}

export function toCurrencyInput(value: number): string {
  return value ? String(Math.round(value)) : '';
}
