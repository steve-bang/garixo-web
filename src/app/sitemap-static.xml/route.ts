import { caseStudies } from '@/lib/caseStudies';
import {
  toAbsoluteUrl,
  toSitemapIsoDate,
  xmlEscape
} from '@/services/seo/sitemap';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

function buildXmlUrlset(
  urls: Array<{
    loc: string;
    lastmod?: string;
    changefreq?: string;
    priority?: string;
  }>
): string {
  const body = urls
    .map(
      (item) =>
        `\n  <url>\n    <loc>${xmlEscape(item.loc)}</loc>\n    <lastmod>${toSitemapIsoDate(item.lastmod)}</lastmod>${
          item.changefreq
            ? `\n    <changefreq>${item.changefreq}</changefreq>`
            : ''
        }${item.priority ? `\n    <priority>${item.priority}</priority>` : ''}\n  </url>`
    )
    .join('');

  return `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${body}\n</urlset>`;
}

export async function GET(): Promise<Response> {
  const nowIso = new Date().toISOString();

  const staticPaths = [
    '/',
    '/features',
    '/features/customers-management',
    '/features/staff-management',
    '/features/inventory-management',
    '/features/work-orders-management',
    '/pricing',
    '/book-demo',
    '/case-studies',
    '/blog'
  ];

  const staticUrls = staticPaths.map((path) => ({
    loc: toAbsoluteUrl(path),
    lastmod: nowIso,
    changefreq: 'weekly',
    priority:
      path === '/'
        ? '1.0'
        : path === '/pricing' || path === '/features'
          ? '0.9'
          : '0.8'
  }));

  const caseStudyUrls = caseStudies.map((study) => ({
    loc: toAbsoluteUrl(`/case-studies/${study.slug}`),
    lastmod: nowIso,
    changefreq: 'weekly',
    priority: '0.7'
  }));

  const xml = buildXmlUrlset([...staticUrls, ...caseStudyUrls]);

  return new Response(xml, {
    headers: {
      'Content-Type': 'application/xml; charset=utf-8',
      'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=86400'
    }
  });
}
