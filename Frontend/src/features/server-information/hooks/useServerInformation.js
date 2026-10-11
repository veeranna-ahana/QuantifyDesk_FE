import { useCallback, useEffect, useRef, useState } from "react";

import toast from "react-hot-toast";

import { serverService } from "../services/server.service";
import { buildServersCsv, downloadCsv } from "../utils";

const PAGE_SIZE = 10;
const EXPORT_PAGE_SIZE = 100; // the API's maximum page size

/**
 * Data + search/pagination state for the Server Information list — server-side search and paging
 * via GET /api/servers.
 */
export function useServerInformation() {
  const [searchQuery, setSearchQuery] = useState("");
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

  const fetchServers = useCallback(async () => {
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
  }, [page, searchQuery]);

  // Debounced, so typing in the search box doesn't fire a request per keystroke
  useEffect(() => {
    const handle = setTimeout(fetchServers, 300);
    return () => clearTimeout(handle);
  }, [fetchServers]);

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

      if (all.length === 0) {
        toast.error("No servers to export");
        return;
      }
      const date = new Date().toISOString().slice(0, 10);
      downloadCsv(buildServersCsv(all), `servers-${date}.csv`);
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

  return {
    servers: data.content,
    searchQuery,
    setSearchQuery: handleSearchChange,
    page,
    setPage,
    totalPages: data.totalPages,
    totalItems: data.totalElements,
    pageSize: PAGE_SIZE,
    activeCount: data.activeCount,
    loading,
    error,
    exporting,
    exportCsv,
  };
}
