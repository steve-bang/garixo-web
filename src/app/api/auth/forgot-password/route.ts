import { NextResponse } from 'next/server';
import { z } from 'zod';

import type { ApiResponse } from '@/types/api';

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const phonePattern = /^\+?[\d\s-]{9,}$/;

const forgotPasswordSchema = z.object({
  identifier: z
    .string()
    .trim()
    .min(1, 'Phone number or email is required.')
    .refine((value) => emailPattern.test(value) || phonePattern.test(value), 'Enter a valid phone number or email.')
});

function response<T>(payload: ApiResponse<T>, status = 200): NextResponse<ApiResponse<T>> {
  return NextResponse.json(payload, { status });
}

export async function POST(request: Request): Promise<NextResponse<ApiResponse<{ accepted: true }>>> {
  const body = await request.json().catch(() => null);
  const parsed = forgotPasswordSchema.safeParse(body);

  if (!parsed.success) {
    return response({ success: false, error: parsed.error.issues[0]?.message ?? 'Invalid input.' }, 400);
  }

  return response({
    success: true,
    data: { accepted: true }
  });
}
