import { NextResponse } from 'next/server';

import { updateCustomerSchema } from '@/features/customers/schema';
import type {
  Customer,
  CustomerDetailResponse
} from '@/features/customers/types';
import { auth } from '@/lib/auth';
import { getGarageByOwnerId } from '@/services/firebase/garage-service';
import {
  deleteGarageCustomer,
  findGarageCustomerById,
  isGarageCustomerPhoneExists,
  listGarageCustomerServiceHistory,
  updateGarageCustomer
} from '@/services/firebase/customers-service';
import type { ApiResponse } from '@/types/api';

function response<T>(
  payload: ApiResponse<T>,
  status = 200
): NextResponse<ApiResponse<T>> {
  return NextResponse.json(payload, { status });
}

type RouteContext = {
  params: Promise<{ id: string }>;
};

export async function GET(
  _request: Request,
  context: RouteContext
): Promise<NextResponse<ApiResponse<CustomerDetailResponse>>> {
  const session = await auth();
  if (!session?.user?.id) {
    return response({ success: false, error: 'Unauthorized' }, 401);
  }

  const garage = await getGarageByOwnerId(session.user.id);
  if (!garage) {
    return response({ success: false, error: 'Garage not found.' }, 404);
  }

  const { id } = await context.params;
  const customer = await findGarageCustomerById(garage.id, id);

  if (!customer) {
    return response({ success: false, error: 'Customer not found.' }, 404);
  }

  const serviceHistory = await listGarageCustomerServiceHistory(garage.id, id);

  return response({
    success: true,
    data: {
      customer,
      serviceHistory
    }
  });
}

export async function PUT(
  request: Request,
  context: RouteContext
): Promise<NextResponse<ApiResponse<Customer>>> {
  const session = await auth();
  if (!session?.user?.id) {
    return response({ success: false, error: 'Unauthorized' }, 401);
  }

  const garage = await getGarageByOwnerId(session.user.id);
  if (!garage) {
    return response({ success: false, error: 'Garage not found.' }, 404);
  }

  const { id } = await context.params;
  const current = await findGarageCustomerById(garage.id, id);

  if (!current) {
    return response({ success: false, error: 'Customer not found.' }, 404);
  }

  const body = await request.json().catch(() => null);
  const parsed = updateCustomerSchema.safeParse({ ...body, id });

  if (!parsed.success) {
    return response(
      {
        success: false,
        error: parsed.error.issues[0]?.message ?? 'Invalid payload.'
      },
      400
    );
  }

  if (parsed.data.phone) {
    const duplicate = await isGarageCustomerPhoneExists(
      garage.id,
      parsed.data.phone,
      id
    );

    if (duplicate) {
      return response({ success: false, error: 'Phone already exists.' }, 409);
    }
  }

  const updated = await updateGarageCustomer(garage.id, id, parsed.data);
  if (!updated) {
    return response({ success: false, error: 'Customer not found.' }, 404);
  }

  return response({ success: true, data: updated });
}

export async function DELETE(
  _request: Request,
  context: RouteContext
): Promise<NextResponse<ApiResponse<Customer>>> {
  const session = await auth();
  if (!session?.user?.id) {
    return response({ success: false, error: 'Unauthorized' }, 401);
  }

  const garage = await getGarageByOwnerId(session.user.id);
  if (!garage) {
    return response({ success: false, error: 'Garage not found.' }, 404);
  }

  const { id } = await context.params;
  const current = await findGarageCustomerById(garage.id, id);

  if (!current) {
    return response({ success: false, error: 'Customer not found.' }, 404);
  }

  if (current.totalVisits > 0) {
    return response(
      { success: false, error: 'Customer has service history. Cannot delete.' },
      400
    );
  }

  const deleted = await deleteGarageCustomer(garage.id, id);
  if (!deleted) {
    return response({ success: false, error: 'Customer not found.' }, 404);
  }

  return response({ success: true, data: deleted });
}
