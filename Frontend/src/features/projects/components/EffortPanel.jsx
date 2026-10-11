import { ArrowRight, Plus, Trash2, X } from "lucide-react";
import { Fragment, useState } from "react";
import { useQuery } from "@tanstack/react-query";

import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { IconButton } from "@/components/ui/IconButton";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import SearchableSelect from "@/components/ui/SearchableSelect/SearchableSelect";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeaderCell,
  TableRow,
} from "@/components/ui/Table";

import { getActiveEmployees, getRoles } from "../services/importProjectService";

import {
  formatHrs,
  toHrs,
  useEffortEstimate,
} from "../hooks/useEffortEstimate";

import { ProjectContextBar } from "./ProjectContextBar";

const DAYS_INPUT = "w-16 text-center";
const PILL =
  "inline-block min-w-[64px] rounded-md px-2.5 py-1 text-xs font-medium";
const HRS_PILL = `${PILL} bg-badge-neutral-bg text-ink-primary`;
const BUFFER_PILL = `${PILL} border border-badge-warning-line bg-badge-warning-bg text-badge-warning-ink`;
const EMPTY_PROJECT_CONTEXT = { projectName: "", pmsId: "" };

/**
 * Inline "new member" row shown under a role's Add Member button. Picking a person adds them
 * to the role immediately (Effort / Buffer days start at 0 and are edited in the new row) — there
 * is no separate confirm step. The X just dismisses the picker if nobody is wanted after all.
 */
function PendingRow({ available, employeesLoading, onConfirm, onCancel }) {
  const pick = (empId) => {
    if (!empId) return;
    const empName = available.find((o) => o.value === empId)?.label || "";
    onConfirm({ empId, empName, effortDays: 0, bufferDays: 0 });
  };
  return (
    <TableRow className="bg-action-primary-soft hover:bg-action-primary-soft">
      <TableCell>
        <SearchableSelect
          aria-label="Select member"
          placeholder={
            employeesLoading ? "Loading employees…" : "Select member"
          }
          loading={employeesLoading}
          value=""
          options={available}
          onChange={pick}
        />
      </TableCell>
      <TableCell colSpan={5} />
      <TableCell className="text-right">
        <IconButton label="Cancel" variant="neutral" onClick={onCancel}>
          <X className="h-4 w-4 text-badge-danger-ink" />
        </IconButton>
      </TableCell>
    </TableRow>
  );
}

/**
 * Effort estimate table, shared by:
 *   mode="import" - wizard step 3 (starts with 0 members per role — real roles from
 *                    role_task_catalog, real employees from master.emp; nothing mock)
 *   mode="edit"   - project edit tab (editable + row actions)
 *   mode="view"   - project view tab (read-only inputs)
 *
 * `rows` (real effort_estimate rows, e.g. from the View API — [] on a fresh import, no mock
 * fallback) and `projectContext` are passed down by the page. `onRowsChange` should be the
 * wizard/page's own state setter so added/removed members survive this component unmounting
 * (e.g. wizard step navigation) — same pattern as Task Info's onMilestonesChange. If not passed,
 * an internal fallback keeps things working without cross-unmount persistence.
 */
