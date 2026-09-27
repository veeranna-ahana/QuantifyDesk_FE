import { useState } from 'react';
import toast from 'react-hot-toast';

const today = () => new Date().toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' });

/** Document checklist state: link a SharePoint URL to a document, add a document, edit a link. */
export function useDocumentChecklist(initialDocs, uploader = 'Devanshi') {
  const [docs, setDocs] = useState(initialDocs);

  const uploadedCount = docs.filter((d) => d.status === 'Uploaded').length;
  const progress = docs.length ? Math.round((uploadedCount / docs.length) * 100) : 0;

  /** Attach / replace the link of an existing document. */
  const setLink = (id, url, { isEdit = false } = {}) => {
    setDocs((prev) => prev.map((d) => (d.id === id ? { ...d, link: url, ...(isEdit ? {} : { status: 'Uploaded', uploadedBy: uploader, uploadDate: today() }) } : d)));
    toast.success(isEdit ? 'SharePoint link updated successfully!' : 'Link added successfully!');
  };

  /** Add a brand-new document (goes on top of the list). */
  const addDocument = (name, url) => {
    setDocs((prev) => [{ id: `custom_${Date.now()}`, name: name || 'Custom Document', icon: 'file-text', status: 'Uploaded', uploadedBy: uploader, uploadDate: today(), link: url }, ...prev]);
    toast.success('Document added successfully!');
  };

  return { docs, uploadedCount, progress, setLink, addDocument };
}
