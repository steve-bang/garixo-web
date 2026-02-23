export type Role = 'OWNER' | 'MANAGER' | 'STAFF';

export type StaffStatus = 'ACTIVE' | 'ON_LEAVE' | 'INACTIVE';

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
  createdAt: string;
  updatedAt: string;
}

export type StaffKpis = {
  totalStaff: number;
  activeToday: number;
  freeStaff: number;
  overloadedStaff: number;
};
