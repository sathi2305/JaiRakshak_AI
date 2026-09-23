import {
  Campus,
  Building,
  Zone,
  Pipeline,
  Sensor,
  WaterTelemetryReading,
  WaterQualityReading,
  SmartAlert,
  SmartRecommendation,
  DemandForecastPoint,
  MaintenanceTask,
  SustainabilityGoal,
  ConservationBadge,
  AuditLogItem,
  User,
  WhatIfScenario
} from '../types';

export const INITIAL_USERS: User[] = [
  {
    id: 'usr-1',
    name: 'Sathiyamoorthi Saravanan',
    email: 'sathiyamoorthisaravanan2006@gmail.com',
    role: 'admin',
    avatar: 'SS',
    provider: 'google'
  },
  {
    id: 'usr-2',
    name: 'Plant Operator',
    email: 'operator@jalrakshak.org',
    role: 'user',
    avatar: 'PO',
    provider: 'email'
  }
];

export const INITIAL_CAMPUSES: Campus[] = [
  {
    id: 'camp-1',
    name: 'Indira Innovation Tech Campus',
    code: 'IITC-01',
    location: 'Bengaluru Smart City Corridor',
    coordinates: { lat: 12.9716, lng: 77.5946 },
    buildingsCount: 5,
    totalOccupancy: 4250
  },
  {
    id: 'camp-2',
    name: 'Vedic Eco-Science Research Park',
    code: 'VERP-02',
    location: 'Pune Sustainability Valley',
    coordinates: { lat: 18.5204, lng: 73.8567 },
    buildingsCount: 3,
    totalOccupancy: 1850
  }
];

export const INITIAL_BUILDINGS: Building[] = [
  {
    id: 'bld-1',
    campusId: 'camp-1',
    name: 'Block A — Advanced Computing & Robotics',
    code: 'BLK-A',
    floors: 6,
    occupancy: 1400,
    type: 'laboratory',
    todayConsumptionLiters: 12480,
    yesterdayConsumptionLiters: 13620,
    baselineHourlyAvg: 540,
    currentFlowRate: 48.5,
    currentPressure: 3.8,
    tankLevelPercent: 78,
    leakageRiskPercent: 87,
    riskLevel: 'HIGH',
    efficiencyScore: 74,
    activeAlertsCount: 2,
    coordinates: { x: 28, y: 35 }
  },
  {
    id: 'bld-2',
    campusId: 'camp-1',
    name: 'Block B — BioTech Innovation Center',
    code: 'BLK-B',
    floors: 5,
    occupancy: 950,
    type: 'laboratory',
    todayConsumptionLiters: 9850,
    yesterdayConsumptionLiters: 9720,
    baselineHourlyAvg: 410,
    currentFlowRate: 32.1,
    currentPressure: 4.1,
    tankLevelPercent: 85,
    leakageRiskPercent: 18,
    riskLevel: 'LOW',
    efficiencyScore: 89,
    activeAlertsCount: 0,
    coordinates: { x: 55, y: 25 }
  },
  {
    id: 'bld-3',
    campusId: 'camp-1',
    name: 'Block C — Administrative Complex & Auditorium',
    code: 'BLK-C',
    floors: 4,
    occupancy: 650,
    type: 'administrative',
    todayConsumptionLiters: 5320,
    yesterdayConsumptionLiters: 5890,
    baselineHourlyAvg: 230,
    currentFlowRate: 18.4,
    currentPressure: 3.9,
    tankLevelPercent: 92,
    leakageRiskPercent: 12,
    riskLevel: 'NORMAL',
    efficiencyScore: 94,
    activeAlertsCount: 0,
    coordinates: { x: 42, y: 65 }
  },
  {
    id: 'bld-4',
    campusId: 'camp-1',
    name: 'Block D — Green Hostel & Dining Hall',
    code: 'BLK-D',
    floors: 8,
    occupancy: 1100,
    type: 'residential',
    todayConsumptionLiters: 18900,
    yesterdayConsumptionLiters: 19400,
    baselineHourlyAvg: 790,
    currentFlowRate: 64.2,
    currentPressure: 3.2,
    tankLevelPercent: 62,
    leakageRiskPercent: 44,
    riskLevel: 'MEDIUM',
    efficiencyScore: 81,
    activeAlertsCount: 1,
    coordinates: { x: 75, y: 55 }
  },
  {
    id: 'bld-5',
    campusId: 'camp-1',
    name: 'Central Water Utility & RO Plant',
    code: 'UTIL-01',
    floors: 2,
    occupancy: 150,
    type: 'utility',
    todayConsumptionLiters: 24500,
    yesterdayConsumptionLiters: 26100,
    baselineHourlyAvg: 1050,
    currentFlowRate: 98.6,
    currentPressure: 4.5,
    tankLevelPercent: 91,
    leakageRiskPercent: 24,
    riskLevel: 'LOW',
    efficiencyScore: 92,
    activeAlertsCount: 0,
    coordinates: { x: 18, y: 78 }
  }
];

