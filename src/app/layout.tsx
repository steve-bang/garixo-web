import type { Metadata } from 'next';
import { Suspense, type ReactNode } from 'react';

import { GoogleAnalytics } from '@/components/analytics/google-analytics';
import { GoogleAnalyticsPageview } from '@/components/analytics/google-analytics-pageview';
import { appConfig } from '@/config/app';
import { AppProviders } from '@/components/providers/app-providers';
import { WebsiteStructuredData } from '@/components/SEO/WebsiteStructuredData';

import './globals.css';

export const metadata: Metadata = {
  metadataBase: new URL('https://www.garixo.com'),
  title: appConfig.appName,
  description: appConfig.appDescription
};

export default function RootLayout({
  children
}: {
  children: ReactNode;
}): JSX.Element {
  return (
    <html lang="en">
      <body>
        <WebsiteStructuredData />
        <GoogleAnalytics />
        <Suspense fallback={null}>
          <GoogleAnalyticsPageview />
        </Suspense>
        <AppProviders>{children}</AppProviders>
      </body>
    </html>
  );
}
