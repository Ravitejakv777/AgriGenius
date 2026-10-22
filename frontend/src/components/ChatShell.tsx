import { useState, useRef, useEffect } from 'react';
import type { Message } from '../lib/types';
import { ChatMessage } from './ChatMessage';
import { QueryInput } from './QueryInput';
import { EmptyState } from './EmptyState';
import { AnimatePresence, motion } from 'framer-motion';
import { 
  Leaf, 
  Plus, 
  MessageSquare, 
  FileText, 
  X, 
  Menu, 
  Sparkles,
  Trash2,
  ShieldCheck,
  User
} from 'lucide-react';
import { SourceCard } from './SourceCard';
import { useNavigate, useLocation } from 'react-router-dom';
import { ThemeToggle } from './ThemeToggle';
import { useAuth } from '../context/AuthContext';
import { streamChatMessage } from '../lib/api';

export function ChatShell() {
  const navigate = useNavigate();
  const location = useLocation();
  const { isAdmin, isAuthenticated, user } = useAuth();
  const initialHandled = useRef(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showSources, setShowSources] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  useEffect(() => {
    const initialQuery = (location.state as any)?.initialQuery;
    if (initialQuery && !initialHandled.current) {
      initialHandled.current = true;
      handleSendMessage(initialQuery, 'auto');
    }
  }, [location.state]);

  const activeMessageWithSources = [...messages].reverse().find(
    m => m.responseDetails?.sources && m.responseDetails.sources.length > 0
  );
  const activeSources = activeMessageWithSources?.responseDetails?.sources || [];

  const handleSendMessage = async (query: string, language: "auto" | "en" | "hi") => {
    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: query,
    };
    
    const assistantId = (Date.now() + 1).toString();
    const assistantMessage: Message = {
      id: assistantId,
      role: 'assistant',
      content: '',
    };
    
    setMessages(prev => [...prev, userMessage, assistantMessage]);
    setIsLoading(true);

    try {
      await streamChatMessage(
        { query, language, top_k: 5 },
        (chunk) => {
          setMessages(prev => 
            prev.map(msg => 
              msg.id === assistantId 
                ? { ...msg, content: msg.content + chunk } 
                : msg
            )
          );
        },
        (sources) => {
          const responseLanguage = /[\u0c00-\u0c7f]/.test(query)
            ? 'te'
            : (language === 'hi' || /[\u0900-\u097f]/.test(query) ? 'hi' : 'en');
          setMessages(prev => 
            prev.map(msg => 
              msg.id === assistantId 
                ? { ...msg, responseDetails: { sources, grounded: sources.length > 0, query, answer: msg.content, confidence: 'unknown', language: responseLanguage } }
                : msg
            )
          );
        },
        (error) => {
          console.error('Failed to send message:', error);
          setMessages(prev => 
            prev.map(msg => 
              msg.id === assistantId 
                ? { ...msg, content: 'I could not reach the AgriGenius backend. Please try again when it is available.', responseDetails: undefined }
                : msg
            )
          );
          setIsLoading(false);
        },
        () => {
          setIsLoading(false);
        }
      );
    } catch (error) {
      console.error('Failed to send message:', error);
      setMessages(prev => 
        prev.map(msg => 
          msg.id === assistantId 
            ? { ...msg, content: 'Unable to connect to the assistant. Please try again.' } 
            : msg
        )
      );
      setIsLoading(false);
    }
  };

  return (
    <div className="flex w-full h-full bg-slate-50 dark:bg-black overflow-hidden font-sans relative text-slate-900 dark:text-neutral-100 transition-colors">
      {/* Background Ambient Glow */}
      <div className="fixed top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[300px] bg-emerald-500/10 dark:hidden rounded-full blur-[140px] pointer-events-none" />

      {/* MOBILE OVERLAY */}
      {isSidebarOpen && (
        <div 
          className="md:hidden fixed inset-0 bg-slate-900/60 dark:bg-black/80 backdrop-blur-sm z-40" 
          onClick={() => setIsSidebarOpen(false)} 
        />
      )}

      {/* LEFT SIDEBAR - Clean, Minimalist, No Promo Jargon */}
      <aside className={`fixed md:relative z-40 w-64 bg-white dark:bg-neutral-950 text-slate-800 dark:text-slate-300 flex flex-col h-full shrink-0 border-r border-slate-200/80 dark:border-neutral-800/80 transform ${
        isSidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
      } transition-transform duration-200 ease-out overflow-hidden shadow-xl md:shadow-none`}>
        
        {/* Brand Header */}
        <div className="p-4 flex items-center justify-between border-b border-slate-100 dark:border-neutral-800/80">
          <div 
            onClick={() => navigate('/')}
            className="flex items-center space-x-2.5 cursor-pointer group"
          >
            <div className="bg-gradient-to-br from-emerald-500 to-teal-600 dark:from-white dark:to-neutral-200 p-1.5 rounded-xl shadow-md shadow-emerald-500/20 dark:shadow-none group-hover:scale-105 transition-transform text-white dark:text-black">
              <Leaf className="w-4 h-4 text-white dark:text-black" />
            </div>
            <span className="text-base font-bold text-slate-900 dark:text-white tracking-tight">
              AgriGenius
            </span>
          </div>

          <button
            type="button"
            onClick={() => setIsSidebarOpen(false)}
            className="md:hidden p-1.5 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-white"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        
        {/* New Query Button */}
        <div className="p-3">
          <motion.button 
            whileHover={{ scale: 1.01 }}
            whileTap={{ scale: 0.97 }}
            onClick={() => {
              setMessages([]);
              setShowSources(false);
              setIsSidebarOpen(false);
            }}
            className="w-full bg-emerald-600 hover:bg-emerald-500 dark:bg-white dark:text-black dark:hover:bg-neutral-200 text-white rounded-xl py-2 px-3 flex items-center justify-center font-semibold text-xs shadow-sm dark:shadow-none transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4 mr-1.5 text-white dark:text-black" />
            <span>New Query</span>
          </motion.button>
        </div>

        {/* Query History */}
        <div className="flex-1 overflow-y-auto px-3 py-2 space-y-2">
          <div className="flex items-center justify-between text-[11px] font-semibold text-slate-400 dark:text-neutral-500 px-1">
            <span>Recent</span>
            {messages.length > 0 && (
              <button
                type="button"
                onClick={() => setMessages([])}
                className="hover:text-red-500 transition-colors cursor-pointer"
                title="Clear queries"
              >
                <Trash2 className="w-3 h-3" />
              </button>
            )}
          </div>

          {messages.length > 0 ? (
            <div className="space-y-1">
              {messages.filter(m => m.role === 'user').map((m, idx) => (
                <div 
                  key={m.id || idx}
                  className="flex items-center space-x-2 text-xs text-slate-700 dark:text-neutral-300 bg-slate-100/70 dark:bg-neutral-900/70 hover:bg-slate-200/80 dark:hover:bg-neutral-800 p-2.5 rounded-xl cursor-pointer border border-slate-200/50 dark:border-neutral-800/80 transition-colors"
                >
                  <MessageSquare className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                  <span className="truncate">{m.content}</span>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-xs text-slate-400 dark:text-neutral-500 italic px-2 py-4 text-center">
              No queries yet
            </div>
          )}
        </div>
      </aside>

      {/* CENTER CHAT AREA */}
      <main className="flex-1 flex flex-col h-full relative z-10 w-full min-w-0 bg-transparent overflow-hidden">
        
        {/* Top Header Bar */}
        <header className="sticky top-0 z-30 flex justify-between items-center h-13 px-4 sm:px-6 bg-white/80 dark:bg-neutral-900/80 backdrop-blur-md border-b border-slate-200/80 dark:border-neutral-800/80 transition-colors">
          {/* Mobile Menu Button */}
          <div className="flex items-center space-x-3">
            <button 
              type="button"
              onClick={() => setIsSidebarOpen(true)}
              className="md:hidden flex items-center justify-center p-1.5 rounded-lg bg-slate-100 dark:bg-neutral-800 text-slate-700 dark:text-neutral-300 cursor-pointer"
              title="Open Sidebar"
            >
              <Menu className="w-4 h-4" />
            </button>
          </div>

          {/* Right Action Icons & Sources Toggle */}
          <div className="flex items-center space-x-2.5">
            <button
              type="button"
              onClick={() => navigate(isAdmin ? '/admin' : isAuthenticated ? '/profile' : '/auth')}
              className="inline-flex items-center justify-center px-2.5 py-1.5 text-xs font-bold text-slate-700 dark:text-neutral-200 bg-slate-100 hover:bg-slate-200 dark:bg-neutral-900 dark:hover:bg-neutral-800 rounded-xl border border-slate-200 dark:border-neutral-800 transition-all cursor-pointer shadow-sm"
              title={isAdmin ? "Open Admin Dashboard" : isAuthenticated ? "View Profile" : "Sign In / Login"}
            >
              {isAdmin ? (
                <>
                  <ShieldCheck className="w-3.5 h-3.5 mr-1 text-emerald-600 dark:text-white" />
                  <span>Admin</span>
                </>
              ) : isAuthenticated ? (
                <>
                  <div className="w-4 h-4 rounded-full bg-emerald-600 text-white flex items-center justify-center text-[10px] mr-1.5 font-bold">
                    {user?.name?.charAt(0).toUpperCase() || 'U'}
                  </div>
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
              type="button"
              onClick={() => setShowSources(!showSources)}
              className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all border cursor-pointer ${
                showSources 
                  ? 'bg-emerald-50 dark:bg-white border-emerald-300 dark:border-white text-emerald-700 dark:text-black font-bold' 
                  : 'bg-white dark:bg-neutral-900 border-slate-200 dark:border-neutral-800 text-slate-700 dark:text-neutral-300 hover:bg-slate-50 dark:hover:bg-neutral-800'
              }`}
              title="View Sources"
            >
              <FileText className="w-3.5 h-3.5 text-emerald-500 dark:text-inherit" />
              <span>Sources</span>
              {activeSources.length > 0 && (
                <span className={`text-[10px] font-mono font-bold px-1.5 py-0.2 rounded-full ${
                  showSources 
                    ? 'bg-emerald-600 dark:bg-black text-white' 
                    : 'bg-emerald-100 dark:bg-neutral-800 text-emerald-800 dark:text-white'
                }`}>
                  {activeSources.length}
                </span>
              )}
            </button>
          </div>
        </header>

        {/* Message Stream Area */}
        <div className="flex-1 overflow-y-auto relative scrollbar-hide flex flex-col justify-between">
          <div className="max-w-3xl mx-auto w-full px-2 sm:px-4 py-4 flex-1">
            {messages.length === 0 ? (
              <EmptyState onSelectQuery={(q) => handleSendMessage(q, 'auto')} />
            ) : (
              <div className="space-y-2 pb-4">
                <AnimatePresence mode="popLayout">
                  {messages.map((msg) => (
                    <ChatMessage 
                      key={msg.id} 
                      message={msg} 
                      onOpenSources={() => setShowSources(true)}
                    />
                  ))}
                  
                  {/* Streaming Loading Typing Indicator */}
                  {isLoading && (
                    <motion.div 
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      className="py-3 px-4 flex w-full justify-start"
                    >
                      <div className="flex gap-2.5 max-w-2xl flex-row items-center">
                        <div className="w-7 h-7 rounded-full bg-emerald-50 dark:bg-neutral-900 border border-emerald-300 dark:border-neutral-800 flex items-center justify-center">
                          <Sparkles className="w-3.5 h-3.5 text-emerald-600 dark:text-white animate-spin" />
                        </div>
                        <div className="px-3.5 py-2 rounded-2xl bg-white dark:bg-neutral-900 border border-slate-200 dark:border-neutral-800 shadow-sm flex items-center space-x-1.5">
                          <div className="w-1.5 h-1.5 bg-emerald-500 dark:bg-white rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                          <div className="w-1.5 h-1.5 bg-emerald-500 dark:bg-white rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                          <div className="w-1.5 h-1.5 bg-emerald-500 dark:bg-white rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
                <div ref={messagesEndRef} className="h-2" />
              </div>
            )}
          </div>
        </div>

        {/* Input Area */}
        <QueryInput onSend={handleSendMessage} disabled={isLoading} />

        {/* Spacing for fixed GlobalBottomNav */}
        <div className="h-16 w-full shrink-0 pointer-events-none" />
      </main>

      {/* RIGHT SIDEBAR - Sources Drawer */}
      <AnimatePresence>
        {showSources && (
          <motion.aside 
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 26, stiffness: 220 }}
            className="fixed md:relative right-0 z-40 flex flex-col h-full w-[340px] max-w-[88vw] shrink-0 shadow-2xl border-l border-slate-200/80 dark:border-neutral-800/80 overflow-hidden bg-white/95 dark:bg-neutral-950 backdrop-blur-xl"
          >
            <div className="p-4 border-b border-slate-100 dark:border-neutral-800/80 flex items-center justify-between">
              <div>
                <h2 className="text-sm font-bold text-slate-900 dark:text-white flex items-center space-x-2">
                  <FileText className="w-4 h-4 text-emerald-500 dark:text-white" />
                  <span>Sources</span>
                </h2>
                <p className="text-[11px] text-slate-400 dark:text-neutral-500">
                  {activeSources.length} advisory records
                </p>
              </div>

              <button 
                type="button"
                onClick={() => setShowSources(false)}
                className="p-1.5 rounded-xl hover:bg-slate-100 dark:hover:bg-neutral-800 text-slate-400 hover:text-slate-800 dark:hover:text-white transition-colors cursor-pointer"
                title="Close sources"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              {activeSources.length > 0 ? (
                activeSources.map((source, idx) => (
                  <SourceCard
                    key={source.rank || idx}
                    source={source}
                    query={activeMessageWithSources?.responseDetails?.query || ''}
                  />
                ))
              ) : (
                <div className="text-xs text-slate-400 dark:text-neutral-500 text-center py-16 space-y-2">
                  <FileText className="w-8 h-8 text-slate-300 dark:text-neutral-700 mx-auto" />
                  <p className="font-semibold text-slate-600 dark:text-neutral-400">No sources active</p>
                  <p className="text-[11px] max-w-[200px] mx-auto">
                    Sources will appear here when a query is answered.
                  </p>
                </div>
              )}
            </div>
          </motion.aside>
        )}
      </AnimatePresence>
    </div>
  );
}
