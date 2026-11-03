import React, { useState } from 'react';
import { UserRole } from '../types/smrod';
import { User, Shield, Key, Bell, Check, Save } from 'lucide-react';

interface SettingsViewProps {
  activeRole: UserRole;
  onRoleChange: (role: UserRole) => void;
}

export const SettingsView: React.FC<SettingsViewProps> = ({ activeRole, onRoleChange }) => {
  const [fullName, setFullName] = useState('Grace Omondi');
  const [email, setEmail] = useState('grace.omondi@smrod.ai');
  const [phone, setPhone] = useState('+254 712 998 844');
  const [saved, setSaved] = useState(false);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <div className="space-y-6 max-w-4xl">
      <div>
        <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">
          Identity &amp; Credentials
        </div>
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900">
          Administrator Profile &amp; Preferences
        </h1>
        <p className="text-xs text-slate-500 mt-1">
          Configure personal credentials, multi-factor authentication, and incident alert notifications.
        </p>
      </div>

      <form onSubmit={handleSave} className="space-y-6">
        <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-xs space-y-4">
          <div className="flex items-center gap-2 pb-2 border-b border-slate-100">
            <User className="w-4 h-4 text-indigo-600" />
            <h2 className="text-sm font-bold text-slate-900">Personal Information</h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Full Name</label>
              <input
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-600 focus:bg-white"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Email Address</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-600 focus:bg-white"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Phone Number</label>
              <input
                type="text"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-600 focus:bg-white"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Active Platform Role</label>
              <select
                value={activeRole}
                onChange={(e) => onRoleChange(e.target.value as UserRole)}
                className="w-full px-3 py-2 text-xs font-semibold uppercase bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-600 focus:bg-white"
              >
                <option value="super_admin">Super Admin (All Privileges)</option>
                <option value="admin">Admin (Vehicle &amp; Device Manager)</option>
                <option value="operations">Operations (Incident Triage)</option>
                <option value="support">Support (Hardware Diagnostics)</option>
                <option value="viewer">Viewer (Read-Only)</option>
              </select>
            </div>
          </div>
        </div>

        {/* Security & MFA */}
        <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-xs space-y-4">
          <div className="flex items-center gap-2 pb-2 border-b border-slate-100">
            <Shield className="w-4 h-4 text-emerald-600" />
            <h2 className="text-sm font-bold text-slate-900">Security &amp; 2FA Enforcement</h2>
          </div>

          <div className="flex items-center justify-between p-3.5 bg-slate-50 rounded-xl border border-slate-200">
            <div>
              <div className="text-xs font-semibold text-slate-900">Two-Factor Authentication (TOTP)</div>
              <div className="text-[11px] text-slate-500">Google Authenticator or YubiKey hardware token</div>
            </div>
            <span className="text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
              Active &amp; Enforced
            </span>
          </div>

          <div className="flex items-center justify-between p-3.5 bg-slate-50 rounded-xl border border-slate-200">
            <div>
              <div className="text-xs font-semibold text-slate-900">Supabase Auth Session</div>
              <div className="text-[11px] font-mono text-slate-500">ID: 8f7a2c10-d39b-4b12-9c1a-829019283741</div>
            </div>
            <span className="text-[11px] font-semibold text-slate-600">
              Expires in 54 mins
            </span>
          </div>
        </div>

        <div className="flex justify-end">
          <button
            type="submit"
            className="inline-flex items-center gap-2 px-5 py-2.5 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg transition-colors shadow-xs"
          >
            {saved ? <Check className="w-4 h-4" /> : <Save className="w-4 h-4" />}
            <span>{saved ? 'Profile Updated' : 'Save Changes'}</span>
          </button>
        </div>
      </form>
    </div>
  );
};
