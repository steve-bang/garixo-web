import { redirect } from 'next/navigation';

import { SetupGarageForm } from '@/features/onboarding/components/setup-garage-form';
import { auth } from '@/lib/auth';
import { getGarageByOwnerId } from '@/services/firebase/garage-service';
import { getUserDocument } from '@/services/firebase/user-sync-service';

export default async function SetupGaragePage(): Promise<JSX.Element> {
  const session = await auth();

  if (!session?.user?.id) {
    redirect('/auth/login');
  }

  const garage = await getGarageByOwnerId(session.user.id);
  if (garage) {
    redirect('/dashboard');
  }

  const userDoc = await getUserDocument(session.user.id);
  const initialGarageName = userDoc?.name?.trim() || undefined;

  return (
    <main className="grid min-h-screen place-items-center bg-background-secondary px-s4 py-s8">
      <SetupGarageForm initialGarageName={initialGarageName} />
    </main>
  );
}
