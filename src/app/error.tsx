'use client';

import { AlertCircle } from 'lucide-react';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';

type GlobalErrorProps = {
  error: Error & { digest?: string };
  reset: () => void;
};

export default function GlobalError({ error, reset }: GlobalErrorProps): JSX.Element {
  const router = useRouter();

  useEffect(() => {
    void error;
    // Integrate monitoring here (Sentry, Datadog, etc.) without exposing details in UI.
  }, [error]);

  return (
    <main className="grid min-h-screen place-items-center bg-background-primary px-s4 py-s6">
      <Card className="w-full max-w-[520px] space-y-s6 p-s6 text-center shadow-sm">
        <div className="space-y-s3">
          <div className="mx-auto grid size-12 place-items-center rounded-md bg-surface-hover text-text-muted">
            <AlertCircle className="size-5" />
          </div>
          <h1 className="text-h1">Something Went Wrong</h1>
          <p className="text-small text-text-secondary">
            We encountered an unexpected issue. Your data is safe, and you can try again or return to the dashboard.
          </p>
        </div>

        <div className="grid gap-s2 border-t border-border pt-s4 sm:grid-cols-2">
          <Button onClick={reset}>Try Again</Button>
          <Button variant="secondary" onClick={() => router.push('/dashboard')}>
            Back to Dashboard
          </Button>
          <Button variant="ghost" className="sm:col-span-2" onClick={() => router.push('/')}>
            Go to Home
          </Button>
        </div>
      </Card>
    </main>
  );
}
