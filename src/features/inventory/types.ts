import type {
  ISODateString,
  PaginatedResponse,
  PaginationMeta
} from '@/types/primitives';

export type InventoryCategory =
  | 'ENGINE'
  | 'OIL'
  | 'TIRE'
  | 'BRAKE'
  | 'ELECTRICAL';

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
  createdAt: ISODateString;
  updatedAt: ISODateString;
}

export type InventoryListMeta = PaginationMeta;

export type InventoryListResponse = PaginatedResponse<InventoryItem>;

export type InventoryKpis = {
  totalItems: number;
  inStock: number;
  lowStock: number;
  outOfStock: number;
};
