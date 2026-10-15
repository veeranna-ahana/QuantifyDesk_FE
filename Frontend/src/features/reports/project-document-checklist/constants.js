export const PROJECT_STATUSES = ["In Progress", "Completed", "On Hold"];

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
