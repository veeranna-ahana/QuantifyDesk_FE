// src/pages/Dashboard/Dashboard.jsx
import React, { useEffect, useState, useMemo } from 'react';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from 'recharts';
import api from '../../api/axios';
import './Dashboard.css';

/* ─────────────────────────────────────────────
   Constants
───────────────────────────────────────────── */
const AVATAR_COLOURS = [
  '#7c3aed', '#4f46e5', '#e11d48', '#0d9488',
  '#059669', '#0891b2', '#8b5cf6', '#d97706',
];

const DONUT_COLORS = {
  Active:    '#856bff',
  Completed: '#10b981',
  'On Hold': '#94a3b8',
  Delayed:   '#f59e0b',
};

const STATIC_PROJECTS = [
  { name: 'Core Banking Upgrade', code: 'KBL-042', units: 8,  completion: 82, risk: 'Low',      status: 'On Track'    },
  { name: 'Mobile Banking',       code: 'KBL-031', units: 6,  completion: 61, risk: 'High',     status: 'At Risk'     },
  { name: 'API Gateway',          code: 'KBL-018', units: 4,  completion: 73, risk: 'Medium',   status: 'In Progress' },
  { name: 'Data Warehouse',       code: 'KBL-022', units: 5,  completion: 45, risk: 'High',     status: 'Delayed'     },
  { name: 'Payment Gateway',      code: 'KBL-055', units: 3,  completion: 92, risk: 'Low',      status: 'On Track'    },
  { name: 'User Portal',          code: 'KBL-009', units: 4,  completion: 38, risk: 'Critical', status: 'At Risk'     },
  { name: 'Analytics Engine',     code: 'KBL-067', units: 5,  completion: 56, risk: 'Medium',   status: 'In Progress' },
  { name: 'DevOps Pipeline',      code: 'KBL-078', units: 3,  completion: 88, risk: 'Low',      status: 'On Track'    },
];

