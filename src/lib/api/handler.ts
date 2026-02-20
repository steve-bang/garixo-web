import { NextResponse } from 'next/server';

import { normalizeError } from '@/lib/errors/app-error';
import type { ApiResponse } from '@/types/api';

export function successResponse<T>(data: T, status = 200): NextResponse<ApiResponse<T>> {
  return NextResponse.json({ success: true, data }, { status });
}

export function errorResponse(error: unknown, status = 500): NextResponse<ApiResponse<null>> {
  const normalizedError = normalizeError(error);

  return NextResponse.json(
    {
      success: false,
      error: normalizedError.message
    },
    { status: status === 500 ? normalizedError.statusCode : status }
  );
}
