import { BadgeCheck, BriefcaseBusiness, UserRoundCheck, UsersRound } from "lucide-react";

import { Card } from "@/components/ui/Card";

const SUMMARY_ITEMS = [
  {
    key: "totalResources",
    label: "Total Resources",
  },
  {
    key: "fullyAllocated",
    label: "Fully Allocated",
  },
  {
    key: "partiallyAllocated",
    label: "Partially Allocated",
  },
  {
    key: "immediatelyAvailable",
    label: "Immediate Available",
  },
];

function SummaryIcon({ type }) {
  const iconProps = {
    className:
      "h-[var(--size-member-summary-icon-glyph)] w-[var(--size-member-summary-icon-glyph)]",
    "aria-hidden": true,
  };
  if (type === "fullyAllocated") return <BriefcaseBusiness {...iconProps} />;
  if (type === "partiallyAllocated") return <UserRoundCheck {...iconProps} />;
  if (type === "immediatelyAvailable") return <BadgeCheck {...iconProps} />;
  return <UsersRound {...iconProps} />;
}

export function MemberSummaryCards({ summary }) {
  return (
    <div className="grid w-full grid-cols-2 gap-2.5 sm:grid-cols-4">
      {SUMMARY_ITEMS.map(({ key, label }) => (
        <Card
          key={key}
          className="flex h-[var(--size-member-summary-card-height)] items-center justify-start gap-2.5 px-3 py-2 shadow-none"
        >
          <span className="flex h-[var(--size-member-summary-icon)] w-[var(--size-member-summary-icon)] shrink-0 items-center justify-center rounded-control bg-badge-brand-bg text-action-primary">
            <SummaryIcon type={key} />
          </span>
          <div className="flex min-w-0 flex-col gap-0.5">
            <span className="text-[length:var(--font-size-member-summary-value)] font-semibold leading-6 text-ink-primary">
              {summary[key]}
            </span>
            <span className="truncate text-[length:var(--font-size-member-summary-label)] font-medium text-ink-secondary">
              {label}
            </span>
          </div>
        </Card>
      ))}
    </div>
  );
}
