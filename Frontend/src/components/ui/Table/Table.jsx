import { cn } from '@/lib/cn';

/**
 * Table building blocks. Header = surface-table-head, 44px (Figma).
 * Wrapper scrolls horizontally so wide tables never break the page layout.
 */
export function Table({ className, children, ...rest }) {
  return (
    <div className="w-full overflow-x-auto">
      <table className={cn('w-full border-collapse text-left text-[13px]', className)} {...rest}>{children}</table>
    </div>
  );
}
export const TableHead = ({ children }) => <thead>{children}</thead>;
export const TableBody = ({ children }) => <tbody>{children}</tbody>;
export const TableRow = ({ className, ...rest }) => <tr className={cn('transition-colors hover:bg-surface-field-disabled', className)} {...rest} />;
export const TableHeaderCell = ({ className, ...rest }) => (
  <th className={cn('h-table-head whitespace-nowrap border-b border-line-table-head bg-surface-table-head px-3 text-xs font-semibold text-ink-secondary', className)} {...rest} />
);
export const TableCell = ({ className, ...rest }) => (
  <td className={cn('border-b border-line-card px-3 py-2.5 align-middle text-[13px] text-ink-primary', className)} {...rest} />
);
