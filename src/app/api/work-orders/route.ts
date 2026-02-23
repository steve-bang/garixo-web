import { NextResponse } from 'next/server';

import {
  createGarageWorkOrder,
  listGarageWorkers,
  listGarageWorkOrders,
  nextOrderCode
} from '@/app/api/work-orders/work-orders-db';
import {
  createWorkOrderSchema,
  workOrdersQuerySchema
} from '@/features/work-orders/schema';
import { WorkOrderStatusEnum } from '@/features/work-orders/types';
import type {
  WorkOrder,
  WorkOrdersResponse
} from '@/features/work-orders/types';
import {
  computeTotalAmount,
  groupByStatus,
  normalizePlate,
  toPlateDisplay
} from '@/features/work-orders/utils';
import { auth } from '@/lib/auth';
import { getGarageByOwnerId } from '@/services/firebase/garage-service';
import type { ApiResponse } from '@/types/api';

function response<T>(
  payload: ApiResponse<T>,
  status = 200
): NextResponse<ApiResponse<T>> {
  return NextResponse.json(payload, { status });
}

function statusOrder(status: WorkOrder['status']): number {
  const map: Record<WorkOrder['status'], number> = {
    Draft: 0,
    WaitingForApproval: 1,
    InProgress: 2,
    WaitingForParts: 3,
    Completed: 4,
    Paid: 5,
    Cancelled: 6
  };

  return map[status];
}

function inDateFilter(
  value: string,
  filter: 'all' | 'today' | 'this_week' | 'custom',
  from?: string,
  to?: string
): boolean {
  if (filter === 'all') return true;

  const date = new Date(value);
  const now = new Date();

  if (filter === 'today') {
    return date.toDateString() === now.toDateString();
  }

  if (filter === 'this_week') {
    const start = new Date(now);
    start.setDate(now.getDate() - now.getDay());
    start.setHours(0, 0, 0, 0);
    return date.getTime() >= start.getTime();
  }

  if (filter === 'custom') {
    const fromDate = from ? new Date(from).getTime() : Number.NEGATIVE_INFINITY;
    const toDate = to ? new Date(to).getTime() : Number.POSITIVE_INFINITY;
    return date.getTime() >= fromDate && date.getTime() <= toDate;
  }

  return true;
}

