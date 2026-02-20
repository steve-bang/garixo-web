import { NextResponse } from 'next/server';

import { staffDB } from '@/app/api/staff/staff-db';
import { createStaffSchema, deleteStaffSchema, updateStaffSchema } from '@/features/staff/schema';
import type { Staff } from '@/features/staff/types';
import type { ApiResponse } from '@/types/api';

function response<T>(payload: ApiResponse<T>, status = 200): NextResponse<ApiResponse<T>> {
  return NextResponse.json(payload, { status });
}

function findById(id: string): Staff | undefined {
  return staffDB.find((item) => item.id === id);
}

function phoneExists(phone: string, excludeId?: string): boolean {
  return staffDB.some((item) => item.phone === phone && item.id !== excludeId);
}

export async function GET(): Promise<NextResponse<ApiResponse<Staff[]>>> {
  return response({ success: true, data: staffDB });
}

export async function POST(request: Request): Promise<NextResponse<ApiResponse<Staff>>> {
  const body = await request.json().catch(() => null);
  const parsed = createStaffSchema.safeParse(body);

  if (!parsed.success) {
    return response({ success: false, error: parsed.error.issues[0]?.message ?? 'Invalid payload' }, 400);
  }

  if (phoneExists(parsed.data.phone)) {
    return response({ success: false, error: 'Phone must be unique.' }, 409);
  }

  const now = new Date().toISOString();
  const created: Staff = {
    id: crypto.randomUUID(),
    fullName: parsed.data.fullName,
    phone: parsed.data.phone,
    email: parsed.data.email,
    avatar: parsed.data.avatar,
    role: parsed.data.role,
    status: parsed.data.status ?? 'ACTIVE',
    currentJobs: parsed.data.currentJobs ?? 0,
    branchId: parsed.data.branchId,
    createdAt: now,
    updatedAt: now
  };

  staffDB.unshift(created);

  return response({ success: true, data: created }, 201);
}

export async function PUT(request: Request): Promise<NextResponse<ApiResponse<Staff>>> {
  const body = await request.json().catch(() => null);
  const parsed = updateStaffSchema.safeParse(body);

  if (!parsed.success) {
    return response({ success: false, error: parsed.error.issues[0]?.message ?? 'Invalid payload' }, 400);
  }

  const existing = findById(parsed.data.id);

  if (!existing) {
    return response({ success: false, error: 'Staff not found.' }, 404);
  }

  if (parsed.data.phone && phoneExists(parsed.data.phone, existing.id)) {
    return response({ success: false, error: 'Phone must be unique.' }, 409);
  }

  if (parsed.data.status === 'INACTIVE' && existing.currentJobs > 0) {
    return response({ success: false, error: 'This staff has active jobs.' }, 400);
  }

  const updated: Staff = {
    ...existing,
    ...parsed.data,
    updatedAt: new Date().toISOString()
  };

  const index = staffDB.findIndex((item) => item.id === existing.id);
  staffDB[index] = updated;

  return response({ success: true, data: updated });
}

export async function DELETE(request: Request): Promise<NextResponse<ApiResponse<Staff>>> {
  const body = await request.json().catch(() => null);
  const parsed = deleteStaffSchema.safeParse(body);

  if (!parsed.success) {
    return response({ success: false, error: 'Invalid payload' }, 400);
  }

  const existing = findById(parsed.data.id);

  if (!existing) {
    return response({ success: false, error: 'Staff not found.' }, 404);
  }

  if (existing.currentJobs > 0) {
    return response({ success: false, error: 'This staff has active jobs.' }, 400);
  }

  const updated: Staff = {
    ...existing,
    status: 'INACTIVE',
    updatedAt: new Date().toISOString()
  };

  const index = staffDB.findIndex((item) => item.id === existing.id);
  staffDB[index] = updated;

  return response({ success: true, data: updated });
}
