import React, { useState } from 'react';
import { Settings, Shield, Server, Database, Radio, Check, Save, Key, Eye, EyeOff, Copy } from 'lucide-react';

export const SystemConfigView: React.FC = () => {
  const [mqttHost, setMqttHost] = useState('mqtt.smrod.ai');
  const [mqttPort, setMqttPort] = useState('8883');
  const [supabaseUrl, setSupabaseUrl] = useState(
    import.meta.env.VITE_SUPABASE_URL || 'https://tobexeirhbjehfwrojty.supabase.co'
  );
  const [supabaseAnonKey, setSupabaseAnonKey] = useState(
    import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY ||
      import.meta.env.VITE_SUPABASE_ANON_KEY ||
      'sb_publishable_WsbwClnOVSev3LYo3AgVgA_qsdPvo4b'
  );
  const [showKey, setShowKey] = useState(false);
  const [copiedKey, setCopiedKey] = useState(false);
  const [redisUrl, setRedisUrl] = useState('redis://cache.smrod.internal:6379/0');
  const [celeryWorkers, setCeleryWorkers] = useState('8');
  const [saved, setSaved] = useState(false);

  const copyToClipboard = () => {
    navigator.clipboard?.writeText(supabaseAnonKey);
    setCopiedKey(true);
    setTimeout(() => setCopiedKey(false), 2000);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };

  return (
    <div className="space-y-6">
      <div>
        <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">
          Infrastructure &amp; Network Gateways
        </div>
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900">
          System Configuration
        </h1>
        <p className="text-xs text-slate-500 mt-1">
          Manage production settings for MQTT broker clustering, Supabase JWT verification secrets, and Celery asynchronous task queues.
        </p>
      </div>

      <form onSubmit={handleSave} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* MQTT Broker Settings */}
          <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs space-y-4">
            <div className="flex items-center gap-2 pb-2 border-b border-slate-100">
              <Radio className="w-4 h-4 text-indigo-600" />
              <h2 className="text-sm font-bold text-slate-900">
                MQTT Edge Broker (EMQX / HiveMQ)
              </h2>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Broker Hostname</label>
              <input
                type="text"
                value={mqttHost}
                onChange={(e) => setMqttHost(e.target.value)}
                className="w-full px-3 py-2 text-xs font-mono bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-600 focus:bg-white"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">TLS 1.3 Port (mTLS Required)</label>
              <input
                type="text"
                value={mqttPort}
                onChange={(e) => setMqttPort(e.target.value)}
                className="w-full px-3 py-2 text-xs font-mono bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-600 focus:bg-white"
              />
            </div>

            <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 text-xs space-y-1">
              <div className="font-semibold text-slate-800">mTLS Root CA Status</div>
              <div className="text-emerald-700 font-mono text-[11px]">Valid until Nov 2028 · 4096-bit RSA</div>
            </div>
          </div>

          {/* Supabase & Authentication Settings */}
          <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <Shield className="w-4 h-4 text-indigo-600" />
                <h2 className="text-sm font-bold text-slate-900">
                  Supabase Auth Gateway &amp; JWT Verification
                </h2>
              </div>
              <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-[11px] font-medium bg-emerald-50 text-emerald-700 border border-emerald-200">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                Connected
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Project Ref ID</label>
                <div className="px-3 py-2 text-xs font-mono bg-slate-100 border border-slate-200 rounded-lg text-slate-800 font-semibold flex items-center justify-between">
                  <span>tobexeirhbjehfwrojty</span>
                  <span className="text-[10px] text-slate-500 font-normal">Active Region</span>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">JWT Verification</label>
                <div className="px-3 py-2 text-xs font-mono bg-slate-100 border border-slate-200 rounded-lg text-slate-600 truncate">
                  HS256 · auth.jwt()
                </div>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Supabase Project URL</label>
              <input
                type="text"
                value={supabaseUrl}
                onChange={(e) => setSupabaseUrl(e.target.value)}
                className="w-full px-3 py-2 text-xs font-mono bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-600 focus:bg-white"
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-xs font-semibold text-slate-700 flex items-center gap-1">
                  <Key className="w-3 h-3 text-slate-500" />
                  Publishable / Anon API Key (Client &amp; Mobile)
                </label>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setShowKey(!showKey)}
                    className="text-[11px] text-slate-500 hover:text-slate-800 inline-flex items-center gap-1"
                  >
                    {showKey ? <EyeOff className="w-3 h-3" /> : <Eye className="w-3 h-3" />}
                    <span>{showKey ? 'Hide' : 'Reveal'}</span>
                  </button>
                  <button
                    type="button"
                    onClick={copyToClipboard}
                    className="text-[11px] text-indigo-600 hover:text-indigo-800 font-medium inline-flex items-center gap-1"
                  >
                    {copiedKey ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                    <span>{copiedKey ? 'Copied!' : 'Copy'}</span>
                  </button>
                </div>
              </div>
              <input
                type={showKey ? 'text' : 'password'}
                value={supabaseAnonKey}
                onChange={(e) => setSupabaseAnonKey(e.target.value)}
                className="w-full px-3 py-2 text-xs font-mono bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-600 focus:bg-white"
              />
            </div>

            <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 text-xs space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="font-semibold text-slate-800">REST v1 Gateway &amp; Mobile Synced</span>
                <span className="font-mono text-[10px] text-emerald-700 font-medium">HS256 Verified</span>
              </div>
              <div className="text-slate-600 font-mono text-[11px] bg-white px-2 py-1 rounded border border-slate-200 truncate">
                https://tobexeirhbjehfwrojty.supabase.co/rest/v1/
              </div>
              <div className="text-slate-500 text-[11px]">
                Anon JWT verified for Flutter mobile sessions, Row-Level Security (RLS) policies, and Django authentication middleware.
              </div>
            </div>
          </div>

          {/* Redis & Celery Workers */}
          <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs space-y-4">
            <div className="flex items-center gap-2 pb-2 border-b border-slate-100">
              <Server className="w-4 h-4 text-indigo-600" />
              <h2 className="text-sm font-bold text-slate-900">
                Redis Broker &amp; Celery Task Workers
              </h2>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Redis Cache &amp; Task Broker URI</label>
              <input
                type="text"
                value={redisUrl}
                onChange={(e) => setRedisUrl(e.target.value)}
                className="w-full px-3 py-2 text-xs font-mono bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-600 focus:bg-white"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Worker Concurrency Scale</label>
              <input
                type="number"
                value={celeryWorkers}
                onChange={(e) => setCeleryWorkers(e.target.value)}
                className="w-full px-3 py-2 text-xs font-mono bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-600 focus:bg-white"
              />
            </div>
          </div>

          {/* Database Connection */}
          <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs space-y-4">
            <div className="flex items-center gap-2 pb-2 border-b border-slate-100">
              <Database className="w-4 h-4 text-indigo-600" />
              <h2 className="text-sm font-bold text-slate-900">
                PostgreSQL Relational Storage
              </h2>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Database Engine</label>
              <input
                type="text"
                disabled
                value="django.db.backends.postgresql (psycopg3)"
                className="w-full px-3 py-2 text-xs font-mono bg-slate-100 border border-slate-200 rounded-lg text-slate-500"
              />
            </div>

            <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 text-xs space-y-1">
              <div className="font-semibold text-slate-800">Connection Pooling</div>
              <div className="text-slate-600 text-[11px]">CONN_MAX_AGE: 600s · SSL Mode: verify-full</div>
            </div>
          </div>
        </div>

        <div className="flex justify-end">
          <button
            type="submit"
            className="inline-flex items-center gap-2 px-5 py-2.5 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg transition-colors shadow-xs"
          >
            {saved ? <Check className="w-4 h-4" /> : <Save className="w-4 h-4" />}
            <span>{saved ? 'Settings Saved' : 'Save System Settings'}</span>
          </button>
        </div>
      </form>
    </div>
  );
};
