import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { SimulationMode } from '../../types';
import {
  SlidersHorizontal,
  Play,
  RotateCcw,
  Radio,
  Sparkles,
  Zap,
  TrendingDown,
  DollarSign,
  Leaf,
  CheckCircle2,
  AlertTriangle,
  Flame,
  ShieldCheck
} from 'lucide-react';

export const DigitalTwinSimulator: React.FC = () => {
  const { simulationMode, setSimulationMode, injectSimulationEvent } = useApp();

  // What-If Sliders
  const [pressureReductionBar, setPressureReductionBar] = useState(0.8);
  const [aeratorAdoptionPercent, setAeratorAdoptionPercent] = useState(40);
  const [nightPumpingShiftPercent, setNightPumpingShiftPercent] = useState(70);
  const [rainwaterHarvestingPercent, setRainwaterHarvestingPercent] = useState(25);
  const [occupancyMultiplier, setOccupancyMultiplier] = useState(1.0);

  // Dynamic calculations based on sliders
  const baselineDailyLiters = 78000;
  const pressureSavings = pressureReductionBar * 6200;
  const aeratorSavings = (aeratorAdoptionPercent / 100) * 14000;
  const pumpSavings = (nightPumpingShiftPercent / 100) * 5400;
  const rainSavings = (rainwaterHarvestingPercent / 100) * 8500;

  const totalDailySavedLiters = Math.round((pressureSavings + aeratorSavings + pumpSavings + rainSavings) * occupancyMultiplier);
  const totalMonthlyCostSaved = Math.round((totalDailySavedLiters * 30 * 0.0038) + (nightPumpingShiftPercent * 12));
  const annualCo2AvoidedKg = Math.round(totalDailySavedLiters * 365 * 0.00042);
  const percentSaved = ((totalDailySavedLiters / baselineDailyLiters) * 100).toFixed(1);

  const simulationModes: { mode: SimulationMode; label: string; desc: string; badge: string; color: string }[] = [
    { mode: 'NORMAL', label: 'Nominal Steady State', desc: 'Standard operating telemetry across all buildings.', badge: 'Nominal', color: 'border-emerald-200 hover:border-emerald-500 bg-emerald-50/40' },
    { mode: 'LEAKAGE_RISK', label: 'Pipe Fracture & Leak', desc: 'Flow spike + sudden localized pressure drop in Block A.', badge: 'Critical', color: 'border-rose-200 hover:border-rose-500 bg-rose-50/40' },
    { mode: 'HIGH_CONSUMPTION', label: 'Commercial High Draw', desc: 'Elevated demand in Dining & Labs exceeding 2.2x normal.', badge: 'Warning', color: 'border-amber-200 hover:border-amber-500 bg-amber-50/40' },
    { mode: 'PRESSURE_DROP', label: 'Booster Pump Failure', desc: 'Supply line head drop below 2.0 bar.', badge: 'Alert', color: 'border-rose-200 hover:border-rose-500 bg-rose-50/40' },
    { mode: 'TANK_OVERFLOW', label: 'Rooftop Float Stuck', desc: 'Tank capacity > 98% with continuous inflow.', badge: 'Hazard', color: 'border-blue-200 hover:border-blue-500 bg-blue-50/40' },
    { mode: 'LOW_TANK', label: 'Severe Tank Depletion', desc: 'Water reservoir drops below critical 15% threshold.', badge: 'Critical', color: 'border-amber-200 hover:border-amber-500 bg-amber-50/40' },
    { mode: 'SENSOR_FAILURE', label: 'Transducer Telemetry Error', desc: 'Intermittent packet loss and NaN telemetry values.', badge: 'IoT Glitch', color: 'border-purple-200 hover:border-purple-500 bg-purple-50/40' },
    { mode: 'WATER_QUALITY_ANOMALY', label: 'Contamination Ingress', desc: 'Turbidity spikes to 4.2 NTU and pH drops to 5.8.', badge: 'Quality', color: 'border-teal-200 hover:border-teal-500 bg-teal-50/40' },
    { mode: 'RANDOM_ANOMALY', label: 'Stochastic Stress Test', desc: 'Randomized noise and cyclical micro-bursts.', badge: 'Chaos', color: 'border-slate-200 hover:border-slate-500 bg-slate-50/40' }
  ];

  const applyPreset = (name: string) => {
    if (name === 'aggressive') {
      setPressureReductionBar(1.2);
      setAeratorAdoptionPercent(80);
      setNightPumpingShiftPercent(90);
      setRainwaterHarvestingPercent(50);
    } else if (name === 'drought') {
      setPressureReductionBar(1.5);
      setAeratorAdoptionPercent(100);
      setNightPumpingShiftPercent(80);
      setRainwaterHarvestingPercent(70);
    } else {
      setPressureReductionBar(0.5);
      setAeratorAdoptionPercent(20);
      setNightPumpingShiftPercent(50);
      setRainwaterHarvestingPercent(10);
    }
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6 max-w-7xl mx-auto">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-black text-slate-900 tracking-tight flex items-center gap-2">
              <SlidersHorizontal className="w-5 h-5 text-cyan-600" />
              Digital Twin Simulator & What-If Sandbox
            </h1>
            <span className="text-[10px] font-mono uppercase bg-cyan-100 text-cyan-800 font-bold px-2 py-0.5 rounded-full">
              Physics & Policy Engine
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Simulate policy scenarios, retrofit impacts, and trigger live IoT fault scenarios
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold text-slate-500">Preset Scenarios:</span>
          <button
            onClick={() => applyPreset('moderate')}
            className="px-2.5 py-1 text-xs font-medium rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors"
          >
            Conservative
          </button>
          <button
            onClick={() => applyPreset('aggressive')}
            className="px-2.5 py-1 text-xs font-medium rounded-lg bg-cyan-50 hover:bg-cyan-100 text-cyan-800 font-semibold border border-cyan-200 transition-colors"
          >
            Aggressive (-25%)
          </button>
          <button
            onClick={() => applyPreset('drought')}
            className="px-2.5 py-1 text-xs font-medium rounded-lg bg-amber-50 hover:bg-amber-100 text-amber-800 font-semibold border border-amber-200 transition-colors"
          >
            Drought Protocol
          </button>
        </div>
      </div>

      {/* Real-Time What-If Impact Summary Card (Section 14) */}
      <div className="bg-linear-to-r from-slate-900 via-cyan-950 to-blue-950 rounded-2xl p-6 text-white shadow-xl">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div>
            <span className="text-cyan-400 text-xs font-bold uppercase tracking-wider">
              Simulated Forecast Outcome
            </span>
            <h2 className="text-2xl sm:text-3xl font-black text-white mt-1">
              {percentSaved}% Water Consumption Reduction
            </h2>
            <p className="text-xs text-slate-300 mt-1 max-w-xl leading-relaxed">
              Based on the simulated engineering adjustments below, campus consumption drops by {totalDailySavedLiters.toLocaleString()} Liters every 24 hours.
            </p>
          </div>

          <div className="grid grid-cols-3 gap-4 bg-white/10 backdrop-blur-md p-4 rounded-xl border border-white/10 text-center">
            <div>
              <span className="text-xl sm:text-2xl font-black text-cyan-300 font-mono">
                {totalDailySavedLiters.toLocaleString()}
              </span>
              <span className="block text-[10px] text-slate-300 uppercase mt-0.5">Liters Saved / Day</span>
            </div>
            <div className="border-x border-white/10 px-2">
              <span className="text-xl sm:text-2xl font-black text-emerald-300 font-mono">
                ${totalMonthlyCostSaved.toLocaleString()}
              </span>
              <span className="block text-[10px] text-slate-300 uppercase mt-0.5">Monthly Utility ROI</span>
            </div>
            <div>
              <span className="text-xl sm:text-2xl font-black text-amber-300 font-mono">
                {annualCo2AvoidedKg.toLocaleString()}
              </span>
              <span className="block text-[10px] text-slate-300 uppercase mt-0.5">kg CO2 Avoided / Yr</span>
            </div>
          </div>
        </div>
      </div>

      {/* Two Columns: What-If Slider Controls vs IoT Fault Injection Matrix */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* What-If Sliders */}
        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs space-y-5">
          <div className="pb-3 border-b border-slate-100">
            <h2 className="text-sm font-bold text-slate-900">
              Facility Parameter Sliders
            </h2>
            <p className="text-xs text-slate-500">
              Drag parameters to evaluate hydraulic balance and water savings in real-time
            </p>
          </div>

          <div className="space-y-4 text-xs">
            
            {/* Slider 1: Pressure Reduction */}
            <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200">
              <div className="flex justify-between items-center mb-1.5">
                <span className="font-bold text-slate-800">Night Pressure Reduction</span>
                <span className="font-mono font-bold text-cyan-700">-{pressureReductionBar} bar</span>
              </div>
              <input
                type="range"
                min="0"
                max="2.0"
                step="0.1"
                value={pressureReductionBar}
                onChange={(e) => setPressureReductionBar(parseFloat(e.target.value))}
                className="w-full accent-cyan-600 cursor-pointer"
              />
              <div className="flex justify-between text-[10px] text-slate-400 mt-1">
                <span>0.0 bar (Baseline)</span>
                <span>Savings: ~{Math.round(pressureSavings).toLocaleString()} L/day</span>
                <span>-2.0 bar (Max)</span>
              </div>
            </div>

            {/* Slider 2: Aerator Adoption */}
            <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200">
              <div className="flex justify-between items-center mb-1.5">
                <span className="font-bold text-slate-800">Low-Flow Fixtures & Aerators</span>
                <span className="font-mono font-bold text-cyan-700">{aeratorAdoptionPercent}% Retrofitted</span>
              </div>
              <input
                type="range"
                min="0"
                max="100"
                step="5"
                value={aeratorAdoptionPercent}
                onChange={(e) => setAeratorAdoptionPercent(parseInt(e.target.value))}
                className="w-full accent-cyan-600 cursor-pointer"
              />
              <div className="flex justify-between text-[10px] text-slate-400 mt-1">
                <span>0% (Standard)</span>
                <span>Savings: ~{Math.round(aeratorSavings).toLocaleString()} L/day</span>
                <span>100% (Campus-wide)</span>
              </div>
            </div>

            {/* Slider 3: Night Pumping Shift */}
            <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200">
              <div className="flex justify-between items-center mb-1.5">
                <span className="font-bold text-slate-800">Off-Peak Night Pump Shift</span>
                <span className="font-mono font-bold text-cyan-700">{nightPumpingShiftPercent}% Scheduled</span>
              </div>
              <input
                type="range"
                min="0"
                max="100"
                step="5"
                value={nightPumpingShiftPercent}
                onChange={(e) => setNightPumpingShiftPercent(parseInt(e.target.value))}
                className="w-full accent-cyan-600 cursor-pointer"
              />
              <div className="flex justify-between text-[10px] text-slate-400 mt-1">
                <span>0% (Day pumping)</span>
                <span>Power Tariff Cut: 40%</span>
                <span>100% (Strict night)</span>
              </div>
            </div>

            {/* Slider 4: Rainwater Utilization */}
            <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200">
              <div className="flex justify-between items-center mb-1.5">
                <span className="font-bold text-slate-800">Rainwater Harvesting Re-injection</span>
                <span className="font-mono font-bold text-cyan-700">{rainwaterHarvestingPercent}% Demand Met</span>
              </div>
              <input
                type="range"
                min="0"
                max="80"
                step="5"
                value={rainwaterHarvestingPercent}
                onChange={(e) => setRainwaterHarvestingPercent(parseInt(e.target.value))}
                className="w-full accent-cyan-600 cursor-pointer"
              />
              <div className="flex justify-between text-[10px] text-slate-400 mt-1">
                <span>0% (Municipal only)</span>
                <span>Offset: ~{Math.round(rainSavings).toLocaleString()} L/day</span>
                <span>80% (Max catch)</span>
              </div>
            </div>

          </div>
        </div>

        {/* IoT Fault Injection Matrix (Section 19) */}
        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div>
              <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <Radio className="w-4 h-4 text-rose-500 animate-pulse" />
                Live IoT Fault Injection Matrix
              </h2>
              <p className="text-xs text-slate-500">
                Test how JalRakshak's anomaly detector reacts in real-time
              </p>
            </div>
            <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-slate-100 text-slate-700 border">
              Active: {simulationMode}
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 max-h-[420px] overflow-y-auto pr-1">
            {simulationModes.map(item => (
              <button
                key={item.mode}
                onClick={() => setSimulationMode(item.mode)}
                className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
                  simulationMode === item.mode
                    ? 'ring-2 ring-cyan-500 bg-cyan-50/50 border-cyan-400 shadow-xs'
                    : item.color
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="font-bold text-xs text-slate-900 truncate">
                    {item.label}
                  </span>
                  <span className="text-[9px] font-bold px-1.5 py-0.2 rounded bg-white text-slate-700 border shadow-2xs">
                    {item.badge}
                  </span>
                </div>
                <p className="text-[11px] text-slate-600 mt-1 line-clamp-2">
                  {item.desc}
                </p>
              </button>
            ))}
          </div>

          <div className="pt-2 border-t border-slate-100 flex justify-between items-center">
            <span className="text-[11px] text-slate-400">
              Click any scenario to immediately stream altered telemetry via SSE
            </span>
            <button
              onClick={() => injectSimulationEvent('RESET')}
              className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-slate-900 text-white hover:bg-slate-800 transition-colors flex items-center gap-1.5"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              Reset All to Normal
            </button>
          </div>
        </div>

      </div>

    </div>
  );
};
