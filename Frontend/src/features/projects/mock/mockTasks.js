// src/features/projects/mock/mockTasks.js
// Mock milestone + task data for the Task Info step of Import Project

export const MOCK_PROJECT_CONTEXT = {
  projectName: 'FMS',
  pmsId: 'PMS-9021',
};

const TASK_STATUS = {
  COMPLETED: 'Completed',
  IN_PROGRESS: 'In Progress',
  NOT_STARTED: 'Not Started',
};

const TASK_TYPES = ['Analysis', 'Development', 'Testing', 'Review', 'Deployment'];
const ROLES      = ['BA', 'Dev', 'QA', 'PM', 'DevOps'];
const OWNER      = 'Sarah J.';

/** Build deterministic task rows for a milestone */
function buildTasks(prefix, count, status, startOffset = 0) {
  return Array.from({ length: count }, (_, i) => {
    const id = prefix + '-' + String(1024 + i + startOffset).padStart(4, '0');
    return {
      id,
      taskId: 'T-' + String(1024 + i + startOffset),
      title: [
        'Requirements Gathering',
        'GIT Repo Creation',
        'Prepare UI wireframes',
        'Design DB schema & versioning',
        'Swagger API Definitions',
        'DB & API Definition Review',
        'Sprint Planning',
        'Unit Testing Setup',
        'CI/CD Pipeline',
        'Code Review Cycle',
        'Bug Fix Pass',
        'Security Audit',
        'Deployment Scripts',
        'Smoke Testing',
        'Performance Tuning',
        'User Acceptance Testing',
      ][i % 16],
      owner: OWNER,
      plannedStart: '10/01/24',
      plannedEnd:   '10/15/24',
      actualStart:  '10/01/24',
      actualEnd:    status === TASK_STATUS.COMPLETED ? '10/14/24' : null,
      allocation:   status === TASK_STATUS.COMPLETED ? '100%' : (status === TASK_STATUS.IN_PROGRESS ? '60%' : '0%'),
      status,
      riskCategory: 'No Dependency',
      remark:       '',
      role:         ROLES[i % ROLES.length],
      taskType:     TASK_TYPES[i % TASK_TYPES.length],
      unit:         String(70 + (i * 13) % 60),
    };
  });
}

export const MOCK_MILESTONES = [
  {
    id: 'M1',
    name: 'Planning & Initiation',
    totalTasks: 12,
    completedTasks: 12,
    status: TASK_STATUS.COMPLETED,
    statusText: 'Completed (12/12) • 100%',
    tasks: buildTasks('T', 6, TASK_STATUS.COMPLETED, 0),
  },
  {
    id: 'M2',
    name: 'Authentication & Authorization',
    totalTasks: 12,
    completedTasks: 12,
    status: TASK_STATUS.COMPLETED,
    statusText: 'Completed (12/12) • 100%',
    tasks: buildTasks('T', 12, TASK_STATUS.COMPLETED, 12),
  },
  {
    id: 'M3',
    name: 'Add/Update Entry & Logged Calls',
    totalTasks: 12,
    completedTasks: 12,
    status: TASK_STATUS.COMPLETED,
    statusText: 'Completed (12/12) • 100%',
    tasks: buildTasks('T', 12, TASK_STATUS.COMPLETED, 24),
  },
  {
    id: 'M4',
    name: 'Backdated Entry , Transfer & Report',
    totalTasks: 16,
    completedTasks: 11,
    status: TASK_STATUS.IN_PROGRESS,
    statusText: 'In Progress (11/16) • 69%',
    tasks: buildTasks('T', 16, TASK_STATUS.IN_PROGRESS, 36),
  },
  {
    id: 'M5',
    name: 'Dashboard & Archive',
    totalTasks: 16,
    completedTasks: 11,
    status: TASK_STATUS.IN_PROGRESS,
    statusText: 'In Progress (11/16) • 69%',
    tasks: buildTasks('T', 16, TASK_STATUS.IN_PROGRESS, 52),
  },
  {
    id: 'M6',
    name: 'Cron Script',
    totalTasks: 10,
    completedTasks: 0,
    status: TASK_STATUS.NOT_STARTED,
    statusText: 'Not Started (0/10) • 0%',
    tasks: buildTasks('T', 10, TASK_STATUS.NOT_STARTED, 68),
  },
  {
    id: 'M7',
    name: 'QA Testing & Debugging',
    totalTasks: 10,
    completedTasks: 0,
    status: TASK_STATUS.NOT_STARTED,
    statusText: 'Not Started (0/10) • 0%',
    tasks: buildTasks('T', 10, TASK_STATUS.NOT_STARTED, 78),
  },
  {
    id: 'M8',
    name: 'UAT & Deployment',
    totalTasks: 10,
    completedTasks: 0,
    status: TASK_STATUS.NOT_STARTED,
    statusText: 'Not Started (0/10) • 0%',
    tasks: buildTasks('T', 10, TASK_STATUS.NOT_STARTED, 88),
  },
];

// Summary counts derived from milestones
export const MOCK_TASK_SUMMARY = (() => {
  let total = 0, completed = 0, inProgress = 0, notStarted = 0;
  let milestoneCompleted = 0;
  MOCK_MILESTONES.forEach((m) => {
    total      += m.totalTasks;
    completed  += m.completedTasks;
    inProgress += m.tasks.filter(t => t.status === TASK_STATUS.IN_PROGRESS).length;
    notStarted += m.tasks.filter(t => t.status === TASK_STATUS.NOT_STARTED).length;
    if (m.status === TASK_STATUS.COMPLETED) milestoneCompleted++;
  });
  return {
    totalMilestones: MOCK_MILESTONES.length,
    milestonesCompleted: milestoneCompleted,
    totalTasks: total,
    completed,
    inProgress,
    notStarted,
  };
})();
