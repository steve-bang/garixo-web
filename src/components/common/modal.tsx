'use client';

import { X } from 'lucide-react';
import type { ReactNode } from 'react';

import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils/cn';

type ModalProps = {
  open: boolean;
  title: string;
  children: ReactNode;
  maxWidthClassName?: string;
  onClose: () => void;
};

export function Modal({ open, title, children, maxWidthClassName = 'max-w-[480px]', onClose }: ModalProps): JSX.Element | null {
  if (!open) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-s4" onClick={onClose}>
      <div
        className={cn('w-full rounded-lg border border-border bg-surface-default p-s6 shadow-md', maxWidthClassName)}
        onClick={(event) => event.stopPropagation()}
      >
        <div className="mb-s4 flex items-start justify-between gap-s2">
          <h3 className="text-h3">{title}</h3>
          <Button variant="ghost" size="sm" onClick={onClose}>
            <X className="size-4" />
          </Button>
        </div>

        {children}
      </div>
    </div>
  );
}
