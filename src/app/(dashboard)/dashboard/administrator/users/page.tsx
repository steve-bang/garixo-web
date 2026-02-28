import type { Metadata } from 'next';
import { notFound, redirect } from 'next/navigation';
import { JSX } from 'react';

import { UsersManagementPage } from '@/features/user/components/users-management-page';
import { auth } from '@/lib/auth';

export const metadata: Metadata = {
  title: 'User Management | Garixo',
  description: 'View team users and account status.'
};

export default async function AdministratorUsersPage(): Promise<JSX.Element> {
  const session = await auth();

  if (!session?.user?.id) {
    redirect('/auth/login');
  }

  // This route is strictly for admin accounts.
  // Owner/staff/user should not access this page and will get a 404.
  if (session.user.role !== 'admin') {
    notFound();
  }

  return (
    <div className="space-y-s4">
      <UsersManagementPage />
    </div>
  );
}
