import { ContactRound, Share2, UserRoundPlus, UsersRound } from "lucide-react";

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
    className: `h-[var(--size-member-summary-${type === "immediatelyAvailable" ? "last-icon-glyph" : "icon-glyph"})] w-[var(--size-member-summary-${type === "immediatelyAvailable" ? "last-icon-glyph" : "icon-glyph"})]`,
    "aria-hidden": true,
  };
  if (type === "fullyAllocated") return <UserRoundPlus {...iconProps} />;
  if (type === "partiallyAllocated") return <Share2 {...iconProps} />;
  if (type === "immediatelyAvailable") return <ContactRound {...iconProps} />;
  return <UsersRound {...iconProps} />;
}

export function MemberSummaryCards({ summary }) {
  return (
    <div className="grid w-full grid-cols-2 gap-3 sm:grid-cols-4">
      {SUMMARY_ITEMS.map(({ key, label }) => (
        <Card
          key={key}
          className="flex h-[var(--size-member-summary-card-height)] items-center justify-start gap-[14.4px] rounded-xl px-5 py-0 shadow-[var(--shadow-member-summary)]"
        >
          <span className="flex h-[var(--size-member-summary-icon)] w-[var(--size-member-summary-icon)] shrink-0 items-center justify-center rounded-lg bg-[color:var(--color-member-summary-icon-bg)] text-action-primary">
            <SummaryIcon type={key} />
          </span>
          <div className="flex min-w-0 flex-col gap-0.5">
            <span className="text-[length:var(--font-size-member-summary-value)] font-bold leading-[29px] tracking-[-0.52px] text-[color:var(--color-member-title)]">
              {summary[key]}
            </span>
            <span className="truncate text-[length:var(--font-size-member-summary-label)] font-semibold leading-5 text-[color:var(--color-member-summary-label)]">
              {label}
            </span>
          </div>
        </Card>
      ))}
    </div>
  );
}
