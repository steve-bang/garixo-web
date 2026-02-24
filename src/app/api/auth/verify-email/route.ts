import { NextResponse } from 'next/server';
import { z } from 'zod';

import { env } from '@/config/env';
import { verifyEmailToken } from '@/services/verification.service';

const querySchema = z.object({
  uid: z.string().trim().min(1),
  token: z.string().trim().min(32)
});

function redirectToVerifyPage(
  status: 'success' | 'expired' | 'invalid',
  email?: string
) {
  const url = new URL('/verify-email', env.NEXTAUTH_URL);
  url.searchParams.set('status', status);
  if (email) {
    url.searchParams.set('email', email);
  }
  return NextResponse.redirect(url);
}

export async function GET(request: Request): Promise<NextResponse> {
  const requestUrl = new URL(request.url);
  const parsed = querySchema.safeParse({
    uid: requestUrl.searchParams.get('uid'),
    token: requestUrl.searchParams.get('token')
  });

  if (!parsed.success) {
    return redirectToVerifyPage('invalid');
  }

  const result = await verifyEmailToken(parsed.data);

  if (result.status === 'success' || result.status === 'already_verified') {
    return redirectToVerifyPage('success', result.email);
  }

  if (result.status === 'expired') {
    return redirectToVerifyPage('expired', result.email);
  }

  return redirectToVerifyPage('invalid', result.email);
}
