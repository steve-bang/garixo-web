'use client';

import { LoadingState } from '@/components/common/loading-state';
import { Card } from '@/components/ui/card';
import { useUsers } from '@/features/user/hooks';

export function UserList(): JSX.Element {
  const usersQuery = useUsers();

  if (usersQuery.isLoading) {
    return <LoadingState label="Loading users..." />;
  }

  if (usersQuery.isError) {
    return <p className="text-small text-state-error">Failed to load users</p>;
  }

  return (
    <Card className="overflow-hidden p-0">
      <table className="w-full text-left text-small">
        <thead className="bg-table-header text-table-header-text">
          <tr>
            <th className="px-s4 py-s3 font-semibold">Name</th>
            <th className="px-s4 py-s3 font-semibold">Email</th>
            <th className="px-s4 py-s3 font-semibold">Role</th>
          </tr>
        </thead>
        <tbody>
          {usersQuery.data?.map((user) => (
            <tr key={user.id} className="border-t border-border bg-surface-default text-text-primary hover:bg-surface-hover">
              <td className="px-s4 py-s3">{user.name}</td>
              <td className="px-s4 py-s3">{user.email}</td>
              <td className="px-s4 py-s3 uppercase text-caption tracking-wide text-text-secondary">{user.role}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </Card>
  );
}