/* Employee records — each includes an `expand` block that renders on open */
const STATIC_EMPLOYEES = [
  {
    id: 'EMP-2041', name: 'Ananya Rao',   initials: 'AR', role: 'Backend',
    projects: ['ADM-CLM-01', 'ADM-PAG-02'],
    days: '84 business days', window: '06 Jul 26 → 30 Oct 26', windowPct: 70, utilPct: 96,
    kpis: [
      { label: 'TOTAL ALLOCATED PROJECTS', value: '2',   sub: 'Active assignments',  accent: '#856bff' },
      { label: 'ALLOCATED TIME',           value: '8h',  sub: 'Per working day',     accent: '#2563eb' },
      { label: 'AVAILABLE BANDWIDTH',      value: '0h',  sub: 'Remaining per day',   accent: '#059669' },
      { label: 'TIMESHEET HOURS LOGGED',   value: '38h', sub: 'This week',           accent: '#d97706' },
    ],
    matrix: [
      {
        code: 'ADM-CLM-01', meta: '6 hrs/day · 12 Tasks · 20 units',
        name: 'Unified Claims Modernization', pct: 74, statusText: '74% unit delivery · On track',
        stats: [
          { label: 'ALLOCATED', value: '30h', bg: '#f8fafc', border: '#f1f5f9', color: '#856bff' },
          { label: 'LOGGED ⚠',  value: '32h', bg: '#fee2e2', border: '#ef4444', color: '#dc2626' },
          { label: 'COMPLETED', value: '9',   bg: '#d1fae5', border: '#10b981', color: '#059669' },
          { label: 'PENDING',   value: '3',   bg: '#fef3c7', border: '#f59e0b', color: '#d97706' },
        ],
      },
      {
        code: 'ADM-PAG-02', meta: '6 hrs/day · 15 Tasks · 20 units',
        name: 'Partner API Gateway', pct: 100, statusText: '100% unit delivery · Completed',
        stats: [
          { label: 'ALLOCATED', value: '8h', bg: '#f8fafc', border: '#f1f5f9', color: '#856bff' },
          { label: 'LOGGED',    value: '6h', bg: '#f8fafc', border: '#f1f5f9', color: '#059669' },
          { label: 'COMPLETED', value: '3',  bg: '#d1fae5', border: '#10b981', color: '#059669' },
          { label: 'PENDING',   value: '0',  bg: '#fef3c7', border: '#f59e0b', color: '#d97706' },
        ],
        barColour: '#10b981',
      },
    ],
  },
  {
    id: 'EMP-2088', name: 'Nikhil Menon', initials: 'NM', role: 'Frontend',
    projects: ['ADM-CLM-01', 'ADM-ROP-04', 'ADM-FOM-07'],
    days: '112 business days', window: '15 Jun 26 → 20 Nov 26', windowPct: 93, utilPct: 118,
    kpis: [
      { label: 'TOTAL ALLOCATED PROJECTS', value: '3',   sub: 'Active assignments',  accent: '#856bff' },
      { label: 'ALLOCATED TIME',           value: '8h',  sub: 'Per working day',     accent: '#2563eb' },
      { label: 'AVAILABLE BANDWIDTH',      value: '-2h', sub: 'Over-allocated',      accent: '#059669' },
      { label: 'TIMESHEET HOURS LOGGED',   value: '46h', sub: 'This week',           accent: '#d97706' },
    ],
    matrix: [
      {
        code: 'ADM-CLM-01', meta: '3 hrs/day · 8 Tasks · 20 units',
        name: 'Unified Claims Modernization', pct: 61, statusText: '61% unit delivery · In progress',
        stats: [
          { label: 'ALLOCATED', value: '15h', bg: '#f8fafc', border: '#f1f5f9', color: '#856bff' },
          { label: 'LOGGED',    value: '18h', bg: '#fee2e2', border: '#ef4444', color: '#dc2626' },
          { label: 'COMPLETED', value: '5',   bg: '#d1fae5', border: '#10b981', color: '#059669' },
          { label: 'PENDING',   value: '3',   bg: '#fef3c7', border: '#f59e0b', color: '#d97706' },
        ],
      },
      {
        code: 'ADM-ROP-04', meta: '3 hrs/day · 10 Tasks · 15 units',
        name: 'Retail Onboarding Portal', pct: 48, statusText: '48% unit delivery · At risk',
        stats: [
          { label: 'ALLOCATED', value: '15h', bg: '#f8fafc', border: '#f1f5f9', color: '#856bff' },
          { label: 'LOGGED',    value: '14h', bg: '#f8fafc', border: '#f1f5f9', color: '#059669' },
          { label: 'COMPLETED', value: '4',   bg: '#d1fae5', border: '#10b981', color: '#059669' },
          { label: 'PENDING',   value: '6',   bg: '#fef3c7', border: '#f59e0b', color: '#d97706' },
        ],
        barColour: '#f59e0b',
      },
    ],
  },
  {
    id: 'EMP-2115', name: 'Devika Sen', initials: 'DS', role: 'QA',
    projects: ['ADM-TDR-09'],
    days: '96 business days', window: '03 Aug 26 → 11 Dec 26', windowPct: 80, utilPct: 104,
    kpis: [
      { label: 'TOTAL ALLOCATED PROJECTS', value: '1',   sub: 'Active assignments',  accent: '#856bff' },
      { label: 'ALLOCATED TIME',           value: '8h',  sub: 'Per working day',     accent: '#2563eb' },
      { label: 'AVAILABLE BANDWIDTH',      value: '-1h', sub: 'Over-allocated',      accent: '#059669' },
      { label: 'TIMESHEET HOURS LOGGED',   value: '41h', sub: 'This week',           accent: '#d97706' },
    ],
    matrix: [
      {
        code: 'ADM-TDR-09', meta: '8 hrs/day · 14 Tasks · 18 units',
        name: 'Test Data Repository', pct: 55, statusText: '55% unit delivery · In progress',
        stats: [
          { label: 'ALLOCATED', value: '40h', bg: '#f8fafc', border: '#f1f5f9', color: '#856bff' },
          { label: 'LOGGED',    value: '42h', bg: '#fee2e2', border: '#ef4444', color: '#dc2626' },
          { label: 'COMPLETED', value: '8',   bg: '#d1fae5', border: '#10b981', color: '#059669' },
          { label: 'PENDING',   value: '6',   bg: '#fef3c7', border: '#f59e0b', color: '#d97706' },
        ],
      },
    ],
  },
  {
    id: 'EMP-2130', name: 'Priya Nair', initials: 'PN', role: 'BA',
    projects: ['ADM-ROP-04', 'ADM-LLD-11'],
    days: '58 business days', window: '20 Jul 26 → 09 Oct 26', windowPct: 48, utilPct: 72,
    kpis: [
      { label: 'TOTAL ALLOCATED PROJECTS', value: '2',   sub: 'Active assignments', accent: '#856bff' },
      { label: 'ALLOCATED TIME',           value: '6h',  sub: 'Per working day',    accent: '#2563eb' },
      { label: 'AVAILABLE BANDWIDTH',      value: '2h',  sub: 'Remaining per day',  accent: '#059669' },
      { label: 'TIMESHEET HOURS LOGGED',   value: '29h', sub: 'This week',          accent: '#d97706' },
    ],
    matrix: [
      {
        code: 'ADM-ROP-04', meta: '3 hrs/day · 6 Tasks · 10 units',
        name: 'Retail Onboarding Portal', pct: 60, statusText: '60% unit delivery · On track',
        stats: [
          { label: 'ALLOCATED', value: '15h', bg: '#f8fafc', border: '#f1f5f9', color: '#856bff' },
          { label: 'LOGGED',    value: '14h', bg: '#f8fafc', border: '#f1f5f9', color: '#059669' },
          { label: 'COMPLETED', value: '4',   bg: '#d1fae5', border: '#10b981', color: '#059669' },
          { label: 'PENDING',   value: '2',   bg: '#fef3c7', border: '#f59e0b', color: '#d97706' },
        ],
      },
      {
        code: 'ADM-LLD-11', meta: '3 hrs/day · 5 Tasks · 8 units',
        name: 'Loan Lifecycle Dashboard', pct: 38, statusText: '38% unit delivery · Delayed',
        stats: [
          { label: 'ALLOCATED', value: '15h', bg: '#f8fafc', border: '#f1f5f9', color: '#856bff' },
          { label: 'LOGGED',    value: '12h', bg: '#f8fafc', border: '#f1f5f9', color: '#059669' },
          { label: 'COMPLETED', value: '2',   bg: '#d1fae5', border: '#10b981', color: '#059669' },
          { label: 'PENDING',   value: '3',   bg: '#fef3c7', border: '#f59e0b', color: '#d97706' },
        ],
        barColour: '#f59e0b',
      },
    ],
  },
  {
    id: 'EMP-2177', name: 'Arjun Mehta', initials: 'AM', role: 'DevOps',
    projects: ['ADM-CLM-01', 'ADM-PAG-02'],
    days: '102 business days', window: '22 Jun 26 → 18 Nov 26', windowPct: 85, utilPct: 110,
    kpis: [
      { label: 'TOTAL ALLOCATED PROJECTS', value: '2',   sub: 'Active assignments', accent: '#856bff' },
      { label: 'ALLOCATED TIME',           value: '8h',  sub: 'Per working day',    accent: '#2563eb' },
      { label: 'AVAILABLE BANDWIDTH',      value: '-1h', sub: 'Over-allocated',     accent: '#059669' },
      { label: 'TIMESHEET HOURS LOGGED',   value: '44h', sub: 'This week',          accent: '#d97706' },
    ],
    matrix: [
      {
        code: 'ADM-CLM-01', meta: '4 hrs/day · 10 Tasks · 16 units',
        name: 'Unified Claims Modernization', pct: 68, statusText: '68% unit delivery · On track',
        stats: [
          { label: 'ALLOCATED', value: '20h', bg: '#f8fafc', border: '#f1f5f9', color: '#856bff' },
          { label: 'LOGGED',    value: '22h', bg: '#fee2e2', border: '#ef4444', color: '#dc2626' },
          { label: 'COMPLETED', value: '6',   bg: '#d1fae5', border: '#10b981', color: '#059669' },
          { label: 'PENDING',   value: '4',   bg: '#fef3c7', border: '#f59e0b', color: '#d97706' },
        ],
      },
      {
        code: 'ADM-PAG-02', meta: '4 hrs/day · 8 Tasks · 12 units',
        name: 'Partner API Gateway', pct: 100, statusText: '100% unit delivery · Completed',
        stats: [
          { label: 'ALLOCATED', value: '20h', bg: '#f8fafc', border: '#f1f5f9', color: '#856bff' },
          { label: 'LOGGED',    value: '18h', bg: '#f8fafc', border: '#f1f5f9', color: '#059669' },
          { label: 'COMPLETED', value: '8',   bg: '#d1fae5', border: '#10b981', color: '#059669' },
          { label: 'PENDING',   value: '0',   bg: '#fef3c7', border: '#f59e0b', color: '#d97706' },
        ],
        barColour: '#10b981',
      },
    ],
  },
  {
    id: 'EMP-2204', name: 'Kavya Iyer', initials: 'KI', role: 'Data',
    projects: ['ADM-TDR-09', 'ADM-LLD-11'],
    days: '76 business days', window: '01 Aug 26 → 15 Nov 26', windowPct: 63, utilPct: 88,
    kpis: [
      { label: 'TOTAL ALLOCATED PROJECTS', value: '2',   sub: 'Active assignments', accent: '#856bff' },
      { label: 'ALLOCATED TIME',           value: '7h',  sub: 'Per working day',    accent: '#2563eb' },
      { label: 'AVAILABLE BANDWIDTH',      value: '1h',  sub: 'Remaining per day',  accent: '#059669' },
      { label: 'TIMESHEET HOURS LOGGED',   value: '35h', sub: 'This week',          accent: '#d97706' },
    ],
    matrix: [
      {
        code: 'ADM-TDR-09', meta: '4 hrs/day · 7 Tasks · 10 units',
        name: 'Test Data Repository', pct: 70, statusText: '70% unit delivery · On track',
        stats: [
          { label: 'ALLOCATED', value: '20h', bg: '#f8fafc', border: '#f1f5f9', color: '#856bff' },
          { label: 'LOGGED',    value: '18h', bg: '#f8fafc', border: '#f1f5f9', color: '#059669' },
          { label: 'COMPLETED', value: '5',   bg: '#d1fae5', border: '#10b981', color: '#059669' },
          { label: 'PENDING',   value: '2',   bg: '#fef3c7', border: '#f59e0b', color: '#d97706' },
        ],
      },
      {
        code: 'ADM-LLD-11', meta: '3 hrs/day · 6 Tasks · 9 units',
        name: 'Loan Lifecycle Dashboard', pct: 45, statusText: '45% unit delivery · In progress',
        stats: [
          { label: 'ALLOCATED', value: '15h', bg: '#f8fafc', border: '#f1f5f9', color: '#856bff' },
          { label: 'LOGGED',    value: '14h', bg: '#f8fafc', border: '#f1f5f9', color: '#059669' },
          { label: 'COMPLETED', value: '3',   bg: '#d1fae5', border: '#10b981', color: '#059669' },
          { label: 'PENDING',   value: '3',   bg: '#fef3c7', border: '#f59e0b', color: '#d97706' },
        ],
        barColour: '#f59e0b',
      },
    ],
  },
  {
    id: 'EMP-2250', name: 'Rohan Kapoor', initials: 'RK', role: 'Backend',
    projects: ['ADM-FOM-07'],
    days: '64 business days', window: '10 Aug 26 → 12 Oct 26', windowPct: 53, utilPct: 45,
    kpis: [
      { label: 'TOTAL ALLOCATED PROJECTS', value: '1',   sub: 'Active assignments', accent: '#856bff' },
      { label: 'ALLOCATED TIME',           value: '4h',  sub: 'Per working day',    accent: '#2563eb' },
      { label: 'AVAILABLE BANDWIDTH',      value: '4h',  sub: 'Remaining per day',  accent: '#059669' },
      { label: 'TIMESHEET HOURS LOGGED',   value: '18h', sub: 'This week',          accent: '#d97706' },
    ],
    matrix: [
      {
        code: 'ADM-FOM-07', meta: '4 hrs/day · 5 Tasks · 8 units',
        name: 'FOM Integration Module', pct: 45, statusText: '45% unit delivery · In progress',
        stats: [
          { label: 'ALLOCATED', value: '20h', bg: '#f8fafc', border: '#f1f5f9', color: '#856bff' },
          { label: 'LOGGED',    value: '18h', bg: '#f8fafc', border: '#f1f5f9', color: '#059669' },
          { label: 'COMPLETED', value: '2',   bg: '#d1fae5', border: '#10b981', color: '#059669' },
          { label: 'PENDING',   value: '3',   bg: '#fef3c7', border: '#f59e0b', color: '#d97706' },
        ],
        barColour: '#f59e0b',
      },
    ],
  },
];

