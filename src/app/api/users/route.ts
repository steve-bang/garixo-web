import { NextResponse } from 'next/server';

import { auth } from '@/lib/auth';
import { mockUsers } from '@/lib/auth/mock-users';
import { errorResponse, successResponse } from '@/lib/api/handler';

export async function GET(): Promise<NextResponse> {
  try {
    const session = await auth();

    if (!session?.user) {
      return errorResponse(new Error('Unauthorized'), 401);
    }

    return successResponse(
      mockUsers.map(({ password, ...user }) => user)
    );
  } catch (error) {
    return errorResponse(error);
  }
}
