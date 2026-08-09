import type { Blog } from '@/features/blogs/types';
import {
  DEFAULT_BLOG_AUTHOR,
  resolveBlogAuthor
} from '@/features/blogs/author';
import { schemaTypeToSchemaOrgType } from '@/features/blogs/utils';

const SITE_URL = 'https://www.garixo.com';
const SITE_NAME = 'Garixo';
const SITE_LOGO = `${SITE_URL}/favicon/favicon.svg`;

export function buildBlogArticleSchema(blog: Blog): Record<string, unknown> {
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
    mainEntityOfPage: pageUrl,
    url: pageUrl
  };

  if (blog.ogImage) {
    schema.image = [blog.ogImage];
  }

  return schema;
}

export const BLOG_PUBLISHER = {
  name: SITE_NAME,
  url: SITE_URL,
  logoUrl: SITE_LOGO,
  authorUrl: DEFAULT_BLOG_AUTHOR.profileUrl
} as const;
