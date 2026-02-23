import { NextResponse } from 'next/server';

import {
  createStaffSchema,
  deleteStaffSchema,
  updateStaffSchema
} from '@/features/staff/schema';
import type { Staff } from '@/features/staff/types';
import { getRequestGarageId } from '@/lib/auth/garage-context';
import {
  createGarageStaff,
  deleteGarageStaff,
  findGarageStaffById,
  isGarageStaffPhoneExists,
  listGarageStaff,
  updateGarageStaff
} from '@/services/firebase/staff-service';
import type { ApiResponse } from '@/types/api';

function response<T>(
  payload: ApiResponse<T>,
  status = 200
): NextResponse<ApiResponse<T>> {
  return NextResponse.json(payload, { status });
}

export async function GET(): Promise<NextResponse<ApiResponse<Staff[]>>> {
  const garageId = await getRequestGarageId();
  if (!garageId) {
    return response({ success: false, error: 'Unauthorized' }, 401);
  }

  const items = await listGarageStaff(garageId);
  return response({ success: true, data: items });
}

export async function POST(
  request: Request
): Promise<NextResponse<ApiResponse<Staff>>> {
  const garageId = await getRequestGarageId();
  if (!garageId) {
    return response({ success: false, error: 'Unauthorized' }, 401);
  }

  const body = await request.json().catch(() => null);
  const parsed = createStaffSchema.safeParse(body);

  if (!parsed.success) {
    return response(
      {
        success: false,
        error: parsed.error.issues[0]?.message ?? 'Invalid payload'
      },
      400
    );
  }

  if (await isGarageStaffPhoneExists(garageId, parsed.data.phone)) {
    return response({ success: false, error: 'Phone must be unique.' }, 409);
  }

  const created = await createGarageStaff(garageId, {
    fullName: parsed.data.fullName,
    phone: parsed.data.phone,
    email: parsed.data.email,
    avatar: parsed.data.avatar,
    role: parsed.data.role,
    status: parsed.data.status ?? 'ACTIVE',
    currentJobs: parsed.data.currentJobs ?? 0,
    branchId: parsed.data.branchId
  });

  return response({ success: true, data: created }, 201);
}

export async function PUT(
  request: Request
): Promise<NextResponse<ApiResponse<Staff>>> {
  const garageId = await getRequestGarageId();
  if (!garageId) {
    return response({ success: false, error: 'Unauthorized' }, 401);
  }

  const body = await request.json().catch(() => null);
  const parsed = updateStaffSchema.safeParse(body);

  if (!parsed.success) {
    return response(
      {
        success: false,
        error: parsed.error.issues[0]?.message ?? 'Invalid payload'
      },
      400
    );
  }

  const existing = await findGarageStaffById(garageId, parsed.data.id);

  if (!existing) {
    return response({ success: false, error: 'Staff not found.' }, 404);
  }

  if (
    parsed.data.phone &&
    (await isGarageStaffPhoneExists(garageId, parsed.data.phone, existing.id))
  ) {
    return response({ success: false, error: 'Phone must be unique.' }, 409);
  }

  const nextCurrentJobs = parsed.data.currentJobs ?? existing.currentJobs;
  if (parsed.data.status === 'INACTIVE' && nextCurrentJobs > 0) {
    return response(
      { success: false, error: 'This staff has active jobs.' },
      400
    );
  }

  const updated = await updateGarageStaff(
    garageId,
    parsed.data.id,
    parsed.data
  );
  if (!updated) {
    return response({ success: false, error: 'Staff not found.' }, 404);
  }

  return response({ success: true, data: updated });
}

export async function DELETE(
  request: Request
): Promise<NextResponse<ApiResponse<Staff>>> {
  const garageId = await getRequestGarageId();
  if (!garageId) {
    return response({ success: false, error: 'Unauthorized' }, 401);
  }

  const body = await request.json().catch(() => null);
  const parsed = deleteStaffSchema.safeParse(body);

  if (!parsed.success) {
    return response(
      { success: false, error: 'Could not process this request.' },
      400
    );
  }

  const existing = await findGarageStaffById(garageId, parsed.data.id);

  if (!existing) {
    return response({ success: false, error: 'Staff member not found.' }, 404);
  }

  if (existing.currentJobs > 0) {
    return response(
      {
        success: false,
        error:
          'This staff member still has active jobs. Please complete or reassign jobs first.'
      },
      400
    );
  }

  const deleted = await deleteGarageStaff(garageId, parsed.data.id);
  if (!deleted) {
    return response({ success: false, error: 'Staff member not found.' }, 404);
  }

  return response({ success: true, data: deleted });
}
