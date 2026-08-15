// This route generates the sitemap index XML, which references other sitemap files (e.g., static pages, blog posts).
import { toAbsoluteUrl, xmlEscape } from '@/services/seo/sitemap';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

function buildSitemapIndexXml(urls: string[]): string {
  // lastmod is intentionally omitted: it's optional per the sitemap protocol, and
  // a single fixed date across both child sitemaps would misrepresent freshness
  // (the blog sitemap changes far more often than the static one).
  const body = urls
    .map(
      (loc) => `\n  <sitemap>\n    <loc>${xmlEscape(loc)}</loc>\n  </sitemap>`
    )
    .join('');

  return `<?xml version="1.0" encoding="UTF-8"?>\n<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${body}\n</sitemapindex>`;
}

export async function GET(): Promise<Response> {
  const xml = buildSitemapIndexXml([
    toAbsoluteUrl('/sitemap-static.xml'),
    toAbsoluteUrl('/sitemap-blog.xml')
  ]);

  return new Response(xml, {
    headers: {
      'Content-Type': 'application/xml; charset=utf-8',
      'Cache-Control': 'public, s-maxage=900, stale-while-revalidate=86400'
    }
  });
}
