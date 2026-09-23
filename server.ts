import express from 'express';
import path from 'path';
import { GoogleGenAI } from '@google/genai';
import dotenv from 'dotenv';
import {
  INITIAL_BUILDINGS,
  INITIAL_CAMPUSES,
  INITIAL_SENSORS,
  INITIAL_ZONES,
  INITIAL_PIPELINES,
  INITIAL_ALERTS,
  INITIAL_RECOMMENDATIONS,
  INITIAL_MAINTENANCE_TASKS,
  INITIAL_SUSTAINABILITY_GOALS,
  INITIAL_BADGES,
  INITIAL_AUDIT_LOGS,
  generateHistoricalReadings,
  generateDemandForecast
} from './src/data/mockDatabase';
import { SimulationMode, RiskLevel } from './src/types';

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json());

// Initialize Gemini SDK lazily & safely
let aiClient: GoogleGenAI | null = null;
function getGeminiClient(): GoogleGenAI | null {
  if (!aiClient && process.env.GEMINI_API_KEY) {
    try {
      aiClient = new GoogleGenAI({
        apiKey: process.env.GEMINI_API_KEY,
        httpOptions: {
          headers: {
            'User-Agent': 'aistudio-build',
          },
        },
      });
    } catch (e) {
      console.warn('Failed to initialize Gemini Client:', e);
    }
  }
  return aiClient;
}

// In-Memory Live State
let currentSimulationMode: SimulationMode = 'LEAKAGE_RISK';
let simulationFrequencySeconds = 3;
let liveBuildings = JSON.parse(JSON.stringify(INITIAL_BUILDINGS));
let liveSensors = JSON.parse(JSON.stringify(INITIAL_SENSORS));
let liveAlerts = JSON.parse(JSON.stringify(INITIAL_ALERTS));
let liveRecommendations = JSON.parse(JSON.stringify(INITIAL_RECOMMENDATIONS));
let liveMaintenance = JSON.parse(JSON.stringify(INITIAL_MAINTENANCE_TASKS));
let liveAuditLogs = JSON.parse(JSON.stringify(INITIAL_AUDIT_LOGS));
let liveGoals = JSON.parse(JSON.stringify(INITIAL_SUSTAINABILITY_GOALS));
let liveBadges = JSON.parse(JSON.stringify(INITIAL_BADGES));

// Current telemetry snapshot for Block A
let currentTelemetry = {
  flowRateLpm: 48.5,
  pressureBar: 2.7,
  tankLevelPercent: 78,
  inletVolumeLiters: 12480,
  outletVolumeLiters: 11240,
  consumptionRateLph: 1420,
  waterQualityScore: 92,
  ph: 7.2,
  turbidityNtu: 0.45,
  tdsMgL: 210,
  temperatureC: 22.4,
  conductivityUsCm: 340,
  leakageRiskPercent: 87,
  leakRiskLevel: 'HIGH' as RiskLevel,
  timestamp: new Date().toISOString()
};

// SSE Client Connections
type SSEClient = express.Response;
const sseClients: SSEClient[] = [];

function broadcastTelemetry() {
  // Update state according to current simulation mode
  const now = new Date().toISOString();
  
  if (currentSimulationMode === 'NORMAL') {
    currentTelemetry.flowRateLpm = Number((24 + Math.random() * 4).toFixed(1));
    currentTelemetry.pressureBar = Number((3.8 + Math.random() * 0.2).toFixed(2));
    currentTelemetry.consumptionRateLph = Math.round(currentTelemetry.flowRateLpm * 60);
    currentTelemetry.leakageRiskPercent = Math.round(10 + Math.random() * 8);
    currentTelemetry.leakRiskLevel = 'NORMAL';
  } else if (currentSimulationMode === 'LEAKAGE_RISK') {
    currentTelemetry.flowRateLpm = Number((46 + Math.random() * 6).toFixed(1));
    currentTelemetry.pressureBar = Number((2.6 + Math.random() * 0.3).toFixed(2));
    currentTelemetry.consumptionRateLph = Math.round(currentTelemetry.flowRateLpm * 60);
    currentTelemetry.leakageRiskPercent = Math.min(96, Math.round(84 + Math.random() * 8));
    currentTelemetry.leakRiskLevel = 'HIGH';
  } else if (currentSimulationMode === 'HIGH_CONSUMPTION') {
    currentTelemetry.flowRateLpm = Number((68 + Math.random() * 8).toFixed(1));
    currentTelemetry.pressureBar = Number((3.4 + Math.random() * 0.2).toFixed(2));
    currentTelemetry.consumptionRateLph = Math.round(currentTelemetry.flowRateLpm * 60);
    currentTelemetry.leakageRiskPercent = Math.round(52 + Math.random() * 10);
    currentTelemetry.leakRiskLevel = 'MEDIUM';
  } else if (currentSimulationMode === 'PRESSURE_DROP') {
    currentTelemetry.flowRateLpm = Number((18 + Math.random() * 4).toFixed(1));
    currentTelemetry.pressureBar = Number((1.8 + Math.random() * 0.2).toFixed(2));
    currentTelemetry.consumptionRateLph = Math.round(currentTelemetry.flowRateLpm * 60);
    currentTelemetry.leakageRiskPercent = Math.round(72 + Math.random() * 6);
    currentTelemetry.leakRiskLevel = 'HIGH';
  } else if (currentSimulationMode === 'TANK_OVERFLOW') {
    currentTelemetry.tankLevelPercent = Math.min(100, currentTelemetry.tankLevelPercent + 2);
    currentTelemetry.flowRateLpm = Number((55 + Math.random() * 5).toFixed(1));
    currentTelemetry.leakRiskLevel = 'CRITICAL';
  } else if (currentSimulationMode === 'LOW_TANK') {
    currentTelemetry.tankLevelPercent = Math.max(12, currentTelemetry.tankLevelPercent - 2);
    currentTelemetry.flowRateLpm = Number((14 + Math.random() * 3).toFixed(1));
  } else if (currentSimulationMode === 'WATER_QUALITY_ANOMALY') {
    currentTelemetry.turbidityNtu = Number((2.8 + Math.random() * 0.5).toFixed(2));
    currentTelemetry.ph = Number((5.8 + Math.random() * 0.2).toFixed(2));
    currentTelemetry.waterQualityScore = 58;
  } else if (currentSimulationMode === 'SENSOR_FAILURE') {
    // Flag sensor
    const s = liveSensors.find((item: any) => item.code === 'FLW-104');
    if (s) {
      s.status = 'DEGRADED';
      s.dataQualityPercent = 64;
    }
  }

  currentTelemetry.inletVolumeLiters += Math.round(currentTelemetry.flowRateLpm * (simulationFrequencySeconds / 60));
  currentTelemetry.outletVolumeLiters += Math.round((currentTelemetry.flowRateLpm * 0.92) * (simulationFrequencySeconds / 60));
  currentTelemetry.timestamp = now;

  // Sync to Block A building
  if (liveBuildings[0]) {
    liveBuildings[0].currentFlowRate = currentTelemetry.flowRateLpm;
    liveBuildings[0].currentPressure = currentTelemetry.pressureBar;
    liveBuildings[0].leakageRiskPercent = currentTelemetry.leakageRiskPercent;
    liveBuildings[0].riskLevel = currentTelemetry.leakRiskLevel;
    liveBuildings[0].todayConsumptionLiters = currentTelemetry.inletVolumeLiters;
  }

  const payload = JSON.stringify({
    mode: currentSimulationMode,
    telemetry: currentTelemetry,
    buildings: liveBuildings,
    sensors: liveSensors
  });

  sseClients.forEach((client) => {
    client.write(`data: ${payload}\n\n`);
  });
}

