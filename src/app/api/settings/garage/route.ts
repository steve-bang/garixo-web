import { NextResponse } from 'next/server';

import { auth } from '@/lib/auth';
import type { GarageSettings } from '@/features/settings/garage-information.types';
import { firebaseAdmin } from '@/lib/firebase-admin';
import {
  getGarageByOwnerId,
  updateGarage
} from '@/services/firebase/garage-service';
import type { ApiResponse } from '@/types/api';

function response<T>(
  payload: ApiResponse<T>,
  status = 200
): NextResponse<ApiResponse<T>> {
  return NextResponse.json(payload, { status });
}

function validImageType(type: string): boolean {
  return ['image/jpeg', 'image/png', 'image/webp'].includes(type);
}

export async function GET(): Promise<
  NextResponse<ApiResponse<GarageSettings>>
> {
  const session = await auth();

  if (!session?.user?.id) {
    return response({ success: false, error: 'Unauthorized' }, 401);
  }

  const garage = await getGarageByOwnerId(session.user.id);
  if (!garage) {
    return response({ success: false, error: 'Garage not found.' }, 404);
  }

  return response({
    success: true,
    data: {
      garageName: garage.name,
      logoUrl: garage.logoUrl ?? '',
      phone: garage.phone ?? '',
      email: garage.email ?? session.user.email ?? '',
      address: garage.address ?? '',
      workingHours: garage.workingHours ?? '',
      updatedAt: garage.updatedAt
    }
  });
}

export async function PUT(
  request: Request
): Promise<NextResponse<ApiResponse<GarageSettings>>> {
  const session = await auth();

  if (!session?.user?.id) {
    return response({ success: false, error: 'Unauthorized' }, 401);
  }

  const contentType = request.headers.get('content-type') ?? '';

  if (!contentType.includes('multipart/form-data')) {
    return response({ success: false, error: 'Invalid payload format.' }, 400);
  }

  const garage = await getGarageByOwnerId(session.user.id);
  if (!garage) {
    return response({ success: false, error: 'Garage not found.' }, 404);
  }

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

  let nextLogoUrl = garage.logoUrl ?? '';

  if (removeLogo) {
    nextLogoUrl = '';
  }

  if (logoFile instanceof File && logoFile.size > 0) {
    if (!validImageType(logoFile.type)) {
      return response(
        { success: false, error: 'Only PNG/JPG/WEBP files are allowed.' },
        400
      );
    }

    if (logoFile.size > 2 * 1024 * 1024) {
      return response(
        { success: false, error: 'Logo size must be 2MB or smaller.' },
        400
      );
    }

    const buffer = Buffer.from(await logoFile.arrayBuffer());
    const bucket = firebaseAdmin.storage.bucket();
    const filePath = `garages/${garage.id}/logo.png`;
    const file = bucket.file(filePath);
    await file.save(buffer, {
      contentType: logoFile.type,
      resumable: false,
      metadata: {
        cacheControl: 'public,max-age=3600'
      }
    });

    const [signedUrl] = await file.getSignedUrl({
      action: 'read',
      expires: '03-01-2035'
    });
    nextLogoUrl = signedUrl;
  }

  const updatedGarage = await updateGarage(garage.id, {
    name: garageName,
    address,
    phone,
    email,
    workingHours,
    logoUrl: nextLogoUrl || ''
  });

  return response({
    success: true,
    data: {
      garageName: updatedGarage.name,
      logoUrl: updatedGarage.logoUrl ?? '',
      phone: updatedGarage.phone ?? '',
      email: updatedGarage.email ?? email,
      address: updatedGarage.address ?? '',
      workingHours: updatedGarage.workingHours ?? workingHours,
      updatedAt: updatedGarage.updatedAt
    }
  });
}
