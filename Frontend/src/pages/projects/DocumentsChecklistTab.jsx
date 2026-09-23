// src/pages/projects/DocumentsChecklistTab.jsx
import React, { useState } from 'react';
import {
  Check,
  ExternalLink,
  FileText,
  FileSpreadsheet,
  Layers,
  Database,
  Code,
  Palette,
  ClipboardCheck,
  ListChecks,
  ShieldCheck,
  CheckCircle2,
  Tag,
  AlertTriangle,
  BookOpen,
  GitBranch,
  Plus,
  Pencil,
  X,
  Link2,
} from 'lucide-react';
import toast from 'react-hot-toast';

const INITIAL_DOCUMENTS = [
  { id: 1,  name: 'BRD or CR',                  icon: FileText,     version: 'v3.1',           uploadedBy: 'Kusum G G',      uploadDate: 'Oct 22, 2024', status: 'Uploaded' },
  { id: 2,  name: 'Proposal Document',           icon: FileText,     version: 'v2.0',           uploadedBy: 'Sarah Jenkins',  uploadDate: 'Oct 18, 2024', status: 'Uploaded' },
  { id: 3,  name: 'Effort Estimate',             icon: FileSpreadsheet, version: 'v1.4',        uploadedBy: 'Amit Patel',     uploadDate: 'Oct 20, 2024', status: 'Uploaded' },
  { id: 4,  name: 'Solution architecture',       icon: Layers,       version: 'v2.1',           uploadedBy: 'Devanshi Mehta', uploadDate: 'Oct 21, 2024', status: 'Uploaded' },
  { id: 5,  name: 'DB design document',          icon: Database,     version: 'v1.8',           uploadedBy: 'Rajesh K.',      uploadDate: 'Oct 19, 2024', status: 'Uploaded' },
  { id: 6,  name: 'Swagger API document',        icon: Code,         version: 'v3.0.2',         uploadedBy: 'Rajesh K.',      uploadDate: 'Oct 23, 2024', status: 'Uploaded' },
  { id: 7,  name: 'UI/UX',                       icon: Palette,      version: 'v2.3 (Figma)',   uploadedBy: 'Priya Sen',      uploadDate: 'Oct 17, 2024', status: 'Uploaded' },
  { id: 8,  name: 'Test plan',                   icon: ClipboardCheck, version: 'v1.2',         uploadedBy: 'Vikram Roy',     uploadDate: 'Oct 21, 2024', status: 'Uploaded' },
  { id: 9,  name: 'Testcase document',           icon: ListChecks,   version: 'v2.0',           uploadedBy: 'Vikram Roy',     uploadDate: 'Oct 22, 2024', status: 'Uploaded' },
  { id: 10, name: 'QA signoff',                  icon: ShieldCheck,  version: 'v1.0 (Signed)',  uploadedBy: 'Ananya S.',      uploadDate: 'Oct 23, 2024', status: 'Uploaded' },
  { id: 11, name: 'UAT signoff',                 icon: CheckCircle2, version: 'v1.0 (Final)',   uploadedBy: 'Kusum G G',      uploadDate: 'Oct 24, 2024', status: 'Uploaded' },
  { id: 12, name: 'Technical Design Document',   icon: Code,         version: 'v2.5',           uploadedBy: 'Devanshi Mehta', uploadDate: 'Oct 20, 2024', status: 'Uploaded' },
  { id: 13, name: 'Release Notes',               icon: Tag,          version: 'v1.0.0',         uploadedBy: 'Rohan M.',       uploadDate: 'Oct 25, 2024', status: 'Uploaded' },
  { id: 14, name: 'Risk registry',               icon: AlertTriangle, version: 'v1.1',          uploadedBy: 'Neha K.',        uploadDate: 'Oct 16, 2024', status: 'Uploaded' },
  { id: 15, name: 'User manual',                 icon: BookOpen,     version: 'v1.3',           uploadedBy: 'Sarah Jenkins',  uploadDate: 'Oct 24, 2024', status: 'Uploaded' },
  { id: 16, name: 'GIT Repository Link',         icon: GitBranch,    version: 'v2.4.0 (main)',  uploadedBy: 'Rajiv Sharma',   uploadDate: 'Oct 24, 2024', status: 'Uploaded' },
];