export const INITIAL_ZONES: Zone[] = [
  {
    id: 'zn-101',
    buildingId: 'bld-1',
    name: 'Ground Floor Server HVAC & Chiller Loop',
    floor: 0,
    pipelineId: 'pipe-101',
    sensorIds: ['sens-101', 'sens-102'],
    currentFlowRate: 18.2,
    currentPressure: 3.9,
    leakageRiskPercent: 14,
    riskLevel: 'NORMAL'
  },
  {
    id: 'zn-102',
    buildingId: 'bld-1',
    name: 'Floor 2 Wet Chemistry Labs & Washrooms',
    floor: 2,
    pipelineId: 'pipe-102',
    sensorIds: ['sens-103', 'sens-104'],
    currentFlowRate: 22.4,
    currentPressure: 2.7,
    leakageRiskPercent: 91,
    riskLevel: 'CRITICAL'
  },
  {
    id: 'zn-103',
    buildingId: 'bld-1',
    name: 'Floor 4 Micro-Robotics & Sanitary Wing',
    floor: 4,
    pipelineId: 'pipe-103',
    sensorIds: ['sens-105'],
    currentFlowRate: 7.9,
    currentPressure: 3.7,
    leakageRiskPercent: 21,
    riskLevel: 'LOW'
  },
  {
    id: 'zn-201',
    buildingId: 'bld-2',
    name: 'Cell Culture Cleanroom Supply',
    floor: 1,
    pipelineId: 'pipe-201',
    sensorIds: ['sens-201'],
    currentFlowRate: 14.5,
    currentPressure: 4.1,
    leakageRiskPercent: 12,
    riskLevel: 'NORMAL'
  },
  {
    id: 'zn-401',
    buildingId: 'bld-4',
    name: 'Kitchen & Cafeteria Dishwashing Main',
    floor: 1,
    pipelineId: 'pipe-401',
    sensorIds: ['sens-401'],
    currentFlowRate: 35.8,
    currentPressure: 3.1,
    leakageRiskPercent: 48,
    riskLevel: 'MEDIUM'
  }
];

