import React from 'react';
import { useApp } from '../../context/AppContext';
import {
  BarChart3,
  Building2,
  TrendingDown,
  TrendingUp,
  Award,
  ShieldAlert,
  Users
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
  Legend
} from 'recharts';

export const MultiBuildingComparison: React.FC = () => {
  const { buildings, setActiveTab } = useApp();

  const comparisonData = buildings.map(b => ({
    name: b.code,
    fullName: b.name,
    consumption: b.todayConsumptionLiters,
    perCapita: Math.round(b.todayConsumptionLiters / (b.occupancy || 1)),
    occupants: b.occupancy,
    risk: b.leakageRiskPercent,
    flowRate: b.currentFlowRate,
    pressure: b.currentPressure
  }));

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6 max-w-7xl mx-auto">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-black text-slate-900 tracking-tight flex items-center gap-2">
              <BarChart3 className="w-5 h-5 text-cyan-600" />
              Multi-Building Water Benchmarking & Analytics
            </h1>
            <span className="text-[10px] font-mono uppercase bg-cyan-100 text-cyan-800 font-bold px-2 py-0.5 rounded-full">
              Normalized Per-Capita
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Comparative performance, hydraulic load distribution, and efficiency rankings across campus assets
          </p>
        </div>
      </div>

      {/* Comparative Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Total Today Consumption Chart */}
        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs space-y-4">
          <div className="pb-3 border-b border-slate-100">
            <h2 className="text-sm font-bold text-slate-900">
              Total Today's Water Consumption (Liters)
            </h2>
            <p className="text-xs text-slate-500">Gross intake volume across monitored facilities</p>
          </div>

          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={Array.isArray(comparisonData) ? comparisonData : []}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="name" tick={{ fontSize: 11, fill: '#64748b' }} />
                <YAxis tick={{ fontSize: 11, fill: '#64748b' }} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#0f172a', borderRadius: '8px', color: '#fff', fontSize: '11px', border: 'none' }}
                  formatter={(val: any) => [`${(Number(val) || 0).toLocaleString()} Liters`, 'Gross Consumption']}
                />
                <Bar dataKey="consumption" fill="#0284c7" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Normalized Per-Capita Consumption Chart */}
        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs space-y-4">
          <div className="pb-3 border-b border-slate-100">
            <h2 className="text-sm font-bold text-slate-900">
              Normalized Per-Capita Consumption (L / Person / Day)
            </h2>
            <p className="text-xs text-slate-500">Normalized water intensity accounting for building population</p>
          </div>

          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={Array.isArray(comparisonData) ? comparisonData : []}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="name" tick={{ fontSize: 11, fill: '#64748b' }} />
                <YAxis tick={{ fontSize: 11, fill: '#64748b' }} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#0f172a', borderRadius: '8px', color: '#fff', fontSize: '11px', border: 'none' }}
                  formatter={(val: any) => [`${val} L / Person`, 'Intensity']}
                />
                <Bar dataKey="perCapita" fill="#6366f1" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

      </div>

      {/* Benchmarking Matrix Table */}
      <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs space-y-4">
        <h2 className="text-sm font-bold text-slate-900 pb-3 border-b border-slate-100">
          Campus Building Performance Matrix
        </h2>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-200 text-slate-400 font-semibold uppercase text-[10px]">
                <th className="pb-3">Facility</th>
                <th className="pb-3">Occupancy</th>
                <th className="pb-3">Today Intake</th>
                <th className="pb-3">Per Capita</th>
                <th className="pb-3">Current Flow</th>
                <th className="pb-3">Head Pressure</th>
                <th className="pb-3">Leakage Risk</th>
                <th className="pb-3 text-right">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {buildings.map(b => {
                const perCap = Math.round(b.todayConsumptionLiters / (b.occupancy || 1));
                return (
                  <tr key={b.id} className="hover:bg-slate-50 transition-colors">
                    <td className="py-3.5 font-bold text-slate-800">
                      <div>{b.name}</div>
                      <span className="text-[10px] text-slate-400 font-normal">{b.code}</span>
                    </td>
                    <td className="py-3.5 text-slate-600 font-medium">
                      {(b.occupancy ?? 0).toLocaleString()} persons
                    </td>
                    <td className="py-3.5 font-mono font-bold text-slate-900">
                      {(b.todayConsumptionLiters ?? 0).toLocaleString()} L
                    </td>
                    <td className="py-3.5 font-mono font-bold text-indigo-600">
                      {perCap} L/p/d
                    </td>
                    <td className="py-3.5 font-mono text-slate-700">
                      {b.currentFlowRate} L/m
                    </td>
                    <td className="py-3.5 font-mono text-slate-700">
                      {b.currentPressure} bar
                    </td>
                    <td className="py-3.5">
                      <span className={`font-mono font-bold ${
                        b.leakageRiskPercent > 60 ? 'text-rose-600' : 'text-emerald-600'
                      }`}>
                        {b.leakageRiskPercent}%
                      </span>
                    </td>
                    <td className="py-3.5 text-right">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                        b.riskLevel === 'HIGH' ? 'bg-rose-100 text-rose-700' :
                        b.riskLevel === 'MEDIUM' ? 'bg-amber-100 text-amber-700' :
                        'bg-emerald-100 text-emerald-700'
                      }`}>
                        {b.riskLevel}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
};
