export type SettingsSectionKey =
  | 'garage-information'
  | 'branch-management'
  | 'service-configuration'
  | 'inventory-settings'
  | 'notification-settings'
  | 'subscription-plan';

export type SettingsNavItem = {
  key: SettingsSectionKey;
  label: string;
  href: string;
};

export type SettingsField = {
  label: string;
  value: string;
  helperText?: string;
};

export type SettingsCard = {
  title: string;
  description: string;
  fields: SettingsField[];
};

export type SettingsSection = {
  key: SettingsSectionKey;
  title: string;
  description: string;
  cards: SettingsCard[];
};
