import { redirect } from 'next/navigation';

import { SetupGarageForm } from '@/features/onboarding/components/setup-garage-form';
import { getOnboardingState } from '@/mocks/onboarding.mock';
import { auth } from '@/lib/auth';

export default async function SetupGaragePage(): Promise<JSX.Element> {
  const session = await auth();

  if (!session?.user?.id) {
    redirect('/auth/login');
  }

  const state = await getOnboardingState(session.user.id);
  if (state.garageConfigured) {
    redirect('/dashboard');
  }

  return (
    <main className="grid min-h-screen place-items-center bg-background-secondary px-s4 py-s8">
      <SetupGarageForm initialPhone={state.garage?.phone ?? '+1 (555) 210-8890'} />
    </main>
  );
}
