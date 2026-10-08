// src/features/server-information/components/ServerTable.jsx
import { Pencil } from 'lucide-react';

import { IconButton } from '@/components/ui/IconButton';
import { Skeleton } from '@/components/ui/Skeleton';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeaderCell,
  TableRow,
} from '@/components/ui/Table';

import { EnvironmentBadge } from './EnvironmentBadge';
import { ServerStatusBadge } from './ServerStatusBadge';

const COLS = [
  'Server Name',
  'IP Address',
  'RAM',
  'CPU',
  'Storage',
  'OS',
  'Environment',
  'GPU',
  'Status',
  'Assigned Projects',
  'Actions',
];

function AssignedProjectsTags({ projects }) {
  if (!projects || projects.length === 0) {
    return <span className="text-ink-muted text-[11px]">—</span>;
  }
  return (
    <div className="flex flex-wrap gap-1">
      {projects.map((p) => (
        <span
          key={p}
          className="inline-flex items-center rounded-control border-0 bg-[#D8E2FF] px-1.5 py-0.5 text-[11px] font-medium text-[#051A3E]"
        >
          {p}
        </span>
      ))}
    </div>
  );
}

export function ServerTable({ servers, loading, pageSize, onEdit }) {
  return (
    <Table
      wrapperClassName="max-h-[557px] overflow-auto [&_td]:border-line-field [&_td]:px-3 [&_td]:py-[9px] [&_td]:text-[13px] [&_td]:leading-[18px]"
      className="min-w-[1058px] bg-surface-card text-[13px] leading-[18px]"
    >
      <TableHead>
        <TableRow className="h-[50px] hover:bg-transparent">
          {COLS.map((col, i) => (
            <TableHeaderCell
              key={col}
              className={[
                'h-[50px] border-line-field py-2 text-xs font-semibold leading-4 tracking-[0.55px] text-[#6B778C]',
                i === COLS.length - 2 ? 'whitespace-normal text-center' : '',
                i === COLS.length - 1 ? 'text-right' : '',
              ].join(' ')}
            >
              {col}
            </TableHeaderCell>
          ))}
        </TableRow>
      </TableHead>
      <TableBody>
        {/* Loading skeletons */}
        {loading &&
          Array.from({ length: pageSize }).map((_, i) => (
            <TableRow key={i} className="hover:bg-transparent">
              <TableCell><Skeleton className="h-3 w-36" /></TableCell>
              <TableCell><Skeleton className="h-3 w-24" /></TableCell>
              <TableCell><Skeleton className="h-3 w-12" /></TableCell>
              <TableCell><Skeleton className="h-3 w-16" /></TableCell>
              <TableCell><Skeleton className="h-3 w-20" /></TableCell>
              <TableCell><Skeleton className="h-3 w-28" /></TableCell>
              <TableCell><Skeleton className="h-5 w-20" /></TableCell>
              <TableCell><Skeleton className="h-3 w-16" /></TableCell>
              <TableCell><Skeleton className="h-5 w-16" /></TableCell>
              <TableCell><Skeleton className="h-5 w-20" /></TableCell>
              <TableCell />
            </TableRow>
          ))}

        {/* Empty state */}
        {!loading && servers.length === 0 && (
          <TableRow className="hover:bg-transparent">
            <TableCell colSpan={11} className="py-10 text-center text-ink-muted">
              No servers match your search.
            </TableCell>
          </TableRow>
        )}

        {/* Data rows */}
        {!loading &&
          servers.map((s) => (
            <TableRow key={s.id} className="h-[75px]">
              <TableCell>
                  <span className="font-normal text-[#172B4D]">{s.serverName}</span>
              </TableCell>
              <TableCell>
                <span className="inline-flex h-[21px] w-[92px] items-center whitespace-nowrap rounded bg-[#EDEDF8] px-1 py-[1.5px] text-[13px] leading-[18px] text-[#434654]">
                  {s.ipAddress}
                </span>
              </TableCell>
              <TableCell>
                <span className="text-[#191B23]">{s.ram}</span>
              </TableCell>
              <TableCell>
                <span className="text-[#191B23]">{s.cpu}</span>
              </TableCell>
              <TableCell>
                <span className="text-[#191B23]">{s.storage}</span>
              </TableCell>
              <TableCell>
                <span className="text-[#172B4D]">{s.os}</span>
              </TableCell>
              <TableCell>
                <EnvironmentBadge environment={s.environment} />
              </TableCell>
              <TableCell>
                {s.gpu === 'None' ? (
                  <span className="text-[13px] text-ink-muted">None</span>
                ) : (
                  <span className="text-[13px] text-action-primary">{s.gpu}</span>
                )}
              </TableCell>
              <TableCell>
                <ServerStatusBadge status={s.status} />
              </TableCell>
              <TableCell>
                <AssignedProjectsTags projects={s.assignedProjects} />
              </TableCell>
              <TableCell className="text-right">
                <IconButton
                  label={`Edit ${s.serverName}`}
                  onClick={() => onEdit?.(s)}
                >
                  <Pencil className="h-4 w-4" />
                </IconButton>
              </TableCell>
            </TableRow>
          ))}
      </TableBody>
    </Table>
  );
}
