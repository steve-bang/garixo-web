import type { Metadata } from 'next';
import { JSX } from 'react';
import { redirect } from 'next/navigation';

import { LoginForm } from '@/features/auth/components/login-form';
import { auth } from '@/lib/auth';

export const metadata: Metadata = {
  title: 'Login | Garixo',
  description:
    'Sign in to Garixo to manage work orders, customers, inventory, and staff in one simple garage dashboard.'
};

export default async function AuthLoginPage(): Promise<JSX.Element> {
  const session = await auth();

  if (session?.user?.id) {
    redirect('/dashboard');
  }

  const breadcrumbSchema = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      {
        '@type': 'ListItem',
        position: 1,
        name: 'Home',
        item: 'https://www.garixo.com/'
      },
      {
        '@type': 'ListItem',
        position: 2,
        name: 'Login',
        item: 'https://www.garixo.com/auth/login'
      }
    ]
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />
      <LoginForm />
    </>
  );
}
