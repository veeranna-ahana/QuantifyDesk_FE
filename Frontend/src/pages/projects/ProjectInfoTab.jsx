// src/pages/projects/ProjectInfoTab.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronDown, ArrowRight } from 'lucide-react';

// ─── Styling constants ────────────────────────────────────────────────────────
const BORDER = '#DFE1E6';
const FILLED_BG = '#F8F9FF';
const FILLED_TEXT = '#6B7280';
const EDIT_BG = '#FFFFFF';
const EDIT_TEXT = '#171C20';

const PROJECT_TYPE_OPTIONS = [
  { value: 'One Time Project', label: 'One Time Project' },
  { value: 'Managed Service', label: 'Managed Service' },
  { value: 'Staff Augmentation', label: 'Staff Augmentation' },
  { value: 'Retainer', label: 'Retainer' },
  { value: 'Milestone-Based', label: 'Milestone-Based' },
];

// ─── Field-level sub-components ───────────────────────────────────────────────

const FieldLabel = ({ children }) => (
  <div className="flex flex-row items-center gap-2 mb-1">
    <span className="font-roboto font-medium text-xs leading-4 tracking-[0.66px] text-[#6B778C]">
      {children}
    </span>
  </div>
);

const ReadInput = ({ value, className = '' }) => (
  <div
    className={`box-border flex flex-row items-center px-3 py-[7px] min-h-[40px] h-auto border rounded w-full overflow-hidden ${className}`}
    style={{
      backgroundColor: FILLED_BG,
      borderColor: BORDER,
    }}
    title={value}
  >
    <span
      className="font-roboto font-normal text-sm leading-normal break-words whitespace-normal w-full"
      style={{ color: FILLED_TEXT }}
    >
      {value}
    </span>
  </div>
);

const ReadSelect = ({ value }) => (
  <div
    className="relative box-border flex flex-row items-center px-3 py-[7px] h-10 border rounded w-full"
    style={{
      backgroundColor: FILLED_BG,
      borderColor: BORDER,
    }}
  >
    <span
      className="font-roboto font-normal text-sm overflow-hidden whitespace-nowrap text-ellipsis flex-1 pr-5"
      style={{ color: FILLED_TEXT }}
    >
      {value}
    </span>

    <ChevronDown
      className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400"
      size={16}
    />
  </div>
);

const ReadTextarea = ({ value, rows = 4 }) => (
  <div
    className="box-border w-full border rounded p-3"
    style={{
      backgroundColor: FILLED_BG,
      borderColor: BORDER,
      minHeight: `${rows * 1.6}rem`,
    }}
  >
    <p
      className="font-roboto font-normal text-[13px] leading-relaxed m-0 whitespace-pre-wrap"
      style={{ color: FILLED_TEXT }}
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
    className="box-border flex flex-row items-center px-3 py-[7px] h-10 border rounded w-full font-roboto font-normal text-sm outline-none focus:border-[#856BFF] transition-colors"
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
      className="box-border appearance-none w-full h-10 px-3 pr-10 py-[7px] border rounded font-roboto font-normal text-sm cursor-pointer outline-none focus:border-[#856BFF] transition-colors"
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
      size={16}
    />
  </div>
);

