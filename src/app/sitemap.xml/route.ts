import {
  toAbsoluteUrl,
  toSitemapIsoDate,
  xmlEscape
} from '@/services/seo/sitemap';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

function buildSitemapIndexXml(urls: string[]): string {
  const now = toSitemapIsoDate(new Date());

  const body = urls
    .map(
      (loc) =>
        `\n  <sitemap>\n    <loc>${xmlEscape(loc)}</loc>\n    <lastmod>${now}</lastmod>\n  </sitemap>`
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
