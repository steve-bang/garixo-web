import { InventoryItem } from './types';

export const generalRepairInventory: InventoryItem[] = [
  {
    id: 'inv_engine_oil',
    name: 'Engine Oil 5W-30',
    sku: 'OIL-5W30',
    category: 'OIL',
    quantity: 10,
    minLevel: 20,
    costPrice: 15,
    notes: 'Standard oil for most vehicles.',
    createdAt: '',
    updatedAt: ''
  },
  {
    id: 'inv_oil_filter',
    name: 'Oil Filter',
    sku: 'FILTER-STD',
    category: 'ENGINE',
    quantity: 10,
    minLevel: 15,
    costPrice: 8,
    createdAt: '',
    updatedAt: ''
  },
  {
    id: 'inv_brake_pad',
    name: 'Brake Pads (Front Set)',
    sku: 'BRAKE-FRONT',
    category: 'BRAKE',
    quantity: 10,
    minLevel: 10,
    costPrice: 60,
    createdAt: '',
    updatedAt: ''
  },
  {
    id: 'inv_car_battery',
    name: 'Car Battery',
    sku: 'BAT-STD',
    category: 'ELECTRICAL',
    quantity: 10,
    minLevel: 5,
    costPrice: 90,
    createdAt: '',
    updatedAt: ''
  }
];

export const tireShopInventory: InventoryItem[] = [
  {
    id: 'inv_all_season_tire',
    name: 'All-Season Tire',
    category: 'TIRE',
    quantity: 10,
    minLevel: 8,
    costPrice: 100,
    createdAt: '',
    updatedAt: ''
  },
  {
    id: 'inv_tpms_sensor',
    name: 'TPMS Sensor',
    category: 'ELECTRICAL',
    quantity: 10,
    minLevel: 5,
    costPrice: 40,
    createdAt: '',
    updatedAt: ''
  }
];

export const quickLubeInventory: InventoryItem[] = [
  {
    id: 'inv_conv_oil',
    name: 'Conventional Engine Oil',
    category: 'OIL',
    quantity: 10,
    minLevel: 30,
    costPrice: 12,
    createdAt: '',
    updatedAt: ''
  },
  {
    id: 'inv_syn_oil',
    name: 'Synthetic Engine Oil',
    category: 'OIL',
    quantity: 10,
    minLevel: 25,
    costPrice: 20,
    createdAt: '',
    updatedAt: ''
  }
];

export const mobileMechanicInventory: InventoryItem[] = [
  {
    id: 'inv_mobile_battery',
    name: 'Car Battery',
    category: 'ELECTRICAL',
    quantity: 10,
    minLevel: 3,
    costPrice: 90,
    createdAt: '',
    updatedAt: ''
  },
  {
    id: 'inv_mobile_brake',
    name: 'Brake Pads',
    category: 'BRAKE',
    quantity: 10,
    minLevel: 5,
    costPrice: 60,
    createdAt: '',
    updatedAt: ''
  }
];
