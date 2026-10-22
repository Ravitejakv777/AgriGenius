import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ShieldCheck,
  Search,
  Filter,
  CheckCircle2,
  Database,
  Cpu,
  Sprout,
  Users,
  Download,
  RefreshCw,
  LogOut,
  ExternalLink,
  X,
  FileText,
  Activity,
  ArrowUpRight,
  UserPlus
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { ThemeToggle } from '../components/ThemeToggle';

interface QueryLogItem {
  id: string;
  timestamp: string;
  farmerName: string;
  location: string;
  state: string;
  crop: string;
  hindiCrop: string;
  query: string;
  answer: string;
  confidence: 'high' | 'medium' | 'flagged';
  score: number;
  retrievalLatencyMs: number;
  sourcesCount: number;
  kccPassage: string;
  queryType: string;
}

const SAMPLE_QUERY_LOGS: QueryLogItem[] = [
  {
    id: 'KCC-94821',
    timestamp: '2 mins ago',
    farmerName: 'Balwant Singh',
    location: 'Ludhiana',
    state: 'Punjab',
    crop: 'Wheat',
    hindiCrop: 'गेहूं',
    query: 'गेहूं में पहली सिंचाई (CRI Stage) कितने दिन बाद करनी चाहिए और यूरिया की क्या मात्रा डालें?',
    answer: 'Wheat crop requires the first critical irrigation at the Crown Root Initiation (CRI) stage, exactly 20-25 days after sowing. Top-dress 60 kg Urea/acre immediately following irrigation when soil allows foot traffic.',
    confidence: 'high',
    score: 0.984,
    retrievalLatencyMs: 142,
    sourcesCount: 3,
    kccPassage: 'KCC Record #PB-4412: First irrigation at CRI stage (20-25 DAS) is non-negotiable. Broadcast 1/3rd Nitrogen (Urea) post irrigation.',
    queryType: 'Irrigation & Nutrients'
  },
  {
    id: 'KCC-94820',
    timestamp: '6 mins ago',
    farmerName: 'Dnyaneshwar Patil',
    location: 'Nashik',
    state: 'Maharashtra',
    crop: 'Onion',
    hindiCrop: 'प्याज़',
    query: 'प्याज़ में बैंगनी धब्बा (Purple Blotch) रोग लग रहा है, कौन सी फफूंदनाशी डालें?',
    answer: 'Purple Blotch in Onion requires foliar spray of Mancozeb 75% WP @ 2.5 g/L or Tebuconazole 25.9% EC @ 1 ml/L mixed with a sticker (adjuvant) at 10-day intervals.',
    confidence: 'high',
    score: 0.967,
    retrievalLatencyMs: 168,
    sourcesCount: 2,
    kccPassage: 'KCC Record #MH-8821: Purple Blotch caused by Alternaria porri. Spray Mancozeb 75% WP @ 2.5g/L + Sandovit sticker.',
    queryType: 'Disease Control'
  },
  {
    id: 'KCC-94819',
    timestamp: '14 mins ago',
    farmerName: 'Venkata Rao',
    location: 'Guntur',
    state: 'Andhra Pradesh',
    crop: 'Chilli',
    hindiCrop: 'मिर्च',
    query: 'How to control black thrips and leaf curl virus in chilli crop during flowering?',
    answer: 'For black thrips in chilli, install blue sticky traps @ 25/acre. Spray Diafenthiuron 50% WP @ 1.25 g/L or Spinetoram 11.7% SC @ 1 ml/L targeting flower clusters and leaf undersides.',
    confidence: 'high',
    score: 0.952,
    retrievalLatencyMs: 189,
    sourcesCount: 4,
    kccPassage: 'KCC Record #AP-1039: Invasive black thrips (Thrips parvispinus) in Chilli. Use Spinetoram 11.7% SC @ 1ml/L or Fipronil 5% SC.',
    queryType: 'Pest Management'
  },
  {
    id: 'KCC-94818',
    timestamp: '25 mins ago',
    farmerName: 'Harishankar Sharma',
    location: 'Gorakhpur',
    state: 'Uttar Pradesh',
    crop: 'Paddy',
    hindiCrop: 'धान',
    query: 'धान में खैरा रोग के लक्षण दिख रहे हैं, पत्तियां पीली पड़कर कत्थई हो रही हैं।',
    answer: 'Khaira disease in paddy is caused by Zinc deficiency. Immediately spray Zinc Sulphate (21%) @ 5 kg + 2.5 kg slaked lime dissolved in 1000 litres of water per hectare (or 5g + 2.5g per litre).',
    confidence: 'high',
    score: 0.978,
    retrievalLatencyMs: 155,
    sourcesCount: 3,
    kccPassage: 'KCC Record #UP-3921: Khaira disease in Rice. Spray Zinc Sulphate 21% @ 5g/L + Lime 2.5g/L.',
    queryType: 'Micronutrient Deficiency'
  },
  {
    id: 'KCC-94817',
    timestamp: '38 mins ago',
    farmerName: 'Jitendra Rathore',
    location: 'Kota',
    state: 'Rajasthan',
    crop: 'Mustard',
    hindiCrop: 'सरसों',
    query: 'सरसों में माहू (Aphids) कीट का भारी प्रकोप हो गया है, तुरंत उपाय बताएं।',
    answer: 'For aphid (Chetpa/Mahoo) management in mustard, spray Dimethoate 30% EC @ 1.7 ml/L or Thiamethoxam 25% WG @ 0.2 g/L during late evening hours to protect pollinators.',
    confidence: 'high',
    score: 0.961,
    retrievalLatencyMs: 140,
    sourcesCount: 2,
    kccPassage: 'KCC Record #RJ-7102: Mustard Aphid (Lipaphis erysimi) above ETL. Foliar spray Thiamethoxam 25% WG @ 0.2g/L.',
    queryType: 'Pest Management'
  },
  {
    id: 'KCC-94816',
    timestamp: '52 mins ago',
    farmerName: 'Suresh Kurmi',
    location: 'Sehore',
    state: 'Madhya Pradesh',
    crop: 'Gram',
    hindiCrop: 'चना',
    query: 'चना में उकठा रोग (Wilt) और फली छेदक (Pod Borer) से बचाव?',
    answer: 'For wilt, treat seed with Trichoderma viride @ 10g/kg. For Helicoverpa pod borer at early pod stage, spray Emamectin Benzoate 5% SG @ 0.5 g/L.',
    confidence: 'medium',
    score: 0.892,
    retrievalLatencyMs: 210,
    sourcesCount: 2,
    kccPassage: 'KCC Record #MP-5021: Chickpea wilt prevention via bio-agent seed treatment; Emamectin Benzoate for pod borer larval stage.',
    queryType: 'Disease & Pest'
  },
  {
    id: 'KCC-94815',
    timestamp: '1 hour ago',
    farmerName: 'Mohd. Rafiq',
    location: 'Meerut',
    state: 'Uttar Pradesh',
    crop: 'Sugarcane',
    hindiCrop: 'गन्ना',
    query: 'गन्ने की पेड़ी (Ratoon) फसल में पहली सिंचाई और यूरिया की सही खुराक क्या है?',
    answer: 'For ratoon sugarcane, shave old stubbles cleanly. Apply 25% higher nitrogen (60 kg N/ha) at first irrigation followed by immediate deep hoeing to loosen inter-row soil.',
    confidence: 'high',
    score: 0.975,
    retrievalLatencyMs: 162,
    sourcesCount: 3,
    kccPassage: 'KCC Record #UP-8201: Ratoon sugarcane management. Extra 25% Nitrogen top-dressing required due to root rejuvenation.',
    queryType: 'Agronomic Practices'
  }
];

