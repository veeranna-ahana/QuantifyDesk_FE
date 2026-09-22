// src/pages/projects/ProjectsPage.jsx
import React, { useEffect, useMemo, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { Eye } from 'lucide-react';

import './ProjectsPage.css';

import {
  setProjects,
  setLoading,
  setError,
  setCurrentPage,
} from '@/store/slices/projectsSlice';
import {
  selectLoading,
  selectError,
  selectCurrentPage,
  selectPageSize,
  selectTotalProjects,
} from '@/store/slices/projectsSlice';
import { getProjects } from '@/features/projects/services/projectsService';

// ── Helpers ──────────────────────────────────────────────────────────────────

const fmt = (dateStr) => {
  if (!dateStr) return '—';
  const d = new Date(dateStr + 'T00:00:00');
  return d
    .toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: '2-digit' })
    .replace(/ /g, ' ');
};

const PROJECT_TYPES = [
  'Time & Material',
  'Fixed Price',
  'Retainer Contract',
  'Internal RnD',
  'One Time Project',
];

/** Deterministic project-type from pmsId — stable across renders */
const projectType = (pmsId) =>
  PROJECT_TYPES[parseInt(pmsId?.replace(/\D/g, '') || '0', 10) % PROJECT_TYPES.length];

// ── Status pill ───────────────────────────────────────────────────────────────

const STATUS_CLASS = {
  'In Progress':  'prj-status--in-progress',
  Completed:      'prj-status--completed',
  'On Hold':      'prj-status--on-hold',
  'Not Started':  'prj-status--not-started',
  Cancelled:      'prj-status--cancelled',
};

function StatusPill({ status }) {
  return (
    <span className={`prj-status-pill ${STATUS_CLASS[status] ?? 'prj-status--not-started'}`}>
      {status}
    </span>
  );
}

// ── Import SVG icon ───────────────────────────────────────────────────────────

const ImportIcon = () => (
  <svg className="prj-import-btn-icon" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M1 8H11M11 8L8 5M11 8L8 11" stroke="#fff" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M14 3V13" stroke="#fff" strokeWidth="1.5" strokeLinecap="round" />
  </svg>
);

const SearchIcon = () => (
  <svg className="prj-search-icon" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
    <circle cx="7" cy="7" r="4.5" stroke="#94a3b8" strokeWidth="1.33" />
    <path d="M10.5 10.5L13.5 13.5" stroke="#94a3b8" strokeWidth="1.33" strokeLinecap="round" />
  </svg>
);

