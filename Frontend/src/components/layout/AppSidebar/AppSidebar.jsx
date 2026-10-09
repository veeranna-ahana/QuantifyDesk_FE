import { ChevronDown, ClipboardClock, Clock3, FileCheck2, FileText, FolderKanban, LayoutDashboard, BookOpen } from 'lucide-react';
import Cookies from 'js-cookie';
import { NavLink, useLocation } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { useState } from 'react';

import logo from '@/assets/images/ahana.png';
import { cn } from '@/lib/cn';

import { ROLE_NAVIGATION } from './sidebar-navigation';

const ICONS = {
  dashboard: LayoutDashboard,
  projects: FolderKanban,
  dailyReport: ClipboardClock, guideline: BookOpen,
  reports: FileText,
  timesheet: Clock3,
  documentChecklist: FileCheck2,
};

/** Fixed sidebar on desktop; slides in over the page on small screens. */
export function AppSidebar({ open = false, onNavigate }) {
  const reduxUser = useSelector((state) => state.auth?.user);
  const { pathname } = useLocation();
  const [reportsExpanded, setReportsExpanded] = useState(
    pathname.startsWith('/reports'),
  );

  let user = reduxUser;
  if (!user) {
    try { user = JSON.parse(Cookies.get('user') || 'null'); } catch { user = null; }
  }

  const rawRole = user?.role || localStorage.getItem('role') || 'Employee';
  const roleMap = { ADMIN: 'Admin', MANAGER: 'Manager', EMPLOYEE: 'Employee' };
  const links = ROLE_NAVIGATION[roleMap[rawRole] ?? rawRole] ?? ROLE_NAVIGATION.Employee;

  return (
    <aside
      className={cn(
        'fixed inset-y-0 left-0 z-40 flex w-sidebar shrink-0 flex-col border-r border-line bg-surface-card transition-transform',
        'lg:static lg:translate-x-0',
        open ? 'translate-x-0' : '-translate-x-full',
      )}
    >
      <div className="flex h-[78px] shrink-0 items-center justify-center border-b border-line px-6">
        <img src={logo} alt="Ahana" className="h-12 w-auto max-w-full object-contain" />
      </div>

      <nav aria-label="Primary navigation" className="flex flex-1 flex-col gap-1 overflow-y-auto p-3">
        {links.map((item) => {
          const Icon = ICONS[item.icon];
          if (item.children) {
            return (
              <div key={item.label}>
                <button
                  type="button"
                  aria-expanded={reportsExpanded}
                  onClick={() => setReportsExpanded((expanded) => !expanded)}
                  className="flex h-10 w-full items-center gap-3 rounded-chip px-3 text-sm font-medium text-ink-secondary transition-colors hover:bg-surface-field-disabled"
                >
                  {Icon && (
                    <Icon
                      className="h-[18px] w-[18px] shrink-0"
                      strokeWidth={1.8}
                      aria-hidden="true"
                    />
                  )}
                  <span className="flex-1 truncate text-left">{item.label}</span>
                  <ChevronDown
                    className={cn(
                      'h-4 w-4 transition-transform',
                      reportsExpanded && 'rotate-180',
                    )}
                    aria-hidden="true"
                  />
                </button>
                {reportsExpanded && (
                  <div className="ml-3 mt-1 flex flex-col gap-1 border-l border-line-card pl-3">
                    {item.children.map((child) => {
                      const ChildIcon = ICONS[child.icon];
                      return (
                        <NavLink
                          key={child.to}
                          to={child.to}
                          onClick={onNavigate}
                          className={({ isActive }) =>
                            cn(
                              'flex h-9 items-center gap-2 rounded-chip px-2 text-xs font-medium transition-colors',
                              isActive
                                ? 'bg-action-primary-soft text-action-primary'
                                : 'text-ink-secondary hover:bg-surface-field-disabled',
                            )
                          }
                        >
                          {ChildIcon && (
                            <ChildIcon
                              className="h-4 w-4 shrink-0"
                              strokeWidth={1.8}
                              aria-hidden="true"
                            />
                          )}
                          <span className="truncate">{child.label}</span>
                        </NavLink>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          }
          return (
            <NavLink
              key={item.to}
              to={item.to}
              onClick={onNavigate}
              className={({ isActive }) =>
                cn(
                  'flex h-10 items-center gap-3 rounded-chip px-3 text-sm font-medium transition-colors',
                  isActive ? 'bg-action-primary-soft text-action-primary' : 'text-ink-secondary hover:bg-surface-field-disabled',
                )
              }
            >
              {Icon && <Icon className="h-[18px] w-[18px] shrink-0" strokeWidth={1.8} aria-hidden="true" />}
              <span className="truncate">{item.label}</span>
            </NavLink>
          );
        })}
      </nav>
    </aside>
  );
}

export default AppSidebar;