/* ─────────────────────────────────────────────
   Pure helpers
───────────────────────────────────────────── */
function getInitials(name) {
  if (!name) return '?';
  const parts = name.trim().split(' ');
  return (parts[0]?.[0] || '') + (parts[1]?.[0] || '');
}

function miniBarColour(pct) {
  if (pct >= 80) return '#10b981';
  if (pct >= 50) return '#f59e0b';
  return '#ef4444';
}

function utilColour(pct) {
  if (pct >= 100) return { bar: '#ef4444', text: '#dc2626', cls: 'red'   };
  if (pct >= 80)  return { bar: '#10b981', text: '#059669', cls: 'green' };
  return                  { bar: '#d97706', text: '#d97706', cls: 'amber' };
}

function riskClass(risk) {
  const map = { Low: 'low', Medium: 'medium', High: 'high', Critical: 'critical' };
  return `db-badge db-badge--risk-${map[risk] || 'medium'}`;
}

function statusClass(status) {
  const map = {
    'On Track': 'on-track', 'In Progress': 'in-progress',
    'At Risk': 'at-risk', 'Delayed': 'delayed',
    'Completed': 'completed', 'On Hold': 'on-hold',
  };
  return `db-badge db-badge--status-${map[status] || 'in-progress'}`;
}

function roleClass(role) {
  const map = {
    Backend: 'backend', Frontend: 'frontend', QA: 'qa',
    BA: 'ba', DevOps: 'devops', Data: 'data', 'Full Stack': 'fullstack',
  };
  return `db-role-badge db-role-badge--${map[role] || 'default'}`;
}

