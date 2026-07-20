import React, { useEffect, useState, useCallback } from "react";
import axios from "axios";
import { useSelector } from "react-redux";
import {
  PieChart, Pie, Cell, Tooltip, ResponsiveContainer
} from "recharts";

const BASE_URL = import.meta.env.VITE_API_BASE_URL;
const getHeaders = () => ({
  Authorization: `Bearer ${localStorage.getItem("token") || ""}`,
});

const PCT_COLOR = (pct) =>
  pct >= 80 ? "#00b894" : pct >= 40 ? "#f39c12" : "#e74c3c";

// ── Donut chart center label ──────────────────────────────────────────────────
const DonutLabel = ({ cx, cy, total }) => (
  <text x={cx} y={cy} textAnchor="middle" dominantBaseline="middle">
    <tspan x={cx} dy="-6" fontSize="22" fontWeight="700" fill="#2d3436">{total}</tspan>
    <tspan x={cx} dy="20" fontSize="11" fill="#999">Units</tspan>
  </text>
);

// ── KPI Card (matches Figma: icon box + label + value) ──────────────────────
const KpiCard = ({ icon, label, value, accent, sub }) => (
  <div className="bg-white rounded-xl shadow-sm flex-1 min-w-[130px] overflow-hidden"
    style={{ border: "1px solid #f0f0f0", borderLeft: `3px solid ${accent}` }}>
    <div className="px-4 py-4">
      <div className="flex items-center gap-2.5 mb-3">
        <div className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0 text-base"
          style={{ background: `${accent}18` }}>
          <span>{icon}</span>
        </div>
        <span className="text-[10px] font-bold tracking-widest text-gray-400 uppercase leading-tight">{label}</span>
      </div>
      <div className="text-[22px] font-extrabold leading-none"
        style={{ color: sub ? accent : "#1e272e" }}>
        {value}
      </div>
    </div>
  </div>
);


// ── Role Pill ─────────────────────────────────────────────────────────────────
const roleMap = {
  Lead: { bg: "#EEE8FF", text: "#7C3AED" },
  Dev:  { bg: "#E0F2FE", text: "#0369A1" },
  QA:   { bg: "#FEF9C3", text: "#A16207" },
  Analyst: { bg: "#E0FDF4", text: "#065F46" },
  BA:   { bg: "#FAE8FF", text: "#86198F" },
  Tester: { bg: "#FFF7ED", text: "#C2410C" },
  TL:   { bg: "#EFF6FF", text: "#1D4ED8" },
};
const RolePill = ({ role }) => {
  const s = roleMap[role] || { bg: "#F3F4F6", text: "#374151" };
  return (
    <span className="px-2.5 py-0.5 rounded-full text-[11px] font-semibold"
      style={{ background: s.bg, color: s.text }}>
      {role}
    </span>
  );
};

// ── Utilization bar ───────────────────────────────────────────────────────────
const UtilBar = ({ pct }) => {
  const color = pct >= 80 ? "#6C5CE7" : pct >= 40 ? "#6C5CE7" : "#6C5CE7";
  const bg = "#E8E6FF";
  return (
    <div className="flex items-center gap-2">
      <div className="flex-1 h-1.5 rounded-full" style={{ background: bg }}>
        <div className="h-full rounded-full transition-all duration-500"
          style={{ width: `${Math.min(pct, 100)}%`, background: color }} />
      </div>
      <span className="text-[11px] font-semibold text-gray-500 w-8">{pct}%</span>
    </div>
  );
};

// ── Status dot ────────────────────────────────────────────────────────────────
const StatusDot = ({ pct }) => {
  const color = pct >= 80 ? "#00b894" : pct >= 40 ? "#f39c12" : "#e74c3c";
  return <span className="inline-block w-2.5 h-2.5 rounded-full" style={{ background: color }} />;
};

// ── Progress mini bar (assignment table) ──────────────────────────────────────
const ProgressBar = ({ pct }) => {
  const color = pct >= 100 ? "#00b894" : pct >= 50 ? "#f39c12" : "#6C5CE7";
  const label = pct >= 100 ? "100% Completed" : `${pct}% Utilization`;
  return (
    <div>
      <div className="w-28 h-1.5 rounded-full bg-gray-100 mb-1">
        <div className="h-full rounded-full" style={{ width: `${Math.min(pct, 100)}%`, background: color }} />
      </div>
      <span className="text-[10px]" style={{ color }}>{label}</span>
    </div>
  );
};

