import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { api } from '../../services/api';
import { LeakThresholdConfig, SensitivityPreset, ThresholdTestResult } from '../../types';
import {
  Sliders,
  ShieldCheck,
  AlertTriangle,
  Zap,
  Gauge,
  Clock,
  Radio,
  Building2,
  CheckCircle2,
  Save,
  RotateCcw,
  Sparkles,
  Lock,
  ArrowRight,
  Info,
  Activity,
  Volume2,
  Check,
  ShieldAlert,
  Settings2,
  Battery,
  BatteryWarning
} from 'lucide-react';

const PRESET_CONFIGS: Record<SensitivityPreset, {
  name: string;
  tagline: string;
  pressureDropBar: number;
  nightFlowExceedancePercent: number;
  continuousFlowDurationMinutes: number;
  acousticVibrationThresholdDb: number;
  minConfidencePercent: number;
  badgeColor: string;
}> = {
  aggressive: {
    name: 'Aggressive / High Sensitivity',
    tagline: 'Earliest detection for research labs, cleanrooms, and critical risers. Slightly higher risk of false alerts.',
    pressureDropBar: 0.25,
    nightFlowExceedancePercent: 25,
    continuousFlowDurationMinutes: 15,
    acousticVibrationThresholdDb: 50,
    minConfidencePercent: 65,
    badgeColor: 'border-rose-500 bg-rose-50 text-rose-800'
  },
  standard: {
    name: 'Standard / Balanced (Recommended)',
    tagline: 'Optimal trade-off between leak detection speed and false-alarm suppression for university campuses.',
    pressureDropBar: 0.40,
    nightFlowExceedancePercent: 40,
    continuousFlowDurationMinutes: 30,
    acousticVibrationThresholdDb: 62,
    minConfidencePercent: 75,
    badgeColor: 'border-cyan-500 bg-cyan-50 text-cyan-800'
  },
  conservative: {
    name: 'Conservative / High Confidence',
    tagline: 'Suppresses false positives strictly. Best for outdoor irrigation, heavy kitchen lines, or construction zones.',
    pressureDropBar: 0.75,
    nightFlowExceedancePercent: 80,
    continuousFlowDurationMinutes: 60,
    acousticVibrationThresholdDb: 75,
    minConfidencePercent: 85,
    badgeColor: 'border-emerald-500 bg-emerald-50 text-emerald-800'
  },
  custom: {
    name: 'Custom Parameter Override',
    tagline: 'User-specified thresholds for tailored hydraulic architecture and distinct zoning rules.',
    pressureDropBar: 0.40,
    nightFlowExceedancePercent: 40,
    continuousFlowDurationMinutes: 30,
    acousticVibrationThresholdDb: 62,
    minConfidencePercent: 75,
    badgeColor: 'border-purple-500 bg-purple-50 text-purple-800'
  }
};

