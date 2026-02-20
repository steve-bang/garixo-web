import type { ButtonHTMLAttributes } from 'react';

import { Slot } from '@radix-ui/react-slot';
import { cva, type VariantProps } from 'class-variance-authority';

import { cn } from '@/lib/utils/cn';

const buttonVariants = cva(
  'inline-flex items-center justify-center gap-2 rounded-md text-small font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-300 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50',
  {
    variants: {
      variant: {
        default: 'bg-button-primary text-button-primary-text shadow-xs hover:bg-button-primary-hover',
        secondary: 'bg-button-secondary text-button-secondary-text shadow-xs hover:bg-button-secondary-hover',
        ghost: 'text-text-secondary hover:bg-surface-hover hover:text-text-primary',
        destructive: 'bg-error-600 text-text-inverse shadow-xs hover:bg-error-700'
      },
      size: {
        default: 'h-10 px-s4 py-s2',
        sm: 'h-9 rounded-sm px-s3',
        lg: 'h-11 rounded-md px-s8'
      }
    },
    defaultVariants: {
      variant: 'default',
      size: 'default'
    }
  }
);

export type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> &
  VariantProps<typeof buttonVariants> & {
    asChild?: boolean;
  };

export function Button({ className, variant, size, asChild = false, ...props }: ButtonProps): JSX.Element {
  const Comp = asChild ? Slot : 'button';

  return <Comp className={cn(buttonVariants({ variant, size }), className)} {...props} />;
}
