import type {
  ISODateString,
  PaginatedResponse,
  PaginationMeta
} from '@/types/primitives';

export const SERVICE_STATUS_VALUES = ['ACTIVE', 'INACTIVE'] as const;
export type ServiceStatus = (typeof SERVICE_STATUS_VALUES)[number];

export const SERVICE_CATEGORY_VALUES = [
  'ENGINE',
  'OIL',
  'BRAKE',
  'TIRE',
  'ELECTRICAL',
  'OTHER'
] as const;

export type ServiceCategory = (typeof SERVICE_CATEGORY_VALUES)[number];

export interface Service {
  id: string;
  name: string;
  category: ServiceCategory;
  price: number;
  estimatedTime: string;
  description?: string;
  status: ServiceStatus;
  createdAt: ISODateString;
  updatedAt: ISODateString;
  usedInWorkOrder?: boolean;
}

export type ServiceListMeta = PaginationMeta;

export type ServiceListResponse = PaginatedResponse<Service>;

export type ServiceKpis = {
  totalServices: number;
  activeServices: number;
  inactiveServices: number;
  averagePrice: number;
};
