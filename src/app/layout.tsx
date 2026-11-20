import type { Metadata } from 'next';
import { Suspense, type ReactNode } from 'react';

import { GoogleAnalytics } from '@/components/analytics/google-analytics';
import { GoogleAnalyticsPageview } from '@/components/analytics/google-analytics-pageview';
import { appConfig } from '@/config/app';
import { WebsiteStructuredData } from '@/components/SEO/WebsiteStructuredData';

import './globals.css';

export const metadata: Metadata = {
  metadataBase: new URL('https://www.garixo.com'),
  title: appConfig.appName,
  description: appConfig.appDescription,
  manifest: '/favicon/site.webmanifest',
  icons: {
    icon: [
      { url: '/favicon/favicon-96x96.png', sizes: '96x96', type: 'image/png' }
    ],
    apple: [{ url: '/favicon/apple-touch-icon.png', sizes: '180x180' }]
  }
};

// GA4 is a server-only env var; it is rendered into the page here, not bundled.
function getGaMeasurementId(): string | undefined {
  return process.env.NODE_ENV === 'production' ? process.env.GA4 : undefined;
}

export default function RootLayout({
  children
}: {
  children: ReactNode;
}): JSX.Element {
  const gaMeasurementId = getGaMeasurementId();

  return (
    <html lang="en">
      <body>
        <WebsiteStructuredData />
        <GoogleAnalytics measurementId={gaMeasurementId} />
        {gaMeasurementId ? (
          <Suspense fallback={null}>
            <GoogleAnalyticsPageview measurementId={gaMeasurementId} />
          </Suspense>
        ) : null}
        {children}
      </body>
    </html>
  );
}
