import { useCallback, useEffect, useRef, useState } from "react";

import toast from "react-hot-toast";

import { serverService } from "../services/server.service";
import { buildServersCsv, downloadCsv } from "../utils";

const PAGE_SIZE = 10;
const EXPORT_PAGE_SIZE = 100; // the API's maximum page size
const EMPTY_FILTERS = { environments: [], status: "All", projects: [] };
const PROJECT_MATCHERS = {
  FMS: /^FMS\b/i,
  WPT: /^(WPT|WQT)\b|work quantify tool/i,
  PMS: /^PMS\b/i,
};

function hasFilters(filters) {
  return (
    filters.environments.length > 0 ||
    filters.status !== "All" ||
    filters.projects.length > 0
  );
}

function matchesFilters(server, filters) {
  const environmentMatches =
    filters.environments.length === 0 ||
    filters.environments.some((environment) =>
      environment === "UAT / Staging"
        ? ["UAT", "Staging", "UAT / Staging"].includes(server.environment)
        : server.environment === environment,
    );
  const statusMatches =
    filters.status === "All" || server.status === filters.status;
  const projectMatches =
    filters.projects.length === 0 ||
    filters.projects.some((project) =>
      server.assignedProjects?.some((assignedProject) =>
        PROJECT_MATCHERS[project]?.test(assignedProject),
      ),
    );

  return environmentMatches && statusMatches && projectMatches;
}

/**
 * Data + search/pagination state for the Server Information list — server-side search and paging
 * via GET /api/servers.
 */
export function useServerInformation() {
  const [searchQuery, setSearchQuery] = useState("");
  const [appliedFilters, setAppliedFilters] = useState(EMPTY_FILTERS);
  const [filteredServers, setFilteredServers] = useState(null);
  const [page, setPage] = useState(1);
  const [data, setData] = useState({
    content: [],
    totalElements: 0,
    totalPages: 1,
    activeCount: 0,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [exporting, setExporting] = useState(false);
  const latestRequest = useRef(0);
  const filtersApplied = hasFilters(appliedFilters);

  const fetchServers = useCallback(async () => {
    if (filtersApplied) return;
    const requestId = latestRequest.current + 1;
    latestRequest.current = requestId;
    try {
      setLoading(true);
      setError(null);
      const res = await serverService.getServers({
        page,
        pageSize: PAGE_SIZE,
        search: searchQuery,
      });
      if (requestId !== latestRequest.current) return;
      setData(res);
      if (res.page !== page) setPage(res.page); // the server clamps an out-of-range page
    } catch (err) {
      if (requestId !== latestRequest.current) return;
      setError(err.response?.data?.message || "Failed to fetch servers");
    } finally {
      if (requestId === latestRequest.current) setLoading(false);
    }
  }, [filtersApplied, page, searchQuery]);

  // Debounced, so typing in the search box doesn't fire a request per keystroke
  useEffect(() => {
    const handle = setTimeout(fetchServers, 300);
    return () => clearTimeout(handle);
  }, [fetchServers]);

  useEffect(() => {
    if (!filtersApplied) {
      setFilteredServers(null);
      return undefined;
    }

    let cancelled = false;
    const requestId = latestRequest.current + 1;
    latestRequest.current = requestId;

    const loadFilteredServers = async () => {
      try {
        setLoading(true);
        setError(null);
        const allServers = [];
        let currentPage = 1;
        let totalPages = 1;

        do {
          const response = await serverService.getServers({
            page: currentPage,
            pageSize: EXPORT_PAGE_SIZE,
            search: searchQuery,
          });
          allServers.push(...response.content);
          totalPages = response.totalPages;
          currentPage += 1;
        } while (currentPage <= totalPages);

        if (cancelled || requestId !== latestRequest.current) return;
        setFilteredServers(
          allServers.filter((server) => matchesFilters(server, appliedFilters)),
        );
      } catch (err) {
        if (!cancelled && requestId === latestRequest.current) {
          setFilteredServers([]);
          setError(err.response?.data?.message || "Failed to fetch servers");
        }
      } finally {
        if (!cancelled && requestId === latestRequest.current) {
          setLoading(false);
        }
      }
    };

    loadFilteredServers();
    return () => {
      cancelled = true;
    };
  }, [appliedFilters, filtersApplied, searchQuery]);

  // Exports every server matching the current search (not just the visible page)
  const exportCsv = async () => {
    if (exporting) return;
    try {
      setExporting(true);
      const all = [];
      let current = 1;
      let totalPages = 1;
      do {
        const res = await serverService.getServers({
          page: current,
          pageSize: EXPORT_PAGE_SIZE,
          search: searchQuery,
        });
        all.push(...res.content);
        totalPages = res.totalPages;
        current += 1;
      } while (current <= totalPages);

      const filtered = all.filter((server) =>
        matchesFilters(server, appliedFilters),
      );

      if (filtered.length === 0) {
        toast.error("No servers to export");
        return;
      }
      const date = new Date().toISOString().slice(0, 10);
      downloadCsv(buildServersCsv(filtered), `servers-${date}.csv`);
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to export servers");
    } finally {
      setExporting(false);
    }
  };

  // Reset to page 1 when search changes
  const handleSearchChange = (value) => {
    setSearchQuery(value);
    setPage(1);
  };

  const setFilters = (filters) => {
    setAppliedFilters(filters);
    setPage(1);
  };

  const visibleServers = filtersApplied
    ? (filteredServers || []).slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE)
    : data.content;
  const filteredTotalItems = filtersApplied
    ? (filteredServers || []).length
    : data.totalElements;

  return {
    servers: visibleServers,
    searchQuery,
    setSearchQuery: handleSearchChange,
    filters: appliedFilters,
    setFilters,
    filtersApplied,
    page,
    setPage,
    totalPages: filtersApplied
      ? Math.max(1, Math.ceil(filteredTotalItems / PAGE_SIZE))
      : data.totalPages,
    totalItems: filteredTotalItems,
    pageSize: PAGE_SIZE,
    activeCount: data.activeCount,
    loading,
    error,
    exporting,
    exportCsv,
  };
}
