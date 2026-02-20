import type { HTMLAttributes } from 'react';

import { cva, type VariantProps } from 'class-variance-authority';

import { cn } from '@/lib/utils/cn';

const cardVariants = cva('rounded-lg border border-card-border bg-card text-card-foreground shadow-sm', {
  variants: {
    variant: {
      default: '',
      interactive: 'transition-colors hover:bg-surface-hover'
    }
  },
  defaultVariants: {
    variant: 'default'
  }
});

export type CardProps = HTMLAttributes<HTMLDivElement> & VariantProps<typeof cardVariants>;

export function Card({ className, variant, ...props }: CardProps): JSX.Element {
  return <div className={cn(cardVariants({ variant }), className)} {...props} />;
}
