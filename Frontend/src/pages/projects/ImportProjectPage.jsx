// src/pages/projects/ImportProjectPage.jsx
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import TaskInfoPage from "./TaskInfoPage";
import EffortEstimatePage from "./EffortEstimatePage";
import DocumentChecklistPage from "./DocumentChecklistPage";
import "./ImportProjectPage.css";

// ─────────────────────────────────────────────────────────────────────────────
// Stepper
// ─────────────────────────────────────────────────────────────────────────────
const STEPS = [
  { num: "01", label: "Project Info", width: 70 },
  { num: "02", label: "Task Info", width: 55 },
  { num: "03", label: "Effort Estimate", width: 89 },
  { num: "04", label: "Document Checklist", width: 118 },
];

const Stepper = ({ active, onStepClick }) => (
  <div className="imp-stepper-wrap">
    <div className="imp-stepper">
      {/* Connector line — left:35px / right:59px keeps it exactly between circle centers */}
      <div className="imp-stepper__line" />

      {STEPS.map((step, i) => {
        const isActive   = i === active;
        const isComplete = i < active;
        const mod        = isActive ? "active" : isComplete ? "done" : "";
        return (
          <div
            key={step.num}
            className={`imp-step imp-step--${i + 1}${isComplete && onStepClick ? " imp-step--clickable" : ""}`}
            style={{ width: `${step.width}px` }}
            onClick={() => {
              if (isComplete && onStepClick) onStepClick(i);
            }}
          >
            <div className={`imp-step__circle${mod ? ` imp-step__circle--${mod}` : ""}`}>
              <span className={`imp-step__num${mod ? ` imp-step__num--${mod}` : ""}`}>
                {step.num}
              </span>
            </div>
            <div className="imp-step__label-container">
              <span className={`imp-step__label${mod ? ` imp-step__label--${mod}` : ""}`}>
                {step.label}
              </span>
            </div>
          </div>
        );
      })}
    </div>
  </div>
);

// ─────────────────────────────────────────────────────────────────────────────
// Field sub-components
// ─────────────────────────────────────────────────────────────────────────────

/** Label row above a field */
const FieldLabel = ({ children, fromPMS = false, pmsId = false }) => (
  <div className="imp-field-label-row">
    <span className={`imp-field-label${pmsId ? " imp-field-label--pms-id" : ""}`}>
      {children}
    </span>
    {fromPMS && <span className="imp-from-pms-badge">FROM PMS</span>}
  </div>
);

/** Read-only / PMS-synced input — gray fill */
const ReadInput = ({ value, placeholder }) => (
  <div className="imp-read-input">
    <span className="imp-read-input__text">{value || placeholder}</span>
  </div>
);

/** Editable text input — white fill */
const TextInput = ({ value, onChange, placeholder, id }) => (
  <input
    id={id}
    type="text"
    value={value}
    onChange={onChange}
    placeholder={placeholder}
    className="imp-text-input"
  />
);

/** Select / dropdown */
const SelectInput = ({ value, onChange, options, placeholder, id, disabled = false }) => (
  <div className="imp-select-wrap">
    <select
      id={id}
      value={value}
      onChange={onChange}
      disabled={disabled}
      className={`imp-select${disabled ? " imp-select--disabled" : ""}`}
    >
      {placeholder && <option value="" disabled>{placeholder}</option>}
      {options.map((o) => (
        <option key={o.value} value={o.value}>{o.label}</option>
      ))}
    </select>
    <svg
      width="10" height="6" viewBox="0 0 10 6" fill="none"
      className="imp-select-chevron"
    >
      <path d="M1 1L5 5L9 1" stroke="#6B7280" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  </div>
);

/** Sync icon */
const SyncIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor"
    strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="23 4 23 10 17 10" />
    <polyline points="1 20 1 14 7 14" />
    <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15" />
  </svg>
);

