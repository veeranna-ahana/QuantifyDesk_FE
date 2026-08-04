import React, { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import axiosInstance from "../../src/shared/axiosInstance";
import { loginUser } from "../../src/store/slices/authSlice";
import { FiSettings, FiBriefcase, FiUser, FiShield, FiChevronRight, FiCheckCircle } from "react-icons/fi";
import { login } from "../../src/api/AuthApi";

export default function Login() {
  console.log("frontend loading");

  const navigate = useNavigate();
  const dispatch = useDispatch();

  const [authReady, setAuthReady] = useState(false);
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showManualLogin, setShowManualLogin] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  // Role selection modal states
  const [showRoleModal, setShowRoleModal] = useState(false);
  const [pendingLogin, setPendingLogin] = useState(null); // { response, redirectPath }

  /* ─── Listen for postMessage token ─── */
  useEffect(() => {
    const handleMessage = (event) => {
      console.log("Received postMessage event:", event);
      const allowedOrigin = import.meta.env.VITE_MYAHANA_BASE_URL;
      // if (!allowedOrigin.includes(event.origin)) return;

      console.log("Received postMessage:", event.data);
      if (event.data.type === "TOKEN" || event.data.type === "token") {
        const { token, email, emp_id } = event.data;
        if (token) localStorage.setItem("token", token);
        if (email) localStorage.setItem("email", email);
        if (emp_id) localStorage.setItem("emp_id", emp_id);
        setUserData({ token, email, emp_id });
        setAuthReady(true);
      }
    };

    window.addEventListener("message", handleMessage);

    const t = setTimeout(() => {
      const token = localStorage.getItem("token");
      const email = localStorage.getItem("email");
      const emp_id = localStorage.getItem("emp_id");
      if (token) {
        setUserData({ token, email, emp_id });
        setAuthReady(true);
      } else {
        // Show manual login UI if no token found after 1.5s
        setLoading(false);
        setShowManualLogin(true);
      }
    }, 1500);

    return () => {
      window.removeEventListener("message", handleMessage);
      clearTimeout(t);
    };
  }, []);

  console.log("userdata", userData);
  console.log("authReady", authReady);

  /* ─── Helper to handle login response and check for multiple roles ─── */
  const processLoginResult = (response, redirectPath) => {
    const rawResult = response.result;
    const rolesList = Array.isArray(rawResult) ? rawResult : (rawResult ? [rawResult] : []);

    if (rolesList.length > 1) {
      setPendingLogin({ response, redirectPath });
      setShowRoleModal(true);
      setLoading(false);
    } else {
      dispatch(loginUser(response));
      navigate(redirectPath);
    }
  };

  /* ─── Role modal selection handler ─── */
  const handleSelectRole = (selectedRoleObj) => {
    if (!pendingLogin) return;
    const { response, redirectPath } = pendingLogin;

    const rawResult = response.result;
    const allRoles = Array.isArray(rawResult) ? rawResult : [rawResult];
    const otherRoles = allRoles.filter((r) => r !== selectedRoleObj);
    const reorderedResult = [selectedRoleObj, ...otherRoles];

    const updatedResponse = {
      ...response,
      result: reorderedResult,
    };

    dispatch(loginUser(updatedResponse));
    setShowRoleModal(false);
    setPendingLogin(null);
    navigate(redirectPath);
  };

  /* ─── Auto login when MyAhana token received ─── */
  useEffect(() => {
    if (!authReady || !userData) return;

    const doLogin = async () => {
      console.log("Auto login triggered with userData:", userData);
      setLoading(true);

      try {
        console.log("entered try block for login");
        const response = await login({
          email: userData.email || "",
          password: "",
          emp_id: userData.emp_id || undefined,
          authToken: userData.token,  // Pass MyAhana token
        });
        console.log("login response", response);

        if (response.status === "success") {
          processLoginResult(response, "/quantificationnew");
        } else {
          setError("Login failed. Please try again.");
          setLoading(false);
        }
      } catch (err) {
        console.error("Auto login failed:", err);
        setError(err.response?.data?.message || "Login failed");
        setLoading(false);
      }
    };

    doLogin();
  }, [authReady, userData, dispatch, navigate]);

  /* ─── Manual login handler ─── */
  const handleManualLogin = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      // Check if we have an authToken from MyAhana
      const authToken = localStorage.getItem("token");

      const response = await login({
        email,
        password,
        emp_id: undefined,
        authToken: authToken || undefined,  // Pass token if available
      });

      if (response.status === "success") {
        processLoginResult(response, "/quantification");
      } else {
        setError(response.message || "Login failed");
        setLoading(false);
      }
    } catch (err) {
      console.error("Manual login failed:", err);
      setError(err.response?.data?.message || "Invalid email or password");
      setLoading(false);
    }
  };

  // Show loading state
  if (loading && !showManualLogin && !showRoleModal) {
    return (
      <div style={styles.container}>
        <div style={styles.card}>
          <div style={styles.logo}>QD</div>
          <h1 style={styles.title}>QuantifyDesk</h1>
          <p style={styles.subtitle}>Loading...</p>
          <div style={styles.spinner}></div>
        </div>
      </div>
    );
  }

  // Render main UI with manual login form or role modal overlay
  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <div style={styles.logo}>QD</div>
        <h1 style={styles.title}>QuantifyDesk</h1>
        <p style={styles.subtitle}>Sign in to your account</p>

        <form onSubmit={handleManualLogin} style={styles.form}>
          <div style={styles.formGroup}>
            <label style={styles.label}>Email Address</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="your@email.com"
              required
              style={styles.input}
              disabled={loading}
            />
          </div>

          <div style={styles.formGroup}>
            <label style={styles.label}>Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
              style={styles.input}
              disabled={loading}
            />
          </div>

          {error && <div style={styles.error}>{error}</div>}

          <button
            type="submit"
            style={{
              ...styles.button,
              opacity: loading ? 0.7 : 1,
              cursor: loading ? "not-allowed" : "pointer",
            }}
            disabled={loading}
          >
            {loading ? "Signing in..." : "Sign In"}
          </button>
        </form>

        <p style={styles.footer}>
          © 2026 QuantifyDesk. All rights reserved.
        </p>
      </div>

      {/* ── Role Selection Modal Overlay ── */}
      {showRoleModal && pendingLogin && (
        <div style={modalStyles.overlay}>
          <div style={modalStyles.modal}>
            <div style={modalStyles.header}>
              <div style={modalStyles.iconCircle}>
                <FiBriefcase size={26} color="#667eea" />
              </div>
              <h2 style={modalStyles.title}>Select Your Role</h2>
              <p style={modalStyles.subtitle}>
                Your account is registered with multiple roles. Please select which role you want to log in as:
              </p>
            </div>

            <div style={modalStyles.roleList}>
              {(Array.isArray(pendingLogin.response.result)
                ? pendingLogin.response.result
                : [pendingLogin.response.result]
              ).map((roleItem, index) => {
                const roleName = roleItem.role || roleItem.designation || `Role ${index + 1}`;
                const isManager =
                  roleName.toLowerCase().includes("manager") ||
                  roleName.toLowerCase().includes("lead");
                const isAdmin = roleName.toLowerCase().includes("admin");

                const iconColor = isManager ? "#667eea" : isAdmin ? "#764ba2" : "#10b981";

                return (
                  <button
                    key={index}
                    onClick={() => handleSelectRole(roleItem)}
                    style={modalStyles.roleCard}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.borderColor = "#667eea";
                      e.currentTarget.style.backgroundColor = "#f0f3ff";
                      e.currentTarget.style.transform = "translateY(-1px)";
                      e.currentTarget.style.boxShadow = "0 4px 12px rgba(102, 126, 234, 0.15)";
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.borderColor = "#e2e8f0";
                      e.currentTarget.style.backgroundColor = "#f8fafc";
                      e.currentTarget.style.transform = "translateY(0)";
                      e.currentTarget.style.boxShadow = "none";
                    }}
                  >
                    <div style={modalStyles.roleIconBg(iconColor)}>
                      {isManager ? (
                        <FiBriefcase size={20} color="white" />
                      ) : isAdmin ? (
                        <FiShield size={20} color="white" />
                      ) : (
                        <FiUser size={20} color="white" />
                      )}
                    </div>
                    <div style={modalStyles.roleInfo}>
                      <span style={modalStyles.roleTitle}>Login as {roleName}</span>
                      <span style={modalStyles.roleSub}>
                        {roleItem.designation && roleItem.designation !== roleName
                          ? `Designation: ${roleItem.designation}`
                          : roleItem.role
                        }
                      </span>
                    </div>
                    <FiChevronRight size={20} color="#94a3b8" />
                  </button>
                );
              })}
            </div>

            <div style={modalStyles.footer}>
              <button
                onClick={() => {
                  setShowRoleModal(false);
                  setPendingLogin(null);
                  setLoading(false);
                  setShowManualLogin(true);
                }}
                style={modalStyles.cancelButton}
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

