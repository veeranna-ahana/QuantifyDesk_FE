// src/auth/ProtectedRoute.jsx
// Mirrors PCM's ProtectedRoute.jsx exactly, but reads auth state from Redux
// (via the thin AuthContext layer) instead of PCM's standalone context.
//
// WHY: QuantifyDesk had this file commented out with a TODO. Without it any
//      authenticated user — regardless of role — can reach admin-only pages.
//      PCM protects routes via `allowedRoles`; QuantifyDesk should too.

import React from "react";
import { Navigate, Outlet } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import Cookies from "js-cookie";

import { getSessionToken } from "@/auth/sessionStore";
import { isExpired } from "@/auth/tokenUtils";
import { logoutUser } from "@/store/slices/authSlice";

/**
 * ProtectedRoute
 *
 * Usage (matches PCM's pattern):
 *   <Route element={<ProtectedRoute allowedRoles={["admin", "superadmin"]} />}>
 *     <Route path="/create" element={<CreateProject />} />
 *   </Route>
 *
 * @param {string[]} allowedRoles  Optional list of roles that may access the
 *                                 children. Empty array = any authenticated user.
 */
const ProtectedRoute = ({ allowedRoles = [] }) => {
  const dispatch = useDispatch();
  const user = useSelector((state) => state.auth?.user ?? null);
  const loading = useSelector((state) => state.auth?.loading ?? false);

  const portalToken = Cookies.get("access_token") || localStorage.getItem("sso_token");
  const sessionToken = getSessionToken();
  const isSessionValid = Boolean(portalToken && sessionToken && !isExpired(sessionToken));

  // Show a loading indicator while SSOHandler is fetching user details.
  // This prevents the flash-of-unauthorized-content on first load.
  if (loading) {
    return (
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          height: "100vh",
          color: "var(--color-ink-secondary, #6b7280)",
          fontSize: "15px",
        }}
      >
        Loading user session…
      </div>
    );
  }

  // Not authenticated or tokens invalidated → redirect to Unauthorized / Logged Out modal
  if (!user || !isSessionValid) {
    if (user && !isSessionValid) {
      dispatch(logoutUser());
    }
    return <Navigate to="/unauthorized" replace />;
  }

  // Authenticated but wrong role → redirect to dashboard
  if (allowedRoles.length > 0 && !allowedRoles.includes(user.role)) {
    return <Navigate to="/dashboard" replace />;
  }

  // All checks passed — render child routes
  return <Outlet />;
};

export default ProtectedRoute;
