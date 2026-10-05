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
    <div className="flex flex-col gap-4">
      <PageHeader
        title={
          <span className="inline-flex items-center gap-3">
            Server Information
            <span className="inline-flex items-center gap-1.5 rounded-full bg-[#E4E9EE] px-2.5 py-1 text-xs font-medium text-[#051A3E]">
              <span className="h-2 w-2 rounded-full bg-[#4CADAB]" aria-hidden="true" />
              {activeCount} Active Hosts
            </span>
          </span>
        }
        actions={
          <>
            <Button
              variant="secondary"
              size="md"
              className="border-[#856BFF] bg-transparent text-[#856BFF] hover:bg-[#856BFF]/5"
              leftIcon={<Download className="h-4 w-4" />}
            >
              Export CSV
            </Button>
            <Button
              variant="primary"
              size="md"
              leftIcon={<Plus className="h-4 w-4" />}
              onClick={handleAddServer}
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

      <Card className="overflow-hidden">
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
        />
      </Card>
    </div>
  );
}
