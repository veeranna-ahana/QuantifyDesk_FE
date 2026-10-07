import { useState, useEffect, useCallback } from 'react';
import { guidelineService } from '../services/guideline.service';

export function useGuidelines(appliedFilters) {
  const [data, setData] = useState({ content: [], totalElements: 0, totalPages: 1, versions: [] });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  const [page, setPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState('');
  const fetchGuidelines = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await guidelineService.getGuidelines({ page, searchQuery, filters: appliedFilters });
      setData(res);
    } catch {
      setError('Failed to fetch guidelines');
    } finally {
      setLoading(false);
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
