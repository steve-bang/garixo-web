import type { AuthUser } from '@/features/auth/types';

export const mockUsers: Array<AuthUser & { password: string }> = [
  {
    id: '1',
    email: 'admin@garixo.com',
    phone: '0901234567',
    name: 'System Admin',
    role: 'admin',
    password: 'password123'
  },
  {
    id: '2',
    email: 'staff@garixo.com',
    phone: '0902234567',
    name: 'Garage Staff',
    role: 'staff',
    password: 'password123'
  },
  {
    id: '3',
    email: 'user@garixo.com',
    phone: '0903234567',
    name: 'Garage User',
    role: 'user',
    password: 'password123'
  }
];
