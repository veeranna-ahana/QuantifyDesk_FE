import React from 'react';
import { Search, SlidersHorizontal } from 'lucide-react';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { Dropdown } from '@/components/ui/Dropdown';

const UPDATED_OPTIONS = [
  { value: 'all', label: 'All Time' },
  { value: '7d', label: 'Last 7 Days' },
  { value: '30d', label: 'Last 30 Days' },
];

export function GuidelineToolbar({
  searchQuery,
  onSearchChange,
  versions,
  draftFilters,
  onDraftFiltersChange,
  onResetFilters,
  onApplyFilters,
  onCancelFilters,
  filterOpen,
  onFilterOpenChange,
}) {
  const sortedVersions = [...versions].sort((a, b) =>
    a.localeCompare(b, undefined, { numeric: true, sensitivity: 'base' }),
  );

  const toggleVersion = (version) => {
    const selected = draftFilters.versions.includes(version);
    onDraftFiltersChange({
      ...draftFilters,
      versions: selected
        ? draftFilters.versions.filter((item) => item !== version)
        : [...draftFilters.versions, version],
    });
  };

  return (
    <div className="guideline-list-toolbar flex items-center w-full shrink-0">
      <div className="guideline-list-search">
        <Input
          type="search"
          placeholder="Search by Guideline name & Owner..."
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          leadingIcon={<Search className="guideline-list-search-icon" strokeWidth={1.5} />}
          className="guideline-list-search-input"
        />
      </div>

      <Dropdown
        align="left"
        closeOnItemClick={false}
        open={filterOpen}
        onOpenChange={onFilterOpenChange}
        className="guideline-filter-panel"
        trigger={
          <Button
            variant="outline"
            leftIcon={<SlidersHorizontal className="guideline-list-filter-icon" strokeWidth={1.5} />}
            className="guideline-list-filter-button"
            aria-expanded={filterOpen}
          >
            Filter
          </Button>
        }
      >
        <div className="guideline-filter-heading">
          <span className="guideline-filter-title">
            <SlidersHorizontal aria-hidden="true" />
            Filter
          </span>
          <button type="button" className="guideline-filter-reset" onClick={onResetFilters}>
            Reset
          </button>
        </div>

        <section className="guideline-filter-section" aria-labelledby="guideline-version-label">
          <h2 id="guideline-version-label" className="guideline-filter-section-label">VERSION</h2>
          <div className="guideline-filter-chips">
            {sortedVersions.map((version) => {
              const selected = draftFilters.versions.includes(version);
              return (
                <button
                  key={version}
                  type="button"
                  aria-pressed={selected}
                  className={`guideline-filter-chip${selected ? ' is-selected' : ''}`}
                  onClick={() => toggleVersion(version)}
                >
                  {version}
                </button>
              );
            })}
          </div>
        </section>

        <section className="guideline-filter-section" aria-labelledby="guideline-updated-label">
          <h2 id="guideline-updated-label" className="guideline-filter-section-label">LAST UPDATED</h2>
          <div className="guideline-filter-radios">
            {UPDATED_OPTIONS.map((option) => (
              <label key={option.value} className="guideline-filter-radio-option">
                <input
                  type="radio"
                  name="guideline-last-updated"
                  value={option.value}
                  checked={draftFilters.lastUpdated === option.value}
                  onChange={() =>
                    onDraftFiltersChange({ ...draftFilters, lastUpdated: option.value })
                  }
                />
                <span>{option.label}</span>
              </label>
            ))}
          </div>
        </section>

        <div className="guideline-filter-actions">
          <Button type="button" className="guideline-filter-cancel" onClick={onCancelFilters}>
            Cancel
          </Button>
          <Button type="button" className="guideline-filter-apply" onClick={onApplyFilters}>
            Apply Filters
          </Button>
        </div>
      </Dropdown>
    </div>
  );
}
