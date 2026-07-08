import { useEffect, useMemo, useState } from 'react';
import './DailyUpdatesReport.css';
import { useSelector } from "react-redux";

const API_BASE = import.meta.env.VITE_API_BASE_URL;

const STATUS_STYLES = {
  'in-progress': { bg: '#fde4cf', fg: '#9a4a05' },
  practicing: { bg: '#f3d9e6', fg: '#9d174d' },
  completed: { bg: '#d8f3dc', fg: '#1b6b34' },
  blocked: { bg: '#fbd5d5', fg: '#b91c1c' },
  'not started': { bg: '#e5e7eb', fg: '#4b5563' },
};

function StatusBadge({ value }) {
  if (!value) return <span className="dur-badge dur-badge--muted">—</span>;
  const style = STATUS_STYLES[value.toLowerCase()] || { bg: '#e5e7eb', fg: '#4b5563' };
  return (
    <span className="dur-badge" style={{ background: style.bg, color: style.fg }}>
      {value}
    </span>
  );
}

function formatDateLabel(dateStr) {
  if (!dateStr) return '';
  const d = new Date(dateStr);
  const day = d.toLocaleDateString(undefined, { day: 'numeric' });
  const month = d.toLocaleDateString(undefined, { month: 'short' });
  const year = d.getFullYear();
  const weekday = d.toLocaleDateString(undefined, { weekday: 'long' });
  return { date: `${day}-${month}-${year}`, weekday };
}

