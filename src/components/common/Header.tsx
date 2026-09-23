import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import {
  Droplets,
  Bell,
  Sparkles,
  Sliders,
  AlertTriangle,
  Radio,
  ChevronDown,
  LogOut,
  Laptop,
  Smartphone,
  CheckCircle2,
  Shield,
  UserCheck,
  Lock,
  ArrowLeftRight,
  WifiOff
} from 'lucide-react';
import { useOnlineStatus } from '../../hooks/useOnlineStatus';
import { RemoteSensorBatteryMonitor } from './RemoteSensorBatteryMonitor';

export const Header: React.FC = () => {
  const { isOnline } = useOnlineStatus();
  const {
    currentUser,
    logout,
    setUserRole,
    isAdmin,
    simulationMode,
    setIsSimulatorDrawerOpen,
    setIsCopilotOpen,
    notifications,
    unreadNotificationsCount,
    markAllNotificationsRead,
    injectSimulationEvent,
    openAppInstallModal,
    isPwaInstalled
  } = useApp();

  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showNotifMenu, setShowNotifMenu] = useState(false);

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        
        {/* Brand Logo & Tagline */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-linear-to-br from-cyan-600 to-blue-700 flex items-center justify-center text-white shadow-md shadow-blue-500/20">
            <Droplets className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-extrabold text-xl tracking-tight text-slate-900">
                JalRakshak<span className="text-cyan-600 ml-0.5">AI</span>
              </span>
              <span className="text-[10px] font-semibold uppercase tracking-wider bg-cyan-50 text-cyan-700 border border-cyan-200 px-1.5 py-0.5 rounded-sm">
                Enterprise IoT
              </span>
            </div>
            <p className="text-[11px] text-slate-500 hidden sm:block">
              Predict Water Loss. Prevent Waste. Protect Tomorrow.
            </p>
          </div>
        </div>

        {/* Action Controls & User Account */}
        <div className="flex items-center gap-2 sm:gap-3">
          
          {/* Mobile App Install Button */}
          <button
            id="mobile-install-header-btn"
            onClick={() => openAppInstallModal('mobile')}
            className="hidden lg:flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium border bg-blue-50 text-blue-700 border-blue-200 hover:bg-blue-100 hover:border-blue-300 transition-all cursor-pointer"
            title="Install JalRakshak on your Mobile Device (Android / iOS)"
          >
            <Smartphone className="w-3.5 h-3.5 text-blue-600" />
            <span>Mobile App</span>
          </button>

          {/* PC Desktop App Install Button */}
          <button
            id="pwa-install-header-btn"
            onClick={() => openAppInstallModal('pc')}
            className={`hidden md:flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium border transition-all cursor-pointer ${
              isPwaInstalled
                ? 'bg-slate-50 text-slate-600 border-slate-200'
                : 'bg-cyan-50 text-cyan-700 border-cyan-200 hover:bg-cyan-100 hover:border-cyan-300'
            }`}
            title="Install JalRakshak on your PC Workstation"
          >
            <Laptop className="w-3.5 h-3.5 text-cyan-600" />
            <span>{isPwaInstalled ? 'PC App Installed' : 'PC App'}</span>
          </button>

          {/* Remote IoT Sensor Battery & Power Fleet Monitor */}
          <RemoteSensorBatteryMonitor />

          {/* Active Simulation Mode Pill */}
          <button
            id="simulation-mode-indicator-btn"
            onClick={() => setIsSimulatorDrawerOpen(true)}
            className="flex items-center gap-2 px-2.5 py-1 rounded-lg text-xs font-medium bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200 transition-colors cursor-pointer"
            title="Click to open IoT Simulation controls"
          >
            <span className="flex h-2 w-2 relative">
              <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${
                simulationMode === 'NORMAL' ? 'bg-emerald-400' :
                simulationMode === 'LEAKAGE_RISK' ? 'bg-rose-400' : 'bg-amber-400'
              }`}></span>
              <span className={`relative inline-flex rounded-full h-2 w-2 ${
                simulationMode === 'NORMAL' ? 'bg-emerald-500' :
                simulationMode === 'LEAKAGE_RISK' ? 'bg-rose-500' : 'bg-amber-500'
              }`}></span>
            </span>
            <span className="hidden xl:inline text-slate-500">Mode:</span>
            <span className="font-semibold text-slate-800">{simulationMode}</span>
            <Sliders className="w-3.5 h-3.5 text-slate-400 ml-0.5" />
          </button>

          {/* Connectivity Status Badge */}
          {!isOnline && (
            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold bg-amber-50 text-amber-700 border border-amber-300">
              <WifiOff className="w-3.5 h-3.5 text-amber-600 animate-pulse" />
              <span className="hidden sm:inline">Offline Cached</span>
            </div>
          )}

          {/* Quick Inject Leak Button for Demo (Admin Level only) */}
          <button
            id="quick-inject-leak-btn"
            onClick={() => {
              if (!isAdmin) {
                alert('Action Restricted: Admin Level privilege is required to trigger simulation events.');
                return;
              }
              injectSimulationEvent(simulationMode === 'LEAKAGE_RISK' ? 'RESET' : 'LEAK');
            }}
            className={`hidden xl:flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium border transition-colors cursor-pointer ${
              !isAdmin
                ? 'bg-slate-50 text-slate-400 border-slate-200 cursor-not-allowed opacity-60'
                : simulationMode === 'LEAKAGE_RISK'
                ? 'bg-rose-50 text-rose-700 border-rose-200 hover:bg-rose-100'
                : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
            }`}
            title={isAdmin ? "Toggle live pipe leak injection scenario" : "Admin Level required to inject leaks"}
          >
            {!isAdmin ? (
              <Lock className="w-3.5 h-3.5 text-amber-500" />
            ) : (
              <Radio className={`w-3.5 h-3.5 ${simulationMode === 'LEAKAGE_RISK' ? 'text-rose-600 animate-pulse' : 'text-slate-400'}`} />
            )}
            <span>
              {!isAdmin
                ? 'Inject Leak (Admin Only)'
                : simulationMode === 'LEAKAGE_RISK'
                ? 'Clear Leak'
                : 'Inject Leak'}
            </span>
          </button>

          {/* Copilot Launcher */}
          <button
            id="copilot-header-btn"
            onClick={() => setIsCopilotOpen(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-linear-to-r from-cyan-600 to-blue-600 text-white shadow-xs hover:from-cyan-700 hover:to-blue-700 transition-all cursor-pointer"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">JalRakshak</span> Copilot
          </button>

          {/* Notification Center */}
          <div className="relative">
            <button
              id="notifications-toggle-btn"
              onClick={() => setShowNotifMenu(!showNotifMenu)}
              className="relative p-2 text-slate-600 hover:text-slate-900 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer"
              title="Notifications"
            >
              <Bell className="w-4 h-4" />
              {unreadNotificationsCount > 0 && (
                <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-rose-500 rounded-full ring-2 ring-white"></span>
              )}
            </button>

            {showNotifMenu && (
              <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white rounded-xl shadow-xl border border-slate-200 p-3 z-50 animate-in fade-in zoom-in-95">
                <div className="flex items-center justify-between pb-2 border-b border-slate-100 mb-2">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-xs text-slate-900">Telemetry Notifications</span>
                    {unreadNotificationsCount > 0 && (
                      <span className="bg-rose-100 text-rose-700 text-[10px] font-bold px-1.5 py-0.5 rounded-full">
                        {unreadNotificationsCount} new
                      </span>
                    )}
                  </div>
                  <button
                    onClick={markAllNotificationsRead}
                    className="text-[11px] text-cyan-600 hover:text-cyan-700 font-medium cursor-pointer"
                  >
                    Mark all read
                  </button>
                </div>
                <div className="space-y-2 max-h-72 overflow-y-auto">
                  {notifications.map(n => (
                    <div
                      key={n.id}
                      className={`p-2 rounded-lg text-xs flex gap-2.5 items-start ${
                        n.read ? 'bg-slate-50 text-slate-600' : 'bg-blue-50/70 text-slate-800 border border-blue-100'
                      }`}
                    >
                      {n.type === 'critical' ? (
                        <AlertTriangle className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" />
                      ) : n.type === 'warning' ? (
                        <AlertTriangle className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
                      ) : (
                        <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                      )}
                      <div className="flex-1">
                        <p className="font-medium leading-snug">{n.title}</p>
                        <span className="text-[10px] text-slate-400 mt-1 block">{n.time}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Authenticated User Account Menu with Role Level */}
          <div className="relative">
            <button
              id="user-account-btn"
              onClick={() => setShowUserMenu(!showUserMenu)}
              className="flex items-center gap-2 pl-1.5 pr-2 py-1 rounded-lg border border-slate-200 hover:bg-slate-50 transition-colors text-left cursor-pointer"
            >
              {currentUser?.photoUrl ? (
                <img
                  src={currentUser.photoUrl}
                  alt={currentUser.name}
                  className="w-7 h-7 rounded-md object-cover border border-slate-200"
                />
              ) : (
                <div className="w-7 h-7 rounded-md bg-linear-to-br from-cyan-700 to-blue-800 text-white text-[11px] font-bold flex items-center justify-center">
                  {currentUser?.avatar || 'SS'}
                </div>
              )}
              <div className="hidden md:block text-left max-w-[130px]">
                <p className="text-xs font-semibold text-slate-800 leading-tight truncate">
                  {currentUser?.name || 'Operator'}
                </p>
                <div className="flex items-center gap-1.5">
                  <span className={`inline-block w-1.5 h-1.5 rounded-full ${isAdmin ? 'bg-purple-500' : 'bg-blue-500'}`}></span>
                  <span className="text-[10px] font-bold text-slate-600">
                    {isAdmin ? 'Admin Level' : 'User Level'}
                  </span>
                </div>
              </div>
              <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
            </button>

            {showUserMenu && (
              <div className="absolute right-0 mt-2 w-72 bg-white rounded-xl shadow-xl border border-slate-200 p-3 z-50 animate-in fade-in zoom-in-95 space-y-2">
                {/* Account Details */}
                <div className="pb-2 border-b border-slate-100">
                  <p className="text-xs font-bold text-slate-900 truncate">
                    {currentUser?.name || 'Operator'}
                  </p>
                  <p className="text-[11px] text-slate-500 truncate mt-0.5">
                    {currentUser?.email || 'operator@jalrakshak.org'}
                  </p>
                  <div className="mt-2 flex items-center gap-1.5">
                    {isAdmin ? (
                      <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-md bg-purple-100 text-purple-800 border border-purple-200">
                        <Shield className="w-3 h-3 text-purple-600" />
                        Admin Level (Full Access)
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-md bg-blue-50 text-blue-800 border border-blue-200">
                        <UserCheck className="w-3 h-3 text-blue-600" />
                        User Level (Monitoring Only)
                      </span>
                    )}
                  </div>
                </div>

                {/* ROLE SWITCHER TOGGLE (ADMIN LEVEL <-> USER LEVEL) */}
                <div className="p-2 bg-slate-50 border border-slate-200 rounded-xl space-y-1.5">
                  <div className="flex items-center justify-between text-[11px] font-semibold text-slate-700">
                    <span>Active User Level:</span>
                    <span className="font-bold text-slate-900">{isAdmin ? 'Admin' : 'User'}</span>
                  </div>
                  <button
                    onClick={() => {
                      setUserRole(isAdmin ? 'user' : 'admin');
                    }}
                    className="w-full flex items-center justify-center gap-1.5 py-1.5 px-2 rounded-lg bg-white hover:bg-slate-100 border border-slate-200 text-xs font-semibold text-slate-800 transition-colors cursor-pointer shadow-2xs"
                  >
                    <ArrowLeftRight className="w-3.5 h-3.5 text-cyan-600" />
                    <span>Switch to {isAdmin ? 'User Level' : 'Admin Level'}</span>
                  </button>
                  <p className="text-[10px] text-slate-400 text-center">
                    {isAdmin
                      ? 'Switch to User Level to test restricted operations.'
                      : 'Switch to Admin Level to enable valves & simulations.'}
                  </p>
                </div>

                {/* Quick App Installation Links */}
                <div className="space-y-1 pt-1 border-t border-slate-100">
                  <button
                    onClick={() => {
                      setShowUserMenu(false);
                      openAppInstallModal('mobile');
                    }}
                    className="w-full flex items-center gap-2.5 px-3 py-1.5 rounded-lg text-xs font-medium text-slate-700 hover:bg-slate-50 hover:text-cyan-700 transition-colors text-left cursor-pointer"
                  >
                    <Smartphone className="w-4 h-4 text-blue-600" />
                    <span>Install Mobile App (Android/iOS)</span>
                  </button>

                  <button
                    onClick={() => {
                      setShowUserMenu(false);
                      openAppInstallModal('pc');
                    }}
                    className="w-full flex items-center gap-2.5 px-3 py-1.5 rounded-lg text-xs font-medium text-slate-700 hover:bg-slate-50 hover:text-cyan-700 transition-colors text-left cursor-pointer"
                  >
                    <Laptop className="w-4 h-4 text-cyan-600" />
                    <span>Install PC Desktop App</span>
                  </button>

                  <button
                    onClick={() => {
                      setShowUserMenu(false);
                      logout();
                    }}
                    className="w-full flex items-center gap-2.5 px-3 py-1.5 rounded-lg text-xs font-medium text-rose-600 hover:bg-rose-50 transition-colors text-left cursor-pointer border-t border-slate-100 mt-1"
                  >
                    <LogOut className="w-4 h-4 text-rose-500" />
                    <span>Sign Out</span>
                  </button>
                </div>
              </div>
            )}
          </div>

        </div>

      </div>
    </header>
  );
};
