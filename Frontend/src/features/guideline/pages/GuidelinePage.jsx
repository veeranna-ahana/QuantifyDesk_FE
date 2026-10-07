import React, { useCallback, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Pagination } from '@/components/ui/Pagination';
import { DataTable } from '@/components/ui/Table';

import { useGuidelines } from '../hooks/useGuidelines';
import { GuidelineHeader } from '../components/GuidelineHeader';
import { GuidelineToolbar } from '../components/GuidelineToolbar';
import { getGuidelineColumns } from '../components/guidelineColumns';
import { PAGE_SIZE } from '../constants';
import '../styles/index.css';

export function GuidelinePage() {
  const navigate = useNavigate();
  const [appliedFilters, setAppliedFilters] = useState({ versions: [], lastUpdated: 'all' });
  const [draftFilters, setDraftFilters] = useState({ versions: [], lastUpdated: 'all' });
  const [filterOpen, setFilterOpen] = useState(false);
  const {
    guidelines,
    totalItems,
    totalPages,
    versions,
    loading,
    error,
    page,
    setPage,
    searchQuery,
    setSearchQuery,
  } = useGuidelines(appliedFilters);

  const copyFilters = (filters) => ({
    versions: [...filters.versions],
    lastUpdated: filters.lastUpdated,
  });

  const handleFilterOpenChange = (open) => {
    setDraftFilters(copyFilters(appliedFilters));
    setFilterOpen(open);
  };

  const handleResetFilters = () => {
    const resetFilters = { versions: [], lastUpdated: 'all' };
    setDraftFilters(resetFilters);
    setAppliedFilters(resetFilters);
    setPage(1);
  };

  const handleApplyFilters = () => {
    const nextFilters = copyFilters(draftFilters);
    setAppliedFilters(nextFilters);
    setDraftFilters(nextFilters);
    setPage(1);
    setFilterOpen(false);
  };

  const handleCancelFilters = () => {
    setDraftFilters(copyFilters(appliedFilters));
    setFilterOpen(false);
  };

  const handleAddClick = () => {
    navigate('/guideline/add');
  };

  const handleEditClick = useCallback((guideline) => {
    navigate(`/guideline/edit/${guideline.id}`, { state: { guideline } });
  }, [navigate]);

  const columns = useMemo(() => getGuidelineColumns({ onEdit: handleEditClick }), [handleEditClick]);

  const startItem = totalItems === 0 ? 0 : (page - 1) * PAGE_SIZE + 1;
  const endItem = Math.min(page * PAGE_SIZE, totalItems);

  const tableFooter = (
    <div className="guideline-list-footer flex flex-row items-center justify-between px-6 w-full h-[50px]">
      <span className="guideline-list-summary">
        Showing <strong>{startItem}-{endItem}</strong> of <strong>{totalItems}</strong> guidelines
      </span>
      <Pagination
        page={page}
        totalPages={totalPages}
        totalItems={totalItems}
        pageSize={PAGE_SIZE}
        onPageChange={setPage}
        hideLabel={true}
        showWhenEmpty={true}
        className="guideline-list-pagination border-none bg-transparent p-0 m-0"
      />
    </div>
  );

  return (
    <div className="guideline-list-page flex flex-col gap-2 w-full">
      <GuidelineHeader
        totalDocuments={totalItems}
        onAddClick={handleAddClick}
      />

      <GuidelineToolbar
        searchQuery={searchQuery}
        onSearchChange={(value) => {
          setSearchQuery(value);
          setPage(1);
        }}
        versions={versions}
        draftFilters={draftFilters}
        onDraftFiltersChange={setDraftFilters}
        onResetFilters={handleResetFilters}
        onApplyFilters={handleApplyFilters}
        onCancelFilters={handleCancelFilters}
        filterOpen={filterOpen}
        onFilterOpenChange={handleFilterOpenChange}
      />

      <DataTable
        columns={columns}
        rows={guidelines}
        loading={loading}
        error={error}
        emptyMessage="No guidelines found"
        fitHeight={true}
        card={true}
        cardClassName="guideline-list-table"
        gridClassName="guideline-list-grid"
        headerClassName="guideline-list-header"
        bodyClassName="guideline-list-body"
        rowClassName="guideline-list-row"
        rowsPerPage={PAGE_SIZE}
        footer={tableFooter}
      />
    </div>
  );
}
