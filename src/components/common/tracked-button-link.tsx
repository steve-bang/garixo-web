'use client';

import Link from 'next/link';
import type { ReactNode } from 'react';

import { Button } from '@/components/ui/button';
import { trackEvent } from '@/lib/analytics/ga';

type TrackedButtonLinkProps = {
  href: string;
  eventName: string;
  children: ReactNode;
  variant?: 'default' | 'secondary' | 'ghost' | 'destructive';
  size?: 'sm' | 'default' | 'lg';
  className?: string;
};

export function TrackedButtonLink({
  href,
  eventName,
  children,
  variant = 'default',
  size = 'default',
  className
}: TrackedButtonLinkProps): JSX.Element {
  return (
    <Button
      asChild
      variant={variant}
      size={size}
      className={className}
      onClick={() => trackEvent(eventName)}
    >
      <Link href={href}>{children}</Link>
    </Button>
  );
}
