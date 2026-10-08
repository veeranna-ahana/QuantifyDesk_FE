import { useState } from "react";
import { BarChart3, Download, Search, SlidersHorizontal } from "lucide-react";

import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";

const FILTERS = [
  { id: "all", label: "All" },
  { id: "experience", label: "Experience" },
  { id: "skill", label: "Skill Set" },
  { id: "member", label: "Members" },
];

export function MemberFilters({
  search,
  onSearchChange,
  filterBy,
  onFilterByChange,
  onSkillAnalytics,
  onExport,
}) {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <div className="flex flex-wrap items-center gap-2">
      <Input
        aria-label="Search members"
        placeholder="Search by employee name, ID or project..."
        leadingIcon={<Search className="h-4 w-4" />}
        size="md"
        value={search}
        onChange={(event) => onSearchChange(event.target.value)}
        wrapperClassName="min-w-48 flex-1 sm:flex-none sm:w-64 lg:w-[var(--size-member-search-width)]"
      />
      <div className="relative">
        <Button
          variant="secondary"
          size="md"
          leftIcon={<SlidersHorizontal className="h-4 w-4" />}
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
            aria-label="Filter members by"
            className="absolute left-0 top-full z-20 mt-1 min-w-28 rounded-chip border border-line-card bg-surface-card p-1 shadow-header"
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
      <div className="ml-auto flex flex-wrap items-center gap-2">
        <Button
          size="sm"
          leftIcon={<BarChart3 className="h-3.5 w-3.5" />}
          onClick={onSkillAnalytics}
        >
          Skill Analytics
        </Button>
        <Button
          variant="secondary"
          size="sm"
          leftIcon={<Download className="h-3.5 w-3.5" />}
          onClick={onExport}
          className="border-action-primary px-2 text-action-primary hover:bg-action-primary-soft"
        >
          Export Report
        </Button>
      </div>
    </div>
  );
}
