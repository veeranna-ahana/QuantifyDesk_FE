// src/shared/sessionExpiry.js
//
// App-level 401 handler. A 401 from either axios instance clears the stale
// session and raises a "session-expired" event — it does NOT redirect by
// itself. SessionExpiredModal (mounted once at the app root in App.jsx)
// listens for that event and shows a blocking modal; the user leaves via
// its own Login/Logout buttons, both of which go to the UAT portal home.
//
// This file is imported by axios interceptors, which run outside the React
// tree, so it can't call useNavigate/dispatch directly — a DOM CustomEvent
// is the simplest way to reach into React from here.
export const SESSION_EXPIRED_EVENT = "session-expired";

let handling = false; // guards against N parallel 401s firing N events

export function handleSessionExpired() {
  if (handling) return;
  handling = true;

  try {
    localStorage.removeItem("token");
    localStorage.removeItem("email");
    localStorage.removeItem("emp_id");
    localStorage.removeItem("role");
    localStorage.removeItem("UserID");
    localStorage.removeItem("serviceDeliveryEmployees");
    document.cookie = "user=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
  } catch {
    // localStorage/cookies unavailable — nothing more we can clear client-side
  }

  window.dispatchEvent(new CustomEvent(SESSION_EXPIRED_EVENT));
}

// Lets the modal reset the guard once it's shown & acknowledged, so a
// genuinely new expiry later in the (unlikely, since we navigate away)
// lifetime of the page can show again.
export function resetSessionExpiredGuard() {
  handling = false;
}
