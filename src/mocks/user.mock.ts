import { mockUsers } from '@/lib/auth/mock-users';

type MockProfile = {
  id: string;
  email: string;
  fullName?: string;
  avatarUrl?: string;
  role: 'owner' | 'staff';
};

const profileStore = new Map<string, MockProfile>();

function wait(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function mapRole(role: 'admin' | 'staff' | 'user'): 'owner' | 'staff' {
  return role === 'admin' ? 'owner' : 'staff';
}

function initialProfile(userId?: string): MockProfile {
  const user = mockUsers.find((item) => item.id === userId) ?? mockUsers[0];

  return {
    id: user.id,
    email: user.email,
    fullName: user.name,
    avatarUrl: undefined,
    role: mapRole(user.role)
  };
}

export async function getMockCurrentUser(userId?: string): Promise<MockProfile> {
  await wait(400 + Math.floor(Math.random() * 400));

  const key = userId ?? 'default';
  const existing = profileStore.get(key);

  if (existing) {
    return existing;
  }

  const created = initialProfile(userId);
  profileStore.set(key, created);
  return created;
}

export async function updateMockCurrentUser(
  userId: string | undefined,
  payload: { fullName?: string; avatarUrl?: string }
): Promise<MockProfile> {
  await wait(400 + Math.floor(Math.random() * 400));

  const key = userId ?? 'default';
  const current = await getMockCurrentUser(userId);

  const updated: MockProfile = {
    ...current,
    fullName: payload.fullName ?? current.fullName,
    avatarUrl: payload.avatarUrl ?? current.avatarUrl
  };

  profileStore.set(key, updated);
  return updated;
}
