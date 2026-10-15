// src/features/server-information/components/ServerFilterBar.jsx
import { useState } from "react";
import { Search, SlidersHorizontal } from "lucide-react";

import { Input } from "@/components/ui/Input";

import { ServerFilterPanel } from "./ServerFilterPanel";

const emptyFilters = { environments: [], status: "All", projects: [] };

export function ServerFilterBar({
  searchQuery,
  onSearchChange,
  filters,
  onFiltersChange,
  activeCount,
}) {
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [draftFilters, setDraftFilters] = useState(emptyFilters);

  const openFilters = () => {
    if (isFilterOpen) {
      setIsFilterOpen(false);
      return;
    }
    setDraftFilters({
      environments: [...filters.environments],
      status: filters.status,
      projects: [...filters.projects],
    });
    setIsFilterOpen(true);
  };

  const applyFilters = () => {
    onFiltersChange(draftFilters);
    setIsFilterOpen(false);
  };

  return (
    <div className="flex flex-wrap items-center gap-2">
      <Input
        id="server-search"
        size="lg"
        aria-label="Search servers"
        leadingIcon={<Search className="h-3.5 w-3.5 text-[#545F72]" />}
        leadingIconClassName="left-[15px] text-[#545F72]"
        placeholder="Search by server name, IP address, OS..."
        value={searchQuery}
        onChange={(e) => onSearchChange(e.target.value)}
        onClear={() => onSearchChange('')}
        wrapperClassName="w-full max-w-[400px] flex-none"
        className="h-control-lg rounded-control border-line-field pl-12 text-sm leading-4 placeholder:text-[#545F72]"
      />
      <div className="relative">
        <button
          type="button"
          className={`inline-flex h-control-lg w-[80.5px] flex-none items-center gap-1 rounded-control border px-4 text-xs font-semibold tracking-[0.6px] shadow-[var(--shadow-1)] transition-colors focus-visible:outline-none ${
            isFilterOpen || filters.environments.length || filters.status !== "All" || filters.projects.length
              ? "border-action-primary bg-action-primary-soft text-action-primary"
              : "border-action-primary bg-surface-card text-action-primary hover:bg-action-primary-soft"
          }`}
          aria-label="Open filters"
          aria-expanded={isFilterOpen}
          aria-haspopup="dialog"
          onClick={openFilters}
        >
          <SlidersHorizontal className="h-[13.5px] w-[13.5px]" />
          Filter
        </button>
        {isFilterOpen && (
          <ServerFilterPanel
            filters={draftFilters}
            onChange={setDraftFilters}
            activeCount={activeCount}
            onReset={() => setDraftFilters(emptyFilters)}
            onCancel={() => setIsFilterOpen(false)}
            onApply={applyFilters}
          />
        )}
      </div>
    </div>
  );
}
