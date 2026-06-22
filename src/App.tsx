/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { 
  Bell, 
  CreditCard, 
  Layers, 
  Settings, 
  Users, 
  Info, 
  Sparkles, 
  DollarSign, 
  Calendar, 
  Building, 
  Plus, 
  Minus, 
  AlertTriangle, 
  Check, 
  ShieldCheck, 
  ArrowUpRight,
  TrendingUp,
  X,
  RefreshCw,
  Clock,
  Briefcase
} from 'lucide-react';
import { Role, Tenant, SubscriptionPlan, OrganizationSubscription, Invoice, AuditLog } from './types';
import { ROLE_PERMISSIONS, hasPermission } from './types';
import { USER_PRESETS, TENANTS, SUBSCRIPTION_PLANS, INITIAL_SUBSCRIPTIONS, INITIAL_INVOICES, INITIAL_AUDIT_LOGS } from './data/mockData';
import { RoleBadge } from './components/RoleBadge';
import { MetricCard } from './components/MetricCard';
import { FinancialTrendChart, SeatMultiTenantChart, UsageCircularGauge } from './components/InteractiveCharts';
import { InvoiceDownload } from './components/InvoiceDownload';
import { SchemaView } from './components/SchemaView';
import { AuditLogger } from './components/AuditLogger';

