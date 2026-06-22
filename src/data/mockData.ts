import { Tenant, SubscriptionPlan, OrganizationSubscription, Invoice, AuditLog, Role } from '../types';

export interface UserPreset {
  email: string;
  role: Role;
  name: string;
  tenantId: string | 'GLOBAL';
  avatar: string;
}

export const USER_PRESETS: UserPreset[] = [
  {
    email: 'clara.gold@platformadmin.com',
    role: 'SUPER_ADMIN',
    name: 'Clara Gold',
    tenantId: 'GLOBAL',
    avatar: 'CG',
  },
  {
    email: 'david.sanchez@saasify.io',
    role: 'ORG_ADMIN',
    name: 'David Sanchez',
    tenantId: 'tenant-1', // SaaSify Inc.
    avatar: 'DS',
  },
  {
    email: 'irene.mendoza@saasify.io',
    role: 'FINANCE_MANAGER',
    name: 'Irene Mendoza',
    tenantId: 'tenant-1', // SaaSify Inc.
    avatar: 'IM',
  },
  {
    email: 'alex.chen@saasify.io',
    role: 'TEAM_MEMBER',
    name: 'Alex Chen',
    tenantId: 'tenant-1', // SaaSify Inc.
    avatar: 'AC',
  },
];

export const TENANTS: Tenant[] = [
  { id: 'tenant-1', name: 'SaaSify Inc.', industry: 'FinTech Software', createdAt: '2025-01-14', size: 120 },
  { id: 'tenant-2', name: 'Aura Design Studio', industry: 'Creative Web Design', createdAt: '2025-03-22', size: 45 },
  { id: 'tenant-3', name: 'Acme Logistics Corp', industry: 'Supply Chain Management', createdAt: '2025-05-10', size: 210 },
  { id: 'tenant-4', name: 'Lunar Bio Tech', industry: 'Medical R&D', createdAt: '2026-05-30', size: 12 },
];

export const SUBSCRIPTION_PLANS: SubscriptionPlan[] = [
  {
    id: 'plan-starter',
    name: 'Starter Tier',
    basePrice: 49,
    pricePerSeat: 12,
    description: 'Perfect for small growing teams needing basic SaaS telemetry and accounting triggers.',
    features: [
      'Up to 10 Seats included',
      'Basic Billing Metrics Dashboard',
      'Downloadable PDF Invoices',
      'Email support (24h SLA)',
      '10,000 Client API Requests/mo Included',
    ],
  },
  {
    id: 'plan-growth',
    name: 'Growth Core',
    basePrice: 199,
    pricePerSeat: 20,
    description: 'Advanced features for scaling platforms with heavy customer base, dynamic metrics, and usage telemetry.',
    features: [
      'Up to 50 Seats included',
      'Advanced Reporting (CLV, Churn analysis)',
      'Stripe & Razorpay integrations',
      'Automated renewal notification emails',
      'Priority support (4h SLA)',
      '100,000 Client API Requests/mo Included',
      'Prorated invoices and seat adjustments',
    ],
  },
  {
    id: 'plan-enterprise',
    name: 'Enterprise Executive',
    basePrice: 899,
    pricePerSeat: 35,
    description: 'Our standard-setting tier for global deployments offering continuous multi-tenant seat isolation.',
    features: [
      'Unlimited seat capability',
      'Live multi-tenant workspace controller',
      'Audit log querying & export via API',
      'Dedicated relational cloud DB addon support',
      'Instant Webhook Triggers for failed charges',
      'Unlimited API requests (meter-based pricing overage)',
      'Quarterly proration alignments',
      'Dedicated Account Manager (1 hour SLA)',
    ],
  },
];

export const INITIAL_SUBSCRIPTIONS: OrganizationSubscription[] = [
  {
    id: 'sub-saasify',
    tenantId: 'tenant-1',
    planId: 'plan-growth',
    status: 'ACTIVE',
    billingCycle: 'MONTHLY',
    seats: 26,
    stripeId: 'sub_Stripe199023_growth',
    dbAddon: true,
    slaAddon: false,
    apiAddon: true,
    startDate: '2025-01-15',
    nextRenewal: '2026-07-15',
    usageApiCount: 82400, // 82.4% of Growth limit
    usageCpuHours: 148,
    usageStorageGB: 45,
  },
  {
    id: 'sub-aura',
    tenantId: 'tenant-2',
    planId: 'plan-starter',
    status: 'ACTIVE',
    billingCycle: 'YEARLY',
    seats: 8,
    stripeId: 'sub_Stripe488219_starter',
    dbAddon: false,
    slaAddon: false,
    apiAddon: false,
    startDate: '2025-03-24',
    nextRenewal: '2027-03-24',
    usageApiCount: 8900,
    usageCpuHours: 15,
    usageStorageGB: 12,
  },
  {
    id: 'sub-acme',
    tenantId: 'tenant-3',
    planId: 'plan-enterprise',
    status: 'ACTIVE',
    billingCycle: 'MONTHLY',
    seats: 84,
    stripeId: 'sub_Stripe599100_ent',
    dbAddon: true,
    slaAddon: true,
    apiAddon: true,
    startDate: '2025-05-11',
    nextRenewal: '2026-07-11',
    usageApiCount: 1450000,
    usageCpuHours: 852,
    usageStorageGB: 412,
  },
  {
    id: 'sub-lunar',
    tenantId: 'tenant-4',
    planId: 'plan-growth',
    status: 'TRIAL',
    billingCycle: 'MONTHLY',
    seats: 4,
    stripeId: null,
    dbAddon: false,
    slaAddon: false,
    apiAddon: false,
    startDate: '2026-06-15',
    nextRenewal: '2026-06-30', // 15 day trial
    usageApiCount: 4100,
    usageCpuHours: 8,
    usageStorageGB: 2,
  },
];

