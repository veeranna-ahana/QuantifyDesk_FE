// There used to be a hardcoded PROJECT_STATUSES = ["In Progress", "Completed", "On Hold"] here,
// shown as the Project Status checkboxes. But project.status (below, and in
// projectDocumentChecklist.controller.js) is PMS's own raw status string (e.g. "ON_HOLD",
// "APPROVED" — whatever PMS's getAllProjects actually returns), not that English label. Selecting
// "On Hold" sent filters.projectStatuses = ["On Hold"], which an exact-match
// `project.status === "On Hold"` could never match against "ON_HOLD" — so a project really on
// hold in PMS never showed up. The fix: Project Status options now come from the backend's own
// `statuses` list (projectDocumentChecklist.controller.js's `statuses`, the real distinct PMS
// status values across every imported project), passed through
// useProjectDocumentChecklistReport.js's `projectStatuses`, so what's offered and what's matched
// against are always the same real values — see ChecklistReportFilters.jsx.

export const EMPTY_CHECKLIST_FILTERS = {
  projectStatuses: [],
  documentStatuses: [],
  documentType: "",
};

export function getActiveChecklistFilterCount(filters) {
  return (
    Number(filters.projectStatuses.length > 0) +
    Number(filters.documentStatuses.length > 0) +
    Number(Boolean(filters.documentType))
  );
}

export function matchesChecklistFilters(project, filters) {
  const projectMatches =
    filters.projectStatuses.length === 0 ||
    filters.projectStatuses.includes(project.status);
  const projectDocuments = project.documents || [];
  const selectedDocuments = filters.documentType
    ? projectDocuments.filter(
        (document) => document.name === filters.documentType,
      )
    : projectDocuments;
  const availabilityMatches =
    (!filters.documentType || selectedDocuments.length > 0) &&
    (filters.documentStatuses.length === 0 ||
      selectedDocuments.some(
        (document) =>
          (filters.documentStatuses.includes("available") &&
            document.available) ||
          (filters.documentStatuses.includes("pending") && !document.available),
      ));

  return projectMatches && availabilityMatches;
}
