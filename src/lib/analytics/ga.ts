export type GaEventParams = Record<
  string,
  string | number | boolean | undefined
>;

declare global {
  interface Window {
    dataLayer: unknown[];
    gtag: (
      command: 'config' | 'event',
      targetId: string,
      config?: Record<string, unknown>
    ) => void;
  }
}

export function isGaReady(): boolean {
  return typeof window !== 'undefined' && typeof window.gtag === 'function';
}

export function trackPageView(pagePath: string, measurementId: string): void {
  if (!measurementId || !isGaReady()) {
    return;
  }

  window.gtag('config', measurementId, {
    page_path: pagePath,
    page_location: window.location.href,
    page_title: document.title
  });
}

export function trackEvent(name: string, params: GaEventParams = {}): void {
  if (!isGaReady()) {
    return;
  }

  window.gtag('event', name, params as Record<string, unknown>);
}
