// src/pages/projects/TaskInfoPage.jsx
// Step 2 — Task Information
// Used inside the ImportProjectPage multi-step shell.

import React, { useMemo, useState } from 'react';
import { Pencil, ChevronRight, Filter, Search } from 'lucide-react';

import './TaskInfoPage.css';
import {
  MOCK_MILESTONES,
  MOCK_TASK_SUMMARY,
  MOCK_PROJECT_CONTEXT,
} from '@/features/projects/mock/mockTasks';

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
    <path d="M11.5 2.5L13.5 4.5L5.5 12.5H3.5V10.5L11.5 2.5Z" stroke="#856BFF" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
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

const PAGE_SIZE = 6;

function TaskTable({ tasks }) {
  return (
    <div className="ti-table-scroll">
      <table className="ti-task-table">
        <thead className="ti-thead">
          <tr>
            <th className="ti-th ti-th--checkbox">
              <input type="checkbox" className="ti-checkbox" aria-label="Select all" />
            </th>
            <th className="ti-th">Task ID</th>
            <th className="ti-th">Task Title</th>
            <th className="ti-th">Owner</th>
            <th className="ti-th">Planned Start</th>
            <th className="ti-th">Planned End</th>
            <th className="ti-th">Actual Start</th>
            <th className="ti-th">Actual End</th>
            <th className="ti-th">Allocation</th>
            <th className="ti-th">Status</th>
            <th className="ti-th ti-th--purple">Risk Category</th>
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
              <td className="ti-td ti-td--checkbox">
                <input type="checkbox" className="ti-checkbox" aria-label={`Select ${t.taskId}`} />
              </td>
              <td className="ti-td">
                <span className="ti-task-id">{t.taskId}</span>
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
                  <span className="ti-risk-text">{t.riskCategory}</span>
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
                <button className="ti-edit-btn" title="Edit task" aria-label={`Edit ${t.taskId}`}>
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

function MilestoneItem({ milestone, defaultExpanded = false }) {
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
      {expanded && <TaskTable tasks={milestone.tasks} />}
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
  const [search, setSearch] = useState('');
  const [taskPage, setTaskPage] = useState(1);

  const { totalTasks, completed, inProgress, notStarted,
          totalMilestones, milestonesCompleted } = MOCK_TASK_SUMMARY;

  const pct = Math.round((milestonesCompleted / totalMilestones) * 100);

  // Flat task list for the card-level pagination label
  const totalTaskPages = Math.ceil(totalTasks / 10);

  // Filter milestones by search (milestone name or task title)
  const visibleMilestones = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return MOCK_MILESTONES;
    return MOCK_MILESTONES.filter(
      (m) =>
        m.name.toLowerCase().includes(q) ||
        m.tasks.some((t) => t.title.toLowerCase().includes(q) || t.taskId.toLowerCase().includes(q))
    );
  }, [search]);

  const start = (taskPage - 1) * 10 + 1;
  const end   = Math.min(taskPage * 10, totalTasks);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16, width: '100%' }}>

      {/* ── Task Information card (header + toolbar + badges) ── */}
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

        {/* Toolbar: search + milestone filter + filter btn */}
        <div className="ti-toolbar">
          <div className="ti-toolbar-left">
            {/* Search */}
            <div className="ti-search-wrap">
              <Search size={14} className="ti-search-icon" />
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
              <select id="milestone-filter" className="ti-milestone-select">
                <option value="">Milestone</option>
                {MOCK_MILESTONES.map((m) => (
                  <option key={m.id} value={m.id}>{m.name}</option>
                ))}
              </select>
              <ChevronRight size={16} className="ti-milestone-chevron" />
            </div>
          </div>

          {/* Filter button */}
          <button id="task-filter-btn" className="ti-filter-btn">
            <Filter size={16} />
            Filter
          </button>
        </div>

        {/* Counter badges */}
        <div className="ti-badges">
          <div className="ti-badge ti-badge--milestone">
            <span className="ti-badge-dot" />
            <span className="ti-badge-text">
              Milestones: {milestonesCompleted}/{totalMilestones} Completed ({pct}%)
            </span>
          </div>

          <span className="ti-badge-divider" />

          <div className="ti-badge ti-badge--total">
            <span className="ti-badge-text">Tasks: {totalTasks}</span>
          </div>

          <div className="ti-badge ti-badge--completed">
            <span className="ti-badge-dot" />
            <span className="ti-badge-text">
              Completed: {completed} ({Math.round((completed / totalTasks) * 100)}%)
            </span>
          </div>

          <div className="ti-badge ti-badge--inprogress">
            <span className="ti-badge-dot" />
            <span className="ti-badge-text">In Progress: {inProgress}</span>
          </div>

          <div className="ti-badge ti-badge--notstarted">
            <span className="ti-badge-dot" />
            <span className="ti-badge-text">Not Started: {notStarted}</span>
          </div>
        </div>
      </div>

      {/* ── TaskInformationCard (milestones + pagination) ── */}
      <div className="ti-task-card">
        <div className="ti-milestone-list">
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
        {/* Invisible left spacer (matches Figma — opacity-0 cancel) */}
        <div style={{ width: 77, opacity: 0 }} aria-hidden />

        <div className="ti-footer-right">
          <button
            id="task-info-cancel-btn"
            className="ti-btn-cancel"
            onClick={onCancel}
          >
            Cancel
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
