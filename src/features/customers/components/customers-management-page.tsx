'use client';

import { Plus } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';

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

type DrawerState = {
  open: boolean;
  mode: DrawerMode;
  customer: Customer | null;
};

export function CustomersManagementPage(): JSX.Element {
  const toast = useToast();

  const [searchInput, setSearchInput] = useState('');
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState<CustomerStatus | undefined>();
  const [spendingTier, setSpendingTier] = useState<SpendingTier | undefined>();
  const [page, setPage] = useState(1);

  const [drawerState, setDrawerState] = useState<DrawerState>({
    open: false,
    mode: 'view',
    customer: null
  });
  const [deleteTarget, setDeleteTarget] = useState<Customer | null>(null);
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

  const listParams = { search, status, spendingTier, page, pageSize } as const;
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
          setStatus(value);
          setPage(1);
        }}
        onSpendingTierChange={(value) => {
          setSpendingTier(value);
          setPage(1);
        }}
        onRemoveStatus={() => {
          setStatus(undefined);
          setPage(1);
        }}
        onRemoveSpendingTier={() => {
          setSpendingTier(undefined);
          setPage(1);
        }}
        onClear={() => {
          setSearchInput('');
          setSearch('');
          setStatus(undefined);
          setSpendingTier(undefined);
          setPage(1);
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
