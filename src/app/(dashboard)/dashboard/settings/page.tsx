import { redirect } from 'next/navigation';

import { getDefaultSettingsSection } from '@/features/settings/api';

export default function SettingsPage(): never {
  redirect(`/dashboard/settings/${getDefaultSettingsSection()}`);
}
