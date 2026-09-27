import { Table, TableBody, TableCell, TableHead, TableHeaderCell, TableRow } from './Table';

/**
 * Config-driven table:
 *   columns: [{ key, label, className?, render?: (row, index) => node }]
 *   rows: array (row.id used as key when present)
 */
export function DataTable({ columns, rows, emptyMessage = 'No data found.', onRowClick }) {
  return (
    <Table>
      <TableHead>
        <TableRow className="hover:bg-transparent">
          {columns.map((c) => <TableHeaderCell key={c.key} className={c.className}>{c.label}</TableHeaderCell>)}
        </TableRow>
      </TableHead>
      <TableBody>
        {rows.length === 0 ? (
          <TableRow className="hover:bg-transparent">
            <TableCell colSpan={columns.length} className="py-8 text-center text-ink-muted">{emptyMessage}</TableCell>
          </TableRow>
        ) : (
          rows.map((row, i) => (
            <TableRow key={row.id ?? i} onClick={onRowClick ? () => onRowClick(row) : undefined} className={onRowClick ? 'cursor-pointer' : undefined}>
              {columns.map((c) => <TableCell key={c.key} className={c.className}>{c.render ? c.render(row, i) : row[c.key]}</TableCell>)}
            </TableRow>
          ))
        )}
      </TableBody>
    </Table>
  );
}
