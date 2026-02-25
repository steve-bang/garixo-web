import { NextResponse } from 'next/server';
import { z } from 'zod';

import type { CustomerVehicle } from '@/features/customers/types';
import { auth } from '@/lib/auth';
import { getRequestGarageId } from '@/lib/auth/garage-context';
import {
  deleteGarageCustomerVehicle,
  findGarageCustomerById,
  isGarageCustomerVehiclePlateExists,
  updateGarageCustomerVehicle
} from '@/services/firebase/customers-service';
import type { ApiResponse } from '@/types/api';

const updateCustomerVehicleSchema = z.object({
  plate: z.string().trim().min(1, 'Plate number is required.').optional(),
  brand: z.string().trim().min(1, 'Brand is required.').optional(),
  model: z.string().trim().optional(),
  year: z.coerce.number().int().min(1900).max(2100).optional(),
  color: z.string().trim().optional(),
  lastServiceDate: z.string().optional()
});

type RouteContext = {
  params: Promise<{ id: string; vehicleId: string }>;
};

function response<T>(
  payload: ApiResponse<T>,
  status = 200
): NextResponse<ApiResponse<T>> {
  return NextResponse.json(payload, { status });
}

export async function PUT(
  request: Request,
  context: RouteContext
): Promise<NextResponse<ApiResponse<CustomerVehicle>>> {
  const session = await auth();
  if (!session?.user?.id) {
    return response({ success: false, error: 'Unauthorized' }, 401);
  }

  const garageId = await getRequestGarageId(session);
  if (!garageId) {
    return response({ success: false, error: 'Garage not found.' }, 404);
  }

  const { id, vehicleId } = await context.params;
  const customer = await findGarageCustomerById(garageId, id);
  if (!customer) {
    return response({ success: false, error: 'Customer not found.' }, 404);
  }

  const body = await request.json().catch(() => null);
  const parsed = updateCustomerVehicleSchema.safeParse(body);
  if (!parsed.success) {
    return response(
      {
        success: false,
        error: parsed.error.issues[0]?.message ?? 'Invalid payload.'
      },
      400
    );
  }

  if (parsed.data.plate) {
    const duplicatePlate = await isGarageCustomerVehiclePlateExists(
      garageId,
      id,
      parsed.data.plate,
      vehicleId
    );
    if (duplicatePlate) {
      return response(
        { success: false, error: 'This plate number already exists.' },
        409
      );
    }
  }

  const updated = await updateGarageCustomerVehicle(
    garageId,
    id,
    vehicleId,
    parsed.data
  );
  if (!updated) {
    return response({ success: false, error: 'Vehicle not found.' }, 404);
  }

  return response({ success: true, data: updated });
}

export async function DELETE(
  _request: Request,
  context: RouteContext
): Promise<NextResponse<ApiResponse<CustomerVehicle>>> {
  const session = await auth();
  if (!session?.user?.id) {
    return response({ success: false, error: 'Unauthorized' }, 401);
  }

  const garageId = await getRequestGarageId(session);
  if (!garageId) {
    return response({ success: false, error: 'Garage not found.' }, 404);
  }

  const { id, vehicleId } = await context.params;
  const customer = await findGarageCustomerById(garageId, id);
  if (!customer) {
    return response({ success: false, error: 'Customer not found.' }, 404);
  }

  const deleted = await deleteGarageCustomerVehicle(garageId, id, vehicleId);
  if (!deleted) {
    return response({ success: false, error: 'Vehicle not found.' }, 404);
  }

  return response({ success: true, data: deleted });
}
