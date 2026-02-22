'use client';

import { Plus } from 'lucide-react';
import { useMemo, useState } from 'react';

import { LoadingState } from '@/components/common/loading-state';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { AddStaffModal } from '@/features/staff/components/add-staff-modal';
import { DeleteStaffModal } from '@/features/staff/components/delete-staff-modal';
import { EditStaffDrawer } from '@/features/staff/components/edit-staff-drawer';
import { StaffKpiRow } from '@/features/staff/components/staff-kpi-row';
import { StaffTable } from '@/features/staff/components/staff-table';
import {
  useCreateStaff,
  useDisableStaff,
  useStaff,
  useStaffKpis,
  useUpdateStaff
} from '@/features/staff/hooks';
import type {
  CreateStaffInput,
  UpdateStaffInput
} from '@/features/staff/schema';
import type { Role, Staff } from '@/features/staff/types';

const currentUserRole: Role = 'OWNER';
const currentUserId = '1';

export function StaffManagementPage(): JSX.Element {
  const toast = useToast();

  const [addOpen, setAddOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [selected, setSelected] = useState<Staff | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Staff | null>(null);

  const staffQuery = useStaff();
  const createMutation = useCreateStaff();
  const updateMutation = useUpdateStaff();
  const disableMutation = useDisableStaff();

  const staff = useMemo(() => staffQuery.data ?? [], [staffQuery.data]);
  const kpis = useStaffKpis(staff);
  const isTableUpdating =
    (staffQuery.isFetching && !staffQuery.isLoading) ||
    createMutation.isPending ||
    updateMutation.isPending ||
    disableMutation.isPending;

  const canManage =
    currentUserRole === 'OWNER' || currentUserRole === 'MANAGER';

  const handleCreate = async (values: CreateStaffInput) => {
    await createMutation.mutateAsync(values);
    await staffQuery.refetch();
    toast.success('Staff created successfully.');
    setAddOpen(false);
  };

  const handleUpdate = async (values: UpdateStaffInput) => {
    await updateMutation.mutateAsync(values);
    await staffQuery.refetch();
    toast.success('Staff updated successfully.');
    setSelected(null);
  };

  const handleDisable = async (id: string) => {
    const target = staff.find((item) => item.id === id);

    if (!target) {
      return;
    }

    if (target.id === currentUserId) {
      throw new Error('You cannot remove your own profile.');
    }

    await disableMutation.mutateAsync({ id });
    await staffQuery.refetch();
    toast.success('Staff member removed.');
    setDeleteOpen(false);
    setDeleteTarget(null);
  };

  if (staffQuery.isLoading) {
    return <LoadingState label="Loading staff..." />;
  }

  if (staffQuery.isError) {
    return (
      <Card className="p-s4">
        <p className="text-small text-state-error">
          Could not load staff list.
        </p>
      </Card>
    );
  }

  return (
    <div className="space-y-s4">
      <header className="flex flex-col items-start justify-between gap-s3 md:flex-row md:items-center">
        <div>
          <h1 className="text-h1">Staff Management</h1>
          <p className="text-small text-text-muted">
            Manage team availability, roles, and workload.
          </p>
        </div>

        {canManage ? (
          <Button onClick={() => setAddOpen(true)}>
            <Plus className="size-4" />
            Add Staff
          </Button>
        ) : null}
      </header>

      <StaffKpiRow kpis={kpis} />

      <StaffTable
        loading={isTableUpdating}
        staff={staff}
        canAddStaff={canManage}
        onAddFirstStaff={() => setAddOpen(true)}
        currentUserRole={currentUserRole}
        onRowOpen={(item) => setSelected(item)}
        onDeleteClick={(item) => {
          setDeleteTarget(item);
          setDeleteOpen(true);
        }}
      />

      <AddStaffModal
        open={addOpen}
        onClose={() => setAddOpen(false)}
        onSubmit={handleCreate}
      />

      <EditStaffDrawer
        open={Boolean(selected)}
        staff={selected}
        currentUserRole={currentUserRole}
        onClose={() => setSelected(null)}
        onSubmit={handleUpdate}
      />

      <DeleteStaffModal
        open={deleteOpen}
        staff={deleteTarget}
        onClose={() => {
          setDeleteOpen(false);
          setDeleteTarget(null);
        }}
        onConfirm={handleDisable}
      />
    </div>
  );
}
