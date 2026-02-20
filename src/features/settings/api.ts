import { settingsSectionKeySchema } from '@/features/settings/schema';
import type { SettingsNavItem, SettingsSection, SettingsSectionKey } from '@/features/settings/types';

const settingsNavItems: SettingsNavItem[] = [
  { key: 'garage-information', label: 'Garage Information', href: '/dashboard/settings/garage-information' },
  { key: 'branch-management', label: 'Branch Management', href: '/dashboard/settings/branch-management' },
  { key: 'service-configuration', label: 'Service Configuration', href: '/dashboard/settings/service-configuration' },
  { key: 'inventory-settings', label: 'Inventory Settings', href: '/dashboard/settings/inventory-settings' },
  { key: 'notification-settings', label: 'Notification Settings', href: '/dashboard/settings/notification-settings' },
  { key: 'subscription-plan', label: 'Subscription / Plan', href: '/dashboard/settings/subscription-plan' }
];

const settingsSections: Record<SettingsSectionKey, SettingsSection> = {
  'garage-information': {
    key: 'garage-information',
    title: 'Garage Information',
    description: 'Core business identity and customer-facing details.',
    cards: [
      {
        title: 'Business Profile',
        description: 'Basic profile shown on invoices and customer communication.',
        fields: [
          { label: 'Garage Name', value: 'Garixo Auto Center' },
          { label: 'Business Registration ID', value: 'GXM-284-339' },
          { label: 'Primary Phone', value: '+1 (555) 302-1188' }
        ]
      },
      {
        title: 'Address & Timezone',
        description: 'Location and operating timezone used in scheduling.',
        fields: [
          { label: 'Address', value: '812 Harbor Industrial Road, Austin, TX' },
          { label: 'Timezone', value: 'America/Chicago' },
          { label: 'Operating Hours', value: 'Mon-Sat, 8:00 AM - 6:00 PM' }
        ]
      }
    ]
  },
  'branch-management': {
    key: 'branch-management',
    title: 'Branch Management',
    description: 'Manage active branches and branch-level operations settings.',
    cards: [
      {
        title: 'Branch Directory',
        description: 'Maintain branch names and local contact channels.',
        fields: [
          { label: 'Active Branches', value: '3 Branches' },
          { label: 'Primary Branch', value: 'Austin - Central' },
          { label: 'Branch Support Line', value: '+1 (555) 410-2230' }
        ]
      },
      {
        title: 'Branch Operations',
        description: 'Standard operating settings applied per branch.',
        fields: [
          { label: 'Shared Inventory', value: 'Enabled' },
          { label: 'Inter-Branch Transfers', value: 'Manual Approval' },
          { label: 'Default Work Order Prefix', value: 'ATX-' }
        ]
      }
    ]
  },
  'service-configuration': {
    key: 'service-configuration',
    title: 'Service Configuration',
    description: 'Set labor defaults, service categories, and pricing behavior.',
    cards: [
      {
        title: 'Service Catalog Defaults',
        description: 'Defaults for service creation and categorization.',
        fields: [
          { label: 'Default Labor Rate', value: '$95 / hour' },
          { label: 'Tax Inclusion Mode', value: 'Exclusive' },
          { label: 'Warranty Period', value: '90 Days' }
        ]
      },
      {
        title: 'Operational Rules',
        description: 'Rules that reduce configuration errors during intake.',
        fields: [
          { label: 'Require Technician Assignment', value: 'Enabled' },
          { label: 'Allow Zero-Cost Services', value: 'Disabled' },
          { label: 'Require Customer Approval', value: 'Enabled' }
        ]
      }
    ]
  },
  'inventory-settings': {
    key: 'inventory-settings',
    title: 'Inventory Settings',
    description: 'Control stock thresholds, valuation mode, and alerts.',
    cards: [
      {
        title: 'Stock Policy',
        description: 'Core inventory behavior for replenishment and valuation.',
        fields: [
          { label: 'Low Stock Threshold', value: '10 Units' },
          { label: 'Valuation Method', value: 'FIFO' },
          { label: 'Auto-Reorder Suggestions', value: 'Enabled' }
        ]
      },
      {
        title: 'Receiving Controls',
        description: 'Reduce mismatch risk in incoming stock operations.',
        fields: [
          { label: 'Require PO Reference', value: 'Enabled' },
          { label: 'Allow Partial Receipts', value: 'Enabled' },
          { label: 'Negative Stock Prevention', value: 'Enabled' }
        ]
      }
    ]
  },
  'notification-settings': {
    key: 'notification-settings',
    title: 'Notification Settings',
    description: 'Configure alerts for owners, front desk, and workshop staff.',
    cards: [
      {
        title: 'Customer Notifications',
        description: 'Messages sent during work order and billing flow.',
        fields: [
          { label: 'Work Order Created', value: 'SMS + Email' },
          { label: 'Job Completion Notice', value: 'SMS + Email' },
          { label: 'Invoice Ready', value: 'Email' }
        ]
      },
      {
        title: 'Internal Alerts',
        description: 'Operational alerts for teams and management.',
        fields: [
          { label: 'Low Stock Alerts', value: 'Owner + Inventory Staff' },
          { label: 'Delayed Jobs', value: 'Workshop Supervisor' },
          { label: 'Daily Summary', value: 'Owner (8:00 PM)' }
        ]
      }
    ]
  },
  'subscription-plan': {
    key: 'subscription-plan',
    title: 'Subscription / Plan',
    description: 'View plan limits, billing cadence, and account entitlements.',
    cards: [
      {
        title: 'Current Plan',
        description: 'Plan details and operational limits for this workspace.',
        fields: [
          { label: 'Plan Tier', value: 'Growth Plan' },
          { label: 'Active Users', value: '24 / 40' },
          { label: 'Branches Included', value: '3 / 5' }
        ]
      },
      {
        title: 'Billing',
        description: 'Billing method and renewal details.',
        fields: [
          { label: 'Billing Cycle', value: 'Monthly' },
          { label: 'Next Billing Date', value: 'March 1, 2026' },
          { label: 'Payment Method', value: 'Visa ending in 4821' }
        ]
      }
    ]
  }
};

export function getSettingsNavItems(): SettingsNavItem[] {
  return settingsNavItems;
}

export function getDefaultSettingsSection(): SettingsSectionKey {
  return 'garage-information';
}

export function getSettingsSection(section: string): SettingsSection | null {
  const parsed = settingsSectionKeySchema.safeParse(section);

  if (!parsed.success) {
    return null;
  }

  return settingsSections[parsed.data];
}
