import React from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { Toaster } from "react-hot-toast";
import Login from "./pages/Login";
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
                >
                  Login as{" "}
                  {roleItem.role || roleItem.designation || `Role ${i + 1}`}
                </button>
              ))}
            </div>
            <button
              onClick={dismissRoleChoice}
              style={roleModalStyles.cancelButton}
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
    background: "rgba(15,23,42,0.65)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    zIndex: 9999,
    padding: 20,
  },
  modal: {
    background: "#fff",
    borderRadius: 16,
    width: "100%",
    maxWidth: 440,
    padding: 28,
    textAlign: "center",
    boxSizing: "border-box",
  },
  title: {
    fontSize: 22,
    fontWeight: 700,
    color: "#1e293b",
    margin: "0 0 6px 0",
  },
  subtitle: { fontSize: 14, color: "#64748b", margin: "0 0 20px 0" },
  roleList: {
    display: "flex",
    flexDirection: "column",
    gap: 12,
    marginBottom: 20,
  },
  roleCard: {
    padding: "14px 16px",
    background: "#f8fafc",
    border: "1px solid #e2e8f0",
    borderRadius: 12,
    cursor: "pointer",
    fontWeight: 600,
  },
  cancelButton: {
    background: "transparent",
    border: "none",
    color: "#64748b",
    fontSize: 13,
    cursor: "pointer",
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
    </BrowserRouter>
  );
}

export default App;
