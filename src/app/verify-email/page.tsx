'use client';

import { AlertTriangle, CheckCircle2, XCircle } from 'lucide-react';
import Link from 'next/link';
import { useSession } from 'next-auth/react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useEffect, useMemo, useState } from 'react';

import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import type { ApiResponse } from '@/types/api';

type VerifyStatus = 'success' | 'expired' | 'invalid';

function parseStatus(value: string | null): VerifyStatus {
  if (value === 'success' || value === 'expired' || value === 'invalid') {
    return value;
  }
  return 'invalid';
}

export default function VerifyEmailPage(): JSX.Element {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { status: sessionStatus } = useSession();
  const toast = useToast();

  const [isSending, setIsSending] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [cooldown, setCooldown] = useState(0);

  const status = parseStatus(searchParams.get('status'));
  const email = searchParams.get('email') ?? undefined;

  useEffect(() => {
    if (status !== 'success' || sessionStatus !== 'authenticated') {
      return;
    }

    const timer = window.setTimeout(() => {
      router.replace('/dashboard');
    }, 2_000);

    return () => window.clearTimeout(timer);
  }, [router, sessionStatus, status]);

  useEffect(() => {
    if (cooldown <= 0) {
      return;
    }

    const timer = window.setInterval(() => {
      setCooldown((value) => (value <= 1 ? 0 : value - 1));
    }, 1_000);

    return () => window.clearInterval(timer);
  }, [cooldown]);

  const content = useMemo(() => {
    if (status === 'success') {
      return {
        title: 'Email verified successfully',
        description: 'Your account is now secure and ready to go.',
        icon: <CheckCircle2 className="size-10 text-success-600" aria-hidden />,
        primaryLabel: 'Go to Dashboard'
      };
    }

    if (status === 'expired') {
      return {
        title: 'This link has expired',
        description: "Click below and we'll send you a new verification email.",
        icon: (
          <AlertTriangle className="size-10 text-warning-600" aria-hidden />
        ),
        primaryLabel:
          cooldown > 0
            ? `Resend verification email (${cooldown}s)`
            : 'Resend verification email'
      };
    }

    return {
      title: 'This link is not valid',
      description: 'Please request a new verification email.',
      icon: <XCircle className="size-10 text-error-600" aria-hidden />,
      primaryLabel:
        cooldown > 0
          ? `Send new verification email (${cooldown}s)`
          : 'Send new verification email'
    };
  }, [cooldown, status]);

  const onPrimaryClick = async () => {
    if (status === 'success') {
      router.push('/dashboard');
      return;
    }

    if (isSending || cooldown > 0) {
      return;
    }

    setIsSending(true);
    setSuccessMessage('');

    try {
      const response = await fetch('/api/resend-verification', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(email ? { email } : {})
      });

      const payload = (await response.json()) as ApiResponse<{ success: true }>;

      if (payload.success) {
        setSuccessMessage('A new verification email has been sent.');
        setCooldown(60);
        toast.success('A new verification email has been sent.');
      } else {
        setSuccessMessage('Please check your inbox in a moment.');
      }
    } catch {
      setSuccessMessage('Please check your inbox in a moment.');
    } finally {
      setIsSending(false);
    }
  };

  return (
    <main className="flex min-h-screen items-center justify-center bg-background-primary p-s4">
      <Card className="w-full max-w-[460px] border border-border p-s6 text-center shadow-sm">
        <div className="mx-auto mb-s4 inline-flex size-14 items-center justify-center rounded-full bg-surface-hover">
          {content.icon}
        </div>

        <h1 className="text-h2 text-text-primary">{content.title}</h1>
        <p className="mt-s2 text-small text-text-secondary">
          {content.description}
        </p>

        {successMessage ? (
          <p className="mt-s4 rounded-md border border-success-200 bg-success-50 px-s3 py-s2 text-small text-success-800">
            {successMessage}
          </p>
        ) : null}

        {status === 'success' && sessionStatus === 'authenticated' ? (
          <p className="mt-s4 text-caption text-text-muted">
            Redirecting you to dashboard...
          </p>
        ) : null}

        <Button
          className="mt-s6 h-11 w-full"
          onClick={onPrimaryClick}
          disabled={(status !== 'success' && cooldown > 0) || isSending}
        >
          {isSending && status !== 'success'
            ? 'Sending...'
            : content.primaryLabel}
        </Button>

        {status !== 'success' ? (
          <Link
            href="/auth/login"
            className="text-primary mt-s4 inline-block text-small font-medium hover:underline"
          >
            Back to login
          </Link>
        ) : null}
      </Card>
    </main>
  );
}