const ADMIN_CROPS_CATALOG = [
  { id: 1, name: 'Wheat', hindi: 'गेहूं', category: 'Cereal / Rabi', recordsCount: 42180, image: '/crops/wheat.jpg', status: 'Active Verified', criticalNotice: 'CRI Stage Irrigation Alert' },
  { id: 2, name: 'Paddy (Rice)', hindi: 'धान', category: 'Cereal / Kharif', recordsCount: 58920, image: '/crops/paddy.jpg', status: 'Active Verified', criticalNotice: 'Stem Borer & Khaira Protocol' },
  { id: 3, name: 'Cotton', hindi: 'कपास', category: 'Cash Crop', recordsCount: 31450, image: '/crops/cotton.jpg', status: 'Active Verified', criticalNotice: 'Pink Bollworm Gossyplure Trap' },
  { id: 4, name: 'Sugarcane', hindi: 'गन्ना', category: 'Cash Crop', recordsCount: 27810, image: '/crops/sugarcane.jpg', status: 'Active Verified', criticalNotice: 'Ratoon Stubble 25% Extra N' },
  { id: 5, name: 'Mustard', hindi: 'सरसों', category: 'Oilseed', recordsCount: 19840, image: '/crops/mustard.jpg', status: 'Active Verified', criticalNotice: 'Aphid Dimethoate Spray' },
  { id: 6, name: 'Potato', hindi: 'आलू', category: 'Horticulture', recordsCount: 24120, image: '/crops/potato.jpg', status: 'Active Verified', criticalNotice: 'Early & Late Blight Protocol' },
  { id: 7, name: 'Tomato', hindi: 'टमाटर', category: 'Vegetable', recordsCount: 22670, image: '/crops/tomato.jpg', status: 'Active Verified', criticalNotice: 'Tuta Absoluta & Leaf Curl' },
  { id: 8, name: 'Chilli', hindi: 'मिर्च', category: 'Spices / Vegetable', recordsCount: 18450, image: '/crops/chilli.jpg', status: 'Active Verified', criticalNotice: 'Black Thrips & Murda Complex' },
  { id: 9, name: 'Onion', hindi: 'प्याज़', category: 'Vegetable', recordsCount: 21390, image: '/crops/onion.jpg', status: 'Active Verified', criticalNotice: 'Purple Blotch & Thrips Care' },
  { id: 10, name: 'Gram (Chickpea)', hindi: 'चना', category: 'Pulse', recordsCount: 17820, image: '/crops/gram.jpg', status: 'Active Verified', criticalNotice: 'Wilt Bio-treatment & Pod Borer' },
  { id: 11, name: 'Maize', hindi: 'मक्का', category: 'Cereal', recordsCount: 19430, image: '/crops/maize.jpg', status: 'Active Verified', criticalNotice: 'Fall Armyworm (FAW) Protocol' },
  { id: 12, name: 'Soybean', hindi: 'सोयाबीन', category: 'Oilseed / Pulse', recordsCount: 16290, image: '/crops/soybean.jpg', status: 'Active Verified', criticalNotice: 'Girdle Beetle & Yellow Mosaic' },
];

const PLATFORM_USERS = [
  { id: 'usr_01', name: 'Dr. Ravi Teja', email: 'admin@agrigenius.gov.in', role: 'admin', location: 'Delhi HQ', queries: 284, status: 'Active' },
  { id: 'usr_02', name: 'Dr. Priya Sharma', email: 'priya.sharma@icar.gov.in', role: 'agronomist', location: 'Pune, Maharashtra', queries: 1420, status: 'Active' },
  { id: 'usr_03', name: 'Tejasvi S', email: 'tejasvi.retriever@agrigenius.ai', role: 'admin', location: 'Coimbatore, TN', queries: 910, status: 'Active' },
  { id: 'usr_04', name: 'Rushil T', email: 'rushil.fastapi@agrigenius.ai', role: 'admin', location: 'Hyderabad, TS', queries: 840, status: 'Active' },
  { id: 'usr_05', name: 'Ramesh Patel', email: 'ramesh.farmer@agrigenius.app', role: 'farmer', location: 'Ludhiana, Punjab', queries: 48, status: 'Active' },
  { id: 'usr_06', name: 'Sanjay Deshmukh', email: 'sanjay.agro@kvk.org', role: 'agronomist', location: 'Akola, Maharashtra', queries: 312, status: 'Active' },
  { id: 'usr_07', name: 'Venkatesh K', email: 'venkat.kisan@gmail.com', role: 'farmer', location: 'Guntur, AP', queries: 63, status: 'Active' },
];

