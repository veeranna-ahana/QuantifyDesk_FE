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

export function ReportPagination({
  page,
  totalRecords = 145,
  pageSize = 10,
  onPageChange,
}) {
  const totalPages = Math.max(1, Math.ceil(totalRecords / pageSize));
  const start = totalRecords ? (page - 1) * pageSize + 1 : 0;
  const end = Math.min(page * pageSize, totalRecords);

  return (
    <footer className={styles.footer}>
      <span className={styles.footerLabel}>
        Showing {start}-{end} of {totalRecords} records
      </span>
      <nav className={styles.pagination} aria-label="Report pagination">
        <PageButton
          label="Previous page"
          disabled={page <= 1}
          onClick={() => onPageChange(page - 1)}
        >
          &lt;
        </PageButton>
        {[1, 2, 3].map((pageNumber) => (
          <PageButton
            key={pageNumber}
            label={`Page ${pageNumber}`}
            active={pageNumber === page}
            disabled={pageNumber > totalPages}
            onClick={() => onPageChange(pageNumber)}
          >
            {pageNumber}
          </PageButton>
        ))}
        <span className={styles.ellipsis} aria-hidden="true">
          ...
        </span>
        <PageButton
          label="Next page"
          disabled={page >= totalPages}
          onClick={() => onPageChange(page + 1)}
        >
          &gt;
        </PageButton>
      </nav>
    </footer>
  );
}