export async function GET(
  request: Request
): Promise<NextResponse<ApiResponse<WorkOrdersResponse>>> {
  const session = await auth();
  if (!session?.user?.id) {
    return response({ success: false, error: 'Unauthorized' }, 401);
  }

  const garage = await getGarageByOwnerId(session.user.id);
  if (!garage) {
    return response({ success: false, error: 'Garage not found.' }, 404);
  }

  const url = new URL(request.url);

  const parsed = workOrdersQuerySchema.safeParse({
    search: url.searchParams.get('search') ?? undefined,
    workerId: url.searchParams.get('workerId') ?? undefined,
    status: url.searchParams.get('status') ?? undefined,
    dateFilter: url.searchParams.get('dateFilter') ?? undefined,
    dateFrom: url.searchParams.get('dateFrom') ?? undefined,
    dateTo: url.searchParams.get('dateTo') ?? undefined,
    page: url.searchParams.get('page') ?? undefined,
    pageSize: url.searchParams.get('pageSize') ?? undefined
  });

  if (!parsed.success) {
    return response(
      {
        success: false,
        error: parsed.error.issues[0]?.message ?? 'Invalid query.'
      },
      400
    );
  }

  const {
    search,
    workerId,
    status,
    dateFilter,
    dateFrom,
    dateTo,
    page,
    pageSize
  } = parsed.data;

  const all = await listGarageWorkOrders(garage.id);
  let filtered = [...all];

  if (search) {
    const needle = search.trim().toLowerCase();
    const normalized = normalizePlate(search);

    filtered = filtered
      .filter((item) => {
        const plate = item.plateNumber.toLowerCase();
        const normalizedPlate = normalizePlate(item.plateNumber);

        return (
          plate.includes(needle) ||
          normalizedPlate.includes(normalized) ||
          item.orderCode.toLowerCase().includes(needle) ||
          item.customerName.toLowerCase().includes(needle)
        );
      })
      .sort((a, b) => {
        const aNorm = normalizePlate(a.plateNumber);
        const bNorm = normalizePlate(b.plateNumber);

        const score = (value: string): number => {
          if (!normalized) return 2;
          if (value.startsWith(normalized)) return 0;
          if (value.includes(normalized)) return 1;
          return 2;
        };

        const diff = score(aNorm) - score(bNorm);
        if (diff !== 0) return diff;
        return statusOrder(a.status) - statusOrder(b.status);
      });
  }

  if (workerId) {
    filtered = filtered.filter((item) => item.workerId === workerId);
  }

  if (status) {
    filtered = filtered.filter((item) => item.status === status);
  }

  filtered = filtered.filter((item) =>
    inDateFilter(item.createdAt, dateFilter, dateFrom, dateTo)
  );

  filtered.sort((a, b) => {
    const statusDiff = statusOrder(a.status) - statusOrder(b.status);
    if (statusDiff !== 0) return statusDiff;

    return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime();
  });

  const total = filtered.length;
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  const safePage = Math.min(page, totalPages);
  const start = (safePage - 1) * pageSize;
  const items = filtered.slice(start, start + pageSize);

  const workers = await listGarageWorkers(garage.id);

  return response({
    success: true,
    data: {
      items,
      grouped: groupByStatus(items),
      workers,
      meta: {
        page: safePage,
        pageSize,
        total,
        totalPages
      }
    }
  });
}

export async function POST(
  request: Request
): Promise<NextResponse<ApiResponse<WorkOrder>>> {
  const session = await auth();
  if (!session?.user?.id) {
    return response({ success: false, error: 'Unauthorized' }, 401);
  }

  const garage = await getGarageByOwnerId(session.user.id);
  if (!garage) {
    return response({ success: false, error: 'Garage not found.' }, 404);
  }

  const body = await request.json().catch(() => null);
  const parsed = createWorkOrderSchema.safeParse(body);

  if (!parsed.success) {
    return response(
      {
        success: false,
        error: parsed.error.issues[0]?.message ?? 'Invalid payload.'
      },
      400
    );
  }

  const now = new Date().toISOString();
  const totalAmount = computeTotalAmount(
    parsed.data.services,
    parsed.data.parts ?? []
  );

  const createdPayload: Omit<WorkOrder, 'id'> = {
    orderCode: await nextOrderCode(garage.id),
    plateNumber: toPlateDisplay(parsed.data.plateNumber),
    customerId: parsed.data.customerId,
    customerName: parsed.data.customerName,
    customerPhone: parsed.data.customerPhone,
    vehicleId: parsed.data.vehicleId,
    vehicleModel: parsed.data.vehicleModel,
    workerId: parsed.data.workerId,
    workerName: parsed.data.workerName,
    services: parsed.data.services,
    parts: parsed.data.parts ?? [],
    status: WorkOrderStatusEnum.Draft,
    priority: parsed.data.priority,
    estimatedTimeMinutes: parsed.data.estimatedTimeMinutes,
    estimatedFinish: parsed.data.estimatedTimeMinutes
      ? new Date(
          Date.now() + parsed.data.estimatedTimeMinutes * 60 * 1000
        ).toISOString()
      : undefined,
    totalAmount,
    isOverdue: false,
    timeline: [{ status: WorkOrderStatusEnum.Draft, timestamp: now }],
    notes: parsed.data.notes,
    createdAt: now,
    updatedAt: now
  };

  const created = await createGarageWorkOrder(garage.id, createdPayload);

  return response({ success: true, data: created }, 201);
}
