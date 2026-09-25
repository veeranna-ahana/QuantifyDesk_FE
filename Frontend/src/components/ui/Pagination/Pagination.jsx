import { ChevronLeft, ChevronRight } from 'lucide-react';

import { cn } from '@/lib/cn';

function pageList(page, total) {
  if (total <= 5) return Array.from({ length: total }, (_, i) => i + 1);
  const list = new Set([1, 2, 3, total]);
  [page - 1, page, page + 1].forEach((n) => n > 0 && n <= total && list.add(n));
  const sorted = [...list].sort((a, b) => a - b);
  return sorted.flatMap((n, i) => (i > 0 && n - sorted[i - 1] > 1 ? ['…', n] : [n]));
}

const btn = 'flex h-8 w-8 items-center justify-center rounded-control border text-xs font-semibold transition-colors disabled:cursor-not-allowed disabled:opacity-50';

/** Props-driven footer: "Showing 1-10 of 145 tasks   < 1 2 3 ... >" */
export function Pagination({ page, totalPages, totalItems, pageSize, onPageChange, itemLabel = 'items', className }) {
  if (!totalItems) return null;
  const start = (page - 1) * pageSize + 1;
  const end = Math.min(page * pageSize, totalItems);
  return (
    <div className={cn('flex flex-wrap items-center justify-between gap-2 border-t border-line-table-head bg-surface-table-head px-4 py-2', className)}>
      <span className="text-xs text-ink-secondary">
        Showing <b className="font-semibold text-ink-primary">{start}-{end}</b> of <b className="font-semibold text-ink-primary">{totalItems}</b> {itemLabel}
      </span>
      <nav aria-label="Pagination" className="flex items-center gap-1.5">
        <button type="button" aria-label="Previous page" disabled={page <= 1} onClick={() => onPageChange(page - 1)} className={cn(btn, 'border-line-field bg-surface-card text-ink-secondary')}>
          <ChevronLeft className="h-4 w-4" />
        </button>
        {pageList(page, totalPages).map((p, i) =>
          p === '…' ? (
            <span key={`gap${i}`} className="w-5 text-center text-xs text-ink-muted">…</span>
          ) : (
            <button
              key={p}
              type="button"
              aria-current={p === page ? 'page' : undefined}
              onClick={() => onPageChange(p)}
              className={cn(btn, p === page ? 'border-action-primary bg-action-primary text-ink-on-primary' : 'border-line-field bg-surface-card text-ink-secondary hover:bg-surface-field-disabled')}
            >
              {p}
            </button>
          ),
        )}
        <button type="button" aria-label="Next page" disabled={page >= totalPages} onClick={() => onPageChange(page + 1)} className={cn(btn, 'border-line-field bg-surface-card text-ink-secondary')}>
          <ChevronRight className="h-4 w-4" />
        </button>
      </nav>
    </div>
  );
}
