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
import {
  countPostsByTag,
  isIndexableTagCount,
  slugMatches
} from '@/features/blogs/utils';
import {
  buildUrlsetXml,
  latestSitemapDate,
  toAbsoluteUrl,
  type SitemapUrl
} from '@/services/seo/sitemap';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

// lastmod uses each post's own date (updatedAt, falling back to publishedAt);
// category and tag pages use the latest date among their posts. Tags below
// MIN_INDEXABLE_TAG_POSTS are noindex on the page and skipped here.
function latestPostDate(
  posts: Array<{ updatedAt?: string; publishedAt?: string | null }>
): string | null {
  return latestSitemapDate(
    posts.map((post) => post.updatedAt || post.publishedAt)
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
    const tagPostCounts = countPostsByTag(publishedPosts);

    const postUrls: SitemapUrl[] = postEntries.map((entry) => ({
      loc: toAbsoluteUrl(`/blog/${entry.slug}`),
      lastmod: entry.lastModified
    }));

    const categoryUrls: SitemapUrl[] = categories.flatMap((category) => {
      const matchingPosts = indexedPosts.filter((post) =>
        slugMatches(post.category, category.slug)
      );
      return matchingPosts.length === 0
        ? []
        : [
            {
              loc: toAbsoluteUrl(`/blog/category/${category.slug}`),
              lastmod: latestPostDate(matchingPosts)
            }
          ];
    });

    const tagUrls: SitemapUrl[] = tags.flatMap((tag) => {
      if (!isIndexableTagCount(tagPostCounts.get(tag.slug) ?? 0)) {
        return [];
      }
      const matchingPosts = indexedPosts.filter((post) =>
        post.tags.some((postTag) => slugMatches(postTag, tag.slug))
      );
      return matchingPosts.length === 0
        ? []
        : [
            {
              loc: toAbsoluteUrl(`/blog/tag/${tag.slug}`),
              lastmod: latestPostDate(matchingPosts)
            }
          ];
    });

    const xml = buildUrlsetXml([...postUrls, ...categoryUrls, ...tagUrls]);

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
