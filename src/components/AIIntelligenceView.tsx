import React, { useState } from 'react';
import {
  Sparkles,
  ShieldAlert,
  Car,
  Activity,
  CheckCircle2,
  AlertTriangle,
  Flame,
  Gauge,
  Sliders,
  Cpu,
  RefreshCw,
  Search,
  Filter,
  Check,
  X,
  ExternalLink,
  Info,
  Clock,
  ArrowUpRight,
  ArrowDownRight,
  Radio,
  FileCheck2,
  Layers,
  ChevronRight,
  TrendingUp,
  Zap,
  Lock,
  Unlock,
  AlertCircle,
  PanelLeftClose,
  PanelLeftOpen,
  ChevronsLeft,
  Minus,
  Plus
} from 'lucide-react';
import {
  AIPrediction,
  VehicleRiskScoreItem,
  AIProviderConfigItem,
  AIInferenceLogItem,
  AIOverviewStats,
  AIPredictionStatus,
  AIProviderId
} from '../types/ai';
import {
  INITIAL_AI_PREDICTIONS,
  INITIAL_VEHICLE_RISK_SCORES,
  INITIAL_AI_PROVIDERS,
  INITIAL_AI_INFERENCE_LOGS,
  INITIAL_AI_OVERVIEW_STATS
} from '../data/mockAiData';
import { Vehicle, UserRole } from '../types/smrod';

interface AIIntelligenceViewProps {
  vehicles: Vehicle[];
  activeRole: UserRole;
  onSelectVehicle?: (veh: Vehicle) => void;
}

