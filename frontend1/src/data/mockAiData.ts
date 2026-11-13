import {
  AIPrediction,
  VehicleRiskScoreItem,
  AIProviderConfigItem,
  AIInferenceLogItem,
  AIOverviewStats
} from '../types/ai';

export const INITIAL_AI_PREDICTIONS: AIPrediction[] = [
  {
    id: 'ai-pred-001',
    vehicleId: 'veh-001',
    vehiclePlate: 'KDM 482X',
    vehicleMake: 'Toyota',
    vehicleModel: 'Land Cruiser Prado',
    predictionType: 'theft',
    title: 'Possible Theft Detected: Unauthorized Flatbed Towing',
    riskScore: 94,
    riskLevel: 'critical',
    confidenceScore: 0.96,
    aiExplanation: 'Vehicle KDM 482X is moving at 38 km/h along Mombasa Rd while the ignition switch is confirmed OFF. IMU sensors show continuous linear forward momentum without standard engine block vibrations (0.04g vs expected 0.35g). High probability of unauthorized towing or flatbed transport.',
    recommendedActions: [
      'Call registered owner (David Kamau) immediately to confirm vehicle transport authorization.',
      'Switch VSCU device to High-Frequency Emergency Tracking mode (5s beacon).',
      'Alert Nairobi Highway Patrol unit with current GPS vector.',
      'Remote immobilization safety gate ready: vehicle speed is currently > 5 km/h (safety lock active).'
    ],
    contributingFactors: {
      speedKmh: 38,
      ignitionOn: false,
      geofenceBreach: true,
      vibrationG: 0.04,
      modality: 'towing'
    },
    rawTelemetrySnapshot: {
      speed: 38,
      ignition: 0,
      vibration_rms: 0.04,
      battery_voltage: 12.6,
      heading: 142,
      lat: -1.2921,
      lng: 36.8219
    },
    status: 'pending',
    providerUsed: 'gemini',
    modelVersion: 'gemini-2.5-flash',
    inferenceLatencyMs: 240,
    createdAt: '3 mins ago'
  },
  {
    id: 'ai-pred-002',
    vehicleId: 'veh-002',
    vehiclePlate: 'KDE 910T',
    vehicleMake: 'Isuzu',
    vehicleModel: 'FRR Commercial Truck',
    predictionType: 'crash',
    title: 'Crash Alert: Severe Kinetic Impact Detected (6.8g)',
    riskScore: 98,
    riskLevel: 'critical',
    confidenceScore: 0.97,
    aiExplanation: 'Catastrophic kinetic energy dissipation: Peak IMU acceleration of 6.8g with an instantaneous deceleration delta of 52 km/h across 220ms on Northern Bypass. Gyroscope telemetry indicates 46° vehicle tilt. Multi-axis collision with high probability of chassis deformation.',
    recommendedActions: [
      'IMMEDIATE: Dispatch Kenya Red Cross EMS and Traffic Police to Northern Bypass coordinates.',
      'Establish open cabin microphone audio connection to check driver responsiveness.',
      'Notify fleet logistics manager (Sarah Wanjiku).',
      'Lock GNSS beacon into priority emergency broadcast mode.'
    ],
    contributingFactors: {
      peakGForce: 6.8,
      speedDropKmh: 52,
      tiltDegrees: 46,
      severityTier: 'severe_impact'
    },
    rawTelemetrySnapshot: {
      peak_g: 6.8,
      speed_before: 68,
      speed_after: 16,
      delta_ms: 220,
      tilt_deg: 46,
      airbag_signal: 1
    },
    status: 'investigating',
    assignedOperator: 'admin@smrod.ai',
    providerUsed: 'gemini',
    modelVersion: 'gemini-2.5-flash',
    inferenceLatencyMs: 215,
    createdAt: '18 mins ago',
    acknowledgedAt: '15 mins ago'
  },
  {
    id: 'ai-pred-003',
    vehicleId: 'veh-003',
    vehiclePlate: 'KDG 311P',
    vehicleMake: 'Mercedes-Benz',
    vehicleModel: 'Actros 3340 Prime Mover',
    predictionType: 'theft',
    title: 'Theft Alert: Night Perimeter Geofence Breach',
    riskScore: 82,
    riskLevel: 'high',
    confidenceScore: 0.91,
    aiExplanation: 'Vehicle departed the Inland Container Depot geofence at 02:45 AM without a validated dispatch manifest or scheduled shift. Speed increased from 0 to 64 km/h heading toward Namanga Border corridor.',
    recommendedActions: [
      'Challenge driver via in-cab telematics terminal.',
      'Notify port security authority of unmanifested container departure.',
      'Verify speed status for safe immobilization window.'
    ],
    contributingFactors: {
      speedKmh: 64,
      ignitionOn: true,
      geofenceBreach: true,
      modality: 'unauthorized_driver'
    },
    rawTelemetrySnapshot: {
      speed: 64,
      ignition: 1,
      geofence_id: 'geo-001',
      dispatch_status: 'unauthorized'
    },
    status: 'acknowledged',
    assignedOperator: 'operations@smrod.ai',
    providerUsed: 'gemini',
    modelVersion: 'gemini-2.5-flash',
    inferenceLatencyMs: 275,
    createdAt: '42 mins ago',
    acknowledgedAt: '35 mins ago'
  },
  {
    id: 'ai-pred-004',
    vehicleId: 'veh-004',
    vehiclePlate: 'KDA 552M',
    vehicleMake: 'Toyota',
    vehicleModel: 'Hilux Double Cabin 4x4',
    predictionType: 'crash',
    title: 'Crash Assistance: Moderate Deceleration Shock (3.8g)',
    riskScore: 72,
    riskLevel: 'high',
    confidenceScore: 0.88,
    aiExplanation: 'IMU accelerometer registered 3.8g lateral shock with a speed drop of 34 km/h on Waiyaki Way. AI contextual analysis confirms vehicle remains upright (tilt < 8°). Likely curb strike or fender bender.',
    recommendedActions: [
      'Contact driver (Michael Ochieng) to verify vehicle operational integrity.',
      'Check if steering alignment or front suspension is compromised.',
      'Operator triage: mark false alarm if caused by deep road hazard/construction barrier.'
    ],
    contributingFactors: {
      peakGForce: 3.8,
      speedDropKmh: 34,
      tiltDegrees: 6,
      severityTier: 'moderate_collision'
    },
    rawTelemetrySnapshot: {
      peak_g: 3.8,
      speed_before: 58,
      speed_after: 24,
      tilt_deg: 6
    },
    status: 'pending',
    providerUsed: 'gemini',
    modelVersion: 'gemini-2.5-flash',
    inferenceLatencyMs: 195,
    createdAt: '1 hour ago'
  },
  {
    id: 'ai-pred-005',
    vehicleId: 'veh-005',
    vehiclePlate: 'KCP 109W',
    vehicleMake: 'Mitsubishi',
    vehicleModel: 'Fuso Canter 4-Ton',
    predictionType: 'risk',
    title: 'Risk Anomaly: Recurrent Off-Hours Ignition Cycling',
    riskScore: 68,
    riskLevel: 'high',
    confidenceScore: 0.85,
    aiExplanation: 'Pattern intelligence identified 9 consecutive ignition attempts between 01:00 AM and 03:00 AM while parked at an unsecured transit lot. VSCU telemetry indicates battery voltage dips down to 11.2V during crank cycles.',
    recommendedActions: [
      'Investigate potential lock-picking or hotwiring attempts.',
      'Dispatch lot security patrol to inspect vehicle perimeter.',
      'Schedule battery and alternator health check.'
    ],
    contributingFactors: {
      ignitionOn: false,
      speedKmh: 0,
      vibrationG: 0.65,
      modality: 'tampering'
    },
    rawTelemetrySnapshot: {
      ignition_cycles_1h: 9,
      voltage_dip: 11.2,
      parking_status: 'unsecured'
    },
    status: 'resolved',
    assignedOperator: 'support@smrod.ai',
    providerUsed: 'gemini',
    modelVersion: 'gemini-2.5-flash',
    inferenceLatencyMs: 230,
    createdAt: '3 hours ago',
    resolvedAt: '1 hour ago'
  },
  {
    id: 'ai-pred-006',
    vehicleId: 'veh-006',
    vehiclePlate: 'KDB 881L',
    vehicleMake: 'Subaru',
    vehicleModel: 'Forester XT AWD',
    predictionType: 'theft',
    title: 'Theft Investigation: High Speed Geofence Exit',
    riskScore: 45,
    riskLevel: 'medium',
    confidenceScore: 0.82,
    aiExplanation: 'Vehicle crossed regional boundary at 82 km/h. Operator audit verified that driver had registered a late cross-county permit, qualifying this alert as an approved operational transit.',
    recommendedActions: [
      'Mark as false positive with operator audit note.',
      'Sync driver electronic trip schedule.'
    ],
    contributingFactors: {
      speedKmh: 82,
      ignitionOn: true,
      geofenceBreach: true,
      modality: 'authorized_transit'
    },
    rawTelemetrySnapshot: {
      speed: 82,
      ignition: 1,
      permit_code: 'EXP-9921'
    },
    status: 'false_positive',
    falsePositiveReason: 'Driver provided authorized regional transit manifest verified with transport supervisor.',
    assignedOperator: 'operations@smrod.ai',
    providerUsed: 'gemini',
    modelVersion: 'gemini-2.5-flash',
    inferenceLatencyMs: 260,
    createdAt: '5 hours ago'
  }
];

