// src/features/server-information/components/ProjectTagInput.jsx
import { useEffect, useRef } from "react";
import { Check, ChevronDown, Info, Pencil, Search, X } from "lucide-react";

import { cn } from "@/lib/cn";

const CHIP =
  "inline-flex h-6 items-center gap-1 rounded-control border py-0.5 pl-2.5 pr-1.5 text-[12px] font-normal leading-[18px]";
const CHIP_PROJECT = `${CHIP} border-[#D8D0FA] bg-[#EDE9FE] text-[#5B3DC4]`;
const CHIP_CUSTOM = `${CHIP} border-[#FDE68A] bg-[#FFFBEB] text-[#92400E]`;

/** Round checkbox look used inside the dropdown rows (the row itself is the button). */
function CheckBox({ checked, tone = "primary" }) {
  return (
    <span
      aria-hidden="true"
      className={cn(
        "flex h-4 w-4 shrink-0 items-center justify-center rounded-[3px] border",
        checked
          ? tone === "other"
            ? "border-[#F59E0B] bg-[#F59E0B] text-white"
            : "border-action-primary bg-action-primary text-white"
          : "border-line-field bg-surface-card",
      )}
    >
      {checked && <Check className="h-3 w-3" strokeWidth={3} />}
    </span>
  );
}

