import { ClipboardClock, FolderKanban, LayoutDashboard } from 'lucide-react';
import Cookies from 'js-cookie';
import { NavLink } from 'react-router-dom';
import { useSelector } from 'react-redux';

import logo from '@/assets/images/ahana.png';
import { cn } from '@/lib/cn';

import { ROLE_NAVIGATION } from './sidebar-navigation';

const ICONS = { dashboard: LayoutDashboard, projects: FolderKanban, dailyReport: ClipboardClock };

/** Fixed sidebar on desktop; slides in over the page on small screens. */
export function AppSidebar({ open = false, onNavigate }) {
  const reduxUser = useSelector((state) => state.auth?.user);

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
