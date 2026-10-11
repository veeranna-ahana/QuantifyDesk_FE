import { useCallback, useEffect, useRef, useState } from "react";
import toast from "react-hot-toast";

import { projectDocumentChecklistService } from "../services/projectDocumentChecklist.service";

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
  const [filterBy, setFilterBy] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
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

  const status = statusFilter === "all" ? "" : statusFilter;

  const fetchReport = useCallback(async () => {
    const requestId = latestRequest.current + 1;
    latestRequest.current = requestId;
    try {
      setLoading(true);
      setError(null);
      const res = await projectDocumentChecklistService.getReport({
        page,
        pageSize: PAGE_SIZE,
        search,
        status,
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
  }, [page, search, status]);

  // Debounced, so typing in the search box doesn't fire a request per keystroke
  useEffect(() => {
    const handle = setTimeout(fetchReport, 300);
    return () => clearTimeout(handle);
  }, [fetchReport]);

  // Exports every project matching the current search/status, not just the visible page
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
          status,
        });
        all.push(...res.content);
        totalPages = res.totalPages;
        current += 1;
      } while (current <= totalPages);

      if (all.length === 0) {
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
        ...all[0].documents
          .filter((document) => !document.custom)
          .map((document) => document.name),
        "Custom Documents",
      ];
      const rows = all.map((project) => [
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

  return {
    projects: data.content,
    totalProjects: data.totalElements,
    page,
    pageSize: PAGE_SIZE,
    totalPages: data.totalPages,
    summary: data.summary,
    statuses: data.statuses,
    loading,
    error,
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
