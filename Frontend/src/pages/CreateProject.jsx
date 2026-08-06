import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
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

const inputCls = 'w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm text-gray-800 placeholder-gray-300 bg-white focus:outline-none focus:ring-2 focus:ring-violet-400 focus:border-transparent transition-shadow';
const inputClsLight = 'w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm text-gray-800 placeholder-gray-300 bg-white/70 focus:outline-none focus:ring-2 focus:ring-violet-400 focus:border-transparent transition-shadow';

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
export default function CreateProject() {
  const navigate = useNavigate();

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
    projectType: '',
    status: 'New',
  });
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState({});

  // ── Customer dropdown state ────────────────────────────────────────────────
  const [customers, setCustomers] = useState([]);
  const [customersLoading, setCustomersLoading] = useState(false);
  const [customersError, setCustomersError] = useState('');

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
    setErrors(prev => ({ ...prev, [field]: '' }));
  };

  const validate = () => {
    const e = {};
    if (!form.projectName.trim()) e.projectName = 'Project Name is required.';
    if (!form.customer.trim()) e.customer = 'Customer is required.';
    if (!form.nbdId.trim()) e.nbdId = 'NBD ID is required.';
    if (!form.projectCode.trim()) e.projectCode = 'Project Code is required.';
    return e;
  };

  const handleSubmit = async () => {
  const e = validate();
  if (Object.keys(e).length) { setErrors(e); return; }

  setSaving(true);
  try {
    await axios.post(
      `${BASE_URL}/api/projects`,
      {
        name: form.projectName.trim(),
        clientName: form.customer.trim(),
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
    toast.success('Project created successfully!');
    navigate('/projects');
  } catch (err) {
    console.log('Error response:', err.response); // Debug log
    
    // Handle duplicate entry errors (409 Conflict)
    if (err.response?.status === 409) {
      const { message, errors: errorMessages, details } = err.response.data;
      
      // Show all error messages from the backend
      if (errorMessages && errorMessages.length > 0) {
        // Show each error as a separate toast
        errorMessages.forEach(errorMsg => {
          toast.error(errorMsg);
        });
      } else {
        toast.error(message || 'Duplicate entry found');
      }
      
      // Set field-specific errors for highlighting
      const fieldErrors = {};
      if (details && details.length > 0) {
        details.forEach(detail => {
          if (detail.project_name === form.projectName.trim()) {
            fieldErrors.projectName = 'This project name is already in use';
          }
          if (detail.nbd_id === form.nbdId.trim()) {
            fieldErrors.nbdId = 'This NBD ID is already in use';
          }
          if (detail.project_code === form.projectCode.trim()) {
            fieldErrors.projectCode = 'This project code is already in use';
          }
        });
      }
      setErrors(fieldErrors);
    } else {
      // Handle other errors
      toast.error(err?.response?.data?.message || 'Failed to create project.');
    }
  } finally {
    setSaving(false);
  }
};

  return (
    <div className="min-h-screen bg-[#f0f0f8] p-6 font-sans">

      {/* ── Page header ── */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Create New Project</h1>
        <p className="text-sm text-gray-400 mt-0.5">Fill in the details below to register a new project.</p>
      </div>

      {/* ── Card ── */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">

        {/* Violet top accent bar */}
        <div className="h-1.5 bg-gradient-to-r from-[#856BFF] to-[#a28efa]" />

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
                  onChange={e => {
                    set('projectName', e.target.value);
                    if (errors.projectName) setErrors(prev => ({ ...prev, projectName: '' }));
                  }}
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
                  <Label required>NBD ID</Label>
                  <input
                    type="text"
                    value={form.nbdId}
                    onChange={e => {
                      set('nbdId', e.target.value);
                      if (errors.nbdId) setErrors(prev => ({ ...prev, nbdId: '' }));
                    }}
                    placeholder="NBD-0000"
                    className={`${inputClsLight} ${errors.nbdId ? 'border-red-400 ring-2 ring-red-200' : ''}`}
                  />
                  {errors.nbdId && (
                    <p className="text-red-500 text-xs mt-1">{errors.nbdId}</p>
                  )}
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
                  <Label required>Project Code</Label>
                  <input
                    type="text"
                    value={form.projectCode}
                    onChange={e => {
                      set('projectCode', e.target.value);
                      if (errors.projectCode) setErrors(prev => ({ ...prev, projectCode: '' }));
                    }}
                    placeholder="PRJ-8821"
                    className={`${inputClsLight} ${errors.projectCode ? 'border-red-400 ring-2 ring-red-200' : ''}`}
                  />
                  {errors.projectCode && (
                    <p className="text-red-500 text-xs mt-1">{errors.projectCode}</p>
                  )}
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
                  <Label required>Customer</Label>
                  <input
                    type="text"
                    value={form.customer}
                    onChange={e => set('customer', e.target.value)}
                    placeholder="e.g. Acme Corp"
                    className={`${inputClsLight} ${errors.customer ? 'border-red-400 ring-2 ring-red-200' : ''}`}
                  />
                  {errors.customer && (
                    <p className="text-red-500 text-xs mt-1">{errors.customer}</p>
                  )}
                </div>
                {/* 
                <SearchableSelect
                  value={form.customer}
                  onChange={val => set('customer', val)}
                  placeholder={customersLoading ? 'Loading customers…' : 'Select Customer'}
                  loading={customersLoading}
                  error={!!errors.customer}
                  options={customers.map((c, idx) => {
                    const name = c.customer_name || c.name || c.company_name || c.label || String(c);
                    return { value: name, label: name, key: c.id ?? c.customer_id ?? idx };
                  })}
                />
                */}
                <div>
                  <Label>Team Lead</Label>
                  <input
                    type="text"
                    value={form.teamLead}
                    onChange={e => set('teamLead', e.target.value)}
                    placeholder="e.g. John Smith"
                    className={inputClsLight}
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
                  onChange={e => set('endDate', e.target.value)}
                  className={inputCls}
                />
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
                    <option value="On Hold">Hold</option>
                    <option value="Completed">Completed</option>
                    
                  </select>
                  <ChevDownIcon />
                </div>
              </div>
            </div>
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
              className="flex items-center gap-2 px-6 py-2.5 bg-[#856BFF] hover:bg-[#7d61f8] active:bg-[#6f52f5] text-white text-sm font-semibold rounded-lg shadow-sm transition-colors disabled:opacity-60"
            >
              {saving ? 'Creating…' : (
                <>
                  Create Project
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
