import type { ISODateString, Role } from '@/types/primitives';
export type { Role } from '@/types/primitives';

export const STAFF_STATUS_VALUES = ['ACTIVE', 'ON_LEAVE', 'INACTIVE'] as const;

export type StaffStatus = (typeof STAFF_STATUS_VALUES)[number];

export interface Staff {
  id: string;
  fullName: string;
  phone: string;
  email?: string;
  avatar?: string;
  role: Role;
  status: StaffStatus;
  currentJobs: number;
  completedJobs?: number;
  branchId?: string;
  createdAt: ISODateString;
  updatedAt: ISODateString;
}

export type StaffKpis = {
  totalStaff: number;
  activeToday: number;
  freeStaff: number;
  overloadedStaff: number;
};
