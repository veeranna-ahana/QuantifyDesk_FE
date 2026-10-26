import { useEffect, useRef, useState } from 'react';
import { ChevronDown, LogOut, Menu } from 'lucide-react';
import Cookies from 'js-cookie';
import { useDispatch, useSelector } from 'react-redux';

import { Avatar } from '@/components/ui/Avatar';
import { IconButton } from '@/components/ui/IconButton';
import { cn } from '@/lib/cn';
import { logout } from '@/shared/sessionExpiry';
import { logoutUser } from '@/store/slices/authSlice';
import styles from "./AppHeader.module.css";

/** Top bar: menu button (small screens) on the left, user menu on the right. */
export function AppHeader({ onMenuClick }) {
  const dispatch = useDispatch();
  const reduxUser = useSelector((state) => state.auth?.user);

  let user = reduxUser;
  if (!user) {
    try {
      user = JSON.parse(Cookies.get("user") || "null");
    } catch {
      user = null;
    }
  }
  const uName = user?.emp_name || localStorage.getItem('userName') || 'Kusum G G';
  const uEmpId = user?.emp_id || '—';
  const uRole = user?.role || '—';

  // ── Logout — matches PCM UserMenu.jsx ──
  const handleLogout = () => {
    setOpen(false);
    sessionStorage.clear();
    localStorage.removeItem('sso_token');
    Cookies.remove('access_token', { path: '/' });
    Cookies.remove('quantify_access_token', { path: '/' });
    Cookies.remove('user', { path: '/' });
    dispatch(logoutUser());

    // Matches PCM UserMenu: try to focus opener and close child tab
    const opener = window.opener;
    if (opener && !opener.closed) {
      try { opener.focus(); } catch { /* ignore */ }
      window.close();
    }

    // Fallback: show Logged Out modal
    void logout({ reason: 'user_logout', redirect: false });
  };

  useEffect(() => {
    const onDown = (e) => { if (menuRef.current && !menuRef.current.contains(e.target)) setOpen(false); };
    document.addEventListener('mousedown', onDown);
    return () => document.removeEventListener('mousedown', onDown);
  }, []);

  return (
    <header className={styles.header}>
      <div className={styles.account}>
        <Avatar size="lg" className={styles.avatar} />
        <span className={styles.accountText}>
          <span className={styles.name}>{uName}</span>
          <span className={styles.employeeId}>{uEmpId}</span>
        </span>
        <ChevronDown className={styles.accountChevron} aria-hidden="true" />
      </div>
    </header>
  );
}

export default AppHeader;
