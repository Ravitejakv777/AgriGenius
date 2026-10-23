import { useState, useRef, useEffect, useCallback } from 'react';
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
  User,
  Lock,
  ArrowRight
} from 'lucide-react';
import { SourceCard } from './SourceCard';
import { useNavigate, useLocation } from 'react-router-dom';
import { ThemeToggle } from './ThemeToggle';
import { useAuth } from '../context/AuthContext';
import { streamChatMessage, saveChatHistoryApi, fetchChatHistoryApi, clearChatHistoryApi } from '../lib/api';

export function ChatShell() {
  const navigate = useNavigate();
  const location = useLocation();
  const { isAuthenticated, user } = useAuth();
  const initialHandled = useRef(false);
  const [messages, setMessages] = useState<Message[]>(() => {
    if (user?.email) {
      try {
        const cached = localStorage.getItem(`agrigenius_chat_thread_${user.email.toLowerCase()}`);
        if (cached) {
          const parsed = JSON.parse(cached);
          if (Array.isArray(parsed) && parsed.length > 0) return parsed;
        }
      } catch {
        // ignore parse error
      }
    }
    return [];
  });
  const [isLoading, setIsLoading] = useState(false);
  const [showSources, setShowSources] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [showAuthGateModal, setShowAuthGateModal] = useState(false);
  const [dbChatHistory, setDbChatHistory] = useState<any[]>([]);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [isProfileReminderDismissed, setIsProfileReminderDismissed] = useState(() => {
    try {
      return sessionStorage.getItem('agrigenius_dismiss_profile_reminder') === 'true';
    } catch {
      return false;
    }
  });

  const isProfileIncomplete = !!(isAuthenticated && user && (!user.phone?.trim() || !user.dob?.trim() || (!user.district?.trim() && !user.place?.trim())));

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  const loadDbHistory = useCallback(async () => {
    if (isAuthenticated && user?.email) {
      try {
        const data = await fetchChatHistoryApi(user.email, user.id);
        if (Array.isArray(data)) {
          setDbChatHistory(data);
          // Restore messages if empty or not yet loaded
          setMessages((prev) => {
            if (prev.length > 0) return prev;
            try {
              const cached = localStorage.getItem(`agrigenius_chat_thread_${user.email.toLowerCase()}`);
              if (cached) {
                const parsed = JSON.parse(cached);
                if (Array.isArray(parsed) && parsed.length > 0) return parsed;
              }
            } catch {}

            if (data.length > 0) {
              const reconstructed: Message[] = [];
              [...data].reverse().forEach((item) => {
                reconstructed.push({
                  id: `hist_q_${item.id}`,
                  role: 'user',
                  content: item.query,
                });
                reconstructed.push({
                  id: `hist_a_${item.id}`,
                  role: 'assistant',
                  content: item.answer,
                  responseDetails: {
                    sources: item.sources || [],
                    grounded: item.grounded ?? true,
                    query: item.query,
                    answer: item.answer,
                    confidence: item.confidence || 'verified',
                    language: item.language || 'en',
                  },
                });
              });
              try {
                localStorage.setItem(
                  `agrigenius_chat_thread_${user.email.toLowerCase()}`,
                  JSON.stringify(reconstructed)
                );
              } catch {}
              return reconstructed;
            }
            return prev;
          });
        }
      } catch (err) {
        console.warn('Could not load chat history from database:', err);
      }
    } else {
      setDbChatHistory([]);
    }
  }, [isAuthenticated, user?.email, user?.id]);

  useEffect(() => {
    loadDbHistory();
  }, [loadDbHistory]);

  // Sync with per-user localStorage when active user changes
  useEffect(() => {
    if (user?.email) {
      try {
        const cached = localStorage.getItem(`agrigenius_chat_thread_${user.email.toLowerCase()}`);
        if (cached) {
          const parsed = JSON.parse(cached);
          if (Array.isArray(parsed) && parsed.length > 0) {
            setMessages(parsed);
            return;
          }
        }
      } catch {}
      loadDbHistory();
    } else if (!isAuthenticated) {
      setMessages([]);
    }
  }, [user?.email, isAuthenticated, loadDbHistory]);

  // Auto-persist active messages to per-user localStorage cache
  useEffect(() => {
    if (user?.email && messages.length > 0) {
      try {
        localStorage.setItem(`agrigenius_chat_thread_${user.email.toLowerCase()}`, JSON.stringify(messages));
      } catch (e) {
        console.warn('Could not cache messages:', e);
      }
    }
  }, [messages, user?.email]);

  const handleSendMessage = async (query: string, language: "auto" | "en" | "hi" | "te") => {
    // Auth gate for unauthenticated users
    if (!isAuthenticated) {
      setShowAuthGateModal(true);
      return;
    }

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

    let fullAnswer = '';
    let capturedSources: any[] = [];

    try {
      await streamChatMessage(
        { query, language, top_k: 5 },
        (chunk) => {
          fullAnswer += chunk;
          setMessages(prev => 
            prev.map(msg => 
              msg.id === assistantId 
                ? { ...msg, content: msg.content + chunk } 
                : msg
            )
          );
        },
        (sources) => {
          capturedSources = sources;
          const responseLanguage = /[\u0c00-\u0c7f]/.test(query)
            ? 'te'
            : (language === 'hi' || /[\u0900-\u097f]/.test(query) ? 'hi' : (language === 'te' ? 'te' : 'en'));
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
          // Persist chat query and response into database for authenticated user
          if (isAuthenticated && user?.email && fullAnswer) {
            saveChatHistoryApi({
              user_email: user.email,
              user_id: user.id,
              query,
              answer: fullAnswer,
              language,
              sources_json: capturedSources,
            })
              .then(() => loadDbHistory())
              .catch((err) => console.warn('Could not save chat to database:', err));
          }
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

  const handleLoadHistoryItem = (item: any) => {
    const qId = `hist_q_${item.id}`;
    const exists = messages.some((m) => m.id === qId || (m.role === 'user' && m.content === item.query));
    if (!exists) {
      setMessages((prev) => [
        ...prev,
        { id: qId, role: 'user', content: item.query },
        {
          id: `hist_a_${item.id}`,
          role: 'assistant',
          content: item.answer,
          responseDetails: {
            sources: item.sources || [],
            grounded: item.grounded ?? true,
            query: item.query,
            answer: item.answer,
            confidence: item.confidence || 'verified',
            language: item.language || 'en',
          },
        },
      ]);
    }
    setIsSidebarOpen(false);
    setTimeout(() => {
      const el = document.getElementById(`msg-${qId}`);
      if (el) {
        el.scrollIntoView({ behavior: 'smooth', block: 'center' });
      } else {
        scrollToBottom();
      }
    }, 100);
  };


  const handleDeleteSingleHistory = async (historyId: number) => {
    setDbChatHistory((prev) => prev.filter((item) => item.id !== historyId));
    setMessages((prev) => {
      const filtered = prev.filter(
        (m) => m.id !== `hist_q_${historyId}` && m.id !== `hist_a_${historyId}`
      );
      if (user?.email) {
        try {
          localStorage.setItem(
            `agrigenius_chat_thread_${user.email.toLowerCase()}`,
            JSON.stringify(filtered)
          );
        } catch {}
      }
      return filtered;
    });
    if (isAuthenticated && user?.email) {
      try {
        await clearChatHistoryApi(user.email, user.id, historyId);
      } catch (err) {
        console.warn('Could not delete history item on server:', err);
      }
    }
  };

  const handleDeleteMessage = (messageId: string) => {
    setMessages((prev) => {
      const filtered = prev.filter((m) => m.id !== messageId);
      if (user?.email) {
        try {
          localStorage.setItem(
            `agrigenius_chat_thread_${user.email.toLowerCase()}`,
            JSON.stringify(filtered)
          );
        } catch {}
      }
      return filtered;
    });
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

      {/* LEFT SIDEBAR - Clean, Minimalist */}
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
              setIsSidebarOpen(false);
              scrollToBottom();
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
          </div>

          {dbChatHistory.length > 0 ? (
            <div className="space-y-1">
              {dbChatHistory.map((item) => (
                <div 
                  key={item.id}
                  className="group flex items-center justify-between text-xs text-slate-700 dark:text-neutral-300 bg-slate-100/70 dark:bg-neutral-900/70 hover:bg-slate-200/80 dark:hover:bg-neutral-800 p-2.5 rounded-xl border border-slate-200/50 dark:border-neutral-800/80 transition-colors"
                >
                  <div 
                    onClick={() => handleLoadHistoryItem(item)}
                    className="flex items-center space-x-2 truncate flex-1 cursor-pointer min-w-0"
                    title={item.query}
                  >
                    <MessageSquare className="w-3.5 h-3.5 text-emerald-500 shrink-0 group-hover:scale-110 transition-transform" />
                    <span className="truncate">{item.query}</span>
                  </div>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDeleteSingleHistory(item.id);
                    }}
                    className="opacity-0 group-hover:opacity-100 p-1 text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded-lg transition-all ml-1 cursor-pointer shrink-0"
                    title="Delete this query"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>
          ) : messages.length > 0 ? (
            <div className="space-y-1">
              {messages.filter(m => m.role === 'user').map((m, idx) => (
                <div 
                  key={m.id || idx}
                  className="group flex items-center justify-between text-xs text-slate-700 dark:text-neutral-300 bg-slate-100/70 dark:bg-neutral-900/70 hover:bg-slate-200/80 dark:hover:bg-neutral-800 p-2.5 rounded-xl border border-slate-200/50 dark:border-neutral-800/80 transition-colors"
                >
                  <div 
                    className="flex items-center space-x-2 truncate flex-1 cursor-pointer min-w-0"
                    title={m.content}
                  >
                    <MessageSquare className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                    <span className="truncate">{m.content}</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleDeleteMessage(m.id)}
                    className="opacity-0 group-hover:opacity-100 p-1 text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded-lg transition-all ml-1 cursor-pointer shrink-0"
                    title="Delete this query"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-xs text-slate-400 dark:text-neutral-500 italic px-2 py-4 text-center">
              {isAuthenticated ? "No past queries yet" : "Sign in to save query history"}
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
              onClick={() => navigate(isAuthenticated ? '/profile' : '/auth')}
              className="inline-flex items-center justify-center px-2.5 py-1.5 text-xs font-bold text-slate-700 dark:text-neutral-200 bg-slate-100 hover:bg-slate-200 dark:bg-neutral-900 dark:hover:bg-neutral-800 rounded-xl border border-slate-200 dark:border-neutral-800 transition-all cursor-pointer shadow-sm"
              title={isAuthenticated ? "View Profile" : "Sign In / Login"}
            >
              {isAuthenticated ? (
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

        {/* Profile Setup Incomplete Reminder Banner */}
        {isProfileIncomplete && !isProfileReminderDismissed && (
          <div className="bg-amber-50/90 dark:bg-amber-950/40 border-b border-amber-200/80 dark:border-amber-900/60 px-4 py-2 flex items-center justify-between text-xs text-amber-900 dark:text-amber-200 shrink-0 z-20">
            <div className="flex items-center space-x-2 truncate mr-2">
              <span className="w-2 h-2 rounded-full bg-amber-500 shrink-0 animate-pulse" />
              <span className="truncate">
                Complete your profile (phone, date of birth, farm location) for localized crop advisories.
              </span>
            </div>
            <div className="flex items-center space-x-2.5 shrink-0">
              <button
                type="button"
                onClick={() => navigate('/profile')}
                className="font-bold text-emerald-700 dark:text-emerald-400 hover:underline cursor-pointer flex items-center space-x-1"
              >
                <span>Edit Profile</span>
                <span>&rarr;</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  setIsProfileReminderDismissed(true);
                  try {
                    sessionStorage.setItem('agrigenius_dismiss_profile_reminder', 'true');
                  } catch {
                    // storage unavailable
                  }
                }}
                className="text-slate-400 hover:text-slate-700 dark:hover:text-white p-0.5 rounded cursor-pointer transition-colors"
                title="Dismiss reminder"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        )}

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
                      onDelete={() => handleDeleteMessage(msg.id)}
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

        {/* Unauthenticated Alert Banner */}
        {!isAuthenticated && (
          <div className="max-w-3xl mx-auto w-full px-4 mb-2">
            <div className="bg-emerald-500/10 dark:bg-emerald-950/40 border border-emerald-500/30 rounded-2xl p-3 flex items-center justify-between gap-3 text-xs shadow-sm">
              <div className="flex items-center space-x-2.5 min-w-0">
                <div className="p-1.5 rounded-xl bg-emerald-600 text-white shrink-0 shadow-sm">
                  <Lock className="w-3.5 h-3.5" />
                </div>
                <span className="text-slate-800 dark:text-neutral-200 truncate">
                  <strong>Sign in or Sign up</strong> to ask questions, receive personalized crop advisory, and save your consultations.
                </span>
              </div>
              <button
                type="button"
                onClick={() => navigate('/auth')}
                className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold shrink-0 shadow-sm transition-all cursor-pointer text-xs"
              >
                Sign In / Sign Up
              </button>
            </div>
          </div>
        )}

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

      {/* SIGN UP REQUIRED MODAL FOR UNAUTHENTICATED USERS */}
      <AnimatePresence>
        {showAuthGateModal && (
          <div 
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm"
            onClick={() => setShowAuthGateModal(false)}
          >
            <motion.div
              onClick={(e) => e.stopPropagation()}
              initial={{ opacity: 0, scale: 0.94, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.94, y: 15 }}
              className="bg-white dark:bg-neutral-900 border border-slate-200 dark:border-neutral-800 rounded-3xl p-6 sm:p-7 max-w-md w-full shadow-2xl relative text-center"
            >
              <button
                type="button"
                onClick={() => setShowAuthGateModal(false)}
                className="absolute top-4 right-4 p-1.5 rounded-xl text-slate-400 hover:text-slate-700 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-neutral-800 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="w-14 h-14 rounded-2xl bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800/80 flex items-center justify-center mx-auto mb-4 text-emerald-600 dark:text-emerald-400 shadow-md">
                <Lock className="w-7 h-7" />
              </div>

              <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">
                Sign In or Sign Up to Continue
              </h3>

              <p className="text-xs sm:text-sm text-slate-600 dark:text-neutral-400 leading-relaxed mb-6">
                To consult the AgriGenius AI assistant, access verified agricultural advisory records, and save your consultation history to your profile, please sign in or create a free account.
              </p>

              <div className="flex flex-col sm:flex-row gap-2.5">
                <button
                  type="button"
                  onClick={() => {
                    setShowAuthGateModal(false);
                    navigate('/auth');
                  }}
                  className="flex-1 py-3 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs sm:text-sm shadow-md transition-all cursor-pointer flex items-center justify-center space-x-1.5"
                >
                  <span>Create Account / Sign In</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={() => setShowAuthGateModal(false)}
                  className="py-3 px-4 rounded-xl border border-slate-200 dark:border-neutral-700 text-slate-600 dark:text-neutral-400 hover:bg-slate-100 dark:hover:bg-neutral-800 font-semibold text-xs sm:text-sm transition-all cursor-pointer"
                >
                  Cancel
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
