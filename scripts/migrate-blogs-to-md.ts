/**
 * One-time migration: Firestore `blogs` collection -> public/blog/<slug>.md
 *
 * Run with: npm run migrate:blogs
 *
 * Not part of the app runtime. Safe to delete once the migration is done
 * and verified (see Phase 4 of the blog storage migration plan).
 */
import 'dotenv/config';
import fs from 'node:fs';
import path from 'node:path';

import matter from 'gray-matter';
import TurndownService from 'turndown';

import { firebaseAdmin } from '../src/lib/firebase-admin';
import { slugify } from '../src/features/blogs/utils';
import type { BlogDocument } from '../src/types/firebase-models';

const OUTPUT_DIR = path.join(process.cwd(), 'public', 'blog');

const turndown = new TurndownService({
  headingStyle: 'atx',
  codeBlockStyle: 'fenced',
  bulletListMarker: '-'
});

function toMarkdownBody(doc: BlogDocument): {
  markdown: string;
  converted: boolean;
} {
  const existingMarkdown = doc.content?.markdown?.trim();
  if (existingMarkdown) {
    return { markdown: existingMarkdown, converted: false };
  }

  const html = doc.content?.html ?? '';
  return { markdown: turndown.turndown(html).trim(), converted: true };
}

function buildFrontmatter(
  id: string,
  doc: BlogDocument
): Record<string, unknown> {
  const slug = doc.slug?.trim() || slugify(doc.title ?? id);

  return {
    title: doc.title ?? '',
    slug,
    excerpt: doc.excerpt ?? '',
    metaTitle: doc.metaTitle ?? doc.title ?? '',
    metaDescription: doc.metaDescription ?? doc.excerpt ?? '',
    focusKeyword: doc.focusKeyword ?? '',
    secondaryKeywords: doc.secondaryKeywords ?? [],
    category: doc.category?.trim() || 'General',
    tags: doc.tags ?? [],
    status: doc.status ?? 'draft',
    schemaType: doc.schemaType ?? 'BlogPosting',
    ogTitle: doc.ogTitle ?? doc.title ?? '',
    ogDescription: doc.ogDescription ?? doc.excerpt ?? '',
    ogImage: doc.ogImage ?? '',
    canonical: doc.canonical ?? '',
    isIndexed: doc.isIndexed ?? true,
    faqItems: doc.faqItems ?? [],
    ctaBlock: doc.ctaBlock ?? null,
    readingTime: doc.readingTime ?? 1,
    // Preserve original dates verbatim - do not reset to "now". Resetting
    // would wipe the freshness signal Google already has for these URLs.
    createdAt: doc.createdAt ?? null,
    updatedAt: doc.updatedAt ?? doc.createdAt ?? null,
    publishedAt: doc.publishedAt ?? null,
    scheduledAt: doc.scheduledAt ?? null,
    authorId: doc.authorId ?? '',
    authorName: doc.authorName ?? ''
  };
}

async function main(): Promise<void> {
  fs.mkdirSync(OUTPUT_DIR, { recursive: true });

  const snapshot = await firebaseAdmin.db.collection('blogs').get();

  if (snapshot.docs.length === 0) {
    console.log(
      'No documents found in the "blogs" collection. Nothing to migrate.'
    );
    return;
  }

  let migrated = 0;
  let convertedFromHtml = 0;
  const slugsSeen = new Set<string>();
  const warnings: string[] = [];

  for (const doc of snapshot.docs) {
    const data = doc.data() as BlogDocument;
    const frontmatter = buildFrontmatter(doc.id, data);
    const slug = frontmatter.slug as string;

    if (!slug) {
      warnings.push(
        `Skipped doc ${doc.id}: empty slug/title, cannot derive filename.`
      );
      continue;
    }

    if (slugsSeen.has(slug)) {
      warnings.push(
        `Duplicate slug "${slug}" (doc ${doc.id}) - check manually, only the last one was written.`
      );
    }
    slugsSeen.add(slug);

    const { markdown, converted } = toMarkdownBody(data);
    if (converted) {
      convertedFromHtml += 1;
      warnings.push(
        `"${slug}": body was HTML-only, auto-converted to Markdown - review formatting manually.`
      );
    }

    const fileContents = matter.stringify(markdown, frontmatter);
    fs.writeFileSync(path.join(OUTPUT_DIR, `${slug}.md`), fileContents, 'utf8');
    migrated += 1;
  }

  console.log(`\nMigrated ${migrated} post(s) to ${OUTPUT_DIR}`);
  console.log(`${convertedFromHtml} post(s) needed HTML->Markdown conversion.`);
  if (warnings.length > 0) {
    console.log('\nWarnings:');
    for (const warning of warnings) {
      console.log(`  - ${warning}`);
    }
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error('Migration failed:', error);
    process.exit(1);
  });