// Tick loop for streaming
setInterval(broadcastTelemetry, 3000);

// --- REST API ENDPOINTS ---

app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    service: 'JalRakshak AI Water Intelligence Platform',
    version: '1.0.0',
    simulationMode: currentSimulationMode,
    connectedClients: sseClients.length,
    timestamp: new Date().toISOString()
  });
});

// Summary KPI for Master Dashboard
app.get('/api/dashboard/summary', (req, res) => {
  const totalConsumptionToday = liveBuildings.reduce((acc: number, b: any) => acc + b.todayConsumptionLiters, 0);
  const yesterdayTotal = liveBuildings.reduce((acc: number, b: any) => acc + b.yesterdayConsumptionLiters, 0);
  const consumptionDeltaPercent = Number((((totalConsumptionToday - yesterdayTotal) / yesterdayTotal) * 100).toFixed(1));
  const activeAlertsCount = liveAlerts.filter((a: any) => a.status === 'NEW' || a.status === 'IN_PROGRESS').length;
  
  res.json({
    kpis: {
      todayWaterConsumptionLiters: totalConsumptionToday,
      consumptionDeltaPercent,
      currentFlowRateLpm: currentTelemetry.flowRateLpm,
      estimatedDailyDemandLiters: 74200,
      waterSavedLiters: 1240000,
      leakageRiskPercent: currentTelemetry.leakageRiskPercent,
      leakRiskLevel: currentTelemetry.leakRiskLevel,
      activeAlertsCount,
      tankLevelPercent: currentTelemetry.tankLevelPercent,
      waterQualityScore: currentTelemetry.waterQualityScore,
      monthlyConsumptionLiters: 1845000,
      conservationTargetPercent: 20,
      conservationProgressPercent: 77.5,
      energySavedKwh: 4850,
      co2AvoidedKg: 3980
    },
    currentSimulationMode,
    timestamp: new Date().toISOString()
  });
});

// Buildings & Campus
app.get('/api/campuses', (req, res) => {
  res.json(INITIAL_CAMPUSES);
});

app.get('/api/buildings', (req, res) => {
  res.json(liveBuildings);
});

app.get('/api/buildings/:id', (req, res) => {
  const building = liveBuildings.find((b: any) => b.id === req.params.id);
  if (!building) return res.status(404).json({ error: 'Building not found' });
  
  const zones = INITIAL_ZONES.filter((z: any) => z.buildingId === req.params.id);
  const pipelines = INITIAL_PIPELINES.filter((p: any) => p.buildingId === req.params.id);
  const sensors = liveSensors.filter((s: any) => s.buildingId === req.params.id);
  
  res.json({
    ...building,
    zones,
    pipelines,
    sensors
  });
});

// Sensors & Telemetry
app.get('/api/sensors', (req, res) => {
  res.json(liveSensors);
});

// Battery replacement & proactive maintenance endpoints for remote IoT sensors
app.post('/api/sensors/:id/replace-battery', (req, res) => {
  const sensor = liveSensors.find((s: any) => s.id === req.params.id);
  if (!sensor) return res.status(404).json({ error: 'Sensor not found' });
  
  const oldBattery = sensor.batteryPercent;
  sensor.batteryPercent = 100;
  sensor.status = 'ONLINE';
  sensor.dataQualityPercent = 99;
  sensor.estimatedBatteryDaysRemaining = 365;
  sensor.lowPowerAlertDispatched = false;
  sensor.qualityIssues = (sensor.qualityIssues || []).filter((q: string) => !q.toLowerCase().includes('battery') && !q.toLowerCase().includes('voltage'));

  // Update or create maintenance task
  const existingTask = liveMaintenance.find((m: any) => m.assetId === sensor.id);
  if (existingTask) {
    existingTask.status = 'COMPLETED';
    existingTask.notes += ` [Proactively resolved: New cell installed. Restored to 100%]`;
  } else {
    liveMaintenance.unshift({
      id: `mnt-${Date.now()}`,
      assetId: sensor.id,
      assetName: `${sensor.name} (${sensor.code})`,
      buildingId: sensor.buildingId,
      buildingName: (liveBuildings.find((b: any) => b.id === sensor.buildingId)?.name) || 'Campus Facility',
      type: 'BATTERY_REPLACEMENT',
      priority: 'HIGH',
      status: 'COMPLETED',
      assignedTo: 'Vikram Singh (Field IoT Team)',
      reportedDate: new Date().toISOString().split('T')[0],
      dueDate: new Date().toISOString().split('T')[0],
      suspectedLocation: `Sensor Node ${sensor.code}`,
      notes: `Replaced low battery unit (${oldBattery}% -> 100%). Cell type: ${sensor.batterySpecs || 'Li-SOCl2 3.6V'}.`
    });
  }

  liveAuditLogs.unshift({
    id: `aud-${Date.now()}`,
    timestamp: new Date().toLocaleString(),
    userId: 'usr-maintenance',
    userName: 'Vikram Singh (Field IoT)',
    userRole: 'maintenance',
    action: `Proactive Battery Replacement: ${sensor.code}`,
    details: `Installed fresh primary cell on ${sensor.name}. Voltage normalized, packet transmission rate restored.`,
    category: 'MAINTENANCE'
  });

  broadcastTelemetry();
  res.json({ success: true, sensor });
});

