import type {
  Blog,
  BlogListItem,
  BlogSchemaType,
  BlogSeoScoreItem,
  BlogStatus
} from '@/features/blogs/types';
import { marked } from 'marked';

const DANGEROUS_TAG_PATTERN =
  /<(script|style|iframe|object|embed)[\s\S]*?>[\s\S]*?<\/\1>/gi;
const EVENT_HANDLER_ATTR_PATTERN = /\son[a-z]+\s*=\s*(["']).*?\1/gi;
const JAVASCRIPT_URL_PATTERN = /javascript:/gi;
const HTML_TAG_PATTERN = /<[^>]+>/g;

export function slugify(value: string): string {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');
}

export function slugMatches(value: string, targetSlug: string): boolean {
  return slugify(value) === targetSlug;
}

/**
 * Tags with fewer published posts than this are thin pages: they stay
 * reachable (HTTP 200, canonical) but are `noindex` and left out of the sitemap.
 */
export const MIN_INDEXABLE_TAG_POSTS = 3;

/** Counts posts per tag slug (one count per post, even if a tag repeats). */
export function countPostsByTag(
  posts: ReadonlyArray<{ tags: readonly string[] }>
): Map<string, number> {
  const counts = new Map<string, number>();
  for (const post of posts) {
    const slugs = new Set(post.tags.map(slugify).filter(Boolean));
    for (const slug of slugs) {
      counts.set(slug, (counts.get(slug) ?? 0) + 1);
    }
  }
  return counts;
}

export function isIndexableTagCount(postCount: number): boolean {
  return postCount >= MIN_INDEXABLE_TAG_POSTS;
}

export function sanitizeRichHtml(value: string): string {
  return value
    .replace(DANGEROUS_TAG_PATTERN, '')
    .replace(EVENT_HANDLER_ATTR_PATTERN, '')
    .replace(JAVASCRIPT_URL_PATTERN, '')
    .trim();
}

export function markdownToHtml(value: string): string {
  const markdown = value.trim();
  if (!markdown) {
    return '<p></p>';
  }

  const parsed = marked.parse(markdown, {
    gfm: true,
    breaks: true
  });

  return typeof parsed === 'string' ? parsed : '<p></p>';
}

export function htmlToPlainText(value: string): string {
  return value
    .replace(/<br\s*\/?>/gi, '\n')
    .replace(/<\/p>/gi, '\n')
    .replace(HTML_TAG_PATTERN, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

export function countWords(value: string): number {
  if (!value.trim()) {
    return 0;
  }

  return value.trim().split(/\s+/).length;
}

export function estimateReadingTime(words: number): number {
  if (words <= 0) {
    return 1;
  }

  return Math.max(1, Math.ceil(words / 220));
}

export function resolveEffectiveStatus(
  status: BlogStatus,
  scheduledAt: string | null
): BlogStatus {
  if (status !== 'scheduled' || !scheduledAt) {
    return status;
  }

  const scheduled = new Date(scheduledAt).getTime();
  if (Number.isNaN(scheduled)) {
    return status;
  }

  return scheduled <= Date.now() ? 'published' : 'scheduled';
}

export function getSeoChecks(input: {
  title: string;
  metaTitle: string;
  metaDescription: string;
  focusKeyword: string;
  contentText: string;
  hasH2: boolean;
  hasInternalLink: boolean;
}): BlogSeoScoreItem[] {
  const keyword = input.focusKeyword.trim().toLowerCase();
  const content = input.contentText.toLowerCase();

  return [
    {
      label: 'Title length is 30-60 characters',
      passed: input.metaTitle.length >= 30 && input.metaTitle.length <= 60
    },
    {
      label: 'Meta description length is 120-155 characters',
      passed:
        input.metaDescription.length >= 120 &&
        input.metaDescription.length <= 155
    },
    {
      label: 'Focus keyword is present in title',
      passed: input.title.toLowerCase().includes(keyword)
    },
    {
      label: 'Focus keyword appears in content',
      passed: keyword.length > 1 && content.includes(keyword)
    },
    {
      label: 'Content has at least one H2 section',
      passed: input.hasH2
    },
    {
      label: 'Content includes at least one internal link',
      passed: input.hasInternalLink
    }
  ];
}

export function calculateSeoScore(checks: BlogSeoScoreItem[]): number {
  if (checks.length === 0) {
    return 0;
  }

  const passed = checks.filter((check) => check.passed).length;
  return Math.round((passed / checks.length) * 100);
}

export function formatBlogStatusLabel(status: BlogStatus): string {
  if (status === 'draft') return 'Draft';
  if (status === 'scheduled') return 'Scheduled';
  if (status === 'published') return 'Published';
  return 'Archived';
}

export function toBlogListItem(blog: Blog): BlogListItem {
  return {
    id: blog.id,
    title: blog.title,
    slug: blog.slug,
    excerpt: blog.excerpt,
    status: blog.status,
    category: blog.category,
    seoScore: blog.seoScore,
    views: blog.views,
    updatedAt: blog.updatedAt,
    publishedAt: blog.publishedAt,
    scheduledAt: blog.scheduledAt,
    readingTime: blog.readingTime
  };
}

export function schemaTypeToSchemaOrgType(value: BlogSchemaType): string {
  if (value === 'Article') return 'Article';
  if (value === 'HowTo') return 'HowTo';
  if (value === 'FAQ') return 'FAQPage';
  return 'BlogPosting';
}
