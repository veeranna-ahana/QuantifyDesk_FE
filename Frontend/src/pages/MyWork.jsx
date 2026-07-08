import React, { useEffect, useState } from "react";
import axios from "axios";
import { useSelector } from "react-redux";

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
  const color = pct >= 100 ? "#2ecc71" : pct > 50 ? "#f39c12" : "#e74c3c";
  return (
    <svg width={size} height={size} style={{ flexShrink: 0 }}>
      <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="#f0f0f0" strokeWidth={6} />
      <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke={color} strokeWidth={6}
        strokeDasharray={`${fill} ${circ}`} strokeLinecap="round"
        transform={`rotate(-90 ${size / 2} ${size / 2})`}
        style={{ transition: "stroke-dasharray 0.6s ease" }} />
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

  return (
    <div style={S.page}>
      {/* Toast */}
      {toast && (
        <div style={{ ...S.toast, background: toast.type === "error" ? "#e74c3c" : toast.type === "warn" ? "#f39c12" : "#27ae60" }}>
          {toast.msg}
        </div>
      )}

      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
        <h2 style={S.pageTitle}>My Work</h2>
        <button onClick={() => setManualModalOpen(true)} style={S.addManualTaskBtn}>
          + Create Task
        </button>
      </div>

      {/* ── Summary strip ── */}
      {!loading && assignments.length > 0 && (
        <div style={S.summaryStrip}>
          <StatChip label="Total Assigned" value={totalAssigned} color="#3498db" />
          <StatChip label="Approved" value={totalCompleted} color="#2ecc71" />
          <StatChip label="Awaiting Approval" value={totalAwaiting} color="#f39c12" />
          <StatChip label="Pending" value={totalPending} color="#e74c3c" />
          <div style={S.overallRing}>
            <Ring pct={overallPct} size={70} />
            <span style={{ fontSize: "12px", color: "#777", marginTop: "4px" }}>Overall</span>
          </div>
        </div>
      )}

      {loading && <p style={{ color: "#999", padding: "30px" }}>Loading your assignments…</p>}

      {!loading && assignments.length === 0 && (
        <div style={S.emptyState}>
          <p style={{ fontSize: "18px", color: "#bbb" }}>No assignments yet.</p>
          <p style={{ fontSize: "13px", color: "#ccc" }}>Your manager will assign tasks soon.</p>
          <button onClick={() => setManualModalOpen(true)} style={S.addManualTaskBtnLarge}>
            + Create a Manual Task
          </button>
        </div>
      )}

      {/* ── Project groups ── */}
      {Object.entries(byProject).map(([projectName, rows]) => {
        const pAssigned = rows.reduce((s, r) => s + Number(r.units_assigned), 0);
        const pCompleted = rows.reduce((s, r) => s + Number(r.units_completed), 0);
        const pPct = pAssigned > 0 ? Math.round((pCompleted / pAssigned) * 100) : 0;

        return (
          <div key={projectName} style={S.projectBlock}>
            <div style={S.projectHeader}>
              <div style={S.projectName}>{projectName}</div>
              <div style={S.projectMeta}>
                <span style={S.metaChip}>{pCompleted}/{pAssigned} units approved</span>
                <Ring pct={pPct} size={44} />
              </div>
            </div>

            <table style={S.table}>
              <thead>
                <tr>
                  <th style={S.th}>Role</th>
                  <th style={S.th}>Task</th>
                  <th style={S.th}>Assigned</th>
                  <th style={S.th}>Pending</th>
                  <th style={S.th}>Progress</th>
                  <th style={S.th}>Action</th>
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
                    <tr key={a.assignment_id} style={fullyDone ? S.trDone : {}}>
                      <td style={S.td}><RoleBadge role={a.role} /></td>
                      <td style={S.td}>{a.task_name}</td>
                      <td style={{ ...S.td, textAlign: "center", fontWeight: "700" }}>
                        {a.units_assigned}
                      </td>
                      <td style={{ ...S.td, textAlign: "center", color: effectivePend > 0 ? "#e74c3c" : "#2ecc71", fontWeight: "700" }}>
                        {effectivePend}
                      </td>
                      <td style={{ ...S.td, minWidth: "120px" }}>
                        <ProgressBar pct={completedPct} awaiting={awaiting} assigned={a.units_assigned} />
                      </td>
                      <td style={S.td}>
                        {fullyDone ? (
                          <span style={S.doneBadge}>✓ Done</span>
                        ) : awaiting > 0 && effectivePend === 0 ? (
                          <span style={S.awaitingBadge}>⏳ Awaiting</span>
                        ) : (
                          <button onClick={() => openLog(a)} style={S.logBtn}
                            disabled={effectivePend === 0}>
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

      {/* ── Log Progress Modal ── */}
      {logModal && (
        <div style={S.overlay}>
          <div style={S.modal}>
            <h3 style={S.modalTitle}>Progress Update</h3>
            <p style={S.modalSub}>
              <strong>{logModal.project_name}</strong> · {logModal.role} · {logModal.task_name}
            </p>

            {/* Info strip */}
            <div style={S.modalInfo}>
              <div style={{ display: "flex", gap: 20, flexWrap: "wrap" }}>
                <span>Approved: <strong style={{ color: "#2ecc71" }}>{logModal.units_completed}</strong></span>
                {Number(logModal.units_awaiting) > 0 && (
                  <span>Awaiting: <strong style={{ color: "#f39c12" }}>{logModal.units_awaiting}</strong></span>
                )}
                <span>Available to log: <strong style={{ color: "#e74c3c" }}>
                  {Math.max(logModal.units_pending - Number(logModal.units_awaiting || 0), 0)}
                </strong></span>
              </div>
            </div>

            {/* Approval notice */}
            <div style={S.approvalNotice}>
              📋 Your progress will be sent to the TL for approval before it counts as completed.
            </div>

            <div style={S.modalField}>
              <label style={S.label}>Date <span style={{ color: "#e74c3c" }}>*</span></label>
              <input type="date" value={logDate}
                onChange={e => setLogDate(e.target.value)} style={S.input} />
            </div>

            <div style={S.modalField}>
              <label style={S.label}>Today's Tasks <span style={{ color: "#e74c3c" }}>*</span></label>
              <textarea value={todaysTasks}
                onChange={e => { setTodaysTasks(e.target.value); setLogError(""); }}
                style={S.textarea} placeholder="What did you work on today?" />
            </div>

            <div style={S.formGrid}>
              <div style={S.modalField}>
                <label style={S.label}>Total Time Needed <span style={{ color: "#e74c3c" }}>*</span></label>
                <input type="text" value={totalTimeNeeded}
                  onChange={e => { setTotalTimeNeeded(e.target.value); setLogError(""); }}
                  style={S.input} placeholder="e.g., 4h 30m" />
              </div>
              <div style={S.modalField}>
                <label style={S.label}>Units Completed Today</label>
                <input type="number" value={logUnits} min="1"
                  max={Math.max(logModal.units_pending - Number(logModal.units_awaiting || 0), 0)}
                  onChange={e => { setLogUnits(e.target.value); setLogError(""); }}
                  style={S.input}
                  placeholder={`Max ${Math.max(logModal.units_pending - Number(logModal.units_awaiting || 0), 0)}`} />
              </div>
            </div>

            <div style={S.modalField}>
              <label style={S.label}>Yesterday's Tasks (Optional)</label>
              <textarea value={yesterdaysTasks}
                onChange={e => setYesterdaysTasks(e.target.value)}
                style={S.textarea} placeholder="What did you work on yesterday?" />
            </div>

            <div style={S.modalField}>
              <label style={S.label}>Risks / Blockers</label>
              <textarea value={risks}
                onChange={e => setRisks(e.target.value)}
                style={S.textarea} placeholder="Any risks or blockers?" />
            </div>

            {logError && <p style={S.error}>{logError}</p>}

            <div style={S.modalActions}>
              <button onClick={() => setLogModal(null)} style={S.cancelBtn}>Cancel</button>
              <button onClick={submitLog} style={S.saveBtn} disabled={saving}>
                {saving ? "Submitting…" : "Submit"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Add Manual Task Modal ── */}
      {manualModalOpen && (
        <div style={S.overlay}>
          <div style={S.modal}>
            <h3 style={S.modalTitle}>Create Manual Task</h3>
            <p style={S.modalSub}>Add a new task manually and log progress directly.</p>

            <div style={S.modalField}>
              <label style={S.label}>Project <span style={{ color: "#e74c3c" }}>*</span></label>
              <select value={manualProjectId} onChange={e => setManualProjectId(e.target.value)} style={S.input}>
                <option value="">-- Select Project --</option>
                {projects.map(p => (
                  <option key={p.id} value={p.id}>{p.project_name}</option>
                ))}
              </select>
            </div>

            <div style={S.formGrid}>
              <div style={S.modalField}>
                <label style={S.label}>Role <span style={{ color: "#e74c3c" }}>*</span></label>
                <select value={manualRole} onChange={e => {
                  setManualRole(e.target.value);
                  setManualTaskName("");
                  setIsCustomTask(false);
                }} style={S.input}>
                  <option value="">-- Select Role --</option>
                  {Object.keys(roleTaskMapping).map(r => (
                    <option key={r} value={r}>{r}</option>
                  ))}
                </select>
              </div>

              <div style={S.modalField}>
                <label style={S.label}>Task Name <span style={{ color: "#e74c3c" }}>*</span></label>
                {isCustomTask ? (
                  <div style={{ display: "flex", gap: "6px" }}>
                    <input type="text" value={manualTaskName} onChange={e => setManualTaskName(e.target.value)} style={S.input} placeholder="Enter task name" />
                    <button onClick={() => { setIsCustomTask(false); setManualTaskName(""); }} style={{ ...S.cancelBtn, padding: "4px 8px", fontSize: "12px" }}>Select Standard</button>
                  </div>
                ) : (
                  <select value={manualTaskName} onChange={e => {
                    if (e.target.value === "CUSTOM") {
                      setIsCustomTask(true);
                      setManualTaskName("");
                    } else {
                      setManualTaskName(e.target.value);
                    }
                  }} style={S.input} disabled={!manualRole}>
                    <option value="">-- Select Task --</option>
                    {manualRole && roleTaskMapping[manualRole]?.map(t => (
                      <option key={t} value={t}>{t}</option>
                    ))}
                    {manualRole && <option value="CUSTOM">-- Custom Task --</option>}
                  </select>
                )}
              </div>
            </div>

            <div style={S.modalField}>
              <label style={S.label}>Description / Remarks</label>
              <textarea value={manualDescription} onChange={e => setManualDescription(e.target.value)} style={S.textarea} placeholder="Describe the task details" />
            </div>

            <div style={S.modalField}>
              <label style={S.label}>Date <span style={{ color: "#e74c3c" }}>*</span></label>
              <input type="date" value={manualDate} onChange={e => setManualDate(e.target.value)} style={S.input} />
            </div>

            <div style={S.modalField}>
              <label style={S.label}>Done Yesterday (Optional)</label>
              <textarea value={manualDoneYesterday} onChange={e => setManualDoneYesterday(e.target.value)} style={S.textarea} placeholder="What did you do yesterday?" />
            </div>

            <div style={S.modalField}>
              <label style={S.label}>Today's Tasks / Plan <span style={{ color: "#e74c3c" }}>*</span></label>
              <textarea value={manualTodaysPlan} onChange={e => setManualTodaysPlan(e.target.value)} style={S.textarea} placeholder="What is your plan for this task today?" />
            </div>

            <div style={S.modalField}>
              <label style={S.label}>Risks / Blockers (Optional)</label>
              <textarea value={manualRisks} onChange={e => setManualRisks(e.target.value)} style={S.textarea} placeholder="Any blockers or risks?" />
            </div>

            <div style={S.formGrid}>
              <div style={S.modalField}>
                <label style={S.label}>Total Time Needed (hours) <span style={{ color: "#e74c3c" }}>*</span></label>
                <input type="number" step="0.5" min="0" value={manualTotalTimeNeeded} onChange={e => setManualTotalTimeNeeded(e.target.value)} style={S.input} placeholder="e.g. 4" />
              </div>

              <div style={S.modalField}>
                <label style={S.label}>Availability (hours)</label>
                <input type="number" step="0.5" min="0" value={manualAvailability} onChange={e => setManualAvailability(e.target.value)} style={S.input} placeholder="e.g. 4" />
              </div>
            </div>

            {manualError && <p style={S.error}>{manualError}</p>}

            <div style={S.modalActions}>
              <button onClick={() => setManualModalOpen(false)} style={S.cancelBtn}>Cancel</button>
              <button onClick={submitManualTask} style={S.saveBtn} disabled={manualSaving}>
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
  <span style={{
    padding: "2px 8px", borderRadius: "10px", fontSize: "11px", fontWeight: "700",
    backgroundColor: roleColors[role] || "#555", color: "white", whiteSpace: "nowrap"
  }}>{role}</span>
);

// Dual-segment bar: green (approved) + orange (awaiting)
const ProgressBar = ({ pct, awaiting, assigned }) => {
  const color = pct >= 100 ? "#2ecc71" : pct > 50 ? "#f39c12" : "#e74c3c";
  const awaitingPct = assigned > 0 ? Math.min((awaiting / assigned) * 100, 100 - pct) : 0;
  return (
    <div style={{ background: "#f0f0f0", borderRadius: "4px", height: "8px", overflow: "hidden", display: "flex" }}>
      {/* approved segment */}
      <div style={{ width: `${Math.min(pct, 100)}%`, height: "100%", backgroundColor: color, transition: "width 0.5s ease" }} />
      {/* awaiting segment */}
      {awaitingPct > 0 && (
        <div style={{ width: `${awaitingPct}%`, height: "100%", backgroundColor: "#f39c12", opacity: 0.5 }} />
      )}
    </div>
  );
};

const StatChip = ({ label, value, color }) => (
  <div style={{
    background: "white", borderRadius: "8px", padding: "12px 20px",
    boxShadow: "0 2px 8px rgba(0,0,0,0.07)", textAlign: "center",
    borderTop: `3px solid ${color}`
  }}>
    <div style={{ fontSize: "22px", fontWeight: "800", color }}>{value}</div>
    <div style={{ fontSize: "12px", color: "#999", marginTop: "2px" }}>{label}</div>
  </div>
);

// ── Styles ────────────────────────────────────────────────────────────────────
const S = {
  page: { padding: "20px", maxWidth: "1100px", margin: "0 auto", fontFamily: "sans-serif" },
  pageTitle: { fontSize: "22px", fontWeight: "800", color: "#1e272e", margin: 0, textAlign: "left" },
  toast: { position: "fixed", top: 20, right: 20, zIndex: 9999, color: "white", padding: "12px 20px", borderRadius: "8px", fontWeight: 700, fontSize: "14px", boxShadow: "0 4px 16px rgba(0,0,0,0.2)" },
  summaryStrip: { display: "flex", gap: "16px", marginBottom: "24px", alignItems: "center", flexWrap: "wrap" },
  overallRing: { display: "flex", flexDirection: "column", alignItems: "center", marginLeft: "auto" },
  projectBlock: { background: "white", borderRadius: "10px", boxShadow: "0 2px 10px rgba(0,0,0,0.08)", marginBottom: "20px", overflow: "hidden" },
  projectHeader: { display: "flex", alignItems: "center", justifyContent: "space-between", padding: "14px 18px", background: "#1e272e" },
  projectName: { color: "white", fontWeight: "700", fontSize: "15px" },
  projectMeta: { display: "flex", alignItems: "center", gap: "12px" },
  metaChip: { color: "#bbb", fontSize: "13px" },
  table: { width: "100%", borderCollapse: "collapse" },
  th: { padding: "10px 14px", background: "#f8f9fa", fontSize: "12px", fontWeight: "700", color: "#666", textAlign: "center", borderBottom: "1px solid #eee" },
  td: { padding: "10px 14px", fontSize: "13px", color: "#333", borderBottom: "1px solid #f5f5f5" },
  trDone: { opacity: 0.6, background: "#fafff9" },
  doneBadge: { color: "#2ecc71", fontWeight: "700", fontSize: "13px" },
  awaitingBadge: { display: "inline-block", padding: "2px 8px", borderRadius: "10px", background: "#fff3cd", color: "#856404", fontSize: "11px", fontWeight: "700" },
  logBtn: { padding: "5px 12px", background: "#e74c3c", color: "white", border: "none", borderRadius: "4px", fontSize: "12px", cursor: "pointer", fontWeight: "600" },
  emptyState: { textAlign: "center", padding: "60px 20px", background: "white", borderRadius: "10px" },
  addManualTaskBtn: {
    padding: "8px 16px",
    background: "#2ecc71",
    color: "white",
    border: "none",
    borderRadius: "6px",
    fontSize: "14px",
    cursor: "pointer",
    fontWeight: "700",
    display: "flex",
    alignItems: "center",
    gap: "6px",
    transition: "background 0.2s"
  },
  addManualTaskBtnLarge: {
    marginTop: "16px",
    padding: "12px 24px",
    background: "#2ecc71",
    color: "white",
    border: "none",
    borderRadius: "8px",
    fontSize: "15px",
    cursor: "pointer",
    fontWeight: "700",
    transition: "background 0.2s"
  },
  // Modal
  overlay: { position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000, padding: "20px", boxSizing: "border-box" },
  modal: { background: "white", borderRadius: "12px", padding: "28px", width: "100%", maxWidth: "600px", maxHeight: "90vh", overflowY: "auto", boxShadow: "0 20px 60px rgba(0,0,0,0.3)", boxSizing: "border-box" },
  modalTitle: { fontSize: "18px", fontWeight: "800", color: "#1e272e", marginBottom: "6px" },
  formGrid: { display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: "0 16px" },
  modalSub: { fontSize: "13px", color: "#777", marginBottom: "12px" },
  modalInfo: { background: "#f8f9fa", border: "1px solid #eee", borderRadius: "6px", padding: "10px 14px", marginBottom: "12px", fontSize: "13px", color: "#555" },
  approvalNotice: { background: "#fff8e1", border: "1px solid #ffe082", borderRadius: "6px", padding: "9px 14px", marginBottom: "16px", fontSize: "12px", color: "#7a5c00" },
  modalField: { marginBottom: "14px" },
  modalActions: { display: "flex", justifyContent: "flex-end", gap: "10px", marginTop: "20px" },
  label: { display: "block", fontSize: "13px", fontWeight: "600", color: "#555", marginBottom: "6px" },
  input: { width: "100%", padding: "9px 12px", border: "1px solid #ddd", borderRadius: "6px", fontSize: "14px", boxSizing: "border-box" },
  textarea: { width: "100%", padding: "9px 12px", border: "1px solid #ddd", borderRadius: "6px", fontSize: "14px", boxSizing: "border-box", minHeight: "60px", resize: "vertical", fontFamily: "inherit" },
  error: { color: "#e74c3c", fontSize: "12px", marginTop: "4px" },
  cancelBtn: { padding: "8px 18px", background: "#f0f0f0", border: "none", borderRadius: "6px", cursor: "pointer", fontWeight: "600" },
  saveBtn: { padding: "8px 22px", background: "#27ae60", color: "white", border: "none", borderRadius: "6px", cursor: "pointer", fontWeight: "700" },
};

export default MyWork;
