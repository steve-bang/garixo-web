import type { ISODateString } from '@/types/primitives';
import type { PaginatedResponse } from '@/types/primitives';

export type SupportTicketType = 'problem' | 'question' | 'feature';
export type SupportTicketStatus = 'open' | 'resolved';

export type SupportTicketScreenshot = {
  url: string;
  path: string;
  name: string;
  contentType: 'image/jpeg' | 'image/png' | 'image/webp';
  size: number;
} | null;

export interface SupportTicket {
  id: string;
  garageId: string;
  createdByUserId: string;
  createdByName: string;
  createdByEmail: string;
  type: SupportTicketType;
  shortDescription: string;
  message: string;
  screenshot: SupportTicketScreenshot;
  status: SupportTicketStatus;
  source: 'dashboard';
  createdAt: ISODateString;
  updatedAt: ISODateString;
}

export type SupportTicketDateFilter = 'all' | 'today' | '7d' | '30d';

export type AdminSupportTicketsQuery = {
  status?: SupportTicketStatus;
  type?: SupportTicketType;
  date?: SupportTicketDateFilter;
  page?: number;
  pageSize?: number;
};

export type SupportTicketListResponse = PaginatedResponse<SupportTicket>;
