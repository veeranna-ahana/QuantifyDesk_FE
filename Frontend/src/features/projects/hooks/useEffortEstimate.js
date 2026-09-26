import { useMemo, useState } from 'react';
import toast from 'react-hot-toast';

import { HRS_PER_DAY } from '../constants';
import { EFFORT_MEMBERS, EFFORT_ROLES } from '../mock/mockEffort';

export const toHrs = (days) => Math.round(Number(days || 0) * HRS_PER_DAY * 100) / 100;
export const formatHrs = (hrs) => `${Number(hrs).toLocaleString('en-US')} hrs`;

/** Effort rows grouped by role, with add / update / remove and totals. */
export function useEffortEstimate(initialRows) {
  const [rows, setRows] = useState(initialRows);

  const updateRow = (id, field, value) => setRows((prev) => prev.map((r) => (r.id === id ? { ...r, [field]: value === '' ? 0 : Number(value) || 0 } : r)));

  const addMember = (role, { name, effortDays, bufferDays }) => {
    if (!name) { toast.error('Please select a member to add.'); return false; }
    setRows((prev) => [...prev, { id: `${role}-${Date.now()}`, role, name, effortDays: Number(effortDays) || 0, bufferDays: Number(bufferDays) || 0 }]);
    toast.success(`Member ${name} added successfully!`);
    return true;
  };

  const removeMember = (id) => {
    const row = rows.find((r) => r.id === id);
    setRows((prev) => prev.filter((r) => r.id !== id));
    toast.success(`Member ${row?.name ?? ''} removed.`);
  };

  const groups = useMemo(() => {
    const present = new Set(rows.map((r) => r.role));
    return EFFORT_ROLES.filter((r) => present.has(r)).map((role) => ({ role, rows: rows.filter((r) => r.role === role) }));
  }, [rows]);

  const totals = useMemo(() => {
    const effortDays = rows.reduce((s, r) => s + Number(r.effortDays || 0), 0);
    const bufferDays = rows.reduce((s, r) => s + Number(r.bufferDays || 0), 0);
    return { effortDays, bufferDays, effortHrs: toHrs(effortDays), bufferHrs: toHrs(bufferDays), totalHrs: toHrs(effortDays + bufferDays) };
  }, [rows]);

  return { rows, groups, totals, updateRow, addMember, removeMember, allMembers: EFFORT_MEMBERS };
}
