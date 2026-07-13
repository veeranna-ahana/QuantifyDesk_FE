import { useState, useEffect, useRef, useCallback } from "react";
import axios from "axios";
import Cookies from "js-cookie";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";

const BASE_URL = import.meta.env.VITE_API_BASE_URL;
const getHeaders = () => ({
  Authorization: `Bearer ${localStorage.getItem("token") || ""}`,
});

const timeAgo = (dateStr) => {
  const diff = Date.now() - new Date(dateStr).getTime();
  const m = Math.floor(diff / 60000);
  const h = Math.floor(m / 60);
  const d = Math.floor(h / 24);
  if (d > 0) return `${d}d ago`;
  if (h > 0) return `${h}h ago`;
  if (m > 0) return `${m}m ago`;
  return "just now";
};

// ── Bell Icon ─────────────────────────────────────────────────────────────────
const BellIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none"
    stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
    <path d="M13.73 21a2 2 0 0 1-3.46 0" />
  </svg>
);

// ── Chevron Down ──────────────────────────────────────────────────────────────
const ChevronDown = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none"
    stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M6 9l6 6 6-6" />
  </svg>
);

// ── Power / Logout ────────────────────────────────────────────────────────────
const PowerIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none"
    stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
    <path d="M16 17l5-5-5-5" />
    <path d="M21 12H9" />
  </svg>
);