/* ─────────────────────────────────────────────
   Sub-components
───────────────────────────────────────────── */

/** KPI Card */
function KpiCard({ value, label, sub, valueClass = '', accent }) {
  return (
    <div className={`db-kpi-card${accent ? ' db-kpi-card--accent' : ''}`}>
      <div className={`db-kpi-value ${valueClass}`}>{value}</div>
      <div className="db-kpi-label">{label}</div>
      <div className="db-kpi-sub">{sub}</div>
    </div>
  );
}

/** Single health row with progress bar */
function HealthRow({ label, count, total, colour }) {
  const pct = total > 0 ? (count / total) * 100 : 0;
  const countCls = label === 'At Risk'
    ? 'db-health-row__count db-health-row__count--risk'
    : label === 'Delayed'
    ? 'db-health-row__count db-health-row__count--delayed'
    : 'db-health-row__count';
  return (
    <div className="db-health-row">
      <div className="db-health-row__top">
        <span className="db-health-row__label">{label}</span>
        <span className={countCls}>{count}</span>
      </div>
      <div className="db-health-row__bar-wrap">
        <div className="db-progress-track">
          <div className="db-progress-fill" style={{ width: `${pct}%`, background: colour }} />
        </div>
      </div>
    </div>
  );
}

/** Mini bar in project table */
function MiniBar({ pct }) {
  return (
    <div className="db-mini-bar-wrap">
      <div className="db-mini-bar-track">
        <div
          className="db-mini-bar-fill"
          style={{ width: `${Math.min(pct, 100)}%`, background: miniBarColour(pct) }}
        />
      </div>
      <span className="db-mini-bar-pct">{pct}%</span>
    </div>
  );
}