app.post('/api/sensors/:id/dispatch-replacement', (req, res) => {
  const sensor = liveSensors.find((s: any) => s.id === req.params.id);
  if (!sensor) return res.status(404).json({ error: 'Sensor not found' });
  
  sensor.lowPowerAlertDispatched = true;
  const task = {
    id: `mnt-${Date.now()}`,
    assetId: sensor.id,
    assetName: `${sensor.name} (${sensor.code})`,
    buildingId: sensor.buildingId,
    buildingName: (liveBuildings.find((b: any) => b.id === sensor.buildingId)?.name) || 'Campus Facility',
    type: 'BATTERY_REPLACEMENT',
    priority: sensor.batteryPercent < 20 ? 'CRITICAL' : 'HIGH',
    status: 'IN_PROGRESS',
    assignedTo: 'Vikram Singh (Field IoT Specialist)',
    reportedDate: new Date().toISOString().split('T')[0],
    dueDate: new Date(Date.now() + 86400000).toISOString().split('T')[0],
    suspectedLocation: `Sensor Node ${sensor.code} Utility Vault`,
    notes: `PROACTIVE REPLACEMENT: Current charge at ${sensor.batteryPercent}%. Remaining run-time: ~${sensor.estimatedBatteryDaysRemaining || 2} days. Cell Spec: ${sensor.batterySpecs || '3.6V Li-SOCl2'}.`
  };
  liveMaintenance.unshift(task);

  liveAuditLogs.unshift({
    id: `aud-${Date.now()}`,
    timestamp: new Date().toLocaleString(),
    userId: 'usr-current',
    userName: 'Active Facility Engineer',
    userRole: 'facility_manager',
    action: `Dispatched Proactive Battery Work Order: ${sensor.code}`,
    details: `Generated Work Order ${task.id} to replace battery cell before telemetry loss.`,
    category: 'MAINTENANCE'
  });

  res.json({ success: true, task, sensor });
});

app.get('/api/readings/latest', (req, res) => {
  res.json(currentTelemetry);
});

app.get('/api/readings/history', (req, res) => {
  const hours = parseInt((req.query.hours as string) || '24', 10);
  res.json(generateHistoricalReadings(hours));
});

// Real-Time SSE Stream Endpoint
app.get('/api/readings/stream', (req, res) => {
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');
  res.flushHeaders();

  // Send initial data immediately
  res.write(`data: ${JSON.stringify({
    mode: currentSimulationMode,
    telemetry: currentTelemetry,
    buildings: liveBuildings,
    sensors: liveSensors
  })}\n\n`);

  sseClients.push(res);

  req.on('close', () => {
    const idx = sseClients.indexOf(res);
    if (idx !== -1) sseClients.splice(idx, 1);
  });
});

// Leak Alert Sensitivity Configuration (Admin Custom Thresholds)
let leakThresholdConfig = {
  preset: 'standard', // 'aggressive' | 'standard' | 'conservative' | 'custom'
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
  lowBatteryThresholdPercent: 40,
  criticalBatteryThresholdPercent: 20,
  headerMaintenanceAlertActive: true,
  autoDispatchBatteryWorkOrder: true,
  updatedAt: new Date().toISOString(),
  updatedBy: 'Chief Plant Engineer (Admin Level)'
};

let batteryThresholdConfig = {
  lowBatteryThresholdPercent: 40,
  criticalBatteryThresholdPercent: 20,
  headerMaintenanceAlertActive: true,
  autoDispatchBatteryWorkOrder: true,
  soundAlarmOnCritical: false,
  leadTimeDaysTarget: 5,
  updatedAt: new Date().toISOString(),
  updatedBy: 'Chief Plant Engineer (Admin Level)'
};

app.get('/api/config/battery-threshold', (req, res) => {
  res.json(batteryThresholdConfig);
});

app.post('/api/config/battery-threshold', (req, res) => {
  const updates = req.body;
  if (!updates) return res.status(400).json({ error: 'Config body required' });

  batteryThresholdConfig = {
    ...batteryThresholdConfig,
    ...updates,
    updatedAt: new Date().toISOString()
  };

  leakThresholdConfig.lowBatteryThresholdPercent = batteryThresholdConfig.lowBatteryThresholdPercent;
  leakThresholdConfig.criticalBatteryThresholdPercent = batteryThresholdConfig.criticalBatteryThresholdPercent;

  liveAuditLogs.unshift({
    id: `aud-${Date.now()}`,
    timestamp: new Date().toLocaleString(),
    userId: 'usr-admin-1',
    userName: updates.updatedBy || 'Plant Administrator',
    userRole: 'admin',
    action: `Updated Remote IoT Low Battery Alert Threshold (${batteryThresholdConfig.lowBatteryThresholdPercent}%)`,
    details: `Header maintenance alerts will trigger when remote IoT nodes drop below ${batteryThresholdConfig.lowBatteryThresholdPercent}% (Critical: ${batteryThresholdConfig.criticalBatteryThresholdPercent}%).`,
    category: 'CONFIG'
  });

  res.json({ success: true, config: batteryThresholdConfig });
});

app.get('/api/config/leak-thresholds', (req, res) => {
  res.json(leakThresholdConfig);
});

app.post('/api/config/leak-thresholds', (req, res) => {
  const updates = req.body;
  if (!updates) return res.status(400).json({ error: 'Config body required' });

  leakThresholdConfig = {
    ...leakThresholdConfig,
    ...updates,
    updatedAt: new Date().toISOString()
  };

  // Add an audit log entry
  liveAuditLogs.unshift({
    id: `aud-${Date.now()}`,
    timestamp: new Date().toLocaleString(),
    userId: 'usr-admin-1',
    userName: updates.updatedBy || 'Plant Administrator',
    userRole: 'admin',
    action: `Updated Water Leak Alert Sensitivity Thresholds (${leakThresholdConfig.preset.toUpperCase()})`,
    details: `Pressure drop: ${leakThresholdConfig.pressureDropBar} bar, Night flow: +${leakThresholdConfig.nightFlowExceedancePercent}%, Continuous: ${leakThresholdConfig.continuousFlowDurationMinutes}m, Acoustic: ${leakThresholdConfig.acousticVibrationThresholdDb}dB`,
    category: 'CONFIG'
  });

  res.json({ success: true, config: leakThresholdConfig });
});

