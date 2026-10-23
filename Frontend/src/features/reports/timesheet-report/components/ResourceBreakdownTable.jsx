import { useEffect, useRef } from "react";
import Cookies from "js-cookie";
import { useSelector } from "react-redux";

import { Badge } from "@/components/ui/Badge";
import { cn } from "@/lib/cn";
import { formatCategory } from "../formatters";
import { ReportPagination } from "./ReportPagination";

export function ProjectCodeBadge({ children }) {
  return (
    <span className="block w-full max-w-full whitespace-normal break-words rounded-md bg-badge-brand-bg px-2 py-0.5 text-[11px] font-semibold leading-4 text-badge-brand-ink">
      {children || "—"}
    </span>
  );
}

export function CategoryTag({ category }) {
  const upper = String(category || "").toUpperCase();
  const isProject = upper.includes("PROJCT") || upper.includes("PROJECT");

  return (
    <Badge
      variant={isProject ? "brand" : "danger"}
      shape="pill"
      size="sm"
      title={category}
    >
      {formatCategory(category) || "—"}
    </Badge>
  );
}

export function ResourceBreakdownTable({
  rows = [],
  totalRecords,
  page,
  pageSize,
  onPageChange,
  loading = false,
}) {
  const containerRef = useRef(null);

  // Get current user ID to highlight logged-in user's hours.
  const reduxUser = useSelector((state) => state.auth?.user);
  let user = reduxUser;
  if (!user) {
    try {
      user = JSON.parse(Cookies.get("user") || "null");
    } catch {
      user = null;
    }
  }
  const currentUserId = user?.emp_id || localStorage.getItem("emp_id") || null;

  // Scroll to top on mount, tab change, and pagination
  useEffect(() => {
    if (containerRef.current) {
      containerRef.current.scrollTop = 0;
      containerRef.current.scrollLeft = 0;
    }
  }, [page, rows]);

  const thBase =
    "sticky top-0 z-[2] h-10 border-b border-line-table-head bg-surface-table-head px-3 text-[12px] font-semibold text-ink-secondary whitespace-nowrap";
  const tdBase =
    "border-b border-[#F1F5F9] px-2.5 py-1.5 align-top text-[12px] whitespace-normal break-words";

  return (
    <section className="flex min-h-0 flex-1 flex-col overflow-hidden rounded-xl border border-line-card bg-surface-card shadow-1">
      <div
        ref={containerRef}
        className="min-h-0 flex-1 overflow-auto figma-table-scroll"
      >
        <table
          aria-label="Resource breakdown records"
          className="w-full border-separate border-spacing-0 text-left"
          style={{ tableLayout: "fixed" }}
        >
          <colgroup>
            <col style={{ width: "100px" }} />
            <col style={{ width: "240px" }} />
            <col style={{ width: "130px" }} />
            <col style={{ width: "90px" }} />
            <col style={{ width: "150px" }} />
            <col style={{ width: "100px" }} />
            <col style={{ width: "145px" }} />
          </colgroup>
          <thead>
            <tr>
              <th scope="col" className={thBase}>
                Project Code
              </th>
              <th scope="col" className={thBase}>
                Project Name
              </th>
              <th scope="col" className={thBase}>
                Customer Name
              </th>
              <th scope="col" className={thBase}>
                Member ID
              </th>
              <th scope="col" className={thBase}>
                Member Name
              </th>
              <th scope="col" className={cn(thBase, "text-right")}>
                Logged Hrs
              </th>
              <th scope="col" className={thBase}>
                Parent Category
              </th>
            </tr>
          </thead>
          <tbody>
            {rows.length ? (
              rows.map((row, index) => {
                const isCurrentUser =
                  row.memberId === currentUserId ||
                  (row.memberName && row.memberName.includes("Kusum")) ||
                  row.hours > 45;

                return (
                  <tr
                    key={`${row.memberId}-${row.projectCode}-${index}`}
                    className="group transition-colors hover:bg-surface-field-disabled"
                  >
                    <td className={tdBase}>
                      <ProjectCodeBadge>{row.projectCode}</ProjectCodeBadge>
                    </td>
                    <td className={cn(tdBase, "text-ink-primary")}>
                      {row.projectName || "—"}
                    </td>
                    <td className={cn(tdBase, "text-ink-muted")}>
                      {row.customer || "—"}
                    </td>
                    <td className={cn(tdBase, "font-mono text-ink-muted")}>
                      {row.memberId || "—"}
                    </td>
                    <td className={cn(tdBase, "font-medium text-ink-primary")}>
                      {row.memberName || "—"}
                    </td>
                    <td
                      className={cn(
                        tdBase,
                        "text-right font-medium",
                        isCurrentUser
                          ? "font-semibold text-badge-brand-ink"
                          : "text-ink-primary",
                      )}
                    >
                      {row.hours != null
                        ? `${Number(row.hours).toFixed(1)} hrs`
                        : "—"}
                    </td>
                    <td className={cn(tdBase, "overflow-visible")}>
                      <CategoryTag category={row.category} />
                    </td>
                  </tr>
                );
              })
            ) : (
              <tr>
                <td
                  className="py-6 px-3 text-center text-[13px] text-ink-muted"
                  colSpan={7}
                >
                  {loading
                    ? "Loading resource breakdown..."
                    : "No resource records available on this page."}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
      <ReportPagination
        totalRecords={totalRecords}
        page={page}
        pageSize={pageSize}
        onPageChange={onPageChange}
      />
    </section>
  );
}
