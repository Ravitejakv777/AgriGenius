import { useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Home, 
  MessageSquare, 
  BarChart3, 
  FileText, 
  Users, 
  ShieldCheck,
  Activity
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const SMOOTH_EASE = [0.32, 0.72, 0, 1] as const;

export function GlobalBottomNav() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, isAuthenticated, isAdmin } = useAuth();

  // Hide bottom nav specifically on Auth and Login pages as requested
  if (location.pathname === '/auth' || location.pathname === '/login') {
    return null;
  }

  // Metrics is moved to the last position and only unhidden when on Team (or viewing Metrics)
  const isTeamOrMetrics = location.pathname === '/team' || location.pathname === '/about' || location.pathname === '/metrics';
  const isAdminActive = location.pathname === '/admin';
  const showAdminTab = isAdmin || isAdminActive;

  const baseNavItems = [
    { label: 'Home', shortLabel: 'Home', path: '/', icon: Home },
    { label: 'AI Assistant', shortLabel: 'Assistant', path: '/chat', icon: MessageSquare },
    { label: 'Report', shortLabel: 'Report', path: '/report', icon: FileText },
    { label: 'LLM QA', shortLabel: 'LLM QA', path: '/evaluation', icon: Activity },
    { label: 'Team', shortLabel: 'Team', path: '/team', icon: Users },
  ];

  const isMetricsActive = location.pathname === '/about' || location.pathname === '/metrics';

  return (
    <>
      <nav
        aria-label="Bottom Navigation"
        className="fixed bottom-2 sm:bottom-3 left-1/2 -translate-x-1/2 z-[10001] pointer-events-none select-none max-w-[calc(100vw-1rem)] mb-[env(safe-area-inset-bottom,0px)]"
      >
        <motion.div
          layout
          transition={{ layout: { duration: 0.32, ease: SMOOTH_EASE } }}
          className="bg-white/95 dark:bg-neutral-900/95 backdrop-blur-2xl border border-slate-200/90 dark:border-neutral-800/90 shadow-[0_10px_35px_rgba(0,0,0,0.2)] rounded-2xl p-1 sm:p-1.5 flex items-center justify-center pointer-events-auto overflow-hidden"
        >
          {baseNavItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;

            return (
              <motion.button
                layout="position"
                transition={{ layout: { duration: 0.32, ease: SMOOTH_EASE } }}
                key={item.label}
                type="button"
                onClick={() => navigate(item.path)}
                className="relative flex items-center space-x-1 sm:space-x-1.5 px-2.5 py-1.5 sm:px-4 sm:py-2.5 mx-0.5 rounded-xl text-xs font-semibold cursor-pointer select-none transition-colors shrink-0"
              >
                {/* Smooth Sliding Active Highlight */}
                {isActive && (
                  <motion.div
                    layoutId="activeBottomNavHighlight"
                    className="absolute inset-0 bg-emerald-50 dark:bg-white/15 border border-emerald-500/40 dark:border-white/30 rounded-xl shadow-sm z-0"
                    transition={{ type: 'spring', stiffness: 420, damping: 30 }}
                  />
                )}
                <Icon
                  className={`relative z-10 w-3.5 h-3.5 sm:w-4 sm:h-4 transition-colors duration-200 ${
                    isActive ? 'text-emerald-600 dark:text-white font-bold' : 'text-slate-400 dark:text-neutral-500'
                  }`}
                />
                <span
                  className={`relative z-10 text-[10.5px] sm:text-xs transition-colors duration-200 ${
                    isActive ? 'text-emerald-700 dark:text-white font-bold' : 'text-slate-600 dark:text-neutral-400'
                  }`}
                >
                  <span className="hidden sm:inline">{item.label}</span>
                  <span className="sm:hidden">{item.shortLabel}</span>
                </span>
              </motion.button>
            );
          })}

          {/* Smooth Animated Admin Tab (Only when Admin or viewing Admin console) */}
          <AnimatePresence mode="sync">
            {showAdminTab && (
              <motion.div
                key="admin-tab-wrapper"
                layout
                initial={{ opacity: 0, width: 0, scale: 0.9, marginLeft: 0, marginRight: 0 }}
                animate={{
                  opacity: 1,
                  width: 'auto',
                  scale: 1,
                  marginLeft: 2,
                  marginRight: 2,
                  transition: {
                    width: { duration: 0.32, ease: SMOOTH_EASE },
                    marginLeft: { duration: 0.32, ease: SMOOTH_EASE },
                    marginRight: { duration: 0.32, ease: SMOOTH_EASE },
                    opacity: { duration: 0.22, ease: 'easeOut' },
                    scale: { duration: 0.24, ease: 'easeOut' },
                    layout: { duration: 0.32, ease: SMOOTH_EASE },
                  },
                }}
                exit={{
                  opacity: 0,
                  width: 0,
                  scale: 0.9,
                  marginLeft: 0,
                  marginRight: 0,
                  transition: {
                    opacity: { duration: 0.12, ease: 'easeOut' },
                    width: { duration: 0.3, ease: SMOOTH_EASE },
                    marginLeft: { duration: 0.3, ease: SMOOTH_EASE },
                    marginRight: { duration: 0.3, ease: SMOOTH_EASE },
                    scale: { duration: 0.2, ease: 'easeIn' },
                    layout: { duration: 0.3, ease: SMOOTH_EASE },
                  },
                }}
                style={{ originX: 1 }}
                className="overflow-hidden flex items-center shrink-0"
              >
                <button
                  type="button"
                  onClick={() => navigate('/admin')}
                  className="relative flex items-center space-x-1 sm:space-x-1.5 px-2.5 py-1.5 sm:px-4 sm:py-2.5 rounded-xl text-xs font-semibold cursor-pointer select-none transition-colors whitespace-nowrap"
                >
                  {isAdminActive && (
                    <motion.div
                      layoutId="activeBottomNavHighlight"
                      className="absolute inset-0 bg-emerald-50 dark:bg-white/15 border border-emerald-500/40 dark:border-white/30 rounded-xl shadow-sm z-0"
                      transition={{ type: 'spring', stiffness: 420, damping: 30 }}
                    />
                  )}
                  <ShieldCheck
                    className={`relative z-10 w-3.5 h-3.5 sm:w-4 sm:h-4 transition-colors duration-200 ${
                      isAdminActive ? 'text-emerald-600 dark:text-white font-bold' : 'text-slate-400 dark:text-neutral-500'
                    }`}
                  />
                  <span
                    className={`relative z-10 text-[10.5px] sm:text-xs transition-colors duration-200 ${
                      isAdminActive ? 'text-emerald-700 dark:text-white font-bold' : 'text-slate-600 dark:text-neutral-400'
                    }`}
                  >
                    Admin
                  </span>
                </button>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Smooth Animated Metrics Tab (Zero-footprint exit to completely eliminate any jerk) */}
          <AnimatePresence mode="sync">
            {isTeamOrMetrics && (
              <motion.div
                key="metrics-tab-wrapper"
                layout
                initial={{ opacity: 0, width: 0, scale: 0.9, marginLeft: 0, marginRight: 0 }}
                animate={{
                  opacity: 1,
                  width: 'auto',
                  scale: 1,
                  marginLeft: 2,
                  marginRight: 2,
                  transition: {
                    width: { duration: 0.32, ease: SMOOTH_EASE },
                    marginLeft: { duration: 0.32, ease: SMOOTH_EASE },
                    marginRight: { duration: 0.32, ease: SMOOTH_EASE },
                    opacity: { duration: 0.22, ease: 'easeOut' },
                    scale: { duration: 0.24, ease: 'easeOut' },
                    layout: { duration: 0.32, ease: SMOOTH_EASE },
                  },
                }}
                exit={{
                  opacity: 0,
                  width: 0,
                  scale: 0.9,
                  marginLeft: 0,
                  marginRight: 0,
                  transition: {
                    opacity: { duration: 0.12, ease: 'easeOut' },
                    width: { duration: 0.3, ease: SMOOTH_EASE },
                    marginLeft: { duration: 0.3, ease: SMOOTH_EASE },
                    marginRight: { duration: 0.3, ease: SMOOTH_EASE },
                    scale: { duration: 0.2, ease: 'easeIn' },
                    layout: { duration: 0.3, ease: SMOOTH_EASE },
                  },
                }}
                style={{ originX: 1 }}
                className="overflow-hidden flex items-center shrink-0"
              >
                <button
                  type="button"
                  onClick={() => navigate('/about')}
                  className="relative flex items-center space-x-1 sm:space-x-1.5 px-2.5 py-1.5 sm:px-4 sm:py-2.5 rounded-xl text-xs font-semibold cursor-pointer select-none transition-colors whitespace-nowrap"
                >
                  {isMetricsActive && (
                    <motion.div
                      layoutId="activeBottomNavHighlight"
                      className="absolute inset-0 bg-emerald-50 dark:bg-white/15 border border-emerald-500/40 dark:border-white/30 rounded-xl shadow-sm z-0"
                      transition={{ type: 'spring', stiffness: 420, damping: 30 }}
                    />
                  )}
                  <BarChart3
                    className={`relative z-10 w-3.5 h-3.5 sm:w-4 sm:h-4 transition-colors duration-200 ${
                      isMetricsActive ? 'text-emerald-600 dark:text-white font-bold' : 'text-slate-400 dark:text-neutral-500'
                    }`}
                  />
                  <span
                    className={`relative z-10 text-[10.5px] sm:text-xs transition-colors duration-200 ${
                      isMetricsActive ? 'text-emerald-700 dark:text-white font-bold' : 'text-slate-600 dark:text-neutral-400'
                    }`}
                  >
                    Metrics
                  </span>
                </button>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Profile Tab when Authenticated (Navigates to dedicated /profile page) */}
          {isAuthenticated && user && (
            <motion.div
              layout="position"
              transition={{ layout: { duration: 0.32, ease: SMOOTH_EASE } }}
              className="flex items-center shrink-0"
            >
              <button
                type="button"
                onClick={() => navigate('/profile')}
                className="relative flex items-center space-x-1 sm:space-x-1.5 px-2.5 py-1.5 sm:px-4 sm:py-2.5 mx-0.5 rounded-xl text-xs font-semibold cursor-pointer select-none transition-colors shrink-0 group"
                title="View Dedicated Profile Page"
              >
                {location.pathname === '/profile' && (
                  <motion.div
                    layoutId="activeBottomNavHighlight"
                    className="absolute inset-0 bg-emerald-50 dark:bg-white/15 border border-emerald-500/40 dark:border-white/30 rounded-xl shadow-sm z-0"
                    transition={{ type: 'spring', stiffness: 420, damping: 30 }}
                  />
                )}
                <div className="relative z-10 w-4 h-4 rounded-full bg-emerald-600 dark:bg-white text-white dark:text-black flex items-center justify-center text-[10px] font-bold shrink-0">
                  {user.name.charAt(0).toUpperCase()}
                </div>
                <span
                  className={`relative z-10 text-[10.5px] sm:text-xs transition-colors duration-200 ${
                    location.pathname === '/profile'
                      ? 'text-emerald-700 dark:text-white font-bold'
                      : 'text-slate-600 dark:text-neutral-400 group-hover:text-slate-900 dark:group-hover:text-white'
                  }`}
                >
                  Profile
                </span>
              </button>
            </motion.div>
          )}

        </motion.div>
      </nav>
    </>
  );
}
