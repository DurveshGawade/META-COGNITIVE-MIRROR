
import React, { useState, useRef, useMemo, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AnalysisEntry, VoiceIdentity } from '../types';
import { GeminiService } from '../services/geminiService';

interface ARIAProps {
  history: AnalysisEntry[];
  onCommand: (command: any) => void;
  isAnalyzing: boolean;
  currentVibe: string;
  externalAudioFrequency?: number;
  isCentered?: boolean;
  selectedVoice?: VoiceIdentity;
  toast?: string | null;
  onClearToast?: () => void;
}

const ARIA: React.FC<ARIAProps> = ({ 
  history, 
  onCommand, 
  isAnalyzing, 
  currentVibe, 
  externalAudioFrequency = 0, 
  isCentered = false, 
  selectedVoice = 'Kore',
  toast,
  onClearToast
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [isThinking, setIsThinking] = useState(false);
  const [messages, setMessages] = useState<{ role: 'user' | 'agent', text: string }[]>([]);
  
  const gemini = new GeminiService();

  useEffect(() => {
    if (toast) {
      const timer = setTimeout(() => {
        if (onClearToast) onClearToast();
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [toast, onClearToast]);

  const vibeColors = useMemo(() => {
    const vibe = currentVibe ? currentVibe.toLowerCase() : 'neutral';
    switch (vibe) {
      case 'flow': return { primary: '#8b5cf6', secondary: '#06b6d4' };
      case 'frustration': return { primary: '#f97316', secondary: '#ef4444' };
      case 'stressed': return { primary: '#ef4444', secondary: '#7c2d12' };
      case 'fatigue': return { primary: '#3b82f6', secondary: '#1d4ed8' };
      default: return { primary: '#06b6d4', secondary: '#8b5cf6' };
    }
  }, [currentVibe]);

  const handleQuery = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!query.trim() || isThinking) return;

    const userText = query;
    setQuery('');
    setMessages(prev => [...prev, { role: 'user', text: userText }]);
    setIsThinking(true);

    try {
      const response = await gemini.interactWithAria(userText, history);
      setMessages(prev => [...prev, { role: 'agent', text: response.text }]);
      
      if (response.command) {
        onCommand(response.command);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsThinking(false);
    }
  };

  const renderMessage = (msg: { role: 'user' | 'agent', text: string }) => {
    return (
      <div className={`max-w-[90%] p-3 md:p-4 rounded-2xl md:rounded-[24px] text-[10px] md:text-xs leading-relaxed shadow-xl backdrop-blur-md border ${
        msg.role === 'user' 
          ? 'bg-cyan-500/20 border-cyan-500/30 text-cyan-100' 
          : 'bg-white/5 border-white/10 text-white/90'
      }`}>
        {msg.text}
      </div>
    );
  };

  return (
    <motion.div 
      layout
      className={`fixed z-[2000] flex flex-col gap-3 md:gap-4 transition-all duration-1000 ${
        isCentered 
          ? 'top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none' 
          : 'bottom-4 left-4 md:bottom-8 md:left-8 items-start'
      }`}
    >
      <AnimatePresence>
        {isOpen && !isCentered && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="w-[85vw] max-w-[384px] h-[60vh] md:h-[500px] liquid-glass rounded-[32px] md:rounded-[40px] border border-white/10 shadow-2xl flex flex-col overflow-hidden mb-4"
          >
            <div className="p-4 md:p-5 border-b border-white/5 bg-white/5 flex justify-between items-center backdrop-blur-xl shrink-0">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
                <span className="text-[8px] md:text-[10px] font-black uppercase tracking-widest text-white/80">Forensic Agent</span>
              </div>
              <button onClick={() => setIsOpen(false)} className="text-white/30 hover:text-white transition-colors">
                <svg className="w-4 h-4 md:w-5 md:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </div>
            
            <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-4 scroll-smooth bg-gradient-to-b from-transparent to-black/20 custom-scrollbar">
              {messages.length === 0 && (
                <div className="h-full flex flex-col items-center justify-center text-center p-4 md:p-8 space-y-4 opacity-40">
                  <div className="w-12 h-12 md:w-16 md:h-16 rounded-3xl bg-white/5 flex items-center justify-center border border-white/10">
                    <svg className="w-6 h-6 md:w-8 md:h-8 text-cyan-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
                  </div>
                  <p className="text-[8px] md:text-[10px] uppercase font-bold tracking-[0.2em] md:tracking-[0.3em] leading-relaxed">Forensic Unit Ready. Query Live Neural Link.</p>
                </div>
              )}
              {messages.map((m, i) => (
                <motion.div 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  key={i} 
                  className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  {renderMessage(m)}
                </motion.div>
              ))}
              {isThinking && (
                <div className="flex justify-start">
                  <div className="bg-white/5 p-3 rounded-2xl flex gap-1.5 items-center">
                    <motion.div animate={{ scale: [1, 1.2, 1], opacity: [0.5, 1, 0.5] }} transition={{ repeat: Infinity, duration: 1 }} className="w-1 h-1 bg-cyan-400 rounded-full" />
                    <motion.div animate={{ scale: [1, 1.2, 1], opacity: [0.5, 1, 0.5] }} transition={{ repeat: Infinity, duration: 1, delay: 0.2 }} className="w-1 h-1 bg-cyan-400 rounded-full" />
                  </div>
                </div>
              )}
            </div>

            <form onSubmit={handleQuery} className="p-4 md:p-6 bg-black/60 border-t border-white/10 flex gap-2 md:gap-3 backdrop-blur-2xl shrink-0">
              <input
                value={query}
                onChange={e => setQuery(e.target.value)}
                placeholder="Query live link feed..."
                className="flex-1 bg-white/5 border border-white/10 rounded-xl md:rounded-2xl px-4 py-2 md:px-5 md:py-3 text-[10px] md:text-xs focus:outline-none focus:border-cyan-500 transition-all text-white placeholder:text-white/20"
              />
              <button 
                type="submit"
                className="p-2 md:p-3 rounded-xl md:rounded-2xl bg-cyan-500 text-black hover:bg-cyan-400 transition-all shadow-lg shadow-cyan-500/20 active:scale-95"
              >
                <svg className="w-4 h-4 md:w-5 md:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" /></svg>
              </button>
            </form>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {toast && !isCentered && (
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, scale: 0.8 }}
            className="absolute left-full ml-4 top-1/2 -translate-y-1/2 px-4 py-2 bg-black/80 backdrop-blur-xl border border-cyan-500/30 rounded-2xl shadow-[0_10px_30px_rgba(0,0,0,0.5)] whitespace-nowrap z-[2100]"
          >
            <p className="text-[10px] md:text-xs font-bold text-white uppercase tracking-tight">{toast}</p>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="relative group flex items-end gap-3 md:gap-4">
        <div className="relative">
          <motion.div 
            animate={{ 
              background: `radial-gradient(circle at 50% 50%, ${vibeColors.primary}44 0%, ${vibeColors.secondary}22 50%, transparent 100%)`,
              scale: isCentered ? [1, 1.3, 1] : [1, 1.1, 1],
              opacity: isCentered ? [0.6, 0.2, 0.6] : [0.3, 0.5, 0.3]
            }}
            transition={{ duration: 4, repeat: Infinity }}
            className="absolute -inset-10 md:-inset-16 blur-3xl rounded-full z-0 pointer-events-none"
          />

          <motion.div
            animate={{ 
              y: isCentered ? [0, -10, 0] : [0, -8, 0],
              scale: isCentered ? 1.3 : 0.8
            }}
            transition={{ y: { repeat: Infinity, duration: 3, ease: "easeInOut" } }}
            onClick={() => !isCentered && setIsOpen(!isOpen)}
            className={`${isCentered ? 'cursor-default' : 'cursor-pointer'} relative z-10 w-16 h-16 md:w-24 md:h-24 flex items-center justify-center`}
          >
            <svg viewBox="0 0 100 100" fill="none" className="w-[60px] h-[60px] md:w-[80px] md:h-[80px]">
              <rect x="35" y="45" width="30" height="30" rx="8" fill="white" />
              <rect x="40" y="50" width="20" height="15" rx="3" fill="#f0f9ff" />
              <motion.circle 
                cx="50" cy="65" 
                r={3 + (externalAudioFrequency / 15)} 
                fill="#00ffff" 
                fillOpacity={0.4}
                style={{ filter: "blur(2px)" }}
              />
              <circle cx="50" cy="65" r="1.5" fill="#00ffff" />
              <g style={{ transformOrigin: "50px 45px" }}>
                <rect x="30" y="20" width="40" height="28" rx="10" fill="white" stroke="#e2e8f0" strokeWidth="1" />
                <rect x="35" y="28" width="30" height="12" rx="5" fill="#1e293b" />
                <circle cx="42" cy="34" r="2" fill="#00ffff" />
                <circle cx="58" cy="34" r="2" fill="#00ffff" />
              </g>
            </svg>
          </motion.div>
        </div>

        {!isCentered && (
          <div className="absolute -top-3 left-1/2 -translate-x-1/2 whitespace-nowrap">
            <motion.div 
              className="px-2 py-0.5 rounded-full bg-black/80 backdrop-blur-md border border-white/10 text-[6px] md:text-[8px] font-black uppercase tracking-widest text-cyan-400 flex items-center gap-1.5"
            >
              <span className="w-0.5 h-0.5 md:w-1 md:h-1 rounded-full bg-cyan-400" />
              SYSTEM_LIVE_LINK
            </motion.div>
          </div>
        )}
      </div>
    </motion.div>
  );
};

export default ARIA;
