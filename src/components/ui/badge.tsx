import type { HTMLAttributes } from 'react';

import { cva, type VariantProps } from 'class-variance-authority';

import { cn } from '@/lib/utils/cn';

const badgeVariants = cva('inline-flex items-center rounded-full px-s2 py-[2px] text-caption font-medium', {
  variants: {
    variant: {
      default: 'bg-surface-hover text-text-secondary',
      success: 'bg-badge-success text-badge-success-text',
      warning: 'bg-warning-100 text-warning-800',
      info: 'bg-info-100 text-info-800'
    }
  },
  defaultVariants: {
    variant: 'default'
  }
});

export type BadgeProps = HTMLAttributes<HTMLSpanElement> & VariantProps<typeof badgeVariants>;

export function Badge({ className, variant, ...props }: BadgeProps): JSX.Element {
  return <span className={cn(badgeVariants({ variant }), className)} {...props} />;
}
