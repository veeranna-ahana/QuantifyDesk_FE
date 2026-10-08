import React from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeaderCell, TableRow, TableFooter } from './Table';
import { Skeleton } from '@/components/ui/Skeleton';
import { cn } from '@/lib/cn';

const DEFAULT_GRID_COLUMNS = 'grid-cols-[minmax(0,32%)_minmax(0,15%)_minmax(0,15%)_minmax(0,12%)_minmax(0,14%)_minmax(0,12%)]';

/**
 * Config-driven table:
 *   columns: [{ key, label, className?, headerClassName?, cellClassName?, align?: 'left'|'center'|'right', width?, render?: (row, index) => node }]
 *   rows / data: array (row.id used as key when present)
 *   loading?: boolean
 *   error?: string | ReactNode
 *   emptyMessage?: string
 *   emptyState?: ReactNode
 *   onRowClick?: (row) => void
 *   footer?: ReactNode
 *   fitHeight?: boolean (true by default for Guideline to share height equally with 0 scrollbar)
 *   card?: boolean
 *   cardClassName?: string
 *   headerClassName?: string
 *   rowClassName?: string | ((row, index) => string)
 */
export function DataTable({
  columns = [],
  rows,
  data,
  loading = false,
  error = null,
  emptyMessage = 'No data found.',
  emptyState,
  onRowClick,
  className,
  wrapperClassName,
  fitHeight = true,
  card = false,
  cardClassName,
  gridClassName = DEFAULT_GRID_COLUMNS,
  headerClassName,
  bodyClassName,
  rowClassName,
  footer,
  rowsPerPage = 10,
  ...rest
}) {
  const dataRows = rows ?? data ?? [];
  const shouldWrapCard = card || Boolean(footer);

  // When fitHeight is enabled, render the body as a CSS grid with equally sized rows.
  if (fitHeight && shouldWrapCard) {
    return (
      <div
        className={cn(
          'bg-surface-card border border-[#F1F5F9] rounded-[12px] overflow-hidden shadow-1 flex flex-col flex-1 min-h-0',
          cardClassName
        )}
      >
        <div
          className={cn(
            'grid items-center shrink-0 bg-surface-table-head border-b border-line-card',
            gridClassName,
            headerClassName
          )}
        >
          {columns.map((c) => (
            <div
              key={c.key}
              className={cn(
                'px-5 text-[12px] font-semibold text-[#64748B] select-none',
                c.align === 'center' ? 'text-center' : c.align === 'right' ? 'text-right' : 'text-left',
                c.headerClassName
              )}
            >
              {c.label}
            </div>
          ))}
        </div>

        <div className={cn('flex-1 min-h-0 w-full overflow-hidden', bodyClassName)}>
          {error ? (
            <div className="flex items-center justify-center h-full text-accent-error text-[13px] col-span-full row-span-full">
              {error}
            </div>
          ) : loading && dataRows.length === 0 ? (
            Array.from({ length: rowsPerPage }).map((_, i) => (
              <div
                key={i}
                className={cn('grid items-center border-b border-[#F1F5F9] last:border-b-0', gridClassName, rowClassName)}
              >
                <Skeleton className="h-5 w-full rounded" />
              </div>
            ))
          ) : dataRows.length === 0 ? (
            <div className="flex items-center justify-center h-full text-ink-muted text-[13px] col-span-full row-span-full">
              {emptyState ?? emptyMessage}
            </div>
          ) : (
            dataRows.slice(0, rowsPerPage).map((row, i) => (
              <div
                key={row.id ?? i}
                onClick={onRowClick ? () => onRowClick(row) : undefined}
                className={cn(
                  'grid items-center border-b border-[#F1F5F9] transition-colors hover:bg-surface-field-disabled last:border-b-0',
                  gridClassName,
                  onRowClick && 'cursor-pointer',
                  typeof rowClassName === 'function' ? rowClassName(row, i) : rowClassName
                )}
              >
                {columns.map((c) => (
                  <div
                    key={c.key}
                    className={cn(
                      'px-5 truncate text-[12px]',
                      c.align === 'center' ? 'text-center' : c.align === 'right' ? 'text-right' : 'text-left',
                      c.cellClassName
                    )}
                  >
                    {c.render ? c.render(row, i) : row[c.key]}
                  </div>
                ))}
              </div>
            ))
          )}
        </div>

        {/* Footer: 50px tall */}
        {footer && (
          <div className="h-[50px] shrink-0 border-t border-line-card bg-surface-table-head flex items-center justify-between">
            {footer}
          </div>
        )}
      </div>
    );
  }

  // Fallback to standard Table layout for other callers (e.g. ProjectPerformanceTable)
  const standardTable = (
    <Table className={cn('w-full table-fixed', className)} wrapperClassName={wrapperClassName} {...rest}>
      <TableHead>
        <TableRow className="hover:bg-transparent bg-surface-table-head">
          {columns.map((c) => (
            <TableHeaderCell
              key={c.key}
              align={c.align || 'left'}
              className={cn(c.width, c.headerClassName, c.className)}
            >
  columns,
  rows,
  emptyMessage = "No data found.",
  onRowClick,
  wrapperClassName,
}) {
  return (
    <Table wrapperClassName={wrapperClassName}>
      <TableHead>
        <TableRow className="hover:bg-transparent">
          {columns.map((c) => (
            <TableHeaderCell key={c.key} className={c.className}>
              {c.label}
            </TableHeaderCell>
          ))}
        </TableRow>
      </TableHead>
      <TableBody>
        {error ? (
          <TableRow className="hover:bg-transparent">
            <TableCell colSpan={columns.length} align="center" className="py-8 text-accent-error">
              {error}
            </TableCell>
          </TableRow>
        ) : loading && dataRows.length === 0 ? (
          Array.from({ length: 5 }).map((_, i) => (
            <TableRow key={i} className="hover:bg-transparent">
              <TableCell colSpan={columns.length} className="py-2 px-5">
                <Skeleton className="h-6 w-full rounded" />
              </TableCell>
            </TableRow>
          ))
        ) : dataRows.length === 0 ? (
          <TableRow className="hover:bg-transparent">
            <TableCell colSpan={columns.length} align="center" className="py-8 text-ink-muted">
              {emptyState ?? emptyMessage}
            </TableCell>
          </TableRow>
        ) : (
          dataRows.map((row, i) => (
            <TableRow
              key={row.id ?? i}
              onClick={onRowClick ? () => onRowClick(row) : undefined}
              className={cn(
                'transition-colors hover:bg-surface-field-disabled',
                onRowClick && 'cursor-pointer',
                typeof rowClassName === 'function' ? rowClassName(row, i) : rowClassName
              )}
            >
              {columns.map((c) => (
                <TableCell
                  key={c.key}
                  align={c.align || 'left'}
                  className={cn(c.width, c.cellClassName, c.className)}
                >
            <TableCell
              colSpan={columns.length}
              className="py-8 text-center text-ink-muted"
            >
              {emptyMessage}
            </TableCell>
          </TableRow>
        ) : (
          rows.map((row, i) => (
            <TableRow
              key={row.id ?? i}
              onClick={onRowClick ? () => onRowClick(row) : undefined}
              className={onRowClick ? "cursor-pointer" : undefined}
            >
              {columns.map((c) => (
                <TableCell key={c.key} className={c.className}>
                  {c.render ? c.render(row, i) : row[c.key]}
                </TableCell>
              ))}
            </TableRow>
          ))
        )}
      </TableBody>
    </Table>
  );

  if (shouldWrapCard) {
    return (
      <div className={cn('bg-surface-card border border-[#F1F5F9] rounded-[12px] overflow-hidden shadow-1 flex flex-col', cardClassName)}>
        {standardTable}
        {footer && (
          <TableFooter className="p-0 border-t border-line-card bg-surface-table-head">
            {footer}
          </TableFooter>
        )}
      </div>
    );
  }

  return standardTable;
}
