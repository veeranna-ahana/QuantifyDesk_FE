import { useMemo, useState } from "react";
import { Card } from "@/components/ui/Card";

import { TimesheetFilters } from "./components/TimesheetFilters";
import { ReportHeader } from "./components/ReportHeader";
import { ResourceBreakdownTabs } from "./components/ResourceBreakdownTabs";
import { ResourceBreakdownTable } from "./components/ResourceBreakdownTable";
import { ReportPagination } from "./components/ReportPagination";
import { ProjectSummaryTable } from "./components/TimesheetReportTables";
import { TimesheetTable } from "./components/TimesheetTable";
import { useTimesheetReport } from "./hooks/useTimesheetReport";
import { mockProjectSummaryRecords } from "./mock/mockTimesheetReport";
import { resourceLogs } from "./mock/mockResourceLogs";
import { timesheetRows } from "./mock/timesheetRows";
import pageStyles from "./TimesheetReportPage.module.css";

const PAGE_SIZE = 10;
const TOTAL_RECORDS = 145;
const REPORT_STATS = { total: 2840, approved: 2420, pending: 420 };

export function TimesheetReportPage() {
  const report = useTimesheetReport();
  const [activeView, setActiveView] = useState("projects");
  const [viewPage, setViewPage] = useState(1);

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
        totalResourceCost: 0,
        latestDate: "",
      };
      if (record.employeeId) project.members.add(record.employeeId);
      project.totalHours += record.hoursSpent;
      project.totalResourceCost += record.totalResourceCost || 0;
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
  const viewTotalPages = Math.max(1, Math.ceil(TOTAL_RECORDS / PAGE_SIZE));
  const projectPageRows = projectRows.slice(
    (viewPage - 1) * PAGE_SIZE,
    viewPage * PAGE_SIZE,
  );
  const timesheetPageRows = useMockViews
    ? timesheetRows.slice((viewPage - 1) * PAGE_SIZE, viewPage * PAGE_SIZE)
    : report.records;
  const changePage = (page) => {
    setViewPage(Math.min(Math.max(page, 1), viewTotalPages));
    report.setPage(Math.min(Math.max(page, 1), viewTotalPages));
  };

  return (
    <div className={pageStyles.pageWrapper}>
      <ReportHeader onExport={report.exportReport} />

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
        stats={REPORT_STATS}
      />

      {report.error && (
        <p className={`${pageStyles.reportError} text-badge-danger-ink`}>
          {report.error}
        </p>
      )}

      <ResourceBreakdownTabs
        activeTab={activeView}
        onTabChange={(view) => {
          setActiveView(view);
          setViewPage(1);
          report.setPage(1);
        }}
        projectCount={projectRows.length}
        resourceCount={resourceLogs.length}
      />
      {activeView === "resources" ? (
        <ResourceBreakdownTable
          rows={resourceLogs}
          totalRecords={TOTAL_RECORDS}
          page={viewPage}
          pageSize={PAGE_SIZE}
          onPageChange={changePage}
        />
      ) : (
        <Card className={pageStyles.reportTableCard}>
          {activeView === "timesheet" ? (
            <>
              <div className={pageStyles.tableBody}>
                <TimesheetTable
                  records={timesheetPageRows}
                  loading={report.loading}
                />
              </div>
              <ReportPagination
                page={viewPage}
                totalRecords={TOTAL_RECORDS}
                pageSize={PAGE_SIZE}
                onPageChange={changePage}
              />
            </>
          ) : (
            <>
              <div className={pageStyles.tableBody}>
                <ProjectSummaryTable
                  records={projectPageRows}
                  loading={report.loading}
                />
              </div>
              <ReportPagination
                page={viewPage}
                totalRecords={TOTAL_RECORDS}
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
