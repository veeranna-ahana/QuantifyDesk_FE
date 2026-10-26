import React from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { Toaster } from "react-hot-toast";
import { useDispatch, useSelector } from "react-redux";
import Dashboard from "@/features/dashboard/DashboardPage";
import MemberDetailsPage from "@/features/member-details/MemberDetailsPage";
import SkillAnalyticsPage from "@/features/member-details/SkillAnalyticsPage";
// PCM-equivalent: role-based route protection
import ProtectedRoute from "@/auth/ProtectedRoute";
import { AuthProvider } from "@/auth/AuthContext";
import SSOHandler from "@/auth/SSOHandler";
import MainLayout from "@/components/layout/AppLayout/AppLayout";
import { usePostMessageLogin } from "@/hooks/usePostMessageLogin";
import { useSessionWatcher } from "@/hooks/useSessionWatcher";
import { logoutUser } from "@/store/slices/authSlice";
import Unauthorized from "./pages/Unauthorized";
import Login from "./pages/Login";

import Users from "./pages/Users";
import Projects from "./pages/Projects"; // legacy — kept for other routes
import ProjectsPage from "@/features/projects/ProjectsPage";
import ProjectDetailsPage from "@/features/projects/details/ProjectDetailsPage";
import ImportProjectPage from "@/features/projects/import/ImportProjectPage";
import CreateProject from "./pages/CreateProject";
import EditProject from "./pages/EditProject";
import EffortEstimate from "./pages/EffortEstimate";
import Tasks from "./pages/Tasks";
import DailyUpdates from "./pages/DailyUpdate";
import AssignmentScreen from "./pages/Assignment";
import AssignEmployee from "./pages/AssignEmployee";
import MyWork from "./pages/MyWork";
import UtilizationDashboard from "./pages/UtilizationDashboard";
import Approvals from "./pages/Approvals";
import DailyUpdatesReport from "@/features/daily-report/DailyReportPage";
import TimesheetReportPage from "@/features/reports/timesheet-report/TimesheetReportPage";
import ProjectDocumentChecklistPage from "@/features/reports/project-document-checklist/ProjectDocumentChecklistPage";
import ServerInformationPage from "@/features/server-information/ServerInformationPage";
import ServerFormPage from "@/features/server-information/ServerFormPage";
import ReconPage from "./pages/Recon";
import ReconciliationUpload from "./pages/ReconciliationUpload";
import { GuidelinePage, GuidelineFormPage } from "@/features/guideline";
import { useSingleActiveTab } from "@/hooks/useSingleActiveTab";
import { SingleTabRestriction } from "@/components/SingleTabRestriction";
import { redirectToPortal } from "@/shared/sessionExpiry";

/**
 * Runs the app-wide UAT postMessage listener and shows the role picker when
 * a login resolves to more than one role. Needs to sit inside BrowserRouter
 * (useNavigate/useDispatch require it) but above the Routes so it's alive
 * on every screen, not just /quantification.
 */
