// src/pages/projects/ProjectInfoTab.jsx
import React from 'react';
import { ChevronDown } from 'lucide-react';

// ─── Styling constants — mirrors ImportProjectPage.jsx conventions ─────────────
//
//  ReadInput in ImportProjectPage uses:
//    bg-[#F8F9FF] border border-[#DFE1E6] text-[#6B7280]   ← filled / greyed
//    bg-white     border border-[#DFE1E6] text-[#171C20]   ← empty  / editable
//
//  We use inline styles (not dynamic Tailwind arbitrary classes) so that
//  Tailwind's JIT/purge does not strip the colour values at build time.
// ──────────────────────────────────────────────────────────────────────────────

const BORDER      = '#DFE1E6';
const FILLED_BG   = '#F8F9FF';
const FILLED_TEXT = '#6B7280';
const EMPTY_BG    = '#ffffff';
const EMPTY_TEXT  = '#6B7280'; // placeholder text stays muted in either state

// ─── Field-level sub-components ───────────────────────────────────────────────

/**
 * FieldLabel
 * Mirrors the `FieldLabel` component defined in ImportProjectPage.jsx.
 */
const FieldLabel = ({ children }) => (
  <div className="flex flex-row items-center gap-2 mb-1">
    <span className="font-roboto font-medium text-xs leading-4 tracking-[0.66px] text-[#6B778C]">
      {children}
    </span>
  </div>
);

/**
 * ReadInput — single-line read-only text field.
 * Applies the greyed style (`FILLED_BG` / `FILLED_TEXT`) when `hasData` is true,
 * mirroring the `ReadInput` pattern in ImportProjectPage.jsx.
 */
const ReadInput = ({ value, hasData }) => (
  <div
    className="box-border flex flex-row items-center px-3 py-[7px] h-10 border rounded w-full"
    style={{
      backgroundColor: hasData ? FILLED_BG : EMPTY_BG,
      borderColor: BORDER,
    }}
  >
    <span
      className="font-roboto font-normal text-sm overflow-hidden whitespace-nowrap text-ellipsis"
      style={{ color: hasData ? FILLED_TEXT : EMPTY_TEXT }}
    >
      {value}
    </span>
  </div>
);

/**
 * ReadSelect — read-only field that looks like a dropdown (shows ChevronDown).
 * Used for Project Type, Customer Name, and Project Status.
 */
const ReadSelect = ({ value, hasData }) => (
  <div
    className="relative box-border flex flex-row items-center px-3 py-[7px] h-10 border rounded w-full"
    style={{
      backgroundColor: hasData ? FILLED_BG : EMPTY_BG,
      borderColor: BORDER,
    }}
  >
    <span
      className="font-roboto font-normal text-sm overflow-hidden whitespace-nowrap text-ellipsis flex-1 pr-5"
      style={{ color: hasData ? FILLED_TEXT : EMPTY_TEXT }}
    >
      {value}
    </span>
    <ChevronDown
      className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none"
      size={16}
      color="#6B7280"
    />
  </div>
);

/**
 * ReadTextarea — multi-line read-only field for Description.
 */
const ReadTextarea = ({ value, hasData, rows = 4 }) => (
  <div
    className="box-border w-full border rounded p-3"
    style={{
      backgroundColor: hasData ? FILLED_BG : EMPTY_BG,
      borderColor: BORDER,
      minHeight: `${rows * 1.6}rem`,
    }}
  >
    <p
      className="font-roboto font-normal text-[13px] leading-relaxed m-0 whitespace-pre-wrap"
      style={{ color: hasData ? FILLED_TEXT : EMPTY_TEXT }}
    >
      {value}
    </p>
  </div>
);

// ─── Main component ────────────────────────────────────────────────────────────

