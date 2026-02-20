export type InventoryCategory = 'ENGINE' | 'OIL' | 'TIRE' | 'BRAKE' | 'ELECTRICAL';

export type StockStatus = 'IN_STOCK' | 'LOW_STOCK' | 'OUT_OF_STOCK';

export interface InventoryItem {
  id: string;
  name: string;
  sku?: string;
  category: InventoryCategory;
  quantity: number;
  minLevel: number;
  costPrice: number;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export type InventoryListMeta = {
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
};

export type InventoryListResponse = {
  items: InventoryItem[];
  meta: InventoryListMeta;
};

export type InventoryKpis = {
  totalItems: number;
  inStock: number;
  lowStock: number;
  outOfStock: number;
};
