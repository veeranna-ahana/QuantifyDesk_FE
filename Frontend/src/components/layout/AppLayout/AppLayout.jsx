// src/components/layout/AppLayout/AppLayout.jsx
import React, { useEffect, useRef } from 'react';
import { Outlet, useLocation } from 'react-router-dom';

import { AppSidebar } from '@/components/layout/AppSidebar/AppSidebar';
import { AppHeader } from '@/components/layout/AppHeader/AppHeader';

/**
 * Root application shell.
 * Mirrors @UI/src AppLayout pattern: sidebar + header + scrollable main content.
 * Uses <Outlet /> for nested React Router routes (WorkQuantify-specific).
 */
export function AppLayout() {
  const { pathname } = useLocation();
  const contentRef = useRef(null);

  // Scroll to top on route change
  useEffect(() => {
    if (contentRef.current) {
      contentRef.current.scrollTop = 0;
    }
    window.scrollTo(0, 0);
  }, [pathname]);

  return (
    <div className="app-layout">
      {/* ── Left: Fixed sidebar ── */}
      <AppSidebar />

      {/* ── Right: Header + scrollable page content ── */}
      <div className="app-layout-content">
        <AppHeader />
        <div
          id="main-content-scroll"
          ref={contentRef}
          className="app-layout-main"
        >
          <Outlet />
        </div>
      </div>
    </div>
  );
}

export default AppLayout;
