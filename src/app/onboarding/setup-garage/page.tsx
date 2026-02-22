import { redirect } from 'next/navigation';

import { SetupGarageForm } from '@/features/onboarding/components/setup-garage-form';
import { auth } from '@/lib/auth';
import { getGarageByOwnerId } from '@/services/firebase/garage-service';

export default async function SetupGaragePage(): Promise<JSX.Element> {
  const session = await auth();

  if (!session?.user?.id) {
    redirect('/auth/login');
  }

  const garage = await getGarageByOwnerId(session.user.id);
  if (garage) {
    redirect('/dashboard');
  }

  return (
    <main className="grid min-h-screen place-items-center bg-background-secondary px-s4 py-s8">
      <SetupGarageForm initialPhone="+1 (555) 210-8890" />
    </main>
  );
}
