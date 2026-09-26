import { cn } from '@/lib/cn';

/** Page title on the left, primary actions on the right. Wraps on narrow screens. */
export function PageHeader({ title, subtitle, actions, className }) {
  return (
    <div className={cn('flex flex-wrap items-center justify-between gap-3', className)}>
      <div className="flex min-w-0 flex-col">
        <h1 className="text-xl font-semibold text-ink-primary">{title}</h1>
        {subtitle && <p className="text-xs text-ink-secondary">{subtitle}</p>}
      </div>
      {actions && <div className="flex items-center gap-3">{actions}</div>}
    </div>
  );
}
