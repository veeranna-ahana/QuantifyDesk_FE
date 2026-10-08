// src/features/server-information/components/ProjectTagInput.jsx
import { useEffect, useRef } from 'react';
import { ChevronDown, Search, X } from 'lucide-react';

import { cn } from '@/lib/cn';

/**
 * Tag-style multi-select for assigning projects.
 * Matches the Figma design: selected projects shown as removable chips inside
 * a bordered box, below which is a searchable dropdown trigger.
 */
export function ProjectTagInput({
  options = [],
  selected = [],
  onToggle,
  onRemove,
  search,
  onSearchChange,
  open,
  onOpenChange,
  error,
}) {
  const containerRef = useRef(null);

  // Close dropdown on outside click
  useEffect(() => {
    if (!open) return undefined;
    const handleClick = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        onOpenChange(false);
      }
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, [open, onOpenChange]);

  const filtered = options.filter(
    (o) =>
      !selected.includes(o) &&
      o.toLowerCase().includes(search.toLowerCase()),
  );

  return (
    <div ref={containerRef} className="flex flex-col gap-1.5">
      {/* ── Outer bordered container: 672 × 102px, padding:8px, gap:16px ── */}
      <div
        className={cn(
          'w-full max-w-[672px] min-h-[102px] rounded-control border bg-surface-card p-2 flex flex-col gap-4 transition-colors',
          error ? 'border-badge-danger-ink' : 'border-line-field',
        )}
      >
        {/* Selected project chips row */}
        {selected.length > 0 && (
          <div className="flex flex-wrap gap-1.5">
            {selected.map((project) => (
              <span
                key={project}
                className="inline-flex h-6 items-center gap-1 rounded-control border border-[#D8D0FA] bg-[#EDE9FE] py-0.5 pl-2.5 pr-1.5 text-[12px] font-normal leading-[18px] text-[#5B3DC4]"
              >
                {project}
                <button
                  type="button"
                  onClick={() => onRemove(project)}
                  aria-label={`Remove ${project}`}
                  className="ml-0.5 rounded-sm text-action-primary/70 transition-colors hover:text-action-primary focus-visible:outline-none"
                >
                  <X className="h-3 w-3" />
                </button>
              </span>
            ))}
          </div>
        )}

        {/* ── Dropdown search field: 497 × 44px, px-4 py-2, border-radius:4px ── */}
        <div className="relative w-full max-w-[497px]">
          <button
            type="button"
            onClick={() => onOpenChange(!open)}
            aria-expanded={open}
            aria-haspopup="listbox"
            className="flex h-control-lg w-full shrink-0 items-center gap-2 rounded-control border border-line-card px-4 py-2 text-left transition-colors"
          >
            <Search className="h-3.5 w-3.5 shrink-0 text-ink-muted" aria-hidden="true" />
            <input
              type="text"
              value={search}
              onChange={(e) => {
                onSearchChange(e.target.value);
                if (!open) onOpenChange(true);
              }}
              onFocus={() => onOpenChange(true)}
              placeholder="Search or select project to assign..."
              className="flex-1 border-none bg-transparent text-[13px] text-ink-primary placeholder:text-ink-muted outline-none focus:border-none focus:outline-none focus:ring-0"
            />
            <ChevronDown
              className={cn(
                'h-4 w-4 shrink-0 text-ink-muted transition-transform duration-150',
                open && 'rotate-180',
              )}
              aria-hidden="true"
            />
          </button>

          {/* ── Floating dropdown list — anchored below the search field ── */}
          {open && (
            <div
              role="listbox"
              aria-label="Project options"
              className="absolute left-0 top-full z-50 mt-1 w-full rounded-[4px] border border-line-card bg-surface-card shadow-md"
            >
              {filtered.length === 0 ? (
                <p className="px-4 py-2.5 text-[13px] text-ink-muted">
                  {search ? 'No projects match your search.' : 'All projects are already assigned.'}
                </p>
              ) : (
                <ul className="max-h-44 overflow-y-auto py-1">
                  {filtered.map((project) => (
                    <li key={project}>
                      <button
                        type="button"
                        role="option"
                        aria-selected={selected.includes(project)}
                        onClick={() => {
                          onToggle(project);
                          onSearchChange('');
                        }}
                        className="flex w-full items-center px-4 py-2 text-[13px] text-ink-primary transition-colors hover:bg-action-primary-soft hover:text-action-primary"
                      >
                        {project}
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          )}
        </div>
      </div>



      {error && <p className="text-xs text-badge-danger-ink">{error}</p>}
    </div>
  );
}
