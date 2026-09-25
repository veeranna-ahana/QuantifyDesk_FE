import { useEffect } from 'react';
import { X } from 'lucide-react';

import { Badge } from '@/components/ui/Badge';
import { IconButton } from '@/components/ui/IconButton';

/** Right-hand slide-in panel (Edit Task Details). */
export function Drawer({ open, title, taskId, context, onClose, footer, children }) {
  useEffect(() => {
    if (!open) return undefined;
    const onKey = (e) => e.key === 'Escape' && onClose?.();
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      <button type="button" aria-label="Close panel" className="absolute inset-0 cursor-default bg-black/40" onClick={onClose} />
      <aside role="dialog" aria-modal="true" aria-label={title} className="relative flex h-full w-full max-w-[420px] flex-col bg-surface-card shadow-2xl">
        <header className="flex items-start justify-between gap-3 border-b border-line-card bg-surface-table-head px-5 py-4">
          <div className="flex min-w-0 flex-col gap-1">
            {taskId && <Badge variant="brand" shape="chip" size="sm" className="self-start font-mono">{taskId}</Badge>}
            <h2 className="text-base font-semibold text-ink-primary">{title}</h2>
            {context && <p className="text-xs text-ink-secondary">{context}</p>}
          </div>
          <IconButton label="Close" variant="neutral" onClick={onClose}><X className="h-4 w-4" /></IconButton>
        </header>
        <div className="flex flex-1 flex-col gap-4 overflow-y-auto px-5 py-4">{children}</div>
        {footer && <footer className="flex justify-end gap-3 border-t border-line-card px-5 py-3">{footer}</footer>}
      </aside>
    </div>
  );
}
