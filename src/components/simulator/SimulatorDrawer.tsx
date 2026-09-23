import React from 'react';
import { useApp } from '../../context/AppContext';
import { SimulationMode } from '../../types';
import {
  X,
  Radio,
  RotateCcw,
  Sliders,
  CheckCircle2,
  AlertTriangle,
  Zap,
  Activity
} from 'lucide-react';

export const SimulatorDrawer: React.FC = () => {
  const {
    isSimulatorDrawerOpen,
    setIsSimulatorDrawerOpen,
    simulationMode,
    setSimulationMode,
    injectSimulationEvent,
    telemetry
  } = useApp();

  if (!isSimulatorDrawerOpen) return null;

  const modes: { mode: SimulationMode; label: string; desc: string }[] = [
    { mode: 'NORMAL', label: '1. Nominal Flow & Baseline', desc: 'Standard operating telemetry across all zones.' },
    { mode: 'LEAKAGE_RISK', label: '2. High Leakage in Block A', desc: 'Sustained night flow + sudden hydraulic head pressure drop.' },
    { mode: 'HIGH_CONSUMPTION', label: '3. Dining & Lab Peak Demand', desc: 'Excessive volume drawn across fixture manifolds.' },
    { mode: 'PRESSURE_DROP', label: '4. Booster Pump Head Loss', desc: 'Main supply pressure drops below 2.0 bar threshold.' },
    { mode: 'TANK_OVERFLOW', label: '5. Rooftop Tank Overflow', desc: 'Reservoir level reaches 99% with active inflow.' },
    { mode: 'LOW_TANK', label: '6. Reservoir Depletion Alarm', desc: 'Rooftop level falls below critical 15% buffer.' },
    { mode: 'SENSOR_FAILURE', label: '7. IoT Transducer Fault', desc: 'Telemetry dropout and packet loss glitch.' },
    { mode: 'WATER_QUALITY_ANOMALY', label: '8. Turbidity Spike Event', desc: 'Purity score drops with elevated suspended solids.' },
    { mode: 'RANDOM_ANOMALY', label: '9. Stochastic Stress Test', desc: 'Randomized noise and unpredictable micro-bursts.' }
  ];

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex justify-end animate-in fade-in">
      <div className="bg-white w-full max-w-md h-full shadow-2xl flex flex-col border-l border-slate-200 animate-in slide-in-from-right duration-200">
        
        {/* Drawer Header */}
        <div className="p-4 bg-slate-900 text-white flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sliders className="w-5 h-5 text-cyan-400" />
            <div>
              <h3 className="font-bold text-sm">IoT Telemetry Simulator</h3>
              <p className="text-[11px] text-slate-400">Select active scenario or inject faults</p>
            </div>
          </div>
          <button
            onClick={() => setIsSimulatorDrawerOpen(false)}
            className="p-1 rounded-lg text-slate-400 hover:text-white"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Current State Bar */}
        <div className="bg-slate-100 p-3 border-b border-slate-200 flex justify-between items-center text-xs">
          <div>
            <span className="text-slate-500">Active Mode:</span>{' '}
            <strong className="text-slate-900 font-mono">{simulationMode}</strong>
          </div>
          <div className="text-right">
            <span className="text-slate-500">Flow:</span>{' '}
            <strong className="text-cyan-700 font-mono">{telemetry.flowRateLpm} L/m</strong>
          </div>
        </div>

        {/* Modes Selection */}
        <div className="flex-1 p-4 overflow-y-auto space-y-2.5 custom-scrollbar">
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
            Available Simulation Scenarios
          </span>

          {modes.map(m => (
            <button
              key={m.mode}
              onClick={() => setSimulationMode(m.mode)}
              className={`w-full p-3 rounded-xl border text-left transition-all cursor-pointer ${
                simulationMode === m.mode
                  ? 'bg-cyan-50 border-cyan-500 ring-2 ring-cyan-500/20 shadow-xs'
                  : 'bg-white hover:bg-slate-50 border-slate-200'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="font-bold text-xs text-slate-900">{m.label}</span>
                {simulationMode === m.mode && (
                  <CheckCircle2 className="w-4 h-4 text-cyan-600" />
                )}
              </div>
              <p className="text-[11px] text-slate-500 mt-1 leading-normal">{m.desc}</p>
            </button>
          ))}
        </div>

        {/* Quick Reset & Injection Footer */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 space-y-2">
          <button
            onClick={() => injectSimulationEvent('RESET')}
            className="w-full py-2 px-3 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-semibold text-xs transition-colors flex items-center justify-center gap-2"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            Reset to Baseline Normal
          </button>
        </div>

      </div>
    </div>
  );
};
