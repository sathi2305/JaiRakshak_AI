import { SimulationMode } from '../types';
import { telemetryStorage } from './telemetryStorage';

export const api = {
  async getDashboardSummary() {
    const res = await fetch('/api/dashboard/summary');
    return res.json();
  },

  async getCampuses() {
    const res = await fetch('/api/campuses');
    return res.json();
  },

  async getBuildings() {
    const res = await fetch('/api/buildings');
    return res.json();
  },

  async getBuilding(id: string) {
    const res = await fetch(`/api/buildings/${id}`);
    return res.json();
  },

  async getSensors() {
    const res = await fetch('/api/sensors');
    return res.json();
  },

  async replaceSensorBattery(id: string) {
    const res = await fetch(`/api/sensors/${id}/replace-battery`, {
      method: 'POST'
    });
    return res.json();
  },

  async dispatchBatteryReplacement(id: string) {
    const res = await fetch(`/api/sensors/${id}/dispatch-replacement`, {
      method: 'POST'
    });
    return res.json();
  },

  async getLatestReadings() {
    try {
      const res = await fetch('/api/readings/latest');
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      if (data && typeof data === 'object') {
        telemetryStorage.storeLatestTelemetry(data);
        return data;
      }
      throw new Error('Invalid telemetry payload');
    } catch (err) {
      console.warn('Network unavailable for latest readings, using local telemetry cache:', err);
      const cached = await telemetryStorage.getStoredLatestTelemetry();
      if (cached) return cached;
      return {
        flowRateLpm: 48.2,
        pressureBar: 3.2,
        tankLevelPercent: 78,
        waterQualityScore: 84,
        leakageRiskPercent: 78,
        leakRiskLevel: 'HIGH'
      };
    }
  },

  async getHistoricalReadings(hours = 24) {
    try {
      const res = await fetch(`/api/readings/history?hours=${hours}`);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      if (Array.isArray(data) && data.length > 0) {
        telemetryStorage.storeHistoricalReadings(data, hours);
        if ('serviceWorker' in navigator && navigator.serviceWorker.controller) {
          navigator.serviceWorker.controller.postMessage({
            type: 'SAVE_TELEMETRY_RECORD',
            payload: { hours, readings: data }
          });
        }
        return data;
      }
      throw new Error('Non-array telemetry response');
    } catch (err) {
      console.warn('Network unavailable for historical readings, loading local offline telemetry store:', err);
      return await telemetryStorage.getStoredHistoricalReadings(hours);
    }
  },

  async setSimulationMode(mode: SimulationMode) {
    const res = await fetch('/api/simulator/mode', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ mode })
    });
    return res.json();
  },

  async injectSimulationEvent(eventType: 'LEAK' | 'PRESSURE_DROP' | 'HIGH_CONSUMPTION' | 'SENSOR_FAILURE' | 'RESET') {
    const res = await fetch('/api/simulator/inject', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ eventType })
    });
    return res.json();
  },

  async getAnomalies() {
    const res = await fetch('/api/anomalies');
    return res.json();
  },

  async getLeakageRisk() {
    const res = await fetch('/api/leakage-risk');
    return res.json();
  },

  async getForecast(horizon: '24h' | '7d' | '30d' = '24h') {
    const res = await fetch(`/api/forecast?horizon=${horizon}`);
    return res.json();
  },

  async getRecommendations() {
    const res = await fetch('/api/recommendations');
    return res.json();
  },

  async applyRecommendation(id: string) {
    const res = await fetch(`/api/recommendations/${id}/apply`, { method: 'POST' });
    return res.json();
  },

  async getAlerts() {
    const res = await fetch('/api/alerts');
    return res.json();
  },

  async acknowledgeAlert(id: string) {
    const res = await fetch(`/api/alerts/${id}/acknowledge`, { method: 'POST' });
    return res.json();
  },

  async resolveAlert(id: string) {
    const res = await fetch(`/api/alerts/${id}/resolve`, { method: 'POST' });
    return res.json();
  },

  async getWaterQuality() {
    const res = await fetch('/api/water-quality');
    return res.json();
  },

  async getMaintenanceTasks() {
    const res = await fetch('/api/maintenance');
    return res.json();
  },

  async createMaintenanceTask(task: any) {
    const res = await fetch('/api/maintenance', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(task)
    });
    return res.json();
  },

  async updateMaintenanceTask(id: string, update: any) {
    const res = await fetch(`/api/maintenance/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(update)
    });
    return res.json();
  },

  async getSustainability() {
    const res = await fetch('/api/sustainability');
    return res.json();
  },

  async runSimulation(params: any) {
    const res = await fetch('/api/simulations/run', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(params)
    });
    return res.json();
  },

  async generateReport(type: 'daily' | 'weekly' | 'monthly') {
    try {
      const res = await fetch('/api/reports/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type })
      });
      return await res.json();
    } catch (e) {
      console.warn('Network report generation failed, trying cached report fallback:', e);
      return await this.getLatestReport(type);
    }
  },

  async getReports(type: 'daily' | 'weekly' | 'monthly' = 'weekly') {
    const res = await fetch(`/api/reports?type=${type}`);
    return res.json();
  },

  async getLatestReport(type: 'daily' | 'weekly' | 'monthly' = 'weekly') {
    const res = await fetch(`/api/reports/latest?type=${type}`);
    return res.json();
  },

  async sendCopilotMessage(message: string, conversationHistory: { sender: 'user' | 'ai'; text: string }[] = []) {
    const res = await fetch('/api/copilot', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message, conversationHistory })
    });
    return res.json();
  },

  async getAuditLogs() {
    const res = await fetch('/api/audit');
    return res.json();
  },

  async getLeakThresholds() {
    try {
      const res = await fetch('/api/config/leak-thresholds');
      if (!res.ok) throw new Error('Failed to fetch leak thresholds');
      return await res.json();
    } catch (err) {
      console.warn('Using offline/default threshold config:', err);
      return {
        preset: 'standard',
        pressureDropBar: 0.40,
        nightFlowExceedancePercent: 40,
        continuousFlowDurationMinutes: 30,
        acousticVibrationThresholdDb: 62,
        minConfidencePercent: 75,
        autoTripIsolationValve: false,
        autoDispatchWorkOrder: true,
        alertChannels: ['in_app', 'email', 'sms'],
        buildingOverrides: {
          'bld-1': { multiplier: 1.25, name: 'Engineering Block A (Riser P-104 Zone)' },
          'bld-2': { multiplier: 1.0, name: 'Science Complex B' },
          'bld-3': { multiplier: 1.1, name: 'Central Administration C' },
          'bld-4': { multiplier: 0.85, name: 'Dining Hall & Hostel D' }
        },
        updatedAt: new Date().toISOString(),
        updatedBy: 'Admin (Plant Command)'
      };
    }
  },

  async updateLeakThresholds(config: any) {
    const res = await fetch('/api/config/leak-thresholds', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(config)
    });
    return res.json();
  },

  async testLeakThresholds(config: any) {
    const res = await fetch('/api/config/leak-thresholds/test', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(config)
    });
    return res.json();
  },

  async getBatteryThresholdConfig() {
    try {
      const res = await fetch('/api/config/battery-threshold');
      if (!res.ok) throw new Error('Failed to fetch battery threshold config');
      return await res.json();
    } catch (err) {
      console.warn('Using fallback battery threshold config:', err);
      return {
        lowBatteryThresholdPercent: 40,
        criticalBatteryThresholdPercent: 20,
        headerMaintenanceAlertActive: true,
        autoDispatchBatteryWorkOrder: true,
        soundAlarmOnCritical: false,
        leadTimeDaysTarget: 5,
        updatedAt: new Date().toISOString(),
        updatedBy: 'Plant Administrator'
      };
    }
  },

  async updateBatteryThresholdConfig(config: any) {
    const res = await fetch('/api/config/battery-threshold', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(config)
    });
    return res.json();
  },

  subscribeToTelemetry(onMessage: (data: any) => void) {
    const eventSource = new EventSource('/api/readings/stream');
    eventSource.onmessage = (event) => {
      try {
        const parsed = JSON.parse(event.data);
        onMessage(parsed);
      } catch (err) {
        console.error('Failed to parse telemetry SSE:', err);
      }
    };
    return () => {
      eventSource.close();
    };
  }
};
