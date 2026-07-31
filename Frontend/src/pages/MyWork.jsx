import React, { useEffect, useState } from "react";
import axios from "axios";
import { useSelector } from "react-redux";
import { Icon } from '@iconify/react';

const BASE_URL = import.meta.env.VITE_API_BASE_URL;
const getHeaders = () => ({
  Authorization: `Bearer ${localStorage.getItem("token") || ""}`,
});

// Role-to-task mapping for manual tasks
const roleTaskMapping = {
  BA: [
    "BA-BRD",
    "BA-TDD",
    "BA-Requirements Sign Off"
  ],
  UI: [
    "UI Design / Figma",
    "UI Review",
    "UI Signoff"
  ],
  TL: [
    "TL-Code Review",
    "TL-Unit Testing",
    "TL-Assign Task",
    "TL-Peer Code Merge"
  ],
  "FE Dev": [
    "FEDev-UI Implementation",
    "FEDev-API Design",
    "FEDev-API Implementation",
    "FEDev-API Integration"
  ],
  "BE Dev": [
    "BEDev-DB Design",
    "BEDev-API Implementation",
    "BEDev-API Testing",
    "BEDev-UI Testing",
    "BEDev-Documentation",
    "BEDev-Design Review",
    "BEDev-Code Review",
    "BEDev-Release Notes (Each Build)"
  ],
  "Mobile/IOS Dev": [
    "Mobile API Integration"
  ],
  Tester: [
    "UAT Testing",
    "Test Cases Documentation Preparation",
    "Integration Testing",
    "Fault Tracker",
    "Traceability Matrix",
    "Aging Report",
    "QA Sign Off",
    "User Manual Preparation"
  ]
};

// ── Mini progress ring ────────────────────────────────────────────────────────
const Ring = ({ pct, size = 54 }) => {
  const r = (size - 8) / 2;
  const circ = 2 * Math.PI * r;
  const fill = (pct / 100) * circ;
  const color = pct >= 100 ? "#2ecc71" : pct > 50 ? "#f39c12" : "#856BFF";
  return (
    <svg width={size} height={size} className="shrink-0">
      <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="#f0f0f0" strokeWidth={6} />
      <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke={color} strokeWidth={6}
        strokeDasharray={`${fill} ${circ}`} strokeLinecap="round"
        transform={`rotate(-90 ${size / 2} ${size / 2})`}
        className="transition-all duration-500 ease-out" />
      <text x="50%" y="54%" dominantBaseline="middle" textAnchor="middle"
        fontSize="11" fontWeight="700" fill={color}>{pct}%</text>
    </svg>
  );
};

