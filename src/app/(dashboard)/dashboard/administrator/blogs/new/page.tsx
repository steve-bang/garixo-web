import type { Metadata } from 'next';
import { notFound, redirect } from 'next/navigation';
import { JSX } from 'react';

import { BlogEditorPage } from '@/features/blogs/components/blog-editor-page';
import { auth } from '@/lib/auth';

export const metadata: Metadata = {
  title: 'New Blog Post | Garixo',
  description: 'Create a new SEO-ready blog post.'
};

export default async function NewBlogPostPage(): Promise<JSX.Element> {
  const session = await auth();

  if (!session?.user?.id) {
    redirect('/auth/login');
  }

  if (session.user.role !== 'admin') {
    notFound();
  }

  return <BlogEditorPage />;
}
