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

  if (sectionData.key === 'invoice-settings') {
    return {
      title: 'Invoice Settings | Garixo',
      description:
        'Manage default tax and payment terms to send clean and consistent invoices.'
    };
  }

  if (sectionData.key === 'support') {
    return {
      title: 'Support | Garixo',
      description:
        'Report product issues, ask questions, and request features from your dashboard.'
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