const MyWork = () => {
  // ✅ Get user from Redux store
  const user = useSelector((state) => state.auth.user);
  const userId = user?.emp_id || localStorage.getItem("emp_id");
  const [assignments, setAssignments] = useState([]);
  const [loading, setLoading] = useState(true);

  // Log progress modal
  const [logModal, setLogModal] = useState(null);
  const [logDate, setLogDate] = useState(today());
  const [todaysTasks, setTodaysTasks] = useState("");
  const [totalTimeNeeded, setTotalTimeNeeded] = useState("");
  const [logUnits, setLogUnits] = useState("");
  const [yesterdaysTasks, setYesterdaysTasks] = useState("");
  const [risks, setRisks] = useState("");
  const [dependency, setDependency] = useState("");
  const [logError, setLogError] = useState("");
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState(null);

  // Manual Task State
  const [manualModalOpen, setManualModalOpen] = useState(false);
  const [projects, setProjects] = useState([]);
  const [manualProjectId, setManualProjectId] = useState("");
  const [manualRole, setManualRole] = useState("");
  const [manualTaskName, setManualTaskName] = useState("");
  const [isCustomTask, setIsCustomTask] = useState(false);
  const [manualDescription, setManualDescription] = useState("");
  const [manualDate, setManualDate] = useState(today());
  const [manualDoneYesterday, setManualDoneYesterday] = useState("");
  const [manualTodaysPlan, setManualTodaysPlan] = useState("");
  const [manualRisks, setManualRisks] = useState("");
  const [manualTotalTimeNeeded, setManualTotalTimeNeeded] = useState("");
  const [manualAvailability, setManualAvailability] = useState("");
  const [manualError, setManualError] = useState("");
  const [manualSaving, setManualSaving] = useState(false);

  const showToast = (msg, type = "success") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  };

  function today() {
    return new Date().toISOString().split("T")[0];
  }

  const fetchAssignments = async () => {
    try {
      setLoading(true);
      const res = await axios.get(
        `${BASE_URL}/api/utilization/my-assignments?userId=${userId}`,
        { headers: getHeaders() }
      );
      setAssignments(res.data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchProjects = async () => {
    try {
      const res = await axios.get(
        `${BASE_URL}/api/projects`,
        { headers: getHeaders() }
      );
      setProjects(res.data || []);
    } catch (err) {
      console.error("Failed to fetch projects:", err);
    }
  };

  useEffect(() => {
    fetchAssignments();
    fetchProjects();
  }, []);

  // Automatically calculate availability
  useEffect(() => {
    const hours = parseFloat(manualTotalTimeNeeded);
    if (!isNaN(hours)) {
      setManualAvailability(String(Math.max(8 - hours, 0)));
    } else {
      setManualAvailability("");
    }
  }, [manualTotalTimeNeeded]);

  const openLog = (a) => {
    setLogModal(a);
    setLogDate(today());
    setTodaysTasks("");
    setTotalTimeNeeded("");
    setLogUnits("");
    setYesterdaysTasks("");
    setRisks("");
    setDependency("");
    setLogError("");
  };

  const submitLog = async () => {
    if (!logDate) { setLogError("Date is required."); return; }
    if (!todaysTasks || !todaysTasks.trim()) { setLogError("Today's Tasks are required."); return; }
    if (!totalTimeNeeded || !totalTimeNeeded.trim()) { setLogError("Total Time Needed is required."); return; }

    if (logUnits && Number(logUnits) > 0) {
      const effective = logModal.units_pending - (Number(logModal.units_awaiting) || 0);
      if (Number(logUnits) > effective) {
        setLogError(`Max ${effective} units available to log (${logModal.units_awaiting} awaiting approval)`);
        return;
      }
    } else if (logUnits && Number(logUnits) < 0) {
      setLogError("Units cannot be negative."); return;
    }
    setSaving(true);
    try {
      await axios.post(
        `${BASE_URL}/api/utilization/log-progress`,
        {
          assignment_id: logModal.assignment_id,
          user_id: userId,
          date: logDate,
          todays_tasks: todaysTasks,
          total_time_needed: totalTimeNeeded,
          units_completed: Number(logUnits),
          yesterdays_tasks: yesterdaysTasks,
          risks: risks,
          dependency: dependency,
          project_id: logModal.project_id,
          role: logModal.role,
          task_name: logModal.task_name,
        },
        { headers: getHeaders() }
      );
      setLogModal(null);
      showToast("Progress logged successfully!");
      fetchAssignments();
    } catch (err) {
      const errMsg = err.response?.data?.message || "Failed to log";
      setLogError(errMsg);
      showToast(errMsg, "error");
    } finally {
      setSaving(false);
    }
  };

  const submitManualTask = async () => {
    if (!manualProjectId) { setManualError("Project is required."); return; }
    if (!manualRole) { setManualError("Role is required."); return; }
    if (!manualTaskName || !manualTaskName.trim()) { setManualError("Task name/title is required."); return; }
    if (!manualDate) { setManualError("Date is required."); return; }
    if (!manualTodaysPlan || !manualTodaysPlan.trim()) { setManualError("Today's Tasks are required."); return; }
    if (!manualTotalTimeNeeded || !manualTotalTimeNeeded.trim()) { setManualError("Total Time Needed is required."); return; }

    setManualSaving(true);
    setManualError("");
    try {
      await axios.post(
        `${BASE_URL}/api/utilization/log-progress`,
        {
          assignment_id: null,
          user_id: userId,
          date: manualDate,
          project_id: parseInt(manualProjectId, 10),
          role: manualRole,
          task_name: manualTaskName,
          remarks: manualDescription,
          yesterdays_tasks: manualDoneYesterday,
          todays_tasks: manualTodaysPlan,
          risks: manualRisks,
          total_time_needed: manualTotalTimeNeeded,
          availability: manualAvailability,
          units_completed: 0
        },
        { headers: getHeaders() }
      );
      setManualModalOpen(false);
      showToast("Manual task logged successfully!");
      // Reset
      setManualProjectId("");
      setManualRole("");
      setManualTaskName("");
      setIsCustomTask(false);
      setManualDescription("");
      setManualDoneYesterday("");
      setManualTodaysPlan("");
      setManualRisks("");
      setManualTotalTimeNeeded("");
      setManualAvailability("");
      fetchAssignments();
    } catch (err) {
      const errMsg = err.response?.data?.message || "Failed to create manual task";
      setManualError(errMsg);
      showToast(errMsg, "error");
    } finally {
      setManualSaving(false);
    }
  };

  // Group by project
  const byProject = assignments.reduce((acc, a) => {
    const key = a.project_name || "Unknown";
    if (!acc[key]) acc[key] = [];
    acc[key].push(a);
    return acc;
  }, {});

  const totalAssigned = assignments.reduce((s, a) => s + Number(a.units_assigned), 0);
  const totalCompleted = assignments.reduce((s, a) => s + Number(a.units_completed), 0);
  const totalAwaiting = assignments.reduce((s, a) => s + Number(a.units_awaiting || 0), 0);
  const totalPending = assignments.reduce((s, a) => s + Number(a.units_pending), 0);
  const overallPct = totalAssigned > 0 ? Math.round((totalCompleted / totalAssigned) * 100) : 0;
  
  // Calculate total projects
  const totalProjects = Object.keys(byProject).length;

  // ── Full-page Progress Update view (replaces the assignment list while active) ──
  if (logModal) {
    const assignedVal = logModal.units_assigned;
    const pendingVal = Math.max(logModal.units_pending - Number(logModal.units_awaiting || 0), 0);

    return (
      <div className=" mx-auto p-5 font-sans">
        {toast && (
          <div
            className={`fixed top-5 right-5 z-[9999] text-white px-5 py-3 rounded-lg font-bold text-sm shadow-lg ${toast.type === "error" ? "bg-red-500" : toast.type === "warn" ? "bg-amber-500" : "bg-green-600"
              }`}
          >
            {toast.msg}
          </div>
        )}

        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-8">
          <h2 className="text-xl font-extrabold text-gray-900 mb-1">Progress Update</h2>
          <p className="text-sm text-gray-500 mb-5">
            Project:{" "}
            <span className="inline-block px-2.5 py-0.5 rounded-full bg-[#856BFF]/10 text-[#856BFF] text-xs font-semibold align-middle">
              {logModal.project_name}
            </span>
          </p>

          <div className="border-t border-gray-100 mb-5" />

          {/* Current task info box */}
          <div className="bg-[#F3F1FF] rounded-lg p-4 mb-5 flex items-center justify-between gap-4 flex-wrap">
            <div>
              <div className="text-[11px] font-semibold text-gray-400 uppercase tracking-wide">Current Task</div>
              <div className="text-[#856BFF] font-bold text-sm mt-0.5">
                {logModal.role}-{logModal.task_name}
              </div>
            </div>
            <div className="flex gap-3">
              <div className="bg-white border border-gray-200 rounded-lg px-5 py-2 text-center min-w-[110px]">
                <div className="text-[10px] text-gray-400 font-semibold uppercase tracking-wide">Assigned Units</div>
                <div className="font-extrabold text-gray-900 text-lg">{assignedVal}</div>
              </div>
              <div className="bg-white border border-gray-200 rounded-lg px-5 py-2 text-center min-w-[110px]">
                <div className="text-[10px] text-gray-400 font-semibold uppercase tracking-wide">Pending units</div>
                <div className="font-extrabold text-[#856BFF] text-lg">{pendingVal}</div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4">
            <div className="mb-4">
              <label className="block text-xs font-semibold text-gray-600 mb-1.5">Update Date</label>
              <div className="relative">
                <input
                  type="date"
                  value={logDate}
                  onChange={e => setLogDate(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-200 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-[#856BFF]/40"
                />
              </div>
            </div>
            <div className="mb-4">
              <label className="block text-xs font-semibold text-gray-600 mb-1.5">
                Units Completed  (Max {pendingVal})
              </label>
              <input
                type="number"
                value={logUnits}
                min="1"
                max={pendingVal}
                onChange={e => { setLogUnits(e.target.value); setLogError(""); }}
                placeholder="0.0"
                className="w-full px-3 py-2 border border-gray-200 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-[#856BFF]/40"
              />
            </div>
          </div>

          <div className="mb-4">
            <label className="block text-xs font-semibold text-gray-600 mb-1.5">Total Estimated Time (HH:MM)</label>
            <div className="relative">
              <Icon icon="material-symbols:schedule" width="16" height="16" color="#856BFF" className="absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={totalTimeNeeded}
                onChange={e => { setTotalTimeNeeded(e.target.value); setLogError(""); }}
                placeholder="e.g. 12:30"
                className="w-full pl-9 pr-3 py-2 border border-gray-200 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-[#856BFF]/40"
              />
            </div>
          </div>

          <div className="mb-4">
            <label className="block text-xs font-semibold text-gray-600 mb-1.5">Today's Progress &amp; Tasks</label>
            <textarea
              value={todaysTasks}
              onChange={e => { setTodaysTasks(e.target.value); setLogError(""); }}
              placeholder="Detail the work completed during this session…"
              className="w-full px-3 py-2 border border-gray-200 rounded-md text-sm min-h-[80px] resize-y focus:outline-none focus:ring-2 focus:ring-[#856BFF]/40"
            />
          </div>

          <div className="mb-4">
            <label className="block text-xs font-semibold text-gray-600 mb-1.5">Yesterday's Tasks (Optional)</label>
            <textarea
              value={yesterdaysTasks}
              onChange={e => setYesterdaysTasks(e.target.value)}
              placeholder="Carry over any specific context from previous update…"
              className="w-full px-3 py-2 border border-gray-200 rounded-md text-sm min-h-[80px] resize-y focus:outline-none focus:ring-2 focus:ring-[#856BFF]/40"
            />
          </div>

          <div className="mb-4">
            <label className="block text-xs font-semibold text-gray-600 mb-1.5">Risks / Blockers</label>
            <div className="relative">
              <textarea
                value={risks}
                onChange={e => setRisks(e.target.value)}
                placeholder="List any technical debt or resource dependencies causing delays…"
                className="w-full px-3 py-2 pr-9 border border-gray-200 rounded-md text-sm min-h-[80px] resize-y focus:outline-none focus:ring-2 focus:ring-[#856BFF]/40"
              />
              <Icon icon="material-symbols:warning" width="16" height="16" color="#ef4444" className="absolute right-3 top-3" />
            </div>
          </div>

          <div className="mb-2">
            <label className="block text-xs font-semibold text-gray-600 mb-1.5">Dependency</label>
            <textarea
              value={dependency}
              onChange={e => setDependency(e.target.value)}
              placeholder="List any technical debt or resource dependencies causing delays…"
              className="w-full px-3 py-2 border border-gray-200 rounded-md text-sm min-h-[80px] resize-y focus:outline-none focus:ring-2 focus:ring-[#856BFF]/40"
            />
          </div>

          {logError && <p className="text-red-500 text-xs mt-2">{logError}</p>}

          <div className="border-t border-gray-100 my-5" />

          <div className="flex justify-end gap-2.5">
            <button
              onClick={() => setLogModal(null)}
              className="px-5 py-2 bg-white border border-gray-200 hover:bg-gray-50 rounded-md font-semibold text-sm transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={submitLog}
              disabled={saving}
              className="px-5 py-2 bg-[#856BFF] hover:bg-[#7259e6] disabled:opacity-60 text-white rounded-md font-bold text-sm transition-colors"
            >
              {saving ? "Submitting…" : "Submit Update"}
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className=" mx-auto p-5 font-sans">
      {/* Toast */}
      {toast && (
        <div
          className={`fixed top-5 right-5 z-[9999] text-white px-5 py-3 rounded-lg font-bold text-sm shadow-lg ${toast.type === "error" ? "bg-red-500" : toast.type === "warn" ? "bg-amber-500" : "bg-green-600"
            }`}
        >
          {toast.msg}
        </div>
      )}

      {/* ── Page header ── */}
      <div className="flex justify-between items-start mb-6">
        <div>
          <h2 className="text-2xl font-extrabold text-gray-900 m-0">My Work</h2>
          <p className="text-sm text-gray-400 mt-1">
            Monitor assignments, approvals, and progress across ongoing projects.
          </p>
        </div>
        <button
          onClick={() => setManualModalOpen(true)}
          className="flex items-center gap-1.5 px-4 py-2 bg-[#856BFF] hover:bg-[#7259e6] text-white rounded-lg text-sm font-bold shadow-sm transition-colors"
        >
          <Icon icon="material-symbols:add" width="18" height="18" color="#ffffff" />
          Create Task
        </button>
      </div>

      {/* ── Summary strip ── */}
{!loading && assignments.length > 0 && (
  <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4 mb-6">
    <StatCard label="Total Projects" value={totalProjects} suffix="Projects" />
    <StatCard label="Total Assigned" value={totalAssigned} suffix="Units" />
    <StatCard label="Completed Units" value={totalCompleted} suffix="Units" />
    <StatCard label="Pending" value={totalPending} suffix="Units" />
    {/* {totalAwaiting > 0 && <StatCard label="Awaiting Approval" value={totalAwaiting} suffix="Units" />} */}
    <div className="bg-white rounded-lg shadow-sm border-l-4 border-[#856BFF] px-5 py-4 flex items-center justify-between gap-4">
      <div>
        <div className="text-[11px] font-semibold text-gray-400 uppercase tracking-wide">Overall Progress</div>
        <div className="text-2xl font-extrabold text-gray-900 mt-1">{overallPct}%</div>
      </div>
      <Ring pct={overallPct} size={54} />
    </div>
  </div>
)}
      {loading && <p className="text-gray-400 py-8 text-center">Loading your assignments…</p>}

      {!loading && assignments.length === 0 && (
        <div className="text-center py-16 px-5 bg-white rounded-lg shadow-sm">
          <p className="text-lg text-gray-300">No assignments yet.</p>
          <p className="text-sm text-gray-300">Your manager will assign tasks soon.</p>
          <button
            onClick={() => setManualModalOpen(true)}
            className="flex items-center gap-2 mt-4 px-6 py-3 bg-[#856BFF] hover:bg-[#7259e6] text-white rounded-lg text-sm font-bold shadow-sm transition-colors"
          >
            <Icon icon="material-symbols:add" width="18" height="18" color="#ffffff" />
            Create a Manual Task
          </button>
        </div>
      )}

      {/* ── Project groups ── */}
      {Object.entries(byProject).map(([projectName, rows]) => {
        const pAssigned = rows.reduce((s, r) => s + Number(r.units_assigned), 0);
        const pCompleted = rows.reduce((s, r) => s + Number(r.units_completed), 0);
        const pPct = pAssigned > 0 ? Math.round((pCompleted / pAssigned) * 100) : 0;

        return (
          <div key={projectName} className="bg-white rounded-2xl shadow-sm border border-gray-100 mb-5 overflow-hidden">
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4">
              <div className="flex items-center gap-3">
                <span className="w-1.5 h-6 rounded-full bg-[#7B61FF]" />
                <span className="font-bold text-gray-900 text-base">{projectName}</span>
              </div>
              <div className="text-right">
                <div className="text-xs text-gray-400">Completion Rate</div>
                <div className={`text-sm font-bold ${pPct >= 100 ? "text-green-600" : pPct === 0 ? "text-red-500" : "text-amber-500"}`}>
                  {pPct}% ({pCompleted}/{pAssigned} Units)
                </div>
              </div>
            </div>

            {/* Table */}
            <table className="w-full border-collapse">
              <thead>
                <tr className="bg-[#EFF4FF]">
                  <th className="px-6 py-3 text-xs font-semibold text-[#434654] text-left">Role</th>
                  <th className="px-6 py-3 text-xs font-semibold text-[#434654]text-left">Task</th>
                  <th className="px-6 py-3 text-xs font-semibold text-[#434654] text-left">Assigned</th>
                  <th className="px-6 py-3 text-xs font-semibold text-[#434654] text-left">Pending</th>
                  <th className="px-6 py-3 text-xs font-semibold text-[#434654] text-left">Progress</th>
                  <th className="px-6 py-3 text-xs font-semibold text-[#434654]text-left">Action</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((a) => {
                  const completedPct = a.units_assigned > 0
                    ? Math.round((a.units_completed / a.units_assigned) * 100) : 0;
                  const awaiting = Number(a.units_awaiting || 0);
                  const effectivePend = Math.max(a.units_pending - awaiting, 0);
                  const fullyDone = Number(a.units_pending) === 0 && awaiting === 0;

                  return (
                    <tr key={a.assignment_id} className="border-b border-gray-100 last:border-0">
                      <td className="px-6 py-4 text-sm text-gray-700">{a.role}</td>
                      <td className="px-6 py-4 text-sm text-[#7B61FF] font-medium">{a.task_name}</td>
                      <td className="px-6 py-4 text-sm text-gray-900">{a.units_assigned}</td>
                      <td className={`px-6 py-4 text-sm font-semibold ${effectivePend > 0 ? "text-red-500" : "text-gray-900"}`}>
                        {effectivePend}
                      </td>
                      <td className="px-6 py-4">
                        <div className="w-full max-w-[160px] h-2 rounded-full bg-gray-100 overflow-hidden flex">
                          <div
                            className="h-full rounded-full transition-all duration-500 ease-out"
                            style={{
                              width: `${Math.min(completedPct, 100)}%`,
                              backgroundColor: completedPct >= 100 ? "#1B9C56" : completedPct > 50 ? "#f39c12" : "#e74c3c",
                            }}
                          />
                          {awaiting > 0 && (
                            <div
                              className="h-full opacity-50"
                              style={{
                                width: `${Math.min((awaiting / a.units_assigned) * 100, 100 - completedPct)}%`,
                                backgroundColor: "#f39c12",
                              }}
                            />
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        {fullyDone ? (
                          <span className="inline-flex items-center gap-1.5 text-green-600 font-semibold text-sm">
                            <Icon icon="material-symbols:check-circle" width="20" height="20" color="#22c55e" />
                            Done
                          </span>
                        ) : awaiting > 0 && effectivePend === 0 ? (
                            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-50 text-amber-700 text-xs font-semibold">
                              <Icon icon="material-symbols:pending" width="14" height="14" color="#d97706" />
                              Awaiting
                            </span>
                        ) : (
                              <button
                                onClick={() => openLog(a)}
                                disabled={effectivePend === 0}
                                className="flex items-center gap-1.5 px-4 py-1.5 bg-[#856BFF] hover:bg-[#7254fa] disabled:opacity-40 disabled:cursor-not-allowed text-white rounded-lg text-xs font-semibold transition-colors"
                              >
                                <Icon icon="boxicons:edit" width="20" height="20" color="#ffffff" />
                                Update
                              </button>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        );
      })}

      {/* ── Add Manual Task Modal ── */}
      {manualModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[1000] p-5">
          <div className="bg-white rounded-xl p-7 w-full max-w-lg max-h-[90vh] overflow-y-auto shadow-2xl">
            <h3 className="text-lg font-extrabold text-gray-900 mb-1">Create Manual Task</h3>
            <p className="text-sm text-gray-400 mb-4">Add a new task manually and log progress directly.</p>

            <div className="mb-3.5">
              <label className="block text-sm font-semibold text-gray-600 mb-1.5">
                Project <span className="text-red-500">*</span>
              </label>
              <select
                value={manualProjectId}
                onChange={e => setManualProjectId(e.target.value)}
                className="w-full px-3 py-2 border border-gray-200 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-[#856BFF]/40"
              >
                <option value="">-- Select Project --</option>
                {projects.map(p => (
                  <option key={p.id} value={p.id}>{p.project_name}</option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4">
              <div className="mb-3.5">
                <label className="block text-sm font-semibold text-gray-600 mb-1.5">
                  Role <span className="text-red-500">*</span>
                </label>
                <select
                  value={manualRole}
                  onChange={e => {
                    setManualRole(e.target.value);
                    setManualTaskName("");
                    setIsCustomTask(false);
                  }}
                  className="w-full px-3 py-2 border border-gray-200 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-[#856BFF]/40"
                >
                  <option value="">-- Select Role --</option>
                  {Object.keys(roleTaskMapping).map(r => (
                    <option key={r} value={r}>{r}</option>
                  ))}
                </select>
              </div>

              <div className="mb-3.5">
                <label className="block text-sm font-semibold text-gray-600 mb-1.5">
                  Task Name <span className="text-red-500">*</span>
                </label>
                {isCustomTask ? (
                  <div className="flex gap-1.5">
                    <input
                      type="text"
                      value={manualTaskName}
                      onChange={e => setManualTaskName(e.target.value)}
                      placeholder="Enter task name"
                      className="w-full px-3 py-2 border border-gray-200 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-[#856BFF]/40"
                    />
                    <button
                      onClick={() => { setIsCustomTask(false); setManualTaskName(""); }}
                      className="px-2 py-1 bg-gray-100 hover:bg-gray-200 rounded-md font-semibold text-xs whitespace-nowrap transition-colors"
                    >
                      Select Standard
                    </button>
                  </div>
                ) : (
                  <select
                    value={manualTaskName}
                    onChange={e => {
                      if (e.target.value === "CUSTOM") {
                        setIsCustomTask(true);
                        setManualTaskName("");
                      } else {
                        setManualTaskName(e.target.value);
                      }
                    }}
                    disabled={!manualRole}
                    className="w-full px-3 py-2 border border-gray-200 rounded-md text-sm disabled:bg-gray-50 disabled:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[#856BFF]/40"
                  >
                    <option value="">-- Select Task --</option>
                    {manualRole && roleTaskMapping[manualRole]?.map(t => (
                      <option key={t} value={t}>{t}</option>
                    ))}
                    {manualRole && <option value="CUSTOM">-- Custom Task --</option>}
                  </select>
                )}
              </div>
            </div>

            <div className="mb-3.5">
              <label className="block text-sm font-semibold text-gray-600 mb-1.5">Description / Remarks</label>
              <textarea
                value={manualDescription}
                onChange={e => setManualDescription(e.target.value)}
                placeholder="Describe the task details"
                className="w-full px-3 py-2 border border-gray-200 rounded-md text-sm min-h-[70px] resize-y focus:outline-none focus:ring-2 focus:ring-[#856BFF]/40"
              />
            </div>

            <div className="mb-3.5">
              <label className="block text-sm font-semibold text-gray-600 mb-1.5">
                Date <span className="text-red-500">*</span>
              </label>
              <input
                type="date"
                value={manualDate}
                onChange={e => setManualDate(e.target.value)}
                className="w-full px-3 py-2 border border-gray-200 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-[#856BFF]/40"
              />
            </div>

            <div className="mb-3.5">
              <label className="block text-sm font-semibold text-gray-600 mb-1.5">Done Yesterday (Optional)</label>
              <textarea
                value={manualDoneYesterday}
                onChange={e => setManualDoneYesterday(e.target.value)}
                placeholder="What did you do yesterday?"
                className="w-full px-3 py-2 border border-gray-200 rounded-md text-sm min-h-[70px] resize-y focus:outline-none focus:ring-2 focus:ring-[#856BFF]/40"
              />
            </div>

            <div className="mb-3.5">
              <label className="block text-sm font-semibold text-gray-600 mb-1.5">
                Today's Tasks / Plan <span className="text-red-500">*</span>
              </label>
              <textarea
                value={manualTodaysPlan}
                onChange={e => setManualTodaysPlan(e.target.value)}
                placeholder="What is your plan for this task today?"
                className="w-full px-3 py-2 border border-gray-200 rounded-md text-sm min-h-[70px] resize-y focus:outline-none focus:ring-2 focus:ring-[#856BFF]/40"
              />
            </div>

            <div className="mb-3.5">
              <label className="block text-sm font-semibold text-gray-600 mb-1.5">Risks / Blockers (Optional)</label>
              <textarea
                value={manualRisks}
                onChange={e => setManualRisks(e.target.value)}
                placeholder="Any blockers or risks?"
                className="w-full px-3 py-2 border border-gray-200 rounded-md text-sm min-h-[70px] resize-y focus:outline-none focus:ring-2 focus:ring-[#856BFF]/40"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4">
              <div className="mb-3.5">
                <label className="block text-sm font-semibold text-gray-600 mb-1.5">
                  Total Time Needed (hours) <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  step="0.5"
                  min="0"
                  value={manualTotalTimeNeeded}
                  onChange={e => setManualTotalTimeNeeded(e.target.value)}
                  placeholder="e.g. 4"
                  className="w-full px-3 py-2 border border-gray-200 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-[#856BFF]/40"
                />
              </div>

              <div className="mb-3.5">
                <label className="block text-sm font-semibold text-gray-600 mb-1.5">Availability (hours)</label>
                <input
                  type="number"
                  step="0.5"
                  min="0"
                  value={manualAvailability}
                  onChange={e => setManualAvailability(e.target.value)}
                  placeholder="e.g. 4"
                  className="w-full px-3 py-2 border border-gray-200 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-[#856BFF]/40"
                />
              </div>
            </div>

            {manualError && <p className="text-red-500 text-xs mt-1 mb-2">{manualError}</p>}

            <div className="flex justify-end gap-2.5 mt-5">
              <button
                onClick={() => setManualModalOpen(false)}
                className="px-[18px] py-2 bg-gray-100 hover:bg-gray-200 rounded-md font-semibold text-sm transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={submitManualTask}
                disabled={manualSaving}
                className="px-[22px] py-2 bg-[#856BFF] hover:bg-[#7259e6] disabled:opacity-60 text-white rounded-md font-bold text-sm transition-colors"
              >
                {manualSaving ? "Saving…" : "Save Task"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// ── Helpers ───────────────────────────────────────────────────────────────────
const roleColors = {
  BA: "#8e44ad", UI: "#2980b9", TL: "#16a085",
  "FE Dev": "#d35400", "BE Dev": "#c0392b",
  "Mobile/IOS Dev": "#1abc9c", Tester: "#f39c12",
};

const RoleBadge = ({ role }) => (
  <span
    className="inline-block px-2.5 py-0.5 rounded-full text-[11px] font-bold text-white whitespace-nowrap"
    style={{ backgroundColor: roleColors[role] || "#555" }}
  >
    {role}
  </span>
);

// Dual-segment bar: green (approved) + orange (awaiting)
const ProgressBar = ({ pct, awaiting, assigned }) => {
  const color = pct >= 100 ? "#2ecc71" : pct > 50 ? "#f39c12" : "#e74c3c";
  const awaitingPct = assigned > 0 ? Math.min((awaiting / assigned) * 100, 100 - pct) : 0;
  return (
    <div className="bg-gray-100 rounded-full h-2 overflow-hidden flex">
      {/* approved segment */}
      <div
        className="h-full transition-all duration-500 ease-out"
        style={{ width: `${Math.min(pct, 100)}%`, backgroundColor: color }}
      />
      {/* awaiting segment */}
      {awaitingPct > 0 && (
        <div
          className="h-full opacity-50"
          style={{ width: `${awaitingPct}%`, backgroundColor: "#f39c12" }}
        />
      )}
    </div>
  );
};

const StatCard = ({ label, value, suffix }) => (
  <div className="bg-white rounded-lg shadow-sm border-l-4 border-[#856BFF] px-5 py-4 min-w-[150px]">
    <div className="text-[11px] font-semibold text-gray-400 uppercase tracking-wide">{label}</div>
    <div className="mt-1 flex items-baseline gap-1.5">
      <span className="text-2xl font-extrabold text-gray-900">{value}</span>
      {suffix && <span className="text-xs text-gray-400 font-medium">{suffix}</span>}
    </div>
  </div>
);

export default MyWork;