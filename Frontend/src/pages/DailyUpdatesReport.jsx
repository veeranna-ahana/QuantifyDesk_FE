import { useEffect, useMemo, useState } from 'react';
import { useSelector } from 'react-redux';

const API_BASE = import.meta.env.VITE_API_BASE_URL;
const PAGE_SIZE = 10;

// ── Status badge colours (matching Figma) ─────────────────────────────────────
const STATUS_CONFIG = {
  'in-progress':  { bg: 'bg-violet-100', text: 'text-violet-700',  label: 'IN-PROGRESS'  },
  'in_progress':  { bg: 'bg-violet-100', text: 'text-violet-700',  label: 'IN-PROGRESS'  },
  completed:      { bg: 'bg-green-100',  text: 'text-green-700',   label: 'COMPLETED'    },
  blocked:        { bg: 'bg-red-100',    text: 'text-red-600',     label: 'BLOCKED'      },
  practicing:     { bg: 'bg-pink-100',   text: 'text-pink-700',    label: 'PRACTICING'   },
  'not started':  { bg: 'bg-gray-100',   text: 'text-gray-500',    label: 'NOT STARTED'  },
};

function StatusBadge({ value }) {
  if (!value) return <span className="text-gray-400">—</span>;
  const key = value.toLowerCase().replace(/\s+/g, '-');
  const cfg = STATUS_CONFIG[key] || STATUS_CONFIG[value.toLowerCase()] || { bg: 'bg-gray-100', text: 'text-gray-500', label: value };
  return (
    <span className={`inline-block px-2.5 py-0.5 rounded text-[11px] font-bold tracking-wide ${cfg.bg} ${cfg.text}`}>
      {cfg.label || value.toUpperCase()}
    </span>
  );
}

// ── Calendar icon SVG ─────────────────────────────────────────────────────────
const CalIcon = () => (
  <svg className="w-4 h-4 text-gray-400 flex-shrink-0" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
    <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
    <line x1="16" y1="2" x2="16" y2="6" />
    <line x1="8" y1="2" x2="8" y2="6" />
    <line x1="3" y1="10" x2="21" y2="10" />
  </svg>
);

// ── Clipboard icon for empty state ────────────────────────────────────────────
const ClipboardIcon = () => (
  <svg className="w-14 h-14 text-gray-300 mx-auto mb-3" fill="none" stroke="currentColor" strokeWidth={1.4} viewBox="0 0 24 24">
    <path d="M9 5H7a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2h-2" />
    <rect x="9" y="3" width="6" height="4" rx="1" ry="1" />
    <line x1="9" y1="12" x2="15" y2="12" />
    <line x1="9" y1="16" x2="13" y2="16" />
  </svg>
);

// ── ChevronLeft / Right ───────────────────────────────────────────────────────
const ChevLeft  = () => <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path d="M15 18l-6-6 6-6"/></svg>;
const ChevRight = () => <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path d="M9 18l6-6-6-6"/></svg>;

// ── Thin chevron-down for selects ─────────────────────────────────────────────
const SelectWrapper = ({ label, children }) => (
  <div className="flex flex-col gap-1">
    <span className="text-[10px] font-semibold uppercase tracking-widest text-gray-400">{label}</span>
    <div className="relative">
      {children}
    </div>
  </div>
);

