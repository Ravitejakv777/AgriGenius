import { StatusPanel } from '../components/StatusPanel';
import { EvaluationPanel } from '../components/EvaluationPanel';
import { useNavigate } from 'react-router-dom';
import { Leaf, Server, Activity, Shield } from 'lucide-react';
import { motion } from 'framer-motion';
import { ThemeToggle } from '../components/ThemeToggle';

export function AboutPage() {
  const navigate = useNavigate();

  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      transition={{ duration: 0.3, ease: "easeInOut" }}
      className="min-h-screen font-sans relative overflow-hidden text-slate-900 dark:text-white"
    >
      {/* Animated Background Layers */}
      <div className="absolute inset-0 z-0 pointer-events-none bg-slate-50 opacity-100 dark:opacity-0 transition-opacity duration-500 ease-in-out"></div>
      <div className="absolute inset-0 z-0 pointer-events-none bg-black opacity-0 dark:opacity-100 transition-opacity duration-500 ease-in-out"></div>

      <div className="relative z-10 flex flex-col min-h-screen">
      {/* Header */}
      <header className="bg-white dark:bg-black border-b border-slate-200 dark:border-neutral-800 px-4 sm:px-8 py-3.5 sm:py-4 flex items-center justify-between sticky top-0 z-10 shadow-sm">
        <div 
          className="flex items-center space-x-2.5 sm:space-x-3 cursor-pointer"
          onClick={() => navigate('/')}
        >
          <div className="bg-primary-600 dark:bg-white dark:text-black p-1.5 sm:p-2 rounded-lg">
            <Leaf className="w-4 h-4 sm:w-5 sm:h-5 text-white dark:text-black" />
          </div>
          <h1 className="text-lg sm:text-xl font-bold text-slate-800 dark:text-white tracking-tight">AgriGenius</h1>
        </div>
        <div className="flex items-center space-x-3">
          <ThemeToggle />
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 sm:px-8 py-6 sm:py-12 pb-28">
        {/* Hero Section */}
        <div className="text-center mb-8 sm:mb-16 max-w-3xl mx-auto">
          <h2 className="text-2xl sm:text-4xl font-extrabold text-slate-900 dark:text-white mb-3 sm:mb-6 tracking-tight">
            Agricultural RAG Prototype for <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary-600 to-primary-400 dark:from-white dark:to-neutral-400">Evidence-backed Answers</span>
          </h2>
          <p className="text-sm sm:text-lg text-slate-600 dark:text-neutral-400 leading-relaxed">
            AgriGenius is a Hindi, Telugu, and English RAG prototype. It retrieves Kisan Call Centre (KCC) passages for the answer generator to use. Retrieval quality, local relevance, and safety still require evaluation before farmer-facing deployment.
          </p>
        </div>

        {/* Feature Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6 mb-8 sm:mb-16">
          <div className="bg-white dark:bg-neutral-900 p-6 rounded-2xl border border-slate-200 dark:border-neutral-800 shadow-sm flex flex-col items-center text-center">
            <div className="bg-primary-50 dark:bg-white/10 p-3 rounded-full mb-4">
              <Server className="w-6 h-6 text-primary-600 dark:text-white" />
            </div>
            <h3 className="font-semibold text-slate-800 dark:text-white mb-2">ChromaDB Backend</h3>
            <p className="text-sm text-slate-500 dark:text-neutral-400">Vector similarity search ensures queries are matched with the most relevant KCC records.</p>
          </div>
          <div className="bg-white dark:bg-neutral-900 p-6 rounded-2xl border border-slate-200 dark:border-neutral-800 shadow-sm flex flex-col items-center text-center">
            <div className="bg-amber-50 dark:bg-white/10 p-3 rounded-full mb-4">
              <Activity className="w-6 h-6 text-amber-600 dark:text-white" />
            </div>
            <h3 className="font-semibold text-slate-800 dark:text-white mb-2">Multilingual Support</h3>
            <p className="text-sm text-slate-500 dark:text-neutral-400">AgriGenius retrieves Kisan Call Centre passages with Indic Sentence-BERT, reranks them with BGE Reranker v2 M3, then generates an answer with Qwen 3.8 27B through Groq. If that model call fails, it retries with GPT-OSS 20B through Groq. Hindi, Telugu, and English quality checks still need reviewed end-to-end evaluation.</p>
          </div>
          <div className="bg-white dark:bg-neutral-900 p-6 rounded-2xl border border-slate-200 dark:border-neutral-800 shadow-sm flex flex-col items-center text-center">
            <div className="bg-blue-50 dark:bg-white/10 p-3 rounded-full mb-4">
              <Shield className="w-6 h-6 text-blue-600 dark:text-white" />
            </div>
            <h3 className="font-semibold text-slate-800 dark:text-white mb-2">KCC Source Display</h3>
            <p className="text-sm text-slate-500 dark:text-neutral-400">Chat results can show retrieved KCC passages. A source citation alone does not verify every generated claim.</p>
          </div>
        </div>
        
        {/* Panels */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-stretch">
          <div className="flex flex-col">
            <h2 className="text-xl font-bold text-slate-800 dark:text-white mb-6 flex items-center">
              <span className="w-2 h-6 bg-primary-500 dark:bg-white rounded-full mr-3"></span>
              Live System Status
            </h2>
            <StatusPanel />
          </div>
          
          <div className="flex flex-col">
            <h2 className="text-xl font-bold text-slate-800 dark:text-white mb-6 flex items-center">
              <span className="w-2 h-6 bg-blue-500 dark:bg-white rounded-full mr-3"></span>
              Evaluation Metrics
            </h2>
            <EvaluationPanel />
          </div>
        </div>
      </main>
      </div>
    </motion.div>
  );
}
