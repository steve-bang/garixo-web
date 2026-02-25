import type { GarageSettings } from '@/features/settings/garage-information.types';

let garageSettingsDb: GarageSettings = {
  garageName: 'Garixo Auto Center',
  industryType: 'General Repair',
  logoUrl: '',
  phone: '5553021188',
  email: 'owner@garixo.com',
  address: '812 Harbor Industrial Road, Austin, TX',
  workingHours: 'Mon - Sat: 8:00 AM - 6:00 PM',
  updatedAt: new Date().toISOString()
};

async function delay(ms: number): Promise<void> {
  await new Promise((resolve) => setTimeout(resolve, ms));
}

export async function getMockGarageSettings(): Promise<GarageSettings> {
  await delay(500);
  return garageSettingsDb;
}

export async function updateMockGarageSettings(
  input: Omit<GarageSettings, 'updatedAt'>
): Promise<GarageSettings> {
  await delay(700);
  garageSettingsDb = {
    ...input,
    updatedAt: new Date().toISOString()
  };

  return garageSettingsDb;
}
