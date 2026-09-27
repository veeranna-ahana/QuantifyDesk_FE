import { useEffect, useRef } from "react";
import { Outlet, useLocation } from "react-router-dom";

import { AppHeader } from "@/components/layout/AppHeader/AppHeader";
import { AppSidebar } from "@/components/layout/AppSidebar/AppSidebar";
import { useDisclosure } from "@/hooks/useDisclosure";

/**
 * App shell: sidebar + (header + scrolling page area).
 * The page area is fluid (fills the space beside the sidebar) and scrolls on its own,
 * so zooming out or changing display scaling never leaves a growing gap or a page-level scroll.
 */
export function AppLayout() {
  const { pathname } = useLocation();
  const contentRef = useRef(null);
  const sidebar = useDisclosure(false);

  useEffect(() => {
    if (contentRef.current) contentRef.current.scrollTop = 0;
    sidebar.close();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname]);

  return (
    <div className="fixed inset-0 flex overflow-hidden bg-surface-page">
      <AppSidebar open={sidebar.isOpen} onNavigate={sidebar.close} />
      {sidebar.isOpen && (
        <button
          type="button"
          aria-label="Close menu"
          onClick={sidebar.close}
          className="fixed inset-0 z-30 bg-black/40 lg:hidden"
        />
      )}

      <div className="flex min-w-0 flex-1 flex-col">
        <AppHeader onMenuClick={sidebar.toggle} />
        <main
          id="main-content-scroll"
          ref={contentRef}
          className="min-w-0 flex-1 overflow-y-auto px-page-x py-page-y"
        >
          <Outlet />
        </main>
      </div>
    </div>
  );
}

export default AppLayout;
