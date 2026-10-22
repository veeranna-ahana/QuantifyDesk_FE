import styles from "./ReportPagination.module.css";

function PageButton({ children, active, disabled, label, onClick }) {
  return (
    <button
      type="button"
      aria-label={label}
      aria-current={active ? "page" : undefined}
      disabled={disabled}
      className={`${styles.pageButton} ${active ? styles.activePage : ""}`}
      onClick={onClick}
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
  totalRecords = 145,
  pageSize = 10,
  onPageChange,
}) {
  const totalPages = Math.max(1, Math.ceil(totalRecords / pageSize));
  const safePage = Math.min(Math.max(1, page), totalPages);
  const start = totalRecords ? (safePage - 1) * pageSize + 1 : 0;
  const end = Math.min(safePage * pageSize, totalRecords);

  const pageItems = getPageItems(safePage, totalPages);

  return (
    <footer className={styles.footer}>
      <span className={styles.footerLabel}>
        Showing {start}-{end} of {totalRecords} records
      </span>
      <nav className={styles.pagination} aria-label="Report pagination">
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
              className={styles.ellipsis}
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
