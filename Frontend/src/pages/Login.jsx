import React from "react";

/**
 * Loading card shown when redirecting from MyAhana to QuantifyDesk.
 * Restores the previous WorkQuantify brand card styling and loading spinner.
 */
export default function Login({ text = "Authenticating via MyAhana…" }) {
  return (
    <div style={ss.page}>
      <div style={ss.card}>
        <div style={ss.logoBox}>
          <span style={ss.logoText}>QD</span>
        </div>
        <h1 style={ss.title}>Work Quantify Tool</h1>
        <p style={ss.sub}>{text}</p>
        <div style={ss.spinner} />
      </div>
      <style>{`
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}

const ss = {
  page: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    minHeight: "100vh",
    background: "#faf8ff" /* --color-surface-page */,
    fontFamily:
      "'Roboto', system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
    padding: "24px",
    boxSizing: "border-box",
  },
  card: {
    background: "#ffffff" /* --color-surface-card */,
    border: "1px solid #e2e8f0" /* --color-line-card */,
    borderRadius: "20px",
    boxShadow:
      "0 0 0 1px rgba(133,107,255,0.08), 0 12px 40px rgba(133,107,255,0.12), 0 2px 8px rgba(0,0,0,0.06)",
    padding: "44px 40px 36px",
    width: "100%",
    maxWidth: "440px",
    textAlign: "center",
    boxSizing: "border-box",
  },
  logoBox: {
    display: "flex",
    justifyContent: "center",
    marginBottom: "8px",
  },
  logoText: {
    fontSize: "40px",
    fontWeight: "900",
    background: "linear-gradient(135deg,#856bff,#7062e4)",
    WebkitBackgroundClip: "text",
    WebkitTextFillColor: "transparent",
  },
  title: {
    fontSize: "24px",
    fontWeight: "800",
    color: "#1e272e" /* --color-ink-primary */,
    margin: "0 0 14px 0",
    letterSpacing: "-0.3px",
  },
  sub: {
    fontSize: "14px",
    color: "#8a91a0" /* --color-ink-muted */,
    margin: "0 0 20px 0",
  },
  spinner: {
    width: "28px",
    height: "28px",
    border: "3px solid #f1eeff" /* --color-action-primary-soft */,
    borderTop: "3px solid #856bff" /* --color-brand-primary */,
    borderRadius: "50%",
    animation: "spin 0.9s linear infinite",
    margin: "20px auto 0",
  },
};
