// src/components/ui/DataTable/DataTable.jsx
// Mirrors @UI/src/components/ui/DataTable/DataTable.tsx — adapted for WorkQuantify
import React from 'react';

/**
 * Generic data table with configurable columns.
 *
 * @param {{
 *   columns: Array<{key: string, label: string}>,
 *   rows: Array<Record<string, any>>,
 *   renderCell?: (key: string, row: Record<string, any>) => React.ReactNode,
 *   renderAction?: (row: Record<string, any>) => React.ReactNode,
 *   loading?: boolean,
 *   emptyMessage?: string,
 *   selectable?: boolean,
 * }} props
 */
export function DataTable({
  columns = [],
  rows = [],
  renderCell,
  renderAction,
  loading = false,
  emptyMessage = 'No data found.',
  selectable = false,
}) {
  return (
    <div className="task-table-wrapper">
      <table className="task-table">
        <thead>
          <tr>
            {selectable && (
              <th className="task-table-header task-table-checkbox">
                <input type="checkbox" aria-label="Select all" />
              </th>
            )}
            {columns.map((col) => (
              <th key={col.key} className="task-table-header">
                {col.label}
              </th>
            ))}
            {renderAction && (
              <th className="task-table-header">Action</th>
            )}
          </tr>
        </thead>

        <tbody>
          {loading ? (
            <tr>
              <td
                colSpan={columns.length + (selectable ? 1 : 0) + (renderAction ? 1 : 0)}
                className="task-table-cell"
                style={{ textAlign: 'center', padding: '24px' }}
              >
                Loading…
              </td>
            </tr>
          ) : rows.length === 0 ? (
            <tr>
              <td
                colSpan={columns.length + (selectable ? 1 : 0) + (renderAction ? 1 : 0)}
                className="task-table-cell"
                style={{ textAlign: 'center', padding: '24px' }}
              >
                {emptyMessage}
              </td>
            </tr>
          ) : (
            rows.map((row, rowIdx) => (
              <tr key={row.id ?? rowIdx}>
                {selectable && (
                  <td className="task-table-cell task-table-checkbox">
                    <input type="checkbox" aria-label={`Select row ${rowIdx + 1}`} />
                  </td>
                )}
                {columns.map((col) => (
                  <td key={col.key} className="task-table-cell">
                    {renderCell ? renderCell(col.key, row) : row[col.key]}
                  </td>
                ))}
                {renderAction && (
                  <td className="task-table-cell">{renderAction(row)}</td>
                )}
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}

export default DataTable;
