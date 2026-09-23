// src/pages/projects/TaskInfoPage.jsx
// Step 2 — Task Information
// Used inside the ImportProjectPage multi-step shell.

import React, { useMemo, useState, useCallback } from 'react';
import { ChevronRight, Search } from 'lucide-react';

import './TaskInfoPage.css';
import BulkUpdateTasksPage from './BulkUpdateTasksPage';
import {
  MOCK_MILESTONES,
  MOCK_TASK_SUMMARY,
  MOCK_PROJECT_CONTEXT,
} from '@/features/projects/mock/mockTasks';

// ── Role / Task-type option lists ─────────────────────────────
const ROLE_OPTIONS = [
  'Business Analyst',
  'Developer',
  'QA Engineer',
  'Project Manager',
  'DevOps Engineer',
  'Designer',
];

const TASK_TYPE_OPTIONS = [
  'Analysis',
  'Development',
  'Testing',
  'Review',
  'Deployment',
  'Design',
];

// ── ChevronDown icon (select arrow) ──────────────────────────
const SelectChevron = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M7 10L12 15L17 10" stroke="#6b7280" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

// ── X close button icon ───────────────────────────────────────
const CloseIcon = () => (
  <svg width="14" height="14" viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M1 1L13 13M13 1L1 13" stroke="#545F72" strokeWidth="1.5" strokeLinecap="round" />
  </svg>
);

// ── FMS badge icon (small purple task icon) ───────────────────
const FmsIcon = () => (
  <svg width="12" height="12" viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect x="1.5" y="1.5" width="9" height="9" rx="1.5" stroke="#9333ea" strokeWidth="1" />
    <path d="M3.5 6h5M3.5 8h3" stroke="#9333ea" strokeWidth="1" strokeLinecap="round" />
  </svg>
);

