import { NextResponse } from 'next/server';

import { auth } from '@/lib/auth';
import { getMockGarageSettings, updateMockGarageSettings } from '@/mocks/garage-settings.mock';
import type { GarageSettings } from '@/features/settings/garage-information.types';
import type { ApiResponse } from '@/types/api';

function response<T>(payload: ApiResponse<T>, status = 200): NextResponse<ApiResponse<T>> {
  return NextResponse.json(payload, { status });
}

function validImageType(type: string): boolean {
  return ['image/jpeg', 'image/png', 'image/webp'].includes(type);
}

export async function GET(): Promise<NextResponse<ApiResponse<GarageSettings>>> {
  const session = await auth();

  if (!session?.user) {
    return response({ success: false, error: 'Unauthorized' }, 401);
  }

  const settings = await getMockGarageSettings();
  return response({ success: true, data: settings });
}

export async function PUT(request: Request): Promise<NextResponse<ApiResponse<GarageSettings>>> {
  const session = await auth();

  if (!session?.user) {
    return response({ success: false, error: 'Unauthorized' }, 401);
  }

  const contentType = request.headers.get('content-type') ?? '';

  if (!contentType.includes('multipart/form-data')) {
    return response({ success: false, error: 'Invalid payload format.' }, 400);
  }

  const current = await getMockGarageSettings();
  const formData = await request.formData();
  const garageName = String(formData.get('garageName') ?? '').trim();
  const phone = String(formData.get('phone') ?? '').trim();
  const email = String(formData.get('email') ?? '').trim();
  const address = String(formData.get('address') ?? '').trim();
  const workingHours = String(formData.get('workingHours') ?? '').trim();
  const removeLogo = String(formData.get('removeLogo') ?? 'false') === 'true';
  const logoFile = formData.get('logoFile');

  if (!garageName) {
    return response({ success: false, error: 'Garage name is required.' }, 400);
  }

  let nextLogoUrl = current.logoUrl;

  if (removeLogo) {
    nextLogoUrl = '';
  }

  if (logoFile instanceof File && logoFile.size > 0) {
    if (!validImageType(logoFile.type)) {
      return response({ success: false, error: 'Only PNG/JPG/WEBP files are allowed.' }, 400);
    }

    if (logoFile.size > 2 * 1024 * 1024) {
      return response({ success: false, error: 'Logo size must be 2MB or smaller.' }, 400);
    }

    const buffer = Buffer.from(await logoFile.arrayBuffer());
    nextLogoUrl = `data:${logoFile.type};base64,${buffer.toString('base64')}`;
  }

  const updated = await updateMockGarageSettings({
    garageName,
    logoUrl: nextLogoUrl || '',
    phone,
    email,
    address,
    workingHours
  });

  return response({ success: true, data: updated });
}
