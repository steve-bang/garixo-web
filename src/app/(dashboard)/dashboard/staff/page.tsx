import type { Metadata } from 'next';
import { JSX } from 'react';

import { StaffManagementPage } from '@/features/staff/components/staff-management-page';

export const metadata: Metadata = {
  title: 'Staff | Garixo',
  description: 'Manage staff roles, workload, and team performance.'
};

export default function StaffPage(): JSX.Element {
  return <StaffManagementPage />;
}
