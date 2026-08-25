import { NavLink, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import Cookies from "js-cookie";
import ahana from "../../public/ahana.png"

// ── SVG Icon helper ──────────────────────────────────────────────────────────
const Icon = ({ d, size = 18, className = "" }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none"
    stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
    className={`shrink-0 ${className}`}>
    {Array.isArray(d)
      ? d.map((p, i) => <path key={i} d={p} />)
      : <path d={d} />}
  </svg>
);

const Icons = {
  utilization: "M18 20V10 M12 20V4 M6 20v-6",
  dailyUpdate: ["M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z", "M14 2v6h6", "M16 13H8", "M16 17H8", "M10 9H8"],
  projects: "M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z",
  assignments: ["M9 11l3 3L22 4", "M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h7"],
  approvals: ["M9 12l2 2 4-4", "M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20z"],
  myWork: "M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20z M12 6v6l4 2",
  reconciliation: ["M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4", "M17 8l-5-5-5 5", "M12 3v12"],
  reconDash: "M18 20V10 M12 20V4 M6 20v-6",
  chevronDown: "M6 9l6 6 6-6",
  chevronRight: "M9 18l6-6-6-6",
  chevronLeft: "M15 18l-6-6 6-6",
  logout: ["M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4", "M16 17l5-5-5-5", "M21 12H9"],
};

// ── Role-based nav config ─────────────────────────────────────────────────────
const ROLE_LINKS = {
  Admin: [
    { to: "/quantificationnew", label: "Utilization", icon: "utilization" },
    { to: "/projects", label: "Projects", icon: "projects" },
    { to: "/assignments", label: "Assignments", icon: "assignments" },
    { to: "/dailyreport", label: "Daily Report", icon: "dailyUpdate" },
    {
      label: "Reconciliation", icon: "reconciliation",
      children: [
        { to: "/reconciliation/upload", label: "Timesheet Upload", icon: "reconciliation" },
        { to: "/reconciliation/dashboard", label: "Recon Dashboard", icon: "reconDash" },
      ],
    },
  ],
  Manager: [
    { to: "/quantificationnew", label: "Utilization", icon: "utilization" },
    { to: "/dailyreport", label: "Daily Report", icon: "dailyUpdate" },
    { to: "/projects", label: "Projects", icon: "projects" },
    { to: "/assignments", label: "Assignments", icon: "assignments" },
    {
      label: "Reconciliation", icon: "reconciliation",
      children: [
        { to: "/reconciliation/upload", label: "Timesheet Upload", icon: "reconciliation" },
        { to: "/reconciliation/dashboard", label: "Recon Dashboard", icon: "reconDash" },
      ],
    },
  ],
  Employee: [
    // { to: "/quantificationnew", label: "Utilization", icon: "utilization" },
    { to: "/my-work", label: "My Work", icon: "myWork" },
    { to: "/dailyreport", label: "Daily Report", icon: "dailyUpdate" },
  ],
};

// ── Submenu ───────────────────────────────────────────────────────────────────
const SubMenu = ({ label, icon, children }) => {
  const isActive = children.some(c => window.location.pathname.startsWith(c.to));
  const [open, setOpen] = useState(isActive);

  return (
    <div>
      <button
        onClick={() => setOpen(o => !o)}
        className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-[13px] font-medium transition-colors
          ${isActive ? "bg-purple-50 text-[#856BFF]" : "text-gray-500 hover:bg-gray-50 hover:text-gray-800"}`}
      >
        <Icon d={Icons[icon]} size={16} />
        <span className="flex-1 text-left">{label}</span>
        <Icon d={open ? Icons.chevronDown : Icons.chevronRight} size={14} />
      </button>
      {open && (
        <div className="ml-5 mt-0.5 flex flex-col gap-0.5 border-l-2 border-gray-100 pl-3">
          {children.map(c => (
            <NavLink key={c.to} to={c.to}
              className={({ isActive }) =>
                `flex items-center gap-2.5 px-2 py-2 rounded-lg text-[12px] font-medium transition-colors
                ${isActive ? "text-white bg-[#856BFF]" : "text-gray-400 hover:text-gray-700 hover:bg-gray-50"}`
              }
            >
              <Icon d={Icons[c.icon]} size={14} />
              {c.label}
            </NavLink>
          ))}
        </div>
      )}
    </div>
  );
};

// ── Main Sidebar ──────────────────────────────────────────────────────────────
const Sidebar = () => {
  const reduxUser = useSelector(state => state.auth?.user);
  
  // Load collapsed state from localStorage
  const [collapsed, setCollapsed] = useState(() => {
    const saved = localStorage.getItem("sidebarCollapsed");
    return saved ? JSON.parse(saved) : false;
  });

  let user = reduxUser;
  if (!user) {
    try { user = JSON.parse(Cookies.get("user") || "null"); } catch { user = null; }
  }

  const userName = user?.emp_name || localStorage.getItem("userName") || "User";
  const empId = user?.emp_id || localStorage.getItem("emp_id") || "";
  const rawRole = user?.role || localStorage.getItem("role") || "Employee";
  let userRole = rawRole;
  if (rawRole === "ADMIN") userRole = "Admin";
  if (rawRole === "MANAGER") userRole = "Manager";
  if (rawRole === "EMPLOYEE") userRole = "Employee";

  const links = ROLE_LINKS[userRole] || ROLE_LINKS.Employee;

  const toggleCollapse = (newState) => {
    setCollapsed(newState);
    localStorage.setItem("sidebarCollapsed", JSON.stringify(newState));
  };

  const handleLogout = () => {
    Cookies.remove("user");
    ["token", "email", "emp_id", "role", "userName"].forEach(k => localStorage.removeItem(k));
    window.close();
  };

  return (
    <div 
      className={`flex flex-col h-screen bg-white border-r border-gray-100 shadow-sm shrink-0 transition-all duration-200 ${collapsed ? "w-16" : "w-[210px]"}`}
      onMouseEnter={() => {
        if (collapsed) {
          setCollapsed(false);
        }
      }}
      onMouseLeave={() => {
        if (!collapsed) {
          const wasCollapsed = localStorage.getItem("sidebarCollapsed");
          if (wasCollapsed === "true") {
            setCollapsed(true);
          }
        }
      }}
    >

      {/* ── Header with collapse toggle ── */}
      {/* <div className="flex items-center justify-end px-4 py-4 border-b border-gray-100 min-h-[60px]">
        {!collapsed && (
          <button onClick={() => toggleCollapse(true)}
            className="p-1 rounded text-gray-300 hover:text-gray-500 hover:bg-gray-50 transition-colors">
            <Icon d={Icons.chevronLeft} size={14} />
          </button>
        )}
        {collapsed && (
          <div className="w-7 h-7 rounded-lg mx-auto flex items-center justify-center"
            style={{ background: "linear-gradient(135deg,#6C5CE7,#a855f7)" }}>
            <span className="text-white text-[10px] font-extrabold">ah</span>
          </div>
        )}
      </div> */}

      {/* ── Nav ── */}
      <nav className="flex-1 flex flex-col gap-0.5 px-2 py-3 overflow-y-auto">
        {links.map(item => item.children ? (
          collapsed ? null : (
            <SubMenu key={item.label} label={item.label} icon={item.icon} children={item.children} />
          )
        ) : (
          <NavLink key={item.to} to={item.to}
            title={collapsed ? item.label : undefined}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2.5 rounded-lg text-[13px] font-medium transition-all
              ${isActive
                ? "bg-[#856BFF] text-white shadow-sm"
                : "text-gray-500 hover:bg-gray-50 hover:text-gray-800"
              }
              ${collapsed ? "justify-center px-0" : ""}`
            }
          >
            <Icon d={Icons[item.icon]} size={16} />
            {!collapsed && <span>{item.label}</span>}
          </NavLink>
        ))}
      </nav>

      {/* ── Footer user chip ── */}
      {/* {!collapsed && (
        <div className="px-3 pb-4 pt-2 border-t border-gray-100">
          <div className="flex items-center gap-2.5 px-2 py-2 rounded-lg hover:bg-gray-50 transition-colors cursor-default">
            <div className="w-7 h-7 rounded-full flex items-center justify-center shrink-0 text-white text-[11px] font-bold"
              style={{ background: "linear-gradient(135deg,#6C5CE7,#a855f7)" }}>
              {userName.charAt(0).toUpperCase()}
            </div>
            <div className="overflow-hidden">
              <div className="text-[12px] font-semibold text-gray-700 truncate">{userName}</div>
              <div className="text-[10px] text-gray-400 uppercase tracking-wide">{userRole}</div>
            </div>
          </div>
          <button onClick={handleLogout}
            className="mt-1 w-full flex items-center gap-2.5 px-2 py-2 rounded-lg text-[12px] text-gray-400 hover:text-red-500 hover:bg-red-50 transition-colors font-medium">
            <Icon d={Icons.logout} size={14} />
            Sign Out
          </button>
        </div>
      )} */}
    </div>
  );
};

export default Sidebar;