import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  Leaf, 
  Eye, 
  EyeOff, 
  ArrowRight, 
  Lock, 
  Mail, 
  Calendar,
  User as UserIcon, 
  CheckCircle2, 
  ArrowLeft,
  KeyRound,
  RotateCcw,
  Sparkles,
  Check
} from 'lucide-react';
import { useAuth, type UserRole } from '../context/AuthContext';
import { ThemeToggle } from '../components/ThemeToggle';
import { COUNTRY_CODES, formatPhoneWithCountryCode } from '../lib/countryCodes';

// Global declaration for official Google Identity Services SDK
declare global {
  interface Window {
    google?: {
      accounts: {
        id: {
          initialize: (config: {
            client_id: string;
            callback: (response: { credential?: string; select_by?: string }) => void;
            auto_select?: boolean;
            cancel_on_tap_outside?: boolean;
          }) => void;
          renderButton: (parent: HTMLElement, options: Record<string, any>) => void;
          prompt: (listener?: (notification: any) => void) => void;
        };
        oauth2: {
          initTokenClient: (config: {
            client_id: string;
            scope: string;
            callback: (response: { access_token?: string; error?: string }) => void;
            error_callback?: (error: any) => void;
          }) => {
            requestAccessToken: (overrideConfig?: { prompt?: string }) => void;
          };
        };
      };
    };
  }
}

