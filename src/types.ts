export type Role = 'SUPER_ADMIN' | 'ORG_ADMIN' | 'FINANCE_MANAGER' | 'TEAM_MEMBER';

export type Permission =
  | 'VIEW_ALL_ORGANIZATIONS'
  | 'EDIT_SYSTEM_PLANS'
  | 'VIEW_ANALYTICS'
  | 'MANAGE_MEMBERS'
  | 'UPGRADE_SUBSCRIPTION'
  | 'VIEW_INVOICES'
  | 'MANAGE_PAYMENTS'
  | 'VIEW_AUDIT_LOGS'
  | 'REQUEST_SEATS'
  | 'SIMULATE_ERRORS';

export interface Tenant {
  id: string;
  name: string;
  industry: string;
  createdAt: string;
  size: number;
}

export interface SubscriptionPlan {
  id: string;
  name: string;
  basePrice: number;
  pricePerSeat: number;
  description: string;
  features: string[];
}

export interface OrganizationSubscription {
  id: string;
  tenantId: string;
  planId: string;
  status: 'ACTIVE' | 'TRIAL' | 'PAST_DUE' | 'CANCELLED';
  billingCycle: 'MONTHLY' | 'YEARLY';
  seats: number;
  stripeId: string | null;
  dbAddon: boolean;
  slaAddon: boolean;
  apiAddon: boolean;
  startDate: string;
  nextRenewal: string;
  usageApiCount: number; // Current count in last month, e.g. 450,000 requests
  usageCpuHours: number;  // e.g. 150 hours
  usageStorageGB: number;  // e.g. 80 GB
}

export interface InvoiceLineItem {
  id: string;
  desc: string;
  qty: number;
  unitPrice: number;
  total: number;
}

export interface Invoice {
  id: string;
  tenantId: string;
  subscriptionId: string;
  issueDate: string;
  dueDate: string;
  subtotal: number;
  tax: number;
  taxRate: number; // e.g. 0.18
  amount: number;
  refundAmount?: number;
  status: 'PAID' | 'OUTSTANDING' | 'OVERDUE' | 'REFUNDED';
  paymentMethod: string;
  billingCycle: 'MONTHLY' | 'YEARLY';
  billingReason: string; // e.g., 'Subscription Renewal', 'Seat Additions', 'Usage Overage'
  lineItems: InvoiceLineItem[];
}

export interface AuditLog {
  id: string;
  timestamp: string;
  actorEmail: string;
  actorRole: Role;
  tenantId: string | 'GLOBAL';
  ipAddress: string;
  action: string;
  category: 'AUTH' | 'SUBSCRIPTION' | 'PAYMENT' | 'MEMBERS' | 'SETTINGS' | 'SYSTEM';
  status: 'SUCCESS' | 'FAILURE';
  details: string;
}

// Permission map for each Role
export const ROLE_PERMISSIONS: Record<Role, Permission[]> = {
  SUPER_ADMIN: [
    'VIEW_ALL_ORGANIZATIONS',
    'EDIT_SYSTEM_PLANS',
    'VIEW_ANALYTICS',
    'MANAGE_MEMBERS',
    'UPGRADE_SUBSCRIPTION',
    'VIEW_INVOICES',
    'MANAGE_PAYMENTS',
    'VIEW_AUDIT_LOGS',
    'SIMULATE_ERRORS',
  ],
  ORG_ADMIN: [
    'VIEW_ANALYTICS',
    'MANAGE_MEMBERS',
    'UPGRADE_SUBSCRIPTION',
    'VIEW_INVOICES',
    'MANAGE_PAYMENTS',
    'VIEW_AUDIT_LOGS',
  ],
  FINANCE_MANAGER: [
    'VIEW_ANALYTICS',
    'VIEW_INVOICES',
    'MANAGE_PAYMENTS',
    'VIEW_AUDIT_LOGS',
  ],
  TEAM_MEMBER: [
    'REQUEST_SEATS',
  ],
};

export function hasPermission(role: Role, permission: Permission): boolean {
  return ROLE_PERMISSIONS[role].includes(permission);
}
