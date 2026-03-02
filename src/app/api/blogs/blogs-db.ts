import type { CreateBlogInput, UpdateBlogInput } from '@/features/blogs/schema';
import type {
  Blog,
  BlogCategory,
  BlogListItem,
  BlogTag
} from '@/features/blogs/types';
import {
  calculateSeoScore,
  countWords,
  estimateReadingTime,
  getSeoChecks,
  htmlToPlainText,
  resolveEffectiveStatus,
  sanitizeRichHtml,
  slugify,
  toBlogListItem
} from '@/features/blogs/utils';
import { firebaseAdmin } from '@/lib/firebase-admin';
import { notifySearchEnginesBlogUpdated } from '@/services/seo/search-engine-notifier';
import type {
  BlogCategoryDocument,
  BlogDocument,
  BlogTagDocument
} from '@/types/firebase-models';

type BlogListParams = {
  search?: string;
  status?: Blog['status'];
  category?: string;
  page: number;
  pageSize: number;
};

export type BlogListResult = {
  items: BlogListItem[];
  meta: {
    page: number;
    pageSize: number;
    total: number;
    totalPages: number;
  };
};

export type BlogSitemapEntry = {
  slug: string;
  lastModified: string;
};

function isMissingFirestoreIndexError(error: unknown): boolean {
  if (!(error instanceof Error)) {
    return false;
  }

  const message = error.message.toLowerCase();
  return (
    message.includes('failed_precondition') &&
    message.includes('requires an index')
  );
}

function blogsCollection() {
  return firebaseAdmin.db.collection('blogs');
}

function blogCategoriesCollection() {
  return firebaseAdmin.db.collection('blogCategories');
}

function blogTagsCollection() {
  return firebaseAdmin.db.collection('blogTags');
}

function mapBlog(id: string, raw: Partial<BlogDocument>): Blog {
  const createdAt = raw.createdAt ?? new Date().toISOString();
  const updatedAt = raw.updatedAt ?? createdAt;

  return {
    id,
    title: raw.title ?? '',
    slug: raw.slug ?? '',
    excerpt: raw.excerpt ?? '',
    content: raw.content
      ? {
          type: 'html',
          html: raw.content.html ?? '',
          markdown: raw.content.markdown ?? null
        }
      : { type: 'html', html: '', markdown: null },
    contentText: raw.contentText ?? '',
    metaTitle: raw.metaTitle ?? raw.title ?? '',
    metaDescription: raw.metaDescription ?? raw.excerpt ?? '',
    focusKeyword: raw.focusKeyword ?? '',
    secondaryKeywords: raw.secondaryKeywords ?? [],
    category: raw.category ?? 'General',
    tags: raw.tags ?? [],
    status: raw.status ?? 'draft',
    schemaType: raw.schemaType ?? 'BlogPosting',
    ogTitle: raw.ogTitle ?? raw.title ?? '',
    ogDescription: raw.ogDescription ?? raw.excerpt ?? '',
    ogImage: raw.ogImage ?? '',
    canonical: raw.canonical ?? '',
    isIndexed: raw.isIndexed ?? true,
    faqItems: raw.faqItems ?? [],
    ctaBlock: raw.ctaBlock ?? null,
    seoScore: raw.seoScore ?? 0,
    views: raw.views ?? 0,
    readingTime: raw.readingTime ?? 1,
    createdAt,
    updatedAt,
    publishedAt: raw.publishedAt ?? null,
    scheduledAt: raw.scheduledAt ?? null,
    authorId: raw.authorId ?? '',
    authorName: raw.authorName ?? ''
  };
}

function withoutUndefined<T extends Record<string, unknown>>(value: T): T {
  const entries = Object.entries(value).filter(
    ([, entry]) => entry !== undefined
  );
  return Object.fromEntries(entries) as T;
}

