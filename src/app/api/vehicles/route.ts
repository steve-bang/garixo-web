import { NextResponse } from 'next/server';

import {
  createVehicleSchema,
  vehiclesListQuerySchema
} from '@/features/vehicles/schema';
import type { Vehicle, VehicleListResponse } from '@/features/vehicles/types';
import { normalizePlate, toPlateDisplay } from '@/features/vehicles/utils';
import { auth } from '@/lib/auth';
import { getRequestGarageId } from '@/lib/auth/garage-context';
import {
  createGarageVehicle,
  findGarageVehicleByNormalizedPlate,
  listGarageVehicles
} from '@/services/firebase/vehicles-service';
import type { ApiResponse } from '@/types/api';

function response<T>(
  payload: ApiResponse<T>,
  status = 200
): NextResponse<ApiResponse<T>> {
  return NextResponse.json(payload, { status });
}

function statusPriority(status: Vehicle['status']): number {
  if (status === 'IN_SERVICE') {
    return 0;
  }

  return 1;
}

function brandKey(
  brand?: string
): 'TOYOTA' | 'HONDA' | 'HYUNDAI' | 'FORD' | 'OTHER' {
  const value = (brand ?? '').trim().toUpperCase();
  if (
    value === 'TOYOTA' ||
    value === 'HONDA' ||
    value === 'HYUNDAI' ||
    value === 'FORD'
  ) {
    return value;
  }

  return 'OTHER';
}

export async function GET(
  request: Request
): Promise<NextResponse<ApiResponse<VehicleListResponse>>> {
  const session = await auth();
  if (!session?.user?.id) {
    return response({ success: false, error: 'Unauthorized' }, 401);
  }

  const garageId = await getRequestGarageId(session);
  if (!garageId) {
    return response({ success: false, error: 'Garage not found.' }, 404);
  }

  const url = new URL(request.url);

  const parsed = vehiclesListQuerySchema.safeParse({
    search: url.searchParams.get('search') ?? undefined,
    brand: url.searchParams.get('brand') ?? undefined,
    status: url.searchParams.get('status') ?? undefined,
    customerId: url.searchParams.get('customerId') ?? undefined,
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

  const { search, brand, status, customerId, page, pageSize } = parsed.data;

  let filtered = await listGarageVehicles(garageId);

  if (search) {
    const needle = search.toLowerCase().trim();
    const normalizedNeedle = normalizePlate(needle);

    filtered = filtered
      .filter((item) => {
        const plate = item.plateNumber.toLowerCase();
        const normalizedPlate = normalizePlate(item.plateNumber);

        return (
          plate.includes(needle) ||
          normalizedPlate.includes(normalizedNeedle) ||
          item.customerName.toLowerCase().includes(needle) ||
          item.customerPhone.toLowerCase().includes(needle)
        );
      })
      .sort((a, b) => {
        const aNorm = normalizePlate(a.plateNumber);
        const bNorm = normalizePlate(b.plateNumber);

        const score = (value: string): number => {
          if (!normalizedNeedle) return 2;
          if (value.startsWith(normalizedNeedle)) return 0;
          if (value.includes(normalizedNeedle)) return 1;
          return 2;
        };

        const aScore = score(aNorm);
        const bScore = score(bNorm);

        if (aScore !== bScore) {
          return aScore - bScore;
        }

        return (
          (b.lastServiceDate ? new Date(b.lastServiceDate).getTime() : 0) -
          (a.lastServiceDate ? new Date(a.lastServiceDate).getTime() : 0)
        );
      });
  } else {
    filtered.sort((a, b) => {
      const statusDiff = statusPriority(a.status) - statusPriority(b.status);
      if (statusDiff !== 0) return statusDiff;

      return (
        (b.lastServiceDate ? new Date(b.lastServiceDate).getTime() : 0) -
        (a.lastServiceDate ? new Date(a.lastServiceDate).getTime() : 0)
      );
    });
  }

  if (brand) {
    filtered = filtered.filter((item) => brandKey(item.brand) === brand);
  }

  if (status) {
    filtered = filtered.filter((item) => item.status === status);
  }

  if (customerId) {
    filtered = filtered.filter((item) => item.customerId === customerId);
  }

  const total = filtered.length;
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  const safePage = Math.min(page, totalPages);
  const start = (safePage - 1) * pageSize;
  const items = filtered.slice(start, start + pageSize);

  return response({
    success: true,
    data: {
      items,
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
): Promise<NextResponse<ApiResponse<Vehicle>>> {
  const session = await auth();
  if (!session?.user?.id) {
    return response({ success: false, error: 'Unauthorized' }, 401);
  }

  const garageId = await getRequestGarageId(session);
  if (!garageId) {
    return response({ success: false, error: 'Garage not found.' }, 404);
  }

  const body = await request.json().catch(() => null);
  const parsed = createVehicleSchema.safeParse(body);

  if (!parsed.success) {
    return response(
      {
        success: false,
        error: parsed.error.issues[0]?.message ?? 'Invalid payload.'
      },
      400
    );
  }

  const duplicate = await findGarageVehicleByNormalizedPlate(
    garageId,
    parsed.data.plateNumber
  );

  if (duplicate) {
    return response(
      { success: false, error: 'Plate number already exists.' },
      409
    );
  }

  const created = await createGarageVehicle(garageId, {
    plateNumber: toPlateDisplay(parsed.data.plateNumber),
    brand: parsed.data.brand,
    model: parsed.data.model,
    year: parsed.data.year,
    color: parsed.data.color,
    vin: parsed.data.vin,
    customerId: parsed.data.customerId,
    customerName: parsed.data.customerName,
    customerPhone: parsed.data.customerPhone,
    status: parsed.data.status,
    totalVisits: 0,
    totalSpent: 0,
    lastServiceDate: undefined,
    notes: parsed.data.notes
  });

  return response({ success: true, data: created }, 201);
}
