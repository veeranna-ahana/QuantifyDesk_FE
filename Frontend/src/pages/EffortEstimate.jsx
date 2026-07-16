import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';
import toast from 'react-hot-toast';

const BASE_URL = import.meta.env.VITE_API_BASE_URL;
const HOURS_PER_DAY = 8;

const getHeaders = () => ({
  Authorization: `Bearer ${localStorage.getItem('token') || ''}`,
});

// ── Role definitions (kept in sync with Projects.jsx) ─────────────────────────
const EFFORT_ROLES = [
  { role: 'BA',                  unitLabel: '' },
  { role: 'Solution Architect',  unitLabel: '' },
  { role: 'UI/UX',               unitLabel: 'No of UI Screens' },
  { role: 'FE Dev',              unitLabel: 'No of UI Screens' },
  { role: 'BE Dev',              unitLabel: 'No of APIs' },
  { role: 'Tester',              unitLabel: 'No of Cases' },
  { role: 'Deployment',          unitLabel: '' },
  { role: 'Warranty & Support',  unitLabel: '' },
  { role: 'Project Manager',     unitLabel: '' },
];

const emptyRows = () =>
  EFFORT_ROLES.map(r => ({
    role:       r.role,
    unitLabel:  r.unitLabel,
    days:       '',
    hrs:        '',
    bufferDays: '',
    bufferHrs:  '',
    totalHrs:   '',
    units:      '',
  }));

// ── Chevron icon for select ───────────────────────────────────────────────────
const ChevDown = () => (
  <svg className="w-4 h-4 text-gray-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none"
    fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
    <path d="M6 9l6 6 6-6"/>
  </svg>
);

// ── Compact number input ──────────────────────────────────────────────────────
const NumInput = ({ value, onChange, readOnly, placeholder = '0' }) =>
  readOnly ? (
    <span className="inline-block w-16 text-center text-sm font-semibold text-gray-700">
      {value || '—'}
    </span>
  ) : (
    <input
      type="number"
      min="0"
      step="0.5"
      value={value}
      placeholder={placeholder}
      onChange={e => onChange(e.target.value)}
      className="w-16 text-center border border-gray-200 rounded-lg px-2 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-violet-400 bg-white"
    />
  );

