import { Badge } from '@/components/ui/Badge';
import { cn } from '@/lib/cn';

/**
 * Toggle chip used for quick filters (Blockers / Delayed / Due Today).
 * Pass a Badge `variant` for a coloured chip, or omit it for a plain text chip.
 */
export function FilterChip({ active, onClick, variant, children }) {
  return (
    <button type="button" onClick={onClick} aria-pressed={active} className={cn('rounded-chip transition-shadow', active && 'ring-2 ring-action-primary-ring')}>
      {variant ? (
        <Badge variant={variant} shape="chip" dot size="sm">{children}</Badge>
      ) : (
        <span className={cn('inline-block rounded-chip px-2 py-1 text-[11px] font-medium', active ? 'bg-surface-table-head text-ink-primary' : 'text-ink-secondary')}>{children}</span>
      )}
    </button>
  );
}
