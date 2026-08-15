import fs from 'node:fs';
import path from 'node:path';

import matter from 'gray-matter';

import type {
  BlogCategory,
  BlogCtaBlock,
  BlogFaqItem,
  BlogPost,
  BlogPostSitemapEntry,
  BlogSchemaType,
  BlogStatus,
  BlogTag
} from '@/features/blogs/types';
import { resolveEffectiveStatus, slugify } from '@/features/blogs/utils';

const BLOG_CONTENT_DIR = path.join(process.cwd(), 'public', 'blog');

type BlogFrontmatter = {
  title?: string;
  slug?: string;
  excerpt?: string;
  metaTitle?: string;
  metaDescription?: string;
  focusKeyword?: string;
  secondaryKeywords?: string[];
  category?: string;
  tags?: string[];
  status?: BlogStatus;
  schemaType?: BlogSchemaType;
  ogTitle?: string;
  ogDescription?: string;
  ogImage?: string;
  canonical?: string;
  isIndexed?: boolean;
  faqItems?: BlogFaqItem[];
  ctaBlock?: BlogCtaBlock | null;
  readingTime?: number;
  createdAt?: string;
  updatedAt?: string;
  publishedAt?: string | null;
  scheduledAt?: string | null;
  authorId?: string;
  authorName?: string;
};

/**
 * Parsed posts are cached for the lifetime of the server process. Content
 * only changes via a new deploy (git-based authoring), which always starts
 * a fresh process, so this cache never goes stale in production. Status
 * filtering (resolveEffectiveStatus) is intentionally NOT cached here — it
 * is re-evaluated on every call so `scheduled` posts still flip to visible
 * once `scheduledAt` passes, without needing a rebuild.
 */
let cachedPosts: BlogPost[] | null = null;

function parseBlogFile(filePath: string): BlogPost {
  const raw = fs.readFileSync(filePath, 'utf8');
  const { data, content } = matter(raw);
  const fm = data as BlogFrontmatter;
  const slug = fm.slug?.trim() || path.basename(filePath, '.md');
  const now = new Date().toISOString();
  const createdAt = fm.createdAt ?? now;

  return {
    id: slug,
    title: fm.title ?? '',
    slug,
    excerpt: fm.excerpt ?? '',
    content: content.trim(),
    metaTitle: fm.metaTitle || fm.title || '',
    metaDescription: fm.metaDescription || fm.excerpt || '',
    focusKeyword: fm.focusKeyword ?? '',
    secondaryKeywords: fm.secondaryKeywords ?? [],
    category: fm.category?.trim() || 'General',
    tags: fm.tags ?? [],
    status: fm.status ?? 'draft',
    schemaType: fm.schemaType ?? 'BlogPosting',
    ogTitle: fm.ogTitle || fm.title || '',
    ogDescription: fm.ogDescription || fm.excerpt || '',
    ogImage: fm.ogImage ?? '',
    canonical: fm.canonical ?? '',
    isIndexed: fm.isIndexed ?? true,
    faqItems: fm.faqItems ?? [],
    ctaBlock: fm.ctaBlock ?? null,
    readingTime: fm.readingTime ?? 1,
    createdAt,
    updatedAt: fm.updatedAt ?? createdAt,
    publishedAt: fm.publishedAt ?? null,
    scheduledAt: fm.scheduledAt ?? null,
    authorId: fm.authorId ?? '',
    authorName: fm.authorName ?? ''
  };
}

function loadAllPosts(): BlogPost[] {
  if (cachedPosts) {
    return cachedPosts;
  }

  if (!fs.existsSync(BLOG_CONTENT_DIR)) {
    cachedPosts = [];
    return cachedPosts;
  }

  const files = fs
    .readdirSync(BLOG_CONTENT_DIR)
    .filter((file) => file.endsWith('.md'));

  cachedPosts = files.map((file) =>
    parseBlogFile(path.join(BLOG_CONTENT_DIR, file))
  );

  return cachedPosts;
}

function sortByPublishedDesc(posts: BlogPost[]): BlogPost[] {
  return [...posts].sort(
    (a, b) =>
      new Date(b.publishedAt ?? b.updatedAt).getTime() -
      new Date(a.publishedAt ?? a.updatedAt).getTime()
  );
}

export function listPublishedBlogs(): BlogPost[] {
  const published = loadAllPosts().filter(
    (post) =>
      resolveEffectiveStatus(post.status, post.scheduledAt) === 'published'
  );
  return sortByPublishedDesc(published);
}

export function findBlogBySlug(slug: string): BlogPost | null {
  const post = loadAllPosts().find((item) => item.slug === slug);
  return post ?? null;
}

export function listBlogCategories(): BlogCategory[] {
  const now = new Date().toISOString();
  const bySlug = new Map<string, { name: string; postCount: number }>();

  for (const post of listPublishedBlogs()) {
    const slug = slugify(post.category);
    if (!slug) {
      continue;
    }
    const existing = bySlug.get(slug);
    if (existing) {
      existing.postCount += 1;
    } else {
      bySlug.set(slug, { name: post.category, postCount: 1 });
    }
  }

  return Array.from(bySlug.entries())
    .map(([slug, { name, postCount }]) => ({
      id: slug,
      name,
      slug,
      postCount,
      createdAt: now,
      updatedAt: now
    }))
    .sort((a, b) => a.name.localeCompare(b.name));
}

export function listBlogTags(): BlogTag[] {
  const now = new Date().toISOString();
  const bySlug = new Map<string, { name: string; postCount: number }>();

  for (const post of listPublishedBlogs()) {
    for (const tag of post.tags) {
      const slug = slugify(tag);
      if (!slug) {
        continue;
      }
      const existing = bySlug.get(slug);
      if (existing) {
        existing.postCount += 1;
      } else {
        bySlug.set(slug, { name: tag, postCount: 1 });
      }
    }
  }

  return Array.from(bySlug.entries())
    .map(([slug, { name, postCount }]) => ({
      id: slug,
      name,
      slug,
      postCount,
      createdAt: now,
      updatedAt: now
    }))
    .sort((a, b) => a.name.localeCompare(b.name));
}

export function listPublishedIndexedBlogSitemapEntries(options?: {
  maxUrls?: number;
}): BlogPostSitemapEntry[] {
  const entries = listPublishedBlogs()
    .filter((post) => post.isIndexed)
    .map((post) => ({ slug: post.slug, lastModified: post.updatedAt }));

  return options?.maxUrls ? entries.slice(0, options.maxUrls) : entries;
}
