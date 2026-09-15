// src/pages/DailyReport/DailyUpdatesReport.jsx
import React, { useState, useMemo, useRef } from 'react';
import toast from 'react-hot-toast';
import {
  FolderKanban,
  Clock,
  RotateCcw,
  ShieldCheck,
  ClipboardCheck,
  Search,
  ChevronDown,
  ChevronUp,
  ChevronLeft,
  ChevronRight,
  Calendar,
  Download,
  Check,
  Zap,
} from 'lucide-react';
import {
  MOCK_METRICS,
  MOCK_GLOBAL_TABS,
  MOCK_PROJECTS,
} from './mockDailyReportData';

// ── Stat Card Component ────────────────────────────────────────────────────────
function StatCard({ label, value, icon: IconComponent, iconBg, iconColor }) {
  return (
    <div className="bg-white rounded-xl border border-gray-100 shadow-[0_1px_3px_rgba(0,0,0,0.03)] px-4 py-3 flex items-center justify-between min-w-0 transition-all hover:shadow-md">
      <div className="min-w-0">
        <div className="text-[11.5px] text-gray-500 font-medium leading-none mb-1.5 whitespace-nowrap">
          {label}
        </div>
        <div className="text-[24px] font-bold text-[#1E293B] leading-none">
          {value}
        </div>
      </div>
      <div
        className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
        style={{ backgroundColor: iconBg, color: iconColor }}
      >
        <IconComponent size={20} strokeWidth={2.2} />
      </div>
    </div>
  );
}

