import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Leaf,
  MessageSquare,
  Phone,
  IdCard,
  GraduationCap,
  Copy,
  Check,
  Sparkles,
  UserCheck,
  Edit3,
  X,
  Save,
  RotateCcw,
  User
} from 'lucide-react';
import { ThemeToggle } from '../components/ThemeToggle';
import { useAuth } from '../context/AuthContext';

export interface TeamMember {
  id: string;
  name: string;
  rollNumber: string;
  branch: string;
  phoneNumber: string;
  photo: string;
  role: string;
  bio: string;
}

const DEFAULT_TEAM: TeamMember[] = [
  {
    id: 'member-1',
    name: 'Kona Venkata Ravi Teja',
    rollNumber: 'CB.SC.U4CSE24327',
    branch: 'Computer Science & Engineering',
    phoneNumber: '+91 98765 43210',
    photo: '/team/member1.jpg',
    role: 'Frontend/3D Architect',
    bio: 'Architected the 3D grounded knowledge wheel and interactive web interface.',
  },
  {
    id: 'member-2',
    name: 'Tejasvi S',
    rollNumber: 'CB.SC.U4CSE24350',
    branch: 'Computer Science & Engineering',
    phoneNumber: '+91 8668110993',
    photo: '/team/member2.jpeg',
    role: 'RAG Pipeline & Neural Retrieval Lead',
    bio: 'Engineered the multilingual RAG retriever over the local KCC advisory index.',
  },
  {
    id: 'member-3',
    name: 'Rushil T',
    rollNumber: 'CB.SC.U4CSE24351',
    branch: 'Computer Science & Engineering',
    phoneNumber: '+91 8179610899',
    photo: '/team/member3.jpg',
    role: 'Backend Services & FastAPI Specialist',
    bio: 'Developed high-throughput streaming endpoints and vector database indices.',
  },
  {
    id: 'member-4',
    name: 'Vadlamudi Mokshagnna Bramha Teja',
    rollNumber: 'CB.SC.U4CSE24353',
    branch: 'Computer Science & Engineering',
    phoneNumber: '+91 6301465515',
    photo: '/team/member4.jpg',
    role: 'Evaluation Metrics & Dataset Verification',
    bio: 'Curated scientific agronomy dosage guidelines and evaluation benchmarks.',
  },
];

const FAN_CONFIG = [
  { rotate: -6, y: 6, x: -255, z: 10 },
  { rotate: -2, y: 0, x: -85, z: 20 },
  { rotate: 2, y: 0, x: 85, z: 30 },
  { rotate: 6, y: 6, x: 255, z: 40 },
];

