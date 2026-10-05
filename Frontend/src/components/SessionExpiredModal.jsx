// src/components/SessionExpiredModal.jsx
//
// Blocking "your session has expired" overlay, mounted once at the app
// root (see App.jsx). Shown whenever shared/sessionExpiry.js's
// handleSessionExpired() fires (any 401 from either axios instance), no
// matter which screen the user is on at the time.
//
// Single "Logout" button sends the user back to the UAT portal home —
// there's no local login form to return to (this app only authenticates
// via the MyAhana/UAT SSO handoff), so clicking it is effectively both a
// logout and the way back to log in again.
import { useEffect, useState } from "react";

import { SESSION_EXPIRED_EVENT } from "@/shared/sessionExpiry";

const UAT_HOME_URL = "http://20.204.44.218:8000/home";

export function SessionExpiredModal() {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const show = () => setOpen(true);
    window.addEventListener(SESSION_EXPIRED_EVENT, show);
    return () => window.removeEventListener(SESSION_EXPIRED_EVENT, show);
  }, []);

  if (!open) return null;

  const goToUat = () => {
    window.location.href = UAT_HOME_URL;
  };

  return (
    <div
      role="alertdialog"
      aria-modal="true"
      aria-labelledby="session-expired-title"
      style={styles.overlay}
    >
      <div style={styles.modal}>
        <div style={styles.iconWrap}>
          <svg
            width="30"
            height="30"
            viewBox="0 0 24 24"
            fill="none"
            stroke="#e5484d"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
            <path d="M7 11V7a5 5 0 0 1 10 0v4" />
          </svg>
        </div>

        <h2 id="session-expired-title" style={styles.title}>
          Session Expired
        </h2>
        <p style={styles.subtitle}>
          Your session has ended. Please log in again to continue using Work
          Quantify Tool.
        </p>

        <div style={styles.actions}>
          <button type="button" onClick={goToUat} style={styles.primaryBtn}>
            Logout
          </button>
        </div>
      </div>
    </div>
  );
}

const styles = {
  overlay: {
    position: "fixed",
    inset: 0,
    background: "rgba(30, 39, 46, 0.6)",
    backdropFilter: "blur(6px)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    zIndex: 10000,
    padding: 20,
  },
  modal: {
    background: "#ffffff",
    border: "1px solid #e2e8f0",
    borderRadius: 16,
    boxShadow: "0 12px 40px rgba(229,72,77,0.14), 0 2px 8px rgba(0,0,0,0.08)",
    width: "100%",
    maxWidth: 400,
    padding: "32px 28px 24px",
    textAlign: "center",
    boxSizing: "border-box",
  },
  iconWrap: {
    width: 60,
    height: 60,
    borderRadius: "50%",
    background: "#fdecec",
    border: "2px solid #f7c6c7",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    margin: "0 auto 14px",
  },
  title: {
    fontSize: 20,
    fontWeight: 700,
    color: "#1e272e",
    margin: "0 0 6px 0",
    letterSpacing: "-0.2px",
  },
  subtitle: {
    fontSize: 13,
    color: "#8a91a0",
    margin: "0 0 22px 0",
    lineHeight: 1.5,
  },
  actions: {
    display: "flex",
  },
  primaryBtn: {
    flex: 1,
    background: "#856bff",
    border: "1.5px solid #856bff",
    color: "#ffffff",
    fontSize: 14,
    fontWeight: 600,
    cursor: "pointer",
    padding: "10px 16px",
    borderRadius: 10,
    transition: "all 0.15s ease",
  },
};
