import { useMemo, useState } from "react";

import {
  mockProjectDocumentChecklist,
  mockProjectDocumentSummary,
  PROJECT_DOCUMENTS,
} from "../mock/mockProjectDocumentChecklist";

const PAGE_SIZE = 10;

function csvRow(values) {
  return values
    .map((value) => `"${String(value ?? "").replace(/"/g, '""')}"`)
    .join(",");
}

export function useProjectDocumentChecklistReport() {
  const [search, setSearch] = useState("");
  const [filterBy, setFilterBy] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [page, setPage] = useState(1);
  const [expandedProject, setExpandedProject] = useState(1);

  const projects = useMemo(() => {
    const query = search.trim().toLowerCase();
    return mockProjectDocumentChecklist.filter((project) => {
      const matchesSearch =
        !query ||
        (filterBy === "status"
          ? project.status.toLowerCase().includes(query)
          : filterBy === "project"
            ? project.name.toLowerCase().includes(query) ||
              project.code.toLowerCase().includes(query)
            : project.name.toLowerCase().includes(query) ||
              project.code.toLowerCase().includes(query) ||
              project.documents.some((document) =>
              document.name.toLowerCase().includes(query),
              ));
      const matchesStatus =
        statusFilter === "all" || project.status === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [filterBy, search, statusFilter]);

  const pageProjects = useMemo(() => {
    const offset = (page - 1) * PAGE_SIZE;
    return projects.slice(offset, offset + PAGE_SIZE);
  }, [page, projects]);

  const exportReport = () => {
    const header = [
      "Project Name",
      "Project Code",
      "Project Status",
      "Received",
      "Pending",
      "Compliance",
      ...PROJECT_DOCUMENTS.map((document) => document.name),
    ];
    const rows = projects.map((project) => [
      project.name,
      project.code,
      project.status,
      `${project.received} / ${project.documents.length}`,
      project.pending,
      `${project.compliance}%`,
      ...project.documents.map((document) =>
        document.available ? "Available" : "Not Available",
      ),
    ]);
    const blob = new Blob(
      [[header, ...rows].map(csvRow).join("\n")],
      { type: "text/csv" },
    );
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "project-document-checklist.csv";
    link.click();
    URL.revokeObjectURL(url);
  };

  return {
    projects: pageProjects,
    totalProjects: projects.length,
    page,
    pageSize: PAGE_SIZE,
    totalPages: Math.max(1, Math.ceil(projects.length / PAGE_SIZE)),
    summary: mockProjectDocumentSummary,
    search,
    setSearch: (value) => {
      setSearch(value);
      setPage(1);
    },
    filterBy,
    setFilterBy: (value) => {
      setFilterBy(value);
      setSearch("");
      setStatusFilter("all");
      setPage(1);
    },
    statusFilter,
    setStatusFilter: (value) => {
      setStatusFilter(value);
      setPage(1);
    },
    expandedProject,
    setExpandedProject,
    setPage,
    exportReport,
  };
}
