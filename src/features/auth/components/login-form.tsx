'use client';

import { CheckCircle2, Eye, EyeOff, LockKeyhole, Mail } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { useState } from 'react';

import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { useLoginForm } from '@/features/auth/hooks';
import { cn } from '@/lib/utils/cn';

export function LoginForm(): JSX.Element {
  const { form, onSubmit, mutation } = useLoginForm();
  const [showPassword, setShowPassword] = useState(false);

  const emailError = form.formState.errors.email?.message;
  const passwordError = form.formState.errors.password?.message;
  const formError = form.formState.errors.root?.message;
  const hasFormValue = Boolean(form.watch('email') && form.watch('password'));

  return (
    <div className="min-h-screen bg-background-secondary lg:grid lg:grid-cols-2">
      <section className="bg-gradient-to-br from-primary-600 to-primary-800 p-s6 text-text-inverse md:p-s10 lg:flex lg:min-h-screen lg:flex-col lg:justify-center lg:p-s12">
        <div className="mx-auto w-full max-w-[520px] space-y-s4 lg:space-y-s6">
          <Link
            href="/"
            className="inline-flex w-fit items-center gap-s2 text-text-inverse hover:opacity-90"
          >
            <span className="grid size-10 place-items-center overflow-hidden rounded-md border border-white/30 bg-white">
              <Image
                src="/favicon/favicon.svg"
                alt="Garixo logo"
                width={28}
                height={28}
                className="size-7"
              />
            </span>
            <span className="text-h2 text-text-inverse">Garixo</span>
          </Link>

          <h1 className="text-[1.75rem] font-bold leading-tight tracking-[-0.02em] text-text-inverse md:text-[2rem] lg:text-[2.5rem]">
            Manage your garage
            <br />
            Without the stress.
          </h1>

          <p className="text-small text-slate-100/90 md:text-body">
            Simple tools. Clear reports. More profit.
          </p>

          <ul className="space-y-s2 text-small text-slate-100/90 md:text-body">
            <li className="flex items-center gap-s2">
              <CheckCircle2 className="size-4 text-success-300" />
              <span>Track jobs easily</span>
            </li>
            <li className="flex items-center gap-s2">
              <CheckCircle2 className="size-4 text-success-300" />
              <span>Manage customers fast</span>
            </li>
            <li className="flex items-center gap-s2">
              <CheckCircle2 className="size-4 text-success-300" />
              <span>See daily profit clearly</span>
            </li>
          </ul>
        </div>
      </section>

      <section className="flex min-h-[58vh] items-center justify-center p-s6 md:p-s8 lg:min-h-screen lg:p-s12">
        <Card className="w-full max-w-[420px] rounded-lg border border-border bg-surface-default p-s6 shadow-sm md:p-s8">
          <h1 className="text-h2">Sign in</h1>
          <p className="mt-s1 text-small text-text-muted">
            Enter your email and password to access your garage.
          </p>

          <form className="mt-s6 space-y-s4" onSubmit={onSubmit}>
            <div className="space-y-s1">
              <label
                htmlFor="email"
                className="text-small font-medium text-text-secondary"
              >
                Email address
              </label>
              <div className="relative">
                <Mail className="pointer-events-none absolute left-s3 top-1/2 size-4 -translate-y-1/2 text-text-muted" />
                <Input
                  id="email"
                  type="email"
                  inputMode="email"
                  autoComplete="email"
                  placeholder="example@gmail.com"
                  className={cn(
                    'h-12 pl-9',
                    emailError
                      ? 'border-error-600 focus-visible:ring-error-300'
                      : ''
                  )}
                  {...form.register('email')}
                />
              </div>
              {emailError ? (
                <p className="text-caption text-state-error">{emailError}</p>
              ) : null}
            </div>

            <div className="space-y-s1">
              <label
                htmlFor="password"
                className="text-small font-medium text-text-secondary"
              >
                Password
              </label>
              <div className="relative">
                <LockKeyhole className="pointer-events-none absolute left-s3 top-1/2 size-4 -translate-y-1/2 text-text-muted" />
                <Input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="current-password"
                  className={cn(
                    'h-12 pl-9 pr-11',
                    passwordError
                      ? 'border-error-600 focus-visible:ring-error-300'
                      : ''
                  )}
                  {...form.register('password')}
                />
                <button
                  type="button"
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                  className="absolute right-s3 top-1/2 -translate-y-1/2 text-text-muted hover:text-text-primary"
                  onClick={() => setShowPassword((prev) => !prev)}
                >
                  {showPassword ? (
                    <EyeOff className="size-4" />
                  ) : (
                    <Eye className="size-4" />
                  )}
                </button>
              </div>
              {passwordError ? (
                <p className="text-caption text-state-error">{passwordError}</p>
              ) : null}

              <div className="pt-s1">
                <Link
                  href="/auth/forgot-password"
                  className="text-small font-medium text-primary-700 hover:underline"
                >
                  Forgot password?
                </Link>
              </div>
            </div>

            {formError ? (
              <p className="rounded-md bg-error-50 px-s3 py-s2 text-small text-state-error">
                {formError}
              </p>
            ) : null}

            <Button
              type="submit"
              className="h-12 w-full"
              disabled={
                !hasFormValue || !form.formState.isValid || mutation.isPending
              }
            >
              {mutation.isPending ? 'Signing in...' : 'Sign In'}
            </Button>

            <p className="text-small text-text-secondary">
              Don&apos;t have an account?{' '}
              <Link
                href="https://app.garixo.com/register"
                className="font-medium text-primary-700 hover:underline"
              >
                Sign up
              </Link>
            </p>
          </form>
        </Card>
      </section>
    </div>
  );
}
