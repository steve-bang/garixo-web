import { fetchUsers } from '@/features/user/api';
import type { User } from '@/features/user/types';

export class UserService {
  static async getAll(): Promise<User[]> {
    return fetchUsers();
  }
}
