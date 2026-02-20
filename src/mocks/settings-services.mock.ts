import type { ServiceConfigurationItem } from '@/features/settings/service-configuration.types';

type ServiceConfigurationRecord = ServiceConfigurationItem & {
  inUse?: boolean;
};

let settingsServicesDb: ServiceConfigurationRecord[] = [
  {
    id: 'ssv-1',
    name: 'Oil Change',
    description: 'Replace engine oil and filter.',
    defaultPrice: 50,
    standardTimeMinutes: 45,
    inUse: false,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 'ssv-2',
    name: 'Brake Inspection',
    description: 'Inspect pads, discs, and brake fluid.',
    defaultPrice: 40,
    standardTimeMinutes: 30,
    inUse: false,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 'ssv-3',
    name: 'Engine Diagnostic',
    description: 'Scan and inspect engine fault signals.',
    defaultPrice: 120,
    standardTimeMinutes: 90,
    inUse: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  }
];

async function delay(ms: number): Promise<void> {
  await new Promise((resolve) => setTimeout(resolve, ms));
}

function sortByName(items: ServiceConfigurationRecord[]): ServiceConfigurationRecord[] {
  return [...items].sort((a, b) => a.name.localeCompare(b.name));
}

export async function getMockSettingsServices(): Promise<ServiceConfigurationItem[]> {
  await delay(400);
  return sortByName(settingsServicesDb).map(({ inUse: _inUse, ...service }) => service);
}

export async function createMockSettingsService(input: {
  name: string;
  description: string;
  defaultPrice: number | null;
  standardTimeMinutes: number | null;
}): Promise<ServiceConfigurationItem> {
  await delay(500);
  const next: ServiceConfigurationRecord = {
    id: `ssv-${Date.now()}`,
    name: input.name,
    description: input.description,
    defaultPrice: input.defaultPrice,
    standardTimeMinutes: input.standardTimeMinutes,
    inUse: false,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };
  settingsServicesDb = [...settingsServicesDb, next];
  const { inUse: _inUse, ...service } = next;
  return service;
}

export async function updateMockSettingsService(
  id: string,
  input: {
    name: string;
    description: string;
    defaultPrice: number | null;
    standardTimeMinutes: number | null;
  }
): Promise<ServiceConfigurationItem | null> {
  await delay(500);
  let updated: ServiceConfigurationRecord | null = null;

  settingsServicesDb = settingsServicesDb.map((item) => {
    if (item.id !== id) return item;
    updated = {
      ...item,
      name: input.name,
      description: input.description,
      defaultPrice: input.defaultPrice,
      standardTimeMinutes: input.standardTimeMinutes,
      updatedAt: new Date().toISOString()
    };
    return updated;
  });

  if (!updated) return null;
  const updatedRecord = updated as ServiceConfigurationRecord;
  const { inUse: _inUse, ...service } = updatedRecord;
  return service;
}

export async function deleteMockSettingsService(id: string): Promise<{ success: true } | { success: false; inUse: boolean }> {
  await delay(450);
  const current = settingsServicesDb.find((item) => item.id === id);
  if (!current) return { success: true };
  if (current.inUse) return { success: false, inUse: true };
  settingsServicesDb = settingsServicesDb.filter((item) => item.id !== id);
  return { success: true };
}
