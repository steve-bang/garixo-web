import type { GarageIndustryType } from '@/types/garage';
import type { ISODateString } from '@/types/primitives';

export type GarageProfile = {
  garageName: string;
  industryType: GarageIndustryType;
  address?: string;
  phone: string;
};

export type QuickWorkOrder = {
  id: string;
  orderCode?: string;
  customerName: string;
  plateNumber: string;
  status?: string;
  totalAmount?: number;
  service?: string;
  notes?: string;
  createdAt: ISODateString;
  updatedAt?: ISODateString;
};

export type OnboardingState = {
  garageConfigured: boolean;
  garage?: GarageProfile;
  workOrders: QuickWorkOrder[];
};

export type SetupGarageInput = {
  garageName: string;
  industryType: GarageIndustryType;
  address?: string;
  phone: string;
};

export type CreateQuickWorkOrderInput = {
  customerName: string;
  licensePlate: string;
  service?: string;
  notes?: string;
};
