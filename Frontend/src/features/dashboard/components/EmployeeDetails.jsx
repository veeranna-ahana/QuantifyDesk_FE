import { Badge } from "@/components/ui/Badge";
import { Card } from "@/components/ui/Card";
import { ProgressBar } from "@/components/ui/ProgressBar";
import { cn } from "@/lib/cn";

const KPI_ACCENT = [
  "border-l-action-primary",
  "border-l-badge-info-ink",
  "border-l-badge-success-ink",
  "border-l-badge-warning-ink",
];

function statBoxClass(label, tone) {
  if (label.startsWith("COMPLETED"))
    return "border-badge-success-line bg-badge-success-bg text-badge-success-ink";
  if (label.startsWith("PENDING"))
    return "border-badge-warning-line bg-badge-warning-bg text-badge-warning-ink";
  if (label.startsWith("LOGGED") && tone === "danger")
    return "border-badge-danger-line bg-badge-danger-bg text-badge-danger-ink";
  if (label.startsWith("LOGGED"))
    return "border-transparent bg-surface-page text-badge-success-ink";
  return "border-transparent bg-surface-page text-action-primary";
}

function KpiCard({ label, value, caption, accent }) {
  return (
    <div
      className={cn(
        "flex flex-col gap-1 rounded-chip border border-line-card border-l-[3px] bg-surface-card px-4 py-3 shadow-header",
        accent,
      )}
    >
      <span className="text-[10px] font-semibold uppercase tracking-wider text-ink-muted">
        {label}
      </span>
      <span className="text-xl font-bold leading-tight text-ink-primary">
        {value}
      </span>
      <span className="text-[11px] text-ink-secondary">{caption}</span>
    </div>
  );
}

function AllocationCard({ project: p }) {
  return (
    <Card className="flex flex-col gap-2.5 p-4">
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-1.5">
          <Badge
            variant="neutral"
            shape="chip"
            size="sm"
            className="text-[10px] font-semibold"
          >
            {p.code}
          </Badge>
          {p.role && (
            <Badge
              variant="brand"
              shape="chip"
              size="sm"
              className="text-[10px] font-semibold"
            >
              {p.role}
            </Badge>
          )}
        </div>
        <span className="text-[11px] text-ink-muted">{p.meta}</span>
      </div>
      <div className="text-sm font-bold text-ink-primary">{p.name}</div>
      <ProgressBar value={p.pct} tone={p.barTone ?? "brand"} />
      <div className="text-[11px] text-ink-secondary">{p.statusText}</div>
      <div className="grid grid-cols-4 gap-2">
        {p.stats.map((s) => (
          <div
            key={s.label}
            className={cn(
              "flex flex-col items-center gap-0.5 rounded-chip border px-1 py-2",
              statBoxClass(s.label, s.tone),
            )}
          >
            <span className="text-[9px] font-semibold uppercase tracking-wider">
              {s.label}
            </span>
            <span className="text-[15px] font-bold leading-tight">
              {s.value}
            </span>
          </div>
        ))}
      </div>
    </Card>
  );
}

export function EmployeeDetails({ employee: e }) {
  return (
    <div className="flex flex-col gap-4">
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        {(e.kpis || []).map((k, i) => (
          <KpiCard
            key={k.label}
            label={k.label}
            value={k.value}
            caption={k.sub}
            accent={KPI_ACCENT[i % 4]}
          />
        ))}
      </div>
      {e.matrix?.length > 0 && (
        <div className="flex flex-col gap-2.5">
          <h3 className="text-[11px] font-semibold uppercase tracking-wider text-ink-muted">
            Project Allocation Matrix
          </h3>
          <div className="grid grid-cols-1 gap-3 xl:grid-cols-2">
            {e.matrix.map((p) => (
              <AllocationCard key={p.code} project={p} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
