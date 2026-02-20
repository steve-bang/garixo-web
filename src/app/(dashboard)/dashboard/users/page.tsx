import { UserList } from '@/features/user/components/user-list';
import { JSX } from 'react';

export default function UsersPage(): JSX.Element {
  return (
    <div className="space-y-s4">
      <h1 className="text-h1">Users</h1>
      <UserList />
    </div>
  );
}