export const INITIAL_VEHICLE_RISK_SCORES: VehicleRiskScoreItem[] = [
  {
    id: 'risk-001',
    vehicleId: 'veh-001',
    vehiclePlate: 'KDM 482X',
    vehicleMake: 'Toyota',
    vehicleModel: 'Land Cruiser Prado',
    currentScore: 92,
    category: 'critical',
    primaryRiskFactor: 'Active Unauthorized Towing Incident',
    scoreDelta7d: +45,
    factorBreakdown: {
      theftRisk: { rawScore: 94, weight: 0.35, weightedContribution: 32.9 },
      crashHistory: { rawScore: 40, weight: 0.25, weightedContribution: 10.0 },
      geofenceBreaches: { rawScore: 90, weight: 0.20, weightedContribution: 18.0 },
      sensorTampering: { rawScore: 85, weight: 0.20, weightedContribution: 17.0 }
    },
    lastCalculatedAt: 'Just now'
  },
  {
    id: 'risk-002',
    vehicleId: 'veh-002',
    vehiclePlate: 'KDE 910T',
    vehicleMake: 'Isuzu',
    vehicleModel: 'FRR Commercial Truck',
    currentScore: 88,
    category: 'critical',
    primaryRiskFactor: 'Severe Kinetic Impact (6.8g Collision)',
    scoreDelta7d: +52,
    factorBreakdown: {
      theftRisk: { rawScore: 20, weight: 0.35, weightedContribution: 7.0 },
      crashHistory: { rawScore: 98, weight: 0.25, weightedContribution: 24.5 },
      geofenceBreaches: { rawScore: 60, weight: 0.20, weightedContribution: 12.0 },
      sensorTampering: { rawScore: 92, weight: 0.20, weightedContribution: 18.4 }
    },
    lastCalculatedAt: '15 mins ago'
  },
  {
    id: 'risk-003',
    vehicleId: 'veh-003',
    vehiclePlate: 'KDG 311P',
    vehicleMake: 'Mercedes-Benz',
    vehicleModel: 'Actros 3340 Prime Mover',
    currentScore: 76,
    category: 'high',
    primaryRiskFactor: 'Night Perimeter Geofence Breach',
    scoreDelta7d: +18,
    factorBreakdown: {
      theftRisk: { rawScore: 82, weight: 0.35, weightedContribution: 28.7 },
      crashHistory: { rawScore: 15, weight: 0.25, weightedContribution: 3.8 },
      geofenceBreaches: { rawScore: 85, weight: 0.20, weightedContribution: 17.0 },
      sensorTampering: { rawScore: 35, weight: 0.20, weightedContribution: 7.0 }
    },
    lastCalculatedAt: '35 mins ago'
  },
  {
    id: 'risk-004',
    vehicleId: 'veh-004',
    vehiclePlate: 'KDA 552M',
    vehicleMake: 'Toyota',
    vehicleModel: 'Hilux Double Cabin 4x4',
    currentScore: 64,
    category: 'high',
    primaryRiskFactor: 'Moderate Deceleration Shock (3.8g)',
    scoreDelta7d: +12,
    factorBreakdown: {
      theftRisk: { rawScore: 25, weight: 0.35, weightedContribution: 8.8 },
      crashHistory: { rawScore: 72, weight: 0.25, weightedContribution: 18.0 },
      geofenceBreaches: { rawScore: 30, weight: 0.20, weightedContribution: 6.0 },
      sensorTampering: { rawScore: 40, weight: 0.20, weightedContribution: 8.0 }
    },
    lastCalculatedAt: '1 hour ago'
  },
  {
    id: 'risk-005',
    vehicleId: 'veh-005',
    vehiclePlate: 'KCP 109W',
    vehicleMake: 'Mitsubishi',
    vehicleModel: 'Fuso Canter 4-Ton',
    currentScore: 38,
    category: 'medium',
    primaryRiskFactor: 'Off-Hours Auxiliary Battery Dips',
    scoreDelta7d: -8,
    factorBreakdown: {
      theftRisk: { rawScore: 30, weight: 0.35, weightedContribution: 10.5 },
      crashHistory: { rawScore: 10, weight: 0.25, weightedContribution: 2.5 },
      geofenceBreaches: { rawScore: 20, weight: 0.20, weightedContribution: 4.0 },
      sensorTampering: { rawScore: 45, weight: 0.20, weightedContribution: 9.0 }
    },
    lastCalculatedAt: '2 hours ago'
  },
  {
    id: 'risk-006',
    vehicleId: 'veh-006',
    vehiclePlate: 'KDB 881L',
    vehicleMake: 'Subaru',
    vehicleModel: 'Forester XT AWD',
    currentScore: 18,
    category: 'low',
    primaryRiskFactor: 'Normal Operations (Audited Transit)',
    scoreDelta7d: -22,
    factorBreakdown: {
      theftRisk: { rawScore: 12, weight: 0.35, weightedContribution: 4.2 },
      crashHistory: { rawScore: 5, weight: 0.25, weightedContribution: 1.3 },
      geofenceBreaches: { rawScore: 15, weight: 0.20, weightedContribution: 3.0 },
      sensorTampering: { rawScore: 10, weight: 0.20, weightedContribution: 2.0 }
    },
    lastCalculatedAt: '4 hours ago'
  }
];