const EditableTextarea = ({
  value,
  onChange,
  placeholder,
  rows = 4,
  id,
}) => (
  <textarea
    id={id}
    rows={rows}
    value={value}
    onChange={onChange}
    placeholder={placeholder}
    className="box-border w-full p-3 border rounded font-roboto font-normal text-[13px] leading-relaxed outline-none focus:border-[#856BFF] transition-colors resize-y"
    style={{
      backgroundColor: EDIT_BG,
      borderColor: BORDER,
      color: EDIT_TEXT,
      minHeight: `${rows * 1.6}rem`,
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

  /** Format any date string to DD/MM/YYYY */
  const fmtDate = (d) => {
    if (!d) return '';
    return new Date(d).toLocaleDateString('en-GB');
  };

  // ── Raw values from project data ──────────────────────────────────────────
  const pmsId = project?.pms_id || project?.pmsId || '';
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

  const startDt =
    project?.start_date ||
    project?.startDate;

  const endDt =
    project?.end_date ||
    project?.endDate;

  const startDate = startDt ? fmtDate(startDt) : '';
  const endDate = endDt ? fmtDate(endDt) : '';

  const status = project?.status || '';
  const description = project?.description || '';

  // ── Display fallback values ───────────────────────────────────────────────
  const disp = {
    pmsId: pmsId || 'PMS1234',
    projectName: projectName || 'FMS',
    projectType: projectType || 'One Time Project',
    customer: customer || 'Ahana IT',
    presaleId: presaleId || 'Presale ID',
    nbdId: nbdId || '1234',
    o2dId: o2dId || '1234',
    projectCode: projectCode || '1234',
    subCategory: subCategory || 'FMS',
    startDate: startDate || '09/08/2026',
    endDate: endDate || '08/09/2026',
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
    <div className="p-2 text-sm">
      <div className="grid grid-cols-1 md:grid-cols-12 gap-x-4 gap-y-1">

        {/* PMS ID */}
        <div className="col-span-3">
          <FieldLabel>PMS ID</FieldLabel>
          <ReadInput value={disp.pmsId} />
        </div>

        <div className="col-span-9 hidden md:block" />

        {/* Project Name */}
        <div className="col-span-12 md:col-span-4">
          <FieldLabel>Project Name*</FieldLabel>
          <ReadInput value={disp.projectName} />
        </div>

        {/* Project Type */}
        <div className="col-span-12 md:col-span-4">
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

        {/* Customer Name */}
        <div className="col-span-12 md:col-span-4">
          <FieldLabel>Customer Name</FieldLabel>
          <ReadSelect value={disp.customer} />
        </div>

        {/* Presale ID */}
        <div className="col-span-12 md:col-span-3">
          <FieldLabel>Presale ID</FieldLabel>
          <ReadInput value={disp.presaleId} />
        </div>

        {/* NBD ID */}
        <div className="col-span-12 md:col-span-3">
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

        {/* O2D ID */}
        <div className="col-span-12 md:col-span-3">
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

        {/* Project Code */}
        <div className="col-span-12 md:col-span-3">
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

        {/* Sub Category */}
        <div className="col-span-12 md:col-span-3">
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

        {/* Start Date */}
        <div className="col-span-12 md:col-span-3">
          <FieldLabel>Start Date</FieldLabel>
          <ReadInput value={disp.startDate} />
        </div>

        {/* End Date */}
        <div className="col-span-12 md:col-span-3">
          <FieldLabel>End Date</FieldLabel>
          <ReadInput value={disp.endDate} />
        </div>

        {/* Project Status */}
        <div className="col-span-12 md:col-span-3">
          <FieldLabel>Project Status</FieldLabel>
          <ReadSelect value={disp.status} />
        </div>

        {/* Description */}
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
              rows={2}
            />
          ) : (
            <ReadTextarea
              value={formData.description || disp.description}
              rows={2}
            />
          )}
        </div>
      </div>

      {/* ── Footer Actions ── */}
      <div className="flex items-center justify-end gap-2 mt-3 pt-2">
        {isEditing ? (
          <>
            <button
              type="button"
              id="project-info-cancel-btn"
              onClick={handleCancelClick}
              className="px-4 py-2 text-sm font-medium text-gray-500 hover:text-gray-800 transition-colors cursor-pointer bg-transparent border-none"
            >
              Cancel
            </button>

            <button
              type="button"
              id="project-info-next-btn"
              onClick={handleNextClick}
              className="flex items-center gap-1.5 px-5 py-2.5 bg-[#856BFF] hover:bg-[#7354fd] text-white text-sm font-medium rounded-lg shadow-sm transition-colors cursor-pointer border-none"
            >
              <span>Next</span>
              <ArrowRight size={16} />
            </button>
          </>
        ) : null}
      </div>
    </div>
  );
};

export default ProjectInfoTab;