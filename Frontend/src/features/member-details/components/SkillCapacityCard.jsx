import { Card } from "@/components/ui/Card";
import { BarChart3 } from "lucide-react";
import { cn } from "@/lib/cn";

const LEGEND = [
  { key: "available", label: "Avail (100%)", className: "bg-progress-success" },
  { key: "partial", label: "Partial (50%)", className: "bg-badge-warning-ink" },
  { key: "allocated", label: "Allocated (0%)", className: "bg-badge-danger-ink" },
];

function SkillAvailabilityBar({ skill }) {
  return (
    <div
      className="flex h-3 overflow-hidden rounded-full bg-surface-field-disabled"
      role="img"
      aria-label={`${skill.name}: ${skill.available} available, ${skill.partial} partial, ${skill.allocated} allocated`}
    >
      {LEGEND.map(({ key, className }) => (
        <span
          key={key}
          className={cn("h-full", className)}
          style={{ width: `${(skill[key] / skill.total) * 100}%` }}
        />
      ))}
    </div>
  );
}

export function SkillCapacityCard({ skills }) {
  return (
    <Card className="flex flex-col gap-3 p-4 shadow-none">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <span className="flex h-7 w-7 items-center justify-center rounded-control bg-badge-brand-bg text-action-primary">
            <BarChart3 className="h-4 w-4" aria-hidden="true" />
          </span>
          <h2 className="text-[length:var(--font-size-skill-card-heading)] font-semibold text-ink-primary">
            Skill Capacity &amp; Availability Breakdown
          </h2>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          {LEGEND.map((item) => (
            <span
              key={item.key}
              className="inline-flex items-center gap-1 text-[length:var(--font-size-skill-legend)] font-medium text-ink-secondary"
            >
              <span className={cn("h-2 w-2 rounded-sm", item.className)} />
              {item.label}
            </span>
          ))}
        </div>
      </div>
      <div className="flex flex-col gap-2.5">
        {skills.map((skill) => (
          <div key={skill.name} className="flex flex-col gap-1">
            <div className="flex flex-wrap items-center justify-between gap-1 text-[length:var(--font-size-skill-row)]">
              <span className="font-semibold text-ink-secondary">
                <span className="mr-1.5 inline-block h-2 w-2 rounded-full bg-action-primary" />
                {skill.name} ({skill.total} total)
              </span>
              <span className="text-[length:var(--font-size-skill-count)] font-medium text-ink-secondary">
                Member: {skill.available} Avail · {skill.partial} Partial ·{" "}
                {skill.allocated} Allocated
              </span>
            </div>
            <SkillAvailabilityBar skill={skill} />
          </div>
        ))}
      </div>
    </Card>
  );
}
