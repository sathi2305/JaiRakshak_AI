import React, { useRef } from 'react';
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
  Smartphone,
  Laptop,
  ChevronLeft,
  ChevronRight,
  Maximize2
} from 'lucide-react';

export const TopNavigationMatrix: React.FC = () => {
  const { activeTab, setActiveTab, alerts, openAppInstallModal, isPwaInstalled } = useApp();
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  const activeAlertsCount = alerts.filter(a => a.status === 'NEW' || a.status === 'IN_PROGRESS').length;

  const navItems = [
    { id: 'dashboard', label: 'Command Center', icon: LayoutDashboard, badge: null },
    { id: 'monitoring', label: 'Real-Time Telemetry', icon: Activity, badge: 'Live', badgeColor: 'bg-cyan-500 text-white' },
    { id: 'digital-twin', label: 'Digital Water Twin', icon: Network, badge: null },
    { id: 'anomalies', label: 'Anomaly & Leak Risk', icon: AlertOctagon, badge: activeAlertsCount > 0 ? `${activeAlertsCount} Alert` : null, badgeColor: 'bg-rose-500 text-white animate-pulse' },
    { id: 'forecast', label: 'Forecast & Demand', icon: TrendingUp, badge: null },
    { id: 'recommendations', label: 'Smart Actions', icon: Lightbulb, badge: '4', badgeColor: 'bg-amber-500 text-white' },
    { id: 'simulator', label: 'What-If Simulator', icon: SlidersHorizontal, badge: null },
    { id: 'maintenance', label: 'Predictive Maint.', icon: Wrench, badge: '3', badgeColor: 'bg-blue-500 text-white' },
    { id: 'quality', label: 'Water Quality', icon: FlaskConical, badge: '92/100', badgeColor: 'bg-emerald-500 text-white' },
    { id: 'geospatial', label: 'Geo-Spatial Map', icon: MapPin, badge: null },
    { id: 'comparison', label: 'Multi-Building', icon: BarChart3, badge: null },
    { id: 'sustainability', label: 'Sustainability', icon: Leaf, badge: '77%', badgeColor: 'bg-emerald-600 text-white' },
    { id: 'reports', label: 'Reports & Summary', icon: FileText, badge: null },
    { id: 'sensors', label: 'Sensors & Rules', icon: Cpu, badge: null },
    { id: 'audit', label: 'Security & Audit', icon: ShieldAlert, badge: null },
  ];

  const handleScroll = (direction: 'left' | 'right') => {
    if (scrollContainerRef.current) {
      const scrollAmount = direction === 'left' ? -280 : 280;
      scrollContainerRef.current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
    }
  };

  return (
    <div className="w-full bg-slate-900 border-b border-slate-800 text-slate-300 shadow-inner sticky top-16 z-30 select-none">
      <div className="w-full px-2 sm:px-4 flex items-center justify-between gap-2">
        
        {/* Left Scroll Trigger */}
        <button
          onClick={() => handleScroll('left')}
          className="hidden md:flex p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors shrink-0 cursor-pointer"
          title="Scroll Left"
          aria-label="Scroll left"
        >
          <ChevronLeft className="w-4 h-4" />
        </button>

        {/* Horizontal Navigation Matrix Tabs Row */}
        <div
          ref={scrollContainerRef}
          className="flex-1 flex items-center gap-1.5 py-2 overflow-x-auto no-scrollbar scroll-smooth"
        >
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                id={`top-nav-tab-${item.id}`}
                onClick={() => setActiveTab(item.id)}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all shrink-0 cursor-pointer ${
                  isActive
                    ? 'bg-cyan-600 text-white shadow-md shadow-cyan-900/40 ring-1 ring-cyan-400/50'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/90'
                }`}
              >
                <Icon className={`w-3.5 h-3.5 shrink-0 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                <span>{item.label}</span>
                {item.badge && (
                  <span
                    className={`text-[9px] font-mono font-bold px-1.5 py-0.2 rounded-full ${
                      item.badgeColor || (isActive ? 'bg-cyan-700 text-white' : 'bg-slate-800 text-cyan-400')
                    }`}
                  >
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Right Scroll Trigger */}
        <button
          onClick={() => handleScroll('right')}
          className="hidden md:flex p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors shrink-0 cursor-pointer"
          title="Scroll Right"
          aria-label="Scroll right"
        >
          <ChevronRight className="w-4 h-4" />
        </button>

        {/* Quick App Actions on the far right */}
        <div className="hidden xl:flex items-center gap-1.5 pl-2 border-l border-slate-800 shrink-0 text-xs">
          <button
            onClick={() => openAppInstallModal('mobile')}
            className="flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[11px] font-medium bg-blue-950/60 hover:bg-blue-900/70 text-blue-300 border border-blue-800/60 transition-colors cursor-pointer"
            title="Install Mobile App"
          >
            <Smartphone className="w-3 h-3 text-blue-400" />
            <span>Mobile</span>
          </button>

          <button
            onClick={() => openAppInstallModal('pc')}
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[11px] font-medium border transition-colors cursor-pointer ${
              isPwaInstalled
                ? 'bg-slate-800 text-slate-400 border-slate-700'
                : 'bg-cyan-950/60 hover:bg-cyan-900/70 text-cyan-300 border-cyan-800/60'
            }`}
            title="Install PC App"
          >
            <Laptop className="w-3 h-3 text-cyan-400" />
            <span>{isPwaInstalled ? 'PC Installed' : 'PC App'}</span>
          </button>

          <div className="flex items-center gap-1 text-[10px] font-mono text-emerald-400 bg-emerald-950/60 border border-emerald-800/60 px-2 py-0.5 rounded">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
            <span>COMMAND FULL VIEW</span>
          </div>
        </div>

      </div>
    </div>
  );
};
