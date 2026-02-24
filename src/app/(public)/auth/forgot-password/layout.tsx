import type { ReactNode } from 'react';

export default function FotgotPasswordLayout({
  children
}: {
  children: ReactNode;
}): JSX.Element {
  return (
    <main className="grid min-h-screen place-items-center bg-background-secondary px-s4 sm:px-s6 md:px-0">
      <div className="w-full max-w-md">{children}</div>
    </main>
  );
}
