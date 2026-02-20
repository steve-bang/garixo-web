export type ServiceStatus = 'ACTIVE' | 'INACTIVE';

export type ServiceCategory = 'ENGINE' | 'OIL' | 'BRAKE' | 'TIRE' | 'ELECTRICAL' | 'OTHER';

export interface Service {
  id: string;
  name: string;
  category: ServiceCategory;
  price: number;
  estimatedTime: string;
  description?: string;
  status: ServiceStatus;
  createdAt: string;
  updatedAt: string;
  usedInWorkOrder?: boolean;
}

export type ServiceListMeta = {
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
};

export type ServiceListResponse = {
  items: Service[];
  meta: ServiceListMeta;
};

export type ServiceKpis = {
  totalServices: number;
  activeServices: number;
  inactiveServices: number;
  averagePrice: number;
};
