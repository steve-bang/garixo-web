import { NextResponse } from 'next/server';

import { customerHistoryDB, customersDB } from '@/app/api/customers/customers-db';
import { updateCustomerSchema } from '@/features/customers/schema';
import type { Customer, CustomerDetailResponse } from '@/features/customers/types';
import type { ApiResponse } from '@/types/api';

function response<T>(payload: ApiResponse<T>, status = 200): NextResponse<ApiResponse<T>> {
  return NextResponse.json(payload, { status });
}

type RouteContext = {
  params: Promise<{ id: string }>;
};

function findById(id: string): Customer | undefined {
  return customersDB.find((item) => item.id === id);
}

export async function GET(_request: Request, context: RouteContext): Promise<NextResponse<ApiResponse<CustomerDetailResponse>>> {
  const { id } = await context.params;
  const customer = findById(id);

  if (!customer) {
    return response({ success: false, error: 'Customer not found.' }, 404);
  }

  const serviceHistory = (customerHistoryDB[id] ?? []).slice(0, 10);

  return response({
    success: true,
    data: {
      customer,
      serviceHistory
    }
  });
}

export async function PUT(request: Request, context: RouteContext): Promise<NextResponse<ApiResponse<Customer>>> {
  const { id } = await context.params;
  const current = findById(id);

  if (!current) {
    return response({ success: false, error: 'Customer not found.' }, 404);
  }

  const body = await request.json().catch(() => null);
  const parsed = updateCustomerSchema.safeParse({ ...body, id });

  if (!parsed.success) {
    return response({ success: false, error: parsed.error.issues[0]?.message ?? 'Invalid payload.' }, 400);
  }

  if (parsed.data.phone) {
    const duplicate = customersDB.find(
      (item) => item.id !== id && item.phone.replace(/\D/g, '') === parsed.data.phone?.replace(/\D/g, '')
    );

    if (duplicate) {
      return response({ success: false, error: 'Phone already exists.' }, 409);
    }
  }

  const updated: Customer = {
    ...current,
    ...parsed.data,
    id,
    updatedAt: new Date().toISOString()
  };

  const index = customersDB.findIndex((item) => item.id === id);
  customersDB[index] = updated;

  return response({ success: true, data: updated });
}

export async function DELETE(_request: Request, context: RouteContext): Promise<NextResponse<ApiResponse<Customer>>> {
  const { id } = await context.params;
  const current = findById(id);

  if (!current) {
    return response({ success: false, error: 'Customer not found.' }, 404);
  }

  if (current.totalVisits > 0) {
    return response({ success: false, error: 'Customer has service history. Cannot delete.' }, 400);
  }

  const index = customersDB.findIndex((item) => item.id === id);
  customersDB.splice(index, 1);
  delete customerHistoryDB[id];

  return response({ success: true, data: current });
}
