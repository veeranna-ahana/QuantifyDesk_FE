import { useEffect, useMemo, useState } from 'react';
import { useSelector } from 'react-redux';
import Cookies from 'js-cookie';
import { useNavigate } from 'react-router-dom';
import SearchableSelect from '../component/SearchableSelect';

const API_BASE = import.meta.env.VITE_API_BASE_URL;
const PAGE_SIZE = 10;

// ── Status badge colours (matching Figma) ─────────────────────────────────────
const STATUS_CONFIG = {
  'in-progress': { bg: 'bg-violet-100', text: 'text-[#856BFF]', label: 'IN-PROGRESS' },
  'in_progress': { bg: 'bg-violet-100', text: 'text-[#856BFF]', label: 'IN-PROGRESS' },
  completed: { bg: 'bg-green-100', text: 'text-green-700', label: 'COMPLETED' },
  blocked: { bg: 'bg-red-100', text: 'text-red-600', label: 'BLOCKED' },
  practicing: { bg: 'bg-pink-100', text: 'text-pink-700', label: 'PRACTICING' },
  'not started': { bg: 'bg-gray-100', text: 'text-gray-500', label: 'NOT STARTED' },
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
const ChevLeft = () => <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path d="M15 18l-6-6 6-6" /></svg>;
const ChevRight = () => <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path d="M9 18l6-6-6-6" /></svg>;

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
  const navigate = useNavigate();
  const reduxUser = useSelector(state => state.auth?.user);
  const serviceDeliveryEmployees = useSelector(state => state.auth.serviceDeliveryEmployees);

  // ── Get user from Redux or cookie ──────────────────────────────────────────
  const user = useMemo(() => {
    if (reduxUser) return reduxUser;
    try {
      return JSON.parse(Cookies.get("user") || "null");
    } catch {
      return null;
    }
  }, [reduxUser]);

  const userId = user?.emp_id || localStorage.getItem("emp_id");
  const userRole = user?.role || localStorage.getItem("role") || 'Employee';
  const token = localStorage.getItem("token");

  // Check if user is Admin or Manager
  const isAdminOrManager = useMemo(() => {
    const role = userRole?.toUpperCase();
    return role === 'ADMIN' || role === 'MANAGER';
  }, [userRole]);

  const [meta, setMeta] = useState({ dates: [], projects: [] });
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedProject, setSelectedProject] = useState('');
  const [selectedEmployee, setSelectedEmployee] = useState('');
  const [pendingDate, setPendingDate] = useState('');
  const [pendingProject, setPendingProject] = useState('');
  const [pendingEmployee, setPendingEmployee] = useState('');

  const [rows, setRows] = useState([]);
  const [loadingMeta, setLoadingMeta] = useState(true);
  const [loadingRows, setLoadingRows] = useState(false);
  const [error, setError] = useState('');
  const [authError, setAuthError] = useState(false);
  const [page, setPage] = useState(1);

  // ── Check authentication ──
  const isAuthenticated = useMemo(() => {
    return !!token && !!userId;
  }, [token, userId]);

  // ── Redirect if not authenticated ──
  useEffect(() => {
    if (!isAuthenticated) {
      console.error('❌ User not authenticated');
      setAuthError(true);
      setError('Session expired. Please login again.');
    } else {
      setAuthError(false);
    }
  }, [isAuthenticated]);

  // ── Load filter meta (dates + projects) based on role ─────────────────────
  useEffect(() => {
    if (!isAuthenticated) return;

    async function loadMeta() {
      try {
        setLoadingMeta(true);
        setError('');

        // ✅ Different API based on role
        let endpoint;
        if (isAdminOrManager) {
          // Admin/Manager: Get all projects
          endpoint = `${API_BASE}/api/daily-updates/meta`;
          console.log('👑 Admin/Manager - fetching all projects');
        } else {
          // Employee: Get only assigned projects
          endpoint = `${API_BASE}/api/daily-updates/employee-projects`;
          console.log('👤 Employee - fetching assigned projects only');
        }

        console.log('📡 Fetching from:', endpoint);
        console.log('🔑 Using token:', token ? 'Present' : 'Missing');

        const res = await fetch(endpoint, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
        });

        if (res.status === 401) {
          setAuthError(true);
          throw new Error('Session expired. Please login again.');
        }

        if (!res.ok) {
          const errorData = await res.json();
          throw new Error(errorData.error || 'Failed to load filters');
        }

        const data = await res.json();
        if (!data.success) throw new Error(data.error || 'Failed to load filters');

        // Generate dates
        const today = new Date();
        const startDate = new Date("2025-01-01");
        const dates = [];
        for (let d = new Date(startDate); d <= today; d.setDate(d.getDate() + 1)) {
          dates.push(d.toISOString().split("T")[0]);
        }
        dates.sort((a, b) => new Date(b) - new Date(a));

        // Set projects based on role
        if (isAdminOrManager) {
          setMeta({
            dates: data.dates || dates,
            projects: data.projects || []
          });
        } else {
          setMeta({
            dates: dates,
            projects: data.projects || []
          });
        }

        // Set default date
        const todayStr = new Date().toISOString().split('T')[0];
        const defaultDate = dates.includes(todayStr) ? todayStr : dates[0] || '';
        setSelectedDate(defaultDate);
        setPendingDate(defaultDate);

      } catch (err) {
        console.error('❌ Load meta error:', err);
        setError(err.message);
      } finally {
        setLoadingMeta(false);
      }
    }

    loadMeta();
  }, [isAdminOrManager, userId, token, isAuthenticated]);

  // ── Load rows whenever applied filters change ───────────────────────────────
  useEffect(() => {
    if (!selectedDate || !isAuthenticated) return;

    async function loadRows() {
      setLoadingRows(true);
      setError('');
      setPage(1);
      try {
        const params = new URLSearchParams({ date: selectedDate });

        // ✅ For non-admin users, always filter by their user_id
        if (!isAdminOrManager) {
          params.set('user_id', userId);
        }

        if (selectedProject) params.set('project_id', selectedProject);
        if (selectedEmployee && isAdminOrManager) {
          params.set('user_id', selectedEmployee);
        }

        console.log('📊 Fetching report with params:', params.toString());

        const res = await fetch(
          `${API_BASE}/api/daily-updates/report?${params}`,
          {
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json'
            }
          }
        );

        if (res.status === 401) {
          setAuthError(true);
          throw new Error('Session expired. Please login again.');
        }

        if (!res.ok) {
          const errorData = await res.json();
          throw new Error(errorData.error || 'Failed to load daily updates');
        }

        const data = await res.json();
        if (!data.success) throw new Error(data.error || 'Failed to load daily updates');
        setRows(data.data || []);
      } catch (err) {
        console.error('❌ Load rows error:', err);
        setError(err.message);
        setRows([]);
      } finally {
        setLoadingRows(false);
      }
    }
    loadRows();
  }, [selectedDate, selectedProject, selectedEmployee, userId, isAdminOrManager, token, isAuthenticated]);

  // ── Employee dropdown options (only for Admin/Manager) ────────────────────
  const employeeOptions = useMemo(() => {
    if (!isAdminOrManager) return [];
    if (!serviceDeliveryEmployees?.length) return [];
    return serviceDeliveryEmployees.map(emp => ({
      id: emp.employee_id || emp.u_id || emp.id,
      name: emp.emp_name || emp.name,
    }));
  }, [isAdminOrManager, serviceDeliveryEmployees]);

  // ── Apply filter ───────────────────────────────────────────────────────────
  const handleFilter = () => {
    setSelectedDate(pendingDate);
    setSelectedProject(pendingProject);
    setSelectedEmployee(pendingEmployee);
  };

  // ── Handle logout on auth error ──
  const handleLogout = () => {
    Cookies.remove("user");
    ["token", "email", "emp_id", "role", "userName"].forEach(k => localStorage.removeItem(k));
    navigate('/login');
  };

  // ── Pagination ─────────────────────────────────────────────────────────────
  const totalPages = Math.max(1, Math.ceil(rows.length / PAGE_SIZE));
  const pageRows = rows.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);
  const startEntry = rows.length === 0 ? 0 : (page - 1) * PAGE_SIZE + 1;
  const endEntry = Math.min(page * PAGE_SIZE, rows.length);

  // ── Format date for display (DD-MM-YYYY) ───────────────────────────────────
  const formatDisplay = (d) => {
    if (!d) return '';
    const [y, m, day] = d.split('-');
    return `${day}-${m}-${y}`;
  };

  const selectCls =
    'appearance-none w-full bg-white border border-gray-200 rounded-lg pl-3 pr-8 py-2.5 text-sm text-gray-700 shadow-sm focus:outline-none focus:ring-2 focus:ring-violet-400 cursor-pointer';

  // Table column headers
  const COLS = [
    'EMPLOYEE NAME', 'PROJECT', 'TASK NAME', 'WORKING STATUS',
    'DONE YESTERDAY', "TODAY'S PLAN", 'RISKS', 'DEPENDENCIES',
    'ESTIMATED TIME', 'TOTAL TIME UTILIZED', 'AVAILABILITY', 'UTILIZATION (%)',
  ];

  // ── Show authentication error state ──
  if (authError) {
    return (
      <div className="min-h-screen bg-[#f0f0f8] p-6 font-sans flex items-center justify-center">
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-8 max-w-md w-full text-center">
          <div className="text-5xl mb-4">🔒</div>
          <h2 className="text-xl font-bold text-gray-800 mb-2">Session Expired</h2>
          <p className="text-gray-500 mb-6">Your session has expired. Please login again to continue.</p>
          <button
            onClick={handleLogout}
            className="px-6 py-2.5 bg-[#856BFF] hover:bg-[#7b5efd] text-white font-semibold rounded-lg transition-colors"
          >
            Login Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f0f0f8] p-6 font-sans">

      {/* ── Page header ── */}
      <div className="mb-5">
        <h1 className="text-2xl font-bold text-gray-900 leading-tight">Daily Status Report</h1>
        <p className="text-sm text-gray-400 mt-0.5">
          Monitor daily activity and resource updates
          {!isAdminOrManager && ' (Your assigned projects only)'}
        </p>
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
            <input
              type="date"
              value={pendingDate}
              onChange={e => setPendingDate(e.target.value)}
              className="absolute inset-0 opacity-0 w-full h-full cursor-pointer"
            />
          </div>
        </SelectWrapper>

        {/* Project - Shows different options based on role */}
        <SelectWrapper label="Project">
          <div className="min-w-[220px]">
            <SearchableSelect
              value={pendingProject}
              onChange={setPendingProject}
              placeholder="All projects"
              disabled={loadingMeta}
              loading={loadingMeta && meta.projects.length === 0}
              options={meta.projects.map(p => ({
                value: String(p.id),
                label: p.project_name,
              }))}
            />
          </div>
        </SelectWrapper>

        {/* Employee - Only shown for Admin/Manager */}
        {isAdminOrManager && (
          <SelectWrapper label="Employee">
            <div className="min-w-[220px]">
              <SearchableSelect
                value={pendingEmployee}
                onChange={setPendingEmployee}
                placeholder="All employees"
                disabled={employeeOptions.length === 0 || loadingMeta}
                options={employeeOptions.map(emp => ({
                  value: String(emp.id),
                  label: emp.name,
                }))}
              />
            </div>
          </SelectWrapper>
        )}

        {/* Filter button */}
        <button
          onClick={handleFilter}
          disabled={loadingMeta || loadingRows}
          className="self-end px-6 py-2.5 bg-[#856BFF] hover:bg-[#7f62ff] active:bg-[#856BFF] text-white text-sm font-semibold rounded-lg shadow-sm transition-colors disabled:opacity-50"
        >
          {loadingMeta ? 'Loading...' : 'Filter Results'}
        </button>
      </div>

      {/* ── Table card ── */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm border-collapse min-w-[960px]">

            {/* Head */}
            <thead>
              <tr className="border-b border-gray-100 bg-[#EFF4FF]">
                {COLS.map(col => (
                  <th
                    key={col}
                    className="text-left px-4 py-3 text-[11px] font-bold text-slate-500 tracking-wide uppercase whitespace-nowrap"
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
                      <svg className="animate-spin w-5 h-5 text-[#856BFF]" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
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
                const estimatedHours = Number(row.estimated_hours) || 0;
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

                    {/* ✅ ESTIMATED TIME - NEW COLUMN */}
                    <td className="px-4 py-4 text-gray-700 font-medium whitespace-nowrap">
                      {estimatedHours > 0 ? `${estimatedHours}h` : '—'}
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
                  className={`w-8 h-8 flex items-center justify-center rounded-md text-sm font-medium transition-colors ${n === page
                    ? 'bg-[#856BFF] text-white shadow-sm'
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