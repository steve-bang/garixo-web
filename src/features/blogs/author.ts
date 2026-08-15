import type { Blog } from '@/features/blogs/types';

export type BlogAuthorProfile = {
  slug: string;
  name: string;
  role: string;
  bio: string;
  profileHref: string;
  profileUrl: string;
  avatarUrl: string | null;
  avatarAlt: string;
};

export const BLOG_AUTHOR_PROFILES = {
  'steve-bang': {
    slug: 'steve-bang',
    name: 'Steve Bang',
    role: 'Founder of Garixo',
    bio: 'Steve Bang is the founder of Garixo and a software engineer with hands-on experience working in auto repair shops. He builds practical technology to help independent repair shops manage their businesses more efficiently.',
    profileHref: '/about',
    profileUrl: 'https://www.garixo.com/about',
    avatarUrl: '/images/steve-bang.jpg',
    avatarAlt: 'Steve Bang, founder of Garixo'
  }
} as const satisfies Record<string, BlogAuthorProfile>;

export const DEFAULT_BLOG_AUTHOR = BLOG_AUTHOR_PROFILES['steve-bang'];

function normalizeKey(value: string | null | undefined): string {
  return value?.trim().toLowerCase() ?? '';
}

export function getBlogAuthor(
  slug: string = DEFAULT_BLOG_AUTHOR.slug
): BlogAuthorProfile {
  const normalizedSlug = normalizeKey(slug);
  const registry = Object.values(BLOG_AUTHOR_PROFILES);

  return (
    registry.find(
      (author) =>
        author.slug === normalizedSlug ||
        author.name.toLowerCase() === normalizedSlug
    ) ?? DEFAULT_BLOG_AUTHOR
  );
}

export function resolveBlogAuthor(
  blog?: Pick<Blog, 'authorId' | 'authorName'> | null
): BlogAuthorProfile {
  const authorById = getBlogAuthor(blog?.authorId);
  if (authorById !== DEFAULT_BLOG_AUTHOR) {
    return authorById;
  }

  const authorByName = getBlogAuthor(blog?.authorName);
  if (authorByName !== DEFAULT_BLOG_AUTHOR) {
    return authorByName;
  }

  return DEFAULT_BLOG_AUTHOR;
}
