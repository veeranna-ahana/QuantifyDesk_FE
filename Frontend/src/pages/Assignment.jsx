import React, { useEffect, useState, useCallback } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import toast from "react-hot-toast";
import axios from "axios";
import { useSelector } from "react-redux";
import Cookies from "js-cookie";
import SearchableSelect from "../component/SearchableSelect";
import { Icon } from '@iconify/react';

// ── Role helper ───────────────────────────────────────────────────────────────
const getUserRole = () => {
  try {
    const cookieUser = JSON.parse(Cookies.get('user') || 'null');
    if (cookieUser?.role) return cookieUser.role.toUpperCase();
  } catch { /* ignore */ }
  return (localStorage.getItem('role') || 'EMPLOYEE').toUpperCase();
};

const BASE_URL = import.meta.env.VITE_API_BASE_URL;
const getHeaders = () => ({ Authorization: `Bearer ${localStorage.getItem("token") || ""}` });

const ROLE_ORDER = [
  "BA",
  "Solution Architect",
  "UI/UX",
  "FE Dev",
  "BE Dev",
  "Tester",
  "Deployment",
  "Warranty & Support",
  "Project Manager"
];

// ── Role colour map ───────────────────────────────────────────────────────────
const ROLE_COLORS = {
  "BA": { bg: "#f8f8fd", border: "#856BFF", text: "#856BFF" },
  "Solution Architect": { bg: "#f8f8fd", border: "#BA1A1A", text: "#BA1A1A" },
  "UI/UX": { bg: "#f5f6ff", border: "#006C49", text: "#006C49" },
  "FE Dev": { bg: "#fffaf0", border: "#653E00", text: "#653E00" },
  "BE Dev": { bg: "#f6f8ff", border: "#856BFF", text: "#856BFF" },
  "Tester": { bg: "#fdf8ff", border: "#BA1A1A", text: "#BA1A1A" },
  "Deployment": { bg: "#fdf8ff", border: "#006C49", text: "#006C49" },
  "Warranty & Support": { bg: "#fdf8ff", border: "#653E00", text: "#653E00" },
  "Project Manager": { bg: "#eafaf1", border: "#856BFF", text: "#856BFF" },
};
const roleStyle = (role) => ROLE_COLORS[role] || { bg: "#f5f5f5", border: "#999", text: "#333" };
const pct = (a, b) => (b > 0 ? Math.round((a / b) * 100) : 0);

const StatusBadge = ({ assigned, planned }) => {
  const p = pct(assigned, planned);
  if (planned === 0) return <span className="inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold tracking-wider bg-slate-100 text-slate-500">NO LOAD</span>;
  if (p === 0) return <span className="inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold tracking-wider bg-red-50 text-red-600 border border-red-100">UNASSIGNED</span>;
  if (p < 100) return <span className="inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold tracking-wider bg-amber-50 text-amber-600 border border-amber-100">{p}% ASSIGNED</span>;
  return <span className="inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold tracking-wider bg-emerald-50 text-emerald-600 border border-emerald-100">ASSIGNED</span>;
};

// ── KPI Card Component ────────────────────────────────────────────────────────
const KPI = ({ label, value, color }) => (
  <div className="flex-1 min-w-[130px] bg-white border border-slate-100 rounded-xl p-4 shadow-sm"
    style={{ borderLeft: '4px solid', borderLeftColor: color.includes('violet') ? '#856BFF' : color.includes('slate') ? '#94a3b8' : color.includes('sky') ? '#0ea5e9' : color.includes('emerald') ? '#10b981' : '#f43f5e' }}>
    <div className="text-[10px] font-bold tracking-widest text-slate-400 uppercase mb-2 leading-none">{label}</div>
    <div className={`text-[22px] font-extrabold leading-none ${color}`}>{value}</div>
  </div>
);

// ── Effort Chip Component ─────────────────────────────────────────────────────
const EffortChip = ({ label, value, valColor }) => (
  <div className="flex flex-col items-center bg-slate-50 border border-slate-200/60 px-3 py-1 rounded-lg min-w-[80px]">
    <span className="text-[9px] text-slate-400 font-bold tracking-wider uppercase leading-none">{label}</span>
    <span className={`text-[12px] font-bold mt-0.5 leading-none ${valColor || 'text-[#856BFF]'}`}>
      {value !== undefined && value !== null && value !== '' ? Number(value).toFixed(2) : "0.00"}
    </span>
  </div>
);

