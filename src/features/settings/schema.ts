import { z } from 'zod';

export const settingsSectionKeySchema = z.enum([
  'garage-information',
  'subscription'
]);

export type SettingsSectionKeySchema = z.infer<typeof settingsSectionKeySchema>;
