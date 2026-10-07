import { useState } from "react";
import { Download, ListFilter, Search } from "lucide-react";

import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";

const FILTERS = [
  { id: "all", label: "All" },
  { id: "project", label: "Project Name" },
  { id: "status", label: "Status" },
];

export function ChecklistReportFilters({
  search,
  onSearchChange,
  filterBy,
  onFilterByChange,
  statusFilter,
  onStatusFilterChange,
  onExport,
}) {
  const [menuOpen, setMenuOpen] = useState(false);
  const selectedFilter = FILTERS.find((filter) => filter.id === filterBy);
  const isStatusFilter = filterBy === "status";

  return (
    <Card className="flex flex-wrap items-center gap-2 p-2 shadow-none">
      <Input
        aria-label="Search projects and documents"
        placeholder="Search by Project name, Document name..."
        leadingIcon={<Search className="h-4 w-4" />}
        size="md"
        value={search}
        onChange={(event) => onSearchChange(event.target.value)}
        wrapperClassName="w-full min-w-0 sm:w-[var(--size-project-checklist-search-width)] sm:flex-none"
      />
      <div className="relative">
        <Button
          variant="secondary"
          size="md"
          leftIcon={<ListFilter className="h-4 w-4" />}
          aria-expanded={menuOpen}
          aria-haspopup="menu"
          onClick={() => setMenuOpen((open) => !open)}
          className="border-action-primary px-3 text-action-primary hover:bg-action-primary-soft"
        >
          Filter
        </Button>
        {menuOpen && (
          <div
            role="menu"
            aria-label="Filter projects by"
            className="absolute left-0 top-full z-20 mt-1 min-w-32 rounded-chip border border-line-card bg-surface-card p-1 shadow-header"
          >
            {FILTERS.map((filter) => (
              <button
                key={filter.id}
                type="button"
                role="menuitemradio"
                aria-checked={filterBy === filter.id}
                onClick={() => {
                  onFilterByChange(filter.id);
                  setMenuOpen(false);
                }}
                className={`flex h-8 w-full items-center rounded-control px-2 text-left text-xs transition-colors ${
                  filterBy === filter.id
                    ? "bg-action-primary-soft font-semibold text-action-primary"
                    : "text-ink-secondary hover:bg-surface-field-disabled"
                }`}
              >
                {filter.label}
              </button>
            ))}
          </div>
        )}
      </div>
      {isStatusFilter && (
        <select
          aria-label="Project status"
          value={statusFilter}
          onChange={(event) => onStatusFilterChange(event.target.value)}
          className="h-control-md rounded-control border border-line-field bg-surface-card px-2 text-xs text-ink-secondary focus:border-action-primary focus:outline-none focus:ring-2 focus:ring-action-primary-ring"
        >
          <option value="all">All Statuses</option>
          <option value="In Progress">In Progress</option>
          <option value="Completed">Completed</option>
        </select>
      )}
      <Button
        variant="secondary"
        size="md"
        leftIcon={<Download className="h-4 w-4" />}
        onClick={onExport}
        className="ml-auto border-action-primary px-2 text-action-primary hover:bg-action-primary-soft"
      >
        Export Report
      </Button>
      <span className="sr-only">Filter by {selectedFilter.label}</span>
    </Card>
  );
}
