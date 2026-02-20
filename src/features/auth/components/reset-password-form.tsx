'use client';

import { CheckCircle2, Eye, EyeOff, LockKeyhole } from 'lucide-react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { useMemo, useState } from 'react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { AuthPageShell } from '@/features/auth/components/auth-page-shell';
import { useResetPasswordForm } from '@/features/auth/hooks';
import { cn } from '@/lib/utils/cn';

function getPasswordStrength(password: string): { label: string; width: string; color: string } {
  if (!password) {
    return { label: 'Too weak', width: 'w-0', color: 'bg-border' };
  }

  let score = 0;
  if (password.length >= 6) score += 1;
  if (/[A-Z]/.test(password) || /[a-z]/.test(password)) score += 1;
  if (/\d/.test(password)) score += 1;
  if (/[^A-Za-z0-9]/.test(password)) score += 1;

  if (score <= 1) return { label: 'Weak', width: 'w-1/4', color: 'bg-error-500' };
  if (score === 2) return { label: 'Fair', width: 'w-2/4', color: 'bg-warning-500' };
  if (score === 3) return { label: 'Good', width: 'w-3/4', color: 'bg-info-500' };
  return { label: 'Strong', width: 'w-full', color: 'bg-success-500' };
}

export function ResetPasswordForm(): JSX.Element {
  const searchParams = useSearchParams();
  const token = searchParams.get('token') ?? undefined;
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [completed, setCompleted] = useState(false);

  const { form, onSubmit, mutation } = useResetPasswordForm({
    token,
    onSuccess: () => setCompleted(true)
  });

  const passwordError = form.formState.errors.password?.message;
  const confirmError = form.formState.errors.confirmPassword?.message;
  const formError = form.formState.errors.root?.message;
  const hasValue = Boolean(form.watch('password') && form.watch('confirmPassword'));
  const strength = useMemo(() => getPasswordStrength(form.watch('password') ?? ''), [form.watch('password')]);

  return (
    <AuthPageShell title="Set a new password" subtitle="Create a strong password for your account.">
      <div className="transition-all duration-200">
        {completed ? (
          <div className="space-y-s4 opacity-100 transition-opacity duration-200">
            <div className="flex items-center gap-s2 rounded-md bg-success-50 px-s3 py-s2 text-small text-success-700 my-6">
              <CheckCircle2 className="size-4" />
              <span>Password updated successfully</span>
            </div>

            <Link href="/auth/login">
              <Button className="btn-ripple h-12 w-full">Go to Sign In</Button>
            </Link>
          </div>
        ) : (
          <form className="space-y-s4 opacity-100 transition-opacity duration-200" onSubmit={onSubmit}>
            <div className="space-y-s1">
              <label htmlFor="password" className="text-small font-medium text-text-secondary">
                New Password
              </label>
              <div className="relative">
                <LockKeyhole className="pointer-events-none absolute left-s3 top-1/2 size-4 -translate-y-1/2 text-text-muted" />
                <Input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="new-password"
                  className={cn('h-12 pl-9 pr-11', passwordError ? 'border-error-600 focus-visible:ring-error-300' : '')}
                  {...form.register('password')}
                />
                <button
                  type="button"
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                  className="absolute right-s3 top-1/2 -translate-y-1/2 text-text-muted hover:text-text-primary"
                  onClick={() => setShowPassword((prev) => !prev)}
                >
                  {showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                </button>
              </div>

              <div className="space-y-s1 pt-s1">
                <div className="h-1.5 rounded-full bg-surface-hover">
                  <div className={cn('h-full rounded-full transition-all duration-200', strength.width, strength.color)} />
                </div>
                <p className="text-caption text-text-muted">Strength: {strength.label}</p>
              </div>

              {passwordError ? <p className="text-caption text-state-error">{passwordError}</p> : null}
            </div>

            <div className="space-y-s1">
              <label htmlFor="confirmPassword" className="text-small font-medium text-text-secondary">
                Confirm Password
              </label>
              <div className="relative">
                <LockKeyhole className="pointer-events-none absolute left-s3 top-1/2 size-4 -translate-y-1/2 text-text-muted" />
                <Input
                  id="confirmPassword"
                  type={showConfirmPassword ? 'text' : 'password'}
                  autoComplete="new-password"
                  className={cn('h-12 pl-9 pr-11', confirmError ? 'border-error-600 focus-visible:ring-error-300' : '')}
                  {...form.register('confirmPassword')}
                />
                <button
                  type="button"
                  aria-label={showConfirmPassword ? 'Hide confirm password' : 'Show confirm password'}
                  className="absolute right-s3 top-1/2 -translate-y-1/2 text-text-muted hover:text-text-primary"
                  onClick={() => setShowConfirmPassword((prev) => !prev)}
                >
                  {showConfirmPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                </button>
              </div>
              {confirmError ? <p className="text-caption text-state-error">{confirmError}</p> : null}
            </div>

            {formError ? <p className="rounded-md bg-error-50 px-s3 py-s2 text-small text-state-error">{formError}</p> : null}

            <div className="sticky bottom-0 bg-surface-default pt-s2">
              <Button type="submit" className="btn-ripple h-12 w-full" disabled={!hasValue || !form.formState.isValid || mutation.isPending}>
                {mutation.isPending ? 'Resetting...' : 'Reset Password'}
              </Button>
            </div>
          </form>
        )}
      </div>
    </AuthPageShell>
  );
}
