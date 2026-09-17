import React, { useState, useMemo, useEffect } from 'react';
import {
  Search,
  SlidersHorizontal,
  ChevronDown,
  ChevronRight,
  ChevronLeft,
  Calendar,
  ClipboardList,
  Pencil,
  ArrowRight,
  RotateCw,
  X,
  Check,
} from 'lucide-react';
import toast from 'react-hot-toast';

// ─── Initial Mock Dataset (matches design specs & counts) ──────────────────────
// Total Tasks: 145 = 69 Completed + 19 In Progress + 57 Not Started
// Milestones: 8 total (3 Completed = 38%, 2 In Progress, 3 Not Started)

const INITIAL_MILESTONES = [
  {
    id: 'm-1',
    name: 'Planning & Initiation',
    status: 'Completed',
    completedCount: 12,
    totalCount: 12,
    percentage: 100,
    tasks: [
      {
        id: 'T-1024',
        title: 'Requirements Gathering',
        owner: 'Sarah J.',
        plannedStart: '10/01/24',
        plannedEnd: '10/15/24',
        actualStart: '10/01/24',
        actualEnd: '10/14/24',
        allocation: '100%',
        status: 'Completed',
        riskCategory: 'No Dependency',
        remark: '',
        role: 'BA',
        taskType: 'Analysis',
        unit: 98,
      },
      {
        id: 'T-1025',
        title: 'GIT Repo Creation',
        owner: 'Sarah J.',
        plannedStart: '10/01/24',
        plannedEnd: '10/15/24',
        actualStart: '10/01/24',
        actualEnd: '10/14/24',
        allocation: '100%',
        status: 'Completed',
        riskCategory: 'No Dependency',
        remark: '',
        role: 'BA',
        taskType: 'Analysis',
        unit: 12,
      },
      {
        id: 'T-1026',
        title: 'Prepare UI wireframes',
        owner: 'Sarah J.',
        plannedStart: '10/01/24',
        plannedEnd: '10/15/24',
        actualStart: '10/01/24',
        actualEnd: '10/14/24',
        allocation: '100%',
        status: 'Completed',
        riskCategory: 'No Dependency',
        remark: '',
        role: 'BA',
        taskType: 'Analysis',
        unit: 12,
      },
      {
        id: 'T-1027',
        title: 'Design DB schema & versioning',
        owner: 'Sarah J.',
        plannedStart: '10/01/24',
        plannedEnd: '10/15/24',
        actualStart: '10/01/24',
        actualEnd: '10/14/24',
        allocation: '100%',
        status: 'Completed',
        riskCategory: 'No Dependency',
        remark: '',
        role: 'BA',
        taskType: 'Analysis',
        unit: 12,
      },
      {
        id: 'T-1028',
        title: 'Swagger API Definitions',
        owner: 'Sarah J.',
        plannedStart: '10/01/24',
        plannedEnd: '10/15/24',
        actualStart: '10/01/24',
        actualEnd: '10/14/24',
        allocation: '100%',
        status: 'Completed',
        riskCategory: 'No Dependency',
        remark: '',
        role: 'BA',
        taskType: 'Analysis',
        unit: 12,
      },
      {
        id: 'T-1029',
        title: 'DB & API Definition Review',
        owner: 'Sarah J.',
        plannedStart: '10/01/24',
        plannedEnd: '10/15/24',
        actualStart: '10/01/24',
        actualEnd: '10/14/24',
        allocation: '100%',
        status: 'Completed',
        riskCategory: 'No Dependency',
        remark: '',
        role: 'BA',
        taskType: 'Analysis',
        unit: 12,
      },
      {
        id: 'T-1030',
        title: 'Architecture Blueprint Sign-off',
        owner: 'Sarah J.',
        plannedStart: '10/02/24',
        plannedEnd: '10/15/24',
        actualStart: '10/02/24',
        actualEnd: '10/14/24',
        allocation: '100%',
        status: 'Completed',
        riskCategory: 'No Dependency',
        remark: '',
        role: 'Lead',
        taskType: 'Review',
        unit: 15,
      },
      {
        id: 'T-1031',
        title: 'Sprint Zero Backlog Grooming',
        owner: 'Sarah J.',
        plannedStart: '10/03/24',
        plannedEnd: '10/15/24',
        actualStart: '10/03/24',
        actualEnd: '10/15/24',
        allocation: '100%',
        status: 'Completed',
        riskCategory: 'No Dependency',
        remark: '',
        role: 'BA',
        taskType: 'Planning',
        unit: 16,
      },
      {
        id: 'T-1032',
        title: 'Environment Setup & CI Pipeline',
        owner: 'Sarah J.',
        plannedStart: '10/04/24',
        plannedEnd: '10/15/24',
        actualStart: '10/04/24',
        actualEnd: '10/14/24',
        allocation: '100%',
        status: 'Completed',
        riskCategory: 'No Dependency',
        remark: '',
        role: 'DevOps',
        taskType: 'Infra',
        unit: 20,
      },
      {
        id: 'T-1033',
        title: 'Security Compliance Baseline',
        owner: 'Sarah J.',
        plannedStart: '10/05/24',
        plannedEnd: '10/15/24',
        actualStart: '10/05/24',
        actualEnd: '10/14/24',
        allocation: '100%',
        status: 'Completed',
        riskCategory: 'No Dependency',
        remark: '',
        role: 'SecOps',
        taskType: 'Security',
        unit: 14,
      },
      {
        id: 'T-1034',
        title: 'Stakeholder Kickoff Session',
        owner: 'Sarah J.',
        plannedStart: '10/01/24',
        plannedEnd: '10/05/24',
        actualStart: '10/01/24',
        actualEnd: '10/04/24',
        allocation: '100%',
        status: 'Completed',
        riskCategory: 'No Dependency',
        remark: '',
        role: 'PM',
        taskType: 'Meeting',
        unit: 8,
      },
      {
        id: 'T-1035',
        title: 'Quality Assurance Charter Setup',
        owner: 'Sarah J.',
        plannedStart: '10/06/24',
        plannedEnd: '10/15/24',
        actualStart: '10/06/24',
        actualEnd: '10/15/24',
        allocation: '100%',
        status: 'Completed',
        riskCategory: 'No Dependency',
        remark: '',
        role: 'QA',
        taskType: 'Testing',
        unit: 18,
      },
    ],
  },
  {
    id: 'm-2',
    name: 'Authentication & Authorization',
    status: 'Completed',
    completedCount: 12,
    totalCount: 12,
    percentage: 100,
    tasks: Array.from({ length: 12 }, (_, i) => ({
      id: `T-${1036 + i}`,
      title: [
        'OAuth2 & SSO Gateway Integration',
        'JWT Token Lifecycle & Refresh Flow',
        'Role-Based Access Control (RBAC) Engine',
        'Session Store & Redis Cache Config',
        'Multi-Factor Authentication (MFA) Setup',
        'Password Encryption & Salting Policy',
        'User Permission Audit Logs',
        'API Key Management & Rotation',
        'Tenant Isolation Middleware',
        'Security Headers & CORS Config',
        'Auth Unit & Integration Test Suite',
        'OAuth Smoke & Security Sign-off',
      ][i],
      owner: 'Sarah J.',
      plannedStart: '10/16/24',
      plannedEnd: '10/31/24',
      actualStart: '10/16/24',
      actualEnd: '10/30/24',
      allocation: '100%',
      status: 'Completed',
      riskCategory: 'No Dependency',
      remark: '',
      role: 'Dev',
      taskType: 'Development',
      unit: 24,
    })),
  },
  {
    id: 'm-3',
    name: 'Add/Update Entry & Logged Calls',
    status: 'Completed',
    completedCount: 12,
    totalCount: 12,
    percentage: 100,
    tasks: Array.from({ length: 12 }, (_, i) => ({
      id: `T-${1048 + i}`,
      title: [
        'Call Logging Data Schema & Indexes',
        'Entry Form Responsive UI Component',
        'Batch Call Update API Endpoint',
        'Real-time Validation & Error Handling',
        'Call Audio File Upload Integration',
        'Operator Tagging & Classification',
        'Call Disposition Tracking Flow',
        'Audit Trail for Log Modifications',
        'Offline Cache for Field Call Logs',
        'Export Call Records to CSV/Excel',
        'Entry Form Automated Test Coverage',
        'Call Module Stakeholder Demo',
      ][i],
      owner: 'Sarah J.',
      plannedStart: '11/01/24',
      plannedEnd: '11/15/24',
      actualStart: '11/01/24',
      actualEnd: '11/14/24',
      allocation: '100%',
      status: 'Completed',
      riskCategory: 'No Dependency',
      remark: '',
      role: 'Dev',
      taskType: 'Development',
      unit: 18,
    })),
  },
  {
    id: 'm-4',
    name: 'Backdated Entry , Transfer & Report',
    status: 'In Progress',
    completedCount: 11,
    totalCount: 16,
    percentage: 69,
    tasks: Array.from({ length: 16 }, (_, i) => ({
      id: `T-${1060 + i}`,
      title: [
        'Historical Data Import Parser',
        'Backdated Entry Permission Rules',
        'Transfer Workflow Approval Engine',
        'Cross-Branch Asset Transfer Logic',
        'Reconciliation Report Generator',
        'PDF Export Engine with Ahana Header',
        'Scheduled Email Report Dispatcher',
        'Audit Logging for Balance Adjustments',
        'Manager Override Authorization Flow',
        'Data Integrity Verification Script',
        'Transfer Ledger UI Grid View',
        'Discrepancy Notification Alerting',
        'Real-time Ledger Sync Worker',
        'Tax & Duty Calculation Module',
        'Bulk Transfer Validation Queue',
        'Branch Sign-off Documentation',
      ][i],
      owner: 'Sarah J.',
      plannedStart: '11/16/24',
      plannedEnd: '11/30/24',
      actualStart: '11/16/24',
      actualEnd: i < 11 ? '11/28/24' : '-',
      allocation: '100%',
      status: i < 11 ? 'Completed' : 'In Progress',
      riskCategory: i < 11 ? 'No Dependency' : 'Low Dependency',
      remark: '',
      role: i % 2 === 0 ? 'Dev' : 'BA',
      taskType: i % 2 === 0 ? 'Development' : 'Analysis',
      unit: 16,
    })),
  },
  {
    id: 'm-5',
    name: 'Dashboard & Archive',
    status: 'In Progress',
    completedCount: 11,
    totalCount: 16,
    percentage: 69,
    tasks: Array.from({ length: 16 }, (_, i) => ({
      id: `T-${1076 + i}`,
      title: [
        'Executive Summary KPI Cards',
        'Resource Utilization Donut Chart',
        'Weekly Effort Trend Line Graph',
        'Active Project Milestone Timeline',
        'Archive Storage Cold-tier Config',
        'Automated 90-Day Archival Policy',
        'Archived Project Search & Retrieve',
        'Export Dashboard Analytics to PDF',
        'Role-Based Widget Visibility Matrix',
        'Live Webhook Event Aggregator',
        'Performance Optimization & Caching',
        'Real-time Dashboard WebSocket Client',
        'Archive Integrity Checksum Script',
        'Custom Date Range Filter Widget',
        'Drill-down Task Activity Modal',
        'Dark Mode Theme Refinements',
      ][i],
      owner: 'Sarah J.',
      plannedStart: '12/01/24',
      plannedEnd: '12/15/24',
      actualStart: '12/01/24',
      actualEnd: i < 11 ? '12/14/24' : '-',
      allocation: '100%',
      status: i < 11 ? 'Completed' : (i < 14 ? 'In Progress' : 'Not Started'),
      riskCategory: 'No Dependency',
      remark: '',
      role: 'Dev',
      taskType: 'Frontend',
      unit: 20,
    })),
  },
  {
    id: 'm-6',
    name: 'Cron Script',
    status: 'Not Started',
    completedCount: 0,
    totalCount: 10,
    percentage: 0,
    tasks: Array.from({ length: 10 }, (_, i) => ({
      id: `T-${1092 + i}`,
      title: [
        'Nightly PMS Database Sync Worker',
        'Timesheet Auto-Reminder Notification',
        'Weekly Utilization Metric Aggregator',
        'Overdue Milestone Escalation Job',
        'Orphaned Session Cleanup Script',
        'Cloud Backup Snapshot Trigger',
        'System Health Check Ping Worker',
        'Log Rotation & S3 Archival Runner',
        'Deadlock & Slow Query Alerting',
        'Disaster Recovery Cron Failover Test',
      ][i],
      owner: 'Sarah J.',
      plannedStart: '12/16/24',
      plannedEnd: '12/24/24',
      actualStart: '-',
      actualEnd: '-',
      allocation: '100%',
      status: 'Not Started',
      riskCategory: 'No Dependency',
      remark: '',
      role: 'DevOps',
      taskType: 'Infra',
      unit: 10,
    })),
  },
  {
    id: 'm-7',
    name: 'QA Testing & Debugging',
    status: 'Not Started',
    completedCount: 0,
    totalCount: 10,
    percentage: 0,
    tasks: Array.from({ length: 10 }, (_, i) => ({
      id: `T-${1102 + i}`,
      title: [
        'Regression Test Plan Execution',
        'Cross-Browser & Device Compatibility',
        'Performance & Load Spike Testing',
        'Security Penetration Test Run',
        'API Contract Breaking Changes Check',
        'Accessibility (WCAG 2.1) Audit',
        'High-Priority Bug Fixes Sprint',
        'Edge-Case Network Disconnection Tests',
        'Data Rollback Verification Test',
        'QA Sign-off Certificate Generation',
      ][i],
      owner: 'Sarah J.',
      plannedStart: '12/25/24',
      plannedEnd: '01/05/25',
      actualStart: '-',
      actualEnd: '-',
      allocation: '100%',
      status: 'Not Started',
      riskCategory: 'No Dependency',
      remark: '',
      role: 'QA',
      taskType: 'Testing',
      unit: 14,
    })),
  },
  {
    id: 'm-8',
    name: 'UAT & Deployment',
    status: 'Not Started',
    completedCount: 0,
    totalCount: 10,
    percentage: 0,
    tasks: Array.from({ length: 10 }, (_, i) => ({
      id: `T-${1112 + i}`,
      title: [
        'User Acceptance Testing Kickoff',
        'Client Feedback Resolution Cycle',
        'Production Release Runbook Draft',
        'Database Migration Verification',
        'Blue-Green Deployment Execution',
        'SSL Certificate & DNS Cutover',
        'Live Smoke Testing on Production',
        'End-User Training Documentation',
        'Monitoring Dashboards & Alert Rules',
        'Final Project Handover & Closure',
      ][i],
      owner: 'Sarah J.',
      plannedStart: '01/06/25',
      plannedEnd: '01/15/25',
      actualStart: '-',
      actualEnd: '-',
      allocation: '100%',
      status: 'Not Started',
      riskCategory: 'No Dependency',
      remark: '',
      role: 'Lead',
      taskType: 'Deployment',
      unit: 12,
    })),
  },
];

