import React, { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import toast from "react-hot-toast";
import axios from "axios";
import { useSelector, useDispatch } from "react-redux";
import { fetchHrmsEmployees, selectAllEmployees, selectEmployeesLoading } from "../store/slices/employeeSlice";
import Cookies from "js-cookie";
import SearchableSelect from "../component/SearchableSelect";
import { Icon } from '@iconify/react';

const getUserRole = () => {
  try {
    const cookieUser = JSON.parse(Cookies.get('user') || 'null');
    if (cookieUser?.role) return cookieUser.role.toUpperCase();
  } catch { /* ignore */ }
  return (localStorage.getItem('role') || 'EMPLOYEE').toUpperCase();
};

const BASE_URL = import.meta.env.VITE_API_BASE_URL;
const getHeaders = () => ({ Authorization: `Bearer ${localStorage.getItem("token") || ""}` });

const ROLE_COLORS = {
  "BA": { bg: "#f8f8fd", border: "#7f5feb", text: "#7f5feb" },
  "Solution Architect": { bg: "#f8f8fd", border: "#7f5feb", text: "#7f5feb" },
  "UI/UX": { bg: "#f5f6ff", border: "#5352ed", text: "#5352ed" },
  "FE Dev": { bg: "#fffaf0", border: "#f39c12", text: "#f39c12" },
  "BE Dev": { bg: "#f6f8ff", border: "#3742fa", text: "#3742fa" },
  "Tester": { bg: "#fdf8ff", border: "#8e44ad", text: "#8e44ad" },
  "Deployment": { bg: "#fdf8ff", border: "#8e44ad", text: "#8e44ad" },
  "Warranty & Support": { bg: "#fdf8ff", border: "#8e44ad", text: "#8e44ad" },
  "Project Manager": { bg: "#eafaf1", border: "#2ecc71", text: "#2ecc71" },
};
const roleStyle = (role) => ROLE_COLORS[role] || { bg: "#f5f5f5", border: "#999", text: "#333" };

const AssignEmployee = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const isAdmin = getUserRole() === 'ADMIN';
  // const serviceDeliveryEmployees = useSelector((state) => state.auth.serviceDeliveryEmployees);
  const dispatch = useDispatch();
const hrmsEmployees = useSelector(selectAllEmployees);
const employeesLoading = useSelector(selectEmployeesLoading);

  // All context passed via navigation state
  const { modal, selProject, projectName = "", assignments: initAssignments = [], extraData: initExtraData = {} } = location.state || {};

  const [assignments, setAssignments] = useState(initAssignments);
  const [extraData, setExtraData] = useState(initExtraData);
  const [selUser, setSelUser] = useState("");
  const [units, setUnits] = useState("");
  const [days, setDays] = useState("");
  const [hours, setHours] = useState("");
  const [saving, setSaving] = useState(false);
  const [workload, setWorkload] = useState(null);
  const [loadingWorkload, setLoadingWorkload] = useState(false);
  const [editingRow, setEditingRow] = useState({});
  const [savingEdit, setSavingEdit] = useState({});
  const [workloadOpen, setWorkloadOpen] = useState(true);
  const [showExitModal, setShowExitModal] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null); // { id, user_name, task_name }
  const [deleting, setDeleting] = useState(false);
  const [collapsedProjects, setCollapsedProjects] = useState({});
  const toggleProject = (pid) => setCollapsedProjects(prev => ({ ...prev, [pid]: !prev[pid] }));

  const scrollToTop = () => {
    const scrollContainer = document.getElementById("main-content-scroll");
    if (scrollContainer) {
      scrollContainer.scrollTop = 0;
    }
    window.scrollTo(0, 0);
    document.documentElement.scrollTop = 0;
    document.body.scrollTop = 0;
  };

  // Ensure view scrolls to top when navigating into AssignEmployee
  useEffect(() => {
    scrollToTop();
  }, []);

  // Fetch HRMS employees when component mounts
useEffect(() => {
  if (hrmsEmployees.length === 0 && !employeesLoading) {
    dispatch(fetchHrmsEmployees());
  }
}, [dispatch, hrmsEmployees.length, employeesLoading]);

