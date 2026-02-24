import { Suspense } from 'react';

import { VerifyEmailClientPage } from '@/app/verify-email/verify-email-client-page';

function VerifyEmailPageFallback(): JSX.Element {
  return (
    <main className="flex min-h-screen items-center justify-center bg-background-primary p-s4">
      <div className="w-full max-w-[460px] rounded-lg border border-border bg-surface-default p-s6 shadow-sm">
        <div className="h-6 w-44 animate-pulse rounded bg-surface-hover" />
        <div className="mt-s3 h-4 w-full animate-pulse rounded bg-surface-hover" />
        <div className="mt-s6 h-11 w-full animate-pulse rounded bg-surface-hover" />
      </div>
    </main>
  );
}

export default function VerifyEmailPage(): JSX.Element {
  return (
    <Suspense fallback={<VerifyEmailPageFallback />}>
      <VerifyEmailClientPage />
    </Suspense>
  );
}
