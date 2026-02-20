import { notFound } from 'next/navigation';
import { JSX } from 'react';

import { getSettingsNavItems, getSettingsSection } from '@/features/settings/api';
import { SettingsModule } from '@/features/settings/components/settings-module';

type SettingsSectionPageProps = {
  params: Promise<{ section: string }>;
};

export default async function SettingsSectionPage({ params }: SettingsSectionPageProps): Promise<JSX.Element> {
  const { section } = await params;
  const sectionData = getSettingsSection(section);

  if (!sectionData) {
    notFound();
  }

  return <SettingsModule activeSectionKey={sectionData.key} navItems={getSettingsNavItems()} section={sectionData} />;
}
