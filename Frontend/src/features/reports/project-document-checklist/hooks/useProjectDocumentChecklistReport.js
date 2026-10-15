import { useCallback, useEffect, useRef, useState } from "react";
import toast from "react-hot-toast";

import { projectDocumentChecklistService } from "../services/projectDocumentChecklist.service";
import {
  EMPTY_CHECKLIST_FILTERS,
  getActiveChecklistFilterCount,
  matchesChecklistFilters,
} from "../constants";

const PAGE_SIZE = 10;
const EXPORT_PAGE_SIZE = 100; // the API's maximum page size

const EMPTY_SUMMARY = {
  totalProjects: 0,
  uploadedDocuments: 0,
  pendingDocuments: 0,
  complianceRate: 0,
};

function csvRow(values) {
  return values
    .map((value) => {
      let text = String(value ?? "");
      if (/^[=+\-@]/.test(text)) text = `'${text}`; // keep Excel from reading it as a formula
      return `"${text.replace(/"/g, '""')}"`;
    })
    .join(",");
}

export function useProjectDocumentChecklistReport() {
  const [search, setSearch] = useState("");
  const [filters, setFilters] = useState({
    ...EMPTY_CHECKLIST_FILTERS,
  });
  const [filteredProjects, setFilteredProjects] = useState([]);
  const [filteredDocumentTypes, setFilteredDocumentTypes] = useState([]);
  const [page, setPage] = useState(1);
  const [expandedProject, setExpandedProject] = useState(null);
  const [data, setData] = useState({
    summary: EMPTY_SUMMARY,
    content: [],
    totalElements: 0,
    totalPages: 1,
    statuses: [],
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const latestRequest = useRef(0);
  const filtersApplied = getActiveChecklistFilterCount(filters) > 0;

  const fetchReport = useCallback(async () => {
    if (filtersApplied) return;
    const requestId = latestRequest.current + 1;
    latestRequest.current = requestId;
    try {
      setLoading(true);
      setError(null);
      const res = await projectDocumentChecklistService.getReport({
        page,
        pageSize: PAGE_SIZE,
        search,
      });
      if (requestId !== latestRequest.current) return;
      setData(res);
      if (res.page !== page) setPage(res.page); // the server clamps an out-of-range page
    } catch (err) {
      if (requestId !== latestRequest.current) return;
      setError(
        err.response?.data?.message || "Failed to load the document checklist",
      );
    } finally {
      if (requestId === latestRequest.current) setLoading(false);
    }
  }, [filtersApplied, page, search]);

  // Debounced, so typing in the search box doesn't fire a request per keystroke
  useEffect(() => {
    const handle = setTimeout(fetchReport, 300);
    return () => clearTimeout(handle);
  }, [fetchReport]);

  useEffect(() => {
    if (!filtersApplied) {
      setFilteredProjects([]);
      setFilteredDocumentTypes([]);
      return undefined;
    }

    let cancelled = false;
    const requestId = latestRequest.current + 1;
    latestRequest.current = requestId;

    const loadFilteredProjects = async () => {
      try {
        setLoading(true);
        setError(null);
        const allProjects = [];
        let firstPageResponse;
        let current = 1;
        let totalPages = 1;

        do {
          const response = await projectDocumentChecklistService.getReport({
            page: current,
            pageSize: EXPORT_PAGE_SIZE,
            search,
          });
          firstPageResponse ||= response;
          allProjects.push(...response.content);
          totalPages = response.totalPages;
          current += 1;
        } while (current <= totalPages);

        if (cancelled || requestId !== latestRequest.current) return;
        setData(firstPageResponse);
        setFilteredProjects(
          allProjects.filter((project) =>
            matchesChecklistFilters(project, filters),
          ),
        );
        setFilteredDocumentTypes([
          ...new Set(
            allProjects.flatMap((project) =>
              (project.documents || []).map((document) => document.name),
            ),
          ),
        ]);
      } catch (err) {
        if (!cancelled && requestId === latestRequest.current) {
          setFilteredProjects([]);
          setError(
            err.response?.data?.message ||
              "Failed to load the document checklist",
          );
        }
      } finally {
        if (!cancelled && requestId === latestRequest.current) {
          setLoading(false);
        }
      }
    };

    loadFilteredProjects();
    return () => {
      cancelled = true;
    };
  }, [filters, filtersApplied, search]);

  // Exports every project matching the current search and applied filters.
  const exportReport = async () => {
    try {
      const all = [];
      let current = 1;
      let totalPages = 1;
      do {
        const res = await projectDocumentChecklistService.getReport({
          page: current,
          pageSize: EXPORT_PAGE_SIZE,
          search,
        });
        all.push(...res.content);
        totalPages = res.totalPages;
        current += 1;
      } while (current <= totalPages);

      const filtered = all.filter((project) =>
        matchesChecklistFilters(project, filters),
      );
      if (filtered.length === 0) {
        toast.error("No projects to export");
        return;
      }
      const header = [
        "Project Name",
        "Project Code",
        "Project Status",
        "Received",
        "Pending",
        "Compliance",
        ...filtered[0].documents
          .filter((document) => !document.custom)
          .map((document) => document.name),
        "Custom Documents",
      ];
      const rows = filtered.map((project) => [
        project.name,
        project.code,
        project.status,
        `${project.received} / ${project.total}`,
        project.pending,
        `${project.compliance}%`,
        ...project.documents
          .filter((document) => !document.custom)
          .map((document) =>
            document.available ? "Available" : "Not Available",
          ),
        project.documents
          .filter((document) => document.custom)
          .map((document) => document.name)
          .join("; "),
      ]);
      // The BOM makes Excel read the file as UTF-8
      const blob = new Blob(["﻿", [header, ...rows].map(csvRow).join("\r\n")], {
        type: "text/csv;charset=utf-8;",
      });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `project-document-checklist-${new Date().toISOString().slice(0, 10)}.csv`;
      link.click();
      URL.revokeObjectURL(url);
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to export the report");
    }
  };

  const setSearchQuery = (value) => {
    setSearch(value);
    setPage(1);
    setExpandedProject(null);
    if (filtersApplied) setFilteredProjects([]);
  };

  const applyFilters = (nextFilters) => {
    setFilters(nextFilters);
    setPage(1);
    setExpandedProject(null);
    setFilteredProjects([]);
  };

  return {
    projects: filtersApplied
      ? filteredProjects.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE)
      : data.content,
    totalProjects: filtersApplied
      ? filteredProjects.length
      : data.totalElements,
    page,
    pageSize: PAGE_SIZE,
    totalPages: filtersApplied
      ? Math.max(1, Math.ceil(filteredProjects.length / PAGE_SIZE))
      : data.totalPages,
    summary: data.summary,
    documentTypes: filtersApplied
      ? filteredDocumentTypes
      : [
          ...new Set(
            data.content.flatMap((project) =>
              (project.documents || []).map((document) => document.name),
            ),
          ),
        ],
    filters,
    filtersApplied,
    activeFilterCount: getActiveChecklistFilterCount(filters),
    loading,
    error,
    search,
    setSearch: setSearchQuery,
    setFilters: applyFilters,
    expandedProject,
    setExpandedProject,
    setPage,
    exportReport,
  };
}
