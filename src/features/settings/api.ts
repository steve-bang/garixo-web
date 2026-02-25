import { settingsSectionKeySchema } from '@/features/settings/schema';
import type {
  SettingsSection,
  SettingsSectionKey
} from '@/features/settings/types';

const settingsSections: Record<SettingsSectionKey, SettingsSection> = {
  'garage-information': {
    key: 'garage-information',
    title: 'Garage Information',
    description: 'Core business identity and customer-facing details.',
    cards: [
      {
        title: 'Business Profile',
        description:
          'Basic profile shown on invoices and customer communication.',
        fields: [
          { label: 'Garage Name', value: 'Garixo Auto Center' },
          { label: 'Business Registration ID', value: 'GXM-284-339' },
          { label: 'Primary Phone', value: '+1 (555) 302-1188' }
        ]
      },
      {
        title: 'Address & Timezone',
        description: 'Location and operating timezone used in scheduling.',
        fields: [
          { label: 'Address', value: '812 Harbor Industrial Road, Austin, TX' },
          { label: 'Timezone', value: 'America/Chicago' },
          { label: 'Operating Hours', value: 'Mon-Sat, 8:00 AM - 6:00 PM' }
        ]
      }
    ]
  },
  subscription: {
    key: 'subscription',
    title: 'Subscription',
    description: 'Plans and billing options for your garage.',
    cards: []
  }
};

export function getDefaultSettingsSection(): SettingsSectionKey {
  return 'garage-information';
}

export function getSettingsSection(section: string): SettingsSection | null {
  const parsed = settingsSectionKeySchema.safeParse(section);

  if (!parsed.success) {
    return null;
  }

  return settingsSections[parsed.data];
}
