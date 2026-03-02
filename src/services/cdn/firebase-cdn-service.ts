import { firebaseAdmin } from '@/lib/firebase-admin';

type CdnImageMimeType = 'image/jpeg' | 'image/png' | 'image/webp' | 'image/gif';

type CdnFileMimeType = CdnImageMimeType | 'application/pdf';

type UploadBufferToCdnInput = {
  filePath: string;
  buffer: Buffer;
  contentType: CdnFileMimeType;
  cacheControl: string;
  signedUrlExpiresAt: string;
};

type ValidateImageFileOptions = {
  maxSizeBytes: number;
  allowedMimeTypes: readonly CdnImageMimeType[];
};

export type UploadBlogImageInput = {
  userId: string;
  file: File;
};

export type UploadUserAvatarInput = {
  garageId?: string;
  userId: string;
  file: File;
};

export type UploadGarageLogoInput = {
  garageId: string;
  file: File;
};

export type UploadGarageInvoiceFileInput = {
  garageId: string;
  invoiceId: string;
  file: File;
};

export type UploadSystemImageInput = {
  scope: 'blogs' | 'branding' | 'images';
  ownerId: string;
  file: File;
};

export type DeleteCdnFileInput = {
  filePath: string;
};

export class CdnValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'CdnValidationError';
  }
}

export class CdnDeleteError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'CdnDeleteError';
  }
}

function extensionFromMime(type: CdnImageMimeType): string {
  if (type === 'image/png') return 'png';
  if (type === 'image/webp') return 'webp';
  if (type === 'image/gif') return 'gif';
  return 'jpg';
}

function sanitizeFileName(input: string): string {
  return input
    .toLowerCase()
    .replace(/[^a-z0-9.-]/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '')
    .slice(0, 80);
}

function validateFilePresence(file: File): void {
  if (!(file instanceof File) || file.size <= 0) {
    throw new CdnValidationError('Please choose a file.');
  }
}

function validateImageFile(
  file: File,
  options: ValidateImageFileOptions
): asserts file is File & { type: CdnImageMimeType } {
  if (!(file instanceof File) || file.size <= 0) {
    throw new CdnValidationError('Please choose an image file.');
  }

  if (!options.allowedMimeTypes.includes(file.type as CdnImageMimeType)) {
    throw new CdnValidationError(
      'Only JPG, PNG, WEBP, or GIF files are allowed.'
    );
  }

  if (file.size > options.maxSizeBytes) {
    const maxSizeInMb = options.maxSizeBytes / (1024 * 1024);
    throw new CdnValidationError(`Image must be ${maxSizeInMb}MB or smaller.`);
  }
}

async function uploadBufferToCdn({
  filePath,
  buffer,
  contentType,
  cacheControl,
  signedUrlExpiresAt
}: UploadBufferToCdnInput): Promise<{ url: string }> {
  const file = firebaseAdmin.storage.bucket().file(filePath);

  await file.save(buffer, {
    contentType,
    resumable: false,
    metadata: {
      cacheControl
    }
  });

  const [signedUrl] = await file.getSignedUrl({
    action: 'read',
    expires: signedUrlExpiresAt
  });

  return { url: signedUrl };
}

function buildSystemBlogImagePath(params: {
  userId: string;
  fileName: string;
  extension: string;
}): string {
  const unique = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
  return `system/blogs/images/${params.userId}/${params.fileName || 'image'}-${unique}.${params.extension}`;
}

function buildGarageUserAvatarPath(params: {
  garageId: string;
  userId: string;
  extension: string;
}): string {
  return `garages/${params.garageId}/users/${params.userId}/avatar.${params.extension}`;
}

function buildSystemUserAvatarPath(params: {
  userId: string;
  extension: string;
}): string {
  return `system/users/${params.userId}/avatar.${params.extension}`;
}

function buildGarageLogoPath(params: {
  garageId: string;
  extension: string;
}): string {
  return `garages/${params.garageId}/branding/logo.${params.extension}`;
}

function buildGarageInvoiceFilePath(params: {
  garageId: string;
  invoiceId: string;
  fileName: string;
  extension: string;
}): string {
  const unique = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
  return `garages/${params.garageId}/invoices/${params.invoiceId}/files/${params.fileName || 'invoice-file'}-${unique}.${params.extension}`;
}

function buildSystemImagePath(params: {
  scope: UploadSystemImageInput['scope'];
  ownerId: string;
  fileName: string;
  extension: string;
}): string {
  const unique = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
  return `system/${params.scope}/${params.ownerId}/${params.fileName || 'image'}-${unique}.${params.extension}`;
}

function decodeSignedUrlPath(url: string): string | null {
  try {
    const parsed = new URL(url);
    // Firebase signed URLs commonly look like:
    // /<bucket>/o/<encoded-object-path>?...
    const marker = '/o/';
    const idx = parsed.pathname.indexOf(marker);
    if (idx < 0) {
      return null;
    }

    const encodedPath = parsed.pathname.slice(idx + marker.length);
    if (!encodedPath) {
      return null;
    }

    return decodeURIComponent(encodedPath);
  } catch {
    return null;
  }
}

