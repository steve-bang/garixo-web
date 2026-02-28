import { toAbsoluteUrl } from '@/services/seo/sitemap';

const PROVIDER_ENDPOINTS = [
  'https://www.google.com/ping?sitemap=',
  'https://www.bing.com/ping?sitemap='
] as const;

const REQUEST_TIMEOUT_MS = 2500;

function withTimeout(url: string, timeoutMs: number): Promise<Response> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

  return fetch(url, {
    method: 'GET',
    signal: controller.signal,
    cache: 'no-store'
  }).finally(() => {
    clearTimeout(timeoutId);
  });
}

/**
 * Best-effort sitemap ping after blog publish events.
 *
 * Notes:
 * - This is intentionally non-blocking for write APIs.
 * - Errors are swallowed to avoid impacting admin publish UX.
 * - Calls are skipped outside production to avoid noisy requests during dev.
 */
export async function notifySearchEnginesBlogUpdated(): Promise<void> {
  if (process.env.NODE_ENV !== 'production') {
    return;
  }

  const sitemapUrl = encodeURIComponent(toAbsoluteUrl('/sitemap-blog.xml'));

  await Promise.allSettled(
    PROVIDER_ENDPOINTS.map(async (endpoint) => {
      const target = `${endpoint}${sitemapUrl}`;
      const response = await withTimeout(target, REQUEST_TIMEOUT_MS);

      if (!response.ok) {
        throw new Error(`Sitemap ping failed: ${response.status}`);
      }
    })
  ).catch(() => {
    // Intentionally swallow errors; publishing must not fail because of ping errors.
  });
}