// Add this after your hrmsEmployees useEffect
useEffect(() => {
  if (hrmsEmployees.length > 0) {
    // console.log('🔍 All employees with departments:');
    hrmsEmployees.forEach(emp => {
      // console.log(`- ${emp.Employee_Name}: "${emp.Name_of_Department}" (length: ${emp.Name_of_Department?.length || 0})`);
    });
  }
}, [hrmsEmployees]);

  // Redirect if navigated directly without state
  useEffect(() => {
    if (!modal || !selProject) {
      navigate("/assignments", { replace: true });
    }
  }, [modal, selProject, navigate]);

  // Always fetch fresh assignments from server on mount (fixes stale data after delete + browser refresh)
  const refreshAssignments = async () => {
    if (!selProject) return;
    try {
      const res = await axios.get(`${BASE_URL}/api/assignments?projectId=${selProject}`, { headers: getHeaders() });
      setAssignments(res.data || []);
      setExtraData({});
    } catch { /* ignore */ }
  };

  useEffect(() => {
    if (selProject) {
      refreshAssignments();
    }
  }, [selProject]);

  // Fetch employee workload when user selected
  useEffect(() => {
    if (!selUser) { setWorkload(null); return; }
    const fetch = async () => {
      setLoadingWorkload(true);
      try {
        const res = await axios.get(
          `${BASE_URL}/api/assignments/employee-assignments?emp_id=${selUser}`,
          { headers: getHeaders() }
        );
        setWorkload(res.data?.success ? res.data.data : null);
      } catch { setWorkload(null); }
      finally { setLoadingWorkload(false); }
    };
    fetch();
  }, [selUser]);

  if (!modal || !selProject) return null;

  const existing = assignments
    .filter(a => a.role === modal.role && a.task_name === modal.task_name)
    .map(a => ({
      ...a,
      estimated_days: extraData[a.id]?.estimated_days ?? a.estimated_days ?? 0,
      estimated_hours: extraData[a.id]?.estimated_hours ?? a.estimated_hours ?? 0,
      units_assigned: extraData[a.id]?.units_assigned ?? a.units_assigned,
    }));

  const totalAssignedUnits = existing.reduce((s, a) => s + Number(a.units_assigned), 0);
  const totalAssignedDays = existing.reduce((s, a) => s + Number(a.estimated_days || 0), 0);
  const totalAssignedHours = existing.reduce((s, a) => s + Number(a.estimated_hours || 0), 0);
  const remainingUnits = Math.max((modal.planned_units || 0) - totalAssignedUnits, 0);
  const remainingDays = Math.max((modal.estimated_days || 0) - totalAssignedDays, 0);
  const remainingHours = Math.max((modal.estimated_hours || 0) - totalAssignedHours, 0);

  const unitsExceeded = units && Number(units) > remainingUnits;
  const daysExceeded = days && Number(days) > remainingDays;
  const hoursExceeded = hours && Number(hours) > remainingHours;

  const handleDaysChange = (val) => {
    setDays(val);
    setHours(val === "" || isNaN(Number(val)) ? "" : String(Number(val) * 8));
  };
  const handleHoursChange = (val) => {
    setHours(val);
    setDays(val === "" || isNaN(Number(val)) ? "" : String(Number(val) / 8));
  };

  const handleDoneOrBack = () => {
    const hasUnsavedInputs = Boolean(selUser || units || days || hours);
    if (hasUnsavedInputs) {
      setShowExitModal(true);
    } else {
      navigate("/assignments", { state: { selProject } });
    }
  };

  const handleSubmit = async (shouldNavigateOnSuccess = false) => {
    const navigateAfter = shouldNavigateOnSuccess === true;
    if (!selUser) return toast.error("Please select an employee.");
    const reqUnits = parseInt(units, 10);
    if (!units || isNaN(reqUnits) || reqUnits <= 0) return toast.error("Enter units > 0.");
    if (!days || Number(days) <= 0) return toast.error("Enter days > 0 before assigning.");
    const reqDays = Number(days), reqHours = hours ? Number(hours) : 0;
    if (reqUnits > remainingUnits) return toast.error(`Only ${remainingUnits} units remaining.`);
    if (reqDays > remainingDays) return toast.error(`Only ${remainingDays} days remaining.`);
    if (reqHours > remainingHours) return toast.error(`Only ${remainingHours} hours remaining.`);
    setSaving(true);
    try {
      const res = await axios.post(`${BASE_URL}/api/assignments`, {
        project_id: selProject, user_id: selUser, role: modal.role,
        task_name: modal.task_name, units_assigned: reqUnits,
        estimated_days: reqDays, estimated_hours: reqHours,
      }, { headers: getHeaders() });
      const saved = res.data?.data || res.data;
      if (saved?.id) {
        setExtraData(prev => ({ ...prev, [saved.id]: { estimated_days: reqDays, estimated_hours: reqHours, units_assigned: reqUnits } }));
      }
      setSelUser(""); setUnits(""); setDays(""); setHours("");
      toast.success("Employee assigned successfully!");
      await refreshAssignments();
      scrollToTop();
      if (navigateAfter) {
        navigate("/assignments", { state: { selProject } });
      }
    } catch (e) {
      toast.error(e?.response?.data?.message || "Failed to assign.");
    } finally { setSaving(false); }
  };

  const startEdit = (a) => setEditingRow(prev => ({ ...prev, [a.id]: { units: String(a.units_assigned), days: String(a.estimated_days || 0), hours: String(a.estimated_hours || 0) } }));
  const cancelEdit = (id) => setEditingRow(prev => { const n = { ...prev }; delete n[id]; return n; });
  const handleEditField = (id, field, val) => {
    setEditingRow(prev => {
      const sanitizedVal = field === 'units' ? (val === '' ? '' : val.replace(/\D/g, '')) : val;
      const row = { ...prev[id], [field]: sanitizedVal };
      if (field === 'days') row.hours = val === '' || isNaN(Number(val)) ? '' : String(Number(val) * 8);
      if (field === 'hours') row.days = val === '' || isNaN(Number(val)) ? '' : String(Number(val) / 8);
      return { ...prev, [id]: row };
    });
  };
  const handleEditSave = async (id) => {
    const row = editingRow[id];
    if (!row) return;
    const unitsVal = parseInt(row.units, 10);
    const daysVal = Number(row.days) || 0;
    const hoursVal = Number(row.hours) || 0;
    if (!unitsVal || isNaN(unitsVal) || unitsVal <= 0) return toast.error('Units must be > 0.');

    // Remaining capacity = total task limits minus what OTHER assignments use
    const otherAssignments = existing.filter(a => a.id !== id);
    const otherUnits = otherAssignments.reduce((s, a) => s + Number(a.units_assigned), 0);
    const otherDays  = otherAssignments.reduce((s, a) => s + Number(a.estimated_days || 0), 0);
    const otherHours = otherAssignments.reduce((s, a) => s + Number(a.estimated_hours || 0), 0);
    const maxUnits = (modal.planned_units  || 0) - otherUnits;
    const maxDays  = (modal.estimated_days  || 0) - otherDays;
    const maxHours = (modal.estimated_hours || 0) - otherHours;

    if (unitsVal > maxUnits) return toast.error(`Only ${maxUnits} units remaining for this task.`);
    if (daysVal  > maxDays)  return toast.error(`Only ${maxDays} days remaining for this task.`);
    if (hoursVal > maxHours) return toast.error(`Only ${maxHours} hours remaining for this task.`);

    setSavingEdit(prev => ({ ...prev, [id]: true }));
    try {
      await axios.put(`${BASE_URL}/api/assignments/${id}`, {
        units_assigned: unitsVal, estimated_days: daysVal, estimated_hours: hoursVal,
      }, { headers: getHeaders() });
      setExtraData(prev => ({ ...prev, [id]: { estimated_days: daysVal, estimated_hours: hoursVal, units_assigned: unitsVal } }));
      cancelEdit(id);
      toast.success('Assignment updated!');
      await refreshAssignments();
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Failed to update.');
    } finally { setSavingEdit(prev => ({ ...prev, [id]: false })); }
  };

  const handleDelete = (id, user_name, task_name) => {
    setDeleteTarget({ id, user_name, task_name });
  };

  const confirmDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await axios.delete(`${BASE_URL}/api/assignments/${deleteTarget.id}`, { headers: getHeaders() });
      // Instant UI update — remove row without waiting for server round-trip
      setAssignments(prev => prev.filter(a => a.id !== deleteTarget.id));
      setExtraData(prev => { const n = { ...prev }; delete n[deleteTarget.id]; return n; });
      setDeleteTarget(null);
      toast.success("Assignment removed.");
      // Re-sync from server to guarantee the list is accurate
      await refreshAssignments();
    } catch {
      toast.error("Failed to remove assignment.");
    } finally {
      setDeleting(false);
    }
  };

  const rs = roleStyle(modal.role);
  const roleInitials = modal.role.split(/\s+/).map(w => w[0]).join("").slice(0, 2).toUpperCase();

