'use client';

import { Plus } from 'lucide-react';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { CustomerDrawer } from '@/features/customers/components/customer-drawer';
import { CustomersFilters } from '@/features/customers/components/customers-filters';
import { CustomersKpiRow } from '@/features/customers/components/customers-kpi-row';
import { CustomersSkeleton } from '@/features/customers/components/customers-skeleton';
import { CustomersTable } from '@/features/customers/components/customers-table';
import { DeleteCustomerModal } from '@/features/customers/components/delete-customer-modal';
import {
  toCustomerKpis,
  useCreateCustomer,
  useCustomerDetail,
  useCustomers,
  useDeleteCustomer,
  useUpdateCustomer
} from '@/features/customers/hooks';
import type { CreateCustomerInput } from '@/features/customers/schema';
import type {
  Customer,
  CustomerStatus,
  SpendingTier
} from '@/features/customers/types';
import { useToast } from '@/hooks/use-toast';
import type { Role } from '@/types/primitives';

type DrawerMode = 'view' | 'create' | 'edit';

const currentUserRole: Role = 'OWNER';
const pageSize = 20;
const validCustomerStatuses: CustomerStatus[] = ['ACTIVE', 'INACTIVE', 'VIP'];
const validSpendingTiers: SpendingTier[] = ['LOW', 'MEDIUM', 'HIGH'];

type QueryValue = string | null | undefined;

type DrawerState = {
  open: boolean;
  mode: DrawerMode;
  customer: Customer | null;
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

function parseCustomerStatus(value: string | null): CustomerStatus | undefined {
  if (!value) {
    return undefined;
  }

  return validCustomerStatuses.includes(value as CustomerStatus)
    ? (value as CustomerStatus)
    : undefined;
}

function parseSpendingTier(value: string | null): SpendingTier | undefined {
  if (!value) {
    return undefined;
  }

  return validSpendingTiers.includes(value as SpendingTier)
    ? (value as SpendingTier)
    : undefined;
}

export function CustomersManagementPage(): JSX.Element {
  const toast = useToast();
  const pathname = usePathname();
  const router = useRouter();
  const searchParams = useSearchParams();

  const [searchInput, setSearchInput] = useState('');

  const [drawerState, setDrawerState] = useState<DrawerState>({
    open: false,
    mode: 'view',
    customer: null
  });
  const [deleteTarget, setDeleteTarget] = useState<Customer | null>(null);
  const [highlightedId, setHighlightedId] = useState<string | null>(null);

  const search = toQueryStringValue(searchParams.get('search')) ?? '';
  const status = parseCustomerStatus(searchParams.get('status'));
  const spendingTier = parseSpendingTier(searchParams.get('spendingTier'));
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
        status,
        spendingTier,
        page,
        pageSize
      }) as const,
    [page, search, spendingTier, status]
  );
  const listQuery = useCustomers(listParams);

  const detailQuery = useCustomerDetail(drawerState.customer?.id);

  const createMutation = useCreateCustomer();
  const updateMutation = useUpdateCustomer();
  const deleteMutation = useDeleteCustomer();

  const listItems = listQuery.data?.items ?? [];
  const meta = listQuery.data?.meta;
  const kpis = useMemo(() => toCustomerKpis(listItems), [listItems]);
  const isTableUpdating =
    (listQuery.isFetching && !listQuery.isLoading) ||
    createMutation.isPending ||
    updateMutation.isPending ||
    deleteMutation.isPending;

  const openCreate = () =>
    setDrawerState({ open: true, mode: 'create', customer: null });
  const openView = (customer: Customer) =>
    setDrawerState({ open: true, mode: 'view', customer });
  const openEdit = (customer: Customer) =>
    setDrawerState({ open: true, mode: 'edit', customer });
  const closeDrawer = () =>
    setDrawerState((prev) => ({ ...prev, open: false, customer: null }));

  const handleCopyPhone = async (phone: string) => {
    try {
      await navigator.clipboard.writeText(phone);
      toast.success('Phone copied.');
    } catch {
      toast.error('Could not copy phone.');
    }
  };

  const handleDrawerSubmit = async (payload: CreateCustomerInput) => {
    if (drawerState.mode === 'create') {
      const created = await createMutation.mutateAsync(payload);
      await listQuery.refetch();
      setHighlightedId(created.id);
      closeDrawer();
      toast.success('Customer added successfully.');
      return;
    }

    if (!drawerState.customer) {
      return;
    }

    const updated = await updateMutation.mutateAsync({
      id: drawerState.customer.id,
      payload
    });
    await listQuery.refetch();
    setHighlightedId(updated.id);
    closeDrawer();
    toast.success('Information updated.');
  };

  const handleDelete = async (id: string) => {
    await deleteMutation.mutateAsync(id);
    await listQuery.refetch();
    setDeleteTarget(null);
    toast.success('Customer deleted successfully.');
  };

  if (listQuery.isLoading) {
    return <CustomersSkeleton />;
  }

  if (listQuery.isError) {
    return (
      <Card className="m-s8 p-s6">
        <p className="text-small text-state-error">
          Could not load customer data.
        </p>
      </Card>
    );
  }

  return (
    <div className="space-y-s6 p-s8">
      <header className="flex flex-col items-start justify-between gap-s3 md:flex-row md:items-center">
        <div>
          <h1 className="text-h1">Customers</h1>
          <p className="text-small text-text-muted">
            Manage customer information and service history.
          </p>
        </div>

        <Button onClick={openCreate}>
          <Plus className="size-4" />
          Add Customer
        </Button>
      </header>

      <CustomersKpiRow kpis={kpis} />

      <CustomersFilters
        searchInput={searchInput}
        status={status}
        spendingTier={spendingTier}
        onSearchInputChange={setSearchInput}
        onStatusChange={(value) => {
          setQueryParams({
            status: value,
            page: '1'
          });
        }}
        onSpendingTierChange={(value) => {
          setQueryParams({
            spendingTier: value,
            page: '1'
          });
        }}
        onRemoveStatus={() => {
          setQueryParams({
            status: undefined,
            page: '1'
          });
        }}
        onRemoveSpendingTier={() => {
          setQueryParams({
            spendingTier: undefined,
            page: '1'
          });
        }}
        onClear={() => {
          setSearchInput('');
          setQueryParams({
            search: undefined,
            status: undefined,
            spendingTier: undefined,
            page: undefined
          });
        }}
      />

      <CustomersTable
        loading={isTableUpdating}
        customers={listItems}
        currentUserRole={currentUserRole}
        highlightedId={highlightedId}
        onAddFirst={openCreate}
        onView={openView}
        onEdit={openEdit}
        onDelete={setDeleteTarget}
        onCopyPhone={handleCopyPhone}
      />

      {meta ? (
        <div className="flex items-center justify-between gap-s2">
          <p className="text-small text-text-muted">
            Page {meta.page} of {meta.totalPages} ({meta.total} customers)
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

      <CustomerDrawer
        open={drawerState.open}
        mode={drawerState.mode}
        customer={drawerState.customer}
        detail={detailQuery.data}
        loadingDetail={detailQuery.isLoading}
        onClose={closeDrawer}
        onSubmit={handleDrawerSubmit}
      />

      <DeleteCustomerModal
        open={Boolean(deleteTarget)}
        customer={deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
      />
    </div>
  );
}
