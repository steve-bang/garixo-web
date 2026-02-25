export type SettingsSectionKey = 'garage-information';

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
