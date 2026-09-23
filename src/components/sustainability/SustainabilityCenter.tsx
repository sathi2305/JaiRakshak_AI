import React, { useState, useEffect } from 'react';
import { api } from '../../services/api';
import {
  Leaf,
  Award,
  Zap,
  TrendingDown,
  DollarSign,
  CheckCircle2,
  Trophy,
  Target,
  Sparkles,
  Flame
} from 'lucide-react';

export const SustainabilityCenter: React.FC = () => {
  const [data, setData] = useState<any>(null);

  useEffect(() => {
    api.getSustainability().then(res => setData(res));
  }, []);

  if (!data) return null;

  const scoreFactors = [
    { title: 'Baseline Consumption Deviation', score: 18, max: 20, desc: '90% of hours within expected envelope' },
    { title: 'Night Flow Minimum Compliance', score: 14, max: 20, desc: 'Deduction due to Floor 2 lab leak' },
    { title: 'Rapid Leak Remediation SLA', score: 19, max: 20, desc: 'Average ticket resolution 1.4 hours' },
    { title: 'Rainwater / Greywater Ingress', score: 12, max: 15, desc: '38,000L recycled this week' },
    { title: 'Low-Flow Aerator Fixture Coverage', score: 14, max: 15, desc: '82% of campus fixtures retrofitted' },
    { title: 'Occupant-Normalized Intensity', score: 9, max: 10, desc: 'Well under regional LEED benchmark' },
  ];

  const badges = [
    { name: 'Leak Buster Master', desc: 'Resolved 5 critical leaks within 2 hours', unlocked: true, icon: Trophy, color: 'text-amber-500 bg-amber-50 border-amber-200' },
    { name: 'Night Flow Sentinel', desc: 'Maintained 01:00–04:00 baseline under 5 L/min', unlocked: true, icon: Award, color: 'text-cyan-500 bg-cyan-50 border-cyan-200' },
    { name: 'Zero Overflow Champion', desc: 'Zero tank spillage recorded for 90 consecutive days', unlocked: true, icon: Leaf, color: 'text-emerald-500 bg-emerald-50 border-emerald-200' },
    { name: 'Carbon Neutral Pioneer', desc: 'Avoided over 10 metric tons of pump emissions', unlocked: false, icon: Zap, color: 'text-slate-400 bg-slate-50 border-slate-200' }
  ];

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6 max-w-7xl mx-auto">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-black text-slate-900 tracking-tight flex items-center gap-2">
              <Leaf className="w-5 h-5 text-emerald-600" />
              Sustainability Impact, ESG Metrics & Water Efficiency Scoring
            </h1>
            <span className="text-[10px] font-mono uppercase bg-emerald-100 text-emerald-800 font-bold px-2 py-0.5 rounded-full">
              LEED / ESG Standard
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Certified carbon offset, energy conservation, avoided utility costs, and institutional gamification
          </p>
        </div>
      </div>

      {/* Main Hero Banner: Composite Water Efficiency Score (0-100) */}
      <div className="bg-linear-to-r from-emerald-950 via-teal-900 to-slate-900 rounded-2xl p-6 text-white shadow-xl">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div>
            <span className="text-emerald-400 text-xs font-bold uppercase tracking-wider">
              Institutional ESG Scorecard
            </span>
            <h2 className="text-2xl sm:text-3xl font-black text-white mt-1">
              Water Efficiency Score: {data.score} / 100
            </h2>
            <p className="text-xs text-slate-300 mt-1 max-w-xl leading-relaxed">
              Tier: <strong>Gold Star Sustainability Rating</strong>. The campus outperforms standard university benchmarks by 28.4%, preserving freshwater reservoirs and cutting Scope 2 pump energy.
            </p>
          </div>

          <div className="grid grid-cols-3 gap-3 bg-white/10 backdrop-blur-md p-4 rounded-xl border border-white/10 text-center shrink-0">
            <div>
              <span className="text-xl sm:text-2xl font-black text-emerald-300 font-mono">
                {(data.waterSavedYtdLiters ?? 0).toLocaleString()}
              </span>
              <span className="block text-[10px] text-slate-300 uppercase mt-0.5">Liters Saved YTD</span>
            </div>
            <div className="border-x border-white/10 px-2">
              <span className="text-xl sm:text-2xl font-black text-cyan-300 font-mono">
                {(data.energySavedKwh ?? 0).toLocaleString()}
              </span>
              <span className="block text-[10px] text-slate-300 uppercase mt-0.5">kWh Energy Saved</span>
            </div>
            <div>
              <span className="text-xl sm:text-2xl font-black text-amber-300 font-mono">
                {(data.co2AvoidedKg ?? 0).toLocaleString()}
              </span>
              <span className="block text-[10px] text-slate-300 uppercase mt-0.5">kg CO2e Offset</span>
            </div>
          </div>
        </div>
      </div>

      {/* Two Columns: Transparent Score Breakdown vs Conservation Goals */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Score Breakdown (Section 23) */}
        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs space-y-4">
          <div className="pb-3 border-b border-slate-100">
            <h2 className="text-sm font-bold text-slate-900">
              Score Factor Decomposition (Weighted 100-Point Index)
            </h2>
            <p className="text-xs text-slate-500">
              Objective mathematical scoring across six conservation dimensions
            </p>
          </div>

          <div className="space-y-3 text-xs">
            {scoreFactors.map(f => (
              <div key={f.title} className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                <div className="flex justify-between items-center mb-1">
                  <span className="font-bold text-slate-800">{f.title}</span>
                  <span className="font-mono font-bold text-emerald-700">{f.score} / {f.max} pts</span>
                </div>
                <div className="w-full bg-slate-200 h-1.5 rounded-full overflow-hidden mb-1.5">
                  <div
                    className="bg-emerald-500 h-full rounded-full"
                    style={{ width: `${(f.score / f.max) * 100}%` }}
                  ></div>
                </div>
                <span className="text-[10px] text-slate-500">{f.desc}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Conservation Goals Progress & Gamification (Sections 25 & 26) */}
        <div className="space-y-6">
          
          {/* Goals Card */}
          <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs space-y-4">
            <div className="pb-3 border-b border-slate-100">
              <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <Target className="w-4 h-4 text-cyan-600" />
                Campus Conservation Mandates & Milestones
              </h2>
            </div>

            <div className="space-y-3 text-xs">
              <div className="p-3 rounded-xl border border-slate-200 bg-slate-50">
                <div className="flex justify-between font-bold text-slate-800">
                  <span>Q4 20% Net Consumption Reduction</span>
                  <span className="text-cyan-700 font-mono">77.5% Completed</span>
                </div>
                <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden mt-2">
                  <div className="bg-cyan-600 h-full rounded-full" style={{ width: '77.5%' }}></div>
                </div>
              </div>

              <div className="p-3 rounded-xl border border-slate-200 bg-slate-50">
                <div className="flex justify-between font-bold text-slate-800">
                  <span>Zero Rooftop Spillage (90 Day Streak)</span>
                  <span className="text-emerald-700 font-mono">100% Achieved</span>
                </div>
                <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden mt-2">
                  <div className="bg-emerald-500 h-full rounded-full" style={{ width: '100%' }}></div>
                </div>
              </div>
            </div>
          </div>

          {/* Gamification Badges */}
          <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs space-y-4">
            <div className="pb-3 border-b border-slate-100">
              <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <Trophy className="w-4 h-4 text-amber-500" />
                Conservation Honors & Badges
              </h2>
            </div>

            <div className="grid grid-cols-2 gap-3">
              {badges.map(b => {
                const Icon = b.icon;
                return (
                  <div key={b.name} className={`p-3 rounded-xl border flex flex-col justify-between ${b.color}`}>
                    <div>
                      <div className="flex items-center gap-2">
                        <Icon className="w-4 h-4 shrink-0" />
                        <span className="font-bold text-xs text-slate-900 truncate">{b.name}</span>
                      </div>
                      <p className="text-[10px] text-slate-600 mt-1">{b.desc}</p>
                    </div>
                    <span className="text-[9px] font-bold uppercase mt-2 block">
                      {b.unlocked ? '✓ Unlocked' : 'In Progress'}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

        </div>

      </div>

    </div>
  );
};
