'use client';

import { X } from 'lucide-react';
import type { ReactNode } from 'react';
import { useId, useRef } from 'react';

import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils/cn';
import { useModalA11y } from '@/components/ui/modal/useModalA11y';

export interface ModalProps {
  open: boolean;
  onClose: () => void;
  title?: string;
  children: ReactNode;
  footer?: ReactNode;
  width?: 'sm' | 'md' | 'lg';
  closeOnOverlayClick?: boolean;
  showCloseIcon?: boolean;
  fullOnTabletMobile?: boolean;
}

function widthClass(width: ModalProps['width'], fullOnTabletMobile: boolean): string {
  if (fullOnTabletMobile) {
    if (width === 'sm') return 'max-w-none lg:max-w-[400px]';
    if (width === 'lg') return 'max-w-none lg:max-w-[640px]';
    return 'max-w-none lg:max-w-[480px]';
  }

  if (width === 'sm') return 'max-w-[400px]';
  if (width === 'lg') return 'max-w-[640px]';
  return 'max-w-[480px]';
}

export function Modal({
  open,
  onClose,
  title,
  children,
  footer,
  width = 'md',
  closeOnOverlayClick = true,
  showCloseIcon = true,
  fullOnTabletMobile = false
}: ModalProps): JSX.Element | null {
  const titleId = useId();
  const contentRef = useRef<HTMLDivElement | null>(null);

  useModalA11y({ open, container: contentRef.current, onClose });

  if (!open) {
    return null;
  }

  return (
    <div
      className={cn(
        'fixed inset-0 z-50 flex items-center justify-center bg-black/40 animate-modal-fade-in',
        fullOnTabletMobile ? 'p-0 lg:p-s4' : 'p-s4'
      )}
      onClick={closeOnOverlayClick ? onClose : undefined}
    >
      <div
        ref={contentRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={title ? titleId : undefined}
        tabIndex={-1}
        className={cn(
          'w-full rounded-lg border border-border bg-surface-default p-s6 shadow-md',
          'max-h-[100vh] overflow-hidden',
          'md:w-[90%]',
          widthClass(width, fullOnTabletMobile)
        )}
        onClick={(event) => event.stopPropagation()}
      >
        {(title || showCloseIcon) ? (
          <div className="mb-s4 flex items-start justify-between gap-s2">
            {title ? (
              <h3 id={titleId} className="text-[20px] font-semibold text-text-primary">
                {title}
              </h3>
            ) : (
              <span />
            )}

            {showCloseIcon ? (
              <Button variant="ghost" size="sm" onClick={onClose} aria-label="Close modal">
                <X className="size-4" />
              </Button>
            ) : null}
          </div>
        ) : null}

        <div className="max-h-[calc(70vh-120px)] overflow-y-auto">{children}</div>

        {footer ? <div className="mt-s6 flex items-center justify-end gap-s2">{footer}</div> : null}
      </div>
    </div>
  );
}