function AppShell() {
  const user = useSelector((state) => state.auth?.user);
  const loading = useSelector((state) => state.auth?.loading);
  const userId = user?.emp_id;
  const accountId = userId || "anonymous";
  const { status, retry } = useSingleActiveTab(accountId);
  const [sessionExpired, setSessionExpired] = React.useState(false);
  const {
    authStatus,
    pendingRoleChoice,
    selectRole,
    dismissRoleChoice,
  } =
    usePostMessageLogin();
  useSessionWatcher();

  React.useEffect(() => {
    const showExpiredSession = (event) =>
      setSessionExpired(event.detail?.reason || "portal_token_expired");
    window.addEventListener("auth-session-expired", showExpiredSession);
    return () =>
      window.removeEventListener("auth-session-expired", showExpiredSession);
  }, []);

  if (sessionExpired || authStatus === "logged_out") {
    return <LoggedOutScreen reason={sessionExpired || "logged_out"} />;
  }

  if (status !== "active") {
    return status === "checking" ? (
      <main className="flex min-h-screen items-center justify-center bg-[#070c16] text-slate-300">
        <p role="status">Checking application access…</p>
      </main>
    ) : status === "blocked" ? (
      <SingleTabRestriction />
    ) : (
      <main className="flex min-h-screen items-center justify-center bg-[#070c16] p-6 text-center text-slate-300">
        <section role="alert" className="max-w-md">
          <h1 className="text-xl font-semibold text-white">
            Unable to verify this tab
          </h1>
          <p className="mt-3 text-sm">
            We could not verify that this tab has exclusive access. Please try
            again.
          </p>
          <button
            type="button"
            onClick={retry}
            className="mt-6 rounded-control bg-action-primary px-4 py-2 text-sm font-medium text-ink-on-primary hover:bg-action-primary-hover"
          >
            Try again
          </button>
        </section>
      </main>
    );
  }

  if (authStatus === "authenticating" || loading) {
    return <Login />;
  }

  if (authStatus !== "authenticated" || !user) {
    return <LoggedOutScreen reason="logged_out" />;
  }

  return (
    <AuthenticatedApp
      pendingRoleChoice={pendingRoleChoice}
      selectRole={selectRole}
      dismissRoleChoice={dismissRoleChoice}
    />
  );
}

