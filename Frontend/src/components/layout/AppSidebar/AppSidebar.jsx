// src/components/layout/AppSidebar/AppSidebar.jsx
import React, { useState } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { useSelector } from 'react-redux';
import Cookies from 'js-cookie';

import logo from '@/assets/images/ahana.png';
import { ROLE_NAVIGATION } from './sidebar-navigation';

// ── SVG Icon Renderer ──────────────────────────────────────────────────────────
const Icon = ({ name, size = 20, className = '' }) => {
  switch (name) {
    case 'dashboard':
      return (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className={className}>
          <rect x="3" y="3" width="7" height="7" rx="1.5" />
          <rect x="14" y="3" width="7" height="7" rx="1.5" />
          <rect x="14" y="14" width="7" height="7" rx="1.5" />
          <rect x="3" y="14" width="7" height="7" rx="1.5" />
        </svg>
      );
    case 'utilization':
      return (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
          <path d="M18 20V10 M12 20V4 M6 20v-6" />
        </svg>
      );
    case 'reconciliation':
      return (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
          <rect x="3" y="3" width="7" height="7" rx="1" />
          <rect x="14" y="3" width="7" height="7" rx="1" />
          <rect x="14" y="14" width="7" height="7" rx="1" />
          <rect x="3" y="14" width="7" height="7" rx="1" />
        </svg>
      );
    case 'timesheetUpload':
      return (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
          <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
          <polyline points="14 2 14 8 20 8" />
          <polyline points="9 15 12 12 15 15" />
          <line x1="12" y1="12" x2="12" y2="19" />
        </svg>
      );
    case 'reconDash':
      return (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
          <rect x="3" y="3" width="7" height="7" />
          <rect x="14" y="3" width="7" height="7" />
          <rect x="14" y="14" width="7" height="7" />
          <rect x="3" y="14" width="7" height="7" />
        </svg>
      );
    case 'dailyReport':
    case 'dailyUpdate':
      return (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className={className}>
          <rect x="5" y="4" width="14" height="17" rx="2" />
          <path d="M9 2h6a1 1 0 0 1 1 1v1H8V3a1 1 0 0 1 1-1z" />
          <path d="m9 13 2 2 4-4" />
        </svg>
      );
    case 'projects':
      return (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className={className}>
          <rect x="3" y="3" width="18" height="18" rx="2" />
          <line x1="8" y1="9" x2="8" y2="15" />
          <line x1="12" y1="7" x2="12" y2="17" />
          <line x1="16" y1="10" x2="16" y2="14" />
        </svg>
      );
    case 'taskAllocation':
    case 'assignments':
      return (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className={className}>
          <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2" />
          <rect x="8" y="2" width="8" height="4" rx="1" ry="1" />
          <path d="m9 14 2 2 4-4" />
        </svg>
      );
    case 'employee':
    case 'users':
      return (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className={className}>
          <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
          <circle cx="9" cy="7" r="4" />
          <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
          <path d="M16 3.13a4 4 0 0 1 0 7.75" />
        </svg>
      );
    case 'myWork':
      return (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className={className}>
          <circle cx="12" cy="12" r="10" />
          <polyline points="12 6 12 12 16 14" />
        </svg>
      );
    default:
      return null;
  }
};

// ── Sub-menu (collapsible) ─────────────────────────────────────────────────────
const SubMenu = ({ label, icon, children }) => {
  const location = useLocation();
  const isChildActive = children.some((c) => location.pathname.startsWith(c.to));
  const [open, setOpen] = useState(true);

  return (
    <div className="w-full flex flex-col">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className={[
          'sidebar-nav-item',
          isChildActive ? 'font-medium text-[#434655]' : '',
        ].join(' ')}
        style={{ border: 'none', background: 'transparent', cursor: 'pointer' }}
      >
        <span className="sidebar-nav-item-icon">
          <Icon name={icon} size={18} />
        </span>
        <span className="sidebar-nav-item-label">{label}</span>
        <svg
          width="12"
          height="12"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          className={[
            'sidebar-parent-toggle-icon',
            open ? 'sidebar-parent-toggle-icon-expanded' : '',
          ].join(' ')}
        >
          <path d="M9 18l6-6-6-6" />
        </svg>
      </button>

      {open && (
        <div className="sidebar-sub-navigation">
          {children.map((c) => (
            <NavLink
              key={c.to}
              to={c.to}
              className={({ isActive }) =>
                [
                  'sidebar-nav-item',
                  'sidebar-nav-item-sub',
                  isActive ? 'sidebar-nav-item-active' : '',
                ].join(' ')
              }
            >
              {({ isActive }) => (
                <>
                  <span className="sidebar-nav-item-icon">
                    <Icon name={c.icon} size={18} />
                  </span>
                  <span className="sidebar-nav-item-label">{c.label}</span>
                </>
              )}
            </NavLink>
          ))}
        </div>
      )}
    </div>
  );
};

// ── Main Sidebar Component ─────────────────────────────────────────────────────
export function AppSidebar() {
  const reduxUser = useSelector((state) => state.auth?.user);

  let user = reduxUser;
  if (!user) {
    try {
      user = JSON.parse(Cookies.get('user') || 'null');
    } catch {
      user = null;
    }
  }

  // Normalise role string to match ROLE_NAVIGATION keys
  const rawRole = user?.role || localStorage.getItem('role') || 'Employee';
  const roleMap = { ADMIN: 'Admin', MANAGER: 'Manager', EMPLOYEE: 'Employee' };
  const userRole = roleMap[rawRole] ?? rawRole;

  const links = ROLE_NAVIGATION[userRole] ?? ROLE_NAVIGATION.Employee;

  const location = useLocation();

  return (
    <aside className="sidebar">
      {/* ── Logo ── */}
      <div className="sidebar-brand">
        <img src={logo} alt="Ahana" className="sidebar-logo" />
      </div>

      {/* ── Navigation ── */}
      <nav aria-label="Primary navigation" className="sidebar-navigation">
        {links.map((item) =>
          item.children ? (
            <SubMenu
              key={item.label}
              label={item.label}
              icon={item.icon}
              children={item.children}
            />
          ) : (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                [
                  'sidebar-nav-item',
                  isActive || location.pathname.startsWith(item.to)
                    ? 'sidebar-nav-item-active'
                    : '',
                ].join(' ')
              }
            >
              {({ isActive }) => {
                const active = isActive || location.pathname.startsWith(item.to);
                return (
                  <>
                    <span className="sidebar-nav-item-icon">
                      <Icon name={item.icon} size={20} />
                    </span>
                    <span className="sidebar-nav-item-label">{item.label}</span>
                  </>
                );
              }}
            </NavLink>
          )
        )}
      </nav>
    </aside>
  );
}

export default AppSidebar;
