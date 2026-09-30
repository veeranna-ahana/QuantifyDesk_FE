import React from 'react';
import { Search, SlidersHorizontal, Check } from 'lucide-react';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { Dropdown, DropdownItem } from '@/components/ui/Dropdown';

export function GuidelineToolbar({ searchQuery, onSearchChange, filterOption, onFilterChange }) {
  const options = ['All', 'Last Updated', 'Versions', 'Owner Name'];

  return (
    <div className="flex items-center gap-2 w-full h-[34px] shrink-0">
      <div className="w-full max-w-[448px]">
        <Input
          type="search"
          placeholder="Search by Guideline name"
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          leadingIcon={<Search className="h-4 w-4 text-ink-muted" />}
          className="w-full h-[34px] text-[13px]"
        />
      </div>

      <Dropdown
        align="left"
        trigger={
          <Button
            variant="outline"
            leftIcon={<SlidersHorizontal className="h-3.5 w-3.5 text-action-primary" />}
            className={`h-[32px] px-3 text-[12px] font-semibold border-action-primary text-action-primary hover:bg-action-primary-soft shadow-none ${
              filterOption !== 'All' ? 'bg-action-primary-soft' : ''
            }`}
          >
            Filter
          </Button>
        }
      >
        {options.map((opt) => (
          <DropdownItem
            key={opt}
            active={filterOption === opt}
            onClick={() => onFilterChange(opt)}
          >
            {filterOption === opt && <Check className="h-3.5 w-3.5" />}
            <span className={filterOption === opt ? 'ml-0' : 'ml-[24px]'}>{opt}</span>
          </DropdownItem>
        ))}
      </Dropdown>
    </div>
  );
}
