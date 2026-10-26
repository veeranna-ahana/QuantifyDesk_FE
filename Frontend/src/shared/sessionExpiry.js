import Cookies from "js-cookie";

import { getSessionToken, clearSessionToken } from "@/auth/sessionStore";

let logoutPromise;

export function redirectToPortal(reason) {
  // PCM behaviour: if opened from portal, focus opener tab and close this tab
  const opener = window.opener;
  if (opener && !opener.closed) {
    try {
      opener.focus();
    } catch {
      /* ignore */
    }
    window.close();
  }

  const portalUrl =
    import.meta.env.VITE_LOGIN_URL ||
    import.meta.env.VITE_PORTAL_URL ||
    import.meta.env.VITE_MYAHANA_PORTAL_URL ||
    "http://20.204.44.218:8000";

  if (!portalUrl) {
    console.error("Portal URL is not configured; session was cleared.");
    return false;
  }

  const redirectUrl = new URL(portalUrl);
  if (reason) redirectUrl.searchParams.set("reason", reason);
  window.location.assign(redirectUrl.toString());
  return true;
}

export async function logout({
  reason,
  token: sessionToken,
  redirect = false,
} = {}) {
  if (logoutPromise) return logoutPromise;

  logoutPromise = (async () => {
    try {
      const token = sessionToken || getSessionToken();
      if (token) {
        try {
          const apiBase = (import.meta.env.VITE_API_BASE_URL || "").replace(
            /\/$/,
            "",
          );
          await fetch(`${apiBase}/api/auth/logout`, {
            method: "POST",
            headers: { Authorization: `Bearer ${token}` },
          });
        } catch {
          // The local session must still be cleared if the API is unavailable.
        }
      }

      clearSessionToken();
      // Clear both the QD session cookie and the PCM-compatible access_token cookie
      Cookies.remove("access_token", { path: "/" });
      Cookies.remove("quantify_access_token", { path: "/" });
      Cookies.remove("user", { path: "/" });
      Cookies.remove("refreshToken", { path: "/" });
      localStorage.removeItem("sso_token");
      [
        "email",
        "emp_id",
        "role",
        "UserID",
        "userName",
        "serviceDeliveryEmployees",
      ].forEach((key) => localStorage.removeItem(key));
      sessionStorage.clear();
      window.dispatchEvent(new Event("auth-logout"));

      if (redirect) {
        redirectToPortal(reason);
      } else {
        window.dispatchEvent(
          new CustomEvent("auth-session-expired", { detail: { reason } }),
        );
      }
    } finally {
      logoutPromise = null;
    }
  })();

  return logoutPromise;
}

export function handleSessionExpired(request) {
  if (request) {
    let path = request.url || "unknown";
    try {
      path = new URL(path, request.baseURL || window.location.origin).pathname;
    } catch {
      path = "unknown";
    }
    console.error("API returned 401", {
      method: request.method?.toUpperCase() || "UNKNOWN",
      path,
      hadBearerToken: Boolean(
        request.headers?.Authorization || request.headers?.authorization,
      ),
    });
  }
  void logout({ reason: "api_unauthorized" });
}
