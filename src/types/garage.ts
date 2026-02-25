export const garageIndustryTypes = [
  'General Repair',
  'Tire Shop',
  'Quick Lube',
  'Mobile Mechanic',
  'Other'
] as const;

export type GarageIndustryType = (typeof garageIndustryTypes)[number];