export const INITIAL_INVOICES: Invoice[] = [
  {
    id: 'INV-2026-001',
    tenantId: 'tenant-1', // SaaSify
    subscriptionId: 'sub-saasify',
    issueDate: '2026-06-15',
    dueDate: '2026-06-30',
    subtotal: 719.00, // base 199 + 26 seats * 20
    tax: 129.42, // 18%
    taxRate: 0.18,
    amount: 848.42,
    status: 'PAID',
    paymentMethod: 'Stripe Credit Card (•••• 4242)',
    billingCycle: 'MONTHLY',
    billingReason: 'Recurring Monthly Renewal',
    lineItems: [
      { id: 'li-1', desc: 'Growth Core Subscription Plan Base Fee', qty: 1, unitPrice: 199.00, total: 199.00 },
      { id: 'li-2', desc: 'Growth Seat License Addition', qty: 26, unitPrice: 20.00, total: 520.00 },
    ],
  },
  {
    id: 'INV-2026-002',
    tenantId: 'tenant-1',
    subscriptionId: 'sub-saasify',
    issueDate: '2026-05-15',
    dueDate: '2026-05-30',
    subtotal: 679.00, // base 199 + 24 seats * 20
    tax: 122.22,
    taxRate: 0.18,
    amount: 801.22,
    status: 'PAID',
    paymentMethod: 'Stripe Credit Card (•••• 4242)',
    billingCycle: 'MONTHLY',
    billingReason: 'Recurring Monthly Renewal',
    lineItems: [
      { id: 'li-3', desc: 'Growth Core Subscription Plan Base Fee', qty: 1, unitPrice: 199.00, total: 199.00 },
      { id: 'li-4', desc: 'Growth Seat License Addition', qty: 24, unitPrice: 20.00, total: 480.00 },
    ],
  },
  {
    id: 'INV-2026-003',
    tenantId: 'tenant-1',
    subscriptionId: 'sub-saasify',
    issueDate: '2026-06-20',
    dueDate: '2026-07-05',
    subtotal: 154.50, // Overage and addon adjustments
    tax: 27.81,
    taxRate: 0.18,
    amount: 182.31,
    status: 'OUTSTANDING',
    paymentMethod: 'Stripe Credit Card (•••• 4242)',
    billingCycle: 'MONTHLY',
    billingReason: 'Seat Scale Adjustment & Proration (2 additional seats)',
    lineItems: [
      { id: 'li-5', desc: 'Prorated Additional Seats (2 licenses for remaining 25 days)', qty: 2, unitPrice: 13.50, total: 27.00 },
      { id: 'li-6', desc: 'API Scale Powerup Booster Addon', qty: 1, unitPrice: 127.50, total: 127.50 },
    ],
  },
  {
    id: 'INV-2026-004',
    tenantId: 'tenant-2', // Aura
    subscriptionId: 'sub-aura',
    issueDate: '2026-03-24',
    dueDate: '2026-04-07',
    subtotal: 1548.00, // base 49 * 12 * 80% + seats 8 * 12 * 12 * 80%? Let's say flat yearly base: base yearly=470 + seats yearly=1078
    tax: 278.64,
    taxRate: 0.18,
    amount: 1826.64,
    status: 'PAID',
    paymentMethod: 'Razorpay Direct NetBanking',
    billingCycle: 'YEARLY',
    billingReason: 'Annual Subscription Renewal',
    lineItems: [
      { id: 'li-7', desc: 'Starter Tier Subscription Plan (Yearly Discount Applied)', qty: 1, unitPrice: 470.00, total: 470.00 },
      { id: 'li-8', desc: 'Starter Seat License Addition (8 Seats Yearly bundle)', qty: 8, unitPrice: 134.75, total: 1078.00 },
    ],
  },
  {
    id: 'INV-2026-005',
    tenantId: 'tenant-3', // Acme Corp
    subscriptionId: 'sub-acme',
    issueDate: '2026-06-11',
    dueDate: '2026-06-26',
    subtotal: 4439.00, // Base 899 + 84 seats * 35 + dbAddon 200 + slaAddon 400
    tax: 799.02,
    taxRate: 0.18,
    amount: 5238.02,
    status: 'PAID',
    paymentMethod: 'ACH Corporate Wire Transfer',
    billingCycle: 'MONTHLY',
    billingReason: 'Recurring Monthly Renewal',
    lineItems: [
      { id: 'li-9', desc: 'Enterprise Executive Plan Base Fee', qty: 1, unitPrice: 899.00, total: 899.00 },
      { id: 'li-10', desc: 'Enterprise Seats License Bundle', qty: 84, unitPrice: 35.00, total: 2940.00 },
      { id: 'li-11', desc: 'Enterprise Dedicated Relational Database Premium Addon', qty: 1, unitPrice: 200.00, total: 200.00 },
      { id: 'li-12', desc: 'Premium Support 1h SLA Addon Agreement', qty: 1, unitPrice: 400.00, total: 400.00 },
    ],
  },
  {
    id: 'INV-2026-006',
    tenantId: 'tenant-3',
    subscriptionId: 'sub-acme',
    issueDate: '2026-06-18',
    dueDate: '2026-07-02',
    subtotal: 120.00,
    tax: 21.60,
    taxRate: 0.18,
    amount: 141.60,
    status: 'OVERDUE',
    paymentMethod: 'ACH Corporate Wire Transfer',
    billingCycle: 'MONTHLY',
    billingReason: 'API Usage Overage Charge',
    lineItems: [
      { id: 'li-13', desc: 'API Traffic Excess Overage Fee (60,000 blocks at $0.002)', qty: 1, unitPrice: 120.00, total: 120.00 }
    ],
  }
];

