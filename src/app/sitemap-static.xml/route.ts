// This route generates the sitemap XML for static pages and case studies. It defines a list of static paths with their last modified dates, change frequencies, and priorities, and also includes URLs for case studies. The generated XML is returned as a response with appropriate headers for caching and content type.
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
  const staticPath = [
    {
      path: '/',
      lastmod: '2026-01-01T00:00:00Z',
      changefreq: 'monthly',
      priority: '1.0'
    },
    {
      path: '/features',
      lastmod: '2026-01-10T00:00:00Z',
      changefreq: 'monthly',
      priority: '0.9'
    },
    {
      path: '/about',
      lastmod: '2026-08-09T00:00:00Z',
      changefreq: 'monthly',
      priority: '0.9'
    },
    {
      path: '/features/customers-management',
      lastmod: '2026-01-10T00:00:00Z',
      changefreq: 'monthly',
      priority: '0.9'
    },
    {
      path: '/features/staff-management',
      lastmod: '2026-01-11T00:00:00Z',
      changefreq: 'monthly',
      priority: '0.9'
    },
    {
      path: '/features/inventory-management',
      lastmod: '2026-01-12T00:00:00Z',
      changefreq: 'monthly',
      priority: '0.9'
    },
    {
      path: '/features/work-orders-management',
      lastmod: '2026-01-13T00:00:00Z',
      changefreq: 'monthly',
      priority: '0.9'
    },
    {
      path: '/pricing',
      lastmod: '2026-01-20T00:00:00Z',
      changefreq: 'monthly',
      priority: '0.9'
    },
    {
      path: '/about',
      lastmod: '2026-08-09T00:00:00Z',
      changefreq: 'monthly',
      priority: '0.7'
    },
    {
      path: '/case-studies',
      lastmod: '2026-01-25T00:00:00Z',
      changefreq: 'monthly',
      priority: '0.8'
    },
    {
      path: '/blog',
      lastmod: '2026-03-01T00:00:00Z',
      changefreq: 'weekly',
      priority: '0.8'
    },
    {
      path: '/solutions/garage-management-software-for-tire-shops',
      lastmod: '2026-03-14T20:06:00Z',
      changefreq: 'weekly',
      priority: '0.8'
    },
    {
      path: '/solutions/garage-management-software-for-auto-body-shops',
      lastmod: '2026-03-14T20:07:00Z',
      changefreq: 'weekly',
      priority: '0.8'
    },
    {
      path: '/solutions/garage-management-software-for-mobile-mechanics',
      lastmod: '2026-03-14T20:09:00Z',
      changefreq: 'weekly',
      priority: '0.8'
    },
    {
      path: '/solutions/garage-management-software-for-dealerships',
      lastmod: '2026-03-14T20:08:00Z',
      changefreq: 'weekly',
      priority: '0.8'
    },
    {
      path: '/tools/auto-repair-labor-rate-calculator',
      lastmod: '2026-03-15T07:12:00Z',
      changefreq: 'weekly',
      priority: '0.8'
    },
    {
      path: '/tools/auto-repair-shop-profit-calculator',
      lastmod: '2026-03-15T09:20:00Z',
      changefreq: 'weekly',
      priority: '0.8'
    }
  ];

  const staticUrls = staticPath.map((path) => ({
    loc: toAbsoluteUrl(path.path),
    lastmod: path.lastmod,
    changefreq: path.changefreq,
    priority: path.priority
  }));

  const caseStudyUrls = caseStudies.map((study) => ({
    loc: toAbsoluteUrl(`/case-studies/${study.slug}`),
    lastmod: '2026-02-03T00:00:00Z',
    changefreq: 'monthly',
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
