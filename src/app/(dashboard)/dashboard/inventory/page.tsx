import type { Metadata } from 'next';
import { JSX } from 'react';

import { InventoryManagementPage } from '@/features/inventory/components/inventory-management-page';

export const metadata: Metadata = {
  title: 'Inventory | Garixo',
  description: 'Manage parts inventory, stock levels, and item adjustments.'
};

export default function InventoryPage(): JSX.Element {
  return <InventoryManagementPage />;
}
