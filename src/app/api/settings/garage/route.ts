import { NextResponse } from 'next/server';
import { z } from 'zod';

import { auth } from '@/lib/auth';
import { getRequestGarage } from '@/lib/auth/garage-context';
import type { GarageSettings } from '@/features/settings/garage-information.types';
import {
  CdnValidationError,
  uploadGarageLogoToCdn
} from '@/services/cdn/firebase-cdn-service';
import { updateGarage } from '@/services/firebase/garage-service';
import { garageIndustryTypes } from '@/types/garage';
import type { ApiResponse } from '@/types/api';

const industryTypeSchema = z.enum(garageIndustryTypes);

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

  const garage = await getRequestGarage(session);
  if (!garage) {
    return response({ success: false, error: 'Garage not found.' }, 404);
  }

  return response({
    success: true,
    data: {
      garageName: garage.name,
      industryType: garage.industryType ?? 'General Repair',
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

  const garage = await getRequestGarage(session);
  if (!garage) {
    return response({ success: false, error: 'Garage not found.' }, 404);
  }

  const formData = await request.formData();
  const garageName = String(formData.get('garageName') ?? '').trim();
  const industryTypeRaw = String(
    formData.get('industryType') ?? 'General Repair'
  ).trim();
  const phone = String(formData.get('phone') ?? '').trim();
  const email = String(formData.get('email') ?? '').trim();
  const address = String(formData.get('address') ?? '').trim();
  const workingHours = String(formData.get('workingHours') ?? '').trim();
  const removeLogo = String(formData.get('removeLogo') ?? 'false') === 'true';
  const logoFile = formData.get('logoFile');

  if (!garageName) {
    return response({ success: false, error: 'Garage name is required.' }, 400);
  }

  const parsedIndustryType = industryTypeSchema.safeParse(industryTypeRaw);
  if (!parsedIndustryType.success) {
    return response(
      { success: false, error: 'Industry type is invalid.' },
      400
    );
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

    try {
      const uploaded = await uploadGarageLogoToCdn({
        garageId: garage.id,
        file: logoFile
      });
      nextLogoUrl = uploaded.url;
    } catch (error) {
      if (error instanceof CdnValidationError) {
        return response({ success: false, error: error.message }, 400);
      }
      return response(
        { success: false, error: 'Could not upload logo right now.' },
        500
      );
    }
  }

  const updatedGarage = await updateGarage(garage.id, {
    name: garageName,
    industryType: parsedIndustryType.data,
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
      industryType: updatedGarage.industryType ?? parsedIndustryType.data,
      logoUrl: updatedGarage.logoUrl ?? '',
      phone: updatedGarage.phone ?? '',
      email: updatedGarage.email ?? email,
      address: updatedGarage.address ?? '',
      workingHours: updatedGarage.workingHours ?? workingHours,
      updatedAt: updatedGarage.updatedAt
    }
  });
}
