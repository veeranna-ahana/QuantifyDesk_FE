import React, { useEffect, useState, useCallback } from "react";
import axios from "axios";
import { useSelector } from "react-redux";
import SearchableSelect from "../component/SearchableSelect";
import { DownloadOutlined, FileExcelOutlined } from "@ant-design/icons";
import {
  PieChart, Pie, Cell, Tooltip, ResponsiveContainer,
  RadialBarChart, RadialBar
} from "recharts";
import { Icon } from '@iconify/react';

const BASE_URL = import.meta.env.VITE_API_BASE_URL;
const getHeaders = () => ({
  Authorization: `Bearer ${localStorage.getItem("token") || ""}`,
});

const exportEmployeeProjectUnitExcel = async (projectId, empId) => {
  try {
    const res = await axios.get(
      `${BASE_URL}/api/utilization/export/employee-project-unit?projectId=${projectId}&empId=${empId}`,
      {
        headers: getHeaders(),
        responseType: "blob",
      }
    );
    const url = window.URL.createObjectURL(new Blob([res.data]));
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", "Employee_Utilization_Project.xlsx");
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.URL.revokeObjectURL(url);
  } catch (err) {
    console.error("Export error:", err);
  }
};

const exportEmployeeOverallUnitExcel = async (empId) => {
  try {
    const res = await axios.get(
      `${BASE_URL}/api/utilization/export/employee-overall-unit?empId=${empId}`,
      {
        headers: getHeaders(),
        responseType: "blob",
      }
    );
    const url = window.URL.createObjectURL(new Blob([res.data]));
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", "Employee_Overall_Utilization.xlsx");
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.URL.revokeObjectURL(url);
  } catch (err) {
    console.error("Export error:", err);
  }
};

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
    style={{ border: "1px solid #f0f0f0", borderLeft: `4px solid ${accent}` }}>
    <div className="px-4 py-4">
      <div className="flex items-center gap-2.5 mb-3">
        <div className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0 text-base"
          style={{ background: '#856BFF1A' }}>
          <Icon icon={icon} width="22" height="22" color="#856BFF" />
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
  Dev: { bg: "#E0F2FE", text: "#0369A1" },
  QA: { bg: "#FEF9C3", text: "#A16207" },
  Analyst: { bg: "#E0FDF4", text: "#065F46" },
  BA: { bg: "#FAE8FF", text: "#86198F" },
  Tester: { bg: "#FFF7ED", text: "#C2410C" },
  TL: { bg: "#EFF6FF", text: "#1D4ED8" },
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
const UtilBar = ({ pct, totalUnits = 0, utilizedUnits = 0, employeeName = "" }) => {
  const color = pct >= 80 ? "#6C5CE7" : pct >= 40 ? "#6C5CE7" : "#6C5CE7";
  const bg = "#E8E6FF";
  
  // Calculate actual percentage from units to ensure consistency
  const actualPct = totalUnits > 0 ? Math.round((utilizedUnits / totalUnits) * 100) : 0;
  const displayPct = pct || actualPct;
  
  return (
    <div className="flex items-center gap-2 group relative">
      <div className="flex-1 h-1.5 rounded-full" style={{ background: bg }}>
        <div className="h-full rounded-full transition-all duration-500"
          style={{ width: `${Math.min(displayPct, 100)}%`, background: color }} />
      </div>
      <span className="text-[11px] font-semibold text-gray-500 w-8">{displayPct}%</span>
      
      {/* Tooltip - show only if we have data */}
      {totalUnits > 0 && (
        <div className="absolute bottom-full left-0 mb-2 px-3 py-2 bg-gray-800 text-white text-xs rounded-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 whitespace-nowrap z-10 shadow-lg pointer-events-none">
          <div className="font-medium">{utilizedUnits} / {totalUnits} units utilized</div>
          <div className="text-gray-300 text-[10px] mt-0.5">{displayPct}% completion</div>
          <div className="absolute -bottom-1 left-4 w-2 h-2 bg-gray-800 rotate-45"></div>
        </div>
      )}
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
// ── Status badge (health card) ────────────────────────────────────────────────
const StatusBadge = ({ status }) => {
  const map = {
    active: { bg: "#D1FAE5", text: "#065F46", label: "ACTIVE" },
    "in progress": { bg: "#DBEAFE", text: "#1E40AF", label: "IN PROGRESS" },
    completed: { bg: "#DBEAFE", text: "#1E40AF", label: "COMPLETED" },
    "on hold": { bg: "#FEF3C7", text: "#92400E", label: "HOLD" },
    new: { bg: "#F3F4F6", text: "#374151", label: "NEW" },
    "not started": { bg: "#F3F4F6", text: "#6B7280", label: "NOT STARTED" },
    abandoned: { bg: "#FEE2E2", text: "#DC2626", label: "ABANDONED" },
    cr: { bg: "#FEF3C7", text: "#D97706", label: "CR" },
    "new cr": { bg: "#FEF3C7", text: "#D97706", label: "NEW CR" },
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
  <div className="flex-1 rounded-lg py-2 text-center" style={{ background: `${color}14` }}>
    <div className="text-[13px] font-bold" style={{ color }}>{value}</div>
    <div className="text-[10px] text-gray-400 mt-0.5">{label}</div>
  </div>
);

// ── Health card top-border accents (cycled by card index) ────────────────────
const HEALTH_ACCENTS = ["#BA1A1A", "#006C49", "#856BFF", "#653E00"];

const HealthCard = ({ p, index = 0 }) => {
  const pct = Number(p.completion_pct);
  const col = PCT_COLOR(pct);
  const load = Number(p.total_load);
  const unassigned = Number(load - p.total_assigned);
  const isZero = pct === 0;
  const topAccent = HEALTH_ACCENTS[index % HEALTH_ACCENTS.length];

  return (
    <div
      className="bg-white rounded-xl border border-gray-100 shadow-sm p-4 flex flex-col gap-3"
      style={{ borderTop: `4px solid ${topAccent}` }}
    >
      <div className="flex items-start justify-between gap-2">
        <div>
          <div className="text-[13px] font-bold text-gray-800 leading-tight">{p.project_name}</div>
          {/* <div className="text-[10px] text-gray-400 mt-0.5 uppercase tracking-wide">
            CODE: {p.project_code || "—"}
          </div> */}
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
      <div className="flex gap-1.5">
        <MetricChip label="Effort" value={load} color="#856BFF" />
        <MetricChip label="Assigned" value={p.total_assigned} color="#856BFF" />
        <MetricChip label="Done" value={p.total_completed} color="#856BFF" />
        <MetricChip label="Pending" value={p.total_pending} color="#856BFF" />
        <MetricChip label="Unasgined" value={unassigned} color="#BA1A1A" />
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
const DONUT_COLORS = [
  "#f39c12", // Orange
  "#6C5CE7", // Purple
  "#00b894", // Green
  "#e74c3c", // Red
  "#3498db", // Blue
  "#e67e22", // Dark Orange
  "#1abc9c", // Teal
  "#e84393", // Pink
  "#fd79a8", // Light Pink
];
// const DONUT_LABELS = ["UI UX Design", "Development", "Testing"];

// ── Circular progress ring ────────────────────────────────────────────────────
const CircleProgress = ({ pct, size = 80, stroke = 7, color = "#6C5CE7" }) => {
  const r = (size - stroke) / 2;
  const circ = 2 * Math.PI * r;
  const offset = circ - (pct / 100) * circ;
  return (
    <svg width={size} height={size}>
      <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="#E8E6FF" strokeWidth={stroke} />
      <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke={color}
        strokeWidth={stroke} strokeDasharray={circ} strokeDashoffset={offset}
        strokeLinecap="round" style={{ transform: "rotate(-90deg)", transformOrigin: "50% 50%", transition: "stroke-dashoffset 0.6s ease" }} />
      <text x="50%" y="50%" textAnchor="middle" dominantBaseline="middle" fontSize="15" fontWeight="800" fill={color}>{pct}%</text>
    </svg>
  );
};

// ── MAIN COMPONENT ────────────────────────────────────────────────────────────
const UtilizationDashboard = () => {
  const serviceDeliveryEmployees = useSelector(
    (state) => state.auth.serviceDeliveryEmployees
  );

  const [activeTab, setActiveTab] = useState("overview"); // overview | unit

  const [overall, setOverall] = useState([]);
  const [health, setHealth] = useState([]);
  const [projects, setProjects] = useState([]);
  const [selProject, setSelProject] = useState("");
  const [selEmployee, setSelEmployee] = useState("");
  const [tableData, setTableData] = useState([]);
  const [pieData, setPieData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [showAllEmployees, setShowAllEmployees] = useState(false);
 

  // ── Project Health filter state ────────────────────────────────────────────
  const [healthSearch, setHealthSearch] = useState("");
  const [healthStatusFilter, setHealthStatusFilter] = useState("");
  const [showAllHealth, setShowAllHealth] = useState(false);
  const HEALTH_PAGE_SIZE = 6;

  // pagination
  const [currentPage, setCurrentPage] = useState(1);
  const rowsPerPage = 6;

  // ── Unit Utilization state ─────────────────────────────────────────────────
  const [unitProject, setUnitProject] = useState("");
  const [unitEmployee, setUnitEmployee] = useState("");
  const [unitProjectSummary, setUnitProjectSummary] = useState(null);
  const [unitEmpData, setUnitEmpData] = useState(null);
  const [unitLoading, setUnitLoading] = useState(false);
  const [unitAllTasks, setUnitAllTasks] = useState([]);  // all tasks for emp across all projects

  const fetchAll = useCallback(async () => {
    setLoading(true);
    try {
      const [oRes, hRes, pRes] = await Promise.all([
        axios.get(`${BASE_URL}/api/utilization/overall`, { headers: getHeaders() }),
        axios.get(`${BASE_URL}/api/utilization/project-health`, { headers: getHeaders() }),
        axios.get(`${BASE_URL}/api/projects`, { headers: getHeaders() }),
      ]);
      setOverall(oRes.data || []);
      setHealth(hRes.data || []);
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

  // Calculate pie chart data from tableData using role as category
useEffect(() => {
  if (tableData.length === 0) {
    setPieData([]);
    return;
  }
  
  const categoryMap = {};
  tableData.forEach(row => {
    // role IS the work category - use it directly
    const category = row.role || 'Uncategorized';
    const units = Number(row.units_assigned) || 0;
    categoryMap[category] = (categoryMap[category] || 0) + units;
  });
  
  const newPieData = Object.entries(categoryMap)
    .filter(([_, value]) => value > 0)
    .sort((a, b) => b[1] - a[1])
    .map(([name, value]) => ({ name, value }));
  
  setPieData(newPieData);
}, [tableData]);

  // ── Fetch project unit summary when unitProject changes ────────────────────
  useEffect(() => {
    if (!unitProject) { setUnitProjectSummary(null); return; }
    const fetchUnitProject = async () => {
      try {
        const res = await axios.get(
          `${BASE_URL}/api/utilization/project-unit-summary?projectId=${unitProject}`,
          { headers: getHeaders() }
        );
        setUnitProjectSummary((res.data || [])[0] || null);
      } catch (err) { console.error(err); }
    };
    fetchUnitProject();
  }, [unitProject]);

  // ── Fetch employee unit summary when employee or project changes ───────────
  useEffect(() => {
    if (!unitEmployee) { setUnitEmpData(null); return; }
    const fetchUnitEmp = async () => {
      setUnitLoading(true);
      setUnitEmpData(null);
      try {
        const params = new URLSearchParams({ empId: unitEmployee });
        if (unitProject) params.set("projectId", unitProject);
        const res = await axios.get(
          `${BASE_URL}/api/utilization/employee-unit-summary?${params}`,
          { headers: getHeaders() }
        );
        setUnitEmpData(res.data || null);
      } catch (err) {
        console.error("❌ employee-unit-summary fetch failed:", err);
        setUnitEmpData(null);
      } finally { setUnitLoading(false); }
    };
    fetchUnitEmp();
  }, [unitEmployee, unitProject]);

  // ── Fetch ALL tasks for employee across all projects (no projectId filter) ──
  useEffect(() => {
    if (!unitEmployee) { setUnitAllTasks([]); return; }
    const fetchAllTasks = async () => {
      try {
        const res = await axios.get(
          `${BASE_URL}/api/utilization/employee-unit-summary?empId=${unitEmployee}`,
          { headers: getHeaders() }
        );
        setUnitAllTasks(res.data?.task_breakdown || []);
      } catch (err) { setUnitAllTasks([]); }
    };
    fetchAllTasks();
  }, [unitEmployee]);

  // ── derived ─────────────────────────────────────────────────────────────────
  const serviceDeliveryNames = serviceDeliveryEmployees.map(e => e.emp_name);
  const filteredOverall = overall.filter(u => serviceDeliveryNames.includes(u.user_name));

  const totalLoad = health.reduce((s, p) => s + Number(p.total_load), 0);
  const totalAssigned = health.reduce((s, p) => s + Number(p.total_assigned), 0);
  const totalCompleted = health.reduce((s, p) => s + Number(p.total_completed), 0);

  // const pieData = [
  //   { name: "UI UX Design", value: Math.round(totalAssigned * 0.10) },
  //   { name: "Development", value: Math.round(totalAssigned * 0.70) },
  //   { name: "Testing", value: Math.round(totalAssigned * 0.20) },
  // ];
  const donutTotal = totalAssigned || 0;

  const overallPct = totalAssigned > 0
    ? Math.round((totalCompleted / totalAssigned) * 100) : 0;

 
// employee utilization - show ALL service delivery employees
const empRows = (showAllEmployees ? serviceDeliveryEmployees : serviceDeliveryEmployees.slice(0, 5)).map(emp => {
  // Get all assignments for this employee from tableData
  const empAssignments = tableData.filter(row => row.user_name === emp.emp_name);
  
  // Calculate totals from assignments
  const totalUnits = empAssignments.reduce((sum, row) => sum + Number(row.units_assigned || 0), 0);
  const utilizedUnits = empAssignments.reduce((sum, row) => sum + Number(row.units_completed || 0), 0);
  
  // Calculate percentage from actual data
  const actualPct = totalUnits > 0 ? Math.round((utilizedUnits / totalUnits) * 100) : 0;
  
  return {
    name: emp.emp_name.replace(/^(Mr\.|Ms\.|Mrs\.)\s*/i, ""),
    fullName: emp.emp_name,
    role: emp.role || "—",
    pct: actualPct,
    totalUnits: totalUnits,
    utilizedUnits: utilizedUnits,
  };
});

  // unique employee names for filter dropdown
  const employeeOptions = [...new Set(tableData.map(r => r.user_name).filter(Boolean))].sort();

  // assignment table with search + employee filter + pagination
  const filtered = tableData.filter(r => {
    const q = search.toLowerCase();
    const matchesSearch = !q || r.user_name?.toLowerCase().includes(q) || r.project_name?.toLowerCase().includes(q);
    const matchesEmployee = !selEmployee || r.user_name === selEmployee;
    return matchesSearch && matchesEmployee;
  });
  const totalPages = Math.ceil(filtered.length / rowsPerPage);
  const currentRows = filtered.slice((currentPage - 1) * rowsPerPage, currentPage * rowsPerPage);

  const pageNums = Array.from({ length: Math.min(totalPages, 3) }, (_, i) => i + 1);

  if (loading) return (
    <div className="flex items-center justify-center h-64 text-gray-400">
      <div className="text-center">
        <div className="animate-spin w-8 h-8 border-4 border-purple-200 border-t-[#856BFF] rounded-full mx-auto mb-3" />
        Loading dashboard…
      </div>
    </div>
  );

  // ── Unit Utilization derived ───────────────────────────────────────────────
  const unitEmpProjectSummary = unitEmpData?.project_summary?.[0] || null;
  const unitEmpOverall = unitEmpData?.overall_summary || {};
  const unitEmpTasks = unitEmpData?.task_breakdown || [];
  const unitEmpName = unitEmpData?.employee?.emp_name || "";

  return (
    <div className="p-6 bg-gray-50 min-h-full font-sans">

      {/* ── Title + Tab bar ── */}
      <div className="mb-5 flex items-end justify-between flex-wrap gap-3">
        <div>
          <h2 className="text-xl font-extrabold text-gray-800">Utilization Dashboard</h2>
          <p className="text-sm text-gray-400 mt-0.5">Monitor resource allocation, project efforts, and completion status.</p>
        </div>
        <div className="flex gap-1 bg-white border border-gray-200 rounded-xl p-1 shadow-sm">
          {[["overview", "📊 Overview"], ["unit", "🎯 Unit Utilization"]].map(([key, label]) => (
            <button key={key} onClick={() => setActiveTab(key)}
              className={`px-4 py-1.5 rounded-lg text-[13px] font-semibold transition-all flex items-center gap-1.5 ${activeTab === key
                ? "bg-[#856BFF] text-white shadow"
                : "text-gray-500 hover:text-gray-700"
                }`}>
              <Icon icon={key === "overview" ? "material-symbols:dashboard" : "material-symbols:target"}
                width="22" height="22" color={activeTab === key ? "#ffffff" : "#856BFF"} />
              {label.replace(/[^\w\s]/g, '').trim()}
            </button>
          ))}
        </div>
      </div>

      {/* ══════════════════ UNIT UTILIZATION TAB ══════════════════ */}
      {activeTab === "unit" && (
        <div className="space-y-5">

          {/* ── Filters row ── */}
          <div className="bg-white rounded-xl border border-gray-100 shadow-sm px-5 py-4 flex flex-wrap gap-4 items-end">
            <div className="flex flex-col gap-1">
              <label className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">Select Project</label>
              <div className="min-w-[220px]">
                <SearchableSelect
                  value={unitProject}
                  onChange={val => { setUnitProject(val); setUnitEmployee(""); }}
                  placeholder="— Choose a project —"
                  options={projects.map(p => ({ value: String(p.id), label: p.project_name || p.name }))}
                />
              </div>
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">Select Employee</label>
              <div className="min-w-[220px]">
                <SearchableSelect
                  value={unitEmployee}
                  onChange={setUnitEmployee}
                  placeholder="— Choose an employee —"
                  disabled={!unitProject}
                  options={serviceDeliveryEmployees.map(emp => ({
                    value: String(emp.employee_id || emp.emp_id),
                    label: emp.emp_name,
                  }))}
                />
              </div>
            </div>
          </div>

          {/* ── SECTION 1: Project-Level Utilization ── */}
          {unitProjectSummary ? (
            <div className="bg-white rounded-xl border border-gray-100 shadow-sm px-5 py-5">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <div className="text-[15px] font-extrabold text-gray-800">Project-Level Utilization</div>
                  <div className="text-[12px] text-gray-400 mt-0.5">{unitProjectSummary.project_name}</div>
                </div>
                <CircleProgress pct={Number(unitProjectSummary.utilization_pct)} size={76} />
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {[
                  { label: "Total Units", value: Number(unitProjectSummary.total_units), icon: "material-symbols:inventory-2", color: "#6C5CE7" },
                  { label: "Completed Units", value: Number(unitProjectSummary.completed_units), icon: "material-symbols:check-circle", color: "#00b894" },
                  { label: "Pending Units", value: Number(unitProjectSummary.pending_units), icon: "material-symbols:pending", color: "#e74c3c" },
                  { label: "Utilization %", value: `${unitProjectSummary.utilization_pct}%`, icon: "material-symbols:trending-up", color: "#f39c12" },
                ].map(({ label, value, icon, color }) => (
                  <div key={label} className="rounded-xl p-4 flex flex-col gap-1" style={{ background: `${color}10`, border: `1.5px solid ${color}25` }}>
                    <div className="flex items-center gap-2 mb-1">
                      <Icon icon={icon} width="22" height="22" color="#856BFF" />
                      <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">{label}</span>
                    </div>
                    <div className="text-2xl font-extrabold" style={{ color }}>{value}</div>
                  </div>
                ))}
              </div>
            </div>
          ) : unitProject && (
            <div className="bg-white rounded-xl border border-gray-100 shadow-sm px-5 py-8 text-center text-gray-300 text-sm">No data for this project</div>
          )}

          {/* ── SECTION 2: Employee Utilization within Project ── */}
          {unitEmployee && unitProject && (
            <div className="bg-white rounded-xl border border-gray-100 shadow-sm px-5 py-5">
              <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
                <div>
                  <div className="text-[15px] font-extrabold text-gray-800">Employee Utilization — within Project</div>
                  <div className="text-[12px] text-gray-400 mt-0.5">
                    {unitEmpName} · {unitProjectSummary?.project_name || ""}
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => exportEmployeeProjectUnitExcel(unitProject, unitEmployee)}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-[12px] font-semibold transition-all shadow-sm active:scale-95"
                    title="Export Employee Utilization (within Project) to Excel"
                  >
                    <DownloadOutlined />
                    <span>Export Excel</span>
                  </button>
                  {unitEmpProjectSummary && (
                    <CircleProgress pct={Number(unitEmpProjectSummary.employee_utilization_pct)} size={76} color="#00b894" />
                  )}
                </div>
              </div>

              {unitLoading ? (
                <div className="text-center py-6 text-gray-300">Loading…</div>
              ) : unitEmpProjectSummary ? (
                <>
                  <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 mb-3">
                    {[
                      { label: "Total Tasks", value: Number(unitEmpProjectSummary.total_tasks), icon: "material-symbols:task", color: "#6C5CE7" },
                      { label: "Units Assigned", value: Number(unitEmpProjectSummary.total_units_assigned), icon: "material-symbols:assignment", color: "#3498db" },
                      { label: "Completed", value: Number(unitEmpProjectSummary.total_units_completed), icon: "material-symbols:check-circle", color: "#00b894" },
                      { label: "Pending", value: Number(unitEmpProjectSummary.total_units_pending), icon: "material-symbols:pending", color: "#e74c3c" },
                      { label: "Utilization %", value: `${unitEmpProjectSummary.employee_utilization_pct}%`, icon: "material-symbols:trending-up", color: "#f39c12" },
                    ].map(({ label, value, icon, color }) => (
                      <div key={label} className="rounded-xl p-4 flex flex-col gap-1" style={{ background: `${color}10`, border: `1.5px solid ${color}25` }}>
                        <div className="flex items-center gap-1.5 mb-0.5">
                          <Icon icon={icon} width="14" height="14" color="#856BFF" />
                          <span className="text-[9px] font-bold text-gray-400 uppercase tracking-wider">{label}</span>
                        </div>
                        <div className="text-xl font-extrabold" style={{ color }}>{value}</div>
                      </div>
                    ))}
                  </div>

                  {/* Person Days KPI row for within Project */}
                  {(() => {
                    const empObj = serviceDeliveryEmployees.find(
                      e => String(e.employee_id || e.emp_id) === String(unitEmployee)
                    );
                    const empName = empObj?.emp_name || unitEmployee;
                    const empProjectRows = tableData.filter(r => {
                      const matchEmp = r.user_name === empName;
                      const matchProj = String(r.project_id) === String(unitProject) || 
                                        r.project_name === unitProjectSummary?.project_name;
                      return matchEmp && matchProj;
                    });
                    const totalHrsAssigned = empProjectRows.reduce((s, r) => s + Number(r.hours_assigned || 0), 0);
                    const totalHrsUtilized = empProjectRows.reduce((s, r) => s + Number(r.hours_utilized || 0), 0);
                    const totalPD = parseFloat((totalHrsAssigned / 8).toFixed(2));
                    const completedPD = parseFloat((totalHrsUtilized / 8).toFixed(2));
                    const pendingPD = parseFloat(Math.max(totalPD - completedPD, 0).toFixed(2));
                    return (
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-5">
                        {[
                          { label: "Total Person Days", value: totalPD, icon: "📅", color: "#0984e3" },
                          { label: "Completed Person Days", value: completedPD, icon: "✅", color: "#00b894" },
                          { label: "Pending Person Days", value: pendingPD, icon: "⏳", color: "#e74c3c" },
                        ].map(({ label, value, icon, color }) => (
                          <div key={label} className="rounded-xl p-4 flex flex-col gap-1" style={{ background: `${color}10`, border: `1.5px solid ${color}25` }}>
                            <div className="flex items-center gap-1.5 mb-0.5">
                              <span>{icon}</span>
                              <span className="text-[9px] font-bold text-gray-400 uppercase tracking-wider">{label}</span>
                            </div>
                            <div className="text-xl font-extrabold" style={{ color }}>{value}</div>
                          </div>
                        ))}
                      </div>
                    );
                  })()}

                  {/* Task breakdown table with 12 detailed columns */}
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="bg-[#EFF4FF] border-b border-gray-100">
                          {[
                            "Employee Name", "Project Name", "Task Name",
                            "Total Units", "Total Person Days",
                            "Completed Units", "Completed Person Days",
                            "Pending Units", "Pending Person Days",
                            "Unit Utilization (%)", "Person Days Utilization (%)", "Hours Utilization (%)"
                          ].map(h => (
                            <th key={h} className="px-4 py-2.5 text-left text-[10px] font-bold text-gray-400 uppercase tracking-wider whitespace-nowrap">{h}</th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {(() => {
                          const empObj = serviceDeliveryEmployees.find(
                            e => String(e.employee_id || e.emp_id) === String(unitEmployee)
                          );
                          const empName = empObj?.emp_name || unitEmployee;
                          const empProjectRows = tableData.filter(r => {
                            const matchEmp = r.user_name === empName;
                            const matchProj = String(r.project_id) === String(unitProject) || 
                                              r.project_name === unitProjectSummary?.project_name;
                            return matchEmp && matchProj;
                          });

                          const displayRows = empProjectRows.length > 0 
                            ? empProjectRows 
                            : unitEmpTasks.map(t => ({
                                user_name: empName,
                                project_name: unitProjectSummary?.project_name || "—",
                                task_name: t.task_name,
                                units_assigned: t.units_assigned,
                                units_completed: t.units_completed,
                                units_pending: t.units_pending,
                                hours_assigned: 0,
                                hours_utilized: 0
                              }));

                          if (displayRows.length === 0) {
                            return <tr><td colSpan={12} className="py-6 text-center text-gray-300">No tasks found</td></tr>;
                          }

                          return displayRows.map((t, i) => {
                            const assignedUnits = Number(t.units_assigned || 0);
                            const completedUnits = Number(t.units_completed || 0);
                            const pendingUnits = Number(t.units_pending || 0);
                            const assignedHrs = Number(t.hours_assigned || 0);
                            const utilizedHrs = Number(t.hours_utilized || 0);
                            const pendingHrs = Math.max(assignedHrs - utilizedHrs, 0);
                            const totalPD = parseFloat((assignedHrs / 8).toFixed(2));
                            const completedPD = parseFloat((utilizedHrs / 8).toFixed(2));
                            const pendingPD = parseFloat((pendingHrs / 8).toFixed(2));

                            const unitPct = assignedUnits > 0 ? Math.round((completedUnits / assignedUnits) * 100) : 0;
                            const pdPct = totalPD > 0 ? Math.round((completedPD / totalPD) * 100) : 0;
                            const hrsPct = assignedHrs > 0 ? Math.round((utilizedHrs / assignedHrs) * 100) : 0;

                            return (
                              <tr key={i} className="border-b border-gray-50 hover:bg-gray-50/60">
                                <td className="px-4 py-2.5 font-semibold text-gray-700 text-[12px] whitespace-nowrap">{empName}</td>
                                <td className="px-4 py-2.5 text-[12px] text-gray-500">{t.project_name || unitProjectSummary?.project_name || "—"}</td>
                                <td className="px-4 py-2.5 font-semibold text-gray-700 text-[12px]">{t.task_name}</td>
                                <td className="px-4 py-2.5 text-center font-bold text-blue-600">{assignedUnits}</td>
                                <td className="px-4 py-2.5 text-center font-semibold text-slate-700">{totalPD}</td>
                                <td className="px-4 py-2.5 text-center font-bold text-emerald-500">{completedUnits}</td>
                                <td className="px-4 py-2.5 text-center font-semibold text-emerald-400">{completedPD}</td>
                                <td className="px-4 py-2.5 text-center font-bold" style={{ color: pendingUnits > 0 ? "#e74c3c" : "#00b894" }}>{pendingUnits}</td>
                                <td className="px-4 py-2.5 text-center font-semibold" style={{ color: pendingPD > 0 ? "#e74c3c" : "#00b894" }}>{pendingPD}</td>
                                <td className="px-4 py-2.5 text-center">
                                  <span className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-bold ${unitPct >= 100 ? 'bg-emerald-50 text-emerald-600' : unitPct >= 50 ? 'bg-amber-50 text-amber-600' : 'bg-rose-50 text-rose-500'}`}>
                                    {unitPct}%
                                  </span>
                                </td>
                                <td className="px-4 py-2.5 text-center">
                                  <span className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-bold ${pdPct >= 100 ? 'bg-emerald-50 text-emerald-600' : pdPct >= 50 ? 'bg-amber-50 text-amber-600' : 'bg-rose-50 text-rose-500'}`}>
                                    {pdPct}%
                                  </span>
                                </td>
                                <td className="px-4 py-2.5 text-center">
                                  <span className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-bold ${hrsPct >= 100 ? 'bg-emerald-50 text-emerald-600' : hrsPct >= 50 ? 'bg-amber-50 text-amber-600' : 'bg-rose-50 text-rose-500'}`}>
                                    {hrsPct}%
                                  </span>
                                </td>
                              </tr>
                            );
                          });
                        })()}
                      </tbody>
                    </table>
                  </div>
                </>
              ) : (
                <div className="text-center text-gray-300 py-6">No assignment data for this employee in the selected project.</div>
              )}
            </div>
          )}

          {/* ── SECTION 3: Employee Overall Utilization (Across All Projects) ── */}
          {unitEmployee && (
            unitLoading ? (
              <div className="bg-white rounded-xl border border-gray-100 shadow-sm px-5 py-5">
                <div className="text-[13px] font-bold text-gray-700 mb-4">Overall Employee Utilization</div>
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
                  {Array.from({ length: 6 }).map((_, i) => (
                    <div key={i} className="rounded-xl p-4 h-20 animate-pulse bg-gray-100" />
                  ))}
                </div>
              </div>
            ) : unitEmpData ? (
              <div className="bg-white rounded-xl border border-gray-100 shadow-sm px-5 py-5">
                <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
                  <div>
                    <div className="text-[15px] font-extrabold text-gray-800">Overall Employee Utilization</div>
                    <div className="text-[12px] text-gray-400 mt-0.5">
                      {unitEmpName} · Across all projects
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => exportEmployeeOverallUnitExcel(unitEmployee)}
                      className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-[12px] font-semibold transition-all shadow-sm active:scale-95"
                      title="Export Overall Employee Utilization to Excel"
                    >
                      <DownloadOutlined />
                      <span>Export Excel</span>
                    </button>
                    <CircleProgress pct={Number(unitEmpOverall.overall_utilization_pct || 0)} size={76} color="#f39c12" />
                  </div>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 mb-3">
                  {[
                    { label: "Projects", value: Number(unitEmpOverall.total_projects || 0), icon: "material-symbols:project", color: "#6C5CE7" },
                    { label: "Tasks", value: Number(unitEmpOverall.total_tasks || 0), icon: "material-symbols:task", color: "#3498db" },
                    { label: "Units Assigned", value: Number(unitEmpOverall.total_units_assigned || 0), icon: "material-symbols:assignment", color: "#9b59b6" },
                    { label: "Completed", value: Number(unitEmpOverall.total_units_completed || 0), icon: "material-symbols:check-circle", color: "#00b894" },
                    { label: "Pending", value: Number(unitEmpOverall.total_units_pending || 0), icon: "material-symbols:pending", color: "#e74c3c" },
                    { label: "Utilization %", value: `${unitEmpOverall.overall_utilization_pct || 0}%`, icon: "material-symbols:trending-up", color: "#f39c12" },
                  ].map(({ label, value, icon, color }) => (
                    <div key={label} className="rounded-xl p-4 flex flex-col gap-1" style={{ background: `${color}10`, border: `1.5px solid ${color}25` }}>
                      <div className="flex items-center gap-1.5 mb-0.5">
                        <Icon icon={icon} width="14" height="14" color="#856BFF" />
                        <span className="text-[9px] font-bold text-gray-400 uppercase tracking-wider">{label}</span>
                      </div>
                      <div className="text-xl font-extrabold" style={{ color }}>{value}</div>
                    </div>
                  ))}
                </div>

                {/* Person Days KPI row — derived from tableData (has hours fields) */}
                {(() => {
                  const empObj = serviceDeliveryEmployees.find(
                    e => String(e.employee_id || e.emp_id) === String(unitEmployee)
                  );
                  const empName = empObj?.emp_name || unitEmployee;
                  const empRows = tableData.filter(r => r.user_name === empName);
                  const totalHrsAssigned = empRows.reduce((s, r) => s + Number(r.hours_assigned || 0), 0);
                  const totalHrsUtilized = empRows.reduce((s, r) => s + Number(r.hours_utilized || 0), 0);
                  const totalPD = parseFloat((totalHrsAssigned / 8).toFixed(2));
                  const completedPD = parseFloat((totalHrsUtilized / 8).toFixed(2));
                  const pendingPD = parseFloat(Math.max(totalPD - completedPD, 0).toFixed(2));
                  return (
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      {[
                        { label: "Total Person Days", value: totalPD, icon: "material-symbols:calendar-month", color: "#0984e3" },
                        { label: "Completed Person Days", value: completedPD, icon: "material-symbols:check-circle", color: "#00b894" },
                        { label: "Pending Person Days", value: pendingPD, icon: "material-symbols:pending", color: "#e74c3c" },
                      ].map(({ label, value, icon, color }) => (
                        <div key={label} className="rounded-xl p-4 flex flex-col gap-1" style={{ background: `${color}10`, border: `1.5px solid ${color}25` }}>
                          <div className="flex items-center gap-1.5 mb-0.5">
                            <Icon icon={icon} width="14" height="14" color="#856BFF" />
                            <span className="text-[9px] font-bold text-gray-400 uppercase tracking-wider">{label}</span>
                          </div>
                          <div className="text-xl font-extrabold" style={{ color }}>{value}</div>
                        </div>
                      ))}
                    </div>
                  );
                })()}


                {/* All-project task table */}
                <div className="overflow-x-auto mt-5">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="bg-[#EFF4FF] border-b border-gray-100" style={{ backgroundColor: '#EFF4FF' }} >
                        {[
                          "Employee Name", "Project Name", "Task Name",
                          "Total Units", "Total Person Days",
                          "Completed Units", "Completed Person Days",
                          "Pending Units", "Pending Person Days",
                          "Unit Utilization (%)", "Person Days Utilization (%)", "Hours Utilization (%)"
                        ].map(h => (
                          <th key={h} className="px-4 py-2.5 text-left text-[10px] font-bold text-[#434654] uppercase tracking-wider whitespace-nowrap">{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {(() => {
                        // resolve employee name from serviceDeliveryEmployees
                        const empObj = serviceDeliveryEmployees.find(
                          e => String(e.employee_id || e.emp_id) === String(unitEmployee)
                        );
                        const empName = empObj?.emp_name || unitEmployee;
                        // use tableData (by-project endpoint) filtered by this employee — it has hours fields
                        const empRows = tableData.filter(r => r.user_name === empName);
                        if (empRows.length === 0) {
                          return <tr><td colSpan={12} className="py-6 text-center text-gray-300">No tasks found</td></tr>;
                        }
                        return empRows.map((t, i) => {
                          const assignedUnits = Number(t.units_assigned || 0);
                          const completedUnits = Number(t.units_completed || 0);
                          const pendingUnits = Number(t.units_pending || 0);
                          const assignedHrs = Number(t.hours_assigned || 0);
                          const utilizedHrs = Number(t.hours_utilized || 0);
                          const pendingHrs = Math.max(assignedHrs - utilizedHrs, 0);
                          // person days = hours / 8
                          const totalPD = parseFloat((assignedHrs / 8).toFixed(2));
                          const completedPD = parseFloat((utilizedHrs / 8).toFixed(2));
                          const pendingPD = parseFloat((pendingHrs / 8).toFixed(2));
                          // utilization %
                          const unitPct = assignedUnits > 0 ? Math.round((completedUnits / assignedUnits) * 100) : 0;
                          const pdPct = totalPD > 0 ? Math.round((completedPD / totalPD) * 100) : 0;
                          const hrsPct = assignedHrs > 0 ? Math.round((utilizedHrs / assignedHrs) * 100) : 0;
                          return (
                            <tr key={i} className="border-b border-gray-50 hover:bg-gray-50/60">
                              <td className="px-4 py-2.5 font-semibold text-gray-700 text-[12px] whitespace-nowrap">{empName}</td>
                              <td className="px-4 py-2.5 text-[12px] text-gray-500">{t.project_name || "—"}</td>
                              <td className="px-4 py-2.5 font-semibold text-gray-700 text-[12px]">{t.task_name}</td>
                              <td className="px-4 py-2.5 text-center font-bold text-blue-600">{assignedUnits}</td>
                              <td className="px-4 py-2.5 text-center font-semibold text-slate-700">{totalPD}</td>
                              <td className="px-4 py-2.5 text-center font-bold text-emerald-500">{completedUnits}</td>
                              <td className="px-4 py-2.5 text-center font-semibold text-emerald-400">{completedPD}</td>
                              <td className="px-4 py-2.5 text-center font-bold" style={{ color: pendingUnits > 0 ? "#e74c3c" : "#00b894" }}>{pendingUnits}</td>
                              <td className="px-4 py-2.5 text-center font-semibold" style={{ color: pendingPD > 0 ? "#e74c3c" : "#00b894" }}>{pendingPD}</td>
                              <td className="px-4 py-2.5 text-center">
                                <span className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-bold ${unitPct >= 100 ? 'bg-emerald-50 text-emerald-600' : unitPct >= 50 ? 'bg-amber-50 text-amber-600' : 'bg-rose-50 text-rose-500'}`}>
                                  {unitPct}%
                                </span>
                              </td>
                              <td className="px-4 py-2.5 text-center">
                                <span className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-bold ${pdPct >= 100 ? 'bg-emerald-50 text-emerald-600' : pdPct >= 50 ? 'bg-amber-50 text-amber-600' : 'bg-rose-50 text-rose-500'}`}>
                                  {pdPct}%
                                </span>
                              </td>
                              <td className="px-4 py-2.5 text-center">
                                <span className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-bold ${hrsPct >= 100 ? 'bg-emerald-50 text-emerald-600' : hrsPct >= 50 ? 'bg-amber-50 text-amber-600' : 'bg-rose-50 text-rose-500'}`}>
                                  {hrsPct}%
                                </span>
                              </td>
                            </tr>
                          );
                        });
                      })()}
                    </tbody>
                  </table>
                </div>

              </div>
            ) : null
          )}

          {/* Empty state */}
          {!unitProject && (
            <div className="bg-white rounded-xl border border-dashed border-gray-200 shadow-sm px-5 py-16 text-center">
              {/* <Icon icon="material-symbols:target" width="48" height="48" color="#856BFF" /> */}
              <div className="text-[15px] font-bold text-gray-400 mt-3">Select a project to view Unit Utilization</div>
              <div className="text-[12px] text-gray-300 mt-1">Then optionally select an employee for detailed breakdown</div>
            </div>
          )}
        </div>
      )}

      {/* ══════════════════ OVERVIEW TAB ══════════════════ */}
      {activeTab === "overview" && (<>

        {/* ── KPI Strip ── */}
<div className="flex gap-3 flex-wrap mb-6">
  <KpiCard icon="material-symbols:group" label="Employees" value={serviceDeliveryEmployees.length} accent="#856BFF" />
  <KpiCard icon="material-symbols:timer" label="Effort (Hrs)" value={totalLoad} accent="#006C49" />
  <KpiCard icon="material-symbols:assignment" label="Assigned" value={totalAssigned} accent="#784B00" />
  <KpiCard icon="material-symbols:check-circle" label="Completed" value={totalCompleted} accent="#00714D" />
  <KpiCard icon="material-symbols:trending-up" label="Overall Comp." value={`${overallPct}%`} accent="#BA1A1A" sub />
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
                <Icon icon="material-symbols:more-horiz" width="22" height="22" color="#856BFF" />
              </button>
            </div>

            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-50" style={{ backgroundColor: '#EFF4FF' }}>
                  {["EMPLOYEE", "ROLE", "UTILIZATION", "STATUS"].map(h => (
                    <th key={h} className="px-5 py-2 text-left text-[10px] font-bold text-[#434654] uppercase tracking-wider">{h}</th>
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
                    <td className="px-5 py-3 min-w-[140px]">
                      <UtilBar
                        pct={r.pct}
                        totalUnits={r.totalUnits}
                        utilizedUnits={r.utilizedUnits}
                      />
                    </td>
                    <td className="px-5 py-3"><StatusDot pct={r.pct} /></td>
                  </tr>
                ))}
              </tbody>
            </table>

            <div className="px-5 py-3 text-right">
              <button
                onClick={() => setShowAllEmployees(prev => !prev)}
                className="text-[12px] font-semibold text-[#856BFF] hover:text-purple-800 transition-colors"
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
  {pieData.length > 0 ? (
    <>
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
              <Cell key={i} fill={DONUT_COLORS[i % DONUT_COLORS.length]} />
            ))}
          </Pie>
          <Tooltip 
  formatter={(value, name, props) => {
    const total = pieData.reduce((sum, item) => sum + item.value, 0);
    const percentage = total > 0 ? Math.round((value / total) * 100) : 0;
    return [`${value} units (${percentage}%)`, props.payload.name];
  }}
  contentStyle={{ fontSize: "12px", borderRadius: "8px" }}
/>
          <text x="50%" y="50%" textAnchor="middle" dominantBaseline="middle">
            <tspan x="50%" dy="-6" fontSize="20" fontWeight="800" fill="#2d3436">
              {pieData.reduce((sum, item) => sum + item.value, 0)}
            </tspan>
            <tspan x="50%" dy="18" fontSize="11" fill="#aaa">Units</tspan>
          </text>
        </PieChart>
      </ResponsiveContainer>
      <div className="flex flex-col gap-1.5 mt-2">
        {pieData.map((item, i) => {
          const total = pieData.reduce((sum, d) => sum + d.value, 0);
          const percentage = total > 0 ? Math.round((item.value / total) * 100) : 0;
          return (
            <div key={item.name} className="flex items-center justify-between text-[11px]">
              <div className="flex items-center gap-1.5">
                <span className="inline-block w-2 h-2 rounded-full" 
                      style={{ background: DONUT_COLORS[i % DONUT_COLORS.length] }} />
                <span className="text-gray-600">{item.name}</span>
              </div>
              <span className="font-semibold text-gray-500">{percentage}%</span>
            </div>
          );
        })}
      </div>
    </>
  ) : (
    <div className="text-center text-gray-400 py-8">No work distribution data</div>
  )}
</div>
        </div>

        {/* ── Assignment Overview ── */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 mb-5">
          <div className="flex items-center justify-between px-5 py-4 border-b border-gray-50">
            <h3 className="text-[14px] font-bold text-gray-800">Assignment Overview</h3>
            <div className="flex items-center gap-2 flex-wrap">
              {/* search */}
              <div className="min-w-[180px]">
                <div className="flex items-center gap-2 border border-gray-200 rounded-lg px-3 py-1.5 h-[38px]">
                  <Icon icon="material-symbols:search" width="16" height="16" color="#856BFF" />
                  <input
                    type="text"
                    placeholder="Search user or project..."
                    value={search}
                    onChange={(e) => {
                      setSearch(e.target.value);
                      setCurrentPage(1);
                    }}
                    className="w-full bg-transparent border-0 outline-none ring-0 shadow-none focus:border-0 focus:outline-none focus:ring-0 focus:shadow-none text-[13px] text-gray-600 placeholder-gray-400"
                    style={{ outline: 'none', border: 'none', boxShadow: 'none', WebkitAppearance: 'none' }}
                  />
                </div>
              </div>
              {/* employee filter */}
              <div className="min-w-[180px]">
                <SearchableSelect
                  value={selEmployee}
                  onChange={val => { setSelEmployee(val); setCurrentPage(1); }}
                  placeholder="All Employees"
                  options={employeeOptions.map(name => ({ value: name, label: name }))}
                />
              </div>
              {/* project filter */}
              <div className="min-w-[180px]">
                <SearchableSelect
                  value={selProject}
                  onChange={val => { setSelProject(val); setCurrentPage(1); }}
                  placeholder="All Projects"
                  options={projects.map(p => ({
                    value: String(p.id),
                    label: p.project_name || p.name,
                  }))}
                />
              </div>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-50" style={{ backgroundColor: '#EFF4FF' }}>
                  {["USER", "PROJECT", "ROLE", "TASK", "ASSIGNED", "COMPLETED", "PENDING", "ASSIGNED HRS", "ACTUAL HRS", "PROGRESS"].map(h => (
                    <th key={h} className="px-4 py-3 text-left text-[10px] font-bold text-[#434654] uppercase tracking-wider whitespace-nowrap">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {currentRows.length === 0 ? (
                  <tr><td colSpan={10} className="px-4 py-8 text-center text-gray-300">No data available</td></tr>
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
                      <td className="px-4 py-3 text-center font-semibold text-indigo-600 whitespace-nowrap">
                        {r.hours_assigned != null ? `${Number(r.hours_assigned).toLocaleString()} h` : "—"}
                      </td>
                      <td className="px-4 py-3 text-center font-semibold text-violet-600 whitespace-nowrap">
                        {r.hours_utilized != null ? `${Number(r.hours_utilized).toLocaleString()} h` : "—"}
                      </td>
                      <td className="px-4 py-3 min-w-[130px]"><ProgressBar pct={pct} /></td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          <div className="flex items-center justify-between px-5 py-3 border-t border-gray-50" style={{ backgroundColor: '#EFF4FF' }}>
            <span className="text-[11px] text-[#434654]">
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
                      ? "bg-[#856BFF] text-white border-[#856BFF]"
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
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 mb-5">
          {/* Header + filters */}
          <div className="flex flex-wrap items-center justify-between gap-3 px-5 py-4 border-b border-gray-50">
            <div>
              <h3 className="text-[14px] font-bold text-gray-800">Project Health Overview</h3>
              <p className="text-[11px] text-gray-400 mt-0.5">
                {health.length} project{health.length !== 1 ? "s" : ""} total
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              {/* Search */}
              <div className="flex items-center gap-2 border border-gray-200 rounded-lg px-3 py-1.5">
                <Icon icon="material-symbols:search" width="14" height="14" color="#856BFF" />
                <input
                  type="text"
                  placeholder="Search project..."
                  value={healthSearch}
                  onChange={e => { setHealthSearch(e.target.value); setShowAllHealth(false); }}
                  className="w-36 bg-transparent border-0 outline-none ring-0 shadow-none focus:border-0 focus:outline-none focus:ring-0 text-[12px] text-gray-600 placeholder-gray-400"
                  style={{ outline: 'none', border: 'none', boxShadow: 'none' }}
                />
              </div>
              {/* Status filter */}
             <select
  value={healthStatusFilter}
  onChange={e => { setHealthStatusFilter(e.target.value); setShowAllHealth(false); }}
  className="border border-gray-200 rounded-lg px-3 py-1.5 text-[12px] text-gray-600 bg-white outline-none cursor-pointer hover:border-purple-400 transition-colors"
  style={{ outline: 'none', boxShadow: 'none' }}
>
  <option value="">All Statuses</option>
  <option value="Active">Active</option>
  <option value="On Hold">Hold</option>
  <option value="Completed">Completed</option>
  <option value="New">New</option>
  
</select>
              {/* Clear */}
              {(healthSearch || healthStatusFilter) && (
                <button
                  onClick={() => { setHealthSearch(""); setHealthStatusFilter(""); setShowAllHealth(false); }}
                  className="text-[11px] text-gray-400 hover:text-red-500 transition-colors px-2 py-1 rounded border border-dashed border-gray-200 hover:border-red-300"
                >
                  ✕ Clear
                </button>
              )}
            </div>
          </div>

          {/* Cards grid */}
          {(() => {
            const filteredHealth = health.filter(p => {
    const q = healthSearch.toLowerCase();
    const matchName = !q || p.project_name?.toLowerCase().includes(q) || p.project_code?.toLowerCase().includes(q);
    // ✅ Fix: lowercase both values for comparison
    const matchStatus = !healthStatusFilter || (p.status || "").toLowerCase() === healthStatusFilter.toLowerCase();
    return matchName && matchStatus;
  });
  const visibleHealth = showAllHealth ? filteredHealth : filteredHealth.slice(0, HEALTH_PAGE_SIZE);
  const hasMore = filteredHealth.length > HEALTH_PAGE_SIZE

            return (
              <div className="p-5">
                {filteredHealth.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-14 text-center">
                    <Icon icon="material-symbols:search-off" width="48" height="48" color="#856BFF" />
                    <div className="text-[14px] font-semibold text-gray-400 mt-3">No projects match your filters</div>
                    <div className="text-[12px] text-gray-300 mt-1">Try adjusting the search or status filter</div>
                  </div>
                ) : (
                  <>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                      {visibleHealth.map((p, i) => <HealthCard key={p.project_id} p={p} index={i} />)}
                    </div>
                    {hasMore && (
                      <div className="flex justify-center mt-5">
                        <button
                          onClick={() => setShowAllHealth(prev => !prev)}
                          className="flex items-center gap-2 px-5 py-2 rounded-xl border border-purple-200 text-[12px] font-semibold text-[#856BFF] hover:bg-purple-50 hover:border-purple-400 transition-all"
                        >
                          {showAllHealth ? (
                            <><span>Show less</span><Icon icon="material-symbols:arrow-upward" width="22" height="22" color="#856BFF" /></>
                          ) : (
                            <><span>Show {filteredHealth.length - HEALTH_PAGE_SIZE} more project{filteredHealth.length - HEALTH_PAGE_SIZE !== 1 ? "s" : ""}</span><Icon icon="material-symbols:arrow-downward" width="22" height="22" color="#856BFF" /></>
                          )}
                        </button>
                      </div>
                    )}
                  </>
                )}
              </div>
            );
          })()}
        </div>
      </>)}

    </div>
  );
};

export default UtilizationDashboard;