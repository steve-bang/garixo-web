// This route generates the sitemap XML for blog posts, plus the blog category
// and tag taxonomy pages. It queries the database for published blog entries
// and constructs an XML sitemap that search engines can use to discover and
// index the blog content.
import {
  listBlogCategories,
  listBlogTags,
  listPublishedBlogs,
  listPublishedIndexedBlogSitemapEntries
} from '@/services/blog-content/blog-fs';
import { slugMatches } from '@/features/blogs/utils';
import {
  toAbsoluteUrl,
  toSitemapIsoDate,
  xmlEscape
} from '@/services/seo/sitemap';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

type SitemapEntry = {
  path: string;
  lastModified: string;
  priority: string;
};

function buildBlogSitemapXml(entries: SitemapEntry[]): string {
  const body = entries
    .map(
      (entry) =>
        `\n  <url>\n    <loc>${xmlEscape(toAbsoluteUrl(entry.path))}</loc>\n    <lastmod>${toSitemapIsoDate(entry.lastModified)}</lastmod>\n    <changefreq>weekly</changefreq>\n    <priority>${entry.priority}</priority>\n  </url>`
    )
    .join('');

  return `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${body}\n</urlset>`;
}

function latestUpdatedAt(posts: Array<{ updatedAt: string }>): string {
  return posts.reduce(
    (latest, post) => (post.updatedAt > latest ? post.updatedAt : latest),
    posts[0].updatedAt
  );
}

export async function GET(): Promise<Response> {
  try {
    const [postEntries, categories, tags, publishedPosts] = await Promise.all([
      listPublishedIndexedBlogSitemapEntries({ maxUrls: 50000 }),
      listBlogCategories(),
      listBlogTags(),
      listPublishedBlogs()
    ]);

    const indexedPosts = publishedPosts.filter((post) => post.isIndexed);

    const postSitemapEntries: SitemapEntry[] = postEntries.map((entry) => ({
      path: `/blog/${entry.slug}`,
      lastModified: entry.lastModified,
      priority: '0.8'
    }));

    const categorySitemapEntries: SitemapEntry[] = categories
      .map((category) => {
        const matchingPosts = indexedPosts.filter((post) =>
          slugMatches(post.category, category.slug)
        );
        if (matchingPosts.length === 0) {
          return null;
        }
        return {
          path: `/blog/category/${category.slug}`,
          lastModified: latestUpdatedAt(matchingPosts),
          priority: '0.6'
        };
      })
      .filter((entry): entry is SitemapEntry => entry !== null);

    const tagSitemapEntries: SitemapEntry[] = tags
      .map((tag) => {
        const matchingPosts = indexedPosts.filter((post) =>
          post.tags.some((postTag) => slugMatches(postTag, tag.slug))
        );
        if (matchingPosts.length === 0) {
          return null;
        }
        return {
          path: `/blog/tag/${tag.slug}`,
          lastModified: latestUpdatedAt(matchingPosts),
          priority: '0.5'
        };
      })
      .filter((entry): entry is SitemapEntry => entry !== null);

    const xml = buildBlogSitemapXml([
      ...postSitemapEntries,
      ...categorySitemapEntries,
      ...tagSitemapEntries
    ]);

    return new Response(xml, {
      headers: {
        'Content-Type': 'application/xml; charset=utf-8',
        'Cache-Control': 'public, s-maxage=900, stale-while-revalidate=86400'
      }
    });
  } catch (error) {
    if (process.env.NODE_ENV !== 'production') {
      console.error('[sitemap-blog.xml] failed to build sitemap', error);
      return new Response('Sitemap generation failed. Check server logs.', {
        status: 500,
        headers: {
          'Content-Type': 'text/plain; charset=utf-8',
          'Cache-Control': 'no-store'
        }
      });
    }

    const fallback = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n</urlset>`;

    return new Response(fallback, {
      status: 200,
      headers: {
        'Content-Type': 'application/xml; charset=utf-8',
        'Cache-Control': 'public, s-maxage=300, stale-while-revalidate=3600'
      }
    });
  }
}
