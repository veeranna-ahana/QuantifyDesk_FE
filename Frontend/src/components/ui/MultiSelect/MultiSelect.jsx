/**
 * MultiSelect — searchable dropdown that allows several values; selected ones show as chips.
 *
 * Props:
 *   value        – array of selected values
 *   onChange     – (values: Array) => void
 *   options      – Array<{ value, label }>
 *   placeholder  – shown when nothing is selected
 *   disabled     – read-only display (chips stay visible, no remove buttons)
 *   loading      – shows "Loading…" and disables
 *   id           – optional id for the search input
 *   className    – extra classes for the trigger box
 *
 * The popover is portaled to document.body (same approach as SearchableSelect) so scroll
 * containers / overflow-hidden cards can never clip it.
 */
import { useCallback, useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";

const MultiSelect = ({
  value = [],
  onChange,
  options = [],
  placeholder = "Select…",
  disabled = false,
  loading = false,
  id,
  className = "",
}) => {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [coords, setCoords] = useState(null);
  const containerRef = useRef(null);
  const inputRef = useRef(null);
  const popoverRef = useRef(null);

  const selected = (value || []).map(String);
  const labelOf = (v) =>
    options.find((o) => String(o.value) === String(v))?.label ?? String(v);

  const updateCoords = useCallback(() => {
    const el = containerRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    setCoords({ top: rect.bottom + 4, left: rect.left, width: rect.width });
  }, []);

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

  useEffect(() => {
    const onDown = (e) => {
      const inTrigger = containerRef.current?.contains(e.target);
      const inPopover = popoverRef.current?.contains(e.target);
      if (!inTrigger && !inPopover) {
        setOpen(false);
        setQuery("");
      }
    };
    const onKey = (e) => {
      if (e.key === "Escape") {
        setOpen(false);
        setQuery("");
      }
    };
    document.addEventListener("mousedown", onDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDown);
      document.removeEventListener("keydown", onKey);
    };
  }, []);

  useEffect(() => {
    if (open) setTimeout(() => inputRef.current?.focus(), 20);
  }, [open]);

  const toggle = (v) => {
    const key = String(v);
    // Clear the search text after every pick (keeps the list open and the input focused).
    setQuery("");
    inputRef.current?.focus();
    onChange?.(
      selected.includes(key)
        ? selected.filter((x) => x !== key)
        : [...selected, key],
    );
  };
  const remove = (v) => onChange?.(selected.filter((x) => x !== String(v)));

  const q = query.trim().toLowerCase();
  const filtered = q
    ? options.filter((o) => String(o.label).toLowerCase().includes(q))
    : options;

  const blocked = disabled || loading;

  return (
    <div ref={containerRef} className="relative w-full">
      <div
        className={[
          "flex min-h-[42px] w-full flex-wrap items-center gap-1.5 rounded-lg border bg-white px-2 py-1.5 transition-colors",
          open ? "border-violet-400" : "border-gray-200",
          blocked ? "cursor-not-allowed opacity-60" : "cursor-text",
          className,
        ].join(" ")}
        onClick={() => {
          if (!blocked) setOpen(true);
        }}
      >
        {loading && (
          <span className="px-1 text-sm text-gray-400">Loading…</span>
        )}

        {!loading &&
          selected.map((v) => (
            <span
              key={v}
              className="inline-flex items-center gap-1 rounded-md bg-violet-50 px-2 py-0.5 text-xs font-medium text-violet-700"
            >
              {labelOf(v)}
              {!disabled && (
                <button
                  type="button"
                  aria-label={`Remove ${labelOf(v)}`}
                  className="text-violet-400 hover:text-violet-700"
                  onMouseDown={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    remove(v);
                  }}
                >
                  ×
                </button>
              )}
            </span>
          ))}

        {!loading && selected.length === 0 && !open && (
          <span className="px-1 text-sm text-gray-400">
            {disabled ? "—" : placeholder}
          </span>
        )}

        {open && (
          <input
            ref={inputRef}
            id={id}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={selected.length ? "" : placeholder}
            className="min-w-[60px] flex-1 bg-transparent px-1 text-sm text-gray-800 placeholder-gray-400"
            style={{ outline: "none", border: "none", boxShadow: "none" }}
          />
        )}

        {!disabled && (
          <svg
            className={`ml-auto h-4 w-4 shrink-0 text-gray-400 transition-transform duration-200 ${open ? "rotate-180" : ""}`}
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
        )}
      </div>

      {open &&
        coords &&
        createPortal(
          <div
            ref={popoverRef}
            className="fixed z-50 overflow-hidden rounded-xl border border-gray-200 bg-white shadow-lg"
            style={{
              top: coords.top,
              left: coords.left,
              width: coords.width,
              minWidth: "180px",
            }}
          >
            <ul className="max-h-52 overflow-y-auto py-1">
              {filtered.length === 0 ? (
                <li className="px-3.5 py-4 text-center text-xs text-gray-300">
                  No results
                </li>
              ) : (
                filtered.map((opt) => {
                  const on = selected.includes(String(opt.value));
                  return (
                    <li key={opt.value}>
                      <button
                        type="button"
                        onMouseDown={(e) => {
                          e.preventDefault();
                          toggle(opt.value);
                        }}
                        className={`flex w-full items-center gap-2 px-3.5 py-2 text-left text-sm transition-colors ${
                          on
                            ? "bg-violet-50 font-semibold text-violet-700"
                            : "text-gray-700 hover:bg-gray-50"
                        }`}
                      >
                        <span
                          className={`flex h-4 w-4 shrink-0 items-center justify-center rounded border text-[10px] ${
                            on
                              ? "border-violet-600 bg-violet-600 text-white"
                              : "border-gray-300"
                          }`}
                        >
                          {on ? "✓" : ""}
                        </span>
                        {opt.label}
                      </button>
                    </li>
                  );
                })
              )}
            </ul>
          </div>,
          document.body,
        )}
    </div>
  );
};

export default MultiSelect;
