import { Card } from "@/components/ui/Card";
import { BarChart3 } from "lucide-react";
import { cn } from "@/lib/cn";

import { SkillMembersPopover } from "./SkillMembersPopover";

const LEGEND = [
  { key: "available", label: "Avail (100%)", className: "bg-progress-success" },
  { key: "partial", label: "Partial (50%)", className: "bg-progress-warning" },
  { key: "allocated", label: "Allocated (0%)", className: "bg-progress-danger" },
];

function SkillAvailabilityBar({ skill }) {
  return (
    <div
      className="flex h-3 overflow-hidden rounded-full bg-[color:var(--color-member-chart-track)]"
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
    <Card className="flex min-h-[var(--size-skill-capacity-card-height)] flex-col gap-1.5 rounded-chip border-0 px-6 py-4 shadow-header">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <span className="flex h-8 w-8 items-center justify-center rounded-control bg-[color:var(--color-member-chart-icon-bg)] text-action-primary">
            <BarChart3 className="h-4 w-4" aria-hidden="true" />
          </span>
          <h2 className="text-[length:var(--font-size-skill-card-heading)] font-semibold leading-6 text-[color:var(--color-member-chart-heading)]">
            Skill Capacity &amp; Availability Breakdown
          </h2>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          {LEGEND.map((item) => (
            <span
              key={item.key}
              className="inline-flex items-center gap-1 text-[length:var(--font-size-skill-legend)] font-medium tracking-[0.33px] text-[color:var(--color-member-chart-text)]"
            >
              <span className={cn("h-2.5 w-2.5 rounded-sm", item.className)} />
              {item.label}
            </span>
          ))}
        </div>
      </div>
      <div className="flex flex-col gap-2 pt-1">
        {skills.map((skill) => (
          <div key={skill.name} className="group relative flex flex-col gap-1">
            <div
              className="flex h-[18px] flex-wrap items-center justify-between gap-1 text-[length:var(--font-size-skill-row)] leading-[18px]"
              tabIndex={skill.name === "Figma" ? 0 : undefined}
              aria-describedby={skill.name === "Figma" ? "figma-skill-members" : undefined}
            >
              <span className={`${skill.name === "Figma" ? "font-bold" : "font-medium"} text-[color:var(--color-member-chart-heading)]`}>
                <span className="mr-1.5 inline-block h-2 w-2 rounded-full bg-action-primary" />
                {skill.name} ({skill.total} total)
              </span>
              <span className="text-[length:var(--font-size-skill-count)] font-medium leading-[14px] tracking-[0.33px] text-[color:var(--color-member-chart-text)]">
                Member: {skill.available} Avail · {skill.partial} Partial ·{" "}
                {skill.allocated} Allocated
              </span>
            </div>
            <SkillAvailabilityBar skill={skill} />
            {skill.name === "Figma" && <SkillMembersPopover />}
          </div>
        ))}
      </div>
    </Card>
  );
}
