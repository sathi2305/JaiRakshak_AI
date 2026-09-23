import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, UserRole, Building, SmartAlert, SimulationMode, BatteryThresholdConfig } from '../types';
import { INITIAL_USERS, INITIAL_BUILDINGS } from '../data/mockDatabase';
import { api } from '../services/api';

interface AppContextType {
  currentUser: User | null;
  setCurrentUser: (user: User | null) => void;
  isAuthenticated: boolean;
  loginWithGoogle: (email?: string, name?: string, photoUrl?: string, role?: UserRole) => void;
  loginWithCredentials: (email: string, password?: string, role?: UserRole, name?: string) => void;
  logout: () => void;
  setUserRole: (role: UserRole) => void;
  isAdmin: boolean;
  activeBuildingId: string;
  setActiveBuildingId: (id: string) => void;
  activeTab: string;
  setActiveTab: (tab: string) => void;
  buildings: Building[];
  alerts: SmartAlert[];
  refreshAlerts: () => Promise<void>;
  simulationMode: SimulationMode;
  setSimulationMode: (mode: SimulationMode) => Promise<void>;
  injectSimulationEvent: (event: 'LEAK' | 'PRESSURE_DROP' | 'HIGH_CONSUMPTION' | 'SENSOR_FAILURE' | 'RESET') => Promise<void>;
  telemetry: any;
  kpis: any;
  isCopilotOpen: boolean;
  setIsCopilotOpen: (open: boolean) => void;
  isPageChatbotOpen: boolean;
  setIsPageChatbotOpen: (open: boolean) => void;
  openPageChatbot: () => void;
  isSimulatorDrawerOpen: boolean;
  setIsSimulatorDrawerOpen: (open: boolean) => void;
  notifications: { id: string; title: string; time: string; read: boolean; type: string }[];
  markAllNotificationsRead: () => void;
  unreadNotificationsCount: number;
  batteryThresholdConfig: BatteryThresholdConfig;
  updateBatteryThresholds: (updates: Partial<BatteryThresholdConfig>) => Promise<void>;
  lowBatteryThresholdPercent: number;
  criticalBatteryThresholdPercent: number;
  deferredPwaPrompt: any;
  isPwaInstalled: boolean;
  isPwaModalOpen: boolean;
  setIsPwaModalOpen: (open: boolean) => void;
  appInstallTab: 'pc' | 'mobile';
  setAppInstallTab: (tab: 'pc' | 'mobile') => void;
  openAppInstallModal: (tab?: 'pc' | 'mobile') => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Check stored auth session or start unauthenticated so the user can use Google / Sign In
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => {
    return localStorage.getItem('jalrakshak_auth') === 'true';
  });

  const [currentUser, setCurrentUser] = useState<User | null>(() => {
    const saved = localStorage.getItem('jalrakshak_user');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {
        // fallback
      }
    }
    // Default user when authenticated
    return {
      id: 'usr-default',
      name: 'Sathiyamoorthi Saravanan',
      email: 'sathiyamoorthisaravanan2006@gmail.com',
      role: 'admin',
      avatar: 'SS',
      provider: 'google'
    };
  });

  const [activeBuildingId, setActiveBuildingId] = useState<string>('bld-1');
  const [activeTab, setActiveTab] = useState<string>('dashboard');
  const [buildings, setBuildings] = useState<Building[]>(INITIAL_BUILDINGS);
  const [alerts, setAlerts] = useState<SmartAlert[]>([]);
  const [simulationMode, setSimulationModeState] = useState<SimulationMode>('LEAKAGE_RISK');
  const [telemetry, setTelemetry] = useState<any>({
    flowRateLpm: 48.5,
    pressureBar: 2.7,
    tankLevelPercent: 78,
    leakageRiskPercent: 87,
    leakRiskLevel: 'HIGH',
    consumptionRateLph: 1420,
    waterQualityScore: 92
  });
  const [kpis, setKpis] = useState<any>(null);
  
  // Chatbot states
  const [isCopilotOpen, setIsCopilotOpen] = useState(false);
  const [isPageChatbotOpen, setIsPageChatbotOpen] = useState(false);
  const [isSimulatorDrawerOpen, setIsSimulatorDrawerOpen] = useState(false);

  const [notifications, setNotifications] = useState([
    { id: 'notif-1', title: 'High Leakage Risk (87%) detected in Block A Floor 2', time: '38m ago', read: false, type: 'critical' },
    { id: 'notif-2', title: 'Abnormal dishwashing water consumption in Block D', time: '1h ago', read: false, type: 'warning' },
    { id: 'notif-3', title: 'Weekly Sustainability Milestone: 42,000L saved', time: '4h ago', read: true, type: 'success' },
    { id: 'notif-4', title: 'Sensor FLW-401 battery low (34%)', time: '5h ago', read: true, type: 'info' }
  ]);

  // Battery Threshold Configuration for Remote IoT Sensors
  const [batteryThresholdConfig, setBatteryThresholdConfig] = useState<BatteryThresholdConfig>(() => {
    const saved = localStorage.getItem('jalrakshak_battery_config');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {
        // fallback
      }
    }
    return {
      lowBatteryThresholdPercent: 40,
      criticalBatteryThresholdPercent: 20,
      headerMaintenanceAlertActive: true,
      autoDispatchBatteryWorkOrder: true,
      soundAlarmOnCritical: false,
      leadTimeDaysTarget: 5,
      updatedAt: new Date().toISOString(),
      updatedBy: 'Chief Plant Engineer (Admin Level)'
    };
  });

  useEffect(() => {
    api.getBatteryThresholdConfig()
      .then(cfg => {
        if (cfg && typeof cfg.lowBatteryThresholdPercent === 'number') {
          setBatteryThresholdConfig(cfg);
          localStorage.setItem('jalrakshak_battery_config', JSON.stringify(cfg));
        }
      })
      .catch(err => console.warn('Could not load battery config from server:', err));
  }, []);

  const updateBatteryThresholds = async (updates: Partial<BatteryThresholdConfig>) => {
    const newConfig: BatteryThresholdConfig = {
      ...batteryThresholdConfig,
      ...updates,
      updatedAt: new Date().toISOString(),
      updatedBy: currentUser?.name || 'Chief Plant Engineer (Admin Level)'
    };
    setBatteryThresholdConfig(newConfig);
    localStorage.setItem('jalrakshak_battery_config', JSON.stringify(newConfig));

    try {
      await api.updateBatteryThresholdConfig(newConfig);
    } catch (err) {
      console.warn('Failed to persist battery threshold update to server:', err);
    }
  };

  // PWA State for PC & Mobile
  const [deferredPwaPrompt, setDeferredPwaPrompt] = useState<any>(null);
  const [isPwaInstalled, setIsPwaInstalled] = useState<boolean>(false);
  const [isPwaModalOpen, setIsPwaModalOpen] = useState<boolean>(false);
  const [appInstallTab, setAppInstallTab] = useState<'pc' | 'mobile'>('pc');

  const openAppInstallModal = (tab: 'pc' | 'mobile' = 'pc') => {
    setAppInstallTab(tab);
    setIsPwaModalOpen(true);
  };

  const openPageChatbot = () => {
    setIsPageChatbotOpen(true);
  };

  useEffect(() => {
    // Listen for beforeinstallprompt event on PC / Android browsers
    const handleBeforeInstall = (e: Event) => {
      e.preventDefault();
      setDeferredPwaPrompt(e);
    };

    const handleAppInstalled = () => {
      setIsPwaInstalled(true);
      setDeferredPwaPrompt(null);
    };

    if (window.matchMedia('(display-mode: standalone)').matches) {
      setIsPwaInstalled(true);
    }

    window.addEventListener('beforeinstallprompt', handleBeforeInstall);
    window.addEventListener('appinstalled', handleAppInstalled);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstall);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, []);

  const loginWithGoogle = (email?: string, name?: string, photoUrl?: string, role: UserRole = 'admin') => {
    const user: User = {
      id: 'usr-google-' + Date.now(),
      name: name || 'Sathiyamoorthi Saravanan',
      email: email || 'sathiyamoorthisaravanan2006@gmail.com',
      role,
      avatar: (name || 'SS').slice(0, 2).toUpperCase(),
      provider: 'google',
      photoUrl: photoUrl || undefined
    };
    setCurrentUser(user);
    setIsAuthenticated(true);
    localStorage.setItem('jalrakshak_auth', 'true');
    localStorage.setItem('jalrakshak_user', JSON.stringify(user));
  };

  const loginWithCredentials = (email: string, _password?: string, role: UserRole = 'admin', name?: string) => {
    const displayName = name || email.split('@')[0].replace(/[._]/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
    const user: User = {
      id: 'usr-cred-' + Date.now(),
      name: displayName,
      email,
      role,
      avatar: displayName.slice(0, 2).toUpperCase(),
      provider: 'email'
    };
    setCurrentUser(user);
    setIsAuthenticated(true);
    localStorage.setItem('jalrakshak_auth', 'true');
    localStorage.setItem('jalrakshak_user', JSON.stringify(user));
  };

  const logout = () => {
    setIsAuthenticated(false);
    localStorage.removeItem('jalrakshak_auth');
    localStorage.removeItem('jalrakshak_user');
  };

  const setUserRole = (role: UserRole) => {
    if (!currentUser) return;
    const updated: User = {
      ...currentUser,
      role
    };
    setCurrentUser(updated);
    localStorage.setItem('jalrakshak_user', JSON.stringify(updated));
  };

  const isAdmin = currentUser?.role === 'admin';

  const refreshAlerts = async () => {
    try {
      const data = await api.getAlerts();
      setAlerts(data);
    } catch (e) {
      console.warn('Failed to load alerts:', e);
    }
  };

  const setSimulationMode = async (mode: SimulationMode) => {
    try {
      setSimulationModeState(mode);
      await api.setSimulationMode(mode);
    } catch (e) {
      console.warn('Failed to set simulation mode:', e);
    }
  };

  const injectSimulationEvent = async (event: 'LEAK' | 'PRESSURE_DROP' | 'HIGH_CONSUMPTION' | 'SENSOR_FAILURE' | 'RESET') => {
    try {
      const res = await api.injectSimulationEvent(event);
      if (res.mode) setSimulationModeState(res.mode);
      if (res.telemetry) setTelemetry(res.telemetry);
    } catch (e) {
      console.warn('Failed to inject simulation event:', e);
    }
  };

  const markAllNotificationsRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  };

  // Initial fetch
  useEffect(() => {
    const loadInitialData = async () => {
      try {
        const [sumData, bldData, altData] = await Promise.all([
          api.getDashboardSummary(),
          api.getBuildings(),
          api.getAlerts()
        ]);
        if (sumData?.kpis) setKpis(sumData.kpis);
        if (sumData?.currentSimulationMode) setSimulationModeState(sumData.currentSimulationMode);
        if (bldData) setBuildings(bldData);
        if (altData) setAlerts(altData);
      } catch (err) {
        console.error('Error loading initial data:', err);
      }
    };
    loadInitialData();

    // Subscribe to real-time Server-Sent Events
    const unsubscribe = api.subscribeToTelemetry((streamData) => {
      if (streamData.telemetry) setTelemetry(streamData.telemetry);
      if (streamData.buildings) setBuildings(streamData.buildings);
      if (streamData.mode) setSimulationModeState(streamData.mode);
    });

    return () => {
      unsubscribe();
    };
  }, []);

  const unreadNotificationsCount = notifications.filter(n => !n.read).length;

  return (
    <AppContext.Provider
      value={{
        currentUser,
        setCurrentUser,
        isAuthenticated,
        loginWithGoogle,
        loginWithCredentials,
        logout,
        setUserRole,
        isAdmin,
        activeBuildingId,
        setActiveBuildingId,
        activeTab,
        setActiveTab,
        buildings,
        alerts,
        refreshAlerts,
        simulationMode,
        setSimulationMode,
        injectSimulationEvent,
        telemetry,
        kpis,
        isCopilotOpen,
        setIsCopilotOpen,
        isPageChatbotOpen,
        setIsPageChatbotOpen,
        openPageChatbot,
        isSimulatorDrawerOpen,
        setIsSimulatorDrawerOpen,
        notifications,
        markAllNotificationsRead,
        unreadNotificationsCount,
        batteryThresholdConfig,
        updateBatteryThresholds,
        lowBatteryThresholdPercent: batteryThresholdConfig.lowBatteryThresholdPercent,
        criticalBatteryThresholdPercent: batteryThresholdConfig.criticalBatteryThresholdPercent,
        deferredPwaPrompt,
        isPwaInstalled,
        isPwaModalOpen,
        setIsPwaModalOpen,
        appInstallTab,
        setAppInstallTab,
        openAppInstallModal
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
