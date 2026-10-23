import { cn } from "@/lib/cn";

function PageButton({ children, active, disabled, label, onClick }) {
  return (
    <button
      type="button"
      aria-label={label}
      aria-current={active ? "page" : undefined}
      disabled={disabled}
      onClick={onClick}
      className={cn(
        "inline-flex h-[30px] w-[30px] flex-none items-center justify-center rounded-lg border text-[12px] font-medium transition-colors",
        active
          ? "border-action-primary bg-action-primary font-semibold text-ink-on-primary"
          : "border-line-card bg-surface-card text-ink-secondary hover:border-line-default hover:bg-surface-field-disabled hover:text-ink-primary disabled:cursor-not-allowed disabled:border-[#f1f5f9] disabled:text-ink-muted/60 disabled:opacity-40",
      )}
    >
      {children}
    </button>
  );
}

function getPageItems(currentPage, totalPages) {
  if (totalPages <= 5) {
    return Array.from({ length: totalPages }, (_, i) => i + 1);
  }
  if (currentPage <= 2) {
    return [1, 2, 3, "..."];
  }
  if (currentPage === 3) {
    return [1, 2, 3, 4, "..."];
  }
  if (currentPage >= totalPages - 1) {
    return [1, "...", totalPages - 2, totalPages - 1, totalPages];
  }
  return [1, "...", currentPage - 1, currentPage, currentPage + 1, "..."];
}

export function ReportPagination({
  page = 1,
  totalRecords = 0,
  pageSize = 10,
  onPageChange,
}) {
  const totalPages = Math.max(1, Math.ceil(totalRecords / pageSize));
  const safePage = Math.min(Math.max(1, page), totalPages);
  const start = totalRecords ? (safePage - 1) * pageSize + 1 : 0;
  const end = Math.min(safePage * pageSize, totalRecords);

  const pageItems = getPageItems(safePage, totalPages);

  return (
    <footer className="flex h-11 min-h-[44px] flex-none items-center justify-between gap-4 rounded-b-xl border-t border-line-card bg-surface-table-head px-4">
      <span className="text-[12px] text-ink-muted">
        Showing {start}-{end} of {totalRecords} records
      </span>
      <nav className="flex items-center gap-1" aria-label="Report pagination">
        <PageButton
          label="Previous page"
          disabled={safePage <= 1}
          onClick={() => onPageChange(safePage - 1)}
        >
          &lt;
        </PageButton>
        {pageItems.map((item, index) =>
          typeof item === "number" ? (
            <PageButton
              key={`page-${item}`}
              label={`Page ${item}`}
              active={item === safePage}
              onClick={() => onPageChange(item)}
            >
              {item}
            </PageButton>
          ) : (
            <span
              key={`ellipsis-${index}`}
              className="inline-flex h-8 w-[18px] select-none items-center justify-center text-[12px] text-ink-muted"
              aria-hidden="true"
            >
              ...
            </span>
          ),
        )}
        <PageButton
          label="Next page"
          disabled={safePage >= totalPages}
          onClick={() => onPageChange(safePage + 1)}
        >
          &gt;
        </PageButton>
      </nav>
    </footer>
  );
}
