// src/pages/projects/EffortEstimatePage.jsx
// Step 3 — Effort Estimate
// Used inside the ImportProjectPage multi-step shell.

import React, { useState, useCallback, useMemo } from 'react';
import './EffortEstimatePage.css';

// ── Constants ─────────────────────────────────────────────────────────────────

const HRS_PER_DAY = 8;

/** Roles shown in the Figma / screenshot (order matters) */
const DEFINED_ROLES = [
  'BA',
  'Solution Architect',
  'UI/UX',
  'FE Dev',
  'BE Dev',
  'Tester',
  'Deployment',
  'Warranty & Support',
  'Project Manager',
];

/** Mock members pool for the "Add Member" dropdown */
const ALL_MEMBERS = [
  { id: 'rahul', name: 'Rahul Sharma', initials: 'RS' },
  { id: 'priya', name: 'Priya Nair', initials: 'PN' },
  { id: 'amit', name: 'Amit Patel', initials: 'AP' },
  { id: 'sneha', name: 'Sneha Rao', initials: 'SR' },
  { id: 'vikas', name: 'Vikas Gupta', initials: 'VG' },
  { id: 'pooja', name: 'Pooja Hegde', initials: 'PH' },
  { id: 'suresh', name: 'Suresh Raina', initials: 'SR' },
  { id: 'karthik', name: 'Karthik N', initials: 'KN' },
  { id: 'mohan', name: 'Mohan Raj', initials: 'MR' },
  { id: 'rohan', name: 'Rohan Verma', initials: 'RV' },
  { id: 'meera', name: 'Meera Iyer', initials: 'MI' },
];

/** Seed data matching the Figma screenshot */
const SEED_ROWS = [
  { id: 'r1', role: 'BA',     name: 'Navith',   effortDays: 0, bufferDays: 0 },
  { id: 'r2', role: 'BA',     name: 'Kusum',    effortDays: 0, bufferDays: 0 },
  { id: 'r3', role: 'FE Dev', name: 'Soumya',   effortDays: 0, bufferDays: 0 },
  { id: 'r4', role: 'FE Dev', name: 'Ranjitha', effortDays: 0, bufferDays: 0 },
  { id: 'r5', role: 'BE Dev', name: 'Ankit',    effortDays: 0, bufferDays: 0 },
  { id: 'r6', role: 'UI/UX',  name: 'Devanshi', effortDays: 0, bufferDays: 0 },
];

// ── SVG Icons ─────────────────────────────────────────────────────────────────

const BuildingIcon = () => (
  <svg width="12" height="12" viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M1 11V4L6 1L11 4V11" stroke="#545f72" strokeWidth="1.1" strokeLinecap="round" strokeLinejoin="round"/>
    <rect x="4" y="7" width="4" height="4" rx="0.5" stroke="#545f72" strokeWidth="1.1"/>
  </svg>
);

const NextArrow = () => (
  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <line x1="5" y1="12" x2="19" y2="12"/>
    <polyline points="12 5 19 12 12 19"/>
  </svg>
);

const PlusIcon = () => (
  <svg width="10" height="10" viewBox="0 0 10 10" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M5 1V9M1 5H9" stroke="#002045" strokeWidth="1.4" strokeLinecap="round"/>
  </svg>
);

