import type { Metadata } from 'next';
import { JSX } from 'react';

import { SignUpForm } from '@/features/auth/components/sign-up-form';

export const metadata: Metadata = {
  title: 'Sign Up | Garixo',
  description:
    'Create your Garixo account and start managing your garage with simple tools for work orders, customers, inventory, and staff.'
};

export default function SignUpPage(): JSX.Element {
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
        name: 'Sign Up',
        item: 'https://www.garixo.com/auth/sign-up'
      }
    ]
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />
      <SignUpForm />
    </>
  );
}
