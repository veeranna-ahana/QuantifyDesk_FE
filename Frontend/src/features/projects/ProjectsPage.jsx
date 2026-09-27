import { ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

import { PageHeader } from '@/components/layout/PageHeader';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Pagination } from '@/components/ui/Pagination';

import { ProjectsFilterBar } from './components/ProjectsFilterBar';
import { ProjectsTable } from './components/ProjectsTable';
import { useProjects } from './hooks/useProjects';

export default function ProjectsPage() {
  const navigate = useNavigate();
  const { projects, counts, loading, error, searchQuery, setSearchQuery, statusFilter, setStatusFilter, page, setPage, totalPages, totalItems, pageSize } = useProjects();

  return (
    <div className="flex flex-col gap-4">
      <PageHeader
        title="Projects"
        actions={<Button leftIcon={<ArrowRight className="h-4 w-4" />} onClick={() => navigate('/projects/import')}>Import Project</Button>}
      />

      <ProjectsFilterBar
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        statusFilter={statusFilter}
        onStatusFilterChange={setStatusFilter}
        counts={counts}
      />

      <Card className="overflow-hidden">
        <ProjectsTable projects={projects} loading={loading} error={error} pageSize={pageSize} onView={(p) => navigate(`/projects/${p.id}`)} />
        {!loading && (
          <Pagination page={page} totalPages={totalPages} totalItems={totalItems} pageSize={pageSize} onPageChange={setPage} itemLabel="projects" />
        )}
      </Card>
    </div>
  );
}
