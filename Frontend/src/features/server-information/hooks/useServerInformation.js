import { useMemo, useState } from 'react';

import { MOCK_SERVERS } from '../mock/mockServers';

const PAGE_SIZE = 10;

/**
 * Data + filter/pagination state for the Server Information list.
 * Uses mock data; swap MOCK_SERVERS for a real API call in a service layer when ready.
 */
export function useServerInformation() {
  const [searchQuery, setSearchQuery] = useState('');
  const [page, setPage] = useState(1);

  const filtered = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return MOCK_SERVERS;
    return MOCK_SERVERS.filter((s) =>
      [s.serverName, s.ipAddress, s.os, s.environment, ...(s.assignedProjects || [])].some((v) =>
        v?.toLowerCase().includes(q),
      ),
    );
  }, [searchQuery]);

  // Reset to page 1 when search changes
  const handleSearchChange = (value) => {
    setSearchQuery(value);
    setPage(1);
  };

  const totalItems = filtered.length;
  const totalPages = Math.max(1, Math.ceil(totalItems / PAGE_SIZE));
  const start = (page - 1) * PAGE_SIZE;
  const servers = filtered.slice(start, start + PAGE_SIZE);

  const activeCount = MOCK_SERVERS.filter((s) => s.status !== 'Not Active').length;

  return {
    servers,
    searchQuery,
    setSearchQuery: handleSearchChange,
    page,
    setPage,
    totalPages,
    totalItems,
    pageSize: PAGE_SIZE,
    activeCount,
  };
}