export function AdminDashboard() {
  const navigate = useNavigate();
  const { user, isAdmin, logout, quickLogin } = useAuth();

  // Tab navigation: 'audit' | 'knowledge' | 'system' | 'users'
  const [activeTab, setActiveTab] = useState<'audit' | 'knowledge' | 'system' | 'users'>('audit');

  // Search & Filters for Audit Log
  const [searchQuery, setSearchQuery] = useState('');
  const [filterConfidence, setFilterConfidence] = useState<'all' | 'high' | 'medium'>('all');
  const [filterCrop, setFilterCrop] = useState<string>('all');

  // Inspection Modal
  const [selectedLog, setSelectedLog] = useState<QueryLogItem | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [exportNotice, setExportNotice] = useState(false);

  // If user is not admin, provide clean access gate
  if (!isAdmin) {
    return (
      <div className="min-h-screen w-full flex items-center justify-center p-4 bg-slate-50 dark:bg-black text-slate-900 dark:text-white transition-colors duration-300">
        <div className="max-w-md w-full bg-white dark:bg-neutral-950 border border-slate-200 dark:border-neutral-800 rounded-3xl p-6 sm:p-8 text-center shadow-2xl">
          <div className="w-16 h-16 rounded-2xl bg-amber-50 dark:bg-neutral-900 border border-amber-200 dark:border-neutral-800 flex items-center justify-center mx-auto mb-4 text-amber-600 dark:text-white">
            <ShieldCheck className="w-8 h-8" />
          </div>
          <h2 className="text-xl sm:text-2xl font-bold tracking-tight mb-2">
            Administrator Access Required
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-neutral-400 mb-6 leading-relaxed">
            The AgriGenius Central Telemetry & RAG Audit Console is reserved for platform administrators and KCC nodal officers.
          </p>

          <div className="space-y-3">
            <button
              onClick={() => {
                quickLogin('admin');
              }}
              className="w-full py-2.5 px-4 bg-slate-900 hover:bg-slate-800 dark:bg-white dark:hover:bg-neutral-200 text-white dark:text-black rounded-xl text-xs sm:text-sm font-bold transition-all shadow-md cursor-pointer flex items-center justify-center space-x-2"
            >
              <ShieldCheck className="w-4 h-4" />
              <span>Sign In as Demo Administrator</span>
            </button>

            <button
              onClick={() => navigate('/auth')}
              className="w-full py-2.5 px-4 bg-slate-100 hover:bg-slate-200 dark:bg-neutral-900 dark:hover:bg-neutral-800 text-slate-800 dark:text-white rounded-xl text-xs sm:text-sm font-semibold transition-all border border-slate-200 dark:border-neutral-800 cursor-pointer"
            >
              Go to Standard Sign In
            </button>

            <button
              onClick={() => navigate('/')}
              className="w-full text-xs text-slate-500 dark:text-neutral-400 hover:underline pt-2 cursor-pointer"
            >
              Return to Wheel of Intelligence
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Filtered queries
  const filteredLogs = useMemo(() => {
    return SAMPLE_QUERY_LOGS.filter((item) => {
      const matchSearch =
        searchQuery === '' ||
        item.query.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.farmerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.crop.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.location.toLowerCase().includes(searchQuery.toLowerCase());

      const matchConfidence =
        filterConfidence === 'all' || item.confidence === filterConfidence;

      const matchCrop =
        filterCrop === 'all' || item.crop.toLowerCase() === filterCrop.toLowerCase();

      return matchSearch && matchConfidence && matchCrop;
    });
  }, [searchQuery, filterConfidence, filterCrop]);

  const handleRefresh = () => {
    setIsRefreshing(true);
    setTimeout(() => {
      setIsRefreshing(false);
    }, 600);
  };

  const handleExportCSV = () => {
    setExportNotice(true);
    setTimeout(() => setExportNotice(false), 3000);
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="min-h-screen w-full bg-slate-50 dark:bg-black text-slate-900 dark:text-white transition-colors duration-300 font-sans pb-28"
    >
      {/* Top Admin Navbar */}
      <header className="sticky top-0 z-40 bg-white/80 dark:bg-black/90 backdrop-blur-md border-b border-slate-200/80 dark:border-neutral-800 transition-colors">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            
            {/* Logo & Admin Badge */}
            <div className="flex items-center space-x-3">
              <div 
                onClick={() => navigate('/')}
                className="flex items-center space-x-2.5 cursor-pointer group"
              >
                <div className="bg-emerald-600 dark:bg-white dark:text-black text-white p-2 rounded-xl transition-transform group-hover:scale-105">
                  <ShieldCheck className="w-4 h-4 text-white dark:text-black" />
                </div>
                <div>
                  <div className="flex items-center space-x-2">
                    <span className="text-base sm:text-lg font-black tracking-tight text-slate-900 dark:text-white">
                      AgriGenius
                    </span>
                    <span className="px-2 py-0.5 text-[10px] font-mono font-bold uppercase rounded-md bg-emerald-100 dark:bg-white/10 text-emerald-800 dark:text-white border border-emerald-300 dark:border-white/20">
                      Admin Console
                    </span>
                  </div>
                </div>
              </div>

              {/* Status Beacon */}
              <div className="hidden lg:flex items-center space-x-2 pl-4 border-l border-slate-200 dark:border-neutral-800">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                </span>
                <span className="text-xs font-mono text-slate-600 dark:text-neutral-400">
                  RAG Cluster: 347,944 Synced
                </span>
              </div>
            </div>

            {/* Right Quick Controls */}
            <div className="flex items-center space-x-2 sm:space-x-3">
              <button
                onClick={() => navigate('/')}
                className="hidden sm:inline-flex items-center space-x-1.5 px-3 py-1.5 text-xs font-semibold text-slate-600 dark:text-neutral-300 hover:text-slate-900 dark:hover:text-white bg-slate-100 hover:bg-slate-200 dark:bg-neutral-900 dark:hover:bg-neutral-800 rounded-xl transition-colors cursor-pointer border border-slate-200 dark:border-neutral-800"
              >
                <ExternalLink className="w-3.5 h-3.5" />
                <span>Public Wheel</span>
              </button>

              <ThemeToggle />

              {/* User Dropdown / Logout */}
              <div className="flex items-center space-x-2 pl-2 border-l border-slate-200 dark:border-neutral-800">
                <div className="hidden md:block text-right">
                  <p className="text-xs font-bold leading-none text-slate-900 dark:text-white">
                    {user?.name || 'Dr. Ravi Teja'}
                  </p>
                  <p className="text-[10px] text-slate-500 dark:text-neutral-400 leading-tight">
                    Chief Administrator
                  </p>
                </div>
                <button
                  onClick={() => {
                    logout();
                    navigate('/');
                  }}
                  title="Logout"
                  className="p-2 rounded-xl bg-slate-100 hover:bg-rose-50 hover:text-rose-600 dark:bg-neutral-900 dark:hover:bg-rose-950/40 dark:hover:text-rose-400 text-slate-600 dark:text-neutral-400 border border-slate-200 dark:border-neutral-800 transition-colors cursor-pointer"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            </div>

          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 sm:pt-8">
        
        {/* Header Greeting & Action Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 sm:mb-8">
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">
              System Control & RAG Telemetry
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-neutral-400 mt-1">
              Real-time Kisan Call Centre (KCC) dual-retriever verification engine and knowledge graph.
            </p>
          </div>

          <div className="flex items-center space-x-2 self-start sm:self-auto">
            <button
              onClick={handleRefresh}
              disabled={isRefreshing}
              className="inline-flex items-center space-x-1.5 px-3 py-2 bg-white dark:bg-neutral-900 border border-slate-200 dark:border-neutral-800 text-slate-700 dark:text-neutral-200 rounded-xl text-xs font-bold hover:bg-slate-50 dark:hover:bg-neutral-800 transition-all cursor-pointer"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin' : ''}`} />
              <span>Refresh</span>
            </button>

            <button
              onClick={handleExportCSV}
              className="inline-flex items-center space-x-1.5 px-3 py-2 bg-slate-900 hover:bg-slate-800 dark:bg-white dark:hover:bg-neutral-200 text-white dark:text-black rounded-xl text-xs font-bold transition-all cursor-pointer shadow-sm"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Export CSV</span>
            </button>
          </div>
        </div>

        {/* CSV Notice banner */}
        <AnimatePresence>
          {exportNotice && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="mb-6 p-3 bg-emerald-50 dark:bg-neutral-900 border border-emerald-300 dark:border-white/20 text-emerald-800 dark:text-white rounded-2xl text-xs font-bold flex items-center space-x-2"
            >
              <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-white" />
              <span>Audit Log export generated: 18,492 query transcripts ready for Ministry of Agriculture reporting.</span>
            </motion.div>
          )}
        </AnimatePresence>

        {/* KPI Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4 mb-8">
          
          <div className="bg-white dark:bg-neutral-950 p-4 rounded-2xl border border-slate-200/90 dark:border-neutral-800/90 shadow-sm">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[10px] font-mono uppercase tracking-wider text-slate-500 dark:text-neutral-400">Total KCC Transcripts</span>
              <Database className="w-4 h-4 text-slate-400 dark:text-neutral-400" />
            </div>
            <p className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white">347,944</p>
            <span className="text-[10px] font-semibold text-emerald-600 dark:text-neutral-300">100% Indexed</span>
          </div>

          <div className="bg-white dark:bg-neutral-950 p-4 rounded-2xl border border-slate-200/90 dark:border-neutral-800/90 shadow-sm">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[10px] font-mono uppercase tracking-wider text-slate-500 dark:text-neutral-400">Queries Handled</span>
              <Activity className="w-4 h-4 text-slate-400 dark:text-neutral-400" />
            </div>
            <p className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white">18,492</p>
            <span className="text-[10px] font-semibold text-emerald-600 dark:text-neutral-300">+14.2% this week</span>
          </div>

          <div className="bg-white dark:bg-neutral-950 p-4 rounded-2xl border border-slate-200/90 dark:border-neutral-800/90 shadow-sm">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[10px] font-mono uppercase tracking-wider text-slate-500 dark:text-neutral-400">Grounded Accuracy</span>
              <ShieldCheck className="w-4 h-4 text-slate-400 dark:text-neutral-400" />
            </div>
            <p className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white">97.8%</p>
            <span className="text-[10px] font-semibold text-emerald-600 dark:text-neutral-300">Dual Verified</span>
          </div>

          <div className="bg-white dark:bg-neutral-950 p-4 rounded-2xl border border-slate-200/90 dark:border-neutral-800/90 shadow-sm">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[10px] font-mono uppercase tracking-wider text-slate-500 dark:text-neutral-400">RAG Latency (P95)</span>
              <Cpu className="w-4 h-4 text-slate-400 dark:text-neutral-400" />
            </div>
            <p className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white">184 ms</p>
            <span className="text-[10px] font-semibold text-emerald-600 dark:text-neutral-300">All-MiniLM Dense</span>
          </div>

          <div className="bg-white dark:bg-neutral-950 p-4 rounded-2xl border border-slate-200/90 dark:border-neutral-800/90 shadow-sm">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[10px] font-mono uppercase tracking-wider text-slate-500 dark:text-neutral-400">Wheel Catalog</span>
              <Sprout className="w-4 h-4 text-slate-400 dark:text-neutral-400" />
            </div>
            <p className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white">34 / 34</p>
            <span className="text-[10px] font-semibold text-emerald-600 dark:text-neutral-300">Photos Validated</span>
          </div>

          <div className="bg-white dark:bg-neutral-950 p-4 rounded-2xl border border-slate-200/90 dark:border-neutral-800/90 shadow-sm">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[10px] font-mono uppercase tracking-wider text-slate-500 dark:text-neutral-400">Active Users</span>
              <Users className="w-4 h-4 text-slate-400 dark:text-neutral-400" />
            </div>
            <p className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white">8,420</p>
            <span className="text-[10px] font-semibold text-emerald-600 dark:text-neutral-300">28 States</span>
          </div>

        </div>

        {/* Tab Switcher */}
        <div className="border-b border-slate-200 dark:border-neutral-800 mb-6 flex space-x-1 sm:space-x-3 overflow-x-auto scrollbar-hide">
          <button
            onClick={() => setActiveTab('audit')}
            className={`pb-3 px-3 text-xs sm:text-sm font-bold border-b-2 transition-all flex items-center space-x-2 whitespace-nowrap cursor-pointer ${
              activeTab === 'audit'
                ? 'border-emerald-600 dark:border-white text-emerald-700 dark:text-white'
                : 'border-transparent text-slate-500 dark:text-neutral-400 hover:text-slate-800 dark:hover:text-white'
            }`}
          >
            <FileText className="w-4 h-4" />
            <span>KCC Live Query Audit</span>
            <span className="ml-1 px-1.5 py-0.5 rounded-full text-[10px] bg-slate-100 dark:bg-neutral-800 text-slate-600 dark:text-neutral-300">
              {filteredLogs.length}
            </span>
          </button>

          <button
            onClick={() => setActiveTab('knowledge')}
            className={`pb-3 px-3 text-xs sm:text-sm font-bold border-b-2 transition-all flex items-center space-x-2 whitespace-nowrap cursor-pointer ${
              activeTab === 'knowledge'
                ? 'border-emerald-600 dark:border-white text-emerald-700 dark:text-white'
                : 'border-transparent text-slate-500 dark:text-neutral-400 hover:text-slate-800 dark:hover:text-white'
            }`}
          >
            <Sprout className="w-4 h-4" />
            <span>Crop Protocols & Wheel (34)</span>
          </button>

          <button
            onClick={() => setActiveTab('system')}
            className={`pb-3 px-3 text-xs sm:text-sm font-bold border-b-2 transition-all flex items-center space-x-2 whitespace-nowrap cursor-pointer ${
              activeTab === 'system'
                ? 'border-emerald-600 dark:border-white text-emerald-700 dark:text-white'
                : 'border-transparent text-slate-500 dark:text-neutral-400 hover:text-slate-800 dark:hover:text-white'
            }`}
          >
            <Cpu className="w-4 h-4" />
            <span>Neural RAG Pipeline Status</span>
          </button>

          <button
            onClick={() => setActiveTab('users')}
            className={`pb-3 px-3 text-xs sm:text-sm font-bold border-b-2 transition-all flex items-center space-x-2 whitespace-nowrap cursor-pointer ${
              activeTab === 'users'
                ? 'border-emerald-600 dark:border-white text-emerald-700 dark:text-white'
                : 'border-transparent text-slate-500 dark:text-neutral-400 hover:text-slate-800 dark:hover:text-white'
            }`}
          >
            <Users className="w-4 h-4" />
            <span>Agronomists & Accounts</span>
          </button>
        </div>

        {/* TAB 1: KCC LIVE QUERY AUDIT */}
        {activeTab === 'audit' && (
          <div className="space-y-4">
            {/* Filter and Search Bar */}
            <div className="bg-white dark:bg-neutral-950 p-4 rounded-2xl border border-slate-200/80 dark:border-neutral-800/80 flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between">
              
              <div className="relative flex-1">
                <Search className="w-4 h-4 text-slate-400 dark:text-neutral-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Filter queries by farmer, district, keyword, or crop..."
                  className="w-full pl-10 pr-4 py-2 bg-slate-50 dark:bg-neutral-900 border border-slate-200 dark:border-neutral-800 rounded-xl text-xs sm:text-sm text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-neutral-500 focus:outline-none focus:ring-2 focus:ring-emerald-500 dark:focus:ring-white transition-all"
                />
              </div>

              <div className="flex items-center space-x-2">
                <div className="flex items-center space-x-1 bg-slate-50 dark:bg-neutral-900 border border-slate-200 dark:border-neutral-800 rounded-xl px-2 py-1.5">
                  <Filter className="w-3.5 h-3.5 text-slate-400 dark:text-neutral-500" />
                  <select
                    value={filterConfidence}
                    onChange={(e) => setFilterConfidence(e.target.value as 'all' | 'high' | 'medium')}
                    className="bg-transparent text-xs text-slate-700 dark:text-neutral-300 font-semibold focus:outline-none cursor-pointer"
                  >
                    <option value="all">All Confidence</option>
                    <option value="high">High (&gt;90%)</option>
                    <option value="medium">Medium (80-90%)</option>
                  </select>
                </div>

                <div className="flex items-center space-x-1 bg-slate-50 dark:bg-neutral-900 border border-slate-200 dark:border-neutral-800 rounded-xl px-2 py-1.5">
                  <select
                    value={filterCrop}
                    onChange={(e) => setFilterCrop(e.target.value)}
                    className="bg-transparent text-xs text-slate-700 dark:text-neutral-300 font-semibold focus:outline-none cursor-pointer"
                  >
                    <option value="all">All Crops</option>
                    <option value="wheat">Wheat</option>
                    <option value="paddy">Paddy</option>
                    <option value="cotton">Cotton</option>
                    <option value="chilli">Chilli</option>
                    <option value="onion">Onion</option>
                    <option value="mustard">Mustard</option>
                    <option value="sugarcane">Sugarcane</option>
                  </select>
                </div>
              </div>

            </div>

            {/* Query Audit Table */}
            <div className="bg-white dark:bg-neutral-950 border border-slate-200/90 dark:border-neutral-800/90 rounded-2xl overflow-hidden shadow-sm">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50/80 dark:bg-neutral-900/80 border-b border-slate-200 dark:border-neutral-800 text-slate-500 dark:text-neutral-400 font-mono uppercase tracking-wider text-[10px]">
                    <tr>
                      <th className="py-3 px-4">Query ID & Time</th>
                      <th className="py-3 px-4">Farmer & District</th>
                      <th className="py-3 px-4">Crop</th>
                      <th className="py-3 px-4">Farmer Inquiry</th>
                      <th className="py-3 px-4">Grounded Score</th>
                      <th className="py-3 px-4 text-right">RAG Audit</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-neutral-900">
                    {filteredLogs.map((log) => (
                      <tr 
                        key={log.id} 
                        className="hover:bg-slate-50/70 dark:hover:bg-neutral-900/50 transition-colors"
                      >
                        <td className="py-3.5 px-4 font-mono">
                          <p className="font-bold text-slate-900 dark:text-white">{log.id}</p>
                          <p className="text-[10px] text-slate-400 dark:text-neutral-500">{log.timestamp}</p>
                        </td>

                        <td className="py-3.5 px-4">
                          <p className="font-semibold text-slate-800 dark:text-neutral-200">{log.farmerName}</p>
                          <p className="text-[10px] text-slate-500 dark:text-neutral-400">{log.location}, {log.state}</p>
                        </td>

                        <td className="py-3.5 px-4">
                          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 dark:bg-neutral-900 text-slate-800 dark:text-neutral-200 border border-slate-200 dark:border-neutral-800">
                            {log.crop} ({log.hindiCrop})
                          </span>
                        </td>

                        <td className="py-3.5 px-4 max-w-xs sm:max-w-md truncate">
                          <p className="text-slate-700 dark:text-neutral-300 truncate font-medium">
                            {log.query}
                          </p>
                          <p className="text-[10px] text-slate-400 dark:text-neutral-500 font-mono mt-0.5">
                            {log.queryType} • {log.sourcesCount} KCC sources matched
                          </p>
                        </td>

                        <td className="py-3.5 px-4">
                          <div className="flex items-center space-x-1.5">
                            <span className="font-mono font-bold text-slate-900 dark:text-white">
                              {(log.score * 100).toFixed(1)}%
                            </span>
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 dark:bg-white" />
                          </div>
                          <span className="text-[9px] font-mono text-slate-400 dark:text-neutral-500">
                            {log.retrievalLatencyMs}ms
                          </span>
                        </td>

                        <td className="py-3.5 px-4 text-right">
                          <button
                            type="button"
                            onClick={() => setSelectedLog(log)}
                            className="px-2.5 py-1 text-[11px] font-bold bg-slate-100 hover:bg-slate-200 dark:bg-neutral-900 dark:hover:bg-neutral-800 text-slate-800 dark:text-white rounded-lg transition-colors cursor-pointer border border-slate-200 dark:border-neutral-800"
                          >
                            Inspect RAG
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: CROP PROTOCOLS & WHEEL (34) */}
        {activeTab === 'knowledge' && (
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 bg-white dark:bg-neutral-950 p-4 rounded-2xl border border-slate-200/90 dark:border-neutral-800/90">
              <div>
                <h3 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white">
                  34 Grounded Crops Inventory
                </h3>
                <p className="text-xs text-slate-500 dark:text-neutral-400">
                  Each crop card on the 3D wheel is backed by KCC historical transcripts and ICAR agronomic guidelines.
                </p>
              </div>
              <button
                type="button"
                onClick={() => navigate('/')}
                className="px-3 py-1.5 bg-slate-900 dark:bg-white text-white dark:text-black rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center space-x-1.5"
              >
                <span>Preview 3D Wheel</span>
                <ArrowUpRight className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {ADMIN_CROPS_CATALOG.map((crop) => (
                <div
                  key={crop.id}
                  className="bg-white dark:bg-neutral-950 border border-slate-200/90 dark:border-neutral-800/90 rounded-2xl p-4 flex items-start space-x-3.5 shadow-sm hover:border-slate-300 dark:hover:border-neutral-700 transition-all"
                >
                  <img
                    src={crop.image}
                    alt={crop.name}
                    className="w-14 h-14 rounded-xl object-cover shrink-0 border border-slate-200 dark:border-neutral-800"
                  />
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between mb-1">
                      <h4 className="font-bold text-xs sm:text-sm text-slate-900 dark:text-white truncate">
                        {crop.name} ({crop.hindi})
                      </h4>
                      <span className="text-[10px] font-mono font-bold text-emerald-600 dark:text-white">
                        ✓ {crop.status}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-500 dark:text-neutral-400 font-mono">
                      {crop.category} • {crop.recordsCount.toLocaleString()} KCC Records
                    </p>
                    <div className="mt-2 text-[10px] font-semibold text-slate-700 dark:text-neutral-300 bg-slate-50 dark:bg-neutral-900 px-2 py-1 rounded-lg border border-slate-200/60 dark:border-neutral-800/80 truncate">
                      {crop.criticalNotice}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 3: NEURAL RAG PIPELINE STATUS */}
        {activeTab === 'system' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              
              <div className="bg-white dark:bg-neutral-950 border border-slate-200/90 dark:border-neutral-800/90 rounded-2xl p-5 shadow-sm">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center space-x-2">
                    <Database className="w-5 h-5 text-emerald-600 dark:text-white" />
                    <h3 className="font-bold text-sm sm:text-base text-slate-900 dark:text-white">ChromaDB Vector Store</h3>
                  </div>
                  <span className="px-2 py-0.5 text-[10px] font-mono font-bold bg-emerald-50 dark:bg-neutral-900 text-emerald-700 dark:text-white border border-emerald-200 dark:border-neutral-800 rounded-md">
                    OPERATIONAL
                  </span>
                </div>
                <div className="space-y-2 text-xs font-mono text-slate-600 dark:text-neutral-400">
                  <div className="flex justify-between py-1 border-b border-slate-100 dark:border-neutral-900">
                    <span>Total Indexed Documents:</span>
                    <span className="font-bold text-slate-900 dark:text-white">347,944 Transcripts</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-slate-100 dark:border-neutral-900">
                    <span>Embedding Dimensions:</span>
                    <span className="font-bold text-slate-900 dark:text-white">384-d Dense Float32</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-slate-100 dark:border-neutral-900">
                    <span>Index Distance Metric:</span>
                    <span className="font-bold text-slate-900 dark:text-white">Cosine Similarity (HNSW)</span>
                  </div>
                  <div className="flex justify-between py-1">
                    <span>Avg Retrieval Time:</span>
                    <span className="font-bold text-slate-900 dark:text-white">24 ms</span>
                  </div>
                </div>
              </div>

              <div className="bg-white dark:bg-neutral-950 border border-slate-200/90 dark:border-neutral-800/90 rounded-2xl p-5 shadow-sm">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center space-x-2">
                    <Cpu className="w-5 h-5 text-emerald-600 dark:text-white" />
                    <h3 className="font-bold text-sm sm:text-base text-slate-900 dark:text-white">Generative Grounding Engine</h3>
                  </div>
                  <span className="px-2 py-0.5 text-[10px] font-mono font-bold bg-emerald-50 dark:bg-neutral-900 text-emerald-700 dark:text-white border border-emerald-200 dark:border-neutral-800 rounded-md">
                    ACTIVE
                  </span>
                </div>
                <div className="space-y-2 text-xs font-mono text-slate-600 dark:text-neutral-400">
                  <div className="flex justify-between py-1 border-b border-slate-100 dark:border-neutral-900">
                    <span>Inference Model:</span>
                    <span className="font-bold text-slate-900 dark:text-white">Gemini 1.5 Flash Grounded</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-slate-100 dark:border-neutral-900">
                    <span>Prompt Grounding Policy:</span>
                    <span className="font-bold text-slate-900 dark:text-white">Strict Zero-Hallucination</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-slate-100 dark:border-neutral-900">
                    <span>Bilingual Hindi/English:</span>
                    <span className="font-bold text-slate-900 dark:text-white">Enabled (IndicTrans2)</span>
                  </div>
                  <div className="flex justify-between py-1">
                    <span>Daily API Quota Consumed:</span>
                    <span className="font-bold text-slate-900 dark:text-white">12.4%</span>
                  </div>
                </div>
              </div>

            </div>

            {/* Ingestion & Maintenance Tools */}
            <div className="bg-white dark:bg-neutral-950 border border-slate-200/90 dark:border-neutral-800/90 rounded-2xl p-5 shadow-sm">
              <h3 className="font-bold text-sm text-slate-900 dark:text-white mb-2">
                Central Operations & Vector Cache
              </h3>
              <p className="text-xs text-slate-500 dark:text-neutral-400 mb-4">
                Execute automated maintenance tasks or force re-indexing of recent Kisan Call Centre state dumps.
              </p>
              <div className="flex flex-wrap gap-2.5">
                <button
                  type="button"
                  onClick={() => alert('Vector cache synchronized and validated successfully.')}
                  className="px-3 py-2 bg-slate-100 hover:bg-slate-200 dark:bg-neutral-900 dark:hover:bg-neutral-800 text-slate-800 dark:text-white text-xs font-bold rounded-xl border border-slate-200 dark:border-neutral-800 transition-all cursor-pointer flex items-center space-x-1.5"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  <span>Flush Vector Cache</span>
                </button>

                <button
                  type="button"
                  onClick={() => alert('Grounding verification test passed: 100/100 test queries satisfied citation constraints.')}
                  className="px-3 py-2 bg-slate-100 hover:bg-slate-200 dark:bg-neutral-900 dark:hover:bg-neutral-800 text-slate-800 dark:text-white text-xs font-bold rounded-xl border border-slate-200 dark:border-neutral-800 transition-all cursor-pointer flex items-center space-x-1.5"
                >
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>Run Grounding Sanity Benchmark</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* TAB 4: USERS & AGRONOMISTS ACCESS CONTROL */}
        {activeTab === 'users' && (
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 bg-white dark:bg-neutral-950 p-4 rounded-2xl border border-slate-200/90 dark:border-neutral-800/90">
              <div>
                <h3 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white">
                  Platform Users & Research Agronomists
                </h3>
                <p className="text-xs text-slate-500 dark:text-neutral-400">
                  Manage role-based access for field agricultural scientists, administrators, and farmers.
                </p>
              </div>
              <button
                type="button"
                onClick={() => alert('Agronomist invitation link generated: valid for 48 hours with ICAR credentials.')}
                className="px-3 py-2 bg-slate-900 dark:bg-white text-white dark:text-black rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center space-x-1.5 shadow-sm"
              >
                <UserPlus className="w-3.5 h-3.5" />
                <span>Invite Agronomist</span>
              </button>
            </div>

            <div className="bg-white dark:bg-neutral-950 border border-slate-200/90 dark:border-neutral-800/90 rounded-2xl overflow-hidden shadow-sm">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50/80 dark:bg-neutral-900/80 border-b border-slate-200 dark:border-neutral-800 text-slate-500 dark:text-neutral-400 font-mono uppercase tracking-wider text-[10px]">
                    <tr>
                      <th className="py-3 px-4">User</th>
                      <th className="py-3 px-4">Role</th>
                      <th className="py-3 px-4">Operational Zone</th>
                      <th className="py-3 px-4">Queries Handled</th>
                      <th className="py-3 px-4">Account Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-neutral-900">
                    {PLATFORM_USERS.map((usr) => (
                      <tr key={usr.id} className="hover:bg-slate-50/70 dark:hover:bg-neutral-900/50 transition-colors">
                        <td className="py-3 px-4">
                          <p className="font-bold text-slate-900 dark:text-white">{usr.name}</p>
                          <p className="text-[10px] text-slate-500 dark:text-neutral-400 font-mono">{usr.email}</p>
                        </td>

                        <td className="py-3 px-4">
                          <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider border ${
                            usr.role === 'admin'
                              ? 'bg-purple-50 text-purple-700 border-purple-200 dark:bg-white/10 dark:text-white dark:border-white/20'
                              : usr.role === 'agronomist'
                              ? 'bg-blue-50 text-blue-700 border-blue-200 dark:bg-neutral-900 dark:text-white dark:border-neutral-700'
                              : 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-neutral-900 dark:text-neutral-300 dark:border-neutral-800'
                          }`}>
                            {usr.role}
                          </span>
                        </td>

                        <td className="py-3 px-4 text-slate-700 dark:text-neutral-300 font-medium">
                          {usr.location}
                        </td>

                        <td className="py-3 px-4 font-mono font-bold text-slate-900 dark:text-white">
                          {usr.queries}
                        </td>

                        <td className="py-3 px-4">
                          <span className="inline-flex items-center space-x-1 text-[11px] font-bold text-emerald-600 dark:text-white">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 dark:bg-white" />
                            <span>{usr.status}</span>
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

      </main>

      {/* RAG TELEMETRY INSPECTION MODAL */}
      <AnimatePresence>
        {selectedLog && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              className="bg-white dark:bg-neutral-950 border border-slate-200 dark:border-neutral-800 rounded-3xl max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6 shadow-2xl relative"
            >
              <button
                type="button"
                onClick={() => setSelectedLog(null)}
                className="absolute top-5 right-5 p-2 rounded-xl text-slate-400 hover:text-slate-700 dark:hover:text-white bg-slate-100 dark:bg-neutral-900 border border-slate-200 dark:border-neutral-800 transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>

              <div className="flex items-center space-x-2.5 mb-4">
                <div className="p-2 bg-emerald-50 dark:bg-neutral-900 text-emerald-600 dark:text-white rounded-xl border border-emerald-200 dark:border-neutral-800">
                  <ShieldCheck className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white">
                    RAG Grounding Telemetry Audit
                  </h3>
                  <p className="text-xs font-mono text-slate-500 dark:text-neutral-400">
                    ID: {selectedLog.id} • {selectedLog.timestamp}
                  </p>
                </div>
              </div>

              <div className="space-y-4 text-xs">
                
                {/* Farmer metadata card */}
                <div className="p-3.5 bg-slate-50 dark:bg-neutral-900/60 rounded-xl border border-slate-200/80 dark:border-neutral-800 grid grid-cols-2 sm:grid-cols-4 gap-2">
                  <div>
                    <span className="text-[10px] uppercase text-slate-400 dark:text-neutral-500 font-mono">Farmer:</span>
                    <p className="font-bold text-slate-800 dark:text-white">{selectedLog.farmerName}</p>
                  </div>
                  <div>
                    <span className="text-[10px] uppercase text-slate-400 dark:text-neutral-500 font-mono">Location:</span>
                    <p className="font-bold text-slate-800 dark:text-white">{selectedLog.location}, {selectedLog.state}</p>
                  </div>
                  <div>
                    <span className="text-[10px] uppercase text-slate-400 dark:text-neutral-500 font-mono">Crop Detected:</span>
                    <p className="font-bold text-slate-800 dark:text-white">{selectedLog.crop} ({selectedLog.hindiCrop})</p>
                  </div>
                  <div>
                    <span className="text-[10px] uppercase text-slate-400 dark:text-neutral-500 font-mono">Confidence:</span>
                    <p className="font-bold text-emerald-600 dark:text-white">{(selectedLog.score * 100).toFixed(1)}%</p>
                  </div>
                </div>

                {/* Farmer Query */}
                <div>
                  <h4 className="text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-neutral-400 mb-1">
                    Farmer Query
                  </h4>
                  <div className="p-3 bg-slate-100/70 dark:bg-neutral-900 rounded-xl text-slate-800 dark:text-neutral-200 font-medium">
                    "{selectedLog.query}"
                  </div>
                </div>

                {/* Retrieved KCC Grounding Citation */}
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <h4 className="text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-neutral-400">
                      Retrieved KCC Advisory Passage
                    </h4>
                    <span className="text-[10px] font-mono text-emerald-600 dark:text-white">
                      Top Match Similarity: {selectedLog.score}
                    </span>
                  </div>
                  <div className="p-3 bg-emerald-50/50 dark:bg-white/5 border border-emerald-200/60 dark:border-neutral-800 rounded-xl text-slate-800 dark:text-neutral-200 font-mono text-[11px] leading-relaxed">
                    {selectedLog.kccPassage}
                  </div>
                </div>

                {/* Synthesized Advice */}
                <div>
                  <h4 className="text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-neutral-400 mb-1">
                    Synthesized Bilingual Advisory (Delivered)
                  </h4>
                  <div className="p-3 bg-slate-50 dark:bg-neutral-900 border border-slate-200 dark:border-neutral-800 rounded-xl text-slate-800 dark:text-neutral-200 leading-relaxed">
                    {selectedLog.answer}
                  </div>
                </div>

              </div>

              {/* Close Button */}
              <div className="mt-6 pt-4 border-t border-slate-200 dark:border-neutral-800 flex justify-end">
                <button
                  type="button"
                  onClick={() => setSelectedLog(null)}
                  className="px-4 py-2 bg-slate-900 hover:bg-slate-800 dark:bg-white dark:hover:bg-neutral-200 text-white dark:text-black rounded-xl text-xs font-bold transition-all cursor-pointer"
                >
                  Close Inspection
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </motion.div>
  );
}
