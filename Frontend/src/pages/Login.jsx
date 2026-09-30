import React, { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import { loginUser } from "@/store/slices/authSlice";
import { FiBriefcase, FiUser, FiShield, FiChevronRight } from "react-icons/fi";
import { login } from "@/api/AuthApi";

/**
 * Login page — shown at /quantification.
 * - While waiting (1.5 s) for a postMessage token from MyAhana → shows spinner.
 * - If token received → auto-logs in via API and redirects to /dashboard.
 * - If NO token after 1.5 s → shows the "Authentication Required" screen
 *   with a button to open MyAhana portal (URL from VITE_MYAHANA_PORTAL_URL).
 *
 * NOTE: The global postMessage handler in usePostMessageLogin (AppShell)
 * also fires on other routes. loginCalledRef prevents double API calls.
 */
export default function Login() {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const [authReady, setAuthReady] = useState(false);
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showRoleModal, setShowRoleModal] = useState(false);
  const [pendingLogin, setPendingLogin] = useState(null);

  // Prevents double API call if both postMessage AND timeout fire
  const loginCalledRef = useRef(false);

  /* ─── Listen for postMessage token from MyAhana ─── */
  useEffect(() => {
    const handleMessage = (event) => {
      if (event.data?.type !== "TOKEN" && event.data?.type !== "token") return;
      const { token, email, emp_id } = event.data;
      if (!token) return;
      if (token) localStorage.setItem("token", token);
      if (email) localStorage.setItem("email", email);
      if (emp_id) localStorage.setItem("emp_id", emp_id);
      setUserData({ token, email, emp_id });
      setAuthReady(true);
    };

    window.addEventListener("message", handleMessage);

    // 1.5 s timeout: if token already in localStorage (returning session), use it
    const t = setTimeout(() => {
      const token = localStorage.getItem("token");
      const email = localStorage.getItem("email");
      const emp_id = localStorage.getItem("emp_id");
      if (token) {
        setUserData({ token, email, emp_id });
        setAuthReady(true);
      } else {
        // No token — show SSO-required screen
        setLoading(false);
      }
    }, 1500);

    return () => {
      window.removeEventListener("message", handleMessage);
      clearTimeout(t);
    };
  }, []);

  /* ─── Determine landing page from role ─── */
  const getRoleBasedRedirect = (role) => {
    const r = (role || "").toUpperCase();
    return r === "ADMIN" || r === "MANAGER" ? "/dashboard" : "/dashboard";
  };

  /* ─── Process login API response (single or multi-role) ─── */
  const processLoginResult = (response) => {
    const rawResult = response.result;
    const rolesList = Array.isArray(rawResult)
      ? rawResult
      : rawResult
      ? [rawResult]
      : [];

    if (rolesList.length > 1) {
      setPendingLogin({ response });
      setShowRoleModal(true);
      setLoading(false);
    } else {
      dispatch(loginUser(response));
      navigate(getRoleBasedRedirect(rolesList[0]?.role));
    }
  };

  /* ─── Role picker handler ─── */
  const handleSelectRole = (selectedRoleObj) => {
    if (!pendingLogin) return;
    const { response } = pendingLogin;
    const allRoles = Array.isArray(response.result)
      ? response.result
      : [response.result];
    const otherRoles = allRoles.filter((r) => r !== selectedRoleObj);
    dispatch(loginUser({ ...response, result: [selectedRoleObj, ...otherRoles] }));
    setShowRoleModal(false);
    setPendingLogin(null);
    navigate(getRoleBasedRedirect(selectedRoleObj?.role));
  };

  /* ─── Auto-login when token is ready ─── */
  useEffect(() => {
    if (!authReady || !userData) return;
    if (loginCalledRef.current) return; // guard against double-fire
    loginCalledRef.current = true;

    const doLogin = async () => {
      setLoading(true);
      try {
        const response = await login({
          email: userData.email || "",
          password: "",
          emp_id: userData.emp_id || undefined,
          authToken: userData.token,
        });
        if (response.status === "success") {
          processLoginResult(response);
        } else {
          setLoading(false);
          loginCalledRef.current = false;
        }
      } catch (err) {
        console.error("Auto login failed:", err);
        setLoading(false);
        loginCalledRef.current = false;
      }
    };

    doLogin();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [authReady, userData]);

  // ── Portal URL from env ──────────────────────────────────────────────────
  const portalUrl =
    import.meta.env.VITE_MYAHANA_PORTAL_URL || "https://myahana.ahanait.com/";

  const handleGoToPortal = () => {
    window.open(portalUrl, "_blank", "noopener,noreferrer");
  };

  // ── Loading / authenticating spinner ────────────────────────────────────
  if (loading && !showRoleModal) {
    return (
      <div style={ss.page}>
        <div style={ss.card}>
          <div style={ss.logoBox}>
            <span style={ss.logoText}>QD</span>
          </div>
          <h1 style={ss.title}>Work Quantify Tool</h1>
          <p style={ss.sub}>Authenticating via MyAhana&hellip;</p>
          <div style={ss.spinner} />
        </div>
      </div>
    );
  }

  // ── SSO-required / session-expired screen ───────────────────────────────
  return (
    <div style={ss.page}>
      <div style={ss.card}>
        {/* Lock icon */}
        <div style={ss.lockWrap}>
          <div style={ss.lockIcon}>
            <svg
              width="32"
              height="32"
              viewBox="0 0 24 24"
              fill="none"
              stroke="white"
              strokeWidth="2.2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
              <path d="M7 11V7a5 5 0 0 1 10 0v4" />
            </svg>
          </div>
        </div>

        <h1 style={ss.title}>Authentication Required</h1>
        <p style={ss.desc}>
          The{" "}
          <strong style={{ color: "#856bff" }}>Work Quantify Tool</strong> is
          accessible only through the MyAhana portal. Please log in via MyAhana
          to sync your employee credentials and access this tool.
        </p>

        {/* SSO info pill */}
        <div style={ss.ssoPill}>
          <svg
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
            stroke="#856bff"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            style={{ flexShrink: 0, marginTop: 2 }}
          >
            <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
          </svg>
          <div style={{ textAlign: "left" }}>
            <p style={ss.ssoPillTitle}>SSO REQUIRED</p>
            <p style={ss.ssoPillSub}>
              Log in through MyAhana portal to sync your employee credentials.
            </p>
          </div>
        </div>

        {/* Redirect button */}
        <button
          id="go-to-myahana-btn"
          onClick={handleGoToPortal}
          style={ss.portalBtn}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = "#7458f5";
            e.currentTarget.style.boxShadow =
              "0 4px 20px rgba(133,107,255,0.45)";
            e.currentTarget.style.transform = "translateY(-2px)";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background =
              "linear-gradient(135deg,#856bff 0%,#7062e4 100%)";
            e.currentTarget.style.boxShadow =
              "0 4px 16px rgba(133,107,255,0.3)";
            e.currentTarget.style.transform = "translateY(0)";
          }}
        >
          Access MyAhana Portal
          <svg
            width="17"
            height="17"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.2"
            strokeLinecap="round"
            strokeLinejoin="round"
            style={{ marginLeft: 8 }}
          >
            <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
            <polyline points="15 3 21 3 21 9" />
            <line x1="10" y1="14" x2="21" y2="3" />
          </svg>
        </button>

        <p style={ss.footer}>
          &copy; {new Date().getFullYear()} Ahana IT Solutions &mdash; Work
          Quantify Tool
        </p>
      </div>

      {/* ── Role Selection Modal Overlay ─────────────────────────────────── */}
      {showRoleModal && pendingLogin && (
        <div style={rm.overlay}>
          <div style={rm.modal}>
            <div style={rm.header}>
              <div style={rm.iconCircle}>
                <FiBriefcase size={26} color="#856bff" />
              </div>
              <h2 style={rm.title}>Select Your Role</h2>
              <p style={rm.subtitle}>
                Your account is registered with multiple roles. Please select
                which role you want to log in as:
              </p>
            </div>

            <div style={rm.roleList}>
              {(Array.isArray(pendingLogin.response.result)
                ? pendingLogin.response.result
                : [pendingLogin.response.result]
              ).map((roleItem, index) => {
                const roleName =
                  roleItem.role ||
                  roleItem.designation ||
                  `Role ${index + 1}`;
                const isManager =
                  roleName.toLowerCase().includes("manager") ||
                  roleName.toLowerCase().includes("lead");
                const isAdmin = roleName.toLowerCase().includes("admin");
                const iconColor = isManager
                  ? "#856bff"   /* --color-brand-primary */
                  : isAdmin
                  ? "#7062e4"   /* --color-brand-button */
                  : "#10b981"; /* success green */
                return (
                  <button
                    key={index}
                    onClick={() => handleSelectRole(roleItem)}
                    style={rm.roleCard}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.borderColor = "#856bff";
                      e.currentTarget.style.backgroundColor = "#f1eeff";
                      e.currentTarget.style.transform = "translateY(-1px)";
                      e.currentTarget.style.boxShadow =
                        "0 4px 12px rgba(133,107,255,0.15)";
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.borderColor = "#e2e8f0";
                      e.currentTarget.style.backgroundColor = "#faf8ff";
                      e.currentTarget.style.transform = "translateY(0)";
                      e.currentTarget.style.boxShadow = "none";
                    }}
                  >
                    <div style={rm.roleIconBg(iconColor)}>
                      {isManager ? (
                        <FiBriefcase size={20} color="white" />
                      ) : isAdmin ? (
                        <FiShield size={20} color="white" />
                      ) : (
                        <FiUser size={20} color="white" />
                      )}
                    </div>
                    <div style={rm.roleInfo}>
                      <span style={rm.roleTitle}>Login as {roleName}</span>
                      <span style={rm.roleSub}>
                        {roleItem.designation &&
                        roleItem.designation !== roleName
                          ? `Designation: ${roleItem.designation}`
                          : roleItem.role}
                      </span>
                    </div>
                    <FiChevronRight size={20} color="#94a3b8" />
                  </button>
                );
              })}
            </div>

            <div style={rm.footer}>
              <button
                onClick={() => {
                  setShowRoleModal(false);
                  setPendingLogin(null);
                  setLoading(false);
                }}
                style={rm.cancelButton}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

/* ─── SSO-required / session-expired screen styles ──────────────────────── */
/* ─── Session-expired / auth-required screen styles (WorkQuantify brand) ─── */
const ss = {
  page: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    minHeight: "100vh",
    background: "#faf8ff",                        /* --color-surface-page */
    fontFamily:
      "'Roboto', system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
    padding: "24px",
    boxSizing: "border-box",
  },
  card: {
    background: "#ffffff",                         /* --color-surface-card */
    border: "1px solid #e2e8f0",                  /* --color-line-card */
    borderRadius: "20px",
    boxShadow:
      "0 0 0 1px rgba(133,107,255,0.08), 0 12px 40px rgba(133,107,255,0.12), 0 2px 8px rgba(0,0,0,0.06)",
    padding: "44px 40px 36px",
    width: "100%",
    maxWidth: "440px",
    textAlign: "center",
    boxSizing: "border-box",
  },
  lockWrap: {
    display: "flex",
    justifyContent: "center",
    marginBottom: "24px",
  },
  lockIcon: {
    width: "72px",
    height: "72px",
    borderRadius: "20px",
    background: "linear-gradient(135deg,#856bff 0%,#7062e4 100%)",  /* --color-brand-primary */
    boxShadow: "0 8px 24px rgba(133,107,255,0.35)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
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
    color: "#1e272e",                             /* --color-ink-primary */
    margin: "0 0 14px 0",
    letterSpacing: "-0.3px",
  },
  sub: {
    fontSize: "14px",
    color: "#8a91a0",                             /* --color-ink-muted */
    margin: "0 0 20px 0",
  },
  desc: {
    fontSize: "14px",
    color: "#434655",                             /* --color-ink-secondary */
    lineHeight: "1.65",
    margin: "0 0 28px 0",
  },
  ssoPill: {
    display: "flex",
    alignItems: "flex-start",
    gap: "14px",
    background: "#f1eeff",                        /* --color-action-primary-soft */
    border: "1px solid #d9d0ff",                 /* --color-badge-brand-line */
    borderRadius: "12px",
    padding: "16px 18px",
    marginBottom: "28px",
    textAlign: "left",
  },
  ssoPillTitle: {
    fontSize: "11px",
    fontWeight: "700",
    letterSpacing: "0.08em",
    color: "#856bff",                             /* --color-brand-primary */
    margin: "0 0 4px 0",
  },
  ssoPillSub: {
    fontSize: "13px",
    color: "#434655",                             /* --color-ink-secondary */
    margin: 0,
    lineHeight: "1.5",
  },
  portalBtn: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    width: "100%",
    padding: "14px 24px",
    background: "linear-gradient(135deg,#856bff 0%,#7062e4 100%)",  /* --color-brand-primary */
    boxShadow: "0 4px 16px rgba(133,107,255,0.3)",
    color: "#ffffff",                             /* --color-ink-on-primary */
    border: "none",
    borderRadius: "10px",
    fontSize: "15px",
    fontWeight: "700",
    cursor: "pointer",
    transition: "all 0.2s ease",
    marginBottom: "24px",
    boxSizing: "border-box",
  },
  footer: {
    fontSize: "11px",
    color: "#8a91a0",                             /* --color-ink-muted */
    margin: 0,
  },
  spinner: {
    width: "28px",
    height: "28px",
    border: "3px solid #f1eeff",                 /* --color-action-primary-soft */
    borderTop: "3px solid #856bff",              /* --color-brand-primary */
    borderRadius: "50%",
    animation: "spin 0.9s linear infinite",
    margin: "20px auto 0",
  },
};

