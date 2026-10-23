import { ShieldCheck, Sun, Moon, LogOut, Database } from 'lucide-react';
import { useAdminAuth } from '../context/AdminAuthContext';
import { useAdminTheme } from '../context/AdminThemeContext';
import type { DbStatus } from '../lib/types';

interface AdminNavbarProps {
  dbStatus?: DbStatus | null;
}

export function AdminNavbar({ dbStatus }: AdminNavbarProps) {
  const { adminUser, logout } = useAdminAuth();
  const { theme, toggleTheme } = useAdminTheme();

  return (
    <header className="sticky top-0 z-40 bg-white/90 dark:bg-black/95 backdrop-blur-xl border-b border-slate-200/90 dark:border-neutral-800 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          
          {/* Left: Brand & Database Badge */}
          <div className="flex items-center space-x-3 sm:space-x-4">
            <div className="flex items-center space-x-2.5">
              <div className="w-9 h-9 rounded-xl bg-emerald-600 dark:bg-white text-white dark:text-black flex items-center justify-center shadow-md shadow-emerald-500/20 font-bold">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center space-x-2">
                  <span className="text-base sm:text-lg font-black tracking-tight text-slate-900 dark:text-white">
                    AgriGenius
                  </span>
                  <span className="px-2 py-0.5 text-[10px] font-mono font-bold uppercase rounded bg-emerald-100 dark:bg-emerald-500/10 text-emerald-800 dark:text-emerald-400 border border-emerald-300 dark:border-emerald-500/30">
                    Admin Portal
                  </span>
                </div>
                <div className="text-[11px] text-slate-500 dark:text-neutral-400 font-mono hidden sm:block">
                  Neon Database & User Management Console
                </div>
              </div>
            </div>

            {/* Live Database Beacon */}
            <div className="hidden lg:flex items-center space-x-2 pl-4 border-l border-slate-200 dark:border-neutral-800">
              <span className="relative flex h-2 w-2">
                <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${
                  dbStatus?.status === 'error' ? 'bg-amber-400' : 'bg-emerald-400'
                }`} />
                <span className={`relative inline-flex rounded-full h-2 w-2 ${
                  dbStatus?.status === 'error' ? 'bg-amber-500' : 'bg-emerald-500'
                }`} />
              </span>
              <span className="text-xs font-mono font-semibold text-slate-700 dark:text-neutral-300 flex items-center space-x-1.5">
                <Database className="w-3.5 h-3.5 text-emerald-500" />
                <span>
                  {dbStatus?.host ? `Neon DB Connected (${dbStatus.host})` : 'Neon DB Connected'}
                </span>
              </span>
            </div>
          </div>

          {/* Right: User Clearance & Controls */}
          <div className="flex items-center space-x-2 sm:space-x-3">
            
            {/* Admin User Badge */}
            {adminUser && (
              <div className="flex items-center space-x-2.5 px-2.5 py-1 rounded-xl bg-slate-100 dark:bg-neutral-900 border border-slate-200 dark:border-neutral-800">
                <div className="w-6 h-6 rounded-full bg-emerald-600 dark:bg-white text-white dark:text-black flex items-center justify-center text-[10px] font-bold font-mono">
                  {adminUser.name.split(' ').map(n => n[0]).slice(0, 2).join('')}
                </div>
                <div className="text-left hidden sm:block">
                  <div className="text-xs font-bold text-slate-900 dark:text-white leading-tight">
                    {adminUser.name}
                  </div>
                  <div className="text-[9.5px] font-mono text-emerald-600 dark:text-emerald-400">
                    Administrator
                  </div>
                </div>
              </div>
            )}

            {/* Theme Toggle */}
            <button
              type="button"
              onClick={toggleTheme}
              className="p-2 rounded-xl text-slate-600 dark:text-neutral-300 hover:bg-slate-100 dark:hover:bg-neutral-900 border border-slate-200 dark:border-neutral-800 transition-colors cursor-pointer"
              title={`Switch to ${theme === 'dark' ? 'Light' : 'Dark'} Mode`}
            >
              {theme === 'dark' ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-slate-700" />}
            </button>

            {/* Logout Button */}
            <button
              type="button"
              onClick={logout}
              className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-xl text-xs font-bold text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/40 border border-red-200 dark:border-red-900/50 transition-colors cursor-pointer"
              title="Sign Out of Admin Console"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Sign Out</span>
            </button>

          </div>

        </div>
      </div>
    </header>
  );
}
