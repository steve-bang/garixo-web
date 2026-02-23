import { NextResponse } from 'next/server';
import { z } from 'zod';

import { auth } from '@/lib/auth';
import { getRequestGarageId } from '@/lib/auth/garage-context';
import {
  createGarageCustomerVehicle,
  findGarageCustomerById,
  listGarageCustomerVehicles
} from '@/services/firebase/customers-service';
import type { ApiResponse } from '@/types/api';
import type { Customer } from '@/features/customers/types';

const createCustomerVehicleSchema = z.object({
  plate: z.string().trim().min(1, 'Plate number is required.'),
  brand: z.string().trim().min(1, 'Brand is required.'),
  model: z.string().trim().optional(),
  year: z.coerce.number().int().min(1900).max(2100).optional(),
  color: z.string().trim().optional(),
  lastServiceDate: z.string().optional()
});

type RouteContext = {
  params: Promise<{ id: string }>;
};

function response<T>(
  payload: ApiResponse<T>,
  status = 200
): NextResponse<ApiResponse<T>> {
  return NextResponse.json(payload, { status });
}

export async function GET(
  _request: Request,
  context: RouteContext
): Promise<NextResponse<ApiResponse<Customer['vehicles']>>> {
  const session = await auth();
  if (!session?.user?.id) {
    return response({ success: false, error: 'Unauthorized' }, 401);
  }

  const garageId = await getRequestGarageId(session);
  if (!garageId) {
    return response({ success: false, error: 'Garage not found.' }, 404);
  }

  const { id } = await context.params;
  const customer = await findGarageCustomerById(garageId, id);
  if (!customer) {
    return response({ success: false, error: 'Customer not found.' }, 404);
  }

  const vehicles = await listGarageCustomerVehicles(garageId, id);
  return response({ success: true, data: vehicles });
}

export async function POST(
  request: Request,
  context: RouteContext
): Promise<NextResponse<ApiResponse<Customer['vehicles'][number]>>> {
  const session = await auth();
  if (!session?.user?.id) {
    return response({ success: false, error: 'Unauthorized' }, 401);
  }

  const garageId = await getRequestGarageId(session);
  if (!garageId) {
    return response({ success: false, error: 'Garage not found.' }, 404);
  }

  const { id } = await context.params;
  const customer = await findGarageCustomerById(garageId, id);
  if (!customer) {
    return response({ success: false, error: 'Customer not found.' }, 404);
  }

  const body = await request.json().catch(() => null);
  const parsed = createCustomerVehicleSchema.safeParse(body);
  if (!parsed.success) {
    return response(
      {
        success: false,
        error: parsed.error.issues[0]?.message ?? 'Invalid payload.'
      },
      400
    );
  }

  const duplicatePlate = customer.vehicles.some(
    (vehicle) =>
      vehicle.plate.trim().toLowerCase() ===
      parsed.data.plate.trim().toLowerCase()
  );
  if (duplicatePlate) {
    return response(
      { success: false, error: 'This plate number already exists.' },
      409
    );
  }

  const created = await createGarageCustomerVehicle(garageId, id, parsed.data);
  return response({ success: true, data: created }, 201);
}
