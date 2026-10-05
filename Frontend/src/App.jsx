import React from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { Toaster } from "react-hot-toast";
import Login from "./pages/Login";
import { SessionExpiredModal } from "@/components/SessionExpiredModal";
import Dashboard from "@/features/dashboard/DashboardPage";
// import ProtectedRoute from '@/components/ui/ProtectedRoute/ProtectedRoute';
import MainLayout from "@/components/layout/AppLayout/AppLayout";
import { usePostMessageLogin } from "@/hooks/usePostMessageLogin";

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
import ReconPage from "./pages/Recon";
import ReconciliationUpload from "./pages/ReconciliationUpload";

/**
 * Runs the app-wide UAT postMessage listener and shows the role picker when
 * a login resolves to more than one role. Needs to sit inside BrowserRouter
 * (useNavigate/useDispatch require it) but above the Routes so it's alive
 * on every screen, not just /quantification.
 */
function AppShell() {
  const { pendingRoleChoice, selectRole, dismissRoleChoice } =
    usePostMessageLogin();

  return (
    <>
      <Routes>
        {/* Login Route (manual fallback + still works if opened directly) */}
        <Route path="/quantification" element={<Login />} />

        {/* Protected Routes with MainLayout */}
        <Route path="/" element={<MainLayout />}>
          {/* Bare "/" → redirect to auth screen */}
          <Route index element={<Navigate to="/quantification" replace />} />
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="projects" element={<ProjectsPage />} />
          <Route path="projects/import" element={<ImportProjectPage />} />
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
          <Route path="approvals" element={<Approvals />} />
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

        {/* Default redirect to login */}
        <Route path="*" element={<Navigate to="/quantification" />} />
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
    <BrowserRouter>
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
      <SessionExpiredModal />
    </BrowserRouter>
  );
}

export default App;
