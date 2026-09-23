import React, { useState } from 'react';
import { Rocket } from 'lucide-react';
import './DocumentChecklistPage.css';

// ── Document list (Figma order) ───────────────────────────────────────────────

const DEFAULT_DOCS = [
  { id: 'd1',  name: 'BRD or CR',                icon: 'file-text' },
  { id: 'd2',  name: 'Proposal Document',         icon: 'file-text' },
  { id: 'd3',  name: 'Effort Estimate',            icon: 'file-check' },
  { id: 'd4',  name: 'Solution architecture',      icon: 'lock' },
  { id: 'd5',  name: 'DB design document',         icon: 'file-alt' },
  { id: 'd6',  name: 'Swagger API document',       icon: 'code' },
  { id: 'd7',  name: 'UI/UX',                      icon: 'framer' },
  { id: 'd8',  name: 'Test plan',                  icon: 'clipboard' },
  { id: 'd9',  name: 'Testcase document',          icon: 'file-alt' },
  { id: 'd10', name: 'QA signoff',                 icon: 'shield' },
  { id: 'd11', name: 'UAT signoff',                icon: 'shield' },
  { id: 'd12', name: 'Technical Design Document',  icon: 'code' },
  { id: 'd13', name: 'Release Notes',              icon: 'tag' },
  { id: 'd14', name: 'Risk registry',              icon: 'alert' },
  { id: 'd15', name: 'User manual',                icon: 'book' },
  { id: 'd16', name: 'GIT Repository Link',        icon: 'git' },
];

// ── SVG icon set ──────────────────────────────────────────────────────────────

const PURPLE = '#856bff';