// ── Status badge (health card) ────────────────────────────────────────────────
const StatusBadge = ({ status }) => {
  const map = {
    active: { bg: "#D1FAE5", text: "#065F46", label: "ACTIVE" },
    completed: { bg: "#DBEAFE", text: "#1E40AF", label: "COMPLETED" },
    "on-hold": { bg: "#FEF3C7", text: "#92400E", label: "ON HOLD" },
    new: { bg: "#F3F4F6", text: "#374151", label: "NEW" },
  };
  const s = map[(status || "").toLowerCase()] || map.new;
  return (
    <span className="px-2.5 py-0.5 rounded text-[10px] font-bold uppercase"
      style={{ background: s.bg, color: s.text }}>
      {s.label}
    </span>
  );
};

// ── Date formatter ────────────────────────────────────────────────────────────
const fmt = (d) => {
  if (!d) return "";
  const dt = new Date(d);
  return `${String(dt.getDate()).padStart(2, "0")}-${String(dt.getMonth() + 1).padStart(2, "0")}-${dt.getFullYear()}`;
};

// ── Metric chip (health card) ─────────────────────────────────────────────────
const MetricChip = ({ label, value, color }) => (
  <div className="text-center">
    <div className="text-[13px] font-bold" style={{ color }}>{value}</div>
    <div className="text-[10px] text-gray-400">{label}</div>
  </div>
);

// ── Health Card ───────────────────────────────────────────────────────────────
const HealthCard = ({ p }) => {
  const pct = Number(p.completion_pct);
  const col = PCT_COLOR(pct);
  const load = Number(p.total_load);
  const unassigned = Number(load - p.total_assigned);
  const isZero = pct === 0;

  return (
    <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-4 flex flex-col gap-3">
      {/* top row */}
      <div className="flex items-start justify-between gap-2">
        <div>
          <div className="text-[13px] font-bold text-gray-800 leading-tight">{p.project_name}</div>
          <div className="text-[10px] text-gray-400 mt-0.5 uppercase tracking-wide">
            CODE: {p.project_code || "—"}
          </div>
        </div>
        <div className="text-right shrink-0">
          <div className="text-xl font-extrabold" style={{ color: isZero ? "#e74c3c" : col }}>{pct}%</div>
          <div className="text-[9px] text-gray-400 uppercase tracking-wide">COMPLETE</div>
        </div>
      </div>

      {/* progress bar */}
      <div className="h-1 rounded-full bg-gray-100">
        <div className="h-full rounded-full transition-all"
          style={{ width: `${Math.min(pct, 100)}%`, background: isZero ? "#e74c3c" : col }} />
      </div>

      {/* metrics */}
      <div className="flex justify-between">
        <MetricChip label="Effort" value={load} color="#9b59b6" />
        <MetricChip label="Asgn" value={p.total_assigned} color="#3498db" />
        <MetricChip label="Done" value={p.total_completed} color="#00b894" />
        <MetricChip label="Pend" value={p.total_pending} color="#e74c3c" />
        <MetricChip label="Unassg" value={unassigned} color="#e74c3c" />
      </div>

      {/* footer */}
      <div className="flex items-center justify-between pt-2 border-t border-gray-50">
        <StatusBadge status={p.status} />
        {p.start_date && (
          <span className="text-[10px] text-gray-400">
            {fmt(p.start_date)} → {fmt(p.end_date)}
          </span>
        )}
      </div>
    </div>
  );
};

// ── DONUT LEGEND ──────────────────────────────────────────────────────────────
const DONUT_COLORS = ["#f39c12", "#6C5CE7", "#00b894"];
const DONUT_LABELS = ["UI UX Design", "Development", "Testing"];

