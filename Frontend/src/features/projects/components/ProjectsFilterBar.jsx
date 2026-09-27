import { Search } from 'lucide-react';

import { Card } from '@/components/ui/Card';
import { FilterTabs } from '@/components/ui/FilterTabs';
import { Input } from '@/components/ui/Input';

export function ProjectsFilterBar({ searchQuery, onSearchChange, statusFilter, onStatusFilterChange, counts }) {
  const tabs = [
    { id: 'all', label: `All (${counts.all ?? 0})` },
    { id: 'In Progress', label: `In Progress (${counts['In Progress'] ?? 0})` },
    { id: 'Completed', label: `Completed (${counts.Completed ?? 0})` },
  ];
  return (
    <Card className="flex flex-wrap items-center justify-between gap-3 p-3">
      <Input
        id="projects-search"
        size="md"
        aria-label="Search projects"
        leadingIcon={<Search className="h-4 w-4" />}
        placeholder="Search by PMS ID, Project name, or Client..."
        value={searchQuery}
        onChange={(e) => onSearchChange(e.target.value)}
        wrapperClassName="w-full max-w-md flex-1"
      />
      <FilterTabs items={tabs} value={statusFilter} onChange={onStatusFilterChange} />
    </Card>
  );
}
