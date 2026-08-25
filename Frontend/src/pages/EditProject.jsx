import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useSelector } from 'react-redux';
import axios from 'axios';
import toast from 'react-hot-toast';
import SearchableSelect from '../component/SearchableSelect';

const BASE_URL = import.meta.env.VITE_API_BASE_URL;
const CUSTOMER_API_URL = `${BASE_URL}/api/projects/customers`;
const getHeaders = () => ({
  Authorization: `Bearer ${localStorage.getItem('token') || ''}`,
});

// ── Icon helpers ──────────────────────────────────────────────────────────────
const InfoIcon = () => (
  <svg className="w-5 h-5 text-[#856BFF] flex-shrink-0" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
    <circle cx="12" cy="12" r="10" /><line x1="12" y1="16" x2="12" y2="12" /><line x1="12" y1="8" x2="12.01" y2="8" />
  </svg>
);
const FingerprintIcon = () => (
  <svg className="w-5 h-5 text-[#856BFF] flex-shrink-0" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
    <path d="M12 11c0 3.517-1.009 6.799-2.753 9.571m-3.44-2.04l.054-.09A13.916 13.916 0 0 0 8 11a4 4 0 1 1 8 0c0 1.017-.07 2.019-.203 3m-2.118 6.844A21.88 21.88 0 0 0 15.171 17m3.839 1.132c.645-2.266.99-4.659.99-7.132A8 8 0 0 0 8 4.07M3 15.364c.64-1.319 1-2.8 1-4.364 0-1.457.39-2.823 1.07-4" />
  </svg>
);
const CalendarIcon = () => (
  <svg className="w-5 h-5 text-[#856BFF] flex-shrink-0" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
    <rect x="3" y="4" width="18" height="18" rx="2" ry="2" /><line x1="16" y1="2" x2="16" y2="6" /><line x1="8" y1="2" x2="8" y2="6" /><line x1="3" y1="10" x2="21" y2="10" />
  </svg>
);
const ArrowRightIcon = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
    <path d="M5 12h14M12 5l7 7-7 7" />
  </svg>
);
const ChevDownIcon = () => (
  <svg className="w-4 h-4 text-gray-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
    <path d="M6 9l6 6 6-6" />
  </svg>
);

// ── Reusable field components ─────────────────────────────────────────────────
const Label = ({ children, required }) => (
  <label className="block text-xs font-medium text-gray-600 mb-1.5">
    {children}
    {required && <span className="text-red-500 ml-0.5">*</span>}
  </label>
);

const inputCls = 'w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm text-gray-800 placeholder-gray-300 bg-white focus:outline-none focus:ring-2 focus:ring-[#856BFF] focus:border-transparent transition-shadow';
const inputClsLight = 'w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm text-gray-800 placeholder-gray-300 bg-white/70 focus:outline-none focus:ring-2 focus:ring-[#856BFF] focus:border-transparent transition-shadow';

// ── Section wrapper ───────────────────────────────────────────────────────────
const Section = ({ icon, title, bg, children }) => (
  <div className={`rounded-xl p-6 ${bg || 'bg-white'}`}>
    <div className="flex items-center gap-2 mb-5">
      {icon}
      <h2 className="text-lg font-bold text-gray-900">{title}</h2>
    </div>
    {children}
  </div>
);