// ── MAIN COMPONENT ────────────────────────────────────────────────────────────
const UtilizationDashboard = () => {
  const serviceDeliveryEmployees = useSelector(
    (state) => state.auth.serviceDeliveryEmployees
  );

  const [overall, setOverall]   = useState([]);
  const [health, setHealth]     = useState([]);
  const [projects, setProjects] = useState([]);
  const [selProject, setSelProject] = useState("");
  const [tableData, setTableData]   = useState([]);
  const [loading, setLoading]       = useState(true);
  const [search, setSearch]         = useState("");
  const [showAllEmployees, setShowAllEmployees] = useState(false);

  // pagination
  const [currentPage, setCurrentPage] = useState(1);
  const rowsPerPage = 6;

  const fetchAll = useCallback(async () => {
    setLoading(true);
    try {
      const [oRes, hRes, pRes] = await Promise.all([
        axios.get(`${BASE_URL}/api/utilization/overall`,       { headers: getHeaders() }),
        axios.get(`${BASE_URL}/api/utilization/project-health`,{ headers: getHeaders() }),
        axios.get(`${BASE_URL}/api/projects`,                  { headers: getHeaders() }),
      ]);
      setOverall(oRes.data  || []);
      setHealth(hRes.data   || []);
      setProjects(pRes.data || []);
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { fetchAll(); }, [fetchAll]);

  useEffect(() => {
    const fetchTable = async () => {
      try {
        const url = selProject
          ? `${BASE_URL}/api/utilization/by-project?projectId=${selProject}`
          : `${BASE_URL}/api/utilization/by-project`;
        const res = await axios.get(url, { headers: getHeaders() });
        setTableData(res.data || []);
        setCurrentPage(1);
      } catch (err) { console.error(err); }
    };
    fetchTable();
  }, [selProject]);

  // ── derived ─────────────────────────────────────────────────────────────────
  const serviceDeliveryNames = serviceDeliveryEmployees.map(e => e.emp_name);
  const filteredOverall = overall.filter(u => serviceDeliveryNames.includes(u.user_name));

  const totalLoad      = health.reduce((s, p) => s + Number(p.total_load),      0);
  const totalAssigned  = health.reduce((s, p) => s + Number(p.total_assigned),  0);
  const totalCompleted = health.reduce((s, p) => s + Number(p.total_completed), 0);

  const pieData = [
    { name: "UI UX Design", value: Math.round(totalAssigned * 0.10) },
    { name: "Development",  value: Math.round(totalAssigned * 0.70) },
    { name: "Testing",      value: Math.round(totalAssigned * 0.20) },
  ];
  const donutTotal = totalAssigned || 0;

  const overallPct = totalAssigned > 0
    ? Math.round((totalCompleted / totalAssigned) * 100) : 0;

  // employee utilization (top-4 or all)
  const empRows = (showAllEmployees ? filteredOverall : filteredOverall.slice(0, 4)).map(u => ({
    name: u.user_name.replace(/^(Mr\.|Ms\.|Mrs\.)\s*/i, ""),
    role: u.role || "—",
    pct:  Number(u.utilization_pct) || 0,
  }));

  // assignment table with search + pagination
  const filtered = tableData.filter(r => {
    const q = search.toLowerCase();
    return !q || r.user_name?.toLowerCase().includes(q) || r.project_name?.toLowerCase().includes(q);
  });
  const totalPages  = Math.ceil(filtered.length / rowsPerPage);
  const currentRows = filtered.slice((currentPage - 1) * rowsPerPage, currentPage * rowsPerPage);

  const pageNums = Array.from({ length: Math.min(totalPages, 3) }, (_, i) => i + 1);

  if (loading) return (
    <div className="flex items-center justify-center h-64 text-gray-400">
      <div className="text-center">
        <div className="animate-spin w-8 h-8 border-4 border-purple-200 border-t-purple-600 rounded-full mx-auto mb-3" />
        Loading dashboard…
      </div>
    </div>
  );

  return (
    <div className="p-6 bg-gray-50 min-h-full font-sans">

      {/* ── Title ── */}
      <div className="mb-5">
        <h2 className="text-xl font-extrabold text-gray-800">Utilization Dashboard</h2>
        <p className="text-sm text-gray-400 mt-0.5">Monitor resource allocation, project efforts, and completion status.</p>
      </div>

      {/* ── KPI Strip ── */}
      <div className="flex gap-3 flex-wrap mb-6">
        <KpiCard icon="👥" label="Employees"    value={serviceDeliveryEmployees.length} accent="#6C5CE7" />
        <KpiCard icon="⏱" label="Effort (Hrs)"  value={totalLoad}      accent="#f39c12" />
        <KpiCard icon="📋" label="Assigned"      value={totalAssigned}  accent="#3498db" />
        <KpiCard icon="✅" label="Completed"     value={totalCompleted} accent="#00b894" />
        <KpiCard icon="📊" label="Overall Comp." value={`${overallPct}%`} accent="#e74c3c" sub />
      </div>

      {/* ── Middle row: Employee Utilization + Work Distribution ── */}
      <div className="flex gap-4 mb-5 flex-wrap">

        {/* Employee Utilization */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 flex-1 min-w-[340px]">
          <div className="flex items-center justify-between px-5 pt-4 pb-2">
            <div>
              <div className="text-[13px] font-bold text-gray-700">Employee Utilization</div>
              <div className="text-[11px] text-gray-400">Capacity and current load across teams</div>
            </div>
            <button className="text-gray-400 hover:text-gray-600">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="18" x2="21" y2="18"/>
              </svg>
            </button>
          </div>

          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-50">
                {["EMPLOYEE","ROLE","UTILIZATION","STATUS"].map(h => (
                  <th key={h} className="px-5 py-2 text-left text-[10px] font-bold text-gray-400 uppercase tracking-wider">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {empRows.length === 0 ? (
                <tr><td colSpan={4} className="px-5 py-6 text-center text-gray-300 text-sm">No data</td></tr>
              ) : empRows.map((r, i) => (
                <tr key={i} className="border-b border-gray-50 last:border-0">
                  <td className="px-5 py-3 font-semibold text-gray-700 text-[13px]">{r.name}</td>
                  <td className="px-5 py-3"><RolePill role={r.role} /></td>
                  <td className="px-5 py-3 min-w-[140px]"><UtilBar pct={r.pct} /></td>
                  <td className="px-5 py-3"><StatusDot pct={r.pct} /></td>
                </tr>
              ))}
            </tbody>
          </table>

          <div className="px-5 py-3 text-right">
            <button
              onClick={() => setShowAllEmployees(prev => !prev)}
              className="text-[12px] font-semibold text-purple-600 hover:text-purple-800 transition-colors"
            >
              {showAllEmployees
                ? "Show less"
                : `View all ${serviceDeliveryEmployees.length} employees`}
            </button>
          </div>
        </div>

        {/* Work Distribution Donut */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 w-64 px-5 py-4 shrink-0">
          <div className="text-[13px] font-bold text-gray-700 mb-3">Work Distribution</div>
          <ResponsiveContainer width="100%" height={180}>
            <PieChart>
              <Pie
                data={pieData}
                cx="50%" cy="50%"
                innerRadius={58} outerRadius={82}
                dataKey="value"
                strokeWidth={2}
              >
                {pieData.map((_, i) => (
                  <Cell key={i} fill={DONUT_COLORS[i]} />
                ))}
              </Pie>
              <Tooltip formatter={(v) => [v, "units"]} contentStyle={{ fontSize: "12px", borderRadius: "8px" }} />
              <text x="50%" y="50%" textAnchor="middle" dominantBaseline="middle">
                <tspan x="50%" dy="-6" fontSize="20" fontWeight="800" fill="#2d3436">{donutTotal}</tspan>
                <tspan x="50%" dy="18" fontSize="11" fill="#aaa">Units</tspan>
              </text>
            </PieChart>
          </ResponsiveContainer>
          <div className="flex flex-col gap-1.5 mt-2">
            {DONUT_LABELS.map((l, i) => (
              <div key={l} className="flex items-center justify-between text-[11px]">
                <div className="flex items-center gap-1.5">
                  <span className="inline-block w-2 h-2 rounded-full" style={{ background: DONUT_COLORS[i] }} />
                  <span className="text-gray-600">{l}</span>
                </div>
                <span className="font-semibold text-gray-500">
                  {donutTotal > 0 ? Math.round((pieData[i].value / donutTotal) * 100) : 0}%
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── Assignment Overview ── */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 mb-5">
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-50">
          <h3 className="text-[14px] font-bold text-gray-800">Assignment Overview</h3>
          <div className="flex items-center gap-3">
            {/* search */}
            <div className="flex items-center gap-2 border border-gray-200 rounded-lg px-3 py-1.5 bg-gray-50">
              <svg className="w-3.5 h-3.5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
              </svg>
              <input
                type="text"
                placeholder="Search user or project..."
                value={search}
                onChange={e => { setSearch(e.target.value); setCurrentPage(1); }}
                className="text-[12px] outline-none bg-transparent w-44 text-gray-600 placeholder-gray-400"
              />
            </div>
            {/* project filter */}
            <select
              value={selProject}
              onChange={e => setSelProject(e.target.value)}
              className="border border-gray-200 rounded-lg px-3 py-1.5 text-[12px] text-gray-600 bg-white cursor-pointer outline-none"
            >
              <option value="">Filters</option>
              {projects.map(p => (
                <option key={p.id} value={p.id}>{p.project_name || p.name}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-50">
                {["USER","PROJECT","ROLE","TASK","ASSIGNED","COMPLETED","PENDING","PROGRESS"].map(h => (
                  <th key={h} className="px-4 py-3 text-left text-[10px] font-bold text-gray-400 uppercase tracking-wider whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {currentRows.length === 0 ? (
                <tr><td colSpan={8} className="px-4 py-8 text-center text-gray-300">No data available</td></tr>
              ) : currentRows.map((r, i) => {
                const pct = r.units_assigned > 0
                  ? Math.round((r.units_completed / r.units_assigned) * 100) : 0;
                return (
                  <tr key={i} className="border-b border-gray-50 hover:bg-gray-50/50 transition-colors">
                    <td className="px-4 py-3 font-semibold text-gray-700 text-[12px] whitespace-nowrap">{r.user_name}</td>
                    <td className="px-4 py-3 text-gray-500 text-[12px] max-w-[180px]">
                      <div className="truncate">{r.project_name}</div>
                    </td>
                    <td className="px-4 py-3"><RolePill role={r.role} /></td>
                    <td className="px-4 py-3 text-gray-500 text-[12px]">{r.task_name}</td>
                    <td className="px-4 py-3 text-center font-bold text-blue-600">{r.units_assigned}</td>
                    <td className="px-4 py-3 text-center font-bold text-emerald-500">{r.units_completed}</td>
                    <td className="px-4 py-3 text-center font-bold"
                      style={{ color: Number(r.units_pending) > 0 ? "#e74c3c" : "#00b894" }}>
                      {r.units_pending}
                    </td>
                    <td className="px-4 py-3 min-w-[130px]"><ProgressBar pct={pct} /></td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="flex items-center justify-between px-5 py-3 border-t border-gray-50">
          <span className="text-[11px] text-gray-400">
            Showing {filtered.length === 0 ? 0 : (currentPage - 1) * rowsPerPage + 1} to {Math.min(currentPage * rowsPerPage, filtered.length)} of {filtered.length} entries
          </span>
          <div className="flex items-center gap-1">
            <button
              onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="w-7 h-7 flex items-center justify-center rounded border border-gray-200 text-gray-500 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed text-xs"
            >‹</button>
            {pageNums.map(n => (
              <button key={n}
                onClick={() => setCurrentPage(n)}
                className={`w-7 h-7 flex items-center justify-center rounded text-[12px] font-semibold border transition-colors
                  ${currentPage === n
                    ? "bg-purple-600 text-white border-purple-600"
                    : "border-gray-200 text-gray-500 hover:bg-gray-50"}`}
              >{n}</button>
            ))}
            {totalPages > 3 && <span className="text-gray-400 text-xs px-1">…</span>}
            <button
              onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages || totalPages === 0}
              className="w-7 h-7 flex items-center justify-center rounded border border-gray-200 text-gray-500 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed text-xs"
            >›</button>
          </div>
        </div>
      </div>

      {/* ── Project Health Overview ── */}
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-[14px] font-bold text-gray-800">Project Health Overview</h3>
        <button className="text-[12px] font-semibold text-purple-600 hover:text-purple-800 transition-colors">View All</button>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 pb-4">
        {health.map(p => <HealthCard key={p.project_id} p={p} />)}
      </div>

    </div>
  );
};

export default UtilizationDashboard;