export async function deleteCdnFile({
  filePath
}: DeleteCdnFileInput): Promise<void> {
  if (!filePath.trim()) {
    throw new CdnDeleteError('File path is required.');
  }

  const file = firebaseAdmin.storage.bucket().file(filePath);
  const [exists] = await file.exists();
  if (!exists) {
    return;
  }

  await file.delete();
}

export async function deleteCdnFileByUrl(url: string): Promise<void> {
  const parsedPath = decodeSignedUrlPath(url);
  if (!parsedPath) {
    throw new CdnDeleteError('Invalid CDN URL.');
  }

  await deleteCdnFile({ filePath: parsedPath });
}

export async function uploadBlogImageToCdn({
  userId,
  file
}: UploadBlogImageInput): Promise<{ url: string }> {
  validateImageFile(file, {
    maxSizeBytes: 5 * 1024 * 1024,
    allowedMimeTypes: ['image/jpeg', 'image/png', 'image/webp', 'image/gif']
  });

  const ext = extensionFromMime(file.type);
  const baseName = sanitizeFileName(file.name.replace(/\.[^.]+$/, ''));
  const filePath = buildSystemBlogImagePath({
    userId,
    fileName: baseName,
    extension: ext
  });
  const buffer = Buffer.from(await file.arrayBuffer());

  return uploadBufferToCdn({
    filePath,
    buffer,
    contentType: file.type,
    cacheControl: 'public,max-age=31536000,immutable',
    signedUrlExpiresAt: '03-01-2035'
  });
}

export async function uploadUserAvatarToCdn({
  garageId,
  userId,
  file
}: UploadUserAvatarInput): Promise<{ url: string }> {
  validateImageFile(file, {
    maxSizeBytes: 2 * 1024 * 1024,
    allowedMimeTypes: ['image/jpeg', 'image/png', 'image/webp']
  });

  const ext = extensionFromMime(file.type);
  const filePath = garageId
    ? buildGarageUserAvatarPath({
        garageId,
        userId,
        extension: ext
      })
    : buildSystemUserAvatarPath({
        userId,
        extension: ext
      });
  const buffer = Buffer.from(await file.arrayBuffer());

  return uploadBufferToCdn({
    filePath,
    buffer,
    contentType: file.type,
    cacheControl: 'public,max-age=3600,must-revalidate',
    signedUrlExpiresAt: '2100-01-01'
  });
}

export async function uploadGarageLogoToCdn({
  garageId,
  file
}: UploadGarageLogoInput): Promise<{ url: string }> {
  validateImageFile(file, {
    maxSizeBytes: 2 * 1024 * 1024,
    allowedMimeTypes: ['image/jpeg', 'image/png', 'image/webp']
  });

  const ext = extensionFromMime(file.type);
  const buffer = Buffer.from(await file.arrayBuffer());
  const filePath = buildGarageLogoPath({
    garageId,
    extension: ext
  });

  return uploadBufferToCdn({
    filePath,
    buffer,
    contentType: file.type,
    cacheControl: 'public,max-age=3600,must-revalidate',
    signedUrlExpiresAt: '03-01-2035'
  });
}

export async function uploadGarageInvoiceFileToCdn({
  garageId,
  invoiceId,
  file
}: UploadGarageInvoiceFileInput): Promise<{ url: string }> {
  validateFilePresence(file);

  const allowedMimeTypes: readonly CdnFileMimeType[] = [
    'application/pdf',
    'image/jpeg',
    'image/png',
    'image/webp'
  ];

  if (!allowedMimeTypes.includes(file.type as CdnFileMimeType)) {
    throw new CdnValidationError(
      'Only PDF, JPG, PNG, or WEBP files are allowed.'
    );
  }

  if (file.size > 10 * 1024 * 1024) {
    throw new CdnValidationError('File must be 10MB or smaller.');
  }

  const extension =
    file.type === 'application/pdf'
      ? 'pdf'
      : extensionFromMime(file.type as CdnImageMimeType);
  const baseName = sanitizeFileName(file.name.replace(/\.[^.]+$/, ''));
  const filePath = buildGarageInvoiceFilePath({
    garageId,
    invoiceId,
    fileName: baseName,
    extension
  });

  const buffer = Buffer.from(await file.arrayBuffer());
  return uploadBufferToCdn({
    filePath,
    buffer,
    contentType: file.type as CdnFileMimeType,
    cacheControl: 'private,max-age=3600,must-revalidate',
    signedUrlExpiresAt: '03-01-2035'
  });
}

export async function uploadSystemImageToCdn({
  scope,
  ownerId,
  file
}: UploadSystemImageInput): Promise<{ url: string }> {
  validateImageFile(file, {
    maxSizeBytes: 10 * 1024 * 1024,
    allowedMimeTypes: ['image/jpeg', 'image/png', 'image/webp', 'image/gif']
  });

  const ext = extensionFromMime(file.type);
  const baseName = sanitizeFileName(file.name.replace(/\.[^.]+$/, ''));
  const filePath = buildSystemImagePath({
    scope,
    ownerId,
    fileName: baseName,
    extension: ext
  });
  const buffer = Buffer.from(await file.arrayBuffer());

  return uploadBufferToCdn({
    filePath,
    buffer,
    contentType: file.type,
    cacheControl: 'public,max-age=31536000,immutable',
    signedUrlExpiresAt: '03-01-2035'
  });
}
