// This route generates the sitemap XML for static pages and case studies. Static page
// dates come from STATIC_PAGE_LASTMOD, /blog from the latest published post, and
// case studies have no date source so they carry no <lastmod>. changefreq and
// priority are intentionally not emitted (Google ignores them).
import { caseStudies } from '@/lib/caseStudies';
import { listPublishedBlogs } from '@/services/blog-content/blog-fs';
import {
  STATIC_PAGE_LASTMOD,
  buildUrlsetXml,
  latestSitemapDate,
  toAbsoluteUrl
} from '@/services/seo/sitemap';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const STATIC_PATHS = [
  '/',
  '/features',
  '/about',
  '/features/customers-management',
  '/features/staff-management',
  '/features/inventory-management',
  '/features/work-orders-management',
  '/pricing',
  '/case-studies',
  '/blog',
  '/solutions/garage-management-software-for-tire-shops',
  '/solutions/garage-management-software-for-auto-body-shops',
  '/solutions/garage-management-software-for-mobile-mechanics',
  '/solutions/garage-management-software-for-dealerships',
  '/tools/auto-repair-labor-rate-calculator',
  '/tools/auto-repair-shop-profit-calculator',
  '/privacy-policy',
  '/terms-of-service'
] as const;

export async function GET(): Promise<Response> {
  const blogLastmod = latestSitemapDate(
    listPublishedBlogs().map((post) => post.updatedAt || post.publishedAt)
  );

  const staticUrls = STATIC_PATHS.map((path) => ({
    loc: toAbsoluteUrl(path),
    lastmod: path === '/blog' ? blogLastmod : STATIC_PAGE_LASTMOD[path]
  }));

  const caseStudyUrls = caseStudies.map((study) => ({
    loc: toAbsoluteUrl(`/case-studies/${study.slug}`)
  }));

  const xml = buildUrlsetXml([...staticUrls, ...caseStudyUrls]);

  return new Response(xml, {
    headers: {
      'Content-Type': 'application/xml; charset=utf-8',
      'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=86400'
    }
  });
}
