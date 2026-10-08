// src/features/server-information/ServerInformationPage.jsx
import { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Download, Plus } from 'lucide-react';
import toast from 'react-hot-toast';

import { PageHeader } from '@/components/layout/PageHeader';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Pagination } from '@/components/ui/Pagination';

import { ServerFilterBar } from './components/ServerFilterBar';
import { ServerTable } from './components/ServerTable';
import { useServerInformation } from './hooks/useServerInformation';

export default function ServerInformationPage() {
  const navigate = useNavigate();
  const { state } = useLocation();

  const {
    servers,
    searchQuery,
    setSearchQuery,
    page,
    setPage,
    totalPages,
    totalItems,
    pageSize,
    activeCount,
  } = useServerInformation();

  // Show a success toast when navigated back from the Add/Edit form
  useEffect(() => {
    if (state?.successMessage) {
      toast.success(state.successMessage);
      window.history.replaceState({}, '');
    }
  }, [state]);

  const handleAddServer = () => navigate('/server-information/add');

  const handleEditServer = (server) =>
    navigate(`/server-information/${server.id}/edit`, { state: { server } });

  return (
    <div className="flex w-full flex-col gap-2">
      <PageHeader
        titleClassName="text-2xl font-bold leading-[38px] text-[#0B1C30]"
        actionsClassName="gap-2.5"
        title={
          <span className="inline-flex items-center gap-3">
            Server Information
            <span className="inline-flex h-[22px] items-center gap-1.5 rounded-full bg-[#E4E9EE] px-2.5 py-0.5 text-xs font-normal text-[#002045]">
              <span className="h-1.5 w-1.5 rounded-full bg-[#4CADAB]" aria-hidden="true" />
              {activeCount} Active Hosts
            </span>
          </span>
        }
        actions={
          <>
            <Button
              variant="secondary"
              size="md"
              className="border-action-primary bg-surface-card px-3.5 text-action-primary shadow-[var(--shadow-1)] hover:bg-action-primary-soft"
              leftIcon={<Download className="h-3 w-3" />}
            >
              Export CSV
            </Button>
            <Button
              variant="primary"
              size="md"
              leftIcon={<Plus className="h-[10.5px] w-[10.5px]" />}
              onClick={handleAddServer}
              className="shadow-[var(--shadow-1)]"
            >
              Add Server
            </Button>
          </>
        }
      />

      <ServerFilterBar
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
      />

      <Card className="overflow-hidden rounded-none border-0 bg-transparent shadow-none">
        <ServerTable
          servers={servers}
          loading={false}
          pageSize={pageSize}
          onEdit={handleEditServer}
        />
        <Pagination
          page={page}
          totalPages={totalPages}
          totalItems={totalItems}
          pageSize={pageSize}
          onPageChange={setPage}
          itemLabel="Servers"
          className="py-2 [&_b]:font-medium [&_button]:rounded-lg [&>span]:text-sm [&>span]:leading-5"
        />
      </Card>
    </div>
  );
}
