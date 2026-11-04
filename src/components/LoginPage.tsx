import React, { useState } from 'react';
import {
  User,
  Lock,
  Eye,
  EyeOff,
  Shield,
  Radio,
  Cpu,
  ArrowRight,
  CheckCircle2,
  AlertCircle,
  KeyRound,
  Fingerprint,
  Smartphone,
  ShieldCheck,
  Zap
} from 'lucide-react';
import { UserRole } from '../types/smrod';
import { supabase } from '../services/supabaseClient';

interface LoginPageProps {
  onLoginSuccess: (email: string, role: UserRole) => void;
  onContinueAsGuest?: () => void;
}

export const LoginPage: React.FC<LoginPageProps> = ({ onLoginSuccess, onContinueAsGuest }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [selectedRole, setSelectedRole] = useState<UserRole>('super_admin');
  const [isLoading, setIsLoading] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [resetSent, setResetSent] = useState(false);
  const [hardwareAuthLoading, setHardwareAuthLoading] = useState<string | null>(null);

  const handleRolePreset = (role: UserRole, userEmail: string) => {
    setSelectedRole(role);
    setEmail(userEmail);
    setPassword('');
    setAuthError(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) {
      setAuthError('Please enter an operator email.');
      return;
    }
    if (!password || password.includes('•')) {
      setAuthError('Enter your real Supabase Auth password (not the masked preset).');
      return;
    }

    setIsLoading(true);
    setAuthError(null);

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password,
      });
      if (error) {
        setAuthError(error.message);
        return;
      }

      const meta = data.user?.user_metadata ?? {};
      const roleFromMeta = (meta.role as UserRole | undefined) || selectedRole;
      onLoginSuccess(data.user?.email || email, roleFromMeta);
    } catch (err) {
      setAuthError(err instanceof Error ? err.message : 'Supabase sign-in failed.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleHardwareAuth = (type: 'fido2' | 'mtls') => {
    setHardwareAuthLoading(type);
    setAuthError(null);
    setTimeout(() => {
      setHardwareAuthLoading(null);
      const userEmail = type === 'fido2' ? 'grace.omondi@smrod.ai' : 'alex.k@smrod.ai';
      const userRole: UserRole = type === 'fido2' ? 'super_admin' : 'operations';
      onLoginSuccess(userEmail, userRole);
    }, 800);
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) {
      setAuthError('Enter the operator email to reset.');
      return;
    }
    const { error } = await supabase.auth.resetPasswordForEmail(email.trim(), {
      redirectTo: window.location.origin,
    });
    if (error) {
      setAuthError(error.message);
      return;
    }
    setResetSent(true);
    setTimeout(() => {
      setResetSent(false);
      setShowForgotPassword(false);
    }, 2000);
  };

  return (
    <div className="min-h-screen w-full bg-[#05172e] flex items-center justify-center p-4 relative overflow-hidden select-none">
      {/* Ambient background glow and grid matching dashboard theme */}
      <div className="absolute inset-0 bg-radial from-[#0a66c2]/35 via-[#06203d] to-slate-950 pointer-events-none" />
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#0a66c21a_1px,transparent_1px),linear-gradient(to_bottom,#0a66c21a_1px,transparent_1px)] bg-[size:4rem_4rem] pointer-events-none" />

      {/* Main Split Authentication Card matching dashboard blue styling */}
      <div className="relative z-10 w-full max-w-4xl bg-white rounded-3xl shadow-[0_20px_60px_rgba(4,28,56,0.45)] overflow-hidden flex flex-col md:flex-row min-h-[580px] border border-blue-500/20">
        
        {/* LEFT PANEL: Connected Vehicle Security Visuals in Dashboard Blue (#0a66c2) with S-Curve Wave Divider & Motion Graphic */}
        <div className="relative md:w-1/2 bg-gradient-to-br from-[#0a66c2] via-[#084e96] to-[#041c38] text-white p-7 sm:p-8 flex flex-col justify-between overflow-hidden">
          {/* Subtle background radar circles */}
          <div className="absolute -left-16 -top-16 w-72 h-72 rounded-full border border-blue-300/15 pointer-events-none" />
          <div className="absolute -left-8 -top-8 w-56 h-56 rounded-full border border-blue-300/10 pointer-events-none" />

          {/* S-Curve SVG Overlay creating the undulating wave border dividing left from right */}
          <div className="hidden md:block absolute top-0 bottom-0 -right-1 w-14 pointer-events-none z-20">
            <svg
              viewBox="0 0 100 580"
              preserveAspectRatio="none"
              className="w-full h-full fill-white"
            >
              <path d="M 0 0 C 80 145 -20 395 100 580 L 100 0 Z" />
            </svg>
          </div>

          {/* Top Branding on Left Panel */}
          <div className="relative z-10 space-y-3">
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-2xl bg-white p-1.5 flex items-center justify-center shadow-lg ring-2 ring-white/40 shrink-0">
                <img
                  src="/assets/aistudio/image_b5e6919a.png"
                  alt="SMROD AIOT Logo"
                  className="w-full h-full object-contain filter drop-shadow-xs"
                />
              </div>
              <div>
                <h1 className="text-lg font-extrabold tracking-tight text-white leading-tight flex items-center gap-1.5">
                  <span>SMROD AIOT TECH</span>
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                </h1>
                <p className="text-xs text-blue-100 font-medium">Connected Vehicle Security</p>
              </div>
            </div>

            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/15 border border-white/25 text-white text-xs font-semibold backdrop-blur-xs">
              <Radio className="w-3.5 h-3.5 text-blue-200 animate-pulse" />
              <span>mTLS X.509 Edge Gateway Active</span>
            </div>
          </div>

          {/* HIGH-TECH MOTION SECURITY VISUAL IN DASHBOARD BLUE */}
          <div className="relative z-10 my-auto py-3 flex flex-col items-center justify-center">
            <div className="relative w-full max-w-[320px] aspect-square flex items-center justify-center">
              
              {/* 1. Concentric Animated Sonar Radar Waves */}
              <div className="absolute inset-2 rounded-full border border-blue-400/25 pointer-events-none animate-pulse-glow" />
              <div className="absolute inset-8 rounded-full border border-blue-300/25 pointer-events-none" />
              <div className="absolute inset-14 rounded-full border border-blue-200/30 border-dashed pointer-events-none animate-spin-reverse" />
              
              {/* Outer rotating coordinate HUD ring with degree ticks */}
              <div className="absolute inset-0 rounded-full border border-blue-400/35 border-t-white border-r-transparent pointer-events-none animate-spin-slow" />

              {/* 2. Cyber Shield Hexagonal Defense Aura */}
              <div className="absolute inset-6 bg-radial from-blue-400/20 via-[#0a66c2]/30 to-transparent rounded-full pointer-events-none blur-xs" />

              {/* 3. High-Tech Connected Vehicle Security SVG with Live Motion Layers */}
              <div className="relative w-full h-full flex items-center justify-center p-4">
                <svg
                  viewBox="0 0 300 240"
                  className="w-full h-full drop-shadow-[0_0_25px_rgba(10,102,194,0.6)] overflow-visible"
                >
                  <defs>
                    {/* Glowing blue gradients matching dashboard */}
                    <linearGradient id="neonBlue" x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" stopColor="#93c5fd" />
                      <stop offset="50%" stopColor="#3b82f6" />
                      <stop offset="100%" stopColor="#0a66c2" />
                    </linearGradient>
                    <linearGradient id="laserBeam" x1="0%" y1="0%" x2="0%" y2="100%">
                      <stop offset="0%" stopColor="#38bdf8" stopOpacity="0" />
                      <stop offset="50%" stopColor="#93c5fd" stopOpacity="0.85" />
                      <stop offset="100%" stopColor="#38bdf8" stopOpacity="0" />
                    </linearGradient>
                    <radialGradient id="corePulse" cx="50%" cy="50%" r="50%">
                      <stop offset="0%" stopColor="#60a5fa" stopOpacity="0.9" />
                      <stop offset="100%" stopColor="#1d4ed8" stopOpacity="0" />
                    </radialGradient>
                  </defs>

                  {/* Hexagonal Cyber Defense Grid Gridlines */}
                  <g opacity="0.3" stroke="#93c5fd" strokeWidth="0.8" fill="none">
                    <polygon points="150,20 220,60 220,140 150,180 80,140 80,60" />
                    <polygon points="150,5 240,55 240,155 150,205 60,155 60,55" strokeDasharray="3 3" />
                  </g>

                  {/* Rotating Scanning Radar Sweep Beam */}
                  <g className="origin-[150px_110px] animate-spin-slow" opacity="0.4">
                    <path
                      d="M150,110 L250,50 A120,120 0 0,1 260,110 Z"
                      fill="url(#neonBlue)"
                    />
                  </g>

                  {/* Connected Vehicle Wireframe Silhouette (Aerodynamic Sedan/SUV) */}
                  <g stroke="#93c5fd" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round">
                    {/* Vehicle Main Body Contour */}
                    <path
                      d="M 40 145 
                         L 60 145 
                         C 65 130 85 130 90 145 
                         L 205 145 
                         C 210 130 230 130 235 145 
                         L 260 145 
                         C 265 140 265 130 255 125 
                         L 230 115 
                         L 190 85 
                         L 115 85 
                         L 75 115 
                         L 45 125 
                         C 35 130 35 140 40 145 Z"
                      strokeWidth="2.2"
                      className="filter drop-shadow-[0_0_8px_#38bdf8]"
                    />

                    {/* Cabin Glass / Canopy */}
                    <path
                      d="M 80 112 
                         L 118 88 
                         L 186 88 
                         L 222 112 Z"
                      stroke="#bfdbfe"
                      strokeWidth="1.5"
                      fill="#3b82f6"
                      fillOpacity="0.16"
                    />

                    {/* Front & Rear Windows Divider Post (B-Pillar) */}
                    <line x1="145" y1="88" x2="145" y2="112" stroke="#bfdbfe" strokeWidth="1.2" strokeDasharray="2 2" />

                    {/* Aerodynamic Shoulder Character Line */}
                    <path d="M 50 125 Q 150 115 250 122" stroke="#bfdbfe" strokeWidth="1" strokeDasharray="4 2" opacity="0.8" />

                    {/* Front Wheel Assembly with Motion Rotation Rings */}
                    <circle cx="75" cy="145" r="14" stroke="#60a5fa" strokeWidth="2" fill="#041c38" />
                    <circle cx="75" cy="145" r="8" stroke="#bfdbfe" strokeWidth="1.2" strokeDasharray="2 2" className="origin-[75px_145px] animate-spin-slow" />
                    <circle cx="75" cy="145" r="2.5" fill="#93c5fd" />

                    {/* Rear Wheel Assembly with Motion Rotation Rings */}
                    <circle cx="220" cy="145" r="14" stroke="#60a5fa" strokeWidth="2" fill="#041c38" />
                    <circle cx="220" cy="145" r="8" stroke="#bfdbfe" strokeWidth="1.2" strokeDasharray="2 2" className="origin-[220px_145px] animate-spin-slow" />
                    <circle cx="220" cy="145" r="2.5" fill="#93c5fd" />

                    {/* Front Headlight Beam Vector */}
                    <polygon points="42,126 15,120 15,142 40,132" fill="#93c5fd" fillOpacity="0.22" stroke="none" />
                    <line x1="42" y1="128" x2="18" y2="124" stroke="#bfdbfe" strokeWidth="1" opacity="0.8" />

                    {/* Tail LED Light Strip */}
                    <line x1="255" y1="124" x2="260" y2="132" stroke="#f43f5e" strokeWidth="2.5" className="filter drop-shadow-[0_0_8px_#f43f5e]" />

                    {/* Central Embedded VSCU Microcontroller (ESP32-S3 Core) */}
                    <rect x="138" y="122" width="24" height="16" rx="3" stroke="#60a5fa" strokeWidth="1.5" fill="#084e96" />
                    <circle cx="150" cy="130" r="4" fill="#38bdf8" className="animate-pulse" />
                    {/* Microcontroller Pin Traces */}
                    <path d="M 142 122 L 142 116 M 150 122 L 150 115 M 158 122 L 158 116" stroke="#93c5fd" strokeWidth="1" />
                    <path d="M 142 138 L 142 144 M 150 138 L 150 144 M 158 138 L 158 144" stroke="#93c5fd" strokeWidth="1" />
                  </g>

                  {/* 4. Active Security Pings (GNSS, Immobilizer, CAN-Shield, Shock Sensor) */}
                  {/* Top GNSS Antenna Node */}
                  <g className="origin-[130px_82px]">
                    <circle cx="130" cy="82" r="4" fill="#38bdf8" className="animate-ping opacity-75" />
                    <circle cx="130" cy="82" r="3" fill="#bfdbfe" />
                    <line x1="130" y1="82" x2="110" y2="60" stroke="#bfdbfe" strokeWidth="0.8" strokeDasharray="2 2" />
                  </g>

                  {/* Rear Immobilizer Latch Node */}
                  <g className="origin-[235px_130px]">
                    <circle cx="235" cy="130" r="4" fill="#10b981" className="animate-ping opacity-75" />
                    <circle cx="235" cy="130" r="3" fill="#34d399" />
                    <line x1="235" y1="130" x2="255" y2="165" stroke="#34d399" strokeWidth="0.8" strokeDasharray="2 2" />
                  </g>

                  {/* Front Impact / Accelerometer Node */}
                  <g className="origin-[50px_132px]">
                    <circle cx="50" cy="132" r="4" fill="#38bdf8" className="animate-ping opacity-75" />
                    <circle cx="50" cy="132" r="3" fill="#bfdbfe" />
                    <line x1="50" y1="132" x2="35" y2="165" stroke="#bfdbfe" strokeWidth="0.8" strokeDasharray="2 2" />
                  </g>

                  {/* Live Vertical Cyber Scanline (Sweeping back and forth) */}
                  <rect
                    x="20"
                    y="75"
                    width="260"
                    height="18"
                    fill="url(#laserBeam)"
                    className="animate-scanline pointer-events-none"
                  />
                </svg>

                {/* Floating Holographic Status Badges Around Motion Car */}
                <div className="absolute top-1 left-2 flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-[#041c38]/90 border border-blue-400/40 text-[10px] font-mono text-blue-100 backdrop-blur-xs shadow-xs">
                  <span className="w-1.5 h-1.5 rounded-full bg-sky-400 animate-pulse" />
                  <span>GNSS: 3D FIX</span>
                </div>

                <div className="absolute top-1 right-2 flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-[#041c38]/90 border border-blue-400/40 text-[10px] font-mono text-blue-100 backdrop-blur-xs shadow-xs">
                  <ShieldCheck className="w-3 h-3 text-emerald-400" />
                  <span>ARMED &amp; LOCKED</span>
                </div>

                <div className="absolute bottom-1 left-2 flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-[#041c38]/90 border border-blue-400/40 text-[10px] font-mono text-blue-100 backdrop-blur-xs shadow-xs">
                  <Zap className="w-3 h-3 text-sky-300" />
                  <span>CAN FIREWALL</span>
                </div>

                <div className="absolute bottom-1 right-2 flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-[#041c38]/90 border border-blue-400/40 text-[10px] font-mono text-blue-100 backdrop-blur-xs shadow-xs">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                  <span>mTLS X.509</span>
                </div>
              </div>
            </div>
          </div>

          {/* Bottom Security Footer on Left Panel */}
          <div className="relative z-10 text-[11px] text-blue-200/80 font-mono flex items-center justify-between pt-2 border-t border-white/15">
            <span>TLS 1.3 · Port 8883 mTLS</span>
            <span>VSCU Edge Core v2.4.1</span>
          </div>
        </div>

        {/* RIGHT PANEL: Admin Login Form in Dashboard Blue Theme */}
        <div className="relative md:w-1/2 p-8 sm:p-10 flex flex-col justify-between bg-white">
          <div className="space-y-5">
            {/* Header Title in Dashboard Blue Accent */}
            <div className="space-y-1">
              <div className="inline-flex items-center gap-1.5 text-[11px] font-bold text-[#0a66c2] bg-blue-50 px-2.5 py-0.5 rounded-full border border-blue-200">
                <Shield className="w-3 h-3 text-[#0a66c2]" />
                <span>Admin Operations Portal</span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900">
                Welcome
              </h2>
              <p className="text-xs text-slate-500">
                Log in to your authorized administrator account
              </p>
            </div>

            {/* Role Preset Selector */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">
                  Select Role
                </label>
                <span className="text-[10px] text-[#0a66c2] font-semibold">Enterprise Access</span>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5 text-[11px]">
                <button
                  type="button"
                  onClick={() => handleRolePreset('super_admin', 'grace.omondi@smrod.ai')}
                  className={`p-1.5 rounded-lg border font-semibold transition-all cursor-pointer ${
                    selectedRole === 'super_admin'
                      ? 'border-[#0a66c2] bg-blue-50 text-[#0a66c2] shadow-2xs'
                      : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  Super Admin
                </button>
                <button
                  type="button"
                  onClick={() => handleRolePreset('operations', 'alex.k@smrod.ai')}
                  className={`p-1.5 rounded-lg border font-semibold transition-all cursor-pointer ${
                    selectedRole === 'operations'
                      ? 'border-[#0a66c2] bg-blue-50 text-[#0a66c2] shadow-2xs'
                      : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  Operations
                </button>
                <button
                  type="button"
                  onClick={() => handleRolePreset('support', 'david.m@smrod.ai')}
                  className={`p-1.5 rounded-lg border font-semibold transition-all cursor-pointer ${
                    selectedRole === 'support'
                      ? 'border-[#0a66c2] bg-blue-50 text-[#0a66c2] shadow-2xs'
                      : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  Support
                </button>
                <button
                  type="button"
                  onClick={() => handleRolePreset('viewer', 'b.njeri@apexlogistics.co')}
                  className={`p-1.5 rounded-lg border font-semibold transition-all cursor-pointer ${
                    selectedRole === 'viewer'
                      ? 'border-[#0a66c2] bg-blue-50 text-[#0a66c2] shadow-2xs'
                      : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  Viewer
                </button>
              </div>
            </div>

            {/* Error Message */}
            {authError && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-xs text-red-700 flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{authError}</span>
              </div>
            )}

            {/* Authentication Form */}
            <form onSubmit={handleSubmit} className="space-y-3.5">
              {/* Email Input with user icon and full rounded capsule */}
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400">
                  <User className="w-4 h-4" />
                </div>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@smrod.ai"
                  className="w-full pl-11 pr-4 py-2 bg-white border border-slate-200 rounded-full text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#0a66c2] focus:border-[#0a66c2] transition-all placeholder:text-slate-400 shadow-2xs"
                />
              </div>

              {/* Password Input with lock icon and full rounded capsule */}
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400">
                  <Lock className="w-4 h-4" />
                </div>
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  className="w-full pl-11 pr-11 py-2 bg-white border border-slate-200 rounded-full text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#0a66c2] focus:border-[#0a66c2] transition-all placeholder:text-slate-400 shadow-2xs font-mono"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-4 flex items-center text-slate-400 hover:text-slate-600 transition-colors"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>

              {/* Forgot Password Link */}
              <div className="flex justify-end pr-1">
                <button
                  type="button"
                  onClick={() => setShowForgotPassword(true)}
                  className="text-[11px] text-slate-400 hover:text-[#0a66c2] transition-colors font-medium"
                >
                  Forgot your password?
                </button>
              </div>

              {/* Log In Button matching the dashboard's blue theme (#0a66c2) */}
              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-2.5 px-6 rounded-full bg-[#0a66c2] hover:bg-[#084e96] text-white text-xs font-bold transition-all shadow-md hover:shadow-lg flex items-center justify-center gap-2 cursor-pointer active:scale-[0.99]"
              >
                {isLoading ? (
                  <span>Signing in...</span>
                ) : (
                  <span>Sign In</span>
                )}
              </button>
            </form>

            {/* Request Access */}
            <div className="text-center text-xs text-slate-500">
              Need administrator access?{' '}
              <button
                type="button"
                onClick={() => {
                  setEmail('new.admin@smrod.ai');
                  setSelectedRole('operations');
                }}
                className="text-[#0a66c2] font-bold hover:underline"
              >
                Request Access
              </button>
            </div>
          </div>

          {/* Bottom Section: Enterprise Hardware Tokens (FIDO2 & mTLS) */}
          <div className="pt-4 border-t border-slate-100 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                Enterprise Hardware Authentication
              </span>
              <span className="text-[10px] text-[#0a66c2] font-mono font-medium">2FA Enforced</span>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => handleHardwareAuth('fido2')}
                disabled={!!hardwareAuthLoading}
                className="flex items-center justify-center gap-2 p-2 border border-slate-200 rounded-xl hover:bg-blue-50/60 hover:border-blue-300 transition-all text-xs font-medium text-slate-700 shadow-2xs group cursor-pointer"
                title="Log in using YubiKey or WebAuthn Key"
              >
                <Fingerprint className="w-4 h-4 text-[#0a66c2] group-hover:scale-110 transition-transform" />
                <span>{hardwareAuthLoading === 'fido2' ? 'Verifying...' : 'FIDO2 / YubiKey'}</span>
              </button>

              <button
                type="button"
                onClick={() => handleHardwareAuth('mtls')}
                disabled={!!hardwareAuthLoading}
                className="flex items-center justify-center gap-2 p-2 border border-slate-200 rounded-xl hover:bg-blue-50/60 hover:border-blue-300 transition-all text-xs font-medium text-slate-700 shadow-2xs group cursor-pointer"
                title="Log in using mTLS X.509 Client Certificate"
              >
                <KeyRound className="w-4 h-4 text-[#0a66c2] group-hover:scale-110 transition-transform" />
                <span>{hardwareAuthLoading === 'mtls' ? 'Validating...' : 'mTLS Certificate'}</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Forgot Password Dialog */}
      {showForgotPassword && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-sm w-full p-6 space-y-4 shadow-2xl border border-slate-200">
            <div className="flex items-center gap-2 text-[#0a66c2] font-bold text-sm">
              <KeyRound className="w-5 h-5" />
              <span>Administrator Password Recovery</span>
            </div>
            <p className="text-xs text-slate-600 leading-relaxed">
              Enter your authorized operator email to receive a Supabase Auth password reset link.
            </p>

            {resetSent ? (
              <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl text-xs flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>Reset instructions dispatched to your inbox.</span>
              </div>
            ) : (
              <form onSubmit={handleResetPassword} className="space-y-3">
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@smrod.ai"
                  className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#0a66c2]"
                />
                <div className="flex justify-end gap-2 pt-1">
                  <button
                    type="button"
                    onClick={() => setShowForgotPassword(false)}
                    className="px-3 py-1.5 text-xs text-slate-600 hover:bg-slate-100 rounded-lg cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-1.5 text-xs font-bold text-white bg-[#0a66c2] hover:bg-[#084e96] rounded-lg cursor-pointer transition-colors"
                  >
                    Send Reset Link
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
