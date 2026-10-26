import { createSlice } from "@reduxjs/toolkit";
import Cookies from "js-cookie";
import {
  clearLegacyTokens,
  clearSessionToken,
  setSessionToken,
} from "@/auth/sessionStore";
import { getExpiry } from "@/auth/tokenUtils";

const getInitialUser = () => {
  try {
    const stored = Cookies.get("user");
    return stored ? JSON.parse(stored) : null;
  } catch {
    return null;
  }
};

const getInitialEmployees = () => {
  try {
    const stored = localStorage.getItem("serviceDeliveryEmployees");
    return stored ? JSON.parse(stored) : [];
  } catch {
    return [];
  }
};

const initialState = {
  user: getInitialUser(),
  serviceDeliveryEmployees: getInitialEmployees(),
  // loading flag used by SSOHandler and ProtectedRoute to prevent
  // flash-of-unauthorized-content while employee_details / validate-roles runs.
  loading: false,
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    /**
     * loginUser supports two paths:
     *
     * A) Standard postMessage path (usePostMessageLogin):
     *    payload = { accessToken, result, userid, serviceDeliveryEmployees, ... }
     *    → validates token, stores in cookie, builds user from result[0].
     *
     * B) SSOHandler / RBAC-enriched path:
     *    payload = { _directProfile: { emp_id, emp_name, role, ... } }
     *    → token already in cookie; stores the pre-built profile directly.
     *    WHY: After SSOHandler calls employee_details + validate-roles it has
     *    a complete profile with RBAC-determined role. We skip accessToken
     *    handling here because setSessionToken already ran in the hook.
     */
    loginUser: (state, action) => {
      const data = action.payload;

      // --- Path B: direct profile from SSOHandler ---
      if (data._directProfile) {
        const user = data._directProfile;
        Cookies.set("user", JSON.stringify(user), {
          expires: 1, // 1 day; the sessionStore cookie is the real expiry gate
          path: "/",
          sameSite: "Lax",
          secure: window.location.protocol === "https:",
        });
        state.user = user;
        state.loading = false;
        return;
      }

      // --- Path A: standard token-based login ---
      if (!data.accessToken || !setSessionToken(data.accessToken)) return;
      const serviceDeliveryEmployees = data.serviceDeliveryEmployees || [];

      const userResult = Array.isArray(data.result) ? data.result[0] : data.result;

      const user = {
        userid: data.userid,
        emp_id: userResult?.emp_id,
        emp_email: userResult?.emp_email,
        emp_name: userResult?.emp_name,
        emp_dept: userResult?.emp_dept,
        emp_designation: userResult?.emp_designation,
        // role here comes from the login response; it will be overwritten
        // by the RBAC-determined role in SSOHandler once validate-roles runs.
        role: userResult?.role,
        departments: userResult?.departments,
        role_id: userResult?.role_id,
        association_id: userResult?.association_id,
        status: userResult?.status,
        u_id: userResult?.u_id,
        roles: Array.isArray(data.result) ? data.result : [userResult],
      };

      // Store employees
      if (serviceDeliveryEmployees.length > 0) {
        localStorage.setItem(
          "serviceDeliveryEmployees",
          JSON.stringify(serviceDeliveryEmployees)
        );
      }

      Cookies.set("user", JSON.stringify(user), {
        expires: new Date(getExpiry(data.accessToken) * 1000),
        path: "/",
        sameSite: "Lax",
        secure: window.location.protocol === "https:",
      });

      state.user = user;
      state.serviceDeliveryEmployees = serviceDeliveryEmployees;
    },

    /**
     * setLoading — toggled by SSOHandler so ProtectedRoute can show a
     * spinner instead of flashing an "unauthorized" redirect.
     */
    setLoading: (state, action) => {
      state.loading = action.payload;
    },

    logoutUser: (state) => {
      clearSessionToken();
      clearLegacyTokens();
      // Clear both the QD session cookie and the PCM-compatible access_token cookie
      Cookies.remove("quantify_access_token", { path: "/" });
      Cookies.remove("access_token", { path: "/" });
      Cookies.remove("user", { path: "/" });
      Cookies.remove("refreshToken", { path: "/" });
      [
        "email",
        "emp_id",
        "role",
        "UserID",
        "userName",
        "serviceDeliveryEmployees",
      ].forEach((key) => localStorage.removeItem(key));
      sessionStorage.clear();

      state.user = null;
      state.serviceDeliveryEmployees = [];
    },
  },
});

export const { loginUser, logoutUser, setLoading } = authSlice.actions;
export default authSlice.reducer;