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
    width: 'w-[32%]',
    headerClassName: 'px-5 py-3 text-[12px] font-semibold text-[#64748B]',
    cellClassName: 'px-5 py-1.5 text-[12px] font-medium text-[#1E293B]',
    render: (row) => (
      <span className="truncate block font-medium text-[#1E293B]" title={row.name}>
        {row.name}
      </span>
    ),
  },
  {
    key: 'createdDate',
    label: 'Created Date',
    align: 'left',
    width: 'w-[15%]',
    headerClassName: 'px-5 py-3 text-[12px] font-semibold text-[#64748B]',
    cellClassName: 'px-5 py-1.5 text-[12px] font-medium text-[#64748B]',
    render: (row) => (
      <span className="truncate block text-[#64748B] font-medium">
        {formatDate(row.createdDate)}
      </span>
    ),
  },
  {
    key: 'lastUpdated',
    label: 'Last Updated',
    align: 'left',
    width: 'w-[15%]',
    headerClassName: 'px-5 py-3 text-[12px] font-semibold text-[#64748B]',
    cellClassName: 'px-5 py-1.5 text-[12px] font-medium text-[#64748B]',
    render: (row) => (
      <span className="truncate block text-[#64748B] font-medium">
        {formatDate(row.lastUpdated)}
      </span>
    ),
  },
  {
    key: 'version',
    label: 'Version',
    align: 'center',
    width: 'w-[12%]',
    headerClassName: 'px-5 py-3 text-center text-[12px] font-semibold text-[#64748B]',
    cellClassName: 'px-5 py-1.5 text-center',
    render: (row) => (
      <span className="inline-flex items-center justify-center bg-[#E4EAFA] text-[#5578C2] text-[11px] font-medium px-2.5 py-0.5 rounded-full border-0 select-none">
        {row.version}
      </span>
    ),
  },
  {
    key: 'link',
    label: 'Guideline Link',
    align: 'center',
    width: 'w-[14%]',
    headerClassName: 'px-5 py-3 text-center text-[12px] font-semibold text-[#64748B]',
    cellClassName: 'px-5 py-1.5 text-center',
    render: (row) => (
      <a
        href={row.link}
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex items-center justify-center gap-1 text-[12px] font-semibold text-[#7B61FF] hover:underline no-underline"
      >
        Link <ExternalLink className="h-3 w-3 stroke-[2.2]" />
      </a>
    ),
  },
  {
    key: 'actions',
    label: 'Actions',
    align: 'right',
    width: 'w-[12%]',
    headerClassName: 'px-5 py-3 text-right text-[12px] font-semibold text-[#64748B]',
    cellClassName: 'px-5 py-1.5 text-right',
    render: (row) => (
      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          onEdit?.(row);
        }}
        title="Edit Guideline"
        className="inline-flex items-center justify-end p-0 m-0 w-6 h-6 text-action-primary hover:bg-action-primary-soft rounded transition-colors cursor-pointer bg-transparent border-0"
      >
        <Pencil className="h-4 w-4" />
      </button>
    ),
  },
];
