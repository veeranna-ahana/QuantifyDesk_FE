
import React, { useEffect, useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import toast from 'react-hot-toast';
import axios from 'axios';
import Cookies from 'js-cookie';
import { Icon } from '@iconify/react';
import SearchableSelect from '../component/SearchableSelect';

// ── Role helper ───────────────────────────────────────────────────────────────
const getUserRole = () => {
  try {
    const cookieUser = JSON.parse(Cookies.get('user') || 'null');
    if (cookieUser?.role) return cookieUser.role.toUpperCase();
  } catch { /* ignore */ }
  return (localStorage.getItem('role') || 'EMPLOYEE').toUpperCase();
};

const BASE_URL = import.meta.env.VITE_API_BASE_URL;
const getHeaders = () => ({
  Authorization: `Bearer ${localStorage.getItem('token') || ''}`,
});

// ── Effort estimate role config ───────────────────────────────────────────────
const EFFORT_ROLES = [
  { role: 'BA', unitLabel: '' },
  { role: 'Solution Architect', unitLabel: '' },
  { role: 'UI/UX', unitLabel: '' },
  { role: 'FE Dev', unitLabel: 'No of UI Screens' },
  { role: 'BE Dev', unitLabel: 'No of APIs' },
  { role: 'Tester', unitLabel: 'No of Cases' },
  { role: 'Deployment', unitLabel: '' },
  { role: 'Warranty & Support', unitLabel: '' },
  { role: 'Project Manager', unitLabel: '' },
];

const HOURS_PER_DAY = 8;

// ── Create Project Modal ──────────────────────────────────────────────────────
const CreateProjectModal = ({ onClose, onCreated }) => {
  const [form, setForm] = useState({
    projectName: '',
    description: '',
    nbdId: '',
    o2dId: '',
    projectCode: '',
    subCategory: '',
    customer: '',
    teamLead: '',
    startDate: '',
    endDate: '',
    projectType: 'one time project - otp',
    status: 'Not started',
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const serviceDeliveryEmployees = useSelector(state => state.auth?.serviceDeliveryEmployees);
  const [employees, setEmployees] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem('serviceDeliveryEmployees') || '[]');
    } catch {
      return [];
    }
  });

  useEffect(() => {
    if (serviceDeliveryEmployees && serviceDeliveryEmployees.length > 0) {
      setEmployees(serviceDeliveryEmployees);
      return;
    }
    const fetchEmployees = async () => {
      try {
        const res = await axios.post(`${BASE_URL}/hrms/getAllAhanaEmplist`, {}, { headers: getHeaders() });
        const list = Array.isArray(res.data)
          ? res.data
          : Array.isArray(res.data?.data)
            ? res.data.data
            : [];
        if (list.length > 0) {
          setEmployees(list);
        }
      } catch (err) {
        console.error('Failed to fetch employees:', err);
      }
    };
    fetchEmployees();
  }, [serviceDeliveryEmployees]);

  const employeeOptions = useMemo(() => {
    return employees.map(emp => {
      const name = emp.emp_name || emp.name || '';
      const id = emp.employee_id || emp.emp_id || emp.id || '';
      return {
        value: name,
        label: id ? `${name} (${id})` : name,
      };
    });
  }, [employees]);

  const handleChange = (field, val) => {
    setForm(prev => ({ ...prev, [field]: val }));
    setError('');
  };

  const handleSubmit = async () => {
    if (!form.projectName.trim()) return setError('Project Name is required.');
    // if (!form.customer.trim()) return setError('Customer is required.');
    if (form.startDate && form.endDate && form.endDate < form.startDate) {
      return setError('End Date cannot be earlier than Start Date.');
    }
    setSaving(true);
    try {
      await axios.post(
        `${BASE_URL}/api/projects`,
        {
          name: form.projectName.trim(),
          clientName: form.customer ? form.customer.trim() : null,
          description: form.description.trim(),
          nbdId: form.nbdId.trim(),
          o2dId: form.o2dId.trim(),
          projectCode: form.projectCode.trim(),
          subCategory: form.subCategory.trim(),
          teamLead: form.teamLead.trim() || null,
          startDate: form.startDate || null,
          endDate: form.endDate || null,
          status: form.status,
          projectType: form.projectType,
        },
        { headers: getHeaders() }
      );
      onCreated();
      onClose();
    } catch (err) {
      setError(err?.response?.data?.message || 'Failed to create project.');
    } finally {
      setSaving(false);
    }
  };

  const fields = [
    { key: 'projectName', label: 'Project Name', required: true, placeholder: 'e.g. ERP Phase 2' },
    { key: 'description', label: 'Description', required: false, placeholder: 'Brief overview…', multiline: true },
    { key: 'nbdId', label: 'NBD ID', required: false, placeholder: 'e.g. NBD-2024-001' },
    { key: 'o2dId', label: 'O2D ID', required: false, placeholder: 'e.g. O2D-2024-042' },
    { key: 'projectCode', label: 'Project Code', required: false, placeholder: 'e.g. PRJ-001' },
    { key: 'subCategory', label: 'Sub Category', required: false, placeholder: 'e.g. Web App / Mobile' },
    { key: 'customer', label: 'Customer', required: false, placeholder: 'Client or company name' },
    { key: 'teamLead', label: 'Team Lead', required: false, placeholder: 'Select Team Lead', isSelect: true },
  ];

  return (
    <div style={O.overlay} onClick={e => { if (e.target === e.currentTarget) onClose(); }}>
      <div style={O.modal}>

        {/* Header */}
        <div style={O.header}>
          <div>
            <div style={O.title}>Create New Project</div>
            <div style={O.sub}>Fill in the details below to register a new project.</div>
          </div>
          <button onClick={onClose} style={O.closeBtn}>✕</button>
        </div>

        {/* Form */}
        <div style={O.formGrid}>
          {fields.map(f => (
            <div key={f.key} style={f.multiline ? { gridColumn: '1 / -1' } : {}}>
              <label style={O.label}>
                {f.label}
                {f.required && <span style={{ color: '#e74c3c', marginLeft: 3 }}>*</span>}
              </label>
              {f.isSelect ? (
                <SearchableSelect
                  value={form[f.key]}
                  onChange={val => handleChange(f.key, val)}
                  placeholder={f.placeholder}
                  options={employeeOptions}
                />
              ) : f.multiline ? (
                <textarea
                  rows={3}
                  value={form[f.key]}
                  onChange={e => handleChange(f.key, e.target.value)}
                  placeholder={f.placeholder}
                  style={{ ...O.input, resize: 'vertical', minHeight: 72 }}
                />
              ) : (
                <input
                  type="text"
                  value={form[f.key]}
                  onChange={e => handleChange(f.key, e.target.value)}
                  placeholder={f.placeholder}
                  style={O.input}
                />
              )}
            </div>
          ))}

          {/* Start Date */}
          <div>
            <label style={O.label}>Start Date</label>
            <input
              type="date"
              value={form.startDate}
              max={form.endDate || undefined}
              onChange={e => handleChange('startDate', e.target.value)}
              style={O.input}
            />
          </div>

          {/* End Date */}
          <div>
            <label style={O.label}>End Date</label>
            <input
              type="date"
              value={form.endDate}
              min={form.startDate || undefined}
              onChange={e => handleChange('endDate', e.target.value)}
              style={O.input}
            />
          </div>

          {/* Project Type */}
          <div>
            <label style={O.label}>Project Type <span style={{ color: '#e74c3c', marginLeft: 3 }}>*</span></label>
            <select
              value={form.projectType}
              onChange={e => handleChange('projectType', e.target.value)}
              style={O.input}
            >
              <option value="one time project - otp">one time project - otp</option>
              <option value="managed service">managed service</option>
              <option value="Staff Augmentation">Staff Augmentation</option>
            </select>
          </div>

          {/* Status */}
          <div>
            <label style={O.label}>Status <span style={{ color: '#e74c3c', marginLeft: 3 }}>*</span></label>
            <select
              value={form.status}
              onChange={e => handleChange('status', e.target.value)}
              style={O.input}
            >
              <option value="Not started">Not Started</option>
              <option value="In progress">In Progress</option>
              <option value="Completed">Completed</option>
              <option value="Abandoned">Abandoned</option>
            </select>
          </div>
        </div>

        {error && <p style={O.error}>{error}</p>}

        {/* Footer */}
        <div style={O.footer}>
          <button onClick={onClose} style={O.cancelBtn}>Cancel</button>
          <button onClick={handleSubmit} style={O.submitBtn} disabled={saving}>
            {saving ? 'Creating…' : '+ Create Project'}
          </button>
        </div>
      </div>
    </div>
  );
};

