import { NextResponse } from 'next/server';
import { z } from 'zod';

import { mockUsers } from '@/lib/auth/mock-users';
import type { ApiResponse } from '@/types/api';

const registerSchema = z.object({
  garageName: z.string().trim().min(2, 'Garage name is required.'),
  phone: z
    .string()
    .trim()
    .min(9, 'Phone number must be at least 9 digits.')
    .regex(/^\+?[\d\s-]{9,}$/, 'Enter a valid phone number.'),
  password: z.string().min(6, 'Password must be at least 6 characters.')
});

type RegisterResponse = {
  email: string;
};

function response<T>(payload: ApiResponse<T>, status = 200): NextResponse<ApiResponse<T>> {
  return NextResponse.json(payload, { status });
}

export async function POST(request: Request): Promise<NextResponse<ApiResponse<RegisterResponse>>> {
  const body = await request.json().catch(() => null);
  const parsed = registerSchema.safeParse(body);

  if (!parsed.success) {
    return response({ success: false, error: parsed.error.issues[0]?.message ?? 'Invalid input.' }, 400);
  }

  const normalizedPhone = parsed.data.phone.replace(/\D/g, '');
  const duplicate = mockUsers.find((user) => user.phone.replace(/\D/g, '') === normalizedPhone);

  if (duplicate) {
    return response({ success: false, error: 'Phone number already exists.' }, 409);
  }

  const nextId = String(mockUsers.length + 1);
  const garageSlug = parsed.data.garageName
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .trim()
    .replace(/\s+/g, '.');
  const generatedEmail = `${garageSlug || `garage.${nextId}`}@garixo.local`.trim().toLowerCase();

  mockUsers.push({
    id: nextId,
    name: parsed.data.garageName,
    phone: parsed.data.phone,
    email: generatedEmail,
    role: 'user',
    password: parsed.data.password
  });

  return response(
    {
      success: true,
      data: {
        email: generatedEmail
      }
    },
    201
  );
}
