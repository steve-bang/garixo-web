'use client';

import { X } from 'lucide-react';
import type { ReactNode } from 'react';
import { useId, useRef } from 'react';

import { Button } from '@/components/ui/button';
import { useModalA11y } from '@/components/ui/modal/useModalA11y';
import { cn } from '@/lib/utils/cn';

export interface DrawerProps {
  open: boolean;
  onClose: () => void;
  title?: string;
  description?: string;
  children: ReactNode;
  footer?: ReactNode;
  width?: 'sm' | 'md' | 'lg' | 'xl';
  closeOnOverlayClick?: boolean;
  disableClose?: boolean;
}

function widthClass(width: DrawerProps['width']): string {
  if (width === 'sm') return 'lg:max-w-[360px]';
  if (width === 'lg') return 'lg:max-w-[520px]';
  if (width === 'xl') return 'lg:max-w-[640px]';
  return 'lg:max-w-[420px]';
}

export function Drawer({
  open,
  onClose,
  title,
  description,
  children,
  footer,
  width = 'md',
  closeOnOverlayClick = true,
  disableClose = false
}: DrawerProps): JSX.Element | null {
  const titleId = useId();
  const descriptionId = useId();
  const contentRef = useRef<HTMLDivElement | null>(null);

  const handleClose = () => {
    if (disableClose) {
      return;
    }
    onClose();
  };

  useModalA11y({ open, container: contentRef.current, onClose: handleClose });

  if (!open) {
    return null;
  }

  return (
    <div
      className="fixed inset-0 z-50 bg-black/40 animate-drawer-overlay-in"
      onClick={closeOnOverlayClick && !disableClose ? handleClose : undefined}
    >
      <div
        ref={contentRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={title ? titleId : undefined}
        aria-describedby={description ? descriptionId : undefined}
        tabIndex={-1}
        className={cn(
          'absolute inset-y-0 right-0 flex h-full w-full max-w-full flex-col border-l border-border bg-background-primary shadow-md',
          'md:max-w-[90vw]',
          widthClass(width),
          'animate-drawer-slide-in'
        )}
        onClick={(event) => event.stopPropagation()}
      >
        {(title || description) ? (
          <div className="flex items-start justify-between gap-s3 border-b border-border px-s6 py-s4">
            <div className="space-y-s1">
              {title ? (
                <h3 id={titleId} className="text-h3 font-semibold text-text-primary">
                  {title}
                </h3>
              ) : null}
              {description ? (
                <p id={descriptionId} className="text-small text-text-muted">
                  {description}
                </p>
              ) : null}
            </div>

            <Button variant="ghost" size="sm" className="h-10 w-10 p-0" onClick={handleClose} disabled={disableClose} aria-label="Close drawer">
              <X className="size-4" />
            </Button>
          </div>
        ) : null}

        <div className="flex-1 overflow-y-auto px-s6 py-s6">{children}</div>

        {footer ? <div className="border-t border-border px-s6 py-s4">{footer}</div> : null}
      </div>
    </div>
  );
}
