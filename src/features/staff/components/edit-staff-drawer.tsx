'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Drawer } from '@/components/ui/drawer';
import { Input } from '@/components/ui/input';
import {
  updateStaffSchema,
  type UpdateStaffInput
} from '@/features/staff/schema';
import { STAFF_STATUS_VALUES, type Staff } from '@/features/staff/types';
import { ROLE_VALUES, type Role } from '@/types/primitives';

type EditStaffDrawerProps = {
  open: boolean;
  staff: Staff | null;
  currentUserRole: Role;
  onClose: () => void;
  onSubmit: (values: UpdateStaffInput) => Promise<void>;
};

export function EditStaffDrawer({
  open,
  staff,
  currentUserRole,
  onClose,
  onSubmit
}: EditStaffDrawerProps): JSX.Element | null {
  const [submitError, setSubmitError] = useState('');

  const form = useForm<UpdateStaffInput>({
    resolver: zodResolver(updateStaffSchema),
    defaultValues: {
      id: '',
      fullName: '',
      phone: '',
      email: '',
      role: 'STAFF',
      status: 'ACTIVE',
      currentJobs: 0
    }
  });

  useEffect(() => {
    if (!staff) {
      return;
    }

    form.reset({
      id: staff.id,
      fullName: staff.fullName,
      phone: staff.phone,
      email: staff.email,
      role: staff.role,
      status: staff.status,
      currentJobs: staff.currentJobs,
      avatar: staff.avatar,
      branchId: staff.branchId
    });
  }, [form, staff]);

  if (!staff) {
    return null;
  }

  const canEdit = currentUserRole === 'OWNER' || currentUserRole === 'MANAGER';
  const canEditRole = currentUserRole !== 'STAFF';

  const handleSubmit = form.handleSubmit(async (values) => {
    setSubmitError('');

    if (values.status === 'INACTIVE' && (staff.currentJobs ?? 0) > 0) {
      setSubmitError('This staff has active jobs.');
      return;
    }

    try {
      await onSubmit(values);
    } catch (error) {
      const message =
        error instanceof Error ? error.message : 'Could not update staff.';
      setSubmitError(message);

      if (message.toLowerCase().includes('phone')) {
        form.setError('phone', { message: 'Phone must be unique.' });
      }
    }
  });

  return (
    <Drawer
      open={open}
      onClose={onClose}
      title="Staff Details"
      description="Update role, contact, and availability."
      width="lg"
      disableClose={form.formState.isSubmitting}
      footer={
        canEdit ? (
          <div className="flex justify-end gap-s2">
            <Button
              variant="secondary"
              type="button"
              onClick={onClose}
              disabled={form.formState.isSubmitting}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              form="edit-staff-drawer-form"
              disabled={form.formState.isSubmitting}
            >
              {form.formState.isSubmitting ? 'Saving...' : 'Save'}
            </Button>
          </div>
        ) : undefined
      }
    >
      <form
        id="edit-staff-drawer-form"
        className="space-y-s3"
        onSubmit={handleSubmit}
      >
        <div className="space-y-s1">
          <label className="text-small font-medium text-text-secondary">
            Full Name
          </label>
          <Input
            className="h-11"
            disabled={!canEdit}
            {...form.register('fullName')}
          />
          {form.formState.errors.fullName ? (
            <p className="text-caption text-state-error">
              {form.formState.errors.fullName.message}
            </p>
          ) : null}
        </div>

        <div className="space-y-s1">
          <label className="text-small font-medium text-text-secondary">
            Phone
          </label>
          <Input
            className="h-11"
            disabled={!canEdit}
            {...form.register('phone')}
          />
          {form.formState.errors.phone ? (
            <p className="text-caption text-state-error">
              {form.formState.errors.phone.message}
            </p>
          ) : null}
        </div>

        <div className="space-y-s1">
          <label className="text-small font-medium text-text-secondary">
            Email
          </label>
          <Input
            className="h-11"
            disabled={!canEdit}
            type="email"
            {...form.register('email')}
          />
          {form.formState.errors.email ? (
            <p className="text-caption text-state-error">
              {form.formState.errors.email.message}
            </p>
          ) : null}
        </div>

        <div className="space-y-s1">
          <label className="text-small font-medium text-text-secondary">
            Role
          </label>
          {canEditRole ? (
            <select
              className="h-11 w-full rounded-md border border-input-border bg-input px-s3 text-small text-input-foreground"
              disabled={!canEdit}
              {...form.register('role')}
            >
              {ROLE_VALUES.map((role) => (
                <option key={role} value={role}>
                  {role}
                </option>
              ))}
            </select>
          ) : (
            <Input className="h-11" disabled value={staff.role} />
          )}
        </div>

        <div className="space-y-s1">
          <label className="text-small font-medium text-text-secondary">
            Status
          </label>
          <select
            className="h-11 w-full rounded-md border border-input-border bg-input px-s3 text-small text-input-foreground"
            disabled={!canEdit}
            {...form.register('status')}
          >
            {STAFF_STATUS_VALUES.map((status) => (
              <option key={status} value={status}>
                {status}
              </option>
            ))}
          </select>
        </div>

        <div className="flex items-center gap-s2">
          <Badge variant={staff.currentJobs >= 3 ? 'warning' : 'default'}>
            Current Jobs: {staff.currentJobs}
          </Badge>
          <Badge variant="default">
            Completed Jobs: {staff.completedJobs ?? 0}
          </Badge>
        </div>

        {submitError ? (
          <p className="text-caption text-state-error">{submitError}</p>
        ) : null}
      </form>
    </Drawer>
  );
}
