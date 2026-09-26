import { cn } from '@/lib/cn';

/** Underline tab bar (project view: Overview / Info / Task Info ...). Scrolls sideways on small screens. */
export function Tabs({ items, value, onChange, className }) {
  return (
    <div role="tablist" className={cn('flex gap-6 overflow-x-auto border-b border-line-card', className)}>
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
              '-mb-px whitespace-nowrap border-b-2 px-1 pb-2 pt-1 text-[13px] font-medium transition-colors',
              active ? 'border-action-primary text-action-primary' : 'border-transparent text-ink-secondary hover:text-ink-primary',
            )}
          >
            {t.label}
          </button>
        );
      })}
    </div>
  );
}
