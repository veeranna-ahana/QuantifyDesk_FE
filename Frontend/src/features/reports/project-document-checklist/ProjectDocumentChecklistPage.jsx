import { PageHeader } from "@/components/layout/PageHeader";
import { Pagination } from "@/components/ui/Pagination";

import { ChecklistReportFilters } from "./components/ChecklistReportFilters";
import { ChecklistSummaryCards } from "./components/ChecklistSummaryCards";
import { ProjectChecklistList } from "./components/ProjectChecklistList";
import { useProjectDocumentChecklistReport } from "./hooks/useProjectDocumentChecklistReport";

export default function ProjectDocumentChecklistPage() {
  const report = useProjectDocumentChecklistReport();

  return (
    <div className="flex flex-col gap-2">
      <PageHeader
        title="Project Document Checklist"
        subtitle="Track required project documents and availability compliance across active projects."
      />

      <ChecklistSummaryCards summary={report.summary} />

      <ChecklistReportFilters
        search={report.search}
        onSearchChange={report.setSearch}
        filterBy={report.filterBy}
        onFilterByChange={report.setFilterBy}
        statusFilter={report.statusFilter}
        onStatusFilterChange={report.setStatusFilter}
        onExport={report.exportReport}
      />

      <div className="flex flex-col gap-1">
        <ProjectChecklistList
          projects={report.projects}
          expandedProject={report.expandedProject}
          onToggleProject={report.setExpandedProject}
        />
        {report.totalProjects ? (
          <Pagination
            page={report.page}
            totalPages={report.totalPages}
            totalItems={report.totalProjects}
            pageSize={report.pageSize}
            onPageChange={report.setPage}
            itemLabel="Projects"
          />
        ) : (
          <div className="bg-surface-table-head px-4 py-2 text-xs text-ink-secondary">
            Showing 0-0 of 0 Projects
          </div>
        )}
      </div>
    </div>
  );
}
