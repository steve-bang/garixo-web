import type { TextareaHTMLAttributes } from 'react';

import { cn } from '@/lib/utils/cn';

export type TextareaProps = TextareaHTMLAttributes<HTMLTextAreaElement>;

export function Textarea({ className, ...props }: TextareaProps): JSX.Element {
  return (
    <textarea
      className={cn(
        'w-full rounded-md border border-input-border bg-input px-s3 py-s2 text-small text-input-foreground',
        'placeholder:text-input-placeholder focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-300',
        'disabled:cursor-not-allowed disabled:opacity-50',
        className
      )}
      {...props}
    />
  );
}
