'use client';

import { Plus } from 'lucide-react';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';

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
  useVehicleWorkOrderHistory
} from '@/features/vehicles/hooks';
import type { CreateVehicleInput } from '@/features/vehicles/schema';
import type { Vehicle, VehicleStatus } from '@/features/vehicles/types';
import { useToast } from '@/hooks/use-toast';
import type { Role } from '@/types/primitives';

type DrawerMode = 'view' | 'create' | 'edit';

type BrandFilter = 'TOYOTA' | 'HONDA' | 'HYUNDAI' | 'FORD' | 'OTHER';
type QueryValue = string | null | undefined;

const currentUserRole: Role = 'OWNER';
const pageSize = 20;
const validBrands: BrandFilter[] = [
  'TOYOTA',
  'HONDA',
  'HYUNDAI',
  'FORD',
  'OTHER'
];
const validVehicleStatuses: VehicleStatus[] = [
  'ACTIVE',
  'IN_SERVICE',
  'COMPLETED',
  'OVERDUE',
  'INACTIVE'
];

type DrawerState = {
  open: boolean;
  mode: DrawerMode;
  vehicle: Vehicle | null;
};

function parsePositiveInt(value: string | null, fallback = 1): number {
  if (!value) {
    return fallback;
  }

  const parsed = Number(value);
  if (!Number.isInteger(parsed) || parsed < 1) {
    return fallback;
  }

  return parsed;
}

function toQueryStringValue(value: QueryValue): string | undefined {
  if (value === null || value === undefined) {
    return undefined;
  }

  const normalized = value.trim();
  return normalized ? normalized : undefined;
}

function parseBrand(value: string | null): BrandFilter | undefined {
  if (!value) {
    return undefined;
  }

  return validBrands.includes(value as BrandFilter)
    ? (value as BrandFilter)
    : undefined;
}

function parseVehicleStatus(value: string | null): VehicleStatus | undefined {
  if (!value) {
    return undefined;
  }

  return validVehicleStatuses.includes(value as VehicleStatus)
    ? (value as VehicleStatus)
    : undefined;
}

