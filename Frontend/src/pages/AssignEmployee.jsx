import React, { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import toast from "react-hot-toast";
import axios from "axios";
import { useSelector } from "react-redux";
import Cookies from "js-cookie";
import SearchableSelect from "../component/SearchableSelect";

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
  const serviceDeliveryEmployees = useSelector((state) => state.auth.serviceDeliveryEmployees);

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
  const [collapsedProjects, setCollapsedProjects] = useState({});
  const toggleProject = (pid) => setCollapsedProjects(prev => ({ ...prev, [pid]: !prev[pid] }));

  // Redirect if navigated directly without state
  useEffect(() => {
    if (!modal || !selProject) {
      navigate("/assignments", { replace: true });
    }
  }, [modal, selProject, navigate]);

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

  const refreshAssignments = async () => {
    try {
      const res = await axios.get(`${BASE_URL}/api/assignments?projectId=${selProject}`, { headers: getHeaders() });
      setAssignments(res.data || []);
    } catch { /* ignore */ }
  };

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

  const handleSubmit = async () => {
    if (!selUser) return toast.error("Please select an employee.");
    if (!units || Number(units) <= 0) return toast.error("Enter units > 0.");
    const reqUnits = Number(units), reqDays = days ? Number(days) : 0, reqHours = hours ? Number(hours) : 0;
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
    } catch (e) {
      toast.error(e?.response?.data?.message || "Failed to assign.");
    } finally { setSaving(false); }
  };

  const startEdit = (a) => setEditingRow(prev => ({ ...prev, [a.id]: { units: String(a.units_assigned), days: String(a.estimated_days || 0), hours: String(a.estimated_hours || 0) } }));
  const cancelEdit = (id) => setEditingRow(prev => { const n = { ...prev }; delete n[id]; return n; });
  const handleEditField = (id, field, val) => {
    setEditingRow(prev => {
      const row = { ...prev[id], [field]: val };
      if (field === 'days') row.hours = val === '' || isNaN(Number(val)) ? '' : String(Number(val) * 8);
      if (field === 'hours') row.days = val === '' || isNaN(Number(val)) ? '' : String(Number(val) / 8);
      return { ...prev, [id]: row };
    });
  };
  const handleEditSave = async (id) => {
    const row = editingRow[id];
    if (!row) return;
    const unitsVal = Number(row.units);
    if (!unitsVal || unitsVal <= 0) return toast.error('Units must be > 0.');
    setSavingEdit(prev => ({ ...prev, [id]: true }));
    try {
      await axios.put(`${BASE_URL}/api/assignments/${id}`, {
        units_assigned: unitsVal, estimated_days: Number(row.days) || 0, estimated_hours: Number(row.hours) || 0,
      }, { headers: getHeaders() });
      setExtraData(prev => ({ ...prev, [id]: { estimated_days: Number(row.days) || 0, estimated_hours: Number(row.hours) || 0, units_assigned: unitsVal } }));
      cancelEdit(id);
      toast.success('Assignment updated!');
      await refreshAssignments();
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Failed to update.');
    } finally { setSavingEdit(prev => ({ ...prev, [id]: false })); }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Remove this assignment?")) return;
    try {
      await axios.delete(`${BASE_URL}/api/assignments/${id}`, { headers: getHeaders() });
      toast.success("Assignment removed.");
      await refreshAssignments();
    } catch { toast.error("Failed to remove assignment."); }
  };

  const rs = roleStyle(modal.role);
  const roleInitials = modal.role.split(/\s+/).map(w => w[0]).join("").slice(0, 2).toUpperCase();

  return (
    <div className="p-6 bg-slate-50 min-h-full font-sans">
      {/* Page Header */}
      <div className="mb-6 flex items-center gap-4">
        <button
          onClick={() => navigate("/assignments", { state: { selProject } })}
          className="flex items-center gap-2 text-slate-500 hover:text-slate-800 font-semibold text-sm transition-colors"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
          </svg>
          Back to Assignments
        </button>
        <span className="text-slate-300">|</span>
        <div className="flex items-center gap-2">
          <span className="px-2 py-0.5 rounded text-[10px] font-bold text-white uppercase" style={{ backgroundColor: rs.border }}>
            {roleInitials}
          </span>
          <h2 className="text-xl font-extrabold text-slate-800">
            {isAdmin ? 'View Assignments' : 'Assign Employee'}
          </h2>
          <span className="text-slate-400">·</span>
          <span className="text-slate-600 font-semibold">{modal.task_name}</span>
          {modal.unit_type && <span className="text-slate-400 text-xs font-semibold">({modal.unit_type})</span>}
          {isAdmin && (
            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-rose-50 text-rose-600 border border-rose-100">🔒 VIEW ONLY</span>
          )}
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
        {[
          { label: "PLANNED UNITS", value: modal.planned_units ?? 0 },
          { label: "EST. DAYS", value: modal.estimated_days ?? 0 },
          { label: "EST. HOURS", value: modal.estimated_hours ?? 0 },
          { label: "ASSIGNED UNITS", value: totalAssignedUnits, highlight: true },
        ].map(({ label, value, highlight }) => (
          <div key={label} className={`rounded-xl p-4 flex flex-col items-center justify-center min-h-[80px] ${highlight ? 'bg-[#f0f4ff] border-b-[3px] border-[#0052cc]' : 'bg-[#f5f6ff]'}`}>
            <span className={`text-[9px] font-extrabold tracking-wider uppercase mb-1 ${highlight ? 'text-[#0052cc]' : 'text-slate-400'}`}>{label}</span>
            <span className={`text-2xl font-extrabold ${highlight ? 'text-[#0052cc]' : 'text-slate-800'}`}>{value}</span>
          </div>
        ))}
      </div>

      {/* Remaining Balance Strip */}
      <div className="bg-white border border-blue-100 rounded-xl p-4 flex justify-around items-center text-center mb-6">
        {[
          { label: "REMAINING UNITS", value: remainingUnits },
          { label: "REMAINING DAYS", value: remainingDays },
          { label: "REMAINING HOURS", value: remainingHours },
        ].map(({ label, value }, i) => (
          <React.Fragment key={label}>
            {i > 0 && <div className="w-[1px] h-8 bg-slate-200" />}
            <div className="flex-1">
              <div className="text-[9px] font-bold text-[#0052cc] tracking-wider uppercase mb-1">{label}</div>
              <div className="text-lg font-bold text-emerald-600">{value}</div>
            </div>
          </React.Fragment>
        ))}
      </div>

      {/* New Assignment Form */}
      {!isAdmin && (
        <div className="bg-white border border-slate-100 rounded-2xl shadow-sm p-6 mb-6">
          <h3 className="text-[11px] font-extrabold text-slate-500 tracking-wider uppercase mb-4">New Assignment</h3>
          <div className="grid grid-cols-1 md:grid-cols-5 gap-3 items-end">
            <div className="md:col-span-2">
              <label className="block text-[10px] font-semibold text-slate-400 mb-1">Employee</label>
              <SearchableSelect
                value={selUser}
                onChange={setSelUser}
                placeholder="Select employee…"
                options={serviceDeliveryEmployees.map(emp => ({
                  value: String(emp.employee_id || emp.id),
                  label: emp.emp_name || emp.name,
                }))}
                className="rounded-xl text-xs font-semibold text-slate-700 border-slate-200"
              />
            </div>
            {[
              { label: "Units", val: units, onChange: setUnits, exceeded: unitsExceeded },
              { label: "Days", val: days, onChange: handleDaysChange, exceeded: daysExceeded, step: "0.5" },
              { label: "Hours", val: hours, onChange: handleHoursChange, exceeded: hoursExceeded, step: "0.5" },
            ].map(({ label, val, onChange, exceeded, step }) => (
              <div key={label}>
                <label className="block text-[10px] font-semibold text-slate-400 mb-1">{label}</label>
                <input
                  type="number" min="0" step={step || "1"} placeholder="0"
                  value={val} onChange={e => onChange(e.target.value)}
                  className="w-full px-3 py-2.5 bg-white border rounded-xl text-xs font-semibold text-center text-slate-700 outline-none focus:border-violet-500 focus:ring-1 focus:ring-violet-500"
                  style={{ borderColor: exceeded ? "#f43f5e" : "#e2e8f0" }}
                />
              </div>
            ))}
            <button
              onClick={handleSubmit}
              disabled={saving || unitsExceeded || daysExceeded || hoursExceeded || remainingUnits === 0}
              className={`w-full py-2.5 rounded-xl font-bold text-xs transition-all border ${saving || unitsExceeded || daysExceeded || hoursExceeded || remainingUnits === 0
                ? "bg-slate-100 text-slate-400 border-slate-200 cursor-not-allowed"
                : "bg-[#E6FFFA] hover:bg-[#D5FFF6] text-[#319795] border-[#319795] shadow-sm"}`}
            >
              {saving ? "Saving…" : "Assign"}
            </button>
          </div>
          {(unitsExceeded || daysExceeded || hoursExceeded) && (
            <p className="text-rose-500 text-[11px] font-semibold mt-2">⚠️ Values exceed remaining limits. Please adjust.</p>
          )}
        </div>
      )}

      {/* Employee Workload — Accordion Card */}
      {selUser && (
        <div className="bg-white border border-slate-100 rounded-2xl shadow-sm mb-6 overflow-hidden">
          {/* Card Header — toggles the whole card */}
          <button
            onClick={() => setWorkloadOpen(o => !o)}
            className="w-full flex items-center justify-between px-6 py-4 hover:bg-slate-50/60 transition-colors select-none"
          >
            <span className="text-xs font-bold text-slate-700 flex items-center gap-1.5">💼 Current Workload</span>
            <svg
              className={`w-4 h-4 text-slate-400 transition-transform duration-200 ${workloadOpen ? 'rotate-0' : '-rotate-90'}`}
              fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
            </svg>
          </button>

          {workloadOpen && (
            <div className="px-6 pb-6">
              {loadingWorkload ? (
                <p className="text-xs text-slate-400 italic py-2">Loading workload...</p>
              ) : workload?.tasks?.length > 0 ? (
                <div className="flex flex-col gap-4">
                  {workload.tasks.map(proj => {
                    const isProjCollapsed = !!collapsedProjects[proj.project_id];
                    return (
                      <div key={proj.project_id} className="border border-slate-200/60 rounded-xl overflow-hidden">
                        {/* Per-project accordion header */}
                        <button
                          onClick={() => toggleProject(proj.project_id)}
                          className="w-full flex items-center justify-between px-4 py-2.5 bg-[#EFF4FF] hover:bg-[#e4ecff] transition-colors select-none"
                        >
                          <span className="text-[11px] font-bold text-slate-700 flex items-center gap-1.5">
                            📁 {proj.project_name}
                            <span className="ml-1 px-1.5 py-0.5 bg-slate-200 text-slate-500 rounded-full text-[9px] font-bold">
                              {proj.tasks.length} task{proj.tasks.length !== 1 ? 's' : ''}
                            </span>
                          </span>
                          <svg
                            className={`w-3.5 h-3.5 text-slate-400 transition-transform duration-200 ${isProjCollapsed ? '-rotate-90' : 'rotate-0'}`}
                            fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                          </svg>
                        </button>

                        {!isProjCollapsed && (
                          <div className="overflow-x-auto">
                            <table className="w-full text-left text-[11px] border-collapse">
                              <thead>
                                <tr className="bg-slate-50 border-b border-slate-100 text-slate-400 font-bold text-[10px] uppercase">
                                  <th className="py-2 px-3 min-w-[110px]">Employee Name</th>
                                  <th className="py-2 px-3 min-w-[110px]">Project Name</th>
                                  <th className="py-2 px-3 min-w-[110px]">Task Name</th>
                                  <th className="py-2 px-3 text-center min-w-[90px]">Total Assigned Units</th>
                                  <th className="py-2 px-3 text-center min-w-[110px]">Total Assigned Person Days</th>
                                  <th className="py-2 px-3 text-center min-w-[90px]">Completed Units</th>
                                  <th className="py-2 px-3 text-center min-w-[110px]">Completed Person Days</th>
                                  <th className="py-2 px-3 text-center min-w-[80px]">Pending Units</th>
                                  <th className="py-2 px-3 text-center min-w-[100px]">Pending Person Days</th>
                                </tr>
                              </thead>
                              <tbody className="divide-y divide-slate-50">
                                {proj.tasks.map(task => {
                                  const assignedUnits = Number(task.units_assigned || 0);
                                  const completedUnits = Number(task.units_completed || 0);
                                  const pendingUnits = Number(task.units_pending || 0);
                                  // API returns estimated_hours, completed_hours, pending_hours
                                  // Person days = hours / 8
                                  const assignedDays = parseFloat((Number(task.estimated_hours || 0) / 8).toFixed(2));
                                  const completedDays = parseFloat((Number(task.completed_hours || 0) / 8).toFixed(2));
                                  const pendingDays = parseFloat((Number(task.pending_hours || 0) / 8).toFixed(2));
                                  // resolve employee display name from serviceDeliveryEmployees
                                  const empObj = serviceDeliveryEmployees.find(
                                    e => String(e.employee_id || e.id) === String(selUser)
                                  );
                                  const empName = empObj?.emp_name || empObj?.name || selUser;
                                  return (
                                    <tr key={task.task_id} className="hover:bg-slate-50/60 transition-colors">
                                      <td className="py-2 px-3 font-semibold text-slate-700">{empName}</td>
                                      <td className="py-2 px-3 text-slate-600 font-medium">{proj.project_name}</td>
                                      <td className="py-2 px-3 font-semibold text-slate-700">{task.task_name}</td>
                                      <td className="py-2 px-3 text-center font-bold text-blue-600">{assignedUnits}</td>
                                      <td className="py-2 px-3 text-center font-semibold text-slate-700">{assignedDays}</td>
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
                <p className="text-xs text-slate-400 text-center py-4 border border-dashed border-slate-200 rounded-xl">No active project assignments found.</p>
              )}
            </div>
          )}
        </div>
      )}

      {/* Current Assignments Table */}
      <div className="bg-white border border-slate-100 rounded-2xl shadow-sm p-6">
        <div className="flex justify-between items-center mb-4">
          <span className="text-[11px] font-bold text-slate-500 tracking-wider uppercase">Current Assignments ({existing.length})</span>
        </div>
        {existing.length > 0 ? (
          <div className="overflow-x-auto border border-slate-100 rounded-xl">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-[#EFF4FF] border-b border-slate-100 text-slate-500 font-bold text-[10px] uppercase">
                  <th className="py-2.5 px-3 min-w-[130px]">Employee Name</th>
                  <th className="py-2.5 px-3 min-w-[130px]">Project Name</th>
                  <th className="py-2.5 px-3 min-w-[130px]">Task Name</th>
                  <th className="py-2.5 px-3 text-center min-w-[100px]">Total Assigned Units</th>
                  <th className="py-2.5 px-3 text-center min-w-[120px]">Total Assigned Person Days</th>
                  <th className="py-2.5 px-3 text-center min-w-[100px]">Completed Units</th>
                  <th className="py-2.5 px-3 text-center min-w-[120px]">Completed Person Days</th>
                  <th className="py-2.5 px-3 text-center min-w-[90px]">Pending Units</th>
                  <th className="py-2.5 px-3 text-center min-w-[110px]">Pending Person Days</th>
                  {!isAdmin && <th className="py-2.5 px-3 text-center min-w-[120px]">Action</th>}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {existing.map(a => {
                  const completedUnits = Number(a.units_completed || 0);
                  const assignedUnits = Number(a.units_assigned || 0);
                  const assignedDays = Number(a.estimated_days || 0);
                  const pendingUnits = Math.max(assignedUnits - completedUnits, 0);
                  // Person days: proportional to units completed/pending
                  const completedDays = assignedUnits > 0
                    ? parseFloat(((completedUnits / assignedUnits) * assignedDays).toFixed(2))
                    : 0;
                  const pendingDays = parseFloat(Math.max(assignedDays - completedDays, 0).toFixed(2));
                  const isCompleted = assignedUnits > 0 && completedUnits >= assignedUnits;
                  const isEditing = !!editingRow[a.id];
                  const eRow = editingRow[a.id] || {};
                  const isSavingThis = !!savingEdit[a.id];
                  return (
                    <tr key={a.id} className={`transition-colors ${isCompleted ? 'bg-emerald-50/40' : 'hover:bg-slate-50/20'}`}>
                      {/* Employee Name */}
                      <td className="py-3 px-3">
                        <div className="flex items-center gap-2">
                          <div className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold shrink-0 ${isCompleted ? 'bg-emerald-100 text-emerald-600' : 'bg-violet-100 text-[#7f5feb]'}`}>
                            {a.user_name?.[0]?.toUpperCase() || "?"}
                          </div>
                          <span className="font-bold text-slate-800">{a.user_name}</span>
                        </div>
                      </td>
                      {/* Project Name */}
                      <td className="py-3 px-3 text-slate-600 font-semibold">{projectName || "—"}</td>
                      {/* Task Name */}
                      <td className="py-3 px-3 text-slate-700 font-semibold">{modal.task_name}</td>
                      {/* Total Assigned Units */}
                      <td className="py-3 px-3 text-center">
                        {isEditing ? (
                          <input type="number" min="1" value={eRow.units} onChange={e => handleEditField(a.id, 'units', e.target.value)}
                            className="w-14 px-1 py-0.5 border border-violet-500 rounded text-center font-semibold text-xs outline-none" />
                        ) : <span className="font-bold text-blue-600">{assignedUnits}</span>}
                      </td>
                      {/* Total Assigned Person Days */}
                      <td className="py-3 px-3 text-center">
                        {isEditing ? (
                          <input type="number" min="0" step="0.5" value={eRow.days} onChange={e => handleEditField(a.id, 'days', e.target.value)}
                            className="w-14 px-1 py-0.5 border border-violet-500 rounded text-center font-semibold text-xs outline-none" />
                        ) : <span className="font-semibold text-slate-700">{assignedDays}</span>}
                      </td>
                      {/* Completed Units */}
                      <td className="py-3 px-3 text-center font-bold text-emerald-600">{completedUnits}</td>
                      {/* Completed Person Days */}
                      <td className="py-3 px-3 text-center font-semibold text-emerald-500">{completedDays}</td>
                      {/* Pending Units */}
                      <td className="py-3 px-3 text-center font-bold text-rose-500">{pendingUnits}</td>
                      {/* Pending Person Days */}
                      <td className="py-3 px-3 text-center font-semibold text-rose-400">{pendingDays}</td>
                      {!isAdmin && (
                        <td className="py-3 px-3 text-center">
                          <div className="flex gap-2 justify-center">
                            {isCompleted ? (
                              <span className="inline-flex items-center px-3 py-1 rounded-lg text-[10px] font-bold bg-emerald-50 text-emerald-600 border border-emerald-200 cursor-not-allowed">Completed</span>
                            ) : isEditing ? (
                              <>
                                <button onClick={() => handleEditSave(a.id)} disabled={isSavingThis}
                                  className="border border-emerald-500 text-emerald-600 hover:bg-emerald-50 font-bold px-2 py-0.5 rounded-lg text-[10px]">Save</button>
                                <button onClick={() => cancelEdit(a.id)} disabled={isSavingThis}
                                  className="border border-slate-300 text-slate-500 hover:bg-slate-50 font-bold px-2 py-0.5 rounded-lg text-[10px]">Cancel</button>
                              </>
                            ) : (
                              <>
                                <button onClick={() => startEdit(a)}
                                  className="border border-violet-500 text-violet-500 hover:bg-violet-50 font-bold px-3 py-1 rounded-lg transition-all">Edit</button>
                                <button onClick={() => handleDelete(a.id)}
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
          <div className="p-6 border border-dashed border-slate-200 bg-slate-50/50 rounded-xl text-center text-xs text-slate-400">
            No employees assigned yet.
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="flex justify-end mt-6 pb-10">
        <button onClick={() => navigate("/assignments", { state: { selProject } })}
          className="bg-[#7f5feb] hover:bg-[#6c4ce0] text-white font-bold text-sm py-2.5 px-8 rounded-xl transition-all shadow-sm">
          Done
        </button>
      </div>
    </div>
  );
};

export default AssignEmployee;