export const INITIAL_PIPELINES: Pipeline[] = [
  {
    id: 'pipe-101',
    buildingId: 'bld-1',
    code: 'P-101-HVAC',
    name: 'Chiller Feed Loop A',
    material: 'SS 316 Stainless Steel',
    diameterMm: 80,
    installYear: 2021,
    lengthMeters: 145,
    healthScore: 92,
    failureRisk: 'NORMAL',
    lastInspectionDate: '2026-06-15',
    pressureTrend: 'stable'
  },
  {
    id: 'pipe-102',
    buildingId: 'bld-1',
    code: 'P-104-LAB',
    name: 'Zone 2 Lab Distribution Risers',
    material: 'CPVC High Grade',
    diameterMm: 50,
    installYear: 2018,
    lengthMeters: 85,
    healthScore: 68,
    failureRisk: 'HIGH',
    lastInspectionDate: '2026-01-10',
    pressureTrend: 'declining'
  },
  {
    id: 'pipe-103',
    buildingId: 'bld-1',
    code: 'P-103-UPPER',
    name: 'Upper Floors Distribution',
    material: 'PPR-C Polypropylene',
    diameterMm: 40,
    installYear: 2022,
    lengthMeters: 110,
    healthScore: 95,
    failureRisk: 'NORMAL',
    lastInspectionDate: '2026-07-20',
    pressureTrend: 'stable'
  },
  {
    id: 'pipe-401',
    buildingId: 'bld-4',
    code: 'P-401-KITCHEN',
    name: 'Hostel Dining Hot & Cold Feeder',
    material: 'Galvanized Iron / CPVC',
    diameterMm: 65,
    installYear: 2017,
    lengthMeters: 92,
    healthScore: 73,
    failureRisk: 'MEDIUM',
    lastInspectionDate: '2026-03-05',
    pressureTrend: 'declining'
  }
];

