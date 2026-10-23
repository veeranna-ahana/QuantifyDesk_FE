import { ArrowRight } from "lucide-react";
import { useNavigate } from "react-router-dom";

import { PageHeader } from "@/components/layout/PageHeader";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Pagination } from "@/components/ui/Pagination";

import { ProjectsFilterBar } from "./components/ProjectsFilterBar";
import { ProjectsTable } from "./components/ProjectsTable";
import { useProjects } from "./hooks/useProjects";

export default function ProjectsPage() {
  const navigate = useNavigate();
  const {
    projects,
    counts,
    loading,
    error,
    searchQuery,
    setSearchQuery,
    statusFilter,
    setStatusFilter,
    page,
    setPage,
    totalPages,
    totalItems,
    pageSize,
  } = useProjects();

  return (
    <div className="flex h-full min-h-0 w-full flex-1 flex-col gap-4">
      <PageHeader
        title="Projects"
        actions={
          <Button
            leftIcon={<ArrowRight className="h-4 w-4" />}
            onClick={() => navigate("/projects/import")}
          >
            Import Project
          </Button>
        }
      />

      <ProjectsFilterBar
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        statusFilter={statusFilter}
        onStatusFilterChange={setStatusFilter}
        counts={counts}
      />

      {/* The table's own wrapper div sets overflow-x: auto for horizontal
          scrolling — per the CSS overflow spec, that silently forces its
          overflow-y from "visible" to "auto" too, making it an (unbounded,
          non-scrolling) scroll box sitting between the sticky header and the
          page. Sticky positioning then anchors to that inert box instead of
          actually sticking as the page scrolls. Fix: give the table its own
          bounded, internally-scrolling region (min-h-0 + flex-1 on the Card,
          same pattern already used by the Timesheet Report tables) so the
          header's sticky ancestor is this real scrolling container. */}
      <Card className="flex min-h-0 flex-1 flex-col overflow-hidden">
        <ProjectsTable
          projects={projects}
          loading={loading}
          error={error}
          pageSize={pageSize}
          onView={(p) => navigate(`/projects/${p.id}`)}
        />
        {!loading && (
          <Pagination
            page={page}
            totalPages={totalPages}
            totalItems={totalItems}
            pageSize={pageSize}
            onPageChange={setPage}
            itemLabel="projects"
          />
        )}
      </Card>
    </div>
  );
}
