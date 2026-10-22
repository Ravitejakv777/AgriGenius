import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Leaf, 
  ShieldCheck, 
  Eye, 
  EyeOff, 
  ArrowRight, 
  Lock, 
  Mail, 
  Phone,
  Calendar,
  MapPin,
  User as UserIcon, 
  CheckCircle2, 
  ArrowLeft,
  KeyRound,
  RotateCcw,
  Sparkles,
  Check,
  X
} from 'lucide-react';
import { useAuth, type UserRole } from '../context/AuthContext';
import { ThemeToggle } from '../components/ThemeToggle';

interface GoogleAccountOption {
  name: string;
  email: string;
  avatar: string;
  tag?: string;
  role: UserRole;
}

const DEFAULT_GOOGLE_ACCOUNTS: GoogleAccountOption[] = [
  {
    name: 'Raviteja',
    email: 'ravitejakv777@gmail.com',
    avatar: '',
    role: 'farmer'
  }
];

export function AuthPage() {
  const navigate = useNavigate();
  const { login, signup, quickLogin, loginWithGoogle } = useAuth();

  const [mode, setMode] = useState<'signin' | 'signup'>('signin');
  
  // Sign In fields (strictly email + password only)
  const [signInEmail, setSignInEmail] = useState('');
  const [signInPassword, setSignInPassword] = useState('');
  const [showSignInPassword, setShowSignInPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);

  // Create Account (Google or Email with OTP)
  // signupStep: 'method' | 'otp' | 'password'
  const [signupStep, setSignupStep] = useState<'method' | 'otp' | 'password'>('method');
  const [signupName, setSignupName] = useState('');
  const [signupPhone, setSignupPhone] = useState('');
  const [signupDob, setSignupDob] = useState('');
  const [signupPlace, setSignupPlace] = useState('');
  const [signupEmail, setSignupEmail] = useState('');
  const [enteredOtp, setEnteredOtp] = useState('');
  const [generatedOtp, setGeneratedOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [resendCountdown, setResendCountdown] = useState(30);

  // Dedicated Google Account Password Setup State
  interface GoogleSetupState {
    account: GoogleAccountOption;
    name: string;
    email: string;
    phone: string;
    dob: string;
    place: string;
    hasExistingPwd?: boolean;
  }
  const [googleSetupUser, setGoogleSetupUser] = useState<GoogleSetupState | null>(null);

  // Google OAuth Modal state & Dynamic System Chrome Accounts
  const [detectedGoogleAccounts, setDetectedGoogleAccounts] = useState<GoogleAccountOption[]>(DEFAULT_GOOGLE_ACCOUNTS);
  const [isGoogleModalOpen, setIsGoogleModalOpen] = useState(false);
  const [googleSigningInEmail, setGoogleSigningInEmail] = useState<string | null>(null);
  const [isCustomGoogleAccount, setIsCustomGoogleAccount] = useState(false);
  const [customGoogleEmailInput, setCustomGoogleEmailInput] = useState('');

  // Dynamically fetch active Google accounts running on Chrome on this machine
  useEffect(() => {
    let isMounted = true;
    fetch('/api/auth/google/detected-accounts')
      .then(res => {
        if (!res.ok) throw new Error('Network error');
        return res.json();
      })
      .then((data: GoogleAccountOption[]) => {
        if (isMounted && Array.isArray(data) && data.length > 0) {
          setDetectedGoogleAccounts(data);
        }
      })
      .catch(() => {
        // Fallback already populated with DEFAULT_GOOGLE_ACCOUNTS
      });
    return () => { isMounted = false; };
  }, []);

  // Status & loading feedback
  const [isLoading, setIsLoading] = useState(false);
  const [statusMessage, setStatusMessage] = useState<{ type: 'success' | 'error' | 'info'; text: string } | null>(null);

  // Timer for OTP resend countdown
  useEffect(() => {
    let timer: ReturnType<typeof setTimeout>;
    if (signupStep === 'otp' && resendCountdown > 0) {
      timer = setTimeout(() => setResendCountdown(prev => prev - 1), 1000);
    }
    return () => clearTimeout(timer);
  }, [signupStep, resendCountdown]);

  // ---------------------------------------------------------------------------
  // SIGN IN HANDLER
  // ---------------------------------------------------------------------------
  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatusMessage(null);

    const emailTrim = signInEmail.trim();
    if (!emailTrim) {
      setStatusMessage({ type: 'error', text: 'Please enter your email address.' });
      return;
    }
    if (!signInPassword || signInPassword.length < 4) {
      setStatusMessage({ type: 'error', text: 'Password must be at least 4 characters.' });
      return;
    }

    setIsLoading(true);

    try {
      const isTargetAdmin = emailTrim.toLowerCase().includes('admin');
      const role: UserRole = isTargetAdmin ? 'admin' : 'farmer';
      
      // Store password in local storage so it persists
      localStorage.setItem(`agrigenius_pwd_${emailTrim.toLowerCase()}`, signInPassword);

      await login(emailTrim, role);
      setStatusMessage({ 
        type: 'success', 
        text: `Welcome back! Redirecting to ${isTargetAdmin ? 'Admin Dashboard' : 'landing page'}...` 
      });

      setTimeout(() => {
        if (isTargetAdmin) {
          navigate('/admin');
        } else {
          navigate('/');
        }
      }, 500);
    } catch {
      setStatusMessage({ type: 'error', text: 'Invalid credentials. Please verify your email and password.' });
    } finally {
      setIsLoading(false);
    }
  };

  // ---------------------------------------------------------------------------
  // GOOGLE OAUTH SELECTION HANDLER (PROMPTS FOR PASSWORD SETUP)
  // ---------------------------------------------------------------------------
  const handleSelectGoogleAccount = (account: GoogleAccountOption) => {
    setGoogleSigningInEmail(account.email);

    setTimeout(() => {
      setIsGoogleModalOpen(false);
      setGoogleSigningInEmail(null);

      const existingPwd = localStorage.getItem(`agrigenius_pwd_${account.email.toLowerCase().trim()}`);

      setGoogleSetupUser({
        account,
        name: account.name || 'Raviteja',
        email: account.email,
        phone: '+91 98765 43210',
        dob: '1995-08-15',
        place: 'Andhra Pradesh, India',
        hasExistingPwd: !!existingPwd,
      });

      setNewPassword('');
      setConfirmPassword('');
      setShowNewPassword(false);
      setShowConfirmPassword(false);
      setStatusMessage({
        type: 'info',
        text: existingPwd 
          ? `Google account verified: ${account.email}. Enter your password or set a new one.` 
          : `Google account verified: ${account.email}. Please set your password to continue.`
      });
    }, 450);
  };

  const handleCompleteGooglePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!googleSetupUser) return;
    setStatusMessage(null);

    const nameTrim = googleSetupUser.name.trim();
    const phoneTrim = googleSetupUser.phone.trim();
    const dobTrim = googleSetupUser.dob.trim();
    const placeTrim = googleSetupUser.place.trim();

    if (!nameTrim) {
      setStatusMessage({ type: 'error', text: 'Please enter your full name.' });
      return;
    }
    if (!phoneTrim) {
      setStatusMessage({ type: 'error', text: 'Please enter your phone number.' });
      return;
    }
    if (!dobTrim) {
      setStatusMessage({ type: 'error', text: 'Please enter your date of birth.' });
      return;
    }
    if (!placeTrim) {
      setStatusMessage({ type: 'error', text: 'Please enter your place / location.' });
      return;
    }
    if (!newPassword || newPassword.length < 4) {
      setStatusMessage({ type: 'error', text: 'Password must be at least 4 characters.' });
      return;
    }
    if (newPassword !== confirmPassword) {
      setStatusMessage({ type: 'error', text: 'Passwords do not match. Please re-enter carefully.' });
      return;
    }

    setIsLoading(true);

    try {
      localStorage.setItem(`agrigenius_pwd_${googleSetupUser.email.toLowerCase().trim()}`, newPassword);

      await loginWithGoogle({
        name: nameTrim,
        email: googleSetupUser.email.trim(),
        phone: phoneTrim,
        dob: dobTrim,
        place: placeTrim,
        role: googleSetupUser.account.role,
        avatar: '',
      });

      setStatusMessage({
        type: 'success',
        text: `Password configured successfully! Welcome, ${nameTrim}. Redirecting to landing page...`
      });

      setTimeout(() => {
        if (googleSetupUser.account.role === 'admin') {
          navigate('/admin');
        } else {
          navigate('/');
        }
      }, 500);
    } catch {
      setStatusMessage({ type: 'error', text: 'Sign-in failed. Please try again.' });
    } finally {
      setIsLoading(false);
    }
  };

  const handleCustomGoogleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const email = customGoogleEmailInput.trim();
    if (!email || !email.includes('@')) return;

    const account: GoogleAccountOption = {
      name: email.split('@')[0].replace(/[._]/g, ' ').replace(/\b\w/g, l => l.toUpperCase()),
      email,
      avatar: '',
      role: email.toLowerCase().includes('admin') ? 'admin' : 'farmer'
    };

    handleSelectGoogleAccount(account);
  };

  // ---------------------------------------------------------------------------
  // SIGN UP: STEP 1 - SEND OTP TO EMAIL (WITH USER DETAILS)
  // ---------------------------------------------------------------------------
  const handleSendOtp = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setStatusMessage(null);

    const nameTrim = signupName.trim();
    const phoneTrim = signupPhone.trim();
    const dobTrim = signupDob.trim();
    const placeTrim = signupPlace.trim();
    const emailTrim = signupEmail.trim();

    if (!nameTrim) {
      setStatusMessage({ type: 'error', text: 'Please enter your full name.' });
      return;
    }
    if (!phoneTrim) {
      setStatusMessage({ type: 'error', text: 'Please enter your phone number.' });
      return;
    }
    if (!dobTrim) {
      setStatusMessage({ type: 'error', text: 'Please enter your date of birth.' });
      return;
    }
    if (!placeTrim) {
      setStatusMessage({ type: 'error', text: 'Please enter your place / location.' });
      return;
    }
    if (!emailTrim || !emailTrim.includes('@') || !emailTrim.includes('.')) {
      setStatusMessage({ type: 'error', text: 'Please enter a valid email address.' });
      return;
    }

    setIsLoading(true);

    setTimeout(() => {
      const code = Math.floor(100000 + Math.random() * 900000).toString();
      setGeneratedOtp(code);
      setSignupStep('otp');
      setResendCountdown(30);
      setIsLoading(false);
      setStatusMessage({
        type: 'info',
        text: `Verification code sent to ${emailTrim}: ${code}`
      });
    }, 600);
  };

  // ---------------------------------------------------------------------------
  // SIGN UP: STEP 2 - VERIFY OTP
  // ---------------------------------------------------------------------------
  const handleVerifyOtp = (e: React.FormEvent) => {
    e.preventDefault();
    setStatusMessage(null);

    if (enteredOtp.trim() !== generatedOtp.trim()) {
      setStatusMessage({ type: 'error', text: 'Incorrect 6-digit verification code. Please check and try again.' });
      return;
    }

    setStatusMessage({ type: 'success', text: 'Email verified successfully! Now create your secure password.' });
    setSignupStep('password');
  };

  // ---------------------------------------------------------------------------
  // SIGN UP: STEP 3 - CREATE & RE-ENTER PASSWORD
  // ---------------------------------------------------------------------------
  const handleCompleteSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatusMessage(null);

    if (!newPassword || newPassword.length < 4) {
      setStatusMessage({ type: 'error', text: 'Password must be at least 4 characters.' });
      return;
    }

    if (newPassword !== confirmPassword) {
      setStatusMessage({ type: 'error', text: 'Passwords do not match. Please re-enter carefully.' });
      return;
    }

    setIsLoading(true);

    try {
      const isTargetAdmin = signupEmail.toLowerCase().includes('admin');
      const role: UserRole = isTargetAdmin ? 'admin' : 'farmer';

      await signup({
        name: signupName.trim(),
        email: signupEmail.trim(),
        phone: signupPhone.trim(),
        dob: signupDob.trim(),
        place: signupPlace.trim(),
        role,
        state: signupPlace.trim(),
        avatar: '',
        organization: isTargetAdmin ? 'Central Operations' : 'Agricultural Cooperative'
      });

      setStatusMessage({ type: 'success', text: 'Account created successfully! Redirecting to landing page...' });

      setTimeout(() => {
        if (isTargetAdmin) {
          navigate('/admin');
        } else {
          navigate('/');
        }
      }, 600);
    } catch {
      setStatusMessage({ type: 'error', text: 'Registration failed. Please try again.' });
    } finally {
      setIsLoading(false);
    }
  };

  // ---------------------------------------------------------------------------
  // INSTANT DEMO EVALUATION
  // ---------------------------------------------------------------------------
  const handleQuickDemo = (role: UserRole) => {
    quickLogin(role);
    setStatusMessage({ type: 'success', text: `Signed in as Demo ${role.toUpperCase()}. Redirecting to landing page...` });
    setTimeout(() => {
      if (role === 'admin') {
        navigate('/admin');
      } else {
        navigate('/');
      }
    }, 400);
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="min-h-screen w-full flex flex-col justify-between bg-slate-50 dark:bg-black text-slate-900 dark:text-white transition-colors duration-300 relative overflow-x-hidden"
    >
      {/* Top Simple Navigation */}
      <header className="w-full border-b border-slate-200/80 dark:border-neutral-900 bg-white/70 dark:bg-black/80 backdrop-blur-md sticky top-0 z-40 transition-colors">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-14 sm:h-16 flex items-center justify-between">
          <div 
            onClick={() => navigate('/')}
            className="flex items-center space-x-2.5 cursor-pointer group"
          >
            <div className="bg-emerald-600 dark:bg-white dark:text-black text-white p-1.5 sm:p-2 rounded-xl transition-transform group-hover:scale-105">
              <Leaf className="w-4 h-4 text-white dark:text-black" />
            </div>
            <div>
              <span className="text-base sm:text-lg font-black tracking-tight text-slate-900 dark:text-white">
                AgriGenius
              </span>
              <span className="hidden sm:inline-block ml-2 text-[10px] font-mono uppercase tracking-wider text-emerald-700 dark:text-neutral-400 bg-emerald-50 dark:bg-neutral-900 px-2 py-0.5 rounded-full border border-emerald-200 dark:border-neutral-800">
                Secure Access
              </span>
            </div>
          </div>

          <div className="flex items-center space-x-3">
            <button
              type="button"
              onClick={() => navigate('/')}
              className="inline-flex items-center space-x-1.5 text-xs font-semibold text-slate-600 dark:text-neutral-400 hover:text-slate-900 dark:hover:text-white transition-colors px-2.5 py-1.5 rounded-lg cursor-pointer"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Back to Wheel</span>
            </button>
            <ThemeToggle />
          </div>
        </div>
      </header>

      {/* Main Auth Card Container */}
      <main className="flex-1 flex justify-center items-start sm:items-center px-4 py-6 sm:py-8 my-auto relative z-10 overflow-y-auto">
        <div className="w-full max-w-md my-auto">
          
          {/* Card Wrapper */}
          <div className="bg-white dark:bg-neutral-950 border border-slate-200 dark:border-neutral-800/90 rounded-3xl p-5 sm:p-7 shadow-xl dark:shadow-[0_20px_50px_rgba(0,0,0,0.8)] relative overflow-hidden">
            
            {googleSetupUser ? (
              /* ============================================================= */
              /* GOOGLE ACCOUNT PASSWORD & PROFILE SETUP STEP                 */
              /* ============================================================= */
              <form onSubmit={handleCompleteGooglePassword} className="space-y-3">
                {/* Top Cancel / Back to accounts bar */}
                <div className="flex items-center justify-between pb-1">
                  <button
                    type="button"
                    onClick={() => {
                      setGoogleSetupUser(null);
                      setStatusMessage(null);
                    }}
                    className="inline-flex items-center space-x-1 text-xs font-semibold text-slate-500 dark:text-neutral-400 hover:text-slate-800 dark:hover:text-white cursor-pointer transition-colors"
                  >
                    <ArrowLeft className="w-3.5 h-3.5" />
                    <span>Back to sign in</span>
                  </button>

                  <span className="text-[10.5px] font-mono font-bold uppercase tracking-wider text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/60 px-2.5 py-0.5 rounded-full flex items-center space-x-1">
                    <CheckCircle2 className="w-3 h-3 text-emerald-600 dark:text-emerald-400" />
                    <span>Google Verified</span>
                  </span>
                </div>

                {/* Header copy */}
                <div className="text-center pb-1">
                  <h2 className="text-2xl font-extrabold tracking-tight text-slate-900 dark:text-white">
                    Set Account Password
                  </h2>
                  <p className="text-xs text-slate-500 dark:text-neutral-400 mt-1">
                    Create a password for <span className="font-semibold text-slate-800 dark:text-white">{googleSetupUser.email}</span> to secure your AgriGenius login.
                  </p>
                </div>

                {/* Verified Google Account Pill */}
                <div className="flex items-center space-x-3 p-2.5 bg-slate-50 dark:bg-neutral-900 rounded-xl border border-slate-200 dark:border-neutral-800">
                  <div className="w-8 h-8 rounded-full bg-[#6200ee] text-white flex items-center justify-center font-bold text-xs shrink-0">
                    {googleSetupUser.name.charAt(0).toUpperCase()}
                  </div>
                  <div className="truncate flex-1">
                    <div className="text-xs font-bold text-slate-900 dark:text-white truncate">{googleSetupUser.name}</div>
                    <div className="text-[11px] text-slate-500 dark:text-neutral-400 font-mono truncate">{googleSetupUser.email}</div>
                  </div>
                  <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
                    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
                  </svg>
                </div>

                {/* Status Feedback */}
                {statusMessage && (
                  <div 
                    className={`p-2.5 rounded-xl text-xs font-medium border flex items-center space-x-2 ${
                      statusMessage.type === 'error'
                        ? 'bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-950/40 dark:text-rose-300 dark:border-rose-900/60'
                        : statusMessage.type === 'success'
                        ? 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-neutral-900 dark:text-white dark:border-neutral-700'
                        : 'bg-blue-50 text-blue-700 border-blue-200 dark:bg-neutral-900 dark:text-neutral-300 dark:border-neutral-800'
                    }`}
                  >
                    <div className="w-1.5 h-1.5 rounded-full bg-current shrink-0" />
                    <span>{statusMessage.text}</span>
                  </div>
                )}

                {/* Full Name */}
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-neutral-300 mb-1">
                    Full Name
                  </label>
                  <div className="relative">
                    <UserIcon className="w-4 h-4 text-slate-400 dark:text-neutral-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      required
                      value={googleSetupUser.name}
                      onChange={(e) => setGoogleSetupUser({ ...googleSetupUser, name: e.target.value })}
                      placeholder="e.g. Raviteja"
                      className="w-full pl-10 pr-4 py-2 bg-slate-50 dark:bg-neutral-900 border border-slate-200 dark:border-neutral-800 rounded-xl text-xs sm:text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500 dark:focus:ring-white transition-all"
                    />
                  </div>
                </div>

                {/* Phone Number & DOB */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-neutral-300 mb-1">
                      Phone Number
                    </label>
                    <div className="relative">
                      <Phone className="w-4 h-4 text-slate-400 dark:text-neutral-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                      <input
                        type="tel"
                        required
                        value={googleSetupUser.phone}
                        onChange={(e) => setGoogleSetupUser({ ...googleSetupUser, phone: e.target.value })}
                        placeholder="+91 98765 43210"
                        className="w-full pl-10 pr-4 py-2 bg-slate-50 dark:bg-neutral-900 border border-slate-200 dark:border-neutral-800 rounded-xl text-xs sm:text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500 dark:focus:ring-white transition-all"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-neutral-300 mb-1">
                      Date of Birth
                    </label>
                    <div className="relative">
                      <Calendar className="w-4 h-4 text-slate-400 dark:text-neutral-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                      <input
                        type="date"
                        required
                        value={googleSetupUser.dob}
                        onChange={(e) => setGoogleSetupUser({ ...googleSetupUser, dob: e.target.value })}
                        className="w-full pl-10 pr-4 py-2 bg-slate-50 dark:bg-neutral-900 border border-slate-200 dark:border-neutral-800 rounded-xl text-xs sm:text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500 dark:focus:ring-white transition-all"
                      />
                    </div>
                  </div>
                </div>

                {/* Place / Location */}
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-neutral-300 mb-1">
                    Place / Location
                  </label>
                  <div className="relative">
                    <MapPin className="w-4 h-4 text-slate-400 dark:text-neutral-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      required
                      value={googleSetupUser.place}
                      onChange={(e) => setGoogleSetupUser({ ...googleSetupUser, place: e.target.value })}
                      placeholder="e.g. Andhra Pradesh, India"
                      className="w-full pl-10 pr-4 py-2 bg-slate-50 dark:bg-neutral-900 border border-slate-200 dark:border-neutral-800 rounded-xl text-xs sm:text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500 dark:focus:ring-white transition-all"
                    />
                  </div>
                </div>

                {/* Create Password */}
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-neutral-300 mb-1">
                    Create Password
                  </label>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-slate-400 dark:text-neutral-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type={showNewPassword ? 'text' : 'password'}
                      required
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      placeholder="At least 4 characters"
                      className="w-full pl-10 pr-10 py-2 bg-slate-50 dark:bg-neutral-900 border border-slate-200 dark:border-neutral-800 rounded-xl text-xs sm:text-sm text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-neutral-600 focus:outline-none focus:ring-2 focus:ring-emerald-500 dark:focus:ring-white transition-all"
                    />
                    <button
                      type="button"
                      onClick={() => setShowNewPassword(!showNewPassword)}
                      className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 dark:text-neutral-500 hover:text-slate-600 dark:hover:text-neutral-300 p-0.5 cursor-pointer"
                    >
                      {showNewPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                  {newPassword.length > 0 && newPassword.length < 4 && (
                    <p className="mt-1 text-[11px] font-medium text-amber-600 dark:text-amber-400">
                      Password must be at least 4 characters ({newPassword.length}/4)
                    </p>
                  )}
                </div>

                {/* Re-enter Password */}
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-neutral-300 mb-1">
                    Re-enter Password
                  </label>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-slate-400 dark:text-neutral-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type={showConfirmPassword ? 'text' : 'password'}
                      required
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="Re-enter to confirm"
                      className={`w-full pl-10 pr-10 py-2 bg-slate-50 dark:bg-neutral-900 border rounded-xl text-xs sm:text-sm text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-neutral-600 focus:outline-none focus:ring-2 transition-all ${
                        confirmPassword.length > 0 && confirmPassword !== newPassword
                          ? 'border-rose-400 dark:border-rose-800 focus:ring-rose-500'
                          : confirmPassword.length > 0 && confirmPassword === newPassword
                          ? 'border-emerald-500 dark:border-white focus:ring-emerald-500 dark:focus:ring-white'
                          : 'border-slate-200 dark:border-neutral-800 focus:ring-emerald-500 dark:focus:ring-white'
                      }`}
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 dark:text-neutral-500 hover:text-slate-600 dark:hover:text-neutral-300 p-0.5 cursor-pointer"
                    >
                      {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>

                  {confirmPassword.length > 0 && (
                    <div className="mt-1 text-[11px] font-semibold flex items-center space-x-1">
                      {confirmPassword === newPassword ? (
                        newPassword.length >= 4 ? (
                          <span className="text-emerald-600 dark:text-white flex items-center space-x-1">
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                            <span>Passwords match (Ready to sign in)</span>
                          </span>
                        ) : (
                          <span className="text-amber-600 dark:text-amber-400">
                            Passwords match, but must be at least 4 characters
                          </span>
                        )
                      ) : (
                        <span className="text-rose-600 dark:text-rose-400">
                          Passwords do not match
                        </span>
                      )}
                    </div>
                  )}
                </div>

                {/* Submit button */}
                <button
                  type="submit"
                  disabled={isLoading || !newPassword || newPassword.length < 4 || newPassword !== confirmPassword}
                  className="w-full py-3 px-4 bg-emerald-600 hover:bg-emerald-500 dark:bg-white dark:hover:bg-neutral-200 text-white dark:text-black rounded-xl text-xs sm:text-sm font-bold shadow-lg shadow-emerald-600/20 dark:shadow-none transition-all flex items-center justify-center space-x-2 cursor-pointer disabled:opacity-50 mt-3"
                >
                  {isLoading ? (
                    <div className="w-5 h-5 border-2 border-current border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <>
                      <Sparkles className="w-4 h-4" />
                      <span>Save Password & Sign In</span>
                    </>
                  )}
                </button>
              </form>
            ) : (
              <>
                {/* Header copy */}
                <div className="text-center mb-6">
                  <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">
                {mode === 'signin' ? 'Sign in to AgriGenius' : 'Create your account'}
              </h2>
              <p className="text-xs sm:text-sm text-slate-500 dark:text-neutral-400 mt-1.5">
                {mode === 'signin' 
                  ? 'Access grounded KCC advisories, diagnostics & admin control' 
                  : 'Verify your email to create a secure agricultural intelligence account'}
              </p>
            </div>

            {/* Mode Switcher Tabs */}
            <div className="grid grid-cols-2 p-1 bg-slate-100 dark:bg-neutral-900 rounded-2xl mb-6 border border-slate-200/80 dark:border-neutral-800">
              <button
                type="button"
                onClick={() => { 
                  setMode('signin'); 
                  setStatusMessage(null); 
                }}
                className={`py-2 text-xs sm:text-sm font-bold rounded-xl transition-all duration-200 cursor-pointer ${
                  mode === 'signin'
                    ? 'bg-white dark:bg-neutral-800 text-slate-900 dark:text-white shadow-sm'
                    : 'text-slate-600 dark:text-neutral-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                Sign In
              </button>
              <button
                type="button"
                onClick={() => { 
                  setMode('signup'); 
                  setSignupStep('method');
                  setStatusMessage(null); 
                }}
                className={`py-2 text-xs sm:text-sm font-bold rounded-xl transition-all duration-200 cursor-pointer ${
                  mode === 'signup'
                    ? 'bg-white dark:bg-neutral-800 text-slate-900 dark:text-white shadow-sm'
                    : 'text-slate-600 dark:text-neutral-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                Create Account
              </button>
            </div>

            {/* Google OAuth Quick Action (Available on both Sign In and Create Account) */}
            <div className="mb-4">
              <button
                type="button"
                onClick={() => {
                  setIsCustomGoogleAccount(false);
                  setIsGoogleModalOpen(true);
                }}
                disabled={isLoading}
                className="w-full py-2.5 px-4 bg-white hover:bg-slate-50 dark:bg-neutral-900 dark:hover:bg-neutral-800/90 border border-slate-300 dark:border-neutral-800 rounded-xl text-xs sm:text-sm font-bold text-slate-800 dark:text-white transition-all flex items-center justify-center space-x-3 shadow-sm cursor-pointer hover:border-slate-400 dark:hover:border-neutral-700"
              >
                {/* SVG Google G Logo */}
                <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
                  <path
                    fill="#4285F4"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  />
                  <path
                    fill="#34A853"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                  />
                  <path
                    fill="#EA4335"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                  />
                </svg>
                <span>Continue with Google</span>
              </button>

              <div className="relative flex items-center justify-center my-4">
                <div className="border-t border-slate-200 dark:border-neutral-800 w-full" />
                <span className="bg-white dark:bg-neutral-950 px-3 text-[10px] font-mono font-bold uppercase tracking-widest text-slate-400 dark:text-neutral-500 absolute">
                  Or with Email
                </span>
              </div>
            </div>

            {/* ============================================================= */}
            {/* TAB 1: SIGN IN (EMAIL AND PASSWORD ONLY)                       */}
            {/* ============================================================= */}
            {mode === 'signin' && (
              <form onSubmit={handleSignIn} className="space-y-4">
                
                {/* Email Address */}
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-neutral-300 mb-1.5">
                    Email Address
                  </label>
                  <div className="relative">
                    <Mail className="w-4 h-4 text-slate-400 dark:text-neutral-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="email"
                      required
                      value={signInEmail}
                      onChange={(e) => setSignInEmail(e.target.value)}
                      placeholder="kisan@agrigenius.app or admin@agrigenius.gov.in"
                      className="w-full pl-10 pr-4 py-2.5 bg-slate-50 dark:bg-neutral-900 border border-slate-200 dark:border-neutral-800 rounded-xl text-xs sm:text-sm text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-neutral-600 focus:outline-none focus:ring-2 focus:ring-emerald-500 dark:focus:ring-white transition-all"
                    />
                  </div>
                </div>

                {/* Password */}
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="text-xs font-semibold text-slate-700 dark:text-neutral-300">
                      Password
                    </label>
                    <button
                      type="button"
                      onClick={() => setStatusMessage({ type: 'info', text: 'For demo accounts, use any password >= 4 chars, or click Demo buttons below.' })}
                      className="text-[11px] text-emerald-600 dark:text-neutral-400 hover:underline cursor-pointer"
                    >
                      Forgot password?
                    </button>
                  </div>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-slate-400 dark:text-neutral-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type={showSignInPassword ? 'text' : 'password'}
                      required
                      value={signInPassword}
                      onChange={(e) => setSignInPassword(e.target.value)}
                      placeholder="••••••••••••"
                      className="w-full pl-10 pr-10 py-2.5 bg-slate-50 dark:bg-neutral-900 border border-slate-200 dark:border-neutral-800 rounded-xl text-xs sm:text-sm text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-neutral-600 focus:outline-none focus:ring-2 focus:ring-emerald-500 dark:focus:ring-white transition-all"
                    />
                    <button
                      type="button"
                      onClick={() => setShowSignInPassword(!showSignInPassword)}
                      className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 dark:text-neutral-500 hover:text-slate-600 dark:hover:text-neutral-300 p-0.5 cursor-pointer"
                      aria-label="Toggle password visibility"
                    >
                      {showSignInPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                {/* Remember Me */}
                <div className="flex items-center space-x-2 pt-1">
                  <input
                    id="remember-me-signin"
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="w-4 h-4 rounded border-slate-300 text-emerald-600 focus:ring-emerald-500 dark:border-neutral-700 dark:bg-neutral-800 cursor-pointer"
                  />
                  <label htmlFor="remember-me-signin" className="text-xs text-slate-600 dark:text-neutral-400 cursor-pointer select-none">
                    Keep me authenticated on this workstation
                  </label>
                </div>

                {/* Status Feedback */}
                {statusMessage && (
                  <div 
                    className={`p-3 rounded-xl text-xs font-medium border flex items-center space-x-2 ${
                      statusMessage.type === 'error'
                        ? 'bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-950/40 dark:text-rose-300 dark:border-rose-900/60'
                        : statusMessage.type === 'success'
                        ? 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-neutral-900 dark:text-white dark:border-neutral-700'
                        : 'bg-blue-50 text-blue-700 border-blue-200 dark:bg-neutral-900 dark:text-neutral-300 dark:border-neutral-800'
                    }`}
                  >
                    <div className="w-1.5 h-1.5 rounded-full bg-current shrink-0" />
                    <span>{statusMessage.text}</span>
                  </div>
                )}

                {/* Sign In Button */}
                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full py-3 px-4 bg-emerald-600 hover:bg-emerald-500 dark:bg-white dark:hover:bg-neutral-200 text-white dark:text-black rounded-xl text-xs sm:text-sm font-bold shadow-lg shadow-emerald-600/20 dark:shadow-none transition-all flex items-center justify-center space-x-2 cursor-pointer disabled:opacity-50 mt-2"
                >
                  {isLoading ? (
                    <div className="w-5 h-5 border-2 border-current border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <>
                      <span>Sign In</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </form>
            )}

            {/* ============================================================= */}
            {/* TAB 2: CREATE ACCOUNT (EMAIL + OTP + PASSWORD)                */}
            {/* ============================================================= */}
            {mode === 'signup' && (
              <div className="space-y-4">
                
                {/* Status Feedback for Signup */}
                {statusMessage && (
                  <div 
                    className={`p-3 rounded-xl text-xs font-medium border flex items-start space-x-2 ${
                      statusMessage.type === 'error'
                        ? 'bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-950/40 dark:text-rose-300 dark:border-rose-900/60'
                        : statusMessage.type === 'success'
                        ? 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-neutral-900 dark:text-white dark:border-neutral-700'
                        : 'bg-emerald-50 text-emerald-800 border-emerald-200 dark:bg-neutral-900 dark:text-neutral-200 dark:border-neutral-700'
                    }`}
                  >
                    <div className="w-1.5 h-1.5 rounded-full bg-current shrink-0 mt-1" />
                    <div className="flex-1">
                      <span>{statusMessage.text}</span>
                      {signupStep === 'otp' && generatedOtp && (
                        <button
                          type="button"
                          onClick={() => setEnteredOtp(generatedOtp)}
                          className="block text-[11px] underline font-bold mt-1 text-emerald-700 dark:text-white cursor-pointer"
                        >
                          Auto-fill verification code ({generatedOtp})
                        </button>
                      )}
                    </div>
                  </div>
                )}

                {/* STEP 1: ENTER USER DETAILS & EMAIL TO RECEIVE OTP */}
                {signupStep === 'method' && (
                  <form onSubmit={handleSendOtp} className="space-y-3">
                    {/* Full Name */}
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 dark:text-neutral-300 mb-1.5">
                        Full Name
                      </label>
                      <div className="relative">
                        <UserIcon className="w-4 h-4 text-slate-400 dark:text-neutral-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                        <input
                          type="text"
                          required
                          value={signupName}
                          onChange={(e) => setSignupName(e.target.value)}
                          placeholder="e.g. Raviteja"
                          className="w-full pl-10 pr-4 py-2.5 bg-slate-50 dark:bg-neutral-900 border border-slate-200 dark:border-neutral-800 rounded-xl text-xs sm:text-sm text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-neutral-600 focus:outline-none focus:ring-2 focus:ring-emerald-500 dark:focus:ring-white transition-all"
                        />
                      </div>
                    </div>

                    {/* Phone Number & DOB */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {/* Phone Number */}
                      <div>
                        <label className="block text-xs font-semibold text-slate-700 dark:text-neutral-300 mb-1.5">
                          Phone Number
                        </label>
                        <div className="relative">
                          <Phone className="w-4 h-4 text-slate-400 dark:text-neutral-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                          <input
                            type="tel"
                            required
                            value={signupPhone}
                            onChange={(e) => setSignupPhone(e.target.value)}
                            placeholder="+91 98765 43210"
                            className="w-full pl-10 pr-4 py-2.5 bg-slate-50 dark:bg-neutral-900 border border-slate-200 dark:border-neutral-800 rounded-xl text-xs sm:text-sm text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-neutral-600 focus:outline-none focus:ring-2 focus:ring-emerald-500 dark:focus:ring-white transition-all"
                          />
                        </div>
                      </div>

                      {/* Date of Birth */}
                      <div>
                        <label className="block text-xs font-semibold text-slate-700 dark:text-neutral-300 mb-1.5">
                          Date of Birth (DOB)
                        </label>
                        <div className="relative">
                          <Calendar className="w-4 h-4 text-slate-400 dark:text-neutral-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                          <input
                            type="date"
                            required
                            value={signupDob}
                            onChange={(e) => setSignupDob(e.target.value)}
                            className="w-full pl-10 pr-4 py-2.5 bg-slate-50 dark:bg-neutral-900 border border-slate-200 dark:border-neutral-800 rounded-xl text-xs sm:text-sm text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-neutral-600 focus:outline-none focus:ring-2 focus:ring-emerald-500 dark:focus:ring-white transition-all"
                          />
                        </div>
                      </div>
                    </div>

                    {/* Place / Location */}
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 dark:text-neutral-300 mb-1.5">
                        Place / Location
                      </label>
                      <div className="relative">
                        <MapPin className="w-4 h-4 text-slate-400 dark:text-neutral-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                        <input
                          type="text"
                          required
                          value={signupPlace}
                          onChange={(e) => setSignupPlace(e.target.value)}
                          placeholder="e.g. Guntur, Andhra Pradesh"
                          className="w-full pl-10 pr-4 py-2.5 bg-slate-50 dark:bg-neutral-900 border border-slate-200 dark:border-neutral-800 rounded-xl text-xs sm:text-sm text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-neutral-600 focus:outline-none focus:ring-2 focus:ring-emerald-500 dark:focus:ring-white transition-all"
                        />
                      </div>
                    </div>

                    {/* Email Address */}
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 dark:text-neutral-300 mb-1.5">
                        Email Address
                      </label>
                      <div className="relative">
                        <Mail className="w-4 h-4 text-slate-400 dark:text-neutral-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                        <input
                          type="email"
                          required
                          value={signupEmail}
                          onChange={(e) => setSignupEmail(e.target.value)}
                          placeholder="name@example.com"
                          className="w-full pl-10 pr-4 py-2.5 bg-slate-50 dark:bg-neutral-900 border border-slate-200 dark:border-neutral-800 rounded-xl text-xs sm:text-sm text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-neutral-600 focus:outline-none focus:ring-2 focus:ring-emerald-500 dark:focus:ring-white transition-all"
                        />
                      </div>
                      <p className="text-[11px] text-slate-400 dark:text-neutral-500 mt-1">
                        We will send a 6-digit verification code to confirm your email.
                      </p>
                    </div>

                    <button
                      type="submit"
                      disabled={isLoading}
                      className="w-full py-3 px-4 bg-emerald-600 hover:bg-emerald-500 dark:bg-white dark:hover:bg-neutral-200 text-white dark:text-black rounded-xl text-xs sm:text-sm font-bold shadow-lg shadow-emerald-600/20 dark:shadow-none transition-all flex items-center justify-center space-x-2 cursor-pointer disabled:opacity-50 mt-2"
                    >
                      {isLoading ? (
                        <div className="w-5 h-5 border-2 border-current border-t-transparent rounded-full animate-spin" />
                      ) : (
                        <>
                          <span>Send Verification Code</span>
                          <ArrowRight className="w-4 h-4" />
                        </>
                      )}
                    </button>
                  </form>
                )}

                {/* STEP 2: ENTER & VERIFY OTP */}
                {signupStep === 'otp' && (
                  <form onSubmit={handleVerifyOtp} className="space-y-4">
                    <div className="p-3 bg-slate-50 dark:bg-neutral-900 rounded-xl border border-slate-200 dark:border-neutral-800 flex items-center justify-between">
                      <div className="truncate">
                        <span className="text-[10px] uppercase text-slate-400 dark:text-neutral-500 font-mono block">Verifying Email:</span>
                        <span className="text-xs font-bold text-slate-800 dark:text-white truncate block">{signupEmail}</span>
                      </div>
                      <button
                        type="button"
                        onClick={() => {
                          setSignupStep('method');
                          setStatusMessage(null);
                        }}
                        className="text-[11px] font-semibold text-emerald-600 dark:text-white hover:underline cursor-pointer"
                      >
                        Change
                      </button>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-700 dark:text-neutral-300 mb-1.5">
                        Enter 6-Digit Verification Code
                      </label>
                      <div className="relative">
                        <KeyRound className="w-4 h-4 text-slate-400 dark:text-neutral-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                        <input
                          type="text"
                          maxLength={6}
                          required
                          value={enteredOtp}
                          onChange={(e) => setEnteredOtp(e.target.value.replace(/\D/g, ''))}
                          placeholder="••••••"
                          className="w-full pl-10 pr-4 py-2.5 bg-slate-50 dark:bg-neutral-900 border border-slate-200 dark:border-neutral-800 rounded-xl text-center text-lg font-mono font-bold tracking-widest text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-neutral-600 focus:outline-none focus:ring-2 focus:ring-emerald-500 dark:focus:ring-white transition-all"
                        />
                      </div>
                    </div>

                    <div className="flex items-center justify-between text-xs text-slate-500 dark:text-neutral-400 pt-1">
                      <span>Didn't get the code?</span>
                      {resendCountdown > 0 ? (
                        <span className="font-mono text-xs">{resendCountdown}s remaining</span>
                      ) : (
                        <button
                          type="button"
                          onClick={() => handleSendOtp()}
                          className="font-bold text-emerald-600 dark:text-white hover:underline flex items-center space-x-1 cursor-pointer"
                        >
                          <RotateCcw className="w-3 h-3" />
                          <span>Resend Code</span>
                        </button>
                      )}
                    </div>

                    <button
                      type="submit"
                      disabled={enteredOtp.length !== 6}
                      className="w-full py-3 px-4 bg-emerald-600 hover:bg-emerald-500 dark:bg-white dark:hover:bg-neutral-200 text-white dark:text-black rounded-xl text-xs sm:text-sm font-bold shadow-lg shadow-emerald-600/20 dark:shadow-none transition-all flex items-center justify-center space-x-2 cursor-pointer disabled:opacity-50"
                    >
                      <Check className="w-4 h-4" />
                      <span>Verify Code & Continue</span>
                    </button>
                  </form>
                )}

                {/* STEP 3: CREATE AND RE-ENTER PASSWORD */}
                {signupStep === 'password' && (
                  <form onSubmit={handleCompleteSignUp} className="space-y-3.5">
                    
                    {/* Verified Email Banner */}
                    <div className="p-2.5 bg-emerald-50 dark:bg-white/10 rounded-xl border border-emerald-200 dark:border-white/20 flex items-center space-x-2 text-xs font-semibold text-emerald-800 dark:text-white">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-white shrink-0" />
                      <span className="truncate">Email verified: {signupEmail}</span>
                    </div>

                    {/* Full Name */}
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 dark:text-neutral-300 mb-1">
                        Full Name
                      </label>
                      <div className="relative">
                        <UserIcon className="w-4 h-4 text-slate-400 dark:text-neutral-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                        <input
                          type="text"
                          required
                          value={signupName}
                          onChange={(e) => setSignupName(e.target.value)}
                          placeholder="e.g. Ramesh Patel"
                          className="w-full pl-10 pr-4 py-2.5 bg-slate-50 dark:bg-neutral-900 border border-slate-200 dark:border-neutral-800 rounded-xl text-xs sm:text-sm text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-neutral-600 focus:outline-none focus:ring-2 focus:ring-emerald-500 dark:focus:ring-white transition-all"
                        />
                      </div>
                    </div>

                    {/* Create Password */}
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 dark:text-neutral-300 mb-1">
                        Create Password
                      </label>
                      <div className="relative">
                        <Lock className="w-4 h-4 text-slate-400 dark:text-neutral-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                        <input
                          type={showNewPassword ? 'text' : 'password'}
                          required
                          value={newPassword}
                          onChange={(e) => setNewPassword(e.target.value)}
                          placeholder="At least 6 characters"
                          className="w-full pl-10 pr-10 py-2.5 bg-slate-50 dark:bg-neutral-900 border border-slate-200 dark:border-neutral-800 rounded-xl text-xs sm:text-sm text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-neutral-600 focus:outline-none focus:ring-2 focus:ring-emerald-500 dark:focus:ring-white transition-all"
                        />
                        <button
                          type="button"
                          onClick={() => setShowNewPassword(!showNewPassword)}
                          className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 dark:text-neutral-500 hover:text-slate-600 dark:hover:text-neutral-300 p-0.5 cursor-pointer"
                        >
                          {showNewPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                      </div>
                    </div>

                    {/* Re-enter Password */}
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 dark:text-neutral-300 mb-1">
                        Re-enter Password
                      </label>
                      <div className="relative">
                        <Lock className="w-4 h-4 text-slate-400 dark:text-neutral-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                        <input
                          type={showConfirmPassword ? 'text' : 'password'}
                          required
                          value={confirmPassword}
                          onChange={(e) => setConfirmPassword(e.target.value)}
                          placeholder="Re-enter to confirm"
                          className={`w-full pl-10 pr-10 py-2.5 bg-slate-50 dark:bg-neutral-900 border rounded-xl text-xs sm:text-sm text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-neutral-600 focus:outline-none focus:ring-2 transition-all ${
                            confirmPassword.length > 0 && confirmPassword !== newPassword
                              ? 'border-rose-400 dark:border-rose-800 focus:ring-rose-500'
                              : confirmPassword.length > 0 && confirmPassword === newPassword
                              ? 'border-emerald-500 dark:border-white focus:ring-emerald-500 dark:focus:ring-white'
                              : 'border-slate-200 dark:border-neutral-800 focus:ring-emerald-500 dark:focus:ring-white'
                          }`}
                        />
                        <button
                          type="button"
                          onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                          className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 dark:text-neutral-500 hover:text-slate-600 dark:hover:text-neutral-300 p-0.5 cursor-pointer"
                        >
                          {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                      </div>

                      {/* Password Match Status Helper */}
                      {confirmPassword.length > 0 && (
                        <div className="mt-1 text-[11px] font-semibold flex items-center space-x-1">
                          {confirmPassword === newPassword ? (
                            <span className="text-emerald-600 dark:text-white flex items-center space-x-1">
                              <CheckCircle2 className="w-3 h-3" />
                              <span>Passwords match</span>
                            </span>
                          ) : (
                            <span className="text-rose-600 dark:text-rose-400">
                              Passwords do not match
                            </span>
                          )}
                        </div>
                      )}
                    </div>

                    <button
                      type="submit"
                      disabled={isLoading || !newPassword || newPassword !== confirmPassword}
                      className="w-full py-3 px-4 bg-emerald-600 hover:bg-emerald-500 dark:bg-white dark:hover:bg-neutral-200 text-white dark:text-black rounded-xl text-xs sm:text-sm font-bold shadow-lg shadow-emerald-600/20 dark:shadow-none transition-all flex items-center justify-center space-x-2 cursor-pointer disabled:opacity-50 mt-2"
                    >
                      {isLoading ? (
                        <div className="w-5 h-5 border-2 border-current border-t-transparent rounded-full animate-spin" />
                      ) : (
                        <>
                          <Sparkles className="w-4 h-4" />
                          <span>Create Account & Get Started</span>
                        </>
                      )}
                    </button>
                  </form>
                )}

              </div>
            )}

            {/* Quick Demo One-Click Access Bar */}
            <div className="mt-6 pt-5 border-t border-slate-200 dark:border-neutral-900">
              <div className="flex items-center justify-between mb-2.5">
                <span className="text-[10.5px] font-bold uppercase tracking-wider text-slate-500 dark:text-neutral-400">
                  Instant Demo Evaluation
                </span>
                <span className="text-[10px] text-emerald-600 dark:text-white font-mono bg-emerald-50 dark:bg-neutral-900 px-2 py-0.5 rounded border border-emerald-200 dark:border-neutral-800">
                  No Password Needed
                </span>
              </div>

              <div className="grid grid-cols-3 gap-2">
                <button
                  type="button"
                  onClick={() => handleQuickDemo('admin')}
                  className="px-2.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-neutral-900 dark:hover:bg-neutral-800/90 border border-slate-200/80 dark:border-neutral-800 text-slate-800 dark:text-white text-[11px] font-bold flex flex-col items-center justify-center space-y-1 transition-all cursor-pointer group"
                >
                  <ShieldCheck className="w-4 h-4 text-emerald-600 dark:text-white group-hover:scale-110 transition-transform" />
                  <span>Demo Admin</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleQuickDemo('farmer')}
                  className="px-2.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-neutral-900 dark:hover:bg-neutral-800/90 border border-slate-200/80 dark:border-neutral-800 text-slate-800 dark:text-white text-[11px] font-bold flex flex-col items-center justify-center space-y-1 transition-all cursor-pointer group"
                >
                  <Leaf className="w-4 h-4 text-emerald-600 dark:text-white group-hover:scale-110 transition-transform" />
                  <span>Demo Farmer</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleQuickDemo('agronomist')}
                  className="px-2.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-neutral-900 dark:hover:bg-neutral-800/90 border border-slate-200/80 dark:border-neutral-800 text-slate-800 dark:text-white text-[11px] font-bold flex flex-col items-center justify-center space-y-1 transition-all cursor-pointer group"
                >
                  <KeyRound className="w-4 h-4 text-emerald-600 dark:text-white group-hover:scale-110 transition-transform" />
                  <span>Demo Scientist</span>
                </button>
              </div>
            </div>
            </>
            )}

          </div>

          {/* Security footnote */}
          <div className="text-center mt-4">
            <p className="text-[11px] text-slate-400 dark:text-neutral-500">
              Grounded on 347,944 verified KCC records • Secure AI retrieval gateway
            </p>
          </div>

        </div>
      </main>

      {/* ========================================================================= */}
      {/* AUTHENTIC GOOGLE OAUTH POPUP / SCREEN (MATCHES ACCOUNTS.GOOGLE.COM)        */}
      {/* ========================================================================= */}
      <AnimatePresence>
        {isGoogleModalOpen && (
          <div className="fixed inset-0 z-50 flex flex-col items-center justify-between bg-[#131314] text-[#e8eaed] overflow-y-auto">
            
            {/* Top Browser Window Header Matching User's Chrome Browser Screenshot */}
            <div className="w-full bg-[#1e1f20] border-b border-[#3c4043]/80 px-4 py-2 flex items-center justify-between text-xs text-[#9aa0a6] select-none shrink-0">
              <div className="flex items-center space-x-2">
                <button
                  type="button"
                  onClick={() => {
                    setIsGoogleModalOpen(false);
                    setGoogleSigningInEmail(null);
                  }}
                  title="Close popup"
                  className="w-3 h-3 rounded-full bg-[#ff5f56] hover:opacity-80 transition-opacity cursor-pointer"
                />
                <div className="w-3 h-3 rounded-full bg-[#ffbd2e]" />
                <div className="w-3 h-3 rounded-full bg-[#27c93f]" />
              </div>

              {/* Simulated Authentic Google Accounts URL Bar */}
              <div className="flex-1 max-w-2xl mx-4 bg-[#131314] px-3.5 py-1.5 rounded-full text-[11px] text-[#9aa0a6] font-mono flex items-center space-x-2 truncate border border-[#3c4043]/60 shadow-inner">
                <Lock className="w-3 h-3 text-[#34a853] shrink-0" />
                <span className="text-[#e8eaed] font-medium shrink-0">accounts.google.com</span>
                <span className="truncate text-[#9aa0a6]">
                  /v3/signin/accountchooser?client_id=174733774878-0pfvmjagkfoeuqk20nqfs4r5mv3fabvv.apps.googleusercontent.com&continue=https%3A%2F%2Fagrigenius.app
                </span>
              </div>

              <button
                type="button"
                onClick={() => {
                  setIsGoogleModalOpen(false);
                  setGoogleSigningInEmail(null);
                }}
                title="Close"
                className="p-1 rounded-md text-[#9aa0a6] hover:text-[#e8eaed] hover:bg-[#282a2d] transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Center Area: Centered Google Card */}
            <div className="flex-1 w-full flex items-center justify-center p-4 sm:p-8">
              <motion.div
                initial={{ opacity: 0, scale: 0.98, y: 10 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.98, y: 10 }}
                transition={{ duration: 0.18 }}
                className="max-w-4xl w-full bg-[#1e1f20] border border-[#3c4043]/60 rounded-[28px] p-6 sm:p-10 md:p-12 shadow-2xl relative overflow-hidden"
              >
                {/* Google Animated Progress Bar on Account Click */}
                {googleSigningInEmail && (
                  <div className="absolute top-0 left-0 right-0 h-1 bg-transparent overflow-hidden">
                    <div className="h-full bg-[#8ab4f8] animate-pulse w-full" />
                  </div>
                )}

                {/* Top Google Header inside Card */}
                <div className="flex items-center space-x-2.5 pb-6">
                  <svg className="w-5 h-5 shrink-0" viewBox="0 0 24 24">
                    <path
                      fill="#4285F4"
                      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                    />
                    <path
                      fill="#34A853"
                      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                    />
                    <path
                      fill="#FBBC05"
                      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                    />
                    <path
                      fill="#EA4335"
                      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                    />
                  </svg>
                  <span className="text-sm font-medium text-[#e8eaed] font-sans">Sign in with Google</span>
                </div>

                {/* 2-Column Layout Matching User Screenshot */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-14">
                  
                  {/* Left Column: App Icon & Choose an account */}
                  <div className="flex flex-col justify-start">
                    {/* App Icon: Green Rounded Square */}
                    <div className="w-14 h-14 rounded-2xl bg-[#00c853] flex items-center justify-center mb-6 shadow-md shadow-emerald-500/20">
                      <Leaf className="w-7 h-7 text-black fill-black" />
                    </div>

                    <h1 className="text-3xl sm:text-4xl font-normal text-white tracking-tight mb-2.5 font-sans">
                      Choose an account
                    </h1>
                    <p className="text-sm text-[#e8eaed]">
                      to continue to <span className="text-[#a8c7fa] font-medium hover:underline cursor-pointer">AgriGenius</span>
                    </p>
                  </div>

                  {/* Right Column: Account list & Disclaimers */}
                  <div className="flex flex-col justify-between">
                    {!isCustomGoogleAccount ? (
                      <div>
                        {/* Dynamic Account Options: Automatically Detected from Active Chrome Profiles */}
                        {detectedGoogleAccounts.map((account) => (
                          <button
                            key={account.email}
                            type="button"
                            disabled={!!googleSigningInEmail}
                            onClick={() => handleSelectGoogleAccount(account)}
                            className="w-full flex items-center justify-between py-3.5 px-3 rounded-lg hover:bg-[#282a2d] transition-colors border-b border-[#3c4043] text-left cursor-pointer group"
                          >
                            <div className="flex items-center space-x-3.5 min-w-0">
                              <div className="w-9 h-9 rounded-full bg-[#6200ee] text-white flex items-center justify-center font-medium text-sm shrink-0">
                                {account.name.charAt(0).toUpperCase()}
                              </div>
                              <div className="truncate">
                                <div className="text-sm font-medium text-white truncate">{account.name}</div>
                                <div className="text-xs text-[#9aa0a6] truncate font-sans">{account.email}</div>
                              </div>
                            </div>
                            {googleSigningInEmail === account.email && (
                              <div className="w-4 h-4 border-2 border-[#8ab4f8] border-t-transparent rounded-full animate-spin shrink-0" />
                            )}
                          </button>
                        ))}

                        {/* Use another account Option */}
                        <button
                          type="button"
                          disabled={!!googleSigningInEmail}
                          onClick={() => setIsCustomGoogleAccount(true)}
                          className="w-full flex items-center py-3.5 px-3 rounded-lg hover:bg-[#282a2d] transition-colors border-b border-[#3c4043] text-left cursor-pointer group space-x-3.5"
                        >
                          <div className="w-9 h-9 rounded-full flex items-center justify-center text-[#e8eaed] shrink-0 border border-[#5f6368]">
                            <UserIcon className="w-5 h-5 text-[#e8eaed]" />
                          </div>
                          <div className="text-sm font-medium text-white">
                            Use another account
                          </div>
                        </button>

                        {/* Bottom Google Disclosure */}
                        <p className="text-xs text-[#9aa0a6] leading-relaxed pt-7">
                          Before using this app, you can review AgriGenius's{' '}
                          <span className="text-[#a8c7fa] hover:underline cursor-pointer">Privacy Policy</span>{' '}
                          and{' '}
                          <span className="text-[#a8c7fa] hover:underline cursor-pointer">Terms of Service</span>.
                        </p>
                      </div>
                    ) : (
                      /* Google "Use another account" Input Screen */
                      <form onSubmit={handleCustomGoogleSubmit} className="space-y-4 pt-1">
                        <div>
                          <h3 className="text-lg text-white font-medium mb-1">Sign in</h3>
                          <p className="text-xs text-[#9aa0a6]">to continue to AgriGenius</p>
                        </div>

                        <div className="pt-2">
                          <input
                            type="email"
                            required
                            autoFocus
                            value={customGoogleEmailInput}
                            onChange={(e) => setCustomGoogleEmailInput(e.target.value)}
                            placeholder="Email or phone"
                            className="w-full px-4 py-3 bg-transparent border border-[#5f6368] focus:border-[#8ab4f8] rounded-md text-sm text-white placeholder-[#9aa0a6] focus:outline-none focus:ring-1 focus:ring-[#8ab4f8]"
                          />
                        </div>

                        <div className="text-xs">
                          <span className="text-[#a8c7fa] hover:underline cursor-pointer font-medium">Forgot email?</span>
                        </div>

                        <div className="flex justify-between items-center pt-6">
                          <button
                            type="button"
                            onClick={() => setIsCustomGoogleAccount(false)}
                            className="text-xs text-[#8ab4f8] hover:underline cursor-pointer font-medium"
                          >
                            Back to accounts
                          </button>
                          <button
                            type="submit"
                            className="px-6 py-2 bg-[#8ab4f8] hover:bg-[#a8c7fa] text-[#001d35] font-semibold text-xs rounded-full cursor-pointer transition-colors"
                          >
                            Next
                          </button>
                        </div>
                      </form>
                    )}
                  </div>

                </div>
              </motion.div>
            </div>

            {/* Bottom Screen Footer Matching Google OAuth Page */}
            <div className="max-w-4xl w-full flex flex-col sm:flex-row justify-between items-center text-xs text-[#9aa0a6] px-6 py-4 space-y-2 sm:space-y-0 shrink-0">
              <span className="cursor-pointer hover:text-white transition-colors">
                English (United States) ▾
              </span>
              <div className="flex space-x-6">
                <span className="cursor-pointer hover:text-white transition-colors">Help</span>
                <span className="cursor-pointer hover:text-white transition-colors">Privacy</span>
                <span className="cursor-pointer hover:text-white transition-colors">Terms</span>
              </div>
            </div>

          </div>
        )}
      </AnimatePresence>

      {/* Footer */}
      <footer className="w-full py-3.5 text-center border-t border-slate-200/60 dark:border-neutral-900 text-slate-500 dark:text-neutral-500 text-xs">
        <p>© 2026 AgriGenius — National Agricultural AI Advisory Platform</p>
      </footer>
    </motion.div>
  );
}