export function LoggedOutScreen({ reason }) {
  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-[9999] flex items-center justify-center bg-[#1e272e]/60 p-6 backdrop-blur-md"
    >
      <div className="w-full max-w-sm rounded-2xl border border-line-card bg-surface-card p-7 text-center shadow-[0_12px_40px_rgba(133,107,255,0.12),0_2px_8px_rgba(0,0,0,0.08)]">
        <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full border-2 border-[#d9d0ff] bg-action-primary-soft text-action-primary shadow-sm">
          <svg
            width="26"
            height="26"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
          >
            <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
            <polyline points="16 17 21 12 16 7" />
            <line x1="21" y1="12" x2="9" y2="12" />
          </svg>
        </div>
        <h2 id="logged-out-title" className="text-xl font-bold tracking-[-0.2px] text-ink-primary">
          Logged Out
        </h2>
        <p id="logged-out-description" className="mt-2 text-sm leading-relaxed text-ink-secondary">
          You have been signed out from the MyAhana Portal.
          <br />
          Please log in again to continue.
        </p>
        <div className="my-5 h-px bg-line-card" />
        <button
          type="button"
          onClick={() => redirectToPortal(reason)}
          className="w-full rounded-control bg-action-primary px-4 py-2.5 text-sm font-semibold text-ink-on-primary shadow-[0_4px_16px_rgba(133,107,255,0.25)] transition-all hover:bg-action-primary-hover active:scale-[0.99]"
        >
          Go to Login
        </button>
      </div>
    </div>
  );
}

function AuthenticatedApp({
  pendingRoleChoice,
  selectRole,
  dismissRoleChoice,
}) {
  const dispatch = useDispatch();

  React.useEffect(() => {
    const clearAuthState = () => dispatch(logoutUser());
    window.addEventListener("auth-logout", clearAuthState);
    return () => window.removeEventListener("auth-logout", clearAuthState);
  }, [dispatch]);

  return (
    <>
      <Routes>
        <Route path="/" element={<Navigate to="/dashboard" replace />} />

        {/* Unauthorized page — accessible without authentication */}
        <Route path="/unauthorized" element={<Unauthorized />} />

        {/* Protected Routes with MainLayout */}
        {/* WHY ProtectedRoute: matches PCM's pattern — any unauthenticated user
            is redirected to /unauthorized instead of silently looping */}
        <Route element={<ProtectedRoute />}>
          <Route path="/" element={<MainLayout />}>
          {/* Bare "/" → redirect to auth screen */}
          <Route index element={<Navigate to="/quantification" replace />} />
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="member-details" element={<MemberDetailsPage />} />
          <Route path="member-details/skill-analytics" element={<SkillAnalyticsPage />} />
          <Route path="projects" element={<ProjectsPage />} />
          <Route path="projects/import" element={<ImportProjectPage />} />
          <Route
            path="projects/import/:projectInfoId"
            element={<ImportProjectPage />}
          />
          <Route path="projects/:id" element={<ProjectDetailsPage />} />
          <Route path="projects/create" element={<CreateProject />} />
          <Route path="projects/edit" element={<EditProject />} />
          <Route path="projects/effort" element={<EffortEstimate />} />
          <Route path="users" element={<Users />} />
          <Route path="tasks" element={<Tasks />} />
          <Route path="daily-update" element={<DailyUpdates />} />
          <Route path="assignments" element={<AssignmentScreen />} />
          <Route path="assignments/assign" element={<AssignEmployee />} />
          <Route path="my-work" element={<MyWork />} />
          <Route path="quantificationnew" element={<UtilizationDashboard />} />
          <Route path="dailyreport" element={<DailyUpdatesReport />} />
          <Route path="reports/timesheet" element={<TimesheetReportPage />} />
          <Route
            path="reports/project-document-checklist"
            element={<ProjectDocumentChecklistPage />}
          />
          <Route path="approvals" element={<Approvals />} />
          <Route path="guideline" element={<GuidelinePage />} />
          <Route
            path="guideline/add"
            element={<GuidelineFormPage mode="add" />}
          />
          <Route
            path="guideline/edit/:id"
            element={<GuidelineFormPage mode="edit" />}
          />
          <Route
            path="guideline/:id"
            element={<GuidelineFormPage mode="view" />}
          />
          <Route
            path="server-information"
            element={<ServerInformationPage />}
          />
          <Route path="server-information/add" element={<ServerFormPage />} />
          <Route
            path="server-information/:id/edit"
            element={<ServerFormPage />}
          />
          {/* ─── Reconciliation Routes ─── */}
          <Route path="reconciliation/dashboard" element={<ReconPage />} />
          <Route
            path="reconciliation/upload"
            element={<ReconciliationUpload />}
          />
          <Route
            path="reconciliation"
            element={<Navigate to="/reconciliation/upload" replace />}
          />
          </Route>
        </Route>

        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>

      {pendingRoleChoice && (
        <div style={roleModalStyles.overlay}>
          <div style={roleModalStyles.modal}>
            {/* Icon circle */}
            <div style={roleModalStyles.iconCircle}>
              <svg
                width="28"
                height="28"
                viewBox="0 0 24 24"
                fill="none"
                stroke="#856bff"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                <circle cx="9" cy="7" r="4" />
                <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
                <path d="M16 3.13a4 4 0 0 1 0 7.75" />
              </svg>
            </div>
            <h2 style={roleModalStyles.title}>Select Your Role</h2>
            <p style={roleModalStyles.subtitle}>
              Your account is registered with multiple roles. Please select
              which one to log in as:
            </p>
            <div style={roleModalStyles.roleList}>
              {(Array.isArray(pendingRoleChoice.response.result)
                ? pendingRoleChoice.response.result
                : [pendingRoleChoice.response.result]
              ).map((roleItem, i) => (
                <button
                  key={i}
                  onClick={() => selectRole(roleItem)}
                  style={roleModalStyles.roleCard}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.borderColor = "#856bff";
                    e.currentTarget.style.background = "#f1eeff";
                    e.currentTarget.style.transform = "translateY(-1px)";
                    e.currentTarget.style.boxShadow =
                      "0 4px 12px rgba(133,107,255,0.15)";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.borderColor = "#e2e8f0";
                    e.currentTarget.style.background = "#faf8ff";
                    e.currentTarget.style.transform = "translateY(0)";
                    e.currentTarget.style.boxShadow = "none";
                  }}
                >
                  <div
                    style={{
                      width: 36,
                      height: 36,
                      borderRadius: 8,
                      flexShrink: 0,
                      background: "#f1eeff",
                      border: "1px solid #d9d0ff",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    <svg
                      width="16"
                      height="16"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="#856bff"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                      <circle cx="12" cy="7" r="4" />
                    </svg>
                  </div>
                  <span
                    style={{
                      flex: 1,
                      textAlign: "left",
                      fontSize: 14,
                      fontWeight: 600,
                      color: "#1e272e",
                    }}
                  >
                    Login as{" "}
                    {roleItem.role || roleItem.designation || `Role ${i + 1}`}
                  </span>
                  <svg
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="#8a91a0"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <polyline points="9 18 15 12 9 6" />
                  </svg>
                </button>
              ))}
            </div>
            <button
              onClick={dismissRoleChoice}
              style={roleModalStyles.cancelButton}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = "#856bff";
                e.currentTarget.style.color = "#856bff";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = "#e2e8f0";
                e.currentTarget.style.color = "#434655";
              }}
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </>
  );
}

const roleModalStyles = {
  overlay: {
    position: "fixed",
    inset: 0,
    background: "rgba(30, 39, 46, 0.6)" /* --color-ink-primary at 60% */,
    backdropFilter: "blur(6px)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    zIndex: 9999,
    padding: 20,
  },
  modal: {
    background: "#ffffff" /* --color-surface-card */,
    border: "1px solid #e2e8f0" /* --color-line-card */,
    borderRadius: 16,
    boxShadow: "0 12px 40px rgba(133,107,255,0.12), 0 2px 8px rgba(0,0,0,0.08)",
    width: "100%",
    maxWidth: 440,
    padding: "32px 28px 24px",
    textAlign: "center",
    boxSizing: "border-box",
  },
  iconCircle: {
    width: 60,
    height: 60,
    borderRadius: "50%",
    background: "#f1eeff" /* --color-action-primary-soft */,
    border: "2px solid #d9d0ff" /* --color-badge-brand-line */,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    margin: "0 auto 14px",
  },
  title: {
    fontSize: 20,
    fontWeight: 700,
    color: "#1e272e" /* --color-ink-primary */,
    margin: "0 0 6px 0",
    letterSpacing: "-0.2px",
  },
  subtitle: {
    fontSize: 13,
    color: "#8a91a0" /* --color-ink-muted */,
    margin: "0 0 20px 0",
    lineHeight: 1.5,
  },
  roleList: {
    display: "flex",
    flexDirection: "column",
    gap: 10,
    marginBottom: 20,
  },
  roleCard: {
    display: "flex",
    alignItems: "center",
    gap: 14,
    padding: "13px 16px",
    background: "#faf8ff" /* --color-surface-page */,
    border: "1.5px solid #e2e8f0" /* --color-line-card */,
    borderRadius: 10,
    cursor: "pointer",
    textAlign: "left",
    transition: "all 0.18s ease",
    width: "100%",
    boxSizing: "border-box",
    fontWeight: 600,
    color: "#1e272e" /* --color-ink-primary */,
    fontSize: 14,
  },
  cancelButton: {
    background: "transparent",
    border: "1px solid #e2e8f0" /* --color-line-card */,
    color: "#434655" /* --color-ink-secondary */,
    fontSize: 13,
    fontWeight: 500,
    cursor: "pointer",
    padding: "8px 24px",
    borderRadius: 8,
    transition: "all 0.15s ease",
  },
};

function App() {
  return (
   <BrowserRouter basename="/quantification">
      <AuthProvider>
        {/*
          SSOHandler mirrors PCM's SSOHandler.jsx:
          On mount it checks for an existing quantify_access_token cookie.
          If found it calls employee_details + validate-roles to hydrate the
          Redux store with a fully-enriched user profile (including RBAC role).
          This handles the page-refresh scenario where Redux was cleared but
          the session cookie is still valid.
        */}
        <SSOHandler>
          <Toaster
            position="top-right"
            toastOptions={{
              duration: 3500,
              style: {
                borderRadius: "var(--radius-md)",
                fontWeight: 700,
                fontSize: "var(--font-size-body)",
                minWidth: "280px",
                maxWidth: "420px",
                boxShadow: "var(--shadow-toast)",
              },
              success: {
                style: {
                  background: "var(--color-accent-success)",
                  color: "var(--color-neutral-0)",
                },
              },
              error: {
                style: {
                  background: "var(--color-accent-error-strong)",
                  color: "var(--color-neutral-0)",
                },
              },
            }}
          />
          <AppShell />
        </SSOHandler>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
