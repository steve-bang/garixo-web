'use client';

import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';

import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { MarkdownEditor } from '@/features/blogs/components/markdown-editor';
import { RichTextEditor } from '@/features/blogs/components/rich-text-editor';
import { createBlogSchema } from '@/features/blogs/schema';
import { useBlog, useCreateBlog, useUpdateBlog } from '@/features/blogs/hooks';
import type { Blog, BlogStatus } from '@/features/blogs/types';
import {
  BLOG_SCHEMA_TYPE_VALUES,
  BLOG_STATUS_VALUES
} from '@/features/blogs/types';
import {
  countWords,
  getSeoChecks,
  htmlToPlainText,
  markdownToHtml,
  slugify
} from '@/features/blogs/utils';
import { useToast } from '@/hooks/use-toast';

type BlogEditorPageProps = {
  blogId?: string;
};

function RequiredMark(): JSX.Element {
  return (
    <span aria-hidden="true" className="ml-1 text-state-error">
      *
    </span>
  );
}

type BlogFormState = {
  title: string;
  slug: string;
  excerpt: string;
  contentHtml: string;
  contentMarkdown: string;
  metaTitle: string;
  metaDescription: string;
  focusKeyword: string;
  secondaryKeywords: string;
  category: string;
  tags: string;
  schemaType: (typeof BLOG_SCHEMA_TYPE_VALUES)[number];
  status: BlogStatus;
  scheduledAt: string;
  ogTitle: string;
  ogDescription: string;
  ogImage: string;
  canonical: string;
  isIndexed: boolean;
  faqItems: Array<{
    id: string;
    question: string;
    answer: string;
  }>;
  ctaTitle: string;
  ctaDescription: string;
  ctaLabel: string;
  ctaHref: string;
};

function createFaqItem() {
  return {
    id: `faq-${Math.random().toString(36).slice(2, 10)}`,
    question: '',
    answer: ''
  };
}

function emptyForm(): BlogFormState {
  return {
    title: '',
    slug: '',
    excerpt: '',
    contentHtml: '<p>Start writing your article...</p>',
    contentMarkdown: '',
    metaTitle: '',
    metaDescription: '',
    focusKeyword: '',
    secondaryKeywords: '',
    category: 'Work Orders',
    tags: '',
    schemaType: 'BlogPosting',
    status: 'draft',
    scheduledAt: '',
    ogTitle: '',
    ogDescription: '',
    ogImage: '',
    canonical: '',
    isIndexed: true,
    faqItems: [],
    ctaTitle: '',
    ctaDescription: '',
    ctaLabel: '',
    ctaHref: ''
  };
}

function toLocalDatetimeInput(value: string | null | undefined): string {
  if (!value) {
    return '';
  }

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return '';
  }

  const offset = date.getTimezoneOffset();
  const local = new Date(date.getTime() - offset * 60000);
  return local.toISOString().slice(0, 16);
}

function mapBlogToForm(blog: Blog): BlogFormState {
  return {
    title: blog.title,
    slug: blog.slug,
    excerpt: blog.excerpt,
    contentHtml: blog.content.html,
    contentMarkdown: blog.content.markdown ?? '',
    metaTitle: blog.metaTitle,
    metaDescription: blog.metaDescription,
    focusKeyword: blog.focusKeyword,
    secondaryKeywords: blog.secondaryKeywords.join(', '),
    category: blog.category,
    tags: blog.tags.join(', '),
    schemaType: blog.schemaType,
    status: blog.status,
    scheduledAt: toLocalDatetimeInput(blog.scheduledAt),
    ogTitle: blog.ogTitle,
    ogDescription: blog.ogDescription,
    ogImage: blog.ogImage,
    canonical: blog.canonical,
    isIndexed: blog.isIndexed,
    faqItems: blog.faqItems.map((item) => ({
      id: `faq-${Math.random().toString(36).slice(2, 10)}`,
      question: item.question,
      answer: item.answer
    })),
    ctaTitle: blog.ctaBlock?.title ?? '',
    ctaDescription: blog.ctaBlock?.description ?? '',
    ctaLabel: blog.ctaBlock?.ctaLabel ?? '',
    ctaHref: blog.ctaBlock?.ctaHref ?? ''
  };
}

