// src/components/layout/AppHeader/AppHeader.jsx
import { useState, useEffect, useRef } from 'react';
import Cookies from 'js-cookie';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';

// ── Inline SVG Icons ───────────────────────────────────────────────────────────
const PersonIcon = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#ffffff" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
    <circle cx="12" cy="7" r="4" />
  </svg>
);

const PowerIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
    <path d="M16 17l5-5-5-5" />
    <path d="M21 12H9" />
  </svg>
);

const ChevronDownIcon = ({ open }) => (
  <svg
    width="8"
    height="16"
    viewBox="0 0 8 16"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={`app-header-user-chevron${open ? ' open' : ''}`}
  >
    <path d="M1 6L4 9L7 6" stroke="rgba(0, 0, 0, 0.5)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

// ─────────────────────────────────────────────────────────────────────────────
export function AppHeader() {
  const navigate = useNavigate();
  const reduxUser = useSelector((state) => state.auth?.user);
  const dropdownRef = useRef(null);
  const [userOpen, setUserOpen] = useState(false);

  // ── Resolve user ────────────────────────────────────────────────────────────
  let user = reduxUser;
  if (!user) {
    try { user = JSON.parse(Cookies.get('user') || 'null'); } catch { user = null; }
  }
  // Default to reference design name and ID
  const uName  = user?.emp_name || localStorage.getItem('userName') || 'Kusum G G';
  const uEmpId = user?.emp_id   || localStorage.getItem('emp_id')   || 'AS03363';
  const uRole  = user?.role     || localStorage.getItem('role')     || 'Lead';

  // ── Logout ──────────────────────────────────────────────────────────────────
  const handleLogout = () => {
    Cookies.remove('user');
    ['token', 'email', 'emp_id', 'role', 'userName'].forEach((k) => localStorage.removeItem(k));
    navigate('/quantification');
  };

  // ── Close dropdown on outside click ────────────────────────────────────────
  useEffect(() => {
    const handler = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setUserOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  return (
    <header className="app-header flex items-center justify-end px-6 bg-white border-b border-gray-200">
      {/* User profile section */}
      <div className="app-header-user">
        <div className="app-header-user-border" ref={dropdownRef}>
          <button
            type="button"
            onClick={() => setUserOpen((o) => !o)}
            className="app-header-user-button flex items-center gap-2 cursor-pointer"
          >
            {/* Avatar */}
            <div className="w-[28px] h-[28px] rounded-full bg-[#856BFF] flex items-center justify-center shrink-0">
              <PersonIcon />
            </div>

            {/* User info */}
            <div className="flex flex-col items-start leading-none text-left">
              <span className="text-[12px] font-semibold text-[#7B6CF0]">
                {uName}
              </span>
              <span className="text-[10px] text-gray-400 mt-0.5">
                {uEmpId}
              </span>
            </div>

            {/* Chevron */}
            <ChevronDownIcon open={userOpen} />
          </button>

          {/* Dropdown */}
          {userOpen && (
            <div className="app-header-dropdown">
              <div className="app-header-dropdown-header">
                <div className="app-header-dropdown-name">{uName}</div>
                <div className="app-header-dropdown-emp-id">{uEmpId}</div>
                <div className="app-header-dropdown-role">{uRole}</div>
              </div>
              <button
                type="button"
                onClick={handleLogout}
                className="app-header-logout-btn"
              >
                <PowerIcon />
                Sign Out
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}

export default AppHeader;
