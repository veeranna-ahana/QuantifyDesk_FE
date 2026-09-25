// Document checklist mock data. `icon` is a key resolved in components/DocumentChecklist.

export const DOCUMENT_TEMPLATE = [
  { id: 'd1', name: 'BRD or CR', icon: 'file-text' },
  { id: 'd2', name: 'Proposal Document', icon: 'file-text' },
  { id: 'd3', name: 'Effort Estimate', icon: 'sheet' },
  { id: 'd4', name: 'Solution architecture', icon: 'layers' },
  { id: 'd5', name: 'DB design document', icon: 'database' },
  { id: 'd6', name: 'Swagger API document', icon: 'code' },
  { id: 'd7', name: 'UI/UX', icon: 'design' },
  { id: 'd8', name: 'Test plan', icon: 'clipboard' },
  { id: 'd9', name: 'Testcase document', icon: 'list' },
  { id: 'd10', name: 'QA signoff', icon: 'shield' },
  { id: 'd11', name: 'UAT signoff', icon: 'check' },
  { id: 'd12', name: 'Technical Design Document', icon: 'code' },
  { id: 'd13', name: 'Release Notes', icon: 'tag' },
  { id: 'd14', name: 'Risk registry', icon: 'alert' },
  { id: 'd15', name: 'User manual', icon: 'book' },
  { id: 'd16', name: 'GIT Repository Link', icon: 'git' },
];

/** Import wizard: nothing uploaded yet. */
export const PENDING_DOCUMENTS = DOCUMENT_TEMPLATE.map((d) => ({ ...d, status: 'Pending', uploadedBy: '-', uploadDate: '-', link: '' }));

const uploads = [
  ['Kusum G G', 'Oct 22, 2024'], ['Sarah Jenkins', 'Oct 18, 2024'], ['Amit Patel', 'Oct 20, 2024'], ['Devanshi Mehta', 'Oct 21, 2024'],
  ['Rajesh K.', 'Oct 19, 2024'], ['Rajesh K.', 'Oct 23, 2024'], ['Priya Sen', 'Oct 17, 2024'], ['Vikram Roy', 'Oct 21, 2024'],
  ['Vikram Roy', 'Oct 22, 2024'], ['Ananya S.', 'Oct 23, 2024'], ['Kusum G G', 'Oct 24, 2024'], ['Devanshi Mehta', 'Oct 20, 2024'],
  ['Rohan M.', 'Oct 25, 2024'], ['Neha K.', 'Oct 16, 2024'], ['Sarah Jenkins', 'Oct 24, 2024'], ['Rajiv Sharma', 'Oct 24, 2024'],
];

/** Existing project: all documents uploaded. */
export const UPLOADED_DOCUMENTS = DOCUMENT_TEMPLATE.map((d, i) => ({
  ...d,
  status: 'Uploaded',
  uploadedBy: uploads[i][0],
  uploadDate: uploads[i][1],
  link: 'https://ahana-ai.sharepoint.com/...',
}));
