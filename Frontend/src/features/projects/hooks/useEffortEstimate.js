import { useMemo } from "react";
import toast from "react-hot-toast";

import { HRS_PER_DAY } from "../constants";

export const toHrs = (days) =>
  Math.round(Number(days || 0) * HRS_PER_DAY * 100) / 100;
export const formatHrs = (hrs) => `${Number(hrs).toLocaleString("en-US")} hrs`;

/**
 * Effort rows grouped by role, with add / update / remove and totals.
 *
 * `rows` / `onRowsChange`: CONTROLLED, same pattern as useTaskInfo. This hook does not keep its
 * own copy of the rows in local state — the Import wizard conditionally renders each step
 * (`{wiz.step === 3 && <EffortPanel/>}`), so leaving Step 3 unmounts this hook; a local
 * `useState(initialRows)` would silently discard every added member on return. The caller (the
 * wizard hook) owns the rows so they survive step navigation, same fix as Task Info's
 * onMilestonesChange. If `onRowsChange` isn't passed, an internal fallback setter is used instead
 * (keeps any not-yet-wired caller working, just without cross-unmount persistence).
 *
 * `roleOptions`: role headers to always render (from role_task_catalog's roles API), even with
 * zero members under them yet — "only the role should be there initially, members added later".
 */
export function useEffortEstimate(rows, onRowsChange, roleOptions) {
  const safeRows = rows || [];

  const updateRow = (id, field, value) =>
    onRowsChange(
      safeRows.map((r) =>
        r.id === id
          ? { ...r, [field]: value === "" ? 0 : Number(value) || 0 }
          : r,
      ),
    );

  const addMember = (role, { empId, empName, effortDays, bufferDays }) => {
    if (!empId) {
      toast.error("Please select a member to add.");
      return false;
    }
    onRowsChange([
      ...safeRows,
      {
        id: `${role}-${empId}`,
        role,
        empId,
        empName,
        effortDays: Number(effortDays) || 0,
        bufferDays: Number(bufferDays) || 0,
      },
    ]);
    toast.success(`Member ${empName} added successfully!`);
    return true;
  };

  const removeMember = (id) => {
    const row = safeRows.find((r) => r.id === id);
    onRowsChange(safeRows.filter((r) => r.id !== id));
    toast.success(`Member ${row?.empName ?? ""} removed.`);
  };

  const groups = useMemo(
    () =>
      (roleOptions || []).map((role) => ({
        role,
        rows: safeRows.filter((r) => r.role === role),
      })),
    [safeRows, roleOptions],
  );

  const totals = useMemo(() => {
    const effortDays = safeRows.reduce(
      (s, r) => s + Number(r.effortDays || 0),
      0,
    );
    const bufferDays = safeRows.reduce(
      (s, r) => s + Number(r.bufferDays || 0),
      0,
    );
    return {
      effortDays,
      bufferDays,
      effortHrs: toHrs(effortDays),
      bufferHrs: toHrs(bufferDays),
      totalHrs: toHrs(effortDays + bufferDays),
    };
  }, [safeRows]);

  return { rows: safeRows, groups, totals, updateRow, addMember, removeMember };
}
