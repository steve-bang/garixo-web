'use client';

import { ChevronUp, LogOut, Settings, ShieldCheck } from 'lucide-react';
import Link from 'next/link';
import { useEffect, useMemo, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';

import { Modal } from '@/components/ui/modal';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import type { BillingStatus, PlanCode } from '@/features/billing/types';
import { User } from '@/types/user';

function initials(nameOrEmail: string): string {
  const tokens = nameOrEmail.trim().split(/\s+/).filter(Boolean);
  if (tokens.length >= 2) {
    return `${tokens[0][0] ?? ''}${tokens[1][0] ?? ''}`.toUpperCase();
  }
  return (tokens[0]?.slice(0, 2) ?? 'US').toUpperCase();
}

type SidebarUserSectionProps = {
  currentPlan: PlanCode;
  billingStatus: BillingStatus;
};

function formatPlanLabel(planCode: PlanCode): string {
  if (planCode === 'starter') return 'Starter';
  if (planCode === 'growth') return 'Growth';
  return 'Free';
}

function formatBillingStatus(status: BillingStatus): string | null {
  if (status === 'suspended') return 'Suspended';
  if (status === 'past_due') return 'Payment issue';
  if (status === 'cancelled') return 'Cancelled';
  return null;
}

export function SidebarUserSection({
  currentPlan,
  billingStatus
}: SidebarUserSectionProps): JSX.Element {
  const toast = useToast();
  const router = useRouter();

  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [menuOpen, setMenuOpen] = useState(false);

  const [generalOpen, setGeneralOpen] = useState(false);
  const [passwordOpen, setPasswordOpen] = useState(false);
  const [signOutOpen, setSignOutOpen] = useState(false);

  const [profileName, setProfileName] = useState('');
  const [profileEmail, setProfileEmail] = useState('');
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | undefined>();
  const [generalError, setGeneralError] = useState('');
  const [savingGeneral, setSavingGeneral] = useState(false);

  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [savingPassword, setSavingPassword] = useState(false);

  const [signOutError, setSignOutError] = useState('');
  const [signingOut, setSigningOut] = useState(false);

  const wrapperRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    let mounted = true;

    const loadMe = async () => {
      try {
        const response = await fetch('/api/me');
        const payload = (await response.json()) as {
          success: boolean;
          data?: User;
          error?: string;
        };

        if (!mounted) return;

        if (payload.success && payload.data) {
          setUser(payload.data);
          setProfileEmail(payload.data.email);
          setProfileName(payload.data.name ?? '');
          setAvatarPreview(payload.data.avatarUrl);
        }
      } finally {
        if (mounted) setLoading(false);
      }
    };

    loadMe();

    return () => {
      mounted = false;
    };
  }, []);

  useEffect(() => {
    if (!generalOpen || !user) {
      return;
    }

    setProfileEmail(user.email);
    setProfileName(user.name ?? '');
    setAvatarPreview(user.avatarUrl);
    setAvatarFile(null);
    setGeneralError('');
  }, [generalOpen, user]);

  useEffect(() => {
    const handleClick = (event: MouseEvent) => {
      if (!wrapperRef.current) return;
      if (!wrapperRef.current.contains(event.target as Node)) {
        setMenuOpen(false);
      }
    };

    window.addEventListener('mousedown', handleClick);
    return () => window.removeEventListener('mousedown', handleClick);
  }, []);

  const avatarText = useMemo(
    () => initials(user?.name || user?.email || 'User'),
    [user]
  );
  const billingStatusLabel = formatBillingStatus(billingStatus);

  const resetPasswordState = () => {
    setCurrentPassword('');
    setNewPassword('');
    setConfirmPassword('');
    setPasswordError('');
  };

  const handlePickAvatar = (file: File | null) => {
    setGeneralError('');

    if (!file) {
      setAvatarFile(null);
      return;
    }

    if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) {
      setGeneralError('Only jpg, png, webp files are allowed.');
      return;
    }

    if (file.size > 2 * 1024 * 1024) {
      setGeneralError('Image must be 2MB or smaller.');
      return;
    }

    setAvatarFile(file);
    setAvatarPreview(URL.createObjectURL(file));
  };

  const saveGeneral = async () => {
    setGeneralError('');

    const normalizedEmail = profileEmail.trim().toLowerCase();

    if (!normalizedEmail) {
      setGeneralError('Please enter your email address.');
      return;
    }

    if (normalizedEmail.length > 254) {
      setGeneralError('Email address is too long.');
      return;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(normalizedEmail)) {
      setGeneralError('Please enter a valid email address.');
      return;
    }

    setSavingGeneral(true);

    try {
      const formData = new FormData();
      formData.set('email', normalizedEmail);
      formData.set('fullName', profileName);
      if (avatarFile) formData.set('avatarFile', avatarFile);

      const response = await fetch('/api/me', {
        method: 'PUT',
        body: formData
      });
      const payload = (await response.json()) as {
        success: boolean;
        data?: User;
        error?: string;
      };

      if (!payload.success || !payload.data) {
        setGeneralError(payload.error ?? 'Could not update profile.');
        return;
      }

      setUser(payload.data);
      setProfileEmail(payload.data.email);
      setAvatarFile(null);
      setAvatarPreview(payload.data.avatarUrl);
      setGeneralOpen(false);
      toast.success('Profile updated successfully.');
    } catch {
      setGeneralError('Could not update profile.');
    } finally {
      setSavingGeneral(false);
    }
  };

  const updatePassword = async () => {
    setPasswordError('');

    if (!currentPassword || !newPassword || !confirmPassword) {
      setPasswordError('All fields are required.');
      return;
    }

    if (newPassword.length < 8) {
      setPasswordError('New password must be at least 8 characters.');
      return;
    }

    if (newPassword !== confirmPassword) {
      setPasswordError('Confirm password does not match.');
      return;
    }

    setSavingPassword(true);

    try {
      const response = await fetch('/api/me/change-password', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ currentPassword, newPassword })
      });
      const payload = (await response.json()) as {
        success: boolean;
        error?: string;
      };

      if (!payload.success) {
        setPasswordError(payload.error ?? 'Could not update password.');
        return;
      }

      setPasswordOpen(false);
      resetPasswordState();
      toast.success('Password updated successfully.');
    } catch {
      setPasswordError('Could not update password.');
    } finally {
      setSavingPassword(false);
    }
  };

  const confirmSignOut = async () => {
    setSignOutError('');
    setSigningOut(true);

    try {
      const response = await fetch('/api/auth/logout', { method: 'POST' });
      const payload = (await response.json()) as {
        success: boolean;
        error?: string;
      };

      if (!payload.success) {
        setSignOutError(payload.error ?? 'Could not sign out.');
        return;
      }

      router.replace('/');
      router.refresh();
    } catch {
      setSignOutError('Could not sign out.');
    } finally {
      setSigningOut(false);
    }
  };

  return (
    <div
      className="relative border-t border-sidebar-border p-s4"
      ref={wrapperRef}
    >
      <button
        type="button"
        className="flex min-h-14 w-full items-center gap-s3 rounded-md px-s2 py-s2 text-left hover:bg-surface-hover"
        onClick={() => setMenuOpen((prev) => !prev)}
      >
        <span className="grid size-9 shrink-0 place-items-center overflow-hidden rounded-full bg-surface-hover text-caption font-semibold text-text-secondary">
          {avatarPreview ? (
            <img
              src={avatarPreview}
              alt="Avatar"
              className="size-9 object-cover"
            />
          ) : (
            avatarText
          )}
        </span>

        <span className="min-w-0 flex-1">
          <span className="block truncate text-small font-medium text-text-primary">
            {user?.name || 'User'}
          </span>
          <span className="block truncate text-small text-text-secondary">
            {loading ? 'Loading…' : user?.email || '-'}
          </span>
          <span className="mt-0.5 block truncate text-caption text-text-muted">
            Plan: {formatPlanLabel(currentPlan)}
            {billingStatusLabel ? ` • ${billingStatusLabel}` : ''}
          </span>
        </span>

        <ChevronUp className="size-4 text-text-muted" />
      </button>

      {menuOpen ? (
        <div className="absolute bottom-[88px] left-s4 w-[240px] rounded-xl border border-border bg-surface-default p-s2 shadow-md">
          <Link
            href="/dashboard/settings/subscription"
            className="mb-s1 flex w-full items-center gap-s2 rounded-md px-s3 py-s2 text-small text-text-primary hover:bg-surface-hover"
            onClick={() => setMenuOpen(false)}
          >
            <ShieldCheck className="size-4" />
            Manage Subscription
          </Link>

          <button
            type="button"
            className="flex w-full items-center gap-s2 rounded-md px-s3 py-s2 text-small text-text-primary hover:bg-surface-hover"
            onClick={() => {
              setMenuOpen(false);
              setGeneralOpen(true);
            }}
          >
            <Settings className="size-4" />
            General
          </button>

          <button
            type="button"
            className="flex w-full items-center gap-s2 rounded-md px-s3 py-s2 text-small text-text-primary hover:bg-surface-hover"
            onClick={() => {
              setMenuOpen(false);
              setPasswordOpen(true);
            }}
          >
            <ShieldCheck className="size-4" />
            Change Password
          </button>

          <button
            type="button"
            className="flex w-full items-center gap-s2 rounded-md px-s3 py-s2 text-small text-state-error hover:bg-error-50"
            onClick={() => {
              setMenuOpen(false);
              setSignOutOpen(true);
            }}
          >
            <LogOut className="size-4" />
            Sign Out
          </button>
        </div>
      ) : null}

      <Modal
        open={generalOpen}
        title="Profile Information"
        width="md"
        fullOnTabletMobile
        onClose={() => setGeneralOpen(false)}
        footer={
          <>
            <Button variant="secondary" onClick={() => setGeneralOpen(false)}>
              Cancel
            </Button>
            <Button onClick={saveGeneral} disabled={savingGeneral}>
              {savingGeneral ? 'Saving...' : 'Save'}
            </Button>
          </>
        }
      >
        <div className="space-y-s6">
          <div className="flex items-center gap-s4">
            <button
              type="button"
              className="grid size-24 place-items-center overflow-hidden rounded-full border border-border bg-surface-hover text-small font-semibold text-text-secondary"
              onClick={() => document.getElementById('avatar-input')?.click()}
            >
              {avatarPreview ? (
                <img
                  src={avatarPreview}
                  alt="Avatar preview"
                  className="size-24 object-cover"
                />
              ) : (
                avatarText
              )}
            </button>

            <div className="space-y-s2">
              <input
                id="avatar-input"
                type="file"
                accept="image/jpeg,image/png,image/webp"
                className="hidden"
                onChange={(event) =>
                  handlePickAvatar(event.target.files?.[0] ?? null)
                }
              />
              <Button
                variant="secondary"
                type="button"
                onClick={() => document.getElementById('avatar-input')?.click()}
              >
                Upload
              </Button>
              <p className="text-caption text-text-muted">
                Max 2MB, jpg/png/webp.
              </p>
            </div>
          </div>

          <div className="space-y-s1">
            <label className="text-small font-medium text-text-secondary">
              Email
            </label>
            <Input
              className="h-11"
              type="email"
              inputMode="email"
              autoComplete="email"
              value={profileEmail}
              onChange={(event) => setProfileEmail(event.target.value)}
            />
          </div>

          <div className="space-y-s1">
            <label className="text-small font-medium text-text-secondary">
              Full Name
            </label>
            <Input
              className="h-11"
              value={profileName}
              onChange={(event) => setProfileName(event.target.value)}
            />
          </div>

          {generalError ? (
            <p className="text-caption text-state-error">{generalError}</p>
          ) : null}
        </div>
      </Modal>

      <Modal
        open={passwordOpen}
        title="Change Password"
        width="md"
        fullOnTabletMobile
        onClose={() => {
          setPasswordOpen(false);
          resetPasswordState();
        }}
        footer={
          <>
            <Button variant="secondary" onClick={() => setPasswordOpen(false)}>
              Cancel
            </Button>
            <Button onClick={updatePassword} disabled={savingPassword}>
              {savingPassword ? 'Updating...' : 'Update Password'}
            </Button>
          </>
        }
      >
        <div className="space-y-s4">
          <div className="space-y-s1">
            <label className="text-small font-medium text-text-secondary">
              Current Password
            </label>
            <Input
              className="h-11"
              type="password"
              value={currentPassword}
              onChange={(event) => setCurrentPassword(event.target.value)}
            />
          </div>

          <div className="space-y-s1">
            <label className="text-small font-medium text-text-secondary">
              New Password
            </label>
            <Input
              className="h-11"
              type="password"
              value={newPassword}
              onChange={(event) => setNewPassword(event.target.value)}
            />
          </div>

          <div className="space-y-s1">
            <label className="text-small font-medium text-text-secondary">
              Confirm New Password
            </label>
            <Input
              className="h-11"
              type="password"
              value={confirmPassword}
              onChange={(event) => setConfirmPassword(event.target.value)}
            />
          </div>

          {passwordError ? (
            <p className="text-caption text-state-error">{passwordError}</p>
          ) : null}
        </div>
      </Modal>

      <Modal
        open={signOutOpen}
        title="Sign Out?"
        width="sm"
        fullOnTabletMobile
        onClose={() => setSignOutOpen(false)}
        footer={
          <>
            <Button variant="secondary" onClick={() => setSignOutOpen(false)}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={confirmSignOut}
              disabled={signingOut}
            >
              {signingOut ? 'Signing out...' : 'Sign Out'}
            </Button>
          </>
        }
      >
        <div className="space-y-s4">
          <p className="text-small text-text-secondary">
            You will be signed out of the system.
          </p>

          {signOutError ? (
            <p className="text-caption text-state-error">{signOutError}</p>
          ) : null}
        </div>
      </Modal>
    </div>
  );
}
