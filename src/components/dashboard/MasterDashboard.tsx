import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { api } from '../../services/api';
import {
  Droplets,
  Gauge,
  TrendingDown,
  TrendingUp,
  AlertTriangle,
  ShieldAlert,
  Activity,
  Award,
  Sparkles,
  Sliders,
  ChevronRight,
  RefreshCw,
  Building2,
  CheckCircle2,
  HelpCircle,
  WifiOff,
  Wifi,
  Database
} from 'lucide-react';
import { useOnlineStatus } from '../../hooks/useOnlineStatus';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  CartesianGrid
} from 'recharts';

export const MasterDashboard: React.FC = () => {
  const {
    telemetry,
    buildings,
    alerts,
    setActiveTab,
    setIsCopilotOpen,
    setIsSimulatorDrawerOpen,
    simulationMode,
    injectSimulationEvent
  } = useApp();

  const { isOnline, cacheStats } = useOnlineStatus();
  const [historicalData, setHistoricalData] = useState<any[]>([]);
  const [telemetryHorizon, setTelemetryHorizon] = useState<'24h' | '12h' | 'night'>('24h');
  const [selectedBuildingId, setSelectedBuildingId] = useState('bld-1');
  const [explainModalOpen, setExplainModalOpen] = useState(false);
  const [isRefreshingTelemetry, setIsRefreshingTelemetry] = useState(false);

  const loadTelemetry = async (horizonHours = 24) => {
    setIsRefreshingTelemetry(true);
    try {
      const data: any = await api.getHistoricalReadings(horizonHours);
      const readings = Array.isArray(data) ? data : (data?.readings || []);
      setHistoricalData(readings);
    } catch (e) {
      // api.getHistoricalReadings handles fallback internally
    } finally {
      setIsRefreshingTelemetry(false);
    }
  };

  useEffect(() => {
    const hours = telemetryHorizon === '12h' ? 12 : 24;
    loadTelemetry(hours);
  }, [telemetryHorizon, isOnline]);

  // Compute displayed chart data based on selected horizon
  const displayedHistoricalData = React.useMemo(() => {
    if (!Array.isArray(historicalData) || historicalData.length === 0) return [];
    if (telemetryHorizon === 'night') {
      // Filter for night hours 00:00 through 06:00
      const nightFiltered = historicalData.filter((d: any) => {
        const hourNum = parseInt((d.hour || '').split(':')[0], 10);
        return !isNaN(hourNum) && hourNum >= 0 && hourNum <= 6;
      });
      return nightFiltered.length > 0 ? nightFiltered : historicalData.slice(0, 7);
    }
    if (telemetryHorizon === '12h') {
      return historicalData.slice(-12);
    }
    return historicalData;
  }, [historicalData, telemetryHorizon]);

  const isUsingOfflineLocalTelemetry = !isOnline || historicalData.some((d: any) => d?.isOfflineCached);

  const totalConsumptionToday = (buildings || []).reduce((acc, b) => acc + (b?.todayConsumptionLiters || 0), 0) || 71050;
  const activeAlerts = (alerts || []).filter(a => a?.status === 'NEW' || a?.status === 'IN_PROGRESS');
  const criticalAlert = activeAlerts.find(a => a?.severity === 'HIGH' || a?.severity === 'CRITICAL') || alerts?.[0];

  const selectedBuilding = (buildings || []).find(b => b?.id === selectedBuildingId) || buildings?.[0];

  // 10 KPI Cards
  const kpiCards = [
    {
      id: 'kpi-consumption',
      title: "Today's Consumption",
      value: `${(totalConsumptionToday || 0).toLocaleString()} L`,
      delta: '↓ 8.4% vs baseline',
      isGood: true,
      icon: Droplets,
      color: 'text-blue-600 bg-blue-50 border-blue-100',
      caption: 'Across 5 monitored facilities'
    },
    {
      id: 'kpi-flow',
      title: 'Current Flow Rate',
      value: `${telemetry.flowRateLpm} L/min`,
      delta: telemetry.flowRateLpm > 40 ? '↑ Elevated flow' : 'Normal operating band',
      isGood: telemetry.flowRateLpm <= 40,
      icon: Gauge,
      color: 'text-cyan-600 bg-cyan-50 border-cyan-100',
      caption: 'Main Ultrasonic Meter FLW-101'
    },
    {
      id: 'kpi-demand',
      title: 'Estimated Daily Demand',
      value: '74,200 L',
      delta: 'Target: < 78,000 L',
      isGood: true,
      icon: Activity,
      color: 'text-indigo-600 bg-indigo-50 border-indigo-100',
      caption: 'AI Ensemble Forecast (92% conf)'
    },
    {
      id: 'kpi-saved',
      title: 'Water Saved (YTD)',
      value: '1.24 M Liters',
      delta: '↑ +14.2% YoY',
      isGood: true,
      icon: Award,
      color: 'text-emerald-600 bg-emerald-50 border-emerald-100',
      caption: '$18,600 avoided cost'
    },
    {
      id: 'kpi-leak-risk',
      title: 'Leakage Risk Index',
      value: `${telemetry.leakageRiskPercent}%`,
      delta: telemetry.leakageRiskPercent > 60 ? 'HIGH RISK DETECTED' : 'Optimal integrity',
      isGood: telemetry.leakageRiskPercent < 50,
      icon: ShieldAlert,
      color: telemetry.leakageRiskPercent > 60 ? 'text-rose-600 bg-rose-50 border-rose-200' : 'text-emerald-600 bg-emerald-50 border-emerald-100',
      caption: 'Floor 2 Zone B Pipeline P-104'
    },
    {
      id: 'kpi-alerts',
      title: 'Active Smart Alerts',
      value: `${activeAlerts.length} Active`,
      delta: `${activeAlerts.filter(a => a.severity === 'HIGH').length} Critical priority`,
      isGood: activeAlerts.length === 0,
      icon: AlertTriangle,
      color: activeAlerts.length > 0 ? 'text-amber-600 bg-amber-50 border-amber-200' : 'text-emerald-600 bg-emerald-50 border-emerald-100',
      caption: '1 assigned to maintenance'
    },
    {
      id: 'kpi-tank',
      title: 'Rooftop Tank Level',
      value: `${telemetry.tankLevelPercent}%`,
      delta: telemetry.tankLevelPercent > 90 ? 'Near overflow mark' : 'Buffer: 38,000 L',
      isGood: telemetry.tankLevelPercent >= 30 && telemetry.tankLevelPercent <= 90,
      icon: Droplets,
      color: 'text-teal-600 bg-teal-50 border-teal-100',
      caption: 'Auto-pump cutoff armed'
    },
    {
      id: 'kpi-quality',
      title: 'Water Quality Score',
      value: `${telemetry.waterQualityScore} / 100`,
      delta: 'Status: GOOD (Potable)',
      isGood: telemetry.waterQualityScore >= 80,
      icon: CheckCircle2,
      color: 'text-emerald-600 bg-emerald-50 border-emerald-100',
      caption: 'pH 7.2 | Turbidity 0.45 NTU'
    },
    {
      id: 'kpi-monthly',
      title: 'Monthly Consumption',
      value: '1.84 M Liters',
      delta: '↓ 6.2% vs last month',
      isGood: true,
      icon: TrendingDown,
      color: 'text-sky-600 bg-sky-50 border-sky-100',
      caption: 'Month-to-date tracking'
    },
    {
      id: 'kpi-target',
      title: 'Conservation Target',
      value: '77.5% Goal',
      delta: 'Target: 20% Reduction',
      isGood: true,
      icon: Award,
      color: 'text-violet-600 bg-violet-50 border-violet-100',
      caption: 'On track to meet Q4 mandate'
    }
  ];

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6 max-w-7xl mx-auto">
      
      {/* Top Banner & Quick Controls */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
              Master Command Center
            </h1>
            <span className="bg-emerald-100 text-emerald-800 text-[11px] font-bold px-2 py-0.5 rounded-full">
              Live Stream
            </span>
          </div>
          <p className="text-xs sm:text-sm text-slate-700 mt-1">
            Indira Innovation Tech Campus • Continuous Hydraulic Telemetry & Predictive Anomaly Engine
          </p>
        </div>

        {/* Quick Actions */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            id="open-what-if-btn"
            onClick={() => setActiveTab('simulator')}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-slate-100 text-slate-700 hover:bg-slate-200 transition-colors"
          >
            <Sliders className="w-3.5 h-3.5" />
            What-If Simulator
          </button>
          <button
            id="open-copilot-btn"
            onClick={() => setIsCopilotOpen(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-cyan-600 text-white hover:bg-cyan-700 transition-colors shadow-xs"
          >
            <Sparkles className="w-3.5 h-3.5" />
            Ask Copilot
          </button>
        </div>
      </div>

      {/* Critical Suspected Leakage Alert Spotlight (Section 9) */}
      {criticalAlert && (
        <div className="bg-linear-to-r from-rose-50 via-amber-50 to-orange-50 border border-rose-200 rounded-2xl p-4 sm:p-5 shadow-xs">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
            <div className="flex items-start gap-3.5">
              <div className="p-2.5 bg-rose-500 text-white rounded-xl shadow-sm shrink-0 mt-0.5">
                <AlertTriangle className="w-6 h-6 animate-pulse" />
              </div>
              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <span className="bg-rose-600 text-white text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-sm">
                    {criticalAlert?.type ? criticalAlert.type.replace(/_/g, ' ') : 'LEAKAGE RISK'}
                  </span>
                  <span className="text-xs font-bold text-rose-900">
                    AI Confidence: {criticalAlert?.aiConfidencePercent ?? 91}%
                  </span>
                  <span className="text-xs text-rose-700">
                    Estimated Loss: ~{(criticalAlert?.estimatedWaterLossLph ?? 1240).toLocaleString()} L/hour
                  </span>
                </div>
                <h3 className="text-sm sm:text-base font-bold text-slate-900 mt-1">
                  {criticalAlert?.reason || 'Critical Suspected Leakage Detected'}
                </h3>
                <p className="text-xs text-slate-600 mt-0.5">
                  <strong className="text-slate-800">Action Required:</strong> {criticalAlert?.recommendedAction || 'Immediate technician inspection required'}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 shrink-0 self-end lg:self-center">
              <button
                id="why-did-ai-predict-btn"
                onClick={() => setExplainModalOpen(true)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-white text-slate-700 border border-slate-300 hover:bg-slate-50 transition-colors shadow-xs cursor-pointer"
              >
                <HelpCircle className="w-3.5 h-3.5 text-cyan-600" />
                Why did AI predict this?
              </button>
              <button
                id="view-anomaly-details-btn"
                onClick={() => setActiveTab('anomalies')}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-rose-600 text-white hover:bg-rose-700 transition-colors shadow-xs cursor-pointer"
              >
                Investigate
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 10 KPI Cards Grid (Section 5) */}
      <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-5 gap-3 sm:gap-4">
        {kpiCards.map(kpi => {
          const Icon = kpi.icon;
          return (
            <div
              key={kpi.id}
              className="bg-white rounded-xl p-3.5 sm:p-4 border border-slate-200 shadow-xs hover:shadow-md transition-shadow"
            >
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider truncate">
                  {kpi.title}
                </span>
                <div className={`p-1.5 rounded-lg border ${kpi.color}`}>
                  <Icon className="w-4 h-4" />
                </div>
              </div>
              <div className="mt-2.5">
                <div className="text-lg sm:text-xl font-extrabold text-slate-900 tracking-tight">
                  {kpi.value}
                </div>
                <div className="flex items-center gap-1 mt-1 text-[11px] font-medium">
                  <span className={kpi.isGood ? 'text-emerald-600' : 'text-rose-600'}>
                    {kpi.delta}
                  </span>
                </div>
                <div className="text-[10px] text-slate-400 mt-1 truncate">
                  {kpi.caption}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Real-Time Live Telemetry Charts (Section 6) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* 24-Hour Hourly Consumption vs Baseline Chart (with Local Historical Telemetry Support) */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200 p-5 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100">
              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <h2 className="text-sm sm:text-base font-bold text-slate-900">
                    24-Hour Consumption Dynamics vs Baseline
                  </h2>
                  {isUsingOfflineLocalTelemetry ? (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-900 border border-amber-300">
                      <WifiOff className="w-3 h-3 text-amber-700" />
                      Offline Cached Telemetry
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
                      <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                      Service Worker Local Store Synced
                    </span>
                  )}
                </div>
                <p className="text-xs text-slate-500 mt-0.5">
                  Hourly flow rate (Liters) with real-time anomaly deviation overlay • Preserved locally for offline access
                </p>
              </div>

              {/* Horizon & Refresh Controls */}
              <div className="flex flex-wrap items-center gap-2">
                <div className="inline-flex rounded-lg bg-slate-100 p-0.5 text-xs font-semibold text-slate-600">
                  <button
                    onClick={() => setTelemetryHorizon('24h')}
                    className={`px-2.5 py-1 rounded-md transition-colors ${
                      telemetryHorizon === '24h'
                        ? 'bg-white text-slate-900 shadow-xs font-bold'
                        : 'hover:text-slate-900'
                    }`}
                  >
                    24h Full
                  </button>
                  <button
                    onClick={() => setTelemetryHorizon('12h')}
                    className={`px-2.5 py-1 rounded-md transition-colors ${
                      telemetryHorizon === '12h'
                        ? 'bg-white text-slate-900 shadow-xs font-bold'
                        : 'hover:text-slate-900'
                    }`}
                  >
                    12h
                  </button>
                  <button
                    onClick={() => setTelemetryHorizon('night')}
                    className={`px-2.5 py-1 rounded-md transition-colors ${
                      telemetryHorizon === 'night'
                        ? 'bg-rose-600 text-white shadow-xs font-bold'
                        : 'hover:text-slate-900'
                    }`}
                    title="Zoom in on 00:00 - 06:00 night-time leak anomaly window"
                  >
                    Night Zoom
                  </button>
                </div>

                <button
                  onClick={() => loadTelemetry(telemetryHorizon === '12h' ? 12 : 24)}
                  disabled={isRefreshingTelemetry}
                  className="p-1.5 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50 transition-colors cursor-pointer"
                  title="Refresh telemetry from network or local service worker storage"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${isRefreshingTelemetry ? 'animate-spin text-cyan-600' : ''}`} />
                </button>
              </div>
            </div>

            {/* Legend & Telemetry Source Bar */}
            <div className="flex flex-wrap items-center justify-between gap-2 mt-3 text-xs">
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-1.5">
                  <span className="w-3 h-3 rounded-xs bg-cyan-500"></span>
                  <span className="text-slate-700 font-medium">Actual Consumption</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="w-3 h-1 rounded-xs bg-slate-300"></span>
                  <span className="text-slate-500">AI Baseline</span>
                </div>
              </div>

              <div className="flex items-center gap-1.5 text-[11px] text-slate-500 bg-slate-50 px-2.5 py-1 rounded-md border border-slate-200">
                <Database className="w-3 h-3 text-cyan-600" />
                <span>
                  {isUsingOfflineLocalTelemetry
                    ? 'Local Storage (Service Worker & IndexedDB)'
                    : 'Network Stream + IndexedDB Backup'}
                </span>
              </div>
            </div>

            <div className="h-64 sm:h-72 mt-3">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={displayedHistoricalData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="actualGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#0284c7" stopOpacity={0.4}/>
                      <stop offset="95%" stopColor="#0284c7" stopOpacity={0.0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis dataKey="hour" tick={{ fontSize: 11, fill: '#64748b' }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 11, fill: '#64748b' }} axisLine={false} tickLine={false} />
                  <Tooltip
                    contentStyle={{ backgroundColor: '#0f172a', borderRadius: '8px', color: '#fff', fontSize: '12px', border: 'none' }}
                    labelStyle={{ color: '#94a3b8', fontWeight: 'bold' }}
                    formatter={(val: any, name?: any, item?: any) => [
                      `${val} Liters`,
                      name === 'actualLiters' ? 'Observed Flow' : 'Expected Baseline'
                    ] as any}
                  />
                  <Area type="monotone" dataKey="baselineLiters" stroke="#94a3b8" strokeDasharray="4 4" fill="none" strokeWidth={2} />
                  <Area type="monotone" dataKey="actualLiters" stroke="#0284c7" strokeWidth={2.5} fillOpacity={1} fill="url(#actualGrad)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
          
          <div className="mt-3 pt-3 border-t border-slate-100 flex flex-wrap items-center justify-between text-xs text-slate-500">
            <span className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-rose-500"></span>
              <span>Highlighted Spike: 01:00–04:00 night anomaly in Block A ({displayedHistoricalData.length} hours plotted)</span>
            </span>
            <button
              onClick={() => setActiveTab('monitoring')}
              className="text-cyan-600 hover:text-cyan-700 font-semibold cursor-pointer"
            >
              Open Full Telemetry Studio →
            </button>
          </div>
        </div>

        {/* Building Health & Flow Distribution */}
        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h2 className="text-sm sm:text-base font-bold text-slate-900">
                Campus Facilities
              </h2>
              <button
                onClick={() => setActiveTab('comparison')}
                className="text-xs text-cyan-600 font-semibold hover:text-cyan-700"
              >
                Compare All
              </button>
            </div>

            <div className="space-y-3 mt-4">
              {buildings.map(b => (
                <div
                  key={b.id}
                  onClick={() => setSelectedBuildingId(b.id)}
                  className={`p-3 rounded-xl border transition-all cursor-pointer ${
                    selectedBuildingId === b.id
                      ? 'border-cyan-500 bg-cyan-50/50 ring-1 ring-cyan-500'
                      : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-xs text-slate-900 truncate max-w-[180px]">
                      {b.name}
                    </span>
                    <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ${
                      b.riskLevel === 'HIGH' ? 'bg-rose-100 text-rose-700' :
                      b.riskLevel === 'MEDIUM' ? 'bg-amber-100 text-amber-700' :
                      'bg-emerald-100 text-emerald-700'
                    }`}>
                      {b.leakageRiskPercent}% Risk
                    </span>
                  </div>
                  
                  <div className="flex items-center justify-between text-[11px] text-slate-500 mt-2">
                    <span>Flow: <strong className="text-slate-700">{b.currentFlowRate} L/m</strong></span>
                    <span>Pressure: <strong className="text-slate-700">{b.currentPressure} bar</strong></span>
                    <span>Tank: <strong className="text-slate-700">{b.tankLevelPercent}%</strong></span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="pt-4 border-t border-slate-100 mt-4">
            <button
              onClick={() => setActiveTab('digital-twin')}
              className="w-full py-2 px-3 rounded-xl bg-slate-900 text-white text-xs font-semibold hover:bg-slate-800 transition-colors flex items-center justify-center gap-2"
            >
              <Building2 className="w-3.5 h-3.5" />
              Explore Digital Twin Topology
            </button>
          </div>
        </div>

      </div>

      {/* "Why Did AI Predict This?" Explainable AI Modal (Section 13) */}
      {explainModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-xl w-full border border-slate-200 shadow-2xl p-6 animate-in fade-in zoom-in-95">
            <div className="flex items-start justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-cyan-100 text-cyan-700 flex items-center justify-center font-bold">
                  AI
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900">
                    Why Did AI Predict High Leakage Risk (91%)?
                  </h3>
                  <p className="text-xs text-slate-500">
                    Transparent Feature Importance & Hybrid Model Explanations
                  </p>
                </div>
              </div>
              <button
                onClick={() => setExplainModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 text-lg font-bold"
              >
                ✕
              </button>
            </div>

            <div className="mt-4 space-y-4 text-xs">
              
              <div className="bg-slate-50 rounded-xl p-3.5 border border-slate-200">
                <span className="font-semibold text-slate-700 block mb-1">Algorithmic Techniques Applied:</span>
                <p className="text-slate-600 leading-relaxed">
                  Hybrid combination of <strong>Rolling Z-Score (3.42σ deviation)</strong>, <strong>Isolation Forest Anomaly Classifier</strong>, and <strong>Night-Time Minimum Baseline Comparison</strong>.
                </p>
              </div>

              <div>
                <span className="font-semibold text-slate-700 block mb-2">Deterministic Feature Triggers:</span>
                <div className="space-y-2">
                  <div className="flex items-center justify-between p-2 rounded-lg bg-rose-50/70 border border-rose-100">
                    <span className="font-medium text-rose-900">✓ Flow increased +143% above 02:00 AM baseline</span>
                    <span className="font-bold text-rose-700">38% Weight</span>
                  </div>
                  <div className="flex items-center justify-between p-2 rounded-lg bg-rose-50/70 border border-rose-100">
                    <span className="font-medium text-rose-900">✓ Hydraulic pressure dropped from 3.8 to 2.7 bar (-29%)</span>
                    <span className="font-bold text-rose-700">28% Weight</span>
                  </div>
                  <div className="flex items-center justify-between p-2 rounded-lg bg-amber-50/70 border border-amber-100">
                    <span className="font-medium text-amber-900">✓ Zero laboratory room badge-in during abnormal flow duration</span>
                    <span className="font-bold text-amber-700">18% Weight</span>
                  </div>
                  <div className="flex items-center justify-between p-2 rounded-lg bg-slate-100 border border-slate-200">
                    <span className="font-medium text-slate-800">✓ Pipe P-104 CPVC installed 2018 (8-year fatigue window)</span>
                    <span className="font-bold text-slate-600">16% Weight</span>
                  </div>
                </div>
              </div>

              <div className="p-3 bg-blue-50/80 rounded-xl border border-blue-200 text-blue-900">
                <strong>Responsible AI Notice:</strong> This is a predictive analytical assessment based on real-time sensor signatures. Physical inspection by the maintenance crew is required for definitive on-site confirmation.
              </div>

            </div>

            <div className="mt-6 pt-3 border-t border-slate-100 flex justify-end gap-2">
              <button
                onClick={() => setExplainModalOpen(false)}
                className="px-4 py-2 rounded-xl text-xs font-semibold bg-slate-100 hover:bg-slate-200 text-slate-700"
              >
                Close
              </button>
              <button
                onClick={() => {
                  setExplainModalOpen(false);
                  setActiveTab('anomalies');
                }}
                className="px-4 py-2 rounded-xl text-xs font-semibold bg-cyan-600 hover:bg-cyan-700 text-white"
              >
                View Full Anomaly Spectrum
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
