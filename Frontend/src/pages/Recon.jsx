import React, { useEffect, useState, useCallback, useMemo } from "react";
import {
  getReconFilters,
  getReconDashboard,
  getProjectLevelRecon,
  getEmployeeLevelRecon,
  getProjectDetail,
  exportProjectLevelExcel,
  exportEmployeeLevelExcel,
} from "../api/recon.api";
import { Icon } from '@iconify/react';
// import { DownloadOutlined } from "@ant-design/icons";
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from "recharts";

// ─── Number Formatting Helper ────────────────────────────────────
const formatNumber = (val, maxDecimals = 2) => {
  if (val === null || val === undefined || isNaN(val) || val === '') return '0';
  const num = Number(val);
  return num.toLocaleString('en-US', {
    minimumFractionDigits: 0,
    maximumFractionDigits: maxDecimals,
  });
};

// ─── Status colors (shared by pill + text variants) ─────────────
const STATUS_STYLES = {
  "Utilized": { bg: "#d1fae5", text: "#059669" },
  "On Track": { bg: "#d1fae5", text: "#059669" },
  "Moderate": { bg: "#e0f2fe", text: "#0284c7" },
  "Under-utilized": { bg: "#fef3c7", text: "#d97706" },
  "Under Utilized": { bg: "#fef3c7", text: "#d97706" },
  "Over-utilized": { bg: "#fee2e2", text: "#dc2626" },
  "Over Utilized": { bg: "#fee2e2", text: "#dc2626" },
  "Project Not Found": { bg: "#fee2e2", text: "#dc2626" },
  "No Estimate": { bg: "#fef3c7", text: "#d97706" },
  "Not Assigned": { bg: "#fef3c7", text: "#d97706" },
  "No Activity": { bg: "#f3f4f6", text: "#9ca3af" },
};

// Pill-style status badge — used on the Project Level table
const StatusPill = ({ status, utilizationPct, inSystem = true, estimatedHours = 0 }) => {
  let finalStatus = status;
  if (!inSystem) {
    finalStatus = "Project Not Found";
  } else if (Number(estimatedHours) === 0) {
    finalStatus = "No Estimate";
  } else if (utilizationPct !== undefined && utilizationPct !== null) {
    const u = Number(utilizationPct);
    if (u > 100) finalStatus = "Over-utilized";
    else if (u >= 70) finalStatus = "Utilized";
    else if (u >= 50) finalStatus = "Moderate";
    else finalStatus = "Under-utilized";
  }
  const c = STATUS_STYLES[finalStatus] || STATUS_STYLES[status] || STATUS_STYLES["Utilized"];
  return (
    <span
      className="inline-block px-2.5 py-1 rounded-md text-xs font-semibold whitespace-nowrap"
      style={{ backgroundColor: c.bg, color: c.text }}
    >
      {finalStatus}
    </span>
  );
};

// Plain-text status — used on the Employee Level table
// const StatusText = ({ status }) => {
//   const c = STATUS_STYLES[status] || STATUS_STYLES["On Track"];
//   return (
//     <span className="text-[11px] font-bold uppercase tracking-wide" style={{ color: c.text }}>
//       {status}
//     </span>
//   );
// };

// Employee status pill — used on the Employee Level table
const EmployeeStatusPill = ({ assignedHours, actualHours, status }) => {
  let finalStatus = status;
  
  // Calculate utilization if both assigned and actual hours are available
  const assigned = Number(assignedHours) || 0;
  const actual = Number(actualHours) || 0;
  
  // Check if employee has assigned hours
  if (assigned === 0 && actual === 0) {
    finalStatus = "No Activity";
  } else if (assigned === 0 && actual > 0) {
    finalStatus = "Not Assigned";
  } else if (assigned > 0) {
    const utilizationPct = (actual / assigned) * 100;
    if (utilizationPct > 100) {
      finalStatus = "Over-utilized";
    } else if (utilizationPct >= 70) {
      finalStatus = "On Track";
    } else if (utilizationPct >= 50) {
      finalStatus = "Moderate";
    } else if (utilizationPct > 0) {
      finalStatus = "Under-utilized";
    } else {
      finalStatus = "No Activity";
    }
  }
  
  const c = STATUS_STYLES[finalStatus] || STATUS_STYLES["On Track"];
  return (
    <span
      className="inline-block px-2.5 py-1 rounded-md text-xs font-semibold whitespace-nowrap"
      style={{ backgroundColor: c.bg, color: c.text }}
    >
      {finalStatus}
    </span>
  );
};
// ─── Custom Pie Chart Tooltip ────────────────────────────────────
const CustomPieTooltip = ({ active, payload }) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    // Use the percentage from the data instead of recalculating
    const pct = data.percentage !== undefined ? data.percentage.toFixed(2) : 
                ((data.count / data.totalProjects) * 100).toFixed(2);
    return (
      <div 
        className="bg-white/95 backdrop-blur-sm border border-gray-100 p-2.5 rounded-xl shadow-lg text-xs"
        style={{ 
          zIndex: 9999,
          position: 'relative',
          minWidth: '150px',
          maxWidth: '250px',
          boxShadow: '0 10px 25px -5px rgba(0,0,0,0.1), 0 8px 10px -6px rgba(0,0,0,0.1)',
          transform: 'translateY(-10px)'
        }}
      >
        <div className="flex items-center gap-1.5 font-semibold text-gray-800">
          <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: data.color }} />
          <span>{data.name}</span>
        </div>
        <div className="mt-1 text-gray-500 font-medium">
          <span className="font-bold text-gray-900">{data.count}</span> projects ({pct}%)
        </div>
      </div>
    );
  }
  return null;
};

// ─── Custom Project Detail Pie Chart Tooltip ────────────────────
const CustomProjectDetailPieTooltip = ({ active, payload }) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    return (
      <div className="bg-white/95 backdrop-blur-sm border border-gray-100 p-2.5 rounded-xl shadow-lg text-xs z-50">
        <div className="flex items-center gap-1.5 font-semibold text-gray-800">
          <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: data.color }} />
          <span className="truncate max-w-[200px]">{data.name}</span>
        </div>
        <div className="mt-1 text-gray-500 font-medium">
          <span className="font-bold text-gray-900">{formatNumber(data.value)}</span> Hours ({data.pct}%)
        </div>
      </div>
    );
  }
  return null;
};

// ─── Small inline icons ──────────────────────────────────────────
const SearchIcon = ({ className = "w-10 h-10" }) => (
  <Icon icon="material-symbols:search" className={className} />
);

const EyeIcon = ({ className = "w-7 h-7", color = "#856BFF" }) => (
  <Icon icon="material-symbols:visibility" className={className} color={color} />
);

const ChevronLeftIcon = ({ className = "w-10 h-10" }) => (
  <Icon icon="material-symbols:chevron-left" className={className} />
);

const ChevronRightIcon = ({ className = "w-10 h-10" }) => (
  <Icon icon="material-symbols:chevron-right" className={className} />
);

const RefreshIcon = ({ className = "w-10 h-10" }) => (
  <Icon icon="material-symbols:refresh" className={className} />
);

const ClockIcon = ({ className = "w-10 h-10" }) => (
  <Icon icon="material-symbols:schedule" className={className} />
);

const HistoryIcon = ({ className = "w-10 h-10" }) => (
  <Icon icon="material-symbols:history" className={className} />
);

const UsersIcon = ({ className = "w-10 h-10" }) => (
  <Icon icon="material-symbols:group" className={className} />
);

const FilterIcon = ({ className = "w-10 h-10" }) => (
  <Icon icon="material-symbols:filter-list" className={className} />
);

const DownloadIcon = ({ className = "w-4 h-4", color = "#ffffff" }) => (
  <Icon icon="akar-icons:download" className={className} color={color} />
);

// ─── Reusable numbered pagination bar ────────────────────────────
const Pagination = ({ page, pageSize, total, onPageChange, onPageSizeChange, entryLabel = "entries" }) => {
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  const start = total === 0 ? 0 : (page - 1) * pageSize + 1;
  const end = Math.min(page * pageSize, total);

  const getPageNumbers = () => {
    const maxVisible = 3;
    let startPage = Math.max(1, page - 1);
    let endPage = Math.min(totalPages, startPage + maxVisible - 1);
    if (endPage - startPage + 1 < maxVisible) {
      startPage = Math.max(1, endPage - maxVisible + 1);
    }
    const pages = [];
    for (let i = startPage; i <= endPage; i++) pages.push(i);
    return pages;
  };

  return (
    <div className="flex items-center justify-between px-5 py-3 border-t border-gray-50" style={{ backgroundColor: '#EFF4FF' }}>
      <span className="text-[12px] text-[#434654] font-normal">
        Showing {start} to {end} of {total} {entryLabel}
      </span>
      
      <div className="flex items-center gap-1">
        {onPageSizeChange && (
          <select
            value={pageSize}
            onChange={onPageSizeChange}
            className="px-2.5 py-1.5 border border-gray-200 rounded-md text-xs text-gray-600 focus:outline-none mr-2"
          >
            <option value={5}>5</option>
            <option value={10}>10</option>
            <option value={25}>25</option>
            <option value={50}>50</option>
          </select>
        )}
        
        <button
          onClick={() => onPageChange(page - 1)}
          disabled={page === 1}
          className="w-7 h-7 flex items-center justify-center rounded border border-gray-200 text-gray-500 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed text-xs"
        >
          ‹
        </button>
        
        {getPageNumbers().map((p) => (
          <button
            key={p}
            onClick={() => onPageChange(p)}
            className={`w-7 h-7 flex items-center justify-center rounded text-[12px] font-semibold border transition-colors
              ${p === page
                ? "bg-[#856BFF] text-white border-[#856BFF]"
                : "border-gray-200 text-gray-500 hover:bg-gray-50"}`}
          >
            {p}
          </button>
        ))}
        
        {totalPages > 3 && page < totalPages - 1 && (
          <span className="text-gray-400 text-xs px-1">…</span>
        )}
        
        <button
          onClick={() => onPageChange(page + 1)}
          disabled={page >= totalPages}
          className="w-7 h-7 flex items-center justify-center rounded border border-gray-200 text-gray-500 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed text-xs"
        >
          ›
        </button>
      </div>
    </div>
  );
};

