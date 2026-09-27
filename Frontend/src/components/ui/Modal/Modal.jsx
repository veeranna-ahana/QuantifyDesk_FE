import { useEffect } from 'react';
import { X } from 'lucide-react';

import { IconButton } from '@/components/ui/IconButton';
import { cn } from '@/lib/cn';

/**
 * Centered dialog (Add Link, Add Document, Edit Link...).
 * Layout: header (title + close) / body / footer (tinted, buttons right-aligned).
 */
export function Modal({ open, title, onClose, footer, children, className }) {
  useEffect(() => {
    if (!open) return undefined;
    const onKey = (e) => e.key === 'Escape' && onClose?.();
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <button type="button" aria-label="Close dialog" className="absolute inset-0 cursor-default bg-black/40" onClick={onClose} />
      <div role="dialog" aria-modal="true" aria-label={title} className={cn('relative flex max-h-full w-full max-w-md flex-col overflow-hidden rounded-chip bg-surface-card shadow-2xl', className)}>
        <header className="flex items-center justify-between border-b border-line-card px-5 py-3">
          <h2 className="text-sm font-semibold text-ink-primary">{title}</h2>
          <IconButton label="Close" variant="neutral" size="sm" onClick={onClose}><X className="h-4 w-4" /></IconButton>
        </header>
        <div className="flex flex-col gap-4 overflow-y-auto px-5 py-4">{children}</div>
        {footer && <footer className="flex justify-end gap-3 bg-surface-field-disabled px-5 py-3">{footer}</footer>}
      </div>
    </div>
  );
}
