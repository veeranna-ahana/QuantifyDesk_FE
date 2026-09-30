import React, { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Pagination } from '@/components/ui/Pagination';
import { DataTable } from '@/components/ui/Table';

import { useGuidelines } from '../hooks/useGuidelines';
import { GuidelineHeader } from '../components/GuidelineHeader';
import { GuidelineToolbar } from '../components/GuidelineToolbar';
import { getGuidelineColumns } from '../components/guidelineColumns';
import { PAGE_SIZE } from '../constants';

export function GuidelinePage() {
  const navigate = useNavigate();
  const {
    guidelines,
    totalItems,
    totalPages,
    loading,
    error,
    page,
    setPage,
    searchQuery,
    setSearchQuery,
    filter,
    setFilter,
  } = useGuidelines();

  const handleAddClick = () => {
    navigate('/guideline/add');
  };

  const handleEditClick = (guideline) => {
    navigate(`/guideline/edit/${guideline.id}`, { state: { guideline } });
  };

  const columns = useMemo(() => getGuidelineColumns({ onEdit: handleEditClick }), []);

  const startItem = totalItems === 0 ? 0 : (page - 1) * PAGE_SIZE + 1;
  const endItem = Math.min(page * PAGE_SIZE, totalItems);

  const tableFooter = (
    <div className="flex flex-row items-center justify-between px-6 w-full h-[50px]">
      <span className="text-[14px] font-medium text-[#64748B]">
        Showing <strong className="font-bold text-[#1E293B]">{startItem}-{endItem}</strong> of {totalItems} guidelines
      </span>
      <Pagination
        page={page}
        totalPages={totalPages}
        totalItems={totalItems}
        pageSize={PAGE_SIZE}
        onPageChange={setPage}
        hideLabel={true}
        showEllipsis={true}
        className="border-none bg-transparent p-0 m-0"
      />
    </div>
  );

  return (
    <div className="flex flex-col gap-2 w-full h-full min-h-0">
      <GuidelineHeader
        totalDocuments={totalItems}
        onAddClick={handleAddClick}
      />

      <GuidelineToolbar
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        filterOption={filter}
        onFilterChange={setFilter}
      />

      <DataTable
        columns={columns}
        rows={guidelines}
        loading={loading}
        error={error}
        emptyMessage="No guidelines found."
        fitHeight={true}
        card={true}
        footer={tableFooter}
      />
    </div>
  );
}