const ChevronDownSmall = () => (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M4 6L8 10L12 6" stroke="#64748b" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

const CancelIcon = () => (
  <svg width="17" height="17" viewBox="0 0 17 17" fill="none" xmlns="http://www.w3.org/2000/svg">
    <circle cx="8.5" cy="8.5" r="8" fill="#fff" stroke="#ba1a1a" strokeWidth="1"/>
    <path d="M5.5 5.5L11.5 11.5M11.5 5.5L5.5 11.5" stroke="#ba1a1a" strokeWidth="1.4" strokeLinecap="round"/>
  </svg>
);

const ConfirmIcon = () => (
  <svg width="17" height="17" viewBox="0 0 17 17" fill="none" xmlns="http://www.w3.org/2000/svg">
    <circle cx="8.5" cy="8.5" r="8" fill="#fff" stroke="#002045" strokeWidth="1"/>
    <path d="M5 8.5L7.5 11L12 6" stroke="#002045" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

// ── Helpers ───────────────────────────────────────────────────────────────────

const toHrs  = (days) => Math.round(Number(days || 0) * HRS_PER_DAY);
const fmtHrs = (hrs)  => `${hrs} hrs`;
const uid    = ()     => Math.random().toString(36).slice(2, 9);

// ── Pending (new) member row ──────────────────────────────────────────────────

function PendingRow({ role, members, onConfirm, onCancel }) {
  const defaultMember = members.find(member => member.name === 'Meera Iyer') || members[0] || null;
  const [selectedMember, setSelectedMember] = useState(defaultMember ? defaultMember.name : '');
  const [isOpen, setIsOpen] = useState(true);
  const [effortDays, setEffortDays] = useState('');
  const [bufferDays, setBufferDays] = useState('');

  const effortHrs = toHrs(effortDays);
  const bufferHrs = toHrs(bufferDays);

  const handleConfirm = () => {
    if (!selectedMember) return;
    onConfirm({
      id: uid(),
      role,
      name: selectedMember,
      effortDays: Number(effortDays) || 0,
      bufferDays: Number(bufferDays) || 0,
    });
  };

  return (
    <div className="ee-member-row ee-member-row--pending">
      {/* Member select */}
      <div className="ee-cell ee-cell--name">
        <div className="ee-add-member-picker">
          <button
            type="button"
            className="ee-member-trigger"
            onClick={() => setIsOpen(open => !open)}
          >
            <span className="ee-member-trigger-content">
              {selectedMember ? (
                <>
                  <span className="ee-member-avatar-small">{(selectedMember.split(' ').map(p => p[0]).slice(0, 2).join('') || 'U').toUpperCase()}</span>
                  <span>{selectedMember}</span>
                </>
              ) : (
                <span className="ee-member-placeholder">Select member</span>
              )}
            </span>
            <span className="ee-add-member-chevron"><ChevronDownSmall /></span>
          </button>

          {isOpen && (
            <div className="ee-member-menu" role="listbox" aria-label="Select team member">
              {members.map(member => {
                const isActive = member.name === selectedMember;
                return (
                  <button
                    key={member.id}
                    type="button"
                    className={`ee-member-item ${isActive ? 'ee-member-item--active' : ''}`}
                    onClick={() => {
                      setSelectedMember(member.name);
                      setIsOpen(false);
                    }}
                  >
                    <span className="ee-member-avatar">{member.initials}</span>
                    <span className="ee-member-label">{member.name}</span>
                  </button>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Effort Days input */}
      <div className="ee-cell ee-cell--center">
        <input
          type="number"
          min="0"
          className="ee-days-input"
          value={effortDays}
          onChange={e => setEffortDays(e.target.value)}
          placeholder="0"
        />
      </div>

      {/* Effort Hrs */}
      <div className="ee-cell ee-cell--center">
        <span className="ee-hrs-text">
          {effortHrs === 0 ? '000 hrs' : fmtHrs(effortHrs)}
        </span>
      </div>

      {/* Buffer Days input */}
      <div className="ee-cell ee-cell--center">
        <input
          type="number"
          min="0"
          className="ee-days-input"
          value={bufferDays}
          onChange={e => setBufferDays(e.target.value)}
          placeholder="0"
        />
      </div>

      {/* Buffer Hrs */}
      <div className="ee-cell ee-cell--center">
        <span className="ee-hrs-text">
          {bufferHrs === 0 ? '00 hrs' : fmtHrs(bufferHrs)}
        </span>
      </div>

      {/* Action icons */}
      <div className="ee-cell ee-cell--center ee-cell--actions">
        <button className="ee-icon-btn" title="Cancel"  onClick={onCancel}><CancelIcon /></button>
        <button className="ee-icon-btn" title="Confirm" onClick={handleConfirm}><ConfirmIcon /></button>
      </div>
    </div>
  );
}

// ── Saved member row ──────────────────────────────────────────────────────────

function MemberRow({ row, onChange }) {
  const effortHrs = toHrs(row.effortDays);
  const bufferHrs = toHrs(row.bufferDays);
  const totalHrs  = effortHrs + bufferHrs;

  return (
    <div className="ee-member-row">
      {/* Name */}
      <div className="ee-cell ee-cell--name">
        <span className="ee-member-name">{row.name}</span>
      </div>

      {/* Effort Days input */}
      <div className="ee-cell ee-cell--center">
        <input
          type="number"
          min="0"
          className="ee-days-input"
          value={row.effortDays}
          onChange={e => onChange(row.id, 'effortDays', e.target.value)}
        />
      </div>

      {/* Effort Hrs */}
      <div className="ee-cell ee-cell--center">
        <span className="ee-hrs-text">{fmtHrs(effortHrs)}</span>
      </div>

      {/* Buffer Days input */}
      <div className="ee-cell ee-cell--center">
        <input
          type="number"
          min="0"
          className="ee-days-input"
          value={row.bufferDays}
          onChange={e => onChange(row.id, 'bufferDays', e.target.value)}
        />
      </div>

      {/* Buffer Hrs */}
      <div className="ee-cell ee-cell--center">
        <span className="ee-hrs-text">{fmtHrs(bufferHrs)}</span>
      </div>

      {/* Total Hrs */}
      <div className="ee-cell ee-cell--center">
        <span className="ee-hrs-text">{fmtHrs(totalHrs)}</span>
      </div>
    </div>
  );
}

// ── Role section (header + member rows) ──────────────────────────────────────

function RoleSection({ role, rows, allMembers, onRowChange, onAddConfirm }) {
  const [showPending, setShowPending] = useState(false);

  const usedNames = rows.map(r => r.name);
  const available = allMembers.filter(m => !usedNames.includes(m.name));

  return (
    <>
      {/* Role header row */}
      <div className="ee-role-header">
        <span className="ee-role-name">{role}</span>
        <button
          className="ee-add-member-btn"
          onClick={() => setShowPending(true)}
          disabled={showPending || available.length === 0}
          title={available.length === 0 ? 'All members already added' : '+ Add Member'}
        >
          <PlusIcon />
          <span>Add Member</span>
        </button>
      </div>

      {/* Saved rows */}
      {rows.map(row => (
        <MemberRow key={row.id} row={row} onChange={onRowChange} />
      ))}

      {/* Pending new-member row */}
      {showPending && (
        <PendingRow
          role={role}
          members={available}
          onConfirm={(newRow) => { onAddConfirm(newRow); setShowPending(false); }}
          onCancel={() => setShowPending(false)}
        />
      )}
    </>
  );
}

// ── Main EffortEstimatePage ───────────────────────────────────────────────────

export default function EffortEstimatePage({ onCancel, onNext }) {
  const [rows, setRows] = useState(SEED_ROWS);

  const handleRowChange = useCallback((id, field, value) => {
    setRows(prev =>
      prev.map(r => r.id === id ? { ...r, [field]: Number(value) || 0 } : r)
    );
  }, []);

  const handleAddConfirm = useCallback((newRow) => {
    setRows(prev => [...prev, newRow]);
  }, []);

  const totals = useMemo(() => {
    let effortDays = 0, bufferDays = 0;
    rows.forEach(r => {
      effortDays += Number(r.effortDays || 0);
      bufferDays += Number(r.bufferDays || 0);
    });
    const effortHrs = toHrs(effortDays);
    const bufferHrs = toHrs(bufferDays);
    return { effortHrs, bufferHrs, totalHrs: effortHrs + bufferHrs };
  }, [rows]);

  const rolesInUse = useMemo(() => {
    const seen = new Set(rows.map(r => r.role));
    return DEFINED_ROLES.filter(r => seen.has(r));
  }, [rows]);

  return (
    <div className="ee-page">

      {/* ── Card ── */}
      <div className="ee-card">

        {/* Card header */}
        <div className="ee-card-header">
          <h2 className="ee-card-title">Effort Estimate</h2>
          <div className="ee-context-bar">
            <BuildingIcon />
            <span className="ee-context-fms">FMS</span>
            <span className="ee-context-divider" />
            <span className="ee-context-pms">PMS ID: PMS-9021</span>
          </div>
        </div>

        {/* Table */}
        <div className="ee-table">

          {/* Table header */}
          <div className="ee-thead">
            <div className="ee-th ee-th--name">Role</div>
            <div className="ee-th ee-th--center">Effort(Days)</div>
            <div className="ee-th ee-th--center">In Hrs</div>
            <div className="ee-th ee-th--center">Buffer(Days)</div>
            <div className="ee-th ee-th--center">In Hrs</div>
            <div className="ee-th ee-th--center">Total Hrs</div>
          </div>

          {/* Body */}
          <div className="ee-tbody">
            {rolesInUse.map(role => (
              <RoleSection
                key={role}
                role={role}
                rows={rows.filter(r => r.role === role)}
                allMembers={ALL_MEMBERS}
                onRowChange={handleRowChange}
                onAddConfirm={handleAddConfirm}
              />
            ))}

            {/* TOTAL row */}
            <div className="ee-total-row">
              <div className="ee-total-label">TOTAL</div>
              <div className="ee-total-cell">{fmtHrs(totals.effortHrs)}</div>
              <div className="ee-total-cell ee-total-cell--muted">—</div>
              <div className="ee-total-cell">{fmtHrs(totals.bufferHrs)}</div>
              <div className="ee-total-cell ee-total-cell--muted">—</div>
              <div className="ee-total-cell">{fmtHrs(totals.totalHrs)}</div>
            </div>
          </div>

        </div>
      </div>

      {/* ── Footer ── */}
      <div className="ee-footer">
        <div style={{ width: 77, opacity: 0 }} aria-hidden />
        <div className="ee-footer-right">
          <button id="effort-cancel-btn" className="ee-btn-cancel" onClick={onCancel}>Cancel</button>
          <button id="effort-next-btn"   className="ee-btn-next"   onClick={onNext}>
            Next: <NextArrow />
          </button>
        </div>
      </div>

    </div>
  );
}
