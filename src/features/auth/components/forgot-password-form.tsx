'use client';

import { Mail } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { AuthPageShell } from '@/features/auth/components/auth-page-shell';
import { useForgotPasswordForm } from '@/features/auth/hooks';
import { cn } from '@/lib/utils/cn';

export function ForgotPasswordForm(): JSX.Element {
  const router = useRouter();
  const { form, onSubmit, mutation } = useForgotPasswordForm({
    onSuccess: () => {
      router.push('/auth/forgot-password/sent');
    }
  });
  const identifierError = form.formState.errors.identifier?.message;
  const formError = form.formState.errors.root?.message;
  const hasValue = Boolean(form.watch('identifier'));

  return (
    <AuthPageShell
      title="Forgot your password?"
      subtitle="Enter your email address. We'll send password reset instructions."
    >
      <form className="space-y-s4" onSubmit={onSubmit}>
        <div className="space-y-s1">
          <label
            htmlFor="identifier"
            className="text-small font-medium text-text-secondary"
          >
            Email Address
          </label>
          <div className="relative">
            <Mail className="pointer-events-none absolute left-s3 top-1/2 size-4 -translate-y-1/2 text-text-muted" />
            <Input
              id="identifier"
              type="text"
              autoComplete="username"
              placeholder="e.g. demo@example.com"
              className={cn(
                'h-12 pl-9',
                identifierError
                  ? 'border-error-600 focus-visible:ring-error-300'
                  : ''
              )}
              {...form.register('identifier')}
            />
          </div>
          {identifierError ? (
            <p className="text-caption text-state-error">{identifierError}</p>
          ) : null}
        </div>

        {formError ? (
          <p className="rounded-md bg-error-50 px-s3 py-s2 text-small text-state-error">
            {formError}
          </p>
        ) : null}

        <Button
          type="submit"
          className="h-12 w-full"
          disabled={!hasValue || mutation.isPending}
        >
          {mutation.isPending ? 'Sending...' : 'Send Reset Email'}
        </Button>

        <div className="pt-s1">
          <Link
            href="/auth/login"
            className="text-small font-medium text-primary-700 hover:underline"
          >
            Back to Sign In
          </Link>
        </div>
      </form>
    </AuthPageShell>
  );
}
