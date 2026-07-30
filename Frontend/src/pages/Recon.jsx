import React, { useEffect, useState, useCallback, useMemo } from "react";
import {
  getReconFilters,
  getReconDashboard,
  getProjectLevelRecon,
  getEmployeeLevelRecon,
  getProjectDetail,
} from "../api/recon.api";
import { Icon } from '@iconify/react';

// ─── Status colors (shared by pill + text variants) ─────────────
const STATUS_STYLES = {
  "On Track": { bg: "#d1fae5", text: "#059669" },
  "Over Utilized": { bg: "#fee2e2", text: "#dc2626" },
  "Under Utilized": { bg: "#fef3c7", text: "#d97706" },
  "Project Not Found": { bg: "#fee2e2", text: "#dc2626" },
  "No Estimate": { bg: "#fef3c7", text: "#d97706" },
  "Not Assigned": { bg: "#fef3c7", text: "#d97706" },
  "No Activity": { bg: "#f3f4f6", text: "#9ca3af" },
};

// Pill-style status badge — used on the Project Level table
const StatusPill = ({ status }) => {
  const c = STATUS_STYLES[status] || STATUS_STYLES["On Track"];
  return (
    <span
      className="inline-block px-2.5 py-1 rounded-md text-xs font-semibold whitespace-nowrap"
      style={{ backgroundColor: c.bg, color: c.text }}
    >
      {status}
    </span>
  );
};

