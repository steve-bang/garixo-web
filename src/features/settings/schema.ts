import { z } from 'zod';

export const settingsSectionKeySchema = z.enum([
  'garage-information',
  'branch-management',
  'service-configuration',
  'inventory-settings',
  'notification-settings',
  'subscription-plan'
]);

export type SettingsSectionKeySchema = z.infer<typeof settingsSectionKeySchema>;
