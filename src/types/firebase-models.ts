import type { UserRole } from '@/types/user';
import type { WorkOrderStatus as UnifiedWorkOrderStatus } from '@/features/work-orders/types';

export type FirebaseRole = UserRole;

export interface UserDocument {
  id: string;
  email: string;
  name: string;
  role: FirebaseRole;
  emailVerifiedAt?: string | null;
  emailVerifyTokenHash?: string | null;
  emailVerifyTokenExpiresAt?: string | null;
  emailVerifyTokenUsedAt?: string | null;
  garageId?: string;
  avatarUrl?: string;
  createdAt: string;
  updatedAt?: string;
}

export interface GarageDocument {
  id: string;
  ownerUserId: string;
  name: string;
  address?: string;
  phone?: string;
  email?: string;
  workingHours?: string;
  logoUrl?: string;
  createdAt: string;
  updatedAt: string;
}

export interface GarageServiceDocument {
  id: string;
  name: string;
  description: string;
  defaultPrice: number | null;
  standardDuration: number | null;
  createdAt: string;
  updatedAt: string;
}

export type WorkOrderStatus = UnifiedWorkOrderStatus;

export interface GarageWorkOrderDocument {
  id: string;
  orderCode?: string;
  customerName: string;
  licensePlate: string;
  totalAmount?: number;
  serviceId?: string;
  service?: string;
  notes?: string;
  status: WorkOrderStatus;
  createdAt: string;
  updatedAt: string;
}