export function VehiclesManagementPage(): JSX.Element {
  const toast = useToast();
  const pathname = usePathname();
  const router = useRouter();
  const searchParams = useSearchParams();

  const [searchInput, setSearchInput] = useState('');
  const [shouldLoadCustomers, setShouldLoadCustomers] = useState(false);
  const [drawerState, setDrawerState] = useState<DrawerState>({
    open: false,
    mode: 'view',
    vehicle: null
  });
  const [deleteTarget, setDeleteTarget] = useState<Vehicle | null>(null);
  const [highlightedId, setHighlightedId] = useState<string | null>(null);

  const search = toQueryStringValue(searchParams.get('search')) ?? '';
  const brand = parseBrand(searchParams.get('brand'));
  const status = parseVehicleStatus(searchParams.get('status'));
  const customerId = toQueryStringValue(searchParams.get('customerId'));
  const page = parsePositiveInt(searchParams.get('page'), 1);

  const setQueryParams = useCallback(
    (updates: Record<string, QueryValue>) => {
      const nextParams = new URLSearchParams(searchParams.toString());

      Object.entries(updates).forEach(([key, value]) => {
        const normalized = toQueryStringValue(value);
        if (!normalized) {
          nextParams.delete(key);
          return;
        }

        nextParams.set(key, normalized);
      });

      const nextQuery = nextParams.toString();
      const currentQuery = searchParams.toString();
      if (nextQuery === currentQuery) {
        return;
      }

      router.replace(nextQuery ? `${pathname}?${nextQuery}` : pathname, {
        scroll: false
      });
    },
    [pathname, router, searchParams]
  );

  const setQueryPage = useCallback(
    (nextPage: number) => {
      setQueryParams({ page: nextPage <= 1 ? undefined : String(nextPage) });
    },
    [setQueryParams]
  );

  useEffect(() => {
    setSearchInput(search);
  }, [search]);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      if (searchInput.trim() === search) {
        return;
      }

      setQueryParams({
        search: searchInput,
        page: '1'
      });
    }, 300);

    return () => window.clearTimeout(timer);
  }, [search, searchInput, setQueryParams]);

  useEffect(() => {
    if (!highlightedId) {
      return;
    }

    const timer = window.setTimeout(() => setHighlightedId(null), 2000);
    return () => window.clearTimeout(timer);
  }, [highlightedId]);

  const listParams = useMemo(
    () =>
      ({
        search: search || undefined,
        brand,
        status,
        customerId,
        page,
        pageSize
      }) as const,
    [brand, customerId, page, search, status]
  );
  const listQuery = useVehicles(listParams);

  const detailQuery = useVehicleDetail(drawerState.vehicle?.id);
  const historyQuery = useVehicleWorkOrderHistory(drawerState.vehicle?.id);
  const customersQuery = useCustomers(
    { page: 1, pageSize: 100 },
    {
      enabled: shouldLoadCustomers || Boolean(customerId) || drawerState.open
    }
  );

  const createMutation = useCreateVehicle();
  const updateMutation = useUpdateVehicle();
  const deleteMutation = useDeleteVehicle();

  const listItems = listQuery.data?.items ?? [];
  const meta = listQuery.data?.meta;
  const kpis = useVehicleKpis(listItems);
  const isTableUpdating =
    (listQuery.isFetching && !listQuery.isLoading) ||
    createMutation.isPending ||
    updateMutation.isPending ||
    deleteMutation.isPending;

  const openCreate = () => {
    setShouldLoadCustomers(true);
    setDrawerState({ open: true, mode: 'create', vehicle: null });
  };
  const openView = (vehicle: Vehicle) =>
    setDrawerState({ open: true, mode: 'view', vehicle });
  const openEdit = (vehicle: Vehicle) => {
    setShouldLoadCustomers(true);
    setDrawerState({ open: true, mode: 'edit', vehicle });
  };
  const closeDrawer = () =>
    setDrawerState((prev) => ({ ...prev, open: false, vehicle: null }));

  const handleSave = async (payload: CreateVehicleInput) => {
    if (drawerState.mode === 'create') {
      const created = await createMutation.mutateAsync(payload);
      await listQuery.refetch();
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
    await listQuery.refetch();
    setHighlightedId(updated.id);
    closeDrawer();
    toast.success('Vehicle updated successfully.');
  };

  const handleDelete = async (id: string) => {
    await deleteMutation.mutateAsync(id);
    await listQuery.refetch();
    setDeleteTarget(null);
    toast.success('Vehicle deleted successfully.');
  };

  if (listQuery.isLoading) {
    return <VehiclesSkeleton />;
  }

  if (listQuery.isError) {
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
          setQueryParams({
            brand: value,
            page: '1'
          });
        }}
        onStatusChange={(value) => {
          setQueryParams({
            status: value,
            page: '1'
          });
        }}
        onCustomerChange={(value) => {
          setQueryParams({
            customerId: value,
            page: '1'
          });
        }}
        onCustomerFilterOpen={() => setShouldLoadCustomers(true)}
        onClear={() => {
          setSearchInput('');
          setQueryParams({
            search: undefined,
            brand: undefined,
            status: undefined,
            customerId: undefined,
            page: undefined
          });
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
              onClick={() => setQueryPage(Math.max(meta.page - 1, 1))}
            >
              Previous
            </Button>
            <Badge variant="default">{meta.page}</Badge>
            <Button
              variant="secondary"
              size="sm"
              disabled={meta.page >= meta.totalPages}
              onClick={() =>
                setQueryPage(Math.min(meta.page + 1, meta.totalPages))
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
        history={historyQuery.data}
        loadingDetail={detailQuery.isLoading || historyQuery.isLoading}
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
