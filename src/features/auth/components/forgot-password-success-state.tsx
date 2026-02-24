import { CheckCircle2, MailCheck } from 'lucide-react';
import Link from 'next/link';

import { Button } from '@/components/ui/button';
import { AuthPageShell } from '@/features/auth/components/auth-page-shell';

export function ForgotPasswordSuccessState(): JSX.Element {
  return (
    <AuthPageShell
      title="Check your email"
      subtitle="If your account exists, we sent password reset instructions."
    >
      <div className="space-y-s4">
        <div className="flex flex-col items-center gap-s2 rounded-lg border border-success-100 bg-success-50/60 px-s4 py-s4 text-center">
          <div className="flex size-10 items-center justify-center rounded-full bg-success-100 text-success-700">
            <MailCheck className="size-5" />
          </div>
          <div className="space-y-0.5">
            <p className="text-small font-semibold text-success-800">
              Message sent successfully
            </p>
            <p className="text-caption text-success-700">
              Open your inbox and follow the instructions to continue.
            </p>
          </div>
        </div>

        <div className="rounded-lg border border-border bg-surface-default p-s3">
          <p className="text-small font-medium text-text-primary">
            Did not receive the email?
          </p>
          <div className="mt-s1.5 space-y-0.5 text-caption text-text-muted">
            <p>Check your spam or promotions folder.</p>
            <p>Confirm you entered the correct email address.</p>
          </div>
        </div>

        <div className="flex flex-col space-y-s2">
          <Link href="/auth/login">
            <Button className="h-12 w-full">
              <CheckCircle2 className="size-4" />
              Back to Sign In
            </Button>
          </Link>

          <Link href="/auth/forgot-password">
            <Button variant="secondary" className="h-12 w-full">
              Try another email
            </Button>
          </Link>
        </div>
      </div>
    </AuthPageShell>
  );
}
