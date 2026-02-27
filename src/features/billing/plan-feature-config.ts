import type { BillingCycle, PlanCode } from '@/features/billing/types';

export type FeatureResetPolicy = 'monthly' | 'yearly' | 'forever';

export type PlanFeatureRule = {
  enabled: boolean;
  limit: number;
  resetPolicy: FeatureResetPolicy;
};

export type PlanFeatureConfig = Record<string, PlanFeatureRule>;

export type SubscriptionPlanConfig = {
  id: PlanCode;
  name: string;
  priceMonthly: number;
  priceAnnual: number;
  annualDiscountPercent: number;
  trialDays: number;
  subtitle: string;
  ctaLabel: string;
  isRecommended?: boolean;
  features: string[];
  featureConfig: PlanFeatureConfig;
  tier: number;
};

export const planFeatureConfigMap: Record<PlanCode, PlanFeatureConfig> = {
  free: {
    users: { enabled: true, limit: 1, resetPolicy: 'forever' },
    locations: { enabled: true, limit: 1, resetPolicy: 'forever' },
    workOrders: { enabled: true, limit: 25, resetPolicy: 'monthly' },
    customerVehicleHistory: {
      enabled: true,
      limit: -1,
      resetPolicy: 'forever'
    },
    serviceManagement: { enabled: true, limit: -1, resetPolicy: 'forever' },
    basicInvoices: { enabled: true, limit: -1, resetPolicy: 'forever' },
    communityEmailSupport: {
      enabled: true,
      limit: -1,
      resetPolicy: 'forever'
    }
  },
  starter: {
    users: { enabled: true, limit: 5, resetPolicy: 'forever' },
    locations: { enabled: true, limit: 1, resetPolicy: 'forever' },
    workOrders: { enabled: true, limit: -1, resetPolicy: 'monthly' },
    customerVehicleHistory: {
      enabled: true,
      limit: -1,
      resetPolicy: 'forever'
    },
    serviceManagement: { enabled: true, limit: -1, resetPolicy: 'forever' },
    basicInvoices: { enabled: true, limit: -1, resetPolicy: 'forever' },
    communityEmailSupport: {
      enabled: true,
      limit: -1,
      resetPolicy: 'forever'
    }
  },
  growth: {
    users: { enabled: true, limit: 12, resetPolicy: 'forever' },
    locations: { enabled: true, limit: 1, resetPolicy: 'forever' },
    workOrders: { enabled: true, limit: -1, resetPolicy: 'monthly' },
    customerVehicleHistory: {
      enabled: true,
      limit: -1,
      resetPolicy: 'forever'
    },
    serviceManagement: { enabled: true, limit: -1, resetPolicy: 'forever' },
    basicInvoices: { enabled: true, limit: -1, resetPolicy: 'forever' },
    communityEmailSupport: {
      enabled: true,
      limit: -1,
      resetPolicy: 'forever'
    },
    staffWorkflowManagement: {
      enabled: true,
      limit: -1,
      resetPolicy: 'forever'
    },
    deeperReports: { enabled: true, limit: -1, resetPolicy: 'forever' },
    priorityEmailSupport: { enabled: true, limit: -1, resetPolicy: 'forever' }
  }
};

export const subscriptionPlanConfig: SubscriptionPlanConfig[] = [
  {
    id: 'free',
    name: 'Free',
    tier: 1,
    priceMonthly: 0,
    priceAnnual: 0,
    annualDiscountPercent: 0,
    trialDays: 0,
    subtitle: 'Perfect for small shops getting organized',
    ctaLabel: 'Start Free',
    isRecommended: false,
    features: [
      '1 user',
      '1 location',
      'Up to 25 work orders per month',
      'Customer & vehicle history',
      'Service management',
      'Basic invoices',
      'Community/email support'
    ],
    featureConfig: planFeatureConfigMap.free
  },
  {
    id: 'starter',
    name: 'Starter',
    tier: 2,
    priceMonthly: 79,
    priceAnnual: 790,
    annualDiscountPercent: 17,
    trialDays: 14,
    subtitle: 'For shop owners who want better control and fewer mistakes.',
    ctaLabel: 'Start Free for 14 Days',
    isRecommended: true,
    features: [
      'Up to 5 users',
      '1 location',
      'Work order management and status tracking',
      'Customer and vehicle history',
      'Services and parts listing',
      'Basic invoice generation',
      'Email support'
    ],
    featureConfig: planFeatureConfigMap.starter
  },
  {
    id: 'growth',
    name: 'Growth',
    tier: 3,
    priceMonthly: 129,
    priceAnnual: 1290,
    annualDiscountPercent: 17,
    trialDays: 14,
    subtitle: 'For busy garages that need structure and team accountability.',
    ctaLabel: 'Scale My Shop',
    features: [
      'Up to 12 users',
      '1 location',
      'Everything in Starter',
      'Staff workflow management',
      'Deeper reports',
      'Priority email support'
    ],
    featureConfig: planFeatureConfigMap.growth
  }
];

export function getPriceByCycle(
  plan: SubscriptionPlanConfig,
  billingCycle: BillingCycle
): number {
  return billingCycle === 'monthly' ? plan.priceMonthly : plan.priceAnnual;
}