app.post('/api/config/leak-thresholds/test', (req, res) => {
  const config = req.body || leakThresholdConfig;
  const pDrop = config.pressureDropBar ?? 0.40;
  const nFlow = config.nightFlowExceedancePercent ?? 40;
  const contMins = config.continuousFlowDurationMinutes ?? 30;

  // Calculate simulated response metrics
  let simulatedAlerts = 2;
  let criticalEvents = 1;
  let suppressionRate = 96.8;
  let detectionSpeed = 14;

  if (pDrop <= 0.25 || nFlow <= 25 || contMins <= 15) {
    simulatedAlerts = 5;
    criticalEvents = 2;
    suppressionRate = 89.2;
    detectionSpeed = 7;
  } else if (pDrop >= 0.70 || nFlow >= 70 || contMins >= 60) {
    simulatedAlerts = 1;
    criticalEvents = 1;
    suppressionRate = 99.4;
    detectionSpeed = 38;
  }

  res.json({
    simulatedAlertsCount: simulatedAlerts,
    criticalEventsCount: criticalEvents,
    falsePositiveSuppressionRate: suppressionRate,
    estimatedDetectionSpeedMinutes: detectionSpeed,
    impactSummary: `Under these sensitivity parameters, the ensemble model would have identified ${simulatedAlerts} leak anomaly patterns over the last 24h with an estimated false-positive suppression rate of ${suppressionRate}%. Detection latency: ~${detectionSpeed} minutes.`
  });
});

// Simulator Control
app.post('/api/simulator/mode', (req, res) => {
  const { mode } = req.body;
  if (!mode) return res.status(400).json({ error: 'Mode required' });
  
  currentSimulationMode = mode;
  broadcastTelemetry();
  
  // Log audit
  liveAuditLogs.unshift({
    id: `aud-${Date.now()}`,
    timestamp: new Date().toLocaleString(),
    userId: 'usr-current',
    userName: 'Active Operator',
    userRole: 'facility_manager',
    action: `Switched Simulation Mode to ${mode}`,
    details: `Updated IoT virtual streaming pipeline parameters to emulate ${mode} state.`,
    category: 'SIMULATION'
  });

  res.json({ success: true, mode: currentSimulationMode });
});

app.post('/api/simulator/inject', (req, res) => {
  const { eventType } = req.body;
  
  if (eventType === 'LEAK') {
    currentSimulationMode = 'LEAKAGE_RISK';
    currentTelemetry.leakageRiskPercent = 94;
    currentTelemetry.pressureBar = 2.4;
    currentTelemetry.flowRateLpm = 52.3;
  } else if (eventType === 'PRESSURE_DROP') {
    currentSimulationMode = 'PRESSURE_DROP';
    currentTelemetry.pressureBar = 1.7;
  } else if (eventType === 'HIGH_CONSUMPTION') {
    currentSimulationMode = 'HIGH_CONSUMPTION';
    currentTelemetry.flowRateLpm = 76.8;
  } else if (eventType === 'SENSOR_FAILURE') {
    currentSimulationMode = 'SENSOR_FAILURE';
    const s = liveSensors.find((item: any) => item.code === 'FLW-104');
    if (s) {
      s.status = 'DEGRADED';
      s.dataQualityPercent = 58;
    }
  } else if (eventType === 'RESET') {
    currentSimulationMode = 'NORMAL';
    currentTelemetry.leakageRiskPercent = 14;
    currentTelemetry.pressureBar = 3.9;
    currentTelemetry.flowRateLpm = 25.4;
    liveSensors = JSON.parse(JSON.stringify(INITIAL_SENSORS));
  }

  broadcastTelemetry();
  res.json({ success: true, mode: currentSimulationMode, telemetry: currentTelemetry });
});

// Anomalies & Leakage Risk Engine
app.get('/api/anomalies', (req, res) => {
  const anomalies = [
    {
      id: 'anom-1',
      type: 'NIGHT_FLOW',
      severity: 'HIGH',
      status: 'NEW',
      time: '38m ago',
      sensorCode: 'FLW-104',
      location: 'Block A, Floor 2, Zone B Chemistry Lab',
      reason: 'Continuous night-time flow (48.5 L/min vs 4.2 L/min baseline) with zero occupancy',
      metric: 'Flow Rate',
      baseline: '4.2 L/min (Night Baseline)',
      observed: `${currentTelemetry.flowRateLpm} L/min`,
      zScore: 3.42,
      deviationPercent: 240,
      confidence: 94,
      confidencePercent: 94,
      riskLevel: currentTelemetry.leakRiskLevel,
      technique: 'Hybrid Isolation Forest + Rolling Z-Score (3.42σ)',
      detectedAt: '38 minutes ago',
      explanation: 'Continuous non-zero flow observed during zero-occupancy night window (01:00-04:00). Concurrently, pressure dropped by 29%.',
      recommendedAction: 'Inspect Floor 2 Zone B distribution valve; check for faulty seal or pipe fracture.'
    },
    {
      id: 'anom-2',
      type: 'PRESSURE_DROP',
      severity: 'HIGH',
      status: 'IN_PROGRESS',
      time: '42m ago',
      sensorCode: 'PRS-104',
      location: 'Block A, Floor 2 Distribution Manifold',
      reason: 'Hydraulic head pressure dropped from 3.8 bar to 2.7 bar (-29%)',
      metric: 'Pressure',
      baseline: '3.8 bar',
      observed: `${currentTelemetry.pressureBar} bar`,
      zScore: -2.85,
      deviationPercent: -29,
      confidence: 91,
      confidencePercent: 91,
      riskLevel: 'HIGH',
      technique: 'Rate-of-Change & Moving Average CUSUM',
      detectedAt: '42 minutes ago',
      explanation: 'Downstream hydraulic resistance drop indicates suspected joint fissure or faulty float valve.',
      recommendedAction: 'Acoustic inspection of riser manifold joints.'
    },
    {
      id: 'anom-3',
      type: 'UNUSUAL_SPIKE',
      severity: 'MEDIUM',
      status: 'ACKNOWLEDGED',
      time: '1h ago',
      sensorCode: 'FLW-401',
      location: 'Block D, Cafeteria & Kitchen Scullery',
      reason: 'Off-peak consumption spike of 1,280 L over 20 minutes',
      metric: 'Flow Rate',
      baseline: '12.0 L/min',
      observed: '38.5 L/min',
      zScore: 2.15,
      deviationPercent: 120,
      confidence: 88,
      confidencePercent: 88,
      riskLevel: 'MEDIUM',
      technique: 'Rolling Median Residual Thresholding',
      detectedAt: '1 hour ago',
      explanation: 'Unscheduled rapid intake during post-service cleaning hours.',
      recommendedAction: 'Verify commercial dishwasher rinse solenoid auto-shutoff.'
    }
  ];
  res.json(anomalies);
});

