'use client';

import { MailCheck } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';

import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import type { ApiResponse } from '@/types/api';

type VerifyEmailSendResponse = {
  accepted: true;
  alreadyVerified: boolean;
};

type EmailVerificationNoticeProps = {
  ownerEmail: string;
  ownerName?: string;
};

export function EmailVerificationNotice({
  ownerEmail,
  ownerName
}: EmailVerificationNoticeProps): JSX.Element | null {
  const toast = useToast();
  const hideTimerRef = useRef<number | null>(null);

  const [isSending, setIsSending] = useState(false);
  const [isHidden, setIsHidden] = useState(false);
  const [successText, setSuccessText] = useState('');
  const [errorText, setErrorText] = useState('');

  useEffect(
    () => () => {
      if (hideTimerRef.current) {
        window.clearTimeout(hideTimerRef.current);
      }
    },
    []
  );

  if (isHidden) {
    return null;
  }

  const handleSendVerifyEmail = async () => {
    setErrorText('');
    setSuccessText('');
    setIsSending(true);

    try {
      const response = await fetch('/api/resend-verification', {
        method: 'POST'
      });

      const payload =
        (await response.json()) as ApiResponse<VerifyEmailSendResponse>;

      if (!payload.success || !payload.data) {
        const message =
          payload.error ??
          'Could not send verification email. Please try again.';
        setErrorText(message);
        toast.error(message);
        return;
      }

      if (payload.data.alreadyVerified) {
        toast.success('Your email is already verified.');
        setIsHidden(true);
        return;
      }

      const displayName = ownerName?.trim() || 'Owner';
      setSuccessText(
        `Done ${displayName}. We sent a verification email to ${ownerEmail}. Open your inbox, click "Verify Email Address", then return to dashboard.`
      );
      toast.success('Verification email sent.');

      hideTimerRef.current = window.setTimeout(() => {
        setIsHidden(true);
      }, 3_000);
    } catch {
      const message = 'Could not send verification email. Please try again.';
      setErrorText(message);
      toast.error(message);
    } finally {
      setIsSending(false);
    }
  };

  return (
    <Card className="border-warning-200 bg-warning-50 p-s4">
      <div className="flex flex-col gap-s3 md:flex-row md:items-center md:justify-between">
        <div className="flex items-start gap-s3">
          <span className="mt-0.5 inline-flex size-9 items-center justify-center rounded-full bg-warning-100 text-warning-700">
            <MailCheck className="size-5" />
          </span>
          <div className="space-y-s1">
            <p className="text-small font-semibold text-text-primary">
              Please verify your email address
            </p>
            <p className="text-small text-text-secondary">
              This helps protect your garage account and ensures you receive
              important updates.
            </p>
          </div>
        </div>
        <Button
          className="h-10 md:min-w-[220px]"
          onClick={handleSendVerifyEmail}
          disabled={isSending}
        >
          {isSending ? 'Sending...' : 'Send Verification Email'}
        </Button>
      </div>

      {successText ? (
        <p className="mt-s3 rounded-md border border-success-200 bg-success-50 px-s3 py-s2 text-small text-success-800">
          {successText}
        </p>
      ) : null}

      {errorText ? (
        <p className="mt-s3 rounded-md border border-error-200 bg-error-50 px-s3 py-s2 text-small text-error-800">
          {errorText}
        </p>
      ) : null}
    </Card>
  );
}