// Plain-text status — used on the Employee Level table
const StatusText = ({ status }) => {
  const c = STATUS_STYLES[status] || STATUS_STYLES["On Track"];
  return (
    <span className="text-[11px] font-bold uppercase tracking-wide" style={{ color: c.text }}>
      {status}
    </span>
  );
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
    <div className="flex justify-between items-center px-5 py-4 border-t border-gray-100 flex-wrap gap-3" style={{ backgroundColor: '#EFF4FF' }}>
      <div className="text-xs text-gray-500">
        Showing {start} to {end} of {total} {entryLabel}
      </div>
      <div className="flex items-center gap-2">
        {onPageSizeChange && (
          <select
            value={pageSize}
            onChange={onPageSizeChange}
            className="px-2.5 py-1.5 border border-gray-200 rounded-md text-xs text-gray-600 focus:outline-none"
          >
            <option value={5}>5</option>
            <option value={10}>10</option>
            <option value={25}>25</option>
            <option value={50}>50</option>
          </select>
        )}
        <div className="flex items-center gap-1">
          <button
            onClick={() => onPageChange(page - 1)}
            disabled={page === 1}
            className="w-7 h-7 flex items-center justify-center rounded-md text-gray-400 disabled:opacity-30 disabled:cursor-not-allowed hover:bg-gray-100 hover:text-gray-600 transition-colors"
            aria-label="Previous page"
          >
            <ChevronLeftIcon className="w-10 h-10" />
          </button>
          {getPageNumbers().map((p) => (
            <button
              key={p}
              onClick={() => onPageChange(p)}
              className={`min-w-[28px] h-7 px-1.5 flex items-center justify-center rounded-md text-xs font-semibold transition-colors ${p === page ? "bg-[#856BFF] text-white" : "text-gray-500 hover:bg-gray-100"
                }`}
            >
              {p}
            </button>
          ))}
          <button
            onClick={() => onPageChange(page + 1)}
            disabled={page >= totalPages}
            className="w-7 h-7 flex items-center justify-center rounded-md text-gray-400 disabled:opacity-30 disabled:cursor-not-allowed hover:bg-gray-100 hover:text-gray-600 transition-colors"
            aria-label="Next page"
          >
            <ChevronRightIcon className="w-10 h-10" />
          </button>
        </div>
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
        (item.project_name && item.project_name.toLowerCase().includes(search))
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
        (item.project_name && item.project_name.toLowerCase().includes(search))
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
    <div className="max-w-[1400px] mx-auto p-6 font-sans bg-gray-50 min-h-screen">
      {/* ── If Detail View is Active, Show Only Project Details ── */}
      {showDetailView ? (
        <div className="px-4 pt-4">
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
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5 mt-6">
                {/* Estimated */}
                <div className="relative bg-white rounded-2xl shadow-sm border border-gray-100 px-5 py-2 overflow-hidden">
                  <ClockIcon className="absolute top-5 right-5 w-10 h-10 text-gray-200" />

                  <p className="text-xs text-gray-500 font-medium p-2">
                    Estimated Effort
                  </p>

                  <h3 className="mt-3 text-4xl font-semibold text-gray-900">
                    {Number(projectDetail.project?.estimated_hours).toLocaleString()}
                    <span className="text-base font-normal text-gray-500 ml-1">
                      Hours
                    </span>
                  </h3>

                  <p className="mt-2 text-sm text-gray-500">
                    ~ {Number(projectDetail.project?.estimated_days).toLocaleString()} Work Days
                  </p>
                </div>

                {/* Actual */}
                <div className="relative bg-white rounded-2xl shadow-sm border border-gray-100 px-5 py-2overflow-hidden">
                  <HistoryIcon className="absolute top-5 right-5 w-10 h-10 text-gray-200" />

                  <p className="text-xs text-gray-500 font-medium p-2">
                    Actual Logged
                  </p>

                  <h3 className="mt-3 text-4xl font-semibold text-gray-900">
                    {Number(projectDetail.project?.actual_hours).toLocaleString()}
                    <span className="text-base font-normal text-gray-500 ml-1">
                      Hours
                    </span>
                  </h3>

                  <p className="mt-2 text-sm text-gray-500">
                    ~ {Number(projectDetail.project?.actual_days).toLocaleString()} Work Days
                  </p>
                </div>

                {/* Variance */}
                <div className="relative bg-white rounded-2xl shadow-sm border border-gray-100 px-5 py-2 pl-6 overflow-hidden">
                  <div
                    className={`absolute left-0 top-0 h-full w-1 ${Number(projectDetail.project?.variance_hours) < 0
                      ? "bg-red-500"
                      : "bg-green-500"
                      }`}
                  />

                  <p className="text-xs text-gray-500 font-medium p-2">
                    Total Variance
                  </p>

                  <h3
                    className={`mt-3 text-4xl font-semibold ${Number(projectDetail.project?.variance_hours) < 0
                      ? "text-red-600"
                      : "text-green-600"
                      }`}
                  >
                    {Number(projectDetail.project?.variance_hours) > 0 ? "+" : ""}
                    {Number(projectDetail.project?.variance_hours).toLocaleString()}

                    <span className="text-base font-normal ml-1">
                      Hrs
                    </span>
                  </h3>

                  <p
                    className={`mt-2 text-sm ${Number(projectDetail.project?.variance_hours) < 0
                      ? "text-red-500"
                      : "text-green-500"
                      }`}
                  >
                    ({projectDetail.project?.variance_pct}%)
                    {" "}
                    {Number(projectDetail.project?.variance_hours) < 0
                      ? "Over-allocated"
                      : "Under-allocated"}
                  </p>
                </div>

                {/* Resources */}
                <div className="relative bg-white rounded-2xl shadow-sm border border-gray-100 px-5 py-2 overflow-hidden">
                  <UsersIcon className="absolute top-5 right-5 w-10 h-10 text-gray-200" />

                  <p className="text-xs text-gray-500 font-medium p-2">
                    Active Resources
                  </p>

                  <h3 className="mt-3 text-4xl font-semibold text-[#7C5CFC]">
                    {projectDetail.employeeSummary?.length || 0}

                    <span className="text-base font-normal text-gray-500 ml-1">
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

              {/* Employee-wise Breakdown */}
              <div className=" bg-[#FFFFFF] rounded-lg mt-6 px-2">
                <div className="flex items-center justify-between mb-3 flex-wrap gap-3">
                  <span className="font-bold text-[#191B23] text-[18px]">Resource Breakdown &amp; Timesheets</span>
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

                <div className="w-full overflow-x-auto rounded-xl border border-gray-100">
                  <table className="w-full border-collapse text-sm">
                    <thead>
                       <tr style={{ backgroundColor: '#EFF4FF' }}>
                        <th className="px-3 py-3 text-left text-[11px] font-bold text-[#434654] uppercase">Employee</th>
                        <th className="px-3 py-3 text-left text-[11px] font-bold text-[#434654] uppercase">Role</th>
                        <th className="px-3 py-3 text-left text-[11px] font-bold text-[#434654] uppercase">Assigned (H/D)</th>
                        <th className="px-3 py-3 text-left text-[11px] font-bold text-[#434654] uppercase">Actual (H/D)</th>
                        <th className="px-3 py-3 text-left text-[11px] font-bold text-[#434654] uppercase">Utilization %</th>
                        <th className="px-3 py-3 text-left text-[11px] font-bold text-[#434654] uppercase">Variance (H/%)</th>
                        <th className="px-3 py-3 text-left text-[11px] font-bold text-[#434654] uppercase">Status</th>
                        <th className="px-3 py-3 text-left text-[11px] font-bold text-[#434654] uppercase">Timesheet Status</th>
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
                              utilizationDisplay = utilPct.toFixed(1) + "%";
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
                                  <div className="font-semibold">{Number(e.assigned_hours).toLocaleString()}</div>
                                  <div className="text-[11px] text-gray-400">({Number(e.assigned_days).toFixed(1)}D)</div>
                                </td>
                                <td className="px-3 py-2.5 text-gray-800">
                                  <div className="font-semibold">{Number(e.actual_hours).toLocaleString()}</div>
                                  <div className="text-[11px] text-gray-400">({Number(e.actual_days).toFixed(1)}D)</div>
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
                                    {Number(e.variance_hours).toLocaleString()}
                                  </div>
                                  <div className={`text-[11px] ${Number(e.variance_pct) > 0 ? "text-green-600" : "text-red-500"}`}>
                                    ({Number(e.variance_pct) > 0 ? "+" : ""}
                                    {e.variance_pct}%)
                                  </div>
                                </td>
                                <td className="px-3 py-2.5">
                                  <span
                                    className="inline-block px-2 py-0.5 rounded-full text-[11px] font-semibold"
                                    style={{
                                      backgroundColor: e.assignment_status === "Assigned" ? "#d1fae5" : "#fee2e2",
                                      color: e.assignment_status === "Assigned" ? "#059669" : "#dc2626",
                                    }}
                                  >
                                    {e.assignment_status || "Not Assigned"}
                                  </span>
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
              <h1 className="text-2xl font-extrabold text-[#191B23] m-0">Recon Dashboard</h1>
              <p className="text-sm text-gray-500 mt-1">
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

          {/* ── Project Status + Hours Summary cards ── */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 mb-6">
            {/* Project Status */}
            <div className="relative bg-white rounded-2xl border border-gray-100 shadow-sm p-5 overflow-hidden">
              <span className="absolute left-0 top-0 bottom-0 w-1 bg-[#856BFF]" />
              <div className="flex items-center gap-2 mb-4">
                  <span className="w-7 h-7 rounded-md bg-[#856BFF]/10 flex items-center justify-center text-[#856BFF] text-sm">
                    <Icon icon="material-symbols:assignment" width="30" height="30" color="#856BFF" />
                  </span>                <span className="text-[20px] font-bold text-[#191B23] text-sm">Project Status</span>
              </div>
              <div className="grid grid-cols-3 gap-x-4 gap-y-5">
                <div>
                  <div className="text-[12px] font-semibold text-[#64748B] uppercase tracking-wide">Total Projects</div>
                  <div className="text-xl font-extrabold text-gray-900 mt-1">{dashboardData.total_projects}</div>
                </div>
                <div>
                  <div className="text-[12px] font-semibold text-[#64748B]  uppercase tracking-wide">With Estimates</div>
                  <div className="text-xl font-extrabold text-green-600 mt-1">{dashboardData.projects_with_estimates}</div>
                </div>
                <div>
                  <div className="text-[12px] font-semibold text-[#64748B]  uppercase tracking-wide">Without Estimates</div>
                  <div className="text-xl font-extrabold text-amber-500 mt-1">{dashboardData.projects_without_estimates}</div>
                </div>
                <div>
                  <div className="text-[12px] font-semibold text-[#64748B]  uppercase tracking-wide">With Timesheets</div>
                  <div className="text-xl font-extrabold text-[#856BFF] mt-1">{dashboardData.projects_with_timesheets}</div>
                </div>
                <div>
                  <div className="text-[12px] font-semibold text-[#64748B] uppercase tracking-wide">Without Timesheets</div>
                  <div className="text-xl font-extrabold text-red-500 mt-1">{dashboardData.projects_without_timesheets}</div>
                </div>
              </div>
            </div>

            {/* Hours Summary */}
            <div className="relative bg-white rounded-2xl border border-gray-100 shadow-sm p-5 overflow-hidden">
              <span className="absolute left-0 top-0 bottom-0 w-1 bg-[#856BFF]" />
              <div className="flex items-center gap-2 mb-4">
                <span className="w-7 h-7 rounded-md bg-[#856BFF]/10 flex items-center justify-center text-[#856BFF] text-sm">
  <Icon icon="material-symbols:schedule" width="30" height="30" color="#856BFF" />
</span>
                <span className="text-[20px] font-bold text-[#191B23] text-sm">Hours Summary</span>
              </div>
              <div className="grid grid-cols-3 gap-4 mb-5">
                <div>
                  <div className="text-[12px] font-semibold text-[#64748B] uppercase tracking-wide">Total Estimated</div>
                  <div className="text-xl font-extrabold text-gray-900 mt-1">
                    {Number(dashboardData.total_estimated_hours).toLocaleString()}
                    <span className="text-xs font-normal text-gray-400"> hrs</span>
                  </div>
                </div>
                <div>
                  <div className="text-[12px] font-semibold text-[#64748B]  uppercase tracking-wide">Total Actual</div>
                  <div className="text-xl font-extrabold text-green-600 mt-1">
                    {Number(dashboardData.total_actual_hours).toLocaleString()}
                    <span className="text-xs font-normal text-gray-400"> hrs</span>
                  </div>
                </div>
                <div>
                  <div className="text-[12px] font-semibold text-[#64748B]  uppercase tracking-wide">Total Variance</div>
                  <div className={`text-xl font-extrabold mt-1 ${Number(dashboardData.total_variance_hours) > 0 ? "text-red-500" : "text-green-600"}`}>
                    {Number(dashboardData.total_variance_hours) > 0 ? "+" : ""}
                    {Number(dashboardData.total_variance_hours).toLocaleString()}
                    <span className="text-xs font-normal text-gray-400"> hrs</span>
                  </div>
                </div>
              </div>

              <div className="border-t border-gray-100 pt-4">
                <div className="flex items-center gap-2 mb-3">
                  <span className="w-10 h-10 rounded-md bg-[#856BFF]/10 flex items-center justify-center text-[#856BFF] text-xs">
  <Icon icon="material-symbols:bar-chart" width="20" height="20" color="#856BFF" />
</span>
                  <span className="text-[20px] font-bold text-[#191B23]  text-xs">Utilization Summary</span>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <div className="text-[12px] font-semibold text-[#64748B]  uppercase tracking-wide">Overutilized Projects</div>
                    <div className="text-lg font-extrabold text-red-500 mt-1">{dashboardData.overutilized_count}</div>
                  </div>
                  <div>
                    <div className="text-[12px] font-semibold text-[#64748B]  uppercase tracking-wide">Underutilized Projects</div>
                    <div className="text-lg font-extrabold text-green-600 mt-1">{dashboardData.underutilized_count}</div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* ── Filters ── */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 mb-6">
            <div className="flex items-center justify-between mb-4">
              <span className="flex items-center gap-2 font-bold text-gray-900 text-sm">
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
  <button
    onClick={() => setActiveTab("unit")}
    className={`px-5 py-3 text-sm font-semibold transition-colors relative ${activeTab === "unit" ? "text-[#856BFF]" : "text-gray-500 hover:text-gray-700"
      }`}
    style={{
      background: 'transparent',
      border: 'none',
      outline: 'none'
    }}
  >
    Unit Wise Reconciliation
    {activeTab === "unit" && (
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
                    <span className="font-bold text-gray-900 text-[15px]">Project Breakdown</span>
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
                      <span className="text-xs font-medium text-gray-400">{filteredProjects.length} projects</span>
                    </div>
                  </div>

                  <div className="w-full overflow-x-auto">
                    <table className="w-full border-collapse text-sm">
                      <thead>
                         <tr style={{ backgroundColor: '#EFF4FF' }}>
                          <th className="px-4 py-3 text-left text-[11px] font-bold text-gray-500 uppercase whitespace-nowrap">Project Code</th>
                          <th className="px-4 py-3 text-left text-[11px] font-bold text-gray-500 uppercase whitespace-nowrap">Project Name</th>
                          <th className="px-4 py-3 text-right text-[11px] font-bold text-gray-500 uppercase whitespace-nowrap">
                            Est. Hours <span className="font-normal normal-case text-gray-400">(Days)</span>
                          </th>
                          <th className="px-4 py-3 text-right text-[11px] font-bold text-gray-500 uppercase whitespace-nowrap">
                            Actual Hours <span className="font-normal normal-case text-gray-400">(Days)</span>
                          </th>
                          <th className="px-4 py-3 text-left text-[11px] font-bold text-gray-500 uppercase whitespace-nowrap">Utilized %</th>
                          <th className="px-4 py-3 text-right text-[11px] font-bold text-gray-500 uppercase whitespace-nowrap">
                            Variance <span className="font-normal normal-case text-gray-400">(Hrs / %)</span>
                          </th>
                          <th className="px-4 py-3 text-left text-[11px] font-bold text-gray-500 uppercase whitespace-nowrap">Status</th>
                          <th className="px-4 py-3 text-center text-[11px] font-bold text-gray-500 uppercase whitespace-nowrap">Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {paginatedProjects.length === 0 ? (
                          <tr>
                            <td colSpan={8} className="text-center py-10 text-gray-400">
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
                              rowBgClass = "bg-red-50";
                              barColor = "#dc2626";
                              pctColor = "text-red-600";
                            } else if (usagePercentage >= 80 && usagePercentage < 100) {
                              rowBgClass = "bg-amber-50";
                              barColor = "#d97706";
                              pctColor = "text-amber-600";
                            } else if (usagePercentage > 0) {
                              barColor = "#10b981";
                            }

                            return (
                              <tr
                                key={item.project_id || item.project_code}
                                className={`border-b border-gray-100 hover:bg-gray-50 transition-colors ${rowBgClass}`}
                              >
                                <td className="px-4 py-3">
                                  <button
                                    onClick={() => handleViewProjectDetails(item)}
                                    className="text-xs font-semibold text-[#856BFF] hover:underline text-left"
                                  >
                                    {item.project_code || "—"}
                                  </button>
                                </td>
                                <td className="px-4 py-3 text-gray-800">{item.project_name}</td>
                                <td className="px-4 py-3 text-right font-semibold text-gray-900 whitespace-nowrap">
                                  {Number(item.estimated_hours).toLocaleString()}{" "}
                                  <span className="text-gray-400 font-normal">({Number(item.estimated_days).toLocaleString()})</span>
                                </td>
                                <td className="px-4 py-3 text-right font-semibold text-[#856BFF] whitespace-nowrap">
                                  {Number(item.actual_hours).toLocaleString()}{" "}
                                  <span className="text-gray-400 font-normal">({Number(item.actual_days).toLocaleString()})</span>
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
                                      {estimatedHours > 0 ? `${usagePercentage.toFixed(1)}%` : "N/A"}
                                    </span>
                                  </div>
                                </td>
                                <td className="px-4 py-3 text-right whitespace-nowrap">
                                  <div className={`font-semibold ${Number(item.variance_hours) > 0 ? "text-green-600" : "text-red-500"}`}>
                                    {Number(item.variance_hours) > 0 ? "+" : ""}
                                    {Number(item.variance_hours).toLocaleString()}
                                  </div>
                                  <div className={`text-[11px] ${Number(item.variance_pct) > 0 ? "text-green-600" : "text-red-500"}`}>
                                    ({Number(item.variance_pct) > 0 ? "+" : ""}
                                    {item.variance_pct}%)
                                  </div>
                                </td>
                                <td className="px-4 py-3">
                                  <StatusPill status={item.status} />
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
                    <span className="font-bold text-gray-900 text-[15px]">Employee Level Analysis</span>
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
                      <span className="text-xs font-medium text-gray-400">Showing {filteredEmployees.length} assignments</span>
                    </div>
                  </div>

                  <div className="w-full overflow-x-auto">
                    <table className="w-full border-collapse text-sm">
                      <thead>
                         <tr style={{ backgroundColor: '#EFF4FF' }}>
                          <th className="px-4 py-3 text-left text-[11px] font-bold text-gray-500 uppercase whitespace-nowrap">Employee</th>
                          {/* <th className="px-4 py-3 text-left text-[11px] font-bold text-gray-500 uppercase whitespace-nowrap">Reporting Manager</th> */}
                          <th className="px-4 py-3 text-left text-[11px] font-bold text-gray-500 uppercase whitespace-nowrap">Project Code</th>
                          <th className="px-4 py-3 text-right text-[11px] font-bold text-gray-500 uppercase whitespace-nowrap">Assigned (H)</th>
                          <th className="px-4 py-3 text-right text-[11px] font-bold text-gray-500 uppercase whitespace-nowrap">Actual (H)</th>
                          <th className="px-4 py-3 text-left text-[11px] font-bold text-gray-500 uppercase whitespace-nowrap">Utilization %</th>
                          <th className="px-4 py-3 text-right text-[11px] font-bold text-gray-500 uppercase whitespace-nowrap">Variance %</th>
                          <th className="px-4 py-3 text-left text-[11px] font-bold text-gray-500 uppercase whitespace-nowrap">Status</th>
                        </tr>
                      </thead>
                      <tbody>
                        {paginatedEmployees.length === 0 ? (
                          <tr>
                            <td colSpan={8} className="text-center py-10 text-gray-400">
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
                              utilizationDisplay = utilizationPct.toFixed(1) + "%";
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
                              utilTag = "Optimized";
                            }

                            return (
                              <tr key={idx} className={`border-b border-gray-100 hover:bg-gray-50 transition-colors ${rowBgClass}`}>
                                <td className="px-4 py-3">
                                  <div className="font-semibold text-gray-900">{item.employee_name}</div>
                                  <div className="text-[11px] text-gray-400">{item.employee_code || "—"}</div>
                                </td>
                                {/* <td className="px-4 py-3 text-gray-600">{item.reporting_manager || "—"}</td> */}
                                <td className="px-4 py-3">
                                  <span className="text-xs text-gray-600">{item.project_code || "—"}</span>
                                </td>
                                <td className="px-4 py-3 text-right font-semibold text-gray-900">
                                  {Number(item.assigned_hours).toLocaleString()}
                                </td>
                                <td className="px-4 py-3 text-right font-semibold text-[#856BFF]">
                                  {Number(item.actual_hours).toLocaleString()}
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
                                    {Number(item.variance_hours || 0).toLocaleString()}
                                  </div>
                                  <div className={`text-[11px] ${Number(item.variance_pct) > 0 ? "text-green-600" : "text-red-500"}`}>
                                    {Number(item.variance_pct) > 0 ? "+" : ""}
                                    {item.variance_pct}%
                                  </div>
                                </td>
                                <td className="px-4 py-3">
                                  <StatusText status={item.status} />
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

              {/* ─── Unit Wise Tab ─── */}
              {activeTab === "unit" && (
                <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden mb-9">
                  {/* Header */}
                  <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100 flex-wrap gap-3">
                    <div>
                      <span className="font-bold text-gray-900 text-[15px]">Unit Wise Analysis</span>
                      <p className="text-xs text-gray-400 mt-0.5">Compare estimated vs actual units consumed per task across projects</p>
                    </div>
                    <div className="flex items-center gap-3 flex-wrap">
                      <div className="relative">
                        <SearchIcon className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                        <input
                          type="text"
                          placeholder="Search project or task..."
                          value={unitSearch}
                          onChange={(e) => { setUnitSearch(e.target.value); setUnitPage(1); }}
                          className="w-56 pl-9 pr-3.5 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#856BFF]/30"
                        />
                      </div>

                    </div>
                  </div>

                  {/* Summary chips */}
                  <div className="flex gap-3 flex-wrap px-5 py-3 border-b border-gray-50 bg-gray-50/60">
                    {[
                      { label: "Total Tasks", value: "—", color: "#6366f1" },
                      { label: "Est. Units", value: "—", color: "#0ea5e9" },
                      { label: "Actual Units", value: "—", color: "#10b981" },
                      { label: "Over Budget", value: "—", color: "#ef4444" },
                      { label: "Under Budget", value: "—", color: "#f59e0b" },
                    ].map((chip) => (
                      <div key={chip.label} className="flex items-center gap-2 bg-white border border-gray-100 rounded-lg px-3 py-2 shadow-sm">
                        <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ backgroundColor: chip.color }} />
                        <span className="text-[11px] text-gray-500 font-medium">{chip.label}</span>
                        <span className="text-sm font-extrabold text-gray-800">{chip.value}</span>
                      </div>
                    ))}
                  </div>

                  {/* Table */}
                  <div className="w-full overflow-x-auto">
                    <table className="w-full border-collapse text-sm">
                      <thead>
                         <tr style={{ backgroundColor: '#EFF4FF' }}>
                          <th className="px-4 py-3 text-left text-[11px] font-bold text-gray-500 uppercase whitespace-nowrap">Project</th>
                          <th className="px-4 py-3 text-left text-[11px] font-bold text-gray-500 uppercase whitespace-nowrap">Employee</th>
                          <th className="px-4 py-3 text-left text-[11px] font-bold text-gray-500 uppercase whitespace-nowrap">Task / Activity</th>
                          <th className="px-4 py-3 text-left text-[11px] font-bold text-gray-500 uppercase whitespace-nowrap">Unit Type</th>
                          <th className="px-4 py-3 text-right text-[11px] font-bold text-gray-500 uppercase whitespace-nowrap">Est. Units</th>
                          <th className="px-4 py-3 text-right text-[11px] font-bold text-gray-500 uppercase whitespace-nowrap">Actual Units</th>
                          <th className="px-4 py-3 text-left text-[11px] font-bold text-gray-500 uppercase whitespace-nowrap">Utilization %</th>
                          <th className="px-4 py-3 text-right text-[11px] font-bold text-gray-500 uppercase whitespace-nowrap">Variance</th>
                          <th className="px-4 py-3 text-left text-[11px] font-bold text-gray-500 uppercase whitespace-nowrap">Status</th>
                        </tr>
                      </thead>
                      <tbody>
                        {/* Empty state — replace with real data map once API is wired */}
                        <tr>
                          <td colSpan={9} className="py-16 text-center">
                            <div className="flex flex-col items-center gap-3">
                                  <div className="w-12 h-12 rounded-full bg-[#856BFF]/10 flex items-center justify-center">
                                    <Icon icon="material-symbols:grid-view" width="24" height="24" color="#856BFF" />
                                  </div>
                              <div>
                                <p className="text-sm font-semibold text-gray-700">Unit Wise Reconciliation</p>

                              </div>

                            </div>
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </div>

                  {/* Pagination placeholder */}
                 <div className="flex justify-between items-center px-5 py-4 border-t border-gray-100" style={{ backgroundColor: '#EFF4FF' }}>
                    <span className="text-xs text-gray-400">Showing 0 to 0 of 0 entries</span>
                    <div className="flex items-center gap-2">
                      <select
                        value={unitPageSize}
                        onChange={(e) => { setUnitPageSize(parseInt(e.target.value)); setUnitPage(1); }}
                        className="px-2.5 py-1.5 border border-gray-200 rounded-md text-xs text-gray-600 focus:outline-none"
                      >
                        {[5, 10, 25, 50].map((n) => <option key={n} value={n}>{n}</option>)}
                      </select>
                      <div className="flex items-center gap-1">
                        <button
                          disabled
                          className="w-7 h-7 flex items-center justify-center rounded-md text-gray-300 disabled:opacity-30 disabled:cursor-not-allowed"
                        >
                          <ChevronLeftIcon className="w-10 h-10" />
                        </button>
                        <button className="min-w-[28px] h-7 px-1.5 flex items-center justify-center rounded-md text-xs font-semibold bg-[#856BFF] text-white">
                          1
                        </button>
                        <button
                          disabled
                          className="w-7 h-7 flex items-center justify-center rounded-md text-gray-300 disabled:opacity-30 disabled:cursor-not-allowed"
                        >
                          <ChevronRightIcon className="w-10 h-10" />
                        </button>
                      </div>
                    </div>
                  </div>
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