import { useState, useEffect } from 'react';
import { Send, Mic, MicOff, Globe } from 'lucide-react';
import { motion } from 'framer-motion';

interface QueryInputProps {
  onSend: (query: string, language: "auto" | "en" | "hi") => void;
  disabled: boolean;
}

export function QueryInput({ onSend, disabled }: QueryInputProps) {
  const [query, setQuery] = useState('');
  const [language, setLanguage] = useState<"auto" | "en" | "hi">('auto');
  const [isListening, setIsListening] = useState(false);
  const [recognition, setRecognition] = useState<any>(null);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      if (SpeechRecognition) {
        const rec = new SpeechRecognition();
        rec.continuous = true;
        rec.interimResults = false;
        
        rec.onresult = (event: any) => {
          let finalTranscript = '';
          for (let i = event.resultIndex; i < event.results.length; ++i) {
            if (event.results[i].isFinal) {
              finalTranscript += event.results[i][0].transcript;
            }
          }
          if (finalTranscript) {
            setQuery(prev => prev + (prev ? ' ' : '') + finalTranscript);
          }
        };
        
        rec.onerror = (event: any) => {
          console.error("Speech recognition error", event.error);
          setIsListening(false);
        };
        
        rec.onend = () => {
          setIsListening(false);
        };
        
        setRecognition(rec);
      }
    }
  }, []);

  useEffect(() => {
    if (recognition) {
      recognition.lang = language === 'hi' ? 'hi-IN' : 'en-IN';
    }
  }, [language, recognition]);

  const toggleListening = (e: React.MouseEvent) => {
    e.preventDefault();
    if (!recognition) {
      alert("Speech recognition is not supported in this browser. Try Chrome or Safari.");
      return;
    }
    
    if (isListening) {
      recognition.stop();
      setIsListening(false);
    } else {
      try {
        recognition.start();
        setIsListening(true);
      } catch (e) {
        console.error(e);
      }
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim() && !disabled) {
      onSend(query.trim(), language);
      setQuery('');
      if (isListening) {
        recognition?.stop();
        setIsListening(false);
      }
    }
  };

  return (
    <div className="px-3 sm:px-4 pt-1 pb-1.5 bg-transparent z-20 relative">
      <div className="max-w-2xl mx-auto">
        <form onSubmit={handleSubmit} className="relative group">
          <div className={`overflow-hidden rounded-2xl border bg-white/95 dark:bg-neutral-900/95 backdrop-blur-xl shadow-lg transition-all flex items-end ${
            isListening 
              ? 'border-red-500 ring-2 ring-red-500/20 shadow-red-500/10' 
              : 'border-slate-200 dark:border-neutral-800 focus-within:border-emerald-500 dark:focus-within:border-white focus-within:ring-2 focus-within:ring-emerald-500/15 dark:focus-within:ring-white/20'
          }`}>
            <textarea
              rows={1}
              style={{ boxShadow: 'none' }}
              className="block w-full resize-none border-transparent focus:border-transparent focus:ring-0 outline-none bg-transparent py-3 pl-4 pr-2 text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-neutral-500 text-xs sm:text-sm leading-relaxed min-h-[46px] max-h-[120px]"
              placeholder={isListening ? "Listening... Speak your crop question" : "Ask a farming question in English or हिन्दी..."}
              value={query}
              onChange={(e) => {
                setQuery(e.target.value);
                e.target.style.height = 'auto';
                e.target.style.height = Math.min(e.target.scrollHeight, 120) + 'px';
              }}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleSubmit(e);
                  e.currentTarget.style.height = 'auto';
                }
              }}
              disabled={disabled}
            />
            
            <div className="flex items-center space-x-1.5 py-1.5 pr-2 shrink-0">
              {/* Language Selector */}
              <div className="relative flex items-center">
                <Globe className="w-3 h-3 text-slate-400 absolute left-2 pointer-events-none" />
                <select
                  value={language}
                  onChange={(e) => setLanguage(e.target.value as any)}
                  className="h-8 pl-6 pr-2 text-xs font-medium bg-slate-100 dark:bg-neutral-800 border border-slate-200 dark:border-neutral-700 rounded-lg text-slate-700 dark:text-neutral-300 hover:bg-slate-200 dark:hover:bg-neutral-700 transition-colors cursor-pointer outline-none appearance-none"
                  disabled={disabled}
                  title="Choose input language"
                >
                  <option value="auto">Auto</option>
                  <option value="en">EN</option>
                  <option value="hi">हिन्दी</option>
                </select>
              </div>
              
              {/* Microphone Toggle */}
              <motion.button
                whileTap={{ scale: 0.92 }}
                type="button"
                onClick={toggleListening}
                className={`inline-flex items-center justify-center p-2 rounded-lg focus:outline-none transition-all cursor-pointer ${
                  isListening 
                    ? 'bg-red-500 text-white animate-pulse' 
                    : 'bg-slate-100 dark:bg-neutral-800 text-slate-500 dark:text-neutral-400 hover:bg-slate-200 dark:hover:bg-neutral-700'
                }`}
                title={isListening ? "Stop listening" : "Voice input"}
              >
                {isListening ? <MicOff className="w-3.5 h-3.5" /> : <Mic className="w-3.5 h-3.5" />}
              </motion.button>
              
              {/* Send Button */}
              <motion.button
                whileTap={{ scale: 0.92 }}
                type="submit"
                disabled={disabled || !query.trim()}
                className="inline-flex items-center justify-center p-2 bg-emerald-600 hover:bg-emerald-500 dark:bg-white dark:text-black dark:hover:bg-neutral-200 text-white rounded-lg focus:outline-none disabled:opacity-40 transition-all cursor-pointer shadow-sm dark:shadow-none"
                title="Send query"
              >
                <Send className="w-3.5 h-3.5 ml-0.5 text-white dark:text-black" />
              </motion.button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
