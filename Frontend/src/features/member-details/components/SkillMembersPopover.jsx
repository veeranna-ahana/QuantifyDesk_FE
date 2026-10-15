import { Layers2 } from "lucide-react";

import { decodeEntities, formatExperience } from "../utils";

/**
 * Hover / keyboard-focus list of the members who have a skill.
 *
 * `open` is controlled by SkillCapacityCard's SkillRow (JS state with enter/leave
 * delay timers) — no longer driven by CSS group-hover, which caused adjacent rows
 * to flash immediately as the cursor moved between them.
 *
 * `onMouseEnter` / `onMouseLeave` are forwarded to the popover element itself so
 * that moving the cursor INTO the popover cancels the hide timer, letting the user
 * scroll through the member list without it disappearing.
 */
export function SkillMembersPopover({ id, skill, open, onMouseEnter, onMouseLeave }) {
  return (
    <div
      id={id}
      role="tooltip"
      aria-hidden={!open}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
      className={[
        "absolute left-1/2 top-10 z-20 w-[var(--size-skill-popover-width)] -translate-x-1/2",
        "rounded-chip border border-[color:var(--color-member-popover-border)]",
        "bg-surface-card p-4 shadow-[var(--shadow-member-popover)]",
        "transition-[opacity,visibility] duration-150",
        open ? "visible opacity-100" : "invisible opacity-0 pointer-events-none",
      ].join(" ")}
    >
      <span className="absolute -top-2 left-1/2 h-4 w-4 -translate-x-1/2 rotate-45 border-l border-t border-[color:var(--color-member-popover-border)] bg-surface-card" />
      <div className="relative flex flex-col gap-2">
        <div className="flex h-[29px] items-center justify-between border-b border-[color:var(--color-member-popover-divider)] pb-1">
          <h3 className="text-base font-bold leading-6 text-[color:var(--color-member-chart-heading)]">
            {skill.skill_name}
          </h3>
          <Layers2 className="h-4 w-4 text-action-primary" aria-hidden="true" />
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

