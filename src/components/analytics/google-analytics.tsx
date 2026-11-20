import Script from 'next/script';

const GA_SCRIPT_ID = 'garixo-ga-script';
const GA_CONFIG_ID = 'garixo-ga-config';

/**
 * Loads Google Analytics (GA4) script when measurement id is configured.
 * Script is disabled in non-production builds to keep local/dev traffic clean.
 */
export function GoogleAnalytics({
  measurementId
}: {
  measurementId: string | undefined;
}): JSX.Element | null {
  if (!measurementId) {
    return null;
  }

  return (
    <>
      <Script
        id={GA_SCRIPT_ID}
        src={`https://www.googletagmanager.com/gtag/js?id=${measurementId}`}
        strategy="afterInteractive"
      />
      <Script id={GA_CONFIG_ID} strategy="afterInteractive">
        {`
          window.dataLayer = window.dataLayer || [];
          function gtag(){dataLayer.push(arguments);}
          window.gtag = gtag;
          gtag('js', new Date());
          gtag('config', '${measurementId}', {
            anonymize_ip: true,
            send_page_view: false
          });
        `}
      </Script>
    </>
  );
}