// ─────────────────────────────────────────────────────────────────────────────
// Main Page
// ─────────────────────────────────────────────────────────────────────────────
const ImportProjectPage = () => {
  const navigate = useNavigate();

  const [currentStep, setCurrentStep] = useState(0);
  const goNext = () => setCurrentStep((s) => Math.min(s + 1, STEPS.length - 1));

  // PMS state
  const [pmsId, setPmsId]     = useState("");
  const [synced, setSynced]   = useState(false);
  const [syncing, setSyncing] = useState(false);

  const [pmsData, setPmsData] = useState({
    projectName:   "",
    customerName:  "",
    presaleId:     "",
    startDate:     "",
    endDate:       "",
    description:   "",
    projectStatus: "",
  });

  const [form, setForm] = useState({
    projectType: "",
    nbdId:       "",
    o2dId:       "",
    projectCode: "",
    subCategory: "",
  });

  const set = (field) => (e) => setForm((f) => ({ ...f, [field]: e.target.value }));

  const handleSync = async () => {
    if (!pmsId.trim()) return;
    setSyncing(true);
    await new Promise((r) => setTimeout(r, 900));
    setPmsData({
      projectName:   "FMS – Field Management System",
      customerName:  "Ahana IT",
      presaleId:     pmsId + "-PRE",
      startDate:     "09/08/2026",
      endDate:       "08/09/2027",
      description:   "Automated field workforce tracking platform with GPS, task dispatch, and real-time analytics.",
      projectStatus: "In Progress",
    });
    setSynced(true);
    setSyncing(false);
  };

  const handleCancel        = () => navigate("/projects");
  const handleNext          = () => goNext();
  const handleCreateProject = () => {
    console.log("Create Project — submitting all steps.");
    alert("Project created successfully!");
    navigate("/projects");
  };

  const projectTypeOptions = [
    { value: "one-time",  label: "One Time Project" },
    { value: "retainer",  label: "Retainer" },
    { value: "milestone", label: "Milestone-Based" },
  ];
  const statusOptions = [
    { value: "In Progress", label: "In Progress" },
    { value: "Not Started", label: "Not Started" },
    { value: "Completed",   label: "Completed" },
    { value: "On Hold",     label: "On Hold" },
  ];

  return (
    <div className="imp-page">
      <div className="imp-shell">

        {/* Persistent Header: title + stepper across all 4 steps */}
        <div className="imp-header">
          <h1 className="imp-title">Import Project</h1>
          <Stepper
            active={currentStep}
            onStepClick={(stepIndex) => setCurrentStep(stepIndex)}
          />
        </div>

        {/* ── Step 0: Project Info ── */}
        {currentStep === 0 && (
          <div className="imp-step0-content">
            {/* Form card */}
            <div className="imp-form-card">
              <div className="imp-form-fields">

                {/* ── Row 0: PMS ID ── */}
                <div className="imp-pms-row">
                  <FieldLabel pmsId>PMS ID</FieldLabel>
                  <div className="imp-pms-inputs">
                    <input
                      id="pms-id-input"
                      type="text"
                      value={pmsId}
                      onChange={(e) => { setPmsId(e.target.value); setSynced(false); }}
                      placeholder="Enter PMS ID to sync"
                      className="imp-pms-input"
                    />
                    <button
                      id="pms-sync-btn"
                      onClick={handleSync}
                      disabled={syncing || !pmsId.trim()}
                      className="imp-sync-btn"
                    >
                      <span className="imp-sync-btn__icon"><SyncIcon /></span>
                      <span className="imp-sync-btn__text">
                        {syncing ? "Syncing…" : "Sync"}
                      </span>
                    </button>
                    {synced && (
                      <span className="imp-synced-badge">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none"
                          stroke="#10b981" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                          <polyline points="20 6 9 17 4 12" />
                        </svg>
                        Synced
                      </span>
                    )}
                  </div>
                </div>

                {/* ── Row 1: Project Name | Project Type | Customer Name ── */}
                <div className="imp-field-row">
                  <div className="imp-field-col">
                    <FieldLabel fromPMS={synced}>Project Name*</FieldLabel>
                    <ReadInput value={pmsData.projectName} placeholder="FMS" />
                  </div>
                  <div className="imp-field-col">
                    <FieldLabel>Project Type</FieldLabel>
                    <SelectInput
                      id="project-type-select"
                      value={form.projectType}
                      onChange={(e) => setForm((f) => ({ ...f, projectType: e.target.value }))}
                      options={projectTypeOptions}
                      placeholder="On Time Project"
                    />
                  </div>
                  <div className="imp-field-col">
                    <FieldLabel fromPMS={synced}>Customer Name</FieldLabel>
                    <SelectInput
                      id="customer-name-select"
                      value={pmsData.customerName || "Ahana IT"}
                      onChange={() => {}}
                      options={[{ value: pmsData.customerName || "Ahana IT", label: pmsData.customerName || "Ahana IT" }]}
                      placeholder="Ahana IT"
                      disabled
                    />
                  </div>
                </div>

                {/* ── Row 2: Presale ID | NBD ID | O2D ID | Project Code ── */}
                <div className="imp-field-row">
                  <div className="imp-field-col">
                    <FieldLabel fromPMS={synced}>Presale ID</FieldLabel>
                    <ReadInput value={pmsData.presaleId} placeholder="Presale ID" />
                  </div>
                  <div className="imp-field-col">
                    <FieldLabel>NBD ID</FieldLabel>
                    <TextInput id="nbd-id-input" value={form.nbdId} onChange={set("nbdId")} placeholder="eg 1234" />
                  </div>
                  <div className="imp-field-col">
                    <FieldLabel>O2D ID</FieldLabel>
                    <TextInput id="o2d-id-input" value={form.o2dId} onChange={set("o2dId")} placeholder="eg 1234" />
                  </div>
                  <div className="imp-field-col">
                    <FieldLabel>Project Code</FieldLabel>
                    <TextInput id="project-code-input" value={form.projectCode} onChange={set("projectCode")} placeholder="eg 1234" />
                  </div>
                </div>

                {/* ── Row 3: Sub Category | Start Date | End Date | Project Status ── */}
                <div className="imp-field-row">
                  <div className="imp-field-col">
                    <FieldLabel>Sub Category</FieldLabel>
                    <TextInput id="sub-category-input" value={form.subCategory} onChange={set("subCategory")} placeholder="FMS" />
                  </div>
                  <div className="imp-field-col">
                    <FieldLabel fromPMS={synced}>Start Date</FieldLabel>
                    <ReadInput value={pmsData.startDate} placeholder="09/08/2026" />
                  </div>
                  <div className="imp-field-col">
                    <FieldLabel fromPMS={synced}>End Date</FieldLabel>
                    <ReadInput value={pmsData.endDate} placeholder="08/09/2026" />
                  </div>
                  <div className="imp-field-col">
                    <FieldLabel fromPMS={synced}>Project Status</FieldLabel>
                    <SelectInput
                      id="project-status-select"
                      value={pmsData.projectStatus || "Completed"}
                      onChange={() => {}}
                      options={statusOptions}
                      placeholder="Completed"
                      disabled
                    />
                  </div>
                </div>

                {/* ── Row 4: Description ── */}
                <div className="imp-description-wrap">
                  <FieldLabel fromPMS={synced}>Description</FieldLabel>
                  <textarea
                    id="description-input"
                    value={pmsData.description}
                    onChange={(e) => setPmsData((d) => ({ ...d, description: e.target.value }))}
                    placeholder="Enter high-level project objectives and scope..."
                    rows={4}
                    className="imp-textarea"
                  />
                </div>

              </div>
            </div>

            {/* Footer — Cancel and Next both on the right */}
            <div className="imp-footer">
              <button id="import-cancel-btn" onClick={handleCancel} className="imp-btn-cancel">
                Cancel
              </button>
              <button id="import-next-btn" onClick={handleNext} className="imp-btn-next">
                <span className="imp-btn-next__text">Next</span>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none"
                  stroke="#FFFFFF" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="5" y1="12" x2="19" y2="12" />
                  <polyline points="12 5 19 12 12 19" />
                </svg>
              </button>
            </div>
          </div>
        )}

        {/* ── Step 1: Task Info ── */}
        {currentStep === 1 && (
          <TaskInfoPage onCancel={handleCancel} onNext={goNext} />
        )}

        {/* ── Step 2: Effort Estimate ── */}
        {currentStep === 2 && (
          <EffortEstimatePage onCancel={handleCancel} onNext={goNext} />
        )}

        {/* ── Step 3: Document Checklist ── */}
        {currentStep === 3 && (
          <DocumentChecklistPage onCancel={handleCancel} onCreate={handleCreateProject} />
        )}

      </div>
    </div>
  );
};

export default ImportProjectPage;
