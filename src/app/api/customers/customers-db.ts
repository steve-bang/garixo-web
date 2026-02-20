import type { Customer, CustomerStatus, ServiceRecord, Vehicle } from '@/features/customers/types';

const names = [
  'Nguyen Van Minh',
  'Tran Thi Lan',
  'Pham Quoc Hung',
  'Le Thanh Tuan',
  'Hoang Anh',
  'Doan Thi Huong',
  'Vo Minh Duc',
  'Bui Thanh Nam',
  'Dang Thi Mai',
  'Phan Quang Huy',
  'Ngo Bao Chau',
  'Truong Van Khoa',
  'Huynh Ngoc Son',
  'Dinh Thi Yen',
  'Cao Van Hai',
  'Vu Thi Hoa',
  'Mai Quoc Dat',
  'Lam Thanh Phong',
  'Ta Thi Thao',
  'Nguyen Duc Tai',
  'Tran Quoc Bao',
  'Le Thi My',
  'Pham Gia Huy',
  'Hoang Thanh Tung',
  'Do Thi Nhi',
  'Vo Quoc Long',
  'Bui Tuan Kiet',
  'Dang Minh Tri',
  'Phan Thi Nga',
  'Ngo Tan Phat',
  'Truong Bao An',
  'Huynh Khanh Linh',
  'Dinh Tuan Vu',
  'Cao Thi Kim',
  'Vu Minh Hoang',
  'Mai Thanh Ha',
  'Lam Quoc Viet',
  'Ta Nguyen Anh',
  'Nguyen Thi Quynh',
  'Tran Van Loc',
  'Le Gia Bao',
  'Pham Thanh Nhon',
  'Hoang Thi Thu',
  'Do Quang Minh',
  'Vo Thanh Dat',
  'Bui Thi Han',
  'Dang Quoc Vinh',
  'Phan Minh Quan'
];

const brands = ['Toyota', 'Honda', 'Ford', 'Mazda', 'Kia', 'Hyundai', 'Mitsubishi'];
const services = ['Oil Change', 'Brake Service', 'Tire Replacement', 'Engine Diagnostic', 'Battery Replacement'];

function isoDaysAgo(days: number): string {
  const d = new Date();
  d.setDate(d.getDate() - days);
  return d.toISOString();
}

function phone(index: number): string {
  return `09${String(10000000 + index * 137).slice(0, 8)}`;
}

function plate(index: number, offset: number): string {
  return `${50 + (index % 20)}A-${String(10000 + index * 17 + offset * 3).slice(-5)}`;
}

function makeVehicles(index: number, visitCount: number): Vehicle[] {
  const count = index % 4;
  return Array.from({ length: count }).map((_, vehicleIndex) => ({
    id: `v-${index}-${vehicleIndex}`,
    plate: plate(index, vehicleIndex),
    brand: brands[(index + vehicleIndex) % brands.length],
    lastServiceDate: visitCount > 0 ? isoDaysAgo((index + 1) * (vehicleIndex + 2)) : undefined
  }));
}

function makeHistory(index: number, vehicles: Vehicle[], visitCount: number): ServiceRecord[] {
  const count = Math.min(visitCount, 10);

  return Array.from({ length: count }).map((_, historyIndex) => {
    const daysAgo = index * 3 + historyIndex * 11 + 1;
    const amount = 1_200_000 + ((index + historyIndex * 7) % 16) * 850_000;
    const vehicle = vehicles.length ? vehicles[historyIndex % vehicles.length].plate : `NO-VEH-${index}`;

    return {
      id: `sr-${index}-${historyIndex}`,
      date: isoDaysAgo(daysAgo),
      vehiclePlate: vehicle,
      serviceName: services[(historyIndex + index) % services.length],
      amount
    };
  });
}

const customers = names.map((name, index) => {
  const visitCount = index % 7 === 0 ? 0 : (index % 8) + 1;
  const vehicles = makeVehicles(index, visitCount);
  const history = makeHistory(index, vehicles, visitCount);
  const totalSpent = history.reduce((sum, item) => sum + item.amount, 0);
  const lastVisit = history.length ? history[0].date : undefined;

  const status: CustomerStatus = index % 9 === 0 ? 'VIP' : index % 6 === 0 ? 'INACTIVE' : 'ACTIVE';

  return {
    customer: {
      id: `c-${index + 1}`,
      name,
      phone: phone(index + 1),
      email: index % 5 === 0 ? undefined : `${name.toLowerCase().replace(/\s+/g, '.')}@gmail.com`,
      address: index % 4 === 0 ? undefined : `${20 + index} Nguyen Trai, Ho Chi Minh City`,
      status,
      vehicles,
      totalVisits: visitCount,
      totalSpent,
      lastVisit,
      notes: index % 10 === 0 ? 'Prefers morning appointments.' : undefined,
      createdAt: isoDaysAgo(200 + index),
      updatedAt: isoDaysAgo(index % 15)
    },
    history
  };
});

export let customersDB: Customer[] = customers.map((item) => item.customer);

export let customerHistoryDB: Record<string, ServiceRecord[]> = Object.fromEntries(
  customers.map((item) => [item.customer.id, item.history])
);