// ── Classification Badge ──────────────────────────────────────────────────────
function ClassificationBadge({ classification }) {
  const norm = (classification || '').toUpperCase();

  if (norm.includes('LAST COMPLETED')) {
    return (
      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-[5px] bg-[#EAFBF3] text-[#059669] border border-[#10B981]/25 whitespace-nowrap">
        <Check size={12} strokeWidth={2.8} className="text-[#059669] shrink-0" />
        <div className="flex flex-col text-left leading-[1.05]">
          <span className="text-[9px] font-bold tracking-wider text-[#059669]">LAST</span>
          <span className="text-[9px] font-bold tracking-wider text-[#059669]">COMPLETED</span>
        </div>
      </span>
    );
  }

  if (norm.includes('IN-PROGRESS') || norm.includes('IN_PROGRESS') || norm.includes('PROGRESS')) {
    return (
      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[#EEF2FF] text-[#6366F1] border border-[#C7D2FE] text-[10px] font-bold tracking-wider whitespace-nowrap">
        <span className="w-1.5 h-1.5 rounded-full bg-[#6366F1] shrink-0" />
        IN-PROGRESS
      </span>
    );
  }

  if (norm.includes('BLOCKED')) {
    return (
      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[#FEF2F2] text-[#DC2626] border border-[#FCA5A5]/60 text-[10px] font-bold tracking-wider whitespace-nowrap">
        <span className="w-1.5 h-1.5 rounded-full bg-[#DC2626] shrink-0" />
        BLOCKED
      </span>
    );
  }

  return (
    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[#F1F5F9] text-[#64748B] text-[10px] font-bold tracking-wider whitespace-nowrap">
      <span className="w-1.5 h-1.5 rounded-full bg-[#64748B] shrink-0" />
      {norm || 'NOT STARTED'}
    </span>
  );
}

// ── Status Pill ───────────────────────────────────────────────────────────────
function StatusPill({ status }) {
  const norm = (status || '').toLowerCase();

  if (norm.includes('progress')) {
    return (
      <span className="inline-flex items-center justify-center px-3.5 py-1 rounded-full text-[11.5px] font-medium bg-[#EBF3FF] text-[#2563EB] whitespace-nowrap">
        In Progress
      </span>
    );
  }
  if (norm.includes('completed')) {
    return (
      <span className="inline-flex items-center justify-center px-3.5 py-1 rounded-full text-[11.5px] font-medium bg-[#EAFBF3] text-[#10B981] whitespace-nowrap">
        Completed
      </span>
    );
  }
  if (norm.includes('blocked')) {
    return (
      <span className="inline-flex items-center justify-center px-3.5 py-1 rounded-full text-[11.5px] font-medium bg-[#FEF2F2] text-[#EF4444] whitespace-nowrap">
        Blocked
      </span>
    );
  }
  return (
    <span className="inline-flex items-center justify-center px-3.5 py-1 rounded-full text-[11.5px] font-medium bg-[#F1F5F9] text-[#64748B] whitespace-nowrap">
      {status || 'Not Started'}
    </span>
  );
}

// ── Progress Cell ─────────────────────────────────────────────────────────────
function ProgressCell({ pct, status }) {
  const norm = (status || '').toLowerCase();
  const isCompleted = pct === 100 || norm.includes('completed');
  const isWarning = pct < 50 || norm.includes('blocked');

  let barColor = '#2563EB'; // Blue
  if (isCompleted) {
    barColor = '#10B981'; // Green
  } else if (isWarning) {
    barColor = '#F59E0B'; // Amber / Orange
  }

  return (
    <div className="flex items-center gap-2 min-w-[90px]">
      <span className="text-[11.5px] font-semibold text-[#1E293B] min-w-[30px]">{pct}%</span>
      <div className="w-[52px] h-[5px] rounded-full bg-[#E2E8F0] overflow-hidden">
        <div
          className="h-full rounded-full transition-all duration-300"
          style={{ width: `${pct}%`, backgroundColor: barColor }}
        />
      </div>
    </div>
  );
}

// ── Remarks Formatter ─────────────────────────────────────────────────────────
function RemarksCell({ text, prefix, prefixColor }) {
  if (!text) return <span className="text-gray-400">—</span>;

  if (prefix) {
    const remainder = text.startsWith(prefix) ? text.slice(prefix.length).trim() : text;
    return (
      <span className="text-[#5A6A85] text-[11.5px] leading-relaxed">
        <span className="font-semibold" style={{ color: prefixColor || '#D97706' }}>
          {prefix}{' '}
        </span>
        <span>{remainder}</span>
      </span>
    );
  }

  if (/^awaiting:/i.test(text)) {
    const parts = text.split(/(?<=:)\s/);
    return (
      <span className="text-[#5A6A85] text-[11.5px] leading-relaxed">
        <span className="font-semibold text-[#D97706]">{parts[0]} </span>
        <span>{parts.slice(1).join(' ')}</span>
      </span>
    );
  }

  if (/^blocker:/i.test(text)) {
    const parts = text.split(/(?<=:)\s/);
    return (
      <span className="text-[#5A6A85] text-[11.5px] leading-relaxed">
        <span className="font-semibold text-[#DC2626]">{parts[0]} </span>
        <span>{parts.slice(1).join(' ')}</span>
      </span>
    );
  }

  return <span className="text-[#5A6A85] text-[11.5px] leading-relaxed">{text}</span>;
}

// ── Planned Date Cell ─────────────────────────────────────────────────────────
function PlannedDateCell({ start, end }) {
  return (
    <div className="text-[11px] leading-[1.35] whitespace-nowrap">
      <div className="text-[#475569] font-medium">{start}</div>
      <div className="text-[#94A3B8]">→ {end}</div>
    </div>
  );
}

// ── Actual & Variance Cell ────────────────────────────────────────────────────
function ActualVarianceCell({ line1, line2, badge }) {
  return (
    <div className="text-[11px] leading-[1.3] whitespace-nowrap">
      <div className="text-[#475569] font-medium">{line1}</div>
      <div className="text-[#94A3B8]">{line2}</div>
      {badge && (
        <div className="mt-1">
          {badge.type === 'success' && (
            <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded bg-[#EAFBF3] text-[#10B981] text-[10px] font-semibold">
              <Zap size={10} className="fill-[#10B981]" />
              <span>{badge.label}</span>
            </span>
          )}
          {badge.type === 'warning' && (
            <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded bg-[#FFFBEB] text-[#D97706] text-[10px] font-semibold">
              <span className="text-[9px]">⚡</span>
              <span>{badge.label}</span>
            </span>
          )}
          {badge.type === 'neutral' && (
            <span className="inline-flex items-center px-1.5 py-0.5 rounded bg-[#F1F5F9] text-[#64748B] text-[10px] font-medium">
              <span>{badge.label}</span>
            </span>
          )}
        </div>
      )}
    </div>
  );
}

// ── Project Accordion Card ────────────────────────────────────────────────────
function ProjectCard({ project, globalTab, searchQuery }) {
  const [collapsed, setCollapsed] = useState(false);
  const [projectFilter, setProjectFilter] = useState('all');

  const filteredTasks = useMemo(() => {
    let list = project.tasks;

    if (globalTab === 'In Progress') {
      list = list.filter(t => t.status === 'In Progress');
    } else if (globalTab === 'Completed') {
      list = list.filter(t => t.status === 'Completed');
    } else if (globalTab === 'On Hold') {
      list = list.filter(t => t.status === 'Blocked' || t.status === 'On Hold');
    }

    if (projectFilter === 'in-progress') {
      list = list.filter(t => t.status === 'In Progress');
    } else if (projectFilter === 'last-completed') {
      list = list.filter(t => t.classification.includes('LAST COMPLETED'));
    } else if (projectFilter === 'total-completed') {
      list = list.filter(t => t.status === 'Completed');
    } else if (projectFilter === 'not-started') {
      list = list.filter(t => t.status === 'Not Started');
    } else if (projectFilter === 'blockers') {
      list = list.filter(t => t.isBlocker || t.status === 'Blocked');
    } else if (projectFilter === 'delayed') {
      list = list.filter(t => t.isDelayed);
    } else if (projectFilter === 'due-today') {
      list = list.filter(t => t.isDueToday);
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      list = list.filter(
        t =>
          (t.taskName || '').toLowerCase().includes(q) ||
          (t.ownerName || '').toLowerCase().includes(q) ||
          (t.remarks || '').toLowerCase().includes(q)
      );
    }

    return list;
  }, [project.tasks, globalTab, projectFilter, searchQuery]);

  const counts = project.tabCounts;

  return (
    <div className="bg-white rounded-xl border border-gray-200/80 shadow-[0_1px_3px_rgba(0,0,0,0.03)] overflow-hidden mb-5 transition-all">
      {/* ── Project Header ── */}
      <div className="px-5 pt-3.5 pb-3 border-b border-gray-100">
        <div className="flex flex-wrap items-center justify-between gap-3">
          {/* Left: Name, ID, Schedule Badge */}
          <div className="flex flex-wrap items-center gap-2.5">
            <span className="text-[16px] font-bold text-[#1E293B] tracking-tight">
              {project.name}
            </span>
            <span className="px-2 py-0.5 rounded bg-[#F1F5F9] text-[#64748B] text-[10.5px] font-medium tracking-wide">
              {project.projectCode}
            </span>
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-[#EAFBF3] text-[#10B981] border border-[#10B981]/25 text-[10.5px] font-semibold">
              <span className="w-1.5 h-1.5 rounded-full bg-[#10B981]" />
              {project.statusTag}
            </span>
          </div>

          {/* Right: Milestone + Progress Bar + Chevron */}
          <div className="flex items-center gap-3">
            <span className="text-[11px] text-gray-400 font-medium">
              Overall Project Milestone
            </span>
            <div className="flex items-center gap-2">
              <div className="w-[85px] h-[6px] rounded-full bg-gray-100 overflow-hidden">
                <div
                  className="h-full rounded-full transition-all duration-500"
                  style={{ width: `${project.milestoneCompletion}%`, backgroundColor: '#6366F1' }}
                />
              </div>
              <span className="text-[12px] font-bold text-[#1E293B] whitespace-nowrap">
                {project.milestoneCompletion}% Completed
              </span>
            </div>
            <button
              onClick={() => setCollapsed(c => !c)}
              className="w-6 h-6 rounded flex items-center justify-center hover:bg-gray-100 transition-colors flex-shrink-0 text-gray-400"
              title={collapsed ? 'Expand' : 'Collapse'}
            >
              {collapsed ? <ChevronDown size={15} /> : <ChevronUp size={15} />}
            </button>
          </div>
        </div>

        {/* Row 2: Lead, Team, Timeline, Active Tasks */}
        <div className="flex flex-wrap items-center gap-1.5 mt-1.5 text-[12px] text-gray-500">
          <span>
            Lead: <span className="text-gray-700 font-medium">{project.lead}</span>
          </span>
          <span className="text-gray-300 mx-1">•</span>
          <span>
            Team :{' '}
            <span className="text-[#6366F1] font-semibold cursor-pointer hover:underline">
              {project.teamMembersCount} Members
            </span>
          </span>
          <span className="text-gray-300 mx-1">•</span>
          <span>
            Timeline: <span className="text-gray-700 font-medium">{project.timeline}</span>
          </span>
          <span className="text-gray-300 mx-1">•</span>
          <span>
            <span className="text-gray-700 font-semibold">{project.activeTasksCount}</span> Active Tasks
          </span>
        </div>
      </div>

      {/* ── Sub-Navigation / Filter Bar (Figma Design) ── */}
      {!collapsed && (
        <div className="flex flex-wrap items-center gap-4 px-5 py-3 border-b border-gray-100 bg-white">
          {/* Left: Unified Segmented Pill Container */}
          <div className="inline-flex items-center gap-0.5 p-1 bg-[#F8FAFC] border border-[#E2E8F0] rounded-full overflow-x-auto">
            {/* All Task */}
            <button
              onClick={() => setProjectFilter('all')}
              className={`flex items-center gap-1 px-3.5 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all ${
                projectFilter === 'all'
                  ? 'bg-[#6366F1] text-white shadow-sm'
                  : 'text-[#475569] hover:text-[#1E293B]'
              }`}
            >
              <span>All Task ({counts.all})</span>
            </button>

            {/* In Progress */}
            <button
              onClick={() => setProjectFilter('in-progress')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-all ${
                projectFilter === 'in-progress'
                  ? 'bg-[#6366F1] text-white shadow-sm font-semibold'
                  : 'text-[#475569] hover:text-[#1E293B]'
              }`}
            >
              <span>In Progress</span>
              <span
                className={`px-1.5 py-0.5 rounded-full text-[10.5px] font-bold ${
                  projectFilter === 'in-progress'
                    ? 'bg-white/20 text-white'
                    : 'bg-[#F1F5F9] text-[#64748B]'
                }`}
              >
                {counts.inProgress}
              </span>
            </button>

            {/* Last Completed */}
            <button
              onClick={() => setProjectFilter('last-completed')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-all ${
                projectFilter === 'last-completed'
                  ? 'bg-[#6366F1] text-white shadow-sm font-semibold'
                  : 'text-[#475569] hover:text-[#1E293B]'
              }`}
            >
              <span>Last Completed</span>
              <span
                className={`px-1.5 py-0.5 rounded-full text-[10.5px] font-bold ${
                  projectFilter === 'last-completed'
                    ? 'bg-white/20 text-white'
                    : 'bg-[#EAFBF3] text-[#10B981]'
                }`}
              >
                {counts.lastCompleted}
              </span>
            </button>

            {/* Total Completed */}
            <button
              onClick={() => setProjectFilter('total-completed')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-all ${
                projectFilter === 'total-completed'
                  ? 'bg-[#6366F1] text-white shadow-sm font-semibold'
                  : 'text-[#475569] hover:text-[#1E293B]'
              }`}
            >
              <span>Total Completed</span>
              <span
                className={`px-1.5 py-0.5 rounded-full text-[10.5px] font-bold ${
                  projectFilter === 'total-completed'
                    ? 'bg-white/20 text-white'
                    : 'bg-[#EAFBF3] text-[#10B981]'
                }`}
              >
                {counts.totalCompleted}
              </span>
            </button>

            {/* Not Started */}
            <button
              onClick={() => setProjectFilter('not-started')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-all ${
                projectFilter === 'not-started'
                  ? 'bg-[#6366F1] text-white shadow-sm font-semibold'
                  : 'text-[#475569] hover:text-[#1E293B]'
              }`}
            >
              <span>Not Started</span>
              <span
                className={`px-1.5 py-0.5 rounded-full text-[10.5px] font-bold ${
                  projectFilter === 'not-started'
                    ? 'bg-white/20 text-white'
                    : 'bg-[#EFF6FF] text-[#2563EB]'
                }`}
              >
                {counts.notStarted}
              </span>
            </button>
          </div>

          <div className="w-px h-6 bg-gray-200 shrink-0"></div>

          {/* Right: Alert filters */}
          <div className="flex items-center gap-2.5 overflow-x-auto">
            {/* Blockers */}
            <button
              onClick={() => setProjectFilter(projectFilter === 'blockers' ? 'all' : 'blockers')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold border transition-all ${
                projectFilter === 'blockers'
                  ? 'ring-2 ring-[#D97706] ring-offset-1 bg-[#FFFBEB] border-[#FCD34D] text-[#D97706]'
                  : 'border-[#FCD34D] bg-[#FFFBEB] text-[#D97706] hover:opacity-90'
              }`}
            >
              <span className="w-1.5 h-1.5 rounded-full bg-[#D97706] shrink-0" />
              <span>Blockers ({counts.blockers})</span>
            </button>

            {/* Delayed */}
            <button
              onClick={() => setProjectFilter(projectFilter === 'delayed' ? 'all' : 'delayed')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold border transition-all ${
                projectFilter === 'delayed'
                  ? 'ring-2 ring-[#DC2626] ring-offset-1 bg-[#FEF2F2] border-[#FCA5A5] text-[#DC2626]'
                  : 'border-[#FCA5A5] bg-[#FEF2F2] text-[#DC2626] hover:opacity-90'
              }`}
            >
              <span className="w-1.5 h-1.5 rounded-full bg-[#DC2626] shrink-0" />
              <span>Delayed ({counts.delayed})</span>
            </button>

            {/* Due Today */}
            <button
              onClick={() => setProjectFilter(projectFilter === 'due-today' ? 'all' : 'due-today')}
              className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-full text-xs font-medium transition-all ${
                projectFilter === 'due-today'
                  ? 'text-[#1E293B] font-semibold bg-gray-100'
                  : 'text-[#64748B] hover:text-[#1E293B]'
              }`}
            >
              <span>Due Today ({counts.dueToday})</span>
            </button>
          </div>
        </div>
      )}

      {/* ── Table Matrix (with Figma custom horizontal scrollbar) ── */}
      {!collapsed && (
        <div className="figma-table-scroll pb-2">
          <table className="w-full text-[12px] border-collapse" style={{ minWidth: 1060 }}>
            <thead>
              <tr style={{ backgroundColor: '#F4F7FB' }}>
                <th className="text-left px-4 py-3 text-[11.5px] font-semibold text-[#5A6A85] whitespace-nowrap border-b border-[#E2E8F0] w-[145px]">
                  <div className="leading-tight">
                    <div>Task</div>
                    <div>Classification</div>
                  </div>
                </th>
                <th className="text-left px-4 py-3 text-[11.5px] font-semibold text-[#5A6A85] whitespace-nowrap border-b border-[#E2E8F0] min-w-[220px]">
                  Task
                </th>
                <th className="text-left px-4 py-3 text-[11.5px] font-semibold text-[#5A6A85] whitespace-nowrap border-b border-[#E2E8F0] min-w-[125px]">
                  Owner
                </th>
                <th className="text-left px-4 py-3 text-[11.5px] font-semibold text-[#5A6A85] whitespace-nowrap border-b border-[#E2E8F0] min-w-[100px]">
                  Risk Category
                </th>
                <th className="text-left px-4 py-3 text-[11.5px] font-semibold text-[#5A6A85] whitespace-nowrap border-b border-[#E2E8F0] min-w-[240px]">
                  Remarks
                </th>
                <th className="text-left px-4 py-3 text-[11.5px] font-semibold text-[#5A6A85] whitespace-nowrap border-b border-[#E2E8F0] min-w-[115px]">
                  <div className="leading-tight">
                    <div>Planned</div>
                    <div>Date</div>
                  </div>
                </th>
                <th className="text-left px-4 py-3 text-[11.5px] font-semibold text-[#5A6A85] whitespace-nowrap border-b border-[#E2E8F0] min-w-[130px]">
                  <div className="leading-tight">
                    <div>Actual &</div>
                    <div>Variance</div>
                  </div>
                </th>
                <th className="text-left px-4 py-3 text-[11.5px] font-semibold text-[#5A6A85] whitespace-nowrap border-b border-[#E2E8F0] min-w-[110px]">
                  Status
                </th>
                <th className="text-left px-4 py-3 text-[11.5px] font-semibold text-[#5A6A85] whitespace-nowrap border-b border-[#E2E8F0] min-w-[110px]">
                  Progress %
                </th>
              </tr>
            </thead>
            <tbody>
              {filteredTasks.length === 0 ? (
                <tr>
                  <td colSpan={9} className="py-10 text-center text-gray-400 text-sm">
                    No tasks matching the selected filters.
                  </td>
                </tr>
              ) : (
                filteredTasks.map((task, idx) => (
                  <tr
                    key={task.id || idx}
                    className="border-b border-[#F1F5F9] hover:bg-[#F8FAFC] transition-colors"
                  >
                    {/* Classification */}
                    <td className="px-4 py-3.5 align-top">
                      <ClassificationBadge classification={task.classification} />
                    </td>

                    {/* Task Title */}
                    <td className="px-4 py-3.5 align-top">
                      <div className="font-medium text-[#1E293B] text-[12.5px] leading-snug">
                        {task.taskName}
                      </div>
                    </td>

                    {/* Owner */}
                    <td className="px-4 py-3.5 align-top">
                      <div className="font-medium text-[#1E293B] text-[12px] whitespace-nowrap">
                        {task.ownerName}
                      </div>
                      {task.ownerRole && (
                        <div className="text-[11px] text-[#8C98A9] mt-0.5 whitespace-nowrap">
                          {task.ownerRole}
                        </div>
                      )}
                    </td>

                    {/* Risk Category */}
                    <td className="px-4 py-3.5 align-top">
                      <div className="inline-flex items-center justify-center px-2.5 py-1 rounded-[5px] bg-[#F1F5F9] text-[#64748B] text-[11px] font-medium min-w-[32px]">
                        {task.riskCategory || 'NA'}
                      </div>
                    </td>

                    {/* Remarks */}
                    <td className="px-4 py-3.5 align-top max-w-[280px]">
                      <RemarksCell
                        text={task.remarks}
                        prefix={task.remarksPrefix}
                        prefixColor={task.remarksPrefixColor}
                      />
                    </td>

                    {/* Planned Date */}
                    <td className="px-4 py-3.5 align-top">
                      <PlannedDateCell start={task.plannedStart} end={task.plannedEnd} />
                    </td>

                    {/* Actual & Variance */}
                    <td className="px-4 py-3.5 align-top">
                      <ActualVarianceCell
                        line1={task.actualLine1}
                        line2={task.actualLine2}
                        badge={task.varianceBadge}
                      />
                    </td>

                    {/* Status */}
                    <td className="px-4 py-3.5 align-top">
                      <StatusPill status={task.status} />
                    </td>

                    {/* Progress % */}
                    <td className="px-4 py-3.5 align-top">
                      <ProgressCell pct={task.progressPct} status={task.status} />
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
export default function DailyUpdatesReport() {
  const [globalTab, setGlobalTab] = useState('In Progress');
  const [searchQuery, setSearchQuery] = useState('');
  const [reportDate, setReportDate] = useState('2026-08-22');
  const dateInputRef = useRef(null);

  const formatReportDateDisplay = (dateStr) => {
    try {
      const d = new Date(dateStr);
      if (isNaN(d.getTime())) return 'Today • Aug 22,2026';
      const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
      return `Today • ${monthNames[d.getMonth()]} ${d.getDate()},${d.getFullYear()}`;
    } catch {
      return 'Today • Aug 22,2026';
    }
  };

  const shiftReportDate = (days) => {
    try {
      const d = new Date(reportDate);
      d.setDate(d.getDate() + days);
      const yyyy = d.getFullYear();
      const mm = String(d.getMonth() + 1).padStart(2, '0');
      const dd = String(d.getDate()).padStart(2, '0');
      setReportDate(`${yyyy}-${mm}-${dd}`);
    } catch (e) {
      console.error(e);
    }
  };

  // Handle export report
  const handleExport = () => {
    toast.success('Exporting daily report (CSV/Excel)...');
    try {
      const csvRows = [
        ['Project', 'Task Name', 'Classification', 'Owner', 'Planned Start', 'Planned End', 'Status', 'Progress %'],
      ];
      MOCK_PROJECTS.forEach(proj => {
        proj.tasks.forEach(t => {
          csvRows.push([
            proj.name,
            `"${t.taskName}"`,
            t.classification,
            t.ownerName,
            t.plannedStart,
            t.plannedEnd,
            t.status,
            `${t.progressPct}%`,
          ]);
        });
      });
      const blob = new Blob([csvRows.map(r => r.join(',')).join('\n')], {
        type: 'text/csv;charset=utf-8;',
      });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.setAttribute('href', url);
      link.setAttribute('download', `Daily_Report_${reportDate}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (e) {
      console.error('Export error:', e);
    }
  };

  return (
    <div className="min-h-full bg-[#F5F7FA] font-sans">
      <div className="px-6 py-5">
        {/* ── Page Header: Title + Date Switcher ── */}
        <div className="flex flex-wrap items-center justify-between gap-4 mb-5">
          <h1 className="text-[22px] font-bold text-[#1E293B] tracking-tight m-0">
            Daily Report
          </h1>

          <div className="relative flex items-center gap-1.5 bg-white border border-gray-200 rounded-lg px-2.5 py-1.5 shadow-[0_1px_2px_rgba(0,0,0,0.04)] text-[12px] text-gray-700 font-medium">
            <button
              type="button"
              onClick={() => shiftReportDate(-1)}
              className="p-0.5 rounded hover:bg-gray-100 text-gray-500 transition-colors"
              title="Previous Day"
            >
              <ChevronLeft size={14} strokeWidth={2.5} />
            </button>

            <div
              className="flex items-center gap-1.5 cursor-pointer px-1"
              onClick={() => dateInputRef.current?.showPicker?.() || dateInputRef.current?.focus()}
            >
              <Calendar size={14} className="text-gray-400" />
              <span className="whitespace-nowrap font-medium text-gray-700">
                {formatReportDateDisplay(reportDate)}
              </span>
            </div>

            <button
              type="button"
              onClick={() => shiftReportDate(1)}
              className="p-0.5 rounded hover:bg-gray-100 text-gray-500 transition-colors"
              title="Next Day"
            >
              <ChevronRight size={14} strokeWidth={2.5} />
            </button>

            <input
              ref={dateInputRef}
              type="date"
              value={reportDate}
              onChange={(e) => e.target.value && setReportDate(e.target.value)}
              className="sr-only"
            />
          </div>
        </div>

        {/* ── Metric Summary Cards (5 across) ── */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3.5 mb-5">
          <StatCard
            label="Total Projects"
            value={MOCK_METRICS.totalProjects}
            icon={FolderKanban}
            iconBg="#EFF6FF"
            iconColor="#2563EB"
          />
          <StatCard
            label="Not Started Tasks"
            value={MOCK_METRICS.notStartedTasks}
            icon={Clock}
            iconBg="#F1F5F9"
            iconColor="#475569"
          />
          <StatCard
            label="In Progress Tasks"
            value={MOCK_METRICS.inProgressTasks}
            icon={RotateCcw}
            iconBg="#EEF2FF"
            iconColor="#6366F1"
          />
          <StatCard
            label="Last Completed"
            value={MOCK_METRICS.lastCompleted}
            icon={ShieldCheck}
            iconBg="#ECFDF5"
            iconColor="#10B981"
          />
          <StatCard
            label="Total Completed"
            value={MOCK_METRICS.totalCompleted}
            icon={ClipboardCheck}
            iconBg="#ECFDF5"
            iconColor="#10B981"
          />
        </div>

        {/* ── Global Filter & Action Bar ── */}
        <div className="bg-white rounded-xl border border-gray-100 shadow-[0_1px_3px_rgba(0,0,0,0.03)] px-4 py-2.5 mb-5 flex flex-wrap items-center justify-between gap-4">
          {/* Status Tabs */}
          <div className="flex items-center gap-2 overflow-x-auto">
            {MOCK_GLOBAL_TABS.map(tab => {
              const isActive = globalTab === tab.key;
              return (
                <button
                  key={tab.key}
                  onClick={() => setGlobalTab(tab.key)}
                  className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-medium transition-all whitespace-nowrap ${
                    isActive
                      ? 'bg-[#6366F1] text-white font-semibold shadow-sm'
                      : 'text-gray-500 hover:text-gray-900 hover:bg-gray-50'
                  }`}
                >
                  {isActive && tab.key === 'In Progress' && (
                    <span className="w-1.5 h-1.5 rounded-full bg-[#10B981] shrink-0" />
                  )}
                  <span>{tab.label}</span>
                  <span
                    className={`text-[11px] font-semibold ${
                      isActive ? 'text-white' : 'text-gray-400'
                    }`}
                  >
                    {tab.count}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Search + Export Button */}
          <div className="flex items-center gap-3">
            <div className="relative">
              <Search
                size={14}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
              />
              <input
                type="text"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                placeholder="Search task titles..."
                className="pl-8 pr-3 py-1.5 text-[12px] border border-gray-200 rounded-lg bg-white focus:outline-none focus:ring-1 focus:ring-[#6366F1] focus:border-[#6366F1] transition-all w-52 text-gray-700 placeholder-gray-400"
              />
            </div>

            <button
              onClick={handleExport}
              className="flex items-center gap-1.5 px-3.5 py-1.5 bg-[#6366F1] hover:bg-[#4F46E5] text-white text-[12px] font-semibold rounded-lg transition-all shadow-sm active:scale-95"
            >
              <Download size={13} strokeWidth={2.5} />
              <span>Export Report</span>
            </button>
          </div>
        </div>

        {/* ── Project Cards List ── */}
        {MOCK_PROJECTS.map(project => (
          <ProjectCard
            key={project.id}
            project={project}
            globalTab={globalTab}
            searchQuery={searchQuery}
          />
        ))}
      </div>
    </div>
  );
}