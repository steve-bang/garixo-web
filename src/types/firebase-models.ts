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
import type { BlogSchemaType, BlogStatus } from '@/features/blogs/types';

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

/**
 * Vehicle record stored per garage.
 * Path: garages/{garageId}/vehicles/{vehicleId}
 */
export interface GarageVehicleDocument {
  id?: string;
  plateNumber?: string;
  plateNormalized?: string;
  brand?: string;
  model?: string;
  year?: number;
  color?: string;
  vin?: string;
  customerId?: string;
  customerName?: string;
  customerPhone?: string;
  status?: 'ACTIVE' | 'IN_SERVICE' | 'COMPLETED' | 'OVERDUE' | 'INACTIVE';
  totalVisits?: number;
  totalSpent?: number;
  lastServiceDate?: string;
  notes?: string;
  images?: GarageVehicleImageDocument[];
  createdAt?: string;
  updatedAt?: string;
}

/**
 * Vehicle image metadata stored inline on a vehicle document.
 * Path: garages/{garageId}/vehicles/{vehicleId}.images[]
 */
export interface GarageVehicleImageDocument {
  id: string;
  url: string;
  path: string;
  name: string;
  contentType: 'image/jpeg' | 'image/png' | 'image/webp';
  size: number;
  uploadedByUserId: string;
  uploadedAt: string;
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

export type GarageInvoicePaymentTerm =
  | 'DUE_ON_RECEIPT'
  | 'NET_7'
  | 'NET_15'
  | 'NET_30';

/**
 * Invoice settings configured at garage scope.
 * Path: garages/{garageId}/settings/invoice
 */
export interface GarageInvoiceSettingsDocument {
  tax: {
    enabled: boolean;
    rate: number;
    label: string;
  };
  paymentTerm: GarageInvoicePaymentTerm;
  createdAt: string;
  updatedAt: string;
}

export type GarageInvoiceLineItemType = 'service' | 'part' | 'custom';

export interface GarageInvoiceLineItemDocument {
  key: string;
  type: GarageInvoiceLineItemType;
  name: string;
  quantity: number;
  unitPrice: number;
  amount: number;
}

export interface GarageInvoiceDocument {
  invoiceNumber: string;
  workOrderId: string;
  orderCode: string;
  customerId: string | null;
  customerName: string;
  customerEmail: string | null;
  customerPhone: string | null;
  vehicleId: string | null;
  vehicleLabel: string;
  issuedAt: string;
  dueDate: string;
  paymentTerm: GarageInvoicePaymentTerm;
  lineItems: GarageInvoiceLineItemDocument[];
  subtotal: number;
  tax: {
    enabled: boolean;
    rate: number;
    label: string;
    amount: number;
  };
  total: number;
  notes: string | null;
  sentAt: string | null;
  lastSentAt: string | null;
  sentCount: number;
  createdAt: string;
  updatedAt: string;
  createdByUserId: string;
  updatedByUserId: string;
}

/**
 * Public invoice share token record.
 * Path: invoicePublicShares/{shareId}
 */
export interface InvoicePublicShareDocument {
  garageId: string;
  invoiceId: string;
  tokenHash: string;
  publicToken: string;
  isActive: boolean;
  expiresAt: string | null;
  createdByUserId: string;
  lastViewedAt: string | null;
  createdAt: string;
  updatedAt: string;
}

/**
 * Marketing blog post record.
 * Path: blogs/{blogId}
 */
export interface BlogDocument {
  title: string;
  slug: string;
  excerpt: string;
  content: {
    type: 'html';
    html: string;
    markdown: string | null;
  };
  contentText: string;
  metaTitle: string;
  metaDescription: string;
  focusKeyword: string;
  secondaryKeywords: string[];
  category: string;
  tags: string[];
  status: BlogStatus;
  schemaType: BlogSchemaType;
  ogTitle: string;
  ogDescription: string;
  ogImage: string;
  canonical: string;
  isIndexed: boolean;
  faqItems: Array<{
    question: string;
    answer: string;
  }>;
  ctaBlock: {
    title: string;
    description: string;
    ctaLabel: string;
    ctaHref: string;
  } | null;
  seoScore: number;
  views: number;
  readingTime: number;
  createdAt: string;
  updatedAt: string;
  publishedAt: string | null;
  scheduledAt: string | null;
  authorId: string;
  authorName: string;
}

/**
 * Blog category reference document used for admin filters and content taxonomy.
 * Path: blogCategories/{categoryId}
 */
export interface BlogCategoryDocument {
  name: string;
  slug: string;
  postCount: number;
  createdAt: string;
  updatedAt: string;
}

/**
 * Blog tag reference document used for admin filters and content taxonomy.
 * Path: blogTags/{tagId}
 */
export interface BlogTagDocument {
  name: string;
  slug: string;
  postCount: number;
  createdAt: string;
  updatedAt: string;
}
