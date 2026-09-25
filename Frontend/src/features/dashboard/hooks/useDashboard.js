import { useEffect, useMemo, useState } from 'react';

import api from '@/api/axios';

import { MOCK_EMPLOYEES, MOCK_HEALTH, MOCK_PROJECTS, MOCK_STATUS_DISTRIBUTION, MOCK_SUMMARY } from '../mock/mockDashboard';

const initialsOf = (name) => (name || '?').trim().split(/\s+/).slice(0, 2).map((w) => w[0]).join('').toUpperCase();
const has = (value, q) => String(value).toLowerCase().includes(q.toLowerCase());

/** Data + filters for the Dashboard. API values override the mock summary/employees when available. */
export function useDashboard() {
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [utilization, setUtilization] = useState([]);

  const [projectSearch, setProjectSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('All Status');
  const [riskFilter, setRiskFilter] = useState('All Risk');

  const [employeeSearch, setEmployeeSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('All Roles');
  const [expandedId, setExpandedId] = useState(null);

  useEffect(() => {
    api.get('/dashboard').then((res) => setSummary(res.data)).catch(() => {}).finally(() => setLoading(false));
    api.get('/dashboard/user-utilization?range=monthly').then((res) => setUtilization(res.data || [])).catch(() => {});
  }, []);

  const kpis = {
    totalProjects: summary?.total_projects ?? MOCK_SUMMARY.totalProjects,
    inProgress: summary?.in_progress ?? MOCK_SUMMARY.inProgress,
    completed: summary?.completed ?? MOCK_SUMMARY.completed,
    delayed: summary?.delayed ?? MOCK_SUMMARY.delayed,
  };

  const projects = useMemo(
    () => MOCK_PROJECTS.filter((p) => (!projectSearch || has(p.name, projectSearch) || has(p.code, projectSearch)) && (statusFilter === 'All Status' || p.status === statusFilter) && (riskFilter === 'All Risk' || p.risk === riskFilter)),
    [projectSearch, statusFilter, riskFilter],
  );

  const employees = useMemo(() => {
    const base = utilization.length
      ? utilization.map((u, i) => ({
          ...MOCK_EMPLOYEES[i % MOCK_EMPLOYEES.length],
          id: u.emp_id || `EMP-${2041 + i}`,
          name: u.name,
          initials: initialsOf(u.name),
          role: u.role || 'Backend',
          projects: u.projects || [],
          days: `${u.working_days || 84} business days`,
          window: u.window || '',
          windowPct: u.window_pct || 70,
          utilPct: Math.round(parseFloat(u.utilization_percentage) || 96),
        }))
      : MOCK_EMPLOYEES;
    return base.filter((e) => (!employeeSearch || has(e.name, employeeSearch) || has(e.id, employeeSearch)) && (roleFilter === 'All Roles' || e.role === roleFilter));
  }, [utilization, employeeSearch, roleFilter]);

  return {
    loading, kpis, health: MOCK_HEALTH, distribution: MOCK_STATUS_DISTRIBUTION,
    projects, projectSearch, setProjectSearch, statusFilter, setStatusFilter, riskFilter, setRiskFilter,
    employees, employeeSearch, setEmployeeSearch, roleFilter, setRoleFilter,
    expandedId, toggleExpanded: (id) => setExpandedId((prev) => (prev === id ? null : id)),
  };
}
