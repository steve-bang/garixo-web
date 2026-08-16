import { FileQuestion } from 'lucide-react';
import Link from 'next/link';

import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';

export default function NotFound(): JSX.Element {
  return (
    <main className="grid min-h-screen place-items-center bg-background-primary px-s4 py-s6">
      <Card className="w-full max-w-[520px] space-y-s6 p-s6 text-center shadow-sm">
        <div className="space-y-s3">
          <div className="mx-auto grid size-12 place-items-center rounded-md bg-surface-hover text-text-muted">
            <FileQuestion className="size-5" />
          </div>
          <p className="text-display font-medium text-text-muted">404</p>
          <h1 className="text-h1">Page Not Found</h1>
          <p className="text-small text-text-secondary">
            The page you are looking for may have been removed, renamed, or is
            temporarily unavailable.
          </p>
        </div>

        <div className="border-t border-border pt-s4">
          <Button asChild>
            <Link href="/">Go to Home</Link>
          </Button>
        </div>
      </Card>
    </main>
  );
}
