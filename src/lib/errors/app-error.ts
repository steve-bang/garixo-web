import { AxiosError } from 'axios';

export class AppError extends Error {
  constructor(
    message: string,
    public readonly statusCode = 500
  ) {
    super(message);
    this.name = 'AppError';
  }
}

export function normalizeError(error: unknown): AppError {
  if (error instanceof AppError) {
    return error;
  }

  if (error instanceof AxiosError) {
    return new AppError(error.response?.data?.error ?? error.message, error.response?.status ?? 500);
  }

  if (error instanceof Error) {
    return new AppError(error.message);
  }

  return new AppError('Unknown error');
}
