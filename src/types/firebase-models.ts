import type { UserRole } from '@/types/user';
import type { WorkOrderStatus as UnifiedWorkOrderStatus } from '@/features/work-orders/types';
import type { GarageIndustryType } from '@/types/garage';
import type {
  BillingCycle,
  BillingProvider,
  BillingStatus,
  PlanCode
} from '@/features/billing/types';

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
  industryType?: GarageIndustryType;
  address?: string;
  phone?: string;
  email?: string;
  workingHours?: string;
  logoUrl?: string;
  createdAt: string;
  updatedAt: string;
}

export interface GarageBillingDocument {
  provider: BillingProvider;
  planCode: PlanCode;
  billingCycle: BillingCycle;
  status: BillingStatus;
  trialEndsAt: string | null;
  currentPeriodEnd: string | null;
  lastPaidAt: string | null;
  cancelAtPeriodEnd: boolean;
  paypalSubscriptionId: string | null;
  paypalPlanId: string | null;
  paypalCustomerId: string | null;
  payerId: string | null;
  founderEligible: boolean;
  founderLockedUntil: string | null;
  lastWebhookEventId: string | null;
  webhookEventIdsRecent: string[];
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
  customerId?: string;
  customerName: string;
  plateNumber: string;
  totalAmount?: number;
  serviceId?: string;
  service?: string;
  notes?: string;
  status: WorkOrderStatus;
  vehicleId?: string;
  vehicleModel?: string;
  isOverdue?: boolean;
  createdAt: string;
  updatedAt: string;
}