// Helper to fill remaining tasks to exactly 145 if needed
const ALL_MILESTONES = (() => {
  // Total in list above: 12 + 12 + 12 + 16 + 16 + 10 + 10 + 10 = 98
  // Add additional tasks distributed to reach exactly 145 tasks matching the design:
  // Completed: 69, In Progress: 19, Not Started: 57
  const ms = JSON.parse(JSON.stringify(INITIAL_MILESTONES));
  let curId = 1122;

  // Milestone 2 (+11 completed tasks -> 23)
  for (let i = 0; i < 11; i++) {
    ms[1].tasks.push({
      id: `T-${curId++}`,
      title: `Auth Verification Suite Part ${i + 1}`,
      owner: 'Sarah J.',
      plannedStart: '10/20/24',
      plannedEnd: '10/31/24',
      actualStart: '10/20/24',
      actualEnd: '10/30/24',
      allocation: '100%',
      status: 'Completed',
      riskCategory: 'No Dependency',
      remark: '',
      role: 'Dev',
      taskType: 'Development',
      unit: 12,
    });
  }
  ms[1].completedCount = ms[1].tasks.length;
  ms[1].totalCount = ms[1].tasks.length;

  // Milestone 3 (+11 completed tasks -> 23)
  for (let i = 0; i < 11; i++) {
    ms[2].tasks.push({
      id: `T-${curId++}`,
      title: `Call Log Pipeline Tuning Part ${i + 1}`,
      owner: 'Sarah J.',
      plannedStart: '11/05/24',
      plannedEnd: '11/15/24',
      actualStart: '11/05/24',
      actualEnd: '11/14/24',
      allocation: '100%',
      status: 'Completed',
      riskCategory: 'No Dependency',
      remark: '',
      role: 'Dev',
      taskType: 'Development',
      unit: 12,
    });
  }
  ms[2].completedCount = ms[2].tasks.length;
  ms[2].totalCount = ms[2].tasks.length;

  // Milestone 4 (+9 tasks: 1 completed, 8 in progress)
  ms[3].tasks.push({
    id: `T-${curId++}`,
    title: 'Backdated Ledger Checksum Review',
    owner: 'Sarah J.',
    plannedStart: '11/20/24',
    plannedEnd: '11/30/24',
    actualStart: '11/20/24',
    actualEnd: '11/29/24',
    allocation: '100%',
    status: 'Completed',
    riskCategory: 'No Dependency',
    remark: '',
    role: 'Dev',
    taskType: 'Development',
    unit: 16,
  });
  for (let i = 0; i < 8; i++) {
    ms[3].tasks.push({
      id: `T-${curId++}`,
      title: `Ledger Validation Stage ${i + 1}`,
      owner: 'Sarah J.',
      plannedStart: '11/25/24',
      plannedEnd: '12/05/24',
      actualStart: '11/25/24',
      actualEnd: '-',
      allocation: '100%',
      status: 'In Progress',
      riskCategory: 'Low Dependency',
      remark: '',
      role: 'Dev',
      taskType: 'Development',
      unit: 14,
    });
  }
  ms[3].completedCount = ms[3].tasks.filter((t) => t.status === 'Completed').length;
  ms[3].totalCount = ms[3].tasks.length;
  ms[3].percentage = Math.round((ms[3].completedCount / ms[3].totalCount) * 100);

  // Milestone 6, 7, 8 (+16 not started tasks)
  for (let i = 0; i < 5; i++) {
    ms[5].tasks.push({
      id: `T-${curId++}`,
      title: `Extended Cron Job Worker #${i + 1}`,
      owner: 'Sarah J.',
      plannedStart: '12/20/24',
      plannedEnd: '12/28/24',
      actualStart: '-',
      actualEnd: '-',
      allocation: '100%',
      status: 'Not Started',
      riskCategory: 'No Dependency',
      remark: '',
      role: 'DevOps',
      taskType: 'Infra',
      unit: 10,
    });
  }
  ms[5].totalCount = ms[5].tasks.length;

  for (let i = 0; i < 6; i++) {
    ms[6].tasks.push({
      id: `T-${curId++}`,
      title: `Extended QA Automation Case #${i + 1}`,
      owner: 'Sarah J.',
      plannedStart: '12/28/24',
      plannedEnd: '01/08/25',
      actualStart: '-',
      actualEnd: '-',
      allocation: '100%',
      status: 'Not Started',
      riskCategory: 'No Dependency',
      remark: '',
      role: 'QA',
      taskType: 'Testing',
      unit: 12,
    });
  }
  ms[6].totalCount = ms[6].tasks.length;

  for (let i = 0; i < 5; i++) {
    ms[7].tasks.push({
      id: `T-${curId++}`,
      title: `Post-Deployment Verification #${i + 1}`,
      owner: 'Sarah J.',
      plannedStart: '01/10/25',
      plannedEnd: '01/20/25',
      actualStart: '-',
      actualEnd: '-',
      allocation: '100%',
      status: 'Not Started',
      riskCategory: 'No Dependency',
      remark: '',
      role: 'Lead',
      taskType: 'Deployment',
      unit: 15,
    });
  }
  ms[7].totalCount = ms[7].tasks.length;

  return ms;
})();

