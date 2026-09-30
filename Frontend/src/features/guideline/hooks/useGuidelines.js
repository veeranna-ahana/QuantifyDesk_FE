import { useState, useEffect, useCallback } from 'react';
import { guidelineService } from '../services/guideline.service';

export function useGuidelines() {
  const [data, setData] = useState({ content: [], totalElements: 0, totalPages: 1 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  const [page, setPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState('');
  const [filter, setFilter] = useState('All'); // Added filter state

  const fetchGuidelines = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await guidelineService.getGuidelines({ page, searchQuery, filter });
      setData(res);
    } catch (err) {
      setError('Failed to fetch guidelines');
    } finally {
      setLoading(false);
    }
  }, [page, searchQuery, filter]);

  // Debounced search/filter effect
  useEffect(() => {
    const handler = setTimeout(() => {
      setPage(1);
      fetchGuidelines();
    }, 300);
    return () => clearTimeout(handler);
  }, [searchQuery, filter, fetchGuidelines]);

  // Handle page change effect
  useEffect(() => {
    fetchGuidelines();
  }, [page, fetchGuidelines]);

  return {
    guidelines: data.content,
    totalItems: data.totalElements,
    totalPages: data.totalPages,
    loading,
    error,
    page,
    setPage,
    searchQuery,
    setSearchQuery,
    filter,
    setFilter,
    fetchGuidelines
  };
}
