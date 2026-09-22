// src/pages/projects/ProjectOverviewTab.jsx
import React from 'react';
import { AlertTriangle } from 'lucide-react';

// ─── Mock data matching the Figma design ────────────────────────────────────

const OVERVIEW_DATA = {
  projectName: 'Core Banking Upgrade',
  projectCode: 'KBL-042',
  units: 8,
  onTrackStatus: 'On Track',
  riskLevel: 'Low',
  startDate: '15 Mar 2026',
  endDate: '18 Sep 2026',
  completion: 82,
  teamMembersCount: 6,
  totalHoursAllocated: 132,
  totalHoursUtilized: 143,
  utilizationPercent: 108,
};

const TEAM_MEMBERS = [
  { name: 'Rahul Sharma',   tasks: 8, logged: '48h', done: 7,  pending: 1, color: '#7C3AED' },
  { name: 'Priya Patel',    tasks: 6, logged: '38h', done: 5,  pending: 1, color: '#10B981' },
  { name: 'Anand Krishnan', tasks: 4, logged: '25h', done: 3,  pending: 1, color: '#F59E0B' },
  { name: 'Sunita Reddy',   tasks: 3, logged: '12h', done: 2,  pending: 1, color: '#EF4444' },
  { name: 'Vikram Singh',   tasks: 2, logged: '11h', done: 2,  pending: 0, color: '#856BFF' },
  { name: 'Meera Iyer',     tasks: 2, logged: '9h',  done: 1,  pending: 1, color: '#EC4899' },
];

const TASK_ALLOCATION = [
  {
    member: 'Rahul Sharma',   role: 'Backend Developer', units: 20, tasks: 8, completed: 7, pending: 1,
    allocHours: '40h', loggedHours: '48h', variance: '+20%', variancePos: true,  progress: 88, status: 'Over Utilized',  statusType: 'over',
  },
  {
    member: 'Priya Patel',    role: 'Frontend Lead',     units: 32, tasks: 6, completed: 5, pending: 1,
    allocHours: '32h', loggedHours: '38h', variance: '+18%', variancePos: true,  progress: 83, status: 'Over Utilized',  statusType: 'over',
  },
  {
    member: 'Anand Krishnan', role: 'Data Engineer',     units: 15, tasks: 4, completed: 3, pending: 1,
    allocHours: '24h', loggedHours: '25h', variance: '+4%',  variancePos: true,  progress: 75, status: 'Optimally Used', statusType: 'optimal',
  },
  {
    member: 'Sunita Reddy',   role: 'DevOps',            units: 10, tasks: 3, completed: 2, pending: 1,
    allocHours: '16h', loggedHours: '12h', variance: '-25%', variancePos: false, progress: 67, status: 'Under Utilized', statusType: 'under',
  },
  {
    member: 'Vikram Singh',   role: 'Backend',           units:  8, tasks: 2, completed: 2, pending: 0,
    allocHours: '12h', loggedHours: '11h', variance: '-8%',  variancePos: false, progress: 100,status: 'Optimally Used', statusType: 'optimal',
  },
  {
    member: 'Meera Iyer',     role: 'Frontend',          units:  6, tasks: 2, completed: 1, pending: 1,
    allocHours: '8h',  loggedHours: '9h',  variance: '+12%', variancePos: true,  progress: 50, status: 'Over Utilized',  statusType: 'over',
  },
];

const PIE_COLORS = ['#7C3AED', '#10B981', '#F59E0B', '#EF4444', '#856BFF', '#EC4899'];

// ─── Pie Chart (pure SVG) ───────────────────────────────────────────────────

function PieChart({ members }) {
  const size = 160;
  const cx = size / 2;
  const cy = size / 2;
  const r = 62;
  const total = members.reduce((s, m) => s + m.tasks, 0);
  let cumAngle = -Math.PI / 2;

  const slices = members.map((m, i) => {
    const fraction = m.tasks / total;
    const startAngle = cumAngle;
    const sweepAngle = fraction * 2 * Math.PI;
    cumAngle += sweepAngle;
    const endAngle = cumAngle;
    const x1 = cx + r * Math.cos(startAngle);
    const y1 = cy + r * Math.sin(startAngle);
    const x2 = cx + r * Math.cos(endAngle);
    const y2 = cy + r * Math.sin(endAngle);
    const largeArc = sweepAngle > Math.PI ? 1 : 0;
    const d = `M ${cx} ${cy} L ${x1} ${y1} A ${r} ${r} 0 ${largeArc} 1 ${x2} ${y2} Z`;
    return { d, color: PIE_COLORS[i] };
  });

  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} style={{ overflow: 'visible' }}>
      {slices.map((s, i) => (
        <path key={i} d={s.d} fill={s.color} stroke="#fff" strokeWidth={2} />
      ))}
    </svg>
  );
}

// ─── Status Badge ───────────────────────────────────────────────────────────