export const INITIAL_AUDIT_LOGS: AuditLog[] = [
  {
    id: 'log-1',
    timestamp: '2026-06-22 09:12:44',
    actorEmail: 'clara.gold@platformadmin.com',
    actorRole: 'SUPER_ADMIN',
    tenantId: 'GLOBAL',
    ipAddress: '198.51.100.41',
    action: 'MEMBER_AUTH_MFA_LOGIN',
    category: 'AUTH',
    status: 'SUCCESS',
    details: 'Super Admin successfully logged in with physical security key authentication token.',
  },
  {
    id: 'log-2',
    timestamp: '2026-06-21 16:35:10',
    actorEmail: 'david.sanchez@saasify.io',
    actorRole: 'ORG_ADMIN',
    tenantId: 'tenant-1',
    ipAddress: '203.0.113.88',
    action: 'SUBSCRIPTION_SEATS_UPGRADE',
    category: 'SUBSCRIPTION',
    status: 'SUCCESS',
    details: 'Increased seats quota count from 24 seats to 26 seats. Triggers prorated invoice INV-2026-003.',
  },
  {
    id: 'log-3',
    timestamp: '2026-06-20 11:22:45',
    actorEmail: 'irene.mendoza@saasify.io',
    actorRole: 'FINANCE_MANAGER',
    tenantId: 'tenant-1',
    ipAddress: '203.0.113.89',
    action: 'BILLING_METHOD_UPDATE',
    category: 'PAYMENT',
    status: 'SUCCESS',
    details: 'Updated organization card terminal default settings. Switched Stripe checkout token prefix.',
  },
  {
    id: 'log-4',
    timestamp: '2026-06-19 14:02:11',
    actorEmail: 'alex.chen@saasify.io',
    actorRole: 'TEAM_MEMBER',
    tenantId: 'tenant-1',
    ipAddress: '203.0.113.91',
    action: 'SEAT_EXPANSION_REQUEST',
    category: 'MEMBERS',
    status: 'SUCCESS',
    details: 'Submitted dynamic request to Organization Admin to buy 3 additional licenses for sales contractors.',
  },
  {
    id: 'log-5',
    timestamp: '2026-06-18 08:30:19',
    actorEmail: 'clara.gold@platformadmin.com',
    actorRole: 'SUPER_ADMIN',
    tenantId: 'GLOBAL',
    ipAddress: '198.51.100.41',
    action: 'ENTERPRISE_TAX_RULE_EDIT',
    category: 'SETTINGS',
    status: 'SUCCESS',
    details: 'Updated VAT/GST override definitions for remote digital assets from 15% flat to standard regional 18% with smart routing.',
  },
  {
    id: 'log-6',
    timestamp: '2026-06-15 00:01:45',
    actorEmail: 'cron-engine@b2bbilling.cloud',
    actorRole: 'SUPER_ADMIN',
    tenantId: 'GLOBAL',
    ipAddress: '127.0.0.1',
    action: 'SUBSCRIPTION_RENEWAL_RETRY',
    category: 'SYSTEM',
    status: 'FAILURE',
    details: 'Monthly recurring collection for Acme Logistics Corp (INV-2026-006) failed verification with ACH Bank routing. Code: RETRY_EXHAUSTED.',
  }
];