const ReconPage = () => {
  // ─── State ──────────────────────────────────────────────────────
  const [activeTab, setActiveTab] = useState("project");

  const [filters, setFilters] = useState({
    month: "",
    year: "",
    clientName: "",
    projectCode: "",
    projectName: "",
    employeeName: "",
    department: "",
    reportingManager: "",
  });

  // ─── Search States ─────────────────────────────────────────────
  const [projectSearch, setProjectSearch] = useState("");
  const [employeeSearch, setEmployeeSearch] = useState("");
  const [resourceSearch, setResourceSearch] = useState("");
  const [unitSearch, setUnitSearch] = useState("");

  // ─── Pagination States ─────────────────────────────────────────
  const [projectPage, setProjectPage] = useState(1);
  const [projectPageSize, setProjectPageSize] = useState(10);
  const [employeePage, setEmployeePage] = useState(1);
  const [employeePageSize, setEmployeePageSize] = useState(10);
  const [unitPage, setUnitPage] = useState(1);
  const [unitPageSize, setUnitPageSize] = useState(10);

  const [filterOpts, setFilterOpts] = useState({
    clients: [],
    projects: [],
    employees: [],
    departments: [],
    managers: [],
  });

  const [dashboardData, setDashboardData] = useState({
    total_projects: 0,
    projects_with_estimates: 0,
    projects_without_estimates: 0,
    projects_with_timesheets: 0,
    projects_without_timesheets: 0,
    total_employees: 0,
    total_estimated_hours: 0,
    total_actual_hours: 0,
    total_variance_hours: 0,
    overutilized_count: 0,
    underutilized_count: 0,
  });

  const [projectReconList, setProjectReconList] = useState([]);
  const [employeeReconList, setEmployeeReconList] = useState([]);

  const [selectedProjectId, setSelectedProjectId] = useState(null);
  const [showDetailView, setShowDetailView] = useState(false);
  const [loadingDetail, setLoadingDetail] = useState(false);

  const [loading, setLoading] = useState(false);
  const [projectDetail, setProjectDetail] = useState({
    employeePage: 1,
    employeePageSize: 5,
    employeeSummary: [],
    project: null,
  });

  // ─── Filtered Data with Search ─────────────────────────────────
 const filteredProjects = useMemo(() => {
  if (!projectSearch.trim()) return projectReconList;
  const search = projectSearch.toLowerCase().trim();
  return projectReconList.filter(
    (item) =>
      (item.project_code && item.project_code.toLowerCase().includes(search)) ||
      (item.project_name && item.project_name.toLowerCase().includes(search)) ||
      (item.sub_category && item.sub_category.toLowerCase().includes(search)) // ✅ Added
  );
}, [projectReconList, projectSearch]);

  const filteredEmployees = useMemo(() => {
  if (!employeeSearch.trim()) return employeeReconList;
  const search = employeeSearch.toLowerCase().trim();
  return employeeReconList.filter(
    (item) =>
      (item.employee_code && item.employee_code.toLowerCase().includes(search)) ||
      (item.employee_name && item.employee_name.toLowerCase().includes(search)) ||
      (item.project_code && item.project_code.toLowerCase().includes(search)) ||
      (item.project_name && item.project_name.toLowerCase().includes(search)) ||
      (item.sub_category && item.sub_category.toLowerCase().includes(search)) // ✅ Added
  );
}, [employeeReconList, employeeSearch]);

  const filteredResourceSummary = useMemo(() => {
    const list = projectDetail.employeeSummary || [];
    if (!resourceSearch.trim()) return list;
    const search = resourceSearch.toLowerCase().trim();
    return list.filter(
      (e) =>
        (e.employee_name && e.employee_name.toLowerCase().includes(search)) ||
        (e.employee_code && e.employee_code.toLowerCase().includes(search)) ||
        (e.role && e.role.toLowerCase().includes(search))
    );
  }, [projectDetail.employeeSummary, resourceSearch]);

  // ─── Utilization Donut Chart Data ─────────────────────────────
const utilizationPieData = useMemo(() => {
  let over = 0;
  let utilized = 0;
  let moderate = 0;
  let under = 0;
  let noEst = 0;

  projectReconList.forEach((p) => {
    const estimated = parseFloat(p.estimated_hours || 0);
    const actual = parseFloat(p.actual_hours || 0);
    if (!p.in_system || estimated === 0) {
      noEst++;
    } else {
      const util = (actual / estimated) * 100;
      if (util > 100) over++;
      else if (util >= 70) utilized++;
      else if (util >= 50) moderate++;
      else under++;
    }
  });

  const data = [
    { name: "Over-utilized (>100%)", count: over, color: "#EF4444", shortName: "Over-utilized" },
    { name: "Utilized (70%–100%)", count: utilized, color: "#10B981", shortName: "Utilized" },
    { name: "Moderate (50%–70%)", count: moderate, color: "#0284C7", shortName: "Moderate" },
    { name: "Under-utilized (<50%)", count: under, color: "#F59E0B", shortName: "Under-utilized" },
  ];

  if (noEst > 0) {
    data.push({ name: "No Estimate", count: noEst, color: "#94A3B8", shortName: "No Estimate" });
  }

  const filtered = data.filter((d) => d.count > 0);
  const total = filtered.reduce((acc, curr) => acc + curr.count, 0);
  
  // Calculate percentages with adjustment for the last item
  const result = filtered.map((d, index, array) => {
    const rawPct = (d.count / total) * 100;
    let pct;
    if (index === array.length - 1) {
      // Last category: adjust to make total exactly 100%
      const sumOthers = array.slice(0, -1).reduce((sum, item) => {
        return sum + parseFloat(((item.count / total) * 100).toFixed(2));
      }, 0);
      pct = parseFloat((100 - sumOthers).toFixed(2));
    } else {
      pct = parseFloat(rawPct.toFixed(2));
    }
    return { 
      ...d, 
      totalProjects: total, 
      percentage: pct  // ← This is the key addition
    };
  });
  
  return result;
}, [projectReconList]);

  const totalUtilizedProjects = useMemo(() => {
    return utilizationPieData.reduce((acc, curr) => acc + curr.count, 0);
  }, [utilizationPieData]);

  // ─── Project Detail Chart States ──────────────────────────────
  const [detailChartTab, setDetailChartTab] = useState("role"); // "role" | "employee"
  const [detailMetric, setDetailMetric] = useState("actual"); // "actual" | "estimated"

  // ─── Project Detail Role Pie Chart Data ────────────────────────
  const projectRolePieData = useMemo(() => {
    if (!projectDetail?.project) return [];
    const colors = ['#856BFF', '#3B82F6', '#10B981', '#F59E0B', '#EC4899', '#06B6D4', '#8B5CF6', '#F97316', '#6366F1', '#14B8A6'];

    if (projectDetail.roleSummary && projectDetail.roleSummary.length > 0) {
      const raw = projectDetail.roleSummary
        .map((r, i) => {
          const val = detailMetric === 'actual' ? parseFloat(r.actual_hours || 0) : parseFloat(r.estimated_hours || 0);
          return {
            name: r.role || 'Other',
            value: val,
            color: colors[i % colors.length]
          };
        })
        .filter(item => item.value > 0);

      const total = raw.reduce((sum, item) => sum + item.value, 0);
      return raw.map(item => ({
        ...item,
        pct: total > 0 ? ((item.value / total) * 100).toFixed(1) : '0'
      }));
    }

    if (projectDetail.employeeSummary && projectDetail.employeeSummary.length > 0) {
      const roleMap = {};
      projectDetail.employeeSummary.forEach(e => {
        const role = e.role || 'Not Assigned';
        const val = detailMetric === 'actual' ? parseFloat(e.actual_hours || 0) : parseFloat(e.assigned_hours || 0);
        roleMap[role] = (roleMap[role] || 0) + val;
      });

      const raw = Object.entries(roleMap)
        .map(([role, val], i) => ({
          name: role,
          value: val,
          color: colors[i % colors.length]
        }))
        .filter(item => item.value > 0);

      const total = raw.reduce((sum, item) => sum + item.value, 0);
      return raw.map(item => ({
        ...item,
        pct: total > 0 ? ((item.value / total) * 100).toFixed(1) : '0'
      }));
    }

    return [];
  }, [projectDetail, detailMetric]);

  // ─── Project Detail Employee Pie Chart Data ────────────────────
  const projectEmployeePieData = useMemo(() => {
    if (!projectDetail?.employeeSummary || projectDetail.employeeSummary.length === 0) return [];
    const colors = ['#856BFF', '#3B82F6', '#10B981', '#F59E0B', '#EC4899', '#06B6D4', '#8B5CF6', '#F97316', '#6366F1', '#14B8A6', '#D946EF', '#0EA5E9'];

    const raw = projectDetail.employeeSummary
      .map((e, i) => {
        const val = detailMetric === 'actual' ? parseFloat(e.actual_hours || 0) : parseFloat(e.assigned_hours || 0);
        return {
          name: e.employee_name || 'Unknown',
          value: val,
          color: colors[i % colors.length]
        };
      })
      .filter(item => item.value > 0);

    const total = raw.reduce((sum, item) => sum + item.value, 0);
    return raw.map(item => ({
      ...item,
      pct: total > 0 ? ((item.value / total) * 100).toFixed(1) : '0'
    }));
  }, [projectDetail, detailMetric]);

  const currentProjectChartData = detailChartTab === 'role' ? projectRolePieData : projectEmployeePieData;
  const currentProjectChartTotal = currentProjectChartData.reduce((sum, item) => sum + item.value, 0);

  // ─── Paginated Data ────────────────────────────────────────────
  const paginatedProjects = useMemo(() => {
    const start = (projectPage - 1) * projectPageSize;
    return filteredProjects.slice(start, start + projectPageSize);
  }, [filteredProjects, projectPage, projectPageSize]);

  const paginatedEmployees = useMemo(() => {
    const start = (employeePage - 1) * employeePageSize;
    return filteredEmployees.slice(start, start + employeePageSize);
  }, [filteredEmployees, employeePage, employeePageSize]);

  // ─── Reset page when search changes ────────────────────────────
  useEffect(() => {
    setProjectPage(1);
  }, [projectSearch]);

  useEffect(() => {
    setEmployeePage(1);
  }, [employeeSearch]);

  useEffect(() => {
    setProjectDetail((prev) => ({ ...prev, employeePage: 1 }));
  }, [resourceSearch]);

  // ─── Data Fetching ──────────────────────────────────────────────
  const fetchFilterOpts = useCallback(async () => {
    try {
      const data = await getReconFilters();
      setFilterOpts(data);
    } catch (err) {
      console.error("Error fetching filter options:", err);
    }
  }, []);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const dashboard = await getReconDashboard(filters);
      const projectLevel = await getProjectLevelRecon(filters);
      const employeeLevel = await getEmployeeLevelRecon(filters);

      setDashboardData({
        total_projects: dashboard?.total_projects || 0,
        projects_with_estimates: dashboard?.projects_with_estimates || 0,
        projects_without_estimates: dashboard?.projects_without_estimates || 0,
        projects_with_timesheets: dashboard?.projects_with_timesheets || 0,
        projects_without_timesheets: dashboard?.projects_without_timesheets || 0,
        total_employees: dashboard?.total_employees || 0,
        total_estimated_hours: dashboard?.total_estimated_hours || 0,
        total_actual_hours: dashboard?.total_actual_hours || 0,
        total_variance_hours: dashboard?.total_variance_hours || 0,
        overutilized_count: dashboard?.overutilized_count || 0,
        underutilized_count: dashboard?.underutilized_count || 0,
      });

      setProjectReconList(projectLevel || []);
      setEmployeeReconList(employeeLevel || []);

      // Reset pages when data loads
      setProjectPage(1);
      setEmployeePage(1);
    } catch (err) {
      console.error("Error fetching reconciliation data:", err);
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    fetchFilterOpts();
  }, [fetchFilterOpts]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Auto-switch to "By Resource" when Actual Hours is selected
