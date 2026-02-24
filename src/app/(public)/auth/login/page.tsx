import { JSX } from 'react';
import { redirect } from 'next/navigation';

import { LoginForm } from '@/features/auth/components/login-form';
import { auth } from '@/lib/auth';

export default async function AuthLoginPage(): Promise<JSX.Element> {
  const session = await auth();

  if (session?.user?.id) {
    redirect('/dashboard');
  }

  return <LoginForm />;
}
