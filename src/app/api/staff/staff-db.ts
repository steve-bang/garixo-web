import type { Staff } from '@/features/staff/types';

const now = new Date().toISOString();

export let staffDB: Staff[] = [
  {
    id: '1',
    fullName: 'Nguyen Van A',
    phone: '0900000000',
    email: 'a@gmail.com',
    role: 'OWNER',
    status: 'ACTIVE',
    currentJobs: 2,
    createdAt: now,
    updatedAt: now
  },
  {
    id: '2',
    fullName: 'Tran Thi B',
    phone: '0900000001',
    email: 'b@gmail.com',
    role: 'MANAGER',
    status: 'ACTIVE',
    currentJobs: 4,
    createdAt: now,
    updatedAt: now
  },
  {
    id: '3',
    fullName: 'Le Van C',
    phone: '0900000002',
    role: 'STAFF',
    status: 'ON_LEAVE',
    currentJobs: 0,
    createdAt: now,
    updatedAt: now
  }
];