export const INITIAL_AI_PROVIDERS: AIProviderConfigItem[] = [
  {
    id: 'prov-001',
    provider: 'gemini',
    displayName: 'Google Gemini',
    modelName: 'gemini-2.5-flash',
    isActive: true,
    isDefault: true,
    status: 'active',
    avgLatencyMs: 245,
    uptimePct: 99.98,
    totalTokensUsed: 1428500,
    totalCostUsd: 0.3572,
    errorCount24h: 1,
    lastHealthCheck: '2 mins ago'
  },
  {
    id: 'prov-002',
    provider: 'openai',
    displayName: 'OpenAI GPT-4o',
    modelName: 'gpt-4o',
    isActive: false,
    isDefault: false,
    status: 'active',
    avgLatencyMs: 460,
    uptimePct: 99.95,
    totalTokensUsed: 482000,
    totalCostUsd: 1.4460,
    errorCount24h: 3,
    lastHealthCheck: '5 mins ago'
  },
  {
    id: 'prov-003',
    provider: 'anthropic',
    displayName: 'Anthropic Claude',
    modelName: 'claude-3-5-sonnet',
    isActive: false,
    isDefault: false,
    status: 'active',
    avgLatencyMs: 490,
    uptimePct: 99.90,
    totalTokensUsed: 215000,
    totalCostUsd: 0.6450,
    errorCount24h: 2,
    lastHealthCheck: '12 mins ago'
  }
];

