export type AIPredictionType = 'theft' | 'crash' | 'risk' | 'general';
export type AIRiskLevel = 'low' | 'medium' | 'high' | 'critical';
export type AIPredictionStatus = 'pending' | 'acknowledged' | 'investigating' | 'confirmed' | 'false_positive' | 'resolved';
export type AIProviderId = 'gemini' | 'openai' | 'anthropic';

export interface AIPrediction {
  id: string;
  vehicleId: string;
  vehiclePlate: string;
  vehicleMake: string;
  vehicleModel: string;
  predictionType: AIPredictionType;
  title: string;
  riskScore: number; // 0 - 100
  riskLevel: AIRiskLevel;
  confidenceScore: number; // 0.0 - 1.0
  aiExplanation: string;
  recommendedActions: string[];
  contributingFactors: {
    speedKmh?: number;
    ignitionOn?: boolean;
    geofenceBreach?: boolean;
    vibrationG?: number;
    modality?: string;
    peakGForce?: number;
    speedDropKmh?: number;
    tiltDegrees?: number;
    severityTier?: string;
  };
  rawTelemetrySnapshot: Record<string, any>;
  status: AIPredictionStatus;
  falsePositiveReason?: string;
  assignedOperator?: string;
  providerUsed: AIProviderId;
  modelVersion: string;
  inferenceLatencyMs: number;
  createdAt: string;
  acknowledgedAt?: string;
  resolvedAt?: string;
}

export interface FactorItem {
  rawScore: number;
  weight: number;
  weightedContribution: number;
}

export interface VehicleRiskScoreItem {
  id: string;
  vehicleId: string;
  vehiclePlate: string;
  vehicleMake: string;
  vehicleModel: string;
  currentScore: number;
  category: AIRiskLevel;
  primaryRiskFactor: string;
  scoreDelta7d: number;
  factorBreakdown: {
    theftRisk: FactorItem;
    crashHistory: FactorItem;
    geofenceBreaches: FactorItem;
    sensorTampering: FactorItem;
  };
  lastCalculatedAt: string;
}

export interface AIProviderConfigItem {
  id: string;
  provider: AIProviderId;
  displayName: string;
  modelName: string;
  isActive: boolean;
  isDefault: boolean;
  status: 'active' | 'degraded' | 'disabled';
  avgLatencyMs: number;
  uptimePct: number;
  totalTokensUsed: number;
  totalCostUsd: number;
  errorCount24h: number;
  lastHealthCheck: string;
}

export interface AIInferenceLogItem {
  id: string;
  provider: string;
  model: string;
  endpoint: string;
  totalTokens: number;
  costUsd: number;
  latencyMs: number;
  statusCode: number;
  isSuccess: boolean;
  errorMessage?: string;
  timestamp: string;
}

export interface AIOverviewStats {
  totalPredictions24h: number;
  activeTheftIncidents: number;
  activeCrashAlerts: number;
  criticalRiskVehicles: number;
  avgLatencyMs: number;
  costTodayUsd: number;
  uptimePct: number;
}
