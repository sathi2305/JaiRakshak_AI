export type UserRole = 'admin' | 'user';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  avatar?: string;
  photoUrl?: string;
  provider?: 'google' | 'email' | 'enterprise';
}

export type RiskLevel = 'NORMAL' | 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
export type AlertStatus = 'NEW' | 'ACKNOWLEDGED' | 'IN_PROGRESS' | 'RESOLVED' | 'FALSE_POSITIVE';
export type SensorStatus = 'ONLINE' | 'OFFLINE' | 'DEGRADED' | 'MAINTENANCE';
export type SimulationMode =
  | 'NORMAL'
  | 'HIGH_CONSUMPTION'
  | 'LEAKAGE_RISK'
  | 'PRESSURE_DROP'
  | 'TANK_OVERFLOW'
  | 'LOW_TANK'
  | 'SENSOR_FAILURE'
  | 'PIPELINE_ANOMALY'
  | 'WATER_QUALITY_ANOMALY'
  | 'RANDOM_ANOMALY';

export interface Campus {
  id: string;
  name: string;
  code: string;
  location: string;
  coordinates: { lat: number; lng: number };
  buildingsCount: number;
  totalOccupancy: number;
}

export interface Building {
  id: string;
  campusId: string;
  name: string;
  code: string;
  floors: number;
  occupancy: number;
  occupantsCount?: number;
  type: 'academic' | 'laboratory' | 'residential' | 'administrative' | 'utility';
  todayConsumptionLiters: number;
  yesterdayConsumptionLiters: number;
  baselineHourlyAvg: number;
  currentFlowRate: number; // L/min
  currentPressure: number; // bar
  tankLevelPercent: number;
  leakageRiskPercent: number;
  riskLevel: RiskLevel;
  efficiencyScore: number;
  activeAlertsCount: number;
  coordinates: { x: number; y: number }; // relative grid or map coordinates
}

export interface Zone {
  id: string;
  buildingId: string;
  name: string;
  floor: number;
  pipelineId: string;
  sensorIds: string[];
  currentFlowRate: number;
  currentPressure: number;
  leakageRiskPercent: number;
  riskLevel: RiskLevel;
}

export interface Pipeline {
  id: string;
  buildingId: string;
  code: string;
  name: string;
  material: string;
  diameterMm: number;
  installYear: number;
  lengthMeters: number;
  healthScore: number; // 0 - 100
  failureRisk: RiskLevel;
  lastInspectionDate: string;
  pressureTrend: 'stable' | 'declining' | 'increasing';
}

export interface Sensor {
  id: string;
  code: string;
  name: string;
  type: 'flow' | 'pressure' | 'tank_level' | 'water_quality' | 'acoustic_leak';
  buildingId: string;
  zoneId?: string;
  pipelineId?: string;
  status: SensorStatus;
  batteryPercent: number;
  powerSource?: 'battery_primary' | 'battery_solar' | 'mains_powered';
  batterySpecs?: string;
  estimatedBatteryDaysRemaining?: number;
  lowPowerAlertDispatched?: boolean;
  signalDbm: number;
  lastReadingTime: string;
  readingFrequencySeconds: number;
  errorCount: number;
  dataQualityPercent: number;
  qualityIssues: string[];
}

export interface WaterTelemetryReading {
  id: string;
  timestamp: string;
  sensorId: string;
  buildingId: string;
  zoneId?: string;
  flowRateLpm: number; // liters per minute
  pressureBar: number; // bar
  tankLevelPercent: number; // 0-100%
  inletVolumeLiters: number;
  outletVolumeLiters: number;
  consumptionRateLph: number; // liters per hour
  isAnomalous: boolean;
  anomalyConfidencePercent?: number;
  anomalyReason?: string;
}

export interface WaterQualityReading {
  id: string;
  timestamp: string;
  buildingId: string;
  ph: number; // 6.5 - 8.5 normal
  turbidityNtu: number; // < 1.0 normal
  tdsMgL: number; // < 500 normal
  temperatureC: number; // 18 - 26 normal
  conductivityUsCm: number; // 200 - 800 normal
  overallScore: number; // 0 - 100
  status: 'EXCELLENT' | 'GOOD' | 'FAIR' | 'POOR';
  anomaliesDetected: string[];
}

export interface SmartAlert {
  id: string;
  timestamp: string;
  type:
    | 'LEAKAGE_RISK'
    | 'ABNORMAL_CONSUMPTION'
    | 'PRESSURE_DROP'
    | 'TANK_OVERFLOW'
    | 'LOW_TANK_LEVEL'
    | 'WATER_QUALITY_ANOMALY'
    | 'SENSOR_FAILURE'
    | 'PIPELINE_RISK'
    | 'FORECAST_DEMAND_SPIKE'
    | 'MAINTENANCE_REQUIRED';
  severity: RiskLevel;
  buildingId: string;
  buildingName: string;
  zoneName?: string;
  sensorId?: string;
  reason: string;
  aiConfidencePercent: number;
  recommendedAction: string;
  status: AlertStatus;
  estimatedWaterLossLph?: number;
  whyExplanation?: {
    factors: string[];
    baselineValue: string;
    observedValue: string;
    historicalDeviationPercent: number;
  };
}

