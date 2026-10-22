import { useEffect, useRef, useState } from "react";

import { BarChart3 } from "lucide-react";

import { Card } from "@/components/ui/Card";

import { SkillMembersPopover } from "./SkillMembersPopover";

/**
 * One bar per skill, sized by how many members have it (relative to the biggest skill).
 * Avail / Partial / Allocated splits come back once allocation data exists.
 */
function SkillCountBar({ skill, maxCount }) {
  const width = maxCount
    ? Math.max(4, Math.round((skill.employee_count / maxCount) * 100))
    : 0;
  return (
    <div
      className="flex h-3 overflow-hidden rounded-full bg-[color:var(--color-member-chart-track)]"
      role="img"
      aria-label={`${skill.skill_name}: ${skill.employee_count} members`}
    >
      <span
        className="h-full rounded-full bg-action-primary"
        style={{ width: `${width}%` }}
      />
    </div>
  );
}

/**
 * A single skill row. The member popover opens on CLICK (not hover) — hovering made it
 * impossible to read or interact with the chart itself, since any pass over a bar popped a
 * list open on top of it. Click toggles it; clicking elsewhere, pressing Escape, or clicking
 * the row again closes it, since there's no more "move the mouse away" to dismiss it with.
 */
function SkillRow({ skill, maxCount, index }) {
  const [open, setOpen] = useState(false);
  const rowRef = useRef(null);
  const popoverId = `skill-members-${index}`;

  const toggleOpen = () => setOpen((prev) => !prev);

  const handleKeyDown = (event) => {
    // Enter/Space activate it like a real button would — the row is given role="button" below
    // precisely so this is expected keyboard behavior, not an extra.
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      toggleOpen();
    }
  };

  // Dismiss on an outside click or Escape — only wired up while open, so this isn't a global
  // listener sitting active for every row all the time.
  useEffect(() => {
    if (!open) return undefined;

    const handleOutsideClick = (event) => {
      if (rowRef.current && !rowRef.current.contains(event.target)) {
        setOpen(false);
      }
    };
    const handleEscape = (event) => {
      if (event.key === "Escape") setOpen(false);
    };

    document.addEventListener("mousedown", handleOutsideClick);
    document.addEventListener("keydown", handleEscape);
    return () => {
      document.removeEventListener("mousedown", handleOutsideClick);
      document.removeEventListener("keydown", handleEscape);
    };
  }, [open]);

  return (
    <div
      key={skill.skill_name}
      ref={rowRef}
      className="relative flex flex-col gap-1"
    >
      {/* Only the label + bar are the clickable target (not the popover itself below) — the
          popover is a sibling, not a child of this, so interacting inside it (e.g. scrolling
          the member list) can never bubble up into toggleOpen and immediately close it again. */}
      <div
        className="flex cursor-pointer flex-col gap-1"
        role="button"
        tabIndex={0}
        aria-expanded={open}
        aria-controls={popoverId}
        onClick={toggleOpen}
        onKeyDown={handleKeyDown}
      >
        <div className="flex h-[18px] flex-wrap items-center justify-between gap-1 text-[length:var(--font-size-skill-row)] leading-[18px]">
          <span className="font-medium text-[color:var(--color-member-chart-heading)]">
            <span className="mr-1.5 inline-block h-2 w-2 rounded-full bg-action-primary" />
            {skill.skill_name}
          </span>
          <span className="text-[length:var(--font-size-skill-count)] font-medium leading-[14px] tracking-[0.33px] text-[color:var(--color-member-chart-text)]">
            {skill.employee_count}{" "}
            {skill.employee_count === 1 ? "Member" : "Members"}
          </span>
        </div>
        <SkillCountBar skill={skill} maxCount={maxCount} />
      </div>
      <SkillMembersPopover
        id={popoverId}
        skill={skill}
        open={open}
        onClose={() => setOpen(false)}
      />
    </div>
  );
}

export function SkillCapacityCard({
  skills,
  maxCount,
  loading = false,
  error = null,
}) {
  return (
    <Card className="flex min-h-[var(--size-skill-capacity-card-height)] flex-col gap-1.5 rounded-chip border-0 px-6 py-4 shadow-header">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <span className="flex h-8 w-8 items-center justify-center rounded-control bg-[color:var(--color-member-chart-icon-bg)] text-action-primary">
            <BarChart3 className="h-4 w-4" aria-hidden="true" />
          </span>
          <h2 className="text-[length:var(--font-size-skill-card-heading)] font-semibold leading-6 text-[color:var(--color-member-chart-heading)]">
            Skill Capacity Breakdown
          </h2>
        </div>
      </div>

      {loading && (
        <p className="py-6 text-center text-xs text-ink-muted">
          Loading skills...
        </p>
      )}
      {!loading && error && (
        <p className="py-6 text-center text-xs text-badge-danger-ink">
          {error}
        </p>
      )}
      {!loading && !error && skills.length === 0 && (
        <p className="py-6 text-center text-xs text-ink-muted">
          No skill data available.
        </p>
      )}

      <div className="flex flex-col gap-2 pt-1">
        {skills.map((skill, index) => (
          <SkillRow
            key={skill.skill_name}
            skill={skill}
            maxCount={maxCount}
            index={index}
          />
        ))}
      </div>
    </Card>
  );
}
