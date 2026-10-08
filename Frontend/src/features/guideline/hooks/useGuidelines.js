import { useState, useEffect, useCallback, useRef } from 'react';
import { guidelineService } from '../services/guideline.service';

export function useGuidelines(appliedFilters) {
  const [data, setData] = useState({
    content: [],
    totalElements: 0,
    totalDocuments: 0,
    totalPages: 1,
    versions: [],
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  const [page, setPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState('');
  const latestRequest = useRef(0);
  const fetchGuidelines = useCallback(async () => {
    const requestId = latestRequest.current + 1;
    latestRequest.current = requestId;
    try {
      setLoading(true);
      setError(null);
      const res = await guidelineService.getGuidelines({ page, searchQuery, filters: appliedFilters });
      if (requestId !== latestRequest.current) return;
      setPage(res.page);
      setData(res);
    } catch {
      if (requestId !== latestRequest.current) return;
      setError('Failed to fetch guidelines');
    } finally {
      if (requestId === latestRequest.current) setLoading(false);
    }
  }, [page, searchQuery, appliedFilters]);

  useEffect(() => {
    const handler = setTimeout(() => {
      fetchGuidelines();
    }, 300);
    return () => clearTimeout(handler);
  }, [fetchGuidelines]);

  return {
    guidelines: data.content,
    totalItems: data.totalElements,
    totalDocuments: data.totalDocuments,
    totalPages: data.totalPages,
    versions: data.versions,
    loading,
    error,
    page,
    setPage,
    searchQuery,
    setSearchQuery,
    fetchGuidelines
  };
}