export const INITIAL_SENSORS: Sensor[] = [
  {
    id: 'sens-101',
    code: 'FLW-101',
    name: 'Main Inflow Ultrasonic Meter',
    type: 'flow',
    buildingId: 'bld-1',
    zoneId: 'zn-101',
    pipelineId: 'pipe-101',
    status: 'ONLINE',
    batteryPercent: 98,
    powerSource: 'battery_solar',
    batterySpecs: 'LiFePO4 3.2V 3200mAh + 2W Solar Harvester',
    estimatedBatteryDaysRemaining: 420,
    signalDbm: -62,
    lastReadingTime: new Date().toISOString(),
    readingFrequencySeconds: 5,
    errorCount: 0,
    dataQualityPercent: 99,
    qualityIssues: []
  },
  {
    id: 'sens-102',
    code: 'PRS-102',
    name: 'Chiller Feed Pressure Transducer',
    type: 'pressure',
    buildingId: 'bld-1',
    zoneId: 'zn-101',
    pipelineId: 'pipe-101',
    status: 'ONLINE',
    batteryPercent: 94,
    powerSource: 'battery_primary',
    batterySpecs: 'ER14505 Li-SOCl2 3.6V AA Cell',
    estimatedBatteryDaysRemaining: 280,
    signalDbm: -68,
    lastReadingTime: new Date().toISOString(),
    readingFrequencySeconds: 5,
    errorCount: 1,
    dataQualityPercent: 97,
    qualityIssues: []
  },
  {
    id: 'sens-103',
    code: 'FLW-104',
    name: 'Zone B Lab Sub-Meter',
    type: 'flow',
    buildingId: 'bld-1',
    zoneId: 'zn-102',
    pipelineId: 'pipe-102',
    status: 'ONLINE',
    batteryPercent: 88,
    powerSource: 'battery_primary',
    batterySpecs: 'ER26500 Li-SOCl2 3.6V C-Cell',
    estimatedBatteryDaysRemaining: 195,
    signalDbm: -72,
    lastReadingTime: new Date().toISOString(),
    readingFrequencySeconds: 5,
    errorCount: 2,
    dataQualityPercent: 92,
    qualityIssues: ['Unusual continuous night flow detected']
  },
  {
    id: 'sens-104',
    code: 'PRS-104',
    name: 'Floor 2 Pressure Sensor',
    type: 'pressure',
    buildingId: 'bld-1',
    zoneId: 'zn-102',
    pipelineId: 'pipe-102',
    status: 'ONLINE',
    batteryPercent: 84,
    powerSource: 'battery_primary',
    batterySpecs: 'ER14505 Li-SOCl2 3.6V AA Cell',
    estimatedBatteryDaysRemaining: 160,
    signalDbm: -75,
    lastReadingTime: new Date().toISOString(),
    readingFrequencySeconds: 5,
    errorCount: 3,
    dataQualityPercent: 89,
    qualityIssues: ['Pressure drop 18% below baseline']
  },
  {
    id: 'sens-105',
    code: 'TNK-101',
    name: 'Block A Rooftop Water Tank Level',
    type: 'tank_level',
    buildingId: 'bld-1',
    status: 'ONLINE',
    batteryPercent: 100,
    powerSource: 'battery_solar',
    batterySpecs: '18650 Li-ion 3.7V + 5W Photovoltaic Panel',
    estimatedBatteryDaysRemaining: 550,
    signalDbm: -58,
    lastReadingTime: new Date().toISOString(),
    readingFrequencySeconds: 10,
    errorCount: 0,
    dataQualityPercent: 100,
    qualityIssues: []
  },
  {
    id: 'sens-106',
    code: 'WQL-101',
    name: 'Main Inlet Potable Quality Monitor',
    type: 'water_quality',
    buildingId: 'bld-1',
    status: 'ONLINE',
    batteryPercent: 92,
    powerSource: 'mains_powered',
    batterySpecs: 'Mains 24V DC + Internal 1200mAh UPS Backup',
    estimatedBatteryDaysRemaining: 365,
    signalDbm: -64,
    lastReadingTime: new Date().toISOString(),
    readingFrequencySeconds: 15,
    errorCount: 0,
    dataQualityPercent: 98,
    qualityIssues: []
  },
  {
    id: 'sens-107',
    code: 'ACS-102',
    name: 'Remote Acoustic Pipe Noise Logger',
    type: 'acoustic_leak',
    buildingId: 'bld-1',
    zoneId: 'zn-102',
    pipelineId: 'pipe-102',
    status: 'DEGRADED',
    batteryPercent: 18,
    powerSource: 'battery_primary',
    batterySpecs: 'ER34615 Li-SOCl2 3.6V D-Cell (19Ah)',
    estimatedBatteryDaysRemaining: 2.1,
    lowPowerAlertDispatched: true,
    signalDbm: -89,
    lastReadingTime: new Date().toISOString(),
    readingFrequencySeconds: 15,
    errorCount: 8,
    dataQualityPercent: 68,
    qualityIssues: ['CRITICAL LOW VOLTAGE (3.05V)', 'Transmission intervals throttled to 15s to conserve power']
  },
  {
    id: 'sens-201',
    code: 'FLW-201',
    name: 'BioTech Main Meter',
    type: 'flow',
    buildingId: 'bld-2',
    zoneId: 'zn-201',
    status: 'ONLINE',
    batteryPercent: 91,
    powerSource: 'battery_primary',
    batterySpecs: 'ER26500 Li-SOCl2 3.6V C-Cell',
    estimatedBatteryDaysRemaining: 210,
    signalDbm: -65,
    lastReadingTime: new Date().toISOString(),
    readingFrequencySeconds: 5,
    errorCount: 0,
    dataQualityPercent: 99,
    qualityIssues: []
  },
  {
    id: 'sens-301',
    code: 'PRS-301',
    name: 'Admin Complex PRV Pressure Node',
    type: 'pressure',
    buildingId: 'bld-3',
    zoneId: 'zn-301',
    pipelineId: 'pipe-301',
    status: 'ONLINE',
    batteryPercent: 46,
    powerSource: 'battery_primary',
    batterySpecs: 'ER14505 Li-SOCl2 3.6V AA Cell',
    estimatedBatteryDaysRemaining: 18.5,
    signalDbm: -78,
    lastReadingTime: new Date().toISOString(),
    readingFrequencySeconds: 10,
    errorCount: 1,
    dataQualityPercent: 95,
    qualityIssues: ['Approaching maintenance threshold (<50%)']
  },
  {
    id: 'sens-401',
    code: 'FLW-401',
    name: 'Hostel Dining Flow Meter',
    type: 'flow',
    buildingId: 'bld-4',
    zoneId: 'zn-401',
    pipelineId: 'pipe-401',
    status: 'DEGRADED',
    batteryPercent: 34,
    powerSource: 'battery_primary',
    batterySpecs: 'ER34615 Li-SOCl2 3.6V D-Cell (19Ah)',
    estimatedBatteryDaysRemaining: 5.4,
    lowPowerAlertDispatched: true,
    signalDbm: -88,
    lastReadingTime: new Date().toISOString(),
    readingFrequencySeconds: 10,
    errorCount: 14,
    dataQualityPercent: 72,
    qualityIssues: ['14 missing readings in last 24h', 'Battery low (34%) — replacement scheduled']
  }
];

