import React, { useState, useEffect } from 'react';
import { api } from '../../services/api';
import { Recommendation } from '../../types';
import {
  Lightbulb,
  CheckCircle2,
  TrendingDown,
  DollarSign,
  Clock,
  ArrowRight,
  ShieldAlert,
  Sliders,
  Sparkles
} from 'lucide-react';

export const RecommendationsView: React.FC = () => {
  const [recommendations, setRecommendations] = useState<Recommendation[]>([]);
  const [appliedIds, setAppliedIds] = useState<string[]>([]);
  const [filterPriority, setFilterPriority] = useState<string>('ALL');

  useEffect(() => {
    api.getRecommendations().then(data => setRecommendations(data));
  }, []);

  const handleApply = async (id: string) => {
    await api.applyRecommendation(id);
    setAppliedIds(prev => [...prev, id]);
  };

  const filtered = filterPriority === 'ALL'
    ? recommendations
    : recommendations.filter(r => r.priority === filterPriority);

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6 max-w-7xl mx-auto">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-black text-slate-900 tracking-tight flex items-center gap-2">
              <Lightbulb className="w-5 h-5 text-amber-500" />
              Prescriptive Water & Cost Optimization Recommendations
            </h1>
            <span className="text-[10px] font-mono uppercase bg-amber-100 text-amber-800 font-bold px-2 py-0.5 rounded-full">
              Automated Prescriptive AI
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Prioritized engineering interventions ranked by water conservation impact and ROI payback
          </p>
        </div>

        {/* Priority Filter */}
        <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl border border-slate-200 text-xs">
          {['ALL', 'HIGH', 'MEDIUM', 'LOW'].map(p => (
            <button
              key={p}
              onClick={() => setFilterPriority(p)}
              className={`px-3 py-1 rounded-lg font-semibold transition-all ${
                filterPriority === p ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              {p}
            </button>
          ))}
        </div>
      </div>

      {/* Aggregate Savings Banner */}
      <div className="bg-linear-to-r from-emerald-900 via-teal-900 to-slate-900 text-white rounded-2xl p-6 shadow-xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <span className="text-emerald-300 text-xs font-bold uppercase tracking-wider">
              Total Opportunity Matrix
            </span>
            <h2 className="text-2xl font-black text-white mt-1">
              Conserve up to 34,200 Liters / day
            </h2>
            <p className="text-xs text-slate-300 mt-1">
              Executing all 4 active prescriptive actions yields an estimated $4,850 in annual utility reduction.
            </p>
          </div>
          <div className="text-right sm:border-l sm:border-emerald-700/50 sm:pl-6">
            <div className="text-2xl font-black text-emerald-400 font-mono">$4,850</div>
            <div className="text-[10px] text-slate-300 uppercase tracking-wider">Annual Financial ROI</div>
          </div>
        </div>
      </div>

      {/* Recommendations Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filtered.map(rec => {
          const isApplied = appliedIds.includes(rec.id) || rec.status === 'APPLIED';

          return (
            <div
              key={rec.id}
              className={`bg-white rounded-2xl border p-5 shadow-xs flex flex-col justify-between transition-all ${
                isApplied ? 'border-emerald-300 bg-emerald-50/20' : 'border-slate-200 hover:shadow-md'
              }`}
            >
              <div>
                <div className="flex items-center justify-between gap-2">
                  <span className={`text-[10px] font-extrabold uppercase tracking-wider px-2 py-0.5 rounded-full ${
                    rec.priority === 'HIGH' ? 'bg-rose-100 text-rose-700 border border-rose-200' :
                    rec.priority === 'MEDIUM' ? 'bg-amber-100 text-amber-700 border border-amber-200' :
                    'bg-blue-100 text-blue-700 border border-blue-200'
                  }`}>
                    {rec.priority} Priority
                  </span>
                  <span className="text-[11px] text-slate-400 font-mono">
                    Category: {rec.category}
                  </span>
                </div>

                <h3 className="font-bold text-slate-900 text-sm sm:text-base mt-2">
                  {rec.title}
                </h3>
                <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                  {rec.description}
                </p>

                <div className="grid grid-cols-3 gap-2 bg-slate-50 p-3 rounded-xl border border-slate-100 mt-4 text-xs">
                  <div>
                    <span className="text-slate-400 block text-[10px]">Water Saved</span>
                    <span className="font-bold text-emerald-600 mt-0.5 block">
                      {(rec.estimatedSavingsLitersPerDay ?? 0).toLocaleString()} L/day
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px]">Cost Saved</span>
                    <span className="font-bold text-slate-800 mt-0.5 block">
                      ${rec.estimatedCostSavingsUsdYear} / yr
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px]">Effort / Payback</span>
                    <span className="font-bold text-slate-800 mt-0.5 block">
                      {rec.effort} • {rec.paybackPeriodMonths} mo
                    </span>
                  </div>
                </div>
              </div>

              <div className="pt-4 mt-4 border-t border-slate-100 flex items-center justify-between">
                <span className="text-[11px] text-slate-400">
                  {isApplied ? 'Applied to facility schedule' : 'Status: Ready to apply'}
                </span>
                <button
                  disabled={isApplied}
                  onClick={() => handleApply(rec.id)}
                  className={`px-4 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors ${
                    isApplied
                      ? 'bg-emerald-100 text-emerald-800 cursor-default'
                      : 'bg-slate-900 hover:bg-slate-800 text-white cursor-pointer'
                  }`}
                >
                  {isApplied ? (
                    <>
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                      Applied
                    </>
                  ) : (
                    <>
                      Apply Recommendation
                      <ArrowRight className="w-3.5 h-3.5" />
                    </>
                  )}
                </button>
              </div>
            </div>
          );
        })}
      </div>

    </div>
  );
};