const styles = {
  container: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    minHeight: "100vh",
    background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
    fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
  },
  card: {
    background: "white",
    borderRadius: "12px",
    boxShadow: "0 20px 60px rgba(0, 0, 0, 0.3)",
    padding: "40px",
    width: "100%",
    maxWidth: "400px",
    textAlign: "center",
  },
  logo: {
    fontSize: "42px",
    fontWeight: "800",
    color: "#667eea",
    marginBottom: "16px",
  },
  title: {
    fontSize: "28px",
    fontWeight: "700",
    color: "#1e272e",
    margin: "0 0 8px 0",
  },
  subtitle: {
    fontSize: "14px",
    color: "#666",
    margin: "0 0 32px 0",
  },
  form: {
    display: "flex",
    flexDirection: "column",
    gap: "16px",
  },
  formGroup: {
    textAlign: "left",
  },
  label: {
    fontSize: "13px",
    fontWeight: "600",
    color: "#333",
    display: "block",
    marginBottom: "6px",
  },
  input: {
    width: "100%",
    padding: "10px 12px",
    border: "1px solid #ddd",
    borderRadius: "6px",
    fontSize: "14px",
    fontFamily: "inherit",
    transition: "border 0.2s",
    boxSizing: "border-box",
  },
  button: {
    background: "#667eea",
    color: "white",
    border: "none",
    padding: "10px 16px",
    borderRadius: "6px",
    fontSize: "14px",
    fontWeight: "600",
    transition: "background 0.2s",
    marginTop: "8px",
  },
  error: {
    background: "#fee",
    color: "#c33",
    padding: "10px 12px",
    borderRadius: "6px",
    fontSize: "13px",
    textAlign: "center",
  },
  spinner: {
    width: "24px",
    height: "24px",
    border: "3px solid #f0f0f0",
    borderTop: "3px solid #667eea",
    borderRadius: "50%",
    animation: "spin 1s linear infinite",
    margin: "16px auto",
  },
  footer: {
    fontSize: "12px",
    color: "#999",
    marginTop: "24px",
    margin: "24px 0 0 0",
  },
};

