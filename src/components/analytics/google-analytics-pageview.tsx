'use client';

import { usePathname, useSearchParams } from 'next/navigation';
import { useEffect } from 'react';

import { trackPageView } from '@/lib/analytics/ga';

/**
 * App Router pageview tracker.
 * Fires one GA page_view on every route/search change.
 */
export function GoogleAnalyticsPageview(): null {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  useEffect(() => {
    const query = searchParams.toString();
    const pagePath = query ? `${pathname}?${query}` : pathname;
    trackPageView(pagePath);
  }, [pathname, searchParams]);

  return null;
}
