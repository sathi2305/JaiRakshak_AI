import React from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { Header } from './components/common/Header';
import { TopNavigationMatrix } from './components/common/TopNavigationMatrix';
import { PageMatrixBar } from './components/common/PageMatrixBar';
import { MasterDashboard } from './components/dashboard/MasterDashboard';
import { RealTimeMonitoring } from './components/monitoring/RealTimeMonitoring';
import { DigitalWaterTwin } from './components/digitaltwin/DigitalWaterTwin';
import { AnomalyLeakageCenter } from './components/anomaly/AnomalyLeakageCenter';
import { ForecastOptimization } from './components/forecast/ForecastOptimization';
import { RecommendationsView } from './components/recommendations/RecommendationsView';
import { DigitalTwinSimulator } from './components/simulator/DigitalTwinSimulator';
import { PredictiveMaintenance } from './components/maintenance/PredictiveMaintenance';
import { WaterQualityModule } from './components/quality/WaterQualityModule';
import { GeospatialMap } from './components/geospatial/GeospatialMap';
import { MultiBuildingComparison } from './components/comparison/MultiBuildingComparison';
import { SustainabilityCenter } from './components/sustainability/SustainabilityCenter';
import { ReportCenter } from './components/reports/ReportCenter';
import { SensorHealthView } from './components/sensors/SensorHealthView';
import { AuditLogView } from './components/audit/AuditLogView';
import { JalRakshakCopilot } from './components/copilot/JalRakshakCopilot';
import { PageContextualChatbot } from './components/copilot/PageContextualChatbot';
import { SimulatorDrawer } from './components/simulator/SimulatorDrawer';
import { SignInPage } from './components/auth/SignInPage';
import { InstallPwaModal } from './components/common/InstallPwaModal';
import { OfflineIndicator } from './components/common/OfflineIndicator';

const AppContent: React.FC = () => {
  const {
    isAuthenticated,
    activeTab,
    isPwaModalOpen,
    setIsPwaModalOpen,
    openAppInstallModal,
    deferredPwaPrompt,
    isPwaInstalled
  } = useApp();

  // If user is not signed in, show dedicated Sign In page
  if (!isAuthenticated) {
    return (
      <>
        <SignInPage onOpenPwaModal={(tab) => openAppInstallModal(tab || 'mobile')} />
        <InstallPwaModal
          isOpen={isPwaModalOpen}
          onClose={() => setIsPwaModalOpen(false)}
          deferredPrompt={deferredPwaPrompt}
          isInstalled={isPwaInstalled}
        />
        <OfflineIndicator />
      </>
    );
  }

  const renderActiveView = () => {
    switch (activeTab) {
      case 'dashboard':
        return <MasterDashboard />;
      case 'monitoring':
        return <RealTimeMonitoring />;
      case 'digital-twin':
        return <DigitalWaterTwin />;
      case 'anomalies':
        return <AnomalyLeakageCenter />;
      case 'forecast':
        return <ForecastOptimization />;
      case 'recommendations':
        return <RecommendationsView />;
      case 'simulator':
        return <DigitalTwinSimulator />;
      case 'maintenance':
        return <PredictiveMaintenance />;
      case 'quality':
        return <WaterQualityModule />;
      case 'geospatial':
        return <GeospatialMap />;
      case 'comparison':
        return <MultiBuildingComparison />;
      case 'sustainability':
        return <SustainabilityCenter />;
      case 'reports':
        return <ReportCenter />;
      case 'sensors':
        return <SensorHealthView />;
      case 'audit':
        return <AuditLogView />;
      default:
        return <MasterDashboard />;
    }
  };

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col font-sans text-slate-800 antialiased selection:bg-cyan-500 selection:text-white">
      {/* Top Header */}
      <Header />

      {/* Top Row Navigation Matrix (Replaces left sidebar column with full-width command row) */}
      <TopNavigationMatrix />

      {/* Dynamic Page-Wise Operational Matrix Bar */}
      <PageMatrixBar />

      {/* Neat Full Page Command Center Active View (Zero left column, full panoramic view) */}
      <main className="flex-1 overflow-y-auto custom-scrollbar flex flex-col w-full">
        <div className="flex-1 w-full">
          {renderActiveView()}
        </div>
      </main>

      {/* Global General Copilot Drawer */}
      <JalRakshakCopilot />

      {/* Dedicated Page-Wise Contextual Query-Solving Chatbot */}
      <PageContextualChatbot />

      {/* IoT Digital Twin Simulator Controls Drawer */}
      <SimulatorDrawer />
      
      {/* PC & Mobile App Installation Modal */}
      <InstallPwaModal
        isOpen={isPwaModalOpen}
        onClose={() => setIsPwaModalOpen(false)}
        deferredPrompt={deferredPwaPrompt}
        isInstalled={isPwaInstalled}
      />

      {/* Offline Status & Cached Telemetry Indicator */}
      <OfflineIndicator />
    </div>
  );
};

export default function App() {
  return (
    <AppProvider>
      <AppContent />
    </AppProvider>
  );
}