// ─────────────────────────────────────────────────────────────────────────────
const Header = () => {
  const navigate = useNavigate();
  const reduxUser = useSelector(state => state.auth?.user);
  const dropdownRef = useRef(null);

  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [bellOpen, setBellOpen] = useState(false);
  const [userOpen, setUserOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  // ── Resolve user ──────────────────────────────────────────────────────────
  let user = reduxUser;
  if (!user) {
    try { user = JSON.parse(Cookies.get("user") || "null"); } catch { user = null; }
  }
  const uName = user?.emp_name || localStorage.getItem("userName") || "User";
  const uEmpId = user?.emp_id || localStorage.getItem("emp_id") || "";
  const uRole = user?.role || localStorage.getItem("role") || "Employee";

  // ── Logout ────────────────────────────────────────────────────────────────
  const handleLogout = () => {
    Cookies.remove("user");
    ["token", "email", "emp_id", "role", "userName"].forEach(k => localStorage.removeItem(k));
    window.close();
  };

  // ── Notification polling ──────────────────────────────────────────────────
  const fetchUnreadCount = useCallback(async () => {
    try {
      const res = await axios.get(`${BASE_URL}/api/notifications/unread-count`, { headers: getHeaders() });
      setUnreadCount(res.data.count || 0);
    } catch (_) { }
  }, []);

  useEffect(() => {
    fetchUnreadCount();
    const interval = setInterval(fetchUnreadCount, 30000);
    return () => clearInterval(interval);
  }, [fetchUnreadCount]);

  // ── Close dropdowns on outside click ─────────────────────────────────────
  useEffect(() => {
    const handler = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setBellOpen(false);
        setUserOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  // ── Fetch notifications ───────────────────────────────────────────────────
  const handleBellOpen = async () => {
    setBellOpen(o => !o);
    setUserOpen(false);
    if (!bellOpen) {
      setLoading(true);
      try {
        const res = await axios.get(`${BASE_URL}/api/notifications`, { headers: getHeaders() });
        setNotifications(res.data || []);
      } catch (_) { }
      setLoading(false);
    }
  };

  const markRead = async (id) => {
    try {
      await axios.put(`${BASE_URL}/api/notifications/${id}/read`, {}, { headers: getHeaders() });
      setNotifications(prev => prev.map(n => n.id === id ? { ...n, is_read: 1 } : n));
      setUnreadCount(c => Math.max(0, c - 1));
    } catch (_) { }
  };

  const markAllRead = async () => {
    try {
      await axios.put(`${BASE_URL}/api/notifications/mark-all-read`, {}, { headers: getHeaders() });
      setNotifications(prev => prev.map(n => ({ ...n, is_read: 1 })));
      setUnreadCount(0);
    } catch (_) { }
  };

  // Initials from name
  const initials = uName.split(" ").map(w => w[0]).slice(0, 2).join("").toUpperCase();

  return (
    <header className="h-14 bg-white border-b border-gray-100 flex items-center justify-between px-6 sticky top-0 z-50 shadow-sm shrink-0">

      {/* ── Left: empty / breadcrumb area ── */}
      <div />

      {/* ── Right ── */}
      <div className="flex items-center gap-3" ref={dropdownRef}>

        {/* Bell */}
        <div className="relative">
          <button
            onClick={handleBellOpen}
            className="relative w-9 h-9 flex items-center justify-center rounded-full hover:bg-gray-100 text-gray-500 transition-colors"
          >
            <BellIcon />
            {unreadCount > 0 && (
              <span className="absolute top-1 right-1 w-4 h-4 bg-red-500 rounded-full text-white text-[9px] font-bold flex items-center justify-center leading-none">
                {unreadCount > 9 ? "9+" : unreadCount}
              </span>
            )}
          </button>

          {/* Bell dropdown */}
          {bellOpen && (
            <div className="absolute right-0 top-11 w-80 bg-white rounded-xl shadow-xl border border-gray-100 overflow-hidden z-50">
              <div className="flex items-center justify-between px-4 py-3 border-b border-gray-50">
                <div className="flex items-center gap-2">
                  <span className="text-[13px] font-bold text-gray-800">Notifications</span>
                  {unreadCount > 0 && (
                    <span className="px-1.5 py-0.5 bg-red-500 text-white text-[10px] font-bold rounded-full">{unreadCount}</span>
                  )}
                </div>
                {unreadCount > 0 && (
                  <button onClick={markAllRead} className="text-[11px] text-purple-600 font-semibold hover:text-purple-800">
                    Mark all read
                  </button>
                )}
              </div>
              <div className="max-h-80 overflow-y-auto">
                {loading ? (
                  <div className="py-8 text-center text-gray-400 text-sm">Loading…</div>
                ) : notifications.length === 0 ? (
                  <div className="py-8 text-center text-gray-300 text-sm">No notifications</div>
                ) : notifications.map(n => (
                  <div key={n.id}
                    onClick={() => markRead(n.id)}
                    className={`flex gap-3 px-4 py-3 border-b border-gray-50 cursor-pointer hover:bg-gray-50 transition-colors
                      ${n.is_read ? "opacity-60" : ""}`}>
                    <div className="w-2 h-2 rounded-full mt-1.5 shrink-0"
                      style={{ background: n.is_read ? "#cbd5e1" : "#6C5CE7" }} />
                    <div className="flex-1 min-w-0">
                      <div className="text-[12px] font-semibold text-gray-700 truncate">{n.title}</div>
                      <div className="text-[11px] text-gray-400 mt-0.5 line-clamp-2">{n.message}</div>
                      <div className="text-[10px] text-gray-300 mt-1">{timeAgo(n.created_at)}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Divider */}
        <div className="w-px h-6 bg-gray-200" />

        {/* User chip */}
        <div className="relative">
          <button
            onClick={() => { setUserOpen(o => !o); setBellOpen(false); }}
            className="flex items-center gap-2.5 px-3 py-1.5 rounded-lg hover:bg-gray-50 transition-colors"
          >
            {/* Avatar */}
            <div className="w-8 h-8 rounded-full flex items-center justify-center text-white text-[12px] font-bold shrink-0"
              style={{ background: "linear-gradient(135deg,#6C5CE7,#a855f7)" }}>
              {initials}
            </div>
            {/* Name + ID */}
            <div className="text-left hidden sm:block">
              <div className="text-[13px] font-semibold text-gray-700 leading-tight">{uName}</div>
              <div className="text-[10px] text-gray-400 leading-tight">{uEmpId}</div>
            </div>
            <ChevronDown />
          </button>

          {/* User dropdown */}
          {userOpen && (
            <div className="absolute right-0 top-11 w-52 bg-white rounded-xl shadow-xl border border-gray-100 overflow-hidden z-50 py-1">
              <div className="px-4 py-3 border-b border-gray-50">
                <div className="text-[13px] font-bold text-gray-800">{uName}</div>
                <div className="text-[11px] text-gray-400">{uEmpId}</div>
                <div className="text-[10px] text-purple-600 font-semibold mt-0.5 uppercase tracking-wide">{uRole}</div>
              </div>
              <button
                onClick={handleLogout}
                className="w-full flex items-center gap-2.5 px-4 py-2.5 text-[13px] text-red-500 hover:bg-red-50 transition-colors font-medium"
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
};

export default Header;
