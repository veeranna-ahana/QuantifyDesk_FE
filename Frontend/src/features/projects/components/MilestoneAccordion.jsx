import { ChevronRight, ClipboardList } from 'lucide-react';

import { Badge } from '@/components/ui/Badge';
import { cn } from '@/lib/cn';
import { statusVariant } from '@/lib/status';

/** Collapsible milestone row: icon, name, progress pill, chevron. Children = the task table. */
export function MilestoneAccordion({ milestone, expanded, onToggle, children }) {
  return (
    <div className="overflow-hidden rounded-chip border border-line-card bg-surface-card">
      <button
        type="button"
        onClick={onToggle}
        aria-expanded={expanded}
        className="flex w-full items-center justify-between gap-3 px-3 py-2.5 text-left hover:bg-surface-field-disabled"
      >
        <span className="flex min-w-0 flex-wrap items-center gap-2 text-[13px]">
          <ClipboardList className="h-4 w-4 shrink-0 text-badge-info-ink" aria-hidden="true" />
          <span className="text-ink-muted">Milestone Name:</span>
          <span className="font-semibold text-ink-primary">{milestone.name}</span>
          <Badge variant={statusVariant(milestone.status)} dot size="sm">{milestone.statusText}</Badge>
        </span>
        <ChevronRight className={cn('h-4 w-4 shrink-0 text-ink-muted transition-transform', expanded && 'rotate-90')} />
      </button>
      {expanded && children}
    </div>
  );
}
