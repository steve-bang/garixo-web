'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';

import { Modal } from '@/components/ui/modal';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { createStaffSchema, type CreateStaffInput } from '@/features/staff/schema';
import type { Role } from '@/features/staff/types';

type AddStaffModalProps = {
  open: boolean;
  onClose: () => void;
  onSubmit: (values: CreateStaffInput) => Promise<void>;
};

export function AddStaffModal({ open, onClose, onSubmit }: AddStaffModalProps): JSX.Element | null {
  const [submitError, setSubmitError] = useState('');
  const [skillTags, setSkillTags] = useState('');

  const form = useForm<CreateStaffInput>({
    resolver: zodResolver(createStaffSchema),
    defaultValues: {
      fullName: '',
      phone: '',
      email: '',
      avatar: '',
      role: 'STAFF',
      status: 'ACTIVE',
      currentJobs: 0
    }
  });

  useEffect(() => {
    if (!open) {
      return;
    }

    setSubmitError('');
  }, [open]);

  const handleSubmit = form.handleSubmit(async (values) => {
    setSubmitError('');

    try {
      await onSubmit(values);
      setSkillTags('');
      form.reset();
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Could not create staff.';
      setSubmitError(message);

      if (message.toLowerCase().includes('phone')) {
        form.setError('phone', { message: 'Phone must be unique.' });
      }
    }
  });

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Add Staff"
      width="lg"
      footer={
        <>
          <Button variant="secondary" type="button" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" form="add-staff-form" disabled={form.formState.isSubmitting}>
            {form.formState.isSubmitting ? 'Adding...' : 'Add Staff'}
          </Button>
        </>
      }
    >
      <p className="mb-s4 text-small text-text-muted">Create a new staff profile.</p>
      <form id="add-staff-form" className="space-y-s3" onSubmit={handleSubmit}>
        <div className="space-y-s1">
          <label className="text-small font-medium text-text-secondary">Full Name</label>
          <Input className="h-11" {...form.register('fullName')} />
          {form.formState.errors.fullName ? (
            <p className="text-caption text-state-error">{form.formState.errors.fullName.message}</p>
          ) : null}
        </div>

        <div className="space-y-s1">
          <label className="text-small font-medium text-text-secondary">Phone</label>
          <Input className="h-11" inputMode="numeric" {...form.register('phone')} />
          {form.formState.errors.phone ? <p className="text-caption text-state-error">{form.formState.errors.phone.message}</p> : null}
        </div>

        <div className="space-y-s1">
          <label className="text-small font-medium text-text-secondary">Role</label>
          <select
            className="h-11 w-full rounded-md border border-input-border bg-input px-s3 text-small text-input-foreground"
            {...form.register('role')}
          >
            {(['OWNER', 'MANAGER', 'STAFF'] as Role[]).map((role) => (
              <option key={role} value={role}>
                {role}
              </option>
            ))}
          </select>
          {form.formState.errors.role ? <p className="text-caption text-state-error">{form.formState.errors.role.message}</p> : null}
        </div>

        <div className="space-y-s1">
          <label className="text-small font-medium text-text-secondary">Email (optional)</label>
          <Input className="h-11" type="email" {...form.register('email')} />
          {form.formState.errors.email ? <p className="text-caption text-state-error">{form.formState.errors.email.message}</p> : null}
        </div>

        <div className="space-y-s1">
          <label className="text-small font-medium text-text-secondary">Avatar URL (optional)</label>
          <Input className="h-11" {...form.register('avatar')} />
        </div>

        <div className="space-y-s1">
          <label className="text-small font-medium text-text-secondary">Skill Tags (optional)</label>
          <Input className="h-11" value={skillTags} onChange={(event) => setSkillTags(event.target.value)} />
        </div>

        {submitError ? <p className="text-caption text-state-error">{submitError}</p> : null}
      </form>
    </Modal>
  );
}