// ── Bulk Update icon ──────────────────────────────────────────
const BulkUpdateIcon = () => (
  <svg width="12" height="12" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M2 3.5h12M2 8h12M2 12.5h8" stroke="#ffffff" strokeWidth="1.6" strokeLinecap="round" />
    <path d="M12 11l2 2-2 2" stroke="#ffffff" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

// ── Edit Task Drawer ──────────────────────────────────────────
function EditTaskDrawer({ task, editValues, onChange, onCancel, onSave }) {
  if (!task) return null;

  return (
    <>
      {/* Overlay */}
      <div className="ti-drawer-overlay" onClick={onCancel} />

      {/* Drawer panel */}
      <div className="ti-drawer" role="dialog" aria-modal="true" aria-label="Edit Task Details">

        {/* ── Header ─────────────────────────────────────────── */}
        <div className="ti-drawer-header">
          {/* Left: task id badge + title + pms info */}
          <div className="ti-drawer-header-info">
            {/* Task-id badge row */}
            <div className="ti-drawer-badge-row">
              <span className="ti-drawer-task-badge">
                <FmsIcon />
                <span className="ti-drawer-task-badge-text">{task.taskId}</span>
              </span>
            </div>

            {/* Title */}
            <div className="ti-drawer-title">Edit Task Details</div>

            {/* Milestone · PMS line */}
            <div className="ti-drawer-subtitle">
              <span className="ti-drawer-subtitle-item">Milestone: {task.milestone ?? 'Phase 1: Discovery'}</span>
              <span className="ti-drawer-subtitle-sep">·</span>
              <span className="ti-drawer-subtitle-item">FMS ({MOCK_PROJECT_CONTEXT.pmsId})</span>
            </div>
          </div>

          {/* Close button */}
          <button className="ti-drawer-close" onClick={onCancel} aria-label="Close drawer">
            <CloseIcon />
          </button>
        </div>

        {/* ── Scrollable body ────────────────────────────────── */}
        <div className="ti-drawer-body">

          {/* ── Section 1: PMS Task Info (read-only) ─────────── */}
          <div className="ti-drawer-section">

            {/* 2-column grid */}
            <div className="ti-drawer-grid">

              {/* Row 1 */}
              <div className="ti-drawer-field">
                <span className="ti-df-label">Milestone</span>
                <span className="ti-df-value">{task.milestone ?? 'Phase 1: Discovery'}</span>
              </div>
              <div className="ti-drawer-field">
                <span className="ti-df-label">Task Title</span>
                <span className="ti-df-value">{task.title}</span>
              </div>

              {/* Row 2 */}
              <div className="ti-drawer-field">
                <span className="ti-df-label">Task Owner</span>
                <span className="ti-df-value">{task.owner}</span>
              </div>
              <div className="ti-drawer-field">
                <span className="ti-df-label">Status</span>
                <span className="ti-df-value">{task.status}</span>
              </div>

              {/* Row 3 — dates */}
              <div className="ti-drawer-field">
                <span className="ti-df-label">Planned Start</span>
                <span className="ti-df-value ti-df-value--sm">{task.plannedStart}</span>
              </div>
              <div className="ti-drawer-field">
                <span className="ti-df-label">Actual Start</span>
                <span className="ti-df-value ti-df-value--sm">{task.actualStart}</span>
              </div>

              {/* Row 4 — end dates */}
              <div className="ti-drawer-field">
                <span className="ti-df-label">Planned End</span>
                <span className="ti-df-value ti-df-value--sm">{task.plannedEnd}</span>
              </div>
              <div className="ti-drawer-field">
                <span className="ti-df-label">Actual End</span>
                <span className="ti-df-value ti-df-value--sm">{task.actualEnd ?? '—'}</span>
              </div>

              {/* Risk Category — full width */}
              <div className="ti-drawer-field ti-drawer-field--full">
                <span className="ti-df-label">Risk Category</span>
                <span className="ti-df-value">{task.riskCategory || '—'}</span>
              </div>

            </div>{/* /grid */}

            {/* Remark — below grid */}
            <div className="ti-drawer-field ti-drawer-field--remark">
              <span className="ti-df-label">Remark</span>
              <span className="ti-df-value">{task.remark || 'Completed ahead of schedule.'}</span>
            </div>

          </div>{/* /section 1 */}

          {/* ── Section 2: AlphaPM Task Attributes (Editable) ── */}
          <div className="ti-drawer-editable">

            {/* Role */}
            <div className="ti-de-field">
              <label className="ti-de-label" htmlFor="drawer-role">Role</label>
              <div className="ti-de-select-wrap">
                <select
                  id="drawer-role"
                  className="ti-de-select"
                  value={editValues.role}
                  onChange={e => onChange('role', e.target.value)}
                >
                  <option value="" disabled>Business Analyst</option>
                  {ROLE_OPTIONS.map(r => <option key={r} value={r}>{r}</option>)}
                </select>
                <span className="ti-de-chevron"><SelectChevron /></span>
              </div>
            </div>

            {/* Task Type */}
            <div className="ti-de-field">
              <label className="ti-de-label" htmlFor="drawer-tasktype">Task Type</label>
              <div className="ti-de-select-wrap">
                <select
                  id="drawer-tasktype"
                  className="ti-de-select"
                  value={editValues.taskType}
                  onChange={e => onChange('taskType', e.target.value)}
                >
                  <option value="" disabled>Analysis</option>
                  {TASK_TYPE_OPTIONS.map(t => <option key={t} value={t}>{t}</option>)}
                </select>
                <span className="ti-de-chevron"><SelectChevron /></span>
              </div>
            </div>

            {/* Unit */}
            <div className="ti-de-field">
              <label className="ti-de-label" htmlFor="drawer-unit">Unit</label>
              <div className="ti-de-input-wrap">
                <input
                  id="drawer-unit"
                  type="number"
                  min="0"
                  className="ti-de-input"
                  placeholder="98"
                  value={editValues.unit}
                  onChange={e => onChange('unit', e.target.value)}
                />
              </div>
            </div>

          </div>{/* /section 2 */}

        </div>{/* /body */}

        {/* ── Footer ─────────────────────────────────────────── */}
        <div className="ti-drawer-footer">
          <button className="ti-drawer-btn-cancel" onClick={onCancel}>Cancel</button>
          <button className="ti-drawer-btn-save" onClick={onSave}>Save</button>
        </div>

      </div>{/* /drawer */}
    </>
  );
}

// ── Mini SVG icons ────────────────────────────────────────────

const ClipboardIcon = () => (
  <svg className="ti-milestone-icon" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect x="5" y="1" width="6" height="2" rx="1" stroke="#3b82f6" strokeWidth="1.2" />
    <path d="M3 2.5h1a1 1 0 0 0 1 1h6a1 1 0 0 0 1-1h1A1.5 1.5 0 0 1 14.5 4v9A1.5 1.5 0 0 1 13 14.5H3A1.5 1.5 0 0 1 1.5 13V4A1.5 1.5 0 0 1 3 2.5z" stroke="#3b82f6" strokeWidth="1.2" />
    <path d="M5 8h6M5 11h4" stroke="#3b82f6" strokeWidth="1.1" strokeLinecap="round" />
  </svg>
);

const BuildingIcon = () => (
  <svg width="12" height="11" viewBox="0 0 12 11" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M1 10V3.5L6 1L11 3.5V10" stroke="#545F72" strokeWidth="1.1" strokeLinecap="round" strokeLinejoin="round" />
    <rect x="4" y="6" width="4" height="4" rx="0.5" stroke="#545F72" strokeWidth="1.1" />
  </svg>
);

const EditIcon = () => (
  <svg width="14" height="14" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M11.5 2.5L13.5 4.5L5.5 12.5H3.5V10.5L11.5 2.5Z" stroke="#856BFF" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

const ChevronDown = ({ open }) => (
  <svg className={`ti-ms-chevron ${open ? 'ti-ms-chevron--open' : ''}`} viewBox="0 0 16 16" fill="none">
    <path d="M6 4L10 8L6 12" stroke="#94a3b8" strokeWidth="1.33" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

const PrevIcon = () => (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
    <path d="M10 12L6 8L10 4" stroke="#94a3b8" strokeWidth="1.33" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

const NextIcon = () => (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
    <path d="M6 4L10 8L6 12" stroke="#475569" strokeWidth="1.33" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

const NextArrow = () => (
  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <line x1="5" y1="12" x2="19" y2="12" />
    <polyline points="12 5 19 12 12 19" />
  </svg>
);

// ── Milestone status pill ─────────────────────────────────────

const MS_PILL_CLASS = {
  Completed:    'ti-ms-pill--completed',
  'In Progress': 'ti-ms-pill--inprogress',
  'Not Started': 'ti-ms-pill--notstarted',
};

function MilestonePill({ status, text }) {
  return (
    <span className={`ti-ms-pill ${MS_PILL_CLASS[status] ?? 'ti-ms-pill--notstarted'}`}>
      <span className="ti-ms-dot" />
      <span className="ti-ms-text">{text}</span>
    </span>
  );
}

// ── Task row status pill ──────────────────────────────────────

const TASK_STATUS_CLASS = {
  Completed:    'ti-task-status--completed',
  'In Progress': 'ti-task-status--inprogress',
  'Not Started': 'ti-task-status--notstarted',
};

function TaskStatusPill({ status }) {
  return (
    <span className={`ti-task-status ${TASK_STATUS_CLASS[status] ?? 'ti-task-status--notstarted'}`}>
      {status}
    </span>
  );
}

// ── Task table (inside an expanded milestone) ─────────────────

function TaskTable({ tasks, onEditTask }) {
  return (
    <div className="ti-table-scroll">
      <table className="ti-task-table">
        <thead className="ti-thead">
          <tr>
            <th className="ti-th">Task ID</th>
            <th className="ti-th">Milestone</th>
            <th className="ti-th">Task Title</th>
            <th className="ti-th">Owner</th>
            <th className="ti-th">Planned Start</th>
            <th className="ti-th">Planned End</th>
            <th className="ti-th">Actual Start</th>
            <th className="ti-th">Actual End</th>
            <th className="ti-th">Allocation</th>
            <th className="ti-th">Status</th>
            <th className="ti-th">Risk Category</th>
            <th className="ti-th">Remark</th>
            <th className="ti-th ti-th--purple">Role</th>
            <th className="ti-th ti-th--purple">Task Type</th>
            <th className="ti-th ti-th--purple">Unit</th>
            <th className="ti-th ti-th--action">Action</th>
          </tr>
        </thead>
        <tbody>
          {tasks.map((t) => (
            <tr key={t.id} className="ti-tr">
              <td className="ti-td">
                <span className="ti-task-id">{t.taskId}</span>
              </td>
              <td className="ti-td">
                <span className="ti-cell-text">{t.milestoneShort || 'Discovery'}</span>
              </td>
              <td className="ti-td">
                <span className="ti-task-title">{t.title}</span>
              </td>
              <td className="ti-td">
                <span className="ti-cell-text">{t.owner}</span>
              </td>
              <td className="ti-td">
                <span className="ti-cell-text">{t.plannedStart}</span>
              </td>
              <td className="ti-td">
                <span className="ti-cell-text">{t.plannedEnd}</span>
              </td>
              <td className="ti-td">
                <span className="ti-cell-text">{t.actualStart}</span>
              </td>
              <td className="ti-td">
                <span className="ti-cell-text">{t.actualEnd ?? '—'}</span>
              </td>
              <td className="ti-td">
                <span className="ti-cell-text ti-cell-text--alloc">{t.allocation}</span>
              </td>
              <td className="ti-td">
                <TaskStatusPill status={t.status} />
              </td>
              <td className="ti-td">
                <div className="ti-risk-wrap">
                  <span className="ti-risk-text">{t.riskCategory || 'No Dependency'}</span>
                  <svg width="10" height="6" viewBox="0 0 10 6" fill="none">
                    <path d="M1 1L5 5L9 1" stroke="#94A3B8" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </div>
              </td>
              <td className="ti-td">
                <span className="ti-cell-text ti-cell-text--muted" style={{ color: '#94a3b8' }}>
                  {t.remark || 'Add remark...'}
                </span>
              </td>
              <td className="ti-td">
                <span className="ti-cell-text">{t.role}</span>
              </td>
              <td className="ti-td">
                <span className="ti-cell-text">{t.taskType}</span>
              </td>
              <td className="ti-td">
                <span className="ti-cell-text ti-cell-text--alloc">{t.unit}</span>
              </td>
              <td className="ti-td ti-td--action">
                <button
                  className="ti-edit-btn"
                  title="Edit task"
                  aria-label={`Edit ${t.taskId}`}
                  onClick={() => onEditTask(t)}
                >
                  <EditIcon />
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

// ── Milestone accordion item ──────────────────────────────────

function MilestoneItem({ milestone, defaultExpanded = false, onEditTask }) {
  const [expanded, setExpanded] = useState(defaultExpanded);

  return (
    <div className={`ti-milestone-item ${expanded ? 'ti-milestone-item--expanded' : ''}`}>
      {/* Accordion header */}
      <button
        className="ti-milestone-header"
        onClick={() => setExpanded((v) => !v)}
        aria-expanded={expanded}
        id={`milestone-${milestone.id}`}
      >
        <div className="ti-milestone-header-left">
          <ClipboardIcon />
          <span className="ti-milestone-label">Milestone Name:</span>
          <span className="ti-milestone-name">{milestone.name}</span>
          <MilestonePill status={milestone.status} text={milestone.statusText} />
        </div>
        <ChevronDown open={expanded} />
      </button>

      {/* Task table */}
      {expanded && <TaskTable tasks={milestone.tasks} onEditTask={onEditTask} />}
    </div>
  );
}

// ── Pagination helpers ────────────────────────────────────────

function pageNumbers(current, total) {
  if (total <= 5) return Array.from({ length: total }, (_, i) => i + 1);
  const pages = [1, 2, 3];
  if (current > 4)                         pages.push('…');
  if (current > 3 && current < total - 1)  [current - 1, current, current + 1].forEach(n => !pages.includes(n) && pages.push(n));
  if (current < total - 2)                 pages.push('…');
  if (!pages.includes(total))              pages.push(total);
  return pages;
}

// ── Main TaskInfoPage ─────────────────────────────────────────

export default function TaskInfoPage({ onCancel, onNext }) {
  const [isBulkUpdating, setIsBulkUpdating] = useState(false);
  const [search, setSearch] = useState('');
  const [selectedMilestone, setSelectedMilestone] = useState('');
  const [activeTab, setActiveTab] = useState('all');
  const [taskPage, setTaskPage] = useState(1);

  // ── Drawer state ────────────────────────────────────────────
  const [drawerTask, setDrawerTask] = useState(null);
  const [editValues, setEditValues] = useState({ role: '', taskType: '', unit: '' });

  const openDrawer = useCallback((task) => {
    setDrawerTask(task);
    setEditValues({
      role:     task.role     ?? '',
      taskType: task.taskType ?? '',
      unit:     task.unit     ?? '',
    });
  }, []);

  const closeDrawer = useCallback(() => setDrawerTask(null), []);

  const handleFieldChange = useCallback((field, value) => {
    setEditValues(prev => ({ ...prev, [field]: value }));
  }, []);

  const handleSave = useCallback(() => {
    // In a real app: dispatch update to store / API here
    console.log('Saving task edits for', drawerTask?.taskId, editValues);
    closeDrawer();
  }, [drawerTask, editValues, closeDrawer]);
  // ────────────────────────────────────────────────────────────

  const { totalTasks, completed, inProgress, notStarted } = MOCK_TASK_SUMMARY;

  // Flat task list for the card-level pagination label
  const totalTaskPages = Math.ceil(totalTasks / 10);

  // Filter milestones by search, milestone dropdown, and active tab
  const visibleMilestones = useMemo(() => {
    const q = search.trim().toLowerCase();
    return MOCK_MILESTONES.filter((m) => {
      if (selectedMilestone && m.id !== selectedMilestone) return false;
      return true;
    }).map((m) => {
      let filteredTasks = m.tasks;
      if (activeTab === 'in-progress') {
        filteredTasks = filteredTasks.filter(t => t.status === 'In Progress');
      } else if (activeTab === 'total-completed' || activeTab === 'last-completed') {
        filteredTasks = filteredTasks.filter(t => t.status === 'Completed');
      } else if (activeTab === 'not-started') {
        filteredTasks = filteredTasks.filter(t => t.status === 'Not Started');
      }

      if (q) {
        filteredTasks = filteredTasks.filter(
          t => t.title.toLowerCase().includes(q) || t.taskId.toLowerCase().includes(q)
        );
      }
      return { ...m, tasks: filteredTasks };
    }).filter((m) => {
      if (q) {
        return m.name.toLowerCase().includes(q) || m.tasks.length > 0;
      }
      return activeTab === 'all' || m.tasks.length > 0;
    });
  }, [search, selectedMilestone, activeTab]);

  const start = (taskPage - 1) * 10 + 1;
  const end   = Math.min(taskPage * 10, totalTasks);

  if (isBulkUpdating) {
    return (
      <BulkUpdateTasksPage
        onCancel={() => setIsBulkUpdating(false)}
        onSave={(updatedValues) => {
          console.log('Saved bulk task updates:', updatedValues);
          setIsBulkUpdating(false);
        }}
      />
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16, width: '100%' }}>

      {/* ── Edit Task Drawer ── */}
      {drawerTask && (
        <EditTaskDrawer
          task={drawerTask}
          editValues={editValues}
          onChange={handleFieldChange}
          onCancel={closeDrawer}
          onSave={handleSave}
        />
      )}

      {/* ── Task Information card (header + toolbar + filter tabs) ── */}
      <div className="ti-card">

        {/* Card header: title + context bar */}
        <div className="ti-card-header">
          <h2 className="ti-card-title">Task Information</h2>
          <div className="ti-context-bar">
            <BuildingIcon />
            <span className="ti-context-project">{MOCK_PROJECT_CONTEXT.projectName}</span>
            <span className="ti-context-divider" />
            <span className="ti-context-pms">PMS ID: {MOCK_PROJECT_CONTEXT.pmsId}</span>
          </div>
        </div>

        {/* Toolbar: search + milestone filter + Bulk Update button */}
        <div className="ti-toolbar">
          <div className="ti-toolbar-left">
            {/* Search */}
            <div className="ti-search-wrap">
              <Search size={16} className="ti-search-icon" />
              <input
                id="task-search"
                type="text"
                className="ti-search-input"
                placeholder="Search tasks..."
                value={search}
                onChange={(e) => { setSearch(e.target.value); setTaskPage(1); }}
              />
            </div>

            {/* Milestone dropdown */}
            <div className="ti-milestone-select-wrap">
              <select
                id="milestone-filter"
                className="ti-milestone-select"
                value={selectedMilestone}
                onChange={(e) => { setSelectedMilestone(e.target.value); setTaskPage(1); }}
              >
                <option value="">Milestone</option>
                {MOCK_MILESTONES.map((m) => (
                  <option key={m.id} value={m.id}>{m.name}</option>
                ))}
              </select>
              <ChevronRight size={16} className="ti-milestone-chevron" />
            </div>
          </div>

          {/* Bulk Update button */}
          <button
            id="task-bulk-update-btn"
            className="ti-bulk-update-btn"
            onClick={() => setIsBulkUpdating(true)}
          >
            <BulkUpdateIcon />
            <span>Bulk Update</span>
          </button>
        </div>

        {/* Filter tabs row */}
        <div className="ti-filter-tabs-row">
          {/* Left Segmented Pill Group */}
          <div className="ti-tab-group">
            <button
              type="button"
              className={`ti-tab-btn ${activeTab === 'all' ? 'ti-tab-btn--active' : ''}`}
              onClick={() => { setActiveTab('all'); setTaskPage(1); }}
            >
              All Task ({totalTasks})
            </button>
            <button
              type="button"
              className={`ti-tab-btn ${activeTab === 'in-progress' ? 'ti-tab-btn--active' : ''}`}
              onClick={() => { setActiveTab('in-progress'); setTaskPage(1); }}
            >
              <span>In Progress</span>
              <span className="ti-tab-count ti-tab-count--gray">{inProgress}</span>
            </button>
            <button
              type="button"
              className={`ti-tab-btn ${activeTab === 'last-completed' ? 'ti-tab-btn--active' : ''}`}
              onClick={() => { setActiveTab('last-completed'); setTaskPage(1); }}
            >
              <span>Last Completed</span>
              <span className="ti-tab-count ti-tab-count--green">19</span>
            </button>
            <button
              type="button"
              className={`ti-tab-btn ${activeTab === 'total-completed' ? 'ti-tab-btn--active' : ''}`}
              onClick={() => { setActiveTab('total-completed'); setTaskPage(1); }}
            >
              <span>Total Completed</span>
              <span className="ti-tab-count ti-tab-count--green-dark">{completed}</span>
            </button>
            <button
              type="button"
              className={`ti-tab-btn ${activeTab === 'not-started' ? 'ti-tab-btn--active' : ''}`}
              onClick={() => { setActiveTab('not-started'); setTaskPage(1); }}
            >
              <span>Not Started</span>
              <span className="ti-tab-count ti-tab-count--blue">{notStarted}</span>
            </button>
          </div>

          {/* Vertical divider */}
          <div className="ti-tab-divider" />

          {/* Right Alert Pills */}
          <div className="ti-alert-pills">
            <button
              type="button"
              className={`ti-alert-pill ti-alert-pill--blockers ${activeTab === 'blockers' ? 'ti-alert-pill--active' : ''}`}
              onClick={() => { setActiveTab(activeTab === 'blockers' ? 'all' : 'blockers'); setTaskPage(1); }}
            >
              <span className="ti-alert-dot ti-alert-dot--amber" />
              <span>Blockers (4)</span>
            </button>
            <button
              type="button"
              className={`ti-alert-pill ti-alert-pill--delayed ${activeTab === 'delayed' ? 'ti-alert-pill--active' : ''}`}
              onClick={() => { setActiveTab(activeTab === 'delayed' ? 'all' : 'delayed'); setTaskPage(1); }}
            >
              <span className="ti-alert-dot ti-alert-dot--rose" />
              <span>Delayed (3)</span>
            </button>
            <button
              type="button"
              className={`ti-alert-pill ti-alert-pill--due ${activeTab === 'due' ? 'ti-alert-pill--active' : ''}`}
              onClick={() => { setActiveTab(activeTab === 'due' ? 'all' : 'due'); setTaskPage(1); }}
            >
              <span>Due Today (8)</span>
            </button>
          </div>
        </div>

      </div>

      {/* ── TaskInformationCard (milestones + pagination) ── */}
      <div className="ti-task-card task-info-card task-info-card--import">
        <div className="ti-milestone-list task-info-milestone-list">
          {visibleMilestones.length === 0 ? (
            <div style={{ padding: '32px', color: '#94a3b8', fontSize: 14, textAlign: 'center', width: '100%' }}>
              No milestones match your search.
            </div>
          ) : (
            visibleMilestones.map((m, idx) => (
              <MilestoneItem
                key={m.id}
                milestone={m}
                defaultExpanded={idx === 0}  /* first milestone expanded by default */
                onEditTask={openDrawer}
              />
            ))
          )}
        </div>

        {/* Pagination bar */}
        <div className="ti-pagination">
          <span className="ti-pg-label">
            Showing {start}–{end} of {totalTasks} tasks
          </span>

          <div className="ti-pg-controls">
            <button
              id="task-pg-prev"
              className="ti-pg-btn"
              onClick={() => setTaskPage(p => Math.max(1, p - 1))}
              disabled={taskPage === 1}
              aria-label="Previous page"
            >
              <PrevIcon />
            </button>

            {pageNumbers(taskPage, totalTaskPages).map((p, i) =>
              p === '…' ? (
                <span key={`e${i}`} className="ti-pg-ellipsis">…</span>
              ) : (
                <button
                  key={p}
                  id={`task-pg-${p}`}
                  className={`ti-pg-btn ${taskPage === p ? 'ti-pg-btn--active' : ''}`}
                  onClick={() => setTaskPage(p)}
                  aria-current={taskPage === p ? 'page' : undefined}
                >
                  {p}
                </button>
              )
            )}

            <button
              id="task-pg-next"
              className="ti-pg-btn"
              onClick={() => setTaskPage(p => Math.min(totalTaskPages, p + 1))}
              disabled={taskPage === totalTaskPages}
              aria-label="Next page"
            >
              <NextIcon />
            </button>
          </div>
        </div>
      </div>

      {/* ── Footer ── */}
      <div className="ti-footer">
        {/* Invisible left spacer */}
        <div style={{ width: 77, opacity: 0 }} aria-hidden />

        <div className="ti-footer-right">
          <button
            id="task-info-cancel-btn"
            className="ti-btn-cancel"
            onClick={onCancel}
          >
            Back
          </button>

          <button
            id="task-info-next-btn"
            className="ti-btn-next"
            onClick={onNext}
          >
            Next:
            <NextArrow />
          </button>
        </div>
      </div>

    </div>
  );
}

