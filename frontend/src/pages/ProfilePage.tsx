import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Leaf,
  ShieldCheck,
  LogOut,
  ArrowLeft,
  CheckCircle2,
  Mail,
  MapPin,
  Phone,
  Calendar,
  User as UserIcon,
  MessageSquare,
  FileText
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { ThemeToggle } from '../components/ThemeToggle';

export function ProfilePage() {
  const navigate = useNavigate();
  const { user, isAuthenticated, isAdmin, logout } = useAuth();

  useEffect(() => {
    if (!isAuthenticated || !user) {
      navigate('/', { replace: true });
    }
  }, [isAuthenticated, user, navigate]);

  const handleSignOut = () => {
    logout();
    navigate('/');
  };

  // If user is not authenticated, redirect to landing page
  if (!isAuthenticated || !user) {
    return null;
  }

  // Get user initial for clean avatar (No AI photos)
  const initial = (user.name || 'User').charAt(0).toUpperCase();

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-black text-slate-900 dark:text-white flex flex-col justify-between pb-24 sm:pb-28">
      {/* Top Navbar */}
      <header className="sticky top-0 z-40 bg-white/80 dark:bg-black/80 backdrop-blur-md border-b border-slate-200/80 dark:border-neutral-900 transition-colors">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 h-14 sm:h-16 flex items-center justify-between">
          
          {/* Logo & Breadcrumb */}
          <div className="flex items-center space-x-3">
            <button
              type="button"
              onClick={() => navigate(-1)}
              className="p-1.5 rounded-xl hover:bg-slate-100 dark:hover:bg-neutral-900 text-slate-500 dark:text-neutral-400 transition-colors cursor-pointer"
              title="Go back"
            >
              <ArrowLeft className="w-4 h-4" />
            </button>

            <div
              className="flex items-center space-x-2.5 cursor-pointer"
              onClick={() => navigate('/')}
            >
              <div className="bg-emerald-600 dark:bg-white text-white dark:text-black p-1.5 sm:p-2 rounded-xl shadow-md">
                <Leaf className="w-4 h-4" />
              </div>
              <div>
                <span className="text-base sm:text-lg font-black tracking-tight">AgriGenius</span>
                <span className="ml-2 text-[10px] font-mono font-bold uppercase tracking-wider text-emerald-700 dark:text-white bg-emerald-50 dark:bg-neutral-900 px-2 py-0.5 rounded-full border border-emerald-200 dark:border-neutral-800">
                  Profile
                </span>
              </div>
            </div>
          </div>

          {/* Quick Header Actions */}
          <div className="flex items-center space-x-2 sm:space-x-3">
            <ThemeToggle />
            
            <button
              type="button"
              onClick={() => navigate('/chat')}
              className="inline-flex items-center justify-center px-3 py-1.5 sm:px-4 sm:py-2 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-500 dark:bg-white dark:text-black dark:hover:bg-neutral-200 rounded-xl shadow-sm transition-all cursor-pointer"
            >
              <MessageSquare className="w-3.5 h-3.5 mr-1.5" />
              <span>Assistant</span>
            </button>
          </div>

        </div>
      </header>

      {/* Main Profile Page Body */}
      <main className="flex-1 max-w-3xl mx-auto w-full px-4 sm:px-6 py-6 sm:py-8 space-y-6">
        
        {/* ===================================================================== */}
        {/* HERO PROFILE CARD (CLEAN INITIAL AVATAR - NO AI PHOTOS)               */}
        {/* ===================================================================== */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.25 }}
          className="bg-white dark:bg-neutral-950 border border-slate-200 dark:border-neutral-900 rounded-3xl p-6 sm:p-8 shadow-sm relative overflow-hidden"
        >
          {/* Subtle Top Accent Ribbon */}
          <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-emerald-500 via-teal-500 to-emerald-600 dark:from-white dark:via-neutral-400 dark:to-neutral-600" />

          <div className="flex flex-col sm:flex-row items-center sm:items-start space-y-4 sm:space-y-0 sm:space-x-6 text-center sm:text-left pt-2">
            
            {/* Clean Initial Avatar (No AI Photo) */}
            <div className="relative shrink-0">
              <div className="w-20 h-20 sm:w-22 sm:h-22 rounded-full bg-[#6200ee] text-white flex items-center justify-center text-3xl font-bold shadow-md select-none">
                {initial}
              </div>
              <div
                title="Verified User"
                className="absolute -bottom-1 -right-1 bg-emerald-500 dark:bg-white text-white dark:text-black p-1.5 rounded-full shadow-md"
              >
                <CheckCircle2 className="w-4 h-4" />
              </div>
            </div>

            {/* Profile Info & Role Tag */}
            <div className="flex-1 min-w-0">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div>
                  <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-slate-900 dark:text-white">
                    {user.name}
                  </h1>
                  <p className="text-xs sm:text-sm text-slate-500 dark:text-neutral-400 font-mono mt-0.5 flex items-center justify-center sm:justify-start space-x-1.5">
                    <Mail className="w-3.5 h-3.5" />
                    <span>{user.email}</span>
                  </p>
                </div>

                {/* Role Badge */}
                <div className="inline-flex items-center justify-center self-center sm:self-start px-3 py-1 rounded-full text-xs font-mono font-bold uppercase tracking-wider bg-emerald-50 text-emerald-800 border border-emerald-200 dark:bg-white/10 dark:text-white dark:border-white/20">
                  {user.role === 'admin' ? (
                    <>
                      <ShieldCheck className="w-3.5 h-3.5 mr-1 text-emerald-600 dark:text-white" />
                      <span>National Admin</span>
                    </>
                  ) : (
                    <>
                      <Leaf className="w-3.5 h-3.5 mr-1 text-emerald-600 dark:text-white" />
                      <span>Farmer Portal</span>
                    </>
                  )}
                </div>
              </div>

              {/* Status Pills */}
              <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2 pt-3 text-xs">
                <span className="inline-flex items-center px-2.5 py-1 rounded-lg bg-emerald-50 text-emerald-700 dark:bg-neutral-900 dark:text-emerald-400 border border-emerald-200 dark:border-neutral-800 font-medium">
                  <CheckCircle2 className="w-3 h-3 mr-1 text-emerald-500" />
                  Verified Account
                </span>

                <span className="inline-flex items-center px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-neutral-900 border border-slate-200 dark:border-neutral-800 text-slate-600 dark:text-neutral-400">
                  <MapPin className="w-3 h-3 mr-1 text-slate-400 dark:text-neutral-500" />
                  {user.place || user.state || 'Andhra Pradesh, India'}
                </span>
              </div>
            </div>

          </div>
        </motion.div>

        {/* ===================================================================== */}
        {/* USER DETAILS CARD (CLEAN PERSONAL INFORMATION ONLY)                  */}
        {/* ===================================================================== */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.25, delay: 0.05 }}
          className="bg-white dark:bg-neutral-950 border border-slate-200 dark:border-neutral-900 rounded-3xl p-6 sm:p-7 shadow-sm"
        >
          <div className="flex items-center space-x-2.5 pb-4 mb-4 border-b border-slate-100 dark:border-neutral-900">
            <div className="w-8 h-8 rounded-xl bg-slate-100 dark:bg-neutral-900 border border-slate-200 dark:border-neutral-800 flex items-center justify-center text-slate-700 dark:text-white">
              <UserIcon className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-slate-900 dark:text-white">Personal Information</h2>
              <p className="text-[11px] text-slate-500 dark:text-neutral-400">Registered Account Profile</p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            {/* Full Name */}
            <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-neutral-900/60 border border-slate-100 dark:border-neutral-800/80">
              <span className="text-[11px] text-slate-400 dark:text-neutral-500 block mb-0.5 font-medium">Full Name</span>
              <div className="flex items-center space-x-2 text-slate-900 dark:text-white font-semibold text-sm">
                <UserIcon className="w-4 h-4 text-emerald-600 dark:text-neutral-400 shrink-0" />
                <span>{user.name}</span>
              </div>
            </div>

            {/* Email Address */}
            <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-neutral-900/60 border border-slate-100 dark:border-neutral-800/80">
              <span className="text-[11px] text-slate-400 dark:text-neutral-500 block mb-0.5 font-medium">Email Address</span>
              <div className="flex items-center space-x-2 text-slate-900 dark:text-white font-semibold text-sm truncate">
                <Mail className="w-4 h-4 text-emerald-600 dark:text-neutral-400 shrink-0" />
                <span className="truncate">{user.email}</span>
              </div>
            </div>

            {/* Phone Number */}
            <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-neutral-900/60 border border-slate-100 dark:border-neutral-800/80">
              <span className="text-[11px] text-slate-400 dark:text-neutral-500 block mb-0.5 font-medium">Phone Number</span>
              <div className="flex items-center space-x-2 text-slate-900 dark:text-white font-semibold text-sm">
                <Phone className="w-4 h-4 text-emerald-600 dark:text-neutral-400 shrink-0" />
                <span>{user.phone || '+91 98765 43210'}</span>
              </div>
            </div>

            {/* Date of Birth */}
            <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-neutral-900/60 border border-slate-100 dark:border-neutral-800/80">
              <span className="text-[11px] text-slate-400 dark:text-neutral-500 block mb-0.5 font-medium">Date of Birth (DOB)</span>
              <div className="flex items-center space-x-2 text-slate-900 dark:text-white font-semibold text-sm">
                <Calendar className="w-4 h-4 text-emerald-600 dark:text-neutral-400 shrink-0" />
                <span>{user.dob || '15/08/1995'}</span>
              </div>
            </div>

            {/* Place / Location */}
            <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-neutral-900/60 border border-slate-100 dark:border-neutral-800/80 sm:col-span-2">
              <span className="text-[11px] text-slate-400 dark:text-neutral-500 block mb-0.5 font-medium">Place / Location</span>
              <div className="flex items-center space-x-2 text-slate-900 dark:text-white font-semibold text-sm">
                <MapPin className="w-4 h-4 text-emerald-600 dark:text-neutral-400 shrink-0" />
                <span>{user.place || user.state || 'Andhra Pradesh, India'}</span>
              </div>
            </div>
          </div>
        </motion.div>

        {/* ===================================================================== */}
        {/* QUICK NAVIGATION & ACTIONS                                            */}
        {/* ===================================================================== */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.25, delay: 0.1 }}
          className="bg-white dark:bg-neutral-950 border border-slate-200 dark:border-neutral-900 rounded-3xl p-6 shadow-sm space-y-4"
        >
          <h2 className="text-sm font-bold text-slate-900 dark:text-white">Account Actions</h2>
          
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {/* Action 1: Open Assistant */}
            <button
              type="button"
              onClick={() => navigate('/chat')}
              className="p-4 bg-slate-50 hover:bg-slate-100 dark:bg-neutral-900 dark:hover:bg-neutral-800/80 border border-slate-200 dark:border-neutral-800 rounded-2xl text-left transition-all cursor-pointer group"
            >
              <MessageSquare className="w-5 h-5 text-emerald-600 dark:text-white mb-2 group-hover:scale-110 transition-transform" />
              <div className="text-xs font-bold text-slate-900 dark:text-white">AI Crop Advisory</div>
              <div className="text-[11px] text-slate-500 dark:text-neutral-400 mt-0.5">Ask questions & diagnosis</div>
            </button>

            {/* Action 2: Open Report or Admin */}
            {isAdmin ? (
              <button
                type="button"
                onClick={() => navigate('/admin')}
                className="p-4 bg-slate-50 hover:bg-slate-100 dark:bg-neutral-900 dark:hover:bg-neutral-800/80 border border-slate-200 dark:border-neutral-800 rounded-2xl text-left transition-all cursor-pointer group"
              >
                <ShieldCheck className="w-5 h-5 text-emerald-600 dark:text-white mb-2 group-hover:scale-110 transition-transform" />
                <div className="text-xs font-bold text-slate-900 dark:text-white">Admin Dashboard</div>
                <div className="text-[11px] text-slate-500 dark:text-neutral-400 mt-0.5">Manage portal system</div>
              </button>
            ) : (
              <button
                type="button"
                onClick={() => navigate('/report')}
                className="p-4 bg-slate-50 hover:bg-slate-100 dark:bg-neutral-900 dark:hover:bg-neutral-800/80 border border-slate-200 dark:border-neutral-800 rounded-2xl text-left transition-all cursor-pointer group"
              >
                <FileText className="w-5 h-5 text-emerald-600 dark:text-white mb-2 group-hover:scale-110 transition-transform" />
                <div className="text-xs font-bold text-slate-900 dark:text-white">Advisory Reports</div>
                <div className="text-[11px] text-slate-500 dark:text-neutral-400 mt-0.5">View diagnosis reports</div>
              </button>
            )}

            {/* Action 3: Sign Out */}
            <button
              type="button"
              onClick={handleSignOut}
              className="p-4 bg-rose-50/60 hover:bg-rose-50 dark:bg-neutral-900 dark:hover:bg-rose-950/30 border border-rose-200/80 dark:border-neutral-800 rounded-2xl text-left transition-all cursor-pointer group"
            >
              <LogOut className="w-5 h-5 text-rose-600 dark:text-rose-400 mb-2 group-hover:scale-110 transition-transform" />
              <div className="text-xs font-bold text-rose-700 dark:text-rose-400">Sign Out of AgriGenius</div>
              <div className="text-[11px] text-rose-600/70 dark:text-rose-400/70 mt-0.5">End active session cleanly</div>
            </button>
          </div>
        </motion.div>

      </main>

      {/* Footer */}
      <footer className="w-full py-4 text-center border-t border-slate-200/60 dark:border-neutral-900 text-slate-400 dark:text-neutral-600 text-xs">
        <p>© 2026 AgriGenius — National Agricultural AI Advisory Platform</p>
      </footer>
    </div>
  );
}