const ProjectInfoTab = ({ project }) => {
  /** Format any date string to DD/MM/YYYY (en-GB locale). */
  const fmtDate = (d) => {
    if (!d) return '';
    return new Date(d).toLocaleDateString('en-GB');
  };

  // ── Raw values: empty string = "no data received from API" ────────────────
  const pmsId       = project?.pms_id        || project?.pmsId       || '';
  const projectName = project?.project_name  || project?.projectName || project?.name || '';
  const projectType = project?.project_type  || project?.projectType || '';
  const customer    = project?.client_name   || project?.customer    || '';
  const presaleId   = project?.presale_id    || project?.presaleId   || '';
  const nbdId       = project?.nbd_id        || project?.nbdId       || '';
  const o2dId       = project?.o2d_id        || project?.o2dId       || '';
  const projectCode = project?.project_code  || project?.projectCode || '';
  const subCategory = project?.sub_category  || project?.subCategory || '';
  const startDt     = project?.start_date    || project?.startDate;
  const endDt       = project?.end_date      || project?.endDate;
  const startDate   = startDt                ? fmtDate(startDt)      : '';
  const endDate     = endDt                  ? fmtDate(endDt)        : '';
  const status      = project?.status        || '';
  const description = project?.description   || '';

  // ── Display values: fallback placeholder when API returns nothing ──────────
  const disp = {
    pmsId:       pmsId       || 'PMS1234',
    projectName: projectName || 'FMS',
    projectType: projectType || 'One Time Project',
    customer:    customer    || 'Ahana IT',
    presaleId:   presaleId   || 'Presale ID',
    nbdId:       nbdId       || '1234',
    o2dId:       o2dId       || '1234',
    projectCode: projectCode || '1234',
    subCategory: subCategory || 'FMS',
    startDate:   startDate   || '09/08/2026',
    endDate:     endDate     || '08/09/2026',
    status:      status      || 'Completed',
    description: description || 'Implementation of the new Fleet Management System (FMS) for Enterprise IT Operations. This project involves migrating legacy data, setting up new server infrastructure, and training core personnel on the updated compliance tracking modules. High-level objectives include a 20% reduction in reporting latency and full integration with the existing HR datastore.',
  };

  return (
    <div className="p-6 text-sm">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-x-4 gap-y-4">

        {/* Row 1 — PMS ID (narrow, col-span-1) */}
        <div className="col-span-1">
          <FieldLabel>PMS ID</FieldLabel>
          <ReadInput value={disp.pmsId} hasData={!!disp.pmsId} />
        </div>
        <div className="col-span-3 hidden md:block" />

        {/* Row 2 — Project Name · Project Type · Customer Name */}
        <div className="col-span-1 md:col-span-2">
          <FieldLabel>Project Name*</FieldLabel>
          <ReadInput value={disp.projectName} hasData={!!disp.projectName} />
        </div>
        <div className="col-span-1">
          <FieldLabel>Project Type</FieldLabel>
          <ReadSelect value={disp.projectType} hasData={!!disp.projectType} />
        </div>
        <div className="col-span-1">
          <FieldLabel>Customer Name</FieldLabel>
          <ReadSelect value={disp.customer} hasData={!!disp.customer} />
        </div>

        {/* Row 3 — Presale ID · NBD ID · O2D ID · Project Code */}
        <div className="col-span-1">
          <FieldLabel>Presale ID</FieldLabel>
          <ReadInput value={disp.presaleId} hasData={!!disp.presaleId} />
        </div>
        <div className="col-span-1">
          <FieldLabel>NBD ID</FieldLabel>
          <ReadInput value={disp.nbdId} hasData={!!disp.nbdId} />
        </div>
        <div className="col-span-1">
          <FieldLabel>O2D ID</FieldLabel>
          <ReadInput value={disp.o2dId} hasData={!!disp.o2dId} />
        </div>
        <div className="col-span-1">
          <FieldLabel>Project Code</FieldLabel>
          <ReadInput value={disp.projectCode} hasData={!!disp.projectCode} />
        </div>

        {/* Row 4 — Sub Category · Start Date · End Date · Project Status */}
        <div className="col-span-1">
          <FieldLabel>Sub Category</FieldLabel>
          <ReadInput value={disp.subCategory} hasData={!!disp.subCategory} />
        </div>
        <div className="col-span-1">
          <FieldLabel>Start Date</FieldLabel>
          <ReadInput value={disp.startDate} hasData={!!disp.startDate} />
        </div>
        <div className="col-span-1">
          <FieldLabel>End Date</FieldLabel>
          <ReadInput value={disp.endDate} hasData={!!disp.endDate} />
        </div>
        <div className="col-span-1">
          <FieldLabel>Project Status</FieldLabel>
          <ReadSelect value={disp.status} hasData={!!disp.status} />
        </div>

        {/* Row 5 — Description (full width) */}
        <div className="col-span-1 md:col-span-4">
          <FieldLabel>Description</FieldLabel>
          <ReadTextarea value={disp.description} hasData={!!disp.description} rows={4} />
        </div>

      </div>
    </div>
  );
};

export default ProjectInfoTab;

