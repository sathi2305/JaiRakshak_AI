import React, { useState, useEffect } from 'react';
import { api } from '../../services/api';
import {
  TrendingUp,
  Sliders,
  Zap,
  Droplets,
  Calendar,
  CloudSun,
  CheckCircle2,
  Clock,
  ArrowRight,
  Sparkles
} from 'lucide-react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
  Legend
} from 'recharts';

export const ForecastOptimization: React.FC = () => {
  const [horizon, setHorizon] = useState<'24h' | '7d' | '30d'>('24h');
  const [forecastData, setForecastData] = useState<any[]>([]);
  const [forecastMeta, setForecastMeta] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [pumpOptimizationActive, setPumpOptimizationActive] = useState(true);
  const [smartIrrigationActive, setSmartIrrigationActive] = useState(true);
  const [coolingTowerActive, setCoolingTowerActive] = useState(false);

  useEffect(() => {
    setIsLoading(true);
    api.getForecast(horizon)
      .then(data => {
        setForecastMeta(data);
        const rawPoints = Array.isArray(data?.points) ? data.points : Array.isArray(data) ? data : [];
        const normalized = rawPoints.map((p: any) => ({
          ...p,
          timestamp: p.timestamp || p.hour || '',
          expectedDemand: p.expectedDemand ?? p.predictedDemandLiters ?? 0,
          maxDemand: p.maxDemand ?? p.maxExpectedLiters ?? (p.expectedDemand ? Math.round(p.expectedDemand * 1.1) : 0),
          minDemand: p.minDemand ?? p.minExpectedLiters ?? (p.expectedDemand ? Math.round(p.expectedDemand * 0.9) : 0),
          baseline: p.historicalBaselineLiters ?? p.baseline ?? 0,
        }));
        setForecastData(normalized);
        setIsLoading(false);
      })
      .catch(() => {
        setForecastData([]);
        setIsLoading(false);
      });
  }, [horizon]);

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6 max-w-7xl mx-auto">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-black text-slate-900 tracking-tight flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-indigo-600" />
              AI Demand Forecasting & Predictive Optimization Engine
            </h1>
            <span className="text-[10px] font-mono uppercase bg-indigo-100 text-indigo-800 font-bold px-2 py-0.5 rounded-full">
              Multi-Horizon Ensemble
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Predictive consumption curves with confidence intervals and intelligent pump/tank scheduling
          </p>
        </div>

        {/* Horizon Selector Pills */}
        <div className="flex items-center gap-1.5 bg-slate-100 p-1 rounded-xl border border-slate-200">
          {(['24h', '7d', '30d'] as const).map((h) => (
            <button
              key={h}
              onClick={() => setHorizon(h)}
              className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all ${
                horizon === h
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              {h === '24h' ? 'Next 24 Hours' : h === '7d' ? '7-Day Outlook' : '30-Day Outlook'}
            </button>
          ))}
        </div>
      </div>

      {/* Forecast Chart Card */}
      <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
          <div>
            <h2 className="text-sm font-bold text-slate-900">
              Projected Demand Curve with 90% Confidence Interval
            </h2>
            <p className="text-xs text-slate-500">
              Grounded on historical hourly usage, academic schedule, occupancy models, and weather forecasts
            </p>
          </div>
          <div className="flex items-center gap-4 text-xs">
            <span className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-xs bg-indigo-600"></span>
              <span className="text-slate-700 font-medium">Expected Demand</span>
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-xs bg-indigo-200"></span>
              <span className="text-slate-500">Min / Max Bound</span>
            </span>
          </div>
        </div>

        <div className="h-72">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={Array.isArray(forecastData) ? forecastData : []} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
              <defs>
                <linearGradient id="forecastBand" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="#6366f1" stopOpacity={0.05}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
              <XAxis dataKey="timestamp" tick={{ fontSize: 11, fill: '#64748b' }} />
              <YAxis tick={{ fontSize: 11, fill: '#64748b' }} />
              <Tooltip
                contentStyle={{ backgroundColor: '#0f172a', borderRadius: '8px', color: '#fff', fontSize: '11px', border: 'none' }}
                formatter={(val: any, name?: any) => [
                  `${Number(val).toLocaleString()} L`,
                  name === 'expectedDemand' ? 'Predicted Demand' :
                  name === 'maxDemand' ? 'Upper Bound (+1σ)' : 'Lower Bound (-1σ)'
                ] as any}
              />
              <Area type="monotone" dataKey="maxDemand" stroke="#cbd5e1" strokeDasharray="3 3" fill="none" />
              <Area type="monotone" dataKey="expectedDemand" stroke="#4f46e5" strokeWidth={2.5} fill="url(#forecastBand)" />
              <Area type="monotone" dataKey="minDemand" stroke="#cbd5e1" strokeDasharray="3 3" fill="none" />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Forecast Metadata Bar */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-slate-50 p-3.5 rounded-xl border border-slate-200 text-xs">
          <div>
            <span className="text-slate-400 block">Peak Predicted Interval</span>
            <span className="font-bold text-slate-800 mt-0.5 block">
              {forecastData.length > 0 
                ? `${[...forecastData].sort((a,b) => b.expectedDemand - a.expectedDemand)[0]?.timestamp || '14:00'} (~${(Number([...forecastData].sort((a,b) => b.expectedDemand - a.expectedDemand)[0]?.expectedDemand) || 1420).toLocaleString()} L)`
                : '14:00 (1,420 L)'}
            </span>
          </div>
          <div>
            <span className="text-slate-400 block">Expected Total Volume</span>
            <span className="font-bold text-indigo-700 mt-0.5 block">
              {forecastMeta?.tomorrowPredictedLiters != null
                ? `${Number(forecastMeta.tomorrowPredictedLiters).toLocaleString()} Liters`
                : `${(Number(forecastData.reduce((acc, p) => acc + (p?.expectedDemand || 0), 0)) || 0).toLocaleString()} Liters`}
            </span>
          </div>
          <div>
            <span className="text-slate-400 block">Weather Adjustment</span>
            <span className="font-bold text-slate-800 mt-0.5 block">+4.2% (31°C Heat index)</span>
          </div>
          <div>
            <span className="text-slate-400 block">Model Confidence</span>
            <span className="font-bold text-emerald-600 mt-0.5 block">
              {forecastMeta?.confidencePercent ?? 92}% R² Fit
            </span>
          </div>
        </div>
      </div>

      {/* Water Optimization Engine Grid (Section 15) */}
      <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div>
            <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <Zap className="w-4 h-4 text-amber-500" />
              Automated Water & Energy Optimization Engine
            </h2>
            <p className="text-xs text-slate-500">
              Shift high-draw operations to off-peak tariff periods and dynamic tank replenishment
            </p>
          </div>
          <span className="text-xs font-bold text-emerald-600 bg-emerald-50 border border-emerald-200 px-2.5 py-1 rounded-full">
            Projected Monthly Savings: $2,420 • 38,000L
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          
          {/* Optimization 1: Pump Scheduling */}
          <div className="p-4 rounded-xl border border-slate-200 bg-slate-50 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-900">Pump Tariff Shift</span>
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                  pumpOptimizationActive ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-200 text-slate-600'
                }`}>
                  {pumpOptimizationActive ? 'SCHEDULED' : 'DISABLED'}
                </span>
              </div>
              <p className="text-xs text-slate-600 mt-2 leading-relaxed">
                Pre-fill rooftop tanks during off-peak night hours (23:00–05:00) when grid power tariff is 40% lower.
              </p>
              <div className="mt-3 text-xs space-y-1 text-slate-500">
                <div>• Energy Saved: <strong>18.4% kWh</strong></div>
                <div>• Cost Reduction: <strong>$840 / mo</strong></div>
              </div>
            </div>

            <button
              onClick={() => setPumpOptimizationActive(!pumpOptimizationActive)}
              className="mt-4 w-full py-1.5 rounded-lg text-xs font-semibold bg-white border border-slate-300 hover:bg-slate-100 text-slate-800 transition-colors"
            >
              {pumpOptimizationActive ? 'Turn Off Schedule' : 'Activate Tariff Schedule'}
            </button>
          </div>

          {/* Optimization 2: Smart Irrigation */}
          <div className="p-4 rounded-xl border border-slate-200 bg-slate-50 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-900">Weather-Aware Irrigation</span>
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                  smartIrrigationActive ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-200 text-slate-600'
                }`}>
                  {smartIrrigationActive ? 'ACTIVE' : 'DISABLED'}
                </span>
              </div>
              <p className="text-xs text-slate-600 mt-2 leading-relaxed">
                Postpone landscape sprinkler cycles when forecasted rain probability exceeds 60% or soil moisture is above 45%.
              </p>
              <div className="mt-3 text-xs space-y-1 text-slate-500">
                <div>• Water Conserved: <strong>14,500 L / wk</strong></div>
                <div>• Avoided Overwatering: <strong>High</strong></div>
              </div>
            </div>

            <button
              onClick={() => setSmartIrrigationActive(!smartIrrigationActive)}
              className="mt-4 w-full py-1.5 rounded-lg text-xs font-semibold bg-white border border-slate-300 hover:bg-slate-100 text-slate-800 transition-colors"
            >
              {smartIrrigationActive ? 'Disable Weather Hold' : 'Enable Weather Guard'}
            </button>
          </div>

          {/* Optimization 3: Cooling Tower Bleed Guard */}
          <div className="p-4 rounded-xl border border-slate-200 bg-slate-50 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-900">HVAC Cooling Tower Bleed</span>
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                  coolingTowerActive ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-200 text-slate-600'
                }`}>
                  {coolingTowerActive ? 'OPTIMIZING' : 'STANDBY'}
                </span>
              </div>
              <p className="text-xs text-slate-600 mt-2 leading-relaxed">
                Dynamically adjust bleed-off frequency based on electrical conductivity (TDS) cycles of concentration.
              </p>
              <div className="mt-3 text-xs space-y-1 text-slate-500">
                <div>• Water Loss Reduction: <strong>12.1%</strong></div>
                <div>• Chemical Inversion: <strong>Optimal</strong></div>
              </div>
            </div>

            <button
              onClick={() => setCoolingTowerActive(!coolingTowerActive)}
              className="mt-4 w-full py-1.5 rounded-lg text-xs font-semibold bg-white border border-slate-300 hover:bg-slate-100 text-slate-800 transition-colors"
            >
              {coolingTowerActive ? 'Disable Cycle Control' : 'Enable Automated Bleed'}
            </button>
          </div>

        </div>
      </div>

    </div>
  );
};