app.get('/api/leakage-risk', (req, res) => {
  res.json({
    leakageRiskPercent: currentTelemetry.leakageRiskPercent,
    riskLevel: currentTelemetry.leakRiskLevel,
    possibleCause: 'Unexpected continuous flow accompanied by a 29% pressure drop in Lab zone distribution.',
    estimatedWaterLossLph: currentTelemetry.leakRiskLevel === 'HIGH' ? 1240 : 180,
    suspectedLocation: 'Block A — Floor 2 Zone B Pipeline P-104-LAB',
    disclaimer: 'This is an AI-derived predictive risk assessment based on telemetry patterns. Physical inspection is required for on-site confirmation.',
    featureWeights: [
      { name: 'Night Flow Rate vs Baseline', weight: 0.38, status: 'Triggered (+240%)' },
      { name: 'Dynamic Pressure Drop', weight: 0.28, status: 'Triggered (-29%)' },
      { name: 'Acoustic / Ultrasonic Correlation', weight: 0.18, status: 'Medium Correlation' },
      { name: 'Pipeline Age & Material Degradation', weight: 0.16, status: 'CPVC 8-Year Service' }
    ],
    recommendedAction: 'Inspect Floor 2 Zone B distribution manifold and isolation valve within 4 hours.'
  });
});

// Demand Forecasting
app.get('/api/forecast', (req, res) => {
  const horizon = (req.query.horizon as '24h' | '7d' | '30d') || '24h';
  const points = generateDemandForecast(horizon);
  res.json({
    horizon,
    tomorrowPredictedLiters: 18420,
    expectedRange: { min: 17100, max: 19700 },
    confidencePercent: 92,
    modelUsed: 'Hybrid Ensemble (Gradient Boosted Trees + Time-Decay Moving Average)',
    points
  });
});

// Recommendations
app.get('/api/recommendations', (req, res) => {
  res.json(liveRecommendations);
});

app.post('/api/recommendations/:id/apply', (req, res) => {
  const rec = liveRecommendations.find((r: any) => r.id === req.params.id);
  if (!rec) return res.status(404).json({ error: 'Recommendation not found' });
  rec.status = 'APPLIED';
  
  liveAuditLogs.unshift({
    id: `aud-${Date.now()}`,
    timestamp: new Date().toLocaleString(),
    userId: 'usr-current',
    userName: 'Facility Manager',
    userRole: 'facility_manager',
    action: `Applied Recommendation: ${rec.title}`,
    details: `Approved implementation. Estimated water saving: ${rec.estimatedSavingLpd} L/day.`,
    category: 'MAINTENANCE'
  });

  res.json({ success: true, recommendation: rec });
});

// Alerts
app.get('/api/alerts', (req, res) => {
  res.json(liveAlerts);
});

app.post('/api/alerts/:id/acknowledge', (req, res) => {
  const alert = liveAlerts.find((a: any) => a.id === req.params.id);
  if (!alert) return res.status(404).json({ error: 'Alert not found' });
  alert.status = 'ACKNOWLEDGED';
  
  liveAuditLogs.unshift({
    id: `aud-${Date.now()}`,
    timestamp: new Date().toLocaleString(),
    userId: 'usr-current',
    userName: 'Operator',
    userRole: 'facility_manager',
    action: `Acknowledged Alert: ${alert.type}`,
    details: `Location: ${alert.buildingName}. Action dispatched.`,
    category: 'ALERT'
  });

  res.json({ success: true, alert });
});

app.post('/api/alerts/:id/resolve', (req, res) => {
  const alert = liveAlerts.find((a: any) => a.id === req.params.id);
  if (!alert) return res.status(404).json({ error: 'Alert not found' });
  alert.status = 'RESOLVED';
  
  liveAuditLogs.unshift({
    id: `aud-${Date.now()}`,
    timestamp: new Date().toLocaleString(),
    userId: 'usr-current',
    userName: 'Maintenance Specialist',
    userRole: 'maintenance',
    action: `Resolved Alert: ${alert.type}`,
    details: `Physical inspection and valve repair verified in ${alert.buildingName}.`,
    category: 'ALERT'
  });

  res.json({ success: true, alert });
});

// Water Quality Module
app.get('/api/water-quality', (req, res) => {
  res.json({
    score: currentTelemetry.waterQualityScore,
    status: currentTelemetry.waterQualityScore >= 85 ? 'GOOD' : currentTelemetry.waterQualityScore >= 70 ? 'FAIR' : 'POOR',
    metrics: {
      ph: { value: currentTelemetry.ph, unit: 'pH', normalRange: '6.5 - 8.5', status: currentTelemetry.ph >= 6.5 && currentTelemetry.ph <= 8.5 ? 'NORMAL' : 'ANOMALY' },
      turbidity: { value: currentTelemetry.turbidityNtu, unit: 'NTU', normalRange: '< 1.0 NTU', status: currentTelemetry.turbidityNtu <= 1.0 ? 'NORMAL' : 'HIGH' },
      tds: { value: currentTelemetry.tdsMgL, unit: 'mg/L', normalRange: '< 500 mg/L', status: currentTelemetry.tdsMgL < 500 ? 'NORMAL' : 'ELEVATED' },
      temperature: { value: currentTelemetry.temperatureC, unit: '°C', normalRange: '18 - 26°C', status: 'NORMAL' },
      conductivity: { value: currentTelemetry.conductivityUsCm, unit: 'µS/cm', normalRange: '200 - 800', status: 'NORMAL' }
    },
    lastTestTimestamp: currentTelemetry.timestamp
  });
});

// Maintenance
app.get('/api/maintenance', (req, res) => {
  res.json(liveMaintenance);
});