/** Donut chart legend item */
function DonutLegendItem({ colour, label }) {
  return (
    <div className="db-donut-legend-item">
      <div className="db-donut-legend-dot" style={{ background: colour }} />
      <span className="db-donut-legend-label" style={{ color: colour }}>{label}</span>
    </div>
  );
}

/** Utilization bar + pct */
function UtilBar({ pct }) {
  const { bar, text, cls } = utilColour(pct);
  return (
    <div className="db-util-bar-wrap">
      <div className="db-util-bar-track">
        <div
          className={`db-util-bar-fill db-util-bar-fill--${cls}`}
          style={{ width: `${Math.min(pct, 100)}%`, background: bar }}
        />
      </div>
      <span className={`db-util-pct db-util-pct--${cls}`} style={{ color: text }}>
        {pct}%
      </span>
    </div>
  );
}

/** Expand chevron button */
function ExpandBtn({ open, onClick }) {
  return (
    <button
      className={`db-expand-btn${open ? ' db-expand-btn--open' : ''}`}
      onClick={onClick}
      aria-label={open ? 'Collapse' : 'Expand'}
    >
      <svg width="10" height="6" viewBox="0 0 10 6" fill="none">
        <path
          d="M1 1L5 5L9 1"
          stroke={open ? '#856bff' : '#94a3b8'}
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </button>
  );
}

/** Expanded row KPI mini-card */
function EmpKpiCard({ label, value, sub, accent }) {
  return (
    <div
      className="db-emp-kpi-card"
      style={{ '--db-emp-kpi-accent': accent }}
    >
      <div className="db-emp-kpi-card__label">{label}</div>
      <div className="db-emp-kpi-card__value">{value}</div>
      <div className="db-emp-kpi-card__sub">{sub}</div>
    </div>
  );
}