export const INITIAL_ALERTS: SmartAlert[] = [
  {
    id: 'alt-1',
    timestamp: new Date(Date.now() - 38 * 60000).toISOString(),
    type: 'LEAKAGE_RISK',
    severity: 'HIGH',
    buildingId: 'bld-1',
    buildingName: 'Block A — Advanced Computing & Robotics',
    zoneName: 'Floor 2 Wet Chemistry Labs & Washrooms',
    sensorId: 'sens-103',
    reason: 'Unexpected continuous night-time flow + 18% pressure drop on Pipeline P-104',
    aiConfidencePercent: 91,
    recommendedAction: 'Dispatch maintenance team to inspect Floor 2 Zone B distribution valve between 01:00-04:00 baseline window',
    status: 'NEW',
    estimatedWaterLossLph: 1240,
    whyExplanation: {
      factors: [
        'Flow rate increased +143% above 02:00 AM baseline',
        'Pressure dropped from 3.8 bar to 2.7 bar (-29%)',
        'Continuous flow persisted for 3.5 hours without occupancy',
        'Historical anomaly pattern matches joint seal leakage'
      ],
      baselineValue: '180 L/hour',
      observedValue: '1,420 L/hour',
      historicalDeviationPercent: 688
    }
  },
  {
    id: 'alt-2',
    timestamp: new Date(Date.now() - 110 * 60000).toISOString(),
    type: 'ABNORMAL_CONSUMPTION',
    severity: 'MEDIUM',
    buildingId: 'bld-4',
    buildingName: 'Block D — Green Hostel & Dining Hall',
    zoneName: 'Kitchen & Cafeteria Dishwashing Main',
    sensorId: 'sens-401',
    reason: 'Dishwashing line flow rate exceeded 95th percentile during off-peak hours',
    aiConfidencePercent: 86,
    recommendedAction: 'Check for unclosed commercial booster rinse valves or automatic refill solenoid defect',
    status: 'IN_PROGRESS',
    estimatedWaterLossLph: 450,
    whyExplanation: {
      factors: [
        'Flow rate sustained at 35.8 L/min during 15:00 quiet period',
        'Typical off-peak usage is 8-12 L/min',
        'Sensor battery low, but reading verified against upstream inlet meter'
      ],
      baselineValue: '600 L/hour',
      observedValue: '2,148 L/hour',
      historicalDeviationPercent: 258
    }
  },
  {
    id: 'alt-3',
    timestamp: new Date(Date.now() - 240 * 60000).toISOString(),
    type: 'SENSOR_FAILURE',
    severity: 'LOW',
    buildingId: 'bld-4',
    buildingName: 'Block D — Green Hostel',
    sensorId: 'sens-401',
    reason: 'Sensor battery low (34%) and 14 dropped packets detected in 24 hours',
    aiConfidencePercent: 99,
    recommendedAction: 'Replace CR123A lithium cell and verify LoRaWAN antenna connection',
    status: 'ACKNOWLEDGED',
    whyExplanation: {
      factors: [
        'Battery voltage dropped under 2.8V',
        'Signal attenuation reached -88 dBm',
        'Data quality engine flagged 2 duplicate frame timestamps'
      ],
      baselineValue: '99% uptime',
      observedValue: '72% reliability',
      historicalDeviationPercent: -27
    }
  }
];

