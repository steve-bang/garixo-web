import Link from 'next/link';
import type { ReactNode } from 'react';

import { Card } from '@/components/ui/card';

type AuthPageShellProps = {
  title: string;
  subtitle: string;
  children: ReactNode;
  footer?: ReactNode;
};

export function AuthPageShell({ title, subtitle, children, footer }: AuthPageShellProps): JSX.Element {
  return (
    <div className="w-full max-w-[420px]">
      <div className="mb-s8 text-center">
        <p className="text-h2 text-primary-700">Garixo</p>
        <p className="mt-s2 text-small text-text-muted">Manage your garage. Simple and clear.</p>
      </div>

      <Card className="rounded-lg border border-border bg-surface-default p-s8 shadow-sm">
        <h1 className="text-h2">{title}</h1>
        <p className="mt-s1 text-small text-text-muted">{subtitle}</p>

        <div className="mt-s6">{children}</div>
      </Card>

      {footer ? <div className="mt-s6 text-center">{footer}</div> : null}

      <div className="mt-s6 flex items-center justify-center gap-s4 text-caption text-text-muted">
        <Link href="#" className="hover:text-text-primary">
          Support
        </Link>
        <Link href="#" className="hover:text-text-primary">
          Privacy
        </Link>
      </div>
    </div>
  );
}
