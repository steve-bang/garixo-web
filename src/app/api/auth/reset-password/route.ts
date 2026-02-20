import { NextResponse } from 'next/server';
import { z } from 'zod';

import type { ApiResponse } from '@/types/api';

const resetSchema = z.object({
  password: z.string().min(6, 'Password must be at least 6 characters.'),
  token: z.string().optional()
});

function response<T>(payload: ApiResponse<T>, status = 200): NextResponse<ApiResponse<T>> {
  return NextResponse.json(payload, { status });
}

export async function POST(request: Request): Promise<NextResponse<ApiResponse<{ updated: true }>>> {
  const body = await request.json().catch(() => null);
  const parsed = resetSchema.safeParse(body);

  if (!parsed.success) {
    return response({ success: false, error: parsed.error.issues[0]?.message ?? 'Invalid input.' }, 400);
  }

  return response({
    success: true,
    data: {
      updated: true
    }
  });
}
