import { z } from 'zod';

export const billingProviderSchema = z.literal('paypal');
export const planCodeSchema = z.enum(['starter', 'growth']);
export const billingCycleSchema = z.enum(['monthly', 'annual']);
export const billingStatusSchema = z.enum([
  'trialing',
  'active',
  'past_due',
  'cancelled',
  'suspended'
]);

export const billingSnapshotSchema = z.object({
  provider: billingProviderSchema,
  planCode: planCodeSchema,
  billingCycle: billingCycleSchema,
  status: billingStatusSchema,
  trialEndsAt: z.string().datetime().nullable(),
  currentPeriodEnd: z.string().datetime().nullable(),
  cancelAtPeriodEnd: z.boolean(),
  paypalSubscriptionId: z.string().nullable(),
  paypalPlanId: z.string().nullable(),
  payerId: z.string().nullable(),
  founderEligible: z.boolean(),
  founderLockedUntil: z.string().datetime().nullable(),
  updatedAt: z.string().datetime()
});

export const createSubscriptionInputSchema = z.object({
  planCode: planCodeSchema,
  billingCycle: billingCycleSchema
});

export const captureApprovalInputSchema = z.object({
  subscriptionId: z.string().trim().min(1)
});

export const cancelSubscriptionInputSchema = z.object({
  reason: z.string().trim().min(1).max(127).default('Cancelled by garage owner')
});

export const trialStartInputSchema = z.object({
  founderCode: z.string().trim().optional()
});

export type BillingSnapshotInput = z.infer<typeof billingSnapshotSchema>;
export type CreateSubscriptionInput = z.infer<
  typeof createSubscriptionInputSchema
>;
export type CaptureApprovalInput = z.infer<typeof captureApprovalInputSchema>;
export type CancelSubscriptionInput = z.infer<
  typeof cancelSubscriptionInputSchema
>;
export type TrialStartInput = z.infer<typeof trialStartInputSchema>;
