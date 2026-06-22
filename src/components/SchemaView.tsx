import React, { useState } from 'react';
import { Database, ShieldCheck, Cpu, GitFork, Key, CheckCircle, FileCode } from 'lucide-react';

export const SchemaView: React.FC = () => {
  const [activeSubTab, setActiveSubTab] = useState<'PRISMA' | 'API' | 'JWT' | 'MATRIX'>('PRISMA');

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl shadow-lg overflow-hidden">
      
      {/* Header section explaining technical assets */}
      <div className="p-6 border-b border-slate-800 bg-slate-950">
        <h3 className="text-base font-bold text-white flex items-center gap-2">
          <Database className="text-indigo-400" size={18} />
          <span>System Architecture & API Specifications</span>
        </h3>
        <p className="text-xs text-slate-400 mt-1.5">
          A granular review of the production-ready schemas, relational structures, and REST API definitions that represent this platform.
        </p>

        {/* Sub-navigation tabs */}
        <div className="flex flex-wrap gap-2 mt-5">
          {[
            { id: 'PRISMA', label: 'Prisma Schema', icon: FileCode },
            { id: 'API', label: 'REST API Specs', icon: Cpu },
            { id: 'JWT', label: 'JWT & MFA Flow', icon: Key },
            { id: 'MATRIX', label: 'Permission Matrix', icon: ShieldCheck },
          ].map((tab) => {
            const Icon = tab.icon;
            const active = activeSubTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveSubTab(tab.id as any)}
                className={`flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
                  active 
                    ? 'bg-indigo-600 text-white shadow-md' 
                    : 'bg-slate-800 border border-slate-700 text-slate-300 hover:border-slate-600 hover:bg-slate-750'
                }`}
              >
                <Icon size={14} />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Content Panels */}
      <div className="p-6">
        
        {/* PANEL 1: PRISMA */}
        {activeSubTab === 'PRISMA' && (
          <div className="space-y-4">
            <div className="flex justify-between items-center bg-slate-950 border border-slate-800 rounded-lg p-3 text-xs text-slate-400">
              <span className="flex items-center gap-1.5 font-semibold text-slate-200">
                <GitFork size={14} className="text-indigo-400" />
                <span>PostgreSQL Relation Map (Prisma v5.x)</span>
              </span>
              <span className="font-mono text-[10px] text-slate-500">drizzle/prisma.schema</span>
            </div>

            <pre className="p-4 bg-slate-930 text-slate-300 rounded-xl overflow-x-auto text-xs font-mono leading-relaxed max-h-[500px] overflow-y-auto border border-slate-800">
{`datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

generator client {
  provider = "prisma-client-js"
}

enum GlobalRole {
  SUPER_ADMIN
  ORG_ADMIN
  FINANCE_MANAGER
  TEAM_MEMBER
}

enum SubscriptionStatus {
  ACTIVE
  TRIAL
  PAST_DUE
  CANCELLED
}

enum BillingCycle {
  MONTHLY
  YEARLY
}

model Organization {
  id             String         @id @default(uuid())
  name           String
  industry       String
  createdAt      DateTime       @default(now())
  updatedAt      DateTime       @updatedAt
  
  users          User[]
  subscription   Subscription?
  invoices       Invoice[]
  auditLogs      AuditLog[]
  usageRecords   UsageRecord[]
}

model User {
  id             String         @id @default(uuid())
  email          String         @unique
  fullName       String
  role           GlobalRole     @default(TEAM_MEMBER)
  mfaEnabled     Boolean        @default(false)
  mfaSecret      String?
  createdAt      DateTime       @default(now())
  
  organizationId String
  organization   Organization   @relation(fields: [organizationId], references: [id])
}

model SubscriptionPlan {
  id             String         @id
  name           String
  basePrice      Decimal        @db.Decimal(10, 2)
  pricePerSeat   Decimal        @db.Decimal(10, 2)
  description    String
  features       String[]
  
  subscriptions  Subscription[]
}

model Subscription {
  id             String             @id @default(uuid())
  status         SubscriptionStatus @default(TRIAL)
  billingCycle   BillingCycle       @default(MONTHLY)
  seats          Int                @default(5)
  stripeId       String?            @unique
  razorpayId     String?            @unique
  
  dbAddon        Boolean            @default(false)
  slaAddon       Boolean            @default(false)
  apiAddon       Boolean            @default(false)
  
  startDate      DateTime           @default(now())
  nextRenewal    DateTime
  
  organizationId String             @unique
  organization   Organization       @relation(fields: [organizationId], references: [id])
  
  planId         String
  plan           SubscriptionPlan   @relation(fields: [planId], references: [id])
}

model Invoice {
  id             String         @id
  issueDate      DateTime       @default(now())
  dueDate        DateTime
  subtotal       Decimal        @db.Decimal(10, 2)
  tax            Decimal        @db.Decimal(10, 2)
  taxRate        Decimal        @db.Decimal(5, 4) @default(0.1800)
  amount         Decimal        @db.Decimal(10, 2)
  refundAmount   Decimal?       @db.Decimal(10, 2)
  status         String         // "PAID" | "OUTSTANDING" | "OVERDUE" | "REFUNDED"
  paymentMethod  String
  billingReason  String         // "RENEWAL" | "SEATS_UPGRADE" | "USAGE_OVERAGE"
  
  organizationId String
  organization   Organization   @relation(fields: [organizationId], references: [id])
  subscriptionId String
  
  lineItems      InvoiceItem[]
}

model InvoiceItem {
  id             String         @id @default(uuid())
  desc           String
  qty            Int
  unitPrice      Decimal        @db.Decimal(10, 2)
  total          Decimal        @db.Decimal(10, 2)
  
  invoiceId      String
  invoice        Invoice        @relation(fields: [invoiceId], references: [id], onDelete: Cascade)
}

model UsageRecord {
  id             String         @id @default(uuid())
  apiCallsCount  Int            @default(0)
  cpuHours       Int            @default(0)
  storageGB      Int            @default(0)
  measuredAt     DateTime       @default(now())
  
  organizationId String
  organization   Organization   @relation(fields: [organizationId], references: [id])
}

model AuditLog {
  id             String         @id @default(uuid())
  timestamp      DateTime       @default(now())
  actorEmail     String
  actorRole      GlobalRole
  ipAddress      String
  action         String
  category       String         // "AUTH", "SUBSCRIPTION", "PAYMENT", "SYSTEM"
  status         String         // "SUCCESS" | "FAILURE"
  details        String
  
  organizationId String?        // Nullable for Global Admin activities
  organization   Organization?  @relation(fields: [organizationId], references: [id])
}`}
            </pre>
          </div>
        )}

        {/* PANEL 2: REST API ENDPOINTS */}
        {activeSubTab === 'API' && (
          <div className="space-y-4 text-xs">
            <div className="p-3.5 bg-indigo-500/10 border border-indigo-500/20 rounded-lg text-xs text-indigo-300 leading-relaxed font-semibold">
              💡 Endpoints enforce secure tenancy limits by extracting the User’s validated Organization ID payload directly from the verified bearer JWT claims. Cross-tenant pollution is blocked at the gateway middleware layer.
            </div>

            <div className="border border-slate-805 rounded-xl overflow-hidden">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-950 border-b border-slate-800 text-slate-400 uppercase font-extrabold font-sans text-[11px]">
                    <th className="py-2.5 px-3">Method</th>
                    <th className="py-2.5 px-3">REST Path</th>
                    <th className="py-2.5 px-3">Roles</th>
                    <th className="py-2.5 px-3">Payload / Goals</th>
                    <th className="py-2.5 px-3 text-right">Gate Response</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800 font-mono text-slate-350">
                  <tr className="hover:bg-slate-850/40">
                    <td className="py-3 px-3"><span className="text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-1.5 py-0.5 rounded font-extrabold text-[10px]">POST</span></td>
                    <td className="py-3 px-3 font-semibold text-white">/api/v1/auth/login</td>
                    <td className="py-3 px-3 text-[10px] text-slate-500">All Roles</td>
                    <td className="py-3 px-3 font-sans text-slate-400">Verification of credentials, returns first-factor JWT.</td>
                    <td className="py-3 px-3 text-right text-emerald-400 font-bold">200 {`{ mfaRequired: true }`}</td>
                  </tr>
                  <tr className="hover:bg-slate-850/40">
                    <td className="py-3 px-3"><span className="text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-1.5 py-0.5 rounded font-extrabold text-[10px]">POST</span></td>
                    <td className="py-3 px-3 font-semibold text-white">/api/v1/auth/mfa/verify</td>
                    <td className="py-3 px-3 text-[10px] text-slate-500">All Roles</td>
                    <td className="py-3 px-3 font-sans text-slate-400">Submits custom Google Authenticator SMS/TOTP code token.</td>
                    <td className="py-3 px-3 text-right text-emerald-400 font-bold">200 {`{ token: "JWT_VAL" }`}</td>
                  </tr>
                  <tr className="hover:bg-slate-850/40">
                    <td className="py-3 px-3"><span className="text-indigo-400 bg-indigo-500/10 border border-indigo-500/20 px-1.5 py-0.5 rounded font-extrabold text-[10px]">GET</span></td>
                    <td className="py-3 px-3 font-semibold text-white">/api/v1/billing/subscription</td>
                    <td className="py-3 px-3 text-indigo-400 font-bold text-[10px]">ORGANIZATION_ADMIN, FINANCE</td>
                    <td className="py-3 px-3 font-sans text-slate-400">Fetch subscription details, current active seats & add-ons.</td>
                    <td className="py-3 px-3 text-right text-indigo-400 font-bold">200 {`{ subscription: {...} }`}</td>
                  </tr>
                  <tr className="hover:bg-slate-850/40">
                    <td className="py-3 px-3"><span className="text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-1.5 py-0.5 rounded font-extrabold text-[10px]">POST</span></td>
                    <td className="py-3 px-3 font-semibold text-white">/api/v1/billing/seats/adjust</td>
                    <td className="py-3 px-3 text-indigo-400 font-bold text-[10px]">ORGANIZATION_ADMIN</td>
                    <td className="py-3 px-3 font-sans text-slate-400">{`{ newSeats: 28 }`} - Triggers immediate Stripe/Razorpay proration adjustment.</td>
                    <td className="py-3 px-3 text-right text-emerald-400 font-bold">201 {`{ prorationInvoice: {...} }`}</td>
                  </tr>
                  <tr className="hover:bg-slate-850/40">
                    <td className="py-3 px-3"><span className="text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-1.5 py-0.5 rounded font-extrabold text-[10px]">POST</span></td>
                    <td className="py-3 px-3 font-semibold text-white">/api/v1/billing/addons/toggle</td>
                    <td className="py-3 px-3 text-indigo-400 font-bold text-[10px]">ORGANIZATION_ADMIN</td>
                    <td className="py-3 px-3 font-sans text-slate-400">{`{ apiAddon: true, dbAddon: false }`} - Recalculates base price.</td>
                    <td className="py-3 px-3 text-right text-indigo-400 font-bold">200 {`{ status: "modified" }`}</td>
                  </tr>
                  <tr className="hover:bg-slate-850/40">
                    <td className="py-3 px-3"><span className="text-indigo-400 bg-indigo-500/10 border border-indigo-500/20 px-1.5 py-0.5 rounded font-extrabold text-[10px]">GET</span></td>
                    <td className="py-3 px-3 font-semibold text-white">/api/v1/invoices</td>
                    <td className="py-3 px-3 text-indigo-400 font-bold text-[10px]">ORGANIZATION_ADMIN, FINANCE</td>
                    <td className="py-3 px-3 font-sans text-slate-400">List organization invoices, filter by status (Outstanding / Paid).</td>
                    <td className="py-3 px-3 text-right text-indigo-400 font-bold">200 {`{ invoices: [...] }`}</td>
                  </tr>
                  <tr className="hover:bg-slate-850/40">
                    <td className="py-3 px-3"><span className="text-rose-400 bg-rose-500/10 border border-rose-500/20 px-1.5 py-0.5 rounded font-extrabold text-[10px]">DELETE</span></td>
                    <td className="py-3 px-3 font-semibold text-white">/api/v1/billing/cancel</td>
                    <td className="py-3 px-3 text-indigo-400 font-bold text-[10px]">ORGANIZATION_ADMIN</td>
                    <td className="py-3 px-3 font-sans text-slate-400">Queue subscription cancellation at end of current period.</td>
                    <td className="py-3 px-3 text-right text-rose-450 font-bold">200 {`{ cancelAtPeriodEnd: true }`}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* PANEL 3: JWT CLAIMS */}
        {activeSubTab === 'JWT' && (
          <div className="space-y-5 text-xs text-slate-300">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div className="border border-slate-800 p-4.5 rounded-xl bg-slate-950">
                <h5 className="font-bold text-white flex items-center gap-1.5 mb-2.5">
                  <Key className="text-amber-400" size={16} />
                  <span>Secure JWT Payload Construction</span>
                </h5>
                <p className="text-xs text-slate-400 mb-3">
                  This cryptographic bearer token is issued post-MFA. It asserts tenant boundaries and roles instantly, allowing backends to scale independently.
                </p>
                <pre className="p-3 bg-slate-900 text-amber-300 rounded-lg text-[10.5px] font-mono leading-relaxed border border-slate-800">
{`{
  "iss": "b2b-billing.gateway.io",
  "sub": "usr_99210381023",
  "name": "Irene Mendoza",
  "email": "irene.mendoza@saasify.io",
  "role": "FINANCE_MANAGER",
  "tenantId": "tenant-1",
  "mfaVerified": true,
  "iat": 1782012000,
  "exp": 1782015600
}`}
                </pre>
              </div>

              <div className="flex flex-col justify-between border border-slate-800 p-4.5 rounded-xl bg-slate-950">
                <div className="space-y-3">
                  <h5 className="font-bold text-white flex items-center gap-1.5 mb-1 text-xs">
                    <CheckCircle className="text-emerald-400" size={16} />
                    <span>MFA & Audit Trace Flow</span>
                  </h5>
                  <ol className="space-y-2.5 pl-4 list-decimal text-xs text-slate-300">
                    <li className="leading-relaxed">
                      <strong>Login Step:</strong> Client posts credentials. Server hashes password (Argon2id), verifies match.
                    </li>
                    <li className="leading-relaxed">
                      <strong>Two-Factor Challenge:</strong> Server issues temp token and triggers high-speed Authenticator challenge (TOTP code).
                    </li>
                    <li className="leading-relaxed">
                      <strong>Signature Loop:</strong> User submits TOTP. Token promoted to complete scope.
                    </li>
                    <li className="leading-relaxed">
                      <strong>Audit Log Capture:</strong> System registers <code className="bg-slate-800 px-1.5 py-0.5 rounded text-rose-450 font-mono">MEMBER_AUTH_MFA_LOGIN</code> with client remote IP in active database log.
                    </li>
                  </ol>
                </div>
                <div className="mt-6 p-2.5 bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 font-semibold rounded-lg text-[11px]">
                  🔒 Absolute protection against multi-tenant memory leaking attacks.
                </div>
              </div>
            </div>
          </div>
        )}

        {/* PANEL 4: ACCESS MATRIX */}
        {activeSubTab === 'MATRIX' && (
          <div className="space-y-4 text-xs text-slate-300">
            <p className="text-slate-450">
              The platform implements rigid <strong>Role-Based Access Control (RBAC)</strong>. The system automatically restricts pages and elements based on the currently simulated active identity:
            </p>

            <div className="border border-slate-805 rounded-xl overflow-hidden">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-950 border-b border-slate-800 text-slate-400 uppercase font-extrabold text-[10px] tracking-wider text-slate-450">
                    <th className="py-2.5 px-4 font-semibold text-slate-400">Feature Segment</th>
                    <th className="py-2.5 px-3 text-center text-rose-400 font-semibold">Super Admin</th>
                    <th className="py-2.5 px-3 text-center text-indigo-400 font-semibold">Org Admin</th>
                    <th className="py-2.5 px-3 text-center text-emerald-400 font-semibold">Finance Manager</th>
                    <th className="py-3 px-3 text-center text-slate-450 font-semibold">Team Member</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800 text-slate-300">
                  {[
                    { f: 'Global Tenant Management (Add/Remove Orgs)', r: [true, false, false, false] },
                    { f: 'Global Subscription Pricing Configuration', r: [true, false, false, false] },
                    { f: 'View Tenant Financial Reports & Churn MRR', r: [true, true, true, false] },
                    { f: 'Request Additional Seats Quota', r: [true, true, true, true] },
                    { f: 'Upgrade / Downgrade Plan (Starter/Growth/Ent)', r: [true, true, false, false] },
                    { f: 'Download Corporate PDFs & Statements', r: [true, true, true, false] },
                    { f: 'Toggle Database & Premium SLA Addons', r: [true, true, false, false] },
                    { f: 'View Tenant Specific Audit Logs', r: [true, true, true, false] },
                  ].map((row, idx) => (
                    <tr key={idx} className="hover:bg-slate-850/40">
                      <td className="py-3 px-4 font-semibold text-slate-300">{row.f}</td>
                      <td className="py-3 px-3 text-center font-semibold text-xs">
                        {row.r[0] ? <span className="text-emerald-400">✔ Full</span> : <span className="text-slate-700">✖ No</span>}
                      </td>
                      <td className="py-3 px-3 text-center font-semibold text-xs">
                        {row.r[1] ? <span className="text-emerald-400">✔ Full</span> : <span className="text-slate-700">✖ No</span>}
                      </td>
                      <td className="py-3 px-3 text-center font-semibold text-xs">
                        {row.r[2] ? <span className="text-emerald-400">✔ Fiscal</span> : <span className="text-slate-700">✖ No</span>}
                      </td>
                      <td className="py-3 px-3 text-center font-semibold text-xs">
                        {row.r[3] ? <span className="text-amber-400">⚠ Request</span> : <span className="text-slate-700">✖ No</span>}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};
