import React, { useState } from 'react';
import { AlertCircle, CheckCircle2, KeyRound, Lock } from 'lucide-react';
import { supabase } from '../services/supabaseClient';

interface PasswordRecoveryPageProps {
  onComplete: () => void;
}

export const PasswordRecoveryPage: React.FC<PasswordRecoveryPageProps> = ({ onComplete }) => {
  const [password, setPassword] = useState('');
  const [confirmation, setConfirmation] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError(null);

    if (password.length < 6) {
      setError('Use a password with at least 6 characters.');
      return;
    }
    if (password !== confirmation) {
      setError('The passwords do not match.');
      return;
    }

    setIsSaving(true);
    const { error: updateError } = await supabase.auth.updateUser({ password });
    setIsSaving(false);

    if (updateError) {
      setError(updateError.message);
      return;
    }

    setSaved(true);
    setTimeout(onComplete, 1200);
  };

  return (
    <div className="min-h-screen w-full bg-[#05172e] flex items-center justify-center p-4">
      <div className="w-full max-w-sm bg-white rounded-2xl p-6 shadow-2xl">
        <div className="flex items-center gap-2 text-[#0a66c2] font-bold text-sm">
          <KeyRound className="w-5 h-5" />
          <span>Set a new password</span>
        </div>
        <p className="mt-3 text-xs text-slate-600">
          Choose a new password for your SMROD operator account.
        </p>

        {saved ? (
          <div className="mt-5 p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl text-xs flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            Password updated. Redirecting to sign in...
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="mt-5 space-y-3">
            <label className="block text-xs font-medium text-slate-700">
              New password
              <div className="relative mt-1">
                <Lock className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  className="w-full pl-10 pr-3 py-2 text-xs border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#0a66c2]"
                />
              </div>
            </label>
            <label className="block text-xs font-medium text-slate-700">
              Confirm password
              <div className="relative mt-1">
                <Lock className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
                <input
                  type="password"
                  required
                  value={confirmation}
                  onChange={(event) => setConfirmation(event.target.value)}
                  className="w-full pl-10 pr-3 py-2 text-xs border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#0a66c2]"
                />
              </div>
            </label>
            {error && (
              <div className="p-3 bg-red-50 border border-red-200 text-red-700 rounded-xl text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                {error}
              </div>
            )}
            <button
              type="submit"
              disabled={isSaving}
              className="w-full py-2.5 rounded-xl bg-[#0a66c2] hover:bg-[#084e96] disabled:opacity-60 text-white text-xs font-bold"
            >
              {isSaving ? 'Updating...' : 'Update password'}
            </button>
          </form>
        )}
      </div>
    </div>
  );
};
