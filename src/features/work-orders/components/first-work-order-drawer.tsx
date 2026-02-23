'use client';

import { useEffect, useMemo, useState } from 'react';
import { z } from 'zod';

import { Button } from '@/components/ui/button';
import { Drawer } from '@/components/ui/drawer';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { CustomerAutocomplete } from '@/features/work-orders/components/customer-autocomplete';
import { InventorySelector } from '@/features/work-orders/components/inventory-selector';
import { ServiceSelector } from '@/features/work-orders/components/service-selector';
import {
  createWorkOrder,
  updateWorkOrderStatus
} from '@/features/work-orders/service';
import type { CreateWorkOrderInput } from '@/features/work-orders/schema';
import type { Customer } from '@/features/customers/types';
import type { InventoryItem } from '@/features/inventory/types';
import type { Service } from '@/features/services/types';
import { WorkOrderStatusEnum } from '@/features/work-orders/types';
import type { OrderPart, OrderService } from '@/features/work-orders/types';
import { formatCurrencyVnd } from '@/features/work-orders/utils';
import { useToast } from '@/hooks/use-toast';

const quickCustomerSchema = z.object({
  name: z.string().trim().min(1, 'Customer name is required.'),
  phone: z.string().trim().optional()
});

const quickVehicleSchema = z.object({
  plate: z.string().trim().min(1, 'Plate number is required.'),
  model: z.string().trim().optional()
});

const quickServiceSchema = z.object({
  name: z.string().trim().min(1, 'Service name is required.'),
  price: z.coerce.number().positive('Price must be greater than 0.')
});

type Props = {
  open: boolean;
  onClose: () => void;
  onCreated: (orderId: string) => void;
};

type CustomerApiResponse = {
  success: boolean;
  data?: { items: Customer[] };
  error?: string;
};
type InventoryApiResponse = {
  success: boolean;
  data?: { items: InventoryItem[] };
  error?: string;
};
type ServicesApiResponse = {
  success: boolean;
  data?: { items: Service[] };
  error?: string;
};

function useDebouncedValue(value: string, delay = 300): string {
  const [debounced, setDebounced] = useState(value);

  useEffect(() => {
    const timer = window.setTimeout(() => setDebounced(value), delay);
    return () => window.clearTimeout(timer);
  }, [value, delay]);

  return debounced;
}

async function fetchCustomers(search: string): Promise<Customer[]> {
  const response = await fetch(
    `/api/customers?search=${encodeURIComponent(search)}&page=1&pageSize=8`
  );
  const payload = (await response.json()) as CustomerApiResponse;
  if (!payload.success || !payload.data) {
    return [];
  }
  return payload.data.items;
}

async function fetchServices(search: string): Promise<Service[]> {
  const response = await fetch(
    `/api/services?search=${encodeURIComponent(search)}&status=ACTIVE&page=1&pageSize=8&sort=name_asc`
  );
  const payload = (await response.json()) as ServicesApiResponse;
  if (!payload.success || !payload.data) {
    return [];
  }
  return payload.data.items;
}

async function fetchInventory(search: string): Promise<InventoryItem[]> {
  const response = await fetch(
    `/api/inventory?search=${encodeURIComponent(search)}&page=1&pageSize=8`
  );
  const payload = (await response.json()) as InventoryApiResponse;
  if (!payload.success || !payload.data) {
    return [];
  }
  return payload.data.items;
}

