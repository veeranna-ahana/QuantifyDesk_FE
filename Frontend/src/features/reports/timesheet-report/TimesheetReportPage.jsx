import { useState } from "react";
import { Card } from "@/components/ui/Card";

import { TimesheetFilters } from "./components/TimesheetFilters";
import { ProjectSummaryFilters } from "./components/ProjectSummaryFilters";
import { ResourceBreakdownFilters } from "./components/ResourceBreakdownFilters";
import { StatsBar } from "./components/StatsBar";
import { ReportHeader } from "./components/ReportHeader";
import { ResourceBreakdownTabs } from "./components/ResourceBreakdownTabs";
import { ResourceBreakdownTable } from "./components/ResourceBreakdownTable";
import { ReportPagination } from "./components/ReportPagination";
import { ProjectSummaryTable } from "./components/TimesheetReportTables";
import { TimesheetTable } from "./components/TimesheetTable";
import { useTimesheetReport } from "./hooks/useTimesheetReport";
import { useProjectWiseSummary } from "./hooks/useProjectWiseSummary";
import { useResourceBreakdown } from "./hooks/useResourceBreakdown";

const PAGE_SIZE = 10;

export function TimesheetReportPage() {
  const [activeView, setActiveView] = useState("timesheet");
  // Each tab's data only loads once that tab has actually been opened — the
  // Timesheet Report tab loads immediately (it's the default view), while
  // Project-wise Summary / Resource Breakdown lazy-load on first visit, each
  // with their own independent loading state. This avoids firing all 3 HRMS
  // calls at once on page load.
  const report = useTimesheetReport();
  const projectSummary = useProjectWiseSummary(activeView === "projects");
  const resourceBreakdown = useResourceBreakdown(activeView === "resources");
  const [viewPage, setViewPage] = useState(1);

  const reportStats = {
    total: report.summary.totalHours,
    approved: report.summary.approvedHours,
    pending: report.summary.pendingHours,
  };

  const currentTotalRecords =
    activeView === "timesheet"
      ? report.totalRecords
      : activeView === "projects"
        ? projectSummary.totalRecords
        : resourceBreakdown.totalRecords;

  const currentTotalPages = Math.max(
    1,
    Math.ceil(currentTotalRecords / PAGE_SIZE),
  );

  const projectPageRows = projectSummary.rows.slice(
    (viewPage - 1) * PAGE_SIZE,
    viewPage * PAGE_SIZE,
  );
  const resourcePageRows = resourceBreakdown.rows.slice(
    (viewPage - 1) * PAGE_SIZE,
    viewPage * PAGE_SIZE,
  );

  const changePage = (page) => {
    const validPage = Math.min(Math.max(page, 1), currentTotalPages);
    setViewPage(validPage);
    report.setPage(validPage);
  };

  const tabError =
    activeView === "projects"
      ? projectSummary.error
      : activeView === "resources"
        ? resourceBreakdown.error
        : report.error;

  return (
    <div className="flex h-full min-h-0 w-full min-w-0 flex-1 flex-col gap-3 bg-surface-page box-border [&_*]:box-border">
      <ReportHeader onExport={report.exportReport} />

      {/* Each tab gets its own filter bar — Project-wise Summary and Resource
          Breakdown both ignore query params server-side, so their filters are
          applied client-side against the already-loaded dataset. The stats
          badges below are always shown regardless of tab. */}
      {activeView === "timesheet" && (
        <TimesheetFilters
          filters={report.draftFilters}
          onChange={report.setDraftFilters}
          onApply={(filters) => {
            report.applyFilters(filters);
            setViewPage(1);
          }}
          onClear={() => {
            report.clearFilters();
            setViewPage(1);
          }}
          projects={report.options.projects}
          employees={report.options.employees}
        />
      )}

      {activeView === "projects" && (
        <ProjectSummaryFilters
          filters={projectSummary.draftFilters}
          onChange={projectSummary.setDraftFilters}
          onApply={(filters) => {
            projectSummary.applyFilters(filters);
            setViewPage(1);
          }}
          onClear={() => {
            projectSummary.clearFilters();
            setViewPage(1);
          }}
          projectCodes={projectSummary.options.projectCodes}
          projectNames={projectSummary.options.projectNames}
          parentCategories={projectSummary.options.parentCategories}
        />
      )}

      {activeView === "resources" && (
        <ResourceBreakdownFilters
          filters={resourceBreakdown.draftFilters}
          onChange={resourceBreakdown.setDraftFilters}
          onApply={(filters) => {
            resourceBreakdown.applyFilters(filters);
            setViewPage(1);
          }}
          onClear={() => {
            resourceBreakdown.clearFilters();
            setViewPage(1);
          }}
          projectCodes={resourceBreakdown.options.projectCodes}
          projectNames={resourceBreakdown.options.projectNames}
          memberNames={resourceBreakdown.options.memberNames}
        />
      )}

      <StatsBar stats={reportStats} />

      {tabError && (
        <p className="m-0 rounded-md border border-badge-danger-line bg-badge-danger-bg px-3 py-1.5 text-[12px] leading-4 text-badge-danger-ink">
          {tabError}
        </p>
      )}

      <ResourceBreakdownTabs
        activeTab={activeView}
        onTabChange={(view) => {
          setActiveView(view);
          setViewPage(1);
          report.setPage(1);
        }}
        timesheetCount={report.totalRecords}
        timesheetCountLoading={report.loading}
        projectCount={projectSummary.totalRecords}
        projectCountLoading={projectSummary.loading}
        resourceCount={resourceBreakdown.totalRecords}
        resourceCountLoading={resourceBreakdown.loading}
      />
      {activeView === "resources" ? (
        <ResourceBreakdownTable
          rows={resourcePageRows}
          totalRecords={resourceBreakdown.totalRecords}
          page={viewPage}
          pageSize={PAGE_SIZE}
          onPageChange={changePage}
          loading={resourceBreakdown.loading}
        />
      ) : (
        <Card className="flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden rounded-xl border border-line-card bg-surface-card shadow-1">
          {activeView === "timesheet" ? (
            <>
              <div className="flex min-h-0 w-full flex-1 flex-col overflow-hidden">
                <TimesheetTable
                  records={report.records}
                  loading={report.loading}
                />
              </div>
              <ReportPagination
                page={viewPage}
                totalRecords={report.totalRecords}
                pageSize={PAGE_SIZE}
                onPageChange={changePage}
              />
            </>
          ) : (
            <>
              <div className="flex min-h-0 w-full flex-1 flex-col overflow-hidden">
                <ProjectSummaryTable
                  records={projectPageRows}
                  loading={projectSummary.loading}
                />
              </div>
              <ReportPagination
                page={viewPage}
                totalRecords={projectSummary.totalRecords}
                pageSize={PAGE_SIZE}
                onPageChange={changePage}
              />
            </>
          )}
        </Card>
      )}
    </div>
  );
}

export default TimesheetReportPage;
