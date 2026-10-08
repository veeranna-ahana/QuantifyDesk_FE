import { Layers2 } from "lucide-react";

import { mockFigmaSkillMembers } from "../mock/mockMemberDetails";

const STATUS_STYLES = {
  available: {
    label: "bg-progress-success text-ink-on-primary",
    detail: "text-progress-success",
  },
  partial: {
    label: "bg-[color:var(--color-member-popover-warning-bg)] text-progress-warning",
    detail: "text-progress-warning",
  },
  allocated: {
    label:
      "bg-[color:var(--color-member-allocated-bg)] text-progress-danger",
    detail: "text-progress-danger",
  },
};

export function SkillMembersPopover() {
  return (
    <div
      id="figma-skill-members"
      role="tooltip"
      className="invisible absolute left-[36.3%] top-10 z-20 w-[var(--size-skill-popover-width)] rounded-chip border border-[color:var(--color-member-popover-border)] bg-surface-card p-4 opacity-0 shadow-[var(--shadow-member-popover)] transition-opacity group-hover:visible group-hover:opacity-100 group-focus-within:visible group-focus-within:opacity-100"
    >
      <span className="absolute -top-2 left-1/2 h-4 w-4 -translate-x-1/2 rotate-45 border-l border-t border-[color:var(--color-member-popover-border)] bg-surface-card" />
      <div className="relative flex flex-col gap-2">
        <div className="flex h-[29px] items-center justify-between border-b border-[color:var(--color-member-popover-divider)] pb-1">
          <h3 className="text-base font-bold leading-6 text-[color:var(--color-member-chart-heading)]">
            Figma
          </h3>
          <Layers2
            className="h-4 w-4 text-action-primary"
            aria-hidden="true"
          />
        </div>
        {mockFigmaSkillMembers.map((member) => {
          const status = STATUS_STYLES[member.status];
          return (
            <div
              key={member.name}
              className="flex h-[var(--size-skill-popover-row-height)] flex-col justify-between rounded-sm border border-line-card bg-[color:var(--color-member-popover-row-bg)] p-1"
            >
              <div className="flex items-center justify-between gap-2">
                <span className="text-[13px] font-semibold leading-[18px] text-[color:var(--color-member-chart-heading)]">
                  {member.name}
                </span>
                <span
                  className={`rounded-sm px-1.5 py-0.5 text-[10px] font-bold leading-[15px] ${status.label}`}
                >
                  {member.availability}
                </span>
              </div>
              <div className="flex items-center justify-between gap-2">
                <span
                  className={`whitespace-nowrap text-[11px] font-medium leading-[14px] tracking-[0.33px] ${status.detail}`}
                >
                  {member.workload}
                </span>
                <span className="whitespace-nowrap rounded-sm bg-[color:var(--color-member-popover-tag-bg)] px-1 text-[11px] font-medium leading-[14px] tracking-[0.33px] text-[color:var(--color-member-chart-text)]">
                  {member.skills}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