// ── Main Page ─────────────────────────────────────────────────────────────────
export default function EditProject() {
  const navigate = useNavigate();
  const location = useLocation();

  // Project data is passed via navigate state
  const project = location.state?.project;

  // If navigated directly without state, redirect back
  if (!project) {
    return (
      <div className="min-h-screen bg-[#f0f0f8] p-6 font-sans flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-400 text-sm mb-4">No project data found.</p>
          <button
            onClick={() => navigate('/projects')}
            className="px-5 py-2 bg-[#856BFF] text-white text-sm font-semibold rounded-lg"
          >
            Back to Projects
          </button>
        </div>
      </div>
    );
  }

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
    status: project.status || 'New',
    createCR: project.create_cr || '',
  });
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState({});

  // ── Customer dropdown state ────────────────────────────────────────────────
  const [customers, setCustomers] = useState([]);
  const [customersLoading, setCustomersLoading] = useState(false);
  const [customersError, setCustomersError] = useState('');

  // ── Employee dropdown state ────────────────────────────────────────────────
  const serviceDeliveryEmployees = useSelector(state => state.auth?.serviceDeliveryEmployees);
  const [employees, setEmployees] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem('serviceDeliveryEmployees') || '[]');
    } catch {
      return [];
    }
  });
  const [employeesLoading, setEmployeesLoading] = useState(false);

  useEffect(() => {
    if (serviceDeliveryEmployees && serviceDeliveryEmployees.length > 0) {
      setEmployees(serviceDeliveryEmployees);
      return;
    }
    const fetchEmployees = async () => {
      setEmployeesLoading(true);
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
      } finally {
        setEmployeesLoading(false);
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

  useEffect(() => {
    const fetchCustomers = async () => {
      setCustomersLoading(true);
      setCustomersError('');
      try {
        const res = await axios.get(CUSTOMER_API_URL, { headers: getHeaders() });
        const list = Array.isArray(res.data)
          ? res.data
          : Array.isArray(res.data?.data)
            ? res.data.data
            : [];
        setCustomers(list);
      } catch (err) {
        console.error('Failed to fetch customers:', err);
        setCustomersError('Could not load customers.');
      } finally {
        setCustomersLoading(false);
      }
    };
    fetchCustomers();
  }, []);

  const set = (field, val) => {
    setForm(prev => ({ ...prev, [field]: val }));
    setErrors(prev => ({
      ...prev,
      [field]: '',
      ...(field === 'startDate' || field === 'endDate' ? { endDate: '' } : {})
    }));
  };

  const validate = () => {
    const e = {};
    if (!form.projectName.trim()) e.projectName = 'Project Name is required.';
    // if (!form.customer.trim()) e.customer = 'Customer is required.';
    if (form.startDate && form.endDate && form.endDate < form.startDate) {
      e.endDate = 'End Date cannot be earlier than Start Date.';
    }
    return e;
  };

  const handleSubmit = async () => {
    const e = validate();
    if (Object.keys(e).length) { setErrors(e); return; }

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
          createCr: form.status === 'New CR' ? form.createCR.trim() : null,
        },
        { headers: getHeaders() }
      );
      toast.success('Project updated successfully!');
      navigate('/projects');
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Failed to update project.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#f0f0f8] p-6 font-sans">

      {/* ── Page header ── */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Edit Project</h1>
        <p className="text-sm text-gray-400 mt-0.5">Fill in the details below to register a new project.</p>
      </div>

      {/* ── Card ── */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">

        {/* Violet top accent bar */}
        <div className="h-1.5 bg-gradient-to-r from-[#856BFF] to-[#af9efc]" />

        <div className="p-6 space-y-6">

          {/* ── Section 1: Identity & Scope ── */}
          <Section icon={<InfoIcon />} title="Identity & Scope">
            <div className="space-y-4">
              {/* Project Name */}
              <div>
                <Label required>Project Name</Label>
                <input
                  type="text"
                  value={form.projectName}
                  onChange={e => set('projectName', e.target.value)}
                  placeholder="e.g., Q3 Infrastructure Optimization"
                  className={`${inputCls} ${errors.projectName ? 'border-red-400 ring-2 ring-red-200' : ''}`}
                />
                {errors.projectName && (
                  <p className="text-red-500 text-xs mt-1">{errors.projectName}</p>
                )}
              </div>

              {/* Description */}
              <div>
                <Label>Description</Label>
                <textarea
                  rows={4}
                  value={form.description}
                  onChange={e => set('description', e.target.value)}
                  placeholder="Briefly describe the project goals and delivery metrics..."
                  className={`${inputCls} resize-none`}
                />
              </div>
            </div>
          </Section>

          {/* ── Section 2: Identifiers & Classification ── */}
          <Section icon={<FingerprintIcon />} title="Identifiers & Classification" bg="bg-[#eef0fb]">
            <div className="space-y-4">
              {/* Row 1: NBD ID, O2D ID, Project Code */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <Label>NBD ID</Label>
                  <input
                    type="text"
                    value={form.nbdId}
                    onChange={e => set('nbdId', e.target.value)}
                    placeholder="NBD-0000"
                    className={inputClsLight}
                  />
                </div>
                <div>
                  <Label>O2D ID</Label>
                  <input
                    type="text"
                    value={form.o2dId}
                    onChange={e => set('o2dId', e.target.value)}
                    placeholder="O2D-XXXX"
                    className={inputClsLight}
                  />
                </div>
                <div>
                  <Label>Project Code</Label>
                  <input
                    type="text"
                    value={form.projectCode}
                    onChange={e => set('projectCode', e.target.value)}
                    placeholder="PRJ-8821"
                    className={inputClsLight}
                  />
                </div>
              </div>

              {/* Row 2: Sub Category, Customer, Team Lead */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <Label>Sub Category</Label>
                  <input
                    type="text"
                    value={form.subCategory}
                    onChange={e => set('subCategory', e.target.value)}
                    placeholder="Network Engineering"
                    className={inputClsLight}
                  />
                </div>
                <div>
                  <Label>Customer</Label>
                  {/* <input
                    type="text"
                    value={form.customer}
                    onChange={e => set('customer', e.target.value)}
                    placeholder="e.g. Acme Corp"
                    className={`${inputClsLight} ${errors.customer ? 'border-red-400 ring-2 ring-red-200' : ''}`}
                  /> */}
                  {errors.customer && (
                    <p className="text-red-500 text-xs mt-1">{errors.customer}</p>
                  )}
                
                
                <SearchableSelect
                  value={form.customer}
                  onChange={val => set('customer', val)}
                  placeholder={customersLoading ? 'Loading customers…' : 'Select Customer'}
                  loading={customersLoading}
                  error={!!errors.customer}
                  options={[
                    ...(form.customer && !customers.find(c =>
                      (c.customer_name || c.name || c.company_name || c.label) === form.customer
                    ) ? [{ value: form.customer, label: form.customer }] : []),
                    ...customers.map((c, idx) => {
                      const name = c.customer_name || c.name || c.company_name || c.label || String(c);
                      return { value: name, label: name };
                    }),
                  ]}
                />
               </div>
                <div>
                  <Label>Team Lead</Label>
                  <SearchableSelect
                    value={form.teamLead}
                    onChange={val => set('teamLead', val)}
                    placeholder="Select Team Lead…"
                    options={employeeOptions}
                    loading={employeesLoading}
                  />
                </div>
              </div>
            </div>
          </Section>

          {/* ── Section 3: Timeline & Execution ── */}
          <Section icon={<CalendarIcon />} title="Timeline & Execution">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {/* Start Date */}
              <div>
                <Label>Start Date</Label>
                <input
                  type="date"
                  value={form.startDate}
                  max={form.endDate || undefined}
                  onChange={e => set('startDate', e.target.value)}
                  className={inputCls}
                />
              </div>

              {/* End Date */}
              <div>
                <Label>End Date</Label>
                <input
                  type="date"
                  value={form.endDate}
                  min={form.startDate || undefined}
                  onChange={e => set('endDate', e.target.value)}
                  className={`${inputCls} ${errors.endDate ? 'border-red-400 ring-2 ring-red-200' : ''}`}
                />
                {errors.endDate && (
                  <p className="text-red-500 text-xs mt-1">{errors.endDate}</p>
                )}
              </div>

              {/* Project Type */}
              <div>
                <Label>Project Type</Label>
                <div className="relative">
                  <select
                    value={form.projectType}
                    onChange={e => set('projectType', e.target.value)}
                    className={`${inputCls} appearance-none pr-9 cursor-pointer`}
                  >
                    <option value="">Select Type</option>
                    <option value="one time project - otp">One Time Project - OTP</option>
                    <option value="managed service">Managed Service</option>
                    <option value="Staff Augmentation">Staff Augmentation</option>
                    {/* <option value="Internal">Internal</option> */}
                  </select>
                  <ChevDownIcon />
                </div>
              </div>

              {/* Project Status */}
              <div>
                <Label>Project Status</Label>
                <div className="relative">
                  <select
                    value={form.status}
                    onChange={e => set('status', e.target.value)}
                    className={`${inputCls} appearance-none pr-9 cursor-pointer`}
                  >
                    <option value="New">New</option>
                    <option value="Active">Active</option>
                    <option value="On Hold"> Hold</option>
                    <option value="Completed">Completed</option>
                    
                  </select>
                  <ChevDownIcon />
                </div>
              </div>
            </div>

            {/* Create CR — shown only when status is New CR */}
            {form.status === 'New CR' && (
              <div className="mt-4">
                <Label>Create CR</Label>
                <input
                  type="text"
                  value={form.createCR}
                  onChange={e => set('createCR', e.target.value)}
                  placeholder="Created new CR"
                  className={inputCls}
                />
              </div>
            )}
          </Section>

          {/* ── Footer actions ── */}
          <div className="flex items-center justify-end gap-3 pt-2 border-t border-gray-100">
            <button
              onClick={() => navigate('/projects')}
              className="px-6 py-2.5 border border-gray-200 text-gray-600 text-sm font-semibold rounded-lg hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleSubmit}
              disabled={saving}
              className="flex items-center gap-2 px-6 py-2.5 bg-[#856BFF] hover:bg-[#856BFF] active:bg-[#856BFF] text-white text-sm font-semibold rounded-lg shadow-sm transition-colors disabled:opacity-60"
            >
              {saving ? 'Saving…' : (
                <>
                  Update Project
                  <ArrowRightIcon />
                </>
              )}
            </button>
          </div>

        </div>
      </div>
    </div>
  );
}
