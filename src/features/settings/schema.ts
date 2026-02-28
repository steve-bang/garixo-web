import { z } from 'zod';

export const settingsSectionKeySchema = z.enum([
  'garage-information',
  'subscription',
  'invoice-settings'
]);

export type SettingsSectionKeySchema = z.infer<typeof settingsSectionKeySchema>;
