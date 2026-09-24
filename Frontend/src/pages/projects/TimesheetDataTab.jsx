// src/pages/projects/TimesheetDataTab.jsx
import React, { useEffect, useState } from 'react';
import { CalendarDays, ChevronDown } from 'lucide-react';
import { getTimesheetsByCategory } from '../../api/timesheet.api';

const formatDate = (value) => {
  if (!value) return '-';
  const dateValue = String(value).split('T')[0];
  const date = new Date(`${dateValue}T00:00:00`);
  return Number.isNaN(date.getTime()) ? '-' : date.toLocaleDateString();
};

const toNumber = (value) => {
  const number = Number(value);
  return Number.isFinite(number) ? number : 0;
};

const formatHours = (value) => {
  if (value == null || value === '') return '-';
  const hours = toNumber(value);
  return `${hours.toFixed(2).replace(/\.00$/, '')} hrs`;
};

const formatTaskDescription = (item) => {
  const description = item.task_description ?? item.taskDescription ?? item.description;
  if (description != null && description !== '') return String(description);
  if (Array.isArray(item.entries)) {
    const descriptions = item.entries
      .map((entry) => entry?.task_description ?? entry?.taskDescription ?? entry?.description)
      .filter(Boolean);
    return descriptions.length ? descriptions.join(', ') : '-';
  }
  return '-';
};

const mapTimesheetRow = (item) => ({
  empId: item.employee_id ?? '-',
  empName: item.employee_name ?? '-',
  designation: item.designation ?? '-',
  projectCode: item.project_code ?? '-',
  projectName: item.project_name ?? '-',
  catCode: item.projectcategory_code ?? '-',
  category: item.projectcategory_name ?? '-',
  hoursSpent: item.total_hours == null ? null : toNumber(item.total_hours),
  fromDate: formatDate(item.from_date),
  toDate: formatDate(item.to_date),
  approvalStatus: item.overall_status ?? '-',
  approvedBy: item.last_approved_by ?? '-',
  submittedOn: formatDate(item.submitted_on ?? item.submittedOn ?? item.last_submitted_on),
  approvedOn: formatDate(item.last_approved_on),
  taskDescription: formatTaskDescription(item),
  approvedHours: toNumber(item.approved_hours ?? item.approved),
  pendingHours: toNumber(item.pending_hours ?? item.pending),
});

const COLUMNS = [
  'Emp Id',
  'Emp Name',
  'Designation',
  'Project Code',
  'Project Name',
  'Cat. Code',
  'Category',
  'Hours Spent',
  'From Date',
  'To Date',
  'Approval Status',
  'Approved By',
  'Submitted On',
  'Approved On',
  'Task Description',
];