const deliveryEmployees = hrmsEmployees.filter(emp => {
  if (!emp.Name_of_Department) return false;
  // Trim and compare case-insensitively
  const dept = emp.Name_of_Department.trim();
  return dept.toLowerCase() === 'delivery';
});

// Add debug log
console.log('Total employees:', hrmsEmployees.length);
console.log('ADM employees:', deliveryEmployees.length);

// Then use deliveryEmployees in the SearchableSelect

  return (
    <div className="p-6 bg-[#FAF8FF] min-h-full font-sans">
      {/* Page Header - Sticky */}
      <div className="sticky top-0 z-30  py-3 mb-4 -mt-4 border-b shadow-sm px-2 rounded-xl">
        {/* Row 1: Back Button */}
        <div className="flex items-center mb-3">
          <button
            onClick={handleDoneOrBack}
            className="flex items-center gap-2 text-gray-500 hover:text-gray-800 font-semibold text-sm transition-colors"
          >
            <Icon icon="material-symbols:arrow-back" width="18" height="18" color="#64748b" />
            Back to Assignments
          </button>
        </div>

        {/* Row 2: Title and Task Info */}
        <div className="flex items-center gap-2 flex-wrap">
          <span className="px-2 py-0.5 rounded text-[10px] font-bold text-white uppercase" style={{ backgroundColor: rs.border }}>
            {roleInitials}
          </span>
          <h2 className="text-xl font-extrabold text-gray-800">
            {isAdmin ? 'View Assignments' : 'Assign Employee'}
          </h2>
          <span className="text-gray-400">·</span>
          <span className="text-gray-600 font-semibold">{modal.task_name}</span>
          {modal.unit_type && <span className="text-gray-400 text-xs font-semibold">({modal.unit_type})</span>}
          {isAdmin && (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold bg-rose-50 text-rose-600 border border-rose-100">
              <Icon icon="material-symbols:lock" width="12" height="12" color="#e11d48" />
              VIEW ONLY
            </span>
          )}
        </div>
      </div>

      {/* KPI Cards - Updated to match app style */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
        {[
          { label: "PLANNED UNITS", value: modal.planned_units ?? 0 },
          { label: "EST. DAYS", value: modal.estimated_days ?? 0 },
          { label: "EST. HOURS", value: modal.estimated_hours ?? 0 },
          { label: "ASSIGNED UNITS", value: totalAssignedUnits, highlight: true },
        ].map(({ label, value, highlight }) => (
          <div key={label} className={`bg-white border border-gray-100 rounded-xl p-4 flex flex-col items-center justify-center min-h-[80px] shadow-sm ${highlight ? 'border-l-4 border-l-[#856BFF]' : ''}`}>
            <span className={`text-[9px] font-extrabold tracking-wider uppercase mb-1 ${highlight ? 'text-[#856BFF]' : 'text-gray-400'}`}>{label}</span>
            <span className={`text-2xl font-extrabold ${highlight ? 'text-[#856BFF]' : 'text-gray-800'}`}>{value}</span>
          </div>
        ))}
      </div>

      {/* Remaining Balance Strip - Updated colors */}
      <div className="bg-[#F5F3FF] border border-[#856BFF]/20 rounded-xl p-4 flex justify-around items-center text-center mb-6">
        {[
          { label: "REMAINING UNITS", value: remainingUnits },
          { label: "REMAINING DAYS", value: remainingDays },
          { label: "REMAINING HOURS", value: remainingHours },
        ].map(({ label, value }, i) => (
          <React.Fragment key={label}>
            {i > 0 && <div className="w-[1px] h-8 bg-gray-200" />}
            <div className="flex-1">
              <div className="text-[9px] font-bold text-[#856BFF] tracking-wider uppercase mb-1">{label}</div>
              <div className="text-lg font-bold text-[#856BFF]">{value}</div>
            </div>
          </React.Fragment>
        ))}
      </div>

      {/* New Assignment Form - Updated button colors */}
      {!isAdmin && (
        <div className="bg-white border border-gray-100 rounded-2xl shadow-sm p-6 mb-6">
          <h3 className="text-[11px] font-extrabold text-gray-500 tracking-wider uppercase mb-4">New Assignment</h3>
          <div className="grid grid-cols-1 md:grid-cols-5 gap-3 items-end">
            <div className="md:col-span-2">
              <label className="block text-[10px] font-semibold text-gray-400 mb-1">Employee</label>
            <SearchableSelect
  value={selUser}
  onChange={setSelUser}
  placeholder={employeesLoading ? "Loading employees..." : "Select employee…"}
  options={deliveryEmployees.map(emp => ({
    value: String(emp.Employee_ID),
    label: `${emp.Employee_Name} (${emp.Employee_ID})`,
  }))}
  className="rounded-xl text-xs font-semibold text-gray-700 border-gray-200"
/>
            </div>
            {[
              { label: "Units", val: units, onChange: val => setUnits(val.replace(/\D/g, '')), exceeded: unitsExceeded, step: "1", integerOnly: true },
              { label: "Days", val: days, onChange: handleDaysChange, exceeded: daysExceeded, step: "0.5" },
              { label: "Hours", val: hours, onChange: handleHoursChange, exceeded: hoursExceeded, step: "0.5" },
            ].map(({ label, val, onChange, exceeded, step, integerOnly }) => (
              <div key={label}>
                <label className="block text-[10px] font-semibold text-gray-400 mb-1">{label}</label>
                <input
                  type="number" min="0" step={step || "1"} placeholder="0"
                  value={val}
                  onKeyDown={integerOnly ? (e) => { if (e.key === '.' || e.key === 'e' || e.key === 'E' || e.key === '+' || e.key === '-') e.preventDefault(); } : undefined}
                  onChange={e => onChange(e.target.value)}
                  className="w-full px-3 py-2.5 bg-white border rounded-xl text-xs font-semibold text-center text-gray-700 outline-none focus:border-[#856BFF] focus:ring-1 focus:ring-[#856BFF]"
                  style={{ borderColor: exceeded ? "#f43f5e" : "#e2e8f0" }}
                />
              </div>
            ))}
            <button
              onClick={() => handleSubmit(false)}
              disabled={saving || unitsExceeded || daysExceeded || hoursExceeded || remainingUnits === 0}
              className={`w-full py-2.5 rounded-xl font-bold text-xs transition-all ${saving || unitsExceeded || daysExceeded || hoursExceeded || remainingUnits === 0
                ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                : "bg-[#856BFF] hover:bg-[#7259e6] text-white shadow-sm"
                }`}
            >
              {saving ? "Saving…" : "Assign"}
            </button>
          </div>
          {(unitsExceeded || daysExceeded || hoursExceeded) && (
            <p className="text-rose-500 text-[11px] font-semibold mt-2 flex items-center gap-1">
              <Icon icon="material-symbols:warning" width="14" height="14" color="#f43f5e" />
              Values exceed remaining limits. Please adjust.
            </p>
          )}
        </div>
      )}

      {/* Employee Workload — Accordion Card - Updated colors */}
      {selUser && (
        <div className="bg-white border border-gray-100 rounded-2xl shadow-sm mb-6 overflow-hidden">
          {/* Card Header — toggles the whole card */}
          <button
            onClick={() => setWorkloadOpen(o => !o)}
            className="w-full flex items-center justify-between px-6 py-4 hover:bg-gray-50/60 transition-colors select-none"
          >
            <span className="text-xs font-bold text-gray-700 flex items-center gap-1.5">
              <Icon icon="material-symbols:work" width="16" height="16" color="#856BFF" />
              Current Workload
            </span>
            <Icon
              icon={`material-symbols:${workloadOpen ? 'expand-less' : 'expand-more'}`}
              width="20" height="20" color="#856BFF"
            />
          </button>

          {workloadOpen && (
            <div className="px-6 pb-6">
              {loadingWorkload ? (
                <p className="text-xs text-gray-400 italic py-2">Loading workload...</p>
              ) : workload?.tasks?.length > 0 ? (
                <div className="flex flex-col gap-4">
                  {workload.tasks.map(proj => {
                    const isProjCollapsed = !!collapsedProjects[proj.project_id];
                    return (
                      <div key={proj.project_id} className="border border-gray-200/60 rounded-xl overflow-hidden">
                        {/* Per-project accordion header */}
                        <button
                          onClick={() => toggleProject(proj.project_id)}
                          className="w-full flex items-center justify-between px-4 py-2.5 bg-[#EFF4FF] hover:bg-[#e4ecff] transition-colors select-none"
                        >
                          <span className="text-[11px] font-bold text-gray-700 flex items-center gap-1.5">
                            <Icon icon="material-symbols:folder" width="14" height="14" color="#856BFF" />
                            {proj.project_name}
                            <span className="ml-1 px-1.5 py-0.5 bg-gray-200 text-gray-500 rounded-full text-[9px] font-bold">
                              {proj.tasks.length} task{proj.tasks.length !== 1 ? 's' : ''}
                            </span>
                          </span>
                          <Icon
                            icon={`material-symbols:${isProjCollapsed ? 'chevron-right' : 'expand-more'}`}
                            width="18" height="18" color="#94a3b8"
                          />
                        </button>

                        {!isProjCollapsed && (
                          <div className="overflow-x-auto">
                            <table className="w-full text-left text-[11px] border-collapse">
                              <thead className="sticky top-0 z-10 bg-gray-50">
                                <tr className="bg-gray-50 border-b border-gray-100 text-gray-500 font-bold text-[10px] uppercase">
                                  <th className="sticky top-0 z-10 bg-gray-50 py-2 px-3 min-w-[110px]">Employee Name</th>
                                  <th className="sticky top-0 z-10 bg-gray-50 py-2 px-3 min-w-[110px]">Project Name</th>
                                  <th className="sticky top-0 z-10 bg-gray-50 py-2 px-3 min-w-[110px]">Task Name</th>
                                  <th className="sticky top-0 z-10 bg-gray-50 py-2 px-3 text-center min-w-[90px]">Total Assigned Units</th>
                                  <th className="sticky top-0 z-10 bg-gray-50 py-2 px-3 text-center min-w-[110px]">Total Assigned Person Days</th>
                                  <th className="sticky top-0 z-10 bg-gray-50 py-2 px-3 text-center min-w-[90px]">Completed Units</th>
                                  <th className="sticky top-0 z-10 bg-gray-50 py-2 px-3 text-center min-w-[110px]">Completed Person Days</th>
                                  <th className="sticky top-0 z-10 bg-gray-50 py-2 px-3 text-center min-w-[80px]">Pending Units</th>
                                  <th className="sticky top-0 z-10 bg-gray-50 py-2 px-3 text-center min-w-[100px]">Pending Person Days</th>
                                </tr>
                              </thead>
                              <tbody className="divide-y divide-gray-50">
                                {proj.tasks.map(task => {
                                  const assignedUnits = Number(task.units_assigned || 0);
                                  const completedUnits = Number(task.units_completed || 0);
                                  const pendingUnits = Number(task.units_pending || 0);
                                  const assignedDays = parseFloat((Number(task.estimated_hours || 0) / 8).toFixed(2));
                                  const completedDays = parseFloat((Number(task.completed_hours || 0) / 8).toFixed(2));
                                  const pendingDays = parseFloat((Number(task.pending_hours || 0) / 8).toFixed(2));
                                  const empObj = hrmsEmployees.find(
                                    e => String(e.Employee_ID) === String(selUser)
                                  );
                                  const empName = empObj?.Employee_Name || selUser;
                                  return (
                                    <tr key={task.task_id} className="hover:bg-gray-50/60 transition-colors">
                                      <td className="py-2 px-3 font-semibold text-gray-700">{empName}</td>
                                      <td className="py-2 px-3 text-gray-600 font-medium">{proj.project_name}</td>
                                      <td className="py-2 px-3 font-semibold text-gray-700">{task.task_name}</td>
                                      <td className="py-2 px-3 text-center font-bold text-[#856BFF]">{assignedUnits}</td>
                                      <td className="py-2 px-3 text-center font-semibold text-gray-700">{assignedDays}</td>
                                      <td className="py-2 px-3 text-center font-bold text-emerald-600">{completedUnits}</td>
                                      <td className="py-2 px-3 text-center font-semibold text-emerald-500">{completedDays}</td>
                                      <td className="py-2 px-3 text-center font-bold text-rose-500">{pendingUnits}</td>
                                      <td className="py-2 px-3 text-center font-semibold text-rose-400">{pendingDays}</td>
                                    </tr>
                                  );
                                })}
                              </tbody>
                            </table>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              ) : (
                <p className="text-xs text-gray-400 text-center py-4 border border-dashed border-gray-200 rounded-xl">No active project assignments found.</p>
              )}
            </div>
          )}
        </div>
      )}

      {/* Current Assignments Table - Updated header and colors */}
      <div className="bg-white border border-gray-100 rounded-2xl shadow-sm p-6">
        <div className="flex justify-between items-center mb-4">
          <span className="text-[11px] font-bold text-gray-500 tracking-wider uppercase">Current Assignments ({existing.length})</span>
        </div>
        {existing.length > 0 ? (
          <div className="overflow-x-auto border border-gray-100 rounded-xl">
            <table className="w-full text-left text-xs border-collapse">
              <thead className="sticky top-0 z-10 bg-[#EFF4FF]">
                <tr className="border-b border-gray-100 text-[#434654] font-bold text-[10px] uppercase" style={{ backgroundColor: '#EFF4FF' }}>
                  <th className="sticky top-0 z-10 bg-[#EFF4FF] py-2.5 px-3 min-w-[130px]">Employee Name</th>
                  <th className="sticky top-0 z-10 bg-[#EFF4FF] py-2.5 px-3 min-w-[130px]">Project Name</th>
                  <th className="sticky top-0 z-10 bg-[#EFF4FF] py-2.5 px-3 min-w-[130px]">Task Name</th>
                  <th className="sticky top-0 z-10 bg-[#EFF4FF] py-2.5 px-3 text-center min-w-[100px]">Total Assigned Units</th>
                  <th className="sticky top-0 z-10 bg-[#EFF4FF] py-2.5 px-3 text-center min-w-[120px]">Total Assigned Person Days</th>
                  <th className="sticky top-0 z-10 bg-[#EFF4FF] py-2.5 px-3 text-center min-w-[100px]">Completed Units</th>
                  <th className="sticky top-0 z-10 bg-[#EFF4FF] py-2.5 px-3 text-center min-w-[120px]">Completed Person Days</th>
                  <th className="sticky top-0 z-10 bg-[#EFF4FF] py-2.5 px-3 text-center min-w-[90px]">Pending Units</th>
                  <th className="sticky top-0 z-10 bg-[#EFF4FF] py-2.5 px-3 text-center min-w-[110px]">Pending Person Days</th>
                  {!isAdmin && <th className="sticky top-0 z-10 bg-[#EFF4FF] py-2.5 px-3 text-center min-w-[120px]">Action</th>}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {existing.map(a => {
                  const completedUnits = Number(a.units_completed || 0);
                  const assignedUnits = Number(a.units_assigned || 0);
                  const assignedDays = Number(a.estimated_days || 0);
                  const pendingUnits = Math.max(assignedUnits - completedUnits, 0);
                  const completedDays = assignedUnits > 0
                    ? parseFloat(((completedUnits / assignedUnits) * assignedDays).toFixed(2))
                    : 0;
                  const pendingDays = parseFloat(Math.max(assignedDays - completedDays, 0).toFixed(2));
                  const isCompleted = assignedUnits > 0 && completedUnits >= assignedUnits;
                  const isEditing = !!editingRow[a.id];
                  const eRow = editingRow[a.id] || {};
                  const isSavingThis = !!savingEdit[a.id];

                  // Per-row remaining capacity (exclude this assignment from totals)
                  const otherRows = existing.filter(x => x.id !== a.id);
                  const otherUnits = otherRows.reduce((s, x) => s + Number(x.units_assigned), 0);
                  const otherDays  = otherRows.reduce((s, x) => s + Number(x.estimated_days || 0), 0);
                  const editMaxUnits = (modal.planned_units  || 0) - otherUnits;
                  const editMaxDays  = (modal.estimated_days  || 0) - otherDays;
                  const editUnitsExceeded = isEditing && eRow.units !== '' && Number(eRow.units) > editMaxUnits;
                  const editDaysExceeded  = isEditing && eRow.days  !== '' && Number(eRow.days)  > editMaxDays;
                  const editAnyExceeded   = editUnitsExceeded || editDaysExceeded;
                  return (
                    <tr key={a.id} className={`transition-colors ${isCompleted ? 'bg-emerald-50/40' : 'hover:bg-gray-50/20'}`}>
                      <td className="py-3 px-3">
                        <div className="flex items-center gap-2">
                          <div className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold shrink-0 ${isCompleted ? 'bg-emerald-100 text-emerald-600' : 'bg-[#856BFF]/10 text-[#856BFF]'}`}>
                            {a.user_name?.[0]?.toUpperCase() || "?"}
                          </div>
                          <span className="font-bold text-gray-800">{a.user_name}</span>
                        </div>
                      </td>
                      <td className="py-3 px-3 text-gray-600 font-semibold">{projectName || "—"}</td>
                      <td className="py-3 px-3 text-gray-700 font-semibold">{modal.task_name}</td>
                      <td className="py-3 px-3 text-center">
                        {isEditing ? (
                          <div className="flex flex-col items-center gap-0.5">
                            <input
                              type="number" min="1" step="1"
                              value={eRow.units}
                              onKeyDown={(e) => { if (e.key === '.' || e.key === 'e' || e.key === 'E' || e.key === '+' || e.key === '-') e.preventDefault(); }}
                              onChange={e => handleEditField(a.id, 'units', e.target.value.replace(/\D/g, ''))}
                              className="w-14 px-1 py-0.5 border rounded text-center font-semibold text-xs outline-none"
                              style={{ borderColor: editUnitsExceeded ? '#f43f5e' : '#856BFF' }}
                            />
                            {editUnitsExceeded && <span className="text-[9px] text-rose-500 font-bold">Max {editMaxUnits}</span>}
                          </div>
                        ) : <span className="font-bold text-[#856BFF]">{assignedUnits}</span>}
                      </td>
                      <td className="py-3 px-3 text-center">
                        {isEditing ? (
                          <div className="flex flex-col items-center gap-0.5">
                            <input type="number" min="0" step="0.5" value={eRow.days} onChange={e => handleEditField(a.id, 'days', e.target.value)}
                              className="w-14 px-1 py-0.5 border rounded text-center font-semibold text-xs outline-none"
                              style={{ borderColor: editDaysExceeded ? '#f43f5e' : '#856BFF' }} />
                            {editDaysExceeded && <span className="text-[9px] text-rose-500 font-bold">Max {editMaxDays}</span>}
                          </div>
                        ) : <span className="font-semibold text-gray-700">{assignedDays}</span>}
                      </td>
                      <td className="py-3 px-3 text-center font-bold text-emerald-600">{completedUnits}</td>
                      <td className="py-3 px-3 text-center font-semibold text-emerald-500">{completedDays}</td>
                      <td className="py-3 px-3 text-center font-bold text-rose-500">{pendingUnits}</td>
                      <td className="py-3 px-3 text-center font-semibold text-rose-400">{pendingDays}</td>
                      {!isAdmin && (
                        <td className="py-3 px-3 text-center">
                          <div className="flex gap-2 justify-center">
                            {isCompleted ? (
                              <span className="inline-flex items-center gap-1 px-3 py-1 rounded-lg text-[10px] font-bold bg-emerald-50 text-emerald-600 border border-emerald-200 cursor-not-allowed select-none">
                                <Icon icon="material-symbols:check-circle" width="12" height="12" color="#22c55e" />
                                Completed
                              </span>
                            ) : isEditing ? (
                              <>
                                <button onClick={() => handleEditSave(a.id)} disabled={isSavingThis || editAnyExceeded}
                                  className={`font-bold px-2 py-0.5 rounded-lg text-[10px] transition-all border ${isSavingThis || editAnyExceeded ? 'border-gray-200 text-gray-400 cursor-not-allowed bg-gray-50' : 'border-emerald-500 text-emerald-600 hover:bg-emerald-50'}`}>Save</button>
                                <button onClick={() => cancelEdit(a.id)} disabled={isSavingThis}
                                  className="border border-gray-300 text-gray-500 hover:bg-gray-50 font-bold px-2 py-0.5 rounded-lg text-[10px] transition-all">Cancel</button>
                              </>
                            ) : (
                              <>
                                <button onClick={() => startEdit(a)}
                                  className="border border-[#856BFF] text-[#856BFF] hover:bg-[#856BFF]/10 font-bold px-3 py-1 rounded-lg transition-all">Edit</button>
                                <button onClick={() => handleDelete(a.id, a.user_name, modal.task_name)}
                                  className="border border-rose-500 text-rose-500 hover:bg-rose-50 font-bold px-3 py-1 rounded-lg transition-all">Remove</button>
                              </>
                            )}
                          </div>
                        </td>
                      )}
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="p-6 border border-dashed border-gray-200 bg-gray-50/50 rounded-xl text-center text-xs text-gray-400">
            No employees assigned yet.
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="flex justify-end mt-6 pb-10">
        <button onClick={handleDoneOrBack}
          className="bg-[#856BFF] hover:bg-[#7259e6] text-white font-bold text-sm py-2.5 px-8 rounded-xl transition-all shadow-sm">
          Done
        </button>
      </div>

      {/* Unsaved Changes Confirmation Modal */}
      {showExitModal && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-[1000] p-4">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full shadow-2xl border border-gray-100">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-full bg-amber-100 flex items-center justify-center shrink-0">
                <Icon icon="material-symbols:warning-rounded" width="24" height="24" color="#d97706" />
              </div>
              <div>
                <h3 className="text-base font-bold text-gray-900">Unsaved Assignment Details</h3>
                <p className="text-xs text-gray-500 mt-0.5">You have filled out employee assignment details that haven't been assigned yet.</p>
              </div>
            </div>

            <p className="text-xs text-gray-600 mb-6 bg-amber-50/60 border border-amber-100 p-3 rounded-xl">
              Would you like to save this assignment before leaving, or close without assigning?
            </p>

            <div className="flex flex-col sm:flex-row gap-2 justify-end">
              <button
                onClick={() => setShowExitModal(false)}
                className="px-4 py-2 text-xs font-semibold text-gray-600 hover:bg-gray-100 rounded-xl transition-colors order-3 sm:order-1"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  setShowExitModal(false);
                  navigate("/assignments", { state: { selProject } });
                }}
                className="px-4 py-2 text-xs font-bold text-rose-600 bg-rose-50 hover:bg-rose-100 rounded-xl transition-colors order-2"
              >
                Discard &amp; Leave
              </button>
              <button
                onClick={async () => {
                  setShowExitModal(false);
                  await handleSubmit(true);
                }}
                disabled={saving}
                className="px-4 py-2 text-xs font-bold text-white bg-[#856BFF] hover:bg-[#7259e6] rounded-xl transition-colors shadow-sm order-1 sm:order-3"
              >
                Assign &amp; Leave
              </button>
            </div>
          </div>
        </div>
      )}
      {/* ── Delete Confirmation Modal ── */}
      {deleteTarget && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-[1100] p-4">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full shadow-2xl border border-gray-100 animate-in fade-in zoom-in-95 duration-150">
            {/* Icon + Title */}
            <div className="flex items-center gap-3 mb-4">
              <div className="w-11 h-11 rounded-full bg-rose-100 flex items-center justify-center shrink-0">
                <Icon icon="material-symbols:person-remove" width="22" height="22" color="#e11d48" />
              </div>
              <div>
                <h3 className="text-base font-bold text-gray-900">Remove Assignment</h3>
                <p className="text-xs text-gray-400 mt-0.5">This action cannot be undone.</p>
              </div>
            </div>

            {/* Detail pill */}
            <div className="bg-rose-50 border border-rose-100 rounded-xl p-3.5 mb-5 flex flex-col gap-1.5">
              <div className="flex items-center gap-2 text-[11px] text-rose-700">
                <Icon icon="material-symbols:person" width="14" height="14" />
                <span className="font-semibold">{deleteTarget.user_name}</span>
              </div>
              <div className="flex items-center gap-2 text-[11px] text-rose-600">
                <Icon icon="material-symbols:task" width="14" height="14" />
                <span>{deleteTarget.task_name}</span>
              </div>
            </div>

            <p className="text-xs text-gray-500 mb-6">
              Are you sure you want to remove this employee from the task? Their assignment record will be permanently deleted.
            </p>

            <div className="flex gap-2 justify-end">
              <button
                onClick={() => setDeleteTarget(null)}
                disabled={deleting}
                className="px-4 py-2 text-xs font-semibold text-gray-600 hover:bg-gray-100 rounded-xl transition-colors disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={confirmDelete}
                disabled={deleting}
                className="px-5 py-2 text-xs font-bold text-white bg-rose-500 hover:bg-rose-600 active:bg-rose-700 rounded-xl transition-colors shadow-sm disabled:opacity-50 flex items-center gap-1.5"
              >
                {deleting ? (
                  <>
                    <svg className="animate-spin w-3.5 h-3.5" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                    </svg>
                    Removing…
                  </>
                ) : (
                  <>
                    <Icon icon="material-symbols:delete" width="14" height="14" />
                    Remove
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AssignEmployee;