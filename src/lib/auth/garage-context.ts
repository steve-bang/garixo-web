import { auth } from '@/lib/auth';
import {
  getGarageByIdCached,
  getGarageByOwnerIdCached
} from '@/services/firebase/garage-service';
import type { GarageDocument } from '@/types/firebase-models';

type AuthSession = Awaited<ReturnType<typeof auth>>;

export async function getRequestGarageId(
  sessionInput?: AuthSession
): Promise<string | null> {
  const session = sessionInput ?? (await auth());
  if (!session?.user?.id) {
    return null;
  }

  if (session.user.garageId) {
    return session.user.garageId;
  }

  const garage = await getGarageByOwnerIdCached(session.user.id);
  return garage?.id ?? null;
}

export async function getRequestGarage(
  sessionInput?: AuthSession
): Promise<GarageDocument | null> {
  const session = sessionInput ?? (await auth());
  if (!session?.user?.id) {
    return null;
  }

  if (session.user.garageId) {
    const byId = await getGarageByIdCached(session.user.garageId);
    if (byId) {
      return byId;
    }
  }

  return getGarageByOwnerIdCached(session.user.id);
}
