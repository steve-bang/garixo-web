import Image from 'next/image';
import Link from 'next/link';
import { UserCircle2 } from 'lucide-react';

import type { BlogAuthorProfile } from '@/features/blogs/author';
import { formatDate } from '@/lib/utils/format';
import { cn } from '@/lib/utils/cn';

type BlogAuthorBadgeProps = {
  author: BlogAuthorProfile;
  publishedAt?: string | null;
  className?: string;
  compact?: boolean;
  showBio?: boolean;
};

export function BlogAuthorBadge({
  author,
  publishedAt,
  className,
  compact = false,
  showBio = false
}: BlogAuthorBadgeProps): JSX.Element {
  const publishedLabel = publishedAt
    ? formatDate(publishedAt, {
        locale: 'en-US',
        options: {
          month: 'short',
          day: '2-digit',
          year: 'numeric'
        }
      })
    : null;

  return (
    <section
      className={cn(
        'flex gap-s3',
        compact
          ? 'items-center rounded-none'
          : 'rounded-xl border border-border bg-surface-default p-s4 shadow-sm',
        compact ? '' : 'items-start',
        className
      )}
    >
      <Link
        href={author.profileHref}
        aria-label={`Read more about ${author.name}`}
        className={cn(
          'shrink-0 rounded-full outline-none transition-transform hover:scale-[1.02] focus-visible:ring-2 focus-visible:ring-primary-300',
          compact ? 'size-10' : 'size-14'
        )}
      >
        <span
          className={cn(
            'flex size-full items-center justify-center overflow-hidden rounded-full border border-primary-100 bg-primary-50 text-primary-700',
            compact ? 'shadow-none' : 'shadow-sm'
          )}
        >
          {author.avatarUrl ? (
            <Image
              src={author.avatarUrl}
              alt={author.avatarAlt}
              width={56}
              height={56}
              className="h-full w-full object-cover"
            />
          ) : (
            <UserCircle2 className={compact ? 'size-6' : 'size-7'} />
          )}
        </span>
      </Link>

      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-x-s2 gap-y-1">
          <Link
            href={author.profileHref}
            className={cn(
              'truncate font-semibold text-text-primary transition-colors hover:text-primary-700 focus-visible:ring-2 focus-visible:ring-primary-300',
              compact ? 'text-small' : 'text-base'
            )}
          >
            {author.name}
          </Link>
          {!compact ? (
            <span className="text-caption text-text-muted">{author.role}</span>
          ) : null}
        </div>

        {showBio ? (
          <p className="mt-1 max-w-[64ch] text-small leading-6 text-text-secondary">
            {author.bio}
          </p>
        ) : null}

        {publishedLabel ? (
          <p
            className={cn(
              'text-caption text-text-muted',
              showBio ? 'mt-1' : 'mt-0.5'
            )}
          >
            Published {publishedLabel}
          </p>
        ) : null}
      </div>
    </section>
  );
}