// ── Edit Project Modal ──────────────────────────────────────────────────────
const EditProjectModal = ({ project, onClose, onUpdated }) => {
  const [form, setForm] = useState({
    projectName: project.project_name || project.name || '',
    description: project.description || '',
    nbdId: project.nbd_id || '',
    o2dId: project.o2d_id || '',
    projectCode: project.project_code || '',
    subCategory: project.sub_category || '',
    customer: project.client_name || '',
    teamLead: project.team_lead || '',
    startDate: project.start_date ? project.start_date.split('T')[0] : '',
    endDate: project.end_date ? project.end_date.split('T')[0] : '',
    projectType: project.project_type || 'one time project - otp',
    status: project.status || 'Not started',
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const serviceDeliveryEmployees = useSelector(state => state.auth?.serviceDeliveryEmployees);
  const [employees, setEmployees] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem('serviceDeliveryEmployees') || '[]');
    } catch {
      return [];
    }
  });

  useEffect(() => {
    if (serviceDeliveryEmployees && serviceDeliveryEmployees.length > 0) {
      setEmployees(serviceDeliveryEmployees);
      return;
    }
    const fetchEmployees = async () => {
      try {
        const res = await axios.post(`${BASE_URL}/hrms/getAllAhanaEmplist`, {}, { headers: getHeaders() });
        const list = Array.isArray(res.data)
          ? res.data
          : Array.isArray(res.data?.data)
            ? res.data.data
            : [];
        if (list.length > 0) {
          setEmployees(list);
        }
      } catch (err) {
        console.error('Failed to fetch employees:', err);
      }
    };
    fetchEmployees();
  }, [serviceDeliveryEmployees]);

  const employeeOptions = useMemo(() => {
    return employees.map(emp => {
      const name = emp.emp_name || emp.name || '';
      const id = emp.employee_id || emp.emp_id || emp.id || '';
      return {
        value: name,
        label: id ? `${name} (${id})` : name,
      };
    });
  }, [employees]);

  const handleChange = (field, val) => {
    setForm(prev => ({ ...prev, [field]: val }));
    setError('');
  };

  const handleSubmit = async () => {
    if (!form.projectName.trim()) return setError('Project Name is required.');
    // if (!form.customer.trim()) return setError('Customer is required.');
    if (form.startDate && form.endDate && form.endDate < form.startDate) {
      return setError('End Date cannot be earlier than Start Date.');
    }
    setSaving(true);
    try {
      await axios.put(
        `${BASE_URL}/api/projects/${project.id}`,
        {
          name: form.projectName.trim(),
          clientName: form.customer ? form.customer.trim() : null,
          description: form.description.trim(),
          nbdId: form.nbdId.trim(),
          o2dId: form.o2dId.trim(),
          projectCode: form.projectCode.trim(),
          subCategory: form.subCategory.trim(),
          teamLead: form.teamLead.trim() || null,
          startDate: form.startDate || null,
          endDate: form.endDate || null,
          status: form.status,
          projectType: form.projectType,
        },
        { headers: getHeaders() }
      );
      onUpdated();
      onClose();
    } catch (err) {
      setError(err?.response?.data?.message || 'Failed to update project.');
    } finally {
      setSaving(false);
    }
  };

  const fields = [
    { key: 'projectName', label: 'Project Name', required: true, placeholder: 'e.g. ERP Phase 2' },
    { key: 'description', label: 'Description', required: false, placeholder: 'Brief overview…', multiline: true },
    { key: 'nbdId', label: 'NBD ID', required: false, placeholder: 'e.g. NBD-2024-001' },
    { key: 'o2dId', label: 'O2D ID', required: false, placeholder: 'e.g. O2D-2024-042' },
    { key: 'projectCode', label: 'Project Code', required: false, placeholder: 'e.g. PRJ-001' },
    { key: 'subCategory', label: 'Sub Category', required: false, placeholder: 'e.g. Web App / Mobile' },
    { key: 'customer', label: 'Customer', required: false, placeholder: 'Client or company name' },
    { key: 'teamLead', label: 'Team Lead', required: false, placeholder: 'Select Team Lead', isSelect: true },
  ];

  return (
    <div style={O.overlay} onClick={e => { if (e.target === e.currentTarget) onClose(); }}>
      <div style={O.modal}>

        {/* Header */}
        <div style={O.header}>
          <div>
            <div style={O.title}>Edit Project</div>
            <div style={O.sub}>Update the details or status of the project.</div>
          </div>
          <button onClick={onClose} style={O.closeBtn}>✕</button>
        </div>

        {/* Form */}
        <div style={O.formGrid}>
          {fields.map(f => (
            <div key={f.key} style={f.multiline ? { gridColumn: '1 / -1' } : {}}>
              <label style={O.label}>
                {f.label}
                {f.required && <span style={{ color: '#e74c3c', marginLeft: 3 }}>*</span>}
              </label>
              {f.isSelect ? (
                <SearchableSelect
                  value={form[f.key]}
                  onChange={val => handleChange(f.key, val)}
                  placeholder={f.placeholder}
                  options={employeeOptions}
                />
              ) : f.multiline ? (
                <textarea
                  rows={3}
                  value={form[f.key]}
                  onChange={e => handleChange(f.key, e.target.value)}
                  placeholder={f.placeholder}
                  style={{ ...O.input, resize: 'vertical', minHeight: 72 }}
                />
              ) : (
                <input
                  type="text"
                  value={form[f.key]}
                  onChange={e => handleChange(f.key, e.target.value)}
                  placeholder={f.placeholder}
                  style={O.input}
                />
              )}
            </div>
          ))}

          {/* Start Date */}
          <div>
            <label style={O.label}>Start Date</label>
            <input
              type="date"
              value={form.startDate}
              max={form.endDate || undefined}
              onChange={e => handleChange('startDate', e.target.value)}
              style={O.input}
            />
          </div>

          {/* End Date */}
          <div>
            <label style={O.label}>End Date</label>
            <input
              type="date"
              value={form.endDate}
              min={form.startDate || undefined}
              onChange={e => handleChange('endDate', e.target.value)}
              style={O.input}
            />
          </div>

          {/* Project Type */}
          <div>
            <label style={O.label}>Project Type <span style={{ color: '#e74c3c', marginLeft: 3 }}>*</span></label>
            <select
              value={form.projectType}
              onChange={e => handleChange('projectType', e.target.value)}
              style={O.input}
            >
              <option value="one time project - otp">one time project - otp</option>
              <option value="managed service">managed service</option>
              <option value="Staff Augmentation">Staff Augmentation</option>
            </select>
          </div>

          {/* Status */}
          <div>
            <label style={O.label}>Status <span style={{ color: '#e74c3c', marginLeft: 3 }}>*</span></label>
            <select
              value={form.status}
              onChange={e => handleChange('status', e.target.value)}
              style={O.input}
            >
              <option value="Not started">Not Started</option>
              <option value="In progress">In Progress</option>
              <option value="Completed">Completed</option>
              <option value="Abandoned">Abandoned</option>
            </select>
          </div>
        </div>

        {error && <p style={O.error}>{error}</p>}

        {/* Footer */}
        <div style={O.footer}>
          <button onClick={onClose} style={O.cancelBtn}>Cancel</button>
          <button onClick={handleSubmit} style={O.submitBtn} disabled={saving}>
            {saving ? 'Saving…' : 'Save Changes'}
          </button>
        </div>
      </div>
    </div>
  );
};

