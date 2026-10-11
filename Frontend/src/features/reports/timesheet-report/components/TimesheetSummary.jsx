import { Badge } from "@/components/ui/Badge";

function SummaryItem({ label, value, variant }) {
  return (
    <Badge
      variant={variant}
      shape="pill"
      size="sm"
      dot
      className="px-2 py-1.5 font-medium"
    >
      <span>{label}:</span>
      <span className="font-semibold">{value.toLocaleString()} hrs</span>
    </Badge>
  );
}

export function TimesheetSummary({ summary, className = "" }) {
  return (
    <div className={`flex flex-wrap items-center gap-2 ${className}`}>
      <SummaryItem label="Total Hours" value={summary.total} variant="neutral" />
      <SummaryItem label="Approved" value={summary.approved} variant="success" />
      <SummaryItem label="Pending" value={summary.pending} variant="warning" />
    </div>
  );
}