app.post('/api/maintenance', (req, res) => {
  const task = {
    id: `mnt-${Date.now()}`,
    reportedDate: new Date().toISOString().split('T')[0],
    dueDate: new Date(Date.now() + 3 * 86400000).toISOString().split('T')[0],
    status: 'NEW',
    ...req.body
  };
  liveMaintenance.unshift(task);
  
  liveAuditLogs.unshift({
    id: `aud-${Date.now()}`,
    timestamp: new Date().toLocaleString(),
    userId: 'usr-current',
    userName: 'Operator',
    userRole: 'facility_manager',
    action: `Created Work Order ${task.id}`,
    details: `Task: ${task.type} on ${task.assetName}.`,
    category: 'MAINTENANCE'
  });

  res.json({ success: true, task });
});

app.patch('/api/maintenance/:id', (req, res) => {
  const task = liveMaintenance.find((m: any) => m.id === req.params.id);
  if (!task) return res.status(404).json({ error: 'Task not found' });
  Object.assign(task, req.body);
  res.json({ success: true, task });
});

// Sustainability & Goals
app.get('/api/sustainability', (req, res) => {
  res.json({
    goals: liveGoals,
    badges: liveBadges,
    impact: {
      totalWaterSavedLiters: 1240000,
      annualProjectedSavingLiters: 14880000,
      avoidedLossLiters: 382000,
      energySavedKwh: 4850,
      carbonAvoidedKgCo2e: 3980,
      costSavingsUsd: 18600
    },
    efficiencyScore: {
      score: 84,
      breakdown: [
        { factor: 'Consumption Trend vs Baseline', score: 88, weight: 0.25 },
        { factor: 'Leakage Risk Suppression', score: 72, weight: 0.20 },
        { factor: 'Night Usage Efficiency', score: 76, weight: 0.20 },
        { factor: 'Water Saved Volume', score: 94, weight: 0.15 },
        { factor: 'Infrastructure Health Index', score: 86, weight: 0.10 },
        { factor: 'Conservation Goal Progress', score: 90, weight: 0.10 }
      ]
    }
  });
});

// What-If Digital Twin Simulator Engine
app.post('/api/simulations/run', (req, res) => {
  const {
    baselineConsumption = 20000,
    conservationPercent = 15,
    leakageMitigationPercent = 50,
    pumpHoursReduction = 2,
    irrigationReductionPercent = 25
  } = req.body;

  const originalDaily = baselineConsumption;
  const conservationSavings = originalDaily * (conservationPercent / 100);
  const leakageSavings = (originalDaily * 0.12) * (leakageMitigationPercent / 100);
  const pumpSavings = pumpHoursReduction * 350; // Liters avoided in unnecessary pressure cycle
  const irrigationSavings = 1800 * (irrigationReductionPercent / 100);

  const totalDailySavings = Math.round(conservationSavings + leakageSavings + pumpSavings + irrigationSavings);
  const simulatedDailyConsumption = Math.max(0, originalDaily - totalDailySavings);
  const monthlySavings = totalDailySavings * 30;
  const annualSavings = totalDailySavings * 365;
  const energySavedKwh = Math.round(totalDailySavings * 0.0038 * 30);
  const co2SavedKg = Math.round(energySavedKwh * 0.82);
  const costSavingsUsd = Math.round((monthlySavings / 1000) * 2.85);

  const result = {
    originalDailyConsumption: originalDaily,
    simulatedDailyConsumption,
    dailySavingLiters: totalDailySavings,
    monthlySavingLiters: monthlySavings,
    annualSavingLiters: annualSavings,
    costSavingsUsd,
    energySavedKwh,
    co2SavedKg,
    timestamp: new Date().toISOString()
  };

  liveAuditLogs.unshift({
    id: `aud-${Date.now()}`,
    timestamp: new Date().toLocaleString(),
    userId: 'usr-current',
    userName: 'Simulation Analyst',
    userRole: 'sustainability_manager',
    action: `Ran What-If Simulation (${conservationPercent}% conservation)`,
    details: `Estimated monthly savings: ${monthlySavings.toLocaleString()} L.`,
    category: 'SIMULATION'
  });

  res.json({ success: true, result });
});

// In-Memory Report Cache
const cachedAuditReports = new Map<string, any>();

function buildDefaultAuditReport(type: string = 'weekly') {
  const totalConsumption = liveBuildings.reduce((acc: number, b: any) => acc + b.todayConsumptionLiters, 0);
  return {
    reportId: `RPT-${Date.now()}`,
    generatedAt: new Date().toISOString(),
    type,
    executiveSummary: `Executive Summary (${type.toUpperCase()} WATER INTELLIGENCE AUDIT)\n\n` +
      `• Overall water consumption decreased by 8.4% compared to the prior baseline window.\n` +
      `• 2 abnormal consumption events and 1 high-risk suspected leakage event were flagged on Block A Floor 2 (Zone B).\n` +
      `• Water savings achieved this period reached 42,000 Liters, with annual projected savings of 14.8M Liters.\n` +
      `• Recommended urgent intervention: Inspect CPVC risers P-104-LAB to prevent an estimated 1,240 L/hour water loss.`,
    metrics: {
      totalConsumptionLiters: totalConsumption,
      averageDailyConsumption: Math.round(totalConsumption * 0.94),
      anomaliesDetectedCount: 3,
      highRiskZonesCount: 1,
      estimatedPotentialSavingsLitersMonth: 42000,
      complianceScorePercent: 91
    },
    anomalies: [
      { id: 'an-1', type: 'NIGHT FLOW', location: 'Block A Floor 2 (Zone B)', severity: 'HIGH', status: 'IN_PROGRESS' },
      { id: 'an-2', type: 'PRESSURE DROP', location: 'Block A Riser P-104', severity: 'HIGH', status: 'NEW' },
      { id: 'an-3', type: 'UNUSUAL SPIKE', location: 'Block D Dining Hall', severity: 'MEDIUM', status: 'ACKNOWLEDGED' }
    ],
    recommendations: [
      { id: 'rc-1', title: 'Acoustic Sounding on CPVC Pipeline P-104', description: 'Schedule technician to pinpoint underground or interstitial riser joint seal fissure.' },
      { id: 'rc-2', title: 'Adjust PRV-102 Discharge Setpoint to 2.4 bar', description: 'Eliminates excess static head pressure and curtails background weeping by 4.2%.' },
      { id: 'rc-3', title: 'Install Smart Restroom Flow Restrictors in Block B & C', description: 'Upgrade 48 fixtures to 1.5 GPM to conserve an estimated 320,000 Liters annually.' }
    ]
  };
}

