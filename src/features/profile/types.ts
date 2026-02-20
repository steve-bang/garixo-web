export interface User {
  id: string;
  email: string;
  fullName?: string;
  avatarUrl?: string;
  role: 'owner' | 'staff';
}

export interface UpdateProfileDTO {
  fullName?: string;
  avatarFile?: File;
}

export interface ChangePasswordDTO {
  currentPassword: string;
  newPassword: string;
}
