'use client';

import { Plus } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { DeleteVehicleModal } from '@/features/vehicles/components/delete-vehicle-modal';
import { VehicleDrawer } from '@/features/vehicles/components/vehicle-drawer';
import { VehiclesFilters } from '@/features/vehicles/components/vehicles-filters';
import { VehiclesKpiRow } from '@/features/vehicles/components/vehicles-kpi-row';
import { VehiclesSkeleton } from '@/features/vehicles/components/vehicles-skeleton';
import { VehiclesTable } from '@/features/vehicles/components/vehicles-table';
import { useCustomers } from '@/features/customers/hooks';
import {
  useCreateVehicle,
  useDeleteVehicle,
  useUpdateVehicle,
  useVehicleDetail,
  useVehicleKpis,
  useVehicles,
  useVehicleServices
} from '@/features/vehicles/hooks';
import type { CreateVehicleInput } from '@/features/vehicles/schema';
import type { Vehicle, VehicleStatus } from '@/features/vehicles/types';
import { useToast } from '@/hooks/use-toast';

type UserRole = 'OWNER' | 'MANAGER' | 'STAFF';
type DrawerMode = 'view' | 'create' | 'edit';

type BrandFilter = 'TOYOTA' | 'HONDA' | 'HYUNDAI' | 'FORD' | 'OTHER';

const currentUserRole: UserRole = 'OWNER';
const pageSize = 20;

type DrawerState = {
  open: boolean;
  mode: DrawerMode;
  vehicle: Vehicle | null;
};

export function VehiclesManagementPage(): JSX.Element {
  const toast = useToast();

  const [searchInput, setSearchInput] = useState('');
  const [search, setSearch] = useState('');
  const [brand, setBrand] = useState<BrandFilter | undefined>();
  const [status, setStatus] = useState<VehicleStatus | undefined>();
  const [customerId, setCustomerId] = useState<string | undefined>();
  const [page, setPage] = useState(1);
  const [drawerState, setDrawerState] = useState<DrawerState>({
    open: false,
    mode: 'view',
    vehicle: null
  });
  const [deleteTarget, setDeleteTarget] = useState<Vehicle | null>(null);
  const [highlightedId, setHighlightedId] = useState<string | null>(null);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      setSearch(searchInput.trim());
      setPage(1);
    }, 300);

    return () => window.clearTimeout(timer);
  }, [searchInput]);

  useEffect(() => {
    if (!highlightedId) {
      return;
    }

    const timer = window.setTimeout(() => setHighlightedId(null), 2000);
    return () => window.clearTimeout(timer);
  }, [highlightedId]);

  const listParams = {
    search,
    brand,
    status,
    customerId,
    page,
    pageSize
  } as const;
  const listQuery = useVehicles(listParams);
  const kpiQuery = useVehicles({
    search,
    brand,
    status,
    customerId,
    page: 1,
    pageSize: 100
  });

  const detailQuery = useVehicleDetail(drawerState.vehicle?.id);
  const servicesQuery = useVehicleServices(drawerState.vehicle?.id);
  const customersQuery = useCustomers({ page: 1, pageSize: 100 });

  const createMutation = useCreateVehicle();
  const updateMutation = useUpdateVehicle();
  const deleteMutation = useDeleteVehicle();

  const listItems = listQuery.data?.items ?? [];
  const meta = listQuery.data?.meta;
  const kpis = useVehicleKpis(kpiQuery.data?.items ?? []);
  const isTableUpdating =
    (listQuery.isFetching && !listQuery.isLoading) ||
    createMutation.isPending ||
    updateMutation.isPending ||
    deleteMutation.isPending;

  const openCreate = () =>
    setDrawerState({ open: true, mode: 'create', vehicle: null });
  const openView = (vehicle: Vehicle) =>
    setDrawerState({ open: true, mode: 'view', vehicle });
  const openEdit = (vehicle: Vehicle) =>
    setDrawerState({ open: true, mode: 'edit', vehicle });
  const closeDrawer = () =>
    setDrawerState((prev) => ({ ...prev, open: false, vehicle: null }));

  const handleSave = async (payload: CreateVehicleInput) => {
    if (drawerState.mode === 'create') {
      const created = await createMutation.mutateAsync(payload);
      await Promise.all([listQuery.refetch(), kpiQuery.refetch()]);
      setHighlightedId(created.id);
      closeDrawer();
      toast.success('Vehicle added successfully.');
      return;
    }

    if (!drawerState.vehicle) {
      return;
    }

    const updated = await updateMutation.mutateAsync({
      id: drawerState.vehicle.id,
      payload
    });
    await Promise.all([listQuery.refetch(), kpiQuery.refetch()]);
    setHighlightedId(updated.id);
    closeDrawer();
    toast.success('Vehicle updated successfully.');
  };

  const handleDelete = async (id: string) => {
    await deleteMutation.mutateAsync(id);
    await Promise.all([listQuery.refetch(), kpiQuery.refetch()]);
    setDeleteTarget(null);
    toast.success('Vehicle deleted successfully.');
  };

  if (listQuery.isLoading || kpiQuery.isLoading) {
    return <VehiclesSkeleton />;
  }

  if (listQuery.isError || kpiQuery.isError) {
    return (
      <Card className="m-s8 p-s6">
        <p className="text-small text-state-error">
          Could not load vehicles data.
        </p>
      </Card>
    );
  }

  return (
    <div className="space-y-s6 p-s8">
      <header className="flex flex-col items-start justify-between gap-s3 md:flex-row md:items-center">
        <div>
          <h1 className="text-h1">Vehicles</h1>
          <p className="text-small text-text-muted">
            Manage vehicle records and service history.
          </p>
        </div>

        <Button onClick={openCreate}>
          <Plus className="size-4" />
          Add Vehicle
        </Button>
      </header>

      <VehiclesKpiRow kpis={kpis} />

      <VehiclesFilters
        searchInput={searchInput}
        brand={brand}
        status={status}
        customerId={customerId}
        customers={customersQuery.data?.items ?? []}
        onSearchInputChange={setSearchInput}
        onBrandChange={(value) => {
          setBrand(value);
          setPage(1);
        }}
        onStatusChange={(value) => {
          setStatus(value);
          setPage(1);
        }}
        onCustomerChange={(value) => {
          setCustomerId(value);
          setPage(1);
        }}
        onClear={() => {
          setSearchInput('');
          setSearch('');
          setBrand(undefined);
          setStatus(undefined);
          setCustomerId(undefined);
          setPage(1);
        }}
      />

      <VehiclesTable
        loading={isTableUpdating}
        vehicles={listItems}
        hasQuery={Boolean(search || brand || status || customerId)}
        currentUserRole={currentUserRole}
        highlightedId={highlightedId}
        onAddFirst={openCreate}
        onView={openView}
        onEdit={openEdit}
        onDelete={setDeleteTarget}
      />

      {meta ? (
        <div className="flex items-center justify-between gap-s2">
          <p className="text-small text-text-muted">
            Page {meta.page} of {meta.totalPages} ({meta.total} vehicles)
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

      <VehicleDrawer
        open={drawerState.open}
        mode={drawerState.mode}
        vehicle={drawerState.vehicle}
        detail={detailQuery.data}
        services={servicesQuery.data}
        loadingDetail={detailQuery.isLoading || servicesQuery.isLoading}
        customers={customersQuery.data?.items ?? []}
        onClose={closeDrawer}
        onSubmit={handleSave}
      />

      <DeleteVehicleModal
        open={Boolean(deleteTarget)}
        vehicle={deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
      />
    </div>
  );
}
