import { Pencil, Plus, Trash2, UserCircle2, Users } from 'lucide-react';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import type { Role, Staff } from '@/features/staff/types';
import { cn } from '@/lib/utils/cn';

type StaffTableProps = {
  staff: Staff[];
  loading?: boolean;
  canAddStaff?: boolean;
  onAddFirstStaff?: () => void;
  currentUserRole: Role;
  onRowOpen: (item: Staff) => void;
  onDeleteClick: (item: Staff) => void;
};

function statusVariant(
  status: Staff['status']
): 'default' | 'success' | 'warning' {
  if (status === 'ACTIVE') {
    return 'success';
  }

  if (status === 'ON_LEAVE') {
    return 'warning';
  }

  return 'default';
}

function avatarLabel(name: string): string {
  const [first = '', second = ''] = name.split(' ');
  return `${first[0] ?? ''}${second[0] ?? ''}`.toUpperCase();
}

export function StaffTable({
  staff,
  loading = false,
  canAddStaff = false,
  onAddFirstStaff,
  currentUserRole,
  onRowOpen,
  onDeleteClick
}: StaffTableProps): JSX.Element {
  if (loading) {
    return (
      <Card className="overflow-hidden p-0">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[1080px] text-left text-small">
            <thead className="bg-table-header text-table-header-text">
              <tr>
                <th className="px-s4 py-s3 font-semibold">Avatar</th>
                <th className="px-s4 py-s3 font-semibold">Name</th>
                <th className="px-s4 py-s3 font-semibold">Role</th>
                <th className="px-s4 py-s3 font-semibold">Status</th>
                <th className="px-s4 py-s3 text-right font-semibold">
                  Current Jobs
                </th>
                <th className="px-s4 py-s3 text-right font-semibold">
                  Completed Jobs
                </th>
                <th className="px-s4 py-s3 font-semibold">Phone</th>
                <th className="px-s4 py-s3 font-semibold">Actions</th>
              </tr>
            </thead>
            <tbody>
              {Array.from({ length: 6 }).map((_, index) => (
                <tr
                  key={`staff-skeleton-${index}`}
                  className="border-t border-border bg-surface-default"
                >
                  <td className="px-s4 py-s3">
                    <div className="size-9 animate-pulse rounded-full bg-surface-hover" />
                  </td>
                  <td className="px-s4 py-s3">
                    <div className="space-y-s2">
                      <div className="h-4 w-40 animate-pulse rounded bg-surface-hover" />
                      <div className="h-3 w-28 animate-pulse rounded bg-surface-hover" />
                    </div>
                  </td>
                  <td className="px-s4 py-s3">
                    <div className="h-4 w-16 animate-pulse rounded bg-surface-hover" />
                  </td>
                  <td className="px-s4 py-s3">
                    <div className="h-6 w-20 animate-pulse rounded bg-surface-hover" />
                  </td>
                  <td className="px-s4 py-s3 text-right">
                    <div className="ml-auto h-4 w-8 animate-pulse rounded bg-surface-hover" />
                  </td>
                  <td className="px-s4 py-s3 text-right">
                    <div className="ml-auto h-4 w-10 animate-pulse rounded bg-surface-hover" />
                  </td>
                  <td className="px-s4 py-s3">
                    <div className="h-4 w-24 animate-pulse rounded bg-surface-hover" />
                  </td>
                  <td className="px-s4 py-s3">
                    <div className="h-4 w-28 animate-pulse rounded bg-surface-hover" />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    );
  }

  if (staff.length === 0) {
    return (
      <Card className="grid min-h-[260px] place-items-center p-s6 text-center">
        <div className="space-y-s3">
          <div className="mx-auto grid size-10 place-items-center rounded-full bg-surface-hover text-text-secondary">
            <Users className="size-5" />
          </div>
          <h3 className="text-h3">No team members yet</h3>
          <p className="max-w-[420px] text-small text-text-muted">
            Add your first staff member to start assigning jobs and tracking
            workload.
          </p>
          {canAddStaff ? (
            <div className="pt-s1">
              <Button onClick={() => onAddFirstStaff?.()}>
                <Plus className="size-4" />
                Add First Staff Member
              </Button>
            </div>
          ) : null}
        </div>
      </Card>
    );
  }

  return (
    <Card className="overflow-hidden p-0">
      <div className="overflow-x-auto">
        <table className="w-full min-w-[1080px] text-left text-small">
          <thead className="bg-table-header text-table-header-text">
            <tr>
              <th className="px-s4 py-s3 font-semibold">Avatar</th>
              <th className="px-s4 py-s3 font-semibold">Name</th>
              <th className="px-s4 py-s3 font-semibold">Role</th>
              <th className="px-s4 py-s3 font-semibold">Status</th>
              <th className="px-s4 py-s3 text-right font-semibold">
                Current Jobs
              </th>
              <th className="px-s4 py-s3 text-right font-semibold">
                Completed Jobs
              </th>
              <th className="px-s4 py-s3 font-semibold">Phone</th>
              <th className="px-s4 py-s3 font-semibold">Actions</th>
            </tr>
          </thead>
          <tbody>
            {staff.map((item) => {
              const canManage =
                currentUserRole === 'OWNER' || currentUserRole === 'MANAGER';
              const canDelete =
                currentUserRole === 'OWNER' && item.role !== 'OWNER';

              return (
                <tr
                  key={item.id}
                  className="cursor-pointer border-t border-border bg-surface-default text-text-primary hover:bg-surface-hover"
                  onClick={() => onRowOpen(item)}
                >
                  <td className="px-s4 py-s3">
                    <div className="grid size-9 place-items-center rounded-full border border-border bg-surface-hover text-caption font-medium text-text-secondary">
                      {item.avatar ? (
                        <UserCircle2 className="size-4" />
                      ) : (
                        avatarLabel(item.fullName)
                      )}
                    </div>
                  </td>
                  <td className="px-s4 py-s3">
                    <div>
                      <p className="font-medium">{item.fullName}</p>
                      <p className="text-caption text-text-muted">
                        {item.email ?? '-'}
                      </p>
                    </div>
                  </td>
                  <td className="px-s4 py-s3">{item.role}</td>
                  <td className="px-s4 py-s3">
                    <Badge variant={statusVariant(item.status)}>
                      {item.status}
                    </Badge>
                  </td>
                  <td
                    className={cn(
                      'px-s4 py-s3 text-right tabular-nums',
                      item.currentJobs >= 3 &&
                        'text-warning-700 dark:text-warning-300'
                    )}
                  >
                    {item.currentJobs}
                  </td>
                  <td className="px-s4 py-s3 text-right tabular-nums text-text-primary">
                    {item.completedJobs ?? 0}
                  </td>
                  <td className="px-s4 py-s3">{item.phone}</td>
                  <td className="px-s4 py-s3">
                    {canManage ? (
                      <div
                        className="flex items-center gap-s2"
                        onClick={(event) => event.stopPropagation()}
                      >
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => onRowOpen(item)}
                        >
                          <Pencil className="size-4" />
                          Edit
                        </Button>
                        {canDelete ? (
                          <Button
                            size="sm"
                            variant="ghost"
                            className="text-state-error"
                            onClick={() => onDeleteClick(item)}
                          >
                            <Trash2 className="size-4" />
                            Delete
                          </Button>
                        ) : null}
                      </div>
                    ) : null}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </Card>
  );
}
