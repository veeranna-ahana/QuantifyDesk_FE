import { useEffect, useMemo, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';

import { getProjects } from '@/features/projects/services/projectsService';
import {
  selectCurrentPage,
  selectError,
  selectLoading,
  selectPageSize,
  setCurrentPage,
  setError,
  setLoading,
  setProjects,
} from '@/store/slices/projectsSlice';

/**
 * Data + filter/pagination state for the Projects list.
 * Behaviour is identical to the previous page (Redux store + getProjects service);
 * swapping the mock service for the real API only touches services/projectsService.js.
 */
export function useProjects() {
  const dispatch = useDispatch();
  const loading = useSelector(selectLoading);
  const error = useSelector(selectError);
  const page = useSelector(selectCurrentPage);
  const pageSize = useSelector(selectPageSize);
  const allProjects = useSelector((s) => s.projects.projects);

  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  useEffect(() => {
    let cancelled = false;
    (async () => {
      dispatch(setLoading(true));
      try {
        const data = await getProjects();
        if (!cancelled) dispatch(setProjects(data));
      } catch (err) {
        if (!cancelled) dispatch(setError(err.message ?? 'Failed to load projects'));
      } finally {
        if (!cancelled) dispatch(setLoading(false));
      }
    })();
    return () => { cancelled = true; };
  }, [dispatch]);

  const counts = useMemo(() => {
    const c = { all: allProjects.length };
    allProjects.forEach((p) => { c[p.status] = (c[p.status] ?? 0) + 1; });
    return c;
  }, [allProjects]);

  const filtered = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return allProjects.filter((p) => {
      const okStatus = statusFilter === 'all' || p.status === statusFilter;
      const okSearch = !q || [p.projectName, p.pmsId, p.customer].some((v) => v?.toLowerCase().includes(q));
      return okStatus && okSearch;
    });
  }, [allProjects, searchQuery, statusFilter]);

  useEffect(() => { dispatch(setCurrentPage(1)); }, [searchQuery, statusFilter, dispatch]);

  const start = (page - 1) * pageSize;
  return {
    projects: filtered.slice(start, start + pageSize),
    counts,
    loading,
    error,
    searchQuery,
    setSearchQuery,
    statusFilter,
    setStatusFilter,
    page,
    setPage: (p) => dispatch(setCurrentPage(p)),
    totalPages: Math.max(1, Math.ceil(filtered.length / pageSize)),
    totalItems: filtered.length,
    pageSize,
  };
}
