import { Service } from './types';

export const generalRepairServices: Service[] = [
  {
    id: 'srv_oil_change',
    name: 'Oil Change',
    category: 'OIL',
    price: 49.99,
    estimatedTime: '30m',
    description: 'Standard engine oil and oil filter replacement.',
    status: 'ACTIVE',
    createdAt: '',
    updatedAt: ''
  },
  {
    id: 'srv_brake_inspection',
    name: 'Brake Inspection',
    category: 'BRAKE',
    price: 39.99,
    estimatedTime: '30m',
    description: 'Full brake system inspection.',
    status: 'ACTIVE',
    createdAt: '',
    updatedAt: ''
  },
  {
    id: 'srv_brake_pad',
    name: 'Brake Pad Replacement',
    category: 'BRAKE',
    price: 249.99,
    estimatedTime: '2h',
    description: 'Front or rear brake pad replacement.',
    status: 'ACTIVE',
    createdAt: '',
    updatedAt: ''
  },
  {
    id: 'srv_engine_diag',
    name: 'Engine Diagnostic',
    category: 'ENGINE',
    price: 89.99,
    estimatedTime: '1h',
    description: 'Computer diagnostic scan and evaluation.',
    status: 'ACTIVE',
    createdAt: '',
    updatedAt: ''
  },
  {
    id: 'srv_battery_replace',
    name: 'Battery Replacement',
    category: 'ELECTRICAL',
    price: 179.99,
    estimatedTime: '45m',
    description: 'Battery replacement and system check.',
    status: 'ACTIVE',
    createdAt: '',
    updatedAt: ''
  }
];

export const tireShopServices: Service[] = [
  {
    id: 'srv_tire_install',
    name: 'Tire Installation (Per Tire)',
    category: 'TIRE',
    price: 25,
    estimatedTime: '20m',
    status: 'ACTIVE',
    createdAt: '',
    updatedAt: ''
  },
  {
    id: 'srv_tire_balance',
    name: 'Tire Balancing',
    category: 'TIRE',
    price: 20,
    estimatedTime: '20m',
    status: 'ACTIVE',
    createdAt: '',
    updatedAt: ''
  },
  {
    id: 'srv_wheel_align',
    name: 'Wheel Alignment',
    category: 'TIRE',
    price: 99.99,
    estimatedTime: '1h',
    status: 'ACTIVE',
    createdAt: '',
    updatedAt: ''
  },
  {
    id: 'srv_flat_repair',
    name: 'Flat Tire Repair',
    category: 'TIRE',
    price: 35,
    estimatedTime: '30m',
    status: 'ACTIVE',
    createdAt: '',
    updatedAt: ''
  }
];

export const quickLubeServices: Service[] = [
  {
    id: 'srv_conv_oil',
    name: 'Conventional Oil Change',
    category: 'OIL',
    price: 39.99,
    estimatedTime: '20m',
    status: 'ACTIVE',
    createdAt: '',
    updatedAt: ''
  },
  {
    id: 'srv_syn_oil',
    name: 'Full Synthetic Oil Change',
    category: 'OIL',
    price: 79.99,
    estimatedTime: '30m',
    status: 'ACTIVE',
    createdAt: '',
    updatedAt: ''
  },
  {
    id: 'srv_air_filter',
    name: 'Air Filter Replacement',
    category: 'ENGINE',
    price: 39.99,
    estimatedTime: '15m',
    status: 'ACTIVE',
    createdAt: '',
    updatedAt: ''
  }
];

export const mobileMechanicServices: Service[] = [
  {
    id: 'srv_mobile_diag',
    name: 'On-Site Diagnostic',
    category: 'ENGINE',
    price: 120,
    estimatedTime: '1h',
    status: 'ACTIVE',
    createdAt: '',
    updatedAt: ''
  },
  {
    id: 'srv_roadside',
    name: 'Emergency Roadside Repair',
    category: 'OTHER',
    price: 150,
    estimatedTime: '1h',
    status: 'ACTIVE',
    createdAt: '',
    updatedAt: ''
  },
  {
    id: 'srv_battery_mobile',
    name: 'Battery Replacement (On-Site)',
    category: 'ELECTRICAL',
    price: 199.99,
    estimatedTime: '45m',
    status: 'ACTIVE',
    createdAt: '',
    updatedAt: ''
  }
];
