// Navigation config (icon keys are resolved to lucide icons in AppSidebar).
// Reference design: Dashboard, Projects, Daily Report.

/**
 * @typedef {Object} SidebarNavItemConfig
 * @property {string} label
 * @property {string} icon  - key resolved by AppSidebar (dashboard | projects | dailyReport)
 * @property {string} to    - route path
 * @property {SidebarNavItemConfig[]} [children] - nested navigation links
 */

const CORE_NAV = [
  { to: '/dashboard', label: 'Dashboard', icon: 'dashboard' },
  { to: '/projects', label: 'Projects', icon: 'projects' },
  { to: '/dailyreport', label: 'Daily Report', icon: 'dailyReport' },
  { to: '/guideline', label: 'Guideline', icon: 'guideline' },
  {
    label: 'Reports',
    icon: 'reports',
    children: [
      { to: '/reports/timesheet', label: 'Timesheet Report', icon: 'timesheet' },
      { to: '/reports/project-document-checklist', label: 'Project Document Checklist', icon: 'documentChecklist' },
    ],
  },
];

/** @type {Record<string, SidebarNavItemConfig[]>} */
export const ROLE_NAVIGATION = {
  Admin: CORE_NAV,
  Manager: CORE_NAV,
  Employee: CORE_NAV,
};