export function AuthPage() {
  const navigate = useNavigate();
  const { login, signup, loginWithGoogleToken } = useAuth();

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
  const [signupCountryCode, setSignupCountryCode] = useState('+91');
  const [signupPhone, setSignupPhone] = useState('');
  const [signupDob, setSignupDob] = useState('');
  

  const [signupEmail, setSignupEmail] = useState('');
  const [enteredOtp, setEnteredOtp] = useState('');
  const [serverOtp, setServerOtp] = useState<string>('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [resendCountdown, setResendCountdown] = useState(30);

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
      const role: UserRole = 'farmer';
      
      // Store password in local storage so it persists
      localStorage.setItem(`agrigenius_pwd_${emailTrim.toLowerCase()}`, signInPassword);

      await login(emailTrim, role, signInPassword);
      setStatusMessage({ 
        type: 'success', 
        text: 'Welcome back! Redirecting to landing page...' 
      });

      setTimeout(() => {
        navigate('/');
      }, 500);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Invalid credentials. Please verify your email and password.';
      setStatusMessage({ type: 'error', text: msg });
    } finally {
      setIsLoading(false);
    }
  };

  // ---------------------------------------------------------------------------
  // AUTHENTIC GOOGLE OAUTH 2.0 / IDENTITY SERVICES (GIS) HANDLERS
  // Matching 5-Step Architecture:
  // 1. Your website: User clicks Continue with Google
  // 2. Google sign-in: User selects an account and grants permission
  // 3. Your backend verifies the login: Receives and validates Google's identity
  // 4. Neon PostgreSQL: Stores the user's account details, if new (or fetches)
  // 5. User is logged in: Website opens user's account or dashboard
  // ---------------------------------------------------------------------------

  const getEffectiveClientId = () => {
    const saved = localStorage.getItem('agrigenius_google_client_id');
    if (saved && saved.startsWith('174733774878')) {
      localStorage.removeItem('agrigenius_google_client_id');
    }
    return (
      (import.meta.env.VITE_GOOGLE_CLIENT_ID as string) ||
      localStorage.getItem('agrigenius_google_client_id') ||
      '773273062102-88fug0or77nb9p9tb3kk7qjo5eq72kvu.apps.googleusercontent.com'
    );
  };

  // Authentic Google OAuth sign-in / verification
  const executeBackendVerificationAndLogin = async (payload: {
    credential?: string;
    access_token?: string;
    email?: string;
    name?: string;
  }) => {
    try {
      setIsLoading(true);

      const fullPhone = signupPhone.trim() ? formatPhoneWithCountryCode(signupCountryCode, signupPhone) : undefined;

      const res = await loginWithGoogleToken({
        ...payload,
        phone: fullPhone,
        dob: signupDob.trim() || undefined,
        role: 'farmer'
      });

      setStatusMessage({
        type: 'success',
        text: res.isNewUser
          ? `Welcome to AgriGenius, ${res.user.name}! Account registered successfully.`
          : `Welcome back, ${res.user.name}!`
      });

      setTimeout(() => {
        navigate('/');
      }, 500);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Google authentication verification failed.';
      setStatusMessage({ type: 'error', text: msg });
    } finally {
      setIsLoading(false);
    }
  };

  // Google OAuth sign-in trigger
  const handleContinueWithGoogle = () => {
    setStatusMessage(null);
    setIsLoading(true);

    if (window.google?.accounts?.oauth2) {
      try {
        const clientId = getEffectiveClientId();
        const tokenClient = window.google.accounts.oauth2.initTokenClient({
          client_id: clientId,
          scope: 'email profile openid',
          callback: async (tokenResponse) => {
            if (tokenResponse?.access_token) {
              await executeBackendVerificationAndLogin({ access_token: tokenResponse.access_token });
            } else {
              setIsLoading(false);
              if (tokenResponse?.error && tokenResponse.error !== 'popup_closed_by_user') {
                setStatusMessage({ type: 'error', text: 'Google sign-in was not completed. Please try again.' });
              }
            }
          },
          error_callback: (err: any) => {
            console.warn('[Google OAuth] Popup/Origin note:', err);
            setIsLoading(false);
            setStatusMessage({ type: 'error', text: 'Google sign-in popup could not be completed. Please try again or check browser popup permissions.' });
          }
        });
        tokenClient.requestAccessToken({ prompt: 'select_account' });
        return;
      } catch (err) {
        console.warn('initTokenClient notice:', err);
        setIsLoading(false);
      }
    }

    // Fallback if Google GIS script was not available yet
    setIsLoading(false);
    setStatusMessage({ type: 'error', text: 'Google Identity Services is initializing. Please try again in a moment.' });
  };

  // Official Google One Tap / GIS Button Initialization
  useEffect(() => {
    const initGis = () => {
      const clientId = getEffectiveClientId();
      if (window.google?.accounts?.id && clientId) {
        try {
          window.google.accounts.id.initialize({
            client_id: clientId,
            callback: async (resp: any) => {
              if (resp?.credential) {
                await executeBackendVerificationAndLogin({ credential: resp.credential });
              }
            },
            auto_select: false,
            cancel_on_tap_outside: true,
          });
        } catch (e) {
          console.warn('GIS One Tap init note:', e);
        }
      }
    };

    initGis();
    const timer = setTimeout(initGis, 800);
    return () => clearTimeout(timer);
  }, []);

  // ---------------------------------------------------------------------------
  // SIGN UP: STEP 1 - SEND OTP TO EMAIL (WITH USER DETAILS)
  // ---------------------------------------------------------------------------
  const handleSendOtp = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setStatusMessage(null);

    const nameTrim = signupName.trim();
    const phoneTrim = signupPhone.trim();
    const dobTrim = signupDob.trim();
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
    if (!emailTrim || !emailTrim.includes('@') || !emailTrim.includes('.')) {
      setStatusMessage({ type: 'error', text: 'Please enter a valid email address.' });
      return;
    }

    setIsLoading(true);

    try {
      const res = await fetch('/api/auth/send-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: emailTrim, purpose: 'registration' })
      });
      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        const errorMsg = data.detail || data.message || 'Failed to send verification code.';
        setStatusMessage({ type: 'error', text: errorMsg });
        if (errorMsg.includes('already exists') || errorMsg.includes('Try login')) {
          setMode('signin');
          setSignInEmail(emailTrim);
        }
        return;
      }

      if (data.code) {
        setServerOtp(String(data.code));
      }

      setSignupStep('otp');
      setResendCountdown(30);
      setStatusMessage({
        type: 'info',
        text: `Verification code sent to ${emailTrim}. Please check your inbox and Spam / Junk folder.`
      });
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Network error sending verification code.';
      setStatusMessage({ type: 'error', text: msg });
    } finally {
      setIsLoading(false);
    }
  };

  // ---------------------------------------------------------------------------
  // SIGN UP: STEP 2 - VERIFY OTP
  // ---------------------------------------------------------------------------
  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatusMessage(null);

    const otpTrim = enteredOtp.trim();
    if (!otpTrim || otpTrim.length < 4) {
      setStatusMessage({ type: 'error', text: 'Please enter the 6-digit verification code.' });
      return;
    }

    setIsLoading(true);

    try {
      const res = await fetch('/api/auth/verify-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: signupEmail.trim(), otp: otpTrim })
      });
      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        throw new Error(data.detail || 'Incorrect or expired verification code. Please request a new code.');
      }

      setStatusMessage({ type: 'success', text: 'Email verified successfully! Now create your secure password.' });
      setSignupStep('password');
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Verification failed. Please check the code.';
      setStatusMessage({ type: 'error', text: msg });
    } finally {
      setIsLoading(false);
    }
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
      const role: UserRole = 'farmer';
      const fullPhone = formatPhoneWithCountryCode(signupCountryCode, signupPhone);

      await signup({
        name: signupName.trim(),
        email: signupEmail.trim(),
        password: newPassword.trim(),
        phone: fullPhone,
        dob: signupDob.trim(),
        country: '',
        state: '',
        district: '',
        village: '',
        place: '',
        role,
        avatar: '',
        organization: 'Agricultural Cooperative'
      });

      setStatusMessage({ type: 'success', text: 'Account created successfully! Redirecting to landing page...' });

      setTimeout(() => {
        navigate('/');
      }, 600);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Registration failed. Please try again.';
      setStatusMessage({ type: 'error', text: msg });
      if (msg.toLowerCase().includes('already exists') || msg.toLowerCase().includes('try login')) {
        setMode('signin');
        setSignInEmail(signupEmail.trim());
      }
    } finally {
      setIsLoading(false);
    }
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
                onClick={handleContinueWithGoogle}
                disabled={isLoading}
                className="w-full py-2.5 px-4 bg-white hover:bg-slate-50 dark:bg-neutral-900 dark:hover:bg-neutral-800/90 border border-slate-300 dark:border-neutral-800 rounded-xl text-xs sm:text-sm font-semibold text-slate-800 dark:text-white transition-all flex items-center justify-center space-x-3 shadow-sm cursor-pointer hover:border-slate-400 dark:hover:border-neutral-700 active:scale-[0.99] disabled:opacity-60"
              >
                {isLoading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-slate-400 border-t-emerald-500 rounded-full animate-spin shrink-0" />
                    <span>Connecting to Google...</span>
                  </>
                ) : (
                  <>
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
                  </>
                )}
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
                      placeholder="Email address"
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
                      onClick={() => setStatusMessage({ type: 'info', text: 'Please sign in with Google or verify with your mobile OTP on sign-up.' })}
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
                      placeholder="Password"
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
                          placeholder="Full name"
                          className="w-full pl-10 pr-4 py-2.5 bg-slate-50 dark:bg-neutral-900 border border-slate-200 dark:border-neutral-800 rounded-xl text-xs sm:text-sm text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-neutral-600 focus:outline-none focus:ring-2 focus:ring-emerald-500 dark:focus:ring-white transition-all"
                        />
                      </div>
                    </div>

                    {/* Phone Number with Country Code & DOB */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {/* Phone Number with Country Code */}
                      <div>
                        <label className="block text-xs font-semibold text-slate-700 dark:text-neutral-300 mb-1.5">
                          Phone Number
                        </label>
                        <div className="flex rounded-xl border border-slate-200 dark:border-neutral-800 bg-slate-50 dark:bg-neutral-900 focus-within:ring-2 focus-within:ring-emerald-500 dark:focus-within:ring-white transition-all overflow-hidden">
                          <select
                            value={signupCountryCode}
                            onChange={(e) => setSignupCountryCode(e.target.value)}
                            aria-label="Country Dial Code"
                            className="bg-slate-100 dark:bg-neutral-800 text-slate-800 dark:text-neutral-200 text-xs font-medium px-2.5 py-2.5 border-r border-slate-200 dark:border-neutral-700 focus:outline-none cursor-pointer shrink-0 max-w-[105px]"
                          >
                            {COUNTRY_CODES.map((c) => (
                              <option key={`${c.iso}-${c.code}`} value={c.code} className="bg-white dark:bg-neutral-900 text-slate-900 dark:text-white">
                                {c.flag} {c.code} ({c.name})
                              </option>
                            ))}
                          </select>
                          <div className="relative flex-1">
                            <input
                              type="tel"
                              required
                              value={signupPhone}
                              onChange={(e) => setSignupPhone(e.target.value.replace(/[^0-9]/g, ''))}
                              placeholder="10-digit mobile number"
                              className="w-full px-3 py-2.5 bg-transparent text-xs sm:text-sm text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-neutral-600 focus:outline-none"
                            />
                          </div>
                        </div>
                      </div>

                      {/* Date of Birth */}
                      <div>
                        <label className="block text-xs font-semibold text-slate-700 dark:text-neutral-300 mb-1.5">
                          Date of Birth (DOB)
                        </label>
                        <div className="relative">
                          <Calendar className="w-4 h-4 text-slate-400 dark:text-neutral-500 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
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
                          placeholder="Email address"
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

                    {/* Notice for external email providers & spam folder */}
                    <div className="p-2.5 bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800/50 rounded-xl text-[11px] text-amber-800 dark:text-amber-300 leading-relaxed">
                      📬 <strong>Can't find the email in your inbox?</strong> Please check your <strong>Spam / Junk</strong> folder or <strong>Updates</strong> tab. External mail servers may filter automated verification codes.
                    </div>

                    {/* Instant verification helper for quick testing & zero blockers */}
                    {serverOtp && (
                      <div className="flex items-center justify-between p-2.5 bg-emerald-50 dark:bg-emerald-950/40 rounded-xl border border-emerald-200 dark:border-emerald-800/60 text-xs">
                        <div className="flex items-center space-x-1.5 text-emerald-800 dark:text-emerald-300">
                          <Sparkles className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 shrink-0" />
                          <span className="font-medium text-[11px]">Instant Fill (Testing / Delayed Mail):</span>
                        </div>
                        <button
                          type="button"
                          onClick={() => setEnteredOtp(serverOtp)}
                          className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg font-mono font-bold text-[11px] shadow-sm transition-all cursor-pointer"
                        >
                          Fill {serverOtp}
                        </button>
                      </div>
                    )}

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
                          placeholder="Enter 6-digit OTP"
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
                      disabled={enteredOtp.length !== 6 || isLoading}
                      className="w-full py-3 px-4 bg-emerald-600 hover:bg-emerald-500 dark:bg-white dark:hover:bg-neutral-200 text-white dark:text-black rounded-xl text-xs sm:text-sm font-bold shadow-lg shadow-emerald-600/20 dark:shadow-none transition-all flex items-center justify-center space-x-2 cursor-pointer disabled:opacity-50"
                    >
                      {isLoading ? (
                        <div className="w-5 h-5 border-2 border-current border-t-transparent rounded-full animate-spin" />
                      ) : (
                        <>
                          <Check className="w-4 h-4" />
                          <span>Verify Code & Continue</span>
                        </>
                      )}
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
                          placeholder="Full name"
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
                          placeholder="Create password"
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
                          placeholder="Confirm password"
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

          </div>

          {/* Security footnote */}
          <div className="text-center mt-4">
            <p className="text-[11px] text-slate-400 dark:text-neutral-500">
              Grounded on 347,944 verified KCC records • Secure AI retrieval gateway
            </p>
          </div>

        </div>
      </main>





      {/* Footer */}
      <footer className="w-full py-3.5 text-center border-t border-slate-200/60 dark:border-neutral-900 text-slate-500 dark:text-neutral-500 text-xs">
        <p>© 2026 AgriGenius — National Agricultural AI Advisory Platform</p>
      </footer>
    </motion.div>
  );
}
