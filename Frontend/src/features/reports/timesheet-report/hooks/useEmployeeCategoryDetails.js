import { useCallback, useState } from "react";

import { timesheetReportService } from "../services/timesheetReport.service";
import { toDetailRecord } from "../utils/timesheetDetails";

/**
 * Lazily fetches + caches the drill-down for one (employee, category) pair.
 * Exposes a map keyed by `${employeeId}|${categoryCode}` so expanding and
 * collapsing the same row never refetches.
 */
export function useEmployeeCategoryDetails() {
  // key -> { loading, error, records }
  const [byKey, setByKey] = useState({});

  const load = useCallback(async (employeeId, categoryCode) => {
    if (!employeeId || !categoryCode) return;
    const key = `${employeeId}|${categoryCode}`;

    // Already loaded successfully → no-op
    setByKey((prev) => {
      const existing = prev[key];
      if (existing && !existing.loading && !existing.error) return prev;
      return {
        ...prev,
        [key]: { loading: true, error: null, records: existing?.records ?? [] },
      };
    });

    try {
      const res = await timesheetReportService.getEmployeeCategoryTimesheetDetails(
        employeeId,
        categoryCode,
      );
      const block = res?.data?.[0] || {};
      const header = block.EmployeeInformation || {};
      const details = block.ProjectDetails || [];
      const records = details.map((raw) => toDetailRecord(raw, header));

      setByKey((prev) => ({
        ...prev,
        [key]: { loading: false, error: null, records },
      }));
    } catch (err) {
      const timedOut = err.code === "ECONNABORTED" || !err.response;
      const message =
        err.response?.data?.message ||
        (timedOut
          ? "Timed out loading details. Try again."
          : "Failed to load employee timesheet details.");
      setByKey((prev) => ({
        ...prev,
        [key]: { loading: false, error: message, records: [] },
      }));
    }
  }, []);

  const get = useCallback(
    (employeeId, categoryCode) => byKey[`${employeeId}|${categoryCode}`],
    [byKey],
  );

  return { load, get };
}