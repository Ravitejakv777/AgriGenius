import React, { useState } from 'react';
import { Lock, Mail, ArrowRight, KeyRound, AlertCircle, Sparkles } from 'lucide-react';
import { useAdminAuth } from '../context/AdminAuthContext';
import { useAdminTheme } from '../context/AdminThemeContext';
import { AgriGeniusLogo } from '../components/AgriGeniusLogo';
import { DEMO_ADMIN_USERS } from '../lib/mockData';

export function AdminLoginPage() {
  const { login, quickDemoLogin } = useAdminAuth();
  const { theme, toggleTheme } = useAdminTheme();

  const [email, setEmail] = useState('admin@agrigenius.gov.in');
  const [passkey, setPasskey] = useState('admin2026');
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);

    try {
      await login(email, passkey);
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('Authentication failed. Check your security clearance credentials.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen w-full flex flex-col justify-between bg-slate-50 dark:bg-black text-slate-900 dark:text-neutral-100 transition-colors selection:bg-emerald-500/20 selection:text-emerald-300">
      
      {/* Top Banner */}
      <header className="px-6 py-4 flex items-center justify-between border-b border-slate-200 dark:border-neutral-800">
        <div className="flex items-center space-x-2.5">
          <AgriGeniusLogo size="sm" />
          <div>
            <div className="text-sm font-black tracking-tight text-slate-900 dark:text-white">
              AgriGenius Command Center
            </div>
            <div className="text-[10px] font-mono text-slate-500 dark:text-neutral-400">
              National Agriculture AI Directorate & Nodal Console
            </div>
          </div>
        </div>

        <button
          type="button"
          onClick={toggleTheme}
          className="text-xs font-mono px-3 py-1.5 rounded-lg border border-slate-200 dark:border-neutral-800 text-slate-600 dark:text-neutral-300 hover:bg-slate-100 dark:hover:bg-neutral-900 cursor-pointer"
        >
          {theme === 'dark' ? '☀️ Light' : '🌙 Dark'}
        </button>
      </header>

      {/* Main Login Card */}
      <main className="flex-1 flex items-center justify-center p-4 sm:p-6">
        <div className="w-full max-w-md bg-white dark:bg-neutral-950 border border-slate-200 dark:border-neutral-800 rounded-3xl p-6 sm:p-8 shadow-2xl shadow-black/10 dark:shadow-emerald-950/20">
          
          <div className="text-center mb-6">
            <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-emerald-50 dark:bg-neutral-900 text-emerald-600 dark:text-white border border-emerald-200 dark:border-neutral-800 mb-3 shadow-inner">
              <KeyRound className="w-6 h-6" />
            </div>
            <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight">
              Command Gate Verification
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-neutral-400 mt-1">
              Restricted to authorized KCC scientists & platform nodal officers.
            </p>
          </div>

          {error && (
            <div className="mb-5 p-3 rounded-xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900/50 text-red-700 dark:text-red-400 text-xs flex items-center space-x-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-neutral-300 mb-1.5 uppercase font-mono tracking-wider">
                Directorate Email / Official ID
              </label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 dark:text-neutral-500" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin@agrigenius.gov.in"
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-50 dark:bg-neutral-900 border border-slate-200 dark:border-neutral-800 rounded-xl text-xs sm:text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-all font-mono"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-neutral-300 mb-1.5 uppercase font-mono tracking-wider">
                Security Passkey / 2FA Token
              </label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 dark:text-neutral-500" />
                <input
                  type="password"
                  value={passkey}
                  onChange={(e) => setPasskey(e.target.value)}
                  placeholder="••••••••••••"
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-50 dark:bg-neutral-900 border border-slate-200 dark:border-neutral-800 rounded-xl text-xs sm:text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-all font-mono"
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-3 px-4 bg-emerald-600 hover:bg-emerald-500 dark:bg-white dark:hover:bg-neutral-200 text-white dark:text-black rounded-xl text-xs sm:text-sm font-bold transition-all shadow-md flex items-center justify-center space-x-2 cursor-pointer disabled:opacity-50"
            >
              <span>{isSubmitting ? 'Authenticating...' : 'Enter Command Center'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          {/* Quick Demo Access for Evaluators */}
          <div className="mt-6 pt-5 border-t border-slate-200 dark:border-neutral-800">
            <div className="flex items-center justify-between mb-3">
              <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-slate-500 dark:text-neutral-400 flex items-center space-x-1">
                <Sparkles className="w-3.5 h-3.5 text-emerald-500" />
                <span>Instant Evaluation Nodes</span>
              </span>
              <span className="text-[10px] font-mono text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-200 dark:border-emerald-500/20">
                1-Click Sign-in
              </span>
            </div>

            <div className="space-y-2">
              <button
                type="button"
                onClick={() => quickDemoLogin('superadmin')}
                className="w-full p-2.5 text-left rounded-xl bg-slate-50 hover:bg-slate-100 dark:bg-neutral-900 dark:hover:bg-neutral-800 border border-slate-200/80 dark:border-neutral-800 transition-all cursor-pointer flex items-center justify-between group"
              >
                <div>
                  <div className="text-xs font-bold text-slate-900 dark:text-white group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">
                    {DEMO_ADMIN_USERS.superadmin.name}
                  </div>
                  <div className="text-[10px] font-mono text-slate-500 dark:text-neutral-400">
                    {DEMO_ADMIN_USERS.superadmin.clearanceLevel}
                  </div>
                </div>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-100 dark:bg-white/10 text-emerald-800 dark:text-white font-bold">
                  HQ Lead
                </span>
              </button>

              <button
                type="button"
                onClick={() => quickDemoLogin('reviewer')}
                className="w-full p-2.5 text-left rounded-xl bg-slate-50 hover:bg-slate-100 dark:bg-neutral-900 dark:hover:bg-neutral-800 border border-slate-200/80 dark:border-neutral-800 transition-all cursor-pointer flex items-center justify-between group"
              >
                <div>
                  <div className="text-xs font-bold text-slate-900 dark:text-white group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">
                    {DEMO_ADMIN_USERS.reviewer.name}
                  </div>
                  <div className="text-[10px] font-mono text-slate-500 dark:text-neutral-400">
                    {DEMO_ADMIN_USERS.reviewer.clearanceLevel}
                  </div>
                </div>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-blue-100 dark:bg-blue-500/20 text-blue-800 dark:text-blue-300 font-bold">
                  Agronomist
                </span>
              </button>

              <button
                type="button"
                onClick={() => quickDemoLogin('kvk_scientist')}
                className="w-full p-2.5 text-left rounded-xl bg-slate-50 hover:bg-slate-100 dark:bg-neutral-900 dark:hover:bg-neutral-800 border border-slate-200/80 dark:border-neutral-800 transition-all cursor-pointer flex items-center justify-between group"
              >
                <div>
                  <div className="text-xs font-bold text-slate-900 dark:text-white group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">
                    {DEMO_ADMIN_USERS.kvk_scientist.name}
                  </div>
                  <div className="text-[10px] font-mono text-slate-500 dark:text-neutral-400">
                    {DEMO_ADMIN_USERS.kvk_scientist.clearanceLevel}
                  </div>
                </div>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-purple-100 dark:bg-purple-500/20 text-purple-800 dark:text-purple-300 font-bold">
                  KVK Node
                </span>
              </button>
            </div>
          </div>

        </div>
      </main>

      {/* Footer Notice */}
      <footer className="px-6 py-3 border-t border-slate-200 dark:border-neutral-800 text-center text-[10.5px] font-mono text-slate-500 dark:text-neutral-500">
        AgriGenius Telemetry Network • Port 5174 Standalone Operational Environment • Confidential Directorate Data
      </footer>

    </div>
  );
}
