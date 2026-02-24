import { JSX, Suspense } from 'react';

import { ResetPasswordForm } from '@/features/auth/components/reset-password-form';

export default function ResetPasswordPage(): JSX.Element {
  return (
    <Suspense fallback={<div className="w-full max-w-[420px]" />}>
      <ResetPasswordForm />
    </Suspense>
  );
}
