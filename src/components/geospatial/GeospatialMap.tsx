import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import {
  MapPin,
  Layers,
  Activity,
  AlertOctagon,
  ShieldCheck,
  CheckCircle2,
  Droplets,
  Radio,
  Maximize2
} from 'lucide-react';

export const GeospatialMap: React.FC = () => {
  const { buildings, setActiveTab, setActiveBuildingId } = useApp();
  const [selectedNode, setSelectedNode] = useState<any>(buildings[0]);
  const [showPipes, setShowPipes] = useState(true);
  const [showSensors, setShowSensors] = useState(true);

  // Map coordinates (percentages for responsive schematic representation)
  const mapNodes = [
    {
      id: 'bld-1',
      name: 'Engineering & Innovation (Block A)',
      x: 35,
      y: 35,
      risk: 87,
      riskLevel: 'HIGH',
      flow: '48.5 L/m',
      pressure: '2.7 bar',
      type: 'building'
    },
    {
      id: 'bld-2',
      name: 'Science & Research Labs (Block B)',
      x: 65,
      y: 25,
      risk: 42,
      riskLevel: 'MEDIUM',
      flow: '32.1 L/m',
      pressure: '3.6 bar',
      type: 'building'
    },
    {
      id: 'bld-3',
      name: 'Administrative Complex (Block C)',
      x: 25,
      y: 65,
      risk: 15,
      riskLevel: 'LOW',
      flow: '14.8 L/m',
      pressure: '3.9 bar',
      type: 'building'
    },
    {
      id: 'bld-4',
      name: 'Student Dining Hall (Block D)',
      x: 75,
      y: 60,
      risk: 54,
      riskLevel: 'MEDIUM',
      flow: '28.4 L/m',
      pressure: '3.4 bar',
      type: 'building'
    },
    {
      id: 'bld-5',
      name: 'Central Utility & Chiller Plant',
      x: 50,
      y: 80,
      risk: 8,
      riskLevel: 'LOW',
      flow: '65.0 L/m',
      pressure: '4.2 bar',
      type: 'utility'
    },
    {
      id: 'node-tank',
      name: 'Master Elevated Storage Reservoir',
      x: 50,
      y: 15,
      risk: 5,
      riskLevel: 'LOW',
      flow: '120.0 L/m',
      pressure: '4.8 bar',
      type: 'reservoir'
    }
  ];

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6 max-w-7xl mx-auto">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-black text-slate-900 tracking-tight flex items-center gap-2">
              <MapPin className="w-5 h-5 text-cyan-600" />
              Geo-Spatial Infrastructure GIS Intelligence
            </h1>
            <span className="text-[10px] font-mono uppercase bg-cyan-100 text-cyan-800 font-bold px-2 py-0.5 rounded-full">
              Indira Campus GIS
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Spatial distribution of underground mains, building connections, and real-time leakage risk intensity
          </p>
        </div>

        {/* Layer Toggles */}
        <div className="flex items-center gap-2 text-xs">
          <button
            onClick={() => setShowPipes(!showPipes)}
            className={`px-3 py-1.5 rounded-lg border font-medium transition-colors ${
              showPipes ? 'bg-cyan-50 text-cyan-700 border-cyan-200' : 'bg-white text-slate-600 border-slate-200'
            }`}
          >
            Hydraulic Mains {showPipes ? 'ON' : 'OFF'}
          </button>
          <button
            onClick={() => setShowSensors(!showSensors)}
            className={`px-3 py-1.5 rounded-lg border font-medium transition-colors ${
              showSensors ? 'bg-cyan-50 text-cyan-700 border-cyan-200' : 'bg-white text-slate-600 border-slate-200'
            }`}
          >
            Sensor Nodes {showSensors ? 'ON' : 'OFF'}
          </button>
        </div>
      </div>

      {/* Interactive 2D Schematic Canvas & Inspector */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Map Canvas (2 cols) */}
        <div className="lg:col-span-2 bg-slate-950 rounded-2xl border border-slate-800 p-6 relative overflow-hidden shadow-2xl min-h-[440px] flex flex-col justify-between">
          
          {/* Legend Top Bar */}
          <div className="flex flex-wrap items-center justify-between gap-2 z-10 text-[11px] text-slate-400">
            <div className="flex items-center gap-4">
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-rose-500 animate-pulse"></span>
                Critical Risk (&gt;80%)
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-amber-500"></span>
                Moderate (30–60%)
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span>
                Nominal (&lt;30%)
              </span>
            </div>
            <span className="text-[10px] font-mono text-cyan-400">Scale: 1:2500 Campus Grid</span>
          </div>

          {/* SVG Connection Lines for Pipelines */}
          {showPipes && (
            <svg className="absolute inset-0 w-full h-full pointer-events-none z-0">
              <defs>
                <linearGradient id="pipeGlow" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#06b6d4" stopOpacity="0.8" />
                  <stop offset="100%" stopColor="#3b82f6" stopOpacity="0.4" />
                </linearGradient>
              </defs>
              {/* Reservoir to buildings */}
              <line x1="50%" y1="15%" x2="35%" y2="35%" stroke="url(#pipeGlow)" strokeWidth="3" strokeDasharray="4 2" />
              <line x1="50%" y1="15%" x2="65%" y2="25%" stroke="url(#pipeGlow)" strokeWidth="3" strokeDasharray="4 2" />
              <line x1="35%" y1="35%" x2="25%" y2="65%" stroke="url(#pipeGlow)" strokeWidth="3" />
              <line x1="65%" y1="25%" x2="75%" y2="60%" stroke="url(#pipeGlow)" strokeWidth="3" />
              <line x1="25%" y1="65%" x2="50%" y2="80%" stroke="url(#pipeGlow)" strokeWidth="4" />
              <line x1="75%" y1="60%" x2="50%" y2="80%" stroke="url(#pipeGlow)" strokeWidth="4" />
            </svg>
          )}

          {/* Map Node Markers */}
          <div className="relative w-full h-80 z-10">
            {mapNodes.map(node => {
              const isSelected = selectedNode?.id === node.id;
              const isCritical = node.riskLevel === 'HIGH';

              return (
                <div
                  key={node.id}
                  onClick={() => setSelectedNode(node)}
                  style={{ left: `${node.x}%`, top: `${node.y}%` }}
                  className="absolute transform -translate-x-1/2 -translate-y-1/2 cursor-pointer group"
                >
                  {/* Ping Ring for Critical */}
                  {isCritical && (
                    <span className="absolute -inset-2 rounded-full bg-rose-500/40 animate-ping"></span>
                  )}

                  {/* Marker Pin */}
                  <div
                    className={`w-9 h-9 rounded-xl flex items-center justify-center transition-all shadow-lg ${
                      isCritical
                        ? 'bg-rose-600 text-white ring-2 ring-rose-400'
                        : node.riskLevel === 'MEDIUM'
                        ? 'bg-amber-500 text-white'
                        : 'bg-emerald-600 text-white'
                    } ${isSelected ? 'scale-125 ring-3 ring-cyan-400' : 'hover:scale-110'}`}
                  >
                    {node.type === 'reservoir' ? (
                      <Droplets className="w-5 h-5" />
                    ) : node.type === 'utility' ? (
                      <Activity className="w-5 h-5" />
                    ) : (
                      <MapPin className="w-5 h-5" />
                    )}
                  </div>

                  {/* Marker Tooltip on Hover */}
                  <div className="absolute top-10 left-1/2 -translate-x-1/2 hidden group-hover:block bg-slate-900 text-white text-[10px] py-1 px-2 rounded whitespace-nowrap shadow-xl border border-slate-700 z-30">
                    {node.name} • {node.risk}% Risk
                  </div>
                </div>
              );
            })}
          </div>

          <div className="text-[11px] text-slate-500 flex justify-between z-10 pt-2 border-t border-slate-900">
            <span>Coordinate System: UTM Zone 43N • GPS Anchored</span>
            <span className="text-rose-400 font-bold">Hotspot: Block A Floor 2 (CPVC Line)</span>
          </div>

        </div>

        {/* Selected Facility Inspector Pane */}
        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs space-y-4">
          <div className="pb-3 border-b border-slate-100">
            <span className="text-[10px] font-bold uppercase tracking-wider bg-slate-100 text-slate-600 px-2 py-0.5 rounded">
              Spatial Node Inspection
            </span>
            <h2 className="text-base font-bold text-slate-900 mt-1">
              {selectedNode ? selectedNode.name : 'Select a node on the map'}
            </h2>
          </div>

          {selectedNode ? (
            <div className="space-y-4 text-xs">
              
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-1">
                <div className="flex justify-between">
                  <span className="text-slate-500">Node Identifier:</span>
                  <span className="font-mono font-bold text-slate-800">{selectedNode.id}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Classification:</span>
                  <span className="font-bold text-slate-800 capitalize">{selectedNode.type}</span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                  <span className="text-slate-400 block text-[10px]">Current Flow</span>
                  <span className="text-base font-bold text-slate-900 mt-0.5 block">
                    {selectedNode.flow}
                  </span>
                </div>
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                  <span className="text-slate-400 block text-[10px]">Head Pressure</span>
                  <span className="text-base font-bold text-slate-900 mt-0.5 block">
                    {selectedNode.pressure}
                  </span>
                </div>
              </div>

              <div className="p-3.5 rounded-xl border border-slate-200 bg-slate-50">
                <div className="flex justify-between items-center mb-1">
                  <span className="font-bold text-slate-800">Leak Probability</span>
                  <span className={`font-mono font-black ${
                    selectedNode.risk > 60 ? 'text-rose-600' : 'text-emerald-600'
                  }`}>
                    {selectedNode.risk}%
                  </span>
                </div>
                <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full ${
                      selectedNode.risk > 60 ? 'bg-rose-500' : selectedNode.risk > 30 ? 'bg-amber-500' : 'bg-emerald-500'
                    }`}
                    style={{ width: `${selectedNode.risk}%` }}
                  ></div>
                </div>
              </div>

              <button
                onClick={() => {
                  setActiveBuildingId(selectedNode.id);
                  setActiveTab('digital-twin');
                }}
                className="w-full py-2 px-3 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-semibold text-xs transition-colors"
              >
                Inspect in Digital Twin Hierarchy →
              </button>

            </div>
          ) : (
            <p className="text-xs text-slate-400 italic">Select any building node on the map</p>
          )}
        </div>

      </div>

    </div>
  );
};
