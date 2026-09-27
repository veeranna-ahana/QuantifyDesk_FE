import { cn } from '@/lib/cn';

/**
 * Segmented filter with optional counts (All 145 / In Progress 36 / Completed 59).
 * items: [{ id, label, count? }]
 */
export function FilterTabs({ items, value, onChange, className }) {
  return (
    <div role="tablist" className={cn('inline-flex max-w-full flex-nowrap items-center gap-1 rounded-chip bg-surface-table-head p-1', className)}>
      {items.map((t) => {
        const active = t.id === value;
        return (
          <button
            key={t.id}
            role="tab"
            type="button"
            aria-selected={active}
            onClick={() => onChange(t.id)}
            className={cn(
              'inline-flex shrink-0 whitespace-nowrap items-center gap-1.5 rounded-control px-3 py-1 text-xs font-medium transition-colors',
              active ? 'bg-action-primary text-ink-on-primary' : 'text-ink-secondary hover:bg-surface-card',
            )}
          >
            {t.label}
            {t.count !== undefined && (
              <span
                className={cn(
                  'rounded-full px-1.5 text-[11px]',
                  active
                    ? 'bg-white/25'
                    : t.countVariant === 'success'
                      ? 'bg-badge-success-bg text-badge-success-ink'
                      : 'bg-badge-info-bg text-badge-info-ink',
                )}
              >
                {t.count}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}
