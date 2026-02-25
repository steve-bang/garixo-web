'use client';

import { Plus, Upload } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { AdjustStockModal } from '@/features/inventory/components/adjust-stock-modal';
import { DeleteItemModal } from '@/features/inventory/components/delete-item-modal';
import { InventoryDrawer } from '@/features/inventory/components/inventory-drawer';
import { InventoryFilters } from '@/features/inventory/components/inventory-filters';
import { InventoryKpiRow } from '@/features/inventory/components/inventory-kpi-row';
import { InventorySkeleton } from '@/features/inventory/components/inventory-skeleton';
import { InventoryTable } from '@/features/inventory/components/inventory-table';
import {
  toInventoryKpis,
  useAdjustInventory,
  useCreateInventoryItem,
  useDeleteInventoryItem,
  useInventory,
  useUpdateInventoryItem
} from '@/features/inventory/hooks';
import type { CreateInventoryInput } from '@/features/inventory/schema';
import type {
  InventoryCategory,
  InventoryItem,
  StockStatus
} from '@/features/inventory/types';
import type { Role } from '@/types/primitives';

const currentUserRole: Role = 'OWNER';
const pageSize = 20;

type DrawerState = {
  open: boolean;
  mode: 'create' | 'edit';
  item: InventoryItem | null;
};

export function InventoryManagementPage(): JSX.Element {
  const toast = useToast();

  const [searchInput, setSearchInput] = useState('');
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState<InventoryCategory | undefined>();
  const [stockStatus, setStockStatus] = useState<StockStatus | undefined>();
  const [sort, setSort] = useState<
    'default' | 'name_asc' | 'name_desc' | 'quantity_asc' | 'quantity_desc'
  >('default');
  const [page, setPage] = useState(1);
  const [drawerState, setDrawerState] = useState<DrawerState>({
    open: false,
    mode: 'create',
    item: null
  });
  const [adjustTarget, setAdjustTarget] = useState<InventoryItem | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<InventoryItem | null>(null);

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
    stockStatus,
    sort,
    page,
    pageSize
  } as const;
  const listQuery = useInventory(listParams);
  const kpiQuery = useInventory({
    search,
    category,
    stockStatus,
    sort,
    page: 1,
    pageSize: 20
  });

  const createMutation = useCreateInventoryItem();
  const updateMutation = useUpdateInventoryItem();
  const deleteMutation = useDeleteInventoryItem();
  const adjustMutation = useAdjustInventory();

  const listItems = listQuery.data?.items ?? [];
  const meta = listQuery.data?.meta;
  const kpiItems = kpiQuery.data?.items ?? [];
  const kpis = useMemo(() => toInventoryKpis(kpiItems), [kpiItems]);

  const handleSaveItem = async (payload: CreateInventoryInput) => {
    if (drawerState.mode === 'create') {
      await createMutation.mutateAsync(payload);
      toast.success('Item saved successfully.');
      setDrawerState((prev) => ({ ...prev, open: false }));
      return;
    }

    if (!drawerState.item) {
      return;
    }

    await updateMutation.mutateAsync({ id: drawerState.item.id, payload });
    toast.success('Item updated successfully.');
    setDrawerState((prev) => ({ ...prev, open: false, item: null }));
  };

  const handleAdjustStock = async (payload: {
    id: string;
    type: 'ADD' | 'REDUCE';
    amount: number;
    reason?: string;
  }) => {
    await adjustMutation.mutateAsync(payload);
    toast.success('Stock updated successfully.');
    setAdjustTarget(null);
  };

  const handleDelete = async (id: string) => {
    await deleteMutation.mutateAsync(id);
    toast.success('Item deleted successfully.');
    setDeleteTarget(null);
  };

  if (listQuery.isLoading || kpiQuery.isLoading) {
    return <InventorySkeleton />;
  }

  if (listQuery.isError || kpiQuery.isError) {
    return (
      <Card className="m-s8 p-s6">
        <p className="text-small text-state-error">
          Could not load inventory data.
        </p>
      </Card>
    );
  }

  return (
    <div className="space-y-s6 p-s8">
      <header className="flex flex-col items-start justify-between gap-s3 md:flex-row md:items-center">
        <div>
          <h1 className="text-h1">Inventory</h1>
          <p className="text-small text-text-muted">
            Manage parts and supplies in your garage.
          </p>
        </div>

        <div className="flex flex-wrap gap-s2">
          <Button variant="secondary">
            <Upload className="size-4" />
            Import
          </Button>
          <Button
            onClick={() =>
              setDrawerState({ open: true, mode: 'create', item: null })
            }
          >
            <Plus className="size-4" />
            Add Item
          </Button>
        </div>
      </header>

      <InventoryKpiRow kpis={kpis} />

      <InventoryFilters
        searchInput={searchInput}
        category={category}
        stockStatus={stockStatus}
        sort={sort}
        onSearchInputChange={setSearchInput}
        onCategoryChange={(value) => {
          setCategory(value);
          setPage(1);
        }}
        onStockStatusChange={(value) => {
          setStockStatus(value);
          setPage(1);
        }}
        onSortChange={(value) => {
          setSort(value);
          setPage(1);
        }}
        onClear={() => {
          setSearchInput('');
          setSearch('');
          setCategory(undefined);
          setStockStatus(undefined);
          setSort('default');
          setPage(1);
        }}
      />

      <InventoryTable
        items={listItems}
        currentUserRole={currentUserRole}
        onAddFirst={() =>
          setDrawerState({ open: true, mode: 'create', item: null })
        }
        onEdit={(item) => setDrawerState({ open: true, mode: 'edit', item })}
        onAdjust={setAdjustTarget}
        onDelete={setDeleteTarget}
      />

      {meta ? (
        <div className="flex items-center justify-between gap-s2">
          <p className="text-small text-text-muted">
            Page {meta.page} of {meta.totalPages} ({meta.total} items)
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

      <InventoryDrawer
        open={drawerState.open}
        mode={drawerState.mode}
        item={drawerState.item}
        onClose={() =>
          setDrawerState((prev) => ({ ...prev, open: false, item: null }))
        }
        onSubmit={handleSaveItem}
      />

      <AdjustStockModal
        open={Boolean(adjustTarget)}
        item={adjustTarget}
        onClose={() => setAdjustTarget(null)}
        onConfirm={handleAdjustStock}
      />

      <DeleteItemModal
        open={Boolean(deleteTarget)}
        item={deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
      />
    </div>
  );
}
