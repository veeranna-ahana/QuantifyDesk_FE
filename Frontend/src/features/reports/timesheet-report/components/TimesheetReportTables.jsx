import { useEffect, useRef } from "react";

import { Badge } from "@/components/ui/Badge";
import { cn } from "@/lib/cn";

function ParentCategoryPill({ value }) {
  if (!value) return <span className="text-ink-muted">—</span>;
  const str = String(value);
  const isProject = /proj/i.test(str);
  return (
    <Badge
      variant={isProject ? "brand" : "danger"}
      shape="pill"
      size="sm"
      title={str}
    >
      {str}
    </Badge>
  );
}

const thBase =
  "sticky top-0 z-10 h-11 border-b border-line-table-head bg-surface-table-head px-3 text-[12px] font-semibold text-ink-secondary whitespace-nowrap";
const tdBase =
  "border-b border-[#F1F5F9] px-3 py-2 align-top text-[12px] whitespace-normal break-words";

export function ProjectSummaryTable({ records = [], loading = false }) {
  const containerRef = useRef(null);

  useEffect(() => {
    if (containerRef.current) {
      containerRef.current.scrollTop = 0;
      containerRef.current.scrollLeft = 0;
    }
  }, [records]);

  return (
    <div
      ref={containerRef}
      className="h-full w-full flex-1 min-h-0 overflow-auto figma-table-scroll"
    >
      <table
        className="w-full border-separate border-spacing-0 text-left"
        style={{ tableLayout: "fixed" }}
      >
        <colgroup>
          <col style={{ width: "110px" }} />
          <col style={{ width: "290px" }} />
          <col style={{ width: "140px" }} />
          <col style={{ width: "90px" }} />
          <col style={{ width: "90px" }} />
          <col style={{ width: "100px" }} />
          <col style={{ width: "160px" }} />
        </colgroup>
        <thead>
          <tr>
            <th scope="col" className={cn(thBase, "text-center")}>
              Project Code
            </th>
            <th scope="col" className={thBase}>
              Project Name
            </th>
            <th scope="col" className={cn(thBase, "text-center")}>
              Customer Name
            </th>
            <th scope="col" className={cn(thBase, "text-center")}>
              <div className="flex flex-col items-center justify-center leading-tight">
                <span>Member</span>
                <span>Worked</span>
              </div>
            </th>
            <th scope="col" className={cn(thBase, "text-center")}>
              <span>Total Hrs</span>
            </th>
            <th scope="col" className={cn(thBase, "text-center")}>
              <div className="flex flex-col items-center justify-center leading-tight">
                <span>First Month</span>
                <span>Seen</span>
              </div>
            </th>
            <th scope="col" className={cn(thBase, "text-center")}>
              Parent Category
            </th>
          </tr>
        </thead>
        <tbody>
          {records.length === 0 ? (
            <tr>
              <td
                className="py-8 px-4 text-center text-[12px] text-ink-muted"
                colSpan={7}
              >
                {loading ? "Loading project summary..." : "No projects found."}
              </td>
            </tr>
          ) : (
            records.map((record, index) => {
              const code = record.projectCode || "—";
              const name = record.projectName || "—";
              const customer = record.customerName || "—";
              const members =
                record.memberCount != null ? record.memberCount : "—";
              const hours =
                record.totalHours != null
                  ? Number(record.totalHours).toFixed(1)
                  : null;
              const firstMonth =
                record.monthSeen || record.firstMonthSeen || "—";
              const parentCat = record.parentCategory || record.category || "";

              return (
                <tr
                  key={record.projectCode || index}
                  className="transition-colors hover:bg-surface-field-disabled"
                >
                  <td className={cn(tdBase, "text-center")}>
                    <span className="block w-full max-w-full whitespace-normal break-words rounded-md bg-badge-brand-bg px-2 py-0.5 text-[11px] font-semibold leading-4 text-badge-brand-ink">
                      {code}
                    </span>
                  </td>
                  <td className={tdBase}>
                    <span className="block whitespace-normal break-words font-normal text-ink-primary">
                      {name}
                    </span>
                  </td>
                  <td className={cn(tdBase, "text-center text-ink-muted")}>
                    {customer}
                  </td>
                  <td
                    className={cn(
                      tdBase,
                      "text-center font-medium text-ink-primary",
                    )}
                  >
                    {members}
                  </td>
                  <td
                    className={cn(
                      tdBase,
                      "text-center font-bold text-ink-primary",
                    )}
                  >
                    {hours != null ? `${hours} hrs` : "—"}
                  </td>
                  <td className={cn(tdBase, "text-center text-ink-secondary")}>
                    {firstMonth}
                  </td>
                  <td className={cn(tdBase, "overflow-visible text-center")}>
                    <ParentCategoryPill value={parentCat} />
                  </td>
                </tr>
              );
            })
          )}
        </tbody>
      </table>
    </div>
  );
}
