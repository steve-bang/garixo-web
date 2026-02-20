import { NextResponse } from 'next/server';

import type { ApiResponse } from '@/types/api';

function response<T>(payload: ApiResponse<T>, status = 200): NextResponse<ApiResponse<T>> {
  return NextResponse.json(payload, { status });
}

export async function POST(): Promise<NextResponse<ApiResponse<{ success: boolean }>>> {
  const res = response({ success: true, data: { success: true } });

  const expired = 'Thu, 01 Jan 1970 00:00:00 GMT';
  res.headers.append('Set-Cookie', `next-auth.session-token=; Path=/; Expires=${expired}; HttpOnly; SameSite=Lax`);
  res.headers.append('Set-Cookie', `__Secure-next-auth.session-token=; Path=/; Expires=${expired}; HttpOnly; Secure; SameSite=Lax`);
  res.headers.append('Set-Cookie', `next-auth.csrf-token=; Path=/; Expires=${expired}; SameSite=Lax`);

  return res;
}