useEffect(() => {
  if (detailMetric === "actual") {
    setDetailChartTab("employee");
  }
}, [detailMetric]);

  // ─── Handlers ───────────────────────────────────────────────────
  const handleFilterChange = (field, val) => {
    setFilters((prev) => ({ ...prev, [field]: val }));
  };

  const resetFilters = () => {
    setFilters({
      month: "",
      year: "",
      clientName: "",
      projectCode: "",
      projectName: "",
      employeeName: "",
      department: "",
      reportingManager: "",
    });
    setProjectSearch("");
    setEmployeeSearch("");
    setUnitSearch("");
    setProjectPage(1);
    setEmployeePage(1);
    setUnitPage(1);
  };

  const handleViewProjectDetails = async (project) => {
    const id = project.project_id || project.project_code;

    if (!id) {
      alert("Invalid project identifier");
      return;
    }

    setSelectedProjectId(id);
    setLoadingDetail(true);
    setShowDetailView(true);
    setResourceSearch("");
    try {
      const data = await getProjectDetail(id, filters);
      setProjectDetail(data);
    } catch (err) {
      console.error("Error fetching project details:", err);
      alert("Failed to load project details.");
      setShowDetailView(false);
    } finally {
      setLoadingDetail(false);
    }
  };

  const handleBackToDashboard = () => {
    setShowDetailView(false);
    setSelectedProjectId(null);
    setResourceSearch("");
    setProjectDetail({
      employeePage: 1,
      employeePageSize: 5,
      employeeSummary: [],
      project: null,
    });
  };

  // ─── Pagination Handlers ───────────────────────────────────────
  const handleProjectPageChange = (newPage) => {
    if (newPage >= 1 && newPage <= Math.ceil(filteredProjects.length / projectPageSize)) {
      setProjectPage(newPage);
    }
  };

  const handleEmployeePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= Math.ceil(filteredEmployees.length / employeePageSize)) {
      setEmployeePage(newPage);
    }
  };

  const handleProjectPageSizeChange = (e) => {
    setProjectPageSize(parseInt(e.target.value));
    setProjectPage(1);
  };

  const handleEmployeePageSizeChange = (e) => {
    setEmployeePageSize(parseInt(e.target.value));
    setEmployeePage(1);
  };

  // ─── Helpers ────────────────────────────────────────────────────
  const monthsList = [
    { value: "1", label: "January" },
    { value: "2", label: "February" },
    { value: "3", label: "March" },
    { value: "4", label: "April" },
    { value: "5", label: "May" },
    { value: "6", label: "June" },
    { value: "7", label: "July" },
    { value: "8", label: "August" },
    { value: "9", label: "September" },
    { value: "10", label: "October" },
    { value: "11", label: "November" },
    { value: "12", label: "December" },
  ];

  const yearsList = ["2024", "2025", "2026"];

  const inputCls =
    "w-full px-3 py-2 border border-gray-200 rounded-lg text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-[#856BFF]/30";

  // ─── Render ─────────────────────────────────────────────────────
  return (
    <div className="p-6 font-sans bg-[#FAF8FF] min-h-screen">
      {/* ── If Detail View is Active, Show Only Project Details ── */}
      {showDetailView ? (
        <div className="px-0 pt-0 -mt-2">
          <button
            onClick={handleBackToDashboard}
            className="flex items-center gap-2 text-sm font-medium text-gray-600 hover:text-[#6D5EF6] mb-4 transition"
          >
            <Icon icon="material-symbols:arrow-back" width="20" height="20" color="#6B7280" />
            Back to Recon Dashboard
          </button>

          {loadingDetail || !projectDetail?.project ? (
            <div className="h-28 rounded-2xl bg-white animate-pulse" />
          ) : (
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
              <div className="flex">
                <div className="w-1 bg-[#7C5CFC]" />

                <div className="flex-1 px-6 py-2">
                  <h1 className="text-[24px] font-normal text-[#191B23] leading-tight">
                    {projectDetail.project?.project_name || "—"}
                  </h1>

                  <div className="flex items-center gap-3 mt-3">
                    <span className="bg-gray-100 text-[11px] font-medium text-gray-600 px-3 py-1 rounded">
                      CODE: {projectDetail.project?.project_code || "—"}
                    </span>
                    <span className="bg-gray-100 text-[11px] font-medium text-[#856BFF] px-3 py-1 rounded">
                      SUB CATEGORY: {
            projectDetail.project?.sub_category || 
            projectDetail.project?.original_sub_category || 
            "No Subcategory"
        }
                    </span>

                    {projectDetail.project?.status && (
                      <span className="text-xs font-medium text-red-500">
                        Status: {projectDetail.project.status}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}


          {loadingDetail || !projectDetail?.project ? (
            <div className="flex flex-col items-center justify-center py-16 gap-3">
              <div className="w-9 h-9 border-4 border-gray-100 border-t-[#856BFF] rounded-full animate-spin" />
              <span className="text-sm text-gray-500">Loading detail reports…</span>
            </div>
          ) : (
            <div className="py-5 ">
              {/* Stat cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5 mt-0">
                {/* Estimated */}
                <div className="relative bg-white rounded-2xl shadow-sm border border-gray-100 px-4 py-4 overflow-hidden">
                  <ClockIcon className="absolute top-5 right-5 w-16 h-16 text-gray-200" />

                  <p className="text-[12px] text-[#434654] font-normal p-2">
                    Estimated Effort
                  </p>

                  <h3 className="mt-3 text-[24px] font-normal text-[#191B23]">
                    {formatNumber(projectDetail.project?.estimated_hours)}
                    <span className="text-[14px] font-normal text-[#434654] ml-1">
                      Hours
                    </span>
                  </h3>

                  <p className="mt-2 text-[16px] text-[#434654]">
                    ~ {formatNumber(projectDetail.project?.estimated_days, 1)} Work Days
                  </p>
                </div>

                {/* Actual */}
                <div className="relative bg-white rounded-2xl shadow-sm border border-gray-100 px-4 py-4 overflow-hidden">
                  <HistoryIcon className="absolute top-5 right-5 w-16 h-16 text-gray-200" />

                  <p className="text-[12px] text-[#434654] font-normal p-2">
                    Actual Logged
                  </p>

                  <h3 className="mt-3 text-[24px] font-normal text-[#191B23]">
                    {formatNumber(projectDetail.project?.actual_hours)}
                    <span className="text-[14px] font-normal text-[#434654] ml-1">
                      Hours
                    </span>
                  </h3>

                  <p className="mt-2 text-[16px] text-[#434654]">
                    ~ {formatNumber(projectDetail.project?.actual_days, 1)} Work Days
                  </p>
                </div>

                {/* Variance */}
                <div className="relative bg-white rounded-2xl shadow-sm border border-gray-100 px-4 py-4 overflow-hidden">
                  <div
                    className={`absolute left-0 top-0 h-full w-1 ${Number(projectDetail.project?.variance_hours) < 0
                      ? "bg-red-500"
                      : "bg-green-500"
                      }`}
                  />

                  <p className="text-[12px] text-[#434654] font-normal p-2">
                    Total Variance
                  </p>

                  <h3
                    className={`mt-3 text-[24px] font-normal ${Number(projectDetail.project?.variance_hours) < 0
                      ? "text-red-600"
                      : "text-green-600"
                      }`}
                  >
                    {Number(projectDetail.project?.variance_hours) > 0 ? "+" : ""}
                    {formatNumber(projectDetail.project?.variance_hours)}

                    <span className="text-base font-normal ml-1">
                      Hrs
                    </span>
                  </h3>

                  <p
                    className={`mt-2 text-[16px] ${Number(projectDetail.project?.variance_hours) < 0
                      ? "text-red-500"
                      : "text-green-500"
                      }`}
                  >
                    ({formatNumber(projectDetail.project?.variance_pct, 1)}%)
                    {" "}
                    {Number(projectDetail.project?.variance_hours) < 0
                      ? "Over-utilized"
                      : "Under-utilized"}
                  </p>
                </div>

                {/* Resources */}
                <div className="relative bg-white rounded-2xl shadow-sm border border-gray-100 px-4 py-4 overflow-hidden">
                  <UsersIcon className="absolute top-5 right-5 w-16 h-16 text-gray-200" />

                  <p className="text-[12px] text-[#434654] font-normal p-2">
                    Active Resources
                  </p>

                  <h3 className="mt-3 text-[24px] font-normal text-[#856BFF]">
                    {projectDetail.employeeSummary?.length || 0}

                    <span className="mt-2 text-[16px] text-[#434654] ml-1">
                      Members
                    </span>
                  </h3>

                  <div className="flex items-center mt-4">
                    {(projectDetail.employeeSummary || []).slice(0, 4).map((e, i) => (
                      <div
                        key={i}
                        className="w-8 h-8 rounded-full bg-[#7C5CFC]/15 border-2 border-white flex items-center justify-center text-xs font-semibold text-[#7C5CFC]"
                        style={{ marginLeft: i === 0 ? 0 : -10 }}
                      >
                        {(e.employee_name || "?").charAt(0).toUpperCase()}
                      </div>
                    ))}

                    {(projectDetail.employeeSummary?.length || 0) > 4 && (
                      <div
                        className="w-8 h-8 rounded-full bg-[#7C5CFC]/15 border-2 border-white flex items-center justify-center text-[11px] font-semibold text-[#7C5CFC]"
                        style={{ marginLeft: -10 }}
                      >
                        +{projectDetail.employeeSummary.length - 4}
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* ── Effort Distribution Donut / Pie Chart ── */}
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 mt-6">
                <div className="flex items-center justify-between flex-wrap gap-3 pb-4 border-b border-gray-100">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-lg bg-[#856BFF]/10 flex items-center justify-center">
                      <Icon icon="material-symbols:pie-chart" width="20" height="20" color="#856BFF" />
                    </div>
                    <div>
                      <h3 className="font-bold text-gray-900 text-[15px] leading-tight">
                        Effort Distribution ({detailChartTab === 'role' ? 'By Role' : 'By Resource'})
                      </h3>
                      <p className="text-xs text-gray-400 mt-0.5">
                        Breakdown of {detailMetric === 'actual' ? 'actual logged' : 'estimated'} hours for this project
                      </p>
                    </div>
                  </div>

                  {/* Controls: Metric & Category Toggle */}
                  <div className="flex items-center gap-2 flex-wrap">
                    {/* Metric Toggle */}
                    <div className="flex items-center bg-gray-100 p-1 rounded-lg">
                      <button
                        onClick={() => setDetailMetric("actual")}
                        className={`px-3 py-1 text-xs font-semibold rounded-md transition-all ${
                          detailMetric === "actual"
                            ? "bg-white text-[#856BFF] shadow-sm"
                            : "text-gray-500 hover:text-gray-800"
                        }`}
                        style={{ background: detailMetric === 'actual' ? '#fff' : 'transparent', border: 'none' }}
                      >
                        Actual Hours
                      </button>
                      <button
                        onClick={() => setDetailMetric("estimated")}
                        className={`px-3 py-1 text-xs font-semibold rounded-md transition-all ${
                          detailMetric === "estimated"
                            ? "bg-white text-[#856BFF] shadow-sm"
                            : "text-gray-500 hover:text-gray-800"
                        }`}
                        style={{ background: detailMetric === 'estimated' ? '#fff' : 'transparent', border: 'none' }}
                      >
                        Estimated Hours
                      </button>
                    </div>

                    {/* Breakdown Type Toggle */}
                    {/* Breakdown Type Toggle */}
<div className="flex items-center bg-gray-100 p-1 rounded-lg">
  {/* Only show "By Role" button when Estimated Hours is selected */}
  {detailMetric === "estimated" && (
    <button
      onClick={() => setDetailChartTab("role")}
      className={`px-3 py-1 text-xs font-semibold rounded-md transition-all ${
        detailChartTab === "role"
          ? "bg-white text-[#856BFF] shadow-sm"
          : "text-gray-500 hover:text-gray-800"
      }`}
      style={{ background: detailChartTab === 'role' ? '#fff' : 'transparent', border: 'none' }}
    >
      By Role
    </button>
  )}
  
  {/* Always show "By Resource" button */}
  <button
    onClick={() => setDetailChartTab("employee")}
    className={`px-3 py-1 text-xs font-semibold rounded-md transition-all ${
      detailChartTab === "employee"
        ? "bg-white text-[#856BFF] shadow-sm"
        : "text-gray-500 hover:text-gray-800"
    }`}
    style={{ background: detailChartTab === 'employee' ? '#fff' : 'transparent', border: 'none' }}
  >
    By Resource
  </button>
</div>
                  </div>
                </div>

                {/* Chart & Breakdown Content */}
                {currentProjectChartData.length > 0 ? (
                  <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center pt-4">
                    {/* Donut Chart */}
                    <div className="lg:col-span-5 flex flex-col items-center justify-center">
                      <div className="w-full h-[220px] relative">
                        <ResponsiveContainer width="100%" height="100%">
                          <PieChart>
                            <Pie
                              data={currentProjectChartData}
                              cx="50%"
                              cy="50%"
                              innerRadius={60}
                              outerRadius={88}
                              paddingAngle={3}
                              dataKey="value"
                            >
                              {currentProjectChartData.map((entry, index) => (
                                <Cell key={`cell-proj-${index}`} fill={entry.color} />
                              ))}
                            </Pie>
                            <Tooltip 
  content={<CustomProjectDetailPieTooltip />} 
  wrapperStyle={{ 
    zIndex: 1000,
    pointerEvents: 'none'
  }}
  position={{ y: 0 }}
/>
                          </PieChart>
                        </ResponsiveContainer>
                        {/* Donut Center Total Label */}
                        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                          <span className="text-xl font-extrabold text-gray-800 leading-tight">
                            {formatNumber(currentProjectChartTotal)}
                          </span>
                          <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">
                            Total Hrs
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Breakdown List */}
                    <div className="lg:col-span-7 flex flex-col gap-2 max-h-[220px] overflow-y-auto pr-2">
                      {currentProjectChartData.map((item, idx) => (
                        <div
                          key={idx}
                          className="flex items-center justify-between px-3 py-2 rounded-xl hover:bg-gray-50/80 transition-colors border border-gray-100"
                        >
                          <div className="flex items-center gap-2.5 min-w-0">
                            <span
                              className="w-2.5 h-2.5 rounded-full shrink-0"
                              style={{ backgroundColor: item.color }}
                            />
                            <span className="font-semibold text-xs text-gray-800 truncate" title={item.name}>
                              {item.name}
                            </span>
                          </div>
                          <div className="flex items-center gap-3 shrink-0">
                            <span className="text-xs font-bold text-[#856BFF]">
                              {formatNumber(item.value)} <span className="text-[10px] font-medium text-gray-400">Hrs</span>
                            </span>
                            <div className="w-16 h-1.5 rounded-full bg-gray-100 overflow-hidden hidden sm:block">
                              <div
                                className="h-full rounded-full"
                                style={{ width: `${Math.min(item.pct, 100)}%`, backgroundColor: item.color }}
                              />
                            </div>
                            <span className="text-xs font-bold text-gray-500 w-12 text-right">
                              {item.pct}%
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center py-10 text-gray-400 text-xs">
                    <Icon icon="material-symbols:pie-chart-outline" width="36" height="36" className="text-gray-300 mb-1.5" />
                    No {detailMetric} hours logged to display distribution
                  </div>
                )}
              </div>

              {/* Employee-wise Breakdown */}
              <div className=" bg-[#FFFFFF] rounded-lg mt-6 px-4 py-2">
                <div className="flex items-center justify-between mb-3 flex-wrap gap-3">
                  <span className="font-semibold text-[#191B23] text-[20px]">Resource Breakdown &amp; Timesheets</span>
                  <div className="flex items-center gap-2">
                    <div className="relative">
                      <SearchIcon className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                      <input
                        type="text"
                        placeholder="Search resources..."
                        value={resourceSearch}
                        onChange={(e) => setResourceSearch(e.target.value)}
                        className="w-56 pl-9 pr-3.5 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#856BFF]/30"
                      />
                    </div>
                    {/* <button
                      type="button"
                      title="Filters"
                      className="w-9 h-9 flex items-center justify-center border border-gray-200 rounded-lg text-gray-500 hover:bg-gray-50 transition-colors"
                    >
                      <FilterIcon className="w-10 h-10" />
                    </button> */}
                  </div>
                </div>

                <div className="w-full overflow-auto max-h-[calc(100vh-280px)] rounded-xl border border-gray-100">
                  <table className="w-full border-collapse text-sm">
                    <thead className="sticky top-0 z-20 bg-[#EFF4FF]">
                      <tr className="border-b border-gray-200 bg-[#EFF4FF]" style={{ backgroundColor: '#EFF4FF' }}>
                        <th className="sticky top-0 z-20 bg-[#EFF4FF] px-3 py-3 text-left text-[12px] font-bold text-[#434654] uppercase shadow-sm">Employee</th>
                        <th className="sticky top-0 z-20 bg-[#EFF4FF] px-3 py-3 text-left text-[12px] font-bold text-[#434654] uppercase shadow-sm">Role</th>
                        <th className="sticky top-0 z-20 bg-[#EFF4FF] px-3 py-3 text-left text-[12px] font-bold text-[#434654] uppercase shadow-sm">Assigned (H/D)</th>
                        <th className="sticky top-0 z-20 bg-[#EFF4FF] px-3 py-3 text-left text-[12px] font-bold text-[#434654] uppercase shadow-sm">Actual (H/D)</th>
                        <th className="sticky top-0 z-20 bg-[#EFF4FF] px-3 py-3 text-left text-[12px] font-bold text-[#434654] uppercase shadow-sm">Utilization %</th>
                        <th className="sticky top-0 z-20 bg-[#EFF4FF] px-3 py-3 text-left text-[12px] font-bold text-[#434654] uppercase shadow-sm">Variance (H/%)</th>
                        <th className="sticky top-0 z-20 bg-[#EFF4FF] px-3 py-3 text-left text-[12px] font-bold text-[#434654] uppercase shadow-sm">Status</th>
                        <th className="sticky top-0 z-20 bg-[#EFF4FF] px-3 py-3 text-left text-[12px] font-bold text-[#434654] uppercase shadow-sm">Timesheet Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredResourceSummary.length === 0 ? (
                        <tr>
                          <td colSpan={8} className="text-center py-8 text-gray-400">
                            No employee allocations or timesheets registered.
                          </td>
                        </tr>
                      ) : (
                        filteredResourceSummary
                          ?.slice(
                            ((projectDetail.employeePage || 1) - 1) * (projectDetail.employeePageSize || 5),
                            (projectDetail.employeePage || 1) * (projectDetail.employeePageSize || 5)
                          )
                          ?.map((e, idx) => {
                            const assigned = parseFloat(e.assigned_hours) || 0;
                            const actual = parseFloat(e.actual_hours) || 0;
                            let utilPct = 0;
                            let utilizationDisplay = "0%";

                            if (assigned > 0) {
                              utilPct = (actual / assigned) * 100;
                              utilizationDisplay = formatNumber(utilPct, 1) + "%";
                            } else if (actual > 0 && assigned === 0) {
                              utilizationDisplay = "N/A";
                            }

                            let rowBgClass = "";
                            let barColor = "#d1d5db";
                            let pctColor = "text-gray-500";

                            if (utilPct > 100) {
                              rowBgClass = "bg-red-50";
                              barColor = "#dc2626";
                              pctColor = "text-red-600";
                            } else if (utilPct >= 80 && utilPct < 100) {
                              rowBgClass = "bg-amber-50";
                              barColor = "#d97706";
                              pctColor = "text-amber-600";
                            } else if (utilPct > 0 && utilPct < 80) {
                              barColor = "#059669";
                              pctColor = "text-green-600";
                            }

                            return (
                              <tr key={idx} className={`border-b border-gray-100 last:border-0 ${rowBgClass}`}>
                                <td className="px-3 py-2.5">
                                  <div className="font-semibold text-gray-900">{e.employee_name}</div>
                                  <div className="text-[11px] text-gray-400">{e.employee_code || "—"}</div>
                                </td>
                                <td className="px-3 py-2.5">
                                  <span className={e.role === "Not Assigned" ? "text-amber-500 font-medium" : "text-gray-700"}>
                                    {e.role || "Not Assigned"}
                                  </span>
                                </td>
                                <td className="px-3 py-2.5 text-gray-800">
                                  <div className="font-semibold">{formatNumber(e.assigned_hours)}</div>
                                  <div className="text-[11px] text-gray-400">({formatNumber(e.assigned_days, 1)}D)</div>
                                </td>
                                <td className="px-3 py-2.5 text-gray-800">
                                  <div className="font-semibold">{formatNumber(e.actual_hours)}</div>
                                  <div className="text-[11px] text-gray-400">({formatNumber(e.actual_days, 1)}D)</div>
                                </td>
                                <td className="px-3 py-2.5">
                                  <div className="w-28">
                                    <div className="w-full h-1 rounded-full bg-gray-100 overflow-hidden mb-1">
                                      <div
                                        className="h-full rounded-full transition-all duration-500"
                                        style={{ width: `${Math.min(utilPct, 100)}%`, backgroundColor: barColor }}
                                      />
                                    </div>
                                    <span className={`text-xs font-bold ${pctColor}`}>{utilizationDisplay}</span>
                                  </div>
                                </td>
                                <td className="px-3 py-2.5">
                                  <div className={`font-semibold ${Number(e.variance_hours) > 0 ? "text-green-600" : "text-red-500"}`}>
                                    {Number(e.variance_hours) > 0 ? "+" : ""}
                                    {formatNumber(e.variance_hours)}
                                  </div>
                                  <div className={`text-[11px] ${Number(e.variance_pct) > 0 ? "text-green-600" : "text-red-500"}`}>
                                    ({Number(e.variance_pct) > 0 ? "+" : ""}
                                    {formatNumber(e.variance_pct, 1)}%)
                                  </div>
                                </td>
                                <td className="px-3 py-2.5">
  <EmployeeStatusPill 
    assignedHours={e.assigned_hours} 
    actualHours={e.actual_hours}
    status={e.assignment_status} 
  />
</td>
                                <td className="px-3 py-2.5">
                                  <span
                                    className="inline-block px-2 py-0.5 rounded-full text-[11px] font-semibold"
                                    style={{
                                      backgroundColor: e.timesheet_status === "Present" ? "#ede9fe" : "#fee2e2",
                                      color: e.timesheet_status === "Present" ? "#7c3aed" : "#dc2626",
                                    }}
                                  >
                                    {e.timesheet_status || "Not Present"}
                                  </span>
                                </td>
                              </tr>
                            );
                          })
                      )}
                    </tbody>
                  </table>
                </div>

                {/* Pagination */}
                {filteredResourceSummary.length > 0 && (
                  <Pagination
                    page={projectDetail.employeePage || 1}
                    pageSize={projectDetail.employeePageSize || 5}
                    total={filteredResourceSummary.length}
                    entryLabel="employees"
                    onPageChange={(newPage) =>
                      setProjectDetail((prev) => ({
                        ...prev,
                        employeePage: Math.min(
                          Math.max(1, Math.ceil(filteredResourceSummary.length / (prev.employeePageSize || 5))),
                          Math.max(1, newPage)
                        ),
                      }))
                    }
                    onPageSizeChange={(e) => {
                      const newSize = parseInt(e.target.value);
                      setProjectDetail((prev) => ({ ...prev, employeePageSize: newSize, employeePage: 1 }));
                    }}
                  />
                )}
              </div>
            </div>
          )}
        </div>
      ) : (
        /* ── Main Dashboard Content (Only shown when not in detail view) ── */
        <>
          {/* ── Header ── */}
          <div className="flex justify-between items-center flex-wrap gap-4 mb-6">
            <div>
              <h1 className="text-[24px] font-bold text-[#191B23] m-0">Recon Dashboard</h1>
              <p className="text-[16px] text-[#434654] mt-1">
                Compare project estimates against actual hours logged in timesheets
              </p>
            </div>
            <button
              onClick={fetchData}
              className="flex items-center gap-1.5 px-4 py-2 bg-white border border-gray-200 hover:bg-gray-50 rounded-lg text-sm font-semibold text-gray-600 shadow-sm transition-colors"
            >
              <RefreshIcon className="w-3.5 h-3.5" /> Refresh
            </button>
          </div>

          {/* ── Project Status + Hours Summary + Utilization Donut cards ── */}
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5 mb-6">
            {/* Project Status */}
            <div className="relative bg-white rounded-2xl border border-gray-100 shadow-sm p-5 overflow-hidden flex flex-col justify-between">
              <span className="absolute left-0 top-0 bottom-0 w-1 bg-[#856BFF]" />
              <div>
                <div className="flex items-center gap-2 mb-4">
                  <span className="w-7 h-7 rounded-md flex items-center justify-center text-[#856BFF] text-sm">
                    <Icon icon="material-symbols:assignment" width="22" height="22" color="#856BFF" />
                  </span>
                  <span className="font-semibold text-[#191B23] text-[20px]">Project Status</span>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-x-3 gap-y-4">
                  <div className="col-span-2 sm:col-span-1">
                    <div className="text-[11px] font-semibold text-[#64748B] uppercase tracking-wide">Total Projects</div>
                    <div className="text-2xl font-extrabold text-gray-900 mt-0.5">{dashboardData.total_projects}</div>
                  </div>
                  <div>
                    <div className="text-[11px] font-semibold text-[#64748B] uppercase tracking-wide">With Estimates</div>
                    <div className="text-xl font-extrabold text-green-600 mt-0.5">{dashboardData.projects_with_estimates}</div>
                  </div>
                  <div>
                    <div className="text-[11px] font-semibold text-[#64748B] uppercase tracking-wide">Without Estimates</div>
                    <div className="text-xl font-extrabold text-amber-500 mt-0.5">{dashboardData.projects_without_estimates}</div>
                  </div>
                  <div>
                    <div className="text-[11px] font-semibold text-[#64748B] uppercase tracking-wide">With Timesheets</div>
                    <div className="text-xl font-extrabold text-[#856BFF] mt-0.5">{dashboardData.projects_with_timesheets}</div>
                  </div>
                  <div>
                    <div className="text-[11px] font-semibold text-[#64748B] uppercase tracking-wide">Without Timesheets</div>
                    <div className="text-xl font-extrabold text-red-500 mt-0.5">{dashboardData.projects_without_timesheets}</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Hours Summary */}
            <div className="relative bg-white rounded-2xl border border-gray-100 shadow-sm p-5 overflow-hidden flex flex-col justify-between">
              <span className="absolute left-0 top-0 bottom-0 w-1 bg-[#856BFF]" />
              <div>
                <div className="flex items-center gap-2 mb-4">
                  <span className="w-7 h-7 rounded-md flex items-center justify-center text-[#856BFF] text-sm">
                    <Icon icon="material-symbols:schedule" width="22" height="22" color="#856BFF" />
                  </span>
                  <span className="font-semibold text-[#191B23] text-[20px]">Hours Summary</span>
                </div>
                <div className="grid grid-cols-3 gap-3 mb-3">
                  <div>
                    <div className="text-[11px] font-semibold text-[#64748B] uppercase tracking-wide">Estimated</div>
                    <div className="text-lg font-extrabold text-gray-900 mt-0.5">
                      {formatNumber(dashboardData.total_estimated_hours)}
                      <span className="text-[10px] font-normal text-gray-400"> hrs</span>
                    </div>
                  </div>
                  <div>
                    <div className="text-[11px] font-semibold text-[#64748B] uppercase tracking-wide">Actual</div>
                    <div className="text-lg font-extrabold text-green-600 mt-0.5">
                      {formatNumber(dashboardData.total_actual_hours)}
                      <span className="text-[10px] font-normal text-gray-400"> hrs</span>
                    </div>
                  </div>
                  <div>
                    <div className="text-[11px] font-semibold text-[#64748B] uppercase tracking-wide">Variance</div>
                    <div className={`text-lg font-extrabold mt-0.5 ${Number(dashboardData.total_variance_hours) > 0 ? "text-red-500" : "text-green-600"}`}>
                      {Number(dashboardData.total_variance_hours) > 0 ? "+" : ""}
                      {formatNumber(dashboardData.total_variance_hours)}
                      <span className="text-[10px] font-normal text-gray-400"> hrs</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Progress burn indicator */}
              <div className="border-t border-gray-100 pt-3 mt-2">
                <div className="flex items-center justify-between text-xs mb-1.5">
                  <span className="text-gray-500 font-medium">Overall Effort Consumption</span>
                  <span className="font-bold text-gray-800">
                    {dashboardData.total_estimated_hours > 0
                      ? `${formatNumber((dashboardData.total_actual_hours / dashboardData.total_estimated_hours) * 100, 1)}%`
                      : "0%"}
                  </span>
                </div>
                <div className="w-full h-2 rounded-full bg-gray-100 overflow-hidden">
                  <div
                    className="h-full rounded-full bg-[#856BFF] transition-all duration-500"
                    style={{
                      width: `${Math.min(
                        dashboardData.total_estimated_hours > 0
                          ? (dashboardData.total_actual_hours / dashboardData.total_estimated_hours) * 100
                          : 0,
                        100
                      )}%`,
                    }}
                  />
                </div>
              </div>
            </div>

            {/* Utilization Breakdown Donut Chart */}
            <div className="relative bg-white rounded-2xl border border-gray-100 shadow-sm p-5 overflow-hidden flex flex-col justify-between">
              <span className="absolute left-0 top-0 bottom-0 w-1 bg-[#856BFF]" />
              <div className="flex items-center gap-2 mb-1">
                <span className="w-7 h-7 rounded-md bg-[#856BFF]/10 flex items-center justify-center text-[#856BFF] text-sm">
                  <Icon icon="material-symbols:pie-chart" width="22" height="22" color="#856BFF" />
                </span>
                <span className="font-semibold text-[#191B23] text-[20px]">Utilization Breakdown</span>
              </div>

              {utilizationPieData.length > 0 ? (
                <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
                  <div className="w-full sm:w-[145px] h-[135px] relative flex items-center justify-center shrink-0">
                    <ResponsiveContainer width="100%" height={135}>
                      <PieChart>
                        <Pie
                          data={utilizationPieData}
                          cx="50%"
                          cy="50%"
                          innerRadius={40}
                          outerRadius={58}
                          paddingAngle={3}
                          dataKey="count"
                          strokeWidth={2}
                          stroke="#ffffff"
                        >
                          {utilizationPieData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                        </Pie>
                        <Tooltip 
  content={<CustomPieTooltip />}
  wrapperStyle={{ 
    zIndex: 1000,
    pointerEvents: 'none'
  }}
  position={{ y: 0 }}
/>
                      </PieChart>
                    </ResponsiveContainer>
                    <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                      <span className="text-base font-extrabold text-gray-900 leading-none">
                        {totalUtilizedProjects}
                      </span>
                      <span className="text-[10px] text-gray-400 font-medium mt-0.5">Projects</span>
                    </div>
                  </div>

                  <div className="flex-1 w-full flex flex-col gap-1.5 justify-center">
                    {utilizationPieData.map((item, index, array) => {
  // Calculate percentage with 2 decimal places
  const rawPct = (item.count / totalUtilizedProjects) * 100;
  
  let pct;
  if (index === array.length - 1) {
    // Last category: adjust to make total exactly 100%
    const sumOthers = array.slice(0, -1).reduce((sum, d) => {
      return sum + parseFloat(((d.count / totalUtilizedProjects) * 100).toFixed(2));
    }, 0);
    pct = (100 - sumOthers).toFixed(2);
  } else {
    pct = rawPct.toFixed(2);
  }
  
  return (
    <div key={item.name} className="flex items-center justify-between text-xs">
      <div className="flex items-center gap-1.5 min-w-0">
        <span className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: item.color }} />
        <span className="text-gray-600 truncate text-[11px]">{item.shortName}</span>
      </div>
      <div className="flex items-center gap-1 font-semibold text-gray-800 text-[11px] shrink-0 ml-2">
        <span>{item.count}</span>
        <span className="text-gray-400 font-normal">({pct}%)</span>
      </div>
    </div>
  );
})}
                  </div>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-6 text-gray-400 text-xs">
                  <Icon icon="solar:chart-2-outline" width="32" height="32" className="text-gray-300 mb-1" />
                  No utilization data available
                </div>
              )}
            </div>
          </div>

          {/* ── Filters ── */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 mb-6">
            <div className="flex items-center justify-between mb-4">
              <span className="flex items-center gap-2 font-semibold text-[#191B23] text-[20px]">
                <Icon icon="solar:sort-outline" width="20" height="20" color="#856BFF" /> Search &amp; Filters
              </span>
              <button onClick={resetFilters} className="text-xs font-semibold text-[#856BFF] hover:text-[#7259e6]">
                Reset Filters
              </button>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 items-end">
              <div>
                <label className="block text-xs font-semibold text-gray-500 mb-1.5">Month</label>
                <select
                  value={filters.month}
                  onChange={(e) => handleFilterChange("month", e.target.value)}
                  className={inputCls}
                >
                  <option value="">All Months</option>
                  {monthsList.map((m) => (
                    <option key={m.value} value={m.value}>{m.label}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-500 mb-1.5">Year</label>
                <select
                  value={filters.year}
                  onChange={(e) => handleFilterChange("year", e.target.value)}
                  className={inputCls}
                >
                  <option value="">All Years</option>
                  {yearsList.map((y) => (
                    <option key={y} value={y}>{y}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-500 mb-1.5">Customer Name</label>
                <select
                  value={filters.clientName}
                  onChange={(e) => handleFilterChange("clientName", e.target.value)}
                  className={inputCls}
                >
                  <option value="">All Customers</option>
                  {filterOpts.clients?.map((c) => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-500 mb-1.5">Project Code</label>
                <input
                  type="text"
                  placeholder="e.g. PRJ-001"
                  value={filters.projectCode}
                  onChange={(e) => handleFilterChange("projectCode", e.target.value)}
                  className={inputCls}
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-500 mb-1.5">Project Name</label>
                <input
                  type="text"
                  placeholder="e.g. ERP"
                  value={filters.projectName}
                  onChange={(e) => handleFilterChange("projectName", e.target.value)}
                  className={inputCls}
                />
              </div>

              <div>
                <button
                  onClick={fetchData}
                  className="w-full px-4 py-2 bg-[#856BFF] hover:bg-[#7259e6] text-white rounded-lg text-sm font-bold transition-colors"
                >
                  Apply
                </button>
              </div>
            </div>
          </div>

          {/* ── Tabs ── */}
          <div className="flex gap-1 mb-5 border-b border-gray-200">
            <button
              onClick={() => setActiveTab("project")}
              className={`px-5 py-3 text-sm font-semibold transition-colors relative ${activeTab === "project" ? "text-[#856BFF]" : "text-gray-500 hover:text-gray-700"
                }`}
              style={{
                background: 'transparent',
                border: 'none',
                outline: 'none'
              }}
            >
              Project Level Reconciliation
              {activeTab === "project" && (
                <span className="absolute bottom-0 left-0 right-0 h-[2px] bg-[#856BFF]" />
              )}
            </button>
            <button
              onClick={() => setActiveTab("employee")}
              className={`px-5 py-3 text-sm font-semibold transition-colors relative ${activeTab === "employee" ? "text-[#856BFF]" : "text-gray-500 hover:text-gray-700"
                }`}
              style={{
                background: 'transparent',
                border: 'none',
                outline: 'none'
              }}
            >
              Employee Level Reconciliation
              {activeTab === "employee" && (
                <span className="absolute bottom-0 left-0 right-0 h-[2px] bg-[#856BFF]" />
              )}
            </button>
          </div>

          {/* ── Tab Contents ── */}
          {loading ? (
            <div className="flex flex-col items-center justify-center py-16 gap-3">
              <div className="w-9 h-9 border-4 border-gray-100 border-t-[#856BFF] rounded-full animate-spin" />
              <span className="text-sm text-gray-500">Refreshing Reconciliation Data…</span>
            </div>
          ) : (
            <>
              {/* ─── Project Tab ─── */}
              {activeTab === "project" && (
                <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden mb-9">
                  <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100 flex-wrap gap-3">
                    <span className="font-semibold text-[191B23] text-[20px]">Project Breakdown</span>
                    <div className="flex items-center gap-3 flex-wrap">
                      <div className="relative">
                        <SearchIcon className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                        <input
                          type="text"
                          placeholder="Search projects..."
                          value={projectSearch}
                          onChange={(e) => setProjectSearch(e.target.value)}
                          className="w-56 pl-9 pr-3.5 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#856BFF]/30"
                        />
                      </div>
                      <button
                        onClick={() => exportProjectLevelExcel(filters)}
                        className="flex items-center gap-1.5 px-3.5 py-2 bg-[#856BFF] hover:bg-[#7556ff] text-white rounded-lg text-xs font-semibold shadow-sm transition-colors"
                      >
                        <DownloadIcon className="w-4 h-4" color="#ffffff" />
                        <span>Export Excel</span>
                      </button>
                      <span className="text-xs font-medium text-gray-400">{filteredProjects.length} projects</span>
                    </div>
                  </div>

                  <div className="w-full overflow-auto max-h-[calc(100vh-230px)]">
                    <table className="w-full border-collapse text-sm">
                      <thead className="sticky top-0 z-20 bg-[#EFF4FF]">
                        <tr className="border-b border-gray-200 bg-[#EFF4FF]" style={{ backgroundColor: '#EFF4FF' }}>
                          <th className="sticky top-0 z-20 bg-[#EFF4FF] px-4 py-3 text-left text-[12px] font-semibold text-[#434654] uppercase whitespace-nowrap shadow-sm">Sub Category</th>
                          <th className="sticky top-0 z-20 bg-[#EFF4FF] px-4 py-3 text-left text-[12px] font-semibold text-[#434654] uppercase whitespace-nowrap shadow-sm">Project Code</th>
                          <th className="sticky top-0 z-20 bg-[#EFF4FF] px-4 py-3 text-left text-[12px] font-bold text-[#434654] uppercase whitespace-nowrap shadow-sm">Project Name</th>
                          <th className="sticky top-0 z-20 bg-[#EFF4FF] px-4 py-3 text-right text-[12px] font-bold text-[#434654] uppercase whitespace-nowrap shadow-sm">
                            Est. Hours <span className="font-normal normal-case text-gray-400">(Days)</span>
                          </th>
                          <th className="sticky top-0 z-20 bg-[#EFF4FF] px-4 py-3 text-right text-[12px] font-bold text-[#434654] uppercase whitespace-nowrap shadow-sm">
                            Actual Hours <span className="font-normal normal-case text-gray-400">(Days)</span>
                          </th>
                          <th className="sticky top-0 z-20 bg-[#EFF4FF] px-4 py-3 text-left text-[12px] font-bold text-[#434654] uppercase whitespace-nowrap shadow-sm">Utilized %</th>
                          <th className="sticky top-0 z-20 bg-[#EFF4FF] px-4 py-3 text-right text-[12px] font-bold text-[#434654] uppercase whitespace-nowrap shadow-sm">
                            Variance <span className="font-normal normal-case text-gray-400">(Hrs / %)</span>
                          </th>
                          <th className="sticky top-0 z-20 bg-[#EFF4FF] px-4 py-3 text-left text-[12px] font-bold text-[#434654] uppercase whitespace-nowrap shadow-sm">Status</th>
                          <th className="sticky top-0 z-20 bg-[#EFF4FF] px-4 py-3 text-center text-[12px] font-bold text-[#434654] uppercase whitespace-nowrap shadow-sm">Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {paginatedProjects.length === 0 ? (
                          <tr>
                            <td colSpan={9} className="text-center py-10 text-gray-400">
                              No reconciliation records match current filters.
                            </td>
                          </tr>
                        ) : (
                          paginatedProjects.map((item) => {
                            const estimatedHours = parseFloat(item.estimated_hours) || 0;
                            const actualHours = parseFloat(item.actual_hours) || 0;
                            let usagePercentage = 0;
                            if (estimatedHours > 0) {
                              usagePercentage = (actualHours / estimatedHours) * 100;
                            }

                            let rowBgClass = "";
                            let barColor = "#856BFF";
                            let pctColor = "text-gray-800";

                            if (usagePercentage > 100) {
                              rowBgClass = "bg-red-50/50";
                              barColor = "#dc2626";
                              pctColor = "text-red-600";
                            } else if (usagePercentage >= 70 && usagePercentage <= 100) {
                              rowBgClass = "bg-emerald-50/30";
                              barColor = "#059669";
                              pctColor = "text-emerald-600";
                            } else if (usagePercentage >= 50 && usagePercentage < 70) {
                              rowBgClass = "bg-sky-50/30";
                              barColor = "#0284c7";
                              pctColor = "text-sky-600";
                            } else if (usagePercentage > 0 && usagePercentage < 50) {
                              rowBgClass = "bg-amber-50/40";
                              barColor = "#d97706";
                              pctColor = "text-amber-600";
                            }

                            return (
                              <tr
                                key={item.project_id || item.project_code}
                                className={`border-b border-gray-100 hover:bg-gray-50 transition-colors ${rowBgClass}`}
                              >
                                <td className="px-4 py-3text-nowrap">
                                  <span className={`inline-block font-mono text-[13px] font-medium px-2.5 py-1 rounded-md ${item.sub_category === 'No Subcategory' || !item.sub_category
                                      ? 'text-gray-500 bg-gray-100 border border-gray-300'
                                      : 'text-[#856BFF] bg-[#EDEDF8] border border-[#856BFF]/20'
                                    }`}>
                                    {item.sub_category || 'No Subcategory'}
                                  </span>
                                </td>
                                <td className="px-4 py-3 text-[14px] font-bold text-[#856BFF]">
                                 
                                    {item.project_code || "—"}
                                 
                                </td>
                                <td className="px-4 py-3 text-gray-800">{item.project_name}</td>
                                <td className="px-4 py-3 text-right font-semibold text-gray-900 whitespace-nowrap">
                                  {formatNumber(item.estimated_hours)}{" "}
                                  <span className="text-gray-400 font-normal">({formatNumber(item.estimated_days, 1)})</span>
                                </td>
                                <td className="px-4 py-3 text-right font-semibold text-[#856BFF] whitespace-nowrap">
                                  {formatNumber(item.actual_hours)}{" "}
                                  <span className="text-gray-400 font-normal">({formatNumber(item.actual_days, 1)})</span>
                                </td>
                                <td className="px-4 py-3">
                                  <div className="flex items-center gap-2 min-w-[110px]">
                                    <div className="w-16 h-1.5 rounded-full bg-gray-100 overflow-hidden">
                                      <div
                                        className="h-full rounded-full transition-all duration-500"
                                        style={{ width: `${Math.min(usagePercentage, 100)}%`, backgroundColor: barColor }}
                                      />
                                    </div>
                                    <span className={`text-xs font-bold ${pctColor}`}>
                                      {estimatedHours > 0 ? `${formatNumber(usagePercentage, 1)}%` : "N/A"}
                                    </span>
                                  </div>
                                </td>
                                <td className="px-4 py-3 text-right whitespace-nowrap">
                                  <div className={`font-semibold ${Number(item.variance_hours) > 0 ? "text-green-600" : "text-red-500"}`}>
                                    {Number(item.variance_hours) > 0 ? "+" : ""}
                                    {formatNumber(item.variance_hours)}
                                  </div>
                                  <div className={`text-[11px] ${Number(item.variance_pct) > 0 ? "text-green-600" : "text-red-500"}`}>
                                    ({Number(item.variance_pct) > 0 ? "+" : ""}
                                    {formatNumber(item.variance_pct, 1)}%)
                                  </div>
                                </td>
                                <td className="px-4 py-3">
                                  <StatusPill
                                    status={item.status}
                                    utilizationPct={estimatedHours > 0 ? usagePercentage : undefined}
                                    inSystem={item.in_system !== false}
                                    estimatedHours={estimatedHours}
                                  />
                                </td>
                                <td className="px-4 py-3 text-center">
                                  <button
                                    onClick={() => handleViewProjectDetails(item)}
                                    className="inline-flex items-center justify-center hover:opacity-70 transition-opacity"
                                    title="View Details"
                                    style={{ background: 'transparent', border: 'none', outline: 'none' }}
                                  >
                                    <EyeIcon className="w-[20px] h-[20px]" color="#856BFF" />
                                  </button>
                                </td>
                              </tr>
                            );
                          })
                        )}
                      </tbody>
                    </table>
                  </div>

                  {/* Pagination */}
                  {filteredProjects.length > 0 && (
                    <Pagination
                      page={projectPage}
                      pageSize={projectPageSize}
                      total={filteredProjects.length}
                      entryLabel="entries"
                      onPageChange={handleProjectPageChange}
                      onPageSizeChange={handleProjectPageSizeChange}
                    />
                  )}
                </div>
              )}

              {/* ─── Employee Tab ─── */}
              {activeTab === "employee" && (
                <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden mb-9">
                  <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100 flex-wrap gap-3">
                    <span className="font-semibold text-[#191B23] text-[20px]">Employee Level Analysis</span>
                    <div className="flex items-center gap-3 flex-wrap">
                      <div className="relative">
                        <SearchIcon className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                        <input
                          type="text"
                          placeholder="Find employee..."
                          value={employeeSearch}
                          onChange={(e) => setEmployeeSearch(e.target.value)}
                          className="w-56 pl-9 pr-3.5 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#856BFF]/30"
                        />
                      </div>
                      <button
                        onClick={() => exportEmployeeLevelExcel(filters)}
                        className="flex items-center gap-1.5 px-3.5 py-2 bg-[#856BFF] hover:bg-[#775bf8] text-white rounded-lg text-xs font-semibold shadow-sm transition-colors"
                      >
                        <DownloadIcon className="w-4 h-4" color="#ffffff" />
                        <span>Export Excel</span>
                      </button>
                      <span className="text-xs font-medium text-gray-400">Showing {filteredEmployees.length} assignments</span>
                    </div>
                  </div>

                  <div className="w-full overflow-auto max-h-[calc(100vh-230px)]">
                    <table className="w-full border-collapse text-sm">
                      <thead className="sticky top-0 z-20 bg-[#EFF4FF]">
                        <tr className="border-b border-gray-200 bg-[#EFF4FF]" style={{ backgroundColor: '#EFF4FF' }}>
                          <th className="sticky top-0 z-20 bg-[#EFF4FF] px-4 py-3 text-left text-[12px] font-bold text-[#434654] uppercase whitespace-nowrap shadow-sm">Employee</th>
                          <th className="sticky top-0 z-20 bg-[#EFF4FF] px-4 py-3 text-left text-[12px] font-bold text-[#434654] uppercase whitespace-nowrap shadow-sm">Sub Category</th>
                          {/* <th className="px-4 py-3 text-left text-[12px] font-bold text-[#434654] uppercase whitespace-nowrap">Reporting Manager</th> */}
                          <th className="sticky top-0 z-20 bg-[#EFF4FF] px-4 py-3 text-left text-[12px] font-bold text-[#434654] uppercase whitespace-nowrap shadow-sm">Project Code</th>
                          <th className="sticky top-0 z-20 bg-[#EFF4FF] px-4 py-3 text-right text-[12px] font-bold text-[#434654] uppercase whitespace-nowrap shadow-sm">Assigned (H)</th>
                          <th className="sticky top-0 z-20 bg-[#EFF4FF] px-4 py-3 text-right text-[12px] font-bold text-[#434654] uppercase whitespace-nowrap shadow-sm">Actual (H)</th>
                          <th className="sticky top-0 z-20 bg-[#EFF4FF] px-4 py-3 text-left text-[12px] font-bold text-[#434654] uppercase whitespace-nowrap shadow-sm">Utilization %</th>
                          <th className="sticky top-0 z-20 bg-[#EFF4FF] px-4 py-3 text-right text-[12px] font-bold text-[#434654] uppercase whitespace-nowrap shadow-sm">Variance %</th>
                          <th className="sticky top-0 z-20 bg-[#EFF4FF] px-4 py-3 text-left text-[12px] font-bold text-[#434654] uppercase whitespace-nowrap shadow-sm">Status</th>
                        </tr>
                      </thead>
                      <tbody>
                        {paginatedEmployees.length === 0 ? (
                          <tr>
                            <td colSpan={9} className="text-center py-10 text-gray-400">
                              No employee assignments found matching current filters.
                            </td>
                          </tr>
                        ) : (
                          paginatedEmployees.map((item, idx) => {
                            const assigned = parseFloat(item.assigned_hours) || 0;
                            const actual = parseFloat(item.actual_hours) || 0;
                            let utilizationPct = 0;
                            let utilizationDisplay = "0%";

                            if (assigned > 0) {
                              utilizationPct = (actual / assigned) * 100;
                              utilizationDisplay = formatNumber(utilizationPct, 1) + "%";
                            } else if (actual > 0 && assigned === 0) {
                              utilizationDisplay = "N/A";
                            }

                            let rowBgClass = "";
                            let barColor = "#9ca3af";
                            let pctColor = "text-gray-500";
                            let utilTag = "";

                            if (utilizationPct > 100) {
                              rowBgClass = "bg-red-50";
                              barColor = "#dc2626";
                              pctColor = "text-red-600";
                              utilTag = "Overflow";
                            } else if (utilizationPct >= 80 && utilizationPct < 100) {
                              rowBgClass = "bg-amber-50";
                              barColor = "#d97706";
                              pctColor = "text-amber-600";
                            } else if (utilizationPct > 0 && utilizationPct < 80) {
                              barColor = "#059669";
                              pctColor = "text-green-600";
                              utilTag = "Utilized";
                            }

                            return (
                              <tr key={idx} className={`border-b border-gray-100 hover:bg-gray-50 transition-colors ${rowBgClass}`}>
                                <td className="px-4 py-3">
                                  <div className="font-semibold text-gray-900">{item.employee_name}</div>
                                  <div className="text-[11px] text-gray-400">{item.employee_code || "—"}</div>
                                </td>
                                <td className="px-4 py-3">
  <span className={`inline-block font-mono text-[12px] font-medium px-2.5 py-1 rounded-md ${
    item.sub_category === 'No Subcategory' || !item.sub_category
      ? 'text-gray-500 bg-gray-100 border border-gray-300' 
      : 'text-[#856BFF] bg-[#EDEDF8] border border-[#856BFF]/20'
  }`}>
    {item.sub_category || 'No Subcategory'}
  </span>
</td>
                                {/* <td className="px-4 py-3 text-gray-600">{item.reporting_manager || "—"}</td> */}
                                <td className="px-4 py-3">
                                  <span className="text-xs text-gray-600">{item.project_code || "—"}</span>
                                </td>
                                <td className="px-4 py-3 text-right font-semibold text-gray-900">
                                  {formatNumber(item.assigned_hours)}
                                </td>
                                <td className="px-4 py-3 text-right font-semibold text-[#856BFF]">
                                  {formatNumber(item.actual_hours)}
                                </td>
                                <td className="px-4 py-3">
                                  <div className="flex items-center gap-2 min-w-[110px]">
                                    <div className="w-16 h-1.5 rounded-full bg-gray-100 overflow-hidden">
                                      <div
                                        className="h-full rounded-full transition-all duration-500"
                                        style={{ width: `${Math.min(utilizationPct, 100)}%`, backgroundColor: barColor }}
                                      />
                                    </div>
                                    <div>
                                      <div className={`text-xs font-bold ${pctColor}`}>{utilizationDisplay}</div>
                                      {utilTag && <div className={`text-[10px] ${pctColor}`}>{utilTag}</div>}
                                    </div>
                                  </div>
                                </td>
                                <td className="px-4 py-3 text-right whitespace-nowrap">
                                  <div className={`font-semibold ${Number(item.variance_hours) > 0 ? "text-green-600" : "text-red-500"}`}>
                                    {Number(item.variance_hours) > 0 ? "+" : ""}
                                    {formatNumber(item.variance_hours || 0)}
                                  </div>
                                  <div className={`text-[11px] ${Number(item.variance_pct) > 0 ? "text-green-600" : "text-red-500"}`}>
                                    ({Number(item.variance_pct) > 0 ? "+" : ""}
                                    {formatNumber(item.variance_pct, 1)}%)
                                  </div>
                                </td>
                                <td className="px-4 py-3">
  <EmployeeStatusPill 
    assignedHours={item.assigned_hours} 
    actualHours={item.actual_hours}
    status={item.status} 
  />
</td>
                              </tr>
                            );
                          })
                        )}
                      </tbody>
                    </table>
                  </div>

                  {/* Pagination */}
                  {filteredEmployees.length > 0 && (
                    <Pagination
                      page={employeePage}
                      pageSize={employeePageSize}
                      total={filteredEmployees.length}
                      entryLabel="entries"
                      onPageChange={handleEmployeePageChange}
                      onPageSizeChange={handleEmployeePageSizeChange}
                    />
                  )}
                </div>
              )}
            </>
          )}
        </>
      )}
    </div>
  );
};

export default ReconPage;