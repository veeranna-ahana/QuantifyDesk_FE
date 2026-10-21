import { useMemo, useState } from "react";
import { Card } from "@/components/ui/Card";
import { Pagination } from "@/components/ui/Pagination";

import { TimesheetFilters } from "./components/TimesheetFilters";
import { ReportHeader } from "./components/ReportHeader";
import { ResourceBreakdownTabs } from "./components/ResourceBreakdownTabs";
import { ResourceBreakdownTable } from "./components/ResourceBreakdownTable";
import { ProjectSummaryTable } from "./components/TimesheetReportTables";
import { TimesheetTable } from "./components/TimesheetTable";
import { useTimesheetReport } from "./hooks/useTimesheetReport";
import { mockProjectSummaryRecords } from "./mock/mockTimesheetReport";
import { resourceLogs } from "./mock/mockResourceLogs";
import pageStyles from "./TimesheetReportPage.module.css";

const PAGE_SIZE = 10;
const RESOURCE_TOTAL_RECORDS = 145;

export default function TimesheetReportPage() {
  const report = useTimesheetReport();
  const [activeView, setActiveView] = useState("timesheet");

  const hasAppliedFilters = Object.values(report.filters).some(Boolean);
  const useMockViews =
    (report.usingMockData || report.totalRecords === 0) && !hasAppliedFilters;

  const derivedProjectRows = useMemo(() => {
    const projects = new Map();
    report.filteredRecords.forEach((record) => {
      const key = record.projectCode || record.projectName;
      if (!key) return;

      const project = projects.get(key) ?? {
        projectCode: record.projectCode,
        projectName: record.projectName,
        customerName: record.customerName,
        parentCategory: record.parentCategory || record.category,
        members: new Set(),
        totalHours: 0,
        latestDate: "",
      };
      if (record.employeeId) project.members.add(record.employeeId);
      project.totalHours += record.hoursSpent;
      if (record.toDate > project.latestDate) project.latestDate = record.toDate;
      projects.set(key, project);
    });

    return [...projects.values()]
      .map((project) => ({
        ...project,
        memberCount: project.members.size,
      }))
      .sort((a, b) => (a.projectName || "").localeCompare(b.projectName || ""));
  }, [report.filteredRecords]);
  const projectRows = useMockViews
    ? mockProjectSummaryRecords
    : derivedProjectRows;
  const viewTotalItems =
    activeView === "projects"
      ? projectRows.length
      : activeView === "resources"
        ? RESOURCE_TOTAL_RECORDS
        : report.totalRecords;
  const viewTotalPages = Math.max(1, Math.ceil(viewTotalItems / PAGE_SIZE));
  const viewPage = Math.min(report.page, viewTotalPages);
  const projectPageRows = projectRows.slice(
    (viewPage - 1) * PAGE_SIZE,
    viewPage * PAGE_SIZE,
  );
  return (
    <div className={pageStyles.pageWrapper}>
      <ReportHeader onExport={report.exportReport} />

      <TimesheetFilters
        filters={report.draftFilters}
        onChange={report.setDraftFilters}
        onApply={report.applyFilters}
        onClear={report.clearFilters}
        projects={report.options.projects}
        employees={report.options.employees}
        stats={{
          total: report.summary.totalHours,
          approved: report.summary.approvedHours,
          pending: report.summary.pendingHours,
        }}
      />

      {report.error && (
        <p className="px-1 text-sm text-badge-danger-ink">{report.error}</p>
      )}

      <ResourceBreakdownTabs
        activeTab={activeView}
        onTabChange={(view) => {
          setActiveView(view);
          report.setPage(1);
        }}
        projectCount={projectRows.length}
        resourceCount={resourceLogs.length}
      />
      {activeView === "resources" ? (
        <ResourceBreakdownTable
          rows={resourceLogs}
          totalRecords={RESOURCE_TOTAL_RECORDS}
          page={viewPage}
          pageSize={PAGE_SIZE}
          onPageChange={report.setPage}
        />
      ) : (
        <Card className="overflow-hidden">
          {activeView === "timesheet" ? (
            <TimesheetTable records={report.records} loading={report.loading} />
          ) : (
            <ProjectSummaryTable
              records={projectPageRows}
              loading={report.loading}
            />
          )}
          {viewTotalItems ? (
            <Pagination
              page={viewPage}
              totalPages={viewTotalPages}
              totalItems={viewTotalItems}
              pageSize={PAGE_SIZE}
              onPageChange={report.setPage}
              itemLabel="records"
            />
          ) : report.loading ? null : (
            <div className="border-t border-line-table-head bg-surface-table-head px-4 py-2 text-xs text-ink-secondary">
              Showing 0-0 of 0 records
            </div>
          )}
        </Card>
      )}
    </div>
  );
}
