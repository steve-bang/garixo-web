'use client';

import {
  CheckCircle2,
  Eye,
  EyeOff,
  LockKeyhole,
  Mail,
  Store
} from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { useState } from 'react';

import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { useSignUpForm } from '@/features/auth/hooks';
import { cn } from '@/lib/utils/cn';

export function SignUpForm(): JSX.Element {
  const { form, onSubmit, mutation } = useSignUpForm();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const formError = form.formState.errors.root?.message;
  const hasFormValue = Boolean(
    form.watch('garageName') &&
    form.watch('email') &&
    form.watch('password') &&
    form.watch('confirmPassword')
  );

  return (
    <div className="min-h-screen bg-background-secondary md:grid md:grid-cols-[40%_60%] lg:grid-cols-2">
      <section
        className="relative hidden md:flex md:min-h-screen md:flex-col md:justify-between md:p-s12 lg:p-s12"
        style={{
          backgroundImage:
            "linear-gradient(rgba(0,0,0,0.5), rgba(0,0,0,0.5)), url('https://images.unsplash.com/photo-1487754180451-c456f719a1fc?auto=format&fit=crop&w=1400&q=80')",
          backgroundSize: 'cover',
          backgroundPosition: 'center'
        }}
      >
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

        <div className="max-w-[460px] space-y-s4 text-text-inverse">
          <h1 className="text-[2rem] font-semibold leading-tight tracking-[-0.02em] text-white lg:text-[2.5rem]">
            Manage your garage.
            <br />
            Without the stress.
          </h1>

          <p className="text-small text-slate-100">
            Simple tools. Clear reports. More profit.
          </p>

          <ul className="space-y-s2 text-small">
            <li className="flex items-center gap-s2">
              <CheckCircle2 className="size-4 text-success-300" />
              <span>Track jobs easily</span>
            </li>
            <li className="flex items-center gap-s2">
              <CheckCircle2 className="size-4 text-success-300" />
              <span>Manage customers in seconds</span>
            </li>
            <li className="flex items-center gap-s2">
              <CheckCircle2 className="size-4 text-success-300" />
              <span>Know your daily profit</span>
            </li>
            <li className="flex items-center gap-s2">
              <CheckCircle2 className="size-4 text-success-300" />
              <span>Reduce paperwork</span>
            </li>
          </ul>
        </div>
      </section>

      <section className="flex min-h-screen flex-col p-s6 md:justify-center md:p-s12">
        <Link
          href="/"
          className="mb-s4 inline-flex w-fit items-center gap-s2 md:hidden"
        >
          <span className="grid size-10 place-items-center overflow-hidden rounded-md border border-border bg-surface-default">
            <Image
              src="/favicon/favicon.svg"
              alt="Garixo logo"
              width={28}
              height={28}
              className="size-7"
            />
          </span>
          <span className="text-h3 text-text-primary">Garixo</span>
        </Link>

        <Card className="mx-auto w-full max-w-[420px] rounded-lg border border-border bg-surface-default p-s8 shadow-sm">
          <h1 className="text-h2">Create your account</h1>
          <p className="mt-s1 text-small text-text-muted">
            Start managing your garage today.
          </p>

          <form className="mt-s6 space-y-s4" onSubmit={onSubmit}>
            <div className="space-y-s1">
              <label
                htmlFor="garageName"
                className="text-small font-medium text-text-secondary"
              >
                Garage Name
              </label>
              <div className="relative">
                <Store className="pointer-events-none absolute left-s3 top-1/2 size-4 -translate-y-1/2 text-text-muted" />
                <Input
                  id="garageName"
                  type="text"
                  autoComplete="organization"
                  placeholder="Garage Auto Pro"
                  className={cn(
                    'h-12 pl-9',
                    form.formState.errors.garageName
                      ? 'border-error-600 focus-visible:ring-error-300'
                      : ''
                  )}
                  {...form.register('garageName')}
                />
              </div>
              {form.formState.errors.garageName ? (
                <p className="text-caption text-state-error">
                  {form.formState.errors.garageName.message}
                </p>
              ) : null}
            </div>

            <div className="space-y-s1">
              <label
                htmlFor="email"
                className="text-small font-medium text-text-secondary"
              >
                Email Address
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
                    form.formState.errors.email
                      ? 'border-error-600 focus-visible:ring-error-300'
                      : ''
                  )}
                  {...form.register('email')}
                />
              </div>
              {form.formState.errors.email ? (
                <p className="text-caption text-state-error">
                  {form.formState.errors.email.message}
                </p>
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
                  autoComplete="new-password"
                  placeholder="Enter your password"
                  className={cn(
                    'h-12 pl-9 pr-11',
                    form.formState.errors.password
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
              {form.formState.errors.password ? (
                <p className="text-caption text-state-error">
                  {form.formState.errors.password.message}
                </p>
              ) : null}
            </div>

            <div className="space-y-s1">
              <label
                htmlFor="confirmPassword"
                className="text-small font-medium text-text-secondary"
              >
                Confirm Password
              </label>
              <div className="relative">
                <LockKeyhole className="pointer-events-none absolute left-s3 top-1/2 size-4 -translate-y-1/2 text-text-muted" />
                <Input
                  id="confirmPassword"
                  type={showConfirm ? 'text' : 'password'}
                  autoComplete="new-password"
                  placeholder="Confirm your password"
                  className={cn(
                    'h-12 pl-9 pr-11',
                    form.formState.errors.confirmPassword
                      ? 'border-error-600 focus-visible:ring-error-300'
                      : ''
                  )}
                  {...form.register('confirmPassword')}
                />
                <button
                  type="button"
                  aria-label={
                    showConfirm
                      ? 'Hide password confirmation'
                      : 'Show password confirmation'
                  }
                  className="absolute right-s3 top-1/2 -translate-y-1/2 text-text-muted hover:text-text-primary"
                  onClick={() => setShowConfirm((prev) => !prev)}
                >
                  {showConfirm ? (
                    <EyeOff className="size-4" />
                  ) : (
                    <Eye className="size-4" />
                  )}
                </button>
              </div>
              {form.formState.errors.confirmPassword ? (
                <p className="text-caption text-state-error">
                  {form.formState.errors.confirmPassword.message}
                </p>
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
              disabled={!hasFormValue || mutation.isPending}
            >
              {mutation.isPending ? 'Creating account...' : 'Create Account'}
            </Button>

            <p className="text-small text-text-secondary">
              Already have an account?{' '}
              <Link
                href="/auth/login"
                className="font-medium text-primary-700 hover:underline"
              >
                Sign in
              </Link>
            </p>
          </form>
        </Card>
      </section>
    </div>
  );
}