export function TeamPage() {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();

  const [teamMembers, setTeamMembers] = useState<TeamMember[]>(() => {
    try {
      const saved = localStorage.getItem('agrigenius_team_members_v2');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (
          Array.isArray(parsed) &&
          parsed.length === 4 &&
          parsed.every((m) => m && typeof m.name === 'string' && typeof m.id === 'string')
        ) {
          return parsed.map((m, idx) => ({
            ...DEFAULT_TEAM[idx],
            ...m,
            photo: m.photo || DEFAULT_TEAM[idx].photo,
          }));
        }
      }
    } catch {
      // fallback
    }
    return DEFAULT_TEAM;
  });

  // Selected member index (null by default so About Project is shown initially)
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  // Edit details modal state
  const [isEditing, setIsEditing] = useState(false);
  const [editingForm, setEditingForm] = useState<TeamMember | null>(null);

  // Screen width for responsive fan spread
  const [windowWidth, setWindowWidth] = useState(() =>
    typeof window !== 'undefined' ? window.innerWidth : 1200
  );

  useEffect(() => {
    const handleResize = () => setWindowWidth(window.innerWidth);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const spreadScale = windowWidth < 400 ? 0.36 : (windowWidth < 640 ? 0.42 : (windowWidth < 1024 ? 0.72 : 1.0));
  const [copiedField, setCopiedField] = useState<string | null>(null);

  const copyToClipboard = (text: string, fieldId: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(fieldId);
    setTimeout(() => setCopiedField(null), 2000);
  };

  const handleSaveMember = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingForm) return;
    const updated = teamMembers.map((m) => (m.id === editingForm.id ? editingForm : m));
    setTeamMembers(updated);
    try {
      localStorage.setItem('agrigenius_team_members', JSON.stringify(updated));
    } catch (err) {
      console.error(err);
    }
    setIsEditing(false);
  };

  const handleResetDefaults = () => {
    if (confirm('Reset all team details back to original defaults?')) {
      setTeamMembers(DEFAULT_TEAM);
      try {
        localStorage.removeItem('agrigenius_team_members');
      } catch (err) {
        console.error(err);
      }
      setIsEditing(false);
    }
  };

  // Active member: hover takes temporary precedence, otherwise selectedIndex (null means About Project)
  const activeMemberIndex = hoveredIndex !== null ? hoveredIndex : selectedIndex;
  const showProjectOverview = activeMemberIndex === null;
  const activeMember = teamMembers[activeMemberIndex ?? 0];

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.2 }}
      className="min-h-[100dvh] w-full flex flex-col justify-between relative bg-slate-50 dark:bg-[#070908] text-slate-900 dark:text-neutral-100 transition-colors duration-200 overflow-y-auto sm:overflow-hidden select-none pb-20 sm:pb-0"
    >
      {/* Background Ambient Glow */}
      <div className="fixed top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[650px] h-[300px] bg-emerald-500/10 rounded-full blur-[140px] pointer-events-none" />

      {/* Top Navbar */}
      <header className="sticky top-0 z-40 bg-white/80 dark:bg-neutral-900/80 backdrop-blur-md border-b border-slate-200/80 dark:border-neutral-800/80 transition-colors">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-14 sm:h-16">
            {/* Logo */}
            <div
              className="flex items-center space-x-2.5 cursor-pointer"
              onClick={() => navigate('/')}
            >
              <div className="bg-gradient-to-br from-emerald-500 to-teal-600 dark:from-white dark:to-neutral-200 dark:text-black p-1.5 sm:p-2 rounded-xl shadow-md">
                <Leaf className="w-4 h-4 text-white dark:text-black" />
              </div>
              <div>
                <span className="text-base sm:text-lg font-black text-slate-900 dark:text-white tracking-tight">
                  AgriGenius
                </span>
                <span className="hidden sm:inline-block ml-2 text-[10px] font-mono font-bold uppercase tracking-wider text-emerald-700 dark:text-white bg-emerald-50 dark:bg-neutral-900 px-2 py-0.5 rounded-full border border-emerald-200 dark:border-neutral-800">
                  Team
                </span>
              </div>
            </div>

            {/* Quick Actions & Theme Toggle */}
            <div className="flex items-center space-x-2 sm:space-x-3">
              <button
                type="button"
                onClick={() => navigate(isAuthenticated ? '/profile' : '/auth')}
                className="inline-flex items-center justify-center px-2.5 py-1.5 sm:px-3 sm:py-2 text-xs font-bold text-slate-700 dark:text-neutral-200 bg-slate-100 hover:bg-slate-200 dark:bg-neutral-900 dark:hover:bg-neutral-800 rounded-xl border border-slate-200 dark:border-neutral-800 transition-all cursor-pointer"
                title={isAuthenticated ? "View Profile" : "Sign In / Login"}
              >
                {isAuthenticated ? (
                  <>
                    <User className="w-3.5 h-3.5 mr-1 text-emerald-600 dark:text-white" />
                    <span>Profile</span>
                  </>
                ) : (
                  <>
                    <User className="w-3.5 h-3.5 mr-1 text-slate-500 dark:text-neutral-400" />
                    <span>Sign In</span>
                  </>
                )}
              </button>
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

      {/* MAIN HERO: Sized to fit comfortably in viewport without vertical scrolling */}
      <main className="flex-1 max-w-5xl mx-auto w-full px-4 sm:px-6 py-2 sm:py-3 flex flex-col justify-around items-center min-h-0">
        {/* Header Text */}
        <div className="text-center max-w-xl mx-auto">
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-emerald-50 dark:bg-neutral-900 text-emerald-700 dark:text-white border border-emerald-200 dark:border-neutral-800 text-[11px] font-semibold mb-1 backdrop-blur-md">
            <Sparkles className="w-3 h-3 text-emerald-500 dark:text-white" />
            <span>4 Engineers &bull; 1 Mission</span>
          </div>

          <h1 className="text-2xl sm:text-4xl font-black tracking-tight text-slate-900 dark:text-white leading-tight mb-1">
            The Team Behind <span className="bg-clip-text text-transparent bg-gradient-to-r from-emerald-600 via-teal-500 to-emerald-400 dark:from-white dark:via-neutral-200 dark:to-neutral-400">AgriGenius</span>
          </h1>

          <p className="text-xs text-slate-500 dark:text-neutral-400 font-medium">
            Hover over any photo to inspect team member details.
          </p>
        </div>

        {/* =========================================================================
            UNIFIED INTERACTIVE ZONE:
            Encompasses both the fanned cards AND the bottom showcase.
            Hovering over cards previews member details smoothly.
            When mouse leaves this zone, cards settle and project overview shows.
           ========================================================================= */}
        <div
          onMouseLeave={() => setHoveredIndex(null)}
          className="w-full flex flex-col items-center justify-center my-0.5"
        >
          {/* FANNED PHOTO CARDS (With generous gaps to show each person's photo clearly) */}
          <div className="relative w-full max-w-4xl h-[235px] sm:h-[260px] flex items-center justify-center">
            <div className="relative flex items-center justify-center">
              {teamMembers.map((member, index) => {
                const cfg = FAN_CONFIG[index] || { rotate: 0, y: 0, x: 0, z: index * 10 };
                const isHovered = hoveredIndex === index;
                const isSelected = selectedIndex === index;

                return (
                  <motion.div
                    key={member.id}
                    onMouseEnter={() => setHoveredIndex(index)}
                    onClick={() => {
                      setSelectedIndex(selectedIndex === index ? null : index);
                      setHoveredIndex(null);
                    }}
                    animate={{
                      rotate: isHovered ? 0 : cfg.rotate,
                      y: isHovered ? -20 : cfg.y,
                      x: cfg.x * spreadScale,
                      scale: isHovered ? 1.08 : (isSelected ? 1.02 : 1),
                      zIndex: isHovered ? 50 : (isSelected ? 35 : cfg.z),
                    }}
                    transition={{
                      type: 'spring',
                      stiffness: 300,
                      damping: 24,
                    }}
                    className={`absolute will-change-transform select-none rounded-2xl group/card transition-shadow duration-200 cursor-pointer ${
                      isHovered
                        ? 'shadow-[0_20px_45px_rgba(0,0,0,0.35)] dark:shadow-[0_25px_50px_rgba(0,0,0,0.8)]'
                        : isSelected
                        ? 'shadow-lg dark:shadow-[0_14px_28px_rgba(0,0,0,0.6)]'
                        : 'shadow-md hover:shadow-xl dark:shadow-[0_12px_25px_rgba(0,0,0,0.5)]'
                    }`}
                    style={{
                      transformOrigin: 'bottom center',
                    }}
                  >
                    {/* POLAROID WHITE FRAME CONTAINER */}
                    <div className={`w-[115px] sm:w-[138px] md:w-[155px] bg-white text-neutral-900 p-1.5 sm:p-2.5 pb-2 sm:pb-3 rounded-2xl border transition-all relative ${
                      isSelected 
                        ? 'border-emerald-500 shadow-sm ring-2 ring-emerald-500/30' 
                        : 'border-neutral-200/90 shadow-sm'
                    }`}>
                      {/* Photo: Clear unobstructed portrait frame */}
                      <div className="w-full aspect-[4/5] rounded-xl overflow-hidden bg-slate-900 relative">
                        <img
                          src={member.photo}
                          alt={member.name}
                          className="w-full h-full object-cover object-center pointer-events-none"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent" />
                      </div>

                      {/* Polaroid Bottom Caption: Clear Person Name */}
                      <div className="pt-2 text-center px-1">
                        <span className="font-sans text-[11px] sm:text-xs font-bold text-neutral-900 tracking-tight block truncate">
                          {member.name}
                        </span>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </div>

          {/* Quick Switcher Pills for Instant Mobile & Desktop Navigation */}
          <div className="flex items-center justify-center gap-1 sm:gap-1.5 flex-wrap my-2 max-w-xl mx-auto px-2">
            {teamMembers.map((m, idx) => {
              const isSelected = activeMemberIndex === idx;
              return (
                <button
                  key={m.id}
                  type="button"
                  onClick={() => {
                    setSelectedIndex(selectedIndex === idx ? null : idx);
                    setHoveredIndex(null);
                  }}
                  className={`px-2.5 py-1 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                    isSelected
                      ? 'bg-emerald-600 text-white shadow-sm dark:bg-white dark:text-black font-bold scale-105'
                      : 'bg-white/80 dark:bg-neutral-900/80 text-slate-600 dark:text-neutral-400 border border-slate-200/80 dark:border-neutral-800 hover:bg-slate-100 dark:hover:bg-neutral-800'
                  }`}
                >
                  <span>{m.name.split(' ')[0]}</span>
                </button>
              );
            })}
            <button
              type="button"
              onClick={() => {
                setSelectedIndex(null);
                setHoveredIndex(null);
              }}
              className={`px-2.5 py-1 rounded-xl text-xs font-semibold transition-all cursor-pointer border ${
                showProjectOverview
                  ? 'bg-emerald-600 text-white dark:bg-white dark:text-black font-bold border-transparent scale-105'
                  : 'bg-slate-100 dark:bg-neutral-800 border-slate-200/80 dark:border-neutral-700 text-slate-500 dark:text-neutral-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              About Project
            </button>
          </div>

          {/* =========================================================================
              BOTTOM MIDDLE SHOWCASE:
              - Always shows activeMember details by default
              - If user taps "About Project", displays project overview
             ========================================================================= */}
          <div className="w-full max-w-2xl mx-auto flex items-center justify-center mt-1">
            <AnimatePresence mode="wait">
              {showProjectOverview ? (
                /* PROJECT DESCRIPTION */
                <motion.div
                  key="project-overview"
                  initial={{ opacity: 0, y: 10, scale: 0.98 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -10, scale: 0.98 }}
                  transition={{ duration: 0.18, ease: 'easeOut' }}
                  className="w-full bg-white/95 dark:bg-neutral-900/90 border border-slate-200 dark:border-neutral-800 rounded-2xl p-4 sm:p-5 shadow-xl backdrop-blur-xl relative group overflow-hidden transition-colors"
                >
                  {/* Top ambient highlight line */}
                  <div className="absolute top-0 inset-x-0 h-0.5 bg-gradient-to-r from-transparent via-emerald-500/80 dark:via-white/40 to-transparent" />

                  <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-neutral-800/80">
                    <div className="flex items-center space-x-2">
                      <div className="w-2 h-2 rounded-full bg-emerald-500 dark:bg-white animate-pulse" />
                      <span className="text-xs font-mono font-bold uppercase tracking-wider text-emerald-600 dark:text-white">
                        About AgriGenius AI
                      </span>
                    </div>
                  </div>

                  <div className="py-2">
                    <h3 className="text-sm sm:text-base font-black text-slate-900 dark:text-white mb-1">
                      Multilingual AI Agronomy Prototype for Indian Agriculture
                    </h3>
                    <p className="text-xs text-slate-600 dark:text-neutral-300 leading-relaxed">
                      AgriGenius retrieves from <strong>493,213 local KCC advisory records</strong> using multilingual Indic embeddings, a cross-encoder reranker, and evidence-backed answer generation in Hindi, Telugu, and English.
                    </p>
                  </div>
                </motion.div>
              ) : (
                /* ACTIVE MEMBER DETAILS (SHOWN BY DEFAULT) */
                <motion.div
                  key={activeMember.id}
                  initial={{ opacity: 0, y: 10, scale: 0.98 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -10, scale: 0.98 }}
                  transition={{ duration: 0.18, ease: 'easeOut' }}
                  className="w-full bg-white/95 dark:bg-neutral-900/90 border border-slate-200 dark:border-neutral-800 rounded-2xl p-4 sm:p-5 shadow-xl backdrop-blur-xl relative group overflow-hidden transition-colors"
                >
                  {/* Top ambient highlight line */}
                  <div className="absolute top-0 inset-x-0 h-0.5 bg-gradient-to-r from-transparent via-emerald-500/80 dark:via-white/40 to-transparent" />

                  {/* Top Header: Name, Role Pill & Edit Button */}
                  <div className="flex items-center justify-between gap-2 pb-2.5 border-b border-slate-100 dark:border-neutral-800/80">
                    <div className="flex items-center space-x-2.5 min-w-0">
                      <div className="w-9 h-9 rounded-full overflow-hidden shrink-0 border border-emerald-500/40 dark:border-white/40">
                        <img src={activeMember.photo} alt={activeMember.name} className="w-full h-full object-cover" />
                      </div>
                      <div className="min-w-0">
                        <h2 className="text-base sm:text-lg font-black text-slate-900 dark:text-white tracking-tight flex items-center gap-1.5 truncate">
                          <span className="truncate">{activeMember.name}</span>
                          <UserCheck className="w-4 h-4 text-emerald-500 dark:text-white shrink-0" />
                        </h2>
                        <span className="text-[11px] font-mono text-emerald-600 dark:text-white font-semibold block truncate">
                          {activeMember.role}
                        </span>
                      </div>
                    </div>

                    {/* Edit Details Action Button */}
                    <button
                      type="button"
                      onClick={() => {
                        setEditingForm({ ...activeMember });
                        setIsEditing(true);
                      }}
                      className="inline-flex items-center space-x-1.5 px-2.5 py-1 rounded-xl bg-emerald-50 dark:bg-neutral-800 hover:bg-emerald-100 dark:hover:bg-neutral-700 text-emerald-700 dark:text-white text-xs font-semibold border border-emerald-200/80 dark:border-neutral-700 transition-all cursor-pointer shrink-0 shadow-sm"
                      title="Edit this member's details"
                    >
                      <Edit3 className="w-3.5 h-3.5 text-emerald-600 dark:text-white" />
                      <span>Edit</span>
                    </button>
                  </div>

                  {/* Middle Grid: Roll Number, Branch, Phone */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 py-2.5">
                    {/* Roll Number */}
                    <div className="bg-slate-50 dark:bg-black/50 p-2.5 rounded-xl border border-slate-200/70 dark:border-neutral-800 flex items-center justify-between">
                      <div className="min-w-0">
                        <span className="text-[9px] font-mono uppercase tracking-wider text-slate-400 dark:text-neutral-400 font-bold block flex items-center gap-1">
                          <IdCard className="w-3 h-3 text-emerald-500 dark:text-white" />
                          Roll No
                        </span>
                        <span className="text-xs font-mono font-bold text-slate-900 dark:text-white truncate block">
                          {activeMember.rollNumber}
                        </span>
                      </div>
                      <button
                        type="button"
                        onClick={() => copyToClipboard(activeMember.rollNumber, `roll-${activeMember.id}`)}
                        className="p-1 rounded-lg hover:bg-slate-200 dark:hover:bg-neutral-800 text-slate-400 hover:text-slate-800 dark:hover:text-white transition-colors cursor-pointer shrink-0"
                        title="Copy Roll Number"
                      >
                        {copiedField === `roll-${activeMember.id}` ? (
                          <Check className="w-3.5 h-3.5 text-emerald-500 dark:text-white" />
                        ) : (
                          <Copy className="w-3.5 h-3.5" />
                        )}
                      </button>
                    </div>

                    {/* Branch */}
                    <div className="bg-slate-50 dark:bg-black/50 p-2.5 rounded-xl border border-slate-200/70 dark:border-neutral-800">
                      <span className="text-[9px] font-mono uppercase tracking-wider text-slate-400 dark:text-neutral-400 font-bold block flex items-center gap-1">
                        <GraduationCap className="w-3 h-3 text-emerald-500 dark:text-white" />
                        Branch
                      </span>
                      <span className="text-xs font-semibold text-slate-800 dark:text-neutral-200 leading-snug line-clamp-1 block">
                        {activeMember.branch}
                      </span>
                    </div>

                    {/* Phone */}
                    <div className="bg-slate-50 dark:bg-black/50 p-2.5 rounded-xl border border-slate-200/70 dark:border-neutral-800 flex items-center justify-between">
                      <div className="min-w-0">
                        <span className="text-[9px] font-mono uppercase tracking-wider text-slate-400 dark:text-neutral-400 font-bold block flex items-center gap-1">
                          <Phone className="w-3 h-3 text-emerald-500 dark:text-white" />
                          Phone
                        </span>
                        <a
                          href={`tel:${(activeMember.phoneNumber || '').replace(/\s+/g, '')}`}
                          className="text-xs font-mono font-bold text-emerald-600 dark:text-white hover:underline truncate block"
                        >
                          {activeMember.phoneNumber}
                        </a>
                      </div>
                      <button
                        type="button"
                        onClick={() => copyToClipboard(activeMember.phoneNumber, `phone-${activeMember.id}`)}
                        className="p-1 rounded-lg hover:bg-slate-200 dark:hover:bg-neutral-800 text-slate-400 hover:text-slate-800 dark:hover:text-white transition-colors cursor-pointer shrink-0"
                        title="Copy Phone"
                      >
                        {copiedField === `phone-${activeMember.id}` ? (
                          <Check className="w-3.5 h-3.5 text-emerald-500 dark:text-white" />
                        ) : (
                          <Copy className="w-3.5 h-3.5" />
                        )}
                      </button>
                    </div>
                  </div>

                  {/* Bio summary */}
                  {activeMember.bio && activeMember.bio.trim().length > 0 && (
                    <div className="pt-2 border-t border-slate-100 dark:border-neutral-800/80 text-[11px] text-slate-500 dark:text-neutral-400 leading-relaxed italic truncate">
                      &ldquo;{activeMember.bio.trim()}&rdquo;
                    </div>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </main>

      {/* EDIT MEMBER DETAILS MODAL */}
      <AnimatePresence>
        {isEditing && editingForm && (
          <div 
            className="fixed inset-0 z-[10002] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md"
            onClick={() => setIsEditing(false)}
          >
            <motion.div
              onClick={(e) => e.stopPropagation()}
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              className="bg-white dark:bg-neutral-900 border border-slate-200 dark:border-neutral-800 rounded-3xl p-5 sm:p-6 max-w-lg w-full shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto"
            >
              <div className="flex items-center justify-between border-b border-slate-100 dark:border-neutral-800 pb-3">
                <div className="flex items-center space-x-2">
                  <div className="p-2 rounded-xl bg-emerald-50 dark:bg-neutral-800 text-emerald-600 dark:text-white">
                    <Edit3 className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="text-base font-black text-slate-900 dark:text-white">Edit Member Details</h3>
                    <p className="text-xs text-slate-400 dark:text-neutral-500">Update roll number, branch, phone, or role</p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setIsEditing(false)}
                  className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-neutral-800 text-slate-400 hover:text-slate-800 dark:hover:text-white cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <form onSubmit={handleSaveMember} className="space-y-3">
                <div>
                  <label className="text-xs font-semibold text-slate-600 dark:text-neutral-400 block mb-1">Full Name</label>
                  <input
                    type="text"
                    value={editingForm.name}
                    onChange={(e) => setEditingForm({ ...editingForm, name: e.target.value })}
                    className="w-full px-3 py-2 text-xs sm:text-sm rounded-xl border border-slate-200 dark:border-neutral-700 bg-slate-50 dark:bg-neutral-800/80 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                    required
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-semibold text-slate-600 dark:text-neutral-400 block mb-1">Roll Number</label>
                    <input
                      type="text"
                      value={editingForm.rollNumber}
                      onChange={(e) => setEditingForm({ ...editingForm, rollNumber: e.target.value })}
                      className="w-full px-3 py-2 text-xs sm:text-sm rounded-xl border border-slate-200 dark:border-neutral-700 bg-slate-50 dark:bg-neutral-800/80 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 font-mono"
                      required
                    />
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-slate-600 dark:text-neutral-400 block mb-1">Phone Number</label>
                    <input
                      type="text"
                      value={editingForm.phoneNumber}
                      onChange={(e) => setEditingForm({ ...editingForm, phoneNumber: e.target.value })}
                      className="w-full px-3 py-2 text-xs sm:text-sm rounded-xl border border-slate-200 dark:border-neutral-700 bg-slate-50 dark:bg-neutral-800/80 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 font-mono"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-600 dark:text-neutral-400 block mb-1">Branch / Specialization</label>
                  <input
                    type="text"
                    value={editingForm.branch}
                    onChange={(e) => setEditingForm({ ...editingForm, branch: e.target.value })}
                    className="w-full px-3 py-2 text-xs sm:text-sm rounded-xl border border-slate-200 dark:border-neutral-700 bg-slate-50 dark:bg-neutral-800/80 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                    required
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-600 dark:text-neutral-400 block mb-1">Project Role</label>
                  <input
                    type="text"
                    value={editingForm.role}
                    onChange={(e) => setEditingForm({ ...editingForm, role: e.target.value })}
                    className="w-full px-3 py-2 text-xs sm:text-sm rounded-xl border border-slate-200 dark:border-neutral-700 bg-slate-50 dark:bg-neutral-800/80 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                    required
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-600 dark:text-neutral-400 block mb-1">Bio Summary</label>
                  <textarea
                    rows={2}
                    value={editingForm.bio}
                    onChange={(e) => setEditingForm({ ...editingForm, bio: e.target.value })}
                    className="w-full px-3 py-2 text-xs sm:text-sm rounded-xl border border-slate-200 dark:border-neutral-700 bg-slate-50 dark:bg-neutral-800/80 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 resize-none"
                  />
                </div>

                <div className="flex items-center justify-between pt-3 border-t border-slate-100 dark:border-neutral-800">
                  <button
                    type="button"
                    onClick={handleResetDefaults}
                    className="inline-flex items-center space-x-1 text-xs text-red-500 hover:text-red-600 transition-colors cursor-pointer"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    <span>Reset Defaults</span>
                  </button>

                  <div className="flex items-center space-x-2">
                    <button
                      type="button"
                      onClick={() => setIsEditing(false)}
                      className="px-3 py-1.5 rounded-xl border border-slate-200 dark:border-neutral-700 text-xs font-semibold text-slate-600 dark:text-neutral-300 hover:bg-slate-100 dark:hover:bg-neutral-800 transition-colors cursor-pointer"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="inline-flex items-center space-x-1.5 px-4 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 dark:bg-white dark:text-black text-white text-xs font-bold transition-all shadow-md shadow-emerald-600/20 dark:shadow-none cursor-pointer"
                    >
                      <Save className="w-3.5 h-3.5" />
                      <span>Save Details</span>
                    </button>
                  </div>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Spacing for fixed GlobalBottomNav */}
      <div className="h-14 w-full shrink-0 pointer-events-none" />
    </motion.div>
  );
}