// ── Edit / Add SharePoint Link Modal ──────────────────────────────────────────
const EditLinkModal = ({ doc, onClose, onSave }) => {
  const [url, setUrl] = useState(doc?.sharePointUrl || 'https://ahana-ai.sharepoint.com/...');
  const [reference, setReference] = useState(doc?.name || 'BRD');

  if (!doc) return null;

  const handleSubmit = (e) => {
    e?.preventDefault();
    onSave(doc.id, url, reference);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/40 transition-opacity" onClick={onClose} />

      {/* Modal Card */}
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-[390px] z-10 overflow-hidden border border-gray-100 font-sans">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <h2 className="text-[15px] font-semibold text-gray-900 m-0">Edit SharePoint Link</h2>
          <button
            type="button"
            onClick={onClose}
            className="p-1 rounded-md hover:bg-gray-100 text-gray-400 hover:text-gray-600 transition-colors cursor-pointer bg-transparent border-none inline-flex items-center justify-center"
          >
            <X size={18} />
          </button>
        </div>

        {/* Body */}
        <div className="px-6 py-5 space-y-4">
          {/* Requirement Reference */}
          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1.5">
              Requirement Reference
            </label>
            <div className="bg-[#F8F9FA] border border-gray-200/80 rounded-lg px-3.5 py-2.5">
              <input
                type="text"
                value={reference}
                onChange={(e) => setReference(e.target.value)}
                placeholder="BRD"
                className="w-full bg-transparent outline-none border-none text-sm text-gray-800 font-medium placeholder-gray-400"
              />
            </div>
          </div>

          {/* SharePoint URL */}
          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1.5">
              SharePoint URL
            </label>
            <div className="flex items-center gap-2.5 bg-white border border-gray-200 rounded-lg px-3.5 py-2.5 focus-within:border-[#7C5CFC] focus-within:ring-2 focus-within:ring-[#7C5CFC]/15 transition-all">
              <Link2 size={16} className="text-gray-400 shrink-0" />
              <input
                type="url"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                placeholder="https://ahana-ai.sharepoint.com/..."
                className="flex-1 text-sm text-[#7C5CFC] placeholder-[#7C5CFC]/70 outline-none border-none bg-transparent"
              />
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="bg-[#F8F9FA] px-6 py-3.5 border-t border-gray-100 flex items-center justify-end gap-3 rounded-b-2xl">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-[#344054] bg-white border border-[#D0D5DD] rounded-lg hover:bg-gray-50 transition-colors shadow-sm cursor-pointer"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSubmit}
            className="px-4 py-2 text-sm font-medium text-white bg-[#7C5CFC] hover:bg-[#6847EB] rounded-lg transition-colors shadow-sm cursor-pointer border-none"
          >
            Add Link
          </button>
        </div>
      </div>
    </div>
  );
};

// ── Main Component ─────────────────────────────────────────────────────────────
const DocumentsChecklistTab = ({ project, isEditing = false, onSave, onCancel }) => {
  const [documents, setDocuments] = useState(INITIAL_DOCUMENTS);
  const [editLinkDoc, setEditLinkDoc] = useState(null);

  const uploadedCount = documents.filter((d) => d.status === 'Uploaded').length;
  const totalCount = documents.length;

  const handleOpenAddModal = () => {
    setEditLinkDoc({
      id: null,
      isNew: true,
      name: 'BRD',
      sharePointUrl: 'https://ahana-ai.sharepoint.com/...',
    });
  };

  const handleSaveLink = (docId, url, reference) => {
    if (docId) {
      setDocuments((prev) =>
        prev.map((d) => (d.id === docId ? { ...d, sharePointUrl: url, name: reference || d.name } : d))
      );
      toast.success('SharePoint link updated successfully!');
    } else {
      const newDoc = {
        id: Date.now(),
        name: reference || 'BRD',
        icon: FileText,
        version: 'v1.0',
        uploadedBy: 'Kusum G G',
        uploadDate: new Date().toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' }),
        status: 'Uploaded',
        sharePointUrl: url || 'https://ahana-ai.sharepoint.com/...',
      };
      setDocuments((prev) => [newDoc, ...prev]);
      toast.success('Document added successfully!');
    }
  };

  return (
    <div className="space-y-3 font-sans">
      {/* Edit Link Modal */}
      {editLinkDoc && (
        <EditLinkModal
          doc={editLinkDoc}
          onClose={() => setEditLinkDoc(null)}
          onSave={handleSaveLink}
        />
      )}

      {/* Top Bar: Progress + Add Document button */}
      <div className="flex items-center justify-between gap-3">
        {/* Upload Progress */}
        <div className="flex items-center gap-3 text-sm font-semibold text-gray-800">
          <div className="flex items-center gap-1.5 text-emerald-600 font-medium text-xs">
            <Check size={15} strokeWidth={2.5} />
            <span>{uploadedCount} of {totalCount} documents uploaded</span>
          </div>
          <div className="w-36 sm:w-48 h-1.5 bg-gray-200 rounded-full overflow-hidden">
            <div
              className="h-full bg-emerald-500 rounded-full transition-all duration-300"
              style={{ width: `${(uploadedCount / totalCount) * 100}%` }}
            />
          </div>
        </div>

        {/* + Add Document (Edit mode only) */}
        {isEditing && (
          <button
            type="button"
            id="add-document-btn"
            onClick={handleOpenAddModal}
            className="flex items-center gap-1.5 px-3.5 py-1.5 bg-[#856BFF] hover:bg-[#7354fd] text-white text-xs font-semibold rounded-lg shadow-sm transition-colors whitespace-nowrap cursor-pointer border-none"
          >
            <Plus size={14} />
             Add Document
          </button>
        )}
      </div>

      {/* Main Table Card */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-[#F8FAFC] border-b border-gray-200 text-[#475467] text-[12px] font-semibold">
                <th className="py-2.5 px-5 font-semibold w-[28%]">Document Name</th>
                <th className="py-2.5 px-3 font-semibold w-[16%]">Uploaded By</th>
                <th className="py-2.5 px-3 font-semibold w-[15%]">Upload Date</th>
                <th className="py-2.5 px-3 font-semibold w-[13%]">Status</th>
                <th className="py-2.5 px-5 font-semibold text-right w-[15%]">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 text-xs">
              {documents.map((doc) => {
                const IconComponent = doc.icon;
                return (
                  <tr key={doc.id} className="hover:bg-[#F9FAFB] transition-colors group">
                    {/* Document Name */}
                    <td className="py-2 px-5 text-gray-900 font-medium">
                      <div className="flex items-center gap-2">
                        <IconComponent size={15} className="text-[#856BFF] shrink-0" />
                        <span className="truncate">{doc.name}</span>
                      </div>
                    </td>

                    {/* Uploaded By */}
                    <td className="py-2 px-3 text-gray-700 font-normal">{doc.uploadedBy}</td>

                    {/* Upload Date */}
                    <td className="py-2 px-3 text-gray-500 font-normal whitespace-nowrap">{doc.uploadDate}</td>

                    {/* Status Pill */}
                    <td className="py-2 px-3">
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                        {doc.status}
                      </span>
                    </td>

                    {/* Actions */}
                    <td className="py-2 px-5">
                      <div className="flex items-center justify-end gap-2">
                        {/* View external link — always visible */}
                        <button
                          title="View Document"
                          onClick={() => console.log('Open document:', doc.name)}
                          className="p-1 rounded hover:bg-purple-50 text-[#856BFF] transition-colors cursor-pointer inline-flex items-center bg-transparent border-none"
                        >
                          <ExternalLink size={15} />
                        </button>

                        {/* Edit link — only in edit mode */}
                        {isEditing && (
                          <button
                            title="Edit SharePoint Link"
                            onClick={() => setEditLinkDoc(doc)}
                            className="p-1 rounded hover:bg-purple-50 text-[#856BFF] transition-colors cursor-pointer inline-flex items-center bg-transparent border-none"
                          >
                            <Pencil size={15} />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Footer Actions — only visible in Edit mode */}
      {isEditing && (
        <div className="flex items-center justify-end gap-4 mt-2 pt-2">
          <button
            type="button"
            id="doc-checklist-cancel-btn"
            onClick={onCancel}
            className="px-4 py-2 text-sm font-medium text-gray-500 hover:text-gray-800 transition-colors cursor-pointer bg-transparent border-none"
          >
            Cancel
          </button>
          <button
            type="button"
            id="doc-checklist-save-btn"
            onClick={onSave}
            className="px-5 py-2.5 bg-[#856BFF] hover:bg-[#7354fd] text-white text-sm font-semibold rounded-lg shadow-sm transition-colors cursor-pointer border-none"
          >
            Save
          </button>
        </div>
      )}
    </div>
  );
};

export default DocumentsChecklistTab;
