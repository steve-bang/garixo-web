import type { Service } from '@/features/services/types';

const now = new Date().toISOString();

export let servicesDB: Service[] = [
  { id: 's1', name: 'Engine Diagnostic', category: 'ENGINE', price: 120, estimatedTime: '1 hour', status: 'ACTIVE', createdAt: now, updatedAt: now, usedInWorkOrder: true },
  { id: 's2', name: 'Engine Oil Change', category: 'OIL', price: 55, estimatedTime: '30 minutes', status: 'ACTIVE', createdAt: now, updatedAt: now, usedInWorkOrder: true },
  { id: 's3', name: 'Synthetic Oil Change', category: 'OIL', price: 85, estimatedTime: '45 minutes', status: 'ACTIVE', createdAt: now, updatedAt: now },
  { id: 's4', name: 'Brake Pad Replacement', category: 'BRAKE', price: 210, estimatedTime: '2 hours', status: 'ACTIVE', createdAt: now, updatedAt: now, usedInWorkOrder: true },
  { id: 's5', name: 'Brake Fluid Flush', category: 'BRAKE', price: 95, estimatedTime: '1 hour', status: 'ACTIVE', createdAt: now, updatedAt: now },
  { id: 's6', name: 'Rotor Resurfacing', category: 'BRAKE', price: 140, estimatedTime: '1-2 hours', status: 'INACTIVE', createdAt: now, updatedAt: now },
  { id: 's7', name: 'Wheel Alignment', category: 'TIRE', price: 80, estimatedTime: '1 hour', status: 'ACTIVE', createdAt: now, updatedAt: now },
  { id: 's8', name: 'Tire Rotation', category: 'TIRE', price: 40, estimatedTime: '30 minutes', status: 'ACTIVE', createdAt: now, updatedAt: now },
  { id: 's9', name: 'Tire Replacement', category: 'TIRE', price: 160, estimatedTime: '1-2 hours', status: 'ACTIVE', createdAt: now, updatedAt: now, usedInWorkOrder: true },
  { id: 's10', name: 'Battery Replacement', category: 'ELECTRICAL', price: 135, estimatedTime: '45 minutes', status: 'ACTIVE', createdAt: now, updatedAt: now, usedInWorkOrder: true },
  { id: 's11', name: 'Alternator Check', category: 'ELECTRICAL', price: 90, estimatedTime: '1 hour', status: 'ACTIVE', createdAt: now, updatedAt: now },
  { id: 's12', name: 'Starter Motor Repair', category: 'ELECTRICAL', price: 280, estimatedTime: '2-3 hours', status: 'INACTIVE', createdAt: now, updatedAt: now },
  { id: 's13', name: 'Coolant Flush', category: 'ENGINE', price: 110, estimatedTime: '1 hour', status: 'ACTIVE', createdAt: now, updatedAt: now },
  { id: 's14', name: 'Transmission Service', category: 'ENGINE', price: 320, estimatedTime: '2-3 hours', status: 'ACTIVE', createdAt: now, updatedAt: now },
  { id: 's15', name: 'Air Filter Replacement', category: 'OTHER', price: 35, estimatedTime: '30 minutes', status: 'ACTIVE', createdAt: now, updatedAt: now },
  { id: 's16', name: 'Cabin Filter Replacement', category: 'OTHER', price: 38, estimatedTime: '30 minutes', status: 'ACTIVE', createdAt: now, updatedAt: now },
  { id: 's17', name: 'AC Performance Check', category: 'OTHER', price: 75, estimatedTime: '1 hour', status: 'ACTIVE', createdAt: now, updatedAt: now },
  { id: 's18', name: 'AC Gas Refill', category: 'OTHER', price: 145, estimatedTime: '1-2 hours', status: 'ACTIVE', createdAt: now, updatedAt: now },
  { id: 's19', name: 'Suspension Inspection', category: 'OTHER', price: 100, estimatedTime: '1 hour', status: 'ACTIVE', createdAt: now, updatedAt: now, usedInWorkOrder: true },
  { id: 's20', name: 'Shock Absorber Replacement', category: 'OTHER', price: 260, estimatedTime: '2-3 hours', status: 'ACTIVE', createdAt: now, updatedAt: now },
  { id: 's21', name: 'Spark Plug Replacement', category: 'ENGINE', price: 130, estimatedTime: '1 hour', status: 'ACTIVE', createdAt: now, updatedAt: now },
  { id: 's22', name: 'Fuel Injector Cleaning', category: 'ENGINE', price: 185, estimatedTime: '2 hours', status: 'ACTIVE', createdAt: now, updatedAt: now },
  { id: 's23', name: 'Headlight Restoration', category: 'ELECTRICAL', price: 70, estimatedTime: '45 minutes', status: 'INACTIVE', createdAt: now, updatedAt: now },
  { id: 's24', name: 'Safety Inspection', category: 'OTHER', price: 60, estimatedTime: '45 minutes', status: 'ACTIVE', createdAt: now, updatedAt: now, usedInWorkOrder: true }
];
