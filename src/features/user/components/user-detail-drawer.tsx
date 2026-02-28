'use client';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Drawer } from '@/components/ui/drawer';
import type { UserListItem } from '@/features/user/types';
import { formatDate } from '@/lib/utils/format';

type UserDetailDrawerProps = {
  open: boolean;
  user: UserListItem | null;
  onClose: () => void;
};

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

export function UserDetailDrawer({
  open,
  user,
  onClose
}: UserDetailDrawerProps): JSX.Element | null {
  if (!user) {
    return null;
  }

  const isVerified = Boolean(user.emailVerifiedAt);

  return (
    <Drawer
      open={open}
      onClose={onClose}
      title="User Details"
      description="Review user information. This page is read-only."
      width="lg"
      footer={
        <div className="flex justify-end">
          <Button type="button" variant="secondary" onClick={onClose}>
            Close
          </Button>
        </div>
      }
    >
      <div className="space-y-s4">
        <Card className="p-s4">
          <div className="flex flex-wrap items-center justify-between gap-s2">
            <div>
              <p className="text-h3 text-text-primary">{user.name}</p>
              <p className="text-small text-text-secondary">{user.email}</p>
            </div>
            <Badge variant={isVerified ? 'success' : 'default'}>
              {isVerified ? 'Verified' : 'Not Verified'}
            </Badge>
          </div>
        </Card>

        <Card className="p-s4">
          <h4 className="text-small font-semibold text-text-primary">
            Account Information
          </h4>
          <div className="mt-s3 grid gap-s3 md:grid-cols-2">
            <p className="text-small text-text-secondary">
              Role: {roleLabel(user.role)}
            </p>
            <p className="text-small text-text-secondary">
              Joined: {formatUserDate(user.createdAt)}
            </p>
            <p className="text-small text-text-secondary">
              Email verified on: {formatUserDate(user.emailVerifiedAt)}
            </p>
            <p className="text-small text-text-secondary">
              Garage ID: {user.garageId ?? '-'}
            </p>
          </div>
        </Card>
      </div>
    </Drawer>
  );
}
