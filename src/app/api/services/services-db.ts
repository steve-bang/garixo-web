import { firebaseAdmin } from '@/lib/firebase-admin';
import type { Service } from '@/features/services/types';
import type { CreateServiceInput } from '@/features/services/schema';

type SortMode =
  | 'default'
  | 'name_asc'
  | 'name_desc'
  | 'price_asc'
  | 'price_desc';

export type ServiceListParams = {
  search?: string;
  category?: Service['category'];
  status?: Service['status'];
  page: number;
  pageSize: number;
  sort: SortMode;
};

export type ServiceListResult = {
  items: Service[];
  meta: {
    page: number;
    pageSize: number;
    total: number;
    totalPages: number;
  };
};

type ServiceFirestoreDoc = {
  id?: string;
  name?: string;
  category?: Service['category'];
  price?: number;
  estimatedTime?: string;
  description?: string;
  status?: Service['status'];
  usedInWorkOrder?: boolean;
  createdAt?: string;
  updatedAt?: string;
  defaultPrice?: number | null;
  standardDuration?: number | null;
};

function servicesCollection(garageId: string) {
  return firebaseAdmin.db
    .collection('garages')
    .doc(garageId)
    .collection('services');
}

function toEstimatedTimeFromMinutes(
  minutes: number | null | undefined
): string {
  if (!minutes || minutes <= 0) {
    return '30 minutes';
  }
  if (minutes < 60) {
    return `${minutes} minutes`;
  }
  if (minutes % 60 === 0) {
    return `${minutes / 60} hour`;
  }
  return `${minutes} minutes`;
}

function mapFirestoreDoc(id: string, raw: ServiceFirestoreDoc): Service {
  const createdAt = raw.createdAt ?? new Date().toISOString();
  const updatedAt = raw.updatedAt ?? createdAt;

  return {
    id,
    name: raw.name ?? 'Untitled Service',
    category: raw.category ?? 'OTHER',
    price:
      typeof raw.price === 'number'
        ? raw.price
        : typeof raw.defaultPrice === 'number'
          ? raw.defaultPrice
          : 0,
    estimatedTime:
      raw.estimatedTime ?? toEstimatedTimeFromMinutes(raw.standardDuration),
    description: raw.description ?? '',
    status: raw.status ?? 'ACTIVE',
    usedInWorkOrder: Boolean(raw.usedInWorkOrder),
    createdAt,
    updatedAt
  };
}

function defaultSort(a: Service, b: Service): number {
  if (a.status !== b.status) {
    return a.status === 'ACTIVE' ? -1 : 1;
  }

  if (a.category !== b.category) {
    return a.category.localeCompare(b.category);
  }

  return a.name.localeCompare(b.name);
}

function applySort(items: Service[], sort: SortMode): Service[] {
  const copy = [...items];

  switch (sort) {
    case 'name_asc':
      return copy.sort((a, b) => a.name.localeCompare(b.name));
    case 'name_desc':
      return copy.sort((a, b) => b.name.localeCompare(a.name));
    case 'price_asc':
      return copy.sort((a, b) => a.price - b.price);
    case 'price_desc':
      return copy.sort((a, b) => b.price - a.price);
    default:
      return copy.sort(defaultSort);
  }
}

export async function listGarageServices(garageId: string): Promise<Service[]> {
  const snap = await servicesCollection(garageId).get();
  return snap.docs.map((doc: { id: string; data: () => unknown }) => {
    return mapFirestoreDoc(doc.id, doc.data() as ServiceFirestoreDoc);
  });
}