// GET endpoints for reports (supports Service Worker offline caching)
app.get('/api/reports', (req, res) => {
  const type = (req.query.type as string) || 'weekly';
  const report = cachedAuditReports.get(type) || cachedAuditReports.get('latest') || buildDefaultAuditReport(type);
  res.json(report);
});

app.get('/api/reports/latest', (req, res) => {
  const type = (req.query.type as string) || 'weekly';
  const report = cachedAuditReports.get(type) || cachedAuditReports.get('latest') || buildDefaultAuditReport(type);
  res.json(report);
});

// Report Generation with AI Executive Summary
app.post('/api/reports/generate', async (req, res) => {
  const { type = 'weekly', campusId = 'camp-1' } = req.body;
  const totalConsumption = liveBuildings.reduce((acc: number, b: any) => acc + b.todayConsumptionLiters, 0);

  let executiveSummary = `Executive Summary (${type.toUpperCase()} WATER INTELLIGENCE AUDIT)\n\n` +
    `• Overall water consumption decreased by 8.4% compared to the prior baseline window.\n` +
    `• 2 abnormal consumption events and 1 high-risk suspected leakage event were flagged on Block A Floor 2 (Zone B).\n` +
    `• Water savings achieved this period reached 42,000 Liters, with annual projected savings of 14.8M Liters.\n` +
    `• Recommended urgent intervention: Inspect CPVC risers P-104-LAB to prevent an estimated 1,240 L/hour water loss.`;

  // Use Gemini to enhance executive summary if available
  const gemini = getGeminiClient();
  if (gemini) {
    try {
      const prompt = `You are JalRakshak AI, an enterprise water intelligence and conservation platform.
Generate a concise, authoritative executive summary (3-4 bullet points) for a ${type} water audit report.
Current Data Context:
- Total Today Consumption: ${totalConsumption.toLocaleString()} Liters
- Leakage Risk: ${currentTelemetry.leakageRiskPercent}% in Block A Floor 2 (CPVC pipe P-104)
- Current Flow: ${currentTelemetry.flowRateLpm} L/min, Pressure: ${currentTelemetry.pressureBar} bar
- Active Alerts: ${liveAlerts.length}
- Water Quality Score: ${currentTelemetry.waterQualityScore}/100
- Conservation Goal Progress: 77.5%
Write the executive summary with clear distinctions between measured telemetry values and AI predictive risk estimates.`;

      const aiResponse = await gemini.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt,
      });

      if (aiResponse && aiResponse.text) {
        executiveSummary = aiResponse.text.trim();
      }
    } catch (err) {
      console.warn('Gemini report generation fallback:', err);
    }
  }

  const generatedReport = {
    reportId: `RPT-${Date.now()}`,
    generatedAt: new Date().toISOString(),
    type,
    executiveSummary,
    metrics: {
      totalConsumptionLiters: totalConsumption,
      averageDailyConsumption: Math.round(totalConsumption * 0.94),
      anomaliesDetectedCount: 3,
      highRiskZonesCount: 1,
      estimatedPotentialSavingsLitersMonth: 42000,
      complianceScorePercent: 91
    },
    anomalies: [
      { id: 'an-1', type: 'NIGHT FLOW', location: 'Block A Floor 2 (Zone B)', severity: 'HIGH', status: 'IN_PROGRESS' },
      { id: 'an-2', type: 'PRESSURE DROP', location: 'Block A Riser P-104', severity: 'HIGH', status: 'NEW' },
      { id: 'an-3', type: 'UNUSUAL SPIKE', location: 'Block D Dining Hall', severity: 'MEDIUM', status: 'ACKNOWLEDGED' }
    ],
    recommendations: [
      { id: 'rc-1', title: 'Acoustic Sounding on CPVC Pipeline P-104', description: 'Schedule technician to pinpoint underground or interstitial riser joint seal fissure.' },
      { id: 'rc-2', title: 'Adjust PRV-102 Discharge Setpoint to 2.4 bar', description: 'Eliminates excess static head pressure and curtails background weeping by 4.2%.' },
      { id: 'rc-3', title: 'Install Smart Restroom Flow Restrictors in Block B & C', description: 'Upgrade 48 fixtures to 1.5 GPM to conserve an estimated 320,000 Liters annually.' }
    ]
  };

  cachedAuditReports.set(type, generatedReport);
  cachedAuditReports.set('latest', generatedReport);

  res.json(generatedReport);
});