function StatusBadge({ type, label }) {
  const styles = {
    over:    'bg-[#FEE2E2] text-[#DC2626] border border-[#FECACA]',
    under:   'bg-[#FEF3C7] text-[#D97706] border border-[#FDE68A]',
    optimal: 'bg-[#D1FAE5] text-[#059669] border border-[#A7F3D0]',
  };
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-semibold whitespace-nowrap ${styles[type]}`}>
      {label}
    </span>
  );
}

// ─── Progress Bar ───────────────────────────────────────────────────────────

function ProgressBar({ value }) {
  return (
    <div className="flex items-center gap-2">
      <div className="w-20 h-1.5 bg-gray-200 rounded-full overflow-hidden">
        <div className="h-full rounded-full bg-[#10B981]" style={{ width: `${Math.min(value, 100)}%` }} />
      </div>
      <span className="text-xs text-gray-700 font-medium">{value}%</span>
    </div>
  );
}

// ─── Metric Card ────────────────────────────────────────────────────────────

function MetricCard({ value, label, subLabel, valueClass }) {
  return (
    <div className="bg-white border border-[#E2E8F0] rounded-xl px-2 py-2 flex flex-col items-center justify-center gap-0.5 shadow-sm text-center">
      <span className={valueClass ?? 'text-xl font-bold text-[#1E293B]'}>{value}</span>
      <span className="text-[11px] text-[#64748B] font-medium leading-snug">{label}</span>
      {subLabel && <span className="text-[10px] text-[#94A3B8] leading-none">{subLabel}</span>}
    </div>
  );
}

// ─── Main Component ─────────────────────────────────────────────────────────

const ProjectOverviewTab = ({ project }) => {
  const pName = project?.project_name || project?.projectName || OVERVIEW_DATA.projectName;
  const pCode = project?.project_code || project?.projectCode || OVERVIEW_DATA.projectCode;

  return (
    <div className="flex flex-col gap-2 font-sans w-full">

      {/* ── Header row ── */}
      <div className="flex items-center justify-between flex-wrap gap-2">
        <div>
          <h1 className="text-[22px] font-bold text-[#1E293B] leading-tight">{pName}</h1>
          <p className="text-xs text-[#64748B] mt-0.5">
            {pCode} · {OVERVIEW_DATA.units} Units
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-[#D1FAE5] text-[#059669] border border-[#A7F3D0]">
            <span className="w-1.5 h-1.5 rounded-full bg-[#059669]" />
            {OVERVIEW_DATA.onTrackStatus}
          </span>
          <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-[#F0EDFF] text-[#7C3AED] border border-[#D8CEFD]">
            {OVERVIEW_DATA.riskLevel}
          </span>
        </div>
      </div>

      {/* ── Metric Cards ── */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-1.5">
        <MetricCard value={OVERVIEW_DATA.startDate}         label="Start Date"           valueClass="text-[18px] font-bold text-[#1E293B]" />
        <MetricCard value={OVERVIEW_DATA.endDate}           label="End Date"             valueClass="text-[18px] font-bold text-[#1E293B]" />
        <MetricCard value={`${OVERVIEW_DATA.completion}%`} label="Completion"           valueClass="text-2xl font-bold text-[#1E293B]" />
        <MetricCard value={OVERVIEW_DATA.teamMembersCount}  label="Team Members"         valueClass="text-2xl font-bold text-[#1E293B]" />
        <MetricCard
          value={`${OVERVIEW_DATA.totalHoursAllocated}h`}
          label="Total Hours Allocated"
          subLabel="Across 6 members"
          valueClass="text-2xl font-bold text-[#1E293B]"
        />
        {/* Over-utilised card */}
        <div className="bg-[#FEF2F2] border border-[#FECACA] rounded-xl p-3 flex flex-col items-center justify-center gap-0.5 shadow-sm text-center">
          <span className="text-2xl font-bold text-[#DC2626] leading-tight">
            {OVERVIEW_DATA.totalHoursUtilized}h
          </span>
          <span className="text-[11px] text-[#DC2626] font-medium leading-snug">
            Total Hours Utilized
          </span>
          <span className="flex items-center gap-1 text-[10px] font-bold text-[#DC2626] mt-0.5">
            <AlertTriangle size={10} />
            OVER UTILIZED · {OVERVIEW_DATA.utilizationPercent}%
          </span>
        </div>
      </div>

      {/* ── Work Allocation + Team Members ── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-2">

        {/* Work Allocation */}
        <div className="bg-white border border-[#E2E8F0] rounded-xl p-2 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-[14px] font-semibold text-[#1E293B]">Work Allocation</h3>
            <span className="text-[11px] text-[#64748B]">By team member</span>
          </div>
          <div className="flex flex-col items-center gap-2">
            <PieChart members={TEAM_MEMBERS} />
            <div className="flex flex-wrap justify-center gap-x-4 gap-y-1.5">
              {TEAM_MEMBERS.map((m, i) => (
                <div key={i} className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ backgroundColor: PIE_COLORS[i] }} />
                  <span className="text-[11px] text-[#475467]">{m.name}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Team Members table */}
        <div className="bg-white border border-[#E2E8F0] rounded-xl p-2 shadow-sm">
          <h3 className="text-[14px] font-semibold text-[#1E293B] mb-2">Team Members</h3>
          <table className="w-full text-xs">
            <thead>
              <tr className="text-[#94A3B8] uppercase text-[10px] tracking-wider border-b border-[#F1F5F9]">
                <th className="pb-1.5 text-left font-semibold">Member</th>
                <th className="pb-1.5 text-center font-semibold">Tasks</th>
                <th className="pb-1.5 text-center font-semibold">Logged</th>
                <th className="pb-1.5 text-center font-semibold">Done</th>
                <th className="pb-1.5 text-center font-semibold">Pending</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#F8FAFC]">
              {TEAM_MEMBERS.map((m, i) => (
                <tr key={i} className="hover:bg-[#FAFAFA] transition-colors">
                  <td className="py-1 text-[#1E293B] font-medium">{m.name}</td>
                  <td className="py-1 text-center text-[#475467]">{m.tasks}</td>
                  <td className="py-1 text-center text-[#475467]">{m.logged}</td>
                  <td className="py-1 text-center">
                    <span className="text-[#10B981] font-bold">{m.done}</span>
                  </td>
                  <td className="py-1 text-center">
                    <span className={m.pending === 0 ? 'text-[#10B981] font-bold' : 'text-[#F59E0B] font-bold'}>
                      {m.pending}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* ── Task Allocation & Timesheet Details ── */}
      <div className="bg-white border border-[#E2E8F0] rounded-xl shadow-sm overflow-hidden">
        <div className="flex items-center justify-between px-4 py-2.5 border-b border-[#F1F5F9]">
          <h3 className="text-[14px] font-semibold text-[#1E293B]">
            Task Allocation &amp; Timesheet Details
          </h3>
          <span className="text-[11px] text-[#64748B]">Per member breakdown</span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-xs min-w-[900px]">
            <thead>
              <tr className="bg-[#F8FAFC] border-b border-[#E2E8F0] text-[#94A3B8] text-[10px] uppercase tracking-wider">
                <th className="py-2 px-3 text-left font-semibold whitespace-nowrap">Team Member</th>
                <th className="py-2 px-3 text-left font-semibold whitespace-nowrap">Role</th>
                <th className="py-2 px-3 text-center font-semibold whitespace-nowrap">Units</th>
                <th className="py-2 px-3 text-center font-semibold whitespace-nowrap">Tasks</th>
                <th className="py-2 px-3 text-center font-semibold whitespace-nowrap">Completed</th>
                <th className="py-2 px-3 text-center font-semibold whitespace-nowrap">Pending</th>
                <th className="py-2 px-3 text-center font-semibold whitespace-nowrap">Alloc. Hours</th>
                <th className="py-2 px-3 text-center font-semibold whitespace-nowrap">Logged Hours</th>
                <th className="py-2 px-3 text-center font-semibold whitespace-nowrap">Variance</th>
                <th className="py-2 px-3 text-center font-semibold whitespace-nowrap">Progress</th>
                <th className="py-2 px-3 text-center font-semibold whitespace-nowrap">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#F1F5F9] text-[#475467]">
              {TASK_ALLOCATION.map((row, i) => (
                <tr key={i} className="hover:bg-[#FAFAFA] transition-colors">
                  <td className="py-1.5 px-3 text-[#1E293B] font-semibold whitespace-nowrap">{row.member}</td>
                  <td className="py-1.5 px-3 text-[#64748B] whitespace-nowrap">{row.role}</td>
                  <td className="py-1.5 px-3 text-center">
                    <span className="text-[#7C3AED] font-bold">{row.units}</span>
                  </td>
                  <td className="py-1.5 px-3 text-center font-medium">{row.tasks}</td>
                  <td className="py-1.5 px-3 text-center">
                    <span className="text-[#10B981] font-bold">{row.completed}</span>
                  </td>
                  <td className="py-1.5 px-3 text-center">
                    <span className={row.pending === 0 ? 'text-[#10B981] font-bold' : 'text-[#F59E0B] font-bold'}>
                      {row.pending}
                    </span>
                  </td>
                  <td className="py-1.5 px-3 text-center font-medium">{row.allocHours}</td>
                  <td className="py-1.5 px-3 text-center font-medium">{row.loggedHours}</td>
                  <td className="py-1.5 px-3 text-center">
                    <span className={`font-bold ${row.variancePos ? 'text-[#DC2626]' : 'text-[#059669]'}`}>
                      {row.variance}
                    </span>
                  </td>
                  <td className="py-1.5 px-3">
                    <ProgressBar value={row.progress} />
                  </td>
                  <td className="py-1.5 px-3 text-center">
                    <StatusBadge type={row.statusType} label={row.status} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
};

export default ProjectOverviewTab;
