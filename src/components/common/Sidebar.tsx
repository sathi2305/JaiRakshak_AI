import React from 'react';
import { useApp } from '../../context/AppContext';
import {
  LayoutDashboard,
  Activity,
  Network,
  AlertOctagon,
  TrendingUp,
  Lightbulb,
  SlidersHorizontal,
  Wrench,
  FlaskConical,
  MapPin,
  BarChart3,
  Leaf,
  FileText,
  Cpu,
  ShieldAlert,
  Laptop,
  Smartphone
} from 'lucide-react';

export const Sidebar: React.FC = () => {
  const { activeTab, setActiveTab, alerts, openAppInstallModal, isPwaInstalled } = useApp();

  const activeAlertsCount = alerts.filter(a => a.status === 'NEW' || a.status === 'IN_PROGRESS').length;

  const navItems = [
    { id: 'dashboard', label: 'Command Center', icon: LayoutDashboard, badge: null },
    { id: 'monitoring', label: 'Real-Time Monitoring', icon: Activity, badge: 'Live' },
    { id: 'digital-twin', label: 'Digital Water Twin', icon: Network, badge: null },
    { id: 'anomalies', label: 'Anomaly & Leak Risk', icon: AlertOctagon, badge: activeAlertsCount > 0 ? `${activeAlertsCount}` : null, badgeColor: 'bg-rose-500 text-white' },
    { id: 'forecast', label: 'Forecast & Optimization', icon: TrendingUp, badge: null },
    { id: 'recommendations', label: 'Smart Recommendations', icon: Lightbulb, badge: '4', badgeColor: 'bg-amber-500 text-white' },
    { id: 'simulator', label: 'What-If Simulator', icon: SlidersHorizontal, badge: null },
    { id: 'maintenance', label: 'Predictive Maintenance', icon: Wrench, badge: '3', badgeColor: 'bg-blue-500 text-white' },
    { id: 'quality', label: 'Water Quality Module', icon: FlaskConical, badge: '92/100', badgeColor: 'bg-emerald-500 text-white' },
    { id: 'geospatial', label: 'Geo-Spatial Intelligence', icon: MapPin, badge: null },
    { id: 'comparison', label: 'Multi-Building Analytics', icon: BarChart3, badge: null },
    { id: 'sustainability', label: 'Sustainability & Impact', icon: Leaf, badge: '77%', badgeColor: 'bg-emerald-600 text-white' },
    { id: 'reports', label: 'Reports & AI Summary', icon: FileText, badge: null },
    { id: 'sensors', label: 'Sensor Fleet & Quality', icon: Cpu, badge: null },
    { id: 'audit', label: 'Security & Audit Trail', icon: ShieldAlert, badge: null },
  ];

  return (
    <aside className="w-64 bg-slate-900 text-slate-300 flex flex-col shrink-0 border-r border-slate-800">
      
      {/* Platform Title in Sidebar */}
      <div className="p-4 border-b border-slate-800">
        <div className="flex items-center justify-between">
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Navigation Matrix</span>
          <span className="text-[10px] font-mono text-cyan-400 bg-cyan-950/80 border border-cyan-800/80 px-1.5 py-0.5 rounded">
            v1.0-PROD
          </span>
        </div>
      </div>

      {/* Navigation Links */}
      <nav className="flex-1 p-3 space-y-1 overflow-y-auto custom-scrollbar">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              id={`nav-tab-${item.id}`}
              onClick={() => setActiveTab(item.id)}
              className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-xs font-medium transition-all ${
                isActive
                  ? 'bg-cyan-600 text-white shadow-md shadow-cyan-900/30 font-semibold'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/80'
              }`}
            >
              <div className="flex items-center gap-2.5 truncate">
                <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                <span className="truncate">{item.label}</span>
              </div>
              {item.badge && (
                <span
                  className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ${
                    item.badgeColor || (isActive ? 'bg-cyan-700 text-white' : 'bg-slate-800 text-cyan-400')
                  }`}
                >
                  {item.badge}
                </span>
              )}
            </button>
          );
        })}
      </nav>

      {/* Mobile & PC App Install Section */}
      <div className="px-3 pt-2 space-y-1.5">
        <button
          onClick={() => openAppInstallModal('mobile')}
          className="w-full flex items-center justify-between p-2 rounded-xl text-xs font-medium border bg-blue-950/40 hover:bg-blue-900/50 border-blue-800/60 text-blue-300 transition-colors cursor-pointer"
        >
          <div className="flex items-center gap-2">
            <Smartphone className="w-3.5 h-3.5 text-blue-400" />
            <span>Install Mobile App</span>
          </div>
          <span className="text-[10px] bg-blue-900/80 text-blue-200 px-1.5 py-0.5 rounded font-mono">
            iOS / Android
          </span>
        </button>

        <button
          onClick={() => openAppInstallModal('pc')}
          className={`w-full flex items-center justify-between p-2 rounded-xl text-xs font-medium border transition-colors cursor-pointer ${
            isPwaInstalled
              ? 'bg-slate-800/60 border-slate-700/60 text-slate-300'
              : 'bg-cyan-950/40 hover:bg-cyan-900/50 border-cyan-800/60 text-cyan-300'
          }`}
        >
          <div className="flex items-center gap-2">
            <Laptop className="w-3.5 h-3.5 text-cyan-400" />
            <span>{isPwaInstalled ? 'PC Workstation' : 'Install PC App'}</span>
          </div>
          <span className="text-[10px] bg-slate-800 text-slate-300 px-1.5 py-0.5 rounded">
            {isPwaInstalled ? 'Active' : 'Desktop'}
          </span>
        </button>
      </div>

      {/* Footer System Status */}
      <div className="p-3 border-t border-slate-800 bg-slate-950/60 text-[11px] text-slate-400">
        <div className="flex items-center justify-between mb-1">
          <span className="text-slate-500">Pipeline Ingress</span>
          <span className="flex items-center gap-1 text-emerald-400 font-mono">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping"></span>
            ACTIVE (SSE)
          </span>
        </div>
        <div className="flex items-center justify-between text-[10px]">
          <span className="text-slate-500">Intelligence Core</span>
          <span className="text-slate-300 font-mono">Neural Water AI</span>
        </div>
      </div>

    </aside>
  );
};
