import React, { useState, useEffect } from 'react';
import { api } from '../../services/api';
import { AuditLogEntry } from '../../types';
import {
  ShieldAlert,
  ShieldCheck,
  Lock,
  Search,
  Clock,
  User,
  CheckCircle2,
  Key
} from 'lucide-react';

export const AuditLogView: React.FC = () => {
  const [logs, setLogs] = useState<AuditLogEntry[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('ALL');

  useEffect(() => {
    api.getAuditLogs().then(data => setLogs(data));
  }, []);

  const filtered = logs.filter(l => {
    const matchesCat = categoryFilter === 'ALL' || l.category === categoryFilter;
    const matchesSearch = l.action.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          l.userName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          l.details.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCat && matchesSearch;
  });

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6 max-w-7xl mx-auto">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-black text-slate-900 tracking-tight flex items-center gap-2">
              <ShieldAlert className="w-5 h-5 text-purple-600" />
              Security Audit Trail & Compliance Log
            </h1>
            <span className="text-[10px] font-mono uppercase bg-purple-100 text-purple-800 font-bold px-2 py-0.5 rounded-full">
              Tamper-Evident Ledger
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Immutable log of all user operations, valve actuations, role switches, and simulation injections
          </p>
        </div>

        <div className="flex items-center gap-2 text-xs font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200 px-3 py-1.5 rounded-xl">
          <ShieldCheck className="w-4 h-4 text-emerald-600" />
          <span>RBAC Enforcement: Active (Strict)</span>
        </div>
      </div>

      {/* Security Posture Summary */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex items-center gap-3">
          <div className="p-2 rounded-lg bg-emerald-50 text-emerald-600 border border-emerald-100">
            <Lock className="w-5 h-5" />
          </div>
          <div>
            <span className="font-bold text-slate-900 block">End-to-End Encryption</span>
            <span className="text-slate-500">TLS 1.3 in transit • AES-256 at rest</span>
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex items-center gap-3">
          <div className="p-2 rounded-lg bg-blue-50 text-blue-600 border border-blue-100">
            <Key className="w-5 h-5" />
          </div>
          <div>
            <span className="font-bold text-slate-900 block">API Credentials Secured</span>
            <span className="text-slate-500">Zero client-side secrets exposure</span>
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex items-center gap-3">
          <div className="p-2 rounded-lg bg-purple-50 text-purple-600 border border-purple-100">
            <CheckCircle2 className="w-5 h-5" />
          </div>
          <div>
            <span className="font-bold text-slate-900 block">Audit Retention Policy</span>
            <span className="text-slate-500">365-day statutory compliance log</span>
          </div>
        </div>
      </div>

      {/* Audit Log Table Card */}
      <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
          <div className="relative flex-1 max-w-sm">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Search audit trail by user, action, or details..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs focus:outline-hidden"
            />
          </div>

          <div className="flex items-center gap-1.5 overflow-x-auto text-xs">
            {['ALL', 'AUTH', 'SIMULATION', 'ANOMALY', 'MAINTENANCE'].map(c => (
              <button
                key={c}
                onClick={() => setCategoryFilter(c)}
                className={`px-3 py-1 rounded-lg font-medium transition-colors ${
                  categoryFilter === c ? 'bg-slate-900 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {c}
              </button>
            ))}
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-200 text-slate-400 font-semibold uppercase text-[10px]">
                <th className="pb-3">Timestamp</th>
                <th className="pb-3">Actor / User</th>
                <th className="pb-3">Category</th>
                <th className="pb-3">Action Executed</th>
                <th className="pb-3">Technical Details</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filtered.map(l => (
                <tr key={l.id} className="hover:bg-slate-50 transition-colors">
                  <td className="py-3 font-mono text-slate-500 whitespace-nowrap">
                    {new Date(l.timestamp).toLocaleTimeString()}
                  </td>
                  <td className="py-3 font-medium text-slate-900">
                    <div className="flex items-center gap-1.5">
                      <User className="w-3.5 h-3.5 text-slate-400" />
                      {l.userName}
                    </div>
                  </td>
                  <td className="py-3">
                    <span className="font-mono text-[10px] bg-slate-100 text-slate-700 px-2 py-0.5 rounded font-bold">
                      {l.category}
                    </span>
                  </td>
                  <td className="py-3 font-bold text-slate-800">
                    {l.action}
                  </td>
                  <td className="py-3 text-slate-600 font-mono text-[11px]">
                    {l.details}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
};