export async function listGarageServicesWithQuery(
  garageId: string,
  params: ServiceListParams
): Promise<ServiceListResult> {
  const { search, category, status, page, pageSize, sort } = params;

  let filtered = await listGarageServices(garageId);

  if (search) {
    const needle = search.trim().toLowerCase();
    filtered = filtered.filter((item) =>
      item.name.toLowerCase().includes(needle)
    );
  }

  if (category) {
    filtered = filtered.filter((item) => item.category === category);
  }

  if (status) {
    filtered = filtered.filter((item) => item.status === status);
  }

  const sorted = applySort(filtered, sort);
  const total = sorted.length;
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  const safePage = Math.min(page, totalPages);
  const start = (safePage - 1) * pageSize;

  return {
    items: sorted.slice(start, start + pageSize),
    meta: {
      page: safePage,
      pageSize,
      total,
      totalPages
    }
  };
}

export async function findGarageServiceById(
  garageId: string,
  serviceId: string
): Promise<Service | null> {
  const snap = await servicesCollection(garageId).doc(serviceId).get();
  if (!snap.exists) {
    return null;
  }

  return mapFirestoreDoc(snap.id, snap.data() as ServiceFirestoreDoc);
}

export async function hasDuplicateServiceName(
  garageId: string,
  name: string,
  excludeId?: string
): Promise<boolean> {
  const normalized = name.trim().toLowerCase();
  const items = await listGarageServices(garageId);
  return items.some(
    (item) =>
      item.name.trim().toLowerCase() === normalized &&
      (!excludeId || item.id !== excludeId)
  );
}

export async function createGarageService(
  garageId: string,
  input: CreateServiceInput
): Promise<Service> {
  const ref = servicesCollection(garageId).doc();
  const now = new Date().toISOString();
  const payload: ServiceFirestoreDoc = {
    name: input.name,
    category: input.category,
    price: input.price,
    estimatedTime: input.estimatedTime,
    description: input.description ?? '',
    status: input.status,
    usedInWorkOrder: false,
    createdAt: now,
    updatedAt: now
  };

  await ref.set(payload);
  return mapFirestoreDoc(ref.id, payload);
}

export async function updateGarageService(
  garageId: string,
  serviceId: string,
  input: Partial<CreateServiceInput>
): Promise<Service | null> {
  const ref = servicesCollection(garageId).doc(serviceId);
  const existing = await ref.get();

  if (!existing.exists) {
    return null;
  }

  const merged: ServiceFirestoreDoc = {
    ...(existing.data() as ServiceFirestoreDoc),
    ...input,
    updatedAt: new Date().toISOString()
  };

  await ref.set(merged, { merge: true });
  const snap = await ref.get();
  if (!snap.exists) {
    return null;
  }

  return mapFirestoreDoc(snap.id, snap.data() as ServiceFirestoreDoc);
}

export async function isServiceUsedInWorkOrders(
  garageId: string,
  service: Pick<Service, 'id' | 'name'>
): Promise<boolean> {
  const workOrdersRef = firebaseAdmin.db
    .collection('garages')
    .doc(garageId)
    .collection('workOrders');

  const byServiceId = await workOrdersRef
    .where('serviceId', '==', service.id)
    .limit(1)
    .get();
  if (!byServiceId.empty) {
    return true;
  }

  const byServiceName = await workOrdersRef
    .where('service', '==', service.name)
    .limit(1)
    .get();
  return !byServiceName.empty;
}

export async function deleteGarageService(
  garageId: string,
  serviceId: string
): Promise<Service | null> {
  const service = await findGarageServiceById(garageId, serviceId);
  if (!service) {
    return null;
  }

  await servicesCollection(garageId).doc(serviceId).delete();
  return service;
}

export async function bulkUpdateGarageServices(
  garageId: string,
  percentage: number
): Promise<Service[]> {
  const factor = 1 + percentage / 100;
  const items = await listGarageServices(garageId);
  const active = items.filter((service) => service.status === 'ACTIVE');

  await Promise.all(
    active.map((service) =>
      servicesCollection(garageId)
        .doc(service.id)
        .set(
          {
            price: Math.round(service.price * factor),
            updatedAt: new Date().toISOString()
          },
          { merge: true }
        )
    )
  );

  return listGarageServices(garageId).then((all) =>
    all.filter((item) => item.status === 'ACTIVE')
  );
}
