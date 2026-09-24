// src/pages/projects/TimesheetDataTab.jsx
import React, { useEffect, useRef, useState } from 'react';
import { CalendarDays, Check, ChevronDown, ChevronLeft, ChevronRight, Inbox, Search } from 'lucide-react';
import { getTimesheetsByCategory } from '../../api/timesheet.api';

const formatDate = (value) => {
  if (!value) return '-';
  const dateValue = String(value).split('T')[0];
  const date = new Date(`${dateValue}T00:00:00`);
  return Number.isNaN(date.getTime()) ? '-' : date.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
};

const formatFilterDate = (value) => {
  if (!value) return '';
  return formatDate(value);
};

const decodeHtmlEntities = (value) => {
  if (value == null || value === '') return '-';
  const decoder = document.createElement('textarea');
  decoder.innerHTML = String(value);
  return decoder.value;
};

const toDateValue = (value) => {
  if (!value) return '';
  const date = new Date(String(value).split('T')[0]);
  return Number.isNaN(date.getTime()) ? '' : date.toISOString().slice(0, 10);
};

const parseTypedDate = (value) => {
  const normalized = value.trim().replace(/\//g, '-');
  if (/^\d{2}-[A-Za-z]{3}-\d{4}$/.test(normalized)) {
    const parsed = new Date(`${normalized.slice(0, 2)} ${normalized.slice(3, 6)} ${normalized.slice(7)} 00:00:00`);
    return Number.isNaN(parsed.getTime()) ? '' : parsed.toISOString().slice(0, 10);
  }
  if (/^\d{4}-\d{2}-\d{2}$/.test(normalized)) {
    const parsed = new Date(`${normalized}T00:00:00`);
    return Number.isNaN(parsed.getTime()) ? '' : normalized;
  }
  return '';
};

const dateToKey = (date) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

const getCalendarDays = (monthDate) => {
  const firstDay = new Date(monthDate.getFullYear(), monthDate.getMonth(), 1);
  const start = new Date(firstDay);
  start.setDate(1 - firstDay.getDay());
  return Array.from({ length: 42 }, (_, index) => {
    const day = new Date(start);
    day.setDate(start.getDate() + index);
    return day;
  });
};

const PROJECT_START = '2024-08-01';
const PROJECT_END = '2024-10-15';
const PAGE_SIZE = 10;

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
  empId: decodeHtmlEntities(item.employee_id ?? '-'),
  empName: decodeHtmlEntities(item.employee_name ?? '-'),
  designation: decodeHtmlEntities(item.designation ?? '-'),
  projectCode: decodeHtmlEntities(item.project_code ?? '-'),
  projectName: decodeHtmlEntities(item.project_name ?? '-'),
  catCode: decodeHtmlEntities(item.projectcategory_code ?? '-'),
  category: decodeHtmlEntities(item.projectcategory_name ?? '-'),
  hoursSpent: item.total_hours == null ? null : toNumber(item.total_hours),
  fromDate: formatDate(item.from_date),
  toDate: formatDate(item.to_date),
  fromDateValue: toDateValue(item.from_date),
  toDateValue: toDateValue(item.to_date),
  approvalStatus: decodeHtmlEntities(item.overall_status ?? '-'),
  approvedBy: decodeHtmlEntities(item.last_approved_by ?? '-'),
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

const CalendarDay = ({ date, month, start, end, minDate, maxDate, onSelect }) => {
  const key = dateToKey(date);
  const isOutsideMonth = date.getMonth() !== month.getMonth();
  const isDisabled = key < minDate || key > maxDate;
  const isStart = key === start;
  const isEnd = key === end;
  const isBetween = start && end && key > start && key < end;

  return (
    <button
      type="button"
      className={`timesheet-calendar-day ${isOutsideMonth ? 'is-outside' : ''} ${isBetween ? 'is-between' : ''} ${isStart || isEnd ? 'is-selected' : ''}`}
      disabled={isDisabled}
      aria-label={date.toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}
      onClick={() => onSelect(key)}
    >
      {date.getDate()}
    </button>
  );
};

const EmployeeDropdown = ({ options, value, onChange }) => {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState('');
  const [highlighted, setHighlighted] = useState(0);
  const rootRef = useRef(null);
  const filteredOptions = options.filter(([employeeId, employeeName]) => (
    `${employeeName} ${employeeId}`.toLowerCase().includes(search.toLowerCase())
  ));
  const selected = options.find(([employeeId]) => employeeId === value);

  useEffect(() => {
    const closeOnOutsideClick = (event) => {
      if (!rootRef.current?.contains(event.target)) setOpen(false);
    };
    document.addEventListener('mousedown', closeOnOutsideClick);
    return () => document.removeEventListener('mousedown', closeOnOutsideClick);
  }, []);

  const selectOption = (employeeId) => {
    onChange(employeeId);
    setOpen(false);
    setSearch('');
  };

  const handleKeyDown = (event) => {
    if (event.key === 'Escape') {
      setOpen(false);
      return;
    }
    if (!open && (event.key === 'Enter' || event.key === ' ' || event.key === 'ArrowDown')) {
      event.preventDefault();
      setOpen(true);
      return;
    }
    if (event.key === 'ArrowDown') {
      event.preventDefault();
      setHighlighted((current) => Math.min(current + 1, filteredOptions.length - 1));
    }
    if (event.key === 'ArrowUp') {
      event.preventDefault();
      setHighlighted((current) => Math.max(current - 1, 0));
    }
    if (event.key === 'Enter' && filteredOptions[highlighted]) {
      event.preventDefault();
      selectOption(filteredOptions[highlighted][0]);
    }
  };

  return (
    <div ref={rootRef} className="timesheet-popover-root">
      <button
        type="button"
        className={`timesheet-control timesheet-select-trigger ${open ? 'is-open' : ''}`}
        aria-haspopup="listbox"
        aria-expanded={open}
        onClick={() => setOpen((current) => !current)}
        onKeyDown={handleKeyDown}
      >
        <span className={selected ? 'has-value' : ''}>{selected ? `${selected[1]} (${selected[0]})` : 'All Employees'}</span>
        <ChevronDown size={16} strokeWidth={1.5} aria-hidden="true" />
      </button>
      {open && (
        <div className="timesheet-popover timesheet-employee-popover">
          <div className="timesheet-search-wrap">
            <Search size={15} aria-hidden="true" />
            <input
              autoFocus
              type="search"
              value={search}
              placeholder="Search name or ID"
              aria-label="Search employees"
              onChange={(event) => { setSearch(event.target.value); setHighlighted(0); }}
              onKeyDown={handleKeyDown}
            />
          </div>
          <div role="listbox" aria-label="Employees">
            <button type="button" role="option" aria-selected={!value} className={`timesheet-option ${!value ? 'is-selected' : ''}`} onClick={() => selectOption('')}>
              <span>All Employees</span>
              {!value && <Check size={15} aria-hidden="true" />}
            </button>
            {filteredOptions.map(([employeeId, employeeName], index) => (
              <button
                type="button"
                role="option"
                aria-selected={employeeId === value}
                className={`timesheet-option ${employeeId === value ? 'is-selected' : ''} ${index === highlighted ? 'is-highlighted' : ''}`}
                key={employeeId}
                onMouseEnter={() => setHighlighted(index)}
                onClick={() => selectOption(employeeId)}
              >
                <span>{employeeName} <small>({employeeId})</small></span>
                {employeeId === value && <Check size={15} aria-hidden="true" />}
              </button>
            ))}
            {!filteredOptions.length && <div className="timesheet-option-empty">No results found</div>}
          </div>
        </div>
      )}
    </div>
  );
};

const DateRangePicker = ({ fromDate, toDate, projectStart, projectEnd, onApply }) => {
  const [open, setOpen] = useState(false);
  const [draftStart, setDraftStart] = useState(fromDate);
  const [draftEnd, setDraftEnd] = useState(toDate);
  const [month, setMonth] = useState(new Date(2024, 7, 1));
  const [typedStart, setTypedStart] = useState(formatFilterDate(fromDate));
  const [typedEnd, setTypedEnd] = useState(formatFilterDate(toDate));
  const rootRef = useRef(null);

  useEffect(() => {
    const closeOnOutsideClick = (event) => {
      if (!rootRef.current?.contains(event.target)) setOpen(false);
    };
    document.addEventListener('mousedown', closeOnOutsideClick);
    return () => document.removeEventListener('mousedown', closeOnOutsideClick);
  }, []);

  const openPicker = () => {
    setDraftStart(fromDate);
    setDraftEnd(toDate);
    setTypedStart(formatFilterDate(fromDate));
    setTypedEnd(formatFilterDate(toDate));
    const initialDate = fromDate ? new Date(`${fromDate}T00:00:00`) : new Date(`${projectStart}T00:00:00`);
    setMonth(new Date(initialDate.getFullYear(), initialDate.getMonth(), 1));
    setOpen(true);
  };

  const selectDate = (date) => {
    if (!draftStart || (draftStart && draftEnd)) {
      setDraftStart(date);
      setDraftEnd('');
      setTypedStart(formatFilterDate(date));
      setTypedEnd('');
    } else if (date < draftStart) {
      setDraftStart(date);
      setTypedStart(formatFilterDate(date));
    } else {
      setDraftEnd(date);
      setTypedEnd(formatFilterDate(date));
    }
  };

  const applyRange = () => {
    if (draftStart && draftEnd && draftEnd < draftStart) return;
    onApply(draftStart, draftEnd);
    setOpen(false);
  };

  const handleTypedDate = (value, isStart) => {
    const parsed = parseTypedDate(value);
    if (isStart) {
      setTypedStart(value);
      if (parsed) setDraftStart(parsed);
    } else {
      setTypedEnd(value);
      if (parsed) setDraftEnd(parsed);
    }
  };

  return (
    <div ref={rootRef} className="timesheet-popover-root">
      <button type="button" className={`timesheet-control timesheet-date-trigger ${open ? 'is-open' : ''}`} aria-haspopup="dialog" aria-expanded={open} onClick={openPicker}>
        <span className={fromDate || toDate ? 'has-value' : ''}>{fromDate ? formatFilterDate(fromDate) : 'Select Date'}</span>
        <span className="timesheet-range-arrow">-&gt;</span>
        <span className={toDate ? 'has-value' : ''}>{toDate ? formatFilterDate(toDate) : 'End Date'}</span>
        <CalendarDays size={16} strokeWidth={1.5} aria-hidden="true" />
      </button>
      {open && (
        <div className="timesheet-popover timesheet-calendar-popover" role="dialog" aria-label="Select date range">
          <div className="timesheet-calendar-inputs">
            <input value={typedStart} placeholder="01 Aug 2024" aria-label="Start date" onChange={(event) => handleTypedDate(event.target.value, true)} />
            <span>-&gt;</span>
            <input value={typedEnd} placeholder="15 Oct 2024" aria-label="End date" onChange={(event) => handleTypedDate(event.target.value, false)} />
          </div>
          <div className="timesheet-calendar-header">
            <button type="button" aria-label="Previous month" onClick={() => setMonth((current) => new Date(current.getFullYear(), current.getMonth() - 1, 1))}><ChevronLeft size={17} /></button>
            <strong>{month.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}</strong>
            <button type="button" aria-label="Next month" onClick={() => setMonth((current) => new Date(current.getFullYear(), current.getMonth() + 1, 1))}><ChevronRight size={17} /></button>
          </div>
          <div className="timesheet-calendar-weekdays">{['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map((day) => <span key={day}>{day}</span>)}</div>
          <div className="timesheet-calendar-grid">
            {getCalendarDays(month).map((date) => <CalendarDay key={date.toISOString()} date={date} month={month} start={draftStart} end={draftEnd} minDate={projectStart} maxDate={projectEnd} onSelect={selectDate} />)}
          </div>
          <div className="timesheet-calendar-footer">
            <button type="button" className="timesheet-calendar-clear" onClick={() => { setDraftStart(''); setDraftEnd(''); setTypedStart(''); setTypedEnd(''); }}>Clear</button>
            <div><button type="button" onClick={() => { setDraftStart(projectStart); setDraftEnd(projectEnd); setTypedStart(formatFilterDate(projectStart)); setTypedEnd(formatFilterDate(projectEnd)); }}>Project dates</button><button type="button" className="timesheet-calendar-apply" onClick={applyRange}>Apply</button></div>
          </div>
        </div>
      )}
    </div>
  );
};

const TimesheetDataTab = ({ project }) => {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [retryKey, setRetryKey] = useState(0);
  const [totals, setTotals] = useState({ totalHours: 0, approvedHours: 0, pendingHours: 0 });
  const [selectedEmployee, setSelectedEmployee] = useState('');
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [categoryCodeMissing, setCategoryCodeMissing] = useState(false);
  const tableScrollRef = useRef(null);
  const projectCategoryCode = project?.projectcategory_code || project?.projectCategoryCode || project?.categoryCode;
  const projectStart = toDateValue(project?.start_date || project?.startDate) || PROJECT_START;
  const projectEnd = toDateValue(project?.end_date || project?.endDate) || PROJECT_END;

  useEffect(() => {
    let isMounted = true;

    const fetchTimesheets = async () => {
      if (!projectCategoryCode) {
        setRows([]);
        setTotals({ totalHours: 0, approvedHours: 0, pendingHours: 0 });
        setCategoryCodeMissing(true);
        setError('');
        setLoading(false);
        return;
      }
      try {
        setLoading(true);
        setCategoryCodeMissing(false);
        setError('');
        const response = await getTimesheetsByCategory(projectCategoryCode);
        const records = Array.isArray(response) ? response : response?.data || response?.results || [];
        if (isMounted) {
          setRows(records.map(mapTimesheetRow));
          setCategoryCodeMissing(false);
          setTotals({
            totalHours: response?.total_hours ?? 0,
            approvedHours: response?.approved_hours ?? 0,
            pendingHours: response?.pending_hours ?? 0,
          });
        }
      } catch (requestError) {
        console.error('Failed to load timesheet data:', requestError);
        if (isMounted) {
          setRows([]);
          setCategoryCodeMissing(false);
          setTotals({ totalHours: 0, approvedHours: 0, pendingHours: 0 });
          setError(requestError?.response?.data?.message || requestError?.message || 'Unable to load timesheet data. Please try again.');
        }
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    fetchTimesheets();
    return () => { isMounted = false; };
  }, [projectCategoryCode, retryKey]);

  const employeeOptions = [...new Map(
    rows
      .filter((row) => row.empId !== '-' && row.empName !== '-')
      .map((row) => [row.empId, row.empName]),
  ).entries()];
  const filteredRows = rows.filter((row) => {
    const employeeMatches = !selectedEmployee || row.empId === selectedEmployee;
    const startMatches = !fromDate || (row.fromDateValue && row.fromDateValue >= fromDate);
    const endMatches = !toDate || (row.toDateValue && row.toDateValue <= toDate);
    return employeeMatches && startMatches && endMatches;
  });
  const totalPages = Math.max(1, Math.ceil(filteredRows.length / PAGE_SIZE));
  const pagedRows = filteredRows.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);
  const firstRecord = filteredRows.length ? (currentPage - 1) * PAGE_SIZE + 1 : 0;
  const lastRecord = Math.min(currentPage * PAGE_SIZE, filteredRows.length);

  useEffect(() => {
    setCurrentPage(1);
  }, [selectedEmployee, fromDate, toDate]);

  useEffect(() => {
    if (currentPage > totalPages) setCurrentPage(totalPages);
  }, [currentPage, totalPages]);

  useEffect(() => {
    if (!rows.length && tableScrollRef.current) tableScrollRef.current.scrollLeft = 0;
  }, [rows.length, categoryCodeMissing]);

  return (
    <div className="timesheet-page w-full p-0 font-sans text-[#1f2937]">
      <div
        className="timesheet-shell overflow-hidden shadow-[0_1px_2px_rgba(15,23,42,0.04)]"
        style={{
          border: '1px solid #E2E8F0',
          borderRadius: 10,
        }}
      >
        <div className="timesheet-toolbar flex w-full max-w-[1053px] items-end justify-between px-4 py-2" style={{ height: 66 }}>
          <div className="timesheet-filter-row flex h-[50px] w-[495px] items-end gap-[24px]">
            <div className="flex h-[50px] w-[146px] flex-col items-start gap-[2px]">
              <label className="flex h-[14px] w-[146px] items-center text-[12px] font-semibold leading-[14px] text-[#545f72]" style={{ fontFamily: 'Roboto, sans-serif' }}>
                Select Employee
              </label>
              <EmployeeDropdown options={employeeOptions} value={selectedEmployee} onChange={setSelectedEmployee} />
            </div>

            <div className="flex h-[50px] w-[199px] flex-col items-start gap-[2px]">
              <label className="flex h-[14px] w-[199px] items-center text-[12px] font-semibold leading-[14px] text-[#545f72]" style={{ fontFamily: 'Roboto, sans-serif' }}>Date Range</label>
              <DateRangePicker fromDate={fromDate} toDate={toDate} projectStart={projectStart} projectEnd={projectEnd} onApply={(start, end) => { setFromDate(start); setToDate(end); }} />
            </div>

              <button
              type="button"
                className="timesheet-apply-button flex h-[34px] w-[80px] items-center justify-center rounded-[8px] text-[14px] font-semibold leading-[16px] tracking-[0.6px] text-white shadow-[0_2px_8px_rgba(133,107,255,0.22)] transition-colors"
              style={{ fontFamily: 'Roboto, sans-serif' }}
            >
              Apply
            </button>
          </div>

          <div className="timesheet-summary flex h-[30px] w-[443px] items-center gap-[10px] whitespace-nowrap" style={{ paddingRight: 238.07 }}>
            <div className="timesheet-summary-card timesheet-summary-card-total box-border flex h-[30px] w-[152px] items-center justify-center gap-[6px] rounded-[9999px] px-[12px]">
              <span className="h-[8px] w-[8px] rounded-full bg-[#6B7280]" />
              <span className="flex h-[16px] items-center text-[12px] leading-[16px] text-[#64748B]" style={{ fontFamily: 'Roboto, sans-serif' }}>Total Hours:</span>
              <span className="flex h-[16px] items-center text-[12px] font-bold leading-[16px] text-[#0F172A]" style={{ fontFamily: 'Roboto, sans-serif' }}>{formatHours(totals.totalHours)}</span>
            </div>

            <div className="timesheet-summary-card timesheet-summary-card-approved box-border flex h-[30px] w-[141px] items-center justify-center gap-[6px] rounded-[9999px] px-[12px]">
              <span className="h-[8px] w-[8px] rounded-full bg-[#10B981]" />
              <span className="flex h-[16px] items-center text-[12px] leading-[16px] text-[#047857]" style={{ fontFamily: 'Roboto, sans-serif' }}>Approved:</span>
              <span className="flex h-[16px] items-center text-[12px] leading-[16px] text-[#065F46]" style={{ fontFamily: 'Roboto, sans-serif' }}>{formatHours(totals.approvedHours)}</span>
            </div>

            <div className="timesheet-summary-card timesheet-summary-card-pending box-border flex h-[30px] w-[127px] items-center justify-center gap-[6px] rounded-[9999px] px-[12px]">
              <span className="h-[8px] w-[8px] rounded-full bg-[#F59E0B]" />
              <span className="flex h-[16px] items-center text-[12px] leading-[16px] text-[#B45309]" style={{ fontFamily: 'Roboto, sans-serif' }}>Pending:</span>
              <span className="flex h-[16px] items-center text-[12px] leading-[16px] text-[#92400E]" style={{ fontFamily: 'Roboto, sans-serif' }}>{formatHours(totals.pendingHours)}</span>
            </div>
          </div>
        </div>

        <div ref={tableScrollRef} className="timesheet-table-scroll overflow-x-auto">
          <table className="timesheet-table border-separate border-spacing-0 text-left">
            <thead>
              <tr className="bg-[#EFF4FF] text-[12px] font-medium tracking-[0.5px] text-[#475569]">
                {COLUMNS.map((column) => (
                  <th
                    key={column}
                    className="border-b border-[#dfe3ea] px-4 py-3 whitespace-nowrap text-left"
                  >
                    {column}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="text-[13px] text-[#2c3240]">
              {loading && (
                Array.from({ length: 5 }, (_, rowIndex) => (
                  <tr key={`loading-${rowIndex}`}>
                    {COLUMNS.map((column) => <td key={column} className="timesheet-cell"><span className="timesheet-skeleton" /></td>)}
                  </tr>
                ))
              )}
              {!loading && error && (
                <tr>
                  <td colSpan={COLUMNS.length} className="px-4 py-10 text-center text-red-600">
                    <div>{error}</div>
                    <button type="button" onClick={() => setRetryKey((value) => value + 1)} className="mt-2 font-semibold underline">Retry</button>
                  </td>
                </tr>
              )}
              {!loading && !error && pagedRows.map((row, index) => (
                <tr
                  key={`${row.empId}-${(currentPage - 1) * PAGE_SIZE + index}`}
                  className="bg-white"
                >
                  <td title={row.empId} className="timesheet-cell border-b border-[#e8edf5] text-[#1f2937]">{row.empId}</td>
                  <td title={row.empName} className="timesheet-cell border-b border-[#e8edf5] text-[#1f2937]">{row.empName}</td>
                  <td title={row.designation} className="timesheet-cell border-b border-[#e8edf5] text-[#6B7280]">{row.designation}</td>
                  <td title={row.projectCode} className="timesheet-cell border-b border-[#e8edf5] text-[#6B7280]">{row.projectCode}</td>
                  <td title={row.projectName} className="timesheet-cell border-b border-[#e8edf5] text-[#1f2937]">{row.projectName}</td>
                  <td title={row.catCode} className="timesheet-cell timesheet-category-cell border-b border-[#e8edf5]">{row.catCode}</td>
                  <td title={row.category} className="timesheet-cell border-b border-[#e8edf5] text-[#6B7280]">{row.category}</td>
                  <td title={formatHours(row.hoursSpent)} className="timesheet-cell border-b border-[#e8edf5] text-[#374151]">{formatHours(row.hoursSpent)}</td>
                  <td title={row.fromDate} className="timesheet-cell border-b border-[#e8edf5] text-[#374151]">{row.fromDate}</td>
                  <td title={row.toDate} className="timesheet-cell border-b border-[#e8edf5] text-[#374151]">{row.toDate}</td>
                  <td title={row.approvalStatus} className="timesheet-cell border-b border-[#e8edf5] text-[#374151]">{row.approvalStatus}</td>
                  <td title={row.approvedBy} className="timesheet-cell border-b border-[#e8edf5] text-[#374151]">{row.approvedBy}</td>
                  <td title={row.submittedOn} className="timesheet-cell border-b border-[#e8edf5] text-[#374151]">{row.submittedOn}</td>
                  <td title={row.approvedOn} className="timesheet-cell border-b border-[#e8edf5] text-[#374151]">{row.approvedOn}</td>
                  <td title={row.taskDescription} className="timesheet-cell border-b border-[#e8edf5] text-[#374151]">{row.taskDescription}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {!loading && !error && (categoryCodeMissing || !rows.length) && (
          <div className="timesheet-empty-state">
            <Inbox size={46} strokeWidth={1.4} aria-hidden="true" />
            <h3>No data found</h3>
            <p>There are no timesheet records to show.</p>
          </div>
        )}

        <div className="timesheet-footer flex items-center justify-between px-4 py-3 text-[12px] text-[#64748b]">
          <div className="font-medium text-[#64748b]">Showing {firstRecord}-{lastRecord} of {filteredRows.length} records</div>
          <div className="flex items-center gap-2">
            <button type="button" aria-label="Previous page" disabled={currentPage === 1} onClick={() => setCurrentPage((page) => Math.max(1, page - 1))} className="timesheet-page-button flex items-center justify-center rounded border border-[#d9dee8] bg-white text-[#64748b] hover:bg-[#f8fafc] disabled:cursor-not-allowed disabled:opacity-40">&lt;</button>
            {Array.from({ length: Math.min(totalPages, 3) }, (_, index) => index + 1).map((page) => (
              <button type="button" key={page} disabled={!filteredRows.length} onClick={() => setCurrentPage(page)} className={`timesheet-page-button flex items-center justify-center rounded text-[12px] font-semibold ${currentPage === page ? 'bg-[#856BFF] text-white' : 'border border-[#d9dee8] bg-white text-[#475467] hover:bg-[#f3f4f6]'}`}>{page}</button>
            ))}
            {totalPages > 3 && <><span className="px-1 text-[#9ca3af]">...</span><button type="button" onClick={() => setCurrentPage(totalPages)} className={`timesheet-page-button flex items-center justify-center rounded border border-[#d9dee8] bg-white text-[#475467] ${currentPage === totalPages ? 'bg-[#856BFF] text-white' : ''}`}>{totalPages}</button></>}
            <button type="button" aria-label="Next page" disabled={currentPage === totalPages} onClick={() => setCurrentPage((page) => Math.min(totalPages, page + 1))} className="timesheet-page-button flex items-center justify-center rounded border border-[#d9dee8] bg-white text-[#64748b] hover:bg-[#f8fafc] disabled:cursor-not-allowed disabled:opacity-40">&gt;</button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TimesheetDataTab;
