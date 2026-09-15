// src/components/layout/AppSidebar/sidebar-navigation.js
// Navigation config extracted from the sidebar component.
// Mirrors the reference design: Dashboard, Projects, Daily Report

/**
 * @typedef {Object} SidebarNavItemConfig
 * @property {string} label
 * @property {string} icon  - icon name key used by the Icon renderer
 * @property {string} [to]  - route path (absent for parent-only items)
 * @property {SidebarNavItemConfig[]} [children]
 */

/**
 * Role-based navigation map.
 * In accordance with the reference design, only the core 3 navigation items are shown.
 *
 * @type {Record<string, SidebarNavItemConfig[]>}
 */
export const ROLE_NAVIGATION = {
  Admin: [
    { to: '/dashboard',   label: 'Dashboard',    icon: 'dashboard'   },
    { to: '/projects',    label: 'Projects',     icon: 'projects'    },
    { to: '/dailyreport', label: 'Daily Report', icon: 'dailyReport' },
  ],

  Manager: [
    { to: '/dashboard',   label: 'Dashboard',    icon: 'dashboard'   },
    { to: '/projects',    label: 'Projects',     icon: 'projects'    },
    { to: '/dailyreport', label: 'Daily Report', icon: 'dailyReport' },
  ],

  Employee: [
    { to: '/dashboard',   label: 'Dashboard',    icon: 'dashboard'   },
    { to: '/projects',    label: 'Projects',     icon: 'projects'    },
    { to: '/dailyreport', label: 'Daily Report', icon: 'dailyReport' },
  ],
};
