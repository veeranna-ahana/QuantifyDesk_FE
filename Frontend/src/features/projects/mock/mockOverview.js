// Project overview (summary tab) mock. Shape = future API response.

export const OVERVIEW_SUMMARY = {
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

export const OVERVIEW_TEAM = [
  { name: 'Rahul Sharma', tasks: 8, logged: '48h', done: 7, pending: 1 },
  { name: 'Priya Patel', tasks: 6, logged: '38h', done: 5, pending: 1 },
  { name: 'Anand Krishnan', tasks: 4, logged: '25h', done: 3, pending: 1 },
  { name: 'Sunita Reddy', tasks: 3, logged: '12h', done: 2, pending: 1 },
  { name: 'Vikram Singh', tasks: 2, logged: '11h', done: 2, pending: 0 },
  { name: 'Meera Iyer', tasks: 2, logged: '9h', done: 1, pending: 1 },
];

export const OVERVIEW_ALLOCATION = [
  { member: 'Rahul Sharma', role: 'Backend Developer', units: 20, tasks: 8, completed: 7, pending: 1, allocHours: '40h', loggedHours: '48h', variance: '+20%', overrun: true, progress: 88, status: 'Over Utilized' },
  { member: 'Priya Patel', role: 'Frontend Lead', units: 32, tasks: 6, completed: 5, pending: 1, allocHours: '32h', loggedHours: '38h', variance: '+18%', overrun: true, progress: 83, status: 'Over Utilized' },
  { member: 'Anand Krishnan', role: 'Data Engineer', units: 15, tasks: 4, completed: 3, pending: 1, allocHours: '24h', loggedHours: '25h', variance: '+4%', overrun: true, progress: 75, status: 'Optimally Used' },
  { member: 'Sunita Reddy', role: 'DevOps', units: 10, tasks: 3, completed: 2, pending: 1, allocHours: '16h', loggedHours: '12h', variance: '-25%', overrun: false, progress: 67, status: 'Under Utilized' },
  { member: 'Vikram Singh', role: 'Backend', units: 8, tasks: 2, completed: 2, pending: 0, allocHours: '12h', loggedHours: '11h', variance: '-8%', overrun: false, progress: 100, status: 'Optimally Used' },
  { member: 'Meera Iyer', role: 'Frontend', units: 6, tasks: 2, completed: 1, pending: 1, allocHours: '8h', loggedHours: '9h', variance: '+12%', overrun: true, progress: 50, status: 'Over Utilized' },
];