export const AIIntelligenceView: React.FC<AIIntelligenceViewProps> = ({
  vehicles,
  activeRole,
  onSelectVehicle
}) => {
  // Navigation sub-tabs
  const [subTab, setSubTab] = useState<'overview' | 'theft' | 'crash' | 'risk' | 'performance' | 'providers'>('overview');

  // AI Menu Mode ('full' | 'rail' | 'hidden') & Width Controls
  const [aiMenuMode, setAiMenuMode] = useState<'full' | 'rail' | 'hidden'>('full');
  const [aiMenuWidth, setAiMenuWidth] = useState<number>(280);

  // Interactive Data States
  const [predictions, setPredictions] = useState<AIPrediction[]>(INITIAL_AI_PREDICTIONS);
  const [riskScores, setRiskScores] = useState<VehicleRiskScoreItem[]>(INITIAL_VEHICLE_RISK_SCORES);
  const [providers, setProviders] = useState<AIProviderConfigItem[]>(INITIAL_AI_PROVIDERS);
  const [inferenceLogs, setInferenceLogs] = useState<AIInferenceLogItem[]>(INITIAL_AI_INFERENCE_LOGS);
  const [overviewStats, setOverviewStats] = useState<AIOverviewStats>(INITIAL_AI_OVERVIEW_STATS);

  // Filters & Selected States
  const [selectedPrediction, setSelectedPrediction] = useState<AIPrediction | null>(predictions[0]);
  const [theftFilter, setTheftFilter] = useState<string>('all');
  const [theftSearch, setTheftSearch] = useState<string>('');
  const [selectedRiskVehicle, setSelectedRiskVehicle] = useState<VehicleRiskScoreItem | null>(riskScores[0]);

  // Modal States
  const [falsePositiveModalOpen, setFalsePositiveModalOpen] = useState(false);
  const [falsePositiveReason, setFalsePositiveReason] = useState('');
  const [pingTestingProvider, setPingTestingProvider] = useState<string | null>(null);
  const [pingResult, setPingResult] = useState<{ provider: string; latencyMs: number; status: string } | null>(null);
  const [actionNotice, setActionNotice] = useState<string | null>(null);

  const showNotice = (msg: string) => {
    setActionNotice(msg);
    setTimeout(() => setActionNotice(null), 3500);
  };

  // Triage Handlers
  const handleAcknowledge = (predId: string) => {
    setPredictions((prev) =>
      prev.map((p) =>
        p.id === predId
          ? {
              ...p,
              status: 'acknowledged' as AIPredictionStatus,
              acknowledgedAt: 'Just now',
              assignedOperator: `${activeRole}@smrod.ai`
            }
          : p
      )
    );
    if (selectedPrediction?.id === predId) {
      setSelectedPrediction((prev) =>
        prev
          ? {
              ...prev,
              status: 'acknowledged' as AIPredictionStatus,
              acknowledgedAt: 'Just now',
              assignedOperator: `${activeRole}@smrod.ai`
            }
          : null
      );
    }
    showNotice(`Prediction #${predId} acknowledged by ${activeRole}.`);
  };

  const handleResolve = (predId: string) => {
    setPredictions((prev) =>
      prev.map((p) =>
        p.id === predId
          ? {
              ...p,
              status: 'resolved' as AIPredictionStatus,
              resolvedAt: 'Just now'
            }
          : p
      )
    );
    if (selectedPrediction?.id === predId) {
      setSelectedPrediction((prev) =>
        prev
          ? {
              ...prev,
              status: 'resolved' as AIPredictionStatus,
              resolvedAt: 'Just now'
            }
          : null
      );
    }
    showNotice(`Incident #${predId} marked as resolved.`);
  };

  const handleMarkFalsePositive = () => {
    if (!selectedPrediction || !falsePositiveReason.trim()) return;
    setPredictions((prev) =>
      prev.map((p) =>
        p.id === selectedPrediction.id
          ? {
              ...p,
              status: 'false_positive' as AIPredictionStatus,
              falsePositiveReason: falsePositiveReason.trim(),
              assignedOperator: `${activeRole}@smrod.ai`
            }
          : p
      )
    );
    setSelectedPrediction({
      ...selectedPrediction,
      status: 'false_positive',
      falsePositiveReason: falsePositiveReason.trim(),
      assignedOperator: `${activeRole}@smrod.ai`
    });
    setFalsePositiveModalOpen(false);
    setFalsePositiveReason('');
    showNotice(`Audit Log: Prediction #${selectedPrediction.id} marked as False Positive.`);
  };

  const handleSwitchActiveProvider = (provId: string) => {
    setProviders((prev) =>
      prev.map((p) => ({
        ...p,
        isActive: p.id === provId
      }))
    );
    const chosen = providers.find((p) => p.id === provId);
    showNotice(`Primary AI reasoning engine switched to ${chosen?.displayName || 'Selected Provider'}.`);
  };

  const handleTestConnectionPing = (providerName: string) => {
    setPingTestingProvider(providerName);
    setPingResult(null);
    setTimeout(() => {
      const simulatedLatency = providerName === 'gemini' ? 245 : providerName === 'openai' ? 460 : 490;
      setPingTestingProvider(null);
      setPingResult({
        provider: providerName,
        latencyMs: simulatedLatency,
        status: 'Online & Operational'
      });
      showNotice(`${providerName.toUpperCase()} handshake succeeded (${simulatedLatency}ms).`);
    }, 800);
  };

  // Filtered Theft Predictions
  const filteredTheft = predictions
    .filter((p) => p.predictionType === 'theft')
    .filter((p) => (theftFilter === 'all' ? true : p.status === theftFilter))
    .filter(
      (p) =>
        p.vehiclePlate.toLowerCase().includes(theftSearch.toLowerCase()) ||
        p.title.toLowerCase().includes(theftSearch.toLowerCase()) ||
        p.aiExplanation.toLowerCase().includes(theftSearch.toLowerCase())
    );

  // Filtered Crash Predictions
  const crashPredictions = predictions.filter((p) => p.predictionType === 'crash');

  return (
    <div className="space-y-6">
      {/* Toast Notice */}
      {actionNotice && (
        <div className="fixed top-5 right-5 z-50 bg-slate-900 text-white px-4 py-3 rounded-2xl shadow-2xl border border-slate-700 text-xs font-semibold flex items-center gap-2 animate-in fade-in slide-in-from-top-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{actionNotice}</span>
        </div>
      )}

      {/* Top Header Banner */}
      <div className="rounded-3xl bg-linear-to-r from-[#0a66c2] via-[#09529d] to-slate-900 text-white p-6 md:p-8 shadow-xl relative overflow-hidden">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md text-xs font-semibold text-emerald-300 border border-white/15">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Multi-Provider AI Intelligence Engine</span>
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              <span>Active: {providers.find((p) => p.isActive)?.displayName}</span>
            </div>
            <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight">
              AI Security Intelligence & Threat Detection
            </h1>
            <p className="text-sm text-blue-100/90 leading-relaxed">
              Real-time ESP32-S3 VSCU telemetry analysis, deterministic G-force crash verification,
              unauthorized movement classification, and explainable 0–100 fleet risk scoring.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <div className="bg-white/10 backdrop-blur-md rounded-2xl p-4 border border-white/15 text-center min-w-[120px]">
              <span className="block text-2xl font-black text-white">{overviewStats.totalPredictions24h}</span>
              <span className="text-[11px] font-semibold text-blue-200">24h AI Inferences</span>
            </div>
            <div className="bg-white/10 backdrop-blur-md rounded-2xl p-4 border border-white/15 text-center min-w-[120px]">
              <span className="block text-2xl font-black text-emerald-300">{overviewStats.avgLatencyMs}ms</span>
              <span className="text-[11px] font-semibold text-blue-200">Avg Model Latency</span>
            </div>
          </div>
        </div>

        {/* Decorative background glow */}
        <div className="absolute -right-10 -bottom-10 w-80 h-80 bg-blue-400/20 rounded-full blur-3xl pointer-events-none" />
      </div>

      {/* Main Two-Column Layout: Left Vertical Menu (Down Vertical) + Right Content Canvas */}
      <div className="flex flex-col lg:flex-row items-start gap-6 relative">
        {/* Floating Re-open pill when AI menu is completely minimized */}
        {aiMenuMode === 'hidden' && (
          <button
            onClick={() => setAiMenuMode('full')}
            title="Expand AI Navigation Menu"
            className="fixed left-0 top-36 z-40 bg-slate-900 hover:bg-slate-800 text-white pl-2.5 pr-3 py-2 rounded-r-xl shadow-xl flex items-center gap-2 border border-l-0 border-slate-700 cursor-pointer animate-in slide-in-from-left"
          >
            <Sparkles className="w-3.5 h-3.5 text-blue-400" />
            <span className="text-[11px] font-bold">AI Modules</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        )}

        {/* 1. LEFT VERTICAL NAVIGATION MENU (Down Vertical) */}
        <aside
          style={{
            width: aiMenuMode === 'full' ? `${aiMenuWidth}px` : undefined
          }}
          className={`shrink-0 space-y-4 lg:sticky lg:top-6 self-start transition-all duration-200 select-none ${
            aiMenuMode === 'hidden'
              ? 'w-0 overflow-hidden opacity-0 pointer-events-none hidden lg:block'
              : aiMenuMode === 'rail'
              ? 'w-full lg:w-[72px]'
              : 'w-full'
          }`}
        >
          <div className="bg-white rounded-2xl p-3 border border-slate-200/90 shadow-sm space-y-2">
            {/* Header */}
            <div className="px-2 py-2 border-b border-slate-100 flex items-center justify-between">
              {aiMenuMode === 'full' ? (
                <div>
                  <span className="text-[10px] font-black uppercase tracking-wider text-slate-400">
                    AI Navigation
                  </span>
                  <h3 className="text-sm font-extrabold text-slate-900">Intelligence Modules</h3>
                </div>
              ) : (
                <div className="mx-auto" title="AI Intelligence Modules">
                  <Sparkles className="w-4 h-4 text-[#0a66c2]" />
                </div>
              )}

              {/* Mode Controls */}
              <div className="flex items-center gap-1">
                {aiMenuMode === 'full' ? (
                  <>
                    <button
                      onClick={() => setAiMenuMode('rail')}
                      title="Collapse to compact icon rail"
                      className="p-1 text-slate-400 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition-colors"
                    >
                      <PanelLeftClose className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => setAiMenuMode('hidden')}
                      title="Minimize completely to left"
                      className="p-1 text-slate-400 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition-colors"
                    >
                      <ChevronsLeft className="w-4 h-4" />
                    </button>
                  </>
                ) : (
                  <button
                    onClick={() => setAiMenuMode('full')}
                    title="Expand AI navigation menu"
                    className="p-1 text-slate-400 hover:text-[#0a66c2] hover:bg-blue-50 rounded-lg transition-colors mx-auto"
                  >
                    <PanelLeftOpen className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>

            {/* WIDER / NARROWER STEPPERS (When in full mode) */}
            {aiMenuMode === 'full' && (
              <div className="flex items-center justify-between px-1 py-1 border-b border-slate-100 text-[11px]">
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => setAiMenuWidth((w) => Math.max(200, w - 30))}
                    title="Make AI menu narrower"
                    className="p-1 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-md transition-colors flex items-center gap-0.5 font-bold"
                  >
                    <Minus className="w-3 h-3" />
                    <span className="text-[10px]">Narrower</span>
                  </button>
                  <button
                    onClick={() => setAiMenuWidth((w) => Math.min(420, w + 30))}
                    title="Make AI menu wider"
                    className="p-1 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-md transition-colors flex items-center gap-0.5 font-bold"
                  >
                    <Plus className="w-3 h-3" />
                    <span className="text-[10px]">Wider</span>
                  </button>
                </div>

                <div className="flex items-center gap-1">
                  <button
                    onClick={() => setAiMenuWidth(220)}
                    className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${
                      aiMenuWidth <= 240 ? 'bg-blue-100 text-[#0a66c2]' : 'text-slate-500 hover:bg-slate-100'
                    }`}
                  >
                    S
                  </button>
                  <button
                    onClick={() => setAiMenuWidth(280)}
                    className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${
                      aiMenuWidth > 240 && aiMenuWidth <= 310 ? 'bg-blue-100 text-[#0a66c2]' : 'text-slate-500 hover:bg-slate-100'
                    }`}
                  >
                    M
                  </button>
                  <button
                    onClick={() => setAiMenuWidth(350)}
                    className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${
                      aiMenuWidth > 310 ? 'bg-blue-100 text-[#0a66c2]' : 'text-slate-500 hover:bg-slate-100'
                    }`}
                  >
                    L
                  </button>
                </div>
              </div>
            )}

            {/* Vertical Menu Items */}
            <nav className="flex flex-col gap-1.5">
              {[
                {
                  id: 'overview',
                  label: 'AI Overview',
                  description: 'Fleet KPIs & live stream',
                  icon: Sparkles
                },
                {
                  id: 'theft',
                  label: 'Theft Detection',
                  description: 'Towing & tampering triggers',
                  icon: ShieldAlert,
                  badge: overviewStats.activeTheftIncidents
                },
                {
                  id: 'crash',
                  label: 'Crash Assistance',
                  description: 'IMU sensor gating (>3.5g)',
                  icon: Activity,
                  badge: overviewStats.activeCrashAlerts
                },
                {
                  id: 'risk',
                  label: 'Vehicle Risk Scoring',
                  description: '0–100 explainable formula',
                  icon: TrendingUp
                },
                {
                  id: 'performance',
                  label: 'Performance & Cost',
                  description: 'Model latency & audit logs',
                  icon: Gauge
                },
                {
                  id: 'providers',
                  label: 'AI Providers & Models',
                  description: 'Gemini, GPT-4o & Claude',
                  icon: Sliders
                }
              ].map((tab) => {
                const Icon = tab.icon;
                const isActive = subTab === tab.id;
                return (
                  <div key={tab.id} className="relative group">
                    <button
                      onClick={() => setSubTab(tab.id as any)}
                      className={`w-full text-left rounded-xl transition-all flex items-center relative ${
                        aiMenuMode === 'rail'
                          ? 'justify-center p-2.5'
                          : 'p-3 gap-3'
                      } ${
                        isActive
                          ? 'bg-blue-50/80 text-[#0a66c2] border border-[#0a66c2]/30 shadow-xs'
                          : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50 border border-transparent'
                      }`}
                    >
                      <div
                        className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 transition-all ${
                          isActive
                            ? 'bg-[#0a66c2] text-white shadow-xs'
                            : 'bg-slate-100 text-slate-500 group-hover:bg-slate-200 group-hover:text-slate-800'
                        }`}
                      >
                        <Icon className="w-4 h-4" />
                      </div>

                      {aiMenuMode === 'full' && (
                        <div className="flex-1 min-w-0 pr-1">
                          <div className="flex items-center justify-between gap-1">
                            <span className={`text-xs font-bold leading-tight ${isActive ? 'text-[#0a66c2]' : 'text-slate-800'}`}>
                              {tab.label}
                            </span>
                            {tab.badge !== undefined && tab.badge > 0 && (
                              <span className="px-1.5 py-0.5 text-[10px] font-black rounded-full bg-rose-500 text-white shrink-0">
                                {tab.badge}
                              </span>
                            )}
                          </div>
                          <p className="text-[11px] text-slate-400 font-medium truncate mt-0.5">
                            {tab.description}
                          </p>
                        </div>
                      )}

                      {aiMenuMode === 'full' && isActive && (
                        <div className="absolute right-2 top-1/2 -translate-y-1/2 w-1.5 h-6 rounded-full bg-[#0a66c2]" />
                      )}

                      {/* Rail notification dot */}
                      {aiMenuMode === 'rail' && tab.badge !== undefined && tab.badge > 0 && (
                        <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-rose-500 ring-2 ring-white" />
                      )}
                    </button>

                    {/* Tooltip in rail mode */}
                    {aiMenuMode === 'rail' && (
                      <div className="hidden lg:flex items-center gap-2 absolute left-full ml-3 top-1/2 -translate-y-1/2 px-3 py-1.5 bg-slate-900 text-white text-xs font-bold rounded-xl shadow-2xl whitespace-nowrap z-50 pointer-events-none opacity-0 group-hover:opacity-100 transition-all scale-95 group-hover:scale-100 border border-slate-700">
                        <span>{tab.label}</span>
                        {tab.badge !== undefined && tab.badge > 0 && (
                          <span className="px-1.5 py-0.2 rounded-full bg-rose-500 text-[10px] font-black">
                            {tab.badge}
                          </span>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </nav>
          </div>

          {/* Engine Status Diagnostic Card (Hidden in rail mode to preserve space) */}
          {aiMenuMode === 'full' && (
            <div className="bg-slate-900 text-white rounded-2xl p-4 border border-slate-800 shadow-md space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                  Engine Status
                </span>
                <span className="px-2 py-0.5 text-[10px] font-extrabold rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                  Online
                </span>
              </div>

              <div className="space-y-2 text-xs">
                <div className="flex items-center justify-between text-slate-300">
                  <span className="text-slate-400">Primary Model:</span>
                  <span className="font-semibold text-emerald-400 truncate max-w-[130px]">
                    {providers.find((p) => p.isActive)?.displayName.split(' ')[0] || 'Gemini'}
                  </span>
                </div>
                <div className="flex items-center justify-between text-slate-300">
                  <span className="text-slate-400">Avg Latency:</span>
                  <span className="font-semibold text-white">{overviewStats.avgLatencyMs}ms</span>
                </div>
                <div className="flex items-center justify-between text-slate-300">
                  <span className="text-slate-400">System Uptime:</span>
                  <span className="font-semibold text-emerald-400">{overviewStats.uptimePct}%</span>
                </div>
                <div className="flex items-center justify-between text-slate-300 pt-1 border-t border-slate-800">
                  <span className="text-slate-400">Safety Guard:</span>
                  <span className="font-bold text-amber-300 text-[11px]">Speed ≤ 5 km/h</span>
                </div>
              </div>

              <button
                onClick={() => setSubTab('providers')}
                className="w-full text-center py-2 bg-white/10 hover:bg-white/15 text-blue-200 text-xs font-bold rounded-xl transition-colors border border-white/10"
              >
                Configure AI Providers →
              </button>
            </div>
          )}
        </aside>

        {/* 2. RIGHT MAIN CONTENT CANVAS */}
        <div className="flex-1 min-w-0 w-full space-y-6">

      {/* ========================================================================= */}
      {/* SUBTAB 1: AI OVERVIEW                                                    */}
      {/* ========================================================================= */}
      {subTab === 'overview' && (
        <div className="space-y-6">
          {/* KPI Stat Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white rounded-2xl p-5 border border-slate-200/90 shadow-sm hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Theft Incidents</span>
                <div className="w-9 h-9 rounded-xl bg-rose-100 text-rose-600 flex items-center justify-center">
                  <ShieldAlert className="w-5 h-5" />
                </div>
              </div>
              <div className="flex items-baseline gap-2">
                <span className="text-2xl font-black text-slate-900">{overviewStats.activeTheftIncidents}</span>
                <span className="text-xs font-semibold text-rose-600">Requires Triage</span>
              </div>
              <p className="text-[11px] text-slate-500 mt-2">Active unauthorized towing & geofence exits</p>
            </div>

            <div className="bg-white rounded-2xl p-5 border border-slate-200/90 shadow-sm hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Crash Alerts</span>
                <div className="w-9 h-9 rounded-xl bg-amber-100 text-amber-600 flex items-center justify-center">
                  <Activity className="w-5 h-5" />
                </div>
              </div>
              <div className="flex items-baseline gap-2">
                <span className="text-2xl font-black text-slate-900">{overviewStats.activeCrashAlerts}</span>
                <span className="text-xs font-semibold text-amber-600">IMU Shock &gt; 3.5g</span>
              </div>
              <p className="text-[11px] text-slate-500 mt-2">Physical sensor spikes + AI plausibility</p>
            </div>

            <div className="bg-white rounded-2xl p-5 border border-slate-200/90 shadow-sm hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Critical Risk Units</span>
                <div className="w-9 h-9 rounded-xl bg-purple-100 text-purple-600 flex items-center justify-center">
                  <Flame className="w-5 h-5" />
                </div>
              </div>
              <div className="flex items-baseline gap-2">
                <span className="text-2xl font-black text-slate-900">{overviewStats.criticalRiskVehicles}</span>
                <span className="text-xs font-semibold text-purple-600">Score &ge; 80 / 100</span>
              </div>
              <p className="text-[11px] text-slate-500 mt-2">Weighted sum across theft, crash & telemetry</p>
            </div>

            <div className="bg-white rounded-2xl p-5 border border-slate-200/90 shadow-sm hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">24h Model Cost</span>
                <div className="w-9 h-9 rounded-xl bg-emerald-100 text-emerald-600 flex items-center justify-center">
                  <Zap className="w-5 h-5" />
                </div>
              </div>
              <div className="flex items-baseline gap-2">
                <span className="text-2xl font-black text-slate-900">${overviewStats.costTodayUsd.toFixed(4)}</span>
                <span className="text-xs font-semibold text-emerald-600">{overviewStats.uptimePct}% Uptime</span>
              </div>
              <p className="text-[11px] text-slate-500 mt-2">Optimized token routing & caching</p>
            </div>
          </div>

          {/* Middle Row: Fleet Risk Distribution & High Risk Units */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Risk Distribution Breakdown */}
            <div className="bg-white rounded-2xl p-6 border border-slate-200/90 shadow-sm space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-bold text-slate-900">Fleet Risk Distribution</h3>
                  <p className="text-xs text-slate-500">Categorization across 6 tracked vehicles</p>
                </div>
                <TrendingUp className="w-4 h-4 text-slate-400" />
              </div>

              {/* Multi-segment Progress Bar */}
              <div className="h-3.5 w-full bg-slate-100 rounded-full overflow-hidden flex shadow-inner">
                <div style={{ width: '33.3%' }} className="bg-rose-500 h-full" title="Critical: 2 (33.3%)" />
                <div style={{ width: '33.3%' }} className="bg-amber-500 h-full" title="High: 2 (33.3%)" />
                <div style={{ width: '16.7%' }} className="bg-blue-500 h-full" title="Medium: 1 (16.7%)" />
                <div style={{ width: '16.7%' }} className="bg-emerald-500 h-full" title="Low: 1 (16.7%)" />
              </div>

              {/* Legend with exact ranges */}
              <div className="space-y-2.5 pt-2 text-xs">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="w-3 h-3 rounded-full bg-rose-500" />
                    <span className="font-semibold text-slate-800">Critical (80–100)</span>
                  </div>
                  <span className="font-bold text-slate-900">2 vehicles (33%)</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="w-3 h-3 rounded-full bg-amber-500" />
                    <span className="font-semibold text-slate-800">High (60–79)</span>
                  </div>
                  <span className="font-bold text-slate-900">2 vehicles (33%)</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="w-3 h-3 rounded-full bg-blue-500" />
                    <span className="font-semibold text-slate-800">Medium (30–59)</span>
                  </div>
                  <span className="font-bold text-slate-900">1 vehicle (17%)</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="w-3 h-3 rounded-full bg-emerald-500" />
                    <span className="font-semibold text-slate-800">Low (0–29)</span>
                  </div>
                  <span className="font-bold text-slate-900">1 vehicle (17%)</span>
                </div>
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
                <span>Deterministic weights:</span>
                <span className="font-medium text-slate-700">Theft 35% · Crash 25% · Geo 20% · Shock 20%</span>
              </div>
            </div>

            {/* Highest-Risk Vehicles Table */}
            <div className="lg:col-span-2 bg-white rounded-2xl p-6 border border-slate-200/90 shadow-sm space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-bold text-slate-900">Highest-Risk Fleet Units</h3>
                  <p className="text-xs text-slate-500">Live score rankings with 7-day delta indicators</p>
                </div>
                <button
                  onClick={() => setSubTab('risk')}
                  className="text-xs font-semibold text-[#0a66c2] hover:underline flex items-center gap-1"
                >
                  <span>Full Risk Matrix</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-xs text-left">
                  <thead className="bg-slate-50 text-slate-500 font-bold border-b border-slate-200">
                    <tr>
                      <th className="py-2.5 px-3">Vehicle</th>
                      <th className="py-2.5 px-3">Primary Risk Factor</th>
                      <th className="py-2.5 px-3 text-center">Score</th>
                      <th className="py-2.5 px-3 text-center">7d Delta</th>
                      <th className="py-2.5 px-3 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 font-medium">
                    {riskScores.slice(0, 4).map((r) => (
                      <tr key={r.id} className="hover:bg-slate-50/80 transition-colors">
                        <td className="py-3 px-3">
                          <div className="flex items-center gap-2">
                            <span className="font-black text-slate-900">{r.vehiclePlate}</span>
                            <span className="text-[11px] text-slate-400">· {r.vehicleModel}</span>
                          </div>
                        </td>
                        <td className="py-3 px-3 text-slate-700">
                          <span className="line-clamp-1">{r.primaryRiskFactor}</span>
                        </td>
                        <td className="py-3 px-3 text-center">
                          <span
                            className={`inline-block px-2 py-0.5 rounded-full text-xs font-black ${
                              r.currentScore >= 80
                                ? 'bg-rose-100 text-rose-700'
                                : r.currentScore >= 60
                                ? 'bg-amber-100 text-amber-700'
                                : 'bg-blue-100 text-blue-700'
                            }`}
                          >
                            {r.currentScore}
                          </span>
                        </td>
                        <td className="py-3 px-3 text-center">
                          {r.scoreDelta7d > 0 ? (
                            <span className="inline-flex items-center text-rose-600 font-bold">
                              <ArrowUpRight className="w-3.5 h-3.5" />
                              +{r.scoreDelta7d}
                            </span>
                          ) : (
                            <span className="inline-flex items-center text-emerald-600 font-bold">
                              <ArrowDownRight className="w-3.5 h-3.5" />
                              {r.scoreDelta7d}
                            </span>
                          )}
                        </td>
                        <td className="py-3 px-3 text-right">
                          <button
                            onClick={() => {
                              setSelectedRiskVehicle(r);
                              setSubTab('risk');
                            }}
                            className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-[#0a66c2] hover:text-white text-slate-700 text-[11px] font-semibold transition-colors"
                          >
                            Inspect
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          {/* Recent AI Detections Stream */}
          <div className="bg-white rounded-2xl p-6 border border-slate-200/90 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-slate-900">Live AI Threat Stream</h3>
                <p className="text-xs text-slate-500">Autonomous predictions filtered from continuous VSCU sensor feeds</p>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
                <span className="text-xs font-semibold text-slate-600">Streaming</span>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {predictions.slice(0, 3).map((p) => (
                <div
                  key={p.id}
                  className="p-4 rounded-xl border border-slate-200/80 bg-slate-50/50 hover:bg-slate-50 hover:border-slate-300 transition-all space-y-3 flex flex-col justify-between"
                >
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="font-black text-slate-900 text-xs px-2 py-0.5 bg-white rounded-md border border-slate-200">
                        {p.vehiclePlate}
                      </span>
                      <span
                        className={`text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full ${
                          p.riskLevel === 'critical'
                            ? 'bg-rose-100 text-rose-700'
                            : p.riskLevel === 'high'
                            ? 'bg-amber-100 text-amber-700'
                            : 'bg-blue-100 text-blue-700'
                        }`}
                      >
                        Risk {p.riskScore} · {p.riskLevel}
                      </span>
                    </div>

                    <h4 className="text-xs font-bold text-slate-900 line-clamp-1">{p.title}</h4>
                    <p className="text-[11px] text-slate-600 line-clamp-2 leading-relaxed">
                      {p.aiExplanation}
                    </p>
                  </div>

                  <div className="pt-2 border-t border-slate-200/60 flex items-center justify-between text-[11px] text-slate-500">
                    <span className="flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {p.createdAt}
                    </span>
                    <button
                      onClick={() => {
                        setSelectedPrediction(p);
                        setSubTab(p.predictionType === 'theft' ? 'theft' : 'crash');
                      }}
                      className="text-[#0a66c2] hover:underline font-bold flex items-center gap-0.5"
                    >
                      <span>Investigate</span>
                      <ChevronRight className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* SUBTAB 2: THEFT DETECTION                                                */}
      {/* ========================================================================= */}
      {subTab === 'theft' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left Column: Predictions List & Search/Filters */}
          <div className="lg:col-span-5 space-y-4">
            <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-sm space-y-3">
              <div className="flex items-center gap-2">
                <div className="relative flex-1">
                  <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                  <input
                    type="text"
                    value={theftSearch}
                    onChange={(e) => setTheftSearch(e.target.value)}
                    placeholder="Search by plate, modality..."
                    className="w-full pl-9 pr-3 py-1.5 rounded-xl border border-slate-200 text-xs focus:outline-none focus:ring-2 focus:ring-[#0a66c2]"
                  />
                </div>
              </div>

              {/* Status Filter Pills */}
              <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-[11px] font-semibold">
                {['all', 'pending', 'acknowledged', 'investigating', 'resolved', 'false_positive'].map((st) => (
                  <button
                    key={st}
                    onClick={() => setTheftFilter(st)}
                    className={`px-2.5 py-1 rounded-lg capitalize whitespace-nowrap transition-colors ${
                      theftFilter === st
                        ? 'bg-[#0a66c2] text-white'
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                  >
                    {st.replace('_', ' ')}
                  </button>
                ))}
              </div>
            </div>

            {/* List */}
            <div className="space-y-3 max-h-[720px] overflow-y-auto pr-1">
              {filteredTheft.map((item) => {
                const isSelected = selectedPrediction?.id === item.id;
                return (
                  <div
                    key={item.id}
                    onClick={() => setSelectedPrediction(item)}
                    className={`p-4 rounded-2xl border transition-all cursor-pointer space-y-2.5 ${
                      isSelected
                        ? 'border-[#0a66c2] bg-blue-50/40 shadow-sm ring-1 ring-[#0a66c2]'
                        : 'border-slate-200 bg-white hover:border-slate-300'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-black text-slate-900 bg-slate-100 px-2 py-0.5 rounded-md">
                          {item.vehiclePlate}
                        </span>
                        <span className="text-[11px] text-slate-500">{item.vehicleModel}</span>
                      </div>
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase ${
                          item.status === 'pending'
                            ? 'bg-rose-100 text-rose-700'
                            : item.status === 'acknowledged'
                            ? 'bg-blue-100 text-blue-700'
                            : item.status === 'false_positive'
                            ? 'bg-slate-100 text-slate-700'
                            : 'bg-emerald-100 text-emerald-700'
                        }`}
                      >
                        {item.status.replace('_', ' ')}
                      </span>
                    </div>

                    <h4 className="text-xs font-bold text-slate-900">{item.title}</h4>
                    <p className="text-[11px] text-slate-600 line-clamp-2 leading-relaxed">
                      {item.aiExplanation}
                    </p>

                    <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-400">
                      <span>Model: {item.modelVersion}</span>
                      <span>{item.createdAt}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Right Column: Detailed Investigation Drawer */}
          <div className="lg:col-span-7">
            {selectedPrediction ? (
              <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-6">
                {/* Header & Status */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="text-lg font-black text-slate-900">{selectedPrediction.vehiclePlate}</span>
                      <span className="text-xs text-slate-500">
                        ({selectedPrediction.vehicleMake} {selectedPrediction.vehicleModel})
                      </span>
                      <span className="px-2 py-0.5 text-[10px] font-bold rounded-full bg-rose-100 text-rose-700 uppercase">
                        Risk {selectedPrediction.riskScore}/100
                      </span>
                    </div>
                    <h3 className="text-sm font-bold text-slate-800">{selectedPrediction.title}</h3>
                  </div>

                  <div className="flex items-center gap-2">
                    {selectedPrediction.status === 'pending' && (
                      <button
                        onClick={() => handleAcknowledge(selectedPrediction.id)}
                        className="px-3 py-1.5 bg-[#0a66c2] text-white text-xs font-semibold rounded-xl hover:bg-blue-700 transition-colors shadow-xs"
                      >
                        Acknowledge
                      </button>
                    )}
                    {selectedPrediction.status !== 'resolved' && (
                      <button
                        onClick={() => handleResolve(selectedPrediction.id)}
                        className="px-3 py-1.5 bg-emerald-600 text-white text-xs font-semibold rounded-xl hover:bg-emerald-700 transition-colors shadow-xs"
                      >
                        Resolve
                      </button>
                    )}
                    {selectedPrediction.status !== 'false_positive' && (
                      <button
                        onClick={() => setFalsePositiveModalOpen(true)}
                        className="px-3 py-1.5 border border-slate-200 text-slate-700 text-xs font-semibold rounded-xl hover:bg-slate-50 transition-colors"
                      >
                        Mark False Alarm
                      </button>
                    )}
                  </div>
                </div>

                {/* Telemetry Snapshot Cards */}
                <div className="space-y-2">
                  <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                    Detection Telemetry Snapshot
                  </h4>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                      <span className="text-[10px] font-semibold text-slate-500 uppercase">Speed</span>
                      <p className="text-base font-black text-slate-900">
                        {selectedPrediction.contributingFactors.speedKmh ?? 0} km/h
                      </p>
                    </div>
                    <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                      <span className="text-[10px] font-semibold text-slate-500 uppercase">Ignition State</span>
                      <p
                        className={`text-base font-black ${
                          selectedPrediction.contributingFactors.ignitionOn ? 'text-emerald-600' : 'text-rose-600'
                        }`}
                      >
                        {selectedPrediction.contributingFactors.ignitionOn ? 'ON' : 'OFF'}
                      </p>
                    </div>
                    <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                      <span className="text-[10px] font-semibold text-slate-500 uppercase">Geofence</span>
                      <p
                        className={`text-base font-black ${
                          selectedPrediction.contributingFactors.geofenceBreach ? 'text-rose-600' : 'text-slate-900'
                        }`}
                      >
                        {selectedPrediction.contributingFactors.geofenceBreach ? 'BREACHED' : 'NORMAL'}
                      </p>
                    </div>
                    <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                      <span className="text-[10px] font-semibold text-slate-500 uppercase">AI Confidence</span>
                      <p className="text-base font-black text-[#0a66c2]">
                        {Math.round(selectedPrediction.confidenceScore * 100)}%
                      </p>
                    </div>
                  </div>
                </div>

                {/* Natural Language AI Reasoning Box */}
                <div className="p-4 rounded-xl bg-blue-50/70 border border-blue-200/80 space-y-2">
                  <div className="flex items-center gap-2 text-xs font-bold text-[#0a66c2]">
                    <Sparkles className="w-4 h-4" />
                    <span>AI Reasoning Synthesis ({selectedPrediction.modelVersion})</span>
                  </div>
                  <p className="text-xs text-slate-700 leading-relaxed font-medium">
                    {selectedPrediction.aiExplanation}
                  </p>
                </div>

                {/* Recommended Operator Checklist */}
                <div className="space-y-3">
                  <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                    Recommended Operator Response Actions
                  </h4>
                  <div className="space-y-2">
                    {selectedPrediction.recommendedActions.map((action, idx) => (
                      <div
                        key={idx}
                        className="flex items-start gap-2.5 p-3 rounded-xl bg-slate-50 border border-slate-100 text-xs text-slate-800"
                      >
                        <CheckCircle2 className="w-4 h-4 text-[#0a66c2] shrink-0 mt-0.5" />
                        <span>{action}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Safety Protocol Note */}
                <div className="p-3 rounded-xl bg-amber-50 border border-amber-200 flex items-start gap-2.5 text-xs text-amber-800">
                  <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold">Strict Safety Invariant: </span>
                    AI advises and synthesizes intelligence. Vehicle immobilization cannot be triggered automatically by AI.
                    Immobilization commands strictly require vehicle speed &le; 5.0 km/h and human operator authorization.
                  </div>
                </div>

                {/* Audit Trail Details */}
                <div className="pt-4 border-t border-slate-100 grid grid-cols-2 sm:grid-cols-3 gap-2 text-[11px] text-slate-500">
                  <div>
                    <span className="block text-slate-400">Assigned Operator</span>
                    <span className="font-medium text-slate-800">{selectedPrediction.assignedOperator || 'Unassigned'}</span>
                  </div>
                  <div>
                    <span className="block text-slate-400">Inference Latency</span>
                    <span className="font-medium text-slate-800">{selectedPrediction.inferenceLatencyMs}ms</span>
                  </div>
                  <div>
                    <span className="block text-slate-400">Detection Timestamp</span>
                    <span className="font-medium text-slate-800">{selectedPrediction.createdAt}</span>
                  </div>
                </div>
              </div>
            ) : (
              <div className="p-12 text-center bg-white rounded-2xl border border-slate-200 text-slate-400 text-xs">
                Select a prediction from the list to inspect AI telemetry reasoning.
              </div>
            )}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* SUBTAB 3: CRASH DETECTION ASSISTANCE                                     */}
      {/* ========================================================================= */}
      {subTab === 'crash' && (
        <div className="space-y-6">
          <div className="bg-amber-50/80 rounded-2xl p-4 border border-amber-200 flex items-start gap-3 text-xs text-amber-900">
            <Info className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
            <div className="space-y-1">
              <span className="font-bold">Deterministic Physical G-Force Gating Architecture:</span>
              <p className="leading-relaxed text-amber-800">
                Crash detection relies on hard real-time ESP32-S3 IMU sensor thresholds (&gt; 3.5g peak acceleration,
                speed decay &gt; 30 km/h in &lt; 500ms). The AI engine provides secondary contextual plausibility,
                eliminating road debris bumps and generating structured emergency response workflows.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {crashPredictions.map((crash) => (
              <div
                key={crash.id}
                className="bg-white rounded-2xl border border-slate-200/90 p-6 shadow-sm space-y-5 flex flex-col justify-between"
              >
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-base font-black text-slate-900">{crash.vehiclePlate}</span>
                      <p className="text-xs text-slate-500">
                        {crash.vehicleMake} {crash.vehicleModel}
                      </p>
                    </div>
                    <span
                      className={`text-xs font-black px-2.5 py-1 rounded-full uppercase ${
                        crash.riskLevel === 'critical'
                          ? 'bg-rose-100 text-rose-700 animate-pulse'
                          : 'bg-amber-100 text-amber-700'
                      }`}
                    >
                      {crash.contributingFactors.severityTier?.replace('_', ' ') || 'Crash Alert'}
                    </span>
                  </div>

                  {/* IMU Physical Readings Grid */}
                  <div className="grid grid-cols-3 gap-2 text-center">
                    <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                      <span className="text-[10px] font-bold text-slate-500 uppercase">Peak IMU Shock</span>
                      <p className="text-lg font-black text-rose-600">
                        {crash.contributingFactors.peakGForce ?? 4.0}g
                      </p>
                    </div>
                    <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                      <span className="text-[10px] font-bold text-slate-500 uppercase">Speed Delta</span>
                      <p className="text-lg font-black text-slate-900">
                        -{crash.contributingFactors.speedDropKmh ?? 30} km/h
                      </p>
                    </div>
                    <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                      <span className="text-[10px] font-bold text-slate-500 uppercase">Tilt Angle</span>
                      <p className="text-lg font-black text-slate-900">
                        {crash.contributingFactors.tiltDegrees ?? 0}°
                      </p>
                    </div>
                  </div>

                  {/* AI Plausibility Analysis */}
                  <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 space-y-1.5">
                    <div className="flex items-center justify-between text-xs font-bold text-slate-800">
                      <span className="flex items-center gap-1.5">
                        <Sparkles className="w-3.5 h-3.5 text-[#0a66c2]" />
                        AI Plausibility Synthesis
                      </span>
                      <span className="text-emerald-600 font-extrabold">
                        {Math.round(crash.confidenceScore * 100)}% Confidence
                      </span>
                    </div>
                    <p className="text-xs text-slate-600 leading-relaxed font-medium">
                      {crash.aiExplanation}
                    </p>
                  </div>

                  {/* Emergency Protocols */}
                  <div className="space-y-2">
                    <span className="text-xs font-bold text-slate-800 uppercase tracking-wider block">
                      Emergency Dispatch Protocol
                    </span>
                    {crash.recommendedActions.map((act, i) => (
                      <div
                        key={i}
                        className="flex items-start gap-2 p-2.5 rounded-lg bg-rose-50/50 border border-rose-100 text-xs text-slate-800"
                      >
                        <ShieldAlert className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                        <span>{act}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Bottom Triage Status Action */}
                <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                  <span className="text-[11px] text-slate-400">Status: {crash.status.replace('_', ' ')}</span>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleAcknowledge(crash.id)}
                      className="px-3 py-1.5 bg-[#0a66c2] text-white rounded-xl text-xs font-semibold hover:bg-blue-700 transition-colors"
                    >
                      Acknowledge EMS
                    </button>
                    <button
                      onClick={() => handleResolve(crash.id)}
                      className="px-3 py-1.5 bg-emerald-600 text-white rounded-xl text-xs font-semibold hover:bg-emerald-700 transition-colors"
                    >
                      Resolve Incident
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* SUBTAB 4: VEHICLE RISK SCORING (0-100)                                    */}
      {/* ========================================================================= */}
      {subTab === 'risk' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left Column: Fleet Ranking */}
          <div className="lg:col-span-5 space-y-4">
            <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-bold text-slate-900">Fleet Risk Rankings</h3>
                  <p className="text-xs text-slate-500">Transparent 0–100 deterministic risk scale</p>
                </div>
                <TrendingUp className="w-4 h-4 text-slate-400" />
              </div>

              <div className="p-3 bg-blue-50/60 rounded-xl border border-blue-100 text-xs text-slate-700 space-y-1">
                <span className="font-bold text-[#0a66c2]">Unified Formula:</span>
                <p className="text-[11px] text-slate-600">
                  Risk = (Theft &times; 0.35) + (Crash &times; 0.25) + (Geofence &times; 0.20) + (Tampering &times; 0.20)
                </p>
              </div>
            </div>

            <div className="space-y-2.5">
              {riskScores.map((item) => {
                const isSelected = selectedRiskVehicle?.id === item.id;
                return (
                  <div
                    key={item.id}
                    onClick={() => setSelectedRiskVehicle(item)}
                    className={`p-4 rounded-2xl border transition-all cursor-pointer flex items-center justify-between ${
                      isSelected
                        ? 'border-[#0a66c2] bg-blue-50/50 shadow-sm ring-1 ring-[#0a66c2]'
                        : 'border-slate-200 bg-white hover:border-slate-300'
                    }`}
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-black text-slate-900">{item.vehiclePlate}</span>
                        <span className="text-[11px] text-slate-400">· {item.vehicleModel}</span>
                      </div>
                      <span className="text-[11px] text-slate-600 block line-clamp-1">
                        {item.primaryRiskFactor}
                      </span>
                    </div>

                    <div className="text-right">
                      <span
                        className={`text-base font-black px-2.5 py-0.5 rounded-lg inline-block ${
                          item.currentScore >= 80
                            ? 'bg-rose-100 text-rose-700'
                            : item.currentScore >= 60
                            ? 'bg-amber-100 text-amber-700'
                            : 'bg-emerald-100 text-emerald-700'
                        }`}
                      >
                        {item.currentScore}
                      </span>
                      <span className="block text-[10px] text-slate-400 uppercase font-bold mt-0.5">
                        {item.category}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Right Column: Factor Breakdown Inspector */}
          <div className="lg:col-span-7">
            {selectedRiskVehicle ? (
              <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-6">
                <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-xl font-black text-slate-900">{selectedRiskVehicle.vehiclePlate}</span>
                      <span className="text-xs text-slate-500">
                        ({selectedRiskVehicle.vehicleMake} {selectedRiskVehicle.vehicleModel})
                      </span>
                    </div>
                    <p className="text-xs text-slate-500">
                      Primary Factor: <strong className="text-slate-800">{selectedRiskVehicle.primaryRiskFactor}</strong>
                    </p>
                  </div>

                  <div className="text-right">
                    <span className="text-3xl font-black text-slate-900">{selectedRiskVehicle.currentScore}</span>
                    <span className="block text-[11px] font-bold text-slate-400 uppercase">Risk Index / 100</span>
                  </div>
                </div>

                {/* 4 Factor Contribution Bars */}
                <div className="space-y-4">
                  <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                    Contributing Risk Factor Breakdown
                  </h4>

                  {/* Theft */}
                  <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-100 space-y-2">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-bold text-slate-800">Theft & Unauthorized Movement (35%)</span>
                      <span className="font-black text-slate-900">
                        {selectedRiskVehicle.factorBreakdown.theftRisk.weightedContribution} pts (Raw:{' '}
                        {selectedRiskVehicle.factorBreakdown.theftRisk.rawScore})
                      </span>
                    </div>
                    <div className="h-2 w-full bg-slate-200 rounded-full overflow-hidden">
                      <div
                        style={{ width: `${selectedRiskVehicle.factorBreakdown.theftRisk.rawScore}%` }}
                        className="h-full bg-rose-500 rounded-full"
                      />
                    </div>
                  </div>

                  {/* Crash */}
                  <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-100 space-y-2">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-bold text-slate-800">Collision & Severe Shock History (25%)</span>
                      <span className="font-black text-slate-900">
                        {selectedRiskVehicle.factorBreakdown.crashHistory.weightedContribution} pts (Raw:{' '}
                        {selectedRiskVehicle.factorBreakdown.crashHistory.rawScore})
                      </span>
                    </div>
                    <div className="h-2 w-full bg-slate-200 rounded-full overflow-hidden">
                      <div
                        style={{ width: `${selectedRiskVehicle.factorBreakdown.crashHistory.rawScore}%` }}
                        className="h-full bg-amber-500 rounded-full"
                      />
                    </div>
                  </div>

                  {/* Geofence */}
                  <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-100 space-y-2">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-bold text-slate-800">Geofence Boundary Violations (20%)</span>
                      <span className="font-black text-slate-900">
                        {selectedRiskVehicle.factorBreakdown.geofenceBreaches.weightedContribution} pts (Raw:{' '}
                        {selectedRiskVehicle.factorBreakdown.geofenceBreaches.rawScore})
                      </span>
                    </div>
                    <div className="h-2 w-full bg-slate-200 rounded-full overflow-hidden">
                      <div
                        style={{ width: `${selectedRiskVehicle.factorBreakdown.geofenceBreaches.rawScore}%` }}
                        className="h-full bg-blue-500 rounded-full"
                      />
                    </div>
                  </div>

                  {/* Sensor Shock / Tampering */}
                  <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-100 space-y-2">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-bold text-slate-800">Sensor Tampering & Auxiliary Shocks (20%)</span>
                      <span className="font-black text-slate-900">
                        {selectedRiskVehicle.factorBreakdown.sensorTampering.weightedContribution} pts (Raw:{' '}
                        {selectedRiskVehicle.factorBreakdown.sensorTampering.rawScore})
                      </span>
                    </div>
                    <div className="h-2 w-full bg-slate-200 rounded-full overflow-hidden">
                      <div
                        style={{ width: `${selectedRiskVehicle.factorBreakdown.sensorTampering.rawScore}%` }}
                        className="h-full bg-purple-500 rounded-full"
                      />
                    </div>
                  </div>
                </div>

                {/* Audit Information */}
                <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
                  <span>Last recalculated: {selectedRiskVehicle.lastCalculatedAt}</span>
                  <span>7-Day Historical Score Trend: {selectedRiskVehicle.scoreDelta7d > 0 ? `+${selectedRiskVehicle.scoreDelta7d}` : selectedRiskVehicle.scoreDelta7d}</span>
                </div>
              </div>
            ) : (
              <div className="p-12 text-center bg-white rounded-2xl border border-slate-200 text-slate-400 text-xs">
                Select a vehicle to inspect its risk factor breakdown.
              </div>
            )}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* SUBTAB 5: PERFORMANCE & COST ANALYTICS                                   */}
      {/* ========================================================================= */}
      {subTab === 'performance' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm">
              <span className="text-xs font-bold text-slate-500 uppercase">24h Inferences</span>
              <p className="text-2xl font-black text-slate-900 mt-1">1,900</p>
              <span className="text-xs font-semibold text-emerald-600">+14% vs yesterday</span>
            </div>
            <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm">
              <span className="text-xs font-bold text-slate-500 uppercase">P95 Model Latency</span>
              <p className="text-2xl font-black text-slate-900 mt-1">420ms</p>
              <span className="text-xs font-semibold text-emerald-600">Within 800ms SLA</span>
            </div>
            <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm">
              <span className="text-xs font-bold text-slate-500 uppercase">Inference Error Rate</span>
              <p className="text-2xl font-black text-slate-900 mt-1">0.05%</p>
              <span className="text-xs font-semibold text-emerald-600">Zero network dropouts</span>
            </div>
            <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm">
              <span className="text-xs font-bold text-slate-500 uppercase">Total Tokens Spent</span>
              <p className="text-2xl font-black text-slate-900 mt-1">2.12M</p>
              <span className="text-xs font-semibold text-slate-500">$0.42 total cost</span>
            </div>
          </div>

          {/* Provider Performance Comparison */}
          <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm space-y-4">
            <div>
              <h3 className="text-sm font-bold text-slate-900">Provider Latency & Availability Matrix</h3>
              <p className="text-xs text-slate-500">Live health monitoring across multi-cloud AI endpoints</p>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left">
                <thead className="bg-slate-50 text-slate-500 font-bold border-b border-slate-200">
                  <tr>
                    <th className="py-2.5 px-3">Provider</th>
                    <th className="py-2.5 px-3">Model</th>
                    <th className="py-2.5 px-3">Status</th>
                    <th className="py-2.5 px-3 text-center">Avg Latency</th>
                    <th className="py-2.5 px-3 text-center">Uptime</th>
                    <th className="py-2.5 px-3 text-center">Error Rate</th>
                    <th className="py-2.5 px-3 text-right">Est. 24h Spend</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-medium">
                  {providers.map((pr) => (
                    <tr key={pr.id} className="hover:bg-slate-50/80">
                      <td className="py-3 px-3">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-slate-900">{pr.displayName}</span>
                          {pr.isActive && (
                            <span className="px-1.5 py-0.5 rounded-full text-[10px] font-black bg-blue-100 text-[#0a66c2]">
                              PRIMARY
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="py-3 px-3 font-mono text-[11px] text-slate-600">{pr.modelName}</td>
                      <td className="py-3 px-3">
                        <span className="inline-flex items-center gap-1.5 text-emerald-600 font-semibold">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                          Online
                        </span>
                      </td>
                      <td className="py-3 px-3 text-center font-bold text-slate-800">{pr.avgLatencyMs}ms</td>
                      <td className="py-3 px-3 text-center text-slate-700">{pr.uptimePct}%</td>
                      <td className="py-3 px-3 text-center text-slate-600">0.0{pr.errorCount24h}%</td>
                      <td className="py-3 px-3 text-right font-black text-slate-900">${pr.totalCostUsd.toFixed(4)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Recent Raw Inference Logs */}
          <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm space-y-4">
            <h3 className="text-sm font-bold text-slate-900">Recent Inference Access Logs</h3>
            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left">
                <thead className="bg-slate-50 text-slate-500 font-bold border-b border-slate-200">
                  <tr>
                    <th className="py-2 px-3">Timestamp</th>
                    <th className="py-2 px-3">Endpoint Method</th>
                    <th className="py-2 px-3">Provider</th>
                    <th className="py-2 px-3 text-center">Tokens</th>
                    <th className="py-2 px-3 text-center">Latency</th>
                    <th className="py-2 px-3 text-center">HTTP Status</th>
                    <th className="py-2 px-3 text-right">Cost</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-medium">
                  {inferenceLogs.map((log) => (
                    <tr key={log.id} className="hover:bg-slate-50/80 font-mono text-[11px]">
                      <td className="py-2.5 px-3 text-slate-500 font-sans">{log.timestamp}</td>
                      <td className="py-2.5 px-3 text-[#0a66c2] font-semibold">{log.endpoint}</td>
                      <td className="py-2.5 px-3 text-slate-800">{log.provider}</td>
                      <td className="py-2.5 px-3 text-center text-slate-700">{log.totalTokens}</td>
                      <td className="py-2.5 px-3 text-center text-slate-800">{log.latencyMs}ms</td>
                      <td className="py-2.5 px-3 text-center">
                        <span className="px-1.5 py-0.5 rounded-md bg-emerald-100 text-emerald-700 font-bold">
                          {log.statusCode} OK
                        </span>
                      </td>
                      <td className="py-2.5 px-3 text-right text-slate-700">${log.costUsd.toFixed(5)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* SUBTAB 6: AI PROVIDER & MODEL MANAGEMENT                                 */}
      {/* ========================================================================= */}
      {subTab === 'providers' && (
        <div className="space-y-6">
          <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm space-y-4">
            <div>
              <h3 className="text-sm font-bold text-slate-900">Multi-Provider Configuration</h3>
              <p className="text-xs text-slate-500">
                Switch primary reasoning engine, test round-trip latency, and manage provider parameters
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {providers.map((p) => {
                const isTesting = pingTestingProvider === p.provider;
                return (
                  <div
                    key={p.id}
                    className={`rounded-2xl border p-5 space-y-4 transition-all flex flex-col justify-between ${
                      p.isActive
                        ? 'border-[#0a66c2] bg-blue-50/30 shadow-md ring-2 ring-[#0a66c2]/20'
                        : 'border-slate-200 bg-white hover:border-slate-300'
                    }`}
                  >
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Cpu className="w-5 h-5 text-[#0a66c2]" />
                          <h4 className="text-sm font-bold text-slate-900">{p.displayName}</h4>
                        </div>
                        {p.isActive ? (
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-emerald-100 text-emerald-700">
                            ACTIVE
                          </span>
                        ) : (
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-slate-100 text-slate-600">
                            STANDBY
                          </span>
                        )}
                      </div>

                      <div className="space-y-2 text-xs">
                        <div className="flex justify-between text-slate-600">
                          <span>Model ID:</span>
                          <span className="font-mono font-bold text-slate-900">{p.modelName}</span>
                        </div>
                        <div className="flex justify-between text-slate-600">
                          <span>Avg Latency:</span>
                          <span className="font-bold text-slate-900">{p.avgLatencyMs}ms</span>
                        </div>
                        <div className="flex justify-between text-slate-600">
                          <span>Uptime:</span>
                          <span className="font-bold text-emerald-600">{p.uptimePct}%</span>
                        </div>
                        <div className="flex justify-between text-slate-600">
                          <span>Tokens Used:</span>
                          <span className="font-bold text-slate-900">{p.totalTokensUsed.toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between text-slate-600">
                          <span>Total Cost:</span>
                          <span className="font-bold text-slate-900">${p.totalCostUsd.toFixed(4)}</span>
                        </div>
                      </div>
                    </div>

                    <div className="pt-4 border-t border-slate-100 space-y-2">
                      <button
                        onClick={() => handleTestConnectionPing(p.provider)}
                        disabled={isTesting}
                        className="w-full py-2 px-3 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold flex items-center justify-center gap-2 transition-colors disabled:opacity-50"
                      >
                        <RefreshCw className={`w-3.5 h-3.5 ${isTesting ? 'animate-spin text-[#0a66c2]' : ''}`} />
                        <span>{isTesting ? 'Testing Latency...' : 'Test Connection'}</span>
                      </button>

                      {!p.isActive && (
                        <button
                          onClick={() => handleSwitchActiveProvider(p.id)}
                          className="w-full py-2 px-3 rounded-xl bg-[#0a66c2] text-white text-xs font-semibold hover:bg-blue-700 transition-colors shadow-xs"
                        >
                          Set as Primary Engine
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Ping Result Box */}
            {pingResult && (
              <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 flex items-center justify-between text-xs text-emerald-900 animate-in fade-in">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span>
                    Connection verified with <strong>{pingResult.provider.toUpperCase()}</strong> endpoint: {pingResult.status}
                  </span>
                </div>
                <span className="font-black bg-white px-2.5 py-1 rounded-lg border border-emerald-300 text-emerald-800">
                  {pingResult.latencyMs}ms roundtrip
                </span>
              </div>
            )}
          </div>
        </div>
      )}
        </div>
      </div>

      {/* ========================================================================= */}
      {/* MODAL: MARK FALSE POSITIVE                                               */}
      {/* ========================================================================= */}
      {falsePositiveModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl space-y-4 animate-in zoom-in-95">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-amber-500" />
                <h3 className="text-sm font-bold text-slate-900">Mark as False Alarm</h3>
              </div>
              <button
                onClick={() => setFalsePositiveModalOpen(false)}
                className="text-slate-400 hover:text-slate-600"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="text-xs text-slate-600 leading-relaxed">
              To preserve compliance and auditing standards, please provide a justification for marking
              prediction #{selectedPrediction?.id} ({selectedPrediction?.vehiclePlate}) as a false alarm.
            </p>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700">Audit Justification *</label>
              <textarea
                value={falsePositiveReason}
                onChange={(e) => setFalsePositiveReason(e.target.value)}
                rows={3}
                placeholder="e.g. Authorized flatbed transport verified with logistics supervisor; driver presented valid shipping order..."
                className="w-full p-3 rounded-xl border border-slate-200 text-xs focus:outline-none focus:ring-2 focus:ring-[#0a66c2]"
              />
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                onClick={() => setFalsePositiveModalOpen(false)}
                className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleMarkFalsePositive}
                disabled={!falsePositiveReason.trim()}
                className="px-4 py-2 text-xs font-semibold text-white bg-amber-600 hover:bg-amber-700 disabled:opacity-50 rounded-xl transition-colors"
              >
                Confirm False Alarm
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
