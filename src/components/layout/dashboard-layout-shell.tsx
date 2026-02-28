'use client';

import {
  Car,
  ClipboardList,
  FileText,
  HelpCircle,
  Home,
  LayoutDashboard,
  Menu,
  Package,
  Plus,
  Settings,
  UserCog,
  Users,
  Wrench
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { useEffect, useMemo, useState, type ReactNode } from 'react';

import { Modal } from '@/components/ui/modal';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { SidebarUserSection } from '@/features/profile/components/sidebar-user-section';
import { CreateOrderForm } from '@/features/work-orders/components/create-order-form';
import { getServices } from '@/features/services/service';
import {
  useCreateWorkOrder,
  useWorkOrders
} from '@/features/work-orders/hooks';
import type { BillingStatus, PlanCode } from '@/features/billing/types';
import type { CreateWorkOrderInput } from '@/features/work-orders/schema';
import type { OrderService } from '@/features/work-orders/types';
import { cn } from '@/lib/utils/cn';

type SidebarSubItem = {
  href: string;
  label: string;
};

type SidebarItem = {
  href: string;
  label: string;
  icon: LucideIcon;
  children?: SidebarSubItem[];
};

const menuItems: SidebarItem[] = [
  { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/dashboard/work-orders', label: 'Work Orders', icon: ClipboardList },
  { href: '/dashboard/invoices', label: 'Invoices', icon: FileText },
  { href: '/dashboard/customers', label: 'Customers', icon: Users },
  { href: '/dashboard/vehicles', label: 'Vehicles', icon: Car },
  { href: '/dashboard/services', label: 'Services', icon: Wrench },
  { href: '/dashboard/inventory', label: 'Inventory', icon: Package },
  { href: '/dashboard/staff', label: 'Staff', icon: UserCog },
  {
    href: '/dashboard/settings',
    label: 'Settings',
    icon: Settings,
    children: [
      {
        href: '/dashboard/settings/garage-information',
        label: 'Garage Information'
      },
      {
        href: '/dashboard/settings/subscription',
        label: 'Subscription'
      },
      {
        href: '/dashboard/settings/invoice-settings',
        label: 'Invoice'
      }
    ]
  }
];

type BreadcrumbItem = {
  label: string;
  href?: string;
};

function segmentToLabel(segment: string): string {
  if (segment === 'dashboard') return 'Dashboard';
  if (/^\d+$/.test(segment) || /^[0-9a-f]{8,}$/i.test(segment)) return 'Detail';

  return segment
    .split('-')
    .filter(Boolean)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}

export function buildBreadcrumb(pathname: string): BreadcrumbItem[] {
  const rawSegments = pathname.split('/').filter(Boolean);
  const dashboardIndex = rawSegments.indexOf('dashboard');

  if (dashboardIndex === -1) {
    return [{ label: 'Dashboard', href: '/dashboard' }];
  }

  const segments = rawSegments.slice(dashboardIndex);

  return segments.map((segment, index) => {
    const label = segmentToLabel(segment);
    const href =
      index < segments.length - 1
        ? `/${segments.slice(0, index + 1).join('/')}`
        : undefined;
    return { label, href };
  });
}

export function DashboardLayoutShell({
  children,
  currentPlan,
  billingStatus
}: {
  children: ReactNode;
  currentPlan: PlanCode;
  billingStatus: BillingStatus;
}): JSX.Element {
  const pathname = usePathname();
  const router = useRouter();
  const toast = useToast();

  const [helpOpen, setHelpOpen] = useState(false);
  const [createOpen, setCreateOpen] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const breadcrumb = useMemo(() => buildBreadcrumb(pathname), [pathname]);
  const firstBreadcrumb = breadcrumb[0];
  const currentBreadcrumb = breadcrumb[breadcrumb.length - 1];
  const hasMiddleBreadcrumb = breadcrumb.length > 2;

  const workersQuery = useWorkOrders({
    page: 1,
    pageSize: 20,
    dateFilter: 'all'
  });
  const createMutation = useCreateWorkOrder();
  const workers = workersQuery.data?.workers ?? [];
  const servicesQuery = useQuery({
    queryKey: ['layout', 'work-order-services'],
    queryFn: () =>
      getServices({ status: 'ACTIVE', page: 1, pageSize: 20, sort: 'name_asc' })
  });
  const availableServices: OrderService[] = (
    servicesQuery.data?.items ?? []
  ).map((item) => ({
    id: item.id,
    name: item.name,
    price: item.price
  }));

  const handleCreateOrder = async (payload: CreateWorkOrderInput) => {
    await createMutation.mutateAsync(payload);
    setCreateOpen(false);
    toast.success('Work order created.');

    if (!pathname.startsWith('/dashboard/work-orders')) {
      router.push('/dashboard/work-orders');
    }
  };

  useEffect(() => {
    if (!isSidebarOpen) {
      return;
    }

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setIsSidebarOpen(false);
      }
    };

    document.addEventListener('keydown', onKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener('keydown', onKeyDown);
    };
  }, [isSidebarOpen]);

  const sidebarContent = (
    <div className="flex h-full flex-col">
      <div className="border-b border-sidebar-border px-s4 py-s4">
        <div className="flex items-center gap-s2 text-sidebar-foreground">
          <Home className="size-5" />
          <p className="text-h3">Garixo</p>
        </div>
        <p className="mt-s1 text-caption text-text-muted">
          Garage Operations Suite
        </p>
      </div>

      <nav className="flex-1 space-y-s1 overflow-y-auto px-s3 py-s3">
        {menuItems.map((item) => {
          const isActive =
            pathname === item.href || pathname.startsWith(`${item.href}/`);
          const Icon = item.icon;

          return (
            <div key={item.href} className="space-y-s1">
              <Link
                href={item.href}
                prefetch={false}
                onClick={() => setIsSidebarOpen(false)}
                className={cn(
                  'flex items-center gap-s2 rounded-md px-s3 py-s2 text-small text-sidebar-foreground transition-colors',
                  isActive
                    ? 'bg-sidebar-active text-sidebar-active-text'
                    : 'hover:bg-surface-hover'
                )}
              >
                <Icon className="size-4" />
                <span>{item.label}</span>
              </Link>

              {item.children?.length ? (
                <div className="ml-s6 space-y-s1">
                  {item.children.map((child) => {
                    const isChildActive =
                      pathname === child.href ||
                      pathname.startsWith(`${child.href}/`);
                    return (
                      <Link
                        key={child.href}
                        href={child.href}
                        prefetch={false}
                        onClick={() => setIsSidebarOpen(false)}
                        className={cn(
                          'block rounded-md px-s3 py-s2 text-small transition-colors',
                          isChildActive
                            ? 'bg-sidebar-active text-sidebar-active-text'
                            : 'text-text-secondary hover:bg-surface-hover hover:text-text-primary'
                        )}
                      >
                        {child.label}
                      </Link>
                    );
                  })}
                </div>
              ) : null}
            </div>
          );
        })}
      </nav>

      <SidebarUserSection
        currentPlan={currentPlan}
        billingStatus={billingStatus}
      />
    </div>
  );

  return (
    <div className="h-screen bg-background-secondary">
      <div className="grid h-full grid-cols-1 md:grid-cols-[248px_1fr]">
        <aside className="hidden h-screen border-r border-sidebar-border bg-sidebar-background md:block">
          {sidebarContent}
        </aside>

        <div className="grid h-screen grid-rows-[64px_1fr]">
          <header className="sticky top-0 z-20 flex items-center justify-between border-b border-border bg-background-primary px-s4 md:px-s6">
            <div className="flex min-w-0 items-center gap-s2">
              <Button
                variant="ghost"
                size="sm"
                className="h-10 w-10 p-0 md:hidden"
                aria-label="Open menu"
                onClick={() => setIsSidebarOpen(true)}
              >
                <Menu className="size-5" />
              </Button>
              <nav aria-label="Breadcrumb" className="min-w-0 flex-1">
                <div className="flex min-w-0 items-center gap-1 overflow-hidden whitespace-nowrap text-caption sm:text-small md:hidden">
                  {firstBreadcrumb?.href ? (
                    <Link
                      href={firstBreadcrumb.href}
                      prefetch={false}
                      className="shrink-0 text-text-muted hover:text-text-primary"
                    >
                      {firstBreadcrumb.label}
                    </Link>
                  ) : (
                    <span className="shrink-0 text-text-muted">
                      {firstBreadcrumb?.label}
                    </span>
                  )}

                  {currentBreadcrumb && breadcrumb.length > 1 ? (
                    <>
                      <span className="shrink-0 text-text-muted">/</span>
                      {hasMiddleBreadcrumb ? (
                        <>
                          <span className="shrink-0 text-text-muted">...</span>
                          <span className="shrink-0 text-text-muted">/</span>
                        </>
                      ) : null}
                      <span className="truncate text-text-primary">
                        {currentBreadcrumb.label}
                      </span>
                    </>
                  ) : null}
                </div>

                <div className="hidden min-w-0 items-center gap-s2 overflow-hidden whitespace-nowrap text-small md:flex">
                  {breadcrumb.map((item, index) => {
                    const isLast = index === breadcrumb.length - 1;
                    return (
                      <div
                        key={`${item.label}-${index}`}
                        className="flex min-w-0 items-center gap-s2"
                      >
                        {item.href && !isLast ? (
                          <Link
                            href={item.href}
                            prefetch={false}
                            className="text-text-muted hover:text-text-primary"
                          >
                            {item.label}
                          </Link>
                        ) : (
                          <span
                            className={cn(
                              isLast
                                ? 'truncate text-text-primary'
                                : 'text-text-muted'
                            )}
                          >
                            {item.label}
                          </span>
                        )}
                        {!isLast ? (
                          <span className="text-text-muted">/</span>
                        ) : null}
                      </div>
                    );
                  })}
                </div>
              </nav>
            </div>
            <div className="flex shrink-0 items-center gap-s2">
              <Button
                variant="ghost"
                size="sm"
                className="h-9 w-9 p-0 sm:h-10 sm:w-10"
                aria-label="Open owner help"
                onClick={() => setHelpOpen(true)}
              >
                <HelpCircle className="size-5" />
              </Button>
              <Button
                size="sm"
                className="h-9 px-s2 sm:h-10 sm:px-s3"
                onClick={() => setCreateOpen(true)}
                aria-label="Create new work order"
              >
                <Plus className="size-4" />
                <span className="hidden sm:inline">New Work Order</span>
              </Button>
            </div>
          </header>

          <main className="overflow-y-auto px-s4 py-s4 md:px-s6 md:py-s6">
            {children}
          </main>
        </div>
      </div>

      {isSidebarOpen ? (
        <div className="fixed inset-0 z-30 md:hidden">
          <button
            type="button"
            aria-label="Close menu"
            className="absolute inset-0 bg-black/40"
            onClick={() => setIsSidebarOpen(false)}
          />
          <aside
            className={cn(
              'absolute inset-y-0 left-0 w-[85vw] max-w-[280px] border-r border-sidebar-border bg-sidebar-background',
              'transform transition-transform duration-200 ease-in-out',
              isSidebarOpen ? 'translate-x-0' : '-translate-x-full'
            )}
          >
            {sidebarContent}
          </aside>
        </div>
      ) : null}

      <Modal
        open={helpOpen}
        onClose={() => setHelpOpen(false)}
        title="Owner Help"
        width="md"
      >
        <div className="space-y-s3 text-small text-text-secondary">
          <p>
            Use the sidebar to switch modules and keep daily operations
            organized.
          </p>
          <p>
            Click New Work Order to create a job, assign a worker, and track
            progress in one flow.
          </p>
          <p>
            If numbers look unusual, check Work Orders and Inventory first to
            spot delays quickly.
          </p>
        </div>
      </Modal>

      <Modal
        open={createOpen}
        onClose={() => setCreateOpen(false)}
        title="Create Work Order"
        width="lg"
        showCloseIcon={!createMutation.isPending}
      >
        <CreateOrderForm
          workers={workers}
          availableServices={availableServices}
          onSubmit={handleCreateOrder}
          onCancel={() => setCreateOpen(false)}
        />
      </Modal>
    </div>
  );
}
