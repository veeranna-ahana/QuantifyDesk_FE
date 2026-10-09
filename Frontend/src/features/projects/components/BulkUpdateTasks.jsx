import { useEffect, useMemo, useRef, useState } from "react";
import { Check, CheckCircle2, Search, SlidersHorizontal } from "lucide-react";
import { useQuery } from "@tanstack/react-query";

import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeaderCell,
  TableRow,
} from "@/components/ui/Table";
import { cn } from "@/lib/cn";

import { getRoles, getTaskTypesByRole } from "../services/importProjectService";

import { ProjectContextBar } from "./ProjectContextBar";

const SORT_OPTIONS = [
  { id: "all", label: "All" },
  { id: "milestone", label: "Milestone" },
  { id: "owner", label: "Owner" },
];

const withCurrent = (options, value) =>
  value && !options.includes(value) ? [value, ...options] : options;

/**
 * Role + Task Type cells for one bulk-update row. Task Type depends on this row's own Role
 * (role_task_catalog.task_name for that role), so each row runs its own query — react-query
 * dedupes/caches by role, so picking "BA" on 10 rows is still one network call.
 */
function RoleTaskTypeCells({ rowId, roleOptions, value, onChange }) {
  const taskTypesQuery = useQuery({
    queryKey: ["task-catalog", value.role],
    queryFn: async () =>
      (await getTaskTypesByRole(value.role))?.taskTypes || [],
    enabled: Boolean(value.role),
    staleTime: 5 * 60 * 1000,
  });
  const taskTypeOptions = taskTypesQuery.data || [];

  const changeRole = (e) => {
    onChange(rowId, "role", e.target.value);
    onChange(rowId, "taskType", ""); // old task type may not belong to the newly picked role
  };

  return (
    <>
      <TableCell className="bg-action-primary-soft">
        <Select
          size="md"
          aria-label={`Role for ${rowId}`}
          placeholder="Select Role"
          value={value.role}
          options={withCurrent(roleOptions, value.role)}
          onChange={changeRole}
          className="text-xs"
        />
      </TableCell>
      <TableCell className="bg-action-primary-soft">
        <Select
          size="md"
          aria-label={`Task type for ${rowId}`}
          placeholder={value.role ? "Select Task Type" : "Select a Role first"}
          value={value.taskType}
          options={withCurrent(taskTypeOptions, value.taskType)}
          onChange={(e) => onChange(rowId, "taskType", e.target.value)}
          disabled={!value.role}
          className="text-xs"
        />
      </TableCell>
    </>
  );
}

/**
 * Bulk edit Role / Task Type / Unit for many tasks at once.
 * rows: [{ id, taskId, title, milestoneId, milestoneName, owner, role, taskType, unit }]
 * onSave receives { [taskId]: { role, taskType, unit } }.
 */