/** Expanded row — project allocation matrix card */
function ProjMatrixCard({ proj }) {
  const barColour = proj.barColour || '#856bff';
  return (
    <div className="db-proj-matrix-card">
      {/* Header: code chip + meta */}
      <div className="db-proj-matrix-card__header">
        <span className="db-proj-matrix-card__code">{proj.code}</span>
        <span className="db-proj-matrix-card__meta">{proj.meta}</span>
      </div>
      {/* Project name */}
      <div className="db-proj-matrix-card__name">{proj.name}</div>
      {/* Progress bar */}
      <div className="db-proj-matrix-card__bar-wrap">
        <div className="db-proj-matrix-card__bar-track">
          <div
            className="db-proj-matrix-card__bar-fill"
            style={{ width: `${proj.pct}%`, background: barColour }}
          />
        </div>
      </div>
      {/* Status text */}
      <div className="db-proj-matrix-card__status">{proj.statusText}</div>
      {/* Stat boxes */}
      <div className="db-proj-matrix-card__stats">
        {proj.stats.map((s) => (
          <div
            key={s.label}
            className="db-proj-stat-box"
            style={{ background: s.bg, borderColor: s.border }}
          >
            <span className="db-proj-stat-box__label" style={{ color: s.color }}>{s.label}</span>
            <span className="db-proj-stat-box__value" style={{ color: s.color }}>{s.value}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

/** Full expanded content row */
function ExpandedRow({ emp, colSpan }) {
  return (
    <tr className="db-expanded-row-tr">
      <td colSpan={colSpan} className="db-expanded-row-td">
        <div className="db-expanded-content">
          {/* KPI mini cards */}
          <div className="db-emp-kpi-row">
            {(emp.kpis || []).map((k) => (
              <EmpKpiCard key={k.label} {...k} />
            ))}
          </div>

          {/* Project Allocation Matrix */}
          {emp.matrix && emp.matrix.length > 0 && (
            <div className="db-proj-matrix">
              <div className="db-proj-matrix__title">Project Allocation Matrix</div>
              <div className="db-proj-matrix__grid">
                {emp.matrix.map((proj) => (
                  <ProjMatrixCard key={proj.code} proj={proj} />
                ))}
              </div>
            </div>
          )}
        </div>
      </td>
    </tr>
  );
}

/* ═══════════════════════════════════════════
   MAIN DASHBOARD COMPONENT
═══════════════════════════════════════════ */
const Dashboard = () => {
  const [summary, setSummary]               = useState(null);
  const [loading, setLoading]               = useState(true);
  const [userUtilization, setUserUtilization] = useState([]);

  /* Project table filters */
  const [search, setSearch]           = useState('');
  const [statusFilter, setStatusFilter] = useState('All Status');
  const [unitFilter, setUnitFilter]     = useState('All Units');
  const [riskFilter, setRiskFilter]     = useState('All Risk');

  /* Employee table filters */
  const [empSearch, setEmpSearch]   = useState('');
  const [roleFilter, setRoleFilter] = useState('All Roles');

  /* Expand/collapse state — stores the employee id that is currently open (or null) */
  const [expandedId, setExpandedId] = useState(null);

  const toggleExpand = (id) => setExpandedId((prev) => (prev === id ? null : id));

  useEffect(() => {
    const fetchSummary = async () => {
      try {
        const res = await api.get('/dashboard');
        setSummary(res.data);
      } catch { /* fall through to static */ }
      finally { setLoading(false); }
    };
    const fetchUtil = async () => {
      try {
        const res = await api.get('/dashboard/user-utilization?range=monthly');
        setUserUtilization(res.data || []);
      } catch { /* ignore */ }
    };
    fetchSummary();
    fetchUtil();
  }, []);

  /* ── Derived KPIs ── */
  const totalProjects = summary?.total_projects ?? 42;
  const inProgress    = summary?.in_progress    ?? 28;
  const completed     = summary?.completed       ?? 10;
  const delayed       = summary?.delayed         ?? 3;

  const healthRows = [
    { label: 'On Track',    count: 24, colour: '#10b981' },
    { label: 'In Progress', count: 8,  colour: '#856bff' },
    { label: 'At Risk',     count: 5,  colour: '#ef4444' },
    { label: 'Delayed',     count: 3,  colour: '#f59e0b' },
    { label: 'Completed',   count: 2,  colour: '#856bff' },
  ];
  const healthTotal = healthRows.reduce((s, r) => s + r.count, 0);

  const donutData = [
    { name: 'Active',    value: 57 },
    { name: 'Completed', value: 24 },
    { name: 'On Hold',   value: 12 },
    { name: 'Delayed',   value: 7  },
  ];

  /* ── Filtered projects ── */
  const filteredProjects = useMemo(() => STATIC_PROJECTS.filter((p) => {
    const matchSearch = !search
      || p.name.toLowerCase().includes(search.toLowerCase())
      || p.code.toLowerCase().includes(search.toLowerCase());
    const matchStatus = statusFilter === 'All Status' || p.status === statusFilter;
    const matchRisk   = riskFilter   === 'All Risk'   || p.risk   === riskFilter;
    return matchSearch && matchStatus && matchRisk;
  }), [search, statusFilter, riskFilter]);

  /* ── Filtered employees ── */
  const filteredEmployees = useMemo(() => {
    const base = userUtilization.length > 0
      ? userUtilization.map((u, i) => ({
          ...STATIC_EMPLOYEES[i % STATIC_EMPLOYEES.length], // carry expand data from static
          id:        u.emp_id || `EMP-${2041 + i}`,
          name:      u.name,
          initials:  getInitials(u.name),
          role:      u.role || 'Backend',
          projects:  u.projects || [],
          days:      `${u.working_days || 84} business days`,
          window:    u.window || '',
          windowPct: u.window_pct || 70,
          utilPct:   Math.round(parseFloat(u.utilization_percentage) || 96),
        }))
      : STATIC_EMPLOYEES;

    return base.filter((e) => {
      const matchSearch = !empSearch
        || e.name.toLowerCase().includes(empSearch.toLowerCase())
        || e.id.toLowerCase().includes(empSearch.toLowerCase());
      const matchRole = roleFilter === 'All Roles' || e.role === roleFilter;
      return matchSearch && matchRole;
    });
  }, [userUtilization, empSearch, roleFilter]);

  /* col count for employee table (5 columns: employee, projects, days, util, expand) */
  const EMP_COL_SPAN = 5;

  if (loading) {
    return <div className="db-loading">Loading dashboard…</div>;
  }

  /* ────────────────────────────────────────────────────────── */
  return (
    <div className="db-page">

      {/* ── Page title ── */}
      <div className="db-title-block">
        <h1 className="db-page-title">Project Utilization</h1>
        <p className="db-page-subtitle">
          Department-wide delivery, utilization and operational health
        </p>
      </div>

      {/* ── KPI row ── */}
      <div className="db-kpi-row">
        <KpiCard value={totalProjects} label="All Projects"  sub="Total portfolio"    />
        <KpiCard value={inProgress}    label="In Progress"   sub="Active delivery"    valueClass="db-kpi-value--blue"  />
        <KpiCard value={completed}     label="Completed"     sub="Delivered projects" valueClass="db-kpi-value--green" />
        <KpiCard value={delayed}       label="Delayed"       sub="Behind schedule"    valueClass="db-kpi-value--red"   accent />
      </div>

      {/* ── Charts row ── */}
      <div className="db-chart-row">
        {/* Project Health Overview */}
        <div className="db-section-card">
          <div className="db-section-card__header">
            <span className="db-section-card__title">Project Health Overview</span>
            <span className="db-section-card__count">{totalProjects} Projects</span>
          </div>
          <div className="db-health-rows">
            {healthRows.map((r) => (
              <HealthRow key={r.label} label={r.label} count={r.count} total={healthTotal} colour={r.colour} />
            ))}
          </div>
        </div>

        {/* Project Status Distribution */}
        <div className="db-section-card">
          <div className="db-section-card__header">
            <span className="db-section-card__title">Project Status Distribution</span>
            <span className="db-section-card__count">{totalProjects} Projects</span>
          </div>
          <div className="db-donut-wrap">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={donutData}
                  cx="50%" cy="50%"
                  innerRadius={52} outerRadius={78}
                  dataKey="value"
                  startAngle={90} endAngle={-270}
                  stroke="#ffffff" strokeWidth={1.5}
                >
                  {donutData.map((entry) => (
                    <Cell key={entry.name} fill={DONUT_COLORS[entry.name]} />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(v, n) => [`${v}%`, n]}
                  contentStyle={{ fontFamily: 'Roboto', fontSize: '12px', border: '0.8px solid #e2e8f0', borderRadius: '8px' }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="db-donut-legend">
            {donutData.map((d) => (
              <DonutLegendItem key={d.name} colour={DONUT_COLORS[d.name]} label={d.name} />
            ))}
          </div>
        </div>
      </div>

      {/* ── Project Delivery Performance table ── */}
      <div className="db-table-card">
        <div className="db-table-toolbar">
          <span className="db-table-toolbar__title">📋 Project Delivery Performance</span>
          <div className="db-table-toolbar__filters">
            <input type="text" placeholder="Search project…" value={search}
              onChange={(e) => setSearch(e.target.value)} className="db-filter-input" />
            <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="db-filter-select">
              {['All Status', 'On Track', 'In Progress', 'At Risk', 'Delayed', 'Completed'].map((s) => <option key={s}>{s}</option>)}
            </select>
            <select value={unitFilter} onChange={(e) => setUnitFilter(e.target.value)} className="db-filter-select">
              <option>All Units</option>
            </select>
            <select value={riskFilter} onChange={(e) => setRiskFilter(e.target.value)} className="db-filter-select">
              {['All Risk', 'Low', 'Medium', 'High', 'Critical'].map((r) => <option key={r}>{r}</option>)}
            </select>
          </div>
        </div>
        <div className="db-table-scroll">
          <table className="db-table db-table--projects">
            <thead>
              <tr>
                <th style={{ width: '240px' }}>Project</th>
                <th style={{ width: '110px' }}>Code</th>
                <th style={{ width: '80px'  }}>Units</th>
                <th style={{ width: '180px' }}>Completion</th>
                <th style={{ width: '130px' }}>Risk</th>
                <th style={{ width: '150px' }}>Status</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {filteredProjects.map((p) => (
                <tr key={p.code}>
                  <td className="db-td-project-name">{p.name}</td>
                  <td className="db-td-code">{p.code}</td>
                  <td className="db-td-units">{p.units}</td>
                  <td style={{ padding: '9.6px 12px' }}><MiniBar pct={p.completion} /></td>
                  <td style={{ padding: '9.6px 12px' }}><span className={riskClass(p.risk)}>{p.risk}</span></td>
                  <td style={{ padding: '9.6px 12px' }}><span className={statusClass(p.status)}>{p.status}</span></td>
                  <td className="db-td-action"><button className="db-view-btn">View →</button></td>
                </tr>
              ))}
              {filteredProjects.length === 0 && (
                <tr className="db-empty-row"><td colSpan={7}>No projects match your filters.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ── Employee Utilization ── */}
      <div className="db-table-card" style={{ marginBottom: 0 }}>
        {/* Toolbar */}
        <div className="db-emp-toolbar">
          <div>
            <div className="db-emp-toolbar__heading">Employee Utilization</div>
            <div className="db-emp-toolbar__sub">
              {filteredEmployees.length} resources shown · click a row for details
            </div>
          </div>
          <div className="db-emp-toolbar__filters">
            <div className="db-emp-search-wrap">
              <svg className="db-emp-search-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="11" cy="11" r="8" /><path d="m21 21-4.35-4.35" />
              </svg>
              <input type="text" placeholder="Search employee…" value={empSearch}
                onChange={(e) => setEmpSearch(e.target.value)} className="db-emp-search-input" />
            </div>
            <select value={roleFilter} onChange={(e) => setRoleFilter(e.target.value)} className="db-emp-role-select">
              {['All Roles', 'Backend', 'Frontend', 'QA', 'BA', 'DevOps', 'Data'].map((r) => <option key={r}>{r}</option>)}
            </select>
          </div>
        </div>

        {/* Employee table */}
        <div className="db-table-scroll">
          <table className="db-table db-emp-table">
            <thead>
              <tr>
                <th style={{ width: '277px' }}>Employee</th>
                <th style={{ width: '340px', paddingLeft: '16px' }}>Assigned Projects</th>
                <th style={{ width: '220px', paddingLeft: '16px' }}>Occupied Days &amp; Window</th>
                <th style={{ paddingLeft: '16px' }}>Total Utilization</th>
                <th style={{ width: '56px' }}></th>
              </tr>
            </thead>
            <tbody>
              {filteredEmployees.map((emp, idx) => {
                const avatarBg  = AVATAR_COLOURS[idx % AVATAR_COLOURS.length];
                const isOpen    = expandedId === emp.id;
                return (
                  <React.Fragment key={emp.id}>
                    {/* ── Main employee row ── */}
                    <tr
                      className={`db-emp-row${isOpen ? ' db-emp-row--open' : ''}`}
                      onClick={() => toggleExpand(emp.id)}
                    >
                      {/* Employee info */}
                      <td style={{ padding: '13.6px 16px', minWidth: '277px' }}>
                        <div className="db-emp-cell">
                          <div className="db-emp-avatar" style={{ background: avatarBg }}>
                            {emp.initials || getInitials(emp.name)}
                          </div>
                          <div className="db-emp-info">
                            <span className="db-emp-name">{emp.name}</span>
                            <div className="db-emp-meta">
                              <span className="db-emp-id">{emp.id}</span>
                              <span className={roleClass(emp.role)}>{emp.role}</span>
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* Project chips */}
                      <td style={{ padding: '13.6px 16px', minWidth: '280px' }}>
                        <div className="db-proj-chips">
                          {(emp.projects || []).map((proj) => (
                            <span key={proj} className="db-proj-chip">{proj}</span>
                          ))}
                          {(!emp.projects || emp.projects.length === 0) && (
                            <span className="db-emp-id">—</span>
                          )}
                        </div>
                      </td>

                      {/* Occupied days */}
                      <td style={{ padding: '13.6px 16px', minWidth: '220px' }}>
                        <div className="db-occ-days">{emp.days}</div>
                        {emp.window && <div className="db-occ-window">{emp.window}</div>}
                        <div className="db-window-bar-wrap">
                          <div className="db-window-bar-track">
                            <div className="db-window-bar-fill" style={{ width: `${emp.windowPct ?? 70}%` }} />
                          </div>
                        </div>
                      </td>

                      {/* Utilization */}
                      <td style={{ padding: '13.6px 16px', minWidth: '200px' }}>
                        <UtilBar pct={emp.utilPct} />
                      </td>

                      {/* Expand button */}
                      <td className="db-expand-cell" onClick={(e) => { e.stopPropagation(); toggleExpand(emp.id); }}>
                        <ExpandBtn open={isOpen} onClick={() => {}} />
                      </td>
                    </tr>

                    {/* ── Expanded content row ── */}
                    {isOpen && <ExpandedRow emp={emp} colSpan={EMP_COL_SPAN} />}
                  </React.Fragment>
                );
              })}
              {filteredEmployees.length === 0 && (
                <tr className="db-empty-row"><td colSpan={EMP_COL_SPAN}>No employees match your search.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
};

export default Dashboard;
