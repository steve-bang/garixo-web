import {
  generalRepairInventory,
  mobileMechanicInventory,
  quickLubeInventory,
  tireShopInventory
} from '@/features/inventory/default-values';
import {
  generalRepairServices,
  mobileMechanicServices,
  quickLubeServices,
  tireShopServices
} from '@/features/services/default-values';
import type { GarageIndustryType } from '@/types/garage';
import { firebaseAdmin } from '@/lib/firebase-admin';

type ServiceSeed = {
  id: string;
  name: string;
  category: string;
  price: number;
  estimatedTime: string;
  description?: string;
  status: string;
};

type InventorySeed = {
  id: string;
  name: string;
  sku?: string;
  category: string;
  quantity: number;
  minLevel: number;
  costPrice: number;
  notes?: string;
};

function resolveSeedSource(industryType?: GarageIndustryType): {
  services: ServiceSeed[];
  inventory: InventorySeed[];
} {
  if (industryType === 'Tire Shop') {
    return {
      services: tireShopServices,
      inventory: tireShopInventory
    };
  }

  if (industryType === 'Quick Lube') {
    return {
      services: quickLubeServices,
      inventory: quickLubeInventory
    };
  }

  if (industryType === 'Mobile Mechanic') {
    return {
      services: mobileMechanicServices,
      inventory: mobileMechanicInventory
    };
  }

  return {
    services: generalRepairServices,
    inventory: generalRepairInventory
  };
}

function servicesCollection(garageId: string) {
  return firebaseAdmin.db
    .collection('garages')
    .doc(garageId)
    .collection('services');
}

function inventoryCollection(garageId: string) {
  return firebaseAdmin.db
    .collection('garages')
    .doc(garageId)
    .collection('inventory');
}

export async function seedGarageDefaults(input: {
  garageId: string;
  industryType?: GarageIndustryType;
}): Promise<void> {
  const { garageId, industryType } = input;
  const { services, inventory } = resolveSeedSource(industryType);
  const now = new Date().toISOString();

  const [servicesSnap, inventorySnap] = await Promise.all([
    servicesCollection(garageId).get(),
    inventoryCollection(garageId).get()
  ]);

  const batch = (firebaseAdmin.db as any).batch();

  if (servicesSnap.docs.length === 0) {
    services.forEach((service) => {
      const ref = servicesCollection(garageId).doc(service.id);
      batch.set(ref, {
        name: service.name,
        category: service.category,
        price: service.price,
        estimatedTime: service.estimatedTime,
        description: service.description ?? '',
        status: service.status,
        usedInWorkOrder: false,
        createdAt: now,
        updatedAt: now
      });
    });
  }

  if (inventorySnap.docs.length === 0) {
    inventory.forEach((item) => {
      const ref = inventoryCollection(garageId).doc(item.id);
      batch.set(ref, {
        name: item.name,
        sku: item.sku ?? '',
        category: item.category,
        quantity: item.quantity,
        minLevel: item.minLevel,
        costPrice: item.costPrice,
        notes: item.notes ?? '',
        createdAt: now,
        updatedAt: now
      });
    });
  }

  await batch.commit();
}
