export type ServiceConfigurationItem = {
  id: string;
  name: string;
  description: string;
  defaultPrice: number | null;
  standardTimeMinutes: number | null;
  createdAt: string;
  updatedAt: string;
};

export type UpsertServiceConfigurationInput = {
  name: string;
  description: string;
  defaultPrice: number | null;
  standardTimeMinutes: number | null;
};
