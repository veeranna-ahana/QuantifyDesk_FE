// src/features/server-information/components/ServerFilterBar.jsx
import { Search, SlidersHorizontal } from 'lucide-react';

import { Card } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';

export function ServerFilterBar({ searchQuery, onSearchChange }) {
  return (
    <Card className="flex flex-wrap items-center justify-start gap-2 px-3.5 py-2.5">
      <Input
        id="server-search"
        size="md"s
        aria-label="Search servers"
        leadingIcon={<Search className="h-4 w-4" />}
        placeholder="Search by hostname, IP address, OS, or cluster node..."
        value={searchQuery}
        onChange={(e) => onSearchChange(e.target.value)}
        wrapperClassName="w-full max-w-[672px] flex-1"
      />
      <button
        type="button"
        className="inline-flex h-9 items-center gap-2 rounded-control border border-[#856BFF] bg-transparent px-3.5 text-sm font-medium text-[#856BFF] transition-colors hover:bg-[#856BFF]/5 focus-visible:outline-none"
        aria-label="Open filters"
      >
        <SlidersHorizontal className="h-4 w-4" />
        Filters
      </button>
    </Card>
  );
}
