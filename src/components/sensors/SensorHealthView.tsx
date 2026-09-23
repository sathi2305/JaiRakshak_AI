import React, { useState, useEffect } from 'react';
import { api } from '../../services/api';
import { Sensor } from '../../types';
import { useApp } from '../../context/AppContext';
import { LeakSensitivityConfig } from './LeakSensitivityConfig';
import { BatteryThresholdConfigUI } from './BatteryThresholdConfigUI';
import {
  Cpu,
  Radio,
  Battery,
  BatteryWarning,
  Wifi,
  CheckCircle2,
  AlertTriangle,
  RefreshCw,
  Search,
  Filter,
  Sliders,
  Settings2,
  ShieldCheck
} from 'lucide-react';

export const SensorHealthView: React.FC = () => {
  const { isAdmin } = useApp();
  const [sensors, setSensors] = useState<Sensor[]>([]);
  const [filterType, setFilterType] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [calibratingId, setCalibratingId] = useState<string | null>(null);
  const [activeSubTab, setActiveSubTab] = useState<'sensitivity' | 'battery' | 'fleet'>('sensitivity');

  useEffect(() => {
    api.getSensors().then(data => setSensors(data));
  }, []);

  const handleCalibrate = (id: string) => {
    setCalibratingId(id);
    setTimeout(() => {
      setCalibratingId(null);
    }, 1500);
  };

  const filtered = sensors.filter(s => {
    const matchesType = filterType === 'ALL' || s.type === filterType;
    const matchesQuery = s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         s.code.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesType && matchesQuery;
  });

  const onlineCount = sensors.filter(s => s.status === 'ONLINE').length;

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6 w-full max-w-7xl mx-auto">
      
      {/* View Header with Sub-tabs */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-black text-slate-900 tracking-tight flex items-center gap-2">
              <Cpu className="w-5 h-5 text-cyan-600" />
              Sensor Health & Leak Sensitivity Configuration
            </h1>
            <span className="text-[10px] font-mono uppercase bg-cyan-100 text-cyan-800 font-bold px-2 py-0.5 rounded-full">
              IoT Gateway & Rules
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Admin custom alert sensitivity thresholds, transducer health, LoRaWAN telemetry telemetry, and calibration
          </p>
        </div>

        {/* View Switcher Pills */}
        <div className="flex items-center p-1 bg-slate-100 rounded-xl border border-slate-200 text-xs shrink-0 flex-wrap sm:flex-nowrap gap-1">
          <button
            onClick={() => setActiveSubTab('sensitivity')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-bold transition-all cursor-pointer ${
              activeSubTab === 'sensitivity'
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Sliders className="w-3.5 h-3.5 text-cyan-600" />
            <span>Leak Sensitivity (Admin)</span>
          </button>

          <button
            id="subtab-battery-thresholds-btn"
            onClick={() => setActiveSubTab('battery')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-bold transition-all cursor-pointer ${
              activeSubTab === 'battery'
                ? 'bg-white text-slate-900 shadow-xs ring-1 ring-amber-400/40'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <BatteryWarning className="w-3.5 h-3.5 text-amber-600" />
            <span>Battery Thresholds (Admin)</span>
          </button>

          <button
            onClick={() => setActiveSubTab('fleet')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-bold transition-all cursor-pointer ${
              activeSubTab === 'fleet'
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Cpu className="w-3.5 h-3.5 text-indigo-600" />
            <span>Transducer Fleet ({sensors.length || 48})</span>
          </button>
        </div>
      </div>

      {/* Main View Area */}
      {activeSubTab === 'sensitivity' ? (
        <div className="space-y-6">
          {/* Admin Custom Sensitivity Thresholds Configuration UI */}
          <LeakSensitivityConfig />
        </div>
      ) : activeSubTab === 'battery' ? (
        <div className="space-y-6">
          {/* Admin Custom Low Battery Maintenance Alert Threshold Configuration UI */}
          <BatteryThresholdConfigUI />
        </div>
      ) : (
        <div className="space-y-6">
          {/* Data Quality Health Scores (Section 29) */}
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
              <span className="text-xs text-slate-400 block">Fleet Data Quality Score</span>
              <div className="text-2xl font-black text-emerald-600 mt-1 font-mono">98.4%</div>
              <span className="text-[11px] text-slate-500 mt-0.5 block">High confidence index</span>
            </div>
            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
              <span className="text-xs text-slate-400 block">Outlier Rejection Rate</span>
              <div className="text-2xl font-black text-slate-900 mt-1 font-mono">0.14%</div>
              <span className="text-[11px] text-slate-500 mt-0.5 block">Filtered via Kalman filter</span>
            </div>
            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
              <span className="text-xs text-slate-400 block">Frozen Sensor Safeguard</span>
              <div className="text-2xl font-black text-slate-900 mt-1 font-mono">0 Stuck</div>
              <span className="text-[11px] text-emerald-600 font-semibold mt-0.5 block">No stale telemetry</span>
            </div>
            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
              <span className="text-xs text-slate-400 block">LoRaWAN Packet Success</span>
              <div className="text-2xl font-black text-indigo-600 mt-1 font-mono">99.98%</div>
              <span className="text-[11px] text-slate-500 mt-0.5 block">2 hops gateway mesh</span>
            </div>
          </div>

          {/* Search & Filter Bar */}
          <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="relative flex-1 max-w-sm">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                <input
                  type="text"
                  placeholder="Search sensor by code or location..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs focus:outline-hidden"
                />
              </div>

              <div className="flex items-center gap-1.5 overflow-x-auto text-xs">
                {['ALL', 'FLOW', 'PRESSURE', 'LEVEL', 'QUALITY'].map(t => (
                  <button
                    key={t}
                    onClick={() => setFilterType(t)}
                    className={`px-3 py-1 rounded-lg font-medium transition-colors cursor-pointer ${
                      filterType === t ? 'bg-slate-900 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                  >
                    {t}
                  </button>
                ))}
              </div>
            </div>

            {/* Fleet Table */}
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-200 text-slate-400 font-semibold uppercase text-[10px]">
                    <th className="pb-3">Sensor Identifier</th>
                    <th className="pb-3">Type</th>
                    <th className="pb-3">Installation Zone</th>
                    <th className="pb-3">Battery</th>
                    <th className="pb-3">Signal (RSSI)</th>
                    <th className="pb-3">Status</th>
                    <th className="pb-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filtered.map(s => (
                    <tr key={s.id} className="hover:bg-slate-50 transition-colors">
                      <td className="py-3 font-bold text-slate-900">
                        <div>{s.code}</div>
                        <span className="text-[10px] text-slate-400 font-normal">{s.name}</span>
                      </td>
                      <td className="py-3">
                        <span className="font-mono text-slate-700 uppercase">{s.type}</span>
                      </td>
                      <td className="py-3 text-slate-600">
                        Zone {s.zoneId}
                      </td>
                      <td className="py-3">
                        <div className="flex flex-col gap-0.5">
                          <div className="flex items-center gap-1.5 text-slate-700 font-bold">
                            <Battery className={`w-3.5 h-3.5 ${
                              (s.batteryPercent ?? 100) < 20 ? 'text-rose-600 animate-pulse' :
                              (s.batteryPercent ?? 100) <= 40 ? 'text-amber-500' : 'text-emerald-500'
                            }`} />
                            <span className={
                              (s.batteryPercent ?? 100) < 20 ? 'text-rose-600' :
                              (s.batteryPercent ?? 100) <= 40 ? 'text-amber-600' : 'text-slate-800'
                            }>{s.batteryPercent}%</span>
                          </div>
                          {s.estimatedBatteryDaysRemaining !== undefined && (
                            <span className="text-[10px] text-slate-400">
                              ~{s.estimatedBatteryDaysRemaining}d remaining
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="py-3">
                        <div className="flex items-center gap-1.5 text-slate-700 font-medium">
                          <Wifi className="w-3.5 h-3.5 text-cyan-600" />
                          {s.signalDbm} dBm
                        </div>
                      </td>
                      <td className="py-3">
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          s.status === 'ONLINE' ? 'bg-emerald-100 text-emerald-700' :
                          (s.batteryPercent ?? 100) < 20 ? 'bg-rose-100 text-rose-700' :
                          'bg-amber-100 text-amber-700'
                        }`}>
                          {s.status}
                        </span>
                      </td>
                      <td className="py-3 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          {(s.batteryPercent ?? 100) <= 40 && (
                            <button
                              onClick={async () => {
                                await api.replaceSensorBattery(s.id);
                                const updated = await api.getSensors();
                                if (Array.isArray(updated)) setSensors(updated);
                              }}
                              className="px-2 py-1 rounded-lg bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-300 text-[10px] font-bold transition-colors cursor-pointer"
                              title="Install fresh battery cell"
                            >
                              Replace Cell
                            </button>
                          )}
                          <button
                            disabled={calibratingId === s.id}
                            onClick={() => handleCalibrate(s.id)}
                            className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-[11px] font-semibold transition-colors cursor-pointer"
                          >
                            {calibratingId === s.id ? 'Calibrating...' : 'Zero Calibrate'}
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

          </div>
        </div>
      )}

    </div>
  );
};

