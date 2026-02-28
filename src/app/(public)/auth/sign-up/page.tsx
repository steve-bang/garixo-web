import type { Metadata } from 'next';
import { JSX } from 'react';

import { SignUpForm } from '@/features/auth/components/sign-up-form';

export const metadata: Metadata = {
  title: 'Sign Up | Garixo',
  description:
    'Create your Garixo account and start managing your garage with simple tools for work orders, customers, inventory, and staff.'
};

export default function SignUpPage(): JSX.Element {
  return <SignUpForm />;
}
