'use client';

import { Plus, Upload } from 'lucide-react';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';

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
const validInventoryCategories: InventoryCategory[] = [
  'ENGINE',
  'OIL',
  'TIRE',
  'BRAKE',
  'ELECTRICAL'
];
const validStockStatuses: StockStatus[] = [
  'IN_STOCK',
  'LOW_STOCK',
  'OUT_OF_STOCK'
];
const validSortValues = [
  'default',
  'name_asc',
  'name_desc',
  'quantity_asc',
  'quantity_desc'
] as const;
type SortValue = (typeof validSortValues)[number];
type QueryValue = string | null | undefined;

type DrawerState = {
  open: boolean;
  mode: 'create' | 'edit';
  item: InventoryItem | null;
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

function parseInventoryCategory(
  value: string | null
): InventoryCategory | undefined {
  if (!value) {
    return undefined;
  }

  return validInventoryCategories.includes(value as InventoryCategory)
    ? (value as InventoryCategory)
    : undefined;
}

function parseStockStatus(value: string | null): StockStatus | undefined {
  if (!value) {
    return undefined;
  }

  return validStockStatuses.includes(value as StockStatus)
    ? (value as StockStatus)
    : undefined;
}

function parseSort(value: string | null): SortValue {
  if (!value) {
    return 'default';
  }

  return validSortValues.includes(value as SortValue)
    ? (value as SortValue)
    : 'default';
}

export function InventoryManagementPage(): JSX.Element {
  const toast = useToast();
  const pathname = usePathname();
  const router = useRouter();
  const searchParams = useSearchParams();

  const [searchInput, setSearchInput] = useState('');
  const [drawerState, setDrawerState] = useState<DrawerState>({
    open: false,
    mode: 'create',
    item: null
  });
  const [adjustTarget, setAdjustTarget] = useState<InventoryItem | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<InventoryItem | null>(null);

  const search = toQueryStringValue(searchParams.get('search')) ?? '';
  const category = parseInventoryCategory(searchParams.get('category'));
  const stockStatus = parseStockStatus(searchParams.get('stockStatus'));
  const sort = parseSort(searchParams.get('sort'));
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

  const listParams = useMemo(
    () =>
      ({
        search: search || undefined,
        category,
        stockStatus,
        sort,
        page,
        pageSize
      }) as const,
    [category, page, search, sort, stockStatus]
  );
  const listQuery = useInventory(listParams);
  const kpiQuery = useInventory(
    useMemo(
      () =>
        ({
          search: search || undefined,
          category,
          stockStatus,
          sort,
          page: 1,
          pageSize: 20
        }) as const,
      [category, search, sort, stockStatus]
    )
  );

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
          setQueryParams({
            category: value,
            page: '1'
          });
        }}
        onStockStatusChange={(value) => {
          setQueryParams({
            stockStatus: value,
            page: '1'
          });
        }}
        onSortChange={(value) => {
          setQueryParams({
            sort: value === 'default' ? undefined : value,
            page: '1'
          });
        }}
        onClear={() => {
          setSearchInput('');
          setQueryParams({
            search: undefined,
            category: undefined,
            stockStatus: undefined,
            sort: undefined,
            page: undefined
          });
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
