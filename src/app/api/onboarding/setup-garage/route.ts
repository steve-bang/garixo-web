import { NextResponse } from 'next/server';
import { z } from 'zod';

import { auth } from '@/lib/auth';
import type { OnboardingState } from '@/features/onboarding/types';
import { createGarageForOwner } from '@/services/firebase/garage-service';
import { garageIndustryTypes } from '@/types/garage';
import type { ApiResponse } from '@/types/api';

const setupGarageSchema = z.object({
  garageName: z.string().trim().min(1, 'Garage name is required.'),
  industryType: z.enum(garageIndustryTypes).default('General Repair'),
  address: z.string().trim().optional(),
  phone: z.string().trim().optional()
});

function json<T>(
  payload: ApiResponse<T>,
  status = 200
): NextResponse<ApiResponse<T>> {
  return NextResponse.json(payload, { status });
}

export async function POST(
  request: Request
): Promise<NextResponse<ApiResponse<OnboardingState>>> {
  const session = await auth();
  if (!session?.user?.id) {
    return json({ success: false, error: 'Unauthorized' }, 401);
  }

  const body = await request.json().catch(() => null);
  const parsed = setupGarageSchema.safeParse(body);
  if (!parsed.success) {
    return json(
      {
        success: false,
        error: parsed.error.issues[0]?.message ?? 'Invalid setup payload.'
      },
      400
    );
  }

  const garage = await createGarageForOwner({
    ownerId: session.user.id,
    name: parsed.data.garageName,
    industryType: parsed.data.industryType,
    address: parsed.data.address ?? '',
    phone: parsed.data.phone ?? '',
    email: session.user.email ?? ''
  });

  const next: OnboardingState = {
    garageConfigured: true,
    garage: {
      garageName: garage.name,
      industryType: garage.industryType ?? 'General Repair',
      address: garage.address ?? '',
      phone: garage.phone ?? ''
    },
    workOrders: []
  };

  return json({ success: true, data: next });
}