// ── Main Page ─────────────────────────────────────────────────────────────────
export default function EffortEstimate() {
  const navigate  = useNavigate();
  const location  = useLocation();

  // State passed via navigation: { projects, initialProjectId, readOnly }
  const { projects = [], initialProjectId = '', readOnly = false } = location.state || {};

  const [selectedProject, setSelectedProject] = useState(initialProjectId);
  const [rows,   setRows]   = useState(emptyRows());
  const [saving, setSaving] = useState(false);
  const [loadingRows, setLoadingRows] = useState(false);

  // ── Fetch existing effort when project changes ───────────────────────────
  useEffect(() => {
    if (!selectedProject) { setRows(emptyRows()); return; }

    setLoadingRows(true);
    axios
      .get(`${BASE_URL}/api/projects/${selectedProject}/effort`, { headers: getHeaders() })
      .then(res => {
        const fetched = res.data?.rows || [];
        if (fetched.length > 0) {
          setRows(
            EFFORT_ROLES.map(r => {
              const ex = fetched.find(fr => fr.role === r.role);
              if (!ex) return { role: r.role, unitLabel: r.unitLabel, days: '', hrs: '', bufferDays: '', bufferHrs: '', totalHrs: '', units: '' };
              return {
                role:       r.role,
                unitLabel:  r.unitLabel,
                days:       ex.effort_days  != null ? String(ex.effort_days)  : '',
                hrs:        ex.effort_hrs   != null ? String(ex.effort_hrs)   : '',
                bufferDays: ex.buffer_days  != null ? String(ex.buffer_days)  : '',
                bufferHrs:  ex.buffer_hrs   != null ? String(ex.buffer_hrs)   : '',
                totalHrs:   ex.total_hrs    != null ? String(ex.total_hrs)    : '',
                units:      ex.units        != null ? String(ex.units)        : '',
              };
            })
          );
        } else {
          setRows(emptyRows());
        }
      })
      .catch(err => console.error('Error fetching effort:', err))
      .finally(() => setLoadingRows(false));
  }, [selectedProject]);

  // ── Cell change handler with auto-calculations ───────────────────────────
  const handleChange = (idx, field, val) => {
    setRows(prev => {
      const next = prev.map((r, i) => i === idx ? { ...r, [field]: val } : r);
      const row  = { ...next[idx] };

      if (field === 'days') {
        const d = parseFloat(val);
        row.hrs = isNaN(d) ? '' : String(d * HOURS_PER_DAY);
      }
      if (field === 'bufferDays') {
        const bd = parseFloat(val);
        row.bufferHrs = isNaN(bd) ? '' : String(bd * HOURS_PER_DAY);
      }
      const h  = parseFloat(row.hrs)       || 0;
      const bh = parseFloat(row.bufferHrs) || 0;
      row.totalHrs = (h + bh) > 0 ? String(h + bh) : '';

      next[idx] = row;
      return next;
    });
  };

  // ── Totals ───────────────────────────────────────────────────────────────
  const totals = rows.reduce(
    (acc, r) => ({
      days:       acc.days       + (parseFloat(r.days)       || 0),
      bufferDays: acc.bufferDays + (parseFloat(r.bufferDays) || 0),
      totalHrs:   acc.totalHrs   + (parseFloat(r.totalHrs)   || 0),
      units:      acc.units      + (parseFloat(r.units)      || 0),
    }),
    { days: 0, bufferDays: 0, totalHrs: 0, units: 0 }
  );

  // ── Submit ───────────────────────────────────────────────────────────────
  const handleSubmit = async () => {
    if (!selectedProject) { toast.error('Please select a project'); return; }

    const missing = rows.filter(r => {
      const hasDays   = (parseFloat(r.days)       || 0) > 0;
      const hasBuf    = (parseFloat(r.bufferDays)  || 0) > 0;
      const hasUnits  = r.units && parseFloat(r.units) > 0;
      return (hasDays || hasBuf) && !hasUnits;
    });

    if (missing.length) {
      toast.error(`Units required for: ${missing.map(r => r.role).join(', ')}`);
      return;
    }

    setSaving(true);
    try {
      await axios.post(
        `${BASE_URL}/api/projects/${selectedProject}/effort/bulk`,
        {
          rows: rows.map(r => ({
            role:        r.role,
            effort_days: r.days,
            buffer_days: r.bufferDays,
            units:       r.units,
            unit_label:  r.unitLabel,
          })),
        },
        { headers: getHeaders() }
      );
      toast.success('Effort estimate saved successfully!');
      navigate('/projects');
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Failed to save estimate');
    } finally {
      setSaving(false);
    }
  };

  // ── Column headers (matching Figma) ──────────────────────────────────────
  const COLS = ['ROLE', 'EFFORT (DAYS)', 'IN HRS', 'BUFFER (DAYS)', 'BUFFER HRS', 'TOTAL HRS', 'UNITS', 'UNIT LABEL'];

  return (
    <div className="min-h-screen bg-[#f0f0f8] p-6 font-sans">

      {/* ── Page header ── */}
      <div className="mb-5">
        <h1 className="text-2xl font-bold text-gray-900">
          {readOnly ? 'View Effort Estimate' : 'Effort Estimate & Utilization'}
        </h1>
        <p className="text-sm text-gray-400 mt-0.5">
          {readOnly
            ? 'Viewing effort estimates for this project (read-only).'
            : 'Configure project resources and track total capacity alignment.'}
        </p>
      </div>

      {/* ── Project selector ── */}
      <div className="mb-5">
        <label className="block text-xs font-semibold text-gray-700 mb-1.5">
          Select Project <span className="text-red-500">*</span>
        </label>
        <div className="relative w-72">
          <select
            value={selectedProject}
            onChange={e => setSelectedProject(e.target.value)}
            className="w-full appearance-none bg-white border border-gray-200 rounded-lg pl-3 pr-9 py-2.5 text-sm text-gray-700 shadow-sm focus:outline-none focus:ring-2 focus:ring-violet-400 cursor-pointer"
          >
            <option value="">Select Project</option>
            {projects.map(p => (
              <option key={p.id} value={p.id}>
                {p.project_name || p.name}
              </option>
            ))}
          </select>
          <ChevDown />
        </div>
      </div>

      {/* ── Resource Breakdown card ── */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">

        {/* Card header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <div className="flex items-center gap-2">
            {/* Grid icon */}
            <svg className="w-5 h-5 text-violet-500" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
              <rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/>
              <rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/>
            </svg>
            <span className="text-base font-bold text-gray-900">Resource Breakdown</span>
          </div>
          <div className="flex items-center gap-1.5 text-xs text-gray-400">
            {/* Clock icon */}
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
              <circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/>
            </svg>
            1 Day = 8 Hrs
          </div>
        </div>

        {/* Table */}
        {loadingRows ? (
          <div className="flex items-center justify-center gap-2 py-16 text-gray-400">
            <svg className="animate-spin w-5 h-5 text-violet-500" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/>
            </svg>
            Loading effort data…
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm border-collapse">
              {/* Head */}
              <thead>
                <tr className="bg-gray-50 border-b border-gray-100">
                  {COLS.map(col => (
                    <th key={col}
                      className="px-4 py-3 text-[11px] font-semibold text-gray-400 tracking-widest uppercase text-left whitespace-nowrap">
                      {col}
                    </th>
                  ))}
                </tr>
              </thead>

              {/* Body */}
              <tbody>
                {rows.map((r, i) => (
                  <tr key={r.role} className="border-b border-gray-50 hover:bg-gray-50/40 transition-colors">

                    {/* Role */}
                    <td className="px-5 py-4 font-bold text-gray-800 whitespace-nowrap w-44">
                      {r.role}
                    </td>

                    {/* Effort Days */}
                    <td className="px-4 py-4 text-center">
                      <NumInput
                        value={r.days}
                        readOnly={readOnly}
                        onChange={val => handleChange(i, 'days', val)}
                      />
                    </td>

                    {/* In Hrs (calc) */}
                    <td className="px-4 py-4 text-center text-gray-400 text-sm">
                      {r.hrs || '—'}
                    </td>

                    {/* Buffer Days */}
                    <td className="px-4 py-4 text-center">
                      <NumInput
                        value={r.bufferDays}
                        readOnly={readOnly}
                        onChange={val => handleChange(i, 'bufferDays', val)}
                      />
                    </td>

                    {/* Buffer Hrs (calc) */}
                    <td className="px-4 py-4 text-center text-gray-400 text-sm">
                      {r.bufferHrs || '—'}
                    </td>

                    {/* Total Hrs (calc) — green */}
                    <td className="px-4 py-4 text-center font-bold text-emerald-500 text-sm">
                      {r.totalHrs || '—'}
                    </td>

                    {/* Units */}
                    <td className="px-4 py-4 text-center">
                      <NumInput
                        value={r.units}
                        readOnly={readOnly}
                        onChange={val => handleChange(i, 'units', val)}
                      />
                    </td>

                    {/* Unit Label */}
                    <td className="px-4 py-4 text-gray-400 text-xs whitespace-nowrap">
                      {r.unitLabel || '—'}
                    </td>
                  </tr>
                ))}
              </tbody>

              {/* Totals footer */}
              <tfoot>
                <tr className="bg-gray-50 border-t border-gray-200">
                  <td className="px-5 py-3 text-xs font-bold text-violet-600 uppercase tracking-wider">
                    TOTAL
                  </td>
                  <td className="px-4 py-3 text-center text-sm font-semibold text-gray-700">
                    {totals.days > 0 ? `${totals.days} Days` : '0 Days'}
                  </td>
                  <td className="px-4 py-3 text-center text-gray-400">—</td>
                  <td className="px-4 py-3 text-center text-sm font-semibold text-gray-700">
                    {totals.bufferDays > 0 ? `${totals.bufferDays} Days` : '0 Days'}
                  </td>
                  <td className="px-4 py-3 text-center text-gray-400">—</td>
                  <td className="px-4 py-3 text-center text-sm font-bold text-emerald-500">
                    {totals.totalHrs > 0 ? `${totals.totalHrs} Hrs` : '0 Hrs'}
                  </td>
                  <td className="px-4 py-3 text-center text-sm font-semibold text-gray-700">
                    {totals.units > 0 ? totals.units : '0'}
                  </td>
                  <td />
                </tr>
              </tfoot>
            </table>
          </div>
        )}

        {/* ── Footer actions ── */}
        <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-gray-100">
          <button
            onClick={() => navigate('/projects')}
            className="px-6 py-2.5 border border-gray-200 text-gray-600 text-sm font-semibold rounded-lg hover:bg-gray-50 transition-colors"
          >
            Close
          </button>
          {!readOnly && (
            <button
              onClick={handleSubmit}
              disabled={saving}
              className="px-6 py-2.5 bg-violet-600 hover:bg-violet-700 active:bg-violet-800 text-white text-sm font-semibold rounded-lg shadow-sm transition-colors disabled:opacity-60"
            >
              {saving ? 'Saving…' : 'Save Estimate'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