function hasInternalLink(contentHtml: string): boolean {
  return /href=["']\/(?!\/)/i.test(contentHtml);
}

function hasH2(contentHtml: string): boolean {
  return /<h2[\s>]/i.test(contentHtml);
}

function normalizeCategory(value: string): string {
  return value.trim() || 'General';
}

async function syncCategory(categoryName: string): Promise<void> {
  const now = new Date().toISOString();
  const slug = slugify(categoryName);
  if (!slug) {
    return;
  }

  const ref = blogCategoriesCollection().doc(slug);
  const snapshot = await ref.get();

  if (!snapshot.exists) {
    const payload: BlogCategoryDocument = {
      name: categoryName,
      slug,
      postCount: 1,
      createdAt: now,
      updatedAt: now
    };
    await ref.set(payload);
    return;
  }

  const current = snapshot.data() as BlogCategoryDocument;
  await ref.set(
    {
      name: categoryName,
      postCount: Math.max(1, (current.postCount ?? 0) + 1),
      updatedAt: now
    },
    { merge: true }
  );
}

async function syncTags(tags: string[]): Promise<void> {
  const now = new Date().toISOString();
  const normalized = tags
    .map((tag) => tag.trim())
    .filter(Boolean)
    .slice(0, 20);

  await Promise.all(
    normalized.map(async (tagName) => {
      const slug = slugify(tagName);
      if (!slug) {
        return;
      }

      const ref = blogTagsCollection().doc(slug);
      const snapshot = await ref.get();
      if (!snapshot.exists) {
        const payload: BlogTagDocument = {
          name: tagName,
          slug,
          postCount: 1,
          createdAt: now,
          updatedAt: now
        };
        await ref.set(payload);
        return;
      }

      const current = snapshot.data() as BlogTagDocument;
      await ref.set(
        {
          name: tagName,
          postCount: Math.max(1, (current.postCount ?? 0) + 1),
          updatedAt: now
        },
        { merge: true }
      );
    })
  );
}

function toStoredDocument(
  input: CreateBlogInput,
  authorId: string,
  authorName: string,
  now: string
): BlogDocument {
  const cleanTitle = input.title.trim();
  const cleanExcerpt = input.excerpt.trim();
  const cleanSlug = slugify(input.slug || input.title);
  const cleanHtml = sanitizeRichHtml(input.content.html ?? '');
  const contentText = htmlToPlainText(cleanHtml);
  const cleanMetaTitle = input.metaTitle.trim() || cleanTitle;
  const cleanMetaDescription = input.metaDescription.trim() || cleanExcerpt;
  const cleanOgTitle = input.ogTitle.trim() || cleanTitle;
  const cleanOgDescription = input.ogDescription.trim() || cleanExcerpt;
  const wordCount = countWords(contentText);
  const readingTime = estimateReadingTime(wordCount);
  const seoChecks = getSeoChecks({
    title: cleanTitle,
    metaTitle: cleanMetaTitle,
    metaDescription: cleanMetaDescription,
    focusKeyword: input.focusKeyword,
    contentText,
    hasH2: hasH2(cleanHtml),
    hasInternalLink: hasInternalLink(cleanHtml)
  });

  const effectiveStatus =
    input.status === 'scheduled' && !input.scheduledAt ? 'draft' : input.status;

  return {
    title: cleanTitle,
    slug: cleanSlug,
    excerpt: cleanExcerpt,
    content: {
      type: 'html',
      html: cleanHtml,
      markdown: input.content.markdown ?? null
    },
    contentText,
    metaTitle: cleanMetaTitle,
    metaDescription: cleanMetaDescription,
    focusKeyword: input.focusKeyword.trim(),
    secondaryKeywords: input.secondaryKeywords
      .map((keyword) => keyword.trim())
      .filter(Boolean)
      .slice(0, 20),
    category: normalizeCategory(input.category),
    tags: input.tags
      .map((tag) => tag.trim())
      .filter(Boolean)
      .slice(0, 20),
    status: effectiveStatus,
    schemaType: input.schemaType,
    ogTitle: cleanOgTitle,
    ogDescription: cleanOgDescription,
    ogImage: input.ogImage.trim(),
    canonical: input.canonical.trim(),
    isIndexed: input.isIndexed,
    faqItems: input.faqItems,
    ctaBlock: input.ctaBlock,
    seoScore: calculateSeoScore(seoChecks),
    views: 0,
    readingTime,
    createdAt: now,
    updatedAt: now,
    publishedAt: effectiveStatus === 'published' ? now : null,
    scheduledAt: effectiveStatus === 'scheduled' ? input.scheduledAt : null,
    authorId,
    authorName
  };
}

export async function listBlogsWithQuery(
  params: BlogListParams
): Promise<BlogListResult> {
  const snapshot = await blogsCollection().get();
  const allItems = snapshot.docs.map((doc) =>
    mapBlog(doc.id, doc.data() as BlogDocument)
  );

  let filtered = allItems;

  if (params.search) {
    const needle = params.search.trim().toLowerCase();
    filtered = filtered.filter((item) => {
      return (
        item.title.toLowerCase().includes(needle) ||
        item.slug.toLowerCase().includes(needle) ||
        item.focusKeyword.toLowerCase().includes(needle)
      );
    });
  }

  if (params.status) {
    filtered = filtered.filter((item) => item.status === params.status);
  }

  if (params.category) {
    const categoryNeedle = params.category.trim().toLowerCase();
    filtered = filtered.filter(
      (item) => item.category.trim().toLowerCase() === categoryNeedle
    );
  }

  const sorted = filtered.sort(
    (a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
  );
  const total = sorted.length;
  const totalPages = Math.max(1, Math.ceil(total / params.pageSize));
  const safePage = Math.min(params.page, totalPages);
  const start = (safePage - 1) * params.pageSize;

  return {
    items: sorted.slice(start, start + params.pageSize).map(toBlogListItem),
    meta: {
      page: safePage,
      pageSize: params.pageSize,
      total,
      totalPages
    }
  };
}

export async function listPublishedBlogs(): Promise<Blog[]> {
  const snapshot = await blogsCollection().get();
  return snapshot.docs
    .map((doc) => mapBlog(doc.id, doc.data() as BlogDocument))
    .filter(
      (blog) =>
        resolveEffectiveStatus(blog.status, blog.scheduledAt) === 'published'
    )
    .sort(
      (a, b) =>
        new Date(b.publishedAt ?? b.updatedAt).getTime() -
        new Date(a.publishedAt ?? a.updatedAt).getTime()
    );
}

export type PublishScheduledBlogsResult = {
  scanned: number;
  published: number;
};

/**
 * Publish all scheduled blogs that are due at or before `nowIso`.
 *
 * Notes:
 * - Uses batched looping for predictable memory usage.
 * - Safe to run repeatedly (idempotent with status filter).
 */
export async function publishDueScheduledBlogs(
  nowIso: string,
  pageSize = 200
): Promise<PublishScheduledBlogsResult> {
  const safePageSize = Math.max(1, Math.min(500, pageSize));
  const root = blogsCollection() as any;

  let scanned = 0;
  let published = 0;

  const publishFromDocs = async (docs: any[]) => {
    scanned += docs.length;

    await Promise.all(
      docs.map(async (doc: any) => {
        const raw = doc.data() as Partial<BlogDocument>;
        if ((raw.status ?? 'draft') !== 'scheduled') {
          return;
        }

        const nextPublishedAt = raw.publishedAt ?? nowIso;
        await doc.ref.set(
          {
            status: 'published',
            publishedAt: nextPublishedAt,
            updatedAt: nowIso
          },
          { merge: true }
        );
        published += 1;
      })
    );
  };

  try {
    while (true) {
      const snapshot = await root
        .where('status', '==', 'scheduled')
        .where('scheduledAt', '<=', nowIso)
        .orderBy('scheduledAt', 'asc')
        .limit(safePageSize)
        .get();

      if (!snapshot.docs?.length) {
        break;
      }

      await publishFromDocs(snapshot.docs);

      if (snapshot.docs.length < safePageSize) {
        break;
      }
    }
  } catch (error) {
    if (!isMissingFirestoreIndexError(error)) {
      throw error;
    }

    // Fallback path while the composite index is being created:
    // query scheduled posts only, then filter due time in memory.
    const fallbackSnapshot = await root
      .where('status', '==', 'scheduled')
      .get();
    const dueDocs = (fallbackSnapshot.docs ?? []).filter((doc: any) => {
      const raw = doc.data() as Partial<BlogDocument>;
      if (!raw.scheduledAt) {
        return false;
      }

      const scheduledTime = new Date(raw.scheduledAt).getTime();
      if (Number.isNaN(scheduledTime)) {
        return false;
      }

      return scheduledTime <= new Date(nowIso).getTime();
    });

    if (dueDocs.length > 0) {
      await publishFromDocs(dueDocs);
    }
  }

  if (published > 0) {
    void notifySearchEnginesBlogUpdated();
  }

  return {
    scanned,
    published
  };
}

/**
 * Returns SEO-indexable, published blog URLs for sitemap generation.
 *
 * Query strategy:
 * - Firestore filtered query (no full collection scan)
 * - Pagination via startAfter for predictable memory usage
 * - Max URL cap to keep sitemap payload bounded and search-engine compliant
 */
export async function listPublishedIndexedBlogSitemapEntries(options?: {
  pageSize?: number;
  maxUrls?: number;
}): Promise<BlogSitemapEntry[]> {
  const pageSize = Math.max(100, Math.min(1000, options?.pageSize ?? 1000));
  const maxUrls = Math.max(1000, Math.min(50000, options?.maxUrls ?? 50000));

  const entries: BlogSitemapEntry[] = [];
  let lastDoc: any = null;
  const blogsQueryRoot = blogsCollection() as any;

  const loadWithOptimizedQuery = async (): Promise<void> => {
    while (entries.length < maxUrls) {
      let query = blogsQueryRoot
        .where('status', '==', 'published')
        .where('isIndexed', '==', true)
        .orderBy('updatedAt', 'desc')
        .limit(pageSize);

      if (lastDoc) {
        query = query.startAfter(lastDoc);
      }

      const snapshot = await query.get();
      if (snapshot.empty) {
        break;
      }

      for (const doc of snapshot.docs) {
        const raw = doc.data() as Partial<BlogDocument>;
        const slug = slugify(raw.slug ?? '');
        if (!slug) {
          continue;
        }

        const lastModified =
          raw.updatedAt ??
          raw.publishedAt ??
          raw.createdAt ??
          new Date().toISOString();

        entries.push({
          slug,
          lastModified
        });

        if (entries.length >= maxUrls) {
          break;
        }
      }

      lastDoc = snapshot.docs[snapshot.docs.length - 1] ?? null;
      if (!lastDoc || snapshot.size < pageSize) {
        break;
      }
    }
  };

  const loadWithFallbackQuery = async (): Promise<void> => {
    lastDoc = null;

    while (entries.length < maxUrls) {
      let query = blogsQueryRoot
        .where('status', '==', 'published')
        .limit(pageSize);

      if (lastDoc) {
        query = query.startAfter(lastDoc);
      }

      const snapshot = await query.get();
      if (snapshot.empty) {
        break;
      }

      for (const doc of snapshot.docs) {
        const raw = doc.data() as Partial<BlogDocument>;
        if (!raw.isIndexed) {
          continue;
        }

        const slug = slugify(raw.slug ?? '');
        if (!slug) {
          continue;
        }

        const lastModified =
          raw.updatedAt ??
          raw.publishedAt ??
          raw.createdAt ??
          new Date().toISOString();

        entries.push({
          slug,
          lastModified
        });

        if (entries.length >= maxUrls) {
          break;
        }
      }

      lastDoc = snapshot.docs[snapshot.docs.length - 1] ?? null;
      if (!lastDoc || snapshot.size < pageSize) {
        break;
      }
    }
  };

  try {
    await loadWithOptimizedQuery();
  } catch (error) {
    if (!isMissingFirestoreIndexError(error)) {
      throw error;
    }

    // Fallback path for local/dev or environments without composite index.
    await loadWithFallbackQuery();
  }

  entries.sort(
    (a, b) =>
      new Date(b.lastModified).getTime() - new Date(a.lastModified).getTime()
  );

  return entries;
}

export async function findBlogById(id: string): Promise<Blog | null> {
  const snapshot = await blogsCollection().doc(id).get();
  if (!snapshot.exists) {
    return null;
  }

  return mapBlog(snapshot.id, snapshot.data() as BlogDocument);
}

export async function findBlogBySlug(slug: string): Promise<Blog | null> {
  const normalizedSlug = slugify(slug);
  if (!normalizedSlug) {
    return null;
  }

  const snapshot = await blogsCollection().get();
  const doc = snapshot.docs.find((item) => {
    const data = item.data() as Partial<BlogDocument>;
    return (data.slug ?? '') === normalizedSlug;
  });

  if (!doc) {
    return null;
  }
  return mapBlog(doc.id, doc.data() as BlogDocument);
}

export async function hasDuplicateBlogSlug(
  slug: string,
  excludeId?: string
): Promise<boolean> {
  const normalizedSlug = slugify(slug);
  if (!normalizedSlug) {
    return false;
  }

  const snapshot = await blogsCollection().get();

  return snapshot.docs.some((doc) => {
    const data = doc.data() as Partial<BlogDocument>;
    return (
      (data.slug ?? '') === normalizedSlug &&
      (!excludeId || doc.id !== excludeId)
    );
  });
}

export async function createBlog(
  input: CreateBlogInput,
  author: { id: string; name: string }
): Promise<Blog> {
  const now = new Date().toISOString();
  const payload = toStoredDocument(input, author.id, author.name, now);

  const ref = blogsCollection().doc();
  await ref.set(payload);

  await Promise.all([syncCategory(payload.category), syncTags(payload.tags)]);

  if (payload.status === 'published' && payload.isIndexed) {
    void notifySearchEnginesBlogUpdated();
  }

  return mapBlog(ref.id, payload);
}

export async function updateBlog(
  blogId: string,
  input: UpdateBlogInput,
  editor: { id: string; name: string }
): Promise<Blog | null> {
  const ref = blogsCollection().doc(blogId);
  const currentSnapshot = await ref.get();

  if (!currentSnapshot.exists) {
    return null;
  }

  const current = mapBlog(blogId, currentSnapshot.data() as BlogDocument);
  const nextInput: CreateBlogInput = {
    title: input.title ?? current.title,
    slug: input.slug ?? current.slug,
    excerpt: input.excerpt ?? current.excerpt,
    content: input.content ?? current.content,
    metaTitle: input.metaTitle ?? current.metaTitle,
    metaDescription: input.metaDescription ?? current.metaDescription,
    focusKeyword: input.focusKeyword ?? current.focusKeyword,
    secondaryKeywords: input.secondaryKeywords ?? current.secondaryKeywords,
    category: input.category ?? current.category,
    tags: input.tags ?? current.tags,
    status: input.status ?? current.status,
    schemaType: input.schemaType ?? current.schemaType,
    ogTitle: input.ogTitle ?? current.ogTitle,
    ogDescription: input.ogDescription ?? current.ogDescription,
    ogImage: input.ogImage ?? current.ogImage,
    canonical: input.canonical ?? current.canonical,
    isIndexed: input.isIndexed ?? current.isIndexed,
    faqItems: input.faqItems ?? current.faqItems,
    ctaBlock: input.ctaBlock === undefined ? current.ctaBlock : input.ctaBlock,
    scheduledAt:
      input.scheduledAt === undefined ? current.scheduledAt : input.scheduledAt
  };

  const now = new Date().toISOString();
  const nextDoc = toStoredDocument(nextInput, editor.id, editor.name, now);

  const merged = withoutUndefined<Partial<BlogDocument>>({
    ...nextDoc,
    createdAt: current.createdAt,
    views: current.views,
    publishedAt:
      nextDoc.status === 'published'
        ? (current.publishedAt ?? now)
        : nextDoc.status === 'scheduled'
          ? null
          : current.publishedAt
  });

  await ref.set(merged, { merge: true });
  await Promise.all([
    syncCategory(merged.category ?? current.category),
    syncTags(merged.tags ?? current.tags)
  ]);

  if (merged.status === 'published' && merged.isIndexed) {
    void notifySearchEnginesBlogUpdated();
  }

  const refreshed = await ref.get();
  if (!refreshed.exists) {
    return null;
  }

  return mapBlog(refreshed.id, refreshed.data() as BlogDocument);
}

export async function deleteBlog(blogId: string): Promise<boolean> {
  const ref = blogsCollection().doc(blogId);
  const snapshot = await ref.get();
  if (!snapshot.exists) {
    return false;
  }

  await ref.delete();
  return true;
}

export async function duplicateBlog(
  blogId: string,
  author: { id: string; name: string }
): Promise<Blog | null> {
  const source = await findBlogById(blogId);
  if (!source) {
    return null;
  }

  const now = new Date().toISOString();
  const duplicateSlugSeed = `${source.slug}-copy-${now.slice(11, 19).replace(/:/g, '')}`;
  const cleanSlug = slugify(duplicateSlugSeed);

  const payload: CreateBlogInput = {
    title: `${source.title} (Copy)`,
    slug: cleanSlug,
    excerpt: source.excerpt,
    content: source.content,
    metaTitle: source.metaTitle,
    metaDescription: source.metaDescription,
    focusKeyword: source.focusKeyword,
    secondaryKeywords: source.secondaryKeywords,
    category: source.category,
    tags: source.tags,
    status: 'draft',
    schemaType: source.schemaType,
    ogTitle: source.ogTitle,
    ogDescription: source.ogDescription,
    ogImage: source.ogImage,
    canonical: source.canonical,
    isIndexed: source.isIndexed,
    faqItems: source.faqItems,
    ctaBlock: source.ctaBlock,
    scheduledAt: null
  };

  return createBlog(payload, author);
}

export async function incrementBlogViews(blogId: string): Promise<void> {
  const ref = blogsCollection().doc(blogId);
  await firebaseAdmin.db.runTransaction(async (transaction: any) => {
    const snapshot = await transaction.get(ref);
    if (!snapshot.exists) {
      return;
    }

    const data = snapshot.data() as BlogDocument;
    const nextViews = Math.max(0, (data.views ?? 0) + 1);
    transaction.set(
      ref,
      {
        views: nextViews,
        updatedAt: new Date().toISOString()
      },
      { merge: true }
    );
  });
}

export async function listBlogCategories(): Promise<BlogCategory[]> {
  const snapshot = await blogCategoriesCollection().get();
  return snapshot.docs
    .map((doc) => {
      const data = doc.data() as BlogCategoryDocument;
      return {
        id: doc.id,
        name: data.name,
        slug: data.slug,
        postCount: data.postCount ?? 0,
        createdAt: data.createdAt,
        updatedAt: data.updatedAt
      };
    })
    .sort((a, b) => a.name.localeCompare(b.name));
}

export async function listBlogTags(): Promise<BlogTag[]> {
  const snapshot = await blogTagsCollection().get();
  return snapshot.docs
    .map((doc) => {
      const data = doc.data() as BlogTagDocument;
      return {
        id: doc.id,
        name: data.name,
        slug: data.slug,
        postCount: data.postCount ?? 0,
        createdAt: data.createdAt,
        updatedAt: data.updatedAt
      };
    })
    .sort((a, b) => a.name.localeCompare(b.name));
}
