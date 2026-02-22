export type FirebaseRole = 'owner' | 'staff' | 'admin' | 'user';

export interface UserDocument {
  id: string;
  email: string;
  name: string;
  role: FirebaseRole;
  createdAt: string;
}

export interface GarageDocument {
  id: string;
  ownerUserId: string;
  name: string;
  address?: string;
  phone?: string;
  email?: string;
  workingHours?: string;
  logoUrl?: string;
  createdAt: string;
  updatedAt: string;
}

export interface GarageServiceDocument {
  id: string;
  name: string;
  description: string;
  defaultPrice: number | null;
  standardDuration: number | null;
  createdAt: string;
  updatedAt: string;
}

export type WorkOrderStatus =
  | 'OPEN'
  | 'IN_PROGRESS'
  | 'READY'
  | 'COMPLETED'
  | 'CANCELLED';

export interface GarageWorkOrderDocument {
  id: string;
  customerName: string;
  licensePlate: string;
  serviceId?: string;
  service?: string;
  notes?: string;
  status: WorkOrderStatus;
  createdAt: string;
  updatedAt: string;
}
