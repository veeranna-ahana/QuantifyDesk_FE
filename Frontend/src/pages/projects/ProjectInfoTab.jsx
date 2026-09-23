// src/pages/projects/ProjectInfoTab.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronDown, ArrowRight } from 'lucide-react';

// ─── Styling constants ────────────────────────────────────────────────────────
const BORDER = '#DFE1E6';
const FILLED_BG = '#F8F9FF';
const FILLED_TEXT = '#6B7280';
const EDIT_BG = '#FFFFFF';
const EDIT_TEXT = '#172B4D';

const PROJECT_TYPE_OPTIONS = [
  { value: 'One Time Project', label: 'One Time Project' },
  { value: 'Managed Service', label: 'Managed Service' },
  { value: 'Staff Augmentation', label: 'Staff Augmentation' },
  { value: 'Retainer', label: 'Retainer' },
  { value: 'Milestone-Based', label: 'Milestone-Based' },
];

const CUSTOMER_OPTIONS = [
  { value: 'Ahana IT', label: 'Ahana IT' },
  { value: 'Enterprise IT Operations', label: 'Enterprise IT Operations' },
  { value: 'Global Logistics Corp', label: 'Global Logistics Corp' },
];

const STATUS_OPTIONS = [
  { value: 'Completed', label: 'Completed' },
  { value: 'In Progress', label: 'In Progress' },
  { value: 'On Hold', label: 'On Hold' },
  { value: 'Not Started', label: 'Not Started' },
];

// ─── Field-level sub-components ───────────────────────────────────────────────

const FieldLabel = ({ children }) => (
  <label className="block h-4 text-[12px] font-bold tracking-[0.66px] text-[#6B778C] leading-4">
    {children}
  </label>
);

const ReadInput = ({ value, className = '' }) => (
  <div
    className={`box-border flex items-center px-3 h-11 border rounded w-full overflow-hidden ${className}`}
    style={{
      backgroundColor: FILLED_BG,
      borderColor: BORDER,
    }}
    title={value}
  >
    <span
      className="font-sans font-normal text-[14px] leading-4 truncate w-full"
      style={{ color: FILLED_TEXT }}
    >
      {value}
    </span>
  </div>
);

const ReadSelect = ({ value }) => (
  <div
    className="box-border flex items-center justify-between px-3 h-11 border rounded w-full"
    style={{
      backgroundColor: FILLED_BG,
      borderColor: BORDER,
    }}
  >
    <span
      className="font-sans font-normal text-[14px] leading-4 truncate flex-1 pr-2"
      style={{ color: FILLED_TEXT }}
    >
      {value}
    </span>
    <ChevronDown
      className="pointer-events-none text-[#94A3B8] shrink-0"
      size={15}
    />
  </div>
);

const ReadTextarea = ({ value }) => (
  <div
    className="box-border w-full min-h-[95px] border rounded p-3"
    style={{
      backgroundColor: FILLED_BG,
      borderColor: BORDER,
      minHeight: '95px',
    }}
  >
    <p
      className="font-sans font-normal text-[14px] leading-[23px] m-0 text-[#6B7280]"
    >
      {value}
    </p>
  </div>
);

const EditableInput = ({ value, onChange, placeholder, id }) => (
  <input
    id={id}
    type="text"
    value={value}
    onChange={onChange}
    placeholder={placeholder}
    className="box-border flex items-center px-3 h-11 border rounded w-full font-sans font-normal text-[14px] leading-4 outline-none focus:border-[#856BFF] focus:bg-white transition-colors"
    style={{
      backgroundColor: EDIT_BG,
      borderColor: BORDER,
      color: EDIT_TEXT,
    }}
  />
);

const EditableSelect = ({ value, onChange, options, id }) => (
  <div className="relative w-full">
    <select
      id={id}
      value={value}
      onChange={onChange}
      className="box-border appearance-none w-full h-11 px-3 pr-8 border rounded font-sans font-normal text-[14px] leading-4 cursor-pointer outline-none focus:border-[#856BFF] focus:bg-white transition-colors"
      style={{
        backgroundColor: EDIT_BG,
        borderColor: BORDER,
        color: EDIT_TEXT,
      }}
    >
      {options.map((opt) => (
        <option key={opt.value} value={opt.value}>
          {opt.label}
        </option>
      ))}
    </select>
    <ChevronDown
      className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-gray-500"
      size={15}
    />
  </div>
);

const EditableTextarea = ({
  value,
  onChange,
  placeholder,
  id,
}) => (
  <textarea
    id={id}
    rows={3}
    value={value}
    onChange={onChange}
    placeholder={placeholder}
    className="box-border w-full min-h-[95px] p-3 border rounded font-sans font-normal text-[14px] leading-[23px] outline-none focus:border-[#856BFF] focus:bg-white transition-colors resize-none"
    style={{
      backgroundColor: EDIT_BG,
      borderColor: BORDER,
      color: EDIT_TEXT,
      minHeight: '95px',
    }}
  />
);

