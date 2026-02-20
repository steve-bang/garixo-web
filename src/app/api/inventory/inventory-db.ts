import type { InventoryItem } from '@/features/inventory/types';

const now = new Date().toISOString();

export let inventoryDB: InventoryItem[] = [
  { id: 'i1', name: 'Brake Pad Set', sku: 'BRK-1001', category: 'BRAKE', quantity: 24, minLevel: 8, costPrice: 42, createdAt: now, updatedAt: now },
  { id: 'i2', name: 'Brake Disc Front', sku: 'BRK-1002', category: 'BRAKE', quantity: 10, minLevel: 6, costPrice: 58, createdAt: now, updatedAt: now },
  { id: 'i3', name: 'Brake Fluid DOT4', sku: 'BRK-1003', category: 'BRAKE', quantity: 6, minLevel: 6, costPrice: 14, createdAt: now, updatedAt: now },
  { id: 'i4', name: 'Engine Oil 5W-30', sku: 'OIL-2001', category: 'OIL', quantity: 40, minLevel: 15, costPrice: 22, createdAt: now, updatedAt: now },
  { id: 'i5', name: 'Engine Oil 10W-40', sku: 'OIL-2002', category: 'OIL', quantity: 14, minLevel: 12, costPrice: 20, createdAt: now, updatedAt: now },
  { id: 'i6', name: 'Oil Filter Toyota', sku: 'OIL-2003', category: 'OIL', quantity: 5, minLevel: 10, costPrice: 8, createdAt: now, updatedAt: now },
  { id: 'i7', name: 'Air Filter Honda', sku: 'ENG-3001', category: 'ENGINE', quantity: 12, minLevel: 8, costPrice: 11, createdAt: now, updatedAt: now },
  { id: 'i8', name: 'Spark Plug NGK', sku: 'ENG-3002', category: 'ENGINE', quantity: 60, minLevel: 20, costPrice: 6, createdAt: now, updatedAt: now },
  { id: 'i9', name: 'Timing Belt Kit', sku: 'ENG-3003', category: 'ENGINE', quantity: 3, minLevel: 5, costPrice: 95, createdAt: now, updatedAt: now },
  { id: 'i10', name: 'Fuel Pump Assembly', sku: 'ENG-3004', category: 'ENGINE', quantity: 2, minLevel: 4, costPrice: 130, createdAt: now, updatedAt: now },
  { id: 'i11', name: 'Car Battery 12V', sku: 'ELE-4001', category: 'ELECTRICAL', quantity: 9, minLevel: 5, costPrice: 78, createdAt: now, updatedAt: now },
  { id: 'i12', name: 'Alternator Belt', sku: 'ELE-4002', category: 'ELECTRICAL', quantity: 7, minLevel: 6, costPrice: 16, createdAt: now, updatedAt: now },
  { id: 'i13', name: 'Starter Relay', sku: 'ELE-4003', category: 'ELECTRICAL', quantity: 0, minLevel: 4, costPrice: 12, createdAt: now, updatedAt: now },
  { id: 'i14', name: 'Headlight Bulb H4', sku: 'ELE-4004', category: 'ELECTRICAL', quantity: 30, minLevel: 10, costPrice: 5, createdAt: now, updatedAt: now },
  { id: 'i15', name: 'Tire 195/65R15', sku: 'TIR-5001', category: 'TIRE', quantity: 16, minLevel: 8, costPrice: 72, createdAt: now, updatedAt: now },
  { id: 'i16', name: 'Tire 205/55R16', sku: 'TIR-5002', category: 'TIRE', quantity: 8, minLevel: 8, costPrice: 80, createdAt: now, updatedAt: now },
  { id: 'i17', name: 'Wheel Nut Set', sku: 'TIR-5003', category: 'TIRE', quantity: 45, minLevel: 15, costPrice: 9, createdAt: now, updatedAt: now },
  { id: 'i18', name: 'Valve Stem Pack', sku: 'TIR-5004', category: 'TIRE', quantity: 4, minLevel: 6, costPrice: 3, createdAt: now, updatedAt: now },
  { id: 'i19', name: 'Radiator Coolant', sku: 'ENG-3005', category: 'ENGINE', quantity: 18, minLevel: 8, costPrice: 15, createdAt: now, updatedAt: now },
  { id: 'i20', name: 'Engine Mount', sku: 'ENG-3006', category: 'ENGINE', quantity: 1, minLevel: 3, costPrice: 64, createdAt: now, updatedAt: now },
  { id: 'i21', name: 'ABS Sensor', sku: 'BRK-1004', category: 'BRAKE', quantity: 11, minLevel: 5, costPrice: 34, createdAt: now, updatedAt: now },
  { id: 'i22', name: 'Handbrake Cable', sku: 'BRK-1005', category: 'BRAKE', quantity: 2, minLevel: 4, costPrice: 23, createdAt: now, updatedAt: now },
  { id: 'i23', name: 'Ignition Coil', sku: 'ELE-4005', category: 'ELECTRICAL', quantity: 0, minLevel: 3, costPrice: 48, createdAt: now, updatedAt: now },
  { id: 'i24', name: 'Wiper Blade Set', sku: 'ELE-4006', category: 'ELECTRICAL', quantity: 20, minLevel: 10, costPrice: 7, createdAt: now, updatedAt: now },
  { id: 'i25', name: 'Transmission Oil', sku: 'OIL-2004', category: 'OIL', quantity: 9, minLevel: 10, costPrice: 26, createdAt: now, updatedAt: now },
  { id: 'i26', name: 'Power Steering Fluid', sku: 'OIL-2005', category: 'OIL', quantity: 13, minLevel: 8, costPrice: 12, createdAt: now, updatedAt: now },
  { id: 'i27', name: 'Cabin Air Filter', sku: 'ENG-3007', category: 'ENGINE', quantity: 26, minLevel: 10, costPrice: 10, createdAt: now, updatedAt: now },
  { id: 'i28', name: 'Wheel Bearing Front', sku: 'TIR-5005', category: 'TIRE', quantity: 5, minLevel: 5, costPrice: 39, createdAt: now, updatedAt: now },
  { id: 'i29', name: 'Fuse 10A Pack', sku: 'ELE-4007', category: 'ELECTRICAL', quantity: 32, minLevel: 12, costPrice: 2, createdAt: now, updatedAt: now },
  { id: 'i30', name: 'Oil Drain Plug', sku: 'OIL-2006', category: 'OIL', quantity: 0, minLevel: 6, costPrice: 4, createdAt: now, updatedAt: now }
];