const DocIcons = {
  'file-text': () => (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
      <rect x="2.67" y="1.33" width="10.67" height="13.33" rx="1.5" stroke={PURPLE} strokeWidth="1.33"/>
      <path d="M5.33 5.33h5.33M5.33 8h5.33M5.33 10.67h3.33" stroke={PURPLE} strokeWidth="1.1" strokeLinecap="round"/>
    </svg>
  ),
  'file-check': () => (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
      <rect x="2.67" y="1.33" width="10.67" height="13.33" rx="1.5" stroke={PURPLE} strokeWidth="1.33"/>
      <path d="M5.33 8.5L7 10.33L10.67 6.67" stroke={PURPLE} strokeWidth="1.33" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  ),
  'file-alt': () => (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
      <rect x="2" y="1.33" width="8.67" height="13.33" rx="1.5" stroke={PURPLE} strokeWidth="1.33"/>
      <path d="M11 1.33l3 3" stroke={PURPLE} strokeWidth="1.33" strokeLinecap="round"/>
      <path d="M4.67 5.33h4M4.67 8h4M4.67 10.67h2.67" stroke={PURPLE} strokeWidth="1" strokeLinecap="round"/>
    </svg>
  ),
  'lock': () => (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
      <rect x="3.33" y="7.33" width="9.33" height="7.33" rx="1.5" stroke={PURPLE} strokeWidth="1.33"/>
      <path d="M5.33 7.33V5.33a2.67 2.67 0 1 1 5.33 0v2" stroke={PURPLE} strokeWidth="1.33" strokeLinecap="round"/>
    </svg>
  ),
  'code': () => (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
      <path d="M5.33 4.67L1.33 8l4 3.33" stroke={PURPLE} strokeWidth="1.33" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M10.67 4.67L14.67 8l-4 3.33" stroke={PURPLE} strokeWidth="1.33" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  ),
  'framer': () => (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
      <path d="M2.67 1.33H13.33L8 7.33H2.67V1.33Z" stroke={PURPLE} strokeWidth="1.33" strokeLinejoin="round"/>
      <path d="M2.67 7.33H8L13.33 13.33H8V7.33Z" stroke={PURPLE} strokeWidth="1.33" strokeLinejoin="round"/>
      <path d="M2.67 13.33L8 13.33" stroke={PURPLE} strokeWidth="1.33" strokeLinecap="round"/>
    </svg>
  ),
  'clipboard': () => (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
      <rect x="3.33" y="3.33" width="9.33" height="11.33" rx="1.5" stroke={PURPLE} strokeWidth="1.33"/>
      <path d="M6 3.33V2A2 2 0 0 1 10 2v1.33" stroke={PURPLE} strokeWidth="1.33" strokeLinecap="round"/>
      <path d="M5.67 7.33h4.67M5.67 10h3.33" stroke={PURPLE} strokeWidth="1" strokeLinecap="round"/>
    </svg>
  ),
  'shield': () => (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
      <path d="M8 1.33L2.67 3.33V8c0 3 2.67 5.33 5.33 6 2.67-.67 5.33-3 5.33-6V3.33L8 1.33Z" stroke={PURPLE} strokeWidth="1.33" strokeLinejoin="round"/>
    </svg>
  ),
  'tag': () => (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
      <path d="M8.67 1.33L14 6.67 8.67 12A1.5 1.5 0 0 1 6.6 12L1.33 6.67V2A0.67 0.67 0 0 1 2 1.33h5.33A1.5 1.5 0 0 1 8.67 1.33Z" stroke={PURPLE} strokeWidth="1.33" strokeLinejoin="round"/>
      <circle cx="4.67" cy="4.67" r="0.8" fill={PURPLE}/>
    </svg>
  ),
  'alert': () => (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
      <path d="M8 2.67L14.67 13.33H1.33L8 2.67Z" stroke={PURPLE} strokeWidth="1.33" strokeLinejoin="round"/>
      <path d="M8 6.67v2.67" stroke={PURPLE} strokeWidth="1.33" strokeLinecap="round"/>
      <circle cx="8" cy="11.33" r="0.5" fill={PURPLE}/>
    </svg>
  ),
  'book': () => (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
      <path d="M2.67 2.67C2.67 2 3.33 1.33 4 1.33h8c.67 0 1.33.67 1.33 1.34v10.66c0 .67-.66 1.34-1.33 1.34H4c-.67 0-1.33-.67-1.33-1.34V2.67Z" stroke={PURPLE} strokeWidth="1.33"/>
      <path d="M2.67 12H12" stroke={PURPLE} strokeWidth="1.33" strokeLinecap="round"/>
      <path d="M5.33 5.33h5.33M5.33 8h4" stroke={PURPLE} strokeWidth="1" strokeLinecap="round"/>
    </svg>
  ),
  'git': () => (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
      <circle cx="4" cy="4" r="1.5" stroke={PURPLE} strokeWidth="1.33"/>
      <circle cx="12" cy="4" r="1.5" stroke={PURPLE} strokeWidth="1.33"/>
      <circle cx="4" cy="12" r="1.5" stroke={PURPLE} strokeWidth="1.33"/>
      <path d="M4 5.5V10.5M4 5.5C4 8 12 7 12 5.5" stroke={PURPLE} strokeWidth="1.33" strokeLinecap="round"/>
    </svg>
  ),
};

// ── Building icon (context bar) ───────────────────────────────────────────────

const BuildingIcon = () => (
  <svg width="12" height="11" viewBox="0 0 12 11" fill="none">
    <path d="M1 10V3.5L6 1L11 3.5V10" stroke="#545f72" strokeWidth="1.1" strokeLinecap="round" strokeLinejoin="round"/>
    <rect x="4" y="6" width="4" height="4" rx="0.5" stroke="#545f72" strokeWidth="1.1"/>
  </svg>
);

// ── Link icon ─────────────────────────────────────────────────────────────────

const LinkIcon = () => (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
    <path d="M6.67 8.67A3.33 3.33 0 0 0 11.33 9l2-2a3.33 3.33 0 0 0-4.71-4.71l-1.15 1.14" stroke={PURPLE} strokeWidth="1.33" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M9.33 7.33A3.33 3.33 0 0 0 4.67 7l-2 2a3.33 3.33 0 0 0 4.71 4.71l1.14-1.14" stroke={PURPLE} strokeWidth="1.33" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

// ── Plus icon ─────────────────────────────────────────────────────────────────

const PlusIcon = () => (
  <svg width="9" height="9" viewBox="0 0 9 9" fill="none">
    <path d="M4.5 1v7M1 4.5h7" stroke="#ffffff" strokeWidth="1.4" strokeLinecap="round"/>
  </svg>
);

// ── Rocket icon (Create Project) ─────────────────────────────────────────────

const RocketIcon = () => (
  <Rocket size={16} strokeWidth={2} color="#ffffff" />
);

// ── Close icon ────────────────────────────────────────────────────────────────

const CloseIcon = () => (
  <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
    <path d="M1 1L13 13M13 1L1 13" stroke="#484554" strokeWidth="1.6" strokeLinecap="round"/>
  </svg>
);

const ModalLinkIcon = () => (
  <svg width="20" height="10" viewBox="0 0 20 10" fill="none">
    <path d="M7 5H13M5 1H3a4 4 0 0 0 0 8h2M15 1h2a4 4 0 0 1 0 8h-2" stroke="#484554" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

// ── Status pill ───────────────────────────────────────────────────────────────

const STATUS_CONFIG = {
  Pending:  { bg: '#f1f5f9', dot: '#94a3b8', text: '#475569' },
  Uploaded: { bg: '#ecfdf5', dot: '#10b981', text: '#047857' },
};

function StatusPill({ status }) {
  const cfg = STATUS_CONFIG[status] ?? STATUS_CONFIG.Pending;
  return (
    <span className="dc-status-pill" style={{ background: cfg.bg }}>
      <span className="dc-status-dot" style={{ background: cfg.dot }} />
      <span className="dc-status-text" style={{ color: cfg.text }}>{status}</span>
    </span>
  );
}

// ── Add Document / Link Modal ─────────────────────────────────────────────────

function AddDocumentModal({ docName, isNewDoc = false, onSave, onClose }) {
  const [name, setName] = useState(docName || '');
  const [url, setUrl]   = useState('');

  const handleSave = (e) => {
    e.preventDefault();
    if (!url.trim()) return;
    onSave({
      name: isNewDoc ? (name.trim() || 'Code review completed') : docName,
      url: url.trim(),
    });
  };

  return (
    <div className="dc-modal-overlay" onClick={onClose}>
      <div className="dc-modal" onClick={(e) => e.stopPropagation()} role="dialog" aria-modal="true" aria-labelledby="modal-title">

        {/* ── Modal Header ── */}
        <div className="dc-modal-header">
          <h2 className="dc-modal-title" id="modal-title">Add Document SharePoint Link</h2>
          <button className="dc-modal-close-btn" onClick={onClose} id="modal-close-btn" aria-label="Close modal">
            <CloseIcon />
          </button>
        </div>

        {/* ── Modal Form Body ── */}
        <form onSubmit={handleSave} style={{ width: '100%' }}>
          <div className="dc-modal-body">

            {/* Document Name Field */}
            <div className="dc-modal-field">
              <label className="dc-modal-field-label" htmlFor="doc-name-input">Document Name</label>
              <input
                id="doc-name-input"
                className="dc-modal-doc-input"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Code review completed"
                disabled={!isNewDoc}
              />
            </div>

            {/* SharePoint URL Field */}
            <div className="dc-modal-field">
              <label className="dc-modal-field-label" htmlFor="sp-url-input">SharePoint URL</label>
              <div className="dc-modal-url-wrap">
                <span className="dc-modal-url-icon">
                  <ModalLinkIcon />
                </span>
                <input
                  id="sp-url-input"
                  className="dc-modal-url-input"
                  type="url"
                  placeholder="https://ahana-ai.sharepoint.com/..."
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  autoFocus
                  required
                />
              </div>
            </div>

          </div>

          {/* ── Modal Footer ── */}
          <div className="dc-modal-footer">
            <button type="button" className="dc-modal-cancel" onClick={onClose} id="modal-cancel-btn">
              Cancel
            </button>
            <button type="submit" className="dc-modal-add-link" id="modal-add-link-btn">
              Add Link
            </button>
          </div>
        </form>

      </div>
    </div>
  );
}

// ── Main DocumentChecklistPage ────────────────────────────────────────────────

export default function DocumentChecklistPage({ onCancel, onCreate }) {
  const [docs, setDocs] = useState(
    DEFAULT_DOCS.map((d) => ({
      ...d,
      status: 'Pending',
      uploadedBy: '—',
      uploadDate: '—',
      link: '',
    }))
  );

  const [modal, setModal] = useState(null); // null | { id, name, isNewDoc }

  const uploadedCount = docs.filter((d) => d.status === 'Uploaded').length;
  const progress      = Math.round((uploadedCount / docs.length) * 100);

  const openDocLinkModal = (doc) => {
    setModal({ id: doc.id, name: doc.name, isNewDoc: false });
  };

  const openNewDocModal = () => {
    setModal({ id: null, name: '', isNewDoc: true });
  };

  const closeModal = () => setModal(null);

  const handleSaveDocument = ({ name, url }) => {
    const today = new Date().toLocaleDateString('en-GB');

    if (modal?.isNewDoc) {
      // Add new custom document
      const newDoc = {
        id: `d_custom_${Date.now()}`,
        name: name || 'Custom Document',
        icon: 'file-text',
        status: 'Uploaded',
        uploadedBy: 'Devanshi',
        uploadDate: today,
        link: url,
      };
      setDocs((prev) => [newDoc, ...prev]);
    } else {
      // Update existing document link
      setDocs((prev) =>
        prev.map((d) =>
          d.id === modal?.id
            ? {
                ...d,
                status: 'Uploaded',
                uploadedBy: 'Devanshi',
                uploadDate: today,
                link: url,
              }
            : d
        )
      );
    }
    closeModal();
  };

  return (
    <div className="dc-page">

      {/* ── Main Document Checklist card ── */}
      <div className="dc-card">

        {/* ── Card header ── */}
        <div className="dc-card-header">
          <div className="dc-card-header-left">
            <h2 className="dc-card-title">Document Checklist</h2>
          </div>
          <div className="dc-card-header-right">
            {/* Context bar */}
            <div className="dc-context-bar">
              <BuildingIcon />
              <span className="dc-ctx-project">FMS</span>
              <span className="dc-ctx-divider" />
              <span className="dc-ctx-pms">PMS ID: PMS-9021</span>
            </div>
          </div>
        </div>

        {/* ── Sub-header: progress + Add Document button ── */}
        <div className="dc-subheader">
          <div className="dc-progress-group">
            <span className="dc-progress-label">
              {uploadedCount} of {docs.length} documents uploaded
            </span>
            <div className="dc-progress-track">
              <div className="dc-progress-fill" style={{ width: `${progress}%` }} />
            </div>
          </div>
          <button
            id="add-document-btn"
            className="dc-add-doc-btn"
            onClick={openNewDocModal}
          >
            <PlusIcon />
            <span>Add Document</span>
          </button>
        </div>

        {/* ── Table Container ── */}
        <div className="dc-table-wrap">
          <div className="dc-table">

            {/* Table Header (Version Removed) */}
            <div className="dc-thead">
              <div className="dc-th dc-th--name">Document Name</div>
              <div className="dc-th dc-th--uploaded">Uploaded By</div>
              <div className="dc-th dc-th--date">Upload Date</div>
              <div className="dc-th dc-th--status">Status</div>
              <div className="dc-th dc-th--actions">Actions</div>
            </div>

            {/* Table Body Rows */}
            <div className="dc-tbody">
              {docs.map((doc) => {
                const IconComp = DocIcons[doc.icon] ?? DocIcons['file-text'];
                return (
                  <div key={doc.id} className="dc-row">
                    {/* Document Name */}
                    <div className="dc-td dc-td--name">
                      <span className="dc-doc-icon">
                        <IconComp />
                      </span>
                      <span className="dc-doc-name">{doc.name}</span>
                    </div>

                    {/* Uploaded By */}
                    <div className="dc-td dc-td--uploaded">
                      <span className={doc.uploadedBy !== '—' ? 'dc-cell-text' : 'dc-cell-muted'}>
                        {doc.uploadedBy}
                      </span>
                    </div>

                    {/* Upload Date */}
                    <div className="dc-td dc-td--date">
                      <span className={doc.uploadDate !== '—' ? 'dc-cell-text' : 'dc-cell-muted'}>
                        {doc.uploadDate}
                      </span>
                    </div>

                    {/* Status */}
                    <div className="dc-td dc-td--status">
                      <StatusPill status={doc.status} />
                    </div>

                    {/* Actions */}
                    <div className="dc-td dc-td--actions">
                      <button
                        className="dc-add-link-btn"
                        onClick={() => openDocLinkModal(doc)}
                        id={`add-link-${doc.id}`}
                        title={`Add link for ${doc.name}`}
                      >
                        <span className="dc-add-link-icon">
                          <LinkIcon />
                        </span>
                        <span className="dc-add-link-text">Add Link</span>
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>

          </div>
        </div>

      </div>{/* /dc-card */}

      {/* ── Footer ── */}
      <div className="dc-footer">
        <button id="doc-checklist-back-btn" className="dc-btn-cancel" onClick={onCancel}>
          Back
        </button>
        <button id="doc-checklist-create-btn" className="dc-btn-create" onClick={onCreate}>
          Create Project
          <RocketIcon />
        </button>
      </div>

      {/* ── Add Document / Link Modal ── */}
      {modal && (
        <AddDocumentModal
          docName={modal.name}
          isNewDoc={modal.isNewDoc}
          onSave={handleSaveDocument}
          onClose={closeModal}
        />
      )}

    </div>
  );
}
