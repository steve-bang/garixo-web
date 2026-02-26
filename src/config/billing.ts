import { env } from '@/config/env';
import type {
  BillingCycle,
  BillingProvider,
  PlanCode
} from '@/features/billing/types';

type BillingPlanMap = Record<PlanCode, Record<BillingCycle, string>>;

function requiredPayPalValue(
  name:
    | 'PAYPAL_CLIENT_ID'
    | 'PAYPAL_CLIENT_SECRET'
    | 'PAYPAL_WEBHOOK_ID'
    | 'PAYPAL_PLAN_ID_STARTER_MONTHLY'
    | 'PAYPAL_PLAN_ID_STARTER_ANNUAL'
    | 'PAYPAL_PLAN_ID_GROWTH_MONTHLY'
    | 'PAYPAL_PLAN_ID_GROWTH_ANNUAL'
): string {
  const value = env[name]?.trim();
  if (!value) {
    throw new Error(`Missing required PayPal config: ${name}`);
  }

  return value;
}

export const billingConfig = {
  provider: 'paypal' as const,
  paypal: {
    env: env.PAYPAL_ENV,
    clientId: (): string => requiredPayPalValue('PAYPAL_CLIENT_ID'),
    clientSecret: (): string => requiredPayPalValue('PAYPAL_CLIENT_SECRET'),
    webhookId: (): string => requiredPayPalValue('PAYPAL_WEBHOOK_ID')
  },
  plans: {
    starter: {
      monthly: () => requiredPayPalValue('PAYPAL_PLAN_ID_STARTER_MONTHLY'),
      annual: () => requiredPayPalValue('PAYPAL_PLAN_ID_STARTER_ANNUAL')
    },
    growth: {
      monthly: () => requiredPayPalValue('PAYPAL_PLAN_ID_GROWTH_MONTHLY'),
      annual: () => requiredPayPalValue('PAYPAL_PLAN_ID_GROWTH_ANNUAL')
    }
  }
};

export function getPayPalPlanId(
  planCode: PlanCode,
  billingCycle: BillingCycle
): string {
  return billingConfig.plans[planCode][billingCycle]();
}

export function getPayPalPlanMap(): BillingPlanMap {
  return {
    starter: {
      monthly: billingConfig.plans.starter.monthly(),
      annual: billingConfig.plans.starter.annual()
    },
    growth: {
      monthly: billingConfig.plans.growth.monthly(),
      annual: billingConfig.plans.growth.annual()
    }
  };
}
