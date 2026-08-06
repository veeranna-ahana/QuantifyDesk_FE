import { Outlet, useLocation } from "react-router-dom";
import { useEffect, useRef } from "react";
import Sidebar from "../layout/Sidebar";   // adjust path if yours differs
import Header  from "../layout/Header";    // ← NEW

const MainLayout = () => {
  const { pathname } = useLocation();
  const contentRef = useRef(null);

  useEffect(() => {
    if (contentRef.current) {
      contentRef.current.scrollTop = 0;
    }
    window.scrollTo(0, 0);
  }, [pathname]);

  return (
    <div style={styles.shell}>
      {/* ── Left: collapsible sidebar ── */}
      <Sidebar />

      {/* ── Right: header + page content ── */}
      <div style={styles.main}>
        <Header />
        <div id="main-content-scroll" ref={contentRef} style={styles.content}>
          <Outlet />
        </div>
      </div>
    </div>
  );
};

const styles = {
  shell: {
    display: "flex",
    height: "100vh",
    overflow: "hidden",
    background: "#f4f6f8",
  },
  main: {
    flex: 1,
    display: "flex",
    flexDirection: "column",
    overflow: "hidden",
  },
  content: {
    flex: 1,
    overflowY: "auto",
    padding: "0",          // let each page control its own padding
  },
};

export default MainLayout;
