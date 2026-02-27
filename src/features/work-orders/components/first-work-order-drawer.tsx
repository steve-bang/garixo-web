'use client';

import { Check, Minus, Plus, Trash2 } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { z } from 'zod';

import { Button } from '@/components/ui/button';
import { Drawer } from '@/components/ui/drawer';
import { Input } from '@/components/ui/input';
import { Modal } from '@/components/ui/modal';
import { Textarea } from '@/components/ui/textarea';
import { CustomerAutocomplete } from '@/features/work-orders/components/customer-autocomplete';
import { createWorkOrder } from '@/features/work-orders/service';
import type { CreateWorkOrderInput } from '@/features/work-orders/schema';
import type { Customer, CustomerVehicle } from '@/features/customers/types';
import type { InventoryItem } from '@/features/inventory/types';
import type { Service } from '@/features/services/types';
import type { OrderPart, OrderService } from '@/features/work-orders/types';
import { useToast } from '@/hooks/use-toast';
import { formatCurrencyUsd } from '@/lib/utils/format';

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

function isWorkOrderUpgradeError(message: string): boolean {
  const normalized = message.toLowerCase();
  return (
    normalized.includes('work order limit') ||
    normalized.includes('does not include work order creation')
  );
}

function toEstimatedMinutes(value?: string): number | null {
  if (!value) return null;
  const lower = value.toLowerCase().trim();
  const rangeMatch = lower.match(/(\d+)\s*-\s*(\d+)\s*hour/);
  if (rangeMatch) {
    const min = Number(rangeMatch[1]);
    const max = Number(rangeMatch[2]);
    if (Number.isFinite(min) && Number.isFinite(max)) {
      return Math.round(((min + max) / 2) * 60);
    }
  }
  const hourMatch = lower.match(/(\d+)\s*hour/);
  if (hourMatch) {
    const hours = Number(hourMatch[1]);
    return Number.isFinite(hours) ? hours * 60 : null;
  }
  const minuteMatch = lower.match(/(\d+)\s*minute/);
  if (minuteMatch) {
    const minutes = Number(minuteMatch[1]);
    return Number.isFinite(minutes) ? minutes : null;
  }
  return null;
}

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
  const router = useRouter();
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
  const [customerVehicles, setCustomerVehicles] = useState<CustomerVehicle[]>(
    []
  );
  const [lockCustomerSelection, setLockCustomerSelection] = useState(false);
  const [selectedVehicleId, setSelectedVehicleId] = useState('');
  const [selectedServices, setSelectedServices] = useState<OrderService[]>([]);
  const [selectedParts, setSelectedParts] = useState<OrderPart[]>([]);
  const [notes, setNotes] = useState('');
  const [submitError, setSubmitError] = useState('');
  const [isSubmitting, setSubmitting] = useState(false);
  const [upgradeModalOpen, setUpgradeModalOpen] = useState(false);

  const [showCreateCustomer, setShowCreateCustomer] = useState(false);
  const [showCreateVehicle, setShowCreateVehicle] = useState(false);
  const [showQuickService, setShowQuickService] = useState(false);

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
    if (!open) {
      return;
    }

    setLoadingInventory(true);
    void fetchInventory(debouncedInventoryQuery)
      .then((items) => setInventoryOptions(items))
      .finally(() => setLoadingInventory(false));
  }, [debouncedInventoryQuery, open]);

  useEffect(() => {
    if (!open) {
      return;
    }

    setSelectedCustomer(null);
    setLockCustomerSelection(false);
    setSelectedVehicleId('');
    setCustomerVehicles([]);
    setSelectedServices([]);
    setSelectedParts([]);
    setNotes('');
    setSubmitError('');
    setShowCreateCustomer(false);
    setShowCreateVehicle(false);
    setShowQuickService(false);
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
      customerVehicles.find((vehicle) => vehicle.id === selectedVehicleId) ??
      null
    );
  }, [customerVehicles, selectedCustomer, selectedVehicleId]);

  useEffect(() => {
    if (!selectedCustomer) {
      setCustomerVehicles([]);
      return;
    }

    void fetch(`/api/customers/${selectedCustomer.id}/vehicles`)
      .then(async (response) => {
        const payload = (await response.json()) as {
          success: boolean;
          data?: CustomerVehicle[];
        };
        if (!payload.success || !payload.data) {
          setCustomerVehicles([]);
          return;
        }
        setCustomerVehicles(payload.data);
      })
      .catch(() => setCustomerVehicles([]));
  }, [selectedCustomer]);

  useEffect(() => {
    if (selectedVehicleId || customerVehicles.length === 0) {
      return;
    }

    setSelectedVehicleId(customerVehicles[0]?.id ?? '');
    setShowCreateVehicle(false);
  }, [customerVehicles, selectedVehicleId]);

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

  const selectedServiceIds = useMemo(
    () => new Set(selectedServices.map((service) => service.id)),
    [selectedServices]
  );
  const estimatedMinutesByServiceId = useMemo(() => {
    const map = new Map<string, number | null>();
    serviceOptions.forEach((service) => {
      map.set(service.id, toEstimatedMinutes(service.estimatedTime));
    });
    return map;
  }, [serviceOptions]);
  const selectedPartIds = useMemo(
    () => new Set(selectedParts.map((part) => part.id)),
    [selectedParts]
  );

  const canStartWork = Boolean(
    selectedCustomer &&
    (selectedVehicle || quickVehiclePlate.trim()) &&
    selectedServices.length > 0 &&
    !isSubmitting
  );
  const hasVehicle = Boolean(selectedVehicle || quickVehiclePlate.trim());

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
    setLockCustomerSelection(true);
    setSubmitError('');
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

    setCustomerVehicles((prev) => [vehicle, ...prev]);
    setSelectedCustomer((prev) =>
      prev ? { ...prev, totalVehicles: prev.totalVehicles + 1 } : prev
    );
    setSelectedVehicleId(vehicle.id);
    setSubmitError('');
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

      toast.success('First job created successfully.');
      onClose();
      onCreated(created.id);
    } catch (error) {
      const message =
        error instanceof Error ? error.message : 'Could not create work order.';
      if (isWorkOrderUpgradeError(message)) {
        setSubmitError('');
        setUpgradeModalOpen(true);
      } else {
        setSubmitError(message);
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <>
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
          <div className="space-y-s2">
            <div>
              <h3 className="text-small font-semibold text-text-primary">
                1. Customer
              </h3>
              <p className="text-caption text-text-muted">
                Search customer or create a new one.
              </p>
            </div>

            {selectedCustomer && lockCustomerSelection ? (
              <div className="rounded-md border border-border bg-surface-default p-s3">
                <div className="flex items-start justify-between gap-s2">
                  <div className="space-y-0.5">
                    <p className="text-small font-semibold text-text-primary">
                      {selectedCustomer.name}
                    </p>
                    <p className="text-caption text-text-muted">
                      {selectedCustomer.phone || 'No phone number'}
                    </p>
                    <p className="text-caption text-text-muted">
                      {selectedCustomer.totalVehicles > 0
                        ? `${selectedCustomer.totalVehicles} vehicle(s)`
                        : 'No vehicles yet'}
                    </p>
                  </div>
                  <Button
                    type="button"
                    variant="secondary"
                    size="sm"
                    onClick={() => setLockCustomerSelection(false)}
                  >
                    Change
                  </Button>
                </div>
              </div>
            ) : (
              <CustomerAutocomplete
                query={customerQuery}
                loading={loadingCustomers}
                items={customers}
                selectedCustomerId={selectedCustomer?.id}
                onQueryChange={setCustomerQuery}
                onSelect={(customer) => {
                  setSelectedCustomer(customer);
                  setSelectedVehicleId('');
                  setShowCreateVehicle(customer.totalVehicles === 0);
                  setLockCustomerSelection(true);
                  setSubmitError('');
                }}
                onCreateNew={() => setShowCreateCustomer(true)}
              />
            )}
          </div>

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
                  onChange={(event) =>
                    setQuickCustomerPhone(event.target.value)
                  }
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
                <div>
                  <label className="text-small font-semibold text-text-primary">
                    2. Vehicle
                  </label>
                  <p className="text-caption text-text-muted">
                    Select vehicle or add a new one.
                  </p>
                </div>
                <Button
                  type="button"
                  variant="secondary"
                  size="sm"
                  onClick={() => setShowCreateVehicle((prev) => !prev)}
                >
                  + Add Vehicle
                </Button>
              </div>

              {customerVehicles.length > 0 ? (
                <select
                  className="h-11 w-full rounded-md border border-input-border bg-input px-s3 text-small"
                  value={selectedVehicleId}
                  onChange={(event) => setSelectedVehicleId(event.target.value)}
                >
                  <option value="">Select vehicle</option>
                  {customerVehicles.map((vehicle) => (
                    <option key={vehicle.id} value={vehicle.id}>
                      {vehicle.plate}{' '}
                      {vehicle.model ? `• ${vehicle.model}` : ''}
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

          <div className="space-y-s2">
            <div>
              <h3 className="text-small font-semibold text-text-primary">
                3. Services
              </h3>
              <p className="text-caption text-text-muted">
                Step 1: tap + to add service. Step 2: review selected list
                below.
              </p>
            </div>
            <div className="rounded-md border border-border bg-surface-default p-s3">
              <div className="space-y-s2">
                <label className="text-small font-medium text-text-secondary">
                  Search Service
                </label>
                <Input
                  className="h-11"
                  placeholder="Type service name"
                  value={serviceQuery}
                  onChange={(event) => setServiceQuery(event.target.value)}
                />
              </div>

              <div className="mt-s3 rounded-md border border-border">
                <div className="border-b border-border bg-background-secondary px-s3 py-s2">
                  <p className="text-caption font-medium text-text-secondary">
                    Available Services
                  </p>
                </div>
                <div className="max-h-[220px] overflow-y-auto">
                  {loadingServices ? (
                    <p className="px-s3 py-s3 text-small text-text-muted">
                      Loading services...
                    </p>
                  ) : null}

                  {!loadingServices && serviceOptions.length === 0 ? (
                    <div className="space-y-s2 px-s3 py-s3">
                      <p className="text-small text-text-muted">
                        No services found.
                      </p>
                      <Button
                        type="button"
                        variant="secondary"
                        size="sm"
                        onClick={() => setShowQuickService(true)}
                      >
                        + Quick Add Service
                      </Button>
                    </div>
                  ) : null}

                  {!loadingServices
                    ? serviceOptions.map((service) => {
                        const isSelected = selectedServiceIds.has(service.id);

                        return (
                          <div
                            key={service.id}
                            className="flex items-center justify-between gap-s3 border-t border-border px-s3 py-s2 first:border-t-0"
                          >
                            <div className="min-w-0">
                              <p className="truncate text-small font-medium text-text-primary">
                                {service.name}
                              </p>
                              <p className="text-caption text-text-muted">
                                {service.estimatedTime}
                              </p>
                            </div>
                            <div className="flex items-center gap-s2">
                              <p className="text-small text-text-secondary">
                                {formatCurrencyUsd(service.price)}
                              </p>
                              <Button
                                type="button"
                                size="sm"
                                className="h-9 w-9 px-0"
                                variant={isSelected ? 'secondary' : 'default'}
                                aria-label={
                                  isSelected
                                    ? `Service ${service.name} already added`
                                    : `Add service ${service.name}`
                                }
                                disabled={isSelected}
                                onClick={() => {
                                  setSelectedServices((prev) => [
                                    ...prev,
                                    {
                                      id: service.id,
                                      name: service.name,
                                      price: service.price
                                    }
                                  ]);
                                  setSubmitError('');
                                }}
                              >
                                {isSelected ? (
                                  <Check className="size-4" />
                                ) : (
                                  <Plus className="size-4" />
                                )}
                              </Button>
                            </div>
                          </div>
                        );
                      })
                    : null}
                </div>
              </div>

              <div className="mt-s3 rounded-md border border-border">
                <div className="border-b border-border bg-background-secondary px-s3 py-s2">
                  <p className="text-caption font-medium text-text-secondary">
                    Selected Services for This Job ({selectedServices.length})
                  </p>
                </div>
                <div className="space-y-s2 p-s3">
                  {selectedServices.length === 0 ? (
                    <p className="text-small text-text-muted">
                      No services selected yet.
                    </p>
                  ) : (
                    selectedServices.map((service) => (
                      <div
                        key={service.id}
                        className="grid gap-s3 rounded-md border border-border bg-background-primary p-s3 md:grid-cols-[1fr_220px_auto] md:items-start"
                      >
                        <div>
                          <p className="text-small font-medium text-text-primary">
                            {service.name}
                          </p>
                          <div className="mt-1 flex flex-wrap items-center gap-s2">
                            <span className="rounded-full bg-surface-hover px-2 py-0.5 text-caption text-text-muted">
                              {estimatedMinutesByServiceId.get(service.id)
                                ? `${estimatedMinutesByServiceId.get(service.id)} mins`
                                : 'Time not set'}
                            </span>
                            <span className="rounded-full bg-surface-hover px-2 py-0.5 text-caption text-text-muted">
                              {formatCurrencyUsd(service.price)}
                            </span>
                          </div>
                        </div>
                        <div className="space-y-1">
                          <label className="text-caption font-medium text-text-secondary">
                            Price (USD)
                          </label>
                          <Input
                            className="h-10"
                            inputMode="numeric"
                            value={String(service.price)}
                            onChange={(event) =>
                              setSelectedServices((prev) =>
                                prev.map((item) =>
                                  item.id === service.id
                                    ? {
                                        ...item,
                                        price: Number(event.target.value) || 0
                                      }
                                    : item
                                )
                              )
                            }
                          />
                        </div>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          className="h-9 w-9 px-0 text-state-error hover:bg-error-50 hover:text-error-700"
                          aria-label={`Remove service ${service.name}`}
                          onClick={() =>
                            setSelectedServices((prev) =>
                              prev.filter((item) => item.id !== service.id)
                            )
                          }
                        >
                          <Trash2 className="size-4" />
                        </Button>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          </div>

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

          <div className="space-y-s2">
            <div>
              <h3 className="text-small font-semibold text-text-primary">
                4. Parts (optional)
              </h3>
              <p className="text-caption text-text-muted">
                Add parts only if needed for this job.
              </p>
            </div>

            <div className="rounded-md border border-border bg-surface-default p-s3">
              <div className="space-y-s2">
                <label className="text-small font-medium text-text-secondary">
                  Search Part
                </label>
                <Input
                  className="h-11"
                  placeholder="Type part name"
                  value={inventoryQuery}
                  onChange={(event) => setInventoryQuery(event.target.value)}
                />
              </div>

              <div className="mt-s3 rounded-md border border-border">
                <div className="border-b border-border bg-background-secondary px-s3 py-s2">
                  <p className="text-caption font-medium text-text-secondary">
                    Available Parts
                  </p>
                </div>
                <div className="max-h-[220px] overflow-y-auto">
                  {loadingInventory ? (
                    <p className="px-s3 py-s3 text-small text-text-muted">
                      Loading parts...
                    </p>
                  ) : null}

                  {!loadingInventory && inventoryOptions.length === 0 ? (
                    <p className="px-s3 py-s3 text-small text-text-muted">
                      No parts found.
                    </p>
                  ) : null}

                  {!loadingInventory
                    ? inventoryOptions.map((item) => {
                        const isSelected = selectedPartIds.has(item.id);
                        return (
                          <div
                            key={item.id}
                            className="flex items-center justify-between gap-s3 border-t border-border px-s3 py-s2 first:border-t-0"
                          >
                            <div className="min-w-0">
                              <p className="truncate text-small font-medium text-text-primary">
                                {item.name}
                              </p>
                              <p className="text-caption text-text-muted">
                                Stock: {item.quantity} •{' '}
                                {formatCurrencyUsd(item.costPrice)}
                              </p>
                            </div>
                            <Button
                              type="button"
                              size="sm"
                              className="h-9 w-9 px-0"
                              variant={isSelected ? 'secondary' : 'default'}
                              aria-label={
                                isSelected
                                  ? `Part ${item.name} already added`
                                  : `Add part ${item.name}`
                              }
                              disabled={isSelected}
                              onClick={() =>
                                setSelectedParts((prev) => [
                                  ...prev,
                                  {
                                    id: item.id,
                                    partName: item.name,
                                    quantity: 1,
                                    unitPrice: item.costPrice
                                  }
                                ])
                              }
                            >
                              <Plus className="size-4" />
                            </Button>
                          </div>
                        );
                      })
                    : null}
                </div>
              </div>

              <div className="mt-s3 rounded-md border border-border">
                <div className="border-b border-border bg-background-secondary px-s3 py-s2">
                  <p className="text-caption font-medium text-text-secondary">
                    Selected Parts for This Job ({selectedParts.length})
                  </p>
                </div>
                <div className="space-y-s2 p-s3">
                  {selectedParts.length === 0 ? (
                    <p className="text-small text-text-muted">
                      No parts selected.
                    </p>
                  ) : (
                    selectedParts.map((part) => (
                      <div
                        key={part.id}
                        className="grid gap-s2 rounded-md border border-border p-s2 md:grid-cols-[1fr_auto_auto_auto_auto] md:items-center"
                      >
                        <div>
                          <p className="text-small font-medium text-text-primary">
                            {part.partName}
                          </p>
                          <p className="text-caption text-text-muted">
                            {formatCurrencyUsd(part.unitPrice)} each
                          </p>
                        </div>

                        <Button
                          type="button"
                          variant="secondary"
                          size="sm"
                          className="h-9 w-9 px-0"
                          aria-label={`Decrease quantity of ${part.partName}`}
                          onClick={() =>
                            setSelectedParts((prev) =>
                              prev.map((item) =>
                                item.id === part.id
                                  ? {
                                      ...item,
                                      quantity: Math.max(1, item.quantity - 1)
                                    }
                                  : item
                              )
                            )
                          }
                        >
                          <Minus className="size-4" />
                        </Button>

                        <p className="w-10 text-center text-small font-medium text-text-primary">
                          {part.quantity}
                        </p>

                        <Button
                          type="button"
                          variant="secondary"
                          size="sm"
                          className="h-9 w-9 px-0"
                          aria-label={`Increase quantity of ${part.partName}`}
                          onClick={() =>
                            setSelectedParts((prev) =>
                              prev.map((item) =>
                                item.id === part.id
                                  ? { ...item, quantity: item.quantity + 1 }
                                  : item
                              )
                            )
                          }
                        >
                          <Plus className="size-4" />
                        </Button>

                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          className="h-9 w-9 px-0"
                          aria-label={`Remove ${part.partName}`}
                          onClick={() =>
                            setSelectedParts((prev) =>
                              prev.filter((item) => item.id !== part.id)
                            )
                          }
                        >
                          <Trash2 className="size-4" />
                        </Button>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          </div>

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
              {formatCurrencyUsd(totalPrice)}
            </p>
          </div>

          <div className="rounded-md border border-border bg-surface-default p-s3">
            <p className="text-caption font-medium text-text-secondary">
              Before you start
            </p>
            <ul className="mt-s2 space-y-1 text-small text-text-primary">
              <li>{selectedCustomer ? '✓' : '•'} Customer selected</li>
              <li>{hasVehicle ? '✓' : '•'} Vehicle selected</li>
              <li>
                {selectedServices.length > 0 ? '✓' : '•'} At least one service
                added
              </li>
            </ul>
            {!canStartWork ? (
              <p className="mt-s2 text-caption text-text-muted">
                Complete the 3 items above to enable Start Work.
              </p>
            ) : null}
          </div>

          {submitError ? (
            <p className="text-caption text-state-error">{submitError}</p>
          ) : null}
        </div>
      </Drawer>
      <Modal
        open={upgradeModalOpen}
        onClose={() => setUpgradeModalOpen(false)}
        title="You're growing fast"
        width="sm"
        footer={
          <>
            <Button
              type="button"
              variant="secondary"
              onClick={() => setUpgradeModalOpen(false)}
            >
              Not now
            </Button>
            <Button
              type="button"
              onClick={() => {
                setUpgradeModalOpen(false);
                router.push('/dashboard/settings/subscription');
              }}
            >
              Upgrade Plan
            </Button>
          </>
        }
      >
        <p className="text-small text-text-secondary">
          You have reached your current work order capacity. Upgrade your plan
          to create more jobs and keep serving customers without delays.
        </p>
      </Modal>
    </>
  );
}
