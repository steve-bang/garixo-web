export type GarageProfile = {
  garageName: string;
  address?: string;
  phone: string;
};

export type QuickWorkOrder = {
  id: string;
  customerName: string;
  licensePlate: string;
  service?: string;
  notes?: string;
  createdAt: string;
};

export type OnboardingState = {
  garageConfigured: boolean;
  garage?: GarageProfile;
  workOrders: QuickWorkOrder[];
};

export type SetupGarageInput = {
  garageName: string;
  address?: string;
  phone: string;
};

export type CreateQuickWorkOrderInput = {
  customerName: string;
  licensePlate: string;
  service?: string;
  notes?: string;
};
