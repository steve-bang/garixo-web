'use client';

import { useEffect, useMemo, useState } from 'react';
import { Check, PlusCircle, X } from 'lucide-react';
import { useRouter } from 'next/navigation';

import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Modal } from '@/components/ui/modal';
import type { CreateWorkOrderInput } from '@/features/work-orders/schema';
import type { Customer, CustomerVehicle } from '@/features/customers/types';
import type {
  OrderService,
  PriorityLevel,
  Worker
} from '@/features/work-orders/types';
import { formatCurrencyUsd } from '@/lib/utils/format';

type AvailableService = OrderService & {
  estimatedTime?: string;
};

type SelectedService = OrderService & {
  estimatedTime?: string;
};

type CreateOrderFormProps = {
  workers: Worker[];
  availableServices: AvailableService[];
  onSubmit: (payload: CreateWorkOrderInput) => Promise<void>;
  onCancel: () => void;
  upgradePath?: string;
};

function isWorkOrderUpgradeError(message: string): boolean {
  const normalized = message.toLowerCase();
  return (
    normalized.includes('work order limit') ||
    normalized.includes('does not include work order creation')
  );
}

export function CreateOrderForm({
  workers,
  availableServices,
  onSubmit,
  onCancel,
  upgradePath = '/dashboard/settings/subscription'
}: CreateOrderFormProps): JSX.Element {
  const router = useRouter();
  const [customerSearch, setCustomerSearch] = useState('');
  const [debouncedCustomerSearch, setDebouncedCustomerSearch] = useState('');
  const [customerResults, setCustomerResults] = useState<Customer[]>([]);
  const [loadingCustomers, setLoadingCustomers] = useState(false);
  const [showCustomerResults, setShowCustomerResults] = useState(true);
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(
    null
  );
  const [customerVehicles, setCustomerVehicles] = useState<CustomerVehicle[]>(
    []
  );
  const [selectedVehicleId, setSelectedVehicleId] = useState('');
  const [showCreateCustomer, setShowCreateCustomer] = useState(false);
  const [quickCustomerName, setQuickCustomerName] = useState('');
  const [quickCustomerPhone, setQuickCustomerPhone] = useState('');
  const [showCreateVehicle, setShowCreateVehicle] = useState(false);
  const [quickVehiclePlate, setQuickVehiclePlate] = useState('');
  const [quickVehicleModel, setQuickVehicleModel] = useState('');

  const [step, setStep] = useState(1);
  const [plateNumber, setPlateNumber] = useState('');
  const [services, setServices] = useState<SelectedService[]>([]);
  const [serviceSearch, setServiceSearch] = useState('');
  const [serviceFilter, setServiceFilter] = useState<
    'all' | 'selected' | 'not_selected'
  >('all');
  const [visibleServiceCount, setVisibleServiceCount] = useState(20);
  const [showQuickAddService, setShowQuickAddService] = useState(false);
  const [quickServiceName, setQuickServiceName] = useState('');
  const [quickServicePrice, setQuickServicePrice] = useState('');
  const [isSavingQuickService, setIsSavingQuickService] = useState(false);
  const [localAddedServices, setLocalAddedServices] = useState<
    AvailableService[]
  >([]);
  const [workerId, setWorkerId] = useState('');
  const [priority, setPriority] = useState<PriorityLevel>('NORMAL');
  const [estimatedTimeMinutes, setEstimatedTimeMinutes] = useState('120');
  const [notes, setNotes] = useState('');
  const [submitError, setSubmitError] = useState('');
  const [isSubmitting, setSubmitting] = useState(false);
  const [upgradeModalOpen, setUpgradeModalOpen] = useState(false);

  const total = useMemo(
    () => services.reduce((sum, item) => sum + item.price, 0),
    [services]
  );
  const canStep1 = Boolean(selectedCustomer && plateNumber.trim());
  const canStep2 = services.length > 0;
  const serviceCatalog = useMemo(
    () => [...availableServices, ...localAddedServices],
    [availableServices, localAddedServices]
  );
  const selectedServiceIds = useMemo(
    () => new Set(services.map((service) => service.id)),
    [services]
  );
  const filteredServiceCatalog = useMemo(() => {
    const normalizedSearch = serviceSearch.trim().toLowerCase();

    const filtered = serviceCatalog.filter((service) => {
      const isSelected = selectedServiceIds.has(service.id);
      if (serviceFilter === 'selected' && !isSelected) {
        return false;
      }
      if (serviceFilter === 'not_selected' && isSelected) {
        return false;
      }
      if (!normalizedSearch) {
        return true;
      }
      return service.name.toLowerCase().includes(normalizedSearch);
    });

    return [...filtered].sort((a, b) => {
      const aSelected = selectedServiceIds.has(a.id);
      const bSelected = selectedServiceIds.has(b.id);
      if (aSelected === bSelected) {
        return a.name.localeCompare(b.name);
      }
      return aSelected ? -1 : 1;
    });
  }, [serviceCatalog, serviceFilter, serviceSearch, selectedServiceIds]);
  const visibleServiceCatalog = useMemo(
    () => filteredServiceCatalog.slice(0, visibleServiceCount),
    [filteredServiceCatalog, visibleServiceCount]
  );
  const hasMoreServices =
    filteredServiceCatalog.length > visibleServiceCatalog.length;

  useEffect(() => {
    const timer = window.setTimeout(() => {
      setDebouncedCustomerSearch(customerSearch.trim());
    }, 300);
    return () => window.clearTimeout(timer);
  }, [customerSearch]);

  useEffect(() => {
    if (step !== 1) {
      return;
    }

    setLoadingCustomers(true);

    void fetch(
      `/api/customers?search=${encodeURIComponent(
        debouncedCustomerSearch
      )}&page=1&pageSize=8`
    )
      .then(async (response) => {
        const payload = (await response.json()) as {
          success: boolean;
          data?: { items: Customer[] };
        };
        if (!payload.success || !payload.data) {
          setCustomerResults([]);
          return;
        }
        setCustomerResults(payload.data.items);
      })
      .catch(() => {
        setCustomerResults([]);
      })
      .finally(() => {
        setLoadingCustomers(false);
      });
  }, [debouncedCustomerSearch, step]);

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
    setPlateNumber(customerVehicles[0]?.plate ?? '');
    setShowCreateVehicle(false);
  }, [customerVehicles, selectedVehicleId]);

  useEffect(() => {
    if (step !== 2) {
      return;
    }
    setVisibleServiceCount(20);
  }, [serviceSearch, serviceFilter, step]);

  const reset = () => {
    setStep(1);
    setCustomerSearch('');
    setDebouncedCustomerSearch('');
    setCustomerResults([]);
    setLoadingCustomers(false);
    setShowCustomerResults(true);
    setSelectedCustomer(null);
    setCustomerVehicles([]);
    setSelectedVehicleId('');
    setShowCreateCustomer(false);
    setQuickCustomerName('');
    setQuickCustomerPhone('');
    setShowCreateVehicle(false);
    setQuickVehiclePlate('');
    setQuickVehicleModel('');
    setPlateNumber('');
    setServices([]);
    setServiceSearch('');
    setServiceFilter('all');
    setVisibleServiceCount(20);
    setWorkerId('');
    setPriority('NORMAL');
    setEstimatedTimeMinutes('120');
    setNotes('');
    setShowQuickAddService(false);
    setQuickServiceName('');
    setQuickServicePrice('');
    setLocalAddedServices([]);
    setSubmitError('');
  };

  const handleCreate = async () => {
    setSubmitError('');
    setSubmitting(true);

    try {
      const worker = workers.find((item) => item.id === workerId);

      if (!selectedCustomer) {
        throw new Error('Please select customer.');
      }

      const selectedVehicle =
        customerVehicles.find((item) => item.id === selectedVehicleId) ??
        undefined;
      const vehicleModel =
        selectedVehicle?.model || quickVehicleModel.trim() || undefined;

      await onSubmit({
        plateNumber,
        customerId: selectedCustomer.id,
        customerName: selectedCustomer.name,
        customerPhone: selectedCustomer.phone,
        vehicleId: selectedVehicle?.id,
        vehicleModel,
        services: services.map((service) => ({
          id: service.id,
          name: service.name,
          price: service.price
        })),
        parts: [],
        workerId: worker?.id,
        workerName: worker?.name,
        priority,
        estimatedTimeMinutes: Number(estimatedTimeMinutes) || undefined,
        notes
      });

      reset();
    } catch (error) {
      const message =
        error instanceof Error ? error.message : 'Could not create order.';
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

  const addServiceToOrder = (service: AvailableService) => {
    setServices((prev) => {
      if (prev.some((item) => item.id === service.id)) {
        return prev;
      }
      return [...prev, service];
    });
    setShowQuickAddService(false);
  };

  const quickAddService = async () => {
    if (!quickServiceName.trim()) {
      setSubmitError('Service name is required.');
      return;
    }

    const parsedPrice = Number(quickServicePrice);
    if (!Number.isFinite(parsedPrice) || parsedPrice <= 0) {
      setSubmitError('Price must be greater than 0.');
      return;
    }

    setSubmitError('');
    setIsSavingQuickService(true);

    try {
      const response = await fetch('/api/services', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: quickServiceName.trim(),
          category: 'OTHER',
          price: parsedPrice,
          estimatedTime: '60 minutes',
          status: 'ACTIVE'
        })
      });
      const payload = (await response.json()) as {
        success: boolean;
        data?: {
          id: string;
          name: string;
          price: number;
          estimatedTime?: string;
        };
        error?: string;
      };

      if (!payload.success || !payload.data) {
        setSubmitError(payload.error ?? 'Could not add service.');
        return;
      }

      const created: AvailableService = {
        id: payload.data.id,
        name: payload.data.name,
        price: payload.data.price,
        estimatedTime: payload.data.estimatedTime
      };

      setLocalAddedServices((prev) => [created, ...prev]);
      addServiceToOrder(created);
      setQuickServiceName('');
      setQuickServicePrice('');
      setShowQuickAddService(false);
    } finally {
      setIsSavingQuickService(false);
    }
  };

  const createCustomerInline = async () => {
    if (!quickCustomerName.trim()) {
      setSubmitError('Customer name is required.');
      return;
    }

    if (!quickCustomerPhone.trim()) {
      setSubmitError('Phone is required.');
      return;
    }

    setSubmitError('');
    setLoadingCustomers(true);

    try {
      const response = await fetch('/api/customers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: quickCustomerName.trim(),
          phone: quickCustomerPhone.trim(),
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
      setShowCustomerResults(false);
      setShowCreateCustomer(false);
      setQuickCustomerName('');
      setQuickCustomerPhone('');
      setCustomerSearch(payload.data.name);
      setCustomerResults((prev) => [payload.data as Customer, ...prev]);
      if (payload.data.totalVehicles === 0) {
        setShowCreateVehicle(true);
      }
    } finally {
      setLoadingCustomers(false);
    }
  };

  const createVehicleInline = async () => {
    if (!selectedCustomer) {
      setSubmitError('Please select customer first.');
      return;
    }

    if (!quickVehiclePlate.trim()) {
      setSubmitError('Plate number is required.');
      return;
    }

    setSubmitError('');

    const response = await fetch(
      `/api/customers/${selectedCustomer.id}/vehicles`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          plate: quickVehiclePlate.trim().toUpperCase(),
          brand: 'Other',
          model: quickVehicleModel.trim() || undefined
        })
      }
    );

    const payload = (await response.json()) as {
      success: boolean;
      data?: CustomerVehicle;
      error?: string;
    };

    if (!payload.success || !payload.data) {
      setSubmitError(payload.error ?? 'Could not add vehicle.');
      return;
    }

    setCustomerVehicles((prev) => [payload.data as CustomerVehicle, ...prev]);
    setSelectedCustomer((prev) =>
      prev ? { ...prev, totalVehicles: prev.totalVehicles + 1 } : prev
    );
    setSelectedVehicleId(payload.data.id);
    setPlateNumber(payload.data.plate);
    setShowCreateVehicle(false);
    setQuickVehiclePlate('');
    setQuickVehicleModel('');
  };

  return (
    <>
      <div className="space-y-s4">
        <p className="text-small text-text-muted">Step {step} of 3</p>

        {step === 1 ? (
          <Card className="space-y-s3 p-s4">
            <h4 className="text-small font-semibold">Customer & Vehicle</h4>

            <div className="space-y-s2">
              <label className="text-small font-medium text-text-secondary">
                Customer
              </label>
              <Input
                className="h-11"
                placeholder="Search or create new customer"
                autoFocus
                value={customerSearch}
                onFocus={() => setShowCustomerResults(true)}
                onChange={(event) => {
                  setCustomerSearch(event.target.value);
                  setShowCustomerResults(true);
                }}
              />

              {selectedCustomer && !showCustomerResults ? (
                <div className="rounded-md border border-border bg-surface-default p-s3">
                  <div className="flex items-start justify-between gap-s2">
                    <div>
                      <p className="text-small font-semibold text-text-primary">
                        {selectedCustomer.name}
                      </p>
                      <p className="text-caption text-text-muted">
                        {selectedCustomer.phone}
                      </p>
                      <p className="text-caption text-text-muted">
                        {selectedCustomer.totalVehicles} vehicle
                        {selectedCustomer.totalVehicles === 1 ? '' : 's'}
                      </p>
                    </div>
                    <Button
                      type="button"
                      variant="secondary"
                      size="sm"
                      onClick={() => setShowCustomerResults(true)}
                    >
                      Change
                    </Button>
                  </div>
                </div>
              ) : null}

              {showCustomerResults ? (
                <div className="max-h-[220px] overflow-y-auto rounded-md border border-border bg-surface-default">
                  {loadingCustomers ? (
                    <p className="px-s3 py-s2 text-small text-text-muted">
                      Searching customers...
                    </p>
                  ) : null}

                  {!loadingCustomers
                    ? customerResults.map((customer) => (
                        <button
                          key={customer.id}
                          type="button"
                          className="flex w-full items-center justify-between gap-s2 border-t border-border px-s3 py-s2 text-left first:border-t-0 hover:bg-surface-hover"
                          onClick={() => {
                            setSelectedCustomer(customer);
                            setShowCustomerResults(false);
                            setSelectedVehicleId('');
                            setPlateNumber('');
                            setShowCreateVehicle(customer.totalVehicles === 0);
                            setShowCreateCustomer(false);
                          }}
                        >
                          <div>
                            <p className="text-small font-medium text-text-primary">
                              {customer.name}
                            </p>
                            <p className="text-caption text-text-muted">
                              {customer.phone}
                            </p>
                          </div>
                          <p className="text-caption text-text-muted">
                            {customer.totalVehicles} vehicle
                            {customer.totalVehicles === 1 ? '' : 's'}
                          </p>
                        </button>
                      ))
                    : null}

                  <button
                    type="button"
                    className="w-full border-t border-border px-s3 py-s2 text-left text-small font-medium text-primary-700 hover:bg-surface-hover"
                    onClick={() => setShowCreateCustomer(true)}
                  >
                    + Create new customer
                  </button>
                </div>
              ) : null}

              {showCreateCustomer ? (
                <div className="grid gap-s2 rounded-md border border-border p-s3 md:grid-cols-[1fr_1fr_auto] md:items-end">
                  <div className="space-y-s1">
                    <label className="text-small font-medium text-text-secondary">
                      Name
                    </label>
                    <Input
                      className="h-11"
                      value={quickCustomerName}
                      onChange={(event) =>
                        setQuickCustomerName(event.target.value)
                      }
                    />
                  </div>
                  <div className="space-y-s1">
                    <label className="text-small font-medium text-text-secondary">
                      Phone
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
            </div>

            {selectedCustomer ? (
              <div className="space-y-s2 rounded-md border border-border p-s3">
                <div className="flex items-center justify-between gap-s2">
                  <label className="text-small font-medium text-text-secondary">
                    Vehicles
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

                {customerVehicles.length > 0 ? (
                  <select
                    className="h-11 w-full rounded-md border border-input-border bg-input px-s3 text-small"
                    value={selectedVehicleId}
                    onChange={(event) => {
                      const id = event.target.value;
                      setSelectedVehicleId(id);
                      const vehicle = customerVehicles.find(
                        (item) => item.id === id
                      );
                      setPlateNumber(vehicle?.plate ?? '');
                    }}
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

            <div className="space-y-s1">
              <label className="text-small font-medium text-text-secondary">
                Plate Number
              </label>
              <Input
                className="h-11"
                value={plateNumber}
                onChange={(e) => setPlateNumber(e.target.value.toUpperCase())}
              />
            </div>
          </Card>
        ) : null}

        {step === 2 ? (
          <Card className="space-y-s4 p-s4">
            <div className="space-y-s1">
              <h4 className="text-small font-semibold">Services (optional)</h4>
              <p className="text-caption text-text-muted">
                Add the work needed for this job. You can update it later.
              </p>
            </div>

            <div className="space-y-s2">
              <div className="flex items-center justify-between gap-s2">
                <p className="text-small font-semibold text-text-primary">
                  Choose services
                </p>
                <p className="text-caption text-text-muted">
                  {services.length} selected
                </p>
              </div>

              <div className="grid gap-s2 md:grid-cols-[1fr_auto]">
                <Input
                  className="h-10"
                  placeholder="Search service name"
                  value={serviceSearch}
                  onChange={(event) => setServiceSearch(event.target.value)}
                />
                <div className="grid grid-cols-3 gap-s1">
                  <Button
                    type="button"
                    size="sm"
                    variant={serviceFilter === 'all' ? 'secondary' : 'ghost'}
                    className="h-10 px-s2"
                    onClick={() => setServiceFilter('all')}
                  >
                    All
                  </Button>
                  <Button
                    type="button"
                    size="sm"
                    variant={
                      serviceFilter === 'selected' ? 'secondary' : 'ghost'
                    }
                    className="h-10 px-s2"
                    onClick={() => setServiceFilter('selected')}
                  >
                    Added
                  </Button>
                  <Button
                    type="button"
                    size="sm"
                    variant={
                      serviceFilter === 'not_selected' ? 'secondary' : 'ghost'
                    }
                    className="h-10 px-s2"
                    onClick={() => setServiceFilter('not_selected')}
                  >
                    New
                  </Button>
                </div>
              </div>

              <div className="max-h-[220px] overflow-y-auto rounded-md border border-border bg-surface-default">
                {serviceCatalog.length === 0 ? (
                  <div className="space-y-s2 px-s3 py-s3">
                    <p className="text-small text-text-muted">
                      No service found.
                    </p>
                    <Button
                      type="button"
                      variant="secondary"
                      size="sm"
                      onClick={() => setShowQuickAddService(true)}
                    >
                      Quick Add Service
                    </Button>
                  </div>
                ) : filteredServiceCatalog.length === 0 ? (
                  <div className="space-y-s2 px-s3 py-s3">
                    <p className="text-small text-text-muted">
                      No matching service. Try another name or add quickly.
                    </p>
                    <div className="flex items-center gap-s2">
                      <Button
                        type="button"
                        variant="secondary"
                        size="sm"
                        onClick={() => setShowQuickAddService(true)}
                      >
                        Quick Add Service
                      </Button>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          setServiceSearch('');
                          setServiceFilter('all');
                        }}
                      >
                        Clear filter
                      </Button>
                    </div>
                  </div>
                ) : (
                  visibleServiceCatalog.map((service) => {
                    const isSelected = services.some(
                      (item) => item.id === service.id
                    );

                    return (
                      <div
                        key={service.id}
                        className="flex items-center justify-between gap-s2 border-t border-border px-s3 py-s2 first:border-t-0"
                      >
                        <div className="min-w-0">
                          <p className="truncate text-small font-semibold text-text-primary">
                            {service.name}
                          </p>
                          <p className="text-caption text-text-muted">
                            {formatCurrencyUsd(service.price)} •{' '}
                            {service.estimatedTime || '60 minutes'}
                          </p>
                        </div>
                        <Button
                          type="button"
                          size="sm"
                          variant={isSelected ? 'secondary' : 'ghost'}
                          className="h-8 px-s2"
                          disabled={isSelected}
                          onClick={() => addServiceToOrder(service)}
                        >
                          {isSelected ? (
                            <Check className="size-4" />
                          ) : (
                            <PlusCircle className="size-4" />
                          )}
                          <span className="sr-only">
                            {isSelected
                              ? `Added ${service.name}`
                              : `Add ${service.name}`}
                          </span>
                        </Button>
                      </div>
                    );
                  })
                )}
              </div>
              {hasMoreServices ? (
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="h-10 w-full"
                  onClick={() => setVisibleServiceCount((prev) => prev + 20)}
                >
                  Load more services
                </Button>
              ) : null}

              {serviceCatalog.length > 0 && !showQuickAddService ? (
                <div className="flex items-center justify-between rounded-md border border-border px-s3 py-s2">
                  <p className="text-caption text-text-muted">
                    Can’t find the service?
                  </p>
                  <Button
                    type="button"
                    variant="secondary"
                    size="sm"
                    onClick={() => setShowQuickAddService(true)}
                  >
                    Quick Add Service
                  </Button>
                </div>
              ) : null}
            </div>

            {showQuickAddService ? (
              <div className="grid gap-s2 rounded-md border border-border p-s3 md:grid-cols-[1fr_160px_auto] md:items-end">
                <div className="space-y-s1">
                  <label className="text-small font-medium text-text-secondary">
                    Name
                  </label>
                  <Input
                    className="h-11"
                    placeholder="Service name"
                    value={quickServiceName}
                    onChange={(event) =>
                      setQuickServiceName(event.target.value)
                    }
                  />
                </div>
                <div className="space-y-s1">
                  <label className="text-small font-medium text-text-secondary">
                    Price
                  </label>
                  <Input
                    className="h-11"
                    inputMode="numeric"
                    placeholder="0"
                    value={quickServicePrice}
                    onChange={(event) =>
                      setQuickServicePrice(event.target.value)
                    }
                  />
                </div>
                <Button
                  type="button"
                  className="h-11"
                  disabled={isSavingQuickService}
                  onClick={() => void quickAddService()}
                >
                  {isSavingQuickService ? 'Saving...' : 'Save'}
                </Button>
              </div>
            ) : null}

            <div className="space-y-s2 rounded-md border border-border bg-surface-default p-s3">
              <div className="flex items-center justify-between">
                <p className="text-small font-semibold text-text-primary">
                  Selected services
                </p>
                <p className="text-caption text-text-muted">
                  Edit price if needed
                </p>
              </div>

              {services.length > 0 ? (
                <div className="space-y-s2">
                  {services.map((service) => (
                    <div
                      key={service.id}
                      className="grid gap-s2 rounded-md border border-border bg-white px-s3 py-s2 md:grid-cols-[1fr_150px_auto] md:items-center"
                    >
                      <div>
                        <p className="text-small font-semibold text-text-primary">
                          {service.name}
                        </p>
                        <p className="text-caption text-text-muted">
                          {service.estimatedTime || '60 minutes'}
                        </p>
                      </div>
                      <Input
                        className="h-10"
                        inputMode="numeric"
                        value={String(service.price)}
                        onChange={(event) =>
                          setServices((prev) =>
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
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() =>
                          setServices((prev) =>
                            prev.filter((item) => item.id !== service.id)
                          )
                        }
                      >
                        <X className="size-4" />
                        <span className="sr-only">Remove {service.name}</span>
                      </Button>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="rounded-md border border-dashed border-border px-s3 py-s3 text-small text-text-muted">
                  No service selected yet. Choose from the list above.
                </p>
              )}
            </div>

            <p className="text-small font-semibold">
              Total: {formatCurrencyUsd(total)}
            </p>
          </Card>
        ) : null}

        {step === 3 ? (
          <Card className="space-y-s3 p-s4">
            <h4 className="text-small font-semibold">Assign & Confirm</h4>

            <div className="space-y-s1">
              <label className="text-small font-medium text-text-secondary">
                Assign Worker
              </label>
              <select
                className="h-11 w-full rounded-md border border-input-border bg-input px-s3 text-small"
                value={workerId}
                onChange={(e) => setWorkerId(e.target.value)}
              >
                <option value="">Unassigned</option>
                {workers.map((worker) => (
                  <option key={worker.id} value={worker.id}>
                    {worker.name} ({worker.activeJobs})
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-s1">
              <label className="text-small font-medium text-text-secondary">
                Priority
              </label>
              <select
                className="h-11 w-full rounded-md border border-input-border bg-input px-s3 text-small"
                value={priority}
                onChange={(e) => setPriority(e.target.value as PriorityLevel)}
              >
                <option value="NORMAL">Normal</option>
                <option value="HIGH">High</option>
                <option value="URGENT">Urgent</option>
              </select>
            </div>

            <div className="space-y-s1">
              <label className="text-small font-medium text-text-secondary">
                Estimated Time (minutes)
              </label>
              <Input
                className="h-11"
                value={estimatedTimeMinutes}
                onChange={(e) => setEstimatedTimeMinutes(e.target.value)}
              />
            </div>

            <div className="space-y-s1">
              <label className="text-small font-medium text-text-secondary">
                Notes
              </label>
              <textarea
                className="min-h-[92px] w-full rounded-md border border-input-border bg-input px-s3 py-s2 text-small"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
              />
            </div>

            <p className="text-small font-medium">
              Order Total: {formatCurrencyUsd(total)}
            </p>
          </Card>
        ) : null}

        {submitError ? (
          <p className="text-caption text-state-error">{submitError}</p>
        ) : null}

        <div className="flex items-center justify-between gap-s2">
          <Button
            variant="secondary"
            onClick={
              step === 1
                ? onCancel
                : () => setStep((prev) => Math.max(prev - 1, 1))
            }
            disabled={isSubmitting}
          >
            {step === 1 ? 'Cancel' : 'Back'}
          </Button>

          {step < 3 ? (
            <Button
              disabled={
                isSubmitting ||
                (step === 1 && !canStep1) ||
                (step === 2 && !canStep2)
              }
              onClick={() => setStep((prev) => Math.min(prev + 1, 3))}
            >
              Next
            </Button>
          ) : (
            <Button onClick={handleCreate} disabled={isSubmitting}>
              {isSubmitting ? 'Creating...' : 'Create'}
            </Button>
          )}
        </div>
      </div>
      <Modal
        open={upgradeModalOpen}
        onClose={() => setUpgradeModalOpen(false)}
        title="You are close to the next step"
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
                router.push(upgradePath);
              }}
            >
              Upgrade Plan
            </Button>
          </>
        }
      >
        <p className="text-small text-text-secondary">
          You have reached your current work order capacity. Upgrade your plan
          to keep creating new jobs and running your garage smoothly.
        </p>
      </Modal>
    </>
  );
}
