import { Layers2, X } from "lucide-react";

import { decodeEntities, formatExperience } from "../utils";

/**
 * Click-triggered list of the members who have a skill (previously hover-triggered — see
 * SkillCapacityCard.jsx's SkillRow for why that changed: hovering a bar made it impossible to
 * interact with the chart underneath it).
 *
 * `open` is controlled entirely by SkillRow's click-toggle state. Since there's no more "move
 * the mouse away" to dismiss it, SkillRow also closes it on an outside click / Escape, and this
 * component adds an explicit close button for the same reason — a click target needs a visible
 * way to go away again, not just an implicit one.
 */
export function SkillMembersPopover({ id, skill, open, onClose }) {
  return (
    <div
      id={id}
      role="dialog"
      aria-label={`${skill.skill_name} members`}
      aria-hidden={!open}
      className={[
        "absolute left-1/2 top-10 z-20 w-[var(--size-skill-popover-width)] -translate-x-1/2",
        "rounded-chip border border-[color:var(--color-member-popover-border)]",
        "bg-surface-card p-4 shadow-[var(--shadow-member-popover)]",
        "transition-[opacity,visibility] duration-150",
        open
          ? "visible opacity-100"
          : "invisible opacity-0 pointer-events-none",
      ].join(" ")}
    >
      <span className="absolute -top-2 left-1/2 h-4 w-4 -translate-x-1/2 rotate-45 border-l border-t border-[color:var(--color-member-popover-border)] bg-surface-card" />
      <div className="relative flex flex-col gap-2">
        <div className="flex h-[29px] items-center justify-between border-b border-[color:var(--color-member-popover-divider)] pb-1">
          <h3 className="text-base font-bold leading-6 text-[color:var(--color-member-chart-heading)]">
            {skill.skill_name}
          </h3>
          <div className="flex items-center gap-2">
            <Layers2
              className="h-4 w-4 text-action-primary"
              aria-hidden="true"
            />
            <button
              type="button"
              aria-label={`Close ${skill.skill_name} members`}
              className="flex h-5 w-5 items-center justify-center rounded-sm text-ink-muted hover:text-ink-primary"
              onClick={onClose}
            >
              <X className="h-3.5 w-3.5" aria-hidden="true" />
            </button>
          </div>
        </div>
        <div className="flex max-h-[300px] flex-col gap-2 overflow-y-auto">
          {skill.employees.map((member) => (
            <div
              key={member.emp_id}
              className="flex flex-col gap-1 rounded-sm border border-line-card bg-[color:var(--color-member-popover-row-bg)] p-1.5"
            >
              <div className="flex items-center justify-between gap-2">
                <span className="text-[13px] font-semibold leading-[18px] text-[color:var(--color-member-chart-heading)]">
                  {decodeEntities(member.emp_name)}
                </span>
                <span className="whitespace-nowrap text-[11px] font-medium leading-[14px] tracking-[0.33px] text-[color:var(--color-member-chart-text)]">
                  {formatExperience(member.experience_years)}
                </span>
              </div>
              {member.designation && (
                <span className="text-[11px] font-medium leading-[14px] tracking-[0.33px] text-[color:var(--color-member-chart-text)]">
                  {decodeEntities(member.designation)}
                </span>
              )}
              <div className="flex flex-wrap gap-1">
                {(member.projects || []).map((project, i) => (
                  <span
                    key={`${project}-${i}`}
                    className="rounded-sm bg-[color:var(--color-member-popover-tag-bg)] px-1 text-[11px] font-medium leading-[14px] tracking-[0.33px] text-[color:var(--color-member-chart-text)]"
                  >
                    {project}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
