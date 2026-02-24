export interface UpdateProfileDTO {
  email?: string;
  fullName?: string;
  avatarFile?: File;
}

export interface ChangePasswordDTO {
  currentPassword: string;
  newPassword: string;
}
