import { useQuery } from "@tanstack/react-query";

import { getCurrentUser } from "../services/importProjectService";

/**
 * Resolves the logged-in user's emp_id/emp_name via GET /api/import-project/me — the backend
 * decodes it straight from the verified JWT and joins master.emp, the exact same lookup Create
 * Project itself uses server-side to stamp document_checklist.uploaded_by.
 *
 * This used to read Redux's `auth.user`/the `user` cookie instead, but that turned out to be
 * unreliable in practice: emp_id was always there (from the JWT/localStorage), but emp_name
 * wasn't consistently populated depending on which login path fired (RBAC lookup vs. default
 * role vs. manual login), so the Document Checklist's "Uploaded by" preview kept showing "—"
 * even though the backend had the correct emp_id all along. Asking the backend directly removes
 * that whole class of mismatch — the preview and the persisted value now come from the same
 * source of truth.
 */
export function useCurrentUser() {
  const query = useQuery({
    queryKey: ["current-user"],
    queryFn: async () => (await getCurrentUser()) || {},
    staleTime: 5 * 60 * 1000,
  });

  return {
    empId: query.data?.emp_id || null,
    empName: query.data?.emp_name || null,
  };
}
