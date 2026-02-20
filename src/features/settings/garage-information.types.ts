export interface GarageSettings {
  garageName: string;
  logoUrl?: string;
  phone?: string;
  email?: string;
  address?: string;
  workingHours?: string;
  updatedAt: string;
}

export interface UpdateGarageSettingsInput {
  garageName: string;
  phone?: string;
  email?: string;
  address?: string;
  workingHours?: string;
  logoFile?: File | null;
  removeLogo?: boolean;
}
