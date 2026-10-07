import React from 'react';
import { Search, SlidersHorizontal, Check } from 'lucide-react';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { Dropdown, DropdownItem } from '@/components/ui/Dropdown';

export function GuidelineToolbar({ searchQuery, onSearchChange, filterOption, onFilterChange }) {
  const options = ['All', 'Last Updated', 'Versions', 'Owner Name'];

  return (
    <div className="guideline-list-toolbar flex items-center w-full shrink-0">
      <div className="guideline-list-search">
        <Input
          type="search"
          placeholder="Search by Guideline name..."
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          leadingIcon={<Search className="guideline-list-search-icon" strokeWidth={1.5} />}
          className="guideline-list-search-input"
        />
      </div>

      <Dropdown
        align="left"
        trigger={
          <Button
            variant="outline"
            leftIcon={<SlidersHorizontal className="guideline-list-filter-icon" strokeWidth={1.5} />}
            className={`guideline-list-filter-button ${
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
