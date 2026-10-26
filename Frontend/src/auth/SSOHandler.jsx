// src/auth/SSOHandler.jsx
// Mirrors PCM's SSOHandler.jsx logic, adapted for QuantifyDesk's Redux store.
//
// WHY: PCM's SSOHandler is responsible for:
//   1. Checking if a token exists in the cookie on page load
//   2. If yes → calling employee_details then validate-roles
//   3. Constructing the full user profile with the correct role
//   4. Storing it in context (PCM) / Redux (QD)
//
// QuantifyDesk previously had NO equivalent — the usePostMessageLogin hook
// would dispatch loginUser with whatever the /api/auth/login backend returned,
// but it never confirmed role via the centralized RBAC service.
// This component fills that gap.

import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import Cookies from "js-cookie";
import { getEmployeeDetails, validateRole } from "@/api/ssoApi";
import { loginUser, logoutUser, setLoading } from "@/store/slices/authSlice";

const SESSION_COOKIE = "quantify_access_token";

/**
 * SSOHandler
 * Runs ONCE on mount (or when the token cookie changes).
 * It does NOT replace usePostMessageLogin — it is complementary:
 *   - usePostMessageLogin handles the real-time TOKEN message from the portal
 *   - SSOHandler handles the page-refresh / tab-reopen scenario where a valid
 *     cookie already exists but the Redux store was cleared (e.g. a new tab).
 */
const SSOHandler = ({ children }) => {
  const dispatch = useDispatch();
  const existingUser = useSelector((state) => state.auth?.user);

  useEffect(() => {
    // If Redux already has a valid user profile (from persistence or a
    // fresh postMessage login), skip the re-initialisation.
    if (existingUser) return;

    const initializeAuth = async () => {
      dispatch(setLoading(true));

      const token = Cookies.get("access_token") || localStorage.getItem("sso_token");

      console.log("[SSOHandler] 1. Portal token:", token ? "Exists" : "Missing");

      if (!token) {
        console.warn("[SSOHandler] No portal token found — setting user to null.");
        dispatch(setLoading(false));
        return;
      }

      try {
        // Step 1: Fetch employee details (matches PCM step 1-4)
        console.log("[SSOHandler] 2. Fetching employee_details...");
        const data = await getEmployeeDetails();
        console.log("[SSOHandler] 3. employee_details response:", data);

        const emp_id = data?.emp_id || data?.data?.emp_id;
        console.log("[SSOHandler] 4. emp_id:", emp_id);

        if (!emp_id) throw new Error("Missing emp_id in employee_details response");

        // Step 2: Parallel RBAC validation (matches PCM step 5-6)
        console.log("[SSOHandler] 5. Validating roles for emp_id:", emp_id);
        const [adminVal, superAdminVal, userVal] = await Promise.all([
          validateRole(emp_id, ["Admin"]).catch(() => ({ has_role: false })),
          validateRole(emp_id, ["Super Admin", "SuperAdmin", "super_admin"]).catch(() => ({ has_role: false })),
          validateRole(emp_id, ["User", "user", "Employee", "employee"]).catch(() => ({ has_role: false })),
        ]);

        let determinedRole = null;
        if (superAdminVal?.has_role) determinedRole = "superadmin";
        else if (adminVal?.has_role)  determinedRole = "admin";
        else if (userVal?.has_role)   determinedRole = "user";

        console.log("[SSOHandler] 6. Determined role:", determinedRole);

        // Step 3: Build the full user profile (matches PCM step 7)
        const userProfile = {
          ...data,
          ...(data?.data || {}),
          role: determinedRole || "none",
        };

        console.log("[SSOHandler] 7. Dispatching loginUser with profile:", userProfile);
        dispatch(loginUser({ _directProfile: userProfile }));
      } catch (err) {
        console.error("[SSOHandler] Auth initialisation failed:", err);
        Cookies.remove("access_token", { path: "/" });
        Cookies.remove("quantify_access_token", { path: "/" });
        Cookies.remove("user", { path: "/" });
        localStorage.removeItem("sso_token");
        dispatch(logoutUser());
        window.dispatchEvent(
          new CustomEvent("auth-session-expired", { detail: { reason: "portal_token_expired" } })
        );
      } finally {
        dispatch(setLoading(false));
      }
    };

    initializeAuth();
  }, [dispatch, existingUser]);

  return <>{children}</>;
};

export default SSOHandler;