export const INITIAL_RECOMMENDATIONS: SmartRecommendation[] = [
  {
    id: 'rec-1',
    title: 'Zone B Pipe Inspection & Pressure Tuning',
    reason: 'High continuous flow detected during night non-occupancy hours (01:00-04:00)',
    priority: 'HIGH',
    expectedImpact: 'Prevent structural water loss and reduce monthly non-revenue water consumption',
    estimatedSavingLpd: 2400,
    actionText: 'Dispatch Inspection Order to Floor 2',
    confidencePercent: 94,
    category: 'LEAKAGE',
    status: 'PENDING',
    buildingId: 'bld-1'
  },
  {
    id: 'rec-2',
    title: 'Shift Chiller Pump Schedule to Off-Peak Grid Hours',
    reason: 'Central RO & Chiller recharge overlaps with peak electricity tariff window (18:00–21:00)',
    priority: 'MEDIUM',
    expectedImpact: 'Save pumping energy costs and reduce thermal dissipation with no loss in water comfort',
    estimatedSavingLpd: 1200,
    actionText: 'Apply Smart Pump Timing Protocol',
    confidencePercent: 88,
    category: 'PUMP',
    status: 'PENDING',
    buildingId: 'bld-1'
  },
  {
    id: 'rec-3',
    title: 'Dynamic Landscape Irrigation Reduction',
    reason: 'Soil moisture telemetry indicates 78% saturation; forecasted rain in Pune corridor in 18 hours',
    priority: 'LOW',
    expectedImpact: 'Conserve treated greywater storage and avoid topsoil runoff',
    estimatedSavingLpd: 3500,
    actionText: 'Postpone Sprinkler Cycle by 24h',
    confidencePercent: 96,
    category: 'IRRIGATION',
    status: 'PENDING'
  },
  {
    id: 'rec-4',
    title: 'Replace Degraded Sensor FLW-401',
    reason: 'Data quality fallen to 72% with packet loss impacting anomaly detection precision',
    priority: 'MEDIUM',
    expectedImpact: 'Restores 99.8% measurement fidelity for hostel dining water audit',
    estimatedSavingLpd: 600,
    actionText: 'Assign Sensor Battery Service',
    confidencePercent: 99,
    category: 'SENSOR',
    status: 'PENDING',
    buildingId: 'bld-4'
  }
];

export const INITIAL_MAINTENANCE_TASKS: MaintenanceTask[] = [
  {
    id: 'mnt-101',
    assetId: 'pipe-102',
    assetName: 'Zone 2 Lab Distribution Risers (P-104-LAB)',
    buildingId: 'bld-1',
    buildingName: 'Block A — Advanced Computing',
    type: 'INSPECTION',
    priority: 'HIGH',
    status: 'ASSIGNED',
    assignedTo: 'Vikram Singh',
    reportedDate: '2026-09-17',
    dueDate: '2026-09-19',
    suspectedLocation: 'Block A, Floor 2, Ceiling Service Plenum above Lab 204',
    notes: 'Acoustic leak signature suggests micro-fissure near 90-degree CPVC elbow fitting.'
  },
  {
    id: 'mnt-102',
    assetId: 'sens-401',
    assetName: 'Hostel Dining Flow Meter (FLW-401)',
    buildingId: 'bld-4',
    buildingName: 'Block D — Green Hostel',
    type: 'SENSOR_CALIBRATION',
    priority: 'MEDIUM',
    status: 'IN_PROGRESS',
    assignedTo: 'Vikram Singh',
    reportedDate: '2026-09-16',
    dueDate: '2026-09-20',
    suspectedLocation: 'Block D Ground Level Metering Vault',
    notes: 'Battery replacement and re-zeroing of ultrasonic transducer.'
  },
  {
    id: 'mnt-103',
    assetId: 'pipe-401',
    assetName: 'Hostel Dining Hot & Cold Feeder (P-401)',
    buildingId: 'bld-4',
    buildingName: 'Block D — Green Hostel',
    type: 'VALVE_REPAIR',
    priority: 'MEDIUM',
    status: 'NEW',
    reportedDate: '2026-09-17',
    dueDate: '2026-09-22',
    suspectedLocation: 'Main Dining Kitchen Utility Manifold',
    notes: 'Pressure regulator diaphragm seal showing wear.'
  }
];

