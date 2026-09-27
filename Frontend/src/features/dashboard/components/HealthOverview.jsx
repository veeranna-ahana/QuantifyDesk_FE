import { Card } from '@/components/ui/Card';
import { ProgressBar } from '@/components/ui/ProgressBar';
import { cn } from '@/lib/cn';

export function CardHeading({ title, count }) {
  return (
    <div className="flex items-center justify-between">
      <h2 className="text-sm font-semibold text-ink-primary">{title}</h2>
      <span className="text-xs text-ink-muted">{count}</span>
    </div>
  );
}

const COUNT_TONE = { danger: 'text-badge-danger-ink', warning: 'text-badge-warning-ink' };

export function HealthOverview({ rows, totalProjects }) {
  const total = rows.reduce((sum, r) => sum + r.count, 0);
  return (
    <Card className="flex flex-col gap-3 p-4">
      <CardHeading title="Project Health Overview" count={`${totalProjects} Projects`} />
      <div className="flex flex-col gap-3">
        {rows.map((r) => (
          <div key={r.label} className="flex flex-col gap-1">
            <div className="flex items-center justify-between text-[13px]">
              <span className="text-ink-secondary">{r.label}</span>
              <span className={cn('font-semibold', COUNT_TONE[r.tone] ?? 'text-ink-primary')}>{r.count}</span>
            </div>
            <ProgressBar value={total ? (r.count / total) * 100 : 0} tone={r.tone} />
          </div>
        ))}
      </div>
    </Card>
  );
}
