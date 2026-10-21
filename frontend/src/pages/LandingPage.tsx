import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Leaf, MessageSquare } from 'lucide-react';
import { ThemeToggle } from '../components/ThemeToggle';
import { FanWheelHero } from '../components/FanWheelHero';

export function LandingPage() {
  const navigate = useNavigate();

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="h-[100dvh] max-h-[100dvh] w-full flex flex-col justify-between relative overflow-hidden bg-slate-50 dark:bg-black text-slate-900 dark:text-white transition-colors duration-200 select-none touch-none"
      style={{ touchAction: 'none' }}
    >
      {/* Top Navbar */}
      <header className="sticky top-0 z-40 bg-white/70 dark:bg-black/80 backdrop-blur-md border-b border-slate-200/80 dark:border-neutral-800 transition-colors">
        <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-14 sm:h-16">
            {/* Logo */}
            <div 
              className="flex items-center space-x-2 sm:space-x-2.5 cursor-pointer"
              onClick={() => navigate('/')}
            >
              <div className="bg-gradient-to-br from-emerald-500 to-teal-600 dark:from-white dark:to-neutral-200 dark:text-black p-1.5 sm:p-2 rounded-xl shadow-md text-white">
                <Leaf className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-white dark:text-black" />
              </div>
              <div>
                <span className="text-base sm:text-lg font-black text-slate-900 dark:text-white tracking-tight">
                  AgriGenius
                </span>
                <span className="hidden sm:inline-block ml-2 text-[10px] font-mono font-bold uppercase tracking-wider text-emerald-700 dark:text-white bg-emerald-50 dark:bg-neutral-900 px-2 py-0.5 rounded-full border border-emerald-200 dark:border-neutral-800">
                  Wheel of Intelligence
                </span>
              </div>
            </div>

            {/* Quick Actions & Theme Toggle */}
            <div className="flex items-center space-x-2 sm:space-x-3">
              <ThemeToggle />
              <button
                onClick={() => navigate('/chat')}
                className="inline-flex items-center justify-center px-3 py-1.5 sm:px-4 sm:py-2 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-500 dark:bg-white dark:text-black dark:hover:bg-neutral-200 dark:shadow-none rounded-xl shadow-md shadow-emerald-600/25 transition-all cursor-pointer"
              >
                <MessageSquare className="w-3.5 h-3.5 mr-1 sm:mr-1.5" />
                <span className="hidden sm:inline">Open Assistant</span>
                <span className="sm:hidden">Assistant</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* The 3D Wheel Hero */}
      <main className="flex-1 flex flex-col justify-center relative z-10">
        <FanWheelHero />
      </main>

      {/* Spacing for fixed GlobalBottomNav */}
      <div className="h-16 w-full shrink-0 pointer-events-none" />

    </motion.div>
  );
}
