export type BillingProvider = 'paypal';

export type PlanCode = 'starter' | 'growth';

export type BillingCycle = 'monthly' | 'annual';

export type BillingStatus =
  | 'trialing'
  | 'active'
  | 'past_due'
  | 'cancelled'
  | 'suspended';

export type BillingSnapshot = {
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
  payerId: string | null;
  founderEligible: boolean;
  founderLockedUntil: string | null;
  updatedAt: string;
};
