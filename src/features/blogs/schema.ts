import { z } from 'zod';

import {
  BLOG_SCHEMA_TYPE_VALUES,
  BLOG_STATUS_VALUES
} from '@/features/blogs/types';

export const blogStatusSchema = z.enum(BLOG_STATUS_VALUES);
export const blogSchemaTypeSchema = z.enum(BLOG_SCHEMA_TYPE_VALUES);

export const blogFaqItemSchema = z.object({
  question: z.string().trim().min(1, 'Please enter a FAQ question.'),
  answer: z.string().trim().min(1, 'Please enter a FAQ answer.')
});

export const blogCtaBlockSchema = z.object({
  title: z.string().trim().min(1, 'Please enter a CTA title.'),
  description: z.string().trim().min(1, 'Please enter a CTA description.'),
  ctaLabel: z.string().trim().min(1, 'Please enter the CTA button text.'),
  ctaHref: z.string().trim().min(1, 'Please enter the CTA link.')
});

export const blogContentSchema = z.object({
  type: z.literal('html'),
  html: z.string().trim().min(1, 'Please add your article content.')
});

const createBlogShape = z.object({
  title: z.string().trim().min(10, 'Title should be at least 10 characters.'),
  slug: z.string().trim().min(3, 'Please enter a URL slug.'),
  excerpt: z
    .string()
    .trim()
    .min(20, 'Summary should be at least 20 characters.')
    .max(220, 'Summary should be 220 characters or fewer.'),
  content: blogContentSchema,
  metaTitle: z
    .string()
    .trim()
    .max(60, 'Meta title should be 60 characters or fewer.')
    .default(''),
  metaDescription: z
    .string()
    .trim()
    .max(155, 'Meta description should be 155 characters or fewer.')
    .default(''),
  focusKeyword: z.string().trim().default(''),
  secondaryKeywords: z.array(z.string().trim()).default([]),
  category: z.string().trim().default('General'),
  tags: z.array(z.string().trim()).default([]),
  status: blogStatusSchema.default('draft'),
  schemaType: blogSchemaTypeSchema.default('BlogPosting'),
  ogTitle: z.string().trim().default(''),
  ogDescription: z.string().trim().default(''),
  ogImage: z.string().trim().default(''),
  canonical: z.string().trim().default(''),
  isIndexed: z.boolean().default(true),
  faqItems: z.array(blogFaqItemSchema).default([]),
  ctaBlock: blogCtaBlockSchema.nullable().default(null),
  scheduledAt: z.string().datetime().nullable().default(null)
});

export const createBlogSchema = createBlogShape.superRefine((value, ctx) => {
  if (value.status === 'scheduled' && !value.scheduledAt) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      path: ['scheduledAt'],
      message: 'Please choose a publish date and time when scheduling.'
    });
  }
});

export const updateBlogSchema = createBlogShape
  .partial()
  .refine((value: Record<string, unknown>) => Object.keys(value).length > 0, {
    message: 'Please update at least one field before saving.'
  });

export const blogListQuerySchema = z.object({
  search: z.string().optional(),
  status: blogStatusSchema.optional(),
  category: z.string().trim().optional(),
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(50).default(20)
});

export type CreateBlogInput = z.infer<typeof createBlogSchema>;
export type UpdateBlogInput = z.infer<typeof updateBlogSchema>;
export type BlogListQueryInput = z.infer<typeof blogListQuerySchema>;