const modalStyles = {
  overlay: {
    position: "fixed",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(15, 23, 42, 0.65)",
    backdropFilter: "blur(6px)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    zIndex: 9999,
    padding: "20px",
  },
  modal: {
    background: "#ffffff",
    borderRadius: "16px",
    boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.25)",
    width: "100%",
    maxWidth: "440px",
    padding: "28px",
    textAlign: "center",
    boxSizing: "border-box",
  },
  header: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    marginBottom: "20px",
  },
  iconCircle: {
    width: "56px",
    height: "56px",
    borderRadius: "50%",
    background: "#eef2ff",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: "12px",
  },
  title: {
    fontSize: "22px",
    fontWeight: "700",
    color: "#1e293b",
    margin: "0 0 6px 0",
  },
  subtitle: {
    fontSize: "14px",
    color: "#64748b",
    lineHeight: "1.4",
    margin: 0,
  },
  roleList: {
    display: "flex",
    flexDirection: "column",
    gap: "12px",
    marginBottom: "20px",
  },
  roleCard: {
    display: "flex",
    alignItems: "center",
    gap: "14px",
    padding: "14px 16px",
    background: "#f8fafc",
    border: "1px solid #e2e8f0",
    borderRadius: "12px",
    cursor: "pointer",
    textAlign: "left",
    transition: "all 0.2s ease",
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
    fontSize: "15px",
    fontWeight: "600",
    color: "#0f172a",
  },
  roleSub: {
    fontSize: "12px",
    color: "#64748b",
    marginTop: "2px",
  },
  footer: {
    display: "flex",
    justifyContent: "center",
  },
  cancelButton: {
    background: "transparent",
    border: "none",
    color: "#64748b",
    fontSize: "13px",
    fontWeight: "500",
    cursor: "pointer",
    padding: "8px 16px",
    borderRadius: "6px",
    transition: "color 0.2s",
  },
};
