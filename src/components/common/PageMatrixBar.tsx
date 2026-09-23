import React from 'react';
import { useApp } from '../../context/AppContext';
import {
  Activity,
  Layers,
  Sparkles,
  AlertTriangle,
  TrendingUp,
  Cpu,
  Shield,
  ShieldAlert,
  Sliders,
  Award,
  CheckCircle2,
  RefreshCw,
  Droplets,
  Gauge,
  MapPin,
  Building2,
  FileText,
  Lock,
  Radio,
  BarChart3,
  Bot
} from 'lucide-react';

export const PageMatrixBar: React.FC = () => {
  const {
    activeTab,
    telemetry,
    buildings,
    alerts,
    isAdmin,
    openPageChatbot,
    injectSimulationEvent,
    simulationMode,
    isSimulatorDrawerOpen,
    setIsSimulatorDrawerOpen
  } = useApp();

  const activeAlertsCount = alerts.filter(a => a.status === 'NEW' || a.status === 'IN_PROGRESS').length;
  const criticalCount = alerts.filter(a => a.severity === 'CRITICAL' || a.severity === 'HIGH').length;

  // Configuration for each page's navigation matrix bar
  const getMatrixConfig = () => {
    switch (activeTab) {
      case 'dashboard':
        return {
          title: 'Campus Master Water Matrix',
          badge: 'LIVE TELEMETRY',
          badgeColor: 'bg-emerald-100 text-emerald-800 border-emerald-200',
          icon: Gauge,
          copilotName: 'Dashboard AI Assistant',
          metrics: [
            { label: 'Campus Flow Rate', value: `${telemetry?.flowRateLpm?.toFixed(1) || '48.5'} L/min`, sub: 'Real-time velocity', highlight: false },
            { label: 'Hydraulic Pressure', value: `${telemetry?.pressureBar?.toFixed(2) || '2.70'} bar`, sub: 'Normal: 2.5 - 3.8 bar', highlight: false },
            { label: 'Peak Leakage Risk', value: `${telemetry?.leakageRiskPercent || 87}%`, sub: 'Block A (Floor 2)', highlight: true, alert: true },
            { label: 'Active Incidents', value: `${activeAlertsCount} Open`, sub: `${criticalCount} High Severity`, highlight: criticalCount > 0, alert: criticalCount > 0 }
          ],
          actions: [
            {
              label: 'IoT Simulator',
              icon: Sliders,
              adminOnly: false,
              onClick: () => setIsSimulatorDrawerOpen(true)
            },
            {
              label: simulationMode === 'LEAKAGE_RISK' ? 'Clear Simulation' : 'Inject Leak Test',
              icon: Radio,
              adminOnly: true,
              onClick: () => injectSimulationEvent(simulationMode === 'LEAKAGE_RISK' ? 'RESET' : 'LEAK')
            }
          ]
        };

      case 'monitoring':
        return {
          title: 'High-Density Telemetry & Flow Matrix',
          badge: 'STREAM 1.2 kHz',
          badgeColor: 'bg-cyan-100 text-cyan-800 border-cyan-200',
          icon: Activity,
          copilotName: 'Telemetry AI Assistant',
          metrics: [
            { label: 'Connected Nodes', value: '48 / 48', sub: '100% Online', highlight: false },
            { label: 'Stream Ingestion', value: '1.2k / sec', sub: 'SSE Protocol Active', highlight: false },
            { label: 'Packet Latency', value: '142 ms', sub: 'Sub-second real-time', highlight: false },
            { label: 'Flow Velocity', value: '1.42 m/s', sub: 'Within laminar limits', highlight: false }
          ],
          actions: [
            {
              label: 'Recalibrate Flow',
              icon: RefreshCw,
              adminOnly: true,
              onClick: () => injectSimulationEvent('PRESSURE_DROP')
            }
          ]
        };

      case 'digital-twin':
        return {
          title: 'Digital Water Twin Physics Engine Matrix',
          badge: 'EPANET 2.2 PHYSICS',
          badgeColor: 'bg-indigo-100 text-indigo-800 border-indigo-200',
          icon: Layers,
          copilotName: 'Digital Twin AI Assistant',
          metrics: [
            { label: 'Twin Sync Drift', value: '0.22 sec', sub: 'Zero discrepancy', highlight: false },
            { label: 'Virtual Nodes', value: '64 Meshed', sub: 'Pipes & Junctions', highlight: false },
            { label: 'Loop 2 Variance', value: '-0.42 bar', sub: 'Pressure discrepancy', highlight: true, alert: true },
            { label: 'Mass Balance', value: '99.96%', sub: 'Conservation law', highlight: false }
          ],
          actions: [
            {
              label: 'Remesh Nodes',
              icon: RefreshCw,
              adminOnly: true,
              onClick: () => alert('Hydraulic mesh re-synchronized across 64 digital twin junctions.')
            }
          ]
        };

      case 'anomalies':
        return {
          title: 'Acoustic Waveform & Anomaly Triaging Matrix',
          badge: 'BURST DETECTION ACTIVE',
          badgeColor: 'bg-rose-100 text-rose-800 border-rose-200',
          icon: AlertTriangle,
          copilotName: 'Leak Triaging AI Assistant',
          metrics: [
            { label: 'Suspected Leak Risk', value: `${telemetry?.leakageRiskPercent || 87}%`, sub: 'Block A (Floor 2)', highlight: true, alert: true },
            { label: 'Acoustic Peak', value: '184 Hz', sub: 'Fissure frequency', highlight: true },
            { label: 'Water Loss Velocity', value: '~32.4 L/min', sub: '~$14.20/hour cost', highlight: true, alert: true },
            { label: 'Isolation Valves', value: '8 Valves Ready', sub: 'Auto-trip available', highlight: false }
          ],
          actions: [
            {
              label: 'Trip Isolation Valve',
              icon: ShieldAlert,
              adminOnly: true,
              onClick: () => injectSimulationEvent('RESET')
            }
          ]
        };

      case 'forecast':
        return {
          title: 'Neural Demand Forecasting & Peak Load Matrix',
          badge: 'PROPHET-LSTM ML',
          badgeColor: 'bg-blue-100 text-blue-800 border-blue-200',
          icon: TrendingUp,
          copilotName: 'Forecasting AI Assistant',
          metrics: [
            { label: 'Forecast Horizon', value: '7-Day Rolling', sub: 'Hourly granularity', highlight: false },
            { label: 'Model Confidence', value: '94.8% R²', sub: 'Trained on 18mo data', highlight: false },
            { label: 'Predicted Peak', value: '13:00 - 15:00', sub: '+28% surge expected', highlight: true },
            { label: 'Pre-Fill Target', value: '85% Tank Level', sub: 'Recommended by 05:30', highlight: false }
          ],
          actions: [
            {
              label: 'Recalibrate Regressors',
              icon: RefreshCw,
              adminOnly: true,
              onClick: () => alert('Weather and calendar regressors updated.')
            }
          ]
        };

      case 'recommendations':
        return {
          title: 'Prescriptive Conservation & Capital ROI Matrix',
          badge: 'ROI OPTIMIZER',
          badgeColor: 'bg-amber-100 text-amber-800 border-amber-200',
          icon: Award,
          copilotName: 'Conservation AI Assistant',
          metrics: [
            { label: 'Recoverable Water', value: '42,000 L / wk', sub: 'Via 3 quick actions', highlight: true },
            { label: 'Projected Savings', value: '$18,400 / yr', sub: 'Utility reduction', highlight: false },
            { label: 'Payback Timeline', value: '3.2 Months', sub: 'Immediate payback', highlight: false },
            { label: 'Carbon Avoidance', value: '1.84 tCO2e', sub: 'Pumping energy cut', highlight: false }
          ],
          actions: [
            {
              label: 'Approve Top Fix',
              icon: CheckCircle2,
              adminOnly: true,
              onClick: () => alert('Work order dispatched for Block A Floor 2 seal replacement.')
            }
          ]
        };

      case 'simulator':
        return {
          title: 'What-If Digital Twin Scenario Simulator Matrix',
          badge: 'STRESS TEST ENGINE',
          badgeColor: 'bg-purple-100 text-purple-800 border-purple-200',
          icon: Sliders,
          copilotName: 'Simulation AI Assistant',
          metrics: [
            { label: 'Active Scenario', value: simulationMode, sub: 'Transient state', highlight: simulationMode !== 'NORMAL', alert: simulationMode === 'LEAKAGE_RISK' },
            { label: 'Pressure Wave', value: '-1.2 bar drop', sub: 'Downstream effect', highlight: true },
            { label: 'Safety Interlock', value: isAdmin ? 'Armed (Admin)' : 'Restricted (User)', sub: 'Root access', highlight: false },
            { label: 'Transient Physics', value: 'Active Waveform', sub: 'Joukowsky equation', highlight: false }
          ],
          actions: [
            {
              label: 'Reset Simulation',
              icon: RefreshCw,
              adminOnly: true,
              onClick: () => injectSimulationEvent('RESET')
            }
          ]
        };

      case 'maintenance':
        return {
          title: 'Predictive Pump Health & Asset Lifecycle Matrix',
          badge: 'ISO 10816 CLASS 1',
          badgeColor: 'bg-teal-100 text-teal-800 border-teal-200',
          icon: Cpu,
          copilotName: 'Maintenance AI Assistant',
          metrics: [
            { label: 'Tracked Assets', value: '12 Pumps / Chillers', sub: 'Condition monitored', highlight: false },
            { label: 'Mean Time To Failure', value: '840 Hours', sub: 'Booster Pump 2', highlight: true },
            { label: 'RMS Vibration', value: '2.1 mm/s', sub: 'Nominal baseline', highlight: false },
            { label: 'Active Work Orders', value: '4 Scheduled', sub: '1 Overdue', highlight: false }
          ],
          actions: [
            {
              label: 'Dispatch Work Order',
              icon: CheckCircle2,
              adminOnly: true,
              onClick: () => alert('Work order created and sent to maintenance queue.')
            }
          ]
        };

      case 'quality':
        return {
          title: 'Continuous Potability & Chemical Quality Matrix',
          badge: 'WHO POTABILITY SAFE',
          badgeColor: 'bg-emerald-100 text-emerald-800 border-emerald-200',
          icon: Droplets,
          copilotName: 'Water Quality AI Assistant',
          metrics: [
            { label: 'Potability Index', value: '92 / 100', sub: 'Safe drinking grade', highlight: false },
            { label: 'Water pH Level', value: '7.4 pH', sub: 'Target: 6.5 - 8.5', highlight: false },
            { label: 'Turbidity Index', value: '1.2 NTU', sub: 'Clear potable water', highlight: false },
            { label: 'Total Dissolved Solids', value: '240 ppm', sub: 'Mineral balance normal', highlight: false }
          ],
          actions: [
            {
              label: 'Run UV Sterilization',
              icon: RefreshCw,
              adminOnly: true,
              onClick: () => alert('UV Sterilization cycle initiated on Main Sump.')
            }
          ]
        };

      case 'geospatial':
        return {
          title: 'GIS Campus Pipeline Network Topography Matrix',
          badge: 'RTK GIS ACCURACY',
          badgeColor: 'bg-sky-100 text-sky-800 border-sky-200',
          icon: MapPin,
          copilotName: 'Geospatial AI Assistant',
          metrics: [
            { label: 'Geocoded Facilities', value: '4 Blocks', sub: 'Full campus bounds', highlight: false },
            { label: 'Total Pipe Length', value: '14.2 km', sub: 'HDPE & Ductile Iron', highlight: false },
            { label: 'Pressure Sectors', value: '6 DMAs', sub: 'District Metered Areas', highlight: false },
            { label: 'GPS Precision', value: '±0.3 meters', sub: 'Sub-meter accurate', highlight: false }
          ],
          actions: [
            {
              label: 'Recenter Grid',
              icon: MapPin,
              adminOnly: false,
              onClick: () => alert('Map recentered to Block A coordinate center.')
            }
          ]
        };

      case 'comparison':
        return {
          title: 'Inter-Facility Benchmark & Variance Matrix',
          badge: 'CAMPUS AUDITED',
          badgeColor: 'bg-violet-100 text-violet-800 border-violet-200',
          icon: Building2,
          copilotName: 'Benchmark AI Assistant',
          metrics: [
            { label: 'Tracked Buildings', value: '4 Facilities', sub: 'Total 4,600 occupants', highlight: false },
            { label: 'Benchmark Leader', value: 'Block B Admin', sub: '96.2% efficiency score', highlight: false },
            { label: 'Inter-Block Variance', value: '±14.5%', sub: 'Per capita spread', highlight: false },
            { label: 'High Variance Facility', value: 'Block A Labs', sub: '+38% above median', highlight: true, alert: true }
          ],
          actions: [
            {
              label: 'Recalculate Spread',
              icon: RefreshCw,
              adminOnly: false,
              onClick: () => alert('Inter-facility variance scores re-computed.')
            }
          ]
        };

      case 'sustainability':
        return {
          title: 'Net-Zero Water & ESG Sustainability Matrix',
          badge: 'ESG GRADE A+',
          badgeColor: 'bg-emerald-100 text-emerald-800 border-emerald-200',
          icon: Droplets,
          copilotName: 'ESG Sustainability AI Assistant',
          metrics: [
            { label: 'Water Neutrality', value: '88.2%', sub: 'Target: 95% by 2027', highlight: false },
            { label: 'Rainwater Harvest', value: '184 kL / mo', sub: '3 Rooftop reservoirs', highlight: false },
            { label: 'Greywater Recycled', value: '38.0%', sub: 'Flushing & cooling loop', highlight: false },
            { label: 'Carbon Avoided', value: '4.8 tCO2e', sub: 'Energy optimization', highlight: false }
          ],
          actions: [
            {
              label: 'Export ESG Report',
              icon: FileText,
              adminOnly: false,
              onClick: () => alert('ESG disclosure data compiled and ready for download.')
            }
          ]
        };

      case 'reports':
        return {
          title: 'Compliance Audit & Executive Reporting Matrix',
          badge: 'ISO 14046 / LEED',
          badgeColor: 'bg-indigo-100 text-indigo-800 border-indigo-200',
          icon: FileText,
          copilotName: 'Compliance AI Assistant',
          metrics: [
            { label: 'Generated Audits', value: '14 Audits', sub: 'Monthly, Quarterly, ESG', highlight: false },
            { label: 'Audit Standard', value: 'ISO 14046', sub: '100% compliant', highlight: false },
            { label: 'Next Cycle', value: '6 Days', sub: 'Automated synthesis', highlight: false },
            { label: 'Ledger Hash', value: 'SHA-256 Valid', sub: 'Tamper-evident log', highlight: false }
          ],
          actions: [
            {
              label: 'Generate Audit',
              icon: FileText,
              adminOnly: false,
              onClick: () => alert('Audit generation started.')
            }
          ]
        };

      case 'sensors':
        return {
          title: 'Sensor Fleet Health & Leak Sensitivity Configuration',
          badge: 'SCADA SENSITIVITY ENGINE',
          badgeColor: 'bg-cyan-100 text-cyan-800 border-cyan-200',
          icon: Sliders,
          copilotName: 'Sensor Diagnostics AI Assistant',
          metrics: [
            { label: 'Sensitivity Mode', value: 'Standard (Balanced)', sub: 'Customizable by Admin', highlight: false },
            { label: 'Pressure Drop Trigger', value: '-0.40 bar', sub: 'Dynamic threshold', highlight: false },
            { label: 'Night Flow Exceedance', value: '+40% Baseline', sub: 'Micro-weep threshold', highlight: false },
            { label: 'Fleet Quality Index', value: '98.4%', sub: '48 / 48 Transducers Online', highlight: false }
          ],
          actions: [
            {
              label: 'Re-Calibrate Fleet',
              icon: RefreshCw,
              adminOnly: true,
              onClick: () => alert('Sensor fleet telemetry re-calibrated successfully against base atmospheric reference.')
            }
          ]
        };

      case 'audit':
        return {
          title: 'Cryptographic Security & Access Control Matrix',
          badge: 'TAMPER-PROOF LEDGER',
          badgeColor: 'bg-purple-100 text-purple-800 border-purple-200',
          icon: Shield,
          copilotName: 'Security Audit AI Assistant',
          metrics: [
            { label: 'Logged Operations', value: '1,482 Entries', sub: 'Immutable record', highlight: false },
            { label: 'Cryptographic Hash', value: 'SHA-256 HMAC', sub: 'Chain validated', highlight: false },
            { label: 'Current Session', value: isAdmin ? 'Admin Level' : 'User Level', sub: isAdmin ? 'Full Root Access' : 'Restricted Query Access', highlight: isAdmin },
            { label: 'Log Retention', value: '365 Days', sub: 'Institutional standard', highlight: false }
          ],
          actions: [
            {
              label: 'Verify Ledger',
              icon: CheckCircle2,
              adminOnly: false,
              onClick: () => alert('Cryptographic audit trail hash integrity verified successfully.')
            }
          ]
        };

      default:
        return {
          title: 'Campus Master Water Matrix',
          badge: 'SYSTEM ONLINE',
          badgeColor: 'bg-cyan-100 text-cyan-800 border-cyan-200',
          icon: Gauge,
          copilotName: 'JalRakshak AI Assistant',
          metrics: [
            { label: 'Flow Rate', value: '48.5 L/min', sub: 'Nominal', highlight: false },
            { label: 'Pressure', value: '2.7 bar', sub: 'Stable', highlight: false },
            { label: 'Leakage Risk', value: '87%', sub: 'Block A', highlight: true, alert: true },
            { label: 'System Health', value: '98.4%', sub: 'Optimal', highlight: false }
          ],
          actions: []
        };
    }
  };

  const config = getMatrixConfig();
  const IconComponent = config.icon;

  return (
    <div className="bg-white border-b border-slate-200/90 shadow-2xs transition-all">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
        
        {/* Top Row: Page Title, Badge, User Level Indicator & Page Chatbot Launcher */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 pb-3 border-b border-slate-100">
          
          {/* Identity & Context */}
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-linear-to-br from-cyan-600 to-blue-700 text-white flex items-center justify-center shadow-xs">
              <IconComponent className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h2 className="text-sm sm:text-base font-extrabold text-slate-900 tracking-tight">
                  {config.title}
                </h2>
                <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full border ${config.badgeColor}`}>
                  {config.badge}
                </span>
                {isAdmin ? (
                  <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-purple-100 text-purple-800 border border-purple-200">
                    <Shield className="w-3 h-3 text-purple-600" />
                    Admin Level
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 border border-slate-200">
                    <Lock className="w-3 h-3 text-slate-500" />
                    User Level
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Quick Actions & Dedicated Page Chatbot Button */}
          <div className="flex items-center gap-2 flex-wrap">
            {/* Page Specific Actions */}
            {config.actions.map((act, idx) => {
              const ActionIcon = act.icon;
              const isLocked = act.adminOnly && !isAdmin;

              return (
                <button
                  key={idx}
                  onClick={() => {
                    if (isLocked) {
                      alert('Action Restricted: Admin Level privilege is required to execute this operation.');
                      return;
                    }
                    act.onClick();
                  }}
                  className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium border transition-all cursor-pointer ${
                    isLocked
                      ? 'bg-slate-50 text-slate-400 border-slate-200 hover:bg-slate-100'
                      : 'bg-white hover:bg-slate-50 text-slate-700 border-slate-200 shadow-2xs hover:border-slate-300'
                  }`}
                  title={isLocked ? 'Admin Level Required' : act.label}
                >
                  {isLocked ? <Lock className="w-3 h-3 text-amber-500" /> : <ActionIcon className="w-3.5 h-3.5 text-cyan-600" />}
                  <span>{act.label}</span>
                  {isLocked && <span className="text-[9px] bg-amber-100 text-amber-800 font-bold px-1 rounded">Admin</span>}
                </button>
              );
            })}

            {/* Dedicated Page-Specific Chatbot Launcher Button */}
            <button
              onClick={openPageChatbot}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-linear-to-r from-cyan-600 to-blue-600 hover:from-cyan-700 hover:to-blue-700 text-white shadow-xs transition-all cursor-pointer"
              title={`Ask questions specifically about ${config.title}`}
            >
              <Bot className="w-3.5 h-3.5 text-cyan-200" />
              <span>{config.copilotName}</span>
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
            </button>
          </div>

        </div>

        {/* Bottom Row: Page-Wise Real-Time Operational Matrix Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 pt-2.5">
          {config.metrics.map((m, idx) => (
            <div
              key={idx}
              className={`p-2.5 rounded-xl border transition-all ${
                m.alert
                  ? 'bg-rose-50/70 border-rose-200 text-rose-900'
                  : m.highlight
                  ? 'bg-cyan-50/60 border-cyan-200 text-cyan-950'
                  : 'bg-slate-50/80 border-slate-200/80 text-slate-800'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-500">
                  {m.label}
                </span>
                {m.alert && <span className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-ping"></span>}
              </div>
              <p className={`text-sm sm:text-base font-extrabold mt-0.5 tracking-tight ${
                m.alert ? 'text-rose-600' : m.highlight ? 'text-cyan-700' : 'text-slate-900'
              }`}>
                {m.value}
              </p>
              <span className="text-[10px] text-slate-500 block truncate">
                {m.sub}
              </span>
            </div>
          ))}
        </div>

      </div>
    </div>
  );
};
