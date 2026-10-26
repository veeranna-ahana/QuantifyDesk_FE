// src/pages/Unauthorized.jsx

// WHY: QuantifyDesk had no Unauthorized page — users hitting a protected route
//      while unauthenticated would get a silent redirect to /dashboard which
//      then loops or shows nothing useful.  PCM shows a clear "Access Denied"
//      or "Logged Out" card depending on isAuthenticated.
//
// The logout button behaviour matches PCM's UserMenu.jsx:
//   1. Try to focus the opener window (MyAhana portal) and close this tab.
//   2. Fallback: redirect to VITE_MYAHANA_PORTAL_URL.

import React from "react";
import { useNavigate } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { logoutUser } from "@/store/slices/authSlice";

const portalUrl =
  import.meta.env.VITE_LOGIN_URL ||
  import.meta.env.VITE_PORTAL_URL ||
  import.meta.env.VITE_MYAHANA_PORTAL_URL ||
  "http://20.204.44.218:8000";

const goToLogin = () => {
  // Try to close the child tab and focus the opener (MyAhana portal), matching PCM
  const opener = window.opener;
  if (opener && !opener.closed) {
    try { opener.focus(); } catch { /* ignore */ }
    window.close();
  }
  // Fallback
  if (portalUrl) window.location.href = portalUrl;
};

const Unauthorized = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const user = useSelector((state) => state.auth?.user ?? null);
  const isAuthenticated = !!user;

  const handleLogout = () => {
    dispatch(logoutUser());
    goToLogin();
  };

  return (
    <main className="flex min-h-screen items-center justify-center bg-surface-page p-6">
      <section
        role="alertdialog"
        aria-labelledby="unauth-title"
        aria-describedby="unauth-description"
        className="w-full max-w-md rounded-2xl border border-line-card bg-surface-card p-8 text-center shadow-[0_12px_40px_rgba(133,107,255,0.12),0_2px_8px_rgba(0,0,0,0.08)]"
      >
        {/* Icon */}
        <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full border-2 border-[#d9d0ff] bg-action-primary-soft text-action-primary shadow-sm">
          <svg
            width="28"
            height="28"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
          >
            {isAuthenticated ? (
              // Lock icon for "Access Denied"
              <>
                <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                <path d="M7 11V7a5 5 0 0 1 10 0v4" />
              </>
            ) : (
              // Logout icon for "Logged Out"
              <>
                <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                <polyline points="16 17 21 12 16 7" />
                <line x1="21" y1="12" x2="9" y2="12" />
              </>
            )}
          </svg>
        </div>

        {isAuthenticated ? (
          <>
            <h1
              id="unauth-title"
              className="text-2xl font-bold tracking-[-0.2px] text-ink-primary"
            >
              Access Denied
            </h1>
            <p
              id="unauth-description"
              className="mt-4 text-sm leading-6 text-ink-secondary"
            >
              You do not have permission to view this page or perform this
              action.
            </p>
            <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:justify-center">
              <button
                type="button"
                onClick={() => navigate("/dashboard", { replace: true })}
                className="rounded-control bg-action-primary px-5 py-2.5 text-sm font-semibold text-ink-on-primary shadow-sm transition-colors hover:bg-action-primary-hover"
              >
                Go to Dashboard
              </button>
              <button
                type="button"
                onClick={handleLogout}
                className="rounded-control border border-line-card bg-surface-card px-5 py-2.5 text-sm font-medium text-ink-secondary transition-colors hover:border-line-default hover:text-ink-primary"
              >
                Logout
              </button>
            </div>
          </>
        ) : (
          <>
            <h1
              id="unauth-title"
              className="text-2xl font-bold tracking-[-0.2px] text-ink-primary"
            >
              Logged Out
            </h1>
            <p
              id="unauth-description"
              className="mt-4 text-sm leading-6 text-ink-secondary"
            >
              You have been signed out from the MyAhana Portal.
              <br />
              Please log in again to continue.
            </p>
            <div className="my-5 h-px bg-line-card" />
            <button
              type="button"
              onClick={goToLogin}
              className="w-full rounded-control bg-action-primary px-4 py-3 text-sm font-semibold text-ink-on-primary shadow-[0_4px_16px_rgba(133,107,255,0.25)] transition-all hover:bg-action-primary-hover active:scale-[0.99]"
            >
              Go to Login
            </button>
          </>
        )}
      </section>
    </main>
  );
};

export default Unauthorized;