// ─────────────────────────────────────────────────────────────────────────────
export default function DailyUpdatesReport() {
  const serviceDeliveryEmployees = useSelector(state => state.auth.serviceDeliveryEmployees);

  const [meta, setMeta]                   = useState({ dates: [], projects: [] });
  const [selectedDate, setSelectedDate]   = useState('');
  const [selectedProject, setSelectedProject] = useState('');
  const [selectedEmployee, setSelectedEmployee] = useState('');
  const [pendingDate, setPendingDate]     = useState('');
  const [pendingProject, setPendingProject] = useState('');
  const [pendingEmployee, setPendingEmployee] = useState('');

  const [rows, setRows]               = useState([]);
  const [loadingMeta, setLoadingMeta] = useState(true);
  const [loadingRows, setLoadingRows] = useState(false);
  const [error, setError]             = useState('');
  const [page, setPage]               = useState(1);

  // ── Load filter meta (dates + projects) ────────────────────────────────────
  useEffect(() => {
    async function loadMeta() {
      try {
        const token = localStorage.getItem('token');
        const res = await fetch(`${API_BASE}/api/daily-updates/meta`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!res.ok) throw new Error('Failed to load filters');
        const data = await res.json();
        if (!data.success) throw new Error(data.error || 'Failed to load filters');

        setMeta({ dates: data.dates || [], projects: data.projects || [] });

        const today = new Date().toISOString().split('T')[0];
        const defaultDate =
          data.dates?.includes(today) ? today : data.dates?.[0] || '';
        setSelectedDate(defaultDate);
        setPendingDate(defaultDate);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoadingMeta(false);
      }
    }
    loadMeta();
  }, []);

  // ── Load rows whenever applied filters change ───────────────────────────────
  useEffect(() => {
    if (!selectedDate) return;
    async function loadRows() {
      setLoadingRows(true);
      setError('');
      setPage(1);
      try {
        const token = localStorage.getItem('token');
        const params = new URLSearchParams({ date: selectedDate });
        if (selectedProject)  params.set('project_id', selectedProject);
        if (selectedEmployee) params.set('user_id', selectedEmployee);

        const res = await fetch(
          `${API_BASE}/api/daily-updates/report?${params}`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        if (!res.ok) throw new Error('Failed to load daily updates');
        const data = await res.json();
        if (!data.success) throw new Error(data.error || 'Failed to load daily updates');
        setRows(data.data || []);
      } catch (err) {
        setError(err.message);
        setRows([]);
      } finally {
        setLoadingRows(false);
      }
    }
    loadRows();
  }, [selectedDate, selectedProject, selectedEmployee]);

  // ── Employee dropdown options ───────────────────────────────────────────────
  const employeeOptions = useMemo(() => {
    if (!serviceDeliveryEmployees?.length) return [];
    return serviceDeliveryEmployees.map(emp => ({
      id: emp.employee_id || emp.u_id || emp.id,
      name: emp.emp_name || emp.name,
    }));
  }, [serviceDeliveryEmployees]);

  // ── Apply filter ───────────────────────────────────────────────────────────
  const handleFilter = () => {
    setSelectedDate(pendingDate);
    setSelectedProject(pendingProject);
    setSelectedEmployee(pendingEmployee);
  };

  // ── Pagination ─────────────────────────────────────────────────────────────
  const totalPages  = Math.max(1, Math.ceil(rows.length / PAGE_SIZE));
  const pageRows    = rows.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);
  const startEntry  = rows.length === 0 ? 0 : (page - 1) * PAGE_SIZE + 1;
  const endEntry    = Math.min(page * PAGE_SIZE, rows.length);

  // Visible page numbers (up to 3)
  const pageNumbers = Array.from({ length: Math.min(totalPages, 3) }, (_, i) => i + 1);

  // ── Format date for display (MM/DD/YYYY) ───────────────────────────────────
  const formatDisplay = (d) => {
    if (!d) return '';
    const [y, m, day] = d.split('-');
    return `${m}/${day}/${y}`;
  };

  const selectCls =
    'appearance-none w-full bg-white border border-gray-200 rounded-lg pl-3 pr-8 py-2.5 text-sm text-gray-700 shadow-sm focus:outline-none focus:ring-2 focus:ring-violet-400 cursor-pointer';

  // Table column headers
  const COLS = [
    'EMPLOYEE NAME', 'PROJECT', 'TASK NAME', 'WORKING STATUS',
    'DONE YESTERDAY', "TODAY'S PLAN", 'RISKS', 'DEPENDENCIES',
    'TOTAL TIME NEEDED', 'AVAILABILITY', 'UTILIZATION (%)',
  ];

  return (
    <div className="min-h-screen bg-[#f0f0f8] p-6 font-sans">

      {/* ── Page header ── */}
      <div className="mb-5">
        <h1 className="text-2xl font-bold text-gray-900 leading-tight">Daily Status Report</h1>
        <p className="text-sm text-gray-400 mt-0.5">Monitor daily activity and resource updates</p>
      </div>

      {/* ── Filter bar ── */}
      <div className="flex flex-wrap items-end gap-4 mb-5">

        {/* Date */}
        <SelectWrapper label="Date">
          <div className="flex items-center gap-2 bg-white border border-gray-200 rounded-lg px-3 py-2.5 shadow-sm min-w-[140px]">
            <span className="text-sm text-gray-700 flex-1">
              {pendingDate ? formatDisplay(pendingDate) : 'Select date'}
            </span>
            <CalIcon />
            {/* hidden native date input overlaid for UX */}
            <input
              type="date"
              value={pendingDate}
              onChange={e => setPendingDate(e.target.value)}
              className="absolute inset-0 opacity-0 w-full h-full cursor-pointer"
            />
          </div>
        </SelectWrapper>

        {/* Project */}
        <SelectWrapper label="Project">
          <select
            value={pendingProject}
            onChange={e => setPendingProject(e.target.value)}
            className={selectCls}
          >
            <option value="">All projects</option>
            {meta.projects.map(p => (
              <option key={p.id} value={p.id}>{p.project_name}</option>
            ))}
          </select>
          <span className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path d="M6 9l6 6 6-6"/></svg>
          </span>
        </SelectWrapper>

        {/* Employee */}
        <SelectWrapper label="Employee">
          <select
            value={pendingEmployee}
            onChange={e => setPendingEmployee(e.target.value)}
            disabled={employeeOptions.length === 0}
            className={selectCls}
          >
            <option value="">All employees</option>
            {employeeOptions.map(emp => (
              <option key={emp.id} value={emp.id}>{emp.name}</option>
            ))}
          </select>
          <span className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path d="M6 9l6 6 6-6"/></svg>
          </span>
        </SelectWrapper>

        {/* Filter button */}
        <button
          onClick={handleFilter}
          disabled={loadingMeta}
          className="self-end px-6 py-2.5 bg-violet-600 hover:bg-violet-700 active:bg-violet-800 text-white text-sm font-semibold rounded-lg shadow-sm transition-colors disabled:opacity-50"
        >
          Filter Results
        </button>
      </div>

      {/* ── Table card ── */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm border-collapse min-w-[960px]">

            {/* Head */}
            <thead>
              <tr className="border-b border-gray-100">
                {COLS.map(col => (
                  <th
                    key={col}
                    className="text-left px-4 py-3 text-[11px] font-semibold text-gray-400 tracking-wide uppercase whitespace-nowrap"
                  >
                    {col}
                  </th>
                ))}
              </tr>
            </thead>

            {/* Body */}
            <tbody>
              {/* Loading */}
              {loadingRows && (
                <tr>
                  <td colSpan={COLS.length} className="py-16 text-center">
                    <div className="flex items-center justify-center gap-2 text-gray-400">
                      <svg className="animate-spin w-5 h-5 text-violet-500" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/>
                      </svg>
                      <span>Loading updates…</span>
                    </div>
                  </td>
                </tr>
              )}

              {/* Error */}
              {!loadingRows && error && (
                <tr>
                  <td colSpan={COLS.length} className="py-12 text-center text-red-500 text-sm">
                    {error}
                  </td>
                </tr>
              )}

              {/* Empty */}
              {!loadingRows && !error && rows.length === 0 && (
                <tr>
                  <td colSpan={COLS.length} className="py-16 text-center">
                    <ClipboardIcon />
                    <p className="text-gray-400 text-sm">No updates logged for this date. Try a different date or filter.</p>
                  </td>
                </tr>
              )}

              {/* Data rows */}
              {!loadingRows && !error && pageRows.map((row, idx) => {
                const totalTimeNeeded = Number(row.total_time_needed) || 0;
                const hasStoredAvailability =
                  row.availability !== null &&
                  row.availability !== undefined &&
                  row.availability !== '';
                const availabilityText = hasStoredAvailability
                  ? (String(row.availability).toLowerCase().includes('hr')
                      ? row.availability
                      : `${row.availability}`)
                  : `${8 - totalTimeNeeded} hrs`;
                const utilization = ((totalTimeNeeded / 8) * 100).toFixed(0);

                return (
                  <tr
                    key={row.id || idx}
                    className="border-b border-gray-50 hover:bg-gray-50/60 transition-colors"
                  >
                    {/* Employee Name */}
                    <td className="px-4 py-4 font-medium text-gray-800 whitespace-nowrap">
                      {row.employee_name || '—'}
                    </td>

                    {/* Project */}
                    <td className="px-4 py-4 text-gray-600 max-w-[110px]">
                      <span className="block leading-snug">{row.project_name || '—'}</span>
                    </td>

                    {/* Task Name */}
                    <td className="px-4 py-4 text-gray-600 max-w-[130px]">
                      <span className="block leading-snug">{row.task_name || '—'}</span>
                    </td>

                    {/* Working Status */}
                    <td className="px-4 py-4">
                      <StatusBadge value={row.working_status || row.status} />
                    </td>

                    {/* Done Yesterday */}
                    <td className="px-4 py-4 text-gray-600 max-w-[150px]">
                      <span className="block leading-snug break-words">{row.done_yesterday || '—'}</span>
                    </td>

                    {/* Today's Plan */}
                    <td className="px-4 py-4 text-gray-600 max-w-[150px]">
                      <span className="block leading-snug break-words">{row.todays_tasks || row.tomorrows_plan || '—'}</span>
                    </td>

                    {/* Risks */}
                    <td className="px-4 py-4 text-gray-600 max-w-[110px]">
                      <span className="block leading-snug break-words">{row.risks || 'None'}</span>
                    </td>

                    {/* Dependencies */}
                    <td className="px-4 py-4 text-gray-600 max-w-[120px]">
                      <span className="block leading-snug break-words">{row.dependencies || '—'}</span>
                    </td>

                    {/* Total Time Needed */}
                    <td className="px-4 py-4 text-gray-700 font-medium whitespace-nowrap">
                      {totalTimeNeeded}h
                    </td>

                    {/* Availability */}
                    <td className="px-4 py-4 text-gray-600 whitespace-nowrap">
                      {availabilityText}
                    </td>

                    {/* Utilization */}
                    <td className="px-4 py-4 text-gray-700 font-semibold whitespace-nowrap">
                      {utilization}%
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* ── Pagination footer ── */}
        {!loadingRows && !error && rows.length > 0 && (
          <div className="flex items-center justify-between px-4 py-3 border-t border-gray-100 bg-white">
            <p className="text-xs text-gray-400">
              Showing {startEntry} to {endEntry} of {rows.length} entries
            </p>

            <div className="flex items-center gap-1">
              {/* Prev */}
              <button
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={page === 1}
                className="w-8 h-8 flex items-center justify-center rounded-md text-gray-400 hover:bg-gray-100 disabled:opacity-30 transition-colors"
              >
                <ChevLeft />
              </button>

              {/* Page numbers */}
              {Array.from({ length: totalPages }, (_, i) => i + 1).map(n => (
                <button
                  key={n}
                  onClick={() => setPage(n)}
                  className={`w-8 h-8 flex items-center justify-center rounded-md text-sm font-medium transition-colors ${
                    n === page
                      ? 'bg-violet-600 text-white shadow-sm'
                      : 'text-gray-500 hover:bg-gray-100'
                  }`}
                >
                  {n}
                </button>
              ))}

              {/* Next */}
              <button
                onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                className="w-8 h-8 flex items-center justify-center rounded-md text-gray-400 hover:bg-gray-100 disabled:opacity-30 transition-colors"
              >
                <ChevRight />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}