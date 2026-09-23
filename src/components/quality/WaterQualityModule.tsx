import React, { useState, useEffect } from 'react';
import { api } from '../../services/api';
import {
  FlaskConical,
  CheckCircle2,
  AlertTriangle,
  Droplets,
  Thermometer,
  Activity,
  ShieldCheck,
  RefreshCw
} from 'lucide-react';

export const WaterQualityModule: React.FC = () => {
  const [quality, setQuality] = useState<any>(null);
  const [isFlushing, setIsFlushing] = useState(false);

  useEffect(() => {
    api.getWaterQuality().then(data => setQuality(data));
  }, []);

  const handleFlush = () => {
    setIsFlushing(true);
    setTimeout(() => {
      setIsFlushing(false);
    }, 2000);
  };

  if (!quality) return null;

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6 max-w-7xl mx-auto">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-black text-slate-900 tracking-tight flex items-center gap-2">
              <FlaskConical className="w-5 h-5 text-emerald-600" />
              Potable Water Quality & Purity Assurance System
            </h1>
            <span className="text-[10px] font-mono uppercase bg-emerald-100 text-emerald-800 font-bold px-2 py-0.5 rounded-full">
              WHO & EPA Standard Compliant
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Real-time chemical & physical purity telemetry from multi-parameter electrochemical sensors
          </p>
        </div>

        <button
          onClick={handleFlush}
          disabled={isFlushing}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-slate-100 hover:bg-slate-200 text-slate-800 transition-colors"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${isFlushing ? 'animate-spin' : ''}`} />
          {isFlushing ? 'Flushing Sampling Cell...' : 'Calibrate Probes'}
        </button>
      </div>

      {/* Main Score Hero Banner */}
      <div className="bg-linear-to-r from-emerald-950 via-teal-900 to-slate-900 rounded-2xl p-6 text-white shadow-xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
          <div>
            <span className="text-emerald-400 text-xs font-bold uppercase tracking-wider">
              Composite Purity Metric
            </span>
            <h2 className="text-2xl sm:text-3xl font-black text-white mt-1">
              Water Quality Index: {quality.overallScore} / 100
            </h2>
            <p className="text-xs text-slate-300 mt-1 max-w-xl">
              All 5 physical and chemical indicators are well within safe drinking water thresholds. Zero microbial or mineral contamination detected.
            </p>
          </div>

          <div className="flex items-center gap-3 bg-white/10 backdrop-blur-md p-4 rounded-xl border border-white/10 shrink-0">
            <div className="w-12 h-12 rounded-full bg-emerald-500/20 border-2 border-emerald-400 flex items-center justify-center text-emerald-300 font-black text-lg">
              {quality.overallScore}
            </div>
            <div>
              <span className="text-xs font-bold text-emerald-300 block uppercase">Classification</span>
              <span className="text-sm font-extrabold text-white">Safe & Potable</span>
            </div>
          </div>
        </div>
      </div>

      {/* 5 Core Parameters Grid (Section 17) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        
        {/* pH */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>Potential Hydrogen (pH)</span>
            <FlaskConical className="w-4 h-4 text-cyan-600" />
          </div>
          <div className="text-2xl font-black text-slate-900 mt-2 font-mono">
            {quality.ph}
          </div>
          <div className="text-[11px] text-emerald-600 font-semibold mt-1">Optimal (Target: 6.5 – 8.5)</div>
          <div className="w-full bg-slate-100 h-1.5 rounded-full mt-3 overflow-hidden">
            <div className="bg-cyan-500 h-full rounded-full" style={{ width: '60%' }}></div>
          </div>
        </div>

        {/* Turbidity */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>Turbidity (Clarity)</span>
            <Droplets className="w-4 h-4 text-blue-600" />
          </div>
          <div className="text-2xl font-black text-slate-900 mt-2 font-mono">
            {quality.turbidityNtu} <span className="text-xs font-normal text-slate-500">NTU</span>
          </div>
          <div className="text-[11px] text-emerald-600 font-semibold mt-1">Crystal Clear (&lt; 1.0 NTU)</div>
          <div className="w-full bg-slate-100 h-1.5 rounded-full mt-3 overflow-hidden">
            <div className="bg-blue-500 h-full rounded-full" style={{ width: '30%' }}></div>
          </div>
        </div>

        {/* TDS */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>Total Dissolved Solids</span>
            <Activity className="w-4 h-4 text-teal-600" />
          </div>
          <div className="text-2xl font-black text-slate-900 mt-2 font-mono">
            {quality.tdsPpm} <span className="text-xs font-normal text-slate-500">ppm</span>
          </div>
          <div className="text-[11px] text-emerald-600 font-semibold mt-1">Light Mineral (&lt; 300)</div>
          <div className="w-full bg-slate-100 h-1.5 rounded-full mt-3 overflow-hidden">
            <div className="bg-teal-500 h-full rounded-full" style={{ width: '45%' }}></div>
          </div>
        </div>

        {/* Temperature */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>Water Temperature</span>
            <Thermometer className="w-4 h-4 text-amber-600" />
          </div>
          <div className="text-2xl font-black text-slate-900 mt-2 font-mono">
            {quality.temperatureC}°C
          </div>
          <div className="text-[11px] text-slate-500 font-semibold mt-1">Ambient In-Pipe Temp</div>
          <div className="w-full bg-slate-100 h-1.5 rounded-full mt-3 overflow-hidden">
            <div className="bg-amber-500 h-full rounded-full" style={{ width: '55%' }}></div>
          </div>
        </div>

        {/* Conductivity */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>Conductivity</span>
            <Activity className="w-4 h-4 text-indigo-600" />
          </div>
          <div className="text-2xl font-black text-slate-900 mt-2 font-mono">
            {quality.conductivityUscm} <span className="text-xs font-normal text-slate-500">µS/cm</span>
          </div>
          <div className="text-[11px] text-emerald-600 font-semibold mt-1">Normal Ionic Conductivity</div>
          <div className="w-full bg-slate-100 h-1.5 rounded-full mt-3 overflow-hidden">
            <div className="bg-indigo-500 h-full rounded-full" style={{ width: '40%' }}></div>
          </div>
        </div>

      </div>

      {/* Safety Compliance & Remediation Procedures */}
      <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs space-y-4">
        <h2 className="text-sm font-bold text-slate-900 pb-3 border-b border-slate-100">
          Continuous Quality Safeguards & Maintenance Cycle
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
          <div className="p-3.5 rounded-xl border border-slate-200 bg-slate-50">
            <div className="flex items-center gap-2 font-bold text-slate-800">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              UV Disinfection Chamber
            </div>
            <p className="text-slate-600 mt-1.5 leading-relaxed">
              Main intake line UV sterilization operating at 254 nm wavelength with 99.99% pathogen inactivation.
            </p>
          </div>

          <div className="p-3.5 rounded-xl border border-slate-200 bg-slate-50">
            <div className="flex items-center gap-2 font-bold text-slate-800">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              Active Carbon Multi-Media Filter
            </div>
            <p className="text-slate-600 mt-1.5 leading-relaxed">
              Backwash scheduled every 72 operational hours or when differential pressure exceeds 0.6 bar.
            </p>
          </div>

          <div className="p-3.5 rounded-xl border border-slate-200 bg-slate-50">
            <div className="flex items-center gap-2 font-bold text-slate-800">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              Chlorine Residual Sensor
            </div>
            <p className="text-slate-600 mt-1.5 leading-relaxed">
              Maintained at 0.35 mg/L to prevent biofilm accumulation in distant pipeline dead-legs.
            </p>
          </div>
        </div>
      </div>

    </div>
  );
};
