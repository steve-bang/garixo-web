import { NextResponse } from 'next/server';
import { z } from 'zod';

import { sendSmtpEmail } from '@/lib/email/smtp-client';
import { buildForgotPasswordEmailTemplate } from '@/lib/email/templates/forgot-password-template';
import { firebaseAdmin } from '@/lib/firebase-admin';
import type { ApiResponse } from '@/types/api';

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const forgotPasswordSchema = z.object({
  identifier: z
    .string()
    .trim()
    .min(1, 'Email address is required.')
    .refine((value) => emailPattern.test(value), 'Enter a valid email address.')
});

function response<T>(
  payload: ApiResponse<T>,
  status = 200
): NextResponse<ApiResponse<T>> {
  return NextResponse.json(payload, { status });
}

// Generate password temporary with max 8 chararacters.
function generateTemporaryPassword(): string {
  const chars =
    'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz23456789!@#$%';
  let password = '';
  for (let index = 0; index < 8; index += 1) {
    password += chars[Math.floor(Math.random() * chars.length)];
  }
  return password;
}

export async function POST(
  request: Request
): Promise<NextResponse<ApiResponse<{ accepted: true }>>> {
  const body = await request.json().catch(() => null);
  const parsed = forgotPasswordSchema.safeParse(body);

  if (!parsed.success) {
    return response(
      {
        success: false,
        error: parsed.error.issues[0]?.message ?? 'Invalid input.'
      },
      400
    );
  }

  const email = parsed.data.identifier.toLowerCase();

  /**
   * Keep response generic to prevent account enumeration.
   * If account exists, we send an owner-friendly password reset email.
   */
  try {
    const userRecord = await firebaseAdmin.auth.getUserByEmail(email);
    const temporaryPassword = generateTemporaryPassword();

    await firebaseAdmin.auth.updateUser(userRecord.uid, {
      password: temporaryPassword
    });

    const template = buildForgotPasswordEmailTemplate({
      recipientEmail: email,
      requestedAt: new Date(),
      newPassword: temporaryPassword
    });

    await sendSmtpEmail({
      to: email,
      subject: template.subject,
      text: template.text,
      html: template.html
    });
  } catch {
    // Intentionally ignored to keep a generic response for privacy and safety.
  }

  return response({
    success: true,
    data: { accepted: true }
  });
}
