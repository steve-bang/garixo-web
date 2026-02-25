export const ROLE_VALUES = ['OWNER', 'MANAGER', 'STAFF'] as const;

export type Role = (typeof ROLE_VALUES)[number];

export type ISODateString = string;

export type PaginationMeta = {
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
};

export type PaginatedResponse<T> = {
  items: T[];
  meta: PaginationMeta;
};
