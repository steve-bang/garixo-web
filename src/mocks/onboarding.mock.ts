import type {
  CreateQuickWorkOrderInput,
  OnboardingState,
  QuickWorkOrder,
  SetupGarageInput
} from '@/features/onboarding/types';

const defaultPhone = '+1 (555) 210-8890';

const onboardingDb = new Map<string, OnboardingState>();

function wait(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function ensureState(userId: string): OnboardingState {
  if (!onboardingDb.has(userId)) {
    onboardingDb.set(userId, {
      garageConfigured: true,
      garage: {
        garageName: '',
        address: '',
        phone: defaultPhone
      },
      workOrders: []
    });
  }

  return onboardingDb.get(userId) as OnboardingState;
}

export async function getOnboardingState(userId: string): Promise<OnboardingState> {
  await wait(180);
  return ensureState(userId);
}

export async function setupGarage(userId: string, input: SetupGarageInput): Promise<OnboardingState> {
  await wait(500);
  const current = ensureState(userId);
  const next: OnboardingState = {
    ...current,
    garageConfigured: true,
    garage: {
      garageName: input.garageName.trim(),
      address: input.address?.trim() ?? '',
      phone: input.phone.trim() || defaultPhone
    }
  };
  onboardingDb.set(userId, next);
  return next;
}

export async function listQuickWorkOrders(userId: string): Promise<QuickWorkOrder[]> {
  await wait(200);
  return [...ensureState(userId).workOrders].sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}

export async function createQuickWorkOrder(userId: string, input: CreateQuickWorkOrderInput): Promise<QuickWorkOrder> {
  await wait(450);
  const current = ensureState(userId);
  const order: QuickWorkOrder = {
    id: `qwo-${Date.now()}`,
    customerName: input.customerName.trim(),
    licensePlate: input.licensePlate.trim().toUpperCase(),
    service: input.service?.trim() ?? '',
    notes: input.notes?.trim() ?? '',
    createdAt: new Date().toISOString()
  };
  onboardingDb.set(userId, {
    ...current,
    workOrders: [order, ...current.workOrders]
  });
  return order;
}
