import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { api } from '../../services/api';
import { Sensor, BatteryThresholdConfig } from '../../types';
import {
  Battery,
  BatteryMedium,
  BatteryWarning,
  Zap,
  Sliders,
  ShieldCheck,
  AlertTriangle,
  CheckCircle2,
  Save,
  RotateCcw,
  Sparkles,
  Lock,
  ArrowRight,
  Info,
  Clock,
  Wrench,
  Volume2,
  VolumeX,
  Bell,
  Check,
  Radio,
  MapPin,
  ExternalLink
} from 'lucide-react';

export const BatteryThresholdConfigUI: React.FC = () => {
  const {
    isAdmin,
    setUserRole,
    batteryThresholdConfig,
    updateBatteryThresholds,
    setActiveTab
  } = useApp();

  const [sensors, setSensors] = useState<Sensor[]>([]);
  const [localLowThreshold, setLocalLowThreshold] = useState<number>(
    batteryThresholdConfig?.lowBatteryThresholdPercent ?? 40
  );
  const [localCriticalThreshold, setLocalCriticalThreshold] = useState<number>(
    batteryThresholdConfig?.criticalBatteryThresholdPercent ?? 20
  );
  const [headerAlertActive, setHeaderAlertActive] = useState<boolean>(
    batteryThresholdConfig?.headerMaintenanceAlertActive ?? true
  );
  const [autoDispatchWorkOrder, setAutoDispatchWorkOrder] = useState<boolean>(
    batteryThresholdConfig?.autoDispatchBatteryWorkOrder ?? true
  );
  const [soundAlarm, setSoundAlarm] = useState<boolean>(
    batteryThresholdConfig?.soundAlarmOnCritical ?? false
  );
  const [leadTimeDays, setLeadTimeDays] = useState<number>(
    batteryThresholdConfig?.leadTimeDaysTarget ?? 5
  );

  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [testNotificationActive, setTestNotificationActive] = useState(false);

  useEffect(() => {
    api.getSensors().then(data => {
      if (Array.isArray(data)) setSensors(data);
    });
  }, []);

  useEffect(() => {
    if (batteryThresholdConfig) {
      setLocalLowThreshold(batteryThresholdConfig.lowBatteryThresholdPercent);
      setLocalCriticalThreshold(batteryThresholdConfig.criticalBatteryThresholdPercent);
      setHeaderAlertActive(batteryThresholdConfig.headerMaintenanceAlertActive);
      setAutoDispatchWorkOrder(batteryThresholdConfig.autoDispatchBatteryWorkOrder);
      setSoundAlarm(batteryThresholdConfig.soundAlarmOnCritical ?? false);
      setLeadTimeDays(batteryThresholdConfig.leadTimeDaysTarget ?? 5);
    }
  }, [batteryThresholdConfig]);

  // Live simulation: sensors breaching the currently selected threshold
  const criticalBreaching = sensors.filter(s => (s.batteryPercent ?? 100) <= localCriticalThreshold);
  const lowBreaching = sensors.filter(
    s => (s.batteryPercent ?? 100) > localCriticalThreshold && (s.batteryPercent ?? 100) <= localLowThreshold
  );
  const totalBreaching = criticalBreaching.length + lowBreaching.length;

  const handleSave = async () => {
    if (!isAdmin) return;
    setIsSaving(true);
    try {
      await updateBatteryThresholds({
        lowBatteryThresholdPercent: localLowThreshold,
        criticalBatteryThresholdPercent: localCriticalThreshold,
        headerMaintenanceAlertActive: headerAlertActive,
        autoDispatchBatteryWorkOrder: autoDispatchWorkOrder,
        soundAlarmOnCritical: soundAlarm,
        leadTimeDaysTarget: leadTimeDays
      });
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 4000);
    } catch (e) {
      console.error('Error saving battery thresholds:', e);
    } finally {
      setIsSaving(false);
    }
  };

  const handleResetDefaults = () => {
    setLocalLowThreshold(40);
    setLocalCriticalThreshold(20);
    setHeaderAlertActive(true);
    setAutoDispatchWorkOrder(true);
    setSoundAlarm(false);
    setLeadTimeDays(5);
  };

  const handleTestHeaderAlert = () => {
    setTestNotificationActive(true);
    setTimeout(() => setTestNotificationActive(false), 5000);
  };

  return (
    <div className="space-y-6">
      
      {/* Top Banner & Role Notification */}
      {!isAdmin && (
        <div className="p-4 rounded-xl bg-amber-50 border border-amber-300 text-amber-900 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <Lock className="w-5 h-5 text-amber-600 shrink-0" />
            <div>
              <h4 className="font-bold text-sm">Read-Only Mode: Administrator Rights Required</h4>
              <p className="text-xs text-amber-700">
                You are currently browsing as a facility viewer. Elevate to Administrator to save threshold parameters.
              </p>
            </div>
          </div>
          <button
            onClick={() => setUserRole('admin')}
            className="px-3 py-1.5 bg-amber-600 hover:bg-amber-700 text-white rounded-lg text-xs font-bold transition-colors cursor-pointer shrink-0"
          >
            Switch to Admin Role
          </button>
        </div>
      )}

      {/* Main Configuration Card */}
      <div className="bg-white rounded-2xl border border-slate-200 p-5 sm:p-6 shadow-xs space-y-6">
        
        {/* Section Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100">
          <div>
            <div className="flex items-center gap-2">
              <div className="w-9 h-9 rounded-xl bg-linear-to-br from-amber-500 to-rose-600 flex items-center justify-center text-white shadow-xs">
                <BatteryWarning className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-base sm:text-lg font-bold text-slate-900">
                  Remote IoT Battery & Power Maintenance Thresholds
                </h2>
                <p className="text-xs text-slate-500">
                  Define custom low-battery triggers that alert campus engineers in the top header and generate field work orders
                </p>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-[11px] text-slate-400 font-mono hidden md:inline">
              Last saved: {batteryThresholdConfig?.updatedAt ? new Date(batteryThresholdConfig.updatedAt).toLocaleTimeString() : 'Default'}
            </span>
            <button
              onClick={handleResetDefaults}
              className="px-2.5 py-1.5 rounded-lg border border-slate-200 text-slate-600 hover:text-slate-900 hover:bg-slate-50 text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
              title="Reset thresholds to 40% (Low) and 20% (Critical)"
            >
              <RotateCcw className="w-3.5 h-3.5 text-slate-400" />
              <span>Reset</span>
            </button>
          </div>
        </div>

        {/* Preset Selector Chips */}
        <div>
          <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block mb-2">
            Quick Threshold Presets
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <button
              onClick={() => {
                setLocalLowThreshold(50);
                setLocalCriticalThreshold(25);
                setLeadTimeDays(7);
              }}
              className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
                localLowThreshold === 50 && localCriticalThreshold === 25
                  ? 'border-cyan-500 bg-cyan-50/60 ring-2 ring-cyan-500/20 shadow-xs'
                  : 'border-slate-200 hover:bg-slate-50'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="font-bold text-xs text-slate-900">High Safety Margin (50%)</span>
                <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-sm bg-cyan-100 text-cyan-800">7-Day Warning</span>
              </div>
              <p className="text-[11px] text-slate-500 mt-1 leading-snug">
                Ideal for difficult access ceiling risers and outdoor underground vaults. Early maintenance window.
              </p>
            </button>

            <button
              onClick={() => {
                setLocalLowThreshold(40);
                setLocalCriticalThreshold(20);
                setLeadTimeDays(5);
              }}
              className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
                localLowThreshold === 40 && localCriticalThreshold === 20
                  ? 'border-amber-500 bg-amber-50/60 ring-2 ring-amber-500/20 shadow-xs'
                  : 'border-slate-200 hover:bg-slate-50'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="font-bold text-xs text-slate-900">Standard Campus (40%)</span>
                <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-sm bg-amber-100 text-amber-800">Recommended</span>
              </div>
              <p className="text-[11px] text-slate-500 mt-1 leading-snug">
                Balanced trigger. Gives maintenance 5-6 days before primary Li-SOCl2 cell experiences voltage drop.
              </p>
            </button>

            <button
              onClick={() => {
                setLocalLowThreshold(25);
                setLocalCriticalThreshold(15);
                setLeadTimeDays(3);
              }}
              className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
                localLowThreshold === 25 && localCriticalThreshold === 15
                  ? 'border-rose-500 bg-rose-50/60 ring-2 ring-rose-500/20 shadow-xs'
                  : 'border-slate-200 hover:bg-slate-50'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="font-bold text-xs text-slate-900">Just-In-Time (25%)</span>
                <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-sm bg-rose-100 text-rose-800">Tight Window</span>
              </div>
              <p className="text-[11px] text-slate-500 mt-1 leading-snug">
                Suppresses warnings until cells near final discharge curve. Requires dedicated rapid-response team.
              </p>
            </button>
          </div>
        </div>

        {/* Primary Sliders Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 pt-2">
          
          {/* Low Battery Warning Threshold Slider */}
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <span className="font-bold text-xs text-slate-800 block">
                  Low Battery Warning Threshold
                </span>
                <span className="text-[11px] text-slate-500">
                  Triggers amber indicator in header & work order queue
                </span>
              </div>
              <div className="text-right">
                <span className="text-xl font-extrabold font-mono text-amber-700 bg-amber-100/70 border border-amber-300 px-2.5 py-0.5 rounded-lg shadow-2xs">
                  {localLowThreshold}%
                </span>
              </div>
            </div>

            <div className="space-y-1">
              <input
                id="low-battery-threshold-slider"
                type="range"
                min={15}
                max={65}
                step={1}
                value={localLowThreshold}
                onChange={(e) => {
                  const val = Number(e.target.value);
                  setLocalLowThreshold(val);
                  if (val <= localCriticalThreshold) {
                    setLocalCriticalThreshold(Math.max(5, val - 5));
                  }
                }}
                className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-amber-600"
              />
              <div className="flex justify-between text-[10px] text-slate-400 font-mono">
                <span>15% (Strict)</span>
                <span>40% (Standard)</span>
                <span>65% (Conservative)</span>
              </div>
            </div>

            <div className="text-[11px] text-slate-600 bg-white p-2.5 rounded-lg border border-slate-200/80">
              <strong className="text-slate-800">Operational Logic:</strong> Wireless transducers (ultrasonic flow meters, acoustic noise loggers) below <strong>{localLowThreshold}%</strong> will switch into power-saving telemetry throttles and trigger header maintenance alerts.
            </div>
          </div>

          {/* Critical Battery Threshold Slider */}
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <span className="font-bold text-xs text-slate-800 block">
                  Critical Battery Emergency Threshold
                </span>
                <span className="text-[11px] text-slate-500">
                  Triggers urgent red pulsing alert in top header
                </span>
              </div>
              <div className="text-right">
                <span className="text-xl font-extrabold font-mono text-rose-700 bg-rose-100/70 border border-rose-300 px-2.5 py-0.5 rounded-lg shadow-2xs">
                  {localCriticalThreshold}%
                </span>
              </div>
            </div>

            <div className="space-y-1">
              <input
                id="critical-battery-threshold-slider"
                type="range"
                min={5}
                max={30}
                step={1}
                value={localCriticalThreshold}
                onChange={(e) => {
                  const val = Number(e.target.value);
                  setLocalCriticalThreshold(val);
                  if (val >= localLowThreshold) {
                    setLocalLowThreshold(Math.min(65, val + 5));
                  }
                }}
                className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-rose-600"
              />
              <div className="flex justify-between text-[10px] text-slate-400 font-mono">
                <span>5% (Urgent cutoff)</span>
                <span>20% (Standard)</span>
                <span>30% (High buffer)</span>
              </div>
            </div>

            <div className="text-[11px] text-slate-600 bg-white p-2.5 rounded-lg border border-slate-200/80">
              <strong className="text-slate-800">Emergency Protocol:</strong> Sensors below <strong>{localCriticalThreshold}%</strong> trigger high-priority alerts with estimated run-time warnings to avoid blackout of campus leak detection.
            </div>
          </div>

        </div>

        {/* Maintenance Automation Policies */}
        <div className="border-t border-slate-100 pt-4">
          <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block mb-3">
            Proactive Maintenance & Notification Policies
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            
            {/* Header Alert Toggle */}
            <div className="p-3 rounded-xl border border-slate-200 flex items-start justify-between gap-2">
              <div className="flex items-start gap-2">
                <Bell className="w-4 h-4 text-cyan-600 shrink-0 mt-0.5" />
                <div>
                  <span className="font-bold text-xs text-slate-900 block">Header Warning Beacon</span>
                  <p className="text-[11px] text-slate-500 leading-tight mt-0.5">
                    Show pulsing badge & count in top navigation
                  </p>
                </div>
              </div>
              <input
                type="checkbox"
                checked={headerAlertActive}
                onChange={(e) => setHeaderAlertActive(e.target.checked)}
                className="w-4 h-4 text-cyan-600 rounded-sm border-slate-300 focus:ring-cyan-500 cursor-pointer mt-0.5"
              />
            </div>

            {/* Auto Dispatch Work Order */}
            <div className="p-3 rounded-xl border border-slate-200 flex items-start justify-between gap-2">
              <div className="flex items-start gap-2">
                <Wrench className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                <div>
                  <span className="font-bold text-xs text-slate-900 block">Auto-Dispatch Work Orders</span>
                  <p className="text-[11px] text-slate-500 leading-tight mt-0.5">
                    Automatically ticket Vikram Singh on breach
                  </p>
                </div>
              </div>
              <input
                type="checkbox"
                checked={autoDispatchWorkOrder}
                onChange={(e) => setAutoDispatchWorkOrder(e.target.checked)}
                className="w-4 h-4 text-amber-600 rounded-sm border-slate-300 focus:ring-amber-500 cursor-pointer mt-0.5"
              />
            </div>

            {/* Sound Chime on Critical */}
            <div className="p-3 rounded-xl border border-slate-200 flex items-start justify-between gap-2">
              <div className="flex items-start gap-2">
                {soundAlarm ? (
                  <Volume2 className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                ) : (
                  <VolumeX className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
                )}
                <div>
                  <span className="font-bold text-xs text-slate-900 block">Audible Alert on Critical</span>
                  <p className="text-[11px] text-slate-500 leading-tight mt-0.5">
                    Audio chime when &lt; {localCriticalThreshold}% threshold breached
                  </p>
                </div>
              </div>
              <input
                type="checkbox"
                checked={soundAlarm}
                onChange={(e) => setSoundAlarm(e.target.checked)}
                className="w-4 h-4 text-rose-600 rounded-sm border-slate-300 focus:ring-rose-500 cursor-pointer mt-0.5"
              />
            </div>

          </div>
        </div>

        {/* Live Threshold Impact Preview Card */}
        <div className="p-4 sm:p-5 rounded-2xl bg-linear-to-br from-slate-900 to-slate-800 text-white shadow-md space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-amber-400" />
                <h3 className="font-bold text-sm text-white">
                  Live Fleet Impact Simulation (Real-Time Response)
                </h3>
              </div>
              <p className="text-[11px] text-slate-300 mt-0.5">
                Calculated against all {sensors.length} live IoT transducers across the 4 campus zones
              </p>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={handleTestHeaderAlert}
                className="px-2.5 py-1 rounded-lg bg-slate-700/70 hover:bg-slate-700 text-amber-300 border border-amber-500/30 text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
                title="Test the header button alert response"
              >
                <Radio className="w-3 h-3 text-amber-400 animate-pulse" />
                <span>Test Header Reaction</span>
              </button>
            </div>
          </div>

          {/* Breaching Devices Bar */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="p-3 rounded-xl bg-slate-800/80 border border-slate-700">
              <span className="text-[10px] uppercase font-bold text-slate-400 block">
                Total Triggering Units
              </span>
              <div className="text-xl font-black text-amber-400 mt-1 font-mono">
                {totalBreaching} of {sensors.length} Nodes
              </div>
              <span className="text-[10px] text-slate-400 block mt-0.5">
                {(totalBreaching / Math.max(1, sensors.length) * 100).toFixed(0)}% of remote fleet alerted
              </span>
            </div>

            <div className="p-3 rounded-xl bg-slate-800/80 border border-slate-700">
              <span className="text-[10px] uppercase font-bold text-rose-400 block">
                Critical Shutdown Imminent
              </span>
              <div className="text-xl font-black text-rose-400 mt-1 font-mono">
                {criticalBreaching.length} Emergency Units
              </div>
              <span className="text-[10px] text-slate-400 block mt-0.5">
                &le; {localCriticalThreshold}% capacity
              </span>
            </div>

            <div className="p-3 rounded-xl bg-slate-800/80 border border-slate-700">
              <span className="text-[10px] uppercase font-bold text-emerald-400 block">
                Header Indicator Preview
              </span>
              <div className="mt-1">
                {headerAlertActive ? (
                  criticalBreaching.length > 0 ? (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-rose-500/20 text-rose-300 text-xs font-bold border border-rose-500/40">
                      <span className="w-2 h-2 rounded-full bg-rose-500 animate-ping"></span>
                      {criticalBreaching.length} Critical ({criticalBreaching[0]?.batteryPercent}%)
                    </span>
                  ) : totalBreaching > 0 ? (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-amber-500/20 text-amber-300 text-xs font-bold border border-amber-500/40">
                      <BatteryMedium className="w-3.5 h-3.5 text-amber-400" />
                      {totalBreaching} Low Units (&le;{localLowThreshold}%)
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-emerald-500/20 text-emerald-300 text-xs font-bold border border-emerald-500/40">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                      Nominal Fleet (100%)
                    </span>
                  )
                ) : (
                  <span className="text-xs text-slate-400 italic">Header Alerts Muted</span>
                )}
              </div>
              <span className="text-[10px] text-slate-400 block mt-1">
                Visual display in top sticky bar
              </span>
            </div>
          </div>

          {/* List of Affected Sensors under this Threshold */}
          <div className="pt-2">
            <span className="text-xs font-bold text-slate-300 block mb-2">
              Transducers Currently Falling Below Your Configured Threshold ({localLowThreshold}%):
            </span>

            {totalBreaching === 0 ? (
              <div className="p-3 rounded-xl bg-slate-800/50 border border-slate-700/60 text-xs text-emerald-300 flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>Zero sensors breach your current threshold. All remote battery nodes are operating comfortably above {localLowThreshold}%.</span>
              </div>
            ) : (
              <div className="space-y-2">
                {[...criticalBreaching, ...lowBreaching].map(s => {
                  const batt = s.batteryPercent ?? 100;
                  const isCrit = batt <= localCriticalThreshold;
                  return (
                    <div
                      key={s.id}
                      className="p-2.5 rounded-xl bg-slate-800/70 border border-slate-700 flex items-center justify-between text-xs"
                    >
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-bold px-1.5 py-0.5 rounded-xs bg-slate-900 text-white border border-slate-700">
                          {s.code}
                        </span>
                        <div>
                          <span className="font-semibold text-white">{s.name}</span>
                          <span className="text-[11px] text-slate-400 block">
                            {s.buildingId === 'bld-1' ? 'Block A' :
                             s.buildingId === 'bld-2' ? 'Block B' :
                             s.buildingId === 'bld-3' ? 'Block C' : 'Block D'}
                            {s.zoneId ? ` • Zone ${s.zoneId}` : ''}
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center gap-3">
                        <div className="text-right">
                          <span className={`font-extrabold font-mono text-sm ${isCrit ? 'text-rose-400' : 'text-amber-400'}`}>
                            {batt}%
                          </span>
                          <span className="text-[10px] text-slate-400 block">
                            {s.estimatedBatteryDaysRemaining ? `~${s.estimatedBatteryDaysRemaining}d remaining` : 'Low'}
                          </span>
                        </div>
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          isCrit ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30' : 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                        }`}>
                          {isCrit ? 'Critical Breach' : 'Low Threshold Breach'}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

        </div>

        {/* Save Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-3 border-t border-slate-100">
          <div>
            {saveSuccess && (
              <div className="flex items-center gap-2 text-xs text-emerald-700 font-bold animate-in fade-in">
                <Check className="w-4 h-4 text-emerald-600" />
                <span>Configuration successfully saved! Header battery alerts updated in real-time.</span>
              </div>
            )}
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => setActiveTab('maintenance')}
              className="text-xs font-semibold text-cyan-600 hover:text-cyan-700 flex items-center gap-1 cursor-pointer"
            >
              <span>View Field Work Orders</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </button>

            <button
              id="save-battery-threshold-btn"
              disabled={!isAdmin || isSaving}
              onClick={handleSave}
              className={`px-5 py-2 rounded-xl text-xs font-bold flex items-center gap-2 shadow-xs transition-all cursor-pointer ${
                !isAdmin
                  ? 'bg-slate-200 text-slate-400 cursor-not-allowed'
                  : 'bg-emerald-600 hover:bg-emerald-700 text-white hover:shadow-md'
              }`}
            >
              <Save className="w-4 h-4" />
              <span>{isSaving ? 'Saving Configuration...' : 'Save Threshold Settings'}</span>
            </button>
          </div>
        </div>

      </div>

    </div>
  );
};
