// Derives new Effort Estimate rows to pre-fill from Task Info's per-task Role tagging.
//
// Confirmed behavior: when a task's owner (PMS's own emp_id — always read-only, never
// user-edited) is tagged with a Role in Task Info, that same (Role, owner) pair should
// automatically show up as a row in Effort Estimate, instead of Effort Estimate always
// starting blank and the user re-picking someone who is already that task's real owner.
//
// Rules:
// - One derived row per DISTINCT (role, pmsEmpId) pair found across all tagged tasks —
//   two different owners tagged with the same role each get their own row.
// - Effort/Buffer Days are NOT guessed: task tagging carries no hours information, so a
//   newly-derived row always starts at 0/0, exactly like a manually "+Add Member" row
//   before the user fills anything in.
// - ADDITIVE ONLY, never destructive: this only returns rows to ADD for (role, empId)
//   pairs that don't already exist among the current Effort Estimate rows. It never
//   removes or overwrites an existing row — even if a task's Role tag is later changed
//   or cleared in Edit mode, and even if that row already has real hours filled in. The
//   row's `id` (`${role}-${empId}`, same scheme useEffortEstimate.addMember already
//   uses) is what makes a pair "already present" — matching by id is exactly matching
//   by (role, empId).
// - A task with no Role tagged yet (role === '') or no PMS owner contributes nothing —
//   Effort Estimate stays exactly as-is (blank, or whatever the user already built)
//   until a task is actually tagged.
// - This never restricts Effort Estimate either: whatever rows result, the user can
//   still add any employee to any role afterward, same as before this change.
export function deriveEffortRowsFromTasks(taskMilestones, existingRows) {
  const existingIds = new Set((existingRows || []).map((r) => r.id));
  const seen = new Set();
  const newRows = [];

  for (const m of taskMilestones || []) {
    for (const t of m.tasks || []) {
      const role = t.role;
      const empId = t.pmsEmpId;
      if (!role || !empId) continue;

      const id = `${role}-${empId}`;
      if (existingIds.has(id) || seen.has(id)) continue;
      seen.add(id);

      newRows.push({
        id,
        role,
        empId,
        empName: t.owner || String(empId),
        effortDays: 0,
        bufferDays: 0,
      });
    }
  }

  return newRows;
}