export const LeakSensitivityConfig: React.FC = () => {
  const {
    isAdmin,
    setUserRole,
    lowBatteryThresholdPercent,
    updateBatteryThresholds,
    batteryThresholdConfig
  } = useApp();

  const [config, setConfig] = useState<LeakThresholdConfig>({
    preset: 'standard',
    pressureDropBar: 0.40,
    nightFlowExceedancePercent: 40,
    continuousFlowDurationMinutes: 30,
    acousticVibrationThresholdDb: 62,
    minConfidencePercent: 75,
    autoTripIsolationValve: false,
    autoDispatchWorkOrder: true,
    alertChannels: ['in_app', 'email', 'sms'],
    buildingOverrides: {
      'bld-1': { multiplier: 1.25, name: 'Engineering Block A (Riser P-104 Zone)' },
      'bld-2': { multiplier: 1.0, name: 'Science Complex B' },
      'bld-3': { multiplier: 1.1, name: 'Central Administration C' },
      'bld-4': { multiplier: 0.85, name: 'Dining Hall & Hostel D' }
    },
    updatedAt: new Date().toISOString(),
    updatedBy: 'Admin (Plant Command)'
  });

  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [isTesting, setIsTesting] = useState(false);
  const [testResult, setTestResult] = useState<ThresholdTestResult | null>(null);

  useEffect(() => {
    api.getLeakThresholds().then((data) => {
      if (data && data.preset) {
        setConfig(data);
      }
    });
  }, []);

  const handleApplyPreset = (presetKey: SensitivityPreset) => {
    if (!isAdmin) return;
    const preset = PRESET_CONFIGS[presetKey];
    setConfig(prev => ({
      ...prev,
      preset: presetKey,
      pressureDropBar: preset.pressureDropBar,
      nightFlowExceedancePercent: preset.nightFlowExceedancePercent,
      continuousFlowDurationMinutes: preset.continuousFlowDurationMinutes,
      acousticVibrationThresholdDb: preset.acousticVibrationThresholdDb,
      minConfidencePercent: preset.minConfidencePercent
    }));
    setSaveSuccess(false);
    setTestResult(null);
  };

  const handleSliderChange = (field: keyof LeakThresholdConfig, value: any) => {
    if (!isAdmin) return;
    setConfig(prev => ({
      ...prev,
      preset: 'custom',
      [field]: value
    }));
    setSaveSuccess(false);
  };

  const handleBuildingMultiplierChange = (bldId: string, multiplier: number) => {
    if (!isAdmin) return;
    setConfig(prev => ({
      ...prev,
      preset: 'custom',
      buildingOverrides: {
        ...prev.buildingOverrides,
        [bldId]: {
          ...prev.buildingOverrides[bldId],
          multiplier
        }
      }
    }));
    setSaveSuccess(false);
  };

  const handleSave = async () => {
    if (!isAdmin) return;
    setIsSaving(true);
    try {
      await api.updateLeakThresholds({
        ...config,
        updatedBy: 'Lead Infrastructure Engineer (Admin)'
      });
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 4000);
    } catch (e) {
      console.error('Failed to save thresholds:', e);
    } finally {
      setIsSaving(false);
    }
  };

  const handleReset = () => {
    if (!isAdmin) return;
    handleApplyPreset('standard');
    setConfig(prev => ({
      ...prev,
      autoTripIsolationValve: false,
      autoDispatchWorkOrder: true,
      alertChannels: ['in_app', 'email', 'sms'],
      buildingOverrides: {
        'bld-1': { multiplier: 1.25, name: 'Engineering Block A (Riser P-104 Zone)' },
        'bld-2': { multiplier: 1.0, name: 'Science Complex B' },
        'bld-3': { multiplier: 1.1, name: 'Central Administration C' },
        'bld-4': { multiplier: 0.85, name: 'Dining Hall & Hostel D' }
      }
    }));
  };

  const handleRunSimulationTest = async () => {
    setIsTesting(true);
    try {
      const result = await api.testLeakThresholds(config);
      setTestResult(result);
    } catch (e) {
      console.error('Failed to test thresholds:', e);
    } finally {
      setIsTesting(false);
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-5 sm:p-7 shadow-xs space-y-7">
      
      {/* Configuration Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-slate-100">
        <div>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-cyan-600/10 text-cyan-700 flex items-center justify-center">
              <Settings2 className="w-4 h-4" />
            </div>
            <h2 className="text-lg font-black text-slate-900 tracking-tight">
              Water Leak Alert Sensitivity & Threshold Engine
            </h2>
            <span className="text-[10px] font-mono uppercase bg-cyan-50 text-cyan-800 border border-cyan-200 font-bold px-2 py-0.5 rounded-full">
              Dynamic SCADA Logic
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1 max-w-2xl">
            Configure hydraulic anomaly detection sensitivity, minimum pressure drop triggers, acoustic resonance parameters, and automated containment actions.
          </p>
        </div>

        {/* Admin Access Badge / Switch */}
        <div className="flex items-center gap-2">
          {isAdmin ? (
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              <span>Admin Authorized (Full Control)</span>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-50 border border-amber-200 text-amber-800 text-xs font-semibold">
                <Lock className="w-3.5 h-3.5 text-amber-600" />
                <span>View-Only Mode</span>
              </div>
              <button
                onClick={() => setUserRole('admin')}
                className="px-2.5 py-1.5 rounded-xl text-xs font-bold bg-slate-900 text-white hover:bg-slate-800 transition-colors cursor-pointer"
              >
                Switch to Admin
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Access Restriction Notice if not admin */}
      {!isAdmin && (
        <div className="bg-amber-500/10 border border-amber-500/30 rounded-xl p-3.5 flex items-center justify-between text-xs text-amber-900">
          <div className="flex items-center gap-2.5">
            <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
            <span>
              You are currently viewing leak sensitivity thresholds in <strong>Read-Only Mode</strong>. Admin Level role privileges are required to modify parameters and dispatch automated isolation valves.
            </span>
          </div>
          <button
            onClick={() => setUserRole('admin')}
            className="px-3 py-1 rounded-lg bg-amber-600 hover:bg-amber-700 text-white font-bold shrink-0 cursor-pointer transition-colors"
          >
            Unlock Admin Controls
          </button>
        </div>
      )}

      {/* Preset Modes Quick Selector */}
      <div className="space-y-3">
        <label className="text-xs font-bold uppercase tracking-wider text-slate-500 block">
          1. Sensitivity Presets
        </label>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {(['aggressive', 'standard', 'conservative'] as SensitivityPreset[]).map((key) => {
            const preset = PRESET_CONFIGS[key];
            const isSelected = config.preset === key;
            return (
              <button
                key={key}
                disabled={!isAdmin}
                onClick={() => handleApplyPreset(key)}
                className={`text-left p-4 rounded-xl border transition-all relative ${
                  isSelected
                    ? `${preset.badgeColor} border-2 shadow-xs ring-2 ring-cyan-500/20`
                    : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100 hover:border-slate-300'
                } ${!isAdmin ? 'cursor-not-allowed opacity-80' : 'cursor-pointer'}`}
              >
                {isSelected && (
                  <div className="absolute top-3 right-3 w-5 h-5 rounded-full bg-cyan-600 text-white flex items-center justify-center">
                    <Check className="w-3 h-3 stroke-[3]" />
                  </div>
                )}
                <div className="font-black text-sm text-slate-900">{preset.name}</div>
                <p className="text-[11px] text-slate-600 mt-1 line-clamp-2 leading-relaxed">
                  {preset.tagline}
                </p>

                <div className="mt-3 pt-3 border-t border-black/5 grid grid-cols-3 gap-1 text-[10px] font-mono text-slate-500">
                  <div>
                    <span className="block text-[9px] uppercase text-slate-400">Pressure</span>
                    <strong className="text-slate-800">-{preset.pressureDropBar} bar</strong>
                  </div>
                  <div>
                    <span className="block text-[9px] uppercase text-slate-400">Night Flow</span>
                    <strong className="text-slate-800">+{preset.nightFlowExceedancePercent}%</strong>
                  </div>
                  <div>
                    <span className="block text-[9px] uppercase text-slate-400">Duration</span>
                    <strong className="text-slate-800">{preset.continuousFlowDurationMinutes}m</strong>
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Fine-Tuning Interactive Parameter Controls */}
      <div className="space-y-4 pt-2">
        <div className="flex items-center justify-between">
          <label className="text-xs font-bold uppercase tracking-wider text-slate-500">
            2. Precision Hydraulic & Acoustic Thresholds
          </label>
          {config.preset === 'custom' && (
            <span className="text-[10px] font-mono uppercase bg-purple-100 text-purple-800 font-bold px-2 py-0.5 rounded-full">
              Custom Overrides Active
            </span>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          
          {/* Pressure Drop Trigger */}
          <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Gauge className="w-4 h-4 text-cyan-600" />
                <span className="text-xs font-bold text-slate-800">Dynamic Pressure Drop Trigger</span>
              </div>
              <span className="text-xs font-mono font-black text-cyan-700 bg-white px-2 py-0.5 rounded-md border border-slate-200">
                -{config.pressureDropBar.toFixed(2)} bar
              </span>
            </div>
            <p className="text-[11px] text-slate-500">
              Flags leak condition if distribution pressure falls below baseline by this threshold while pump is engaged.
            </p>
            <input
              type="range"
              min="0.10"
              max="1.50"
              step="0.05"
              disabled={!isAdmin}
              value={config.pressureDropBar}
              onChange={(e) => handleSliderChange('pressureDropBar', parseFloat(e.target.value))}
              className="w-full accent-cyan-600 cursor-pointer disabled:cursor-not-allowed"
            />
            <div className="flex justify-between text-[10px] text-slate-400 font-mono">
              <span>0.10 bar (Hypersensitive)</span>
              <span>0.75 bar (Standard)</span>
              <span>1.50 bar (Severe Ruptures Only)</span>
            </div>
          </div>

          {/* Night Flow Exceedance Spike */}
          <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Activity className="w-4 h-4 text-indigo-600" />
                <span className="text-xs font-bold text-slate-800">Night Flow Spike Exceedance</span>
              </div>
              <span className="text-xs font-mono font-black text-indigo-700 bg-white px-2 py-0.5 rounded-md border border-slate-200">
                +{config.nightFlowExceedancePercent}%
              </span>
            </div>
            <p className="text-[11px] text-slate-500">
              Minimum percentage above 01:00-05:00 baseline required to trigger non-revenue water alert.
            </p>
            <input
              type="range"
              min="10"
              max="150"
              step="5"
              disabled={!isAdmin}
              value={config.nightFlowExceedancePercent}
              onChange={(e) => handleSliderChange('nightFlowExceedancePercent', parseInt(e.target.value, 10))}
              className="w-full accent-indigo-600 cursor-pointer disabled:cursor-not-allowed"
            />
            <div className="flex justify-between text-[10px] text-slate-400 font-mono">
              <span>+10% (Micro-weeps)</span>
              <span>+40% (Standard)</span>
              <span>+150% (Open Fixture / Rupture)</span>
            </div>
          </div>

          {/* Continuous Non-Zero Flow Duration */}
          <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-emerald-600" />
                <span className="text-xs font-bold text-slate-800">Continuous Uninterrupted Flow</span>
              </div>
              <span className="text-xs font-mono font-black text-emerald-700 bg-white px-2 py-0.5 rounded-md border border-slate-200">
                {config.continuousFlowDurationMinutes} minutes
              </span>
            </div>
            <p className="text-[11px] text-slate-500">
              Duration of steady non-zero flow before an alert is raised (screens out extended normal water usage).
            </p>
            <input
              type="range"
              min="10"
              max="120"
              step="5"
              disabled={!isAdmin}
              value={config.continuousFlowDurationMinutes}
              onChange={(e) => handleSliderChange('continuousFlowDurationMinutes', parseInt(e.target.value, 10))}
              className="w-full accent-emerald-600 cursor-pointer disabled:cursor-not-allowed"
            />
            <div className="flex justify-between text-[10px] text-slate-400 font-mono">
              <span>10 min (Tight)</span>
              <span>30 min (Campus Default)</span>
              <span>120 min (High Tolerance)</span>
            </div>
          </div>

          {/* Acoustic Ultrasonic Vibration Threshold */}
          <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Volume2 className="w-4 h-4 text-purple-600" />
                <span className="text-xs font-bold text-slate-800">Acoustic Resonance Threshold</span>
              </div>
              <span className="text-xs font-mono font-black text-purple-700 bg-white px-2 py-0.5 rounded-md border border-slate-200">
                {config.acousticVibrationThresholdDb} dB
              </span>
            </div>
            <p className="text-[11px] text-slate-500">
              Pipe surface ultrasonic vibration frequency noise associated with high-pressure micro-fissure leakage.
            </p>
            <input
              type="range"
              min="40"
              max="90"
              step="1"
              disabled={!isAdmin}
              value={config.acousticVibrationThresholdDb}
              onChange={(e) => handleSliderChange('acousticVibrationThresholdDb', parseInt(e.target.value, 10))}
              className="w-full accent-purple-600 cursor-pointer disabled:cursor-not-allowed"
            />
            <div className="flex justify-between text-[10px] text-slate-400 font-mono">
              <span>40 dB (Ambient quiet)</span>
              <span>62 dB (Fissure jet)</span>
              <span>90 dB (High noise industrial)</span>
            </div>
          </div>

        </div>
      </div>

      {/* Building-Wise Sensitivity Multipliers */}
      <div className="space-y-3 pt-2">
        <label className="text-xs font-bold uppercase tracking-wider text-slate-500 block">
          3. Zone & Building-Specific Multipliers
        </label>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {Object.entries(config.buildingOverrides).map(([bldId, item]) => (
            <div key={bldId} className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
              <div className="flex items-center justify-between text-xs font-bold text-slate-900">
                <span className="truncate">{item.name}</span>
                <span className="font-mono text-cyan-700">{item.multiplier.toFixed(2)}x</span>
              </div>
              <input
                type="range"
                min="0.5"
                max="2.0"
                step="0.05"
                disabled={!isAdmin}
                value={item.multiplier}
                onChange={(e) => handleBuildingMultiplierChange(bldId, parseFloat(e.target.value))}
                className="w-full accent-cyan-600 cursor-pointer disabled:cursor-not-allowed"
              />
              <div className="flex justify-between text-[10px] text-slate-400 font-mono">
                <span>0.5x (Relaxed)</span>
                <span>1.0x</span>
                <span>2.0x (Heightened)</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Automated Containment & Escalation */}
      <div className="space-y-3 pt-2">
        <label className="text-xs font-bold uppercase tracking-wider text-slate-500 block">
          4. Automated Incident Response Protocols
        </label>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <label className={`flex items-start gap-3 p-3.5 rounded-xl border transition-colors ${
            config.autoDispatchWorkOrder
              ? 'bg-blue-50/60 border-blue-200 text-blue-900'
              : 'bg-slate-50 border-slate-200 text-slate-700'
          } ${isAdmin ? 'cursor-pointer' : 'cursor-not-allowed opacity-80'}`}>
            <input
              type="checkbox"
              disabled={!isAdmin}
              checked={config.autoDispatchWorkOrder}
              onChange={(e) => handleSliderChange('autoDispatchWorkOrder', e.target.checked)}
              className="mt-0.5 accent-blue-600 rounded"
            />
            <div>
              <span className="text-xs font-bold block">Auto-Dispatch High-Priority Maintenance Ticket</span>
              <p className="text-[11px] text-slate-500 mt-0.5">
                Automatically assigns inspection work order to on-duty plumbing technicians when model confidence exceeds {config.minConfidencePercent}%.
              </p>
            </div>
          </label>

          <label className={`flex items-start gap-3 p-3.5 rounded-xl border transition-colors ${
            config.autoTripIsolationValve
              ? 'bg-rose-50/60 border-rose-200 text-rose-900'
              : 'bg-slate-50 border-slate-200 text-slate-700'
          } ${isAdmin ? 'cursor-pointer' : 'cursor-not-allowed opacity-80'}`}>
            <input
              type="checkbox"
              disabled={!isAdmin}
              checked={config.autoTripIsolationValve}
              onChange={(e) => handleSliderChange('autoTripIsolationValve', e.target.checked)}
              className="mt-0.5 accent-rose-600 rounded"
            />
            <div>
              <span className="text-xs font-bold block">Auto-Trip Smart Motorized Isolation Valve</span>
              <p className="text-[11px] text-slate-500 mt-0.5">
                Automatically commands solenoid shutoff on catastrophic pressure drop (&gt; 1.20 bar) to prevent campus structural flooding.
              </p>
            </div>
          </label>
        </div>
      </div>

      {/* Remote IoT Sensor Low-Battery Alert Threshold Card (Admin) */}
      <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-amber-500 flex items-center justify-center text-white shadow-xs">
              <BatteryWarning className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-sm text-slate-900">
                Remote IoT Sensor Low-Battery Alert Threshold
              </h3>
              <p className="text-xs text-slate-500">
                Sets the battery percentage threshold that triggers proactive maintenance alerts in the top header
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-[11px] text-slate-400">Current Threshold:</span>
            <span className="text-sm font-extrabold font-mono text-amber-800 bg-amber-100/70 border border-amber-300 px-2.5 py-0.5 rounded-lg">
              {lowBatteryThresholdPercent}%
            </span>
          </div>
        </div>

        <div className="space-y-3">
          <div className="flex items-center justify-between text-xs">
            <span className="font-semibold text-slate-700">Warning Trigger Level:</span>
            <span className="font-bold text-amber-700 font-mono">
              Alerts header when charge &le; {lowBatteryThresholdPercent}%
            </span>
          </div>

          <input
            id="leak-config-battery-slider"
            type="range"
            disabled={!isAdmin}
            min={15}
            max={65}
            step={1}
            value={lowBatteryThresholdPercent}
            onChange={(e) => {
              if (isAdmin) {
                updateBatteryThresholds({ lowBatteryThresholdPercent: Number(e.target.value) });
              }
            }}
            className={`w-full h-2 bg-slate-200 rounded-lg appearance-none accent-amber-600 ${
              isAdmin ? 'cursor-pointer' : 'cursor-not-allowed opacity-70'
            }`}
          />

          <div className="flex justify-between text-[10px] text-slate-400 font-mono">
            <span>15% (Critical only)</span>
            <span>40% (Standard)</span>
            <span>65% (Conservative)</span>
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 p-2.5 rounded-xl bg-amber-50/70 border border-amber-200 text-xs text-amber-900">
            <span className="leading-snug">
              Sensors at or below <strong>{lowBatteryThresholdPercent}%</strong> will immediately trigger the glowing power beacon in the top header and generate proactive work orders for field technicians.
            </span>
            <div className="flex items-center gap-2 shrink-0">
              <button
                type="button"
                disabled={!isAdmin}
                onClick={() => updateBatteryThresholds({ lowBatteryThresholdPercent: 40 })}
                className="px-2 py-1 rounded bg-white hover:bg-amber-100 text-amber-900 border border-amber-300 text-[10px] font-bold transition-colors cursor-pointer"
              >
                Reset to 40%
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Simulation Impact Test Results Preview */}
      {testResult && (
        <div className="p-4 bg-cyan-950 text-cyan-100 rounded-2xl border border-cyan-800 space-y-3">
          <div className="flex items-center justify-between text-xs">
            <span className="font-bold flex items-center gap-1.5 text-cyan-300">
              <Sparkles className="w-4 h-4 text-cyan-400" />
              Historical Telemetry Simulation Result
            </span>
            <span className="text-[10px] font-mono bg-cyan-900 px-2 py-0.5 rounded text-cyan-300">
              24-Hour Telemetry Replay
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center font-mono">
            <div className="bg-white/5 rounded-xl p-2.5">
              <span className="text-[10px] text-cyan-400 block">Alerts Triggered</span>
              <span className="text-lg font-bold text-white">{testResult.simulatedAlertsCount}</span>
            </div>
            <div className="bg-white/5 rounded-xl p-2.5">
              <span className="text-[10px] text-cyan-400 block">Critical Events</span>
              <span className="text-lg font-bold text-rose-400">{testResult.criticalEventsCount}</span>
            </div>
            <div className="bg-white/5 rounded-xl p-2.5">
              <span className="text-[10px] text-cyan-400 block">Suppression Index</span>
              <span className="text-lg font-bold text-emerald-400">{testResult.falsePositiveSuppressionRate}%</span>
            </div>
            <div className="bg-white/5 rounded-xl p-2.5">
              <span className="text-[10px] text-cyan-400 block">Detection Latency</span>
              <span className="text-lg font-bold text-indigo-300">~{testResult.estimatedDetectionSpeedMinutes} min</span>
            </div>
          </div>

          <p className="text-xs text-cyan-200/90 leading-relaxed font-sans">
            {testResult.impactSummary}
          </p>
        </div>
      )}

      {/* Save / Reset / Test Action Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4 border-t border-slate-100">
        <div className="flex items-center gap-2 text-xs text-slate-500">
          <Info className="w-4 h-4 text-slate-400 shrink-0" />
          <span>Last modified by {config.updatedBy} • {new Date(config.updatedAt).toLocaleDateString()}</span>
        </div>

        <div className="flex items-center gap-2.5 w-full sm:w-auto justify-end">
          {saveSuccess && (
            <span className="text-xs font-bold text-emerald-600 flex items-center gap-1">
              <CheckCircle2 className="w-4 h-4" />
              Thresholds Saved!
            </span>
          )}

          <button
            onClick={handleRunSimulationTest}
            disabled={isTesting}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors cursor-pointer disabled:opacity-50"
            title="Simulate how these thresholds behave against recent campus telemetry"
          >
            <Sparkles className={`w-3.5 h-3.5 text-cyan-600 ${isTesting ? 'animate-spin' : ''}`} />
            {isTesting ? 'Simulating...' : 'Test Telemetry Impact'}
          </button>

          <button
            onClick={handleReset}
            disabled={!isAdmin}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            Reset Defaults
          </button>

          <button
            onClick={handleSave}
            disabled={!isAdmin || isSaving}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold transition-all shadow-sm ${
              isAdmin
                ? 'bg-cyan-600 hover:bg-cyan-500 text-white shadow-cyan-600/20 cursor-pointer'
                : 'bg-slate-200 text-slate-400 cursor-not-allowed'
            }`}
          >
            <Save className={`w-3.5 h-3.5 ${isSaving ? 'animate-spin' : ''}`} />
            {isSaving ? 'Saving...' : 'Save Configuration'}
          </button>
        </div>
      </div>

    </div>
  );
};