// Helper for role abbreviation matching design specs
const getRoleAbbr = (role) => {
  if (!role) return 'BA';
  const r = role.toLowerCase();
  if (r.includes('business analyst') || r === 'ba') return 'BA';
  if (r.includes('lead')) return 'Lead';
  if (r.includes('frontend') || r === 'fe dev' || r === 'fe') return 'FE Dev';
  if (r.includes('backend') || r === 'be dev' || r === 'be') return 'BE Dev';
  if (r.includes('ui') || r.includes('ux')) return 'UI/UX';
  if (r.includes('qa')) return 'QA';
  if (r.includes('devops')) return 'DevOps';
  if (r.includes('secops')) return 'SecOps';
  if (r.includes('manager') || r === 'pm') return 'PM';
  return role;
};

// Helper for full role name in modal
const getFullRoleName = (role) => {
  if (!role) return 'Business Analyst';
  const r = role.toLowerCase();
  if (r === 'ba' || r.includes('business analyst')) return 'Business Analyst';
  if (r === 'lead') return 'Lead';
  if (r.includes('frontend') || r === 'fe dev' || r === 'fe') return 'Frontend Developer';
  if (r.includes('backend') || r === 'be dev' || r === 'be') return 'Backend Developer';
  if (r.includes('ui') || r.includes('ux')) return 'UI/UX Designer';
  if (r === 'qa') return 'QA Engineer';
  if (r === 'devops') return 'DevOps Engineer';
  if (r === 'secops') return 'SecOps Engineer';
  if (r === 'pm' || r.includes('manager')) return 'Project Manager';
  return role;
};

