import { useEffect, useRef, useState } from "react";
import { useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import Cookies from "js-cookie";

import { login } from "@/api/AuthApi";
import { clearLegacyTokens, getSessionToken } from "@/auth/sessionStore";
import { getExpiry, isExpired } from "@/auth/tokenUtils";
import { loginUser, logoutUser, setLoading } from "@/store/slices/authSlice";
import { logout } from "@/shared/sessionExpiry";
// PCM-equivalent: fetch employee profile + validate RBAC roles after SSO
import { getEmployeeDetails, validateRole } from "@/api/ssoApi";

const getAllowedOrigins = () =>
  (import.meta.env.VITE_ALLOWED_PORTAL_ORIGINS || "")
    .split(",")
    .map((origin) => origin.trim())
    .filter(Boolean);

const getEmployeeId = (message) => {
  const explicitId =
    message.emp_id ?? message.employee_id ?? message.employeeId;
  if (typeof explicitId === "string" || typeof explicitId === "number") {
    const normalizedId = String(explicitId).trim();
    if (normalizedId) return normalizedId;
  }

  if (typeof message.userid === "string") {
    const useridMatch = message.userid.match(/^\d+_(.+)$/);
    if (useridMatch?.[1]) return useridMatch[1];
  }

  return null;
};

// PCM-equivalent: extract ?token=... from URL if provided on initial load
const extractTokenFromUrl = () => {
  try {
    const urlParams = new URLSearchParams(window.location.search);
    const token = urlParams.get("token");
    if (token) {
      urlParams.delete("token");
      const newUrl =
        window.location.pathname +
        (urlParams.toString() ? "?" + urlParams.toString() : "") +
        window.location.hash;
      window.history.replaceState({}, "", newUrl);
      return token;
    }
  } catch {
    /* ignore */
  }
  return null;
};

export function usePostMessageLogin() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [pendingRoleChoice, setPendingRoleChoice] = useState(null);
  const [authStatus, setAuthStatus] = useState(() => {
    const token = getSessionToken();
    const portalToken = Cookies.get("access_token") || localStorage.getItem("sso_token");
    return token && portalToken && !isExpired(token) ? "authenticated" : "awaiting-sso";
  });
  const handledRef = useRef(false);

  useEffect(() => {
    clearLegacyTokens();

    // Check if token was provided in URL query (PCM pattern)
    const urlToken = extractTokenFromUrl();
    if (urlToken && !isExpired(urlToken)) {
      Cookies.set("access_token", urlToken, {
        expires: 1,
        path: "/",
        sameSite: "Lax",
        secure: window.location.protocol === "https:",
      });
      localStorage.setItem("sso_token", urlToken);
    }

    const existingToken = getSessionToken();
    const existingPortalToken = Cookies.get("access_token") || localStorage.getItem("sso_token");
    if (!existingToken || !existingPortalToken || isExpired(existingToken)) {
      dispatch(logoutUser());
    }

    const redirectTimer = window.setTimeout(() => {
      const currentToken = getSessionToken();
      const currentPortalToken = Cookies.get("access_token") || localStorage.getItem("sso_token");
      if ((!currentToken || !currentPortalToken) && !handledRef.current) {
        setAuthStatus("logged_out");
        void logout({ reason: "missing", redirect: false });
      }
    }, 4000);

    const handleMessage = async (event) => {
      const message = event.data;
      const isLogout =
        message?.type === "MYAHANA_LOGOUT" ||
        message?.type === "LOGOUT" ||
        message?.type === "logout" ||
        message?.action === "logout" ||
        message?.event === "logout";

      const isTokenMessage =
        message?.type === "TOKEN" ||
        message?.type === "token";

      if (!isLogout && !isTokenMessage) {
        return;
      }

      const trustedSource =
        (window.parent !== window && event.source === window.parent) ||
        (window.opener && event.source === window.opener);
      if (
        !trustedSource ||
        !getAllowedOrigins().includes(event.origin)
      ) {
        return;
      }

      if (isLogout) {
        window.clearTimeout(redirectTimer);
        Cookies.remove("access_token", { path: "/" });
        Cookies.remove("quantify_access_token", { path: "/" });
        Cookies.remove("user", { path: "/" });
        localStorage.removeItem("sso_token");
        dispatch(logoutUser());
        setAuthStatus("logged_out");
        void logout({ reason: "portal_logout", redirect: false });
        return;
      }

      const { token, email } = message;
      const empId = getEmployeeId(message);
      if (typeof token !== "string" || !token) {
        setAuthStatus("logged_out");
        void logout({ reason: "invalid_handoff", redirect: false });
        return;
      }
      if (!empId) {
        setAuthStatus("logged_out");
        void logout({ reason: "handoff_missing_employee", redirect: false });
        return;
      }
      const portalExpiry = getExpiry(token);
      if (portalExpiry === null) {
        setAuthStatus("logged_out");
        void logout({ reason: "invalid_portal_token", redirect: false });
        return;
      }
      if (isExpired(token)) {
        setAuthStatus("logged_out");
        void logout({ reason: "portal_token_expired", redirect: false });
        return;
      }
      if (handledRef.current) return;
      handledRef.current = true;
      setAuthStatus("authenticating");
      window.clearTimeout(redirectTimer);

      // Store portal token in cookie "access_token" & "sso_token" (identical to PCM)
      Cookies.set("access_token", token, {
        expires: portalExpiry ? new Date(portalExpiry * 1000) : 1,
        path: "/",
        sameSite: "Lax",
        secure: window.location.protocol === "https:",
      });
      localStorage.setItem("sso_token", token);

      try {
        const response = await login({
          email: email || "",
          password: "",
          emp_id: empId,
          authToken: token,
        });
        if (response.status !== "success" || !response.accessToken) {
          setAuthStatus("logged_out");
          void logout({ reason: "sso_failed", redirect: false });
          return;
        }

        const roles = Array.isArray(response.result)
          ? response.result
          : response.result
            ? [response.result]
            : [];
        dispatch(loginUser(response));

        // ── PCM-equivalent RBAC enrichment ──────────────────────────────────
        // Validate with MyAhana portal's employee_details and centralized RBAC
        dispatch(setLoading(true));
        try {
          const empData = await getEmployeeDetails();
          const resolvedEmpId = empData?.emp_id || empData?.data?.emp_id || empId;

          if (resolvedEmpId) {
            const [adminVal, superAdminVal, userVal] = await Promise.all([
              validateRole(resolvedEmpId, ["Admin"]).catch(() => ({ has_role: false })),
              validateRole(resolvedEmpId, ["Super Admin", "SuperAdmin", "super_admin"]).catch(() => ({ has_role: false })),
              validateRole(resolvedEmpId, ["User", "user", "Employee", "employee"]).catch(() => ({ has_role: false })),
            ]);

            let determinedRole = null;
            if (superAdminVal?.has_role)  determinedRole = "superadmin";
            else if (adminVal?.has_role)  determinedRole = "admin";
            else if (userVal?.has_role)   determinedRole = "user";

            console.log("[usePostMessageLogin] RBAC role:", determinedRole);

            const enrichedProfile = {
              ...empData,
              ...(empData?.data || {}),
              role: determinedRole || response.result?.[0]?.role || "none",
            };

            dispatch(loginUser({ _directProfile: enrichedProfile }));
          }
        } catch (rbacErr) {
          console.error("[usePostMessageLogin] RBAC / employee_details validation failed:", rbacErr);
          // If employee_details returns 401 Unauthorized ("Invalid token"),
          // the user session in MyAhana portal is invalid. Do NOT allow access!
          Cookies.remove("access_token", { path: "/" });
          Cookies.remove("quantify_access_token", { path: "/" });
          Cookies.remove("user", { path: "/" });
          localStorage.removeItem("sso_token");
          dispatch(logoutUser());
          setAuthStatus("logged_out");
          void logout({ reason: "portal_token_expired", redirect: false });
          return;
        } finally {
          dispatch(setLoading(false));
        }
        // ────────────────────────────────────────────────────────────────────

        setAuthStatus("authenticated");

        if (roles.length > 1) {
          setPendingRoleChoice({ response });
        } else {
          navigate("/dashboard", { replace: true });
        }
      } catch (error) {
        setAuthStatus("logged_out");
        Cookies.remove("access_token", { path: "/" });
        Cookies.remove("quantify_access_token", { path: "/" });
        localStorage.removeItem("sso_token");
        dispatch(logoutUser());

        if (error.response?.status === 401) {
          console.error(
            "SSO login rejected",
            error.response?.data?.code || "HTTP 401",
          );
          void logout({ reason: "backend_auth_rejected", redirect: false });
          return;
        }
        console.error(
          "SSO login failed",
          error.response?.status || "network error",
        );
        void logout({ reason: "sso_unavailable", redirect: false });
      }
    };

    window.addEventListener("message", handleMessage);
    return () => {
      window.clearTimeout(redirectTimer);
      window.removeEventListener("message", handleMessage);
    };
  }, [dispatch, navigate]);

  const selectRole = (selectedRole) => {
    if (!pendingRoleChoice) return;
    const { response } = pendingRoleChoice;
    const roles = Array.isArray(response.result)
      ? response.result
      : [response.result];
    dispatch(
      loginUser({
        ...response,
        result: [selectedRole, ...roles.filter((role) => role !== selectedRole)],
      }),
    );
    setPendingRoleChoice(null);
    navigate("/dashboard", { replace: true });
  };

  return {
    authStatus,
    pendingRoleChoice,
    selectRole,
    dismissRoleChoice: () => setPendingRoleChoice(null),
  };
}