function toIsoFromLocalDatetime(value: string): string | null {
  if (!value) {
    return null;
  }

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return null;
  }

  return date.toISOString();
}

export function BlogEditorPage({ blogId }: BlogEditorPageProps): JSX.Element {
  const router = useRouter();
  const toast = useToast();

  const isEditMode = Boolean(blogId);
  const blogQuery = useBlog(blogId ?? null);
  const createMutation = useCreateBlog();
  const updateMutation = useUpdateBlog();

  const sourceBlog = blogQuery.data;
  const [form, setForm] = useState<BlogFormState>(emptyForm);
  const [isPreview, setIsPreview] = useState(false);
  const [contentMode, setContentMode] = useState<'html' | 'markdown'>('html');

  useEffect(() => {
    if (!isEditMode || !sourceBlog) {
      return;
    }

    // Initialize form from fetched blog once for edit mode.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setForm((prev) => (prev.title ? prev : mapBlogToForm(sourceBlog)));
    if (sourceBlog.content.markdown) {
      setContentMode('markdown');
    }
  }, [isEditMode, sourceBlog]);

  const contentText = useMemo(() => htmlToPlainText(form.contentHtml), [form]);
  const wordCount = useMemo(() => countWords(contentText), [contentText]);
  const seoChecks = useMemo(
    () =>
      getSeoChecks({
        title: form.title,
        metaTitle: form.metaTitle,
        metaDescription: form.metaDescription,
        focusKeyword: form.focusKeyword,
        contentText,
        hasH2: /<h2[\s>]/i.test(form.contentHtml),
        hasInternalLink: /href=["']\/(?!\/)/i.test(form.contentHtml)
      }),
    [contentText, form]
  );

  const passedSeoChecks = seoChecks.filter((check) => check.passed).length;
  const seoScore = Math.round(
    (passedSeoChecks / Math.max(1, seoChecks.length)) * 100
  );

  const isSaving = createMutation.isPending || updateMutation.isPending;

  const onField = <K extends keyof BlogFormState>(
    key: K,
    value: BlogFormState[K]
  ) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const handleAutoSlug = () => {
    onField('slug', slugify(form.title));
  };

  const addFaqItem = () => {
    setForm((prev) => ({
      ...prev,
      faqItems: [...prev.faqItems, createFaqItem()]
    }));
  };

  const removeFaqItem = (id: string) => {
    setForm((prev) => ({
      ...prev,
      faqItems: prev.faqItems.filter((item) => item.id !== id)
    }));
  };

  const updateFaqItem = (
    id: string,
    key: 'question' | 'answer',
    value: string
  ) => {
    setForm((prev) => ({
      ...prev,
      faqItems: prev.faqItems.map((item) =>
        item.id === id ? { ...item, [key]: value } : item
      )
    }));
  };

  const buildPayload = (statusOverride?: BlogStatus) => {
    const status = statusOverride ?? form.status;
    const scheduledAt =
      status === 'scheduled' ? toIsoFromLocalDatetime(form.scheduledAt) : null;

    return {
      title: form.title,
      slug: form.slug,
      excerpt: form.excerpt,
      content: {
        type: 'html' as const,
        html:
          contentMode === 'markdown'
            ? markdownToHtml(form.contentMarkdown)
            : form.contentHtml,
        markdown:
          form.contentMarkdown.trim().length > 0 ? form.contentMarkdown : null
      },
      metaTitle: form.metaTitle,
      metaDescription: form.metaDescription,
      focusKeyword: form.focusKeyword,
      secondaryKeywords: form.secondaryKeywords
        .split(',')
        .map((item) => item.trim())
        .filter(Boolean),
      category: form.category,
      tags: form.tags
        .split(',')
        .map((item) => item.trim())
        .filter(Boolean),
      status,
      schemaType: form.schemaType,
      ogTitle: form.ogTitle,
      ogDescription: form.ogDescription,
      ogImage: form.ogImage,
      canonical: form.canonical,
      isIndexed: form.isIndexed,
      faqItems: form.faqItems
        .filter((item) => item.question.trim() && item.answer.trim())
        .map((item) => ({
          question: item.question.trim(),
          answer: item.answer.trim()
        })),
      ctaBlock:
        form.ctaTitle.trim() &&
        form.ctaDescription.trim() &&
        form.ctaLabel.trim() &&
        form.ctaHref.trim()
          ? {
              title: form.ctaTitle.trim(),
              description: form.ctaDescription.trim(),
              ctaLabel: form.ctaLabel.trim(),
              ctaHref: form.ctaHref.trim()
            }
          : null,
      scheduledAt
    };
  };

  const save = async (statusOverride?: BlogStatus) => {
    try {
      const hasIncompleteFaq = form.faqItems.some(
        (item) =>
          (item.question.trim().length > 0 &&
            item.answer.trim().length === 0) ||
          (item.question.trim().length === 0 && item.answer.trim().length > 0)
      );

      if (hasIncompleteFaq) {
        toast.error(
          'Please complete both question and answer, or remove empty FAQ items.'
        );
        return;
      }

      const payload = buildPayload(statusOverride);
      const parsed = createBlogSchema.safeParse(payload);

      if (!parsed.success) {
        toast.error(
          parsed.error.issues[0]?.message ?? 'Please check your content.'
        );
        return;
      }

      if (isEditMode && blogId) {
        await updateMutation.mutateAsync({ id: blogId, input: parsed.data });
        toast.success('Blog updated successfully.');
      } else {
        const created = await createMutation.mutateAsync(parsed.data);
        toast.success('Blog created successfully.');
        router.replace(`/dashboard/administrator/blogs/${created.id}/edit`);
      }
    } catch (error) {
      const message =
        error instanceof Error ? error.message : 'Could not save blog.';
      toast.error(message);
    }
  };

  if (isEditMode && blogQuery.isLoading) {
    return (
      <div className="p-s8 text-small text-text-muted">Loading blog...</div>
    );
  }

  if (isEditMode && blogQuery.isError) {
    return (
      <Card className="m-s8 p-s6">
        <p className="text-small text-state-error">
          We could not load this blog post right now.
        </p>
      </Card>
    );
  }

  return (
    <div className="space-y-s4 p-s6 xl:p-s8">
      <header className="flex flex-col gap-s3 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-h1">
            {isEditMode ? 'Edit Blog Post' : 'Create New Blog Post'}
          </h1>
          <p className="text-small text-text-muted">
            Write long-form SEO content with clear metadata and publishing
            controls.
          </p>
        </div>
        <div className="flex flex-wrap gap-s2">
          <Button
            type="button"
            variant="secondary"
            onClick={() => setIsPreview((prev) => !prev)}
          >
            {isPreview ? 'Hide Preview' : 'Preview'}
          </Button>
          <Button
            type="button"
            variant="secondary"
            onClick={() => save('draft')}
            disabled={isSaving}
          >
            Save Draft
          </Button>
          <Button
            type="button"
            onClick={() =>
              save(form.status === 'scheduled' ? 'scheduled' : 'published')
            }
            disabled={isSaving}
          >
            {form.status === 'scheduled' ? 'Schedule' : 'Publish'}
          </Button>
        </div>
      </header>

      <div className="grid gap-s4 xl:grid-cols-[1fr_360px]">
        <div className="space-y-s4">
          <Card className="space-y-s3 p-s4">
            <div className="space-y-s1">
              <label className="text-small font-medium text-text-secondary">
                Title (H1)
                <RequiredMark />
              </label>
              <Input
                value={form.title}
                onChange={(event) => onField('title', event.target.value)}
                placeholder="How Independent Garages Can Improve Work Order Throughput"
              />
            </div>

            <div className="grid gap-s3 md:grid-cols-[1fr_auto]">
              <div className="space-y-s1">
                <label className="text-small font-medium text-text-secondary">
                  Slug
                  <RequiredMark />
                </label>
                <Input
                  value={form.slug}
                  onChange={(event) =>
                    onField('slug', slugify(event.target.value))
                  }
                  placeholder="independent-garage-work-order-throughput"
                />
              </div>
              <div className="flex items-end">
                <Button
                  type="button"
                  variant="secondary"
                  onClick={handleAutoSlug}
                >
                  Auto Generate
                </Button>
              </div>
            </div>

            <div className="space-y-s1">
              <label className="text-small font-medium text-text-secondary">
                Excerpt
                <RequiredMark />
              </label>
              <Textarea
                value={form.excerpt}
                onChange={(event) => onField('excerpt', event.target.value)}
                rows={3}
                placeholder="Short summary for search engines and social previews."
              />
            </div>
          </Card>

          <div className="space-y-s2">
            <div className="space-y-s1">
              <h3 className="text-h3">
                Article Content
                <RequiredMark />
              </h3>
              <p className="text-small text-text-muted">
                Write the full blog content. You can add headings, links,
                tables, and images.
              </p>
            </div>
            <div className="flex items-center gap-s2">
              <Button
                type="button"
                size="sm"
                variant={contentMode === 'html' ? 'default' : 'secondary'}
                onClick={() => setContentMode('html')}
              >
                HTML Editor
              </Button>
              <Button
                type="button"
                size="sm"
                variant={contentMode === 'markdown' ? 'default' : 'secondary'}
                onClick={() => setContentMode('markdown')}
              >
                Markdown Editor
              </Button>
            </div>

            {contentMode === 'html' ? (
              <RichTextEditor
                value={form.contentHtml}
                onChange={(value) => onField('contentHtml', value)}
              />
            ) : (
              <MarkdownEditor
                value={form.contentMarkdown}
                onChange={(value) => {
                  onField('contentMarkdown', value);
                  onField('contentHtml', markdownToHtml(value));
                }}
                rows={16}
              />
            )}
          </div>

          <Card className="space-y-s3 p-s4">
            <div className="space-y-s1">
              <h3 className="text-h3">CTA Block</h3>
              <p className="text-small text-text-muted">
                Add a clear call-to-action shown at the end of this blog post.
              </p>
            </div>
            <div className="grid gap-s3 md:grid-cols-2">
              <div className="space-y-s1">
                <label className="text-small font-medium text-text-secondary">
                  CTA Title
                </label>
                <Input
                  value={form.ctaTitle}
                  onChange={(event) => onField('ctaTitle', event.target.value)}
                />
              </div>
              <div className="space-y-s1">
                <label className="text-small font-medium text-text-secondary">
                  CTA Label
                </label>
                <Input
                  value={form.ctaLabel}
                  onChange={(event) => onField('ctaLabel', event.target.value)}
                />
              </div>
              <div className="space-y-s1 md:col-span-2">
                <label className="text-small font-medium text-text-secondary">
                  CTA Description
                </label>
                <Textarea
                  value={form.ctaDescription}
                  onChange={(event) =>
                    onField('ctaDescription', event.target.value)
                  }
                  rows={2}
                />
              </div>
              <div className="space-y-s1 md:col-span-2">
                <label className="text-small font-medium text-text-secondary">
                  CTA Link
                </label>
                <Input
                  value={form.ctaHref}
                  onChange={(event) => onField('ctaHref', event.target.value)}
                  placeholder="/pricing"
                />
              </div>
            </div>
          </Card>

          <Card className="space-y-s3 p-s4">
            <div className="space-y-s1">
              <h3 className="text-h3">FAQ Schema</h3>
              <p className="text-small text-text-muted">
                Add common customer questions to improve SEO rich results.
              </p>
            </div>
            <div className="space-y-s3">
              {form.faqItems.length === 0 ? (
                <p className="text-small text-text-muted">
                  No FAQ items yet. Add at least one if this article includes a
                  FAQ section.
                </p>
              ) : null}

              {form.faqItems.map((item, index) => (
                <Card
                  key={item.id}
                  className="space-y-s3 border border-border p-s3"
                >
                  <div className="flex items-center justify-between">
                    <p className="text-small font-medium text-text-primary">
                      FAQ #{index + 1}
                    </p>
                    <Button
                      type="button"
                      size="sm"
                      variant="ghost"
                      onClick={() => removeFaqItem(item.id)}
                    >
                      Remove
                    </Button>
                  </div>
                  <div className="space-y-s1">
                    <label className="text-small font-medium text-text-secondary">
                      Question
                    </label>
                    <Input
                      value={item.question}
                      onChange={(event) =>
                        updateFaqItem(item.id, 'question', event.target.value)
                      }
                      placeholder="What is garage work order software?"
                    />
                  </div>
                  <div className="space-y-s1">
                    <label className="text-small font-medium text-text-secondary">
                      Answer
                    </label>
                    <Textarea
                      value={item.answer}
                      onChange={(event) =>
                        updateFaqItem(item.id, 'answer', event.target.value)
                      }
                      rows={3}
                      placeholder="Short, clear answer for snippet-friendly SEO."
                    />
                  </div>
                </Card>
              ))}

              <Button type="button" variant="secondary" onClick={addFaqItem}>
                Add FAQ
              </Button>
            </div>
          </Card>

          {isPreview ? (
            <Card className="space-y-s3 p-s4">
              <h3 className="text-h3">Preview</h3>
              <h1 className="text-h1">{form.title || 'Untitled Post'}</h1>
              <p className="text-small text-text-secondary">{form.excerpt}</p>
              <div
                className="prose prose-slate max-w-none"
                dangerouslySetInnerHTML={{ __html: form.contentHtml }}
              />
            </Card>
          ) : null}
        </div>

        <div className="space-y-s4 xl:sticky xl:top-s6 xl:h-fit">
          <Card className="space-y-s3 p-s4">
            <h3 className="text-h3">Publishing</h3>
            <div className="space-y-s1">
              <label className="text-small font-medium text-text-secondary">
                Status
              </label>
              <Select
                value={form.status}
                onChange={(event) =>
                  onField('status', event.target.value as BlogStatus)
                }
              >
                {BLOG_STATUS_VALUES.map((status) => (
                  <option key={status} value={status}>
                    {status.charAt(0).toUpperCase() + status.slice(1)}
                  </option>
                ))}
              </Select>
            </div>

            {form.status === 'scheduled' ? (
              <div className="space-y-s1">
                <label className="text-small font-medium text-text-secondary">
                  Schedule Time
                  <RequiredMark />
                </label>
                <Input
                  type="datetime-local"
                  value={form.scheduledAt}
                  onChange={(event) =>
                    onField('scheduledAt', event.target.value)
                  }
                />
              </div>
            ) : null}

            <div className="rounded-md border border-border bg-background-secondary px-s3 py-s2">
              <p className="text-small text-text-secondary">
                Words:{' '}
                <span className="font-semibold text-text-primary">
                  {wordCount}
                </span>
              </p>
              <p className="text-small text-text-secondary">
                SEO score:{' '}
                <span className="font-semibold text-text-primary">
                  {seoScore}/100
                </span>
              </p>
            </div>
          </Card>

          <Card className="space-y-s3 p-s4">
            <h3 className="text-h3">SEO Settings</h3>
            <div className="space-y-s1">
              <label className="text-small font-medium text-text-secondary">
                Meta Title
              </label>
              <Input
                value={form.metaTitle}
                onChange={(event) => onField('metaTitle', event.target.value)}
                maxLength={60}
              />
            </div>
            <div className="space-y-s1">
              <label className="text-small font-medium text-text-secondary">
                Meta Description
              </label>
              <Textarea
                value={form.metaDescription}
                onChange={(event) =>
                  onField('metaDescription', event.target.value)
                }
                rows={3}
                maxLength={155}
              />
            </div>
            <div className="space-y-s1">
              <label className="text-small font-medium text-text-secondary">
                Focus Keyword
              </label>
              <Input
                value={form.focusKeyword}
                onChange={(event) =>
                  onField('focusKeyword', event.target.value)
                }
              />
            </div>
            <div className="space-y-s1">
              <label className="text-small font-medium text-text-secondary">
                Secondary Keywords (comma-separated)
              </label>
              <Textarea
                value={form.secondaryKeywords}
                onChange={(event) =>
                  onField('secondaryKeywords', event.target.value)
                }
                rows={2}
              />
            </div>
            <div className="space-y-s1">
              <label className="text-small font-medium text-text-secondary">
                Category
              </label>
              <Input
                value={form.category}
                onChange={(event) => onField('category', event.target.value)}
                placeholder="Customer Management"
              />
            </div>
            <div className="space-y-s1">
              <label className="text-small font-medium text-text-secondary">
                Tags (comma-separated)
              </label>
              <Input
                value={form.tags}
                onChange={(event) => onField('tags', event.target.value)}
                placeholder="garage crm, repeat customers"
              />
            </div>
          </Card>

          <Card className="space-y-s3 p-s4">
            <h3 className="text-h3">Advanced SEO</h3>
            <div className="space-y-s1">
              <label className="text-small font-medium text-text-secondary">
                Schema Type
              </label>
              <Select
                value={form.schemaType}
                onChange={(event) =>
                  onField(
                    'schemaType',
                    event.target.value as BlogFormState['schemaType']
                  )
                }
              >
                {BLOG_SCHEMA_TYPE_VALUES.map((schemaType) => (
                  <option key={schemaType} value={schemaType}>
                    {schemaType}
                  </option>
                ))}
              </Select>
            </div>
            <div className="space-y-s1">
              <label className="text-small font-medium text-text-secondary">
                Canonical URL
              </label>
              <Input
                value={form.canonical}
                onChange={(event) => onField('canonical', event.target.value)}
                placeholder="https://www.garixo.com/blog/example"
              />
            </div>
            <div className="space-y-s1">
              <label className="text-small font-medium text-text-secondary">
                OG Title
              </label>
              <Input
                value={form.ogTitle}
                onChange={(event) => onField('ogTitle', event.target.value)}
              />
            </div>
            <div className="space-y-s1">
              <label className="text-small font-medium text-text-secondary">
                OG Description
              </label>
              <Textarea
                value={form.ogDescription}
                onChange={(event) =>
                  onField('ogDescription', event.target.value)
                }
                rows={2}
              />
            </div>
            <div className="space-y-s1">
              <label className="text-small font-medium text-text-secondary">
                OG Image URL
              </label>
              <Input
                value={form.ogImage}
                onChange={(event) => onField('ogImage', event.target.value)}
              />
            </div>
            <label className="flex items-center gap-s2 text-small text-text-secondary">
              <input
                type="checkbox"
                checked={form.isIndexed}
                onChange={(event) => onField('isIndexed', event.target.checked)}
              />
              Allow search engine indexing
            </label>

            <div className="space-y-s2 rounded-md border border-border bg-background-secondary px-s3 py-s3">
              <p className="text-small font-medium text-text-primary">
                SEO checks
              </p>
              {seoChecks.map((check) => (
                <p
                  key={check.label}
                  className={`text-caption ${check.passed ? 'text-success-700' : 'text-text-muted'}`}
                >
                  {check.passed ? '✓' : '•'} {check.label}
                </p>
              ))}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
