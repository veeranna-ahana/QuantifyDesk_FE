import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';
import toast from 'react-hot-toast';
import SearchableSelect from '../component/SearchableSelect';
import { Icon } from '@iconify/react';

const BASE_URL = import.meta.env.VITE_API_BASE_URL;
const HOURS_PER_DAY = 8;

const getHeaders = () => ({
  Authorization: `Bearer ${localStorage.getItem('token') || ''}`,
});

// ── Role definitions (kept in sync with Projects.jsx) ─────────────────────────
const EFFORT_ROLES = [
  { role: 'BA', unitLabel: '' },
  { role: 'Solution Architect', unitLabel: '' },
  { role: 'UI/UX', unitLabel: 'No of UI Screens' },
  { role: 'FE Dev', unitLabel: 'No of UI Screens' },
  { role: 'BE Dev', unitLabel: 'No of APIs' },
  { role: 'Tester', unitLabel: 'No of Cases' },
  { role: 'Deployment', unitLabel: '' },
  { role: 'Warranty & Support', unitLabel: '' },
  { role: 'Project Manager', unitLabel: '' },
];

const emptyRows = () =>
  EFFORT_ROLES.map(r => ({
    role: r.role,
    unitLabel: r.unitLabel,
    days: '',
    hrs: '',
    bufferDays: '',
    bufferHrs: '',
    totalHrs: '',
    units: '',
  }));

// ── Chevron icon for select ───────────────────────────────────────────────────
const ChevDown = () => (
  <svg className="w-4 h-4 #434655 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none"
    fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
    <path d="M6 9l6 6 6-6" />
  </svg>
);

// ── Compact number input ──────────────────────────────────────────────────────
const NumInput = ({ value, onChange, readOnly, placeholder = '0', step = '0.5', integerOnly = false }) =>
  readOnly ? (
    <span className="inline-block w-16 text-center text-sm font-semibold text-gray-700">
      {value || '—'}
    </span>
  ) : (
    <input
      type="number"
      min="0"
      step={step}
      value={value}
      placeholder={placeholder}
      onKeyDown={integerOnly ? (e) => { if (e.key === '.' || e.key === 'e' || e.key === 'E' || e.key === '+' || e.key === '-') e.preventDefault(); } : undefined}
      onChange={e => {
        let val = e.target.value;
        if (integerOnly && val !== '') {
          val = val.replace(/\D/g, '');
        }
        onChange(val);
      }}
      className="w-16 text-center border border-gray-200 rounded-lg px-2 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-violet-400 bg-white"
    />
  );

