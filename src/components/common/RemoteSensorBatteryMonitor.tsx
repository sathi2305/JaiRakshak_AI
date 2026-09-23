import React, { useState, useEffect, useRef } from 'react';
import {
  Battery,
  BatteryMedium,
  BatteryWarning,
  Zap,
  ZapOff,
  AlertTriangle,
  CheckCircle2,
  Clock,
  Radio,
  Wrench,
  RefreshCw,
  Sun,
  ShieldAlert,
  ChevronRight,
  Sparkles,
  ExternalLink,
  MapPin,
  Check,
  Sliders
} from 'lucide-react';
import { api } from '../../services/api';
import { Sensor } from '../../types';
import { useApp } from '../../context/AppContext';

export const RemoteSensorBatteryMonitor: React.FC = () => {
  const {
    setActiveTab,
    setActiveBuildingId,
    isAdmin,
    lowBatteryThresholdPercent = 40,
    criticalBatteryThresholdPercent = 20,
    batteryThresholdConfig
  } = useApp();
  const [sensors, setSensors] = useState<Sensor[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [activeFilter, setActiveFilter] = useState<'all' | 'low' | 'critical' | 'solar'>('low');
  const [actionSuccessMessage, setActionSuccessMessage] = useState<string | null>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const fetchSensors = async () => {
    setIsLoading(true);
    try {
      const data = await api.getSensors();
      if (Array.isArray(data)) {
        setSensors(data);
      }
    } catch (err) {
      console.warn('Failed to fetch sensor battery levels:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchSensors();
    const interval = setInterval(fetchSensors, 20000); // refresh every 20s
    return () => clearInterval(interval);
  }, []);

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen]);

  // Battery calculations using admin-configured custom threshold
  const isAlertActive = batteryThresholdConfig?.headerMaintenanceAlertActive ?? true;
  const criticalSensors = sensors.filter(s => (s.batteryPercent ?? 100) <= criticalBatteryThresholdPercent);
  const lowSensors = sensors.filter(s => (s.batteryPercent ?? 100) > criticalBatteryThresholdPercent && (s.batteryPercent ?? 100) <= lowBatteryThresholdPercent);
  const totalNeedingAttention = criticalSensors.length + lowSensors.length;

  const fleetAvgBattery = sensors.length > 0
    ? Math.round(sensors.reduce((acc, s) => acc + (s.batteryPercent ?? 100), 0) / sensors.length)
    : 84;

  const lowestBatterySensor = [...sensors].sort((a, b) => (a.batteryPercent ?? 100) - (b.batteryPercent ?? 100))[0];

  // Filtered list for modal
  const filteredSensors = sensors.filter(s => {
    const batt = s.batteryPercent ?? 100;
    if (activeFilter === 'critical') return batt <= criticalBatteryThresholdPercent;
    if (activeFilter === 'low') return batt <= lowBatteryThresholdPercent;
    if (activeFilter === 'solar') return s.powerSource === 'battery_solar';
    return true;
  }).sort((a, b) => (a.batteryPercent ?? 100) - (b.batteryPercent ?? 100));

  const handleReplaceBattery = async (sensor: Sensor) => {
    try {
      const res = await api.replaceSensorBattery(sensor.id);
      if (res?.success) {
        setActionSuccessMessage(`Fresh battery installed on ${sensor.code}. Telemetry fully restored.`);
        setTimeout(() => setActionSuccessMessage(null), 4000);
        await fetchSensors();
      }
    } catch (e) {
      console.error('Error replacing battery:', e);
    }
  };

  const handleDispatchReplacement = async (sensor: Sensor) => {
    try {
      const res = await api.dispatchBatteryReplacement(sensor.id);
      if (res?.success) {
        setActionSuccessMessage(`Proactive work order dispatched for ${sensor.code} to Vikram Singh.`);
        setTimeout(() => setActionSuccessMessage(null), 4000);
        await fetchSensors();
      }
    } catch (e) {
      console.error('Error dispatching replacement:', e);
    }
  };

  const getBatteryColor = (percent: number) => {
    if (percent <= criticalBatteryThresholdPercent) return { text: 'text-rose-600', bg: 'bg-rose-50', border: 'border-rose-300', bar: 'bg-rose-500' };
    if (percent <= lowBatteryThresholdPercent) return { text: 'text-amber-600', bg: 'bg-amber-50', border: 'border-amber-300', bar: 'bg-amber-500' };
    if (percent <= 70) return { text: 'text-blue-600', bg: 'bg-blue-50', border: 'border-blue-200', bar: 'bg-blue-500' };
    return { text: 'text-emerald-600', bg: 'bg-emerald-50', border: 'border-emerald-200', bar: 'bg-emerald-500' };
  };

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Top Header Trigger Button */}
      <button
        id="remote-iot-battery-header-btn"
        onClick={() => setIsOpen(!isOpen)}
        className={`flex items-center gap-2 px-2.5 py-1 sm:px-3 sm:py-1.5 rounded-lg text-xs font-semibold border transition-all cursor-pointer shadow-xs ${
          isAlertActive && criticalSensors.length > 0
            ? 'bg-rose-50 hover:bg-rose-100 text-rose-700 border-rose-300 ring-2 ring-rose-400/30 animate-pulse'
            : isAlertActive && totalNeedingAttention > 0
            ? 'bg-amber-50 hover:bg-amber-100 text-amber-800 border-amber-300'
            : 'bg-slate-50 hover:bg-slate-100 text-slate-700 border-slate-200'
        }`}
        title={`Remote IoT Power Monitor — Low Battery Alert Threshold: ${lowBatteryThresholdPercent}%`}
        aria-label="Remote IoT Sensor Power Fleet Monitor"
      >
        {isAlertActive && criticalSensors.length > 0 ? (
          <span className="flex items-center gap-1.5">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-rose-600"></span>
            </span>
            <BatteryWarning className="w-4 h-4 text-rose-600 shrink-0" />
            <span className="font-bold text-rose-800">
              {criticalSensors.length} Critical (≤{criticalBatteryThresholdPercent}%)
            </span>
          </span>
        ) : isAlertActive && totalNeedingAttention > 0 ? (
          <span className="flex items-center gap-1.5">
            <BatteryMedium className="w-4 h-4 text-amber-600 shrink-0" />
            <span className="font-semibold text-amber-800">
              {totalNeedingAttention} Low Power Units (≤{lowBatteryThresholdPercent}%)
            </span>
          </span>
        ) : (
          <span className="flex items-center gap-1.5">
            <Battery className="w-4 h-4 text-emerald-600 shrink-0" />
            <span className="text-slate-700 hidden lg:inline">IoT Power:</span>
            <span className="font-semibold text-emerald-700">{fleetAvgBattery}% Fleet Avg</span>
          </span>
        )}
      </button>

      {/* Flyout Dropdown Popover */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-[340px] sm:w-[460px] md:w-[520px] bg-white rounded-2xl shadow-2xl border border-slate-200 p-4 z-50 animate-in fade-in zoom-in-95">
          {/* Header Bar */}
          <div className="flex items-start justify-between pb-3 border-b border-slate-100">
            <div>
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-linear-to-br from-amber-500 to-rose-600 flex items-center justify-center text-white shadow-xs">
                  <Zap className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-bold text-sm text-slate-900 leading-tight">
                    Remote IoT Power Fleet Monitor
                  </h3>
                  <p className="text-[11px] text-slate-500">
                    Proactive field replacement for wireless metering nodes
                  </p>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-1.5">
              <button
                onClick={fetchSensors}
                disabled={isLoading}
                className="p-1.5 text-slate-400 hover:text-slate-600 rounded-md hover:bg-slate-100 transition-colors"
                title="Refresh battery telemetry"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin text-cyan-600' : ''}`} />
              </button>
            </div>
          </div>

          {/* Admin Threshold Indicator & Quick Configure */}
          <div className="flex items-center justify-between text-[11px] bg-slate-50 border border-slate-200 px-3 py-1.5 rounded-lg mt-3">
            <div className="flex items-center gap-1.5 text-slate-600">
              <span className="font-semibold text-slate-700">Alert Threshold:</span>
              <span className="font-bold font-mono px-1.5 py-0.5 rounded-xs bg-amber-100 text-amber-900 border border-amber-200">
                ≤ {lowBatteryThresholdPercent}%
              </span>
              <span className="text-slate-400">|</span>
              <span className="text-slate-500">Critical:</span>
              <span className="font-bold font-mono px-1.5 py-0.5 rounded-xs bg-rose-100 text-rose-800 border border-rose-200">
                ≤ {criticalBatteryThresholdPercent}%
              </span>
            </div>
            <button
              onClick={() => {
                setActiveTab('sensors');
                setIsOpen(false);
              }}
              className="text-cyan-700 hover:text-cyan-800 font-bold flex items-center gap-1 hover:underline cursor-pointer"
              title="Open SensorHealthView configuration UI"
            >
              <Sliders className="w-3 h-3 text-cyan-600" />
              <span>Configure</span>
            </button>
          </div>

          {/* Success Banner */}
          {actionSuccessMessage && (
            <div className="mt-3 p-2.5 rounded-lg bg-emerald-50 border border-emerald-200 text-xs text-emerald-800 flex items-center gap-2 animate-in fade-in">
              <Check className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>{actionSuccessMessage}</span>
            </div>
          )}

          {/* Fleet Health Quick Metrics Strip */}
          <div className="grid grid-cols-3 gap-2 mt-3 p-2.5 rounded-xl bg-slate-50 border border-slate-100">
            <div className="text-center">
              <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400 block">
                Fleet Average
              </span>
              <span className="text-base font-extrabold text-slate-800">
                {fleetAvgBattery}%
              </span>
            </div>
            <div className="text-center border-x border-slate-200">
              <span className="text-[10px] uppercase font-bold tracking-wider text-amber-600 block">
                Low Power Units
              </span>
              <span className="text-base font-extrabold text-amber-700">
                {totalNeedingAttention} / {sensors.length}
              </span>
            </div>
            <div className="text-center">
              <span className="text-[10px] uppercase font-bold tracking-wider text-rose-600 block">
                Critical (&lt;20%)
              </span>
              <span className="text-base font-extrabold text-rose-700">
                {criticalSensors.length} Nodes
              </span>
            </div>
          </div>

          {/* Proactive Directive Notice */}
          {totalNeedingAttention > 0 && (
            <div className="mt-3 p-2.5 rounded-xl bg-amber-50/80 border border-amber-200/80 text-xs text-amber-900 flex items-start gap-2">
              <ShieldAlert className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
              <div>
                <span className="font-bold">Maintenance Directive:</span>{' '}
                {criticalSensors.length > 0 ? (
                  <span>
                    Replace cell on <strong>{criticalSensors.map(s => s.code).join(', ')}</strong> within 48h to prevent telemetry dropout and loss of real-time leak detection.
                  </span>
                ) : (
                  <span>
                    {totalNeedingAttention} units are operating under 40% battery capacity. Dispatch routine battery replenishment during the next scheduled campus maintenance walk.
                  </span>
                )}
              </div>
            </div>
          )}

          {/* Filter Pills */}
          <div className="flex items-center gap-1.5 mt-3 pb-2 border-b border-slate-100 overflow-x-auto text-[11px] font-semibold text-slate-600">
            <button
              onClick={() => setActiveFilter('low')}
              className={`px-2.5 py-1 rounded-md transition-colors ${
                activeFilter === 'low'
                  ? 'bg-amber-600 text-white font-bold shadow-xs'
                  : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
              }`}
            >
              Needs Replacement ({totalNeedingAttention})
            </button>
            <button
              onClick={() => setActiveFilter('critical')}
              className={`px-2.5 py-1 rounded-md transition-colors ${
                activeFilter === 'critical'
                  ? 'bg-rose-600 text-white font-bold shadow-xs'
                  : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
              }`}
            >
              Critical Only ({criticalSensors.length})
            </button>
            <button
              onClick={() => setActiveFilter('all')}
              className={`px-2.5 py-1 rounded-md transition-colors ${
                activeFilter === 'all'
                  ? 'bg-slate-800 text-white font-bold shadow-xs'
                  : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
              }`}
            >
              All Devices ({sensors.length})
            </button>
            <button
              onClick={() => setActiveFilter('solar')}
              className={`px-2.5 py-1 rounded-md transition-colors flex items-center gap-1 ${
                activeFilter === 'solar'
                  ? 'bg-cyan-600 text-white font-bold shadow-xs'
                  : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
              }`}
            >
              <Sun className="w-3 h-3" />
              <span>Solar Harvesters</span>
            </button>
          </div>

          {/* Remote IoT Device List */}
          <div className="mt-3 space-y-2.5 max-h-[360px] overflow-y-auto pr-1">
            {filteredSensors.length === 0 ? (
              <div className="text-center py-8 text-xs text-slate-400">
                <CheckCircle2 className="w-8 h-8 text-emerald-500 mx-auto mb-2 opacity-80" />
                No devices match this battery filter. All monitored units operate within nominal thresholds.
              </div>
            ) : (
              filteredSensors.map(sensor => {
                const batt = sensor.batteryPercent ?? 100;
                const colors = getBatteryColor(batt);
                const isCritical = batt < 20;
                const isLow = batt <= 40;

                return (
                  <div
                    key={sensor.id}
                    className={`p-3 rounded-xl border transition-all text-xs ${
                      isCritical
                        ? 'bg-rose-50/40 border-rose-200 shadow-xs'
                        : isLow
                        ? 'bg-amber-50/30 border-amber-200'
                        : 'bg-slate-50/50 border-slate-200'
                    }`}
                  >
                    {/* Device Header */}
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <span className="font-mono font-bold px-1.5 py-0.5 rounded-sm bg-white border border-slate-200 text-slate-900 text-[11px]">
                            {sensor.code}
                          </span>
                          <span className="font-semibold text-slate-900 text-xs">
                            {sensor.name}
                          </span>
                          {sensor.powerSource === 'battery_solar' && (
                            <span className="inline-flex items-center gap-0.5 px-1.5 py-0.2 rounded-xs bg-cyan-100 text-cyan-800 text-[10px] font-bold">
                              <Sun className="w-2.5 h-2.5" /> Solar
                            </span>
                          )}
                        </div>

                        {/* Location */}
                        <div className="flex items-center gap-1 text-[11px] text-slate-500 mt-1">
                          <MapPin className="w-3 h-3 text-slate-400 shrink-0" />
                          <span className="truncate">
                            {sensor.buildingId === 'bld-1' ? 'Block A (Computing & Robotics)' :
                             sensor.buildingId === 'bld-2' ? 'Block B (Biotech & Science)' :
                             sensor.buildingId === 'bld-3' ? 'Block C (Administration)' :
                             sensor.buildingId === 'bld-4' ? 'Block D (Hostel & Dining)' : 'Central Plant'}
                            {sensor.zoneId ? ` • Zone ${sensor.zoneId}` : ''}
                          </span>
                        </div>
                      </div>

                      {/* Battery Gauge Value */}
                      <div className="text-right shrink-0">
                        <div className={`font-extrabold text-sm ${colors.text} flex items-center justify-end gap-1`}>
                          {isCritical ? <ZapOff className="w-3.5 h-3.5" /> : <Zap className="w-3.5 h-3.5" />}
                          <span>{batt}%</span>
                        </div>
                        <span className="text-[10px] text-slate-400 block">
                          {sensor.estimatedBatteryDaysRemaining !== undefined
                            ? `~${sensor.estimatedBatteryDaysRemaining}d remaining`
                            : 'Normal'}
                        </span>
                      </div>
                    </div>

                    {/* Battery Level Progress Bar */}
                    <div className="mt-2.5 w-full bg-slate-200 rounded-full h-1.5 overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all duration-500 ${colors.bar}`}
                        style={{ width: `${Math.max(batt, 5)}%` }}
                      ></div>
                    </div>

                    {/* Metadata & Specs */}
                    <div className="mt-2 pt-2 border-t border-slate-100/80 flex flex-wrap items-center justify-between gap-1 text-[10px] text-slate-500">
                      <span className="truncate">
                        <strong>Cell:</strong> {sensor.batterySpecs || 'ER34615 Li-SOCl2 3.6V Primary'}
                      </span>
                      <span>
                        <strong>Signal:</strong> {sensor.signalDbm} dBm
                      </span>
                    </div>

                    {/* Proactive Action Buttons */}
                    <div className="mt-2.5 pt-2 border-t border-slate-100 flex flex-wrap items-center justify-between gap-2">
                      <button
                        onClick={() => {
                          setActiveBuildingId(sensor.buildingId);
                          setActiveTab('sensors');
                          setIsOpen(false);
                        }}
                        className="text-cyan-700 hover:text-cyan-800 font-semibold flex items-center gap-1 hover:underline cursor-pointer"
                      >
                        <span>Diagnostics</span>
                        <ChevronRight className="w-3 h-3" />
                      </button>

                      <div className="flex items-center gap-1.5">
                        {/* Dispatch Replacement Button */}
                        {isLow && (
                          <button
                            onClick={() => handleDispatchReplacement(sensor)}
                            className={`px-2 py-1 rounded-md text-[11px] font-bold transition-all cursor-pointer flex items-center gap-1 border ${
                              sensor.lowPowerAlertDispatched
                                ? 'bg-amber-100 text-amber-800 border-amber-300'
                                : 'bg-white hover:bg-slate-100 text-slate-700 border-slate-300 hover:border-slate-400'
                            }`}
                            title="Generate a Proactive Work Order assigned to Field Maintenance"
                          >
                            <Wrench className="w-3 h-3 text-amber-600" />
                            <span>{sensor.lowPowerAlertDispatched ? 'Work Order Logged' : 'Dispatch Tech'}</span>
                          </button>
                        )}

                        {/* Replace Battery with Fresh Unit (Admin / Field Tech) */}
                        <button
                          onClick={() => handleReplaceBattery(sensor)}
                          className="px-2.5 py-1 rounded-md text-[11px] font-bold bg-emerald-600 hover:bg-emerald-700 text-white transition-all cursor-pointer flex items-center gap-1 shadow-xs"
                          title="Instantly records fresh cell installation and resets battery to 100%"
                        >
                          <CheckCircle2 className="w-3 h-3" />
                          <span>Mark Replaced (100%)</span>
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* Footer Action Links */}
          <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
            <button
              onClick={() => {
                setActiveTab('maintenance');
                setIsOpen(false);
              }}
              className="text-cyan-600 hover:text-cyan-700 font-bold flex items-center gap-1 cursor-pointer"
            >
              <span>View All IoT Maintenance Tasks</span>
              <ExternalLink className="w-3 h-3" />
            </button>
            <span className="text-[10px] text-slate-400">
              Auto-polled every 20s
            </span>
          </div>
        </div>
      )}
    </div>
  );
};
