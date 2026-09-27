import { useMemo, useState } from 'react';

import { TIMESHEET_ROWS, TIMESHEET_SUMMARY } from '@/features/projects/mock/mockTimesheet';

export const TIMESHEET_PAGE_SIZE = 10;

const toDate = (s) => new Date(s);

/** Timesheet filters (employee + date range applied with the Apply button) and pagination. */
export function useTimesheet() {
  const [employee, setEmployee] = useState('');
  const [from, setFrom] = useState('');
  const [to, setTo] = useState('');
  const [applied, setApplied] = useState({ employee: '', from: '', to: '' });
  const [page, setPage] = useState(1);

  const employees = useMemo(() => [...new Set(TIMESHEET_ROWS.map((r) => r.empName))], []);

  const rows = useMemo(
    () =>
      TIMESHEET_ROWS.filter((r) => {
        if (applied.employee && r.empName !== applied.employee) return false;
        if (applied.from && toDate(r.fromDate) < new Date(applied.from)) return false;
        if (applied.to && toDate(r.toDate) > new Date(applied.to)) return false;
        return true;
      }),
    [applied],
  );

  const isFiltered = Boolean(applied.employee || applied.from || applied.to);
  const apply = () => { setApplied({ employee, from, to }); setPage(1); };
  const totalItems = isFiltered ? rows.length : TIMESHEET_SUMMARY.totalRecords;

  return {
    employees, employee, setEmployee, from, setFrom, to, setTo, apply,
    // Mock data has a single page of rows; once the API paginates, always slice by page.
    rows: isFiltered ? rows.slice((page - 1) * TIMESHEET_PAGE_SIZE, page * TIMESHEET_PAGE_SIZE) : rows,
    summary: TIMESHEET_SUMMARY,
    page, setPage, pageSize: TIMESHEET_PAGE_SIZE, totalItems, totalPages: Math.max(1, Math.ceil(totalItems / TIMESHEET_PAGE_SIZE)),
  };
}