export function BulkUpdateTasks({
  rows,
  milestones,
  projectContext,
  onCancel,
  onSave,
}) {
  const [search, setSearch] = useState("");
  const [milestoneId, setMilestoneId] = useState("");
  const [sortBy, setSortBy] = useState("all");
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef(null);
  const [values, setValues] = useState(() =>
    Object.fromEntries(
      rows.map((r) => [
        r.id,
        { role: r.role, taskType: r.taskType, unit: r.unit },
      ]),
    ),
  );

  const rolesQuery = useQuery({
    queryKey: ["roles"],
    queryFn: async () => (await getRoles())?.roles || [],
    staleTime: 5 * 60 * 1000,
  });
  const roleOptions = rolesQuery.data || [];

  useEffect(() => {
    if (!menuOpen) return undefined;
    const onDown = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target))
        setMenuOpen(false);
    };
    document.addEventListener("mousedown", onDown);
    return () => document.removeEventListener("mousedown", onDown);
  }, [menuOpen]);

  const visible = useMemo(() => {
    const q = search.trim().toLowerCase();
    const list = rows.filter((r) => {
      if (milestoneId && r.milestoneId !== milestoneId) return false;
      return (
        !q ||
        [r.title, r.taskId, r.milestoneName, r.owner].some((v) =>
          v.toLowerCase().includes(q),
        )
      );
    });
    if (sortBy === "milestone")
      return [...list].sort((a, b) =>
        a.milestoneName.localeCompare(b.milestoneName),
      );
    if (sortBy === "owner")
      return [...list].sort((a, b) => a.owner.localeCompare(b.owner));
    return list;
  }, [rows, search, milestoneId, sortBy]);

  const setField = (id, field, value) =>
    setValues((prev) => ({ ...prev, [id]: { ...prev[id], [field]: value } }));

  return (
    <div className="flex w-full flex-col gap-4">
      <Card className="flex flex-col gap-3 p-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 className="text-sm font-semibold text-ink-primary">
            Bulk Update Tasks
          </h2>
          <ProjectContextBar {...projectContext} />
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <Input
            size="md"
            aria-label="Search by task"
            placeholder="Search by task"
            leadingIcon={<Search className="h-4 w-4" />}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            wrapperClassName="w-full max-w-sm flex-1"
          />
          <Select
            size="md"
            aria-label="Milestone"
            value={milestoneId}
            onChange={(e) => setMilestoneId(e.target.value)}
            options={[
              { value: "", label: "All Milestones" },
              ...milestones.map((m) => ({ value: m.id, label: m.name })),
            ]}
            wrapperClassName="w-48"
          />
          <div ref={menuRef} className="relative">
            <Button
              variant="secondary"
              size="md"
              leftIcon={
                <SlidersHorizontal className="h-4 w-4 text-action-primary" />
              }
              onClick={() => setMenuOpen((o) => !o)}
              aria-haspopup="menu"
              aria-expanded={menuOpen}
            >
              Filter
            </Button>
            {menuOpen && (
              <div
                role="menu"
                className="absolute left-0 top-full z-20 mt-1 w-32 overflow-hidden rounded-chip border border-line-card bg-surface-card py-1 shadow-lg"
              >
                {SORT_OPTIONS.map((o) => (
                  <button
                    key={o.id}
                    role="menuitem"
                    type="button"
                    onClick={() => {
                      setSortBy(o.id);
                      setMenuOpen(false);
                    }}
                    className={cn(
                      "flex w-full items-center gap-2 px-3 py-1.5 text-left text-[13px] hover:bg-surface-field-disabled",
                      sortBy === o.id && "font-semibold",
                    )}
                  >
                    <span className="w-4">
                      {sortBy === o.id && <Check className="h-3.5 w-3.5" />}
                    </span>
                    {o.label}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </Card>

      {/*
        The sticky header (TableHeaderCell already has `sticky top-0`) needs exactly ONE
        scrolling ancestor. Previously this Card scrolled vertically (max-h + overflow-auto)
        while Table's own wrapper div ALSO became a scroll container (overflow-x-auto implicitly
        forces overflow-y: auto per the CSS spec) — two nested scroll contexts meant `top-0`
        anchored to the inner (non-scrolled) wrapper, so the header silently scrolled away
        instead of sticking. Moving the vertical scroll constraint onto Table's own wrapper
        (via wrapperClassName) makes it the single scrolling ancestor, so sticky now works.
      */}
      <Card className="overflow-hidden p-0">
        <Table
          className="min-w-[760px]"
          wrapperClassName="max-h-[55vh] overflow-y-auto"
        >
          <TableHead>
            <TableRow className="hover:bg-transparent">
              <TableHeaderCell className="sticky top-0 z-20 shadow-[0_1px_0_0_rgba(0,0,0,0.08)] bg-surface-table-head">
                Task
              </TableHeaderCell>
              <TableHeaderCell className="sticky top-0 z-20 shadow-[0_1px_0_0_rgba(0,0,0,0.08)] bg-surface-table-head">
                Milestone
              </TableHeaderCell>
              <TableHeaderCell className="sticky top-0 z-20 shadow-[0_1px_0_0_rgba(0,0,0,0.08)] bg-surface-table-head">
                Owner
              </TableHeaderCell>
              {["Role", "Task Type", "Unit"].map((h) => (
                <TableHeaderCell
                  key={h}
                  className="sticky top-0 z-20 shadow-[0_1px_0_0_rgba(0,0,0,0.08)] bg-action-primary-soft"
                >
                  {h}
                </TableHeaderCell>
              ))}
            </TableRow>
          </TableHead>
          <TableBody>
            {visible.length === 0 && (
              <TableRow>
                <TableCell
                  colSpan={6}
                  className="py-8 text-center text-ink-muted"
                >
                  No tasks found matching your search.
                </TableCell>
              </TableRow>
            )}
            {visible.map((r) => {
              const v = values[r.id];
              return (
                <TableRow key={r.id}>
                  <TableCell>
                    <div className="font-medium">{r.title}</div>
                    <div className="text-[11px] text-ink-muted">{r.taskId}</div>
                  </TableCell>
                  <TableCell className="text-xs">{r.milestoneName}</TableCell>
                  <TableCell>{r.owner}</TableCell>
                  <RoleTaskTypeCells
                    rowId={r.id}
                    roleOptions={roleOptions}
                    value={v}
                    onChange={setField}
                  />
                  <TableCell className="bg-action-primary-soft">
                    <Input
                      size="md"
                      type="number"
                      min="0"
                      aria-label={`Unit for ${r.taskId}`}
                      value={v.unit}
                      onChange={(e) => setField(r.id, "unit", e.target.value)}
                      wrapperClassName="w-16"
                      className="text-center text-xs"
                    />
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </Card>

      <div className="flex justify-end gap-3">
        <Button variant="ghost" onClick={onCancel}>
          Cancel
        </Button>
        <Button
          leftIcon={<CheckCircle2 className="h-4 w-4" />}
          onClick={() => onSave(values)}
        >
          Bulk Update Tasks
        </Button>
      </div>
    </div>
  );
}
