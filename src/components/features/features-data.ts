import { BarChart3, Boxes, CarFront, Users } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

export type CoreFeature = {
  id: 'vehicle' | 'technician' | 'inventory' | 'financial';
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
    id: 'vehicle',
    title: 'Vehicle Workflow Management from Check-In to Delivery',
    badge: 'Feature 01 · Vehicle Workflow',
    description:
      'Track every vehicle in your garage management system with real-time status updates from check-in to delivery.',
    impact: 'Know exactly where every vehicle is at any moment.',
    href: '/features',
    icon: CarFront,
    bullets: [
      'Digital check-in and complete service history',
      'Live status tracking: Waiting, In Progress, QC, Delivered',
      'Clear job board without floor-walk delays',
      'Faster turnaround with priority assignment'
    ]
  },
  {
    id: 'technician',
    title: 'Technician Management and Labor Tracking',
    badge: 'Feature 02 · Technician Management',
    description:
      'Assign jobs quickly and track labor time automatically with auto repair shop management software built for workshop teams.',
    impact: 'Turn your team into a performance-driven workforce.',
    href: '/features/technician-tracking',
    icon: Users,
    bullets: [
      'Assign tasks in seconds with clear priorities',
      'Capture labor time automatically per job',
      'Monitor technician performance daily',
      'Balance workloads in real time'
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
    id: 'financial',
    title: 'Real-Time Financial Dashboard for Auto Repair Businesses',
    badge: 'Feature 04 · Financial Dashboard',
    description:
      'Get daily revenue, cost, and net profit visibility from one automotive repair management software dashboard.',
    impact: 'Make decisions based on data, not guesswork.',
    href: '/features',
    icon: BarChart3,
    bullets: [
      'Revenue and cost breakdown by service',
      'Daily net profit visibility',
      'Weekly and monthly performance trends',
      'Cash flow insight without spreadsheets'
    ]
  }
];

export const featureFaqs: FeatureFaq[] = [
  {
    question: 'What features should a garage management system have?',
    answer:
      'A complete garage management system should include vehicle workflow tracking, technician management, inventory control, and a real-time financial dashboard. Garixo combines all four in one platform.'
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
      'Yes. Garixo updates inventory when jobs complete and shows live financial performance, including revenue, parts cost, labor cost, and net profit in one dashboard.'
  }
];
