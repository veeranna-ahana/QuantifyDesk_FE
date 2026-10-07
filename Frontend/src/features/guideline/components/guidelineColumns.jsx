import React from 'react';
import { ExternalLink, Pencil } from 'lucide-react';
import { formatDate } from '@/lib/date';

/**
 * Guideline column definitions and cell renderers.
 * Reused by the shared DataTable component.
 */
export const getGuidelineColumns = ({ onEdit }) => [
  {
    key: 'name',
    label: 'Guideline Name',
    align: 'left',
    headerClassName: 'guideline-list-header-cell',
    cellClassName: 'guideline-list-name-cell',
    render: (row) => (
      <span className="truncate block" title={row.name}>
        {row.name}
      </span>
    ),
  },
  {
    key: 'ownerName',
    label: 'Owner',
    align: 'left',
    headerClassName: 'guideline-list-header-cell',
    cellClassName: 'guideline-list-owner-cell',
    render: (row) => (
      <span className="truncate block" title={row.ownerName || row.owner || ''}>
        {row.ownerName || row.owner || ''}
      </span>
    ),
  },
  {
    key: 'createdDate',
    label: 'Created Date',
    align: 'left',
    headerClassName: 'guideline-list-header-cell',
    cellClassName: 'guideline-list-date-cell',
    render: (row) => (
      <span className="truncate block">
        {formatDate(row.createdDate)}
      </span>
    ),
  },
  {
    key: 'lastUpdated',
    label: 'Last Updated',
    align: 'left',
    headerClassName: 'guideline-list-header-cell',
    cellClassName: 'guideline-list-date-cell',
    render: (row) => (
      <span className="truncate block">
        {formatDate(row.lastUpdated)}
      </span>
    ),
  },
  {
    key: 'version',
    label: 'Version',
    align: 'center',
    headerClassName: 'guideline-list-header-cell',
    cellClassName: 'guideline-list-version-cell',
    render: (row) => (
      <span className="guideline-version-pill" data-version={row.version}>
        {row.version}
      </span>
    ),
  },
  {
    key: 'link',
    label: 'Guideline Link',
    align: 'center',
    headerClassName: 'guideline-list-header-cell',
    cellClassName: 'guideline-list-link-cell',
    render: (row) => (
      <a
        href={row.link}
        target="_blank"
        rel="noopener noreferrer"
        className="guideline-list-link"
      >
        Link <ExternalLink className="guideline-list-external-icon" strokeWidth={1} />
      </a>
    ),
  },
  {
    key: 'actions',
    label: 'Actions',
    align: 'right',
    headerClassName: 'guideline-list-header-cell',
    cellClassName: 'guideline-list-actions-cell',
    render: (row) => (
      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          onEdit?.(row);
        }}
        title="Edit Guideline"
        className="guideline-list-edit-button"
      >
        <Pencil className="guideline-list-edit-icon" strokeWidth={1.33} />
      </button>
    ),
  },
];
