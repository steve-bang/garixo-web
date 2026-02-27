/**
 * Firestore persistence models for Garixo domain documents.
 *
 * Notes:
 * - These types represent storage shape (not UI view models).
 * - Date/time fields use ISO-8601 UTC strings for cross-platform consistency.
 * - Subcollection path conventions are documented near each related interface.
 * - Keep these models stable and append fields carefully to avoid data migration churn.
 */

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

export type UsageResetPolicy = 'monthly' | 'yearly' | 'forever';

/**
 * Single usage counter item for one feature in the current billing period.
 * Stored as an array item to keep the model flexible as new tracked features are added.
 */
export interface GarageUsageCounterItem {
  key: string;
  value: number;
  limit: number;
  resetPolicy: UsageResetPolicy;
  enabled: boolean;
  updatedAt: string;
}

/**
 * Live usage snapshot for a garage.
 * Path: garages/{garageId}/usage/current
 */
export interface GarageUsageCurrentDocument {
  periodKey: string;
  periodStartAt: string;
  periodEndAt: string;
  counters: GarageUsageCounterItem[];
  createdAt: string;
  updatedAt: string;
}

/**
 * Historical usage snapshot archived by period.
 * Path: garages/{garageId}/usage/history/{periodKey}
 */
export interface GarageUsageHistoryDocument {
  periodKey: string;
  periodStartAt: string;
  periodEndAt: string;
  counters: GarageUsageCounterItem[];
  snapshotAt: string;
  createdAt: string;
  updatedAt: string;
}
