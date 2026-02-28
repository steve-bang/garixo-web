import type { Metadata } from 'next';
import { notFound, redirect } from 'next/navigation';
import { JSX } from 'react';

import { BlogsManagementPage } from '@/features/blogs/components/blogs-management-page';
import { auth } from '@/lib/auth';

export const metadata: Metadata = {
  title: 'Blog Management | Garixo',
  description: 'Create and manage SEO blog content for marketing growth.'
};

export default async function AdministratorBlogsPage(): Promise<JSX.Element> {
  const session = await auth();

  if (!session?.user?.id) {
    redirect('/auth/login');
  }

  if (session.user.role !== 'admin') {
    notFound();
  }

  return <BlogsManagementPage />;
}