/* ─── Role-picker modal styles (WorkQuantify brand tokens) ──────────────── */
const rm = {
  overlay: {
    position: "fixed",
    inset: 0,
    backgroundColor: "rgba(30, 39, 46, 0.6)",   /* --color-ink-primary at 60% */
    backdropFilter: "blur(6px)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    zIndex: 9999,
    padding: "20px",
  },
  modal: {
    background: "#ffffff",                        /* --color-surface-card */
    border: "1px solid #e2e8f0",                 /* --color-line-card */
    borderRadius: "16px",
    boxShadow: "0 12px 40px rgba(133,107,255,0.12), 0 2px 8px rgba(0,0,0,0.08)",
    width: "100%",
    maxWidth: "440px",
    padding: "32px 28px 24px",
    textAlign: "center",
    boxSizing: "border-box",
  },
  header: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    marginBottom: "24px",
  },
  iconCircle: {
    width: "60px",
    height: "60px",
    borderRadius: "50%",
    background: "#f1eeff",                        /* --color-action-primary-soft */
    border: "2px solid #d9d0ff",                 /* --color-badge-brand-line */
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: "14px",
  },
  title: {
    fontSize: "20px",
    fontWeight: "700",
    color: "#1e272e",                            /* --color-ink-primary */
    margin: "0 0 6px 0",
    letterSpacing: "-0.2px",
  },
  subtitle: {
    fontSize: "13px",
    color: "#8a91a0",                            /* --color-ink-muted */
    lineHeight: "1.5",
    margin: 0,
  },
  roleList: {
    display: "flex",
    flexDirection: "column",
    gap: "10px",
    marginBottom: "20px",
    marginTop: "4px",
  },
  roleCard: {
    display: "flex",
    alignItems: "center",
    gap: "14px",
    padding: "13px 16px",
    background: "#faf8ff",                       /* --color-surface-page */
    border: "1.5px solid #e2e8f0",              /* --color-line-card */
    borderRadius: "10px",
    cursor: "pointer",
    textAlign: "left",
    transition: "all 0.18s ease",
    width: "100%",
    boxSizing: "border-box",
  },
  roleIconBg: (bgColor) => ({
    width: "40px",
    height: "40px",
    borderRadius: "10px",
    background: bgColor,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  }),
  roleInfo: {
    display: "flex",
    flexDirection: "column",
    flex: 1,
    overflow: "hidden",
  },
  roleTitle: {
    fontSize: "14px",
    fontWeight: "600",
    color: "#1e272e",                           /* --color-ink-primary */
  },
  roleSub: {
    fontSize: "12px",
    color: "#8a91a0",                           /* --color-ink-muted */
    marginTop: "2px",
  },
  footer: { display: "flex", justifyContent: "center", paddingTop: "4px" },
  cancelButton: {
    background: "transparent",
    border: "1px solid #e2e8f0",               /* --color-line-card */
    color: "#434655",                           /* --color-ink-secondary */
    fontSize: "13px",
    fontWeight: "500",
    cursor: "pointer",
    padding: "8px 24px",
    borderRadius: "8px",
    transition: "all 0.15s ease",
  },
};
