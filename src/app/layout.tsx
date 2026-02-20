import type { Metadata } from 'next';
import type { ReactNode } from 'react';

import { appConfig } from '@/config/app';
import { AppProviders } from '@/components/providers/app-providers';

import './globals.css';

export const metadata: Metadata = {
  title: appConfig.appName,
  description: appConfig.appDescription
};

export default function RootLayout({ children }: { children: ReactNode }): JSX.Element {
  return (
    <html lang="en">
      <body>
        <AppProviders>{children}</AppProviders>
      </body>
    </html>
  );
}
