import { useEffect, useRef, useState } from "react";
import { useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";

import { login } from "@/api/AuthApi";
import { loginUser } from "@/store/slices/authSlice";

const getRoleBasedRedirect = (role) => {
  const r = (role || "").toUpperCase();
  return r === "ADMIN" || r === "MANAGER" ? "/dashboard" : "/dashboard";
};

/**
 * App-wide listener for the UAT postMessage handoff. Runs once at the top of
 * the whole app (not just the Login page) so the token exchange with our own
 * /api/auth/login — and the server-side PMS token caching that happens
 * inside it — still fires no matter which route UAT's tile opens directly
 * into (today: /dashboard, which has no listener of its own).
 *
 * handledRef ensures we call the login API exactly ONCE even if MyAhana
 * sends the TOKEN message multiple times (e.g. on an interval).
 */
export function usePostMessageLogin() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [pendingRoleChoice, setPendingRoleChoice] = useState(null);
  const handledRef = useRef(false); // ← prevents duplicate API calls

  useEffect(() => {
    const handleMessage = async (event) => {
      if (event.data?.type !== "TOKEN" && event.data?.type !== "token") return;

      const { token, email, emp_id } = event.data;
      if (!token) return;

      // Guard: skip if we already processed a TOKEN message this session
      if (handledRef.current) return;
      handledRef.current = true;

      try {
        const response = await login({
          email: email || "",
          password: "",
          emp_id,
          authToken: token,
        });
        if (response.status !== "success") {
          handledRef.current = false; // allow retry on failure
          return;
        }

        const rawResult = response.result;
        const rolesList = Array.isArray(rawResult)
          ? rawResult
          : rawResult
            ? [rawResult]
            : [];

        if (rolesList.length > 1) {
          setPendingRoleChoice({ response });
        } else {
          dispatch(loginUser(response));
          navigate(getRoleBasedRedirect(rolesList[0]?.role), { replace: true });
        }
      } catch (err) {
        handledRef.current = false; // allow retry on failure
        console.error("Auto login via postMessage failed:", err);
      }
    };

    window.addEventListener("message", handleMessage);
    return () => window.removeEventListener("message", handleMessage);
  }, [dispatch, navigate]);


  const selectRole = (selectedRoleObj) => {
    if (!pendingRoleChoice) return;
    const { response } = pendingRoleChoice;
    const allRoles = Array.isArray(response.result)
      ? response.result
      : [response.result];
    const otherRoles = allRoles.filter((r) => r !== selectedRoleObj);
    dispatch(
      loginUser({ ...response, result: [selectedRoleObj, ...otherRoles] }),
    );
    setPendingRoleChoice(null);
    navigate(getRoleBasedRedirect(selectedRoleObj?.role), { replace: true });
  };

  return {
    pendingRoleChoice,
    selectRole,
    dismissRoleChoice: () => setPendingRoleChoice(null),
  };
}