// Status Badge Component for Task Status
const renderTaskStatusBadge = (status) => {
  if (status === 'Completed') {
    return (
      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-[#E6F8EF] text-[#10B981] border border-[#B7EB8F]/40 whitespace-nowrap">
        Completed
      </span>
    );
  }
  if (status === 'In Progress') {
    return (
      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-[#FEF6E9] text-[#D97706] border border-[#FDE68A]/40 whitespace-nowrap">
        In Progress
      </span>
    );
  }
  return (
    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-[#F3F4F6] text-[#6B7280] border border-gray-200/50 whitespace-nowrap">
      Not Started
    </span>
  );
};

const TaskInfoTab = ({ project, isEditing = false, onEdit, onNext, onCancel }) => {
  const [milestones, setMilestones] = useState(ALL_MILESTONES);
  // Default expanded: first milestone ("m-1")
  const [expandedMilestones, setExpandedMilestones] = useState({ 'm-1': true });
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedMilestoneFilter, setSelectedMilestoneFilter] = useState('ALL');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedTasks, setSelectedTasks] = useState({});
  const [editingTask, setEditingTask] = useState(null);
  const [editFormData, setEditFormData] = useState({
    role: 'Business Analyst',
    taskType: 'Analysis',
    unit: '98',
  });
  const pageSize = 10;

  // Toggle card expansion
  const toggleMilestone = (id) => {
    setExpandedMilestones((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  // Toggle individual task selection
  const toggleSelectTask = (taskId) => {
    setSelectedTasks((prev) => ({
      ...prev,
      [taskId]: !prev[taskId],
    }));
  };

  // Toggle select all tasks in milestone
  const toggleSelectAllMilestone = (milestoneId, checkAll) => {
    const ms = milestones.find((m) => m.id === milestoneId);
    if (!ms) return;
    setSelectedTasks((prev) => {
      const next = { ...prev };
      ms.tasks.forEach((t) => {
        next[t.id] = checkAll;
      });
      return next;
    });
  };

  // Handle inline change for risk category in Edit mode
  const handleRiskCategoryChange = (milestoneId, taskId, newRisk) => {
    setMilestones((prev) =>
      prev.map((m) => {
        if (m.id !== milestoneId) return m;
        return {
          ...m,
          tasks: m.tasks.map((t) => (t.id === taskId ? { ...t, riskCategory: newRisk } : t)),
        };
      })
    );
  };

  // Handle inline change for remark in Edit mode
  const handleRemarkChange = (milestoneId, taskId, newRemark) => {
    setMilestones((prev) =>
      prev.map((m) => {
        if (m.id !== milestoneId) return m;
        return {
          ...m,
          tasks: m.tasks.map((t) => (t.id === taskId ? { ...t, remark: newRemark } : t)),
        };
      })
    );
  };

  // Open Edit Task Details slide-over panel
  const openEditModal = (task, milestone) => {
    setEditingTask({
      ...task,
      milestoneId: milestone.id,
      milestoneName: milestone.name,
      phase: task.phase || (milestone.id === 'm-1' ? 'Phase 1: Discovery' : milestone.name),
      ownerFull: task.ownerFull || (task.owner === 'Sarah J.' ? 'Sarah Jenkins' : task.owner),
      remark: task.remark || 'Completed ahead of schedule.',
      riskCategory: task.riskCategory || 'No Dependency',
    });
    setEditFormData({
      role: getFullRoleName(task.role),
      taskType: task.taskType || 'Analysis',
      unit: task.unit !== undefined && task.unit !== null ? String(task.unit) : '98',
    });
  };

  // Close slide-over panel on Escape key
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && editingTask) {
        setEditingTask(null);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [editingTask]);

  // Save changes from Edit Task Details slide-over panel
  const handleSaveEditedTask = (e) => {
    e?.preventDefault?.();
    if (!editingTask) return;

    setMilestones((prev) =>
      prev.map((m) => {
        if (m.id !== editingTask.milestoneId) return m;
        return {
          ...m,
          tasks: m.tasks.map((t) =>
            t.id === editingTask.id
              ? {
                  ...t,
                  role: editFormData.role,
                  taskType: editFormData.taskType,
                  unit: Number(editFormData.unit) || editFormData.unit,
                }
              : t
          ),
        };
      })
    );

    toast.success(`Task ${editingTask.id} updated successfully!`);
    setEditingTask(null);
  };

  // Calculate overall metrics
  const totalMilestonesCount = milestones.length;
  const completedMilestonesCount = milestones.filter((m) => m.status === 'Completed').length;
  const milestonesPercent = Math.round((completedMilestonesCount / totalMilestonesCount) * 100);

  const allTasks = useMemo(() => {
    return milestones.flatMap((m) =>
      m.tasks.map((t) => ({ ...t, milestoneId: m.id, milestoneName: m.name }))
    );
  }, [milestones]);

  const totalTasksCount = allTasks.length;
  const completedTasksCount = allTasks.filter((t) => t.status === 'Completed').length;
  const inProgressTasksCount = allTasks.filter((t) => t.status === 'In Progress').length;
  const notStartedTasksCount = allTasks.filter((t) => t.status === 'Not Started').length;
  const completedPercent = Math.round((completedTasksCount / totalTasksCount) * 100);

  // Filtered milestones and tasks
  const filteredMilestones = useMemo(() => {
    return milestones
      .filter((m) => {
        if (selectedMilestoneFilter !== 'ALL' && m.id !== selectedMilestoneFilter) {
          return false;
        }
        return true;
      })
      .map((m) => {
        const matchingTasks = m.tasks.filter((t) => {
          if (statusFilter !== 'ALL' && t.status !== statusFilter) {
            return false;
          }
          if (searchQuery.trim()) {
            const q = searchQuery.toLowerCase();
            const matchTitle = t.title.toLowerCase().includes(q);
            const matchId = t.id.toLowerCase().includes(q);
            const matchOwner = t.owner.toLowerCase().includes(q);
            if (!matchTitle && !matchId && !matchOwner) return false;
          }
          return true;
        });
        return {
          ...m,
          tasks: matchingTasks,
        };
      })
      .filter((m) => {
        if (searchQuery.trim() || statusFilter !== 'ALL') {
          return m.tasks.length > 0;
        }
        return true;
      });
  }, [milestones, selectedMilestoneFilter, statusFilter, searchQuery]);

  // Total matching tasks across all filtered milestones
  const totalFilteredTasks = useMemo(() => {
    return filteredMilestones.reduce((acc, m) => acc + m.tasks.length, 0);
  }, [filteredMilestones]);

  // Status Badge Component for Milestone Header
  const renderMilestoneStatusBadge = (milestone) => {
    if (milestone.status === 'Completed') {
      return (
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-[#E6F8EF] text-[#10B981] border border-[#B7EB8F]/40 whitespace-nowrap">
          <span className="w-1.5 h-1.5 rounded-full bg-[#10B981]"></span>
          Completed ({milestone.completedCount}/{milestone.totalCount}) - {milestone.percentage}%
        </span>
      );
    }
    if (milestone.status === 'In Progress') {
      return (
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-[#FEF6E9] text-[#D97706] border border-[#FDE68A]/40 whitespace-nowrap">
          <span className="w-1.5 h-1.5 rounded-full bg-[#D97706]"></span>
          In Progress ({milestone.completedCount}/{milestone.totalCount}) - {milestone.percentage}%
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-[#F3F4F6] text-[#6B7280] border border-gray-200/50 whitespace-nowrap">
        <span className="w-1.5 h-1.5 rounded-full bg-[#9CA3AF]"></span>
        Not Started ({milestone.completedCount}/{milestone.totalCount}) - {milestone.percentage}%
      </span>
    );
  };

  const projName = project?.project_name || project?.projectName || project?.name || 'FMS';
  const pmsId = project?.pms_id || project?.pmsId || 'PMS-9021';

  return (
    <div className="space-y-4 font-sans text-gray-800">

      {/* ── Filter & Search Bar Container ── */}
      <div className="bg-white rounded-xl p-4 sm:p-5 border border-[#DFE1E6] shadow-sm mb-4">
        
        {/* Row 1: Search, Milestone Dropdown, Filter Button */}
        <div className="flex flex-wrap items-center gap-3">
          
          {/* Search Input */}
          <div className="relative w-full sm:w-[360px]">
            <Search
              size={16}
              strokeWidth={2}
              className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#64748B] pointer-events-none"
            />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setCurrentPage(1);
              }}
              placeholder="Search tasks..."
              className="box-border w-full h-10 pl-9 pr-3.5 border border-[#DFE1E6] rounded-lg bg-white text-sm text-[#1E293B] placeholder-[#94A3B8] outline-none focus:border-[#856BFF] transition-colors font-normal"
            />
          </div>

          {/* Milestone Dropdown Filter */}
          <div className="relative">
            <select
              value={selectedMilestoneFilter}
              onChange={(e) => {
                setSelectedMilestoneFilter(e.target.value);
                setCurrentPage(1);
              }}
              className="box-border appearance-none h-10 pl-4 pr-9 border border-[#DFE1E6] rounded-lg bg-white text-[#475569] font-medium text-sm outline-none focus:border-[#856BFF] cursor-pointer transition-colors"
            >
              <option value="ALL">Milestone</option>
              {milestones.map((m) => (
                <option key={m.id} value={m.id}>
                  {m.name}
                </option>
              ))}
            </select>
            <ChevronDown
              size={16}
              strokeWidth={2.2}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-[#5E6C84] pointer-events-none"
            />
          </div>

          {/* Filter Button */}
          <button
            type="button"
            onClick={() => {
              const next =
                statusFilter === 'ALL'
                  ? 'Completed'
                  : statusFilter === 'Completed'
                  ? 'In Progress'
                  : statusFilter === 'In Progress'
                  ? 'Not Started'
                  : 'ALL';
              setStatusFilter(next);
              setCurrentPage(1);
            }}
            className="box-border flex items-center gap-2 h-10 px-4 border border-[#856BFF] rounded-lg bg-white text-[#856BFF] font-semibold text-sm hover:bg-[#F3F0FF]/40 transition-colors cursor-pointer"
          >
            <SlidersHorizontal size={14} className="text-[#856BFF]" />
            <span>Filter</span>
          </button>

        </div>

        {/* ── Row 2: Summary & Metrics Badges Bar ── */}
        <div className="flex flex-wrap items-center gap-2.5 mt-3.5 pt-0.5 text-xs">
          
          {/* Milestones Completed Badge */}
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-[#FAF5FF] border border-[#E9D8FD] text-[#7C3AED] font-semibold">
            <span className="w-1.5 h-1.5 rounded-full bg-[#7C3AED]"></span>
            <span>Milestones: 3/8 Completed (38%)</span>
          </div>

          {/* Tasks Count Badge */}
          <div
            onClick={() => setStatusFilter('ALL')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md border text-xs cursor-pointer transition-colors ${
              statusFilter === 'ALL'
                ? 'bg-[#F1F5F9] border-[#E2E8F0] text-[#334155]'
                : 'bg-white border-[#E2E8F0] text-[#334155] hover:bg-gray-50'
            }`}
          >
            <span className="w-1.5 h-1.5 rounded-sm bg-[#64748B]"></span>
            <span>Tasks: <span className="font-bold text-[#1E293B]">145</span></span>
          </div>

          {/* Completed Badge */}
          <div
            onClick={() => setStatusFilter(statusFilter === 'Completed' ? 'ALL' : 'Completed')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-[#ECFDF5] border border-[#A7F3D0] text-[#065F46] font-semibold cursor-pointer transition-colors ${
              statusFilter === 'Completed' ? 'ring-1 ring-[#10B981]' : 'hover:opacity-90'
            }`}
          >
            <span className="w-1.5 h-1.5 rounded-full bg-[#10B981]"></span>
            <span>Completed: 69 (48%)</span>
          </div>

          {/* In Progress Badge */}
          <div
            onClick={() => setStatusFilter(statusFilter === 'In Progress' ? 'ALL' : 'In Progress')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-[#FFFBEB] border border-[#FDE68A] text-[#92400E] font-semibold cursor-pointer transition-colors ${
              statusFilter === 'In Progress' ? 'ring-1 ring-[#F59E0B]' : 'hover:opacity-90'
            }`}
          >
            <span className="w-1.5 h-1.5 rounded-sm bg-[#F59E0B]"></span>
            <span>In Progress: 19</span>
          </div>

          {/* Not Started Badge */}
          <div
            onClick={() => setStatusFilter(statusFilter === 'Not Started' ? 'ALL' : 'Not Started')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-[#F8FAFC] border border-[#E2E8F0] text-[#475569] font-semibold cursor-pointer transition-colors ${
              statusFilter === 'Not Started' ? 'ring-1 ring-[#94A3B8]' : 'hover:opacity-90'
            }`}
          >
            <span className="w-1.5 h-1.5 rounded-full bg-[#94A3B8]"></span>
            <span>Not Started: 57</span>
          </div>

        </div>

      </div>

      {/* ── Milestones Accordion Cards List ── */}
      <div className="space-y-2">
        {filteredMilestones.length === 0 ? (
          <div className="bg-white rounded-xl p-10 text-center border border-gray-100 text-gray-400 text-sm">
            No milestones or tasks found matching your filters.
          </div>
        ) : (
          filteredMilestones.map((milestone) => {
            const isExpanded = !!expandedMilestones[milestone.id];

            return (
              <div
                key={milestone.id}
                className="bg-white rounded-xl border border-gray-200/80 shadow-sm overflow-hidden transition-all duration-200"
              >
                {/* ── Card Header (Accordion toggle) ── */}
                <div
                  onClick={() => toggleMilestone(milestone.id)}
                  className="flex items-center justify-between px-5 py-3.5 cursor-pointer hover:bg-gray-50/70 transition-colors select-none"
                >
                  <div className="flex flex-wrap items-center gap-2.5">
                    {/* Blue Calendar/Clipboard Icon */}
                    <div className="w-7 h-7 rounded-md bg-[#EFF4FF] flex items-center justify-center text-[#3B82F6]">
                      <ClipboardList size={16} />
                    </div>

                    <span className="text-gray-400 font-medium text-sm">
                      Milestone Name:
                    </span>
                    <span className="font-bold text-gray-900 text-sm">
                      {milestone.name}
                    </span>

                    {/* Milestone status pill badge */}
                    {renderMilestoneStatusBadge(milestone)}
                  </div>

                  {/* Right chevron */}
                  <div className="text-gray-400 pl-2">
                    {isExpanded ? (
                      <ChevronDown size={18} />
                    ) : (
                      <ChevronRight size={18} />
                    )}
                  </div>
                </div>

                {/* ── Card Body / Task Table (when expanded) ── */}
                {isExpanded && (
                  <div className="border-t border-gray-100">
                    <div className="overflow-x-auto relative w-full scrollbar-thin">
                      <table className={`w-full text-left border-collapse text-xs ${isEditing ? 'min-w-[1400px]' : 'min-w-[1260px]'}`}>
                        <thead>
                          <tr className="bg-[#F8F9FB] border-b border-gray-100 text-[#5E6C84] font-bold">
                            {/* Checkbox column - shown only in Edit Mode */}
                            {isEditing && (
                              <th className="py-3 px-3.5 w-8">
                                <input
                                  type="checkbox"
                                  checked={
                                    milestone.tasks.length > 0 &&
                                    milestone.tasks.every((t) => !!selectedTasks[t.id])
                                  }
                                  onChange={(e) =>
                                    toggleSelectAllMilestone(milestone.id, e.target.checked)
                                  }
                                  className="w-3.5 h-3.5 rounded accent-[#856BFF] cursor-pointer"
                                />
                              </th>
                            )}
                            <th className="py-3 px-3.5 whitespace-nowrap">Task ID</th>
                            <th className="py-3 px-3.5 whitespace-nowrap">Task Title</th>
                            <th className="py-3 px-3.5 whitespace-nowrap">Owner</th>
                            <th className="py-3 px-3.5 whitespace-nowrap">Planned Start</th>
                            <th className="py-3 px-3.5 whitespace-nowrap">Planned End</th>
                            <th className="py-3 px-3.5 whitespace-nowrap">Actual Start</th>
                            <th className="py-3 px-3.5 whitespace-nowrap">Actual End</th>
                            <th className="py-3 px-3.5 whitespace-nowrap">Allocation</th>
                            <th className="py-3 px-3.5 whitespace-nowrap">Status</th>
                            {/* All task data columns visible in both View and Edit modes */}
                            <th className="py-3 px-3.5 whitespace-nowrap">Risk Category</th>
                            <th className="py-3 px-3.5 whitespace-nowrap">Remark</th>
                            <th className="py-3 px-3.5 whitespace-nowrap text-[#856BFF]">Role</th>
                            <th className="py-3 px-3.5 whitespace-nowrap text-[#856BFF]">Task Type</th>
                            <th className="py-3 px-3.5 whitespace-nowrap text-[#856BFF]">Unit</th>
                            {/* Action column - FIXED / STICKY on right in Edit Mode */}
                            {isEditing && (
                              <th className="py-3 px-3.5 whitespace-nowrap text-center sticky right-0 z-20 bg-[#F8F9FB] shadow-[-6px_0_8px_-4px_rgba(0,0,0,0.06)] border-l border-gray-200/80 min-w-[70px] w-[70px]">
                                Action
                              </th>
                            )}
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                          {milestone.tasks.length === 0 ? (
                            <tr>
                              <td
                                colSpan={isEditing ? 16 : 14}
                                className="py-6 text-center text-gray-400 text-xs"
                              >
                                No tasks available for this milestone.
                              </td>
                            </tr>
                          ) : (
                            milestone.tasks.map((task) => (
                              <tr
                                key={task.id}
                                className="group hover:bg-gray-50/70 transition-colors"
                              >
                                {/* Checkbox column - shown only in Edit Mode */}
                                {isEditing && (
                                  <td className="py-3 px-3.5 w-8">
                                    <input
                                      type="checkbox"
                                      checked={!!selectedTasks[task.id]}
                                      onChange={() => toggleSelectTask(task.id)}
                                      className="w-3.5 h-3.5 rounded accent-[#856BFF] cursor-pointer"
                                    />
                                  </td>
                                )}

                                {/* Task ID */}
                                <td className="py-3 px-3.5 font-normal text-gray-500 whitespace-nowrap">
                                  {task.id}
                                </td>

                                {/* Task Title */}
                                <td className="py-3 px-3.5 font-bold text-gray-900 whitespace-nowrap">
                                  {task.title}
                                </td>

                                {/* Owner */}
                                <td className="py-3 px-3.5 text-gray-600 whitespace-nowrap">
                                  {task.owner}
                                </td>

                                {/* Planned Start */}
                                <td className="py-3 px-3.5 text-gray-600 whitespace-nowrap">
                                  {task.plannedStart}
                                </td>

                                {/* Planned End */}
                                <td className="py-3 px-3.5 text-gray-600 whitespace-nowrap">
                                  {task.plannedEnd}
                                </td>

                                {/* Actual Start */}
                                <td className="py-3 px-3.5 text-gray-600 whitespace-nowrap">
                                  {task.actualStart || '-'}
                                </td>

                                {/* Actual End */}
                                <td className="py-3 px-3.5 text-gray-600 whitespace-nowrap">
                                  {task.actualEnd || '-'}
                                </td>

                                {/* Allocation */}
                                <td className="py-3 px-3.5 font-bold text-gray-900 whitespace-nowrap">
                                  {task.allocation}
                                </td>

                                {/* Status */}
                                <td className="py-3 px-3.5 whitespace-nowrap">
                                  {renderTaskStatusBadge(task.status)}
                                </td>

                                {/* Risk Category */}
                                <td className="py-3 px-3.5 whitespace-nowrap text-gray-700">
                                  {isEditing ? (
                                    <div className="relative inline-block">
                                      <select
                                        value={task.riskCategory || 'No Dependency'}
                                        onChange={(e) =>
                                          handleRiskCategoryChange(milestone.id, task.id, e.target.value)
                                        }
                                        className="appearance-none bg-white hover:bg-gray-50 border border-gray-200 rounded px-2.5 py-1 pr-6 text-xs text-gray-700 font-medium cursor-pointer outline-none focus:border-[#856BFF]"
                                      >
                                        <option value="No Dependency">No Dependency</option>
                                        <option value="Low Dependency">Low Dependency</option>
                                        <option value="Medium Risk">Medium Risk</option>
                                        <option value="High Risk">High Risk</option>
                                        <option value="Blocked">Blocked</option>
                                      </select>
                                      <ChevronDown
                                        size={12}
                                        className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"
                                      />
                                    </div>
                                  ) : (
                                    <div className="inline-flex items-center gap-1.5 text-gray-700 font-normal">
                                      <span>{task.riskCategory || 'No Dependency'}</span>
                                      <ChevronDown size={12} className="text-gray-400" />
                                    </div>
                                  )}
                                </td>

                                {/* Remark */}
                                <td className="py-3 px-3.5 whitespace-nowrap">
                                  {isEditing ? (
                                    <input
                                      type="text"
                                      value={task.remark || ''}
                                      placeholder="Add remark..."
                                      onChange={(e) =>
                                        handleRemarkChange(milestone.id, task.id, e.target.value)
                                      }
                                      className="bg-white hover:bg-gray-50 focus:bg-white border border-transparent hover:border-gray-200 focus:border-[#856BFF] rounded px-2 py-1 text-xs text-gray-700 outline-none w-32 placeholder-gray-400 transition-colors"
                                    />
                                  ) : (
                                    <span className={task.remark ? "text-gray-700 font-normal" : "text-gray-400"}>
                                      {task.remark || 'Add remark...'}
                                    </span>
                                  )}
                                </td>

                                {/* Role */}
                                <td
                                  onClick={() => isEditing && openEditModal(task, milestone)}
                                  title={isEditing ? "Click to edit task role, type & unit" : undefined}
                                  className={`py-3 px-3.5 text-gray-700 font-medium whitespace-nowrap ${isEditing ? 'cursor-pointer hover:text-[#856BFF]' : ''}`}
                                >
                                  {getRoleAbbr(task.role)}
                                </td>

                                {/* Task Type */}
                                <td
                                  onClick={() => isEditing && openEditModal(task, milestone)}
                                  title={isEditing ? "Click to edit task role, type & unit" : undefined}
                                  className={`py-3 px-3.5 text-gray-700 font-medium whitespace-nowrap ${isEditing ? 'cursor-pointer hover:text-[#856BFF]' : ''}`}
                                >
                                  {task.taskType || 'Analysis'}
                                </td>

                                {/* Unit */}
                                <td
                                  onClick={() => isEditing && openEditModal(task, milestone)}
                                  title={isEditing ? "Click to edit task role, type & unit" : undefined}
                                  className={`py-3 px-3.5 text-gray-800 font-medium whitespace-nowrap ${isEditing ? 'cursor-pointer hover:text-[#856BFF]' : ''}`}
                                >
                                  {task.unit ?? 12}
                                </td>

                                {/* Action (Edit button) - FIXED STICKY COLUMN */}
                                {isEditing && (
                                  <td className="py-3 px-3.5 text-center whitespace-nowrap sticky right-0 z-10 bg-white group-hover:bg-[#F8F9FB] shadow-[-6px_0_8px_-4px_rgba(0,0,0,0.06)] border-l border-gray-200/80 min-w-[70px] w-[70px]">
                                    <button
                                      type="button"
                                      title="Edit task details"
                                      onClick={() => openEditModal(task, milestone)}
                                      className="p-1.5 rounded hover:bg-purple-50 text-[#856BFF] transition-colors cursor-pointer bg-transparent border-none inline-flex items-center justify-center"
                                    >
                                      <Pencil size={15} />
                                    </button>
                                  </td>
                                )}
                              </tr>
                            ))
                          )}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>

      {/* ── Bottom Pagination Bar ── */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 px-2 py-4 text-xs text-gray-500">
        <div>
          Showing{' '}
          <span className="font-bold text-gray-800">
            {totalFilteredTasks === 0
              ? '0'
              : `${(currentPage - 1) * pageSize + 1}-${Math.min(
                  currentPage * pageSize,
                  totalFilteredTasks
                )}`}
          </span>{' '}
          of <span className="font-bold text-gray-800">{totalTasksCount}</span> tasks
        </div>

        {/* Pagination buttons */}
        <div className="flex items-center gap-1.5">
          <button
            onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
            disabled={currentPage === 1}
            className="w-7 h-7 flex items-center justify-center rounded-lg border border-gray-200 text-gray-500 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors cursor-pointer bg-white"
          >
            <ChevronLeft size={14} />
          </button>

          <button
            onClick={() => setCurrentPage(1)}
            className={`w-7 h-7 flex items-center justify-center rounded-lg font-bold text-xs transition-colors cursor-pointer border-none ${
              currentPage === 1
                ? 'bg-[#856BFF] text-white'
                : 'text-gray-600 hover:bg-gray-100 bg-transparent'
            }`}
          >
            1
          </button>

          <button
            onClick={() => setCurrentPage(2)}
            className={`w-7 h-7 flex items-center justify-center rounded-lg font-bold text-xs transition-colors cursor-pointer border-none ${
              currentPage === 2
                ? 'bg-[#856BFF] text-white'
                : 'text-gray-600 hover:bg-gray-100 bg-transparent'
            }`}
          >
            2
          </button>

          <button
            onClick={() => setCurrentPage(3)}
            className={`w-7 h-7 flex items-center justify-center rounded-lg font-bold text-xs transition-colors cursor-pointer border-none ${
              currentPage === 3
                ? 'bg-[#856BFF] text-white'
                : 'text-gray-600 hover:bg-gray-100 bg-transparent'
            }`}
          >
            3
          </button>

          <span className="px-1 text-gray-400">...</span>

          <button
            onClick={() => setCurrentPage((p) => p + 1)}
            disabled={currentPage * pageSize >= totalFilteredTasks}
            className="w-7 h-7 flex items-center justify-center rounded-lg border border-gray-200 text-gray-500 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors cursor-pointer bg-white"
          >
            <ChevronRight size={14} />
          </button>
        </div>
      </div>

      {/* ── Footer Actions (shown only in Edit mode) ── */}
      {isEditing && (
        <div className="flex items-center justify-end gap-4 mt-4 pt-4 border-t border-gray-100">
          <button
            type="button"
            id="task-info-cancel-btn"
            onClick={onCancel}
            className="px-4 py-2 text-sm font-medium text-gray-500 hover:text-gray-800 transition-colors cursor-pointer bg-transparent border-none"
          >
            Cancel
          </button>
          <button
            type="button"
            id="task-info-next-btn"
            onClick={onNext}
            className="flex items-center gap-1.5 px-6 py-2.5 bg-[#856BFF] hover:bg-[#7354fd] text-white text-sm font-semibold rounded-lg shadow-sm transition-colors cursor-pointer border-none"
          >
            <span>Next:</span>
            <ArrowRight size={16} />
          </button>
        </div>
      )}

      {/* ── Edit Task Details Slide-Over Section (Right Side of Screen, Optimized for 100% Zoom) ── */}
      {editingTask && (
        <div className="fixed inset-0 z-50 overflow-hidden" role="dialog" aria-modal="true">
          {/* Subtle backdrop overlay (transparent enough to keep the entire web screen visible) */}
          <div
            className="fixed inset-0 bg-black/15 transition-opacity duration-200"
            onClick={() => setEditingTask(null)}
            aria-hidden="true"
          />

          {/* Right-docked slide-over panel */}
          <div className="fixed inset-y-0 right-0 max-w-full flex pointer-events-none z-50">
            <div className="w-screen max-w-[430px] bg-white shadow-[-12px_0_35px_rgba(0,0,0,0.12)] border-l border-gray-200 flex flex-col h-full pointer-events-auto animate-in slide-in-from-right duration-200">
              
              {/* Header (fixed at top) */}
              <div className="flex-shrink-0 px-5 py-2 border-b border-gray-100 bg-white">
                <div className="flex items-center justify-between">
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md text-xs font-bold bg-[#F4F0FF] text-[#7C5CFC]">
                    <RotateCw size={12} className="text-[#7C5CFC]" />
                    {editingTask.id}
                  </span>
                  <button
                    type="button"
                    onClick={() => setEditingTask(null)}
                    className="text-gray-400 hover:text-gray-600 hover:bg-gray-100 p-1.5 rounded-lg transition-colors cursor-pointer bg-transparent border-none"
                    aria-label="Close"
                  >
                    <X size={18} />
                  </button>
                </div>

                <h2 className="text-lg font-bold text-gray-900 mt-1 mb-0.5">
                  Edit Task Details
                </h2>
                <p className="text-xs font-medium text-gray-500 m-0 truncate">
                  Milestone: {editingTask.milestoneName || 'Planning & Initiation'} &bull; {projName} ({pmsId})
                </p>
              </div>

              {/* Scrollable Content Body (Compactly optimized for 100% zoom) */}
              <div className="flex-1 overflow-y-auto px-5 py-2.5 space-y-2.5 scrollbar-thin">
                {/* Read-only Info Card */}
                <div className="bg-[#F8F9FE] border border-[#EDE9FE]/80 rounded-xl p-2.5 text-xs">
                  <div className="grid grid-cols-2 gap-x-3 gap-y-1">
                    <div>
                      <div className="text-[11px] font-medium text-gray-400">Milestone</div>
                      <div className="text-[12.5px] font-bold text-gray-900 mt-0.5 leading-snug">
                        {editingTask.phase || 'Phase 1: Discovery'}
                      </div>
                    </div>
                    <div>
                      <div className="text-[11px] font-medium text-gray-400">Task Title</div>
                      <div className="text-[12.5px] font-bold text-gray-900 mt-0.5 leading-snug">
                        {editingTask.title}
                      </div>
                    </div>

                    <div>
                      <div className="text-[11px] font-medium text-gray-400">Task Owner</div>
                      <div className="text-[12.5px] font-bold text-gray-900 mt-0.5 leading-snug">
                        {editingTask.ownerFull || 'Sarah Jenkins'}
                      </div>
                    </div>
                    <div>
                      <div className="text-[11px] font-medium text-gray-400">Status</div>
                      <div className="text-[12.5px] font-bold text-gray-900 mt-0.5 leading-snug">
                        {editingTask.status}
                      </div>
                    </div>

                    <div>
                      <div className="text-[11px] font-medium text-gray-400">Planned Start</div>
                      <div className="text-[12.5px] font-bold text-gray-900 mt-0.5 leading-snug">
                        {editingTask.plannedStart}
                      </div>
                    </div>
                    <div>
                      <div className="text-[11px] font-medium text-gray-400">Actual Start</div>
                      <div className="text-[12.5px] font-bold text-gray-900 mt-0.5 leading-snug">
                        {editingTask.actualStart || '-'}
                      </div>
                    </div>

                    <div>
                      <div className="text-[11px] font-medium text-gray-400">Planned End</div>
                      <div className="text-[12.5px] font-bold text-gray-900 mt-0.5 leading-snug">
                        {editingTask.plannedEnd}
                      </div>
                    </div>
                    <div>
                      <div className="text-[11px] font-medium text-gray-400">Actual End</div>
                      <div className="text-[12.5px] font-bold text-gray-900 mt-0.5 leading-snug">
                        {editingTask.actualEnd || '-'}
                      </div>
                    </div>

                    <div>
                      <div className="text-[11px] font-medium text-gray-400">Risk Category</div>
                      <div className="text-[12.5px] font-bold text-gray-900 mt-0.5 leading-snug">
                        {editingTask.riskCategory || '--'}
                      </div>
                    </div>
                    <div></div>

                    <div className="col-span-2">
                      <div className="text-[11px] font-medium text-gray-400">Remark</div>
                      <div className="text-[12.5px] font-bold text-gray-900 mt-0.5 leading-snug">
                        {editingTask.remark || 'Completed ahead of schedule.'}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Form Fields */}
                <form id="edit-task-details-form" onSubmit={handleSaveEditedTask} className="space-y-2">
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1">Role</label>
                    <div className="relative">
                      <select
                        value={editFormData.role}
                        onChange={(e) => setEditFormData({ ...editFormData, role: e.target.value })}
                        className="w-full appearance-none px-3 py-1.5 border border-gray-300 rounded-lg text-xs text-gray-900 bg-white outline-none focus:border-[#856BFF] focus:ring-1 focus:ring-[#856BFF] cursor-pointer"
                      >
                        <option value="Business Analyst">Business Analyst</option>
                        <option value="Lead">Lead</option>
                        <option value="Frontend Developer">Frontend Developer</option>
                        <option value="Backend Developer">Backend Developer</option>
                        <option value="UI/UX Designer">UI/UX Designer</option>
                        <option value="QA Engineer">QA Engineer</option>
                        <option value="Project Manager">Project Manager</option>
                        <option value="DevOps Engineer">DevOps Engineer</option>
                      </select>
                      <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1">Task Type</label>
                    <div className="relative">
                      <select
                        value={editFormData.taskType}
                        onChange={(e) => setEditFormData({ ...editFormData, taskType: e.target.value })}
                        className="w-full appearance-none px-3 py-1.5 border border-gray-300 rounded-lg text-xs text-gray-900 bg-white outline-none focus:border-[#856BFF] focus:ring-1 focus:ring-[#856BFF] cursor-pointer"
                      >
                        <option value="Analysis">Analysis</option>
                        <option value="Development">Development</option>
                        <option value="Design">Design</option>
                        <option value="Testing">Testing</option>
                        <option value="Review">Review</option>
                        <option value="Deployment">Deployment</option>
                        <option value="Documentation">Documentation</option>
                        <option value="Meeting">Meeting</option>
                        <option value="Planning">Planning</option>
                        <option value="Infra">Infra</option>
                        <option value="Security">Security</option>
                      </select>
                      <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1">Unit</label>
                    <input
                      type="text"
                      value={editFormData.unit}
                      onChange={(e) => setEditFormData({ ...editFormData, unit: e.target.value })}
                      className="w-full px-3 py-1.5 border border-gray-300 rounded-lg text-xs text-gray-900 bg-white outline-none focus:border-[#856BFF] focus:ring-1 focus:ring-[#856BFF]"
                    />
                  </div>
                </form>
              </div>

              {/* Fixed Footer (Always 100% visible at bottom, never cut off!) */}
              <div className="flex-shrink-0 px-5 py-2 bg-white border-t border-gray-100 flex items-center justify-end gap-3 shadow-[0_-2px_10px_rgba(0,0,0,0.03)]">
                <button
                  type="button"
                  onClick={() => setEditingTask(null)}
                  className="px-5 py-2 rounded-lg border border-gray-300 text-xs font-semibold text-gray-700 hover:bg-gray-50 transition-colors cursor-pointer bg-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  form="edit-task-details-form"
                  className="px-6 py-2 rounded-lg bg-[#856BFF] hover:bg-[#7354fd] text-xs font-semibold text-white transition-colors cursor-pointer border-none shadow-sm"
                >
                  Save
                </button>
              </div>

            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default TaskInfoTab;
