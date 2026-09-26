import { useEffect, useRef, useState } from 'react';
import { ChevronDown, LogOut, Menu } from 'lucide-react';
import Cookies from 'js-cookie';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';

import { Avatar } from '@/components/ui/Avatar';
import { IconButton } from '@/components/ui/IconButton';
import { cn } from '@/lib/cn';

/** Top bar: menu button (small screens) on the left, user menu on the right. */
export function AppHeader({ onMenuClick }) {
  const navigate = useNavigate();
  const reduxUser = useSelector((state) => state.auth?.user);
  const menuRef = useRef(null);
  const [open, setOpen] = useState(false);

  // ── Resolve user (unchanged behaviour) ──
  let user = reduxUser;
  if (!user) {
    try { user = JSON.parse(Cookies.get('user') || 'null'); } catch { user = null; }
  }
  const uName = user?.emp_name || localStorage.getItem('userName') || 'Kusum G G';
  const uEmpId = user?.emp_id || localStorage.getItem('emp_id') || 'AS03363';
  const uRole = user?.role || localStorage.getItem('role') || 'Lead';

  // ── Logout (unchanged behaviour) ──
  const handleLogout = () => {
    Cookies.remove('user');
    ['token', 'email', 'emp_id', 'role', 'userName'].forEach((k) => localStorage.removeItem(k));
    navigate('/quantification');
  };

  useEffect(() => {
    const onDown = (e) => { if (menuRef.current && !menuRef.current.contains(e.target)) setOpen(false); };
    document.addEventListener('mousedown', onDown);
    return () => document.removeEventListener('mousedown', onDown);
  }, []);

  return (
    <header className="flex h-header shrink-0 items-center justify-between bg-surface-card px-[var(--space-header-x)] shadow-header">
      <IconButton label="Open menu" variant="neutral" className="lg:hidden" onClick={onMenuClick}>
        <Menu className="h-5 w-5" />
      </IconButton>

      <div ref={menuRef} className="relative ml-auto border-l border-line-card pl-4">
        <button type="button" onClick={() => setOpen((o) => !o)} aria-expanded={open} className="flex items-center gap-2">
          <Avatar />
          <span className="flex flex-col items-start text-left leading-tight">
            <span className="text-xs font-semibold text-action-primary">{uName}</span>
            <span className="text-[10px] text-ink-muted">{uEmpId}</span>
          </span>
          <ChevronDown className={cn('h-4 w-4 text-ink-muted transition-transform', open && 'rotate-180')} />
        </button>

        {open && (
          <div className="absolute right-0 top-full z-30 mt-2 w-52 overflow-hidden rounded-chip border border-line-card bg-surface-card shadow-lg">
            <div className="border-b border-line-card px-4 py-3">
              <div className="text-sm font-semibold text-ink-primary">{uName}</div>
              <div className="text-xs text-ink-muted">{uEmpId}</div>
              <div className="text-xs text-action-primary">{uRole}</div>
            </div>
            <button type="button" onClick={handleLogout} className="flex w-full items-center gap-2 px-4 py-2.5 text-sm text-badge-danger-ink hover:bg-badge-danger-bg">
              <LogOut className="h-4 w-4" /> Sign Out
            </button>
          </div>
        )}
      </div>
    </header>
  );
}

export default AppHeader;
