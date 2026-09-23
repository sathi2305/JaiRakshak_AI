import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { api } from '../../services/api';
import {
  Activity,
  Gauge,
  Droplets,
  Radio,
  Clock,
  Battery,
  Wifi,
  AlertCircle,
  Play,
  Pause,
  RotateCcw
} from 'lucide-react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid
} from 'recharts';

export const RealTimeMonitoring: React.FC = () => {
  const { telemetry, simulationMode, injectSimulationEvent } = useApp();
  const [streamHistory, setStreamHistory] = useState<any[]>([]);
  const [isPaused, setIsPaused] = useState(false);

  // Maintain sliding window of the last 20 real-time readings
  useEffect(() => {
    if (isPaused) return;

    const timeStr = new Date().toLocaleTimeString('en-US', { hour12: false, minute: '2-digit', second: '2-digit' });
    setStreamHistory(prev => {
      const next = [
        ...prev,
        {
          time: timeStr,
          flow: telemetry.flowRateLpm,
          pressure: telemetry.pressureBar,
          tank: telemetry.tankLevelPercent,
          inlet: telemetry.flowRateLpm,
          outlet: Number((telemetry.flowRateLpm * 0.92).toFixed(1))
        }
      ];
      if (next.length > 20) next.shift();
      return next;
    });
  }, [telemetry, isPaused]);

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6 max-w-7xl mx-auto">
      
      {/* Header & Stream Controller */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-black text-slate-900 tracking-tight flex items-center gap-2">
              <Activity className="w-5 h-5 text-cyan-600 animate-pulse" />
              Real-Time Water Monitoring Engine
            </h1>
            <span className="text-[10px] font-mono uppercase bg-cyan-100 text-cyan-800 font-bold px-2 py-0.5 rounded-full">
              IoT Stream
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Zero-latency telemetry ingestion from high-frequency ultrasonic and piezo-electric transducers
          </p>
        </div>

        {/* Live Stream Controls */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsPaused(!isPaused)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold border transition-colors ${
              isPaused
                ? 'bg-amber-50 text-amber-700 border-amber-300 hover:bg-amber-100'
                : 'bg-slate-100 text-slate-700 border-slate-200 hover:bg-slate-200'
            }`}
          >
            {isPaused ? <Play className="w-3.5 h-3.5 fill-current" /> : <Pause className="w-3.5 h-3.5 fill-current" />}
            {isPaused ? 'Resume Stream' : 'Freeze Stream'}
          </button>
          <button
            onClick={() => injectSimulationEvent('RESET')}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-white text-slate-700 border border-slate-200 hover:bg-slate-50"
            title="Reset telemetry baseline"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            Reset Baseline
          </button>
        </div>
      </div>

      {/* Telemetry Live Cards Grid (Section 6 parameters) */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4">
        
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-slate-400 text-xs">
            <span>Flow Rate</span>
            <Gauge className="w-4 h-4 text-cyan-600" />
          </div>
          <div className="text-xl font-extrabold text-slate-900 mt-2">
            {telemetry.flowRateLpm} <span className="text-xs font-normal text-slate-500">L/min</span>
          </div>
          <div className="text-[10px] text-slate-500 mt-1">Sensor: FLW-101</div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-slate-400 text-xs">
            <span>Hydraulic Pressure</span>
            <Activity className="w-4 h-4 text-blue-600" />
          </div>
          <div className="text-xl font-extrabold text-slate-900 mt-2">
            {telemetry.pressureBar} <span className="text-xs font-normal text-slate-500">bar</span>
          </div>
          <div className="text-[10px] text-slate-500 mt-1">Normal: 3.6 – 4.2 bar</div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-slate-400 text-xs">
            <span>Tank Storage Level</span>
            <Droplets className="w-4 h-4 text-teal-600" />
          </div>
          <div className="text-xl font-extrabold text-slate-900 mt-2">
            {telemetry.tankLevelPercent}%
          </div>
          <div className="text-[10px] text-slate-500 mt-1">Rooftop Reservoir R-1</div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-slate-400 text-xs">
            <span>Cumulative Inflow</span>
            <Droplets className="w-4 h-4 text-indigo-600" />
          </div>
          <div className="text-xl font-extrabold text-slate-900 mt-2">
            {(telemetry.inletVolumeLiters ?? 0).toLocaleString()} <span className="text-xs font-normal text-slate-500">L</span>
          </div>
          <div className="text-[10px] text-slate-500 mt-1">Today's Ingress</div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-slate-400 text-xs">
            <span>Outlet Consumption</span>
            <Droplets className="w-4 h-4 text-sky-600" />
          </div>
          <div className="text-xl font-extrabold text-slate-900 mt-2">
            {(telemetry.outletVolumeLiters ?? 0).toLocaleString()} <span className="text-xs font-normal text-slate-500">L</span>
          </div>
          <div className="text-[10px] text-slate-500 mt-1">Delivered to fixtures</div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-slate-400 text-xs">
            <span>Hourly Rate</span>
            <Gauge className="w-4 h-4 text-amber-600" />
          </div>
          <div className="text-xl font-extrabold text-slate-900 mt-2">
            {(telemetry.consumptionRateLph ?? 0).toLocaleString()} <span className="text-xs font-normal text-slate-500">L/h</span>
          </div>
          <div className="text-[10px] text-slate-500 mt-1">Instantaneous velocity</div>
        </div>

      </div>

      {/* Streaming Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Real-Time Live Flow Velocity (L/min) */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
            <div>
              <h2 className="text-sm font-bold text-slate-900">
                Live Inflow vs Outflow Velocity (L/min)
              </h2>
              <p className="text-xs text-slate-500">Real-time discrepancy flags hidden leaks or valve slippage</p>
            </div>
            <span className="flex items-center gap-1 text-[11px] font-mono text-cyan-600 bg-cyan-50 px-2 py-0.5 rounded-sm">
              <span className="w-1.5 h-1.5 rounded-full bg-cyan-600 animate-ping"></span>
              3s update
            </span>
          </div>

          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={Array.isArray(streamHistory) ? streamHistory : []}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="time" tick={{ fontSize: 10, fill: '#64748b' }} />
                <YAxis domain={['auto', 'auto']} tick={{ fontSize: 10, fill: '#64748b' }} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#0f172a', borderRadius: '8px', color: '#fff', fontSize: '11px', border: 'none' }}
                />
                <Line type="monotone" dataKey="inlet" name="Inlet Flow (L/min)" stroke="#0284c7" strokeWidth={2.5} dot={false} isAnimationActive={false} />
                <Line type="monotone" dataKey="outlet" name="Outlet Metered (L/min)" stroke="#10b981" strokeWidth={2} strokeDasharray="3 3" dot={false} isAnimationActive={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Live Hydraulic Pressure Stream (bar) */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
            <div>
              <h2 className="text-sm font-bold text-slate-900">
                Live Hydraulic Line Pressure (bar)
              </h2>
              <p className="text-xs text-slate-500">Monitored for sudden pressure drops indicative of pipe burst</p>
            </div>
            <span className={`text-[11px] font-bold px-2 py-0.5 rounded-sm ${
              telemetry.pressureBar < 3.0 ? 'bg-rose-100 text-rose-700' : 'bg-emerald-100 text-emerald-700'
            }`}>
              {telemetry.pressureBar < 3.0 ? 'Pressure Deficit' : 'Optimal Pressure'}
            </span>
          </div>

          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={Array.isArray(streamHistory) ? streamHistory : []}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="time" tick={{ fontSize: 10, fill: '#64748b' }} />
                <YAxis domain={[1.0, 5.0]} tick={{ fontSize: 10, fill: '#64748b' }} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#0f172a', borderRadius: '8px', color: '#fff', fontSize: '11px', border: 'none' }}
                />
                <Line type="monotone" dataKey="pressure" name="Line Pressure (bar)" stroke="#f43f5e" strokeWidth={2.5} dot={false} isAnimationActive={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

      </div>

      {/* Sensor Metadata & Transducer State Bar */}
      <div className="bg-slate-900 text-white rounded-2xl p-5 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <Radio className="w-4 h-4 text-cyan-400 animate-pulse" />
            <span className="font-bold text-sm">Active Transducer Telemetry Hub</span>
            <span className="text-xs text-slate-400 font-mono">ID: FLW-101-BLOCK-A</span>
          </div>
          <span className="text-xs text-emerald-400 font-mono flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
            LoRaWAN Uplink: Nominal (SF7 / 868 MHz)
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-4 text-xs">
          <div>
            <span className="text-slate-400 block">Battery Level</span>
            <span className="font-bold text-slate-200 flex items-center gap-1.5 mt-0.5">
              <Battery className="w-4 h-4 text-emerald-400" />
              98% (LiSOCl2 3.6V)
            </span>
          </div>
          <div>
            <span className="text-slate-400 block">RSSI Signal Strength</span>
            <span className="font-bold text-slate-200 flex items-center gap-1.5 mt-0.5">
              <Wifi className="w-4 h-4 text-cyan-400" />
              -62 dBm (Excellent)
            </span>
          </div>
          <div>
            <span className="text-slate-400 block">Packet Error Rate</span>
            <span className="font-bold text-slate-200 mt-0.5 block font-mono">
              0.02% (0 dropped / 14,200)
            </span>
          </div>
          <div>
            <span className="text-slate-400 block">Last Transmission</span>
            <span className="font-bold text-slate-200 flex items-center gap-1.5 mt-0.5">
              <Clock className="w-3.5 h-3.5 text-slate-400" />
              {new Date().toLocaleTimeString()}
            </span>
          </div>
        </div>
      </div>

    </div>
  );
};