// ── Assign Modal Component ────────────────────────────────────────────────────
const AssignModal = ({ modal, users, assignments, onAssign, onDelete, onUpdate, onClose, extraData, setExtraData, isAdmin = false }) => {
  const [selUser, setSelUser] = useState("");
  const [units, setUnits] = useState("");
  const [days, setDays] = useState("");
  const [hours, setHours] = useState("");
  const [saving, setSaving] = useState(false);
  const [workload, setWorkload] = useState(null);
  const [loadingWorkload, setLoadingWorkload] = useState(false);
  const [editingRow, setEditingRow] = useState({});
  const [savingEdit, setSavingEdit] = useState({});

  useEffect(() => {
    if (!selUser) {
      setWorkload(null);
      return;
    }
    const fetchWorkload = async () => {
      setLoadingWorkload(true);
      try {
        const res = await axios.get(
          `${BASE_URL}/api/assignments/employee-assignments?emp_id=${selUser}`,
          { headers: getHeaders() }
        );
        if (res.data?.success) {
          setWorkload(res.data.data);
        } else {
          setWorkload(null);
        }
      } catch (err) {
        console.error("Error fetching employee workload:", err);
        setWorkload(null);
      } finally {
        setLoadingWorkload(false);
      }
    };
    fetchWorkload();
  }, [selUser]);

  const handleDaysChange = (val) => {
    setDays(val);
    if (val === "" || isNaN(Number(val))) {
      setHours("");
    } else {
      setHours(String(Number(val) * 8));
    }
  };

  const handleHoursChange = (val) => {
    setHours(val);
    if (val === "" || isNaN(Number(val))) {
      setDays("");
    } else {
      setDays(String(Number(val) / 8));
    }
  };

  const startEdit = (a) => {
    setEditingRow(prev => ({
      ...prev,
      [a.id]: {
        units: String(a.units_assigned),
        days: String(a.estimated_days || 0),
        hours: String(a.estimated_hours || 0),
      },
    }));
  };

  const cancelEdit = (id) => {
    setEditingRow(prev => { const n = { ...prev }; delete n[id]; return n; });
  };

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
      await axios.put(
        `${BASE_URL}/api/assignments/${id}`,
        {
          units_assigned: unitsVal,
          estimated_days: Number(row.days) || 0,
          estimated_hours: Number(row.hours) || 0,
        },
        { headers: getHeaders() }
      );
      setExtraData(prev => ({
        ...prev,
        [id]: {
          estimated_days: Number(row.days) || 0,
          estimated_hours: Number(row.hours) || 0,
          units_assigned: unitsVal,
        },
      }));
      cancelEdit(id);
      toast.success('Assignment updated!');
      onUpdate?.();
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Failed to update.');
    } finally {
      setSavingEdit(prev => ({ ...prev, [id]: false }));
    }
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

  const handleSubmit = async () => {
    if (!selUser) return toast.error("Please select an employee.");
    if (!units || Number(units) <= 0) return toast.error("Enter units > 0.");

    const requestedUnits = Number(units);
    const requestedDays = days ? Number(days) : 0;
    const requestedHours = hours ? Number(hours) : 0;

    if (requestedUnits > remainingUnits) {
      toast.error(`Cannot assign ${requestedUnits} units. Only ${remainingUnits} units remaining.`);
      return;
    }
    if (requestedDays > remainingDays) {
      toast.error(`Cannot assign ${requestedDays} days. Only ${remainingDays} days remaining.`);
      return;
    }
    if (requestedHours > remainingHours) {
      toast.error(`Cannot assign ${requestedHours} hours. Only ${remainingHours} hours remaining.`);
      return;
    }

    setSaving(true);
    try {
      const newAssignment = await onAssign({
        user_id: selUser,
        role: modal.role,
        task_name: modal.task_name,
        units_assigned: requestedUnits,
        estimated_days: requestedDays,
        estimated_hours: requestedHours,
      });
      const savedAssignment = newAssignment?.data || newAssignment;
      if (savedAssignment?.id) {
        setExtraData(prev => ({
          ...prev,
          [savedAssignment.id]: {
            estimated_days: requestedDays,
            estimated_hours: requestedHours,
            units_assigned: requestedUnits,
          },
        }));
      }
      setSelUser("");
      setUnits("");
      setDays("");
      setHours("");
      toast.success("Employee assigned successfully!");
    } catch (e) {
      toast.error(e?.response?.data?.message || "Failed to assign.");
    } finally {
      setSaving(false);
    }
  };

  const rs = roleStyle(modal.role);

  return (
    <div
      className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center z-[1000] p-4"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto p-6 flex flex-col gap-5">
        {/* Header */}
        <div className="flex justify-between items-start">
          <div>
            <h3 className="text-xl font-extrabold text-slate-800">
              {isAdmin ? "View Assignments" : "Assign Employee"}
            </h3>
            <div className="flex items-center gap-2 mt-2 flex-wrap text-sm">
              <span
                className="px-2 py-0.5 rounded text-[10px] font-bold text-white uppercase"
                style={{ backgroundColor: rs.border }}
              >
                {modal.role
                  .split(/\s+/)
                  .map((w) => w[0])
                  .join("")
                  .slice(0, 2)
                  .toUpperCase()}
              </span>
              <span className="text-slate-800 font-bold">
                {modal.task_name}
              </span>
              <span className="text-slate-400 font-bold">·</span>
              <span className="text-slate-400 text-xs font-semibold">
                {modal.unit_type}
              </span>
              {isAdmin && (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold bg-rose-50 text-rose-600 border border-rose-100">
                  <Icon
                    icon="material-symbols:lock"
                    width="12"
                    height="12"
                    color="#e11d48"
                  />
                  VIEW ONLY
                </span>
              )}
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 font-semibold p-1"
          >
            <Icon
              icon="material-symbols:close"
              width="20"
              height="20"
              color="#94a3b8"
            />
          </button>
        </div>

        {/* KPI Cards (Planned Limits) */}
        <div className="grid grid-cols-4 gap-3">
          <div className="bg-[#f5f6ff] rounded-xl p-3.5 flex flex-col items-center justify-center min-h-[76px]">
            <span className="text-[9px] font-extrabold text-slate-400 tracking-wider uppercase mb-1">
              PLANNED UNITS
            </span>
            <span className="text-xl font-extrabold text-slate-800">
              {modal.planned_units ?? 0}
            </span>
          </div>
          <div className="bg-[#f5f6ff] rounded-xl p-3.5 flex flex-col items-center justify-center min-h-[76px]">
            <span className="text-[9px] font-extrabold text-slate-400 tracking-wider uppercase mb-1">
              EST. DAYS
            </span>
            <span className="text-xl font-extrabold text-slate-800">
              {modal.estimated_days ?? 0}
            </span>
          </div>
          <div className="bg-[#f5f6ff] rounded-xl p-3.5 flex flex-col items-center justify-center min-h-[76px]">
            <span className="text-[9px] font-extrabold text-slate-400 tracking-wider uppercase mb-1">
              EST. HOURS
            </span>
            <span className="text-xl font-extrabold text-slate-800">
              {modal.estimated_hours ?? 0}
            </span>
          </div>
          <div className="bg-[#f5f6ff] rounded-xl p-3.5 flex flex-col items-center justify-center min-h-[76px] border-b-[3px] border-[#0052cc]">
            <span className="text-[9px] font-extrabold text-[#0052cc] tracking-wider uppercase mb-1">
              ASSIGNED UNITS
            </span>
            <span className="text-xl font-extrabold text-[#0052cc]">
              {totalAssignedUnits}
            </span>
          </div>
        </div>

        {/* Remaining Balance Strip */}
        <div className="bg-[#f8f9fc] border border-blue-100/80 rounded-xl p-4 flex justify-around items-center text-center">
          <div className="flex-1">
            <div className="text-[9px] font-bold text-[#0052cc] tracking-wider uppercase leading-none mb-1.5">
              REMAINING UNITS
            </div>
            <div className="text-lg font-bold text-emerald-600">
              {remainingUnits}
            </div>
          </div>
          <div className="w-[1px] h-8 bg-slate-200" />
          <div className="flex-1">
            <div className="text-[9px] font-bold text-[#0052cc] tracking-wider uppercase leading-none mb-1.5">
              REMAINING DAYS
            </div>
            <div className="text-lg font-bold text-emerald-600">
              {remainingDays}
            </div>
          </div>
          <div className="w-[1px] h-8 bg-slate-200" />
          <div className="flex-1">
            <div className="text-[9px] font-bold text-[#0052cc] tracking-wider uppercase leading-none mb-1.5">
              REMAINING HOURS
            </div>
            <div className="text-lg font-bold text-emerald-600">
              {remainingHours}
            </div>
          </div>
        </div>

        {/* New Assignment Form */}
        {!isAdmin && (
          <div className="flex flex-col gap-2">
            <h4 className="text-[11px] font-extrabold text-slate-500 tracking-wider uppercase">
              New Assignment
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-5 gap-3 items-end bg-slate-50/50 p-4 border border-slate-100 rounded-xl">
              <div className="md:col-span-2">
                <label className="block text-[10px] font-semibold text-slate-400 mb-1">
                  Employee
                </label>
                <SearchableSelect
                  value={selUser}
                  onChange={setSelUser}
                  placeholder="Select employee…"
                  options={users.map((emp) => ({
                    value: String(emp.employee_id || emp.id),
                    label: emp.emp_name || emp.name,
                  }))}
                  className="rounded-xl text-xs font-semibold text-slate-700 border-slate-200"
                />
              </div>
              <div>
                <label className="block text-[10px] font-semibold text-slate-400 mb-1">
                  Units
                </label>
                <input
                  type="number"
                  min="0"
                  placeholder="0"
                  value={units}
                  onChange={(e) => setUnits(e.target.value)}
                  className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-semibold text-center text-slate-700 outline-none focus:border-violet-500 focus:ring-1 focus:ring-violet-500"
                  style={{ borderColor: unitsExceeded ? "#f43f5e" : "#e2e8f0" }}
                />
              </div>
              <div>
                <label className="block text-[10px] font-semibold text-slate-400 mb-1">
                  Days
                </label>
                <input
                  type="number"
                  min="0"
                  step="0.5"
                  placeholder="0"
                  value={days}
                  onChange={(e) => handleDaysChange(e.target.value)}
                  className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-semibold text-center text-slate-700 outline-none focus:border-violet-500 focus:ring-1 focus:ring-violet-500"
                  style={{ borderColor: daysExceeded ? "#f43f5e" : "#e2e8f0" }}
                />
              </div>
              <div>
                <label className="block text-[10px] font-semibold text-slate-400 mb-1">
                  Hours
                </label>
                <input
                  type="number"
                  min="0"
                  step="0.5"
                  placeholder="0"
                  value={hours}
                  onChange={(e) => handleHoursChange(e.target.value)}
                  className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-semibold text-center text-slate-700 outline-none focus:border-violet-500 focus:ring-1 focus:ring-violet-500"
                  style={{ borderColor: hoursExceeded ? "#f43f5e" : "#e2e8f0" }}
                />
              </div>
              <button
                onClick={handleSubmit}
                disabled={
                  saving ||
                  unitsExceeded ||
                  daysExceeded ||
                  hoursExceeded ||
                  remainingUnits === 0
                }
                className={`w-full py-2 rounded-xl font-bold text-xs transition-all border ${saving ||
                  unitsExceeded ||
                  daysExceeded ||
                  hoursExceeded ||
                  remainingUnits === 0
                  ? "bg-slate-100 text-slate-400 border-slate-200 cursor-not-allowed"
                  : "bg-[#E6FFFA] hover:bg-[#D5FFF6] text-[#319795] border-[#319795] shadow-sm"
                  }`}
              >
                {saving ? "Saving…" : "Assign"}
              </button>
            </div>
            {(unitsExceeded || daysExceeded || hoursExceeded) && (
              <div className="text-rose-500 text-[11px] font-semibold mt-1">
                ⚠️ Values exceed remaining limits. Please adjust.
              </div>
            )}
          </div>
        )}

        {/* Employee's Current Workload */}
        {selUser && (
          <div className="border-t border-slate-100 pt-4">
            <h4 className="text-xs font-bold text-slate-700 mb-2.5 flex items-center gap-1.5">
              <Icon
                icon="material-symbols:work"
                width="16"
                height="16"
                color="#64748b"
              />
              Current Workload
            </h4>
            {loadingWorkload ? (
              <div className="text-xs text-slate-400 italic py-2">
                Loading current workload...
              </div>
            ) : workload && workload.tasks && workload.tasks.length > 0 ? (
              <div className="max-h-40 overflow-y-auto border border-slate-100 rounded-xl p-3 bg-slate-50/50 flex flex-col gap-3">
                {workload.tasks.map((proj) => (
                  <div
                    key={proj.project_id}
                    className="border border-slate-200/40 rounded-lg p-2 bg-white"
                  >
                    <div className="font-bold text-[11px] text-slate-700 border-b border-dashed border-slate-100 pb-1.5 mb-2 flex items-center gap-1.5">
                      <Icon
                        icon="material-symbols:folder"
                        width="14"
                        height="14"
                        color="#64748b"
                      />
                      {proj.project_name}
                    </div>
                    <table className="w-full text-[11px] text-left">
                      <thead>
                        <tr className="bg-slate-50 text-slate-400 font-bold">
                          <th className="py-1 px-2 rounded-l">Task</th>
                          <th className="py-1 px-2">Role</th>
                          <th className="py-1 px-2 text-right">Hrs</th>
                          <th className="py-1 px-2 text-center rounded-r">
                            Status
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {proj.tasks.map((task) => {
                          let statusCls = "bg-slate-100 text-slate-600";
                          let statusText = "Not Started";
                          if (task.status === "in_progress") {
                            statusCls =
                              "bg-blue-50 text-blue-600 border border-blue-100";
                            statusText = "In Progress";
                          } else if (task.status === "completed") {
                            statusCls =
                              "bg-emerald-50 text-emerald-600 border border-emerald-100";
                            statusText = "Completed";
                          }
                          return (
                            <tr
                              key={task.task_id}
                              className="border-b border-slate-50 last:border-none"
                            >
                              <td className="py-1.5 px-2 font-semibold text-slate-700">
                                {task.task_name}
                              </td>
                              <td className="py-1.5 px-2">
                                <span
                                  className="px-1.5 py-0.2 rounded text-[9px] font-bold"
                                  style={{
                                    backgroundColor: `${roleStyle(task.role).border}12`,
                                    color: roleStyle(task.role).border,
                                  }}
                                >
                                  {task.role}
                                </span>
                              </td>
                              <td className="py-1.5 px-2 text-right font-bold text-slate-700">
                                {task.estimated_hours}
                              </td>
                              <td className="py-1.5 px-2 text-center">
                                <span
                                  className={`px-2 py-0.5 rounded-full text-[9px] font-bold ${statusCls}`}
                                >
                                  {statusText}
                                </span>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-4 border border-dashed border-slate-200 bg-slate-50/50 rounded-xl text-center text-xs text-slate-400">
                No active project assignments found.
              </div>
            )}
          </div>
        )}

        {/* Existing Assignments */}
        <div className="border-t border-slate-100 pt-4 flex flex-col gap-3">
          <div className="flex justify-between items-center">
            <span className="text-[11px] font-bold text-slate-500 tracking-wider uppercase">
              Current Assignments ({existing.length})
            </span>
            <span className="text-[9px] font-bold text-slate-300">
              LAST UPDATED: JUST NOW
            </span>
          </div>
          {existing.length > 0 ? (
            <div className="overflow-x-auto border border-slate-100 rounded-xl">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-slate-100 text-[#434654] font-bold text-[10px] uppercase" style={{ backgroundColor: '#EFF4FF' }}>
                    <th className="py-2.5 px-3">Employee</th>
                    <th className="py-2.5 px-3 text-center w-16">Units</th>
                    <th className="py-2.5 px-3 text-center w-16">Days</th>
                    <th className="py-2.5 px-3 text-center w-16">Hours</th>
                    <th className="py-2.5 px-3 text-center w-20">Completed</th>
                    <th className="py-2.5 px-3 text-center w-20">Pending</th>
                    {!isAdmin && (
                      <th className="py-2.5 px-3 text-center w-40">Action</th>
                    )}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {existing.map((a) => {
                    const completed = Number(a.units_completed || 0);
                    const assigned = Number(a.units_assigned || 0);
                    const pending = Math.max(assigned - completed, 0);
                    const isCompleted = assigned > 0 && completed >= assigned;
                    const isEditing = !!editingRow[a.id];
                    const eRow = editingRow[a.id] || {};
                    const isSavingThis = !!savingEdit[a.id];
                    return (
                      <tr
                        key={a.id}
                        className={`transition-colors ${isCompleted ? "bg-emerald-50/40" : "hover:bg-slate-50/20"}`}
                      >
                        <td className="py-3 px-3">
                          <div className="flex items-center gap-2">
                            <div
                              className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold shrink-0 ${isCompleted ? "bg-emerald-100 text-emerald-600" : "bg-violet-100 text-[#7f5feb]"}`}
                            >
                              {a.user_name?.[0]?.toUpperCase() || "?"}
                            </div>
                            <span className="font-bold text-slate-800">
                              {a.user_name}
                            </span>
                          </div>
                        </td>
                        <td className="py-3 px-3 text-center">
                          {isEditing ? (
                            <input
                              type="number"
                              min="1"
                              value={eRow.units}
                              onChange={(e) =>
                                handleEditField(a.id, "units", e.target.value)
                              }
                              className="w-14 px-1 py-0.5 border border-violet-500 rounded text-center font-semibold text-xs outline-none"
                            />
                          ) : (
                            <span className="font-bold text-blue-600">
                              {a.units_assigned}
                            </span>
                          )}
                        </td>
                        <td className="py-3 px-3 text-center text-slate-700">
                          {isEditing ? (
                            <input
                              type="number"
                              min="0"
                              step="0.5"
                              value={eRow.days}
                              onChange={(e) =>
                                handleEditField(a.id, "days", e.target.value)
                              }
                              className="w-14 px-1 py-0.5 border border-violet-500 rounded text-center font-semibold text-xs outline-none"
                            />
                          ) : (
                            <span>{a.estimated_days || 0}</span>
                          )}
                        </td>
                        <td className="py-3 px-3 text-center text-slate-700">
                          {isEditing ? (
                            <input
                              type="number"
                              min="0"
                              step="0.5"
                              value={eRow.hours}
                              onChange={(e) =>
                                handleEditField(a.id, "hours", e.target.value)
                              }
                              className="w-14 px-1 py-0.5 border border-violet-500 rounded text-center font-semibold text-xs outline-none"
                            />
                          ) : (
                            <span>{a.estimated_hours || 0}</span>
                          )}
                        </td>
                        <td className="py-3 px-3 text-center font-bold text-emerald-600">
                          {completed}
                        </td>
                        <td className="py-3 px-3 text-center font-bold text-rose-500">
                          {pending}
                        </td>
                        {!isAdmin && (
                          <td className="py-3 px-3 text-center">
                            <div className="flex gap-2 justify-center">
                              {isCompleted ? (
                                <span className="inline-flex items-center gap-1 px-3 py-1 rounded-lg text-[10px] font-bold bg-emerald-50 text-emerald-600 border border-emerald-200 cursor-not-allowed select-none">
                                  Completed
                                </span>
                              ) : isEditing ? (
                                <>
                                  <button
                                    onClick={() => handleEditSave(a.id)}
                                    disabled={isSavingThis}
                                    className="border border-emerald-500 text-emerald-600 hover:bg-emerald-50 font-bold px-2 py-0.5 rounded-lg text-[10px] transition-all"
                                  >
                                    Save
                                  </button>
                                  <button
                                    onClick={() => cancelEdit(a.id)}
                                    disabled={isSavingThis}
                                    className="border border-slate-300 text-slate-500 hover:bg-slate-50 font-bold px-2 py-0.5 rounded-lg text-[10px] transition-all"
                                  >
                                    Cancel
                                  </button>
                                </>
                              ) : (
                                <>
                                  <button
                                    onClick={() => startEdit(a)}
                                    className="border border-violet-500 text-[#856BFF] hover:bg-violet-50 font-bold px-3 py-1 rounded-lg transition-all"
                                  >
                                    Edit
                                  </button>
                                  <button
                                    onClick={() => onDelete(a.id)}
                                    className="border border-rose-500 text-rose-500 hover:bg-rose-50 font-bold px-3 py-1 rounded-lg transition-all"
                                  >
                                    Remove
                                  </button>
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
            <div className="p-4 border border-dashed border-slate-200 bg-slate-50/50 rounded-xl text-center text-xs text-slate-400">
              No employees assigned yet.
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex justify-end border-t border-slate-100 pt-4">
          <button
            onClick={onClose}
            className="bg-[#7f5feb] hover:bg-[#6c4ce0] text-white font-bold text-sm py-2 px-8 rounded-xl transition-all shadow-sm"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// MAIN SCREEN COMPONENT
// ─────────────────────────────────────────────────────────────────────────────
const AssignmentScreen = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const isAdmin = getUserRole() === 'ADMIN';
  const serviceDeliveryEmployees = useSelector(
    (state) => state.auth.serviceDeliveryEmployees
  );
  const [projects, setProjects] = useState([]);
  const [catalog, setCatalog] = useState({});
  const [selProject, setSelProject] = useState(() => {
    return location.state?.selProject || sessionStorage.getItem("selectedAssignmentProject") || "";
  });

  useEffect(() => {
    if (location.state?.selProject) {
      setSelProject(location.state.selProject);
    }
  }, [location.state?.selProject]);

  useEffect(() => {
    if (selProject) {
      sessionStorage.setItem("selectedAssignmentProject", selProject);
    }
  }, [selProject]);
  const [loadDraft, setLoadDraft] = useState({});
  const [totalLoad, setTotalLoad] = useState(0);
  const [savingLoad, setSavingLoad] = useState(false);
  const [loadSaved, setLoadSaved] = useState(false);
  const [assignments, setAssignments] = useState([]);
  const [summary, setSummary] = useState({ rows: [], totals: {} });
  const [effortByRole, setEffortByRole] = useState({});
  const [collapsedRoles, setCollapsedRoles] = useState({});

  const toggleRole = (role) =>
    setCollapsedRoles(prev => ({ ...prev, [role]: !prev[role] }));

  // ── Initial fetch: projects, catalog ────────────────────────────────
  useEffect(() => {
    const fetchBase = async () => {
      try {
        const [pRes, cRes] = await Promise.all([
          axios.get(`${BASE_URL}/api/projects`, { headers: getHeaders() }),
          axios.get(`${BASE_URL}/api/assignments/catalog`, { headers: getHeaders() }),
        ]);
        setProjects(pRes.data || []);
        setCatalog(cRes.data.grouped || {});
      } catch (err) { console.error(err); }
    };
    fetchBase();
  }, []);

  // ── Per-project fetch: loads, assignments, summary, effort-estimates ───
  const fetchProjectData = useCallback(async (pid) => {
    if (!pid) return;
    try {
      const [lRes, aRes, sRes, eRes] = await Promise.all([
        axios.get(`${BASE_URL}/api/assignments/task-loads/${pid}`, { headers: getHeaders() }),
        axios.get(`${BASE_URL}/api/assignments?projectId=${pid}`, { headers: getHeaders() }),
        axios.get(`${BASE_URL}/api/assignments/summary/${pid}`, { headers: getHeaders() }),
        axios.get(`${BASE_URL}/api/assignments/effort-estimates/${pid}`, { headers: getHeaders() }),
      ]);
      const loads = lRes.data.loads || [];
      setTotalLoad(lRes.data.total_load || 0);

      const effortByRoleData = eRes.data?.byRole || {};
      setEffortByRole(effortByRoleData);

      const effortRoles = Object.keys(effortByRoleData);

      setCatalog(prevCatalog => {
        const filteredCatalog = {};
        effortRoles.forEach(role => {
          if (prevCatalog[role]) {
            filteredCatalog[role] = prevCatalog[role];
          } else {
            filteredCatalog[role] = [
              {
                id: `default_${role}`,
                task_name: `${role} Tasks`,
                unit_type: "Tasks"
              }
            ];
          }
        });
        return filteredCatalog;
      });

      const draft = {};
      loads.forEach(l => {
        draft[`${l.role}||${l.task_name}`] = {
          planned_units: l.planned_units,
          estimated_days: l.estimated_days || "",
          estimated_hours: l.estimated_hours || "",
        };
      });
      setLoadDraft(draft);
      setAssignments(aRes.data || []);
      setSummary(sRes.data || { rows: [], totals: {} });
    } catch (err) { console.error(err); }
  }, []);

  useEffect(() => {
    if (selProject) fetchProjectData(selProject);
  }, [selProject, fetchProjectData]);

  const handleLoadInput = (role, taskName, field, val) => {
    const key = `${role}||${taskName}`;
    setLoadDraft(prev => {
      const currentEntry = prev[key] || {};
      const numericVal = val === "" || isNaN(Number(val)) ? "" : Number(val);
      const nextEntry = {
        ...currentEntry,
        [field]: numericVal,
      };
      if (field === "estimated_days") {
        nextEntry.estimated_hours = numericVal === "" ? "" : numericVal * 8;
      } else if (field === "estimated_hours") {
        nextEntry.estimated_days = numericVal === "" ? "" : numericVal / 8;
      }
      return {
        ...prev,
        [key]: nextEntry,
      };
    });
  };

  const validateLoads = (roleToValidate = null) => {
    const rolesToCheck = roleToValidate ? [roleToValidate] : Object.keys(catalog);

    for (const role of rolesToCheck) {
      const tasks = catalog[role] || [];
      let rolePlannedUnits = 0;
      let rolePlannedHours = 0;

      tasks.forEach(t => {
        const entry = loadDraft[`${role}||${t.task_name}`];
        if (entry) {
          rolePlannedUnits += Number(entry.planned_units) || 0;
          rolePlannedHours += Number(entry.estimated_hours) || 0;
        }
      });

      if (rolePlannedUnits <= 0 && rolePlannedHours <= 0) continue;

      const effortData = effortByRole[role];
      if (!effortData) {
        return `No effort estimate defined for role "${role}". Please set it in the Effort Estimate first.`;
      }

      const maxUnits = Number(effortData.units) || 0;
      const maxHours = Number(effortData.total_hrs) || 0;

      if (maxUnits > 0 && rolePlannedUnits > maxUnits) {
        return `Role "${role}": planned units (${rolePlannedUnits}) exceeds the estimated units (${maxUnits}).`;
      }

      if (maxHours > 0 && rolePlannedHours > maxHours) {
        return `Role "${role}": estimated hours (${rolePlannedHours} hrs) exceeds the estimated hours limit (${maxHours} hrs).`;
      }
    }
    return null;
  };

  const handleSaveLoads = async () => {
    if (!selProject) return;

    const validationError = validateLoads();
    if (validationError) {
      toast.error(validationError);
      return;
    }

    setSavingLoad(true);
    try {
      const loads = [];
      Object.entries(catalog).forEach(([role, tasks]) => {
        tasks.forEach(t => {
          const entry = loadDraft[`${role}||${t.task_name}`];
          if (entry) {
            const pu = Number(entry.planned_units) || 0;
            const ed = Number(entry.estimated_days) || 0;
            const eh = Number(entry.estimated_hours) || 0;
            if (pu > 0 || ed > 0 || eh > 0) {
              loads.push({
                role,
                task_name: t.task_name,
                planned_units: pu,
                estimated_days: ed,
                estimated_hours: eh,
              });
            }
          }
        });
      });
      const res = await axios.post(
        `${BASE_URL}/api/assignments/task-loads/bulk`,
        { project_id: selProject, loads },
        { headers: getHeaders() }
      );
      setTotalLoad(res.data.total_load || 0);
      setLoadSaved(true);
      toast.success("Loads saved successfully!");
      setTimeout(() => setLoadSaved(false), 2500);
      fetchProjectData(selProject);
    } catch (err) {
      toast.error("Failed to save loads. Please try again.");
    } finally {
      setSavingLoad(false);
    }
  };

  const openAssignModal = async (role, task) => {
    const key = `${role}||${task.task_name}`;
    const entry = loadDraft[key] || {};

    const plannedUnits = Number(entry.planned_units) || 0;
    const estimatedDays = Number(entry.estimated_days) || 0;

    if (plannedUnits <= 0 || estimatedDays <= 0) {
      toast.error("Please enter both Planned Units and Est. Days before assigning the task.");
      return;
    }
    const estimatedHours = Number(entry.estimated_hours) || 0;

    const validationError = validateLoads(role);
    if (validationError) {
      toast.error(validationError);
      return;
    }

    if (plannedUnits > 0 || estimatedDays > 0 || estimatedHours > 0) {
      try {
        await axios.post(
          `${BASE_URL}/api/assignments/task-loads/bulk`,
          {
            project_id: selProject,
            loads: [{
              role,
              task_name: task.task_name,
              planned_units: plannedUnits,
              estimated_days: estimatedDays,
              estimated_hours: estimatedHours,
            }]
          },
          { headers: getHeaders() }
        );
        await fetchProjectData(selProject);
      } catch (err) {
        toast.error("Failed to save task load. Please try again.");
        return;
      }
    }

    const projectName = projects.find(p => String(p.id) === String(selProject))?.project_name || "";
    navigate("/assignments/assign", {
      state: {
        modal: {
          role,
          task_name: task.task_name,
          unit_type: task.unit_type,
          planned_units: plannedUnits,
          estimated_days: estimatedDays,
          estimated_hours: estimatedHours,
        },
        selProject,
        projectName,
        assignments,
        extraData: {},
      },
    });
  };



  const summaryByKey = {};
  (summary.rows || []).forEach(r => { summaryByKey[`${r.role}||${r.task_name}`] = r; });
  const { total_planned = 0, total_effort_days = 0, total_effort_hours = 0, total_assigned = 0, total_completed = 0 } = summary.totals || {};

  return (
    <div className="p-6 bg-slate-50 min-h-full font-sans">
      {/* Title */}
      <div className="mb-6">
        <h2 className="text-2xl font-extrabold text-slate-800 flex items-center gap-2">
          Task Allocation
        </h2>
        <p className="text-sm text-slate-500 mt-1">
          Manage workloads and assign personnel to active projects.
        </p>
      </div>

      {/* Main card */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6 mb-6">
        {selProject ? (
          <div className="flex flex-col gap-6">
            {/* Top row: Title + Dropdown */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-slate-100 pb-5">
              <div>
                <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                  Effort Estimate & Assign
                  {isAdmin && (
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-rose-50 text-rose-600 border border-rose-100">
                      <Icon
                        icon="material-symbols:lock"
                        width="12"
                        height="12"
                        color="#e11d48"
                      />
                      VIEW ONLY
                    </span>
                  )}
                </h3>
              </div>

              {/* Project selector styled as Figma */}
              <div className="w-full md:w-[480px]">
                <SearchableSelect
                  value={selProject}
                  onChange={setSelProject}
                  placeholder="Search or choose a project…"
                  options={projects.map((p) => ({
                    value: String(p.id),
                    label: p.project_name || p.name,
                  }))}
                  className="rounded-xl text-sm font-semibold text-slate-700 border-slate-200"
                />
              </div>
            </div>

            {/* KPI Row */}
            <div className="flex gap-3 flex-wrap">
              <KPI
                label="Total Effort"
                value={total_planned + " units"}
                color="text-vio-violet-500" let-600 border-l
              />
              <KPI
                label="Total Days"
                value={total_effort_days}
                color="text-slate-800 border-l-slate-400"
              />
              <KPI
                label="Total Hours"
                value={total_effort_hours}
                color="text-slate-800 border-l-slate-400"
              />
              <KPI
                label="Assigned"
                value={total_assigned}
                color="text-sky-500 border-l-sky-400"
              />
              <KPI
                label="Completed"
                value={total_completed}
                color="text-emerald-500 border-l-emerald-400"
              />
              <KPI
                label="Pending"
                value={Math.max(total_assigned - total_completed, 0)}
                color="text-rose-500 border-l-rose-400"
              />
            </div>
          </div>
        ) : (
          <div>
            <label className="block text-[11px] font-bold text-slate-400 tracking-widest uppercase mb-2">
              SELECTED PROJECT
            </label>
            <div className="w-full md:w-[480px] mb-6">
              <SearchableSelect
                value={selProject}
                onChange={setSelProject}
                placeholder="Search or choose a project…"
                options={projects.map((p) => ({
                  value: String(p.id),
                  label: p.project_name || p.name,
                }))}
                className="rounded-xl text-sm font-semibold text-slate-700 border-slate-200"
              />
            </div>

            {/* Empty state illustration */}
            <div className="border-2 border-dashed border-slate-200/80 bg-slate-50/50 rounded-2xl p-12 flex flex-col items-center justify-center text-center">
              <div className="w-32 h-32 flex items-center justify-center mb-4">
                <svg
                  width="120"
                  height="120"
                  viewBox="0 0 160 160"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <circle cx="80" cy="80" r="60" fill="#f3f0ff" />
                  <g filter="drop-shadow(0px 8px 16px rgba(127, 95, 235, 0.15))">
                    <rect
                      x="56"
                      y="44"
                      width="48"
                      height="64"
                      rx="8"
                      fill="white"
                    />
                    <circle cx="68" cy="58" r="3" fill="#c7d2fe" />
                    <rect
                      x="76"
                      y="56"
                      width="18"
                      height="4"
                      rx="2"
                      fill="#e2e8f0"
                    />
                    <circle cx="68" cy="70" r="3" fill="#c7d2fe" />
                    <rect
                      x="76"
                      y="68"
                      width="18"
                      height="4"
                      rx="2"
                      fill="#e2e8f0"
                    />
                    <circle cx="68" cy="82" r="3" fill="#c7d2fe" />
                    <rect
                      x="76"
                      y="80"
                      width="18"
                      height="4"
                      rx="2"
                      fill="#e2e8f0"
                    />
                  </g>
                  <rect
                    x="92"
                    y="38"
                    width="22"
                    height="22"
                    rx="6"
                    fill="#7f5feb"
                  />
                  <path
                    d="M103 45C104.657 45 106 46.3431 106 48C106 49.6569 104.657 51 103 51C101.343 51 100 49.6569 100 48C100 46.3431 101.343 45 103 45Z"
                    fill="white"
                  />
                  <path
                    d="M96 56C96 53.7909 97.7909 52 100 52H106C108.209 52 110 53.7909 110 56V57H96V56Z"
                    fill="white"
                  />
                </svg>
              </div>
              <h4 className="text-lg font-bold text-slate-800 mb-1.5">
                No Project Selected
              </h4>
              <p className="text-sm text-slate-500 max-w-sm">
                Select a project from the dropdown above to define resource
                loads and begin assigning employees to specific tasks.
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Accordion role table list */}
      {selProject && (
        <div className="flex flex-col gap-4">
          {Object.entries(catalog)
            .sort(([roleA], [roleB]) => {
              const indexA = ROLE_ORDER.indexOf(roleA);
              const indexB = ROLE_ORDER.indexOf(roleB);
              if (indexA === -1 && indexB === -1)
                return roleA.localeCompare(roleB);
              if (indexA === -1) return 1;
              if (indexB === -1) return -1;
              return indexA - indexB;
            })
            .map(([role, tasks]) => {
              const rs = roleStyle(role);
              const effortData = effortByRole[role] || null;
              const rolePlanned = tasks.reduce(
                (s, t) =>
                  s +
                  (Number(
                    loadDraft[`${role}||${t.task_name}`]?.planned_units,
                  ) || 0),
                0,
              );
              const roleAssigned = tasks.reduce(
                (s, t) =>
                  s +
                  Number(
                    summaryByKey[`${role}||${t.task_name}`]?.total_assigned ||
                    0,
                  ),
                0,
              );
              const roleAllocatedHrs = tasks.reduce(
                (s, t) =>
                  s +
                  (Number(
                    loadDraft[`${role}||${t.task_name}`]?.estimated_hours,
                  ) || 0),
                0,
              );
              const remainingBalanceHrs = effortData
                ? (Number(effortData.total_hrs) || 0) - roleAllocatedHrs
                : 0;
              const remainingBalanceUnits = effortData
                ? (Number(effortData.units) || 0) - rolePlanned
                : 0;

              const isCollapsed = !!collapsedRoles[role];

              return (
                <div
                  key={role}
                  className="border border-slate-200/80 rounded-2xl overflow-hidden shadow-sm bg-white"
                >
                  {/* Accordion Header */}
                  <div
                    onClick={() => toggleRole(role)}
                    className="flex flex-col lg:flex-row lg:items-center justify-between p-4 cursor-pointer hover:bg-slate-50/50 transition-all select-none border-l-4"
                    style={{ borderLeftColor: rs.border }}
                  >
                    {/* Left: Initials + Title */}
                    <div className="flex items-center gap-3">
                      <div
                        className="w-9 h-9 rounded-full flex items-center justify-center text-xs font-bold text-white shrink-0"
                        style={{ backgroundColor: rs.border }}
                      >
                        {role
                          .split(/\s+/)
                          .map((w) => w[0])
                          .join("")
                          .slice(0, 2)
                          .toUpperCase()}
                      </div>
                      <div>
                        <h4 className="text-sm font-bold text-slate-800">
                          {role}
                        </h4>
                        <p className="text-[11px] text-slate-400 font-semibold mt-0.5">
                          {rolePlanned} planned · {roleAssigned} assigned
                        </p>
                      </div>
                    </div>

                    {/* Center: Est Chips */}
                    <div className="flex flex-wrap items-center gap-2 mt-3 lg:mt-0 justify-center lg:justify-end flex-1 lg:mr-4">
                      {effortData ? (
                        <>
                          <EffortChip
                            label="Est. Days"
                            value={effortData.effort_days}
                          />
                          <EffortChip
                            label="Est. Hrs"
                            value={effortData.effort_hrs}
                          />
                          <EffortChip
                            label="Buf Days"
                            value={effortData.buffer_days}
                          />
                          <EffortChip
                            label="Total Hrs"
                            value={effortData.total_hrs}
                          />
                          <EffortChip
                            label="Bal Hrs"
                            value={remainingBalanceHrs}
                            valColor={
                              remainingBalanceHrs < 0
                                ? "text-rose-500"
                                : "text-emerald-500"
                            }
                          />
                          <EffortChip
                            label="Bal Units"
                            value={remainingBalanceUnits}
                            valColor={
                              remainingBalanceUnits < 0
                                ? "text-rose-500"
                                : "text-emerald-500"
                            }
                          />
                        </>
                      ) : (
                        <span className="text-xs text-slate-400 italic">
                          No estimate found
                        </span>
                      )}
                    </div>

                    {/* Right: Chevron */}
                    <div className="shrink-0 flex items-center justify-center text-slate-400 mt-2 lg:mt-0">
                      <svg
                        className={`w-5 h-5 transition-transform duration-200 ${isCollapsed ? "-rotate-90" : "rotate-0"}`}
                        fill="none"
                        stroke="currentColor"
                        strokeWidth={2.5}
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M19 9l-7 7-7-7"
                        />
                      </svg>
                    </div>
                  </div>

                  {/* Accordion Body */}
                  {!isCollapsed && (
                    <div className="overflow-x-auto border-t border-slate-100">
                      <table className="w-full text-left border-collapse">
                        <thead>
                          <tr className="border-b border-slate-100" style={{ backgroundColor: '#EFF4FF' }}>

                            <th className="py-3 px-4 text-[10px] font-bold text-slate-500 tracking-wider uppercase">
                              Task Name
                            </th>
                            <th className="py-3 px-4 text-[10px] font-bold text-slate-500 tracking-wider uppercase text-center w-28">
                              Planned Units
                            </th>
                            <th className="py-3 px-4 text-[10px] font-bold text-slate-500 tracking-wider uppercase text-center w-24">
                              Est. Days
                            </th>
                            <th className="py-3 px-4 text-[10px] font-bold text-slate-500 tracking-wider uppercase text-center w-24">
                              Est. Hours
                            </th>
                            <th className="py-3 px-4 text-[10px] font-bold text-slate-500 tracking-wider uppercase w-32">
                              Unit Type
                            </th>
                            <th className="py-3 px-4 text-[10px] font-bold text-slate-500 tracking-wider uppercase text-center w-20">
                              Assigned
                            </th>
                            <th className="py-3 px-4 text-[10px] font-bold text-slate-500 tracking-wider uppercase text-center w-20">
                              Completed
                            </th>
                            <th className="py-3 px-4 text-[10px] font-bold text-slate-500 tracking-wider uppercase text-center w-36">
                              Status
                            </th>
                            <th className="py-3 px-4 text-[10px] font-bold text-slate-500 tracking-wider uppercase text-center w-28">
                              Action
                            </th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                          {tasks.map((t) => {
                            const key = `${role}||${t.task_name}`;
                            const entry = loadDraft[key] || {};
                            const planned = Number(entry.planned_units) || 0;
                            const estimatedDays =
                              Number(entry.estimated_days) || 0;
                            const sumRow = summaryByKey[key];
                            const assigned = sumRow
                              ? Number(sumRow.total_assigned)
                              : 0;
                            const completed = sumRow
                              ? Number(sumRow.total_completed)
                              : 0;
                            const assigneeCount = assignments.filter(
                              (a) =>
                                a.role === role && a.task_name === t.task_name,
                            ).length;

                            return (
                              <tr
                                key={t.id}
                                className="hover:bg-slate-50/20 transition-colors"
                              >
                                <td className="py-3.5 px-4 text-sm font-semibold text-slate-700">
                                  {t.task_name}
                                </td>

                                {/* Planned Units */}
                                <td className="py-3.5 px-4 text-center">
                                  {isAdmin ? (
                                    <span className="text-sm font-semibold text-slate-600">
                                      {entry.planned_units ?? "—"}
                                    </span>
                                  ) : (
                                    <input
                                      type="number"
                                      min="0"
                                      value={entry.planned_units ?? ""}
                                      placeholder="0"
                                      onClick={(e) => e.stopPropagation()}
                                      onChange={(e) =>
                                        handleLoadInput(
                                          role,
                                          t.task_name,
                                          "planned_units",
                                          e.target.value,
                                        )
                                      }
                                      className="w-20 px-2 py-1 bg-white border border-slate-200 rounded-lg text-center text-xs font-semibold focus:outline-none focus:border-violet-500 focus:ring-1 focus:ring-violet-500"
                                    />
                                  )}
                                </td>

                                {/* Est. Days */}
                                <td className="py-3.5 px-4 text-center">
                                  {isAdmin ? (
                                    <span className="text-sm font-semibold text-slate-600">
                                      {entry.estimated_days ?? "—"}
                                    </span>
                                  ) : (
                                    <input
                                      type="number"
                                      min="0"
                                      step="0.5"
                                      value={entry.estimated_days ?? ""}
                                      placeholder="0"
                                      onClick={(e) => e.stopPropagation()}
                                      onChange={(e) =>
                                        handleLoadInput(
                                          role,
                                          t.task_name,
                                          "estimated_days",
                                          e.target.value,
                                        )
                                      }
                                      className="w-20 px-2 py-1 bg-white border border-slate-200 rounded-lg text-center text-xs font-semibold focus:outline-none focus:border-violet-500 focus:ring-1 focus:ring-violet-500"
                                    />
                                  )}
                                </td>

                                {/* Est. Hours */}
                                <td className="py-3.5 px-4 text-center">
                                  {isAdmin ? (
                                    <span className="text-sm font-semibold text-slate-600">
                                      {entry.estimated_hours ?? "—"}
                                    </span>
                                  ) : (
                                    <input
                                      type="number"
                                      min="0"
                                      step="0.5"
                                      value={entry.estimated_hours ?? ""}
                                      placeholder="0"
                                      onClick={(e) => e.stopPropagation()}
                                      onChange={(e) =>
                                        handleLoadInput(
                                          role,
                                          t.task_name,
                                          "estimated_hours",
                                          e.target.value,
                                        )
                                      }
                                      className="w-20 px-2 py-1 bg-white border border-slate-200 rounded-lg text-center text-xs font-semibold focus:outline-none focus:border-violet-500 focus:ring-1 focus:ring-violet-500"
                                    />
                                  )}
                                </td>

                                <td className="py-3.5 px-4 text-xs font-semibold text-slate-400">
                                  {t.unit_type}
                                </td>
                                <td className="py-3.5 px-4 text-center text-sm font-bold text-sky-600">
                                  {assigned}
                                </td>
                                <td className="py-3.5 px-4 text-center text-sm font-bold text-slate-500">
                                  {completed}
                                </td>
                                <td className="py-3.5 px-4 text-center">
                                  <StatusBadge
                                    assigned={assigned}
                                    planned={planned}
                                  />
                                </td>

                                {/* Assign button */}
                                <td className="py-3.5 px-4 text-center">
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      openAssignModal(role, t);
                                    }}
                                    disabled={
                                      planned <= 0 || estimatedDays <= 0
                                    }
                                    className={`w-full py-1.5 px-3 rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 transition-all ${planned <= 0 || estimatedDays <= 0
                                      ? "bg-slate-100 text-slate-400 cursor-not-allowed"
                                      : "bg-[#856BFF] hover:bg-[#7b5efd] text-white shadow-sm"
                                      }`}
                                    title={
                                      planned <= 0 || estimatedDays <= 0
                                        ? "Enter Planned Units and Est. Days first"
                                        : `Assign employees to ${t.task_name}`
                                    }
                                  >
                                    <Icon
                                      icon="material-symbols:person-add"
                                      width="14"
                                      height="14"
                                      color={
                                        planned <= 0 || estimatedDays <= 0
                                          ? "#94a3b8"
                                          : "#ffffff"
                                      }
                                    />
                                    Assign
                                    {assigneeCount > 0 && (
                                      <span className="ml-1 bg-white/20 px-1.5 py-0.5 rounded-full text-[10px]">
                                        {assigneeCount}
                                      </span>
                                    )}
                                  </button>
                                </td>
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

          {/* Bottom Actions */}
          {selProject && (
            <div className="flex justify-end gap-3 mt-6 pb-12">
              <button
                onClick={() => {
                  setSelProject("");
                  sessionStorage.removeItem("selectedAssignmentProject");
                }}
                className="flex items-center gap-2 border border-slate-200 hover:bg-slate-50 text-slate-600 font-bold text-sm py-2.5 px-6 rounded-xl transition-all"
              >
                <Icon icon="material-symbols:close" width="18" height="18" color="#64748b" />
                Cancel
              </button>
              {!isAdmin && (
                <button
                  onClick={handleSaveLoads}
                  disabled={savingLoad}
                  className="flex items-center gap-2 bg-[#856BFF] hover:bg-[#856BFF] text-white font-bold text-sm py-2.5 px-6 rounded-xl transition-all shadow-sm disabled:opacity-55 disabled:cursor-not-allowed"
                >
                  {savingLoad ? (
                    <>Saving...</>
                  ) : (
                    <>
                      <Icon icon="material-symbols:save" width="18" height="18" color="#ffffff" />
                      Submit Final Estimate
                    </>
                  )}
                </button>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default AssignmentScreen;
