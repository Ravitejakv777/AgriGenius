import { useState, useEffect } from 'react';
import type { Message } from '../lib/types';
import { User, Sparkles, AlertTriangle, Copy, Check, Volume2, VolumeX, ShieldCheck, FileText, Trash2 } from 'lucide-react';
import { motion } from 'framer-motion';

interface ChatMessageProps {
  message: Message;
  onOpenSources?: () => void;
  onDelete?: () => void;
}

export function ChatMessage({ message, onOpenSources, onDelete }: ChatMessageProps) {
  const isUser = message.role === 'user';
  const [copied, setCopied] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);

  useEffect(() => {
    return () => {
      if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

  const handleCopy = () => {
    navigator.clipboard.writeText(message.content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleToggleSpeech = () => {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
      alert('Speech synthesis is not supported in this browser.');
      return;
    }

    if (isSpeaking) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
      return;
    }

    window.speechSynthesis.cancel();

    // Clean markdown characters for smooth speech
    const cleanText = message.content
      .replace(/[*#_`~>]/g, '')
      .replace(/\[.*?\]/g, '')
      .replace(/\n+/g, ' ');

    const utterance = new SpeechSynthesisUtterance(cleanText);
    const hasHindi = /[\u0900-\u097F]/.test(message.content);
    utterance.lang = hasHindi ? 'hi-IN' : 'en-IN';
    utterance.rate = 0.95;

    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);

    setIsSpeaking(true);
    window.speechSynthesis.speak(utterance);
  };

  // Helper to render basic markdown formatting
  const renderFormattedContent = (content: string) => {
    const lines = content.split('\n');

    return lines.map((line, idx) => {
      // Empty line
      if (!line.trim()) {
        return <div key={idx} className="h-2" />;
      }

      // Numbered items or bullet points
      const isBullet = line.trim().startsWith('- ') || line.trim().startsWith('* ');
      const isNumbered = /^\d+\.\s/.test(line.trim());

      // Parse bold segments
      const parts = line.split(/(\*\*.*?\*\*)/g);
      const renderedParts = parts.map((part, pIdx) => {
        if (part.startsWith('**') && part.endsWith('**')) {
          return (
            <strong key={pIdx} className="font-bold text-emerald-800 dark:text-white">
              {part.slice(2, -2)}
            </strong>
          );
        }
        return part;
      });

      if (isBullet || isNumbered) {
        return (
          <div key={idx} className="flex items-start space-x-2 my-1 pl-1">
            <span className="text-emerald-500 dark:text-neutral-400 font-bold shrink-0 mt-0.5">&bull;</span>
            <div className="flex-1 leading-relaxed text-slate-800 dark:text-neutral-200">
              {renderedParts}
            </div>
          </div>
        );
      }

      return (
        <p key={idx} className="my-1 leading-relaxed text-slate-800 dark:text-neutral-200">
          {renderedParts}
        </p>
      );
    });
  };

  return (
    <motion.div 
      layout
      initial={{ opacity: 0, scale: 0.97, y: 16 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      transition={{ duration: 0.35, type: 'spring', bounce: 0.15 }}
      className={`py-3 px-2 sm:px-4 flex w-full group ${isUser ? 'justify-end' : 'justify-start'}`}
    >
      <div className={`flex gap-3 max-w-3xl w-full ${isUser ? 'flex-row-reverse' : 'flex-row'}`}>
        {/* Avatar */}
        <div className="flex-shrink-0 mt-1">
          {isUser ? (
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-emerald-600 to-teal-700 dark:from-white dark:to-neutral-200 flex items-center justify-center shadow-md shadow-emerald-700/20 dark:shadow-none text-white dark:text-black">
              <User className="w-4 h-4 text-white dark:text-black" />
            </div>
          ) : (
            <div className="w-8 h-8 rounded-full bg-emerald-50 dark:bg-neutral-900 border border-emerald-300/80 dark:border-neutral-800 flex items-center justify-center shadow-md shadow-emerald-500/10 dark:shadow-none">
              <Sparkles className="w-4 h-4 text-emerald-600 dark:text-white" />
            </div>
          )}
        </div>
        
        {/* Message Content Bubble */}
        <div className={`flex flex-col space-y-2 max-w-[88%] sm:max-w-[85%] ${isUser ? 'items-end' : 'items-start'}`}>
          <div className={`px-4 sm:px-5 py-3.5 rounded-2xl shadow-sm text-sm ${
            isUser 
              ? 'bg-gradient-to-br from-emerald-600 to-teal-700 dark:from-white dark:to-neutral-100 text-white dark:text-black rounded-tr-sm shadow-emerald-600/20 dark:shadow-none' 
              : 'bg-white/95 dark:bg-neutral-900/90 border border-slate-200/90 dark:border-neutral-800 shadow-md backdrop-blur-md rounded-tl-sm text-slate-900 dark:text-neutral-100'
          }`}>
            {isUser ? (
              <p className="leading-relaxed whitespace-pre-wrap text-white dark:text-black font-medium">
                {message.content}
              </p>
            ) : (
              <div className="text-sm">
                {renderFormattedContent(message.content)}
              </div>
            )}
          </div>

          {/* User Message Action / Delete */}
          {isUser && onDelete && (
            <button
              type="button"
              onClick={onDelete}
              className="opacity-0 group-hover:opacity-100 flex items-center space-x-1 text-[10px] text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 transition-all cursor-pointer px-1.5 py-0.5 rounded hover:bg-rose-50 dark:hover:bg-rose-950/40"
              title="Delete this message"
            >
              <Trash2 className="w-3 h-3" />
              <span>Delete</span>
            </button>
          )}

          {/* Assistant Action Bar & Grounding Pill */}
          {!isUser && message.content && (
            <div className="flex items-center gap-2 text-xs flex-wrap pt-0.5">
              {/* Copy Button */}
              <button
                type="button"
                onClick={handleCopy}
                className="px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-neutral-800/80 hover:bg-slate-200 dark:hover:bg-neutral-700 text-slate-600 dark:text-neutral-400 hover:text-slate-900 dark:hover:text-white flex items-center space-x-1.5 transition-colors cursor-pointer text-[11px] font-medium"
                title="Copy answer"
              >
                {copied ? (
                  <>
                    <Check className="w-3 h-3 text-emerald-500 dark:text-white" />
                    <span className="text-emerald-600 dark:text-white font-bold">Copied</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3 h-3" />
                    <span>Copy</span>
                  </>
                )}
              </button>

              {/* Delete Message Button */}
              {onDelete && (
                <button
                  type="button"
                  onClick={onDelete}
                  className="px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-neutral-800/80 hover:bg-rose-50 dark:hover:bg-rose-950/40 text-slate-600 dark:text-neutral-400 hover:text-rose-600 dark:hover:text-rose-400 flex items-center space-x-1.5 transition-colors cursor-pointer text-[11px] font-medium"
                  title="Delete this message"
                >
                  <Trash2 className="w-3 h-3" />
                  <span>Delete</span>
                </button>
              )}

              {/* Text to Speech Button */}
              <button
                type="button"
                onClick={handleToggleSpeech}
                className={`px-2.5 py-1 rounded-lg flex items-center space-x-1.5 transition-colors cursor-pointer text-[11px] font-medium ${
                  isSpeaking
                    ? 'bg-emerald-100 dark:bg-white text-emerald-700 dark:text-black border border-emerald-300 dark:border-white'
                    : 'bg-slate-100 dark:bg-neutral-800/80 hover:bg-slate-200 dark:hover:bg-neutral-700 text-slate-600 dark:text-neutral-400 hover:text-slate-900 dark:hover:text-white'
                }`}
                title={isSpeaking ? 'Stop speaking' : 'Read advisory aloud'}
              >
                {isSpeaking ? (
                  <>
                    <VolumeX className="w-3 h-3 text-emerald-600 dark:text-black animate-pulse" />
                    <span className="text-emerald-700 dark:text-black font-bold">Stop Voice</span>
                  </>
                ) : (
                  <>
                    <Volume2 className="w-3 h-3 text-emerald-500 dark:text-neutral-300" />
                    <span>Listen</span>
                  </>
                )}
              </button>

              {message.responseDetails?.grounded && (
                <div className="inline-flex items-center space-x-1 px-2.5 py-1 rounded-lg bg-emerald-50 dark:bg-neutral-900 text-emerald-700 dark:text-white border border-emerald-200 dark:border-neutral-800 text-[10px] font-mono font-bold">
                  <ShieldCheck className="w-3 h-3 text-emerald-500 dark:text-white" />
                  <span>KCC Sources Retrieved</span>
                </div>
              )}

              {/* Sources link if available */}
              {onOpenSources && message.responseDetails?.sources?.length ? (
                <button
                  type="button"
                  onClick={onOpenSources}
                  className="px-2 py-1 rounded-lg bg-slate-100 dark:bg-neutral-800/80 hover:bg-emerald-50 dark:hover:bg-neutral-700 text-slate-600 dark:text-neutral-400 hover:text-emerald-600 dark:hover:text-white flex items-center space-x-1 transition-colors cursor-pointer text-[10px] font-medium border border-slate-200/60 dark:border-neutral-700/60"
                >
                  <FileText className="w-3 h-3 text-emerald-500 dark:text-neutral-300" />
                  <span>Inspect Sources</span>
                </button>
              ) : null}
            </div>
          )}

          {/* Insufficient Evidence Warning */}
          {message.responseDetails && !message.responseDetails.grounded && (
            <div className="flex items-center text-amber-700 dark:text-white bg-amber-50 dark:bg-neutral-900 px-3.5 py-2 rounded-xl border border-amber-200 dark:border-neutral-800 text-xs">
              <AlertTriangle className="w-4 h-4 mr-2 flex-shrink-0 text-amber-500 dark:text-white" />
              <p>No KCC source evidence was returned for this answer.</p>
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
}