export default function DailyUpdatesReport() {
  // Get Service Delivery employees from Redux (from login)
  const serviceDeliveryEmployees = useSelector(
    (state) => state.auth.serviceDeliveryEmployees
  );

  const [meta, setMeta] = useState({ dates: [], projects: [] });
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedProject, setSelectedProject] = useState('');
  const [selectedEmployee, setSelectedEmployee] = useState('');
  const [rows, setRows] = useState([]);
  const [loadingMeta, setLoadingMeta] = useState(true);
  const [loadingRows, setLoadingRows] = useState(false);
  const [error, setError] = useState('');

  console.log('📋 Redux Service Delivery Employees:', serviceDeliveryEmployees);

  // Load filter options (dates and projects only)
  useEffect(() => {
    async function loadMeta() {
      try {
        const token = localStorage.getItem('token');
        const res = await fetch(`${API_BASE}/api/daily-updates/meta`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        
        if (!res.ok) throw new Error('Failed to load filters');
        const data = await res.json();
        
        if (!data.success) {
          throw new Error(data.error || 'Failed to load filters');
        }

        setMeta({
          dates: data.dates || [],
          projects: data.projects || []
        });

        // Set today's date as default if available
        const today = new Date().toISOString().split('T')[0];
        if (data.dates && data.dates.includes(today)) {
          setSelectedDate(today);
        } else if (data.dates && data.dates.length > 0) {
          setSelectedDate(data.dates[0]);
        }

      } catch (err) {
        console.error('❌ Error loading meta:', err);
        setError(err.message);
      } finally {
        setLoadingMeta(false);
      }
    }
    loadMeta();
  }, []);

  // Fetch rows whenever the date or filters change
  useEffect(() => {
    if (!selectedDate) return;
    
    async function loadRows() {
      setLoadingRows(true);
      setError('');
      try {
        const token = localStorage.getItem('token');
        const params = new URLSearchParams({ date: selectedDate });
        if (selectedProject) params.set('project_id', selectedProject);
        if (selectedEmployee) params.set('user_id', selectedEmployee);
        
        const res = await fetch(
          `${API_BASE}/api/daily-updates/report?${params.toString()}`,
          {
            headers: {
              'Authorization': `Bearer ${token}`
            }
          }
        );
        
        if (!res.ok) throw new Error('Failed to load daily updates');
        const data = await res.json();
        
        if (!data.success) {
          throw new Error(data.error || 'Failed to load daily updates');
        }
        
        setRows(data.data || []);
      } catch (err) {
        console.error('❌ Error loading rows:', err);
        setError(err.message);
        setRows([]);
      } finally {
        setLoadingRows(false);
      }
    }
    loadRows();
  }, [selectedDate, selectedProject, selectedEmployee]);

  const totalHours = useMemo(
    () => rows.reduce((sum, r) => sum + (Number(r.total_time_needed) || 0), 0),
    [rows]
  );

  // Transform Redux employees for dropdown
  const employeeOptions = useMemo(() => {
    console.log('🔄 Transforming employees for dropdown:', serviceDeliveryEmployees);
    
    if (!serviceDeliveryEmployees || serviceDeliveryEmployees.length === 0) {
      console.warn('⚠️ No Service Delivery employees in Redux');
      return [];
    }

    return serviceDeliveryEmployees.map(emp => ({
      id: emp.employee_id || emp.u_id || emp.id,
      name: emp.emp_name || emp.name,
      emp_id: emp.employee_id,
      u_id: emp.u_id
    }));
  }, [serviceDeliveryEmployees]);

  console.log('📋 Employee dropdown options:', employeeOptions);

  return (
    <div className="dur-page">
      <div className="dur-toolbar">
        <div className="dur-toolbar-title">Daily Status Report</div>
        <div className="dur-filters">
          <label className="dur-filter">
            <span>Date</span>
            <select
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              disabled={loadingMeta || !meta.dates.length}
            >
              {meta.dates.map((d) => {
                const v = d.slice(0, 10);
                return (
                  <option key={v} value={v}>
                    {v}
                  </option>
                );
              })}
            </select>
          </label>

          <label className="dur-filter">
            <span>Project</span>
            <select 
              value={selectedProject} 
              onChange={(e) => setSelectedProject(e.target.value)}
            >
              <option value="">All projects</option>
              {meta.projects.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.project_name}
                </option>
              ))}
            </select>
          </label>

          <label className="dur-filter">
            <span>Employee</span>
            <select 
              value={selectedEmployee} 
              onChange={(e) => setSelectedEmployee(e.target.value)}
              disabled={employeeOptions.length === 0}
            >
              <option value="">All employees</option>
              {employeeOptions.map((emp) => (
                <option
                  key={emp.id || emp.emp_id}
                  value={emp.id || emp.emp_id}
                >
                  {emp.name} ({emp.emp_id})
                </option>
              ))}
            </select>
            {employeeOptions.length === 0 && !loadingMeta && (
              <span style={{ color: '#dc3545', fontSize: '12px', marginLeft: '10px' }}>
                No Service Delivery employees found
              </span>
            )}
          </label>
        </div>
      </div>

      <div className="dur-table-wrap">
        <table className="dur-table">
          <thead>
            <tr>
              <th className="dur-col-slno sticky-slno">SLNO</th>
              <th className="sticky-emp">Employee Name</th>
              <th className="sticky-project">Project</th>
              <th className="sticky-status">Task Name</th>
              <th>Previous Day plan</th>
              <th>Done Yesterday</th>
              <th>Today's Plan</th>
              <th>Risks</th>
              <th>Total Time Needed</th>
              <th>Availability</th>
              <th>Utilization (%)</th>
            </tr>
          </thead>
          <tbody>
            {loadingRows && (
              <tr>
                <td colSpan={10} className="dur-state-row">
                  Loading updates…
                </td>
              </tr>
            )}

            {!loadingRows && error && (
              <tr>
                <td colSpan={10} className="dur-state-row dur-state-row--error">
                  {error}
                </td>
              </tr>
            )}

            {!loadingRows && !error && rows.length === 0 && (
              <tr>
                <td colSpan={10} className="dur-state-row">
                  No updates logged for this date. Try a different date or filter.
                </td>
              </tr>
            )}

            {!loadingRows && !error && rows.map((row, idx) => {
              const totalTimeNeeded = Number(row.total_time_needed) || 0;
              const hasStoredAvailability = row.availability !== null && row.availability !== undefined && row.availability !== '';
              const availabilityText = hasStoredAvailability
                ? (String(row.availability).toLowerCase().includes("hr") ? row.availability : `${row.availability} hrs`)
                : `${8 - totalTimeNeeded} hrs`;
              const utilization = ((totalTimeNeeded / 8) * 100).toFixed(1);

              return (
                <tr key={row.id}>
                  <td className="dur-col-slno sticky-slno">{idx + 1}</td>
                  <td className="dur-text-cell dur-text-wrap sticky-emp">
                    {row.employee_name || '—'}
                  </td>
                  <td className="dur-text-cell dur-text-wrap sticky-project">
                    {row.project_name || '—'}
                  </td>
                  <td className="dur-text-cell sticky-status">
                    {row.task_name} 
                  </td>
                  <td className="dur-text-cell dur-text-wrap">
                    {row.previousDayPlan || '—'}
                  </td>
                  <td className="dur-text-cell dur-text-wrap">
                    {row.done_yesterday || '—'}
                  </td>
                  <td className="dur-text-cell dur-text-wrap">
                    {row.todays_tasks || '—'}
                  </td>
                  <td className="dur-text-cell dur-text-wrap">
                    {row.risks || '—'}
                  </td>
                  <td className="dur-col-hours">
                    {totalTimeNeeded} hrs
                  </td>
                  <td className="dur-col-hours">
                    {availabilityText}
                  </td>
                  <td className="dur-col-hours">
                    {utilization}%
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}