export function FirstWorkOrderDrawer({
  open,
  onClose,
  onCreated
}: Props): JSX.Element {
  const toast = useToast();

  const [customerQuery, setCustomerQuery] = useState('');
  const [serviceQuery, setServiceQuery] = useState('');
  const [inventoryQuery, setInventoryQuery] = useState('');

  const debouncedCustomerQuery = useDebouncedValue(customerQuery);
  const debouncedServiceQuery = useDebouncedValue(serviceQuery);
  const debouncedInventoryQuery = useDebouncedValue(inventoryQuery);

  const [customers, setCustomers] = useState<Customer[]>([]);
  const [serviceOptions, setServiceOptions] = useState<Service[]>([]);
  const [inventoryOptions, setInventoryOptions] = useState<InventoryItem[]>([]);

  const [loadingCustomers, setLoadingCustomers] = useState(false);
  const [loadingServices, setLoadingServices] = useState(false);
  const [loadingInventory, setLoadingInventory] = useState(false);

  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(
    null
  );
  const [selectedVehicleId, setSelectedVehicleId] = useState('');
  const [selectedServices, setSelectedServices] = useState<OrderService[]>([]);
  const [selectedParts, setSelectedParts] = useState<OrderPart[]>([]);
  const [notes, setNotes] = useState('');
  const [submitError, setSubmitError] = useState('');
  const [isSubmitting, setSubmitting] = useState(false);

  const [showCreateCustomer, setShowCreateCustomer] = useState(false);
  const [showCreateVehicle, setShowCreateVehicle] = useState(false);
  const [showQuickService, setShowQuickService] = useState(false);
  const [inventoryOpen, setInventoryOpen] = useState(false);

  const [quickCustomerName, setQuickCustomerName] = useState('');
  const [quickCustomerPhone, setQuickCustomerPhone] = useState('');
  const [quickVehiclePlate, setQuickVehiclePlate] = useState('');
  const [quickVehicleModel, setQuickVehicleModel] = useState('');
  const [quickServiceName, setQuickServiceName] = useState('');
  const [quickServicePrice, setQuickServicePrice] = useState('');

  useEffect(() => {
    if (!open) {
      return;
    }

    setLoadingCustomers(true);
    void fetchCustomers(debouncedCustomerQuery)
      .then((items) => setCustomers(items))
      .finally(() => setLoadingCustomers(false));
  }, [debouncedCustomerQuery, open]);

  useEffect(() => {
    if (!open) {
      return;
    }

    setLoadingServices(true);
    void fetchServices(debouncedServiceQuery)
      .then((items) => setServiceOptions(items))
      .finally(() => setLoadingServices(false));
  }, [debouncedServiceQuery, open]);

  useEffect(() => {
    if (!open || !inventoryOpen) {
      return;
    }

    setLoadingInventory(true);
    void fetchInventory(debouncedInventoryQuery)
      .then((items) => setInventoryOptions(items))
      .finally(() => setLoadingInventory(false));
  }, [debouncedInventoryQuery, inventoryOpen, open]);

  useEffect(() => {
    if (!open) {
      return;
    }

    setSelectedCustomer(null);
    setSelectedVehicleId('');
    setSelectedServices([]);
    setSelectedParts([]);
    setNotes('');
    setSubmitError('');
    setShowCreateCustomer(false);
    setShowCreateVehicle(false);
    setShowQuickService(false);
    setInventoryOpen(false);
    setQuickCustomerName('');
    setQuickCustomerPhone('');
    setQuickVehiclePlate('');
    setQuickVehicleModel('');
    setQuickServiceName('');
    setQuickServicePrice('');
    setCustomerQuery('');
    setServiceQuery('');
    setInventoryQuery('');
  }, [open]);

  const selectedVehicle = useMemo(() => {
    if (!selectedCustomer || !selectedVehicleId) {
      return null;
    }

    return (
      selectedCustomer.vehicles.find(
        (vehicle) => vehicle.id === selectedVehicleId
      ) ?? null
    );
  }, [selectedCustomer, selectedVehicleId]);

  const totalPrice = useMemo(() => {
    const servicesTotal = selectedServices.reduce(
      (sum, item) => sum + item.price,
      0
    );
    const partsTotal = selectedParts.reduce(
      (sum, item) => sum + item.quantity * item.unitPrice,
      0
    );
    return servicesTotal + partsTotal;
  }, [selectedParts, selectedServices]);

  const canStartWork = Boolean(
    selectedCustomer &&
    (selectedVehicle || quickVehiclePlate.trim()) &&
    selectedServices.length > 0 &&
    !isSubmitting
  );

  const createCustomerInline = async (): Promise<void> => {
    const parsed = quickCustomerSchema.safeParse({
      name: quickCustomerName,
      phone: quickCustomerPhone
    });
    if (!parsed.success) {
      setSubmitError(parsed.error.issues[0]?.message ?? 'Invalid customer.');
      return;
    }

    const fallbackPhone =
      parsed.data.phone?.trim() || `09${String(Date.now()).slice(-8)}`;

    const response = await fetch('/api/customers', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: parsed.data.name,
        phone: fallbackPhone,
        status: 'ACTIVE'
      })
    });

    const payload = (await response.json()) as {
      success: boolean;
      data?: Customer;
      error?: string;
    };
    if (!payload.success || !payload.data) {
      setSubmitError(payload.error ?? 'Could not create customer.');
      return;
    }

    setSelectedCustomer(payload.data);
    setCustomers((prev) => [payload.data as Customer, ...prev]);
    setShowCreateCustomer(false);
    setQuickCustomerName('');
    setQuickCustomerPhone('');
  };

  const createVehicleInline = async (): Promise<void> => {
    if (!selectedCustomer) {
      setSubmitError('Please select customer first.');
      return;
    }

    const parsed = quickVehicleSchema.safeParse({
      plate: quickVehiclePlate,
      model: quickVehicleModel
    });

    if (!parsed.success) {
      setSubmitError(parsed.error.issues[0]?.message ?? 'Invalid vehicle.');
      return;
    }

    const response = await fetch('/api/vehicles', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        plateNumber: parsed.data.plate,
        model: parsed.data.model,
        customerId: selectedCustomer.id,
        customerName: selectedCustomer.name,
        customerPhone: selectedCustomer.phone,
        status: 'ACTIVE'
      })
    });

    const payload = (await response.json()) as {
      success: boolean;
      data?: { id: string; plateNumber: string; model?: string };
      error?: string;
    };
    if (!payload.success || !payload.data) {
      setSubmitError(payload.error ?? 'Could not create vehicle.');
      return;
    }

    const vehicle = {
      id: payload.data.id,
      plate: payload.data.plateNumber,
      brand: '',
      model: payload.data.model
    };

    setSelectedCustomer((prev) => {
      if (!prev) return prev;
      return { ...prev, vehicles: [vehicle, ...prev.vehicles] };
    });
    setSelectedVehicleId(vehicle.id);
    setQuickVehiclePlate('');
    setQuickVehicleModel('');
    setShowCreateVehicle(false);
  };

  const quickAddService = async (): Promise<void> => {
    const parsed = quickServiceSchema.safeParse({
      name: quickServiceName,
      price: Number(quickServicePrice)
    });

    if (!parsed.success) {
      setSubmitError(parsed.error.issues[0]?.message ?? 'Invalid service.');
      return;
    }

    const response = await fetch('/api/services', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: parsed.data.name,
        category: 'OTHER',
        price: parsed.data.price,
        estimatedTime: '60 minutes',
        status: 'ACTIVE'
      })
    });

    const payload = (await response.json()) as {
      success: boolean;
      data?: Service;
      error?: string;
    };
    if (!payload.success || !payload.data) {
      setSubmitError(payload.error ?? 'Could not add service.');
      return;
    }

    setServiceOptions((prev) => [payload.data as Service, ...prev]);
    setSelectedServices((prev) => [
      ...prev,
      {
        id: payload.data!.id,
        name: payload.data!.name,
        price: payload.data!.price
      }
    ]);
    setQuickServiceName('');
    setQuickServicePrice('');
    setShowQuickService(false);
  };

  const handleStartWork = async (): Promise<void> => {
    if (!selectedCustomer) {
      setSubmitError('Please select customer.');
      return;
    }

    if (!selectedVehicle && !quickVehiclePlate.trim()) {
      setSubmitError('Please select vehicle or add a new one.');
      return;
    }

    if (selectedServices.length === 0) {
      setSubmitError('Please add at least one service.');
      return;
    }

    setSubmitError('');
    setSubmitting(true);

    try {
      if (!selectedVehicle && quickVehiclePlate.trim()) {
        await createVehicleInline();
      }

      const vehiclePlate = selectedVehicle?.plate || quickVehiclePlate;
      const vehicleModel =
        selectedVehicle?.model || quickVehicleModel.trim() || undefined;

      const payload: CreateWorkOrderInput = {
        plateNumber: vehiclePlate,
        customerId: selectedCustomer.id,
        customerName: selectedCustomer.name,
        customerPhone: selectedCustomer.phone,
        vehicleId: selectedVehicle?.id,
        vehicleModel,
        services: selectedServices,
        parts: selectedParts,
        priority: 'NORMAL',
        notes
      };

      const created = await createWorkOrder(payload);
      await updateWorkOrderStatus(created.id, {
        status: WorkOrderStatusEnum.InProgress
      });
      toast.success('First job created successfully.');
      onClose();
      onCreated(created.id);
    } catch (error) {
      setSubmitError(
        error instanceof Error ? error.message : 'Could not create work order.'
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Drawer
      open={open}
      onClose={onClose}
      title="Create First Work Order"
      description="You can add more details later."
      width="xl"
      disableClose={isSubmitting}
      footer={
        <div className="flex items-center justify-end gap-s2">
          <Button
            type="button"
            variant="secondary"
            onClick={onClose}
            disabled={isSubmitting}
          >
            Cancel
          </Button>
          <Button
            type="button"
            onClick={() => void handleStartWork()}
            disabled={!canStartWork}
          >
            {isSubmitting ? 'Starting...' : 'Start Work'}
          </Button>
        </div>
      }
    >
      <div className="space-y-s4">
        <CustomerAutocomplete
          query={customerQuery}
          loading={loadingCustomers}
          items={customers}
          selectedCustomerId={selectedCustomer?.id}
          onQueryChange={setCustomerQuery}
          onSelect={(customer) => {
            setSelectedCustomer(customer);
            setSelectedVehicleId(customer.vehicles[0]?.id ?? '');
            setShowCreateVehicle(customer.vehicles.length === 0);
          }}
          onCreateNew={() => setShowCreateCustomer(true)}
        />

        {showCreateCustomer ? (
          <div className="grid gap-s2 rounded-md border border-border p-s3 md:grid-cols-[1fr_1fr_auto] md:items-end">
            <div className="space-y-s1">
              <label className="text-small font-medium text-text-secondary">
                Customer Name
              </label>
              <Input
                className="h-11"
                value={quickCustomerName}
                onChange={(event) => setQuickCustomerName(event.target.value)}
              />
            </div>
            <div className="space-y-s1">
              <label className="text-small font-medium text-text-secondary">
                Phone (optional)
              </label>
              <Input
                className="h-11"
                value={quickCustomerPhone}
                onChange={(event) => setQuickCustomerPhone(event.target.value)}
              />
            </div>
            <Button
              type="button"
              className="h-11"
              onClick={() => void createCustomerInline()}
            >
              Save
            </Button>
          </div>
        ) : null}

        {selectedCustomer ? (
          <div className="space-y-s2 rounded-md border border-border p-s3">
            <div className="flex items-center justify-between gap-s2">
              <label className="text-small font-medium text-text-secondary">
                Vehicle
              </label>
              <Button
                type="button"
                variant="secondary"
                size="sm"
                onClick={() => setShowCreateVehicle((prev) => !prev)}
              >
                + Add Vehicle
              </Button>
            </div>

            {selectedCustomer.vehicles.length > 0 ? (
              <select
                className="h-11 w-full rounded-md border border-input-border bg-input px-s3 text-small"
                value={selectedVehicleId}
                onChange={(event) => setSelectedVehicleId(event.target.value)}
              >
                <option value="">Select vehicle</option>
                {selectedCustomer.vehicles.map((vehicle) => (
                  <option key={vehicle.id} value={vehicle.id}>
                    {vehicle.plate} {vehicle.model ? `• ${vehicle.model}` : ''}
                  </option>
                ))}
              </select>
            ) : (
              <p className="text-small text-text-muted">
                No vehicles found for this customer.
              </p>
            )}

            {showCreateVehicle ? (
              <div className="grid gap-s2 md:grid-cols-[1fr_1fr_auto] md:items-end">
                <div className="space-y-s1">
                  <label className="text-small font-medium text-text-secondary">
                    Plate
                  </label>
                  <Input
                    className="h-11"
                    value={quickVehiclePlate}
                    onChange={(event) =>
                      setQuickVehiclePlate(event.target.value.toUpperCase())
                    }
                  />
                </div>
                <div className="space-y-s1">
                  <label className="text-small font-medium text-text-secondary">
                    Model (optional)
                  </label>
                  <Input
                    className="h-11"
                    value={quickVehicleModel}
                    onChange={(event) =>
                      setQuickVehicleModel(event.target.value)
                    }
                  />
                </div>
                <Button
                  type="button"
                  className="h-11"
                  onClick={() => void createVehicleInline()}
                >
                  Save
                </Button>
              </div>
            ) : null}
          </div>
        ) : null}

        <ServiceSelector
          query={serviceQuery}
          loading={loadingServices}
          available={serviceOptions}
          selected={selectedServices}
          onQueryChange={setServiceQuery}
          onAdd={(service) => {
            setSelectedServices((prev) => {
              if (prev.some((item) => item.id === service.id)) {
                return prev;
              }
              return [
                ...prev,
                { id: service.id, name: service.name, price: service.price }
              ];
            });
          }}
          onRemove={(serviceId) =>
            setSelectedServices((prev) =>
              prev.filter((item) => item.id !== serviceId)
            )
          }
          onUpdatePrice={(serviceId, price) => {
            setSelectedServices((prev) =>
              prev.map((item) =>
                item.id === serviceId ? { ...item, price } : item
              )
            );
          }}
          onQuickAdd={() => setShowQuickService(true)}
        />

        {showQuickService ? (
          <div className="grid gap-s2 rounded-md border border-border p-s3 md:grid-cols-[1fr_160px_auto] md:items-end">
            <div className="space-y-s1">
              <label className="text-small font-medium text-text-secondary">
                Service Name
              </label>
              <Input
                className="h-11"
                value={quickServiceName}
                onChange={(event) => setQuickServiceName(event.target.value)}
              />
            </div>
            <div className="space-y-s1">
              <label className="text-small font-medium text-text-secondary">
                Price
              </label>
              <Input
                className="h-11"
                inputMode="numeric"
                value={quickServicePrice}
                onChange={(event) => setQuickServicePrice(event.target.value)}
              />
            </div>
            <Button
              type="button"
              className="h-11"
              onClick={() => void quickAddService()}
            >
              Save
            </Button>
          </div>
        ) : null}

        <InventorySelector
          open={inventoryOpen}
          query={inventoryQuery}
          loading={loadingInventory}
          available={inventoryOptions}
          selected={selectedParts}
          onToggleOpen={() => setInventoryOpen((prev) => !prev)}
          onQueryChange={setInventoryQuery}
          onAdd={(item) => {
            setSelectedParts((prev) => {
              const existing = prev.find((part) => part.id === item.id);
              if (existing) {
                return prev.map((part) =>
                  part.id === item.id
                    ? { ...part, quantity: part.quantity + 1 }
                    : part
                );
              }

              return [
                ...prev,
                {
                  id: item.id,
                  partName: item.name,
                  quantity: 1,
                  unitPrice: item.costPrice
                }
              ];
            });
          }}
          onRemove={(partId) =>
            setSelectedParts((prev) =>
              prev.filter((part) => part.id !== partId)
            )
          }
          onChangeQuantity={(partId, quantity) => {
            setSelectedParts((prev) =>
              prev.map((part) =>
                part.id === partId
                  ? { ...part, quantity: Math.max(1, quantity) }
                  : part
              )
            );
          }}
        />

        <div className="space-y-s1">
          <label className="text-small font-medium text-text-secondary">
            Notes (optional)
          </label>
          <Textarea
            rows={3}
            value={notes}
            onChange={(event) => setNotes(event.target.value)}
          />
        </div>

        <div className="rounded-md border border-border bg-surface-default p-s3">
          <p className="text-small text-text-secondary">Total Price</p>
          <p className="mt-s1 text-h2 text-text-primary">
            {formatCurrencyVnd(totalPrice)}
          </p>
        </div>

        {submitError ? (
          <p className="text-caption text-state-error">{submitError}</p>
        ) : null}
      </div>
    </Drawer>
  );
}
