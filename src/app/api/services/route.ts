import { NextResponse } from 'next/server';

import {
  createGarageService,
  hasDuplicateServiceName,
  listGarageServicesWithQuery
} from '@/app/api/services/services-db';
import {
  createServiceSchema,
  serviceListQuerySchema
} from '@/features/services/schema';
import type { Service, ServiceListResponse } from '@/features/services/types';
import { auth } from '@/lib/auth';
import { getGarageByOwnerId } from '@/services/firebase/garage-service';
import type { ApiResponse } from '@/types/api';

function response<T>(
  payload: ApiResponse<T>,
  status = 200
): NextResponse<ApiResponse<T>> {
  return NextResponse.json(payload, { status });
}

export async function GET(
  request: Request
): Promise<NextResponse<ApiResponse<ServiceListResponse>>> {
  const session = await auth();
  if (!session?.user?.id) {
    return response({ success: false, error: 'Unauthorized' }, 401);
  }

  const garage = await getGarageByOwnerId(session.user.id);
  if (!garage) {
    return response({ success: false, error: 'Garage not found.' }, 404);
  }

  const url = new URL(request.url);

  const parsedQuery = serviceListQuerySchema.safeParse({
    search: url.searchParams.get('search') ?? undefined,
    category: url.searchParams.get('category') ?? undefined,
    status: url.searchParams.get('status') ?? undefined,
    page: url.searchParams.get('page') ?? undefined,
    pageSize: url.searchParams.get('pageSize') ?? undefined,
    sort: url.searchParams.get('sort') ?? undefined
  });

  if (!parsedQuery.success) {
    return response(
      {
        success: false,
        error: parsedQuery.error.issues[0]?.message ?? 'Invalid query.'
      },
      400
    );
  }

  const { search, category, status, page, pageSize, sort } = parsedQuery.data;
  const result = await listGarageServicesWithQuery(garage.id, {
    search,
    category,
    status,
    page,
    pageSize,
    sort
  });

  return response({
    success: true,
    data: {
      items: result.items,
      meta: result.meta
    }
  });
}

export async function POST(
  request: Request
): Promise<NextResponse<ApiResponse<Service>>> {
  const session = await auth();
  if (!session?.user?.id) {
    return response({ success: false, error: 'Unauthorized' }, 401);
  }

  const garage = await getGarageByOwnerId(session.user.id);
  if (!garage) {
    return response({ success: false, error: 'Garage not found.' }, 404);
  }

  const body = await request.json().catch(() => null);
  const parsed = createServiceSchema.safeParse(body);

  if (!parsed.success) {
    return response(
      {
        success: false,
        error: parsed.error.issues[0]?.message ?? 'Invalid payload.'
      },
      400
    );
  }

  const duplicate = await hasDuplicateServiceName(garage.id, parsed.data.name);

  if (duplicate) {
    return response(
      { success: false, error: 'Service name already exists.' },
      409
    );
  }

  const created = await createGarageService(garage.id, parsed.data);

  return response({ success: true, data: created }, 201);
}
