import { Boxes, ClipboardList, Users } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

export type CoreFeature = {
  id: 'work-order' | 'customers' | 'inventory' | 'staff';
  title: string;
  badge: string;
  description: string;
  impact: string;
  href: string;
  icon: LucideIcon;
  bullets: string[];
};

export type FeatureFaq = {
  question: string;
  answer: string;
};

export const coreFeatures: CoreFeature[] = [
  {
    id: 'work-order',
    title: 'Work Order Management from Check-In to Delivery',
    badge: 'Feature 01 · Work Order Management',
    description:
      'Create, assign, and track every repair job with real-time status updates from draft to paid.',
    impact: 'Know exactly what every job needs and what to do next.',
    href: '/features/work-orders-management',
    icon: ClipboardList,
    bullets: [
      'Create work orders with customer and vehicle context in minutes',
      'Live status flow: Draft, In Progress, Waiting Parts, Completed, Paid',
      'Board and table views for faster daily dispatch',
      'Assign workers clearly and reduce missed handoffs'
    ]
  },
  {
    id: 'customers',
    title: 'Customers Management and Service History Tracking',
    badge: 'Feature 02 · Customers Management',
    description:
      'Keep customer profiles, linked vehicles, and service history in one simple system built for independent auto shops.',
    impact: 'Increase repeat visits by making every customer feel remembered.',
    href: '/features/customers-management',
    icon: Users,
    bullets: [
      'Search customers quickly by name, phone, or plate',
      'Link customers to vehicles for cleaner service context',
      'Review work-order history before creating new jobs',
      'Track repeat visits and spending behavior over time'
    ]
  },
  {
    id: 'inventory',
    title: 'Smart Inventory Control for Auto Parts',
    badge: 'Feature 03 · Inventory Control',
    description:
      'Prevent stock shortages with workshop management software that auto-deducts parts and alerts low inventory before jobs stop.',
    impact: 'Stop losing money on missing parts.',
    href: '/features/inventory-management',
    icon: Boxes,
    bullets: [
      'Auto-deduct parts when jobs complete',
      'Low stock alerts before critical shortages',
      'Supplier and cost tracking by part',
      'Real-time inventory valuation and usage'
    ]
  },
  {
    id: 'staff',
    title: 'Staff Management and Workload Visibility for Small Garages',
    badge: 'Feature 04 · Staff Management',
    description:
      'Manage team profiles, track workload, and keep assignments organized with a simple staff management workflow.',
    impact: 'Keep your team balanced and productive every day.',
    href: '/features/staff-management',
    icon: Users,
    bullets: [
      'Add and manage staff profiles in minutes',
      'Track active, free, and overloaded team members',
      'Keep role and status data clear for daily planning',
      'Enforce user-seat limits with upgrade guidance when needed'
    ]
  }
];

export const featureFaqs: FeatureFaq[] = [
  {
    question: 'What features should a garage management system have?',
    answer:
      'A complete garage management system should include work order management, customer management, inventory control, and staff management. Garixo combines all four in one platform.'
  },
  {
    question:
      'How does auto repair shop management software improve efficiency?',
    answer:
      'It replaces paper and manual updates with real-time workflow visibility. Owners and managers can assign jobs faster, track labor clearly, and reduce delays across workshop operations.'
  },
  {
    question: 'Is Garixo suitable for small and medium auto repair shops?',
    answer:
      'Yes. Garixo is built for independent and growing workshops. The workflow is simple for non-technical owners and can scale as your team and vehicle volume grow.'
  },
  {
    question: 'Can garage management software track inventory and profit?',
    answer:
      'Yes. Garixo helps track inventory usage and gives clear operational context to support better revenue and profit decisions.'
  }
];
