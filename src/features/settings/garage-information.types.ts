import type { GarageIndustryType } from '@/types/garage';

export interface GarageSettings {
  garageName: string;
  industryType: GarageIndustryType;
  logoUrl?: string;
  phone?: string;
  email?: string;
  address?: string;
  workingHours?: string;
  updatedAt: string;
}

export interface UpdateGarageSettingsInput {
  garageName: string;
  industryType: GarageIndustryType;
  phone?: string;
  email?: string;
  address?: string;
  workingHours?: string;
  logoFile?: File | null;
  removeLogo?: boolean;
}