// ── Effort Estimate Modal ─────────────────────────────────────────────────────
const EffortEstimateModal = ({ projects, onClose, onSaved, initialProjectId, readOnly = false }) => {
  const [selectedProject, setSelectedProject] = useState(initialProjectId || '');
  const [saving, setSaving] = useState(false);
  // rows: { role, days, hrs, bufferDays, bufferHrs, totalHrs, units, unitLabel }
  const [rows, setRows] = useState(
    EFFORT_ROLES.map(r => ({
      role: r.role,
      unitLabel: r.unitLabel,
      days: '',
      hrs: '',
      bufferDays: '',
      bufferHrs: '',
      totalHrs: '',
      units: '',
    }))
  );

  useEffect(() => {
    if (!selectedProject) {
      setRows(
        EFFORT_ROLES.map(r => ({
          role: r.role,
          unitLabel: r.unitLabel,
          days: '',
          hrs: '',
          bufferDays: '',
          bufferHrs: '',
          totalHrs: '',
          units: '',
        }))
      );
      return;
    }

    const fetchExistingEffort = async () => {
      try {
        const res = await axios.get(
          `${BASE_URL}/api/projects/${selectedProject}/effort`,
          { headers: getHeaders() }
        );
        const fetchedRows = res.data?.rows || [];

        if (fetchedRows.length > 0) {
          const merged = EFFORT_ROLES.map(r => {
            const existing = fetchedRows.find(fr => fr.role === r.role);
            if (existing) {
              return {
                role: r.role,
                unitLabel: r.unitLabel,
                days: existing.effort_days !== null && existing.effort_days !== undefined ? String(existing.effort_days) : '',
                hrs: existing.effort_hrs !== null && existing.effort_hrs !== undefined ? String(existing.effort_hrs) : '',
                bufferDays: existing.buffer_days !== null && existing.buffer_days !== undefined ? String(existing.buffer_days) : '',
                bufferHrs: existing.buffer_hrs !== null && existing.buffer_hrs !== undefined ? String(existing.buffer_hrs) : '',
                totalHrs: existing.total_hrs !== null && existing.total_hrs !== undefined ? String(existing.total_hrs) : '',
                units: existing.units !== null && existing.units !== undefined ? String(existing.units) : '',
              };
            }
            return {
              role: r.role,
              unitLabel: r.unitLabel,
              days: '',
              hrs: '',
              bufferDays: '',
              bufferHrs: '',
              totalHrs: '',
              units: '',
            };
          });
          setRows(merged);
        } else {
          setRows(
            EFFORT_ROLES.map(r => ({
              role: r.role,
              unitLabel: r.unitLabel,
              days: '',
              hrs: '',
              bufferDays: '',
              bufferHrs: '',
              totalHrs: '',
              units: '',
            }))
          );
        }
      } catch (err) {
        console.error("Error fetching existing effort estimates:", err);
      }
    };

    const runFetch = async () => {
      await fetchExistingEffort();
    };
    runFetch();
  }, [selectedProject]);

  const handleChange = (idx, field, val) => {
    setRows(prev => {
      const next = [...prev];
      const sanitizedVal = field === 'units' ? (val === '' ? '' : val.replace(/\D/g, '')) : val;
      next[idx] = { ...next[idx], [field]: sanitizedVal };

      // Auto-calculate hrs from days
      if (field === 'days') {
        const d = parseFloat(val);
        next[idx].hrs = isNaN(d) ? '' : String(d * HOURS_PER_DAY);
      }
      // Auto-calculate bufferHrs from bufferDays
      if (field === 'bufferDays') {
        const bd = parseFloat(val);
        next[idx].bufferHrs = isNaN(bd) ? '' : String(bd * HOURS_PER_DAY);
      }
      // Auto-calculate totalHrs
      const h = parseFloat(next[idx].hrs) || 0;
      const bh = parseFloat(next[idx].bufferHrs) || 0;
      next[idx].totalHrs = (h + bh) > 0 ? String(h + bh) : '';

      return next;
    });
  };

  // Totals row
  const totals = rows.reduce(
    (acc, r) => ({
      days: acc.days + (parseFloat(r.days) || 0),
      hrs: acc.hrs + (parseFloat(r.hrs) || 0),
      bufferDays: acc.bufferDays + (parseFloat(r.bufferDays) || 0),
      bufferHrs: acc.bufferHrs + (parseFloat(r.bufferHrs) || 0),
      totalHrs: acc.totalHrs + (parseFloat(r.totalHrs) || 0),
    }),
    { days: 0, hrs: 0, bufferDays: 0, bufferHrs: 0, totalHrs: 0 }
  );
  const handleSubmit = async () => {

    if (!selectedProject) {
      toast.error("Please select a project");
      return;
    }

    // Check if any role has effort (days or bufferDays) defined, but units is missing or <= 0
    const activeRolesMissingUnits = rows.filter(r => {
      const days = parseFloat(r.days) || 0;
      const bufferDays = parseFloat(r.bufferDays) || 0;
      const hasEffort = days > 0 || bufferDays > 0;
      const hasUnits = r.units && parseInt(r.units, 10) > 0;
      return hasEffort && !hasUnits;
    });

    if (activeRolesMissingUnits.length > 0) {
      toast.error(`Units are mandatory for roles with effort. Please specify units for: ${activeRolesMissingUnits.map(r => r.role).join(', ')}`);
      return;
    }


    try {

      setSaving(true);

      // await axios.post(
      //   `${BASE_URL}/api/effort-estimates`,
      //   {
      //     projectId: selectedProject,
      //     estimates: rows,
      //   },
      //   {
      //     headers: getHeaders(),
      //   }
      // );
      await axios.post(
        `${BASE_URL}/api/projects/${selectedProject}/effort/bulk`,
        {
          rows: rows.map(r => ({
            role: r.role,
            effort_days: r.days,
            buffer_days: r.bufferDays,
            units: r.units,
            unit_label: r.unitLabel,
          })),
        },
        {
          headers: getHeaders(),
        }
      );
      toast.success("Effort estimate saved successfully!");

      onSaved?.();

      onClose();

    } catch (err) {

      console.error(err);

      toast.error(
        err?.response?.data?.message ||
        "Failed to save estimate"
      );

    } finally {

      setSaving(false);

    }
  };
  const handleCopy = () => {
    const header = ['Role', 'Days', 'Hrs', 'Buffer Days', 'Buffer Hrs', 'Total Hrs', 'Units'].join('\t');
    const body = rows.map(r =>
      [r.role, r.days, r.hrs, r.bufferDays, r.bufferHrs, r.totalHrs, r.units].join('\t')
    ).join('\n');
    navigator.clipboard.writeText(`${header}\n${body}`).catch(() => { });
  };

  return (
    <div style={O.overlay} onClick={e => { if (e.target === e.currentTarget) onClose(); }}>
      <div style={{ ...O.modal, maxWidth: 860 }}>

        {/* Header */}
        <div style={O.header}>
          <div>
            <div style={O.title}>{readOnly ? 'View Effort Estimate' : 'Effort Estimate'}</div>
            <div style={O.sub}>
              {readOnly
                ? 'Viewing effort estimate (read-only).'
                : 'Enter days per role — hours are calculated automatically (1 day = 8 hrs).'}
            </div>
          </div>
          <button onClick={onClose} style={O.closeBtn}>✕</button>
        </div>
        {/* Project Selection */}
        <div style={{ marginBottom: 20 }}>
          <label style={O.label}>
            Select Project
            <span style={{ color: '#e74c3c' }}> *</span>
          </label>

          <select
            value={selectedProject}
            onChange={(e) => setSelectedProject(e.target.value)}
            style={O.input}
          >
            <option value="">Select Project</option>

            {projects.map((project) => (
              <option
                key={project.id}
                value={project.id}
              >
                {project.project_name || project.name}
              </option>
            ))}
          </select>
        </div>
        {/* Table */}
        <div style={{ overflowX: 'auto', marginTop: 4 }}>
          <table style={E.table}>
            <thead>
              <tr>
                <th style={{ ...E.th, textAlign: 'left', minWidth: 155 }}>Role</th>
                <th style={E.th}>Effort (Days)</th>
                <th style={E.thCalc}>In Hrs</th>
                <th style={E.th}>Buffer (Days)</th>
                <th style={E.thCalc}>Buffer Hrs</th>
                <th style={{ ...E.thCalc, color: '#27ae60' }}>Total Hrs</th>
                <th style={E.th}>Units</th>
                <th style={{ ...E.th, minWidth: 130, textAlign: 'left' }}>Unit Label</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r, i) => (
                <tr key={r.role} style={{ background: i % 2 === 0 ? '#fff' : '#f9fafb' }}>
                  <td style={E.tdRole}>{r.role}</td>

                  <td style={E.td}>
                    {readOnly ? (
                      <span style={E.readOnlyVal}>{r.days || '—'}</span>
                    ) : (
                      <input
                        type="number" min="0" step="0.5"
                        value={r.days} placeholder="0"
                        onChange={e => handleChange(i, 'days', e.target.value)}
                        style={E.numInput}
                      />
                    )}
                  </td>

                  <td style={E.tdCalc}>{r.hrs || '—'}</td>

                  <td style={E.td}>
                    {readOnly ? (
                      <span style={E.readOnlyVal}>{r.bufferDays || '—'}</span>
                    ) : (
                      <input
                        type="number" min="0" step="0.5"
                        value={r.bufferDays} placeholder="0"
                        onChange={e => handleChange(i, 'bufferDays', e.target.value)}
                        style={E.numInput}
                      />
                    )}
                  </td>

                  <td style={E.tdCalc}>{r.bufferHrs || '—'}</td>

                  <td style={{ ...E.tdCalc, color: '#27ae60', fontWeight: 700 }}>
                    {r.totalHrs || '—'}
                  </td>

                  <td style={E.td}>
                    {readOnly ? (
                      <span style={E.readOnlyVal}>{r.units || '—'}</span>
                    ) : (
                      <input
                        type="number" min="0" step="1"
                        value={r.units} placeholder="0"
                        onKeyDown={(e) => { if (e.key === '.' || e.key === 'e' || e.key === 'E' || e.key === '+' || e.key === '-') e.preventDefault(); }}
                        onChange={e => handleChange(i, 'units', e.target.value.replace(/\D/g, ''))}
                        style={E.numInput}
                      />
                    )}
                  </td>

                  <td style={{ ...E.tdCalc, textAlign: 'left', color: '#999', fontSize: 11 }}>
                    {r.unitLabel || '—'}
                  </td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr style={{ background: '#1e272e' }}>
                <td style={{ ...E.tdRole, color: '#fff', fontWeight: 800 }}>TOTAL</td>
                <td style={{ ...E.tdCalc, color: '#fff' }}>{totals.days || '—'}</td>
                <td style={{ ...E.tdCalc, color: '#f39c12' }}>{totals.hrs || '—'}</td>
                <td style={{ ...E.tdCalc, color: '#fff' }}>{totals.bufferDays || '—'}</td>
                <td style={{ ...E.tdCalc, color: '#f39c12' }}>{totals.bufferHrs || '—'}</td>
                <td style={{ ...E.tdCalc, color: '#2ecc71', fontWeight: 800 }}>{totals.totalHrs || '—'}</td>
                <td style={E.tdCalc}></td>
                <td style={E.tdCalc}></td>
              </tr>
            </tfoot>
          </table>
        </div>


        <div style={O.footer}>
          <button onClick={onClose} style={O.cancelBtn}>Close</button>
          {!readOnly && (
            <button onClick={handleSubmit} disabled={saving} style={O.submitBtn}>
              {saving ? 'Saving...' : 'Save Estimate'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

// ── Pagination chevrons ───────────────────────────────────────────────────────
const ChevL = () => <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path d="M15 18l-6-6 6-6" /></svg>;
const ChevR = () => <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path d="M9 18l6-6-6-6" /></svg>;
const EditIcon = () => (
  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
    <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
    <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
  </svg>
);

const PAGE_SIZE = 10;

// ── Status badge config ───────────────────────────────────────────────────────
const STATUS_CFG = {
  'not started': { cls: 'bg-amber-100 text-amber-700', label: 'NOT STARTED' },
  'in progress': { cls: 'bg-blue-100  text-blue-700', label: 'IN PROGRESS' },
  completed: { cls: 'bg-blue-100  text-blue-700', label: 'COMPLETED' },
  abandoned: { cls: 'bg-red-100   text-red-600', label: 'ABANDONED' },
  active: { cls: 'bg-green-100 text-green-700', label: 'ACTIVE' },
  new: { cls: 'bg-violet-100 text-violet-700', label: 'NEW' },
  'on hold': { cls: 'bg-orange-100 text-orange-700', label: 'HOLD' },
  'new cr': { cls: 'bg-indigo-100 text-indigo-700', label: 'NEW CR' },
};

// ── Main Projects Component ───────────────────────────────────────────────────
const Projects = () => {
  const navigate = useNavigate();
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [initialEffortProjectId, setInitialEffortProjectId] = useState('');
  const [page, setPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [typeFilter, setTypeFilter] = useState('');

  const isAdmin = getUserRole() === 'ADMIN';

  const fetchProjects = async () => {
    try {
      setLoading(true);
      const res = await axios.get(`${BASE_URL}/api/projects`, { headers: getHeaders() });
      setProjects(res.data || []);
      setPage(1);
    } catch (err) {
      console.error(err);
      setProjects([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchProjects(); }, []);

  // ── Filter Options ──────────────────────────────────────────────────────────
  const statusOptions = useMemo(() => {
    const set = new Set();
    projects.forEach(p => {
      if (p.status) set.add(p.status);
    });
    return Array.from(set);
  }, [projects]);

  const typeOptions = useMemo(() => {
    const set = new Set();
    projects.forEach(p => {
      if (p.project_type) set.add(p.project_type);
    });
    return Array.from(set);
  }, [projects]);

  // ── Filtered Projects ───────────────────────────────────────────────────────
  const filteredProjects = useMemo(() => {
    const q = searchTerm.trim().toLowerCase();
    return projects.filter(p => {
      // Search text match
      const matchesSearch = !q || (
        (p.project_code && p.project_code.toLowerCase().includes(q)) ||
        (p.nbd_id && p.nbd_id.toLowerCase().includes(q)) ||
        (p.o2d_id && p.o2d_id.toLowerCase().includes(q)) ||
        ((p.project_name || p.name) && (p.project_name || p.name).toLowerCase().includes(q)) ||
        (p.client_name && p.client_name.toLowerCase().includes(q)) ||
        (p.team_lead && p.team_lead.toLowerCase().includes(q)) ||
        (p.sub_category && p.sub_category.toLowerCase().includes(q)) ||
        (p.description && p.description.toLowerCase().includes(q)) ||
        (p.project_type && p.project_type.toLowerCase().includes(q)) ||
        (p.status && p.status.toLowerCase().includes(q))
      );

      // Status match
      const matchesStatus = !statusFilter || (
        p.status && p.status.toLowerCase() === statusFilter.toLowerCase()
      );

      // Type match
      const matchesType = !typeFilter || (
        p.project_type && p.project_type.toLowerCase() === typeFilter.toLowerCase()
      );

      return matchesSearch && matchesStatus && matchesType;
    });
  }, [projects, searchTerm, statusFilter, typeFilter]);

  const hasActiveFilters = Boolean(searchTerm.trim() || statusFilter || typeFilter);

  const handleResetFilters = () => {
    setSearchTerm('');
    setStatusFilter('');
    setTypeFilter('');
    setPage(1);
  };

  // ── Pagination ──────────────────────────────────────────────────────────────
  const totalPages = Math.max(1, Math.ceil(filteredProjects.length / PAGE_SIZE));
  const pageRows = filteredProjects.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);
  const startEntry = filteredProjects.length === 0 ? 0 : (page - 1) * PAGE_SIZE + 1;
  const endEntry = Math.min(page * PAGE_SIZE, filteredProjects.length);

  // ── Status badge ────────────────────────────────────────────────────────────
  const StatusBadge = ({ status }) => {
    const key = (status || '').toLowerCase();
    const cfg = STATUS_CFG[key] || { cls: 'bg-gray-100 text-gray-500', label: status || '—' };
    return (
      <span className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold tracking-wider ${cfg.cls}`}>
        {cfg.label}
      </span>
    );
  };

  // ── Cols ─────────────────────────────────────────────────────────────────────
  const COLS = [
    { label: 'PROJECT CODE', w: 'w-[110px]' },
    { label: 'NBD / O2D ID', w: 'w-[110px]' },
    { label: 'PROJECT NAME', w: '' },
    { label: 'TEAM LEAD', w: 'w-[120px]' },
    { label: 'TYPE', w: 'w-[130px]' },
    { label: 'TIMELINE', w: 'w-[120px]' },
    { label: 'STATUS', w: 'w-[100px]' },
    { label: 'EFFORT (HRS/DAYS)', w: 'w-[130px]' },
    { label: 'ACTION', w: 'w-[120px]' },
  ];

  return (
    <div className="min-h-screen bg-[#f0f0f8] p-6 font-sans">

      {/* ── Page header ── */}
      <div className="sticky top-0 z-30 bg-[#f0f0f8]/95 backdrop-blur-md pb-4 -mt-2 flex items-start justify-between mb-4 flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 leading-tight">Projects</h1>
          <p className="text-sm text-gray-400 mt-0.5">Manage and reconcile enterprise-level project efforts.</p>
        </div>
        {!isAdmin && (
          <div className="flex items-center gap-3">
            {/* Create Project — filled violet */}
            <button
              onClick={() => navigate('/projects/create')}
              className="flex items-center gap-2 px-4 py-2 bg-[#856BFF] hover:bg-[#7354fd] text-white text-sm font-semibold rounded-lg shadow-sm transition-colors"
            >
              + Create Project
            </button>
          </div>
        )}
      </div>

      {/* ── Table card ── */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 flex flex-col">
        {/* ── Table Card Header with Search & Filters ── */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100 flex-wrap gap-3">
          <div className="flex items-center gap-2">
            <h2 className="font-bold text-gray-900 text-[15px]">All Projects</h2>
            <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-[#856BFF]/10 text-[#856BFF]">
              {filteredProjects.length} {filteredProjects.length === 1 ? 'project' : 'projects'}
            </span>
          </div>

          <div className="flex items-center gap-2.5 flex-wrap">
            {/* Search Input */}
            <div className="min-w-[220px] max-w-xs flex-1">
              <div className="flex items-center gap-2 border border-gray-200 rounded-lg px-3 py-1.5 h-[38px] bg-white focus-within:border-[#856BFF] focus-within:ring-2 focus-within:ring-[#856BFF]/20 transition-all">
                <Icon icon="material-symbols:search" width="18" height="18" color="#856BFF" className="shrink-0" />
                <input
                  type="text"
                  placeholder="Search projects..."
                  value={searchTerm}
                  onChange={(e) => {
                    setSearchTerm(e.target.value);
                    setPage(1);
                  }}
                  className="w-full bg-transparent !border-none outline-none ring-0 shadow-none text-xs text-gray-700 placeholder-gray-400 focus:outline-none focus:ring-0 focus:!border-none"
                  style={{ border: 'none', outline: 'none', boxShadow: 'none', background: 'transparent' }}
                />
                {searchTerm && (
                  <button
                    onClick={() => {
                      setSearchTerm('');
                      setPage(1);
                    }}
                    className="text-gray-400 hover:text-gray-600 transition-colors shrink-0 p-0.5"
                    title="Clear search"
                  >
                    <Icon icon="material-symbols:close" width="16" height="16" />
                  </button>
                )}
              </div>
            </div>

            {/* Status Filter */}
            <div className="min-w-[130px]">
              <select
                value={statusFilter}
                onChange={(e) => {
                  setStatusFilter(e.target.value);
                  setPage(1);
                }}
                className="w-full h-[38px] px-3 py-1.5 border border-gray-200 rounded-lg text-xs font-medium text-gray-700 bg-white hover:border-gray-300 focus:outline-none focus:border-[#856BFF] focus:ring-2 focus:ring-[#856BFF]/20 cursor-pointer transition-all"
              >
                <option value="">All Statuses</option>
                {statusOptions.map(st => (
                  <option key={st} value={st}>{st}</option>
                ))}
              </select>
            </div>

            {/* Type Filter */}
            <div className="min-w-[130px]">
              <select
                value={typeFilter}
                onChange={(e) => {
                  setTypeFilter(e.target.value);
                  setPage(1);
                }}
                className="w-full h-[38px] px-3 py-1.5 border border-gray-200 rounded-lg text-xs font-medium text-gray-700 bg-white hover:border-gray-300 focus:outline-none focus:border-[#856BFF] focus:ring-2 focus:ring-[#856BFF]/20 cursor-pointer transition-all"
              >
                <option value="">All Types</option>
                {typeOptions.map(t => (
                  <option key={t} value={t}>{t}</option>
                ))}
              </select>
            </div>

            {/* Reset Filters */}
            {hasActiveFilters && (
              <button
                onClick={handleResetFilters}
                className="h-[38px] px-3 py-1.5 text-xs font-semibold text-[#856BFF] hover:bg-[#856BFF]/10 rounded-lg transition-colors flex items-center gap-1 shrink-0"
                title="Reset all filters"
              >
                <Icon icon="solar:restart-outline" width="16" height="16" />
                Reset
              </button>
            )}
          </div>
        </div>

        {loading ? (
          <div className="flex items-center justify-center gap-2 py-20 text-gray-400">
            <svg className="animate-spin w-5 h-5 text-[#9e88ff]" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
            </svg>
            Loading projects…
          </div>
        ) : !projects.length ? (
          <div className="py-20 text-center">
            <svg className="w-12 h-12 text-gray-200 mx-auto mb-3" fill="none" stroke="currentColor" strokeWidth={1.4} viewBox="0 0 24 24">
              <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z" />
            </svg>
            <p className="text-gray-400 text-sm">No projects found. Create one to get started.</p>
          </div>
        ) : !filteredProjects.length ? (
          <div className="py-16 text-center">
            <Icon icon="material-symbols:search-off" width="48" height="48" className="text-gray-300 mx-auto mb-2" />
            <p className="text-gray-500 font-medium text-sm">No projects match your search criteria</p>
            <p className="text-gray-400 text-xs mt-1">Try adjusting or clearing your search and filter parameters.</p>
            <button
              onClick={handleResetFilters}
              className="mt-3 px-3.5 py-1.5 text-xs font-semibold text-[#856BFF] bg-[#856BFF]/10 hover:bg-[#856BFF]/20 rounded-lg transition-colors inline-flex items-center gap-1"
            >
              <Icon icon="solar:restart-outline" width="14" height="14" />
              Reset Filters
            </button>
          </div>
        ) : (
          <>
            <div className="overflow-auto max-h-[calc(100vh-230px)]">
              <table className="w-full text-sm border-collapse min-w-[900px]">
                <thead className="sticky top-0 z-20 bg-[#EFF4FF]">
                  <tr className="border-b border-gray-200 bg-[#EFF4FF]" style={{ backgroundColor: '#EFF4FF' }}>
                    {COLS.map(c => (
                      <th key={c.label} className={`sticky top-0 z-20 bg-[#EFF4FF] text-left px-4 py-3 text-[11px] font-bold text-[#434654] tracking-wide uppercase whitespace-nowrap shadow-sm ${c.w}`}>
                        {c.label}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {pageRows.map((p, i) => (
                    <tr key={p.id} className="border-b border-gray-50 hover:bg-gray-50/60 transition-colors">

                      {/* Project Code */}
                      <td className="px-4 py-4">
                        <span className="text-xs font-mono text-gray-600 leading-snug block">{p.project_code || '—'}</span>
                      </td>

                      {/* NBD / O2D */}
                      <td className="px-4 py-4">
                        {p.nbd_id ? (
                          <div>
                            <div className="text-xs font-bold text-gray-800">{p.nbd_id}</div>
                            {p.o2d_id && <div className="text-[11px] text-gray-400">{p.o2d_id}</div>}
                          </div>
                        ) : (
                          <span className="text-gray-300">—</span>
                        )}
                      </td>

                      {/* Project Name */}
                      <td className="px-4 py-4">
                        <span className="font-semibold text-gray-800 leading-snug block">{p.project_name || p.name}</span>
                        {p.client_name && (
                          <span className="text-[11px] text-gray-400">{p.client_name}</span>
                        )}
                      </td>

                      {/* Team Lead */}
                      <td className="px-4 py-4 text-gray-600 text-xs">
                        {p.team_lead || '—'}
                      </td>

                      {/* Type */}
                      <td className="px-4 py-4 text-gray-500 text-xs">
                        {p.project_type || '—'}
                      </td>

                      {/* Timeline */}
                      <td className="px-4 py-4">
                        {p.start_date ? (
                          <div className="text-xs text-gray-600 leading-relaxed">
                            <div>{fmtDate(p.start_date)}</div>
                            <div className="text-gray-400">to {p.end_date ? fmtDate(p.end_date) : '—'}</div>
                          </div>
                        ) : <span className="text-gray-300">—</span>}
                      </td>

                      {/* Status */}
                      <td className="px-4 py-4 text-nowrap">
                        <StatusBadge status={p.status} />
                      </td>

                      {/* Effort Hrs / Days */}
                      <td className="px-4 py-4">
                        <div className="text-[#856BFF] font-bold text-sm">
                          {Number(p.total_effort_hours ?? 0).toFixed(2)}
                          <span className="text-[11px] font-semibold ml-0.5"> Hrs</span>
                        </div>
                        <div className="text-gray-400 text-[11px]">
                          {Number(p.total_effort_days ?? 0).toFixed(2)} Days
                        </div>
                      </td>

                      {/* Action */}
                      <td className="px-4 py-4">
                        <div className="flex items-center gap-2">
                          {!isAdmin && (
                            <button
                              onClick={() => navigate('/projects/edit', { state: { project: p } })}
                              className="flex items-center gap-1 text-[#856BFF] hover:text-[#7252ff] text-xs font-semibold transition-colors"
                            >
                              <EditIcon />
                              Edit
                            </button>
                          )}
                          <button
                            onClick={() => navigate('/projects/effort', { state: { projects, initialProjectId: p.id, projectName: p.project_name || p.name, readOnly: isAdmin } })}
                            className="flex items-center gap-1 text-xs font-semibold text-gray-500 hover:text-gray-700 transition-colors"
                          >
                             {isAdmin ? (
        <>
          <Icon 
            icon="lets-icons:view" 
            width="22" 
            height="22" 
            className="text-gray-500"
          />
          View
        </>
      ) : (
        <>
          <Icon 
  icon="boxicons:math-filled" 
  width="22" 
  height="22" 
  className="border-2 border-[#856BFF]  p-0.5"
  style={{ color: '#856BFF' }}
/>
          Effort
        </>
      )}
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* ── Pagination footer ── */}
            <div className="flex items-center justify-between px-4 py-3 border-t border-gray-100 bg-white">
              <p className="text-xs text-gray-400">
                Showing {startEntry} to {endEntry} of {filteredProjects.length} entries
                {hasActiveFilters && ` (filtered from ${projects.length} total)`}
              </p>
              <div className="flex items-center gap-1">
                <button
                  onClick={() => setPage(p => Math.max(1, p - 1))}
                  disabled={page === 1}
                  className="w-8 h-8 flex items-center justify-center rounded-md text-gray-400 hover:bg-gray-100 disabled:opacity-30 transition-colors"
                >
                  <ChevL />
                </button>
                {Array.from({ length: totalPages }, (_, i) => i + 1).map(n => (
                  <button
                    key={n}
                    onClick={() => setPage(n)}
                    className={`w-8 h-8 flex items-center justify-center rounded-md text-sm font-medium transition-colors ${n === page
                      ? 'bg-[#856BFF] text-white shadow-sm'
                      : 'text-gray-500 hover:bg-gray-100'
                      }`}
                  >
                    {n}
                  </button>
                ))}
                <button
                  onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                  disabled={page === totalPages}
                  className="w-8 h-8 flex items-center justify-center rounded-md text-gray-400 hover:bg-gray-100 disabled:opacity-30 transition-colors"
                >
                  <ChevR />
                </button>
              </div>
            </div>
          </>
        )}
      </div>

      {/* ── No modals ── Effort + Create + Edit are now separate pages */}
    </div>
  );
};

// ── Helpers ───────────────────────────────────────────────────────────────────
const fmtDate = (d) => {
  if (!d) return '—';
  const dt = new Date(d);
  return `${String(dt.getDate()).padStart(2, '0')}-${String(dt.getMonth() + 1).padStart(2, '0')}-${dt.getFullYear()}`;
};

// ── Styles ────────────────────────────────────────────────────────────────────
// Page
const P = {
  page: { padding: '24px', width: '100%', boxSizing: 'border-box', fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif' },
  topBar: { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: 28, flexWrap: 'wrap', gap: 12 },
  heading: { margin: 0, color: '#1e272e', fontSize: 28, fontWeight: 800, letterSpacing: '-0.5px', marginBottom: 6 },
  underline: { width: 52, height: 4, background: '#e74c3c', borderRadius: 2 },
  btnGroup: { display: 'flex', gap: 10, alignItems: 'center' },
  createBtn: {
    padding: '9px 20px', background: '#e74c3c', color: '#fff',
    border: 'none', borderRadius: 7, fontSize: 13, fontWeight: 700,
    cursor: 'pointer', whiteSpace: 'nowrap',
    boxShadow: '0 2px 8px rgba(231,76,60,0.3)',
  },
  effortBtn: {
    padding: '9px 20px', background: '#1e272e', color: '#fff',
    border: 'none', borderRadius: 7, fontSize: 13, fontWeight: 700,
    cursor: 'pointer', whiteSpace: 'nowrap',
    boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
  },
  uploadBtn: {
    padding: '9px 20px', background: '#3498db', color: '#fff',
    border: 'none', borderRadius: 7, fontSize: 13, fontWeight: 700,
    cursor: 'pointer', whiteSpace: 'nowrap',
    boxShadow: '0 2px 8px rgba(52,152,219,0.3)',
  },
  editBtn: {
    padding: '5px 12px', background: '#f39c12', color: '#fff',
    border: 'none', borderRadius: 5, fontSize: 12, fontWeight: 700,
    cursor: 'pointer', whiteSpace: 'nowrap',
    boxShadow: '0 1px 4px rgba(243,156,18,0.2)',
  },
  tableWrap: { background: '#fff', borderRadius: 12, boxShadow: '0 2px 10px rgba(0,0,0,0.08)', overflow: 'hidden', border: '1px solid #f0f0f0' },
  table: { width: '100%', minWidth: '1200px', borderCollapse: 'collapse' },
  th: { background: '#1e272e', color: '#fff', padding: '12px 16px', textAlign: 'left', fontSize: 12, fontWeight: 600, textTransform: 'uppercase', letterSpacing: 0.5, whiteSpace: 'nowrap' },
  tr: { borderBottom: '1px solid #f0f0f0' },
  td: { padding: '13px 16px', fontSize: 13, color: '#444', whiteSpace: 'nowrap' },
  msg: { padding: 48, textAlign: 'center', color: '#bbb', fontSize: 15, background: '#fff', borderRadius: 12, boxShadow: '0 2px 8px rgba(0,0,0,0.07)' },
};

// Overlay / Modal shared
const O = {
  overlay: {
    position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.48)',
    backdropFilter: 'blur(3px)', display: 'flex',
    alignItems: 'center', justifyContent: 'center',
    zIndex: 1000, padding: 20,
  },
  modal: {
    background: '#fff', borderRadius: 14,
    boxShadow: '0 10px 50px rgba(0,0,0,0.22)',
    width: '100%', maxWidth: 580,
    maxHeight: '90vh', overflowY: 'auto',
    padding: '26px 30px',
  },
  header: {
    display: 'flex', justifyContent: 'space-between',
    alignItems: 'flex-start', marginBottom: 20,
    paddingBottom: 16, borderBottom: '1px solid #f0f0f0',
  },
  title: { fontSize: 18, fontWeight: 800, color: '#1e272e', marginBottom: 3 },
  sub: { fontSize: 12, color: '#999' },
  closeBtn: {
    background: 'none', border: 'none', fontSize: 17,
    cursor: 'pointer', color: '#bbb', padding: '0 4px', lineHeight: 1,
  },
  formGrid: {
    display: 'grid', gridTemplateColumns: '1fr 1fr',
    gap: '14px 18px', marginBottom: 16,
  },
  label: { display: 'block', fontSize: 12, fontWeight: 600, color: '#555', marginBottom: 5 },
  input: {
    width: '100%', padding: '9px 11px',
    border: '1px solid #ddd', borderRadius: 6,
    fontSize: 13, boxSizing: 'border-box', outline: 'none',
    transition: 'border-color 0.15s',
  },
  error: { color: '#e74c3c', fontSize: 12, margin: '0 0 10px', fontWeight: 600 },
  footer: { display: 'flex', justifyContent: 'flex-end', gap: 10, marginTop: 20, paddingTop: 14, borderTop: '1px solid #f0f0f0' },
  cancelBtn: {
    padding: '8px 20px', background: '#f0f0f0', color: '#555',
    border: 'none', borderRadius: 6, fontSize: 13, fontWeight: 600, cursor: 'pointer',
  },
  submitBtn: {
    padding: '8px 22px', background: '#e74c3c', color: '#fff',
    border: 'none', borderRadius: 6, fontSize: 13, fontWeight: 700, cursor: 'pointer',
  },
  copyBtn: {
    padding: '8px 18px', background: '#1e272e', color: '#fff',
    border: 'none', borderRadius: 6, fontSize: 13, fontWeight: 600, cursor: 'pointer',
  },
  toast: {
    position: 'fixed',
    top: 24,
    right: 24,
    zIndex: 99999,
    color: 'white',
    padding: '12px 22px',
    borderRadius: '10px',
    fontWeight: 700,
    fontSize: '14px',
    boxShadow: '0 6px 24px rgba(0,0,0,0.28)',
    pointerEvents: 'none',
    minWidth: 240,
    maxWidth: 400,
    wordBreak: 'break-word'
  }
};

// Effort table
const E = {
  table: { width: '100%', borderCollapse: 'collapse', fontSize: 13 },
  th: { padding: '9px 10px', background: '#1e272e', color: '#fff', fontWeight: 600, fontSize: 11, textAlign: 'center', whiteSpace: 'nowrap' },
  thCalc: { padding: '9px 10px', background: '#2c3e50', color: '#ccc', fontWeight: 600, fontSize: 11, textAlign: 'center', whiteSpace: 'nowrap' },
  tdRole: { padding: '8px 12px', color: '#1e272e', fontWeight: 700, fontSize: 13, whiteSpace: 'nowrap' },
  td: { padding: '6px 8px', textAlign: 'center' },
  tdCalc: { padding: '8px 10px', textAlign: 'center', color: '#666', background: '#fafafa', fontSize: 12 },
  numInput: {
    width: 70, padding: '5px 7px', border: '1px solid #ddd',
    borderRadius: 5, fontSize: 12, textAlign: 'center',
    boxSizing: 'border-box', outline: 'none',
  },
  readOnlyVal: {
    display: 'inline-block', width: 70, textAlign: 'center',
    fontSize: 12, color: '#555', fontWeight: 600,
  },
};

export default Projects;