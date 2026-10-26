// src/api/ssoApi.js
// Mirrors PCM's src/api/auth.js — provides employee_details and validate-roles
// using the MyAhana portal's token and endpoints.

import axios from "axios";
import Cookies from "js-cookie";
import { isAxiosError } from "axios";

/**
 * Returns the MyAhana portal access token.
 * PCM stores this in the "access_token" cookie (or "sso_token" in localStorage).
 * NOTE: This is distinct from QuantifyDesk backend's own "quantify_access_token".
 */
export const getPortalToken = () => {
  return Cookies.get("access_token") || localStorage.getItem("sso_token") || null;
};

const getPortalBaseUrl = () => {
  const url =
    import.meta.env.VITE_LOGIN_URL ||
    import.meta.env.VITE_MYAHANA_PORTAL_URL ||
    "http://20.204.44.218:8000";
  return url.replace(/\/$/, "");
};

/**
 * GET  {portalUrl}/api/auth/employee_details
 * Identical to PCM's getEmployeeDetails() in src/api/auth.js.
 * Requires the portal access token.
 */
export const getEmployeeDetails = async () => {
  try {
    const accessToken = getPortalToken();
    if (!accessToken) throw new Error("Access token not found");

    const portalBase = getPortalBaseUrl();
    const response = await axios.get(
      `${portalBase}/api/auth/employee_details`,
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          Accept: "application/json",
        },
      }
    );

    return response.data;
  } catch (error) {
    console.error("[ssoApi] getEmployeeDetails error:", error);
    if (isAxiosError(error)) {
      throw error.response?.data || { message: "Network error", status: error.response?.status };
    }
    throw error;
  }
};

/**
 * POST  {baseOrigin}/centralized_rbac_api/rbac/validate-roles
 * Identical to PCM's validateRole() with application_name "QuantifyDesk".
 * Requires the portal access token.
 *
 * @param {string}   emp_id        Employee ID returned by getEmployeeDetails()
 * @param {string[]} allowedRoles  e.g. ["Admin"] or ["Super Admin", "SuperAdmin"]
 * @returns {{ has_role: boolean }}
 */
export const validateRole = async (emp_id, allowedRoles = ["Admin"]) => {
  try {
    const accessToken = getPortalToken();
    if (!accessToken) throw new Error("Access token not found");

    const portalBase = getPortalBaseUrl();
    const baseOrigin = new URL(portalBase).origin;

    const response = await axios.post(
      `${baseOrigin}/centralized_rbac_api/rbac/validate-roles`,
      {
        employee_id: emp_id,
        application_name: "QuantifyDesk",
        allowed_roles: allowedRoles,
      },
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          Accept: "application/json",
          "Content-Type": "application/json",
        },
      }
    );

    return response.data;
  } catch (error) {
    console.error("[ssoApi] validateRole error:", error);
    if (isAxiosError(error)) {
      throw error.response?.data || { message: "Network error", status: error.response?.status };
    }
    throw error;
  }
};

