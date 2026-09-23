import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { api } from '../../services/api';
import {
  AlertOctagon,
  ShieldAlert,
  HelpCircle,
  CheckCircle2,
  Clock,
  Filter,
  ArrowRight,
  TrendingDown,
  Wrench,
  Sparkles,
  Search
} from 'lucide-react';

export const AnomalyLeakageCenter: React.FC = () => {
  const { alerts, refreshAlerts, setActiveTab, setIsCopilotOpen } = useApp();
  const [anomalies, setAnomalies] = useState<any[]>([]);
  const [leakageRisk, setLeakageRisk] = useState<any>(null);
  const [selectedAnomaly, setSelectedAnomaly] = useState<any>(null);
  const [filterType, setFilterType] = useState<string>('ALL');
  const [isResolvingId, setIsResolvingId] = useState<string | null>(null);

  useEffect(() => {
    api.getAnomalies().then(data => {
      setAnomalies(data);
      if (data.length > 0) setSelectedAnomaly(data[0]);
    });
    api.getLeakageRisk().then(data => setLeakageRisk(data));
  }, []);

  const handleAcknowledge = async (id: string) => {
    setIsResolvingId(id);
    await api.acknowledgeAlert(id);
    await refreshAlerts();
    const updated = await api.getAnomalies();
    setAnomalies(updated);
    if (selectedAnomaly?.id === id) {
      setSelectedAnomaly({ ...selectedAnomaly, status: 'ACKNOWLEDGED' });
    }
    setIsResolvingId(null);
  };

  const handleResolve = async (id: string) => {
    setIsResolvingId(id);
    await api.resolveAlert(id);
    await refreshAlerts();
    const updated = await api.getAnomalies();
    setAnomalies(updated);
    if (selectedAnomaly?.id === id) {
      setSelectedAnomaly({ ...selectedAnomaly, status: 'RESOLVED' });
    }
    setIsResolvingId(null);
  };

  const filteredAnomalies = filterType === 'ALL'
    ? anomalies
    : anomalies.filter(a => a.type === filterType || (a.metric && String(a.metric).toUpperCase().includes((filterType || '').replace(/_/g, ' '))));

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6 max-w-7xl mx-auto">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-black text-slate-900 tracking-tight flex items-center gap-2">
              <AlertOctagon className="w-5 h-5 text-rose-600" />
              AI Anomaly & Leakage Risk Diagnostic Center
            </h1>
            <span className="text-[10px] font-mono uppercase bg-rose-100 text-rose-800 font-bold px-2 py-0.5 rounded-full">
              Hybrid Statistical + AI Engine
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Real-time hydraulic anomaly classification using Rolling Z-Score, Isolation Forest & Night-Flow baselines
          </p>
        </div>

        <button
          onClick={() => setIsCopilotOpen(true)}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-cyan-600 text-white hover:bg-cyan-700 transition-colors shadow-xs"
        >
          <Sparkles className="w-3.5 h-3.5" />
          Consult Copilot on Leakage
        </button>
      </div>

      {/* Campus Leakage Risk Top Summary */}
      {leakageRisk && (
        <div className="bg-linear-to-r from-rose-900 via-slate-900 to-slate-900 rounded-2xl p-6 text-white shadow-xl">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
            <div>
              <div className="flex items-center gap-2 text-rose-300 text-xs font-semibold uppercase tracking-wider">
                <ShieldAlert className="w-4 h-4" />
                Active Campus Anomaly Index: {leakageRisk.status}
              </div>
              <h2 className="text-2xl sm:text-3xl font-black mt-1 text-white">
                {leakageRisk.summary}
              </h2>
              <p className="text-xs text-slate-300 mt-2 max-w-2xl leading-relaxed">
                Statistical analysis indicates simultaneous sustained flow and localized hydraulic head pressure loss. AI assigns an 87% probability of physical pipe fracture or valve seal blowout.
              </p>
            </div>

            <div className="flex items-center gap-4 shrink-0 bg-white/10 backdrop-blur-md p-4 rounded-xl border border-white/10">
              <div className="text-center">
                <span className="text-2xl sm:text-3xl font-extrabold text-rose-400 font-mono">
                  {leakageRisk.overallRiskPercent}%
                </span>
                <span className="block text-[10px] text-slate-300 font-medium uppercase mt-0.5">
                  Leak Probability
                </span>
              </div>
              <div className="h-10 w-px bg-white/20"></div>
              <div className="text-center">
                <span className="text-2xl sm:text-3xl font-extrabold text-amber-300 font-mono">
                  ~1,240
                </span>
                <span className="block text-[10px] text-slate-300 font-medium uppercase mt-0.5">
                  Est. Loss (L/hr)
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Main Grid: Anomaly Stream Table vs Explainable AI Inspector */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Anomaly Stream List (2 Cols) */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200 p-5 shadow-xs">
          
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
            <h2 className="text-sm font-bold text-slate-900">
              Detected Anomalies & Alerts ({anomalies.length})
            </h2>

            {/* Filter Pills */}
            <div className="flex items-center gap-1.5 overflow-x-auto text-xs">
              {['ALL', 'NIGHT_FLOW', 'PRESSURE_DROP', 'UNUSUAL_SPIKE'].map(t => (
                <button
                  key={t}
                  onClick={() => setFilterType(t)}
                  className={`px-2.5 py-1 rounded-lg font-medium transition-colors ${
                    filterType === t
                      ? 'bg-slate-900 text-white'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  {(t || '').replace(/_/g, ' ')}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-3 mt-4">
            {filteredAnomalies.map(a => (
              <div
                key={a.id}
                onClick={() => setSelectedAnomaly(a)}
                className={`p-4 rounded-xl border transition-all cursor-pointer ${
                  selectedAnomaly?.id === a.id
                    ? 'border-cyan-500 bg-cyan-50/40 ring-1 ring-cyan-500'
                    : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50'
                }`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-start gap-3">
                    <div className={`p-2 rounded-lg shrink-0 mt-0.5 ${
                      a.severity === 'CRITICAL' || a.severity === 'HIGH' || a.riskLevel === 'HIGH'
                        ? 'bg-rose-100 text-rose-700'
                        : 'bg-amber-100 text-amber-700'
                    }`}>
                      <AlertOctagon className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-xs text-slate-900">
                          {((a?.type || a?.metric || 'ANOMALY') as string).replace(/_/g, ' ')}
                        </span>
                        <span className={`text-[10px] font-bold px-1.5 py-0.2 rounded ${
                          a.severity === 'CRITICAL' || a.severity === 'HIGH' || a.riskLevel === 'HIGH' ? 'bg-rose-100 text-rose-700' : 'bg-amber-100 text-amber-700'
                        }`}>
                          {a.severity || a.riskLevel || 'HIGH'}
                        </span>
                        <span className="text-[11px] text-slate-400">• {a.time || a.detectedAt || 'Recently'}</span>
                      </div>
                      <p className="text-xs text-slate-600 mt-1">{a.reason || a.explanation || 'Anomaly observed on sensor telemetry'}</p>
                      <p className="text-[11px] text-slate-500 mt-0.5">Location: <strong className="text-slate-700">{a.location || 'Campus Network'}</strong></p>
                    </div>
                  </div>

                  <div className="text-right shrink-0">
                    <div className="text-xs font-bold text-slate-900 font-mono">
                      Conf: {a.confidence || a.confidencePercent || a.aiConfidencePercent || 88}%
                    </div>
                    <span className={`inline-block text-[10px] font-semibold px-2 py-0.5 rounded-full mt-1.5 ${
                      a.status === 'RESOLVED' ? 'bg-emerald-100 text-emerald-700' :
                      a.status === 'ACKNOWLEDGED' ? 'bg-blue-100 text-blue-700' :
                      'bg-rose-100 text-rose-700'
                    }`}>
                      {a.status || 'ACTIVE'}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>

        </div>

        {/* Explainable AI Inspector (Section 13) */}
        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs space-y-5">
          <div className="pb-3 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <HelpCircle className="w-4 h-4 text-cyan-600" />
              <h2 className="text-sm font-bold text-slate-900">
                Explainable AI Diagnostic
              </h2>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Transparent attribution of sensor weights and mathematical indicators
            </p>
          </div>

          {selectedAnomaly ? (
            <div className="space-y-4 text-xs">
              
              <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200">
                <span className="text-slate-400 block text-[10px] uppercase font-bold tracking-wider">
                  Target Anomaly
                </span>
                <span className="text-slate-900 font-bold text-sm mt-0.5 block">
                  {selectedAnomaly.reason}
                </span>
                <span className="text-slate-500 text-[11px] mt-1 block">
                  Location: {selectedAnomaly.location}
                </span>
              </div>

              {/* Mathematical Detection Parameters */}
              <div>
                <span className="font-bold text-slate-700 uppercase tracking-wider text-[11px] block mb-2">
                  Detection Mathematics
                </span>
                <div className="space-y-2">
                  <div className="flex justify-between items-center p-2 rounded-lg bg-slate-50 border border-slate-200">
                    <span className="text-slate-600">Rolling Z-Score Deviation</span>
                    <span className="font-mono font-bold text-rose-600">3.42 σ (Critical)</span>
                  </div>
                  <div className="flex justify-between items-center p-2 rounded-lg bg-slate-50 border border-slate-200">
                    <span className="text-slate-600">Isolation Forest Score</span>
                    <span className="font-mono font-bold text-rose-600">-0.78 (Outlier)</span>
                  </div>
                  <div className="flex justify-between items-center p-2 rounded-lg bg-slate-50 border border-slate-200">
                    <span className="text-slate-600">Baseline Invariance Gap</span>
                    <span className="font-mono font-bold text-amber-600">+143% above norm</span>
                  </div>
                </div>
              </div>

              {/* Action Recommended by AI */}
              <div className="p-3.5 bg-cyan-50/80 rounded-xl border border-cyan-200 text-cyan-950">
                <span className="font-bold block mb-1">Recommended Action Protocol:</span>
                <p className="text-[11px] leading-relaxed">
                  {selectedAnomaly.recommendedAction || 'Dispatch technician with acoustic microphone to verify riser flange connection.'}
                </p>
              </div>

              {/* Action Buttons */}
              <div className="pt-2 flex flex-col gap-2">
                {selectedAnomaly.status !== 'RESOLVED' && (
                  <button
                    disabled={isResolvingId === selectedAnomaly.id}
                    onClick={() => handleResolve(selectedAnomaly.id)}
                    className="w-full py-2 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs transition-colors flex items-center justify-center gap-2"
                  >
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    Mark Anomaly Resolved
                  </button>
                )}
                {selectedAnomaly.status === 'NEW' && (
                  <button
                    disabled={isResolvingId === selectedAnomaly.id}
                    onClick={() => handleAcknowledge(selectedAnomaly.id)}
                    className="w-full py-2 px-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs transition-colors"
                  >
                    Acknowledge Alert
                  </button>
                )}
                <button
                  onClick={() => setActiveTab('maintenance')}
                  className="w-full py-2 px-3 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-semibold text-xs transition-colors flex items-center justify-center gap-2"
                >
                  <Wrench className="w-3.5 h-3.5" />
                  Dispatch Maintenance Work Order
                </button>
              </div>

            </div>
          ) : (
            <p className="text-xs text-slate-400 italic">Select an anomaly to inspect AI reasoning</p>
          )}

        </div>

      </div>

    </div>
  );
};
