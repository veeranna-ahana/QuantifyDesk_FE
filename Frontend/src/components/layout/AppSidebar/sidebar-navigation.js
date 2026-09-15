// src/components/layout/AppSidebar/sidebar-navigation.js
// Navigation config extracted from the sidebar component.
// Mirrors the pattern in @UI/src/components/layout/AppSidebar/sidebar-navigation.ts

/**
 * @typedef {Object} SidebarNavItemConfig
 * @property {string} label
 * @property {string} icon  - icon name key used by the Icon renderer
 * @property {string} [to]  - route path (absent for parent-only items)
 * @property {SidebarNavItemConfig[]} [children]
 */

/**
 * Role-based navigation map.
 * Keys match the normalised role string: "Admin" | "Manager" | "Employee"
 *
 * @type {Record<string, SidebarNavItemConfig[]>}
 */
export const ROLE_NAVIGATION = {
  Admin: [
    { to: '/quantificationnew', label: 'Utilization', icon: 'utilization' },
    {
      label: 'Reconciliation',
      icon: 'reconciliation',
      to: '/reconciliation',
      children: [
        { to: '/reconciliation/upload',    label: 'Timesheet Upload', icon: 'timesheetUpload' },
        { to: '/reconciliation/dashboard', label: 'Recon Dashboard',  icon: 'reconDash'       },
      ],
    },
    { to: '/dailyreport',  label: 'Daily Report',    icon: 'dailyReport'    },
    { to: '/projects',     label: 'Projects',         icon: 'projects'       },
    { to: '/assignments',  label: 'Task Allocation',  icon: 'taskAllocation' },
    { to: '/users',        label: 'Employee',         icon: 'employee'       },
  ],

  Manager: [
    { to: '/quantificationnew', label: 'Utilization', icon: 'utilization' },
    {
      label: 'Reconciliation',
      icon: 'reconciliation',
      to: '/reconciliation',
      children: [
        { to: '/reconciliation/upload',    label: 'Timesheet Upload', icon: 'timesheetUpload' },
        { to: '/reconciliation/dashboard', label: 'Recon Dashboard',  icon: 'reconDash'       },
      ],
    },
    { to: '/dailyreport', label: 'Daily Report',   icon: 'dailyReport'    },
    { to: '/projects',    label: 'Projects',        icon: 'projects'       },
    { to: '/assignments', label: 'Task Allocation', icon: 'taskAllocation' },
  ],

  Employee: [
    { to: '/my-work',     label: 'My Work',     icon: 'myWork'      },
    { to: '/dailyreport', label: 'Daily Report', icon: 'dailyReport' },
  ],
};
