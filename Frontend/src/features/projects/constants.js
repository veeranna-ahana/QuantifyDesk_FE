// Shared option lists and constants for the projects feature.

export const HRS_PER_DAY = 8;

export const ROLE_OPTIONS = ['Business Analyst', 'Developer', 'QA Engineer', 'Project Manager', 'DevOps Engineer', 'Designer'];
export const TASK_TYPE_OPTIONS = ['Analysis', 'Development', 'Testing', 'Review', 'Deployment', 'Design'];

export const PROJECT_TYPE_OPTIONS = ['One Time Project', 'Managed Service', 'Staff Augmentation', 'Retainer', 'Milestone-Based'];
export const PROJECT_STATUS_OPTIONS = ['Completed', 'In Progress', 'On Hold', 'Not Started'];

export const WIZARD_STEPS = [
  { id: 1, label: 'Project Info' },
  { id: 2, label: 'Task Info' },
  { id: 3, label: 'Effort Estimate' },
  { id: 4, label: 'Document Checklist' },
];

export const DETAIL_TABS = [
  { id: 'Project Overview', label: 'Project Overview' },
  { id: 'Project Info', label: 'Project Info' },
  { id: 'Task Info', label: 'Task Info' },
  { id: 'Effort Details', label: 'Effort Details' },
  { id: 'Documents Checklist', label: 'Documents Checklist' },
  { id: 'Timesheet Data', label: 'Timesheet Data' },
];