export function EffortPanel({
  mode,
  onBack,
  onNext,
  nextLoading = false,
  rows: rowsProp,
  onRowsChange,
  projectContext = EMPTY_PROJECT_CONTEXT,
}) {
  const [localRows, setLocalRows] = useState(rowsProp || []);
  const controlled = Boolean(onRowsChange);
  const rows = controlled ? rowsProp : localRows;
  const setRows = controlled ? onRowsChange : setLocalRows;

  const rolesQuery = useQuery({
    queryKey: ["roles"],
    queryFn: async () => (await getRoles())?.roles || [],
    staleTime: 5 * 60 * 1000,
  });
  const employeesQuery = useQuery({
    queryKey: ["employees"],
    queryFn: async () => (await getActiveEmployees())?.employees || [],
    staleTime: 5 * 60 * 1000,
  });
  const roleOptions = rolesQuery.data || [];
  const employees = employeesQuery.data || [];

  const effort = useEffortEstimate(rows, setRows, roleOptions);
  const [addingRole, setAddingRole] = useState(null);
  const canEdit = mode !== "view";
  // Remove/edit-member actions are available any time the table is editable (import wizard and
  // edit mode alike) — previously gated to mode === "edit" only, which meant a member added
  // during the Import wizard's Step 3 couldn't be removed again without reloading the page.
  const showActions = canEdit;
  const colCount = 7; // Role + 5 value columns + action / spacer column

  // Someone can genuinely hold more than one role on the same project (e.g. a TL who's also
  // doing BE dev work) — real people wear multiple hats. What we must not allow is adding the
  // SAME person twice under the SAME role. So dedup is scoped per role, not project-wide.
  const availableEmpsForRole = (role) => {
    const assignedInRole = new Set(
      effort.rows.filter((r) => r.role === role).map((r) => r.empId),
    );
    return (
      employees
        // Defensive, in addition to the backend's own filter (getActiveEmployeesFromHRMS) — guards
        // against a blank/whitespace-only emp_id or emp_name ever rendering as an empty, selectable
        // row in the dropdown.
        .filter(
          (e) =>
            String(e.emp_id || "").trim() &&
            String(e.emp_name || "").trim() &&
            !assignedInRole.has(e.emp_id),
        )
        .map((e) => ({ value: e.emp_id, label: e.emp_name }))
    );
  };

  // This table scrolls with the whole page in every mode, not in its own inner box — so NOTHING
  // between the page's own scroll area and the sticky TableHeaderCell may set overflow to
  // anything but 'visible': both Card's overflow-hidden and Table's own default horizontal-scroll
  // wrapper are scroll containers in their own right (see Table.jsx's comment on `scrollable`),
  // and a sticky element always anchors to the NEAREST one — so either of these, even with no
  // height limit/scrollbar of its own, would silently steal the header's stickiness away from the
  // real page scroll, exactly like the original BulkUpdateTasks bug one level up the tree.
  const isImport = mode === "import";
  return (
    <Card className="flex w-full flex-col overflow-visible p-0">
      {isImport && (
        <div className="flex flex-wrap items-center justify-between gap-3 p-4">
          <h2 className="text-sm font-semibold text-ink-primary">
            Effort Estimate
          </h2>
          <ProjectContextBar {...projectContext} />
        </div>
      )}

      {/* scrollable={false} removes Table's own scroll wrapper entirely, so the header stays
          sticky against the page's own scroll area (see comment above) instead of a local inner
          scrollbar. */}
      <Table className="min-w-[760px]" scrollable={false}>
        <TableHead>
          <TableRow className="hover:bg-transparent">
            <TableHeaderCell>Role</TableHeaderCell>
            {[
              "Effort(Days)",
              "In Hrs",
              "Buffer(Days)",
              "In Hrs",
              "Total Hrs",
            ].map((h, i) => (
              <TableHeaderCell key={`${h}${i}`} className="text-center">
                {h}
              </TableHeaderCell>
            ))}
            <TableHeaderCell className="w-24 text-right">
              {showActions ? "Action" : ""}
            </TableHeaderCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {effort.groups.map(({ role, rows }) => {
            const availableForRole = availableEmpsForRole(role);
            return (
              <Fragment key={role}>
                <TableRow className="bg-surface-field-disabled hover:bg-surface-field-disabled">
                  <TableCell
                    colSpan={colCount - 1}
                    className="text-sm font-semibold text-ink-primary"
                  >
                    <span className="inline-flex items-center gap-2">
                      {role}
                      <span className="rounded-full border border-action-primary/30 bg-white px-2 py-0.5 text-[11px] font-medium text-action-primary">
                        {rows.length} {rows.length === 1 ? "Member" : "Members"}
                      </span>
                    </span>
                  </TableCell>
                  <TableCell className="text-right">
                    {canEdit && (
                      <button
                        type="button"
                        disabled={
                          addingRole === role || availableForRole.length === 0
                        }
                        onClick={() => setAddingRole(role)}
                        className="inline-flex items-center gap-1 whitespace-nowrap rounded-md border border-action-primary/40 bg-white px-2.5 py-1 text-xs font-medium text-action-primary hover:bg-action-primary-soft disabled:opacity-50"
                      >
                        <Plus className="h-3.5 w-3.5" /> Add Member
                      </button>
                    )}
                  </TableCell>
                </TableRow>

                {rows.map((r) => (
                  <TableRow key={r.id} className="hover:bg-transparent">
                    <TableCell className="pl-6 font-semibold text-ink-primary">
                      {r.empName}
                    </TableCell>
                    <TableCell className="text-center">
                      <Input
                        size="md"
                        type="number"
                        min="0"
                        aria-label={`Effort days for ${r.empName}`}
                        value={r.effortDays}
                        readOnly={!canEdit}
                        onChange={(e) =>
                          effort.updateRow(r.id, "effortDays", e.target.value)
                        }
                        wrapperClassName="mx-auto w-16"
                        className={DAYS_INPUT}
                      />
                    </TableCell>
                    <TableCell className="text-center">
                      <span className={HRS_PILL}>
                        {formatHrs(toHrs(r.effortDays))}
                      </span>
                    </TableCell>
                    <TableCell className="text-center">
                      <Input
                        size="md"
                        type="number"
                        min="0"
                        aria-label={`Buffer days for ${r.empName}`}
                        value={r.bufferDays}
                        readOnly={!canEdit}
                        onChange={(e) =>
                          effort.updateRow(r.id, "bufferDays", e.target.value)
                        }
                        wrapperClassName="mx-auto w-16"
                        className={DAYS_INPUT}
                      />
                    </TableCell>
                    <TableCell className="text-center">
                      <span className={BUFFER_PILL}>
                        {formatHrs(toHrs(r.bufferDays))}
                      </span>
                    </TableCell>
                    <TableCell className="text-center">
                      <span className={HRS_PILL}>
                        {formatHrs(toHrs(r.effortDays) + toHrs(r.bufferDays))}
                      </span>
                    </TableCell>
                    <TableCell className="text-right">
                      {showActions && (
                        <span className="inline-flex gap-1">
                          <IconButton
                            label={`Remove ${r.empName}`}
                            variant="neutral"
                            onClick={() => effort.removeMember(r.id)}
                          >
                            <Trash2 className="h-4 w-4 text-badge-danger-ink" />
                          </IconButton>
                        </span>
                      )}
                    </TableCell>
                  </TableRow>
                ))}

                {addingRole === role && (
                  <PendingRow
                    available={availableForRole}
                    employeesLoading={employeesQuery.isLoading}
                    onCancel={() => setAddingRole(null)}
                    onConfirm={(v) => {
                      if (effort.addMember(role, v)) setAddingRole(null);
                    }}
                  />
                )}
              </Fragment>
            );
          })}

          {/* No bounded scroll box in any mode any more (the whole page scrolls instead — see the
              Table/Card comments above), and sticky-to-bottom only does anything useful within a
              shorter-than-content scroll box — so this is back to a plain row, same as every
              other row, instead of pinning oddly partway down a long page. */}
          <TableRow className="bg-surface-table-head font-semibold hover:bg-surface-table-head">
            <TableCell>TOTAL</TableCell>
            <TableCell className="text-center">
              {effort.totals.effortDays} days
            </TableCell>
            <TableCell className="text-center">
              {formatHrs(effort.totals.effortHrs)}
            </TableCell>
            <TableCell className="text-center">
              {effort.totals.bufferDays} days
            </TableCell>
            <TableCell className="text-center">
              {formatHrs(effort.totals.bufferHrs)}
            </TableCell>
            <TableCell className="text-center">
              {formatHrs(effort.totals.totalHrs)}
            </TableCell>
            <TableCell />
          </TableRow>
        </TableBody>
      </Table>

      {canEdit && (
        <div className="flex justify-end gap-3 border-t border-line-card p-4">
          <Button variant="ghost" onClick={onBack}>
            {mode === "edit" ? "Cancel" : "Back"}
          </Button>
          <Button
            rightIcon={
              mode === "import" ? <ArrowRight className="h-4 w-4" /> : undefined
            }
            onClick={onNext}
            isLoading={nextLoading}
            disabled={nextLoading}
          >
            {mode === "import"
              ? "Save and Next"
              : mode === "edit"
                ? "Update"
                : "Next:"}
          </Button>
        </div>
      )}
    </Card>
  );
}
