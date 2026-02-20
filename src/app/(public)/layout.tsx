import type { ReactNode } from 'react';

import { PublicLayoutShell } from '@/components/layout/public-layout-shell';

export default function PublicLayout({ children }: { children: ReactNode }): JSX.Element {
  return <PublicLayoutShell>{children}</PublicLayoutShell>;
}
