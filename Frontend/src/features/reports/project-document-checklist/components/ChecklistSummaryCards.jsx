import { AlertTriangle, Building2, CircleCheck, LoaderCircle } from "lucide-react";

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
    icon: LoaderCircle,
    format: (value) => `${value}%`,
  },
];

const TONE_STYLES = {
  brand: "text-action-primary bg-badge-brand-bg",
  success: "text-badge-success-ink bg-badge-success-bg",
  danger: "text-badge-danger-ink bg-badge-danger-bg",
};

export function ChecklistSummaryCards({ summary }) {
  return (
    <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
      {SUMMARY_ITEMS.map((item) => {
        const Icon = item.icon;
        return (
          <Card
            key={item.key}
            className="flex min-h-[68px] items-center justify-between gap-2 px-3 py-2.5 shadow-none"
          >
            <div className="flex min-w-0 flex-col gap-1">
              <span
                className={`truncate text-[11px] font-semibold ${
                  item.tone === "danger"
                    ? "text-badge-danger-ink"
                    : "text-ink-secondary"
                }`}
              >
                {item.label}
              </span>
              <span
                className={`text-base font-bold ${
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
              className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-chip ${TONE_STYLES[item.tone]}`}
            >
              <Icon
                className="h-5 w-5"
                aria-hidden="true"
                strokeWidth={item.key === "complianceRate" ? 2.5 : 2}
              />
            </span>
          </Card>
        );
      })}
    </div>
  );
}
