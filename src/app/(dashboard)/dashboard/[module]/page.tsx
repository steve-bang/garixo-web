import { notFound } from 'next/navigation';
import { JSX } from 'react';

import { Card } from '@/components/ui/card';

const moduleTitleMap: Record<string, string> = {
  'work-orders': 'Work Orders',
  invoices: 'Invoices',
  customers: 'Customers',
  vehicles: 'Vehicles',
  services: 'Services',
  inventory: 'Inventory',
  staff: 'Staff',
  settings: 'Settings'
};

type ModulePageProps = {
  params: Promise<{ module: string }>;
};

export default async function ModulePage({
  params
}: ModulePageProps): Promise<JSX.Element> {
  const { module } = await params;
  const title = moduleTitleMap[module];

  if (!title) {
    notFound();
  }

  return (
    <div className="space-y-s4">
      <h1 className="text-h1">{title}</h1>
      <Card className="p-s4">
        <p className="text-body text-text-secondary">
          This module is ready for feature implementation using the same
          dashboard layout system, spacing rhythm, and table standards.
        </p>
      </Card>
    </div>
  );
}
