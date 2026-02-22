import { NextResponse } from 'next/server';

import { auth } from '@/lib/auth';
import type { ServiceConfigurationItem } from '@/features/settings/service-configuration.types';
import { getGarageByOwnerId } from '@/services/firebase/garage-service';
import {
  createGarageService,
  listGarageServices
} from '@/services/firebase/settings-services-service';
import type { ApiResponse } from '@/types/api';

function response<T>(
  payload: ApiResponse<T>,
  status = 200
): NextResponse<ApiResponse<T>> {
  return NextResponse.json(payload, { status });
}

function normalizeName(name: string): string {
  return name.trim().toLowerCase();
}

export async function GET(): Promise<
  NextResponse<ApiResponse<ServiceConfigurationItem[]>>
> {
  const session = await auth();
  if (!session?.user?.id)
    return response({ success: false, error: 'Unauthorized' }, 401);

  const garage = await getGarageByOwnerId(session.user.id);
  if (!garage)
    return response({ success: false, error: 'Garage not found.' }, 404);

  const services = await listGarageServices(garage.id);
  return response({
    success: true,
    data: services.map((item) => ({
      id: item.id,
      name: item.name,
      description: item.description,
      defaultPrice: item.defaultPrice,
      standardTimeMinutes: item.standardDuration,
      createdAt: item.createdAt,
      updatedAt: item.updatedAt
    }))
  });
}

export async function POST(
  request: Request
): Promise<NextResponse<ApiResponse<ServiceConfigurationItem>>> {
  const session = await auth();
  if (!session?.user?.id)
    return response({ success: false, error: 'Unauthorized' }, 401);

  const garage = await getGarageByOwnerId(session.user.id);
  if (!garage)
    return response({ success: false, error: 'Garage not found.' }, 404);

  const body = (await request.json()) as {
    name?: string;
    description?: string;
    defaultPrice?: number | null;
    standardTimeMinutes?: number | null;
  };

  const name = String(body.name ?? '').trim();
  const description = String(body.description ?? '').trim();
  const defaultPrice = body.defaultPrice ?? null;
  const standardTimeMinutes = body.standardTimeMinutes ?? null;

  if (!name) {
    return response(
      { success: false, error: 'Service name is required.' },
      400
    );
  }

  if ((defaultPrice ?? 0) < 0 || (standardTimeMinutes ?? 0) < 0) {
    return response(
      { success: false, error: 'Price and standard time must be 0 or more.' },
      400
    );
  }

  const services = (await listGarageServices(garage.id)).map((item) => ({
    ...item,
    standardTimeMinutes: item.standardDuration
  }));
  const exists = services.some(
    (item) => normalizeName(item.name) === normalizeName(name)
  );
  if (exists) {
    return response(
      { success: false, error: 'Service name must be unique.' },
      409
    );
  }

  const created = await createGarageService(garage.id, {
    name,
    description,
    defaultPrice,
    standardDuration: standardTimeMinutes
  });

  return response({
    success: true,
    data: {
      id: created.id,
      name: created.name,
      description: created.description,
      defaultPrice: created.defaultPrice,
      standardTimeMinutes: created.standardDuration,
      createdAt: created.createdAt,
      updatedAt: created.updatedAt
    }
  });
}
