const DEFAULT_SITE_URL = 'https://www.garixo.com';

export function getSiteBaseUrl(): string {
  const raw = process.env.NEXT_PUBLIC_SITE_URL?.trim() || DEFAULT_SITE_URL;
  return raw.endsWith('/') ? raw.slice(0, -1) : raw;
}

export function toAbsoluteUrl(path: string): string {
  const normalizedPath = path.startsWith('/') ? path : `/${path}`;
  return `${getSiteBaseUrl()}${normalizedPath}`;
}

/** Returns an ISO string, or null when the value is missing or not a valid date. */
export function toSitemapIsoDate(value?: string | Date | null): string | null {
  if (!value) {
    return null;
  }

  const date = value instanceof Date ? value : new Date(value);
  return Number.isNaN(date.getTime()) ? null : date.toISOString();
}

/** Latest valid date among the inputs, or null when none is valid. */
export function latestSitemapDate(
  values: ReadonlyArray<string | Date | null | undefined>
): string | null {
  let latest: string | null = null;
  for (const value of values) {
    const iso = toSitemapIsoDate(value);
    if (iso && (latest === null || iso > latest)) {
      latest = iso;
    }
  }
  return latest;
}

export type SitemapUrl = {
  loc: string;
  lastmod?: string | null;
};

/** `<lastmod>` is emitted only when the date is real; changefreq/priority are not emitted. */
export function buildUrlsetXml(urls: SitemapUrl[]): string {
  const body = urls
    .map((item) => {
      const lastmod = toSitemapIsoDate(item.lastmod);
      return `\n  <url>\n    <loc>${xmlEscape(item.loc)}</loc>${
        lastmod ? `\n    <lastmod>${lastmod}</lastmod>` : ''
      }\n  </url>`;
    })
    .join('');

  return `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${body}\n</urlset>`;
}

/**
 * Last-modified dates for static pages (path -> ISO date). Update an entry when
 * that page's content changes; never bump dates without a content change.
 *
 * Rule used: date of the last commit touching the page's own
 * `src/app/<route>/page.tsx` on origin/main
 * (`git log -1 --format=%cI -- <file>`), converted to a UTC calendar date.
 * Exception: /privacy-policy and /terms-of-service use the "Last updated"
 * date printed on the page itself. `/blog` is not listed because it is derived
 * from the latest blog post; case studies have no date source and get no lastmod.
 */
export const STATIC_PAGE_LASTMOD: Readonly<Record<string, string>> = {
  '/': '2026-08-15',
  '/features': '2026-08-15',
  '/about': '2026-08-15',
  '/features/customers-management': '2026-08-15',
  '/features/staff-management': '2026-08-15',
  '/features/inventory-management': '2026-08-15',
  '/features/work-orders-management': '2026-08-15',
  '/pricing': '2026-08-15',
  '/case-studies': '2026-10-09',
  '/solutions/garage-management-software-for-tire-shops': '2026-08-15',
  '/solutions/garage-management-software-for-auto-body-shops': '2026-08-15',
  '/solutions/garage-management-software-for-mobile-mechanics': '2026-08-15',
  '/solutions/garage-management-software-for-dealerships': '2026-08-15',
  '/tools/auto-repair-labor-rate-calculator': '2026-08-15',
  '/tools/auto-repair-shop-profit-calculator': '2026-08-15',
  '/privacy-policy': '2026-02-24',
  '/terms-of-service': '2026-02-24'
};

export function xmlEscape(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}