export interface SmartRecommendation {
  id: string;
  title: string;
  reason: string;
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  expectedImpact: string;
  estimatedSavingLpd: number; // Liters per day
  actionText: string;
  confidencePercent: number;
  category: 'LEAKAGE' | 'PUMP' | 'IRRIGATION' | 'TANK' | 'SENSOR' | 'USAGE_SHIFT';
  status: 'PENDING' | 'APPLIED' | 'DISMISSED';
  buildingId?: string;
}

export interface DemandForecastPoint {
  timestamp: string;
  predictedDemandLiters: number;
  minExpectedLiters: number;
  maxExpectedLiters: number;
  historicalBaselineLiters: number;
  confidencePercent: number;
}

export interface WhatIfScenario {
  id: string;
  name: string;
  timestamp: string;
  consumptionMultiplier: number;
  flowRateMultiplier: number;
  pressureBar: number;
  tankCapacityLiters: number;
  pumpHoursPerDay: number;
  irrigationReductionPercent: number;
  occupantChangePercent: number;
  leakageMitigationPercent: number;
  conservationTargetPercent: number;
  results: {
    originalDailyConsumption: number;
    simulatedDailyConsumption: number;
    dailySavingLiters: number;
    monthlySavingLiters: number;
    annualSavingLiters: number;
    costSavingsUsd: number;
    energySavedKwh: number;
    co2SavedKg: number;
  };
}

export interface MaintenanceTask {
  id: string;
  title?: string;
  assetId?: string;
  assetName: string;
  buildingId?: string;
  buildingName?: string;
  type?: 'INSPECTION' | 'VALVE_REPAIR' | 'PIPE_REPLACEMENT' | 'PUMP_OVERHAUL' | 'SENSOR_CALIBRATION';
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  status: 'NEW' | 'ASSIGNED' | 'IN_PROGRESS' | 'RESOLVED';
  assignedTo?: string;
  reportedDate?: string;
  dueDate?: string;
  suspectedLocation?: string;
  estimatedCostUsd?: number;
  description?: string;
  notes?: string;
  resolutionReport?: string;
}

export interface Recommendation {
  id: string;
  title: string;
  description: string;
  category: string;
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  estimatedSavingsLitersPerDay: number;
  estimatedCostSavingsUsdYear: number;
  effort: string;
  paybackPeriodMonths: number;
  status: 'PENDING' | 'APPLIED' | 'DISMISSED';
}

export type AuditLogEntry = AuditLogItem;

export interface SustainabilityGoal {
  id: string;
  title: string;
  targetReductionPercent: number;
  baselineLitersMonth: number;
  targetLitersMonth: number;
  currentLitersMonth: number;
  progressPercent: number;
  startDate: string;
  endDate: string;
  status: 'ON_TRACK' | 'AT_RISK' | 'EXCEEDED' | 'COMPLETED';
}

export interface ConservationBadge {
  id: string;
  title: string;
  description: string;
  iconName: string;
  unlocked: boolean;
  unlockedDate?: string;
  points: number;
}

export interface AuditLogItem {
  id: string;
  timestamp: string;
  userId: string;
  userName: string;
  userRole: UserRole;
  action: string;
  details: string;
  category: 'CONFIG' | 'ALERT' | 'MAINTENANCE' | 'SIMULATION' | 'SECURITY';
}

export type SensitivityPreset = 'aggressive' | 'standard' | 'conservative' | 'custom';

export interface BatteryThresholdConfig {
  lowBatteryThresholdPercent: number; // custom threshold e.g. 40%
  criticalBatteryThresholdPercent: number; // custom critical threshold e.g. 20%
  headerMaintenanceAlertActive: boolean; // toggle header maintenance alert
  autoDispatchBatteryWorkOrder: boolean; // auto-dispatch work order when battery breached
  soundAlarmOnCritical: boolean;
  leadTimeDaysTarget: number; // e.g. 5 days advance warning
  updatedAt: string;
  updatedBy: string;
}

export interface LeakThresholdConfig {
  preset: SensitivityPreset;
  pressureDropBar: number; // e.g. 0.40 bar drop trigger
  nightFlowExceedancePercent: number; // e.g. 40% above baseline
  continuousFlowDurationMinutes: number; // e.g. 30 mins
  acousticVibrationThresholdDb: number; // e.g. 62 dB
  minConfidencePercent: number; // e.g. 75%
  autoTripIsolationValve: boolean;
  autoDispatchWorkOrder: boolean;
  alertChannels: ('in_app' | 'email' | 'sms' | 'webhook')[];
  buildingOverrides: Record<string, { multiplier: number; name: string }>;
  lowBatteryThresholdPercent?: number;
  criticalBatteryThresholdPercent?: number;
  headerMaintenanceAlertActive?: boolean;
  autoDispatchBatteryWorkOrder?: boolean;
  updatedAt: string;
  updatedBy: string;
}

export interface ThresholdTestResult {
  simulatedAlertsCount: number;
  criticalEventsCount: number;
  falsePositiveSuppressionRate: number;
  estimatedDetectionSpeedMinutes: number;
  impactSummary: string;
}