export const INITIAL_SUSTAINABILITY_GOALS: SustainabilityGoal[] = [
  {
    id: 'goal-1',
    title: 'Reduce Campus Water Consumption by 20%',
    targetReductionPercent: 20,
    baselineLitersMonth: 1000000,
    targetLitersMonth: 800000,
    currentLitersMonth: 845000,
    progressPercent: 77.5,
    startDate: '2026-01-01',
    endDate: '2026-12-31',
    status: 'ON_TRACK'
  },
  {
    id: 'goal-2',
    title: 'Zero Non-Revenue Water Loss from Hidden Leaks',
    targetReductionPercent: 100,
    baselineLitersMonth: 120000,
    targetLitersMonth: 0,
    currentLitersMonth: 28000,
    progressPercent: 76.7,
    startDate: '2026-06-01',
    endDate: '2026-12-31',
    status: 'ON_TRACK'
  },
  {
    id: 'goal-3',
    title: 'Increase Greywater Recycling Ratio to 45%',
    targetReductionPercent: 45,
    baselineLitersMonth: 150000,
    targetLitersMonth: 450000,
    currentLitersMonth: 390000,
    progressPercent: 80.0,
    startDate: '2026-03-01',
    endDate: '2026-10-31',
    status: 'ON_TRACK'
  }
];

export const INITIAL_BADGES: ConservationBadge[] = [
  {
    id: 'bdg-1',
    title: 'Leak Hunter',
    description: 'Identified and repaired a high-risk hidden leak within 24 hours of AI detection.',
    iconName: 'SearchCheck',
    unlocked: true,
    unlockedDate: '2026-08-14',
    points: 450
  },
  {
    id: 'bdg-2',
    title: 'Water Guardian',
    description: 'Maintained zero water overflow incidents across all rooftop tanks for 90 days.',
    iconName: 'ShieldCheck',
    unlocked: true,
    unlockedDate: '2026-09-01',
    points: 800
  },
  {
    id: 'bdg-3',
    title: 'Zero Overflow',
    description: 'Successfully automated pump cut-off logic preventing 15,000L of tank overflow.',
    iconName: 'Droplets',
    unlocked: true,
    unlockedDate: '2026-07-28',
    points: 600
  },
  {
    id: 'bdg-4',
    title: 'Conservation Champion',
    description: 'Exceeded monthly campus conservation target by saving over 150,000 Liters.',
    iconName: 'Award',
    unlocked: false,
    points: 1200
  }
];

export const INITIAL_AUDIT_LOGS: AuditLogItem[] = [
  {
    id: 'aud-1',
    timestamp: '2026-09-17 21:15:30',
    userId: 'usr-1',
    userName: 'Sathiyamoorthi Saravanan',
    userRole: 'admin',
    action: 'Updated Anomaly Z-Score Sensitivity Threshold',
    details: 'Changed threshold from 2.5 sigma to 2.2 sigma for Block A wet lab pipelines.',
    category: 'CONFIG'
  },
  {
    id: 'aud-2',
    timestamp: '2026-09-17 19:40:12',
    userId: 'usr-2',
    userName: 'Plant Operator',
    userRole: 'user',
    action: 'Acknowledged Leakage Alert ALT-1',
    details: 'Flagged Floor 2 Zone B lab pipeline for physical inspection within 24h.',
    category: 'ALERT'
  },
  {
    id: 'aud-3',
    timestamp: '2026-09-17 16:20:00',
    userId: 'usr-2',
    userName: 'Plant Operator',
    userRole: 'user',
    action: 'Dispatched Inspection Order MNT-101',
    details: 'Assigned thermal camera and acoustic pipe stethoscope audit for P-104-LAB.',
    category: 'MAINTENANCE'
  },
  {
    id: 'aud-4',
    timestamp: '2026-09-17 14:10:45',
    userId: 'usr-1',
    userName: 'Sathiyamoorthi Saravanan',
    userRole: 'admin',
    action: 'Executed What-If Digital Twin Simulation',
    details: 'Ran 15% campus conservation scenario; projected 90,000 L/month savings.',
    category: 'SIMULATION'
  }
];

