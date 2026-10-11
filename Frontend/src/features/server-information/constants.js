// src/features/server-information/constants.js

export const ENVIRONMENT_OPTIONS = [
  'Production',
  'UAT',
  'QA',
  'Development',
];

export const STATUS_OPTIONS = [
  'Active',
  'Maintenance',
  'Not Active',
];

export const OS_OPTIONS = [
  'Linux (Ubuntu / RHEL / Debian)',
  'Ubuntu 22.04 LTS',
  'Ubuntu 20.04 LTS',
  'Debian 12',
  'CentOS Stream 9',
  'Red Hat Enterprise Linux 9',
  'Amazon Linux 2023',
  'Windows Server 2022',
  'Windows Server 2019',
];

export const ASSIGNED_PROJECT_OPTIONS = [
  'PMS Project',
  'WPT Project',
  'FMS Project',
  'QD Project',
  'Recon Project',
];

/** Returns an empty server form state (used for Add flow). */
export const EMPTY_SERVER_FORM = {
  serverName: '',
  ipAddress: '',
  ram: '',
  cpu: '',
  storage: '',
  os: 'Linux (Ubuntu / RHEL / Debian)',
  environment: 'Production',
  gpu: '',
  status: 'Active',
  assignedProjects: ['FMS Project', 'WPT Project'],
  description: '',
};
