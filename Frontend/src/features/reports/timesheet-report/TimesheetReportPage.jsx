import { Download } from "lucide-react";

import { PageHeader } from "@/components/layout/PageHeader";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Pagination } from "@/components/ui/Pagination";

import { TimesheetFilters } from "./components/TimesheetFilters";
import { TimesheetSummary } from "./components/TimesheetSummary";
import { TimesheetTable } from "./components/TimesheetTable";
import { useTimesheetReport } from "./hooks/useTimesheetReport";

export default function TimesheetReportPage() {
  const report = useTimesheetReport();

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
        summary={
          <TimesheetSummary
            summary={report.summary}
            className="w-full justify-start sm:ml-auto sm:w-auto sm:justify-end"
          />
        }
      />

      <Card className="overflow-hidden">
        <TimesheetTable records={report.records} />
        {report.totalRecords ? (
          <Pagination
            page={report.page}
            totalPages={report.totalPages}
            totalItems={report.totalRecords}
            pageSize={report.pageSize}
            onPageChange={report.setPage}
            itemLabel="records"
          />
        ) : (
          <div className="border-t border-line-table-head bg-surface-table-head px-4 py-2 text-xs text-ink-secondary">
            Showing 0-0 of 0 records
          </div>
        )}
      </Card>
    </div>
  );
}
