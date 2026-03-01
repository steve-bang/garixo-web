import type { Metadata } from 'next';
import { notFound, redirect } from 'next/navigation';
import { JSX } from 'react';

import { BlogEditorPage } from '@/features/blogs/components/blog-editor-page';
import { auth } from '@/lib/auth';

type Props = {
  params: Promise<{ id: string }>;
};

export const metadata: Metadata = {
  title: 'Edit Blog Post | Garixo',
  description: 'Update blog content and SEO metadata.'
};

export default async function EditBlogPostPage({
  params
}: Props): Promise<JSX.Element> {
  const session = await auth();

  if (!session?.user?.id) {
    redirect('/auth/login');
  }

  if (session.user.role !== 'admin') {
    notFound();
  }

  const { id } = await params;

  return <BlogEditorPage blogId={id} />;
}
