// src/features/server-information/components/ServerFilterBar.jsx
import { Search, SlidersHorizontal } from 'lucide-react';

import { Input } from '@/components/ui/Input';

export function ServerFilterBar({ searchQuery, onSearchChange }) {
  return (
    <div className="flex flex-wrap items-center gap-2">
      <Input
        id="server-search"
        size="lg"
        aria-label="Search servers"
        leadingIcon={<Search className="h-3.5 w-3.5 text-[#545F72]" />}
        leadingIconClassName="left-[15px] text-[#545F72]"
        placeholder="Search by hostname, IP address, OS..."
        value={searchQuery}
        onChange={(e) => onSearchChange(e.target.value)}
        wrapperClassName="w-full max-w-[400px] flex-none"
        className="h-control-lg rounded-control border-line-field pl-12 text-sm leading-4 placeholder:text-[#545F72]"
      />
      <button
        type="button"
        className="inline-flex h-control-lg w-[80.5px] flex-none items-center gap-1 rounded-control border border-action-primary bg-surface-card px-4 text-xs font-semibold tracking-[0.6px] text-action-primary shadow-[var(--shadow-1)] transition-colors hover:bg-action-primary-soft focus-visible:outline-none"
        aria-label="Open filters"
      >
        <SlidersHorizontal className="h-[13.5px] w-[13.5px]" />
        Filter
      </button>
    </div>
  );
}
