import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import {
  INITIAL_CAMPUSES,
  INITIAL_ZONES,
  INITIAL_PIPELINES,
  INITIAL_SENSORS
} from '../../data/mockDatabase';
import {
  Network,
  Building2,
  Layers,
  Activity,
  AlertOctagon,
  ShieldCheck,
  CheckCircle2,
  Radio,
  ArrowRight,
  TrendingDown,
  Droplets,
  Gauge
} from 'lucide-react';

export const DigitalWaterTwin: React.FC = () => {
  const { buildings, telemetry, setActiveTab } = useApp();

  const [selectedCampusId, setSelectedCampusId] = useState('camp-1');
  const [selectedBuildingId, setSelectedBuildingId] = useState('bld-1');
  const [selectedZoneId, setSelectedZoneId] = useState('zn-102');
  const [selectedPipeId, setSelectedPipeId] = useState('pipe-102');

  const selectedBuilding = buildings.find(b => b.id === selectedBuildingId) || buildings[0];
  const buildingZones = INITIAL_ZONES.filter(z => z.buildingId === selectedBuildingId);
  const buildingPipes = INITIAL_PIPELINES.filter(p => p.buildingId === selectedBuildingId);
  const selectedZone = buildingZones.find(z => z.id === selectedZoneId) || buildingZones[0];
  const selectedPipe = buildingPipes.find(p => p.id === selectedPipeId) || buildingPipes[0];
  const relevantSensors = INITIAL_SENSORS.filter(s => s.buildingId === selectedBuildingId);

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6 max-w-7xl mx-auto">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-black text-slate-900 tracking-tight flex items-center gap-2">
              <Network className="w-5 h-5 text-cyan-600" />
              Digital Water Twin Simulator & Hydraulic Topology
            </h1>
            <span className="text-[10px] font-mono uppercase bg-blue-100 text-blue-800 font-bold px-2 py-0.5 rounded-full">
              Full Campus Hierarchy
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Structural decomposition from Campus down to Pipe Segment & Sensor Telemetry
          </p>
        </div>

        {/* Breadcrumb Hierarchy Indicator (Section 7) */}
        <div className="flex items-center gap-1.5 text-xs font-semibold bg-slate-100 text-slate-700 px-3 py-1.5 rounded-xl border border-slate-200 overflow-x-auto">
          <span>JalRakshak Org</span>
          <span className="text-slate-400">→</span>
          <span className="text-cyan-700">Indira Campus</span>
          <span className="text-slate-400">→</span>
          <span className="text-blue-700">{selectedBuilding.code}</span>
          <span className="text-slate-400">→</span>
          <span className="text-purple-700">Floor 2</span>
          <span className="text-slate-400">→</span>
          <span className="text-rose-600 font-bold">Pipe P-104</span>
        </div>
      </div>

      {/* Visual Infrastructure Pipeline Diagram (Isometric / Schematic) */}
      <div className="bg-slate-900 rounded-2xl p-5 border border-slate-800 shadow-xl text-white">
        <div className="flex items-center justify-between pb-3 border-b border-slate-800 mb-4">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-cyan-400 animate-ping"></span>
            <h2 className="text-sm font-bold text-slate-200">
              Interactive Hydraulic Flow Graph — {selectedBuilding.name}
            </h2>
          </div>
          <span className="text-xs text-slate-400">
            Click any node below to inspect live pressure, flow, and risk factors
          </span>
        </div>

        {/* Schematic Flow Nodes */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 py-4 relative">
          
          {/* Node 1: Main City Inflow */}
          <div
            onClick={() => setSelectedPipeId('pipe-101')}
            className={`p-4 rounded-xl border transition-all cursor-pointer ${
              selectedPipeId === 'pipe-101'
                ? 'bg-slate-800 border-cyan-400 ring-2 ring-cyan-500/30'
                : 'bg-slate-950/60 border-slate-800 hover:border-slate-700'
            }`}
          >
            <div className="flex items-center justify-between text-xs text-slate-400">
              <span>Primary Ingress</span>
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            </div>
            <h3 className="font-bold text-sm text-slate-100 mt-2">Main Supply Line M-01</h3>
            <p className="text-[11px] text-slate-400 mt-1">Stainless Steel 80mm</p>
            <div className="mt-3 pt-2 border-t border-slate-800 text-xs flex justify-between font-mono">
              <span className="text-cyan-400">{telemetry.flowRateLpm} L/min</span>
              <span className="text-slate-300">{telemetry.pressureBar} bar</span>
            </div>
          </div>

          {/* Node 2: Booster Pump & Filtration */}
          <div
            onClick={() => setSelectedPipeId('pipe-101')}
            className={`p-4 rounded-xl border transition-all cursor-pointer ${
              selectedPipeId === 'pipe-101'
                ? 'bg-slate-800 border-cyan-400 ring-2 ring-cyan-500/30'
                : 'bg-slate-950/60 border-slate-800 hover:border-slate-700'
            }`}
          >
            <div className="flex items-center justify-between text-xs text-slate-400">
              <span>Booster Station</span>
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            </div>
            <h3 className="font-bold text-sm text-slate-100 mt-2">Chiller Loop Feeder</h3>
            <p className="text-[11px] text-slate-400 mt-1">SS 316 Loop A (145m)</p>
            <div className="mt-3 pt-2 border-t border-slate-800 text-xs flex justify-between font-mono">
              <span className="text-emerald-400">Health: 92%</span>
              <span className="text-slate-300">14% Risk</span>
            </div>
          </div>

          {/* Node 3: Floor 2 Wet Lab Risers (ANOMALY HOTSPOT) */}
          <div
            onClick={() => setSelectedPipeId('pipe-102')}
            className={`p-4 rounded-xl border transition-all cursor-pointer relative overflow-hidden ${
              selectedPipeId === 'pipe-102'
                ? 'bg-slate-800 border-rose-500 ring-2 ring-rose-500/50'
                : 'bg-rose-950/30 border-rose-800/80 hover:border-rose-600'
            }`}
          >
            <div className="absolute top-0 right-0 bg-rose-600 text-white text-[9px] font-extrabold uppercase px-2 py-0.5 rounded-bl">
              Suspected Leak
            </div>
            <div className="flex items-center justify-between text-xs text-rose-300">
              <span>Floor 2 Risers</span>
              <AlertOctagon className="w-4 h-4 text-rose-400 animate-pulse" />
            </div>
            <h3 className="font-bold text-sm text-rose-100 mt-2">Zone 2 Lab Manifold (P-104)</h3>
            <p className="text-[11px] text-rose-300/80 mt-1">CPVC 50mm (Install 2018)</p>
            <div className="mt-3 pt-2 border-t border-rose-900/60 text-xs flex justify-between font-mono">
              <span className="text-rose-400 font-bold">87% Risk</span>
              <span className="text-rose-300">2.7 bar (Low)</span>
            </div>
          </div>

          {/* Node 4: Rooftop Gravity Tank */}
          <div
            onClick={() => setSelectedPipeId('pipe-103')}
            className={`p-4 rounded-xl border transition-all cursor-pointer ${
              selectedPipeId === 'pipe-103'
                ? 'bg-slate-800 border-cyan-400 ring-2 ring-cyan-500/30'
                : 'bg-slate-950/60 border-slate-800 hover:border-slate-700'
            }`}
          >
            <div className="flex items-center justify-between text-xs text-slate-400">
              <span>Storage Balance</span>
              <CheckCircle2 className="w-4 h-4 text-teal-400" />
            </div>
            <h3 className="font-bold text-sm text-slate-100 mt-2">Rooftop Tank Tank-R1</h3>
            <p className="text-[11px] text-slate-400 mt-1">Capacity: 50,000 Liters</p>
            <div className="mt-3 pt-2 border-t border-slate-800 text-xs flex justify-between font-mono">
              <span className="text-teal-400">Level: {telemetry.tankLevelPercent}%</span>
              <span className="text-slate-300">Float OK</span>
            </div>
          </div>

        </div>

        <div className="text-[11px] text-slate-400 flex items-center justify-between pt-2 border-t border-slate-800">
          <span>Flow directional vector: Main Ingress ➔ Booster ➔ Lab Risers ➔ Rooftop Reservoir</span>
          <span className="text-rose-400 font-medium">Hydraulic head loss detected across Zone 2 (-1.1 bar)</span>
        </div>
      </div>

      {/* Two Columns: Twin Hierarchy Browser vs Selected Entity Inspector */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Hierarchy Tree Browser */}
        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs">
          <h2 className="text-sm font-bold text-slate-900 pb-3 border-b border-slate-100">
            Infrastructure Asset Hierarchy
          </h2>

          <div className="space-y-4 mt-4 text-xs">
            
            {/* Campus Selector */}
            <div>
              <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block mb-1">
                Campus (Level 1)
              </span>
              <select
                value={selectedCampusId}
                onChange={(e) => setSelectedCampusId(e.target.value)}
                className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg font-medium text-slate-800 focus:outline-hidden focus:ring-1 focus:ring-cyan-500"
              >
                {INITIAL_CAMPUSES.map(c => (
                  <option key={c.id} value={c.id}>{c.name} ({c.code})</option>
                ))}
              </select>
            </div>

            {/* Building Selector */}
            <div>
              <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block mb-1">
                Building (Level 2)
              </span>
              <div className="space-y-1.5 max-h-48 overflow-y-auto">
                {buildings.map(b => (
                  <button
                    key={b.id}
                    onClick={() => setSelectedBuildingId(b.id)}
                    className={`w-full flex items-center justify-between p-2 rounded-lg text-left transition-colors ${
                      selectedBuildingId === b.id
                        ? 'bg-blue-50 border border-blue-200 text-blue-900 font-semibold'
                        : 'hover:bg-slate-50 border border-slate-100 text-slate-700'
                    }`}
                  >
                    <span className="truncate">{b.name}</span>
                    <span className={`text-[10px] px-1.5 py-0.5 rounded font-bold ${
                      b.riskLevel === 'HIGH' ? 'bg-rose-100 text-rose-700' : 'bg-slate-100 text-slate-600'
                    }`}>
                      {b.leakageRiskPercent}%
                    </span>
                  </button>
                ))}
              </div>
            </div>

            {/* Zones in Selected Building */}
            <div>
              <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block mb-1">
                Active Zones (Level 3)
              </span>
              <div className="space-y-1.5">
                {buildingZones.map(z => (
                  <button
                    key={z.id}
                    onClick={() => setSelectedZoneId(z.id)}
                    className={`w-full flex items-center justify-between p-2 rounded-lg text-left transition-colors ${
                      selectedZoneId === z.id
                        ? 'bg-purple-50 border border-purple-200 text-purple-900 font-semibold'
                        : 'hover:bg-slate-50 border border-slate-100 text-slate-700'
                    }`}
                  >
                    <div>
                      <span className="block truncate">{z.name}</span>
                      <span className="text-[10px] text-slate-400 font-normal">Floor {z.floor} • Pipe {z.pipelineId}</span>
                    </div>
                    <span className={`text-[10px] px-1.5 py-0.5 rounded font-bold ${
                      z.riskLevel === 'CRITICAL' ? 'bg-rose-100 text-rose-700' : 'bg-slate-100 text-slate-600'
                    }`}>
                      {z.leakageRiskPercent}% Risk
                    </span>
                  </button>
                ))}
              </div>
            </div>

          </div>
        </div>

        {/* Selected Entity Inspector Pane */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200 p-5 shadow-xs space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-100">
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider bg-slate-100 text-slate-600 px-2 py-0.5 rounded">
                Entity Telemetry Inspector
              </span>
              <h2 className="text-base font-bold text-slate-900 mt-1">
                {selectedPipe ? selectedPipe.name : selectedBuilding.name}
              </h2>
            </div>
            <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${
              selectedPipe?.failureRisk === 'HIGH' ? 'bg-rose-100 text-rose-700 border border-rose-200' : 'bg-emerald-100 text-emerald-700 border border-emerald-200'
            }`}>
              Asset Risk: {selectedPipe?.failureRisk || 'NORMAL'}
            </span>
          </div>

          {/* Asset Technical Specifications */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-slate-50 p-4 rounded-xl border border-slate-200 text-xs">
            <div>
              <span className="text-slate-400 block">Material & Spec</span>
              <span className="font-bold text-slate-800 mt-0.5 block">{selectedPipe?.material || 'SS 316'}</span>
            </div>
            <div>
              <span className="text-slate-400 block">Diameter & Length</span>
              <span className="font-bold text-slate-800 mt-0.5 block">{selectedPipe?.diameterMm || 50}mm • {selectedPipe?.lengthMeters || 85}m</span>
            </div>
            <div>
              <span className="text-slate-400 block">Installation Vintage</span>
              <span className="font-bold text-slate-800 mt-0.5 block">{selectedPipe?.installYear || 2018} (8 years)</span>
            </div>
            <div>
              <span className="text-slate-400 block">Structural Health</span>
              <span className="font-bold text-slate-800 mt-0.5 block">{selectedPipe?.healthScore || 68} / 100</span>
            </div>
          </div>

          {/* Current Live Hydraulic State */}
          <div>
            <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
              Real-Time Dynamic Telemetry
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs">
              <div className="p-3 rounded-xl border border-slate-200 bg-white">
                <span className="text-slate-400 block">Sub-Zone Flow Velocity</span>
                <span className="text-lg font-bold text-slate-900 mt-1 block">
                  {selectedZone?.currentFlowRate || telemetry.flowRateLpm} L/min
                </span>
                <span className="text-[10px] text-rose-600 font-semibold">+143% above baseline</span>
              </div>
              <div className="p-3 rounded-xl border border-slate-200 bg-white">
                <span className="text-slate-400 block">Dynamic Pressure</span>
                <span className="text-lg font-bold text-slate-900 mt-1 block">
                  {selectedZone?.currentPressure || telemetry.pressureBar} bar
                </span>
                <span className="text-[10px] text-rose-600 font-semibold">-29% head drop</span>
              </div>
              <div className="p-3 rounded-xl border border-slate-200 bg-white">
                <span className="text-slate-400 block">Estimated Water Loss</span>
                <span className="text-lg font-bold text-rose-600 mt-1 block">
                  ~1,240 L/hr
                </span>
                <span className="text-[10px] text-slate-500">Unaccounted fluid volume</span>
              </div>
            </div>
          </div>

          {/* Attached Sensors Fleet */}
          <div>
            <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
              Associated Telemetry Sensors ({relevantSensors.length})
            </h3>
            <div className="space-y-2">
              {relevantSensors.slice(0, 3).map(s => (
                <div key={s.id} className="flex items-center justify-between p-2.5 bg-slate-50 rounded-lg border border-slate-200 text-xs">
                  <div className="flex items-center gap-2">
                    <Radio className="w-3.5 h-3.5 text-cyan-600" />
                    <span className="font-bold text-slate-800">{s.code}</span>
                    <span className="text-slate-500">({s.name})</span>
                  </div>
                  <div className="flex items-center gap-3 text-[11px]">
                    <span className="text-slate-500">Signal: {s.signalDbm} dBm</span>
                    <span className="text-slate-500">Battery: {s.batteryPercent}%</span>
                    <span className="font-bold text-emerald-600">{s.status}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Action Trigger */}
          <div className="pt-2 flex flex-wrap gap-2 justify-end">
            <button
              onClick={() => setActiveTab('maintenance')}
              className="px-4 py-2 rounded-xl text-xs font-semibold bg-slate-900 hover:bg-slate-800 text-white transition-colors"
            >
              Create Maintenance Work Order for {selectedPipe?.code || 'Asset'}
            </button>
          </div>

        </div>

      </div>

    </div>
  );
};