export default function App() {
  // --- Core State Storage ---
  const [role, setRole] = useState<Role>(() => {
    const cached = localStorage.getItem('saas_billing_active_role');
    return (cached as Role) || 'ORG_ADMIN';
  });

  const [selectedTenantId, setSelectedTenantId] = useState<string>(() => {
    const cached = localStorage.getItem('saas_billing_active_tenant');
    return cached || 'tenant-1'; // SaaSify Inc.
  });

  const [subscriptions, setSubscriptions] = useState<OrganizationSubscription[]>(() => {
    const cached = localStorage.getItem('saas_billing_subs');
    return cached ? JSON.parse(cached) : INITIAL_SUBSCRIPTIONS;
  });

  const [invoices, setInvoices] = useState<Invoice[]>(() => {
    const cached = localStorage.getItem('saas_billing_invoices');
    if (cached) {
      try {
        const parsed = JSON.parse(cached) as Invoice[];
        const newItems = INITIAL_INVOICES.filter(initInv => !parsed.some(p => p.id === initInv.id));
        if (newItems.length > 0) {
          return [...parsed, ...newItems];
        }
        return parsed;
      } catch (e) {
        return INITIAL_INVOICES;
      }
    }
    return INITIAL_INVOICES;
  });

  const [logs, setLogs] = useState<AuditLog[]>(() => {
    const cached = localStorage.getItem('saas_billing_logs');
    return cached ? JSON.parse(cached) : INITIAL_AUDIT_LOGS;
  });

  // --- UI Layout Navigation state ---
  const [currentTab, setCurrentTab] = useState<'dashboard' | 'subscriptions' | 'invoices' | 'usage' | 'logs' | 'schema'>(() => {
    const cached = localStorage.getItem('saas_billing_active_tab');
    return (cached as any) || 'dashboard';
  });

  // Invoiced details viewing lightbox
  const [viewingInvoice, setViewingInvoice] = useState<Invoice | null>(null);

  // Simulation controls state (seat adjust slider input)
  const [simulatedSeats, setSimulatedSeats] = useState<number>(26);

  // Payment checkout overlay options
  const [showCheckoutModal, setShowCheckoutModal] = useState<boolean>(false);
  const [checkoutTargetInvoice, setCheckoutTargetInvoice] = useState<Invoice | null>(null);
  const [checkoutProcessor, setCheckoutProcessor] = useState<'STRIPE' | 'RAZORPAY'>('STRIPE');
  const [checkoutCardNumber, setCheckoutCardNumber] = useState('4242 4242 4242 4242');
  const [checkoutCardExpiry, setCheckoutCardExpiry] = useState('12/29');
  const [checkoutCardCVC, setCheckoutCardCVC] = useState('981');
  const [isProcessingCheckout, setIsProcessingCheckout] = useState(false);

  // Invitation members mock list
  const [organizationSeatsMembers, setOrganizationSeatsMembers] = useState(() => [
    { email: 'david.sanchez@saasify.io', name: 'David Sanchez', status: 'ACTIVE', joined: '2025-01-15' },
    { email: 'irene.mendoza@saasify.io', name: 'Irene Mendoza', status: 'ACTIVE', joined: '2025-01-20' },
    { email: 'alex.chen@saasify.io', name: 'Alex Chen', status: 'ACTIVE', joined: '2025-02-11' },
    { email: 'sarah.koren@saasify.io', name: 'Sarah Koren', status: 'ACTIVE', joined: '2025-03-01' },
    { email: 'tim.specter@saasify.io', name: 'Tim Specter', status: 'ACTIVE', joined: '2025-05-18' },
    { email: 'ross.geller@saasify.io', name: 'Ross Geller', status: 'PENDING', joined: '2026-06-21' },
  ]);

  const [newMemberEmail, setNewMemberEmail] = useState('');
  const [newMemberName, setNewMemberName] = useState('');
  const [showInviteFeedback, setShowInviteFeedback] = useState(false);

  // Push notifications array
  const [notifications, setNotifications] = useState<string[]>([
    'Renewal Successful: SaaSify Inc successfully collected invoice INV-2026-001.',
    'Usage Alert: Organization "Acme Logistics" exceeded baseline compute. 412 GB storage used.',
    'System Alert: Tax rate parameters modified to modern 18% standard.'
  ]);

  // Sync state to LocalStorage
  useEffect(() => {
    localStorage.setItem('saas_billing_active_role', role);
    localStorage.setItem('saas_billing_active_tenant', selectedTenantId);
    localStorage.setItem('saas_billing_subs', JSON.stringify(subscriptions));
    localStorage.setItem('saas_billing_invoices', JSON.stringify(invoices));
    localStorage.setItem('saas_billing_logs', JSON.stringify(logs));
    localStorage.setItem('saas_billing_active_tab', currentTab);
  }, [role, selectedTenantId, subscriptions, invoices, logs, currentTab]);

  // Adjust tenant selection automatically based on selected role preset
  useEffect(() => {
    const preset = USER_PRESETS.find(p => p.role === role);
    if (preset && preset.tenantId !== 'GLOBAL') {
      setSelectedTenantId(preset.tenantId);
    } else if (role === 'SUPER_ADMIN') {
      setSelectedTenantId('GLOBAL');
    }
  }, [role]);

  // Sync simulated seats slider with actual subscription object
  const activeTenant = TENANTS.find(t => t.id === (selectedTenantId === 'GLOBAL' ? 'tenant-1' : selectedTenantId));
  const activeSubscription = subscriptions.find(s => s.tenantId === (selectedTenantId === 'GLOBAL' ? 'tenant-1' : selectedTenantId));
  const activePlan = SUBSCRIPTION_PLANS.find(p => p.id === activeSubscription?.planId);

  useEffect(() => {
    if (activeSubscription) {
      setSimulatedSeats(activeSubscription.seats);
    }
  }, [selectedTenantId]);

  // Helper: append new audit log entries dynamically
  const appendLog = (
    category: 'AUTH' | 'SUBSCRIPTION' | 'PAYMENT' | 'MEMBERS' | 'SETTINGS' | 'SYSTEM',
    status: 'SUCCESS' | 'FAILURE',
    action: string,
    details: string
  ) => {
    const activePreset = USER_PRESETS.find(p => p.role === role);
    const newLogItem: AuditLog = {
      id: `log-${Date.now()}`,
      timestamp: new Date().toISOString().replace('T', ' ').substring(0, 19),
      actorEmail: activePreset ? activePreset.email : 'system-agent@saasify.io',
      actorRole: role,
      tenantId: selectedTenantId,
      ipAddress: '198.51.100.22',
      action,
      category,
      status,
      details,
    };
    setLogs((prev) => [newLogItem, ...prev]);

    // Push dynamic toast/push notifications
    setNotifications(prev => [`Event Registered: [${action}] - ${details.substring(0, 50)}...`, ...prev]);
  };

  // Helper to trigger custom simulated backend actions (passed to AuditLogger)
  const triggerSimulatedAction = (
    category: 'AUTH' | 'SUBSCRIPTION' | 'PAYMENT' | 'MEMBERS' | 'SYSTEM',
    status: 'SUCCESS' | 'FAILURE',
    action: string,
    details: string
  ) => {
    appendLog(category, status, action, details);
  };

  // --- Seat management adjustments ---
  const handleUpdateSeats = (newSeatsVal: number) => {
    if (!activeSubscription || !activePlan) return;
    if (!hasPermission(role, 'UPGRADE_SUBSCRIPTION')) {
      alert("Permission Denied: Only Organization Admins or Super Admins can alter license quotas.");
      return;
    }

    const priceDifference = (newSeatsVal - activeSubscription.seats) * activePlan.pricePerSeat;
    let detailsMsg = `Adjusted seat license count from ${activeSubscription.seats} to ${newSeatsVal}.`;

    if (priceDifference > 0) {
      // Trigger a prorated invoice for the difference
      const prorationSubtotal = priceDifference;
      const prorationTax = Number((prorationSubtotal * 0.18).toFixed(2));
      const prorationGrandTotal = prorationSubtotal + prorationTax;

      const newInvId = `INV-${Date.now().toString().slice(-4)}`;
      const newProrationInvoice: Invoice = {
        id: newInvId,
        tenantId: activeSubscription.tenantId,
        subscriptionId: activeSubscription.id,
        issueDate: new Date().toISOString().substring(0, 10),
        dueDate: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000).toISOString().substring(0, 10),
        subtotal: prorationSubtotal,
        tax: prorationTax,
        taxRate: 0.18,
        amount: prorationGrandTotal,
        status: 'OUTSTANDING',
        paymentMethod: 'Stripe Corporate Line',
        billingCycle: activeSubscription.billingCycle,
        billingReason: `Seat Quota Addition (Prorated addition count: ${newSeatsVal - activeSubscription.seats})`,
        lineItems: [
          {
            id: `li-${Date.now()}`,
            desc: `Prorated Additional Seat Tier Licenses (${newSeatsVal - activeSubscription.seats} seats remaining)`,
            qty: newSeatsVal - activeSubscription.seats,
            unitPrice: activePlan.pricePerSeat,
            total: prorationSubtotal,
          }
        ]
      };

      setInvoices((prev) => [newProrationInvoice, ...prev]);
      detailsMsg += ` Generated outstanding prorated billing sheet ${newInvId} for ${prorationGrandTotal.toFixed(2)} USD.`;
    }

    setSubscriptions((prev) =>
      prev.map((sub) => {
        if (sub.id === activeSubscription.id) {
          return { ...sub, seats: newSeatsVal };
        }
        return sub;
      })
    );

    appendLog('SUBSCRIPTION', 'SUCCESS', 'SUBSCRIPTION_SEATS_UPGRADE', detailsMsg);
  };

  // --- Billing Plan Tier Downgrades & Upgrades ---
  const handleUpgradePlan = (planId: string) => {
    if (!activeSubscription) return;
    if (!hasPermission(role, 'UPGRADE_SUBSCRIPTION')) {
      alert("Permission Denied: Your assigned role lacks permissions to change subscriptions plans.");
      return;
    }

    const oldPlan = SUBSCRIPTION_PLANS.find(p => p.id === activeSubscription.planId);
    const newPlan = SUBSCRIPTION_PLANS.find(p => p.id === planId);

    if (!oldPlan || !newPlan) return;

    setSubscriptions((prev) =>
      prev.map((sub) => {
        if (sub.id === activeSubscription.id) {
          return { ...sub, planId: planId };
        }
        return sub;
      })
    );

    appendLog(
      'SUBSCRIPTION',
      'SUCCESS',
      'SUBSCRIPTION_PLAN_MUTATION',
      `Shifted sub billing tier from ${oldPlan.name} to ${newPlan.name}. Recalculating base monthly renewals to $${newPlan.basePrice}/mo.`
    );
  };

  // --- Toggle Subscription Addon features (API, SLA, DB) ---
  const handleToggleAddon = (addonType: 'dbAddon' | 'slaAddon' | 'apiAddon') => {
    if (!activeSubscription) return;
    if (!hasPermission(role, 'UPGRADE_SUBSCRIPTION')) {
      alert("Permission Denied: Your assigned role is restricted from editing addon bundles.");
      return;
    }

    const currentAddonState = activeSubscription[addonType];
    setSubscriptions((prev) =>
      prev.map((sub) => {
        if (sub.id === activeSubscription.id) {
          return { ...sub, [addonType]: !currentAddonState };
        }
        return sub;
      })
    );

    appendLog(
      'SUBSCRIPTION',
      'SUCCESS',
      'SUBSCRIPTION_ADDON_MUTATION',
      `Toggled feature addon item "${addonType}" to ${!currentAddonState ? 'ENABLEDED' : 'DISABLED'}.`
    );
  };

  // --- Payment Processing Checkout Modal trigger ---
  const handlePayNowInitiate = (invoice: Invoice) => {
    if (!hasPermission(role, 'MANAGE_PAYMENTS')) {
      alert("Permission Denied: Your role (Team Member) cannot process financial checkouts.");
      return;
    }
    setCheckoutTargetInvoice(invoice);
    setShowCheckoutModal(true);
  };

  const handleExecuteCheckoutReceipt = () => {
    if (!checkoutTargetInvoice) return;
    setIsProcessingCheckout(true);

    // Simulate high-speed gateway handshakes
    setTimeout(() => {
      setInvoices((prev) =>
        prev.map((inv) => {
          if (inv.id === checkoutTargetInvoice.id) {
            return {
              ...inv,
              status: 'PAID',
              paymentMethod: checkoutProcessor === 'STRIPE' 
                ? `Stripe Card Network (•••• ${checkoutCardNumber.slice(-4)})` 
                : 'Razorpay Direct NetBanking Secure API',
            };
          }
          return inv;
        })
      );

      appendLog(
        'PAYMENT',
        'SUCCESS',
        'INVOICE_BILLING_SETTLEMENT',
        `Successfully settled transaction code ${checkoutTargetInvoice.id} (${checkoutProcessor}) of amount $${checkoutTargetInvoice.amount}.`
      );

      setIsProcessingCheckout(false);
      setShowCheckoutModal(false);
      setCheckoutTargetInvoice(null);
    }, 1800);
  };

  // --- Member invites simulation ---
  const handleInviteEmailSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMemberEmail || !newMemberName) return;
    if (!hasPermission(role, 'MANAGE_MEMBERS')) {
      alert("Permission Denied: You lack permissions to add seats members.");
      return;
    }

    // Check if seats exceed limits
    if (activeSubscription && organizationSeatsMembers.length >= activeSubscription.seats) {
      alert("Seat Allocation Bound Exceeded: Try sliding the seat slider right first to upgrade org capacity.");
      return;
    }

    const newInvite = {
      email: newMemberEmail,
      name: newMemberName,
      status: 'PENDING',
      joined: new Date().toISOString().substring(0, 10),
    };

    setOrganizationSeatsMembers(prev => [...prev, newInvite]);
    appendLog(
      'MEMBERS',
      'SUCCESS',
      'TEAM_MEMBER_INVITATION',
      `Issued pending workspace invites email to ${newMemberEmail} under current organization.`
    );

    setNewMemberEmail('');
    setNewMemberName('');
    setShowInviteFeedback(true);
    setTimeout(() => setShowInviteFeedback(false), 3000);
  };

  // --- Global Telemetry modifications ---
  const handleAdjustTelemetryUsage = (type: 'usageApiCount' | 'usageCpuHours' | 'usageStorageGB', value: number) => {
    if (!activeSubscription) return;
    setSubscriptions((prev) =>
      prev.map((sub) => {
        if (sub.id === activeSubscription.id) {
          return { ...sub, [type]: value };
        }
        return sub;
      })
    );
  };

  // Clear single notifications
  const handleClearNotification = (idx: number) => {
    setNotifications(prev => prev.filter((_, i) => i !== idx));
  };

  // Get current active user email metadata representation based on role preset
  const activeUserPreset = USER_PRESETS.find(p => p.role === role) || USER_PRESETS[0];

  return (
    <div className="bg-slate-950 text-slate-105 min-h-screen font-sans antialiased selection:bg-indigo-500/30 flex flex-col">
      
      {/* SECTION 1: SYSTEM CONTROLLERS DRAWER (Roles / Tenants Switching) */}
      <div className="bg-slate-900 text-slate-100 border-b border-slate-800 py-3.5 px-6 sticky top-0 z-40 shadow-md">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          
          {/* Logo & Platform Name */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-600 flex items-center justify-center font-extrabold text-white text-base tracking-wider shadow-lg shadow-indigo-500/20">
              S
            </div>
            <div>
              <div className="flex items-center gap-1.5 line-clamp-1">
                <span className="text-sm font-extrabold tracking-tight text-white block">Equinox B2B SaaS Gateway</span>
                <span className="text-[10px] bg-indigo-950/60 text-indigo-300 font-extrabold px-1.5 py-0.5 rounded uppercase">Enterprise v2.4</span>
              </div>
              <p className="text-[11px] text-slate-400 mt-0.5 font-medium">Role-Based Core Billing & Subscription Hub</p>
            </div>
          </div>

          {/* Quick-Preset Sandbox switch selectors */}
          <div className="flex flex-wrap items-center gap-3.5 bg-slate-950/80 p-2.5 rounded-xl border border-slate-800/80">
            <div className="flex items-center gap-1.5 shrink-0">
              <span className="inline-block w-2 h-2 rounded-full bg-emerald-550 animate-pulse" />
              <label className="text-[11px] uppercase tracking-wider font-extrabold text-slate-405">Sandbox Switcher:</label>
            </div>

            {/* Role switchers dropdown */}
            <div className="flex items-center gap-1">
              <span className="text-xs text-slate-400 font-medium">Role:</span>
              <select
                value={role}
                onChange={(e) => setRole(e.target.value as Role)}
                className="bg-slate-900 border border-slate-800 text-xs text-white font-semibold rounded-lg px-2.5 py-1.5 focus:outline-hidden focus:ring-1 focus:ring-indigo-550"
              >
                <option value="SUPER_ADMIN">⚙ Super Admin (Root Platform)</option>
                <option value="ORG_ADMIN">✦ Organization Admin (Tenant)</option>
                <option value="FINANCE_MANAGER">💼 Finance Manager (Fiscal)</option>
                <option value="TEAM_MEMBER">👤 Team Member (Read-Only/Request)</option>
              </select>
            </div>

            {/* Tenant switcher dropdown */}
            <div className="flex items-center gap-1">
              <span className="text-xs text-slate-400 font-medium font-sans">Org Tenant:</span>
              <select
                value={selectedTenantId}
                disabled={role !== 'SUPER_ADMIN'}
                onChange={(e) => setSelectedTenantId(e.target.value)}
                className="bg-slate-900 border border-slate-800 text-xs text-white font-semibold rounded-lg px-2.5 py-1.5 focus:outline-hidden focus:ring-1 focus:ring-indigo-550 disabled:opacity-70 disabled:cursor-not-allowed"
              >
                {role === 'SUPER_ADMIN' ? (
                  <>
                    <option value="GLOBAL">🌐 GLOBAL - All Organizations</option>
                    {TENANTS.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
                  </>
                ) : (
                  <option value={selectedTenantId}>
                    🏢 {TENANTS.find(t => t.id === selectedTenantId)?.name || 'Tenant Platform'}
                  </option>
                )}
              </select>
            </div>
            
            {/* Quick reset actions to restore factory mockData */}
            <button 
              onClick={() => {
                localStorage.clear();
                window.location.reload();
              }}
              title="Factory reset cached state data"
              className="p-1 px-2.5 bg-slate-800 text-slate-300 rounded hover:bg-slate-700 transition cursor-pointer text-xs font-semibold flex items-center gap-1"
            >
              <RefreshCw size={12} />
              Reset
            </button>
          </div>

        </div>
      </div>

      {/* SECTION 2: TOP NOTIFICATIONS BANNER & USER PRESETS DESCRIPTOR */}
      <div className="max-w-7xl mx-auto w-full px-6 py-4 grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Profile Card Header */}
        <div className="lg:col-span-2 bg-slate-900 border border-slate-800 rounded-2xl p-5 flex flex-col sm:flex-row items-center justify-between gap-5 shadow-lg">
          <div className="flex items-center gap-4.5">
            <div className="w-12 h-12 bg-indigo-600 rounded-full flex items-center justify-center text-white text-base font-extrabold shadow-md">
              {activeUserPreset.avatar}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="font-extrabold text-white text-lg">{activeUserPreset.name}</h2>
                <RoleBadge role={role} showIcon={true} />
              </div>
              <p className="text-xs text-slate-400 mt-1 font-mono">{activeUserPreset.email} • Connected IP: 198.51.100.22</p>
              {role === 'SUPER_ADMIN' ? (
                <p className="text-[11px] text-indigo-400 font-bold mt-1 inline-flex items-center gap-1 bg-indigo-550/10 border border-indigo-505/20 px-2 py-0.5 rounded-full">
                  🛡 Absolute master governance overrides enabled
                </p>
              ) : (
                <p className="text-[11px] text-slate-400 mt-1">
                  Tenant: <span className="font-semibold text-slate-200 font-sans">{TENANTS.find(t => t.id === selectedTenantId)?.name}</span> 
                  • Sector: {TENANTS.find(t => t.id === selectedTenantId)?.industry}
                </p>
              )}
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse shrink-0" />
            <span className="text-xs font-bold text-emerald-400 bg-emerald-550/10 border border-emerald-505/20 px-3 py-1.5 rounded-xl">
              ACTIVE SESSION SECURED (MFA Verified)
            </span>
          </div>
        </div>

        {/* Dynamic Warning Alerts & Webhooks Notification Center */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 flex flex-col justify-between shadow-lg relative overflow-hidden">
          <div className="flex items-center justify-between border-b border-slate-800 pb-2 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-450 flex items-center gap-1">
              <Bell size={14} className="text-amber-400 animate-bounce" />
              Platform Alerts Hub ({notifications.length})
            </span>
            {notifications.length > 0 && (
              <button 
                onClick={() => setNotifications([])}
                className="text-[10px] text-slate-400 hover:text-white font-bold cursor-pointer"
              >
                Clear All
              </button>
            )}
          </div>
          
          <div className="space-y-2 max-h-24 overflow-y-auto pr-1">
            {notifications.length === 0 ? (
              <p className="text-xs text-slate-500 italic text-center py-4">No active warnings or billing triggers pending</p>
            ) : (
              notifications.map((notif, idx) => (
                <div key={idx} className="flex justify-between items-start gap-1 bg-slate-950 border border-slate-850 p-2 rounded-lg relative group">
                  <p className="text-[11px] line-clamp-2 leading-relaxed text-slate-300 font-medium">
                    {notif}
                  </p>
                  <button 
                    onClick={() => handleClearNotification(idx)}
                    className="text-slate-400 hover:text-white cursor-pointer p-0.5 rounded font-bold"
                  >
                    <X size={10} />
                  </button>
                </div>
              ))
            )}
          </div>
        </div>

      </div>

      {/* SECTION 3: TAB SELECTOR TRAY */}
      <div className="max-w-7xl mx-auto w-full px-6 mb-7">
        <div className="flex border-b border-slate-800 overflow-x-auto gap-2">
          {[
            { id: 'dashboard', label: 'Overview Dashboard', icon: Layers },
            { id: 'subscriptions', label: 'Plan & Licenses', icon: CreditCard },
            { id: 'invoices', label: 'Invoices & Payments', icon: Briefcase },
            { id: 'usage', label: 'Usage Metering', icon: RefreshCw },
            { id: 'logs', label: 'SOC-2 Audit Trail', icon: ShieldCheck },
            { id: 'schema', label: 'DB Schema & Rest Specifications', icon: Settings },
          ].map((tab) => {
            const Icon = tab.icon;
            const active = currentTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setCurrentTab(tab.id as any)}
                className={`py-3 px-4.5 font-semibold text-xs border-b-2 transition whitespace-nowrap flex items-center gap-2 cursor-pointer ${
                  active 
                    ? 'border-indigo-550 text-indigo-400 bg-slate-900/40' 
                    : 'border-transparent text-slate-400 hover:text-white hover:border-slate-700'
                }`}
              >
                <Icon size={14} />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* SECTION 4: PRIMARY VIEW SCREEN SWITCHER */}
      <main className="max-w-7xl mx-auto w-full px-6 flex-1 pb-16">
        
        {/* TAB 1: OVERVIEW DASHBOARD */}
        {currentTab === 'dashboard' && (
          <div className="space-y-6">
            
            {/* KPI metric grids */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-5">
              
              <MetricCard 
                title="Active SaaS Tier" 
                value={activePlan?.name || 'Starter Tier'} 
                subtext={`Base rate: $${activePlan?.basePrice || 0}/${activeSubscription?.billingCycle.toLowerCase()}`}
                icon={Layers}
                iconBg="bg-violet-50"
                iconColor="text-violet-600"
              />

              <MetricCard 
                title="Total Seat Quota" 
                value={`${activeSubscription?.seats || 0} Licenses`} 
                subtext={`Active count: ${organizationSeatsMembers.length} provisioned`}
                icon={Users}
                iconBg="bg-sky-50"
                iconColor="text-sky-600"
                trend={{ value: '14.2%', isPositive: true }}
              />

              <MetricCard 
                title="Total Outstanding" 
                value={`$${invoices.filter(i => (selectedTenantId === 'GLOBAL' || i.tenantId === selectedTenantId) && i.status === 'OUTSTANDING').reduce((acc, curr) => acc + curr.amount, 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
                subtext={`${invoices.filter(i => (selectedTenantId === 'GLOBAL' || i.tenantId === selectedTenantId) && i.status === 'OUTSTANDING').length} invoices pending payment`}
                icon={DollarSign}
                iconBg="bg-rose-50"
                iconColor="text-rose-600"
              />

              <MetricCard 
                title="Next Billing Cycle" 
                value={activeSubscription?.nextRenewal || '2026-07-15'} 
                subtext="Automatic renew collection queued"
                icon={Calendar}
                iconBg="bg-amber-50"
                iconColor="text-amber-600"
              />

            </div>

            {/* Dashboard Visual Charts & Segment Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              
              {/* Financial graph */}
              <div className="lg:col-span-2">
                <FinancialTrendChart />
              </div>

              {/* Multi-tenant seats representation matrix */}
              <div>
                <SeatMultiTenantChart />
              </div>

            </div>

            {/* Invoices Alert notifications if outstanding exist */}
            {invoices.some(i => (selectedTenantId === 'GLOBAL' || i.tenantId === selectedTenantId) && i.status === 'OUTSTANDING') && (
              <div className="bg-rose-500/10 border border-rose-500/20 p-5 rounded-2xl flex flex-col sm:flex-row justify-between items-center gap-4">
                <div className="flex gap-3 items-start">
                  <div className="p-2 bg-rose-500/20 rounded-lg text-rose-400 shrink-0">
                    <AlertTriangle size={18} />
                  </div>
                  <div>
                    <h5 className="font-bold text-white text-sm">Action Required: Outstanding Corporate Balance Detected</h5>
                    <p className="text-xs text-rose-300 mt-1">
                      You have unpaid seat expansion adjustments or monthly renewals. Pay via credit card simulator key safely to prevent API threshold limits.
                    </p>
                  </div>
                </div>
                <button 
                  onClick={() => setCurrentTab('invoices')}
                  className="px-4.5 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-lg text-xs font-bold shadow-xs transition cursor-pointer"
                >
                  Pay Outstanding Now
                </button>
              </div>
            )}

            {/* Recent activity logging list preview */}
            <div className="bg-slate-900 border border-slate-800 rounded-2xl shadow-lg p-6">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3 mb-4">
                <div>
                  <h4 className="text-sm font-bold text-white">Dynamic Activity Ingestion Preview</h4>
                  <p className="text-xs text-slate-400 mt-0.5">High velocity audit trail frames captured across active namespaces</p>
                </div>
                <button 
                  onClick={() => setCurrentTab('logs')}
                  className="text-xs text-indigo-400 hover:text-indigo-300 font-bold flex items-center gap-1 cursor-pointer"
                >
                  Jump to Audit Sandbox &rarr;
                </button>
              </div>

              <div className="space-y-3">
                {logs.slice(0, 4).map((log) => (
                  <div key={log.id} className="flex justify-between items-start border-l-2 border-indigo-500 pl-4 py-1 text-xs">
                    <div>
                      <span className="font-semibold text-slate-200 inline-block mr-2">{log.action}</span>
                      <span className="text-[10px] uppercase font-bold text-slate-400 bg-slate-950 px-1.5 py-0.5 rounded border border-slate-800">{log.category}</span>
                      <p className="text-slate-400 mt-1">{log.details}</p>
                    </div>
                    <div className="text-right shrink-0">
                      <span className="font-mono text-[10px] text-slate-400 block">{log.timestamp}</span>
                      <span className="text-slate-400 font-medium block mt-0.5 text-[10px]">{log.actorEmail}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

          </div>
        )}

        {/* TAB 2: PLANS & SEATS MANAGEMENT */}
        {currentTab === 'subscriptions' && (
          <div className="space-y-6">

            {/* Current Active Plan Overview summary */}
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 flex flex-col md:flex-row justify-between gap-6 shadow-md">
              <div>
                <span className="text-[10px] font-bold text-indigo-400 uppercase tracking-widest bg-indigo-500/10 border border-indigo-500/25 px-2.5 py-1 rounded">
                  Current Tier Target
                </span>
                <h3 className="text-xl font-bold font-sans text-white mt-3">{activePlan?.name}</h3>
                <p className="text-xs text-slate-400 max-w-lg mt-2 leading-relaxed">{activePlan?.description}</p>
                
                {activeSubscription && (
                  <div className="grid grid-cols-2 gap-4 mt-5 font-mono text-xs">
                    <div>
                      <span className="text-slate-400">STATUS:</span>
                      <span className="font-bold text-emerald-400 ml-1 bg-emerald-500/10 border border-emerald-500/20 px-1.5 py-0.5 rounded text-[10.5px]">
                        {activeSubscription.status}
                      </span>
                    </div>
                    <div>
                      <span className="text-slate-400">BILLING CYCLE:</span>
                      <span className="font-bold text-slate-300 ml-1">
                        {activeSubscription.billingCycle}
                      </span>
                    </div>
                  </div>
                )}
              </div>

              <div className="border-t md:border-t-0 md:border-l border-slate-800 pt-5 md:pt-0 md:pl-8 flex flex-col justify-between shrink-0">
                <div className="space-y-1">
                  <p className="text-xs text-slate-400 uppercase tracking-wider font-semibold">Total Invoice Run Cost</p>
                  <p className="text-3xl font-extrabold text-white font-sans">
                    ${((activePlan?.basePrice || 0) + (activeSubscription?.seats || 0) * (activePlan?.pricePerSeat || 0)).toFixed(2)}
                    <span className="text-xs text-slate-400 font-normal"> / {activeSubscription?.billingCycle.toLowerCase() === 'yearly' ? 'year' : 'month'}</span>
                  </p>
                  <p className="text-[10px] text-slate-400 leading-none">
                    Calculated from base ${activePlan?.basePrice} + {activeSubscription?.seats} seats x ${activePlan?.pricePerSeat}
                  </p>
                </div>

                <div className="pt-4 flex gap-2">
                  <button 
                    disabled={activeSubscription?.status === 'CANCELLED'}
                    onClick={() => {
                      if (!activeSubscription) return;
                      setSubscriptions(prev => prev.map(s => s.id === activeSubscription.id ? { ...s, status: 'CANCELLED' } : s));
                      appendLog('SUBSCRIPTION', 'SUCCESS', 'SUBSCRIPTION_CANCELLATION_QUEUE', 'Queued subscription end-of-period cancellation.');
                    }}
                    className="p-2 border border-slate-700 text-xs font-semibold hover:border-rose-400 text-slate-400 hover:text-rose-450 hover:bg-rose-500/10 rounded-lg cursor-pointer max-w-max transition"
                  >
                    {activeSubscription?.status === 'CANCELLED' ? 'Subscription is Cancelled' : 'Cancel Subscription'}
                  </button>
                  <button 
                    onClick={() => {
                      if (!activeSubscription) return;
                      setSubscriptions(prev => prev.map(s => s.id === activeSubscription.id ? { ...s, status: 'ACTIVE' } : s));
                      appendLog('SUBSCRIPTION', 'SUCCESS', 'SUBSCRIPTION_REACTIVATION', 'Renewed subscription active status loop successfully.');
                    }}
                    className="p-2 bg-indigo-600 flex items-center gap-1 text-white text-xs font-bold rounded-lg cursor-pointer hover:bg-indigo-700 transition"
                  >
                    Reactivate
                  </button>
                </div>
              </div>
            </div>

            {/* Dynamic Seats Adjust Slider Console */}
            <div className="bg-slate-900 text-white rounded-2xl p-6 border border-slate-850 shadow-lg">
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                  <h4 className="text-sm font-bold text-violet-300 uppercase tracking-widest flex items-center gap-1.5">
                    <Users size={16} />
                    <span>Seat Allocations Adjuster & Prorations Checker</span>
                  </h4>
                  <p className="text-xs text-slate-400 mt-1 max-w-xl">
                    Slide to simulate seats growth dynamically. Increasing seats quota will automatically trigger a prorated invoice for the remainder of the current month.
                  </p>
                </div>
                <div className="text-right shrink-0">
                  <span className="text-2xl font-mono font-bold text-white pr-1">
                    {simulatedSeats} 
                  </span>
                  <span className="text-xs text-slate-400">Seats Enabled</span>
                </div>
              </div>

              {/* Slider track line */}
              <div className="mt-6 flex items-center gap-4">
                <button 
                  onClick={() => {
                    const nextVal = Math.max(5, simulatedSeats - 1);
                    setSimulatedSeats(nextVal);
                    handleUpdateSeats(nextVal);
                  }}
                  className="bg-slate-800 hover:bg-slate-700 p-2 text-white font-bold rounded-lg cursor-pointer"
                >
                  <Minus size={14} />
                </button>
                
                <input 
                  type="range"
                  min="5"
                  max="150"
                  value={simulatedSeats}
                  onChange={(e) => setSimulatedSeats(Number(e.target.value))}
                  onMouseUp={() => handleUpdateSeats(simulatedSeats)}
                  onTouchEnd={() => handleUpdateSeats(simulatedSeats)}
                  className="flex-1 accent-violet-500 h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer"
                />

                <button 
                  onClick={() => {
                    const nextVal = Math.min(150, simulatedSeats + 1);
                    setSimulatedSeats(nextVal);
                    handleUpdateSeats(nextVal);
                  }}
                  className="bg-slate-800 hover:bg-slate-700 p-2 text-white font-bold rounded-lg cursor-pointer"
                >
                  <Plus size={14} />
                </button>
              </div>

              <div className="flex items-center justify-between mt-4.5 pt-4 border-t border-slate-800 text-[11px] text-slate-400">
                <span>Calculated seat cost multiplier: <strong className="text-slate-300 font-mono">${activePlan?.pricePerSeat} x {simulatedSeats} seats = ${simulatedSeats * (activePlan?.pricePerSeat || 12)} /mo</strong></span>
                <span className="text-slate-400 italic">Prorations are processed according to SOC-2 alignment schedules</span>
              </div>
            </div>

            {/* Upgrade/Downgrade plans section grids */}
            <div className="space-y-4">
              <h4 className="text-sm font-bold text-slate-200">Alternative Subscription Pricing Tiers</h4>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                {SUBSCRIPTION_PLANS.map((plan) => {
                  const isCurrent = activeSubscription?.planId === plan.id;
                  return (
                    <div 
                      key={plan.id}
                      className={`bg-slate-900 border rounded-2xl p-6 flex flex-col justify-between hover:shadow-lg transition-all duration-300 relative overflow-hidden ${
                        isCurrent ? 'border-indigo-500 ring-2 ring-indigo-950' : 'border-slate-800'
                      }`}
                    >
                      {isCurrent && (
                        <div className="absolute top-3 right-3 bg-indigo-600 text-white font-extrabold text-[9px] px-2 py-0.5 rounded uppercase">
                          Active Tier
                        </div>
                      )}

                      <div className="space-y-4">
                        <div>
                          <span className="text-[10px] font-bold tracking-wider text-slate-500 uppercase">Package</span>
                          <h4 className="text-base font-bold text-white mt-1">{plan.name}</h4>
                        </div>

                        <p className="text-xs text-slate-400 line-clamp-2 min-h-[32px]">{plan.description}</p>

                        <div className="pt-2 border-t border-slate-800">
                          <p className="text-xs text-slate-450 uppercase tracking-wider font-semibold">Pricing Rates</p>
                          <p className="text-2xl font-extrabold text-white mt-1">
                            ${plan.basePrice}
                            <span className="text-xs text-slate-400 font-medium"> / mo base</span>
                          </p>
                          <p className="text-xs text-slate-400 font-mono mt-0.5">
                            + ${plan.pricePerSeat} / active seats license
                          </p>
                        </div>
                        
                        {/* Features bullets */}
                        <div className="space-y-2 pt-2">
                          <p className="text-xs font-bold text-slate-300">Included Features:</p>
                          <ul className="space-y-1">
                            {plan.features.slice(0, 4).map((f, i) => (
                              <li key={i} className="text-xs text-slate-400 flex items-center gap-1.5 leading-relaxed">
                                <Check size={12} className="text-emerald-450 shrink-0" />
                                <span className="truncate">{f}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      </div>

                      {/* Upgrade action buttons */}
                      <button
                        onClick={() => handleUpgradePlan(plan.id)}
                        disabled={isCurrent || !hasPermission(role, 'UPGRADE_SUBSCRIPTION')}
                        className={`w-full text-center py-2 rounded-lg text-xs font-bold transition mt-6 cursor-pointer ${
                          isCurrent 
                            ? 'bg-slate-800 text-slate-505 cursor-default'
                            : 'bg-indigo-600 hover:bg-indigo-700 text-white shadow-md'
                        }`}
                      >
                        {isCurrent ? 'Currently Connected' : `Upgrade to ${plan.name}`}
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Addons toggle panels */}
            <div className="space-y-4">
              <h4 className="text-sm font-bold text-slate-200">Operational Addon Powerups</h4>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                
                {/* Addon 1: Dedicate Database */}
                <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 flex flex-col justify-between shadow-lg">
                  <div className="space-y-2">
                    <div className="flex justify-between items-start">
                      <h5 className="font-bold text-white text-sm">Relational Cloud PostgreSQL Addon</h5>
                      <span className="text-xs font-bold bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 px-2 py-0.5 rounded font-mono">$200.00 / mo</span>
                    </div>
                    <p className="text-xs text-slate-400">
                      Provision a near-instant, isolated Cloud SQL instance to store corporate ledger databases safely. Scale as telemetry expands.
                    </p>
                  </div>
                  <button
                    onClick={() => handleToggleAddon('dbAddon')}
                    className={`w-full py-1.5 mt-5 rounded-lg text-xs font-bold border transition cursor-pointer ${
                      activeSubscription?.dbAddon 
                        ? 'bg-emerald-600 text-white border-emerald-600 hover:bg-emerald-700' 
                        : 'bg-slate-800 text-slate-350 border-slate-700 hover:bg-slate-750'
                    }`}
                  >
                    {activeSubscription?.dbAddon ? '✔ Enabled Addon' : 'Add to Subscription'}
                  </button>
                </div>

                {/* Addon 2: Premium 1h SLA Support */}
                <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 flex flex-col justify-between shadow-lg">
                  <div className="space-y-2">
                    <div className="flex justify-between items-start">
                      <h5 className="font-bold text-white text-sm">Emergency Support 1-Hour SLA</h5>
                      <span className="text-xs font-bold bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 px-2 py-0.5 rounded font-mono">$400.00 / mo</span>
                    </div>
                    <p className="text-xs text-slate-400">
                      Unlocks around-the-clock priority incident triage with physical accounts representatives and real-time engineering slack channels.
                    </p>
                  </div>
                  <button
                    onClick={() => handleToggleAddon('slaAddon')}
                    className={`w-full py-1.5 mt-5 rounded-lg text-xs font-bold border transition cursor-pointer ${
                      activeSubscription?.slaAddon 
                        ? 'bg-emerald-600 text-white border-emerald-600 hover:bg-emerald-700' 
                        : 'bg-slate-800 text-slate-350 border-slate-700 hover:bg-slate-750'
                    }`}
                  >
                    {activeSubscription?.slaAddon ? '✔ Enabled Addon' : 'Add to Subscription'}
                  </button>
                </div>

                {/* Addon 3: Unlimited API powerup */}
                <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 flex flex-col justify-between shadow-lg">
                  <div className="space-y-2">
                    <div className="flex justify-between items-start">
                      <h5 className="font-bold text-white text-sm">API Meter Expansion Boost</h5>
                      <span className="text-xs font-bold bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 px-2 py-0.5 rounded font-mono">$150.00 / mo</span>
                    </div>
                    <p className="text-xs text-slate-400">
                      Unlocks unlimited API request capabilities. Automatically reduces billing scales from $0.01 per call block down to $0.002.
                    </p>
                  </div>
                  <button
                    onClick={() => handleToggleAddon('apiAddon')}
                    className={`w-full py-1.5 mt-5 rounded-lg text-xs font-bold border transition cursor-pointer ${
                      activeSubscription?.apiAddon 
                        ? 'bg-emerald-600 text-white border-emerald-600 hover:bg-emerald-700' 
                        : 'bg-slate-800 text-slate-350 border-slate-700 hover:bg-slate-750'
                    }`}
                  >
                    {activeSubscription?.apiAddon ? '✔ Enabled Addon' : 'Add to Subscription'}
                  </button>
                </div>

              </div>
            </div>

            {/* Simulated Org Members Lists */}
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-lg">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-slate-800 pb-4 mb-4">
                <div>
                  <h4 className="text-sm font-bold text-white">Seat Allocations & Invited Members</h4>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Currently utilizing {organizationSeatsMembers.length} of your allotted {activeSubscription?.seats} seat licenses
                  </p>
                </div>
                
                {/* Add member form popup inside screen */}
                <form onSubmit={handleInviteEmailSubmit} className="flex gap-2 w-full sm:w-auto">
                  <input 
                    type="text"
                    required
                    placeholder="Full Name"
                    value={newMemberName}
                    onChange={(e) => setNewMemberName(e.target.value)}
                    className="px-3 py-1.5 text-xs bg-slate-950 text-slate-200 border border-slate-800 rounded-lg focus:outline-hidden focus:ring-1 focus:ring-indigo-500"
                  />
                  <input 
                    type="email"
                    required
                    placeholder="teammember@domain.com"
                    value={newMemberEmail}
                    onChange={(e) => setNewMemberEmail(e.target.value)}
                    className="px-3 py-1.5 text-xs bg-slate-950 text-slate-200 border border-slate-800 rounded-lg focus:outline-hidden focus:ring-1 focus:ring-indigo-500"
                  />
                  <button
                    type="submit"
                    className="px-4 py-1.5 bg-indigo-600 text-white rounded-lg text-xs font-bold hover:bg-indigo-700 cursor-pointer transition shrink-0"
                  >
                    Invite Seat +
                  </button>
                </form>
              </div>

              {showInviteFeedback && (
                <div className="mb-4 text-xs font-semibold text-emerald-400 bg-emerald-500/10 p-2.5 rounded-lg border border-emerald-500/20">
                  🎉 Invitation successfully dispatched to member email ledger.
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                {organizationSeatsMembers.map((member, i) => (
                  <div key={i} className="p-3 bg-slate-950/60 border border-slate-800 rounded-xl space-y-1 relative">
                    <span className={`absolute top-3 right-3 text-[9px] font-extrabold px-1.5 py-0.5 rounded border ${
                      member.status === 'ACTIVE' 
                        ? 'bg-emerald-550/10 text-emerald-400 border-emerald-500/20' 
                        : 'bg-amber-550/10 text-amber-400 border-amber-500/20'
                    }`}>
                      {member.status}
                    </span>
                    <h5 className="font-bold text-sm text-slate-200 truncate">{member.name}</h5>
                    <p className="text-xs text-slate-400 truncate font-mono">{member.email}</p>
                    <p className="text-[10px] text-slate-500 mt-2 block">Joined system: {member.joined}</p>
                  </div>
                ))}
              </div>
            </div>

          </div>
        )}

        {/* TAB 3: INVOICES & PAYMENTS */}
        {currentTab === 'invoices' && (
          <div className="space-y-6">
            
            {/* Upper Summary stats for Finance Managers */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
              <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl shadow-md">
                <p className="text-xs uppercase font-extrabold text-slate-400 tracking-wider">Revenue Settled (Active Tenants)</p>
                <h4 className="text-2xl font-extrabold text-emerald-400 mt-1">
                  ${invoices.filter(i => (selectedTenantId === 'GLOBAL' || i.tenantId === selectedTenantId) && i.status === 'PAID').reduce((acc, curr) => acc + curr.amount, 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </h4>
                <p className="text-xs text-slate-500 mt-1">From {invoices.filter(i => (selectedTenantId === 'GLOBAL' || i.tenantId === selectedTenantId) && i.status === 'PAID').length} fully processed invoices</p>
              </div>

              <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl shadow-md">
                <p className="text-xs uppercase font-extrabold text-slate-400 tracking-wider font-sans">Outstanding Invoice Quota</p>
                <h4 className="text-2xl font-extrabold text-amber-400 mt-1">
                  ${invoices.filter(i => (selectedTenantId === 'GLOBAL' || i.tenantId === selectedTenantId) && i.status === 'OUTSTANDING').reduce((acc, curr) => acc + curr.amount, 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </h4>
                <p className="text-xs text-slate-500 mt-1">Associated with {invoices.filter(i => (selectedTenantId === 'GLOBAL' || i.tenantId === selectedTenantId) && i.status === 'OUTSTANDING').length} pending statements</p>
              </div>

              <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl shadow-md">
                <p className="text-xs uppercase font-extrabold text-slate-400 tracking-wider font-sans">Taxes Managed (Accrued 18%)</p>
                <h4 className="text-2xl font-extrabold text-indigo-400 mt-1">
                  ${invoices.filter(i => (selectedTenantId === 'GLOBAL' || i.tenantId === selectedTenantId)).reduce((acc, curr) => acc + curr.tax, 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </h4>
                <p className="text-xs text-slate-500 mt-1">Accrued automatically on proration cycles</p>
              </div>
            </div>

            {/* Core Invoices Master Table */}
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-lg">
              <div className="border-b border-slate-800 pb-4 mb-4 flex items-center justify-between">
                <div>
                  <h4 className="text-sm font-bold text-white">Legal Corporate Statements Index</h4>
                  <p className="text-xs text-slate-400 mt-0.5">Review, execute simulation checkouts, or download formatted TXT financial statements</p>
                </div>
              </div>

              <div className="border border-slate-800 rounded-xl overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-slate-950 border-b border-slate-800 text-slate-400 text-[10.5px] uppercase font-extrabold font-sans">
                      <th className="py-2.5 px-4">Invoice ID</th>
                      <th className="py-2.5 px-3">Organization Client</th>
                      <th className="py-2.5 px-3">Issue Date</th>
                      <th className="py-2.5 px-3 font-mono">Cycle</th>
                      <th className="py-2.5 px-3 font-sans">Billing Reason</th>
                      <th className="py-2.5 px-3 text-right">Grand Total</th>
                      <th className="py-2.5 px-3">Status</th>
                      <th className="py-2.5 px-3 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-850 text-xs text-slate-300">
                    {invoices
                      .filter(inv => selectedTenantId === 'GLOBAL' || inv.tenantId === selectedTenantId)
                      .map((inv) => {
                        const tenantName = TENANTS.find(t => t.id === inv.tenantId)?.name || 'N/A';
                        return (
                          <tr key={inv.id} className="hover:bg-slate-800/40">
                            <td className="py-3.5 px-4 font-mono font-bold text-white">{inv.id}</td>
                            <td className="py-3.5 px-3 font-semibold text-slate-200">{tenantName}</td>
                            <td className="py-3.5 px-3 text-slate-400">{inv.issueDate}</td>
                            <td className="py-3.5 px-3 font-mono uppercase text-[10.5px] font-bold text-slate-450">{inv.billingCycle}</td>
                            <td className="py-3.5 px-3 truncate max-w-[200px]" title={inv.billingReason}>{inv.billingReason}</td>
                            <td className="py-3.5 px-3 text-right font-mono font-bold text-white">${inv.amount.toFixed(2)}</td>
                            <td className="py-3.5 px-3">
                              <span className={`inline-flex px-2 py-0.5 rounded text-[10px] font-extrabold ${
                                inv.status === 'PAID' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' :
                                inv.status === 'OUTSTANDING' ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20' :
                                inv.status === 'OVERDUE' ? 'bg-rose-500/10 text-rose-400 border border-rose-500/20' :
                                'bg-indigo-500/10 text-indigo-400 border border-indigo-500/20'
                              }`}>
                                {inv.status}
                              </span>
                            </td>
                            <td className="py-3.5 px-3 text-right space-x-1 whitespace-nowrap">
                              
                              {/* Trigger direct credit simulation pay if OUTSTANDING/OVERDUE */}
                              {(inv.status === 'OUTSTANDING' || inv.status === 'OVERDUE') && (
                                <button
                                  onClick={() => handlePayNowInitiate(inv)}
                                  className="px-2.5 py-1 bg-indigo-600 hover:bg-indigo-700 text-white rounded text-[11px] font-bold cursor-pointer transition shadow-md"
                                >
                                  Pay Invoice
                                </button>
                              )}

                              {/* Super Admin Simulate Refund command */}
                              {inv.status === 'PAID' && role === 'SUPER_ADMIN' && (
                                <button
                                  onClick={() => {
                                    setInvoices(prev => prev.map(i => i.id === inv.id ? { ...i, status: 'REFUNDED', refundAmount: i.amount } : i));
                                    appendLog('PAYMENT', 'SUCCESS', 'PAYMENT_REFUND_DISPATCH', `Dispatched refund payload code ${inv.id} totaling $${inv.amount}.`);
                                  }}
                                  className="px-2.5 py-1 bg-amber-500/10 hover:bg-amber-500/20 text-amber-400 border border-amber-505/20 rounded text-[11px] font-bold cursor-pointer transition"
                                >
                                  Simulate Refund
                                </button>
                              )}

                              <button
                                onClick={() => setViewingInvoice(inv)}
                                className="px-2.5 py-1 bg-slate-800 border border-slate-705 hover:bg-slate-750 text-slate-200 rounded text-[11px] font-bold cursor-pointer transition"
                              >
                                Preview Statements
                              </button>
                            </td>
                          </tr>
                        );
                      })}
                  </tbody>
                </table>
              </div>
            </div>

          </div>
        )}

        {/* TAB 4: USAGE METERING & TELEMETRY */}
        {currentTab === 'usage' && (
          <div className="space-y-6">
            
            {/* Interactive User Slider Control panel to test the gauge */}
            <div className="bg-slate-900 text-white rounded-2xl p-6 border border-slate-850 shadow-lg">
              <h4 className="text-sm font-bold text-violet-300 uppercase tracking-widest flex items-center gap-1.5 mb-2">
                <Clock size={16} />
                <span>Infinite Live Telemetry Simulator Console</span>
              </h4>
              <p className="text-xs text-slate-400 mb-6 leading-relaxed">
                Adjust sliders to simulate client activity spikes. Observe how the circular gauges shift dynamically. If consumption hits 90% or more, a notification system trigger registers in the live alerts hub.
              </p>

              {activeSubscription ? (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  
                  {/* Slider 1: API */}
                  <div className="bg-slate-800/60 p-4.5 rounded-xl border border-slate-700/50 space-y-3.5">
                    <div className="flex justify-between items-center text-xs">
                      <span className="font-bold text-slate-300">Client API Requests</span>
                      <span className="font-mono font-bold text-violet-400">{activeSubscription.usageApiCount.toLocaleString()} calls</span>
                    </div>
                    <input 
                      type="range"
                      min="1000"
                      max="200000"
                      step="5000"
                      value={activeSubscription.usageApiCount}
                      onChange={(e) => {
                        const val = Number(e.target.value);
                        handleAdjustTelemetryUsage('usageApiCount', val);
                        if (val > 90000) {
                          appendLog('SYSTEM', 'SUCCESS', 'TELEMETRY_SPIKE', `High consumption API spike tracked. Current: ${val.toLocaleString()} requests.`);
                        }
                      }}
                      className="w-full accent-violet-500 h-1.5 bg-slate-700 rounded-lg appearance-none cursor-pointer"
                    />
                    <p className="text-[10px] text-slate-450">Limit baseline: 100,000 / mo included</p>
                  </div>

                  {/* Slider 2: CPU */}
                  <div className="bg-slate-800/60 p-4.5 rounded-xl border border-slate-700/50 space-y-3.5">
                    <div className="flex justify-between items-center text-xs">
                      <span className="font-bold text-slate-300">Cloud Compute CPU Hour Run</span>
                      <span className="font-mono font-bold text-teal-400">{activeSubscription.usageCpuHours.toLocaleString()} Hours</span>
                    </div>
                    <input 
                      type="range"
                      min="5"
                      max="1000"
                      step="10"
                      value={activeSubscription.usageCpuHours}
                      onChange={(e) => {
                        const val = Number(e.target.value);
                        handleAdjustTelemetryUsage('usageCpuHours', val);
                        if (val > 450) {
                          appendLog('SYSTEM', 'SUCCESS', 'CPU_SURGE', `Telemetry registered CPU Hour surge. Current: ${val} core-hours.`);
                        }
                      }}
                      className="w-full accent-teal-500 h-1.5 bg-slate-700 rounded-lg appearance-none cursor-pointer"
                    />
                    <p className="text-[10px] text-slate-450">Limit baseline: 500 Compute Hours included</p>
                  </div>

                  {/* Slider 3: Storage */}
                  <div className="bg-slate-800/60 p-4.5 rounded-xl border border-slate-700/50 space-y-3.5">
                    <div className="flex justify-between items-center text-xs">
                      <span className="font-bold text-slate-300">Relational Database Storage</span>
                      <span className="font-mono font-bold text-indigo-400">{activeSubscription.usageStorageGB.toLocaleString()} Gigabytes</span>
                    </div>
                    <input 
                      type="range"
                      min="2"
                      max="500"
                      step="5"
                      value={activeSubscription.usageStorageGB}
                      onChange={(e) => {
                        const val = Number(e.target.value);
                        handleAdjustTelemetryUsage('usageStorageGB', val);
                        if (val > 220) {
                          appendLog('SYSTEM', 'SUCCESS', 'STORAGE_CAPACITY_GROWTH', `Dynamic relational db capacity incremented to ${val} GB.`);
                        }
                      }}
                      className="w-full accent-indigo-500 h-1.5 bg-slate-700 rounded-lg appearance-none cursor-pointer"
                    />
                    <p className="text-[10px] text-slate-450">Limit baseline: 250 GB storage bundled</p>
                  </div>

                </div>
              ) : (
                <p className="text-sm text-slate-400 text-center py-6">Activate organization state to view live metering sliders</p>
              )}
            </div>

            {/* Radial indicators mapping */}
            <h4 className="text-sm font-bold text-white">Dynamic Consumption Indicators</h4>
            {activeSubscription ? (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                <UsageCircularGauge 
                  currentValue={activeSubscription.usageApiCount} 
                  maxValue={100000} 
                  metricLabel="Client API Telemetry Requests" 
                  unit="Calls" 
                  type="API" 
                />
                
                <UsageCircularGauge 
                  currentValue={activeSubscription.usageCpuHours} 
                  maxValue={500} 
                  metricLabel="Cloud Core Compute Engine Hours" 
                  unit="Hours" 
                  type="CPU" 
                />

                <UsageCircularGauge 
                  currentValue={activeSubscription.usageStorageGB} 
                  maxValue={250} 
                  metricLabel="Dedicated Datastore Consumption" 
                  unit="GB" 
                  type="STORAGE" 
                />
              </div>
            ) : null}

          </div>
        )}

        {/* TAB 5: AUDIT LOGS & WEBHOOKS SANDBOX */}
        {currentTab === 'logs' && (
          <AuditLogger 
            logs={logs} 
            onTriggerSimulatedAction={triggerSimulatedAction}
            currentUserRole={role}
          />
        )}

        {/* TAB 6: SYSTEM ARCHITECTURE & API SCHEMA */}
        {currentTab === 'schema' && (
          <SchemaView />
        )}

      </main>

      {/* FOOTER SECTION BRANDING */}
      <footer className="border-t border-slate-800 bg-slate-950 py-8 px-6 mt-auto">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row justify-between items-center gap-4 text-xs text-slate-400">
          <div className="flex items-center gap-2">
            <ShieldCheck className="text-indigo-400" size={16} />
            <span className="font-bold text-slate-200">Equinox FinTech Platforms, Licensed SF/CA.</span>
          </div>
          <div className="flex gap-4 font-mono text-[10px]">
            <span>SOC-2 Certified</span>
            <span>PCI-DSS Tier 1 Compliant</span>
            <span>AES-256 Sealed Encryption</span>
          </div>
        </div>
      </footer>

      {/* MODAL LIGHTBOX 1: HIGH FIDELITY INVOICE PREVIEW & STATEMENT DOWNLOADS */}
      {viewingInvoice && (
        <InvoiceDownload 
          invoice={viewingInvoice} 
          tenant={TENANTS.find(t => t.id === viewingInvoice.tenantId)}
          onClose={() => setViewingInvoice(null)}
        />
      )}

      {/* MODAL LIGHTBOX 2: DYNAMIC CREDIT RECIPIENTS CHECKOUT SHEETS (STRIPE/RAZORPAY OVERLAY) */}
      {showCheckoutModal && checkoutTargetInvoice && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center z-50 p-4 animate-fade-in">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl relative border border-slate-100 flex flex-col gap-5">
            
            <button 
              onClick={() => {
                setShowCheckoutModal(false);
                setCheckoutTargetInvoice(null);
              }}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 font-bold p-1 cursor-pointer hover:bg-slate-100 rounded"
            >
              <X size={16} />
            </button>

            <div>
              <span className="text-[10px] font-bold text-violet-600 uppercase tracking-widest bg-violet-50 border border-violet-100 px-2 py-0.5 rounded">
                Simulated SECURE CHECKOUT
              </span>
              <h3 className="text-base font-extrabold text-slate-900 mt-2">Settle SaaSify Statements {checkoutTargetInvoice.id}</h3>
              <p className="text-xs text-slate-400 mt-1">Select payment processor and test payment rules in sandbox mode</p>
            </div>

            {/* Total to be collection */}
            <div className="bg-slate-50 rounded-xl p-4.5 border border-slate-100/50 flex justify-between items-center">
              <span className="text-xs font-semibold text-slate-500">Billable Grand Total:</span>
              <span className="text-lg font-extrabold text-slate-900 font-mono">${checkoutTargetInvoice.amount.toFixed(2)} USD</span>
            </div>

            {/* Checkout processor toggle switcher */}
            <div className="space-y-2">
              <label className="text-[11px] uppercase tracking-wider font-extrabold text-slate-450 block">Payment Processor Channel</label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setCheckoutProcessor('STRIPE')}
                  className={`p-3 rounded-xl border-2 flex flex-col gap-1 items-center justify-center cursor-pointer transition ${
                    checkoutProcessor === 'STRIPE' 
                      ? 'border-violet-600 bg-violet-50/40 text-violet-700' 
                      : 'border-slate-100 text-slate-500 hover:bg-slate-50'
                  }`}
                >
                  <span className="font-extrabold text-sm tracking-wide">Stripe</span>
                  <span className="text-[10px]">US/EU Global Networks</span>
                </button>
                <button
                  type="button"
                  onClick={() => setCheckoutProcessor('RAZORPAY')}
                  className={`p-3 rounded-xl border-2 flex flex-col gap-1 items-center justify-center cursor-pointer transition ${
                    checkoutProcessor === 'RAZORPAY' 
                      ? 'border-violet-600 bg-violet-50/40 text-violet-700' 
                      : 'border-slate-100 text-slate-500 hover:bg-slate-50'
                  }`}
                >
                  <span className="font-extrabold text-sm tracking-wide">Razorpay</span>
                  <span className="text-[10px]">INR/APAC Banking Nodes</span>
                </button>
              </div>
            </div>

            {/* Processor Dynamic Input details */}
            {checkoutProcessor === 'STRIPE' ? (
              <div className="space-y-3.5">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-450 uppercase font-mono">Simulated Card Token Sequence</label>
                  <input
                    type="text"
                    value={checkoutCardNumber}
                    onChange={(e) => setCheckoutCardNumber(e.target.value)}
                    className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg focus:outline-hidden text-slate-800 font-mono font-bold bg-slate-50/50"
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-450 uppercase font-mono">Expiry</label>
                    <input
                      type="text"
                      value={checkoutCardExpiry}
                      onChange={(e) => setCheckoutCardExpiry(e.target.value)}
                      className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg focus:outline-hidden text-slate-850 font-mono font-semibold text-center"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-450 uppercase font-mono">CVV Token</label>
                    <input
                      type="password"
                      value={checkoutCardCVC}
                      onChange={(e) => setCheckoutCardCVC(e.target.value)}
                      className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg focus:outline-hidden text-slate-850 font-mono font-semibold text-center"
                    />
                  </div>
                </div>
              </div>
            ) : (
              <div className="space-y-3 p-3 bg-violet-50/20 border border-violet-100/60 rounded-xl">
                <p className="text-[11px] text-violet-800 leading-relaxed">
                  Razorpay UPI & Direct netbanking systems use high-speed SMS validation tokens. Trigger payment below to simulate secure OTP authentication loops.
                </p>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-violet-750 uppercase">Direct Bank Provider Profile</label>
                  <select className="w-full bg-white border border-slate-200 rounded-lg p-1.5 text-xs text-slate-700">
                    <option>HDFC Bank Direct Portal Gateway</option>
                    <option>ICICI Bank Retail Netbanking Secure</option>
                    <option>State Bank of India Corporate</option>
                  </select>
                </div>
              </div>
            )}

            {/* Trigger buttons */}
            <button
              onClick={handleExecuteCheckoutReceipt}
              disabled={isProcessingCheckout}
              className={`w-full text-center py-2.5 rounded-lg text-xs font-bold text-white shadow-md transition cursor-pointer flex items-center justify-center gap-1.5 ${
                isProcessingCheckout ? 'bg-slate-400 cursor-default' : 'bg-violet-600 hover:bg-violet-700'
              }`}
            >
              {isProcessingCheckout ? (
                <>
                  <RefreshCw size={14} className="animate-spin" />
                  <span>Handshaking Gateway Key...</span>
                </>
              ) : (
                <>
                  <LockSecureIcon size={14} />
                  <span>Submit Settlement of ${checkoutTargetInvoice.amount.toFixed(2)}</span>
                </>
              )}
            </button>

            <div className="text-[10px] text-slate-400 text-center flex items-center justify-center gap-1 font-mono">
              <ShieldCheck size={11} className="text-emerald-500" />
              <span>AES-GCM SHA-256 Transport Secured Channel</span>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}

// Extra light lock icon
const LockSecureIcon = ({ size }: { size: number }) => (
  <svg 
    xmlns="http://www.w3.org/2000/svg" 
    width={size} 
    height={size} 
    viewBox="0 0 24 24" 
    fill="none" 
    stroke="currentColor" 
    strokeWidth="2.5" 
    strokeLinecap="round" 
    strokeLinejoin="round" 
    className="lucide lucide-lock"
  >
    <rect width="18" height="11" x="3" y="11" rx="2" ry="2" />
    <path d="M7 11V7a5 5 0 0 1 10 0v4" />
  </svg>
);