// 24 Hour Historical Readings for charts
export function generateHistoricalReadings(hours = 24): {
  hour: string;
  actualLiters: number;
  baselineLiters: number;
  flowRateLpm: number;
  pressureBar: number;
  leakRiskPercent: number;
}[] {
  const result = [];
  const now = new Date();
  
  for (let i = hours - 1; i >= 0; i--) {
    const d = new Date(now.getTime() - i * 3600000);
    const hourVal = d.getHours();
    const timeLabel = `${hourVal.toString().padStart(2, '0')}:00`;
    
    // Baseline pattern: low at night (01:00-05:00), peaks at 09:00-11:00 and 17:00-19:00
    let base = 250;
    if (hourVal >= 1 && hourVal <= 5) {
      base = 120 + Math.sin(hourVal) * 20;
    } else if (hourVal >= 8 && hourVal <= 12) {
      base = 720 + Math.sin(hourVal) * 110;
    } else if (hourVal >= 13 && hourVal <= 16) {
      base = 560 + Math.sin(hourVal) * 60;
    } else if (hourVal >= 17 && hourVal <= 21) {
      base = 690 + Math.sin(hourVal) * 80;
    } else {
      base = 340;
    }
    
    // Inject anomaly in recent 4 hours (representing current suspected leak)
    let actual = base + (Math.random() * 40 - 20);
    let leakRisk = 12;
    let pressure = 3.9 + (Math.random() * 0.2 - 0.1);
    
    if (i <= 4) {
      // leak anomaly
      actual += 380;
      leakRisk = 75 + i * 3;
      pressure -= 0.8;
    }

    result.push({
      hour: timeLabel,
      actualLiters: Math.round(actual),
      baselineLiters: Math.round(base),
      flowRateLpm: Number((actual / 60).toFixed(1)),
      pressureBar: Number(pressure.toFixed(2)),
      leakRiskPercent: Math.min(100, Math.round(leakRisk))
    });
  }
  return result;
}

// Generate Forecast for 24h, 7d, 30d
export function generateDemandForecast(horizon: '24h' | '7d' | '30d'): DemandForecastPoint[] {
  const points: DemandForecastPoint[] = [];
  const now = new Date();
  const count = horizon === '24h' ? 24 : horizon === '7d' ? 7 : 30;
  
  for (let i = 1; i <= count; i++) {
    let timestamp = '';
    let base = 16500;
    
    if (horizon === '24h') {
      const d = new Date(now.getTime() + i * 3600000);
      timestamp = `${d.getHours().toString().padStart(2, '0')}:00`;
      const h = d.getHours();
      base = (h >= 1 && h <= 5) ? 450 : (h >= 8 && h <= 18) ? 1400 : 750;
    } else if (horizon === '7d') {
      const d = new Date(now.getTime() + i * 86400000);
      timestamp = d.toLocaleDateString('en-US', { weekday: 'short', month: 'numeric', day: 'numeric' });
      const isWeekend = d.getDay() === 0 || d.getDay() === 6;
      base = isWeekend ? 11200 : 18420;
    } else {
      const d = new Date(now.getTime() + i * 86400000);
      timestamp = `${d.getMonth() + 1}/${d.getDate()}`;
      base = 17800 + Math.sin(i * 0.4) * 2100;
    }

    const noise = (Math.random() - 0.5) * (base * 0.04);
    const predicted = Math.round(base + noise);
    const margin = Math.round(predicted * 0.075);
    
    points.push({
      timestamp,
      predictedDemandLiters: predicted,
      minExpectedLiters: predicted - margin,
      maxExpectedLiters: predicted + margin,
      historicalBaselineLiters: Math.round(base),
      confidencePercent: Math.round(92 - (i / count) * 8)
    });
  }
  return points;
}
