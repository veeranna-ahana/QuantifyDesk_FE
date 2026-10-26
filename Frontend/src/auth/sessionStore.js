import Cookies from "js-cookie";

import { getExpiry, isExpired } from "./tokenUtils";

const SESSION_COOKIE = "quantify_access_token";

export function getSessionToken() {
  return Cookies.get(SESSION_COOKIE) || null;
}

export function setSessionToken(token) {
  const expiry = getExpiry(token);
  if (!expiry || isExpired(token)) {
    clearSessionToken();
    return false;
  }

  Cookies.set(SESSION_COOKIE, token, {
    expires: new Date(expiry * 1000),
    path: "/",
    sameSite: "Lax",
    secure: window.location.protocol === "https:",
  });
  window.dispatchEvent(new Event("auth-session-updated"));
  return true;
}

export function clearSessionToken() {
  Cookies.remove(SESSION_COOKIE, { path: "/" });
}

export function clearLegacyTokens() {
  ["token", "sso_token", "emp_id", "role"].forEach((key) =>
    localStorage.removeItem(key),
  );
}
