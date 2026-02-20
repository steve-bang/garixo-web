import type { ReactNode } from 'react';

export function PublicLayoutShell({ children }: { children: ReactNode }): JSX.Element {
  return (
    <main className="grid min-h-screen place-items-center bg-background-secondary">
      <div className="w-full max-w-full">{children}</div>
    </main>
  );
}