/**
 * Tag-style multi-select for assigning projects.
 * Selected projects show as removable chips inside a bordered box, below which is a searchable
 * dropdown. The last option, "Other (Add Project)", reveals an "Add Project Name" input so a
 * project that isn't in the catalog can be typed in — confirmed with the ✓ button (or Enter), it
 * is added as its own (amber) chip.
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
  optionsLoading = false,
  optionsError = null,
  otherOpen = false,
  otherName = "",
  otherError,
  onToggleOther,
  onOtherNameChange,
  onConfirmOther,
}) {
  const containerRef = useRef(null);
  const otherInputRef = useRef(null);

  // Close dropdown on outside click
  useEffect(() => {
    if (!open) return undefined;
    const handleClick = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        onOpenChange(false);
      }
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [open, onOpenChange]);

  // Jump straight into the name field when "Other" gets selected
  useEffect(() => {
    if (otherOpen) otherInputRef.current?.focus();
  }, [otherOpen]);

  const filtered = options.filter((o) =>
    o.toLowerCase().includes(search.toLowerCase()),
  );
  const isCustom = (name) => !options.includes(name);

  return (
    <div ref={containerRef} className="flex flex-col gap-1.5">
      <div
        className={cn(
          "w-full max-w-[672px] min-h-[102px] rounded-control border bg-surface-card p-2 flex flex-col gap-4 transition-colors",
          error ? "border-badge-danger-ink" : "border-line-field",
        )}
      >
        {/* Selected project chips row */}
        {(selected.length > 0 || otherOpen) && (
          <div className="flex flex-wrap gap-1.5">
            {selected.map((project) => (
              <span
                key={project}
                className={isCustom(project) ? CHIP_CUSTOM : CHIP_PROJECT}
              >
                {project}
                <button
                  type="button"
                  onClick={() => onRemove(project)}
                  aria-label={`Remove ${project}`}
                  className="ml-0.5 rounded-sm opacity-70 transition-colors hover:opacity-100 focus-visible:outline-none"
                >
                  <X className="h-3 w-3" />
                </button>
              </span>
            ))}
            {otherOpen && (
              <span className={CHIP_CUSTOM}>
                <Pencil className="h-3 w-3" aria-hidden="true" />
                Other
                <button
                  type="button"
                  onClick={onToggleOther}
                  aria-label="Remove Other"
                  className="ml-0.5 rounded-sm opacity-70 transition-colors hover:opacity-100 focus-visible:outline-none"
                >
                  <X className="h-3 w-3" />
                </button>
              </span>
            )}
          </div>
        )}

        {/* Dropdown search field */}
        <div className="relative w-full max-w-[497px]">
          <button
            type="button"
            onClick={() => onOpenChange(!open)}
            aria-expanded={open}
            aria-haspopup="listbox"
            className="flex h-control-lg w-full shrink-0 items-center gap-2 rounded-control border border-line-card px-4 py-2 text-left transition-colors"
          >
            <Search
              className="h-3.5 w-3.5 shrink-0 text-ink-muted"
              aria-hidden="true"
            />
            <input
              type="text"
              value={search}
              onChange={(e) => {
                onSearchChange(e.target.value);
                if (!open) onOpenChange(true);
              }}
              onFocus={() => onOpenChange(true)}
              onClick={(e) => e.stopPropagation()} // focus already opened it; don't let the wrapper's toggle close it again
              placeholder="Search or select project to assign..."
              className="flex-1 border-none bg-transparent text-[13px] text-ink-primary placeholder:text-ink-muted outline-none focus:border-none focus:outline-none focus:ring-0"
            />
            <ChevronDown
              className={cn(
                "h-4 w-4 shrink-0 text-ink-muted transition-transform duration-150",
                open && "rotate-180",
              )}
              aria-hidden="true"
            />
          </button>

          {/* Floating dropdown list */}
          {open && (
            <div
              role="listbox"
              aria-multiselectable="true"
              aria-label="Project options"
              className="absolute left-0 top-full z-50 mt-1 w-full overflow-hidden rounded-[4px] border border-line-card bg-surface-card shadow-md"
            >
              <p className="bg-surface-field-disabled px-4 py-2 text-[11px] font-semibold uppercase tracking-wide text-ink-muted">
                Project Catalog
              </p>
              <ul className="max-h-52 overflow-y-auto">
                {optionsLoading && (
                  <li className="px-4 py-2.5 text-[13px] text-ink-muted">
                    Loading projects…
                  </li>
                )}
                {!optionsLoading && optionsError && (
                  <li className="px-4 py-2.5 text-[12px] text-badge-danger-ink">
                    {optionsError}
                  </li>
                )}
                {!optionsLoading && filtered.length === 0 && (
                  <li className="px-4 py-2.5 text-[13px] text-ink-muted">
                    No projects match your search.
                  </li>
                )}
                {filtered.map((project) => {
                  const checked = selected.includes(project);
                  return (
                    <li key={project}>
                      <button
                        type="button"
                        role="option"
                        aria-selected={checked}
                        onClick={() => {
                          onToggle(project);
                          onSearchChange("");
                        }}
                        className={cn(
                          "flex w-full items-center gap-3 px-4 py-2 text-left text-[13px] text-ink-primary transition-colors hover:bg-action-primary-soft",
                          checked && "bg-action-primary-soft/60",
                        )}
                      >
                        <CheckBox checked={checked} />
                        <span className="flex-1">{project}</span>
                        {checked && (
                          <span className="rounded bg-[#EDE9FE] px-2 py-0.5 text-[11px] text-[#5B3DC4]">
                            Selected
                          </span>
                        )}
                      </button>
                    </li>
                  );
                })}
                {/* Always last, whatever the search says */}
                <li>
                  <button
                    type="button"
                    role="option"
                    aria-selected={otherOpen}
                    onClick={() => {
                      onToggleOther();
                      onOpenChange(false);
                    }}
                    className={cn(
                      "flex w-full items-center gap-3 border-t border-line-card px-4 py-2 text-left text-[13px] font-semibold text-[#92400E] transition-colors hover:bg-[#FFFBEB]",
                      otherOpen && "bg-[#FFFBEB]",
                    )}
                  >
                    <CheckBox checked={otherOpen} tone="other" />
                    Other (Add Project)
                  </button>
                </li>
              </ul>
            </div>
          )}
        </div>

        {/* "Other" → type the project name */}
        {otherOpen && (
          <div className="flex flex-col gap-2 rounded-control border border-[#FDE68A] bg-[#FFFBEB] p-3">
            <label
              htmlFor="other-project-name"
              className="flex items-center gap-1.5 text-xs font-semibold text-[#92400E]"
            >
              <Info className="h-3.5 w-3.5" aria-hidden="true" />
              Add Project Name <span className="text-badge-danger-ink">*</span>
            </label>
            <div className="flex items-center gap-2">
              <input
                id="other-project-name"
                ref={otherInputRef}
                type="text"
                maxLength={100}
                value={otherName}
                onChange={(e) => onOtherNameChange(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault(); // don't submit the whole server form
                    onConfirmOther();
                  }
                }}
                placeholder="Enter project name"
                aria-invalid={Boolean(otherError)}
                className={cn(
                  "h-control-md min-w-0 flex-1 rounded-control border bg-surface-card px-3 text-[13px] text-ink-primary outline-none placeholder:text-ink-muted focus:border-action-primary",
                  otherError ? "border-badge-danger-ink" : "border-[#FDE68A]",
                )}
              />
              <button
                type="button"
                onClick={onConfirmOther}
                aria-label="Add project"
                title="Add project"
                className="flex h-control-md w-12 shrink-0 items-center justify-center rounded-control bg-action-primary text-white transition-colors hover:bg-action-primary-hover"
              >
                <Check className="h-4 w-4" strokeWidth={2.5} />
              </button>
            </div>
            {otherError && (
              <p className="text-xs text-badge-danger-ink">{otherError}</p>
            )}
          </div>
        )}
      </div>

      {error && <p className="text-xs text-badge-danger-ink">{error}</p>}
    </div>
  );
}
