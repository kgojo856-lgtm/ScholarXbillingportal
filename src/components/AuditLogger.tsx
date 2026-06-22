import React, { useState } from 'react';
import { Search, Shield, Server, UserCheck, Play, CreditCard, RefreshCw } from 'lucide-react';
import { AuditLog, Role } from '../types';

interface AuditLoggerProps {
  logs: AuditLog[];
  onTriggerSimulatedAction: (category: 'AUTH' | 'SUBSCRIPTION' | 'PAYMENT' | 'MEMBERS' | 'SYSTEM', status: 'SUCCESS' | 'FAILURE', action: string, details: string) => void;
  currentUserRole: Role;
}

export const AuditLogger: React.FC<AuditLoggerProps> = ({ 
  logs, 
  onTriggerSimulatedAction, 
  currentUserRole 
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [activeCategory, setActiveCategory] = useState<string>('ALL');

  // Filter out logs
  const filteredLogs = logs.filter((log) => {
    const matchesSearch = log.actorEmail.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          log.action.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          log.details.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = activeCategory === 'ALL' || log.category === activeCategory;
    return matchesSearch && matchesCategory;
  });

  const getCategoryBadge = (category: string) => {
    const styles = {
      AUTH: 'bg-indigo-500/10 text-indigo-400 border border-indigo-500/20',
      SUBSCRIPTION: 'bg-indigo-400/10 text-indigo-300 border border-indigo-400/20',
      PAYMENT: 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20',
      MEMBERS: 'bg-teal-500/10 text-teal-400 border border-teal-500/20',
      SYSTEM: 'bg-rose-500/10 text-rose-400 border border-rose-500/20',
      SETTINGS: 'bg-amber-500/10 text-amber-400 border border-amber-500/20',
    }[category] || 'bg-slate-800 text-slate-300 border border-slate-700';

    return <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase border ${styles}`}>{category}</span>;
  };

  return (
    <div className="space-y-6">
      
      {/* Simulation triggers panel */}
      <div className="bg-slate-900 text-white rounded-2xl p-6 border border-slate-800 shadow-xl">
        <div className="flex items-center justify-between">
          <div>
            <h4 className="text-sm font-bold text-violet-300 flex items-center gap-1.5 uppercase tracking-wider">
              <Server size={16} />
              <span>Real-Time Ingestion Sandbox</span>
            </h4>
            <p className="text-xs text-slate-400 mt-1 max-w-xl">
              Simulate enterprise webhooks, card failures, and authentication requests. The underlying state updates instantly to demonstrate security logging pipelines.
            </p>
          </div>
          <span className="text-[10px] bg-slate-800 text-slate-300 px-2 py-1 rounded font-mono uppercase tracking-widest leading-none">
            Active Simulator
          </span>
        </div>

        {/* Action presets */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3.5 mt-5">
          <button
            onClick={() => onTriggerSimulatedAction(
              'AUTH', 'SUCCESS', 'OAUTH_MFA_CHALLENGE', 
              'User successfully logged in with authenticating mobile push factor from United States.'
            )}
            className="flex items-center justify-between text-left p-3 rounded-xl bg-slate-800/80 hover:bg-slate-800 border border-slate-700/50 hover:border-slate-600 cursor-pointer transition-all duration-200 group text-xs text-slate-200"
          >
            <div className="space-y-0.5">
              <p className="font-semibold text-white group-hover:text-emerald-300 transition-colors">Credential MFA Approved</p>
              <p className="text-[10 px] text-slate-400">Category: Auth (Success)</p>
            </div>
            <Play size={12} className="text-slate-500 group-hover:translate-x-0.5 transition" />
          </button>

          <button
            onClick={() => onTriggerSimulatedAction(
              'PAYMENT', 'FAILURE', 'STRIPE_CHARGE_DECLINED', 
              'Stripe endpoint reported code CardDeclined: Insufficient customer balance on credit file •••• 9011.'
            )}
            className="flex items-center justify-between text-left p-3 rounded-xl bg-slate-800/80 hover:bg-slate-800 border border-slate-700/50 hover:border-slate-600 cursor-pointer transition-all duration-200 group text-xs text-slate-200"
          >
            <div className="space-y-0.5">
              <p className="font-semibold text-white group-hover:text-rose-400 transition-colors">Trigger Stripe Fail Retry</p>
              <p className="text-[10 px] text-slate-400">Category: Payment (Failure)</p>
            </div>
            <Play size={12} className="text-slate-500 group-hover:translate-x-0.5 transition" />
          </button>

          <button
            onClick={() => onTriggerSimulatedAction(
              'SYSTEM', 'SUCCESS', 'CPU_SPIKE_AUTO_METER', 
              'Multi-tenant monitoring tracked excess cloud computing. Added 24 additional CPU units to telemetry index.'
            )}
            className="flex items-center justify-between text-left p-3 rounded-xl bg-slate-800/80 hover:bg-slate-800 border border-slate-700/50 hover:border-slate-600 cursor-pointer transition-all duration-200 group text-xs text-slate-200"
          >
            <div className="space-y-0.5">
              <p className="font-semibold text-white group-hover:text-indigo-300 transition-colors">Simulate Telemetry Spike</p>
              <p className="text-[10 px] text-slate-400">Category: System (Success)</p>
            </div>
            <Play size={12} className="text-slate-500 group-hover:translate-x-0.5 transition" />
          </button>
        </div>
      </div>

      {/* Logs Explorer Panel */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl shadow-lg p-6 space-y-4">
        
        {/* Search controls and Category Filters */}
        <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
          <div className="relative w-full sm:max-w-xs">
            <Search className="absolute left-3 top-2.5 text-slate-500" size={16} />
            <input
              type="text"
              placeholder="Search Actor, IPs, Actions..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-4 py-2 text-xs border border-slate-800 rounded-lg focus:outline-hidden focus:ring-1 focus:ring-indigo-500 bg-slate-950 text-white"
            />
          </div>

          <div className="flex flex-wrap gap-1.5 w-full sm:w-auto justify-start sm:justify-end">
            {['ALL', 'AUTH', 'SUBSCRIPTION', 'PAYMENT', 'MEMBERS', 'SYSTEM'].map((cat) => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`px-3 py-1 text-xs rounded-lg font-bold border transition cursor-pointer ${
                  activeCategory === cat
                    ? 'bg-indigo-600 text-white border-indigo-650 shadow-md'
                    : 'bg-slate-950 text-slate-400 border-slate-800 hover:bg-slate-800 hover:text-white'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Core Logs Table */}
        <div className="border border-slate-800 rounded-xl overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-950 border-b border-slate-800 text-slate-400 text-[10.5px] uppercase font-extrabold">
                <th className="py-3 px-4">Event Timestamp</th>
                <th className="py-3 px-4">Category</th>
                <th className="py-3 px-4">Action Hook</th>
                <th className="py-3 px-4">Actor Email / Role</th>
                <th className="py-3 px-4">Remote IP</th>
                <th className="py-3 px-4">Outcome</th>
                <th className="py-3 px-4 text-right">Activity Scope</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-850 text-xs text-slate-300">
              {filteredLogs.length === 0 ? (
                <tr>
                  <td colSpan={7} className="text-center py-10 font-medium text-slate-500 bg-slate-900">
                    No matching audit records indexed. Adjust search strings.
                  </td>
                </tr>
              ) : (
                filteredLogs.map((log) => (
                  <tr key={log.id} className="hover:bg-slate-800/30 bg-slate-900">
                    <td className="py-3.5 px-4 font-mono text-[10.5px] whitespace-nowrap text-slate-500">{log.timestamp}</td>
                    <td className="py-3.5 px-4">{getCategoryBadge(log.category)}</td>
                    <td className="py-3.5 px-4 font-mono font-semibold text-white text-[11px]">{log.action}</td>
                    <td className="py-3.5 px-4 whitespace-nowrap">
                      <div className="space-y-0.5">
                        <p className="font-semibold text-slate-200">{log.actorEmail}</p>
                        <p className="text-[10px] text-slate-400">{log.actorRole}</p>
                      </div>
                    </td>
                    <td className="py-3.5 px-4 font-mono text-[11px] whitespace-nowrap text-slate-450">{log.ipAddress}</td>
                    <td className="py-3.5 px-4">
                      <span className={`inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-bold border ${
                        log.status === 'SUCCESS' 
                          ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' 
                          : 'bg-rose-500/10 text-rose-450 border-rose-500/20'
                      }`}>
                        {log.status}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-xs font-sans text-slate-300 max-w-xs text-right truncate" title={log.details}>
                      {log.details}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        <div className="flex items-center justify-between pt-2 text-[11px] text-slate-500">
          <span>Displaying {filteredLogs.length} audit frames of {logs.length} indexed</span>
          <span className="flex items-center gap-1">
            <Shield size={12} className="text-emerald-400" />
            Immutable SOC-2 Compliance Protected
          </span>
        </div>

      </div>
    </div>
  );
};
