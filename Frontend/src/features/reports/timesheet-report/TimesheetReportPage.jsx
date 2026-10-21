import { useMemo, useState } from "react";
import {
  ClipboardList,
  Download,
  FolderKanban,
  UsersRound,
} from "lucide-react";

import { PageHeader } from "@/components/layout/PageHeader";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { FilterTabs } from "@/components/ui/FilterTabs";
import { Pagination } from "@/components/ui/Pagination";

import { TimesheetFilters } from "./components/TimesheetFilters";
import {
  ProjectSummaryTable,
  ResourceBreakdownTable,
} from "./components/TimesheetReportTables";
import { TimesheetTable } from "./components/TimesheetTable";
import { useTimesheetReport } from "./hooks/useTimesheetReport";

const PAGE_SIZE = 10;

export default function TimesheetReportPage() {
  const report = useTimesheetReport();
  const [activeView, setActiveView] = useState("timesheet");

  const projectRows = useMemo(() => {
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

  const viewTotalItems =
    activeView === "projects" ? projectRows.length : report.totalRecords;
  const viewTotalPages = Math.max(1, Math.ceil(viewTotalItems / PAGE_SIZE));
  const viewPage = Math.min(report.page, viewTotalPages);
  const projectPageRows = projectRows.slice(
    (viewPage - 1) * PAGE_SIZE,
    viewPage * PAGE_SIZE,
  );

  const tabs = [
    {
      id: "timesheet",
      label: (
        <span className="inline-flex items-center gap-1.5">
          <ClipboardList className="h-3.5 w-3.5" aria-hidden="true" />
          Timesheet Report
        </span>
      ),
    },
    {
      id: "projects",
      label: (
        <span className="inline-flex items-center gap-1.5">
          <FolderKanban className="h-3.5 w-3.5" aria-hidden="true" />
          Project-wise Summary
        </span>
      ),
      count: projectRows.length,
    },
    {
      id: "resources",
      label: (
        <span className="inline-flex items-center gap-1.5">
          <UsersRound className="h-3.5 w-3.5" aria-hidden="true" />
          Resource Breakdown
        </span>
      ),
      count: report.totalRecords,
    },
  ];

  return (
    <div className="flex flex-col gap-2">
      <PageHeader
        title="Timesheet Report"
        subtitle="Centralized cross-project employee time tracking and verification log"
        actions={
          <Button
            variant="secondary"
            size="md"
            leftIcon={<Download className="h-3 w-3" />}
            onClick={report.exportReport}
            className="w-[117px] gap-1 border-action-primary px-3 text-xs text-action-primary hover:bg-action-primary-soft"
          >
            Export Report
          </Button>
        }
      />

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

      <Card className="overflow-hidden">
        <FilterTabs
          items={tabs}
          value={activeView}
          onChange={(view) => {
            setActiveView(view);
            report.setPage(1);
          }}
          className="w-full flex-wrap justify-start gap-1 rounded-none bg-surface-card px-1 py-1"
        />
        {activeView === "timesheet" ? (
          <TimesheetTable records={report.records} loading={report.loading} />
        ) : activeView === "projects" ? (
          <ProjectSummaryTable records={projectPageRows} loading={report.loading} />
        ) : (
          <ResourceBreakdownTable
            records={report.records}
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
            itemLabel={activeView === "projects" ? "projects" : "records"}
          />
        ) : report.loading ? null : (
          <div className="border-t border-line-table-head bg-surface-table-head px-4 py-2 text-xs text-ink-secondary">
            Showing 0-0 of 0 {activeView === "projects" ? "projects" : "records"}
          </div>
        )}
      </Card>
    </div>
  );
}
