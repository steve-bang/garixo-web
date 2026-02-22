'use client';

import { Plus } from 'lucide-react';
import { JSX, useEffect, useMemo, useState } from 'react';

import { LoadingState } from '@/components/common/loading-state';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { BulkUpdateModal } from '@/features/services/components/bulk-update-modal';
import { DeleteServiceModal } from '@/features/services/components/delete-service-modal';
import { ServiceDrawer } from '@/features/services/components/service-drawer';
import { ServicesFilters } from '@/features/services/components/services-filters';
import { ServicesKpiRow } from '@/features/services/components/services-kpi-row';
import { ServicesTable } from '@/features/services/components/services-table';
import {
  toServiceKpis,
  useBulkUpdateServices,
  useCreateService,
  useDeleteService,
  useServices,
  useUpdateService
} from '@/features/services/hooks';
import type { CreateServiceInput } from '@/features/services/schema';
import type {
  Service,
  ServiceCategory,
  ServiceStatus
} from '@/features/services/types';

const pageSize = 20;

type DrawerState = {
  open: boolean;
  mode: 'create' | 'edit' | 'duplicate';
  service: Service | null;
};

export function ServicesManagementPage(): JSX.Element {
  const toast = useToast();

  const [searchInput, setSearchInput] = useState('');
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState<ServiceCategory | undefined>();
  const [status, setStatus] = useState<ServiceStatus | undefined>();
  const [page, setPage] = useState(1);
  const [sort] = useState<'default'>('default');
  const [drawerState, setDrawerState] = useState<DrawerState>({
    open: false,
    mode: 'create',
    service: null
  });
  const [bulkOpen, setBulkOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<Service | null>(null);
  const [highlightedId, setHighlightedId] = useState<string | null>(null);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      setSearch(searchInput.trim());
      setPage(1);
    }, 300);

    return () => window.clearTimeout(timer);
  }, [searchInput]);

  const listParams = {
    search,
    category,
    status,
    page,
    pageSize,
    sort
  } as const;
  const listQuery = useServices(listParams);
  const kpiQuery = useServices({
    search,
    category,
    status,
    page: 1,
    pageSize: 20,
    sort
  });

  const createMutation = useCreateService();
  const updateMutation = useUpdateService();
  const deleteMutation = useDeleteService();
  const bulkMutation = useBulkUpdateServices();

  const listItems = listQuery.data?.items ?? [];
  const kpiItems = kpiQuery.data?.items ?? [];
  const meta = listQuery.data?.meta;
  const kpis = useMemo(() => toServiceKpis(kpiItems), [kpiItems]);
  const isTableRefreshing = listQuery.isFetching && !listQuery.isLoading;

  useEffect(() => {
    if (!highlightedId) {
      return;
    }

    const timer = window.setTimeout(() => {
      setHighlightedId(null);
    }, 2000);

    return () => window.clearTimeout(timer);
  }, [highlightedId]);

  const openCreateDrawer = () =>
    setDrawerState({ open: true, mode: 'create', service: null });
  const openEditDrawer = (service: Service) =>
    setDrawerState({ open: true, mode: 'edit', service });
  const openDuplicateDrawer = (service: Service) =>
    setDrawerState({ open: true, mode: 'duplicate', service });

  const closeDrawer = () =>
    setDrawerState((prev) => ({ ...prev, open: false }));

  const refreshServicesData = async (): Promise<void> => {
    await Promise.all([listQuery.refetch(), kpiQuery.refetch()]);
  };

  const handleDrawerSubmit = async (payload: CreateServiceInput) => {
    if (drawerState.mode === 'create' || drawerState.mode === 'duplicate') {
      const created = await createMutation.mutateAsync(payload);
      setHighlightedId(created.id);
      toast.success('Service saved successfully.');
      closeDrawer();
      await refreshServicesData();
      return;
    }

    if (!drawerState.service) {
      return;
    }

    const updated = await updateMutation.mutateAsync({
      id: drawerState.service.id,
      payload
    });
    setHighlightedId(updated.id);
    toast.success('Service updated successfully.');
    closeDrawer();
    await refreshServicesData();
  };

  const handleToggleStatus = async (service: Service) => {
    const nextStatus: ServiceStatus =
      service.status === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE';
    await updateMutation.mutateAsync({
      id: service.id,
      payload: { status: nextStatus }
    });
    toast.success(
      nextStatus === 'ACTIVE' ? 'Service activated.' : 'Service deactivated.'
    );
  };

  const handleDelete = async (id: string) => {
    await deleteMutation.mutateAsync(id);
    toast.success('Service deleted successfully.');
    setDeleteTarget(null);
    await refreshServicesData();
  };

  const handleBulkUpdate = async (percentage: number) => {
    await bulkMutation.mutateAsync({ percentage });
    toast.success('Prices updated successfully.');
    setBulkOpen(false);
  };

  if (listQuery.isLoading || kpiQuery.isLoading) {
    return <LoadingState label="Loading services..." />;
  }

  if (listQuery.isError || kpiQuery.isError) {
    return (
      <Card className="p-s6">
        <p className="text-small text-state-error">Could not load services.</p>
      </Card>
    );
  }

  return (
    <div className="space-y-s6 p-s8">
      <header className="flex flex-col items-start justify-between gap-s3 md:flex-row md:items-center">
        <div>
          <h1 className="text-h1">Services Management</h1>
          <p className="text-small text-text-muted">
            Manage service pricing and availability.
          </p>
        </div>

        <div className="flex flex-wrap gap-s2">
          <Button variant="secondary" onClick={() => setBulkOpen(true)}>
            Bulk Update Price
          </Button>
          <Button onClick={openCreateDrawer}>
            <Plus className="size-4" />
            Add Service
          </Button>
        </div>
      </header>

      <ServicesKpiRow kpis={kpis} />

      <ServicesFilters
        searchInput={searchInput}
        onSearchInputChange={setSearchInput}
        category={category}
        status={status}
        onCategoryChange={(value) => {
          setCategory(value);
          setPage(1);
        }}
        onStatusChange={(value) => {
          setStatus(value);
          setPage(1);
        }}
        onRemoveCategory={() => {
          setCategory(undefined);
          setPage(1);
        }}
        onRemoveStatus={() => {
          setStatus(undefined);
          setPage(1);
        }}
        onClear={() => {
          setSearchInput('');
          setSearch('');
          setCategory(undefined);
          setStatus(undefined);
          setPage(1);
        }}
      />

      <ServicesTable
        loading={isTableRefreshing}
        services={listItems}
        highlightedId={highlightedId}
        onAddFirst={openCreateDrawer}
        onEdit={openEditDrawer}
        onDuplicate={openDuplicateDrawer}
        onDelete={(service) => setDeleteTarget(service)}
        onToggleStatus={handleToggleStatus}
      />

      {meta ? (
        <div className="flex items-center justify-between gap-s2">
          <p className="text-small text-text-muted">
            Page {meta.page} of {meta.totalPages} ({meta.total} services)
          </p>
          <div className="flex items-center gap-s2">
            <Button
              variant="secondary"
              size="sm"
              disabled={meta.page <= 1}
              onClick={() => setPage((prev) => Math.max(prev - 1, 1))}
            >
              Previous
            </Button>
            <Badge variant="default">{meta.page}</Badge>
            <Button
              variant="secondary"
              size="sm"
              disabled={meta.page >= meta.totalPages}
              onClick={() =>
                setPage((prev) => Math.min(prev + 1, meta.totalPages))
              }
            >
              Next
            </Button>
          </div>
        </div>
      ) : null}

      <ServiceDrawer
        open={drawerState.open}
        mode={drawerState.mode}
        service={drawerState.service}
        onClose={closeDrawer}
        onSubmit={handleDrawerSubmit}
      />

      <DeleteServiceModal
        open={Boolean(deleteTarget)}
        service={deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
      />

      <BulkUpdateModal
        open={bulkOpen}
        services={kpiItems}
        onClose={() => setBulkOpen(false)}
        onConfirm={handleBulkUpdate}
      />
    </div>
  );
}
