import { useState } from 'react';
import type { SourcePassage } from '../lib/types';
import { MapPin, Tag, Check, Copy, ChevronDown, ChevronUp, ShieldCheck, Sparkles } from 'lucide-react';
import { motion } from 'framer-motion';
import { explainSource } from '../lib/api';
import type { LimeExplanation } from '../lib/types';

interface SourceCardProps {
  source: SourcePassage;
  query: string;
}

export function SourceCard({ source, query }: SourceCardProps) {
  const { metadata, similarity, rank, text } = source;
  const [copied, setCopied] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [isExplaining, setIsExplaining] = useState(false);
  const [explanation, setExplanation] = useState<LimeExplanation | null>(null);
  const [explanationError, setExplanationError] = useState('');

  const handleExplain = async () => {
    setIsExplaining(true);
    setExplanationError('');
    try {
      const result = await explainSource(query, rank);
      if (result.status !== 'ok') throw new Error(result.reason || 'The requested passage is not available for explanation.');
      setExplanation(result);
    } catch (error) {
      setExplanationError(error instanceof Error ? error.message : 'LIME explanation failed.');
    } finally {
      setIsExplaining(false);
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white/95 dark:bg-neutral-900/90 border border-slate-200/90 dark:border-neutral-800 rounded-2xl p-3.5 shadow-sm hover:shadow-md transition-all relative overflow-hidden backdrop-blur-md group"
    >
      {/* Top Header */}
      <div className="flex items-center justify-between mb-2.5">
        <div className="flex items-center space-x-2">
          <div className="w-5 h-5 rounded-lg bg-emerald-50 dark:bg-neutral-800 text-emerald-600 dark:text-white flex items-center justify-center text-[10px] font-bold border border-emerald-200 dark:border-neutral-700">
            #{rank}
          </div>
          <span className="text-xs font-bold text-slate-900 dark:text-white">
            KCC Advisory
          </span>
        </div>

        <div className="flex items-center space-x-2">
          <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full border bg-teal-50 text-teal-700 border-teal-200 dark:bg-neutral-800 dark:text-white dark:border-neutral-700" title="Sigmoid-scaled reranker score; not a calibrated probability">
            Reranker {similarity.toFixed(3)}
          </span>

          <button
            type="button"
            onClick={handleCopy}
            className="p-1 rounded-lg hover:bg-slate-100 dark:hover:bg-neutral-800 text-slate-400 hover:text-slate-800 dark:hover:text-white transition-colors cursor-pointer"
            title="Copy source passage"
          >
            {copied ? (
              <Check className="w-3.5 h-3.5 text-emerald-500 dark:text-white" />
            ) : (
              <Copy className="w-3.5 h-3.5" />
            )}
          </button>
        </div>
      </div>
      
      {/* Passage Text */}
      <div className="relative mb-3">
        <p className={`text-xs text-slate-700 dark:text-neutral-300 leading-relaxed ${
          isExpanded ? '' : 'line-clamp-3'
        }`}>
          &ldquo;{text}&rdquo;
        </p>
        {text.length > 120 && (
          <button
            type="button"
            onClick={() => setIsExpanded(!isExpanded)}
            className="text-[10px] text-emerald-600 dark:text-white hover:underline font-semibold mt-1 flex items-center space-x-0.5 cursor-pointer"
          >
            <span>{isExpanded ? 'Show less' : 'Read full passage'}</span>
            {isExpanded ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
          </button>
        )}
      </div>

      <button
        type="button"
        onClick={handleExplain}
        disabled={isExplaining}
        className="inline-flex items-center gap-1.5 rounded-lg border border-violet-200 dark:border-neutral-700 bg-violet-50 dark:bg-neutral-800 px-2.5 py-1.5 text-[10px] font-semibold text-violet-800 dark:text-neutral-100 disabled:opacity-60"
      >
        <Sparkles className="w-3 h-3" />
        {isExplaining ? 'Running LIME…' : explanation ? 'Refresh LIME explanation' : 'Explain reranker score'}
      </button>
      {explanation && (
        <div className="mt-2 rounded-xl border border-violet-100 dark:border-neutral-800 bg-violet-50/70 dark:bg-neutral-950 p-2.5">
          <p className="text-[10px] font-bold text-violet-900 dark:text-white">
            {explanation.method} · reranker score {(explanation.reranker_score ?? 0).toFixed(3)}
          </p>
          <div className="flex flex-wrap gap-1.5 mt-2">
            {explanation.feature_weights?.map(({ token, weight }) => (
              <span key={token} className={`rounded-md px-1.5 py-1 text-[10px] ${weight >= 0 ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-200' : 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-200'}`}>
                {token}: {weight >= 0 ? '+' : ''}{weight.toFixed(3)}
              </span>
            ))}
          </div>
          <p className="mt-2 text-[9px] leading-relaxed text-slate-500 dark:text-neutral-400">{explanation.note}</p>
        </div>
      )}
      {explanationError && <p className="mt-1 text-[10px] text-rose-700 dark:text-rose-300">{explanationError}</p>}
      
      {/* Metadata Badges */}
      <div className="space-y-1.5 pt-2.5 border-t border-slate-100 dark:border-neutral-800/80 text-[11px] text-slate-500 dark:text-neutral-400">
        <div className="flex items-center justify-between">
          <span className="flex items-center text-slate-700 dark:text-neutral-300 font-semibold truncate mr-2">
            <Tag className="w-3 h-3 mr-1 text-emerald-500 dark:text-neutral-400 shrink-0" />
            <span className="truncate">{metadata.Crop || 'Crop not listed'} &bull; {metadata.QueryType || 'General advisory'}</span>
          </span>
          <span className="inline-flex items-center space-x-1 text-[9px] font-mono text-emerald-600 dark:text-white shrink-0">
            <ShieldCheck className="w-3 h-3" />
            <span>Retrieved</span>
          </span>
        </div>

        <div className="flex items-center text-[10px] text-slate-500 dark:text-neutral-400">
          <MapPin className="w-3 h-3 mr-1 text-emerald-500 dark:text-neutral-400 shrink-0" />
          <span className="truncate">{[metadata.DistrictName, metadata.StateName].filter(Boolean).join(', ') || 'Location not listed'}</span>
        </div>
      </div>
    </motion.div>
  );
}