const TimesheetDataTab = ({ project }) => {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [retryKey, setRetryKey] = useState(0);
  const projectCategoryCode = project?.projectcategory_code || project?.projectCategoryCode || project?.categoryCode || 'NBD3011';

  useEffect(() => {
    let isMounted = true;

    const fetchTimesheets = async () => {
      try {
        setLoading(true);
        setError('');
        const response = await getTimesheetsByCategory(projectCategoryCode);
        const records = Array.isArray(response) ? response : response?.data || response?.results || [];
        if (isMounted) setRows(records.map(mapTimesheetRow));
      } catch (requestError) {
        console.error('Failed to load timesheet data:', requestError);
        if (isMounted) {
          setRows([]);
          setError('Unable to load timesheet data. Please try again.');
        }
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    fetchTimesheets();
    return () => { isMounted = false; };
  }, [projectCategoryCode, retryKey]);

  const totalHours = rows.reduce((sum, row) => sum + (row.hoursSpent || 0), 0);
  const approvedHours = rows.reduce((sum, row) => sum + row.approvedHours, 0);
  const pendingHours = rows.reduce((sum, row) => sum + row.pendingHours, 0);

  return (
    <div className="w-full bg-[#f7f4ff] p-0 font-sans text-[#1f2937]">
      <div
        className="overflow-hidden bg-[#f8f7fb] shadow-[0_1px_2px_rgba(15,23,42,0.04)]"
        style={{
          border: '1px solid #E2E8F0',
          borderRadius: 10,
        }}
      >
        <div className="flex w-full max-w-[1053px] items-end justify-between bg-white px-4 py-2" style={{ height: 66 }}>
          <div className="flex h-[50px] w-[495px] items-end gap-[24px]">
            <div className="flex h-[50px] w-[146px] flex-col items-start gap-[2px]">
              <label className="flex h-[14px] w-[146px] items-center text-[12px] font-semibold leading-[14px] text-[#545f72]" style={{ fontFamily: 'Roboto, sans-serif' }}>
                Select Employee
              </label>
              <button
                type="button"
                aria-label="Select Employee"
                aria-haspopup="listbox"
                className="box-border flex items-center justify-center rounded-[4px] border border-[#E2E8F0] bg-white"
                style={{
                  boxSizing: 'border-box',
                  width: 146,
                  height: 34,
                  padding: 8,
                  gap: 50,
                }}
              >
                <div className="flex items-center justify-between" style={{ width: 121, height: 16, gap: 16 }}>
                  <span className="flex items-center text-[12px] font-normal leading-[14px] text-[#94A3B8]" style={{ width: 89, height: 14, fontFamily: 'Roboto, sans-serif' }}>
                    Select Employee
                  </span>
                  <ChevronDown size={16} strokeWidth={1.5} className="text-[#c3c6d6]" />
                </div>
              </button>
            </div>

            <div className="flex h-[50px] w-[199px] flex-col items-start gap-[2px]">
              <label className="flex h-[14px] w-[199px] items-center text-[12px] font-semibold leading-[14px] text-[#545f72]" style={{ fontFamily: 'Roboto, sans-serif' }}>
                Date Range
              </label>
              <button
                type="button"
                aria-label="Select Date Range"
                aria-haspopup="dialog"
                className="box-border flex items-center rounded-[4px] border border-[#E2E8F0] bg-white"
                style={{
                  boxSizing: 'border-box',
                  width: 199,
                  height: 34,
                  padding: 8,
                  gap: 50,
                }}
              >
                <div className="flex items-center" style={{ width: 189, height: 16, gap: 16 }}>
                  <span className="flex items-center text-[12px] font-normal leading-[14px] text-[#94A3B8]" style={{ width: 61, height: 14, fontFamily: 'Roboto, sans-serif' }}>
                    Select Date
                  </span>
                  <span className="text-[12px] font-normal leading-[14px] text-[#c3c6d6]">→</span>
                  <span className="flex items-center text-[12px] font-normal leading-[14px] text-[#94A3B8]" style={{ width: 48, height: 14, fontFamily: 'Roboto, sans-serif' }}>
                    End Date
                  </span>
                  <CalendarDays size={16} strokeWidth={1.5} className="ml-auto shrink-0 text-[#c3c6d6]" />
                </div>
              </button>
            </div>

            <button
              type="button"
              className="flex h-[34px] w-[80px] items-center justify-center rounded-[4px] bg-[#856BFF] text-[14px] font-semibold leading-[16px] tracking-[0.6px] text-white shadow-[0_2px_8px_rgba(133,107,255,0.22)] transition-colors hover:bg-[#7458F5]"
              style={{ fontFamily: 'Roboto, sans-serif' }}
            >
              Apply
            </button>
          </div>

          <div className="flex h-[30px] w-[443px] items-center gap-[10px] whitespace-nowrap" style={{ paddingRight: 238.07 }}>
            <div className="box-border flex h-[30px] w-[152px] items-center justify-center gap-[6px] rounded-[8px] border border-[#E2E8F0] bg-[#F8FAFC] px-[12px]">
              <span className="h-[8px] w-[8px] rounded-full bg-[#64748B]" />
              <span className="flex h-[16px] items-center text-[12px] leading-[16px] text-[#64748B]" style={{ fontFamily: 'Roboto, sans-serif' }}>Total Hours:</span>
              <span className="flex h-[16px] items-center text-[12px] leading-[16px] text-[#0F172A]" style={{ fontFamily: 'Roboto, sans-serif' }}>{formatHours(totalHours)}</span>
            </div>

            <div className="box-border flex h-[30px] w-[141px] items-center justify-center gap-[6px] rounded-[8px] border border-[#A7F3D0] bg-[#ECFDF5] px-[12px]">
              <span className="h-[8px] w-[8px] rounded-full bg-[#10B981]" />
              <span className="flex h-[16px] items-center text-[12px] leading-[16px] text-[#047857]" style={{ fontFamily: 'Roboto, sans-serif' }}>Approved:</span>
              <span className="flex h-[16px] items-center text-[12px] leading-[16px] text-[#065F46]" style={{ fontFamily: 'Roboto, sans-serif' }}>{formatHours(approvedHours)}</span>
            </div>

            <div className="box-border flex h-[30px] w-[127px] items-center justify-center gap-[6px] rounded-[8px] border border-[#FDE68A] bg-[#FFFBEB] px-[12px]">
              <span className="h-[8px] w-[8px] rounded-full bg-[#F59E0B]" />
              <span className="flex h-[16px] items-center text-[12px] leading-[16px] text-[#B45309]" style={{ fontFamily: 'Roboto, sans-serif' }}>Pending:</span>
              <span className="flex h-[16px] items-center text-[12px] leading-[16px] text-[#92400E]" style={{ fontFamily: 'Roboto, sans-serif' }}>{formatHours(pendingHours)}</span>
            </div>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-[1400px] w-full border-separate border-spacing-0 text-left">
            <thead>
              <tr className="bg-[#EFF4FF] text-[12px] font-medium tracking-[0.5px] text-[#475569]">
                {COLUMNS.map((column) => (
                  <th
                    key={column}
                    className="border-b border-[#dfe3ea] px-4 py-3 whitespace-nowrap text-left"
                    style={{ minWidth: column.includes('Task Description') ? 220 : undefined }}
                  >
                    {column}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="text-[13px] text-[#2c3240]">
              {loading && (
                <tr>
                  <td colSpan={COLUMNS.length} className="px-4 py-10 text-center text-[#64748b]">Loading timesheet data...</td>
                </tr>
              )}
              {!loading && error && (
                <tr>
                  <td colSpan={COLUMNS.length} className="px-4 py-10 text-center text-red-600">
                    <div>{error}</div>
                    <button type="button" onClick={() => setRetryKey((value) => value + 1)} className="mt-2 font-semibold underline">Retry</button>
                  </td>
                </tr>
              )}
              {!loading && !error && rows.length === 0 && (
                <tr>
                  <td colSpan={COLUMNS.length} className="px-4 py-10 text-center text-[#64748b]">No timesheet records found.</td>
                </tr>
              )}
              {!loading && !error && rows.map((row, index) => (
                <tr
                  key={`${row.empId}-${index}`}
                  className={index % 2 === 0 ? 'bg-white' : 'bg-[#f8f9fc]'}
                >
                  <td className="border-b border-[#e8edf5] px-4 py-4 font-bold text-[#1f2937]">{row.empId}</td>
                  <td className="border-b border-[#e8edf5] px-4 py-4 font-medium text-[#1f2937]">{row.empName}</td>
                  <td className="border-b border-[#e8edf5] px-4 py-4 text-[#475467]">{row.designation}</td>
                  <td className="border-b border-[#e8edf5] px-4 py-4 font-semibold text-[#1f2937]">{row.projectCode}</td>
                  <td className="border-b border-[#e8edf5] px-4 py-4 font-bold text-[#1f2937]">{row.projectName}</td>
                  <td className="border-b border-[#e8edf5] px-4 py-4 text-[#475467]">{row.catCode}</td>
                  <td className="border-b border-[#e8edf5] px-4 py-4 text-[#475467]">{row.category}</td>
                  <td className="border-b border-[#e8edf5] px-4 py-4 text-[#374151]">{formatHours(row.hoursSpent)}</td>
                  <td className="border-b border-[#e8edf5] px-4 py-4 text-[#374151]">{row.fromDate}</td>
                  <td className="border-b border-[#e8edf5] px-4 py-4 text-[#374151]">{row.toDate}</td>
                  <td className="border-b border-[#e8edf5] px-4 py-4 text-[#374151]">{row.approvalStatus}</td>
                  <td className="border-b border-[#e8edf5] px-4 py-4 text-[#374151]">{row.approvedBy}</td>
                  <td className="border-b border-[#e8edf5] px-4 py-4 text-[#374151]">{row.submittedOn}</td>
                  <td className="border-b border-[#e8edf5] px-4 py-4 text-[#374151]">{row.approvedOn}</td>
                  <td className="border-b border-[#e8edf5] px-4 py-4 text-[#374151]">{row.taskDescription}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="flex items-center justify-between border-t border-[#e5e7eb] bg-white px-4 py-3 text-[12px] text-[#64748b]">
          <div className="font-medium text-[#64748b]">Showing {rows.length ? `1-${rows.length}` : '0'} of {rows.length} records</div>
          <div className="flex items-center gap-2">
            <button className="flex h-7 w-7 items-center justify-center rounded border border-[#d9dee8] bg-white text-[#64748b] hover:bg-[#f8fafc]">&lt;</button>
            <button className="flex h-7 w-7 items-center justify-center rounded bg-[#856BFF] text-[12px] font-semibold text-white">1</button>
            <button className="flex h-7 w-7 items-center justify-center rounded text-[#475467] hover:bg-[#f3f4f6]">2</button>
            <button className="flex h-7 w-7 items-center justify-center rounded text-[#475467] hover:bg-[#f3f4f6]">3</button>
            <span className="px-1 text-[#9ca3af]">...</span>
            <button className="flex h-7 w-7 items-center justify-center rounded border border-[#d9dee8] bg-white text-[#64748b] hover:bg-[#f8fafc]">&gt;</button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TimesheetDataTab;
