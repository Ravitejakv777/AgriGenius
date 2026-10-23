import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Leaf,
  LogOut,
  ArrowLeft,
  CheckCircle2,
  Mail,
  MapPin,
  Phone,
  Calendar,
  User as UserIcon,
  MessageSquare,
  FileText,
  Trash2,
  AlertTriangle,
  X,
  Check,
  Loader2,
  Edit3,
  Save
} from 'lucide-react';
import { useAuth, type UserRole } from '../context/AuthContext';
import { ThemeToggle } from '../components/ThemeToggle';
import { CascadingLocationPicker } from '../components/CascadingLocationPicker';
import { parseLocationString, formatLocationString } from '../lib/locationData';
import { COUNTRY_CODES, formatPhoneWithCountryCode, parsePhoneWithCountryCode } from '../lib/countryCodes';

const DELETION_REASONS = [
  "I am no longer actively farming or managing crops",
  "Switching to an alternative agricultural advisory service",
  "Privacy concerns regarding my personal or farm data",
  "Experienced technical issues, bugs, or slow responses",
  "Creating a new account with different credentials",
  "Other reason (please specify below)"
];

export function ProfilePage() {
  const navigate = useNavigate();
  const { user, isAuthenticated, logout, deleteAccount, updateProfile } = useAuth();

  // Profile Edit State
  const [isEditing, setIsEditing] = useState(false);
  const [editName, setEditName] = useState(user?.name || '');
  const initialPhone = parsePhoneWithCountryCode(user?.phone || '');
  const [editCountryCode, setEditCountryCode] = useState(initialPhone.countryCode);
  const [editPhoneDigits, setEditPhoneDigits] = useState(initialPhone.digits);
  const [editDob, setEditDob] = useState(user?.dob || '');
  
  // Cascading Location state
  const initialLoc = parseLocationString(user?.place || user?.state);
  const [editCountry, setEditCountry] = useState(user?.country || initialLoc.country || '');
  const [editState, setEditState] = useState(user?.state || initialLoc.state || '');
  const [editDistrict, setEditDistrict] = useState(user?.district || initialLoc.district || '');
  const [editVillage, setEditVillage] = useState(user?.village || initialLoc.village || '');
  
  const [editRole, setEditRole] = useState<UserRole>(user?.role || 'farmer');
  const [isSaving, setIsSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Synchronize edit inputs when user changes or edit mode toggles
  useEffect(() => {
    if (user) {
      setEditName(user.name || '');
      const parsed = parsePhoneWithCountryCode(user.phone || '');
      setEditCountryCode(parsed.countryCode);
      setEditPhoneDigits(parsed.digits);
      setEditDob(user.dob || '');
      const loc = parseLocationString(user.place || user.state);
      setEditCountry(user.country || loc.country || '');
      setEditState(user.state || loc.state || '');
      setEditDistrict(user.district || loc.district || '');
      setEditVillage(user.village || loc.village || '');
      setEditRole(user.role || 'farmer');
    }
  }, [user, isEditing]);

  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedReason, setSelectedReason] = useState('');
  const [feedbackText, setFeedbackText] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  useEffect(() => {
    if (!isAuthenticated || !user) {
      navigate('/', { replace: true });
    }
  }, [isAuthenticated, user, navigate]);

  const handleSignOut = () => {
    logout();
    navigate('/');
  };

  const handleConfirmDelete = async () => {
    if (!selectedReason) {
      setDeleteError("Please select why you are deleting your account.");
      return;
    }
    setIsDeleting(true);
    setDeleteError(null);
    try {
      await deleteAccount(selectedReason, feedbackText);
      setIsDeleteModalOpen(false);
      navigate('/', { replace: true });
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to delete account. Please try again.";
      setDeleteError(msg);
    } finally {
      setIsDeleting(false);
    }
  };

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editName.trim()) {
      setSaveMessage({ type: 'error', text: 'Name cannot be empty.' });
      return;
    }
    setIsSaving(true);
    setSaveMessage(null);
    try {
      const formattedPlace = formatLocationString(editCountry, editState, editDistrict, editVillage);
      const fullPhone = formatPhoneWithCountryCode(editCountryCode, editPhoneDigits);
      await updateProfile({
        name: editName.trim(),
        phone: fullPhone,
        dob: editDob.trim(),
        country: editCountry,
        state: editState,
        district: editDistrict,
        village: editVillage,
        place: formattedPlace,
        role: editRole
      });
      setSaveMessage({ type: 'success', text: 'Profile updated successfully!' });
      setTimeout(() => {
        setIsEditing(false);
        setSaveMessage(null);
      }, 1200);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to save changes. Please try again.';
      setSaveMessage({ type: 'error', text: msg });
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancelEdit = () => {
    if (user) {
      setEditName(user.name || '');
      const parsed = parsePhoneWithCountryCode(user.phone || '');
      setEditCountryCode(parsed.countryCode);
      setEditPhoneDigits(parsed.digits);
      setEditDob(user.dob || '');
      const loc = parseLocationString(user.place || user.state);
      setEditCountry(user.country || loc.country || '');
      setEditState(user.state || loc.state || '');
      setEditDistrict(user.district || loc.district || '');
      setEditVillage(user.village || loc.village || '');
      setEditRole(user.role || 'farmer');
    }
    setIsEditing(false);
    setSaveMessage(null);
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
                  <Leaf className="w-3.5 h-3.5 mr-1 text-emerald-600 dark:text-white" />
                  <span>Farmer Portal</span>
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
                  {user.place || [user.village, user.district, user.state, user.country].filter(Boolean).join(', ') || 'Location Not Set'}
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
          {/* Card Header with Edit Button */}
          <div className="flex items-center justify-between pb-4 mb-4 border-b border-slate-100 dark:border-neutral-900">
            <div className="flex items-center space-x-2.5">
              <div className="w-8 h-8 rounded-xl bg-slate-100 dark:bg-neutral-900 border border-slate-200 dark:border-neutral-800 flex items-center justify-center text-slate-700 dark:text-white">
                <UserIcon className="w-4 h-4" />
              </div>
              <div>
                <h2 className="text-sm font-bold text-slate-900 dark:text-white">Personal Information</h2>
                <p className="text-[11px] text-slate-500 dark:text-neutral-400">
                  {isEditing ? 'Update your personal profile details' : 'Registered Account Profile'}
                </p>
              </div>
            </div>

            {!isEditing ? (
              <button
                type="button"
                onClick={() => setIsEditing(true)}
                className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-neutral-900 dark:hover:bg-neutral-800 border border-slate-200 dark:border-neutral-800 text-xs font-bold text-slate-800 dark:text-white transition-all cursor-pointer shadow-sm"
              >
                <Edit3 className="w-3.5 h-3.5 text-emerald-600 dark:text-white" />
                <span>Edit Profile</span>
              </button>
            ) : (
              <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/60 px-2.5 py-1 rounded-full">
                Editing Profile
              </span>
            )}
          </div>

          {/* Save Status Feedback */}
          {saveMessage && (
            <div
              className={`p-3 mb-4 rounded-xl text-xs font-medium border flex items-center space-x-2 ${
                saveMessage.type === 'error'
                  ? 'bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-950/40 dark:text-rose-300 dark:border-rose-900/60'
                  : 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-neutral-900 dark:text-white dark:border-neutral-700'
              }`}
            >
              <div className="w-1.5 h-1.5 rounded-full bg-current shrink-0" />
              <span>{saveMessage.text}</span>
            </div>
          )}

          {/* Profile Incomplete Setup Reminder Banner */}
          {!isEditing && (!user.phone?.trim() || !user.dob?.trim() || (!user.district?.trim() && !user.place?.trim())) && (
            <div className="mb-5 p-4 rounded-2xl bg-amber-500/10 dark:bg-amber-500/15 border border-amber-500/30 text-amber-900 dark:text-amber-200 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
              <div className="flex items-start space-x-3">
                <AlertTriangle className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
                <div>
                  <h4 className="text-xs sm:text-sm font-bold text-amber-800 dark:text-amber-100 flex items-center gap-1.5">
                    <span>Action Needed: Set Up Your Profile</span>
                  </h4>
                  <p className="text-[11px] sm:text-xs text-amber-700/90 dark:text-amber-300/80 leading-relaxed mt-0.5">
                    Your phone number, date of birth, or farm location have not been configured yet. Set them up to receive accurate, localized advisory and agronomic alerts for your district.
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsEditing(true)}
                className="inline-flex items-center justify-center space-x-1.5 px-3.5 py-2 rounded-xl bg-amber-600 hover:bg-amber-500 text-white text-xs font-bold transition-all shadow-sm shrink-0 cursor-pointer self-start sm:self-auto"
              >
                <Edit3 className="w-3.5 h-3.5" />
                <span>Set Up Profile</span>
              </button>
            </div>
          )}

          {!isEditing ? (
            /* READ-ONLY VIEW */
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
              <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-neutral-900/60 border border-slate-100 dark:border-neutral-800/80 flex items-center justify-between">
                <div>
                  <span className="text-[11px] text-slate-400 dark:text-neutral-500 block mb-0.5 font-medium">Phone Number</span>
                  <div className="flex items-center space-x-2 text-slate-900 dark:text-white font-semibold text-sm">
                    <Phone className="w-4 h-4 text-emerald-600 dark:text-neutral-400 shrink-0" />
                    {user.phone && user.phone.trim() ? (
                      <span>{user.phone}</span>
                    ) : (
                      <span className="text-slate-400 dark:text-neutral-500 italic font-normal text-xs">Not provided</span>
                    )}
                  </div>
                </div>
                {(!user.phone || !user.phone.trim()) && (
                  <button
                    type="button"
                    onClick={() => setIsEditing(true)}
                    className="text-[11px] font-semibold text-emerald-600 dark:text-emerald-400 hover:underline cursor-pointer"
                  >
                    + Add Phone
                  </button>
                )}
              </div>

              {/* Date of Birth */}
              <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-neutral-900/60 border border-slate-100 dark:border-neutral-800/80 flex items-center justify-between">
                <div>
                  <span className="text-[11px] text-slate-400 dark:text-neutral-500 block mb-0.5 font-medium">Date of Birth (DOB)</span>
                  <div className="flex items-center space-x-2 text-slate-900 dark:text-white font-semibold text-sm">
                    <Calendar className="w-4 h-4 text-emerald-600 dark:text-neutral-400 shrink-0" />
                    {user.dob && user.dob.trim() ? (
                      <span>{user.dob}</span>
                    ) : (
                      <span className="text-slate-400 dark:text-neutral-500 italic font-normal text-xs">Not provided</span>
                    )}
                  </div>
                </div>
                {(!user.dob || !user.dob.trim()) && (
                  <button
                    type="button"
                    onClick={() => setIsEditing(true)}
                    className="text-[11px] font-semibold text-emerald-600 dark:text-emerald-400 hover:underline cursor-pointer"
                  >
                    + Add DOB
                  </button>
                )}
              </div>

              {/* Place / Location */}
              <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-neutral-900/60 border border-slate-100 dark:border-neutral-800/80 sm:col-span-2 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] text-slate-400 dark:text-neutral-500 font-medium">Farm Location</span>
                  {user.district || user.state || user.place ? (
                    <span className="text-[10px] font-mono font-semibold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 px-2 py-0.5 rounded-full border border-emerald-200 dark:border-emerald-800/60">
                      Geographic Region
                    </span>
                  ) : (
                    <button
                      type="button"
                      onClick={() => setIsEditing(true)}
                      className="text-[11px] font-semibold text-emerald-600 dark:text-emerald-400 hover:underline cursor-pointer"
                    >
                      + Set Location
                    </button>
                  )}
                </div>
                <div className="flex items-center space-x-2 text-slate-900 dark:text-white font-semibold text-sm">
                  <MapPin className="w-4 h-4 text-emerald-600 dark:text-neutral-400 shrink-0" />
                  {user.place || formatLocationString(user.country, user.state, user.district, user.village) ? (
                    <span>{user.place || formatLocationString(user.country, user.state, user.district, user.village)}</span>
                  ) : (
                    <span className="text-slate-400 dark:text-neutral-500 italic font-normal text-xs">Not configured yet</span>
                  )}
                </div>
                {/* Visual Location Breakdown Hierarchy Pills */}
                {(user.village || user.district || user.state || user.country) && (
                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {user.village && (
                      <span className="inline-flex items-center text-[11px] font-medium bg-white dark:bg-neutral-800 border border-slate-200 dark:border-neutral-700 px-2.5 py-1 rounded-lg text-slate-700 dark:text-neutral-300">
                        <span className="text-slate-400 dark:text-neutral-500 mr-1.5">Village:</span> {user.village}
                      </span>
                    )}
                    {user.district && (
                      <span className="inline-flex items-center text-[11px] font-medium bg-white dark:bg-neutral-800 border border-slate-200 dark:border-neutral-700 px-2.5 py-1 rounded-lg text-slate-700 dark:text-neutral-300">
                        <span className="text-slate-400 dark:text-neutral-500 mr-1.5">District:</span> {user.district}
                      </span>
                    )}
                    {(user.state || user.place) && (
                      <span className="inline-flex items-center text-[11px] font-medium bg-white dark:bg-neutral-800 border border-slate-200 dark:border-neutral-700 px-2.5 py-1 rounded-lg text-slate-700 dark:text-neutral-300">
                        <span className="text-slate-400 dark:text-neutral-500 mr-1.5">State:</span> {user.state || user.place}
                      </span>
                    )}
                    {user.country && (
                      <span className="inline-flex items-center text-[11px] font-medium bg-white dark:bg-neutral-800 border border-slate-200 dark:border-neutral-700 px-2.5 py-1 rounded-lg text-slate-700 dark:text-neutral-300">
                        <span className="text-slate-400 dark:text-neutral-500 mr-1.5">Country:</span> {user.country}
                      </span>
                    )}
                  </div>
                )}
              </div>
            </div>
          ) : (
            /* EDITABLE FORM */
            <form onSubmit={handleSaveProfile} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                {/* Full Name */}
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-neutral-300 mb-1.5">
                    Full Name <span className="text-rose-500">*</span>
                  </label>
                  <div className="relative">
                    <UserIcon className="w-4 h-4 text-slate-400 dark:text-neutral-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      required
                      value={editName}
                      onChange={(e) => setEditName(e.target.value)}
                      placeholder="e.g. Raviteja"
                      className="w-full pl-10 pr-4 py-2.5 bg-slate-50 dark:bg-neutral-900 border border-slate-200 dark:border-neutral-800 rounded-xl text-xs sm:text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500 dark:focus:ring-white transition-all"
                    />
                  </div>
                </div>

                {/* Email Address (Locked / Primary Identifier) */}
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="text-xs font-semibold text-slate-700 dark:text-neutral-300">
                      Email Address
                    </label>
                    <span className="text-[10px] text-slate-400 dark:text-neutral-500 font-mono">Account ID (Locked)</span>
                  </div>
                  <div className="relative">
                    <Mail className="w-4 h-4 text-slate-400 dark:text-neutral-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="email"
                      disabled
                      value={user.email}
                      className="w-full pl-10 pr-4 py-2.5 bg-slate-100 dark:bg-neutral-900/40 border border-slate-200 dark:border-neutral-800/80 rounded-xl text-xs sm:text-sm text-slate-500 dark:text-neutral-400 cursor-not-allowed select-none"
                    />
                  </div>
                </div>

                {/* Phone Number with Country Code */}
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-neutral-300 mb-1.5">
                    Phone Number
                  </label>
                  <div className="flex rounded-xl border border-slate-200 dark:border-neutral-800 bg-slate-50 dark:bg-neutral-900 focus-within:ring-2 focus-within:ring-emerald-500 dark:focus-within:ring-white transition-all overflow-hidden">
                    <select
                      value={editCountryCode}
                      onChange={(e) => setEditCountryCode(e.target.value)}
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
                        value={editPhoneDigits}
                        onChange={(e) => setEditPhoneDigits(e.target.value.replace(/[^0-9]/g, ''))}
                        placeholder="9876543210"
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
                    <Calendar className="w-4 h-4 text-slate-400 dark:text-neutral-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="date"
                      value={editDob}
                      onChange={(e) => setEditDob(e.target.value)}
                      className="w-full pl-10 pr-4 py-2.5 bg-slate-50 dark:bg-neutral-900 border border-slate-200 dark:border-neutral-800 rounded-xl text-xs sm:text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500 dark:focus:ring-white transition-all"
                    />
                  </div>
                </div>

                {/* Cascading Location Hierarchy (Country -> State -> District -> Village) */}
                <div className="sm:col-span-2 pt-2 border-t border-slate-100 dark:border-neutral-800/80">
                  <div className="flex items-center justify-between mb-2">
                    <label className="block text-xs font-semibold text-slate-700 dark:text-neutral-300">
                      Location Hierarchy (Country &rarr; State &rarr; District &rarr; Village)
                    </label>
                    <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-medium">Cascading Dropdowns</span>
                  </div>
                  <CascadingLocationPicker
                    country={editCountry}
                    state={editState}
                    district={editDistrict}
                    village={editVillage}
                    onChange={(loc) => {
                      setEditCountry(loc.country);
                      setEditState(loc.state);
                      setEditDistrict(loc.district);
                      setEditVillage(loc.village);
                    }}
                  />
                </div>
              </div>

              {/* Form Actions */}
              <div className="flex items-center justify-end space-x-3 pt-3 border-t border-slate-100 dark:border-neutral-900">
                <button
                  type="button"
                  disabled={isSaving}
                  onClick={handleCancelEdit}
                  className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-neutral-900 dark:hover:bg-neutral-800 text-slate-700 dark:text-neutral-300 text-xs font-bold transition-all cursor-pointer disabled:opacity-50"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={isSaving}
                  className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 dark:bg-white dark:hover:bg-neutral-200 text-white dark:text-black text-xs font-bold shadow-md shadow-emerald-600/20 dark:shadow-none transition-all flex items-center space-x-1.5 cursor-pointer disabled:opacity-50"
                >
                  {isSaving ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      <span>Saving to Neon DB...</span>
                    </>
                  ) : (
                    <>
                      <Save className="w-3.5 h-3.5" />
                      <span>Save Changes</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          )}
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

            {/* Action 2: Open Advisory Report */}
            <button
              type="button"
              onClick={() => navigate('/report')}
              className="p-4 bg-slate-50 hover:bg-slate-100 dark:bg-neutral-900 dark:hover:bg-neutral-800/80 border border-slate-200 dark:border-neutral-800 rounded-2xl text-left transition-all cursor-pointer group"
            >
              <FileText className="w-5 h-5 text-emerald-600 dark:text-white mb-2 group-hover:scale-110 transition-transform" />
              <div className="text-xs font-bold text-slate-900 dark:text-white">Advisory Reports</div>
              <div className="text-[11px] text-slate-500 dark:text-neutral-400 mt-0.5">View diagnosis reports</div>
            </button>

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

        {/* ===================================================================== */}
        {/* DANGER ZONE: DELETE ACCOUNT (PROMPTS USER FOR DEPARTURE REASON)       */}
        {/* ===================================================================== */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.25, delay: 0.15 }}
          className="bg-white dark:bg-neutral-950 border border-rose-200/70 dark:border-rose-950/50 rounded-3xl p-6 shadow-sm space-y-4 relative overflow-hidden"
        >
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="flex items-center space-x-2 text-rose-600 dark:text-rose-400">
                <AlertTriangle className="w-4 h-4 shrink-0" />
                <h2 className="text-sm font-bold">Danger Zone</h2>
              </div>
              <p className="text-xs text-slate-500 dark:text-neutral-400 mt-1">
                Permanently delete your AgriGenius account and wipe all personal records and advisory data.
              </p>
            </div>

            <button
              type="button"
              onClick={() => {
                setDeleteError(null);
                setIsDeleteModalOpen(true);
              }}
              className="inline-flex items-center justify-center px-4 py-2.5 rounded-xl bg-rose-50 hover:bg-rose-100 dark:bg-rose-950/40 dark:hover:bg-rose-950/80 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-900/60 text-xs font-bold transition-all cursor-pointer shrink-0 shadow-sm"
            >
              <Trash2 className="w-4 h-4 mr-2 text-rose-600 dark:text-rose-400" />
              <span>Delete Account</span>
            </button>
          </div>
        </motion.div>

      </main>

      {/* ===================================================================== */}
      {/* DELETE ACCOUNT QUESTIONNAIRE MODAL (ASKS WHY BEFORE DELETION)         */}
      {/* ===================================================================== */}
      <AnimatePresence>
        {isDeleteModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm overflow-y-auto">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              transition={{ duration: 0.2 }}
              className="bg-white dark:bg-neutral-950 border border-slate-200 dark:border-neutral-800 rounded-3xl p-6 sm:p-8 max-w-lg w-full shadow-2xl relative my-auto"
            >
              {/* Close Button */}
              <button
                type="button"
                onClick={() => {
                  if (!isDeleting) setIsDeleteModalOpen(false);
                }}
                disabled={isDeleting}
                className="absolute top-5 right-5 p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-neutral-900 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>

              {/* Modal Header */}
              <div className="flex items-center space-x-3 mb-4">
                <div className="w-10 h-10 rounded-2xl bg-rose-100 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400 flex items-center justify-center shrink-0 border border-rose-200 dark:border-rose-900/60">
                  <AlertTriangle className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-lg font-black text-slate-900 dark:text-white tracking-tight">
                    Delete Your Account
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-neutral-400">
                    We're sorry to see you go. Please tell us why before proceeding.
                  </p>
                </div>
              </div>

              {/* Error Banner */}
              {deleteError && (
                <div className="p-3 mb-4 rounded-xl bg-rose-50 text-rose-700 dark:bg-rose-950/40 dark:text-rose-300 border border-rose-200 dark:border-rose-900/60 text-xs flex items-center space-x-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-current shrink-0" />
                  <span>{deleteError}</span>
                </div>
              )}

              {/* Questionnaire Options */}
              <div className="space-y-2 mb-4">
                <label className="block text-xs font-bold text-slate-800 dark:text-neutral-200 mb-1.5">
                  Why are you deleting your account? <span className="text-rose-500">*</span>
                </label>
                {DELETION_REASONS.map((reason) => {
                  const isSelected = selectedReason === reason;
                  return (
                    <button
                      key={reason}
                      type="button"
                      onClick={() => {
                        setSelectedReason(reason);
                        setDeleteError(null);
                      }}
                      className={`w-full p-3 rounded-xl border text-left text-xs transition-all flex items-center justify-between cursor-pointer ${
                        isSelected
                          ? 'border-rose-500 bg-rose-50/60 text-rose-900 dark:border-rose-500/80 dark:bg-rose-950/40 dark:text-rose-200 font-semibold'
                          : 'border-slate-200 hover:border-slate-300 dark:border-neutral-800 dark:hover:border-neutral-700 text-slate-700 dark:text-neutral-300 bg-slate-50/50 dark:bg-neutral-900/50'
                      }`}
                    >
                      <span className="pr-3 leading-snug">{reason}</span>
                      <div
                        className={`w-4 h-4 rounded-full border flex items-center justify-center shrink-0 ${
                          isSelected
                            ? 'border-rose-600 bg-rose-600 text-white'
                            : 'border-slate-300 dark:border-neutral-700'
                        }`}
                      >
                        {isSelected && <Check className="w-2.5 h-2.5 stroke-[3]" />}
                      </div>
                    </button>
                  );
                })}
              </div>

              {/* Optional Feedback Textarea */}
              <div className="mb-4">
                <label className="block text-xs font-semibold text-slate-700 dark:text-neutral-300 mb-1">
                  How could we have made AgriGenius better for you? (Optional)
                </label>
                <textarea
                  rows={2}
                  value={feedbackText}
                  onChange={(e) => setFeedbackText(e.target.value)}
                  placeholder="Share any feedback, features missing, or issues you experienced..."
                  className="w-full p-2.5 bg-slate-50 dark:bg-neutral-900 border border-slate-200 dark:border-neutral-800 rounded-xl text-xs text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-neutral-600 focus:outline-none focus:ring-2 focus:ring-rose-500 transition-all resize-none"
                />
              </div>

              {/* Warning disclaimer */}
              <div className="p-3 bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900/50 rounded-xl text-[11px] text-amber-800 dark:text-amber-300 mb-6 leading-relaxed">
                ⚠️ <strong>Permanent Action:</strong> Deleting your account will immediately erase your account profile and all advisory data from Neon PostgreSQL. This action cannot be reversed.
              </div>

              {/* Action Buttons */}
              <div className="flex items-center space-x-3">
                <button
                  type="button"
                  disabled={isDeleting}
                  onClick={() => setIsDeleteModalOpen(false)}
                  className="flex-1 py-2.5 px-4 bg-slate-100 hover:bg-slate-200 dark:bg-neutral-900 dark:hover:bg-neutral-800 text-slate-700 dark:text-neutral-300 rounded-xl text-xs font-bold transition-all cursor-pointer disabled:opacity-50"
                >
                  Keep My Account
                </button>

                <button
                  type="button"
                  disabled={!selectedReason || isDeleting}
                  onClick={handleConfirmDelete}
                  className="flex-1 py-2.5 px-4 bg-rose-600 hover:bg-rose-500 text-white rounded-xl text-xs font-bold shadow-md shadow-rose-600/20 transition-all flex items-center justify-center space-x-1.5 cursor-pointer disabled:opacity-50"
                >
                  {isDeleting ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      <span>Deleting Account...</span>
                    </>
                  ) : (
                    <>
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>Delete Permanently</span>
                    </>
                  )}
                </button>
              </div>

            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Footer */}
      <footer className="w-full py-4 text-center border-t border-slate-200/60 dark:border-neutral-900 text-slate-400 dark:text-neutral-600 text-xs">
        <p>© 2026 AgriGenius — National Agricultural AI Advisory Platform</p>
      </footer>
    </div>
  );
}
