'use client';

import { useMemo, useState } from 'react';

import { LoadingState } from '@/components/common/loading-state';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { UserDetailDrawer } from '@/features/user/components/user-detail-drawer';
import { toUserKpis, useUsers } from '@/features/user/hooks';
import type { UserListItem } from '@/features/user/types';
import { useAuth } from '@/features/auth/hooks';
import { formatDate } from '@/lib/utils/format';

function formatUserDate(value?: string | null): string {
  return formatDate(value, {
    locale: 'en-US',
    options: {
      month: 'short',
      day: '2-digit',
      year: 'numeric'
    }
  });
}

function roleLabel(role: string): string {
  return role.charAt(0).toUpperCase() + role.slice(1);
}

export function UsersManagementPage(): JSX.Element {
  const { role, status } = useAuth();
  const usersQuery = useUsers();
  const [selectedUser, setSelectedUser] = useState<UserListItem | null>(null);

  const users = usersQuery.data ?? [];
  const kpis = useMemo(() => toUserKpis(users), [users]);

  if (status === 'loading' || usersQuery.isLoading) {
    return <LoadingState label="Loading users..." />;
  }

  if (role !== 'admin') {
    return (
      <Card className="p-s4">
        <p className="text-small text-text-secondary">
          This page is available for administrators only.
        </p>
      </Card>
    );
  }

  if (usersQuery.isError) {
    return (
      <Card className="p-s4">
        <p className="text-small text-state-error">
          We could not load users right now. Please try again.
        </p>
      </Card>
    );
  }

  return (
    <div className="space-y-s4">
      <header>
        <h1 className="text-h1">User Management</h1>
        <p className="text-small text-text-muted">
          View your team accounts and account status in one place.
        </p>
      </header>

      <section className="grid gap-s3 md:grid-cols-3">
        <Card className="p-s4">
          <p className="text-caption text-text-muted">Active Users</p>
          <p className="mt-s1 text-h2 text-text-primary">{kpis.activeUsers}</p>
        </Card>
        <Card className="p-s4">
          <p className="text-caption text-text-muted">Verified Emails</p>
          <p className="mt-s1 text-h2 text-text-primary">
            {kpis.verifiedUsers}
          </p>
        </Card>
        <Card className="p-s4">
          <p className="text-caption text-text-muted">Total Users</p>
          <p className="mt-s1 text-h2 text-text-primary">{kpis.totalUsers}</p>
        </Card>
      </section>

      <Card className="overflow-hidden p-0">
        {users.length === 0 ? (
          <div className="grid min-h-[220px] place-items-center p-s6 text-center">
            <div className="space-y-s2">
              <h3 className="text-h3">No users yet</h3>
              <p className="text-small text-text-muted">
                When your team signs in, user accounts will appear here
                automatically.
              </p>
            </div>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[860px] text-left text-small">
              <thead className="bg-table-header text-table-header-text">
                <tr>
                  <th className="px-s4 py-s3 font-semibold">Name</th>
                  <th className="px-s4 py-s3 font-semibold">Email</th>
                  <th className="px-s4 py-s3 font-semibold">Role</th>
                  <th className="px-s4 py-s3 font-semibold">Status</th>
                  <th className="px-s4 py-s3 font-semibold">Joined</th>
                </tr>
              </thead>
              <tbody>
                {users.map((user) => {
                  const isVerified = Boolean(user.emailVerifiedAt);
                  return (
                    <tr
                      key={user.id}
                      className="cursor-pointer border-t border-border bg-surface-default text-text-primary hover:bg-surface-hover"
                      onClick={() => setSelectedUser(user)}
                    >
                      <td className="px-s4 py-s3 font-medium">{user.name}</td>
                      <td className="px-s4 py-s3 text-text-secondary">
                        {user.email}
                      </td>
                      <td className="px-s4 py-s3">{roleLabel(user.role)}</td>
                      <td className="px-s4 py-s3">
                        <Badge variant={isVerified ? 'success' : 'default'}>
                          {isVerified ? 'Verified' : 'Pending'}
                        </Badge>
                      </td>
                      <td className="px-s4 py-s3 text-text-secondary">
                        {formatUserDate(user.createdAt)}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      <UserDetailDrawer
        open={Boolean(selectedUser)}
        user={selectedUser}
        onClose={() => setSelectedUser(null)}
      />
    </div>
  );
}
