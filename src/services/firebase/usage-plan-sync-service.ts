import type { PlanCode } from '@/features/billing/types';
import { planFeatureConfigMap } from '@/features/billing/plan-feature-config';
import { firebaseAdmin } from '@/lib/firebase-admin';
import type {
  GarageUsageCounterItem,
  GarageUsageCurrentDocument
} from '@/types/firebase-models';

const USAGE_DOC_ID = 'current';

function usageDocRef(garageId: string) {
  return firebaseAdmin.db
    .collection('garages')
    .doc(garageId)
    .collection('usage')
    .doc(USAGE_DOC_ID);
}

function toMonthlyPeriodBounds(now: Date): {
  periodKey: string;
  periodStartAt: string;
  periodEndAt: string;
} {
  const year = now.getUTCFullYear();
  const month = now.getUTCMonth();
  const nextMonthStart = new Date(Date.UTC(year, month + 1, 1, 0, 0, 0, 0));
  const monthEnd = new Date(nextMonthStart.getTime() - 1);

  return {
    periodKey: `${year}-${String(month + 1).padStart(2, '0')}`,
    periodStartAt: new Date(Date.UTC(year, month, 1, 0, 0, 0, 0)).toISOString(),
    periodEndAt: monthEnd.toISOString()
  };
}

function defaultCounterValue(key: string): number {
  if (key === 'locations') {
    return 1;
  }
  return 0;
}

/**
 * Synchronize `usage/current` rules with the latest subscription plan.
 *
 * Behavior:
 * - Keep existing usage values to avoid accidental usage loss.
 * - Update feature gates (`enabled`) and quota rules (`limit`, `resetPolicy`) from plan config.
 * - Create missing counters for new features introduced by plan changes.
 * - If usage/current does not exist, create it with a fresh monthly period scaffold.
 */
export async function syncUsageCurrentByPlan(
  garageId: string,
  planCode: PlanCode
): Promise<void> {
  const usageRef = usageDocRef(garageId);
  const planConfig = planFeatureConfigMap[planCode];
  const now = new Date();
  const nowIso = now.toISOString();

  await firebaseAdmin.db.runTransaction(async (transaction: any) => {
    const usageSnap = await transaction.get(usageRef);
    const current = usageSnap.exists
      ? (usageSnap.data() as Partial<GarageUsageCurrentDocument>)
      : null;

    const counters: GarageUsageCounterItem[] = [
      ...((current?.counters ?? []) as GarageUsageCounterItem[])
    ];

    for (const [featureKey, rule] of Object.entries(planConfig)) {
      const index = counters.findIndex((counter) => counter.key === featureKey);
      if (index >= 0) {
        counters[index] = {
          ...counters[index],
          enabled: rule.enabled,
          limit: rule.limit,
          resetPolicy: rule.resetPolicy,
          value: Math.max(0, counters[index].value ?? 0),
          updatedAt: nowIso
        };
        continue;
      }

      counters.push({
        key: featureKey,
        value: defaultCounterValue(featureKey),
        enabled: rule.enabled,
        limit: rule.limit,
        resetPolicy: rule.resetPolicy,
        updatedAt: nowIso
      });
    }

    const period = toMonthlyPeriodBounds(now);
    const payload: GarageUsageCurrentDocument = {
      periodKey: current?.periodKey ?? period.periodKey,
      periodStartAt: current?.periodStartAt ?? period.periodStartAt,
      periodEndAt: current?.periodEndAt ?? period.periodEndAt,
      counters,
      createdAt: current?.createdAt ?? nowIso,
      updatedAt: nowIso
    };

    transaction.set(usageRef, payload, { merge: true });
  });
}
