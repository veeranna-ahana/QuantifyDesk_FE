import { Outlet, useLocation } from "react-router-dom";
import { useEffect, useRef } from "react";
import Sidebar from "../layout/Sidebar";
import Header from "../layout/Header";

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
      {/* ── Header full width ── */}
      <Header />

      {/* ── Below Header: Sidebar + Content ── */}
      <div style={styles.main}>
        <Sidebar />
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
    flexDirection: "column",
    height: "100vh",
    overflow: "hidden",
    background: "#f4f6f8",
  },
  main: {
    flex: 1,
    display: "flex",
    overflow: "hidden",
  },
  content: {
    flex: 1,
    overflowY: "auto",
    padding: "0",
  },
};

export default MainLayout;