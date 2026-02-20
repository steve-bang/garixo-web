import { NextResponse } from 'next/server';

import { customerHistoryDB, customersDB } from '@/app/api/customers/customers-db';
import { createCustomerSchema, customerListQuerySchema, matchesSpendingTier } from '@/features/customers/schema';
import type { Customer, CustomerListResponse } from '@/features/customers/types';
import type { ApiResponse } from '@/types/api';

function response<T>(payload: ApiResponse<T>, status = 200): NextResponse<ApiResponse<T>> {
  return NextResponse.json(payload, { status });
}

function phoneScore(item: Customer, search: string): number {
  const cleanSearch = search.replace(/\D/g, '');
  const cleanPhone = item.phone.replace(/\D/g, '');

  if (!cleanSearch) {
    return 2;
  }

  if (cleanPhone.startsWith(cleanSearch)) {
    return 0;
  }

  if (cleanPhone.includes(cleanSearch)) {
    return 1;
  }

  return 2;
}

function sortByLastVisitDesc(items: Customer[]): Customer[] {
  return [...items].sort((a, b) => {
    const aTime = a.lastVisit ? new Date(a.lastVisit).getTime() : 0;
    const bTime = b.lastVisit ? new Date(b.lastVisit).getTime() : 0;
    return bTime - aTime;
  });
}

export async function GET(request: Request): Promise<NextResponse<ApiResponse<CustomerListResponse>>> {
  const url = new URL(request.url);

  const parsedQuery = customerListQuerySchema.safeParse({
    search: url.searchParams.get('search') ?? undefined,
    status: url.searchParams.get('status') ?? undefined,
    spendingTier: url.searchParams.get('spendingTier') ?? undefined,
    page: url.searchParams.get('page') ?? undefined,
    pageSize: url.searchParams.get('pageSize') ?? undefined
  });

  if (!parsedQuery.success) {
    return response({ success: false, error: parsedQuery.error.issues[0]?.message ?? 'Invalid query.' }, 400);
  }

  const { search, status, spendingTier, page, pageSize } = parsedQuery.data;

  let filtered = [...customersDB];

  if (search) {
    const needle = search.toLowerCase();
    filtered = filtered.filter((customer) => {
      const plateMatch = customer.vehicles.some((vehicle) => vehicle.plate.toLowerCase().includes(needle));
      return customer.name.toLowerCase().includes(needle) || customer.phone.toLowerCase().includes(needle) || plateMatch;
    });

    filtered = [...filtered].sort((a, b) => {
      const scoreA = phoneScore(a, search);
      const scoreB = phoneScore(b, search);

      if (scoreA !== scoreB) {
        return scoreA - scoreB;
      }

      return (b.lastVisit ? new Date(b.lastVisit).getTime() : 0) - (a.lastVisit ? new Date(a.lastVisit).getTime() : 0);
    });
  } else {
    filtered = sortByLastVisitDesc(filtered);
  }

  if (status) {
    filtered = filtered.filter((customer) => customer.status === status);
  }

  if (spendingTier) {
    filtered = filtered.filter((customer) => matchesSpendingTier(customer.totalSpent, spendingTier));
  }

  const total = filtered.length;
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  const safePage = Math.min(page, totalPages);
  const start = (safePage - 1) * pageSize;
  const items = filtered.slice(start, start + pageSize);

  return response({
    success: true,
    data: {
      items,
      meta: {
        page: safePage,
        pageSize,
        total,
        totalPages
      }
    }
  });
}

export async function POST(request: Request): Promise<NextResponse<ApiResponse<Customer>>> {
  const body = await request.json().catch(() => null);
  const parsed = createCustomerSchema.safeParse(body);

  if (!parsed.success) {
    return response({ success: false, error: parsed.error.issues[0]?.message ?? 'Invalid payload.' }, 400);
  }

  const duplicatePhone = customersDB.find((item) => item.phone.replace(/\D/g, '') === parsed.data.phone.replace(/\D/g, ''));

  if (duplicatePhone) {
    return response({ success: false, error: 'Phone already exists.' }, 409);
  }

  const now = new Date().toISOString();
  const created: Customer = {
    id: crypto.randomUUID(),
    name: parsed.data.name,
    phone: parsed.data.phone,
    email: parsed.data.email,
    address: parsed.data.address,
    status: parsed.data.status,
    vehicles: [],
    totalVisits: 0,
    totalSpent: 0,
    lastVisit: undefined,
    notes: parsed.data.notes,
    createdAt: now,
    updatedAt: now
  };

  customersDB.unshift(created);
  customerHistoryDB[created.id] = [];

  return response({ success: true, data: created }, 201);
}