// ── Main Page ─────────────────────────────────────────────────────────────────
export default function EffortEstimate() {
  const navigate = useNavigate();
  const location = useLocation();

  // State passed via navigation: { projects, initialProjectId, readOnly, projectName }
  const { projects = [], initialProjectId = '', readOnly = false, projectName: passedProjectName = '' } = location.state || {};

  const [projectList, setProjectList] = useState(projects);
  const [selectedProject, setSelectedProject] = useState(initialProjectId);
  const [rows, setRows] = useState(emptyRows());
  const [initialRows, setInitialRows] = useState(emptyRows());
  const [assignments, setAssignments] = useState([]);
  const [blockedModalData, setBlockedModalData] = useState(null);
  const [saving, setSaving] = useState(false);
  const [loadingRows, setLoadingRows] = useState(false);

  // Fetch project list if not provided in state
  useEffect(() => {
    if (projectList.length === 0 && selectedProject) {
      axios
        .get(`${BASE_URL}/api/projects`, { headers: getHeaders() })
        .then(res => {
          const list = res.data?.data || res.data || [];
          setProjectList(list);
        })
        .catch(err => console.error('Error fetching projects:', err));
    }
  }, [selectedProject, projectList.length]);

  const currentProject = projectList.find(p => String(p.id) === String(selectedProject));
  const projectName = passedProjectName || currentProject?.project_name || currentProject?.name || '';

  // ── Fetch existing effort & assignments when project changes ─────────────
  useEffect(() => {
    if (!selectedProject) { 
      setRows(emptyRows()); 
      setInitialRows(emptyRows());
      setAssignments([]);
      return; 
    }

    setLoadingRows(true);
    Promise.all([
      axios.get(`${BASE_URL}/api/projects/${selectedProject}/effort`, { headers: getHeaders() }),
      axios.get(`${BASE_URL}/api/assignments?projectId=${selectedProject}`, { headers: getHeaders() })
    ])
      .then(([effortRes, assignRes]) => {
        const fetched = effortRes.data?.rows || [];
        const fetchedAssignments = assignRes.data || [];
        setAssignments(fetchedAssignments);

        let newRows = emptyRows();
        if (fetched.length > 0) {
          newRows = EFFORT_ROLES.map(r => {
            const ex = fetched.find(fr => fr.role === r.role);
            if (!ex) return { role: r.role, unitLabel: r.unitLabel, days: '', hrs: '', bufferDays: '', bufferHrs: '', totalHrs: '', units: '' };
            return {
              role: r.role,
              unitLabel: r.unitLabel,
              days: ex.effort_days ? String(ex.effort_days) : '',
              hrs: ex.effort_hrs ? String(ex.effort_hrs) : '',
              bufferDays: ex.buffer_days ? String(ex.buffer_days) : '',
              bufferHrs: ex.buffer_hrs ? String(ex.buffer_hrs) : '',
              totalHrs: ex.total_hrs ? String(ex.total_hrs) : '',
              units: ex.units ? String(ex.units) : '',
            };
          });
        }
        setRows(newRows);
        setInitialRows(newRows);
      })
      .catch(err => console.error('Error fetching effort & assignments:', err))
      .finally(() => setLoadingRows(false));
  }, [selectedProject]);

  // Group assignments by role
  const assignmentsByRole = React.useMemo(() => {
    const map = {};
    (assignments || []).forEach(a => {
      if (!map[a.role]) map[a.role] = [];
      map[a.role].push(a);
    });
    return map;
  }, [assignments]);

  // ── Validation: Check for roles with active assignments being removed / under-allocated ──
  const getBlockedRoles = () => {
    const blocked = [];
    for (const [role, assignedList] of Object.entries(assignmentsByRole)) {
      if (!assignedList || assignedList.length === 0) continue;
      const r = rows.find(row => row.role === role);
      const days = parseFloat(r?.days) || 0;
      const bufferDays = parseFloat(r?.bufferDays) || 0;
      const units = parseInt(r?.units, 10) || 0;

      const totalAssignedUnits = assignedList.reduce((s, a) => s + (Number(a.units_assigned) || 0), 0);
      const totalAssignedDays = assignedList.reduce((s, a) => s + (Number(a.estimated_days) || 0), 0);
      const totalAssignedHours = assignedList.reduce((s, a) => s + (Number(a.estimated_hours) || 0), 0);

      const isRemoved = days <= 0 || units <= 0;
      const isUnderUnits = units < totalAssignedUnits;
      const isUnderDays = (days + bufferDays) < totalAssignedDays;

      if (isRemoved || isUnderUnits || isUnderDays) {
        blocked.push({
          role,
          reason: isRemoved ? 'removed' : isUnderUnits ? 'under_units' : 'under_days',
          assignedCount: assignedList.length,
          totalAssignedUnits,
          totalAssignedDays,
          totalAssignedHours,
          newUnits: units,
          newDays: days,
          newBufferDays: bufferDays,
          assignments: assignedList,
        });
      }
    }
    return blocked;
  };

  // Revert blocked roles to original values
  const handleRevertBlocked = () => {
    if (!blockedModalData) return;
    const blockedRoleNames = new Set(blockedModalData.map(b => b.role));
    setRows(prev => prev.map(r => {
      if (blockedRoleNames.has(r.role)) {
        const orig = initialRows.find(ir => ir.role === r.role);
        return orig ? { ...orig } : r;
      }
      return r;
    }));
    setBlockedModalData(null);
  };

  // Navigate directly to Task Allocation for this project
  const handleGoToTaskAllocation = () => {
    setBlockedModalData(null);
    navigate('/assignments', {
      state: { selProject: String(selectedProject), projectName }
    });
  };

  // ── Cell change handler with auto-calculations ───────────────────────────
  const handleChange = (idx, field, val) => {
    setRows(prev => {
      const sanitizedVal = field === 'units' ? (val === '' ? '' : val.replace(/\D/g, '')) : val;
      const next = prev.map((r, i) => i === idx ? { ...r, [field]: sanitizedVal } : r);
      const row = { ...next[idx] };

      if (field === 'days') {
        const d = parseFloat(val);
        row.hrs = isNaN(d) ? '' : String(d * HOURS_PER_DAY);
      }
      if (field === 'bufferDays') {
        const bd = parseFloat(val);
        row.bufferHrs = isNaN(bd) ? '' : String(bd * HOURS_PER_DAY);
      }
      const h = parseFloat(row.hrs) || 0;
      const bh = parseFloat(row.bufferHrs) || 0;
      row.totalHrs = (h + bh) > 0 ? String(h + bh) : '';

      next[idx] = row;
      return next;
    });
  };

  // ── Totals ───────────────────────────────────────────────────────────────
  const totals = rows.reduce(
    (acc, r) => ({
      days: acc.days + (parseFloat(r.days) || 0),
      hrs: acc.hrs + (parseFloat(r.hrs) || 0),
      bufferDays: acc.bufferDays + (parseFloat(r.bufferDays) || 0),
      bufferHrs: acc.bufferHrs + (parseFloat(r.bufferHrs) || 0),
      totalHrs: acc.totalHrs + (parseFloat(r.totalHrs) || 0),
      units: acc.units + (parseFloat(r.units) || 0),
    }),
    { days: 0, hrs: 0, bufferDays: 0, bufferHrs: 0, totalHrs: 0, units: 0 }
  );

  // ── Submit ───────────────────────────────────────────────────────────────
  const handleSubmit = async () => {
    if (!selectedProject) { toast.error('Please select a project'); return; }

    // Intercept if any assigned role effort is being removed / reduced below assigned
    const blocked = getBlockedRoles();
    if (blocked.length > 0) {
      setBlockedModalData(blocked);
      return;
    }

    const missing = rows.filter(r => {
      const hasDays = (parseFloat(r.days) || 0) > 0;
      const hasBuf = (parseFloat(r.bufferDays) || 0) > 0;
      const hasUnits = r.units && parseInt(r.units, 10) > 0;
      return ((hasDays || hasBuf) && !hasUnits) || (hasUnits && !hasDays);
    });

    if (missing.length) {
      const withUnitsNoEffort = missing.filter(r => {
        const hasDays = (parseFloat(r.days) || 0) > 0;
        const hasUnits = r.units && parseInt(r.units, 10) > 0;
        return hasUnits && !hasDays;
      });
      if (withUnitsNoEffort.length) {
        toast.error(`Effort Days required for: ${withUnitsNoEffort.map(r => r.role).join(', ')}`);
      } else {
        toast.error(`Units required for: ${missing.map(r => r.role).join(', ')}`);
      }
      return;
    }

    setSaving(true);
    try {
      await axios.post(
        `${BASE_URL}/api/projects/${selectedProject}/effort/bulk`,
        {
          rows: rows.map(r => ({
            role: r.role,
            effort_days: r.days,
            buffer_days: r.bufferDays,
            units: r.units,
            unit_label: r.unitLabel,
          })),
        },
        { headers: getHeaders() }
      );
      toast.success('Effort estimate saved successfully!');
      navigate('/projects');
    } catch (err) {
      if (err?.response?.data?.blockedRoles) {
        setBlockedModalData(err.response.data.blockedRoles);
      } else {
        toast.error(err?.response?.data?.message || 'Failed to save estimate');
      }
    } finally {
      setSaving(false);
    }
  };

  // ── Column headers (matching Figma) ──────────────────────────────────────
  const COLS = [
    'ROLE',
    <>
      EFFORT
      <br />
      <span className="font-normal #434655">(PERSON DAYS)</span>
    </>,
    <>
      IN
      <br />
      <span className="font-normal #434655">(PERSON HRS)</span>
    </>,
    <>
      BUFFER
      <br />
      <span className="font-normal #434655">(PERSON DAYS)</span>
    </>,
    <>
      BUFFER
      <br />
      <span className="font-normal #434655">(PERSON HRS)</span>
    </>,
    <>
      TOTAL
      <br />
      <span className="font-normal #434655">(PERSON HRS)</span>
    </>,
    'UNITS',
    'UNIT LABEL'
  ];

  return (
    <div className="min-h-screen bg-[#f0f0f8] p-6 font-sans">

      {/* ── Page header ── */}
      <div className="mb-5">
        <h1 className="text-2xl font-bold text-gray-900">
          {readOnly ? 'View Effort Estimate' : 'Effort Estimate & Utilization'}
        </h1>
        <p className="text-sm text-gray-500 mt-0.5">
          {readOnly
            ? 'Viewing effort estimates for this project (read-only).'
            : 'Configure project resources and track total capacity alignment.'}
        </p>
      </div>

      {/* ── Project Name info before table ── */}
      {projectName && (
        <div className="mb-5 bg-white rounded-2xl shadow-sm border border-gray-100 p-4 flex items-center justify-between flex-wrap gap-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#856BFF]/10 flex items-center justify-center shrink-0">
              <Icon icon="material-symbols:folder" width="22" height="22" color="#856BFF" />
            </div>
            <div>
              <span className="text-[10px] font-bold text-gray-400 tracking-wider uppercase block">Project Name</span>
              <span className="text-base font-bold text-gray-800">{projectName}</span>
            </div>
          </div>
          {currentProject?.project_code && (
            <div className="flex items-center gap-2 bg-[#EFF4FF] border border-[#856BFF]/20 px-3 py-1.5 rounded-xl">
              <span className="text-[10px] font-bold text-gray-400 tracking-wider uppercase">Project Code:</span>
              <span className="text-xs font-bold text-[#856BFF]">{currentProject.project_code}</span>
            </div>
          )}
        </div>
      )}

      {/* ── Resource Breakdown card ── */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">

        {/* Card header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <div className="flex items-center gap-2">
            <Icon icon="material-symbols:grid-view" width="20" height="20" color="#856BFF" />
            <span className="text-base font-bold text-gray-900">Effort Breakdown</span>
          </div>
          <div className="flex items-center gap-1.5 text-xs #434655">
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
              <circle cx="12" cy="12" r="10" /><path d="M12 6v6l4 2" />
            </svg>
            1 Day = 8 Hrs
          </div>
        </div>

        {/* Table */}
        {loadingRows ? (
          <div className="flex items-center justify-center gap-2 py-16 #434655">
            <svg className="animate-spin w-5 h-5 text-[#856BFF]" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
            </svg>
            Loading effort data…
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm border-collapse">
              {/* Head */}
              <thead>
                <tr className="bg-gray-50 border-b border-gray-100" style={{ backgroundColor: '#EFF4FF' }}>
                  {COLS.map(col => (
                    <th key={typeof col === 'string' ? col : Math.random()}
                      className="px-4 py-3 text-[11px] font-semibold text-[#434655] tracking-widest uppercase text-left whitespace-nowrap">
                      {col}
                    </th>
                  ))}
                </tr>
              </thead>

              {/* Body */}
              <tbody>
                {rows.map((r, i) => {
                  const roleAssignedList = assignmentsByRole[r.role] || [];
                  const hasAssigned = roleAssignedList.length > 0;

                  return (
                    <tr key={r.role} className="border-b border-gray-50 hover:bg-gray-50/40 transition-colors">

                      {/* Role + Assigned Badge */}
                      <td className="px-5 py-4 font-bold text-gray-800 whitespace-nowrap w-48">
                        <div className="flex items-center gap-2">
                          <span>{r.role}</span>
                          {hasAssigned && (
                            <span 
                              className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-50 text-[#0052cc] border border-blue-200/80"
                              title={`${roleAssignedList.length} task assignment(s) in Task Allocation`}
                            >
                              <Icon icon="material-symbols:person" width="12" height="12" />
                              {roleAssignedList.length} assigned
                            </span>
                          )}
                        </div>
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
                      <td className="px-4 py-4 text-center #434655 text-sm">
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
                      <td className="px-4 py-4 text-center #434655 text-sm">
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
                          step="1"
                          integerOnly={true}
                          onChange={val => handleChange(i, 'units', val)}
                        />
                      </td>

                      {/* Unit Label */}
                      <td className="px-4 py-4 #434655 text-xs whitespace-nowrap">
                        {r.unitLabel || '—'}
                      </td>
                    </tr>
                  );
                })}
              </tbody>

              {/* Totals footer */}
              <tfoot>
                <tr className="bg-gray-50 border-t border-gray-200">
                  <td className="px-5 py-3 text-xs font-bold text-[#856BFF] uppercase tracking-wider">
                    TOTAL
                  </td>
                  <td className="px-4 py-3 text-center text-sm font-semibold text-gray-700">
                    {totals.days > 0 ? `${totals.days} Days` : '0 Days'}
                  </td>
                  <td className="px-4 py-3 text-center text-sm font-semibold text-gray-700">
                    {totals.hrs > 0 ? `${totals.hrs} Hrs` : '0 Hrs'}
                  </td>
                  <td className="px-4 py-3 text-center text-sm font-semibold text-gray-700">
                    {totals.bufferDays > 0 ? `${totals.bufferDays} Days` : '0 Days'}
                  </td>
                  <td className="px-4 py-3 text-center text-sm font-semibold text-gray-700">
                    {totals.bufferHrs > 0 ? `${totals.bufferHrs} Hrs` : '0 Hrs'}
                  </td>

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
              className="px-6 py-2.5 bg-[#856BFF] hover:bg-[#7e62fd] active:bg-[#856BFF] text-white text-sm font-semibold rounded-lg shadow-sm transition-colors disabled:opacity-60"
            >
              {saving ? 'Saving…' : 'Save Estimate'}
            </button>
          )}
        </div>
      </div>

      {/* ── Pop-up Warning Modal for Assigned Roles ── */}
      {blockedModalData && (
        <div 
          className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center z-[1000] p-4 animate-in fade-in duration-150"
          onClick={(e) => {
            if (e.target === e.currentTarget) setBlockedModalData(null);
          }}
        >
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-xl max-h-[90vh] overflow-hidden flex flex-col border border-slate-100">
            
            {/* Modal Header */}
            <div className="p-6 pb-4 border-b border-slate-100 flex items-start justify-between gap-4">
              <div className="flex items-start gap-3.5">
                <div className="w-11 h-11 rounded-xl bg-amber-50 border border-amber-200/60 flex items-center justify-center shrink-0 text-amber-600">
                  <Icon icon="material-symbols:warning-rounded" width="26" height="26" />
                </div>
                <div>
                  <h3 className="text-lg font-extrabold text-slate-800">
                    Cannot Remove Effort for Assigned Roles
                  </h3>
                  <p className="text-xs text-slate-500 mt-1">
                    Tasks are currently assigned to employees for this project. Please remove or update the task assignments before clearing effort.
                  </p>
                </div>
              </div>
              <button
                onClick={() => setBlockedModalData(null)}
                className="text-slate-400 hover:text-slate-600 p-1 rounded-lg transition-colors"
              >
                <Icon icon="material-symbols:close" width="20" height="20" />
              </button>
            </div>

            {/* Modal Content / Blocked Roles List */}
            <div className="p-6 overflow-y-auto flex flex-col gap-4 max-h-[50vh]">
              {blockedModalData.map((item) => (
                <div 
                  key={item.role} 
                  className="bg-slate-50/80 border border-slate-200/80 rounded-xl p-4 flex flex-col gap-3"
                >
                  <div className="flex items-center justify-between flex-wrap gap-2">
                    <div className="flex items-center gap-2">
                      <span className="font-extrabold text-sm text-slate-800">
                        {item.role}
                      </span>
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800 border border-amber-200">
                        {item.reason === 'removed' ? 'Effort Cleared' : 'Under Assigned Total'}
                      </span>
                    </div>
                    <span className="text-xs font-semibold text-slate-500">
                      {item.assignedCount || item.assignments?.length || 0} active assignment(s)
                    </span>
                  </div>

                  {/* Assignments sub-list */}
                  <div className="bg-white rounded-lg border border-slate-200/60 divide-y divide-slate-100 overflow-hidden">
                    {(item.assignments || []).map((a, aIdx) => (
                      <div key={a.id || aIdx} className="p-2.5 px-3 flex items-center justify-between text-xs gap-3">
                        <div className="flex items-center gap-2.5 min-w-0">
                          <div className="w-7 h-7 rounded-full bg-violet-100 text-[#856BFF] flex items-center justify-center font-bold text-[11px] shrink-0">
                            {(a.user_name || a.emp_id || 'U').charAt(0).toUpperCase()}
                          </div>
                          <div className="min-w-0">
                            <span className="font-bold text-slate-700 truncate block">
                              {a.user_name || a.emp_id || 'Unknown Employee'}
                            </span>
                            <span className="text-[11px] text-slate-400 truncate block">
                              Task: {a.task_name || 'General Task'}
                            </span>
                          </div>
                        </div>
                        <div className="text-right shrink-0">
                          <span className="font-bold text-[#0052cc] block text-xs">
                            {a.units_assigned ?? 0} units
                          </span>
                          <span className="text-[10px] text-slate-400 block font-medium">
                            {a.estimated_hours ?? 0} hrs ({a.estimated_days ?? 0}d)
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}

              {/* Guidance Callout */}
              <div className="bg-[#eff4ff] border border-blue-100 rounded-xl p-3.5 flex items-start gap-2.5 text-xs text-blue-900">
                <Icon icon="material-symbols:info-rounded" width="18" height="18" className="text-[#0052cc] shrink-0 mt-0.5" />
                <div>
                  <span className="font-bold">Next Steps: </span>
                  Click <strong>Go to Task Allocation</strong> to open the role accordion and delete or reassign the employees from these tasks.
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="p-4 px-6 bg-slate-50 border-t border-slate-100 flex items-center justify-between gap-3">
              <button
                onClick={handleRevertBlocked}
                className="px-4 py-2 text-xs font-bold text-slate-600 hover:text-slate-800 hover:bg-slate-200/60 rounded-xl transition-all"
              >
                Revert & Keep Effort
              </button>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setBlockedModalData(null)}
                  className="px-4 py-2 border border-slate-200 text-slate-600 hover:bg-white text-xs font-bold rounded-xl transition-all"
                >
                  Dismiss
                </button>
                <button
                  onClick={handleGoToTaskAllocation}
                  className="px-4 py-2 bg-[#856BFF] hover:bg-[#785dfa] text-white text-xs font-bold rounded-xl shadow-sm flex items-center gap-1.5 transition-all"
                >
                  <Icon icon="material-symbols:arrow-forward" width="16" height="16" />
                  Go to Task Allocation
                </button>
              </div>
            </div>

          </div>
        </div>
      )}
    </div>
  );
}