export const INITIAL_AI_INFERENCE_LOGS: AIInferenceLogItem[] = [
  {
    id: 'log-001',
    provider: 'gemini',
    model: 'gemini-2.5-flash',
    endpoint: 'evaluate_theft_risk',
    totalTokens: 340,
    costUsd: 0.00008,
    latencyMs: 240,
    statusCode: 200,
    isSuccess: true,
    timestamp: '3 mins ago'
  },
  {
    id: 'log-002',
    provider: 'gemini',
    model: 'gemini-2.5-flash',
    endpoint: 'analyze_crash_context',
    totalTokens: 285,
    costUsd: 0.00007,
    latencyMs: 215,
    statusCode: 200,
    isSuccess: true,
    timestamp: '18 mins ago'
  },
  {
    id: 'log-003',
    provider: 'gemini',
    model: 'gemini-2.5-flash',
    endpoint: 'evaluate_theft_risk',
    totalTokens: 310,
    costUsd: 0.00008,
    latencyMs: 275,
    statusCode: 200,
    isSuccess: true,
    timestamp: '42 mins ago'
  },
  {
    id: 'log-004',
    provider: 'gemini',
    model: 'gemini-2.5-flash',
    endpoint: 'analyze_crash_context',
    totalTokens: 290,
    costUsd: 0.00007,
    latencyMs: 195,
    statusCode: 200,
    isSuccess: true,
    timestamp: '1 hour ago'
  },
  {
    id: 'log-005',
    provider: 'gemini',
    model: 'gemini-2.5-flash',
    endpoint: 'generate_incident_summary',
    totalTokens: 410,
    costUsd: 0.00010,
    latencyMs: 230,
    statusCode: 200,
    isSuccess: true,
    timestamp: '3 hours ago'
  }
];

export const INITIAL_AI_OVERVIEW_STATS: AIOverviewStats = {
  totalPredictions24h: 184,
  activeTheftIncidents: 2,
  activeCrashAlerts: 1,
  criticalRiskVehicles: 2,
  avgLatencyMs: 245,
  costTodayUsd: 0.046,
  uptimePct: 99.98
};