// JalRakshak Copilot Conversational AI Endpoint
const handleCopilotChat = async (req: any, res: any) => {
  const { message, conversationHistory = [], pageContext = 'dashboard' } = req.body;
  if (!message) return res.status(400).json({ error: 'Message is required' });

  // Compile real-time domain context to ground the LLM
  const domainContext = {
    activePageContext: pageContext,
    campus: INITIAL_CAMPUSES[0].name,
    totalTodayConsumption: liveBuildings.reduce((acc: number, b: any) => acc + b.todayConsumptionLiters, 0),
    blockA: {
      flowRateLpm: currentTelemetry.flowRateLpm,
      pressureBar: currentTelemetry.pressureBar,
      leakageRiskPercent: currentTelemetry.leakageRiskPercent,
      riskLevel: currentTelemetry.leakRiskLevel,
      tankLevelPercent: currentTelemetry.tankLevelPercent,
      suspectedLocation: 'Floor 2 Zone B Wet Lab Risers (P-104-LAB)'
    },
    activeAlerts: liveAlerts.filter((a: any) => a.status !== 'RESOLVED').map((a: any) => ({
      type: a.type,
      severity: a.severity,
      building: a.buildingName,
      reason: a.reason
    })),
    waterQuality: {
      score: currentTelemetry.waterQualityScore,
      ph: currentTelemetry.ph,
      turbidity: currentTelemetry.turbidityNtu
    },
    sustainability: {
      waterSavedLiters: 1240000,
      targetPercent: 20,
      progressPercent: 77.5
    }
  };

  const gemini = getGeminiClient();

  if (gemini) {
    try {
      const systemInstruction = `You are JalRakshak Copilot, the AI assistant inside the JalRakshak AI Water Intelligence Platform.
Tagline: "Predict Water Loss. Prevent Waste. Protect Tomorrow."
User Role Levels supported: Admin Level (Full Plant Authority) and User Level (Monitoring & Analytical Access).
The user is currently viewing the page: "${pageContext}".
Focus your answer specifically on the query relevant to this active page (${pageContext}) and the provided real-time telemetry.
Live System Context: ${JSON.stringify(domainContext)}

Rules:
1. Ground all answers in this actual project data. Never invent hypothetical data when live context exists.
2. Tailor answers specifically to the active page: "${pageContext}".
3. Never claim software has physically confirmed a leak unless verified by on-site crew; use responsible terminology: "Suspected Leakage", "High Leakage Risk", "Anomalous Consumption".
4. Provide concrete numbers, specific zone and pipe codes (e.g. P-104-LAB, Block A Floor 2), confidence percentages, and estimated Liters saved.
5. Keep answers crisp, professional, explainable, and formatted with markdown bullet points.`;

      const contents = [
        ...conversationHistory.map((m: any) => ({
          role: m.sender === 'user' ? 'user' : 'model',
          parts: [{ text: m.text }]
        })),
        {
          role: 'user',
          parts: [{ text: message }]
        }
      ];

      const response = await gemini.models.generateContent({
        model: 'gemini-2.5-flash',
        contents,
        config: {
          systemInstruction,
        }
      });

      const reply = response.text || 'I analyzed the water telemetry. Please review the dashboard indicators for specific flow metrics.';
      return res.json({ reply, grounded: true, model: 'JalRakshak AI Engine' });
    } catch (error: any) {
      console.warn('Gemini API call failed, falling back to analytical copilot engine:', error?.message || error);
    }
  }

  // High-fidelity analytical engine fallback if API key is not configured
  let fallbackReply = '';
  const q = message.toLowerCase();

  if (q.includes('why') && (q.includes('increase') || q.includes('consumption'))) {
    fallbackReply = `**Analysis of Today's Consumption Spike:**\n\n` +
      `• **Observed Surge:** Today's campus consumption reached **${domainContext.totalTodayConsumption.toLocaleString()} Liters**.\n` +
      `• **Primary Driver:** **Block A (Floor 2 Wet Lab)** has sustained continuous flow of **${domainContext.blockA.flowRateLpm} L/min**, a **+143% increase** over the 02:00 AM baseline.\n` +
      `• **Hydraulic Correlation:** Flow increase coincides with a **29% pressure drop (to ${domainContext.blockA.pressureBar} bar)** on distribution pipe **P-104-LAB**.\n` +
      `• **Assessment:** Suspected unclosed booster valve or pipe joint micro-fissure. Physical inspection recommended.`;
  } else if (q.includes('highest') && (q.includes('leak') || q.includes('risk'))) {
    fallbackReply = `**Highest Leakage Risk Building:**\n\n` +
      `• **Building:** **Block A — Advanced Computing & Robotics**\n` +
      `• **Risk Index:** **${domainContext.blockA.leakageRiskPercent}% (${domainContext.blockA.riskLevel})**\n` +
      `• **Suspected Location:** **Floor 2 Zone B (Wet Chemistry Labs & Washrooms)**\n` +
      `• **Estimated Water Loss:** **~1,240 Liters/hour** if unaddressed.\n` +
      `• **Status:** Alert **ALT-1** has been dispatched to maintenance specialist Vikram Singh.`;
  } else if (q.includes('how much') && q.includes('save')) {
    fallbackReply = `**Potential Water Savings Forecast:**\n\n` +
      `• **Immediate Action (Fix Floor 2 Leak):** Recovers **~29,760 Liters/day** (**~890,000 L/month**).\n` +
      `• **Pump & Chiller Schedule Shift:** Off-peak timing yields **~36,000 L/month** and saves **4,850 kWh** energy.\n` +
      `• **Total Achievable Conservation:** **~926,000 Liters this month**, representing **$2,640 USD** in utility cost savings.`;
  } else if (q.includes('anomal') || q.includes('explain')) {
    fallbackReply = `**Active Anomaly Breakdown:**\n\n` +
      `1. **Continuous Night Flow (Block A):** ${domainContext.blockA.flowRateLpm} L/min flow at 02:00 AM without badge-in laboratory occupancy.\n` +
      `2. **Pressure Deficit:** P-104 line pressure dropped to ${domainContext.blockA.pressureBar} bar (Normal: 3.8 bar).\n` +
      `3. **Dishwashing Off-Peak Overuse (Block D):** Kitchen dishwashing line exceeded 95th percentile during afternoon quiet hours.\n` +
      `• **Confidence Score:** 91% predictive certainty based on rolling 30-day Z-score analysis.`;
  } else if (q.includes('inspect') || q.includes('maintenance')) {
    fallbackReply = `**Maintenance Priority Directive:**\n\n` +
      `1. **Priority 1 (Critical):** Inspect **Block A Floor 2 Ceiling Plenum above Lab 204** (Pipeline **P-104-LAB**). Check CPVC elbow joints with acoustic sensor.\n` +
      `2. **Priority 2 (Medium):** Replace degraded lithium battery on Sensor **FLW-401** in Block D dining vault (currently at 34% battery).\n` +
      `3. **Priority 3 (Routine):** Verify Rooftop Tank R-1 float switch cut-off threshold.`;
  } else {
    fallbackReply = `**JalRakshak Intelligence Overview:**\n\n` +
      `• **Campus Status:** **${domainContext.campus}** is operating at an overall Water Efficiency Score of **84/100**.\n` +
      `• **Active Flow Rate:** **${domainContext.blockA.flowRateLpm} L/min** with **${domainContext.activeAlerts.length} active alerts**.\n` +
      `• **Total Saved to Date:** **1.24 Million Liters** (**77.5% of annual goal** achieved).\n` +
      `• You can ask me: *"Which building has the highest leakage risk?"*, *"Explain today's anomalies"*, or *"What should maintenance inspect first?"*`;
  }

  res.json({ reply: fallbackReply, grounded: true, model: 'jalrakshak-analytical-engine' });
};

app.post('/api/copilot', handleCopilotChat);
app.post('/api/copilot/chat', handleCopilotChat);

// Audit Log
app.get('/api/audit', (req, res) => {
  res.json(liveAuditLogs);
});

// Service Worker route - serve src/sw.js with appropriate headers for offline scope
app.get(['/sw.js', '/src/sw.js'], (req, res) => {
  res.setHeader('Content-Type', 'application/javascript; charset=utf-8');
  res.setHeader('Service-Worker-Allowed', '/');
  res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
  res.sendFile(path.join(process.cwd(), 'src', 'sw.js'));
});

// --- Server Startup with Vite Middleware in Dev or Static in Prod ---
async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`[JalRakshak AI] Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
