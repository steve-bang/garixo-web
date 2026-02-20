import { CheckCircle2 } from 'lucide-react';
import Link from 'next/link';

import { Button } from '@/components/ui/button';
import { AuthPageShell } from '@/features/auth/components/auth-page-shell';

export function ForgotPasswordSuccessState(): JSX.Element {
  return (
    <AuthPageShell title="Check your messages" subtitle="We've sent you instructions to reset your password.">
      <div className="space-y-s4">
        <div className="flex items-center gap-s2 rounded-md bg-success-50 px-s3 py-s2 text-small text-success-700 my-6">
          <CheckCircle2 className="size-4" />
          <span>Instructions sent</span>
        </div>

        <Link href="/auth/login">
          <Button className="h-12 w-full">Back to Sign In</Button>
        </Link>
      </div>
    </AuthPageShell>
  );
}
