import { AlertTriangle, Building2, CircleCheck } from "lucide-react";

import { Card } from "@/components/ui/Card";

const SUMMARY_ITEMS = [
  {
    key: "totalProjects",
    label: "Total Projects",
    tone: "brand",
    icon: Building2,
    format: (value) => value,
  },
  {
    key: "uploadedDocuments",
    label: "Uploaded Documents",
    tone: "success",
    icon: CircleCheck,
    format: (value) => value,
  },
  {
    key: "pendingDocuments",
    label: "Pending Documents",
    tone: "danger",
    icon: AlertTriangle,
    format: (value) => value,
  },
  {
    key: "complianceRate",
    label: "Compliance Rate",
    tone: "brand",
    ring: true,
    format: (value) => `${value}%`,
  },
];

/** Circular gauge that fills to `value` percent (0-100). */
function ComplianceRing({ value }) {
  const radius = 8;
  const circumference = 2 * Math.PI * radius;
  const percent = Math.min(100, Math.max(0, Number(value) || 0));
  return (
    <svg
      className="h-5 w-5 -rotate-90"
      viewBox="0 0 20 20"
      role="img"
      aria-label={`${percent}% compliant`}
    >
      <circle
        cx="10"
        cy="10"
        r={radius}
        fill="none"
        stroke="currentColor"
        strokeOpacity="0.2"
        strokeWidth="2.5"
      />
      <circle
        cx="10"
        cy="10"
        r={radius}
        fill="none"
        stroke="currentColor"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeDasharray={circumference}
        strokeDashoffset={circumference * (1 - percent / 100)}
      />
    </svg>
  );
}

const TONE_STYLES = {
  brand: "text-action-primary bg-surface-table-head",
  success: "text-badge-success-ink bg-badge-success-bg",
  danger: "text-badge-danger-ink bg-badge-danger-bg",
};

export function ChecklistSummaryCards({ summary }) {
  return (
    <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
      {SUMMARY_ITEMS.map((item) => {
        return (
          <Card
            key={item.key}
            className="flex h-20 items-start justify-between gap-2 rounded-xl p-4"
          >
            <div className="flex min-w-0 flex-col gap-1">
              <span
                className={`truncate text-xs font-semibold tracking-[0.55px] ${
                  item.tone === "danger"
                    ? "text-badge-danger-ink"
                    : "text-ink-secondary"
                }`}
              >
                {item.label}
              </span>
              <span
                className={`text-xl font-bold leading-9 tracking-[-0.56px] ${
                  item.tone === "danger"
                    ? "text-badge-danger-ink"
                    : item.tone === "brand"
                      ? "text-action-primary"
                      : "text-ink-primary"
                }`}
              >
                {item.format(summary[item.key])}
              </span>
            </div>
            <span
              className={`flex h-10 shrink-0 items-center justify-center rounded-control px-2 ${TONE_STYLES[item.tone]}`}
            >
              {item.ring ? (
                <ComplianceRing value={summary[item.key]} />
              ) : (
                <item.icon className="h-5 w-5" aria-hidden="true" />
              )}
            </span>
          </Card>
        );
      })}
    </div>
  );
}