const ChevronLeft = () => (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
    <path d="M10 12L6 8L10 4" stroke="#94a3b8" strokeWidth="1.33" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

const ChevronRight = () => (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
    <path d="M6 4L10 8L6 12" stroke="#475569" strokeWidth="1.33" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

// ── Skeleton loading rows ─────────────────────────────────────────────────────

function SkeletonRow() {
  const skel = (w, h = 12) => (
    <div className="prj-skel" style={{ width: w, height: h, borderRadius: 4 }} />
  );
  return (
    <tr className="prj-skeleton-row">
      <td className="prj-td prj-col-project">
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
          {skel(60, 10)}{skel(120, 13)}{skel(90, 10)}
        </div>
      </td>
      <td className="prj-td prj-col-customer">
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
          {skel(130, 13)}{skel(100, 10)}
        </div>
      </td>
      <td className="prj-td prj-col-timeline">
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
          {skel(160, 12)}{skel(160, 12)}
        </div>
      </td>
      <td className="prj-td prj-col-owner">{skel(70, 13)}</td>
      <td className="prj-td prj-col-status" style={{ textAlign: 'center' }}>
        {skel(80, 24)}
      </td>
      <td className="prj-td prj-col-action" />
    </tr>
  );
}

// ── Main page ─────────────────────────────────────────────────────────────────

const ALL_STATUSES    = ['All', 'In Progress', 'Completed'];
const FILTER_LABELS   = { All: null, 'In Progress': 'In Progress', Completed: 'Completed', 'On Hold': 'On Hold', 'Not Started': 'Not Started', Cancelled: 'Cancelled' };

export default function ProjectsPage() {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  /* Redux state */
  const loading      = useSelector(selectLoading);
  const error        = useSelector(selectError);
  const currentPage  = useSelector(selectCurrentPage);
  const pageSize     = useSelector(selectPageSize);
  const totalAll     = useSelector(selectTotalProjects);

  /* All projects from store (needed for client-side filtering) */
  const allProjects  = useSelector((s) => s.projects.projects);

  /* Local UI state */
  const [search, setSearch]       = useState('');
  const [statusFilter, setStatus] = useState('All');

  /* Fetch on mount */
  useEffect(() => {
    let cancelled = false;
    (async () => {
      dispatch(setLoading(true));
      try {
        const data = await getProjects();
        if (!cancelled) dispatch(setProjects(data));
      } catch (err) {
        if (!cancelled) dispatch(setError(err.message ?? 'Failed to load projects'));
      } finally {
        if (!cancelled) dispatch(setLoading(false));
      }
    })();
    return () => { cancelled = true; };
  }, [dispatch]);

  /* Client-side filter + search */
  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return allProjects.filter((p) => {
      const matchStatus = statusFilter === 'All' || p.status === FILTER_LABELS[statusFilter];
      const matchSearch = !q || [p.projectName, p.pmsId, p.customer].some((v) =>
        v?.toLowerCase().includes(q)
      );
      return matchStatus && matchSearch;
    });
  }, [allProjects, search, statusFilter]);

  /* Paginate filtered results */
  const start   = (currentPage - 1) * pageSize;
  const rows    = filtered.slice(start, start + pageSize);
  const total   = filtered.length;
  const totalPages = Math.max(1, Math.ceil(total / pageSize));

  /* Reset to page 1 when filters change */
  useEffect(() => { dispatch(setCurrentPage(1)); }, [search, statusFilter, dispatch]);

  /* Pagination helpers */
  const goTo = (p) => { if (p >= 1 && p <= totalPages) dispatch(setCurrentPage(p)); };

  const pageNumbers = () => {
    if (totalPages <= 5) return Array.from({ length: totalPages }, (_, i) => i + 1);
    const list = [1, 2, 3];
    if (currentPage > 4)              list.push('…');
    if (currentPage > 3 && currentPage < totalPages - 1) {
      [currentPage - 1, currentPage, currentPage + 1].forEach((n) => !list.includes(n) && list.push(n));
    }
    if (currentPage < totalPages - 2) list.push('…');
    if (!list.includes(totalPages))   list.push(totalPages);
    return list;
  };

  /* Status counts for filter pills */
  const counts = useMemo(() => {
    const c = { All: allProjects.length };
    allProjects.forEach((p) => { c[p.status] = (c[p.status] ?? 0) + 1; });
    return c;
  }, [allProjects]);

  /* ── Render ── */
  return (
    <div className="prj-page">

      {/* Page Header */}
      <div className="prj-header">
        <h1 className="prj-heading">Projects</h1>
        <button
          id="import-project-btn"
          className="prj-import-btn"
          onClick={() => navigate('/projects/import')}
        >
          <ImportIcon />
          Import Project
        </button>
      </div>

      {/* Search + Filters */}
      <div className="prj-toolbar">
        <div className="prj-search-wrap">
          <SearchIcon />
          <input
            id="projects-search"
            type="text"
            className="prj-search-input"
            placeholder="Search by PMS ID, Project name, or Client..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <div className="prj-filters">
          {ALL_STATUSES.map((s) => {
            const label = s === 'All' ? `All (${counts.All ?? 0})` : `${s} (${counts[s] ?? 0})`;
            return (
              <button
                key={s}
                id={`filter-${s.replace(/\s+/g, '-').toLowerCase()}`}
                className={`prj-filter-pill ${statusFilter === s ? 'prj-filter-pill--active' : 'prj-filter-pill--inactive'}`}
                onClick={() => setStatus(s)}
              >
                {label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Table Card */}
      <div className="prj-card">
        <div className="prj-table-scroll">
          <table className="prj-table">
            <thead className="prj-table-head">
              <tr>
                <th className="prj-th">Project</th>
                <th className="prj-th">Customer/O2D/NBD ID</th>
                <th className="prj-th">Timeline</th>
                <th className="prj-th">Owner</th>
                <th className="prj-th prj-th--center">Status</th>
                <th className="prj-th prj-th--right">Action</th>
              </tr>
            </thead>

            <tbody>
              {loading ? (
                Array.from({ length: pageSize }).map((_, i) => <SkeletonRow key={i} />)
              ) : error ? (
                <tr className="prj-state-row">
                  <td colSpan={6}>
                    <span style={{ color: '#b91c1c' }}>{error}</span>
                  </td>
                </tr>
              ) : rows.length === 0 ? (
                <tr className="prj-state-row">
                  <td colSpan={6}>No projects match your search.</td>
                </tr>
              ) : (
                rows.map((project) => {
                  const pType = projectType(project.pmsId);
                  const planEnd = fmt(project.endDate);
                  const planStart = fmt(project.startDate);
                  // Simulated actual dates (offset by a day for demo; replace with real API fields)
                  const actStart = project.actualStartDate ? fmt(project.actualStartDate) : planStart;
                  const isRunning = project.status === 'In Progress';

                  return (
                    <tr key={project.id} className="prj-tr">

                      {/* Col 1: Project */}
                      <td className="prj-td prj-col-project">
                        <div className="prj-project-id">ID: {project.pmsId}</div>
                        <div className="prj-project-name">{project.projectName}</div>
                        <div className="prj-project-type">Project Type: {pType}</div>
                      </td>

                      {/* Col 2: Customer / O2D / NBD */}
                      <td className="prj-td prj-col-customer">
                        <div className="prj-customer-name">{project.customer}</div>
                        <div className="prj-customer-ids">
                          {`O2D: d01234  NBD: d01234`}
                        </div>
                      </td>

                      {/* Col 3: Timeline */}
                      <td className="prj-td prj-col-timeline">
                        <div className="prj-timeline-row">
                          <span className="prj-timeline-label">PLAN</span>
                          <span className="prj-timeline-date">{planStart}</span>
                          <span className="prj-timeline-sep" />
                          <span className="prj-timeline-date">{planEnd}</span>
                        </div>
                        <div className="prj-timeline-row">
                          <span className="prj-timeline-label">ACT</span>
                          <span className="prj-timeline-date">{actStart}</span>
                          <span className="prj-timeline-sep" />
                          {isRunning ? (
                            <span className="prj-timeline-running">Running</span>
                          ) : (
                            <span className="prj-timeline-date">{fmt(project.endDate)}</span>
                          )}
                        </div>
                      </td>

                      {/* Col 4: Owner */}
                      <td className="prj-td prj-col-owner">
                        <span className="prj-owner-name">{project.owner}</span>
                      </td>

                      {/* Col 5: Status */}
                      <td className="prj-td prj-col-status">
                        <StatusPill status={project.status} />
                      </td>

                      {/* Col 6: Action */}
                      <td className="prj-td prj-col-action">
                        <button
                          id={`view-project-${project.id}`}
                          className="prj-action-btn"
                          title={`View ${project.projectName}`}
                          onClick={() => navigate(`/projects/${project.id}`)}
                        >
                          <Eye size={16} strokeWidth={1.5} />
                        </button>
                      </td>

                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination bar */}
        {!loading && total > 0 && (
          <div className="prj-pagination">
            <span className="prj-pagination-label">
              Showing {Math.min(start + 1, total)}–{Math.min(start + pageSize, total)} of {total} projects
            </span>

            <div className="prj-pagination-controls">
              <button
                id="pg-prev"
                className="prj-pg-btn"
                onClick={() => goTo(currentPage - 1)}
                disabled={currentPage === 1}
                aria-label="Previous page"
              >
                <ChevronLeft />
              </button>

              {pageNumbers().map((p, i) =>
                p === '…' ? (
                  <span key={`e${i}`} className="prj-pg-ellipsis">…</span>
                ) : (
                  <button
                    key={p}
                    id={`pg-${p}`}
                    className={`prj-pg-btn ${currentPage === p ? 'prj-pg-btn--active' : ''}`}
                    onClick={() => goTo(p)}
                    aria-current={currentPage === p ? 'page' : undefined}
                  >
                    {p}
                  </button>
                )
              )}

              <button
                id="pg-next"
                className="prj-pg-btn"
                onClick={() => goTo(currentPage + 1)}
                disabled={currentPage === totalPages}
                aria-label="Next page"
              >
                <ChevronRight />
              </button>
            </div>
          </div>
        )}
      </div>

    </div>
  );
}
