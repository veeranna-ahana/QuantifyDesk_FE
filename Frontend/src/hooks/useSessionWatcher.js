import { useEffect, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import Cookies from "js-cookie";

import { getSessionToken, clearSessionToken } from "@/auth/sessionStore";
import { isExpired } from "@/auth/tokenUtils";
import { logout } from "@/shared/sessionExpiry";
import { logoutUser } from "@/store/slices/authSlice";
import { getEmployeeDetails } from "@/api/ssoApi";

/**
 * useSessionWatcher
 * Actively monitors portal authentication state in real time:
 *   1. Cross-tab storage sync (immediate detection when portal or child tab logs out)
 *   2. Tab focus / visibility change verification (checks employee_details API on return)
 *   3. Periodic heartbeat polling (detects portal logout even without user action)
 *   4. Token expiry countdown
 */
export function useSessionWatcher() {
  const dispatch = useDispatch();
  const user = useSelector((state) => state.auth?.user);
  const isVerifyingRef = useRef(false);

  useEffect(() => {
    // 1. Cross-tab storage change listener
    const handleStorage = (e) => {
      if (
        (e.key === "sso_token" && !e.newValue) ||
        (e.key === "access_token" && !e.newValue) ||
        (e.key === "user" && !e.newValue)
      ) {
        dispatch(logoutUser());
        void logout({ reason: "portal_logged_out", redirect: false });
      }
    };
    window.addEventListener("storage", handleStorage);

    // 2. Active portal verification
    const verifyPortalSession = async () => {
      const portalToken =
        Cookies.get("access_token") || localStorage.getItem("sso_token");
      const sessionToken = getSessionToken();

      // If tokens are missing or backend session token expired, trigger logout immediately
      if (!portalToken || !sessionToken || isExpired(sessionToken)) {
        dispatch(logoutUser());
        void logout({ reason: "portal_logged_out", redirect: false });
        return;
      }

      if (isVerifyingRef.current) return;
      isVerifyingRef.current = true;

      try {
        // Query MyAhana portal's employee_details to confirm portal session is active
        await getEmployeeDetails();
      } catch (err) {
        console.warn("[useSessionWatcher] Portal session invalid / logged out:", err);
        Cookies.remove("access_token", { path: "/" });
        Cookies.remove("quantify_access_token", { path: "/" });
        Cookies.remove("user", { path: "/" });
        localStorage.removeItem("sso_token");
        dispatch(logoutUser());
        void logout({ reason: "portal_token_expired", redirect: false });
      } finally {
        isVerifyingRef.current = false;
      }
    };

    // 3. Trigger verification immediately when tab is focused or becomes visible
    const handleVisibilityOrFocus = () => {
      if (document.visibilityState === "visible") {
        void verifyPortalSession();
      }
    };

    window.addEventListener("focus", handleVisibilityOrFocus);
    document.addEventListener("visibilitychange", handleVisibilityOrFocus);

    // 4. Periodic heartbeat (every 6 seconds while the tab is active)
    const intervalId = window.setInterval(() => {
      if (document.visibilityState === "visible") {
        void verifyPortalSession();
      }
    }, 6000);

    return () => {
      window.removeEventListener("storage", handleStorage);
      window.removeEventListener("focus", handleVisibilityOrFocus);
      document.removeEventListener("visibilitychange", handleVisibilityOrFocus);
      window.clearInterval(intervalId);
    };
  }, [dispatch, user]);
}
