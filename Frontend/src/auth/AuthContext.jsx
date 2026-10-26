// src/auth/AuthContext.jsx

// WHY: PCM uses a React Context (not just Redux) so that:
//   1. Components can read `user`, `isAuthenticated`, and `loading`
//      without importing Redux selectors.
//   2. ProtectedRoute can read auth state synchronously during render
//      without a full Redux dependency.
//
// QuantifyDesk already has Redux authSlice for persistence, so this context
// acts as a thin synchronised layer on top — it reads from Redux and exposes
// the same interface PCM's context does.  This keeps backward-compat with
// all existing Redux consumers.

import React, { createContext, useContext, useMemo } from "react";
import { useSelector, useDispatch } from "react-redux";
import { loginUser, logoutUser } from "@/store/slices/authSlice";

const AuthContext = createContext(null);

/** Matches the same hook name PCM exports so future shared code works. */
// eslint-disable-next-line react-refresh/only-export-components
export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside <AuthProvider>");
  return ctx;
};

/**
 * AuthProvider — wraps the app and exposes the PCM-compatible context shape:
 *   { user, setUser, token, loading, isAuthenticated }
 *
 * `loading` is sourced from a dedicated `authLoading` state inside authSlice
 * (added in the slice update). Until then it defaults to false when a user
 * already exists in the Redux store (persisted session).
 */
export const AuthProvider = ({ children }) => {
  const dispatch = useDispatch();
  const user = useSelector((state) => state.auth?.user ?? null);
  const loading = useSelector((state) => state.auth?.loading ?? false);

  const setUser = (userProfile) => {
    if (userProfile) {
      // When called programmatically (e.g. from SSOHandler), we wrap the
      // profile in the loginUser action so Redux + persistence stay in sync.
      dispatch(loginUser({ _directProfile: userProfile }));
    } else {
      dispatch(logoutUser());
    }
  };

  const value = useMemo(
    () => ({
      user,
      setUser,
      loading,
      isAuthenticated: !!user,
      // token is kept for PCM API compatibility; real token lives in the cookie
      token: null,
    }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [user, loading]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
