import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { JSX } from 'react';

import { getSettingsSection } from '@/features/settings/api';
import { SettingsModule } from '@/features/settings/components/settings-module';

type SettingsSectionPageProps = {
  params: Promise<{ section: string }>;
};

export async function generateMetadata({
  params
}: SettingsSectionPageProps): Promise<Metadata> {
  const { section } = await params;
  const sectionData = getSettingsSection(section);

  if (!sectionData) {
    return {
      title: 'Settings | Garixo',
      description: 'Manage garage settings and business preferences.'
    };
  }

  if (sectionData.key === 'subscription') {
    return {
      title: 'Subscription | Garixo',
      description:
        'Choose monthly or annual plans, review trial terms, and manage your Garixo subscription.'
    };
  }

  return {
    title: `${sectionData.title} | Garixo`,
    description: sectionData.description
  };
}

export default async function SettingsSectionPage({
  params
}: SettingsSectionPageProps): Promise<JSX.Element> {
  const { section } = await params;
  const sectionData = getSettingsSection(section);

  if (!sectionData) {
    notFound();
  }

  return <SettingsModule section={sectionData} />;
}
