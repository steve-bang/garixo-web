import type {
  ISODateString,
  PaginatedResponse,
  PaginationMeta
} from '@/types/primitives';

export const BLOG_STATUS_VALUES = [
  'draft',
  'scheduled',
  'published',
  'archived'
] as const;

export type BlogStatus = (typeof BLOG_STATUS_VALUES)[number];

export const BLOG_SCHEMA_TYPE_VALUES = [
  'Article',
  'BlogPosting',
  'HowTo',
  'FAQ'
] as const;

export type BlogSchemaType = (typeof BLOG_SCHEMA_TYPE_VALUES)[number];

export type BlogContentType = 'html';

export interface BlogContentDocument {
  type: BlogContentType;
  html: string;
  markdown: string | null;
}

export interface BlogFaqItem {
  question: string;
  answer: string;
}

export interface BlogCtaBlock {
  title: string;
  description: string;
  ctaLabel: string;
  ctaHref: string;
}

export interface Blog {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  content: BlogContentDocument;
  contentText: string;
  metaTitle: string;
  metaDescription: string;
  focusKeyword: string;
  secondaryKeywords: string[];
  category: string;
  tags: string[];
  status: BlogStatus;
  schemaType: BlogSchemaType;
  ogTitle: string;
  ogDescription: string;
  ogImage: string;
  canonical: string;
  isIndexed: boolean;
  faqItems: BlogFaqItem[];
  ctaBlock: BlogCtaBlock | null;
  seoScore: number;
  views: number;
  readingTime: number;
  createdAt: ISODateString;
  updatedAt: ISODateString;
  publishedAt: ISODateString | null;
  scheduledAt: ISODateString | null;
  authorId: string;
  authorName: string;
}

export interface BlogListItem {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  status: BlogStatus;
  category: string;
  seoScore: number;
  views: number;
  updatedAt: ISODateString;
  publishedAt: ISODateString | null;
  scheduledAt: ISODateString | null;
  readingTime: number;
}

export type BlogListMeta = PaginationMeta;

export type BlogListResponse = PaginatedResponse<BlogListItem>;

export interface BlogListQuery {
  search?: string;
  status?: BlogStatus;
  category?: string;
  page?: number;
  pageSize?: number;
}

export interface BlogCategory {
  id: string;
  name: string;
  slug: string;
  postCount: number;
  createdAt: ISODateString;
  updatedAt: ISODateString;
}

export interface BlogTag {
  id: string;
  name: string;
  slug: string;
  postCount: number;
  createdAt: ISODateString;
  updatedAt: ISODateString;
}

export type BlogSeoScoreItem = {
  label: string;
  passed: boolean;
};

/**
 * File-backed blog post (source of truth: public/blog/<slug>.md).
 * Content is plain Markdown only — no HTML/CKEditor authoring path.
 * Distinct from `Blog` (the legacy Firestore/CMS shape) so the admin
 * CMS can keep compiling unchanged until it is retired.
 */
export interface BlogPost {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  metaTitle: string;
  metaDescription: string;
  focusKeyword: string;
  secondaryKeywords: string[];
  category: string;
  tags: string[];
  status: BlogStatus;
  schemaType: BlogSchemaType;
  ogTitle: string;
  ogDescription: string;
  ogImage: string;
  canonical: string;
  isIndexed: boolean;
  faqItems: BlogFaqItem[];
  ctaBlock: BlogCtaBlock | null;
  readingTime: number;
  createdAt: ISODateString;
  updatedAt: ISODateString;
  publishedAt: ISODateString | null;
  scheduledAt: ISODateString | null;
  authorId: string;
  authorName: string;
}

export type BlogPostSitemapEntry = {
  slug: string;
  lastModified: string;
};
