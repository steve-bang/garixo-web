import { z } from 'zod';

export const settingsSectionKeySchema = z.enum([
  'garage-information',
  'service-configuration'
]);

export type SettingsSectionKeySchema = z.infer<typeof settingsSectionKeySchema>;
