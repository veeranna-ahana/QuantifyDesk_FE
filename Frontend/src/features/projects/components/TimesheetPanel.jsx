import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { Pagination } from '@/components/ui/Pagination';
import { Select } from '@/components/ui/Select';
import { Table, TableBody, TableCell, TableHead, TableHeaderCell, TableRow } from '@/components/ui/Table';
import { statusVariant } from '@/lib/status';

import { useTimesheet } from '../hooks/useTimesheet';

const COLUMNS = ['Emp Id', 'Emp Name', 'Designation', 'Project Code', 'Project Name', 'Cat. Code', 'Category', 'Task Description', 'Hours Spent', 'From Date', 'To Date', 'Approval Status', 'Approved By', 'Submitted On', 'Approved On'];

/** Timesheet Data tab: filters, hour summary pills, wide scrollable table, pagination. */
export function TimesheetPanel() {
  const ts = useTimesheet();
  return (
    <Card className="overflow-hidden">
      <div className="flex flex-wrap items-end justify-between gap-4 p-4">
        <div className="flex flex-wrap items-end gap-3">
          <Select size="md" label="Select Employee" placeholder="Select Employee" value={ts.employee} options={ts.employees} onChange={(e) => ts.setEmployee(e.target.value)} wrapperClassName="w-44" />
          <Input size="md" type="date" label="From" value={ts.from} onChange={(e) => ts.setFrom(e.target.value)} wrapperClassName="w-40" />
          <Input size="md" type="date" label="To" value={ts.to} onChange={(e) => ts.setTo(e.target.value)} wrapperClassName="w-40" />
          <Button onClick={ts.apply}>Apply</Button>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Badge variant="neutral" shape="chip" dot>Total Hours: {ts.summary.total} hrs</Badge>
          <Badge variant="success" shape="chip" dot>Approved: {ts.summary.approved} hrs</Badge>
          <Badge variant="warning" shape="chip" dot>Pending: {ts.summary.pending} hrs</Badge>
        </div>
      </div>

      <Table className="min-w-[1500px]">
        <TableHead>
          <TableRow className="hover:bg-transparent">{COLUMNS.map((c) => <TableHeaderCell key={c}>{c}</TableHeaderCell>)}</TableRow>
        </TableHead>
        <TableBody>
          {ts.rows.length === 0 && <TableRow><TableCell colSpan={COLUMNS.length} className="py-8 text-center text-ink-muted">No timesheet records found.</TableCell></TableRow>}
          {ts.rows.map((r, i) => (
            <TableRow key={`${r.empId}-${i}`}>
              <TableCell className="font-semibold">{r.empId}</TableCell>
              <TableCell className="font-medium">{r.empName}</TableCell>
              <TableCell className="text-ink-secondary">{r.designation}</TableCell>
              <TableCell>{r.projectCode}</TableCell>
              <TableCell className="font-semibold">{r.projectName}</TableCell>
              <TableCell className="text-ink-secondary">{r.catCode}</TableCell>
              <TableCell className="text-ink-secondary">{r.category}</TableCell>
              <TableCell className="min-w-[220px]">{r.taskDescription}</TableCell>
              <TableCell>{r.hoursSpent}</TableCell>
              <TableCell>{r.fromDate}</TableCell>
              <TableCell>{r.toDate}</TableCell>
              <TableCell><Badge variant={statusVariant(r.approvalStatus)} dot size="sm">{r.approvalStatus}</Badge></TableCell>
              <TableCell>{r.approvedBy}</TableCell>
              <TableCell className="text-ink-secondary">{r.submittedOn}</TableCell>
              <TableCell className="text-ink-secondary">{r.approvedOn}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      <Pagination page={ts.page} totalPages={ts.totalPages} totalItems={ts.totalItems} pageSize={ts.pageSize} onPageChange={ts.setPage} itemLabel="records" />
    </Card>
  );
}
