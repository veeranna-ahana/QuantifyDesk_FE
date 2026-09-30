import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/cn';

function pageList(page, total, showEllipsis = false) {
  if (showEllipsis) {
    const pages = [1, 2, 3];
    return [...pages, '…'];
  }
  if (total <= 5) return Array.from({ length: total }, (_, i) => i + 1);
  const list = new Set([1, 2, 3, total]);
  [page - 1, page, page + 1].forEach((n) => n > 0 && n <= total && list.add(n));
  const sorted = [...list].sort((a, b) => a - b);
  return sorted.flatMap((n, i) => (i > 0 && n - sorted[i - 1] > 1 ? ['…', n] : [n]));
}

const btn = 'flex h-8 w-8 items-center justify-center rounded-[8px] border text-xs transition-colors disabled:cursor-not-allowed disabled:opacity-50 select-none';

/** Props-driven footer: "Showing 1-10 of 145 tasks   < 1 2 3 ... >" */
export function Pagination({
  page,
  totalPages,
  totalItems,
  pageSize,
  onPageChange,
  itemLabel = 'items',
  hideLabel = false,
  showEllipsis = false,
  className
}) {
  if (!totalItems) return null;
  const start = (page - 1) * pageSize + 1;
  const end = Math.min(page * pageSize, totalItems);
  return (
    <div className={cn('flex flex-wrap items-center justify-between gap-2 border-t border-line-table-head bg-surface-table-head px-4 py-2', className)}>
      {!hideLabel && (
        <span className="text-xs text-ink-secondary">
          Showing <b className="font-semibold text-ink-primary">{start}-{end}</b> of <b className="font-semibold text-ink-primary">{totalItems}</b> {itemLabel}
        </span>
      )}
      <nav aria-label="Pagination" className="flex items-center gap-1">
        <button
          type="button"
          aria-label="Previous page"
          disabled={page <= 1}
          onClick={() => onPageChange(page - 1)}
          className={cn(btn, 'border-line-card bg-surface-card text-ink-muted disabled:text-ink-muted/40')}
        >
          <ChevronLeft className="h-4 w-4" />
        </button>
        {pageList(page, totalPages, showEllipsis).map((p, i) =>
          p === '…' ? (
            <span key={`gap${i}`} className="flex h-8 w-8 items-center justify-center text-[12px] font-normal text-[#94A3B8] border-0 select-none">
              ...
            </span>
          ) : (
            <button
              key={p}
              type="button"
              aria-current={p === page ? 'page' : undefined}
              onClick={() => onPageChange(p)}
              className={cn(
                btn,
                p === page
                  ? 'border-transparent bg-action-primary text-white font-semibold'
                  : 'border-line-card bg-surface-card text-ink-secondary font-medium hover:bg-surface-field-disabled'
              )}
            >
              {p}
            </button>
          ),
        )}
        <button
          type="button"
          aria-label="Next page"
          disabled={page >= totalPages && !showEllipsis}
          onClick={() => onPageChange(page + 1)}
          className={cn(btn, 'border-line-card bg-surface-card text-ink-secondary')}
        >
          <ChevronRight className="h-4 w-4" />
        </button>
      </nav>
    </div>
  );
}
