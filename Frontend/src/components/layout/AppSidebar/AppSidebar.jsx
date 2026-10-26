import {
  BookOpen,
  ChevronDown,
  ClipboardClock,
  Clock3,
  FileCheck2,
  FileText,
  FolderKanban,
  LayoutDashboard,
  Server,
  UsersRound,
} from "lucide-react";
import Cookies from "js-cookie";
import { useState } from "react";
import { NavLink, useLocation } from "react-router-dom";
import { useSelector } from "react-redux";

import logo from "@/assets/images/ahana.png";
import { cn } from "@/lib/cn";

import { ROLE_NAVIGATION } from "./sidebar-navigation";
import styles from "./AppSidebar.module.css";

const ICONS = {
  dashboard: LayoutDashboard,
  projects: FolderKanban,
  dailyReport: ClipboardClock,
  members: UsersRound,
  serverInfo: Server,
  guideline: BookOpen,
  reports: FileText,
  timesheet: Clock3,
  documentChecklist: FileCheck2,
};

export function AppSidebar() {
  const reduxUser = useSelector((state) => state.auth?.user);
  const location = useLocation();
  const [reportsExpanded, setReportsExpanded] = useState(
    location.pathname.startsWith("/reports"),
  );

  let user = reduxUser;
  if (!user) {
    try {
      user = JSON.parse(Cookies.get("user") || "null");
    } catch {
      user = null;
    }
  }

  const rawRole = user?.role || 'Employee';
  const roleMap = { ADMIN: 'Admin', MANAGER: 'Manager', EMPLOYEE: 'Employee' };
  const links = ROLE_NAVIGATION[roleMap[rawRole] ?? rawRole] ?? ROLE_NAVIGATION.Employee;

  return (
    <aside className={styles.sidebar}>
      <div className={styles.logoArea}>
        <img src={logo} alt="Ahana" className={styles.logo} />
      </div>

      <nav aria-label="Primary navigation" className={styles.navigation}>
        {links.map((item) => {
          const Icon = ICONS[item.icon];

          if (item.children) {
            return (
              <div key={item.label}>
                <button
                  type="button"
                  aria-expanded={reportsExpanded}
                  onClick={() => setReportsExpanded((expanded) => !expanded)}
                  className={styles.itemButton}
                >
                  {Icon && <Icon className={styles.icon} aria-hidden="true" />}
                  <span>{item.label}</span>
                  <ChevronDown
                    className={cn(
                      styles.chevron,
                      reportsExpanded && styles.chevronExpanded,
                    )}
                    aria-hidden="true"
                  />
                </button>
                {reportsExpanded && (
                  <div className={styles.submenu}>
                    {item.children.map((child) => {
                      const ChildIcon = ICONS[child.icon];
                      return (
                        <NavLink
                          key={child.to}
                          to={child.to}
                          className={({ isActive }) =>
                            cn(
                              styles.submenuLink,
                              isActive && styles.submenuLinkActive,
                            )
                          }
                        >
                          {ChildIcon && (
                            <ChildIcon
                              className={styles.submenuIcon}
                              aria-hidden="true"
                            />
                          )}
                          <span>{child.label}</span>
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
              className={({ isActive }) =>
                cn(
                  styles.itemLink,
                  (isActive ||
                    (item.to === "/member-details" &&
                      location.pathname.startsWith("/member-details/"))) &&
                    styles.itemLinkActive,
                )
              }
            >
              {Icon && <Icon className={styles.icon} aria-hidden="true" />}
              <span>{item.label}</span>
            </NavLink>
          );
        })}
      </nav>
    </aside>
  );
}

export default AppSidebar;