// ─── Main component ───────────────────────────────────────────────────────────

const ProjectInfoTab = ({
  project,
  isEditing = false,
  onSave,
  onCancel,
  onNext,
  onFormChange,
}) => {
  const navigate = useNavigate();

  // ── Raw values from project data ──────────────────────────────────────────
  const pmsId = project?.pmsDisplayId || project?.pms_id || project?.pmsId || '';
  const projectName =
    project?.project_name ||
    project?.projectName ||
    project?.name ||
    '';

  const projectType =
    project?.project_type ||
    project?.projectType ||
    '';

  const customer =
    project?.client_name ||
    project?.customer ||
    '';

  const presaleId =
    project?.presale_id ||
    project?.presaleId ||
    '';

  const nbdId =
    project?.nbd_id ||
    project?.nbdId ||
    '';

  const o2dId =
    project?.o2d_id ||
    project?.o2dId ||
    '';

  const projectCode =
    project?.project_code ||
    project?.projectCode ||
    '';

  const subCategory =
    project?.sub_category ||
    project?.subCategory ||
    '';

  const status = project?.status || '';
  const description = project?.description || '';

  // ── Display fallback values matching Figma Images 3 & 4 ───────────────────
  const disp = {
    pmsId: project?.pmsDisplayId || 'PMS1234',
    projectName: projectName || 'FMS',
    projectType: projectType || 'One Time Project',
    customer: customer || 'Ahana IT',
    presaleId: presaleId || 'Presale ID',
    nbdId: nbdId || '1234',
    o2dId: o2dId || '1234',
    projectCode: projectCode || '1234',
    subCategory: subCategory || 'FMS',
    startDate: project?.formStartDate || '09/08/2026',
    endDate: project?.formEndDate || '08/09/2026',
    status: status || 'Completed',
    description:
      description ||
      'Implementation of the new Fleet Management System (FMS) for Enterprise IT Operations. This project involves migrating legacy data, setting up new server infrastructure, and training core personnel on the updated compliance tracking modules. High-level objectives include a 20% reduction in reporting latency and full integration with the existing HR datastore.',
  };

  // ── Form state ────────────────────────────────────────────────────────────
  const [formData, setFormData] = useState({
    projectType: disp.projectType,
    nbdId: disp.nbdId,
    o2dId: disp.o2dId,
    projectCode: disp.projectCode,
    subCategory: disp.subCategory,
    description: disp.description,
  });

  useEffect(() => {
    setFormData({
      projectType: disp.projectType,
      nbdId: disp.nbdId,
      o2dId: disp.o2dId,
      projectCode: disp.projectCode,
      subCategory: disp.subCategory,
      description: disp.description,
    });
  }, [project, isEditing]);

  useEffect(() => {
    onFormChange?.(formData);
  }, [formData, onFormChange]);

  const handleChange = (field, val) => {
    setFormData((prev) => ({
      ...prev,
      [field]: val,
    }));
  };

  const projectTypeOptions = React.useMemo(() => {
    const list = [...PROJECT_TYPE_OPTIONS];
    if (
      formData.projectType &&
      !list.some(
        (o) =>
          o.value.toLowerCase() ===
          formData.projectType.toLowerCase()
      )
    ) {
      list.unshift({
        value: formData.projectType,
        label: formData.projectType,
      });
    }
    return list;
  }, [formData.projectType]);

  const handleCancelClick = () => {
    if (isEditing) {
      setFormData({
        projectType: disp.projectType,
        nbdId: disp.nbdId,
        o2dId: disp.o2dId,
        projectCode: disp.projectCode,
        subCategory: disp.subCategory,
        description: disp.description,
      });
      onCancel?.();
    } else {
      navigate('/projects');
    }
  };

  const handleNextClick = () => {
    onNext?.(formData);
  };

  return (
    <div className="w-full text-sm">
      <div className="flex flex-col gap-3">

        {/* ── Row 1: PMS ID ── */}
        <div className="grid grid-cols-12 gap-1.5">
          <div className="col-span-12 sm:col-span-3">
            <FieldLabel>PMS ID</FieldLabel>
            <ReadInput value={disp.pmsId} className="h-9" />
          </div>
        </div>

        {/* ── Row 2: Project Name*, Project Type, Customer Name ── */}
        <div className="grid grid-cols-12 gap-1.5">
          <div className="col-span-12 sm:col-span-4">
            <FieldLabel>Project Name*</FieldLabel>
            <ReadInput value={disp.projectName} />
          </div>

          <div className="col-span-12 sm:col-span-4">
            <FieldLabel>Project Type</FieldLabel>
            {isEditing ? (
              <EditableSelect
                id="project-type-select"
                value={formData.projectType}
                onChange={(e) =>
                  handleChange('projectType', e.target.value)
                }
                options={projectTypeOptions}
              />
            ) : (
              <ReadSelect
                value={formData.projectType || disp.projectType}
              />
            )}
          </div>

          <div className="col-span-12 sm:col-span-4">
            <FieldLabel>Customer Name</FieldLabel>
            <ReadSelect value={disp.customer} />
          </div>
        </div>

        {/* ── Row 3: Presale ID, NBD ID, O2D ID, Project Code ── */}
        <div className="grid grid-cols-12 gap-1.5">
          <div className="col-span-12 sm:col-span-3">
            <FieldLabel>Presale ID</FieldLabel>
            <ReadInput value={disp.presaleId} />
          </div>

          <div className="col-span-12 sm:col-span-3">
            <FieldLabel>NBD ID</FieldLabel>
            {isEditing ? (
              <EditableInput
                id="nbd-id-input"
                value={formData.nbdId}
                onChange={(e) =>
                  handleChange('nbdId', e.target.value)
                }
                placeholder="NBD ID"
              />
            ) : (
              <ReadInput value={formData.nbdId || disp.nbdId} />
            )}
          </div>

          <div className="col-span-12 sm:col-span-3">
            <FieldLabel>O2D ID</FieldLabel>
            {isEditing ? (
              <EditableInput
                id="o2d-id-input"
                value={formData.o2dId}
                onChange={(e) =>
                  handleChange('o2dId', e.target.value)
                }
                placeholder="O2D ID"
              />
            ) : (
              <ReadInput value={formData.o2dId || disp.o2dId} />
            )}
          </div>

          <div className="col-span-12 sm:col-span-3">
            <FieldLabel>Project Code</FieldLabel>
            {isEditing ? (
              <EditableInput
                id="project-code-input"
                value={formData.projectCode}
                onChange={(e) =>
                  handleChange('projectCode', e.target.value)
                }
                placeholder="Project Code"
              />
            ) : (
              <ReadInput
                value={formData.projectCode || disp.projectCode}
              />
            )}
          </div>
        </div>

        {/* ── Row 4: Sub Category, Start Date, End Date, Project Status ── */}
        <div className="grid grid-cols-12 gap-1.5">
          <div className="col-span-12 sm:col-span-3">
            <FieldLabel>Sub Category</FieldLabel>
            {isEditing ? (
              <EditableInput
                id="sub-category-input"
                value={formData.subCategory}
                onChange={(e) =>
                  handleChange('subCategory', e.target.value)
                }
                placeholder="Sub Category"
              />
            ) : (
              <ReadInput
                value={formData.subCategory || disp.subCategory}
              />
            )}
          </div>

          <div className="col-span-12 sm:col-span-3">
            <FieldLabel>Start Date</FieldLabel>
            <ReadInput value={disp.startDate} />
          </div>

          <div className="col-span-12 sm:col-span-3">
            <FieldLabel>End Date</FieldLabel>
            <ReadInput value={disp.endDate} />
          </div>

          <div className="col-span-12 sm:col-span-3">
            <FieldLabel>Project Status</FieldLabel>
            <ReadSelect value={disp.status} />
          </div>
        </div>

        {/* ── Row 5: Description ── */}
        <div className="grid grid-cols-12 gap-1.5">
          <div className="col-span-12">
            <FieldLabel>Description</FieldLabel>
            {isEditing ? (
              <EditableTextarea
                id="description-textarea"
                value={formData.description}
                onChange={(e) =>
                  handleChange('description', e.target.value)
                }
                placeholder="Enter project description..."
              />
            ) : (
              <ReadTextarea
                value={formData.description || disp.description}
              />
            )}
          </div>
        </div>

      </div>

      {/* ── Footer Actions (Only shown in Edit mode as in Figma Image 4) ── */}
      {isEditing && (
        <div className="box-border flex min-h-[61px] items-center justify-end gap-3 border-t border-[#DFE1E6] pt-2 mt-1">
          <button
            type="button"
            id="project-info-cancel-btn"
            onClick={handleCancelClick}
            className="text-[13px] font-medium text-[#64748B] hover:text-[#1E293B] bg-transparent border-none cursor-pointer px-3 py-1.5 transition-colors"
          >
            Cancel
          </button>

          <button
            type="button"
            id="project-info-next-btn"
            onClick={handleNextClick}
            className="flex items-center gap-1.5 px-5 py-2 bg-[#856BFF] hover:bg-[#7354fd] text-white text-[13px] font-semibold rounded-lg shadow-sm transition-colors cursor-pointer border-none"
          >
            <span>Next:</span>
            <ArrowRight size={14} />
          </button>
        </div>
      )}
    </div>
  );
};

export default ProjectInfoTab;