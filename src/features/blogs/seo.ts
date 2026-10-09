import type { BlogPost } from '@/features/blogs/types';
import {
  DEFAULT_BLOG_AUTHOR,
  resolveBlogAuthor
} from '@/features/blogs/author';
import { schemaTypeToSchemaOrgType } from '@/features/blogs/utils';

const SITE_URL = 'https://www.garixo.com';
const SITE_NAME = 'Garixo';
const SITE_LOGO = `${SITE_URL}/favicon/web-app-manifest-192x192.png`;
const DEFAULT_BLOG_IMAGE = `${SITE_URL}/images/og-image.png`;

export function resolveBlogImage(blog: BlogPost): string {
  const custom = blog.ogImage?.trim();
  return custom ? new URL(custom, SITE_URL).toString() : DEFAULT_BLOG_IMAGE;
}

export function buildBlogArticleSchema(
  blog: BlogPost
): Record<string, unknown> {
  const author = resolveBlogAuthor(blog);
  const canonicalPath = blog.canonical?.trim() || `/blog/${blog.slug}`;
  const pageUrl = new URL(canonicalPath, SITE_URL).toString();

  const schema: Record<string, unknown> = {
    '@context': 'https://schema.org',
    '@type': schemaTypeToSchemaOrgType(blog.schemaType),
    headline: blog.metaTitle || blog.title,
    description: blog.metaDescription || blog.excerpt,
    datePublished: blog.publishedAt ?? blog.updatedAt,
    dateModified: blog.updatedAt,
    author: {
      '@type': 'Person',
      name: author.name,
      url: author.profileUrl,
      jobTitle: author.role,
      description: author.bio
    },
    publisher: {
      '@type': 'Organization',
      name: SITE_NAME,
      url: SITE_URL,
      logo: {
        '@type': 'ImageObject',
        url: SITE_LOGO
      }
    },
    image: [resolveBlogImage(blog)],
    mainEntityOfPage: pageUrl,
    url: pageUrl
  };

  return schema;
}

export const BLOG_PUBLISHER = {
  name: SITE_NAME,
  url: SITE_URL,
  logoUrl: SITE_LOGO,
  authorUrl: DEFAULT_BLOG_AUTHOR.profileUrl
} as const;
