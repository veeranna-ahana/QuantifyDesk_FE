const DOCUMENT_NAMES = [
  "BRD or CR",
  "Proposal Document",
  "Effort Estimate",
  "Solution architecture",
  "DB design document",
  "Swagger API document",
  "UI/UX",
  "Test plan",
  "Testcase document",
  "QA signoff",
  "UAT signoff",
  "Technical Design Doc",
  "Release Notes",
  "Risk registry",
  "User manual",
  "GIT Repository Link",
];

const seededProjects = [
  { id: 1, name: "FMS Implementation", code: "PRJ-9021", uploaded: 12 },
  { id: 2, name: "PMS", code: "PRJ-9021", uploaded: 12 },
  { id: 3, name: "WPT", code: "PRJ-9021", uploaded: 12 },
  { id: 4, name: "Cloud Migration Q1", code: "PRJ-8834", uploaded: 14 },
  { id: 5, name: "Security Audit FY24", code: "PRJ-9102", uploaded: 10 },
  { id: 6, name: "Mobile App Revamp", code: "PRJ-8755", uploaded: 13 },
  { id: 7, name: "ERP Integration", code: "PRJ-8812", uploaded: 11 },
  { id: 8, name: "Data Warehouse Build", code: "PRJ-8910", uploaded: 16 },
];

const additionalNames = [
  "DevOps Pipeline Setup",
  "AI Analytics Platform",
  "Customer Portal v2",
  "Payroll Automation",
  "HR Self-Service App",
  "Compliance Tracker",
  "Network Modernisation",
  "API Gateway Rollout",
  "Digital Onboarding",
  "CRM Enhancement",
];

export const PROJECT_DOCUMENTS = DOCUMENT_NAMES.map((name, index) => ({
  id: `doc-${index + 1}`,
  name,
}));

const FMS_UPLOADED_DOCUMENTS = new Set([
  0, 1, 2, 3, 4, 5, 6, 7, 8, 11, 13, 15,
]);

function createProject(project, index) {
  const uploadedCount = project.uploaded ?? 8 + (index % 9);
  const documents = PROJECT_DOCUMENTS.map((document, documentIndex) => ({
    ...document,
    available:
      project.id === 1
        ? FMS_UPLOADED_DOCUMENTS.has(documentIndex)
        : documentIndex < uploadedCount,
  }));

  return {
    ...project,
    status: index > 7 && index % 6 === 0 ? "Completed" : "In Progress",
    documents,
    received: uploadedCount,
    pending: documents.length - uploadedCount,
    compliance: Math.round((uploadedCount / documents.length) * 100),
  };
}

const generatedProjects = Array.from({ length: 40 }, (_, index) => {
  const name = additionalNames[index % additionalNames.length];
  const version = Math.floor(index / additionalNames.length);
  return {
    id: index + seededProjects.length + 1,
    name: version ? `${name} ${version + 1}` : name,
    code: `PRJ-${9200 + index}`,
  };
});

export const mockProjectDocumentChecklist = [
  ...seededProjects,
  ...generatedProjects,
].map(createProject);

export const mockProjectDocumentSummary = {
  totalProjects: 8,
  uploadedDocuments: 8,
  pendingDocuments: 34,
  complianceRate: 73.4,
};
