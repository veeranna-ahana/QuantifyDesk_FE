/**
 * SearchableSelect — combobox-style searchable dropdown.
 *
 * When closed : shows selected label (or placeholder) as a button.
 * When open   : the trigger turns into a live-filter text input.
 *               No separate search box inside the popover.
 *
 * Props:
 *   value        – current selected value (string)
 *   onChange     – (value: string) => void
 *   options      – Array<{ value: string, label: string }>
 *   placeholder  – string shown when nothing is selected
 *   disabled     – boolean
 *   error        – boolean — highlights trigger in red
 *   loading      – boolean — shows spinner & disables
 *   id           – optional HTML id for the input
 *   className    – extra classes for the trigger wrapper
 */

import React, { useState, useRef, useEffect, useCallback } from "react";
import { createPortal } from "react-dom";

const SearchableSelect = ({
  value = "",
  onChange,
  options = [],
  placeholder = "Select…",
  disabled = false,
  error = false,
  loading = false,
  id,
  className = "",
}) => {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  // Popover is rendered through a portal (see below) so it's never clipped by an ancestor with
  // overflow:hidden/auto — e.g. a table wrapped in a scroll container for sticky headers. Its
  // position is computed from the trigger's own screen coordinates instead of relying on normal
  // document flow / `absolute` positioning relative to a (possibly clipping) parent.
  const [coords, setCoords] = useState(null);
  const containerRef = useRef(null);
  const inputRef = useRef(null);
  const popoverRef = useRef(null);

  const updateCoords = useCallback(() => {
    const el = containerRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    setCoords({ top: rect.bottom + 4, left: rect.left, width: rect.width });
  }, []);

  // Recompute position whenever the popover is open and the page scrolls/resizes (the scroll
  // may happen on the table's own scroll container, not just the window, so this listens in the
  // capture phase to catch inner scroll containers too).
  useEffect(() => {
    if (!open) return undefined;
    updateCoords();
    window.addEventListener("scroll", updateCoords, true);
    window.addEventListener("resize", updateCoords);
    return () => {
      window.removeEventListener("scroll", updateCoords, true);
      window.removeEventListener("resize", updateCoords);
    };
  }, [open, updateCoords]);

  // Derived
  const selectedLabel =
    options.find((o) => String(o.value) === String(value))?.label || "";

  // Plain substring matching means "Work" also matches "Network" or "Workflow" — technically
  // correct, but with a long options list (e.g. 340 PMS project titles) the one the person
  // actually meant ("Work Quantify tool") can end up buried below several coincidental
  // substring hits with no relation to what they're after. Rank results instead of leaving them
  // in their original/alphabetical order: an exact match first, then "starts with" matches, then
  // "word starts with" matches (e.g. "Quantify" inside "Work Quantify tool"), then any other
  // substring match — each tier alphabetical among itself.
  const filtered = (() => {
    const q = query.trim().toLowerCase();
    if (!q) return options;
    const rank = (label) => {
      const l = label.toLowerCase();
      if (l === q) return 0;
      if (l.startsWith(q)) return 1;
      if (l.split(/\s+/).some((word) => word.startsWith(q))) return 2;
      if (l.includes(q)) return 3;
      return -1;
    };
    return options
      .map((o) => ({ o, r: rank(o.label || "") }))
      .filter(({ r }) => r !== -1)
      .sort((a, b) => a.r - b.r || a.o.label.localeCompare(b.o.label))
      .map(({ o }) => o);
  })();

  // Close on outside click
  useEffect(() => {
    const handler = (e) => {
      // The popover is portaled to document.body, so it's outside containerRef in the DOM tree —
      // a click inside it must not count as an "outside" click, or every option click would
      // close the dropdown before onMouseDown's handleSelect runs.
      const inTrigger =
        containerRef.current && containerRef.current.contains(e.target);
      const inPopover =
        popoverRef.current && popoverRef.current.contains(e.target);
      if (!inTrigger && !inPopover) {
        setOpen(false);
        setQuery("");
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  // Close on ESC
  useEffect(() => {
    const handler = (e) => {
      if (e.key === "Escape") {
        setOpen(false);
        setQuery("");
      }
    };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, []);

  // Focus the input when popover opens
  useEffect(() => {
    if (open && inputRef.current) {
      setTimeout(() => inputRef.current?.focus(), 20);
    }
  }, [open]);

  const openDropdown = () => {
    if (disabled || loading) return;
    setOpen(true);
    setQuery("");
  };

  const handleSelect = useCallback(
    (val) => {
      onChange?.(val);
      setOpen(false);
      setQuery("");
    },
    [onChange],
  );

  // Clear the selection
  const handleClear = (e) => {
    e.stopPropagation();
    onChange?.("");
    setOpen(false);
    setQuery("");
  };

  // Border colour — only change the border color, no ring (avoids size jump)
  const borderCls = error
    ? "border-red-400"
    : open
      ? "border-violet-400"
      : "border-gray-200";

  return (
    <div ref={containerRef} className="relative w-full">
      {/* ── Trigger / inline search input ── */}
      <div
        className={[
          "w-full flex items-center gap-2 px-3 bg-white border rounded-lg transition-colors h-[42px]",
          borderCls,
          disabled || loading ? "opacity-60 cursor-not-allowed" : "cursor-text",
          className,
        ].join(" ")}
        onClick={openDropdown}
      >
        {/* Loading spinner */}
        {loading && (
          <svg
            className="animate-spin w-3.5 h-3.5 text-gray-400 shrink-0"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8v8z"
            />
          </svg>
        )}

        {open ? (
          /* ── Search mode: editable input ── */
          <input
            ref={inputRef}
            id={id}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={selectedLabel || placeholder}
            className="flex-1 min-w-0 bg-transparent text-sm text-gray-800 placeholder-gray-400"
            style={{
              outline: "none",
              border: "none",
              boxShadow: "none",
              WebkitAppearance: "none",
            }}
            disabled={disabled || loading}
          />
        ) : (
          /* ── Display mode: selected label or placeholder ── */
          <span
            className={`flex-1 min-w-0 text-sm truncate ${selectedLabel ? "text-gray-800" : "text-gray-400"}`}
          >
            {loading ? "Loading…" : selectedLabel || placeholder}
          </span>
        )}

        {/* Right-side icons — fixed width so layout never shifts */}
        <span className="flex items-center gap-1 shrink-0 w-9 justify-end">
          {/* Clear button — only when a value is selected and not open */}
          {value && !open && !disabled && !loading ? (
            <button
              type="button"
              onMouseDown={handleClear}
              className="text-gray-300 hover:text-gray-500 transition-colors"
              tabIndex={-1}
            >
              <svg
                className="w-3.5 h-3.5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          ) : (
            <span className="w-3.5" /> /* spacer keeps chevron aligned */
          )}
          {/* Chevron */}
          <svg
            className={`w-4 h-4 text-gray-400 transition-transform duration-200 ${open ? "rotate-180" : ""}`}
            fill="none"
            stroke="currentColor"
            strokeWidth={2}
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M6 9l6 6 6-6"
            />
          </svg>
        </span>
      </div>

      {/* ── Popover ──
          Rendered through a portal to document.body with `position: fixed` coordinates taken
          from the trigger's own bounding rect, so an ancestor with overflow:hidden/auto (e.g. a
          table scrolled for sticky headers) can never clip it — it used to be `position:
          absolute` inside normal flow, which got cut off in exactly that situation. */}
      {open &&
        coords &&
        createPortal(
          <div
            ref={popoverRef}
            className="fixed z-50 bg-white border border-gray-200 rounded-xl shadow-lg overflow-hidden"
            style={{
              top: coords.top,
              left: coords.left,
              width: coords.width,
              minWidth: "180px",
            }}
          >
            <ul className="max-h-52 overflow-y-auto py-1">
              {/* Clear / placeholder option */}
              <li>
                <button
                  type="button"
                  onMouseDown={() => handleSelect("")}
                  className={`w-full text-left px-3.5 py-2 text-sm transition-colors ${
                    value === ""
                      ? "bg-violet-50 text-violet-700 font-semibold"
                      : "text-gray-400 hover:bg-gray-50"
                  }`}
                >
                  {placeholder}
                </button>
              </li>

              {filtered.length === 0 ? (
                <li className="px-3.5 py-4 text-center text-xs text-gray-300">
                  No results for &ldquo;{query}&rdquo;
                </li>
              ) : (
                filtered.map((opt) => (
                  <li key={opt.value}>
                    <button
                      type="button"
                      onMouseDown={() => handleSelect(opt.value)}
                      className={`w-full text-left px-3.5 py-2 text-sm transition-colors ${
                        String(opt.value) === String(value)
                          ? "bg-violet-50 text-violet-700 font-semibold"
                          : "text-gray-700 hover:bg-gray-50"
                      }`}
                    >
                      {opt.label}
                    </button>
                  </li>
                ))
              )}
            </ul>

            {/* Result count hint */}
            {options.length > 6 && (
              <div className="border-t border-gray-50 px-3.5 py-1.5 text-[10px] text-gray-300">
                {filtered.length} of {options.length} result
                {options.length !== 1 ? "s" : ""}
              </div>
            )}
          </div>,
          document.body,
        )}
    </div>
  );
};

export default SearchableSelect;
