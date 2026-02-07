import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AppTab } from '../types';

interface NavbarProps {
  isAnalyzing: boolean;
  onEndScan: () => void;
  onFileUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
  hasVideo: boolean;
  isPrivacyShieldActive: boolean;
  onTogglePrivacy: () => void;
  onToggleLanding: () => void;
  onStartScan: () => void;
  onToggleVitality: () => void;
  onToggleAbout: () => void;
  currentTab: AppTab;
  onTabChange: (t: AppTab) => void;
}

const Navbar: React.FC<NavbarProps> = ({ 
  isAnalyzing, onEndScan, hasVideo, isPrivacyShieldActive, onTogglePrivacy, onStartScan, onToggleVitality, onToggleAbout, currentTab, onTabChange
}) => {
  const [isFullScreen, setIsFullScreen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const toggleFullScreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch((e) => {
        console.error(`Error attempting to enable full-screen mode: ${e.message}`);
      });
      setIsFullScreen(true);
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen();
        setIsFullScreen(false);
      }
    }
  };

  useEffect(() => {
    const handleFsChange = () => setIsFullScreen(!!document.fullscreenElement);
    document.addEventListener('fullscreenchange', handleFsChange);
    return () => document.removeEventListener('fullscreenchange', handleFsChange);
  }, []);

  const navItems = [
    { id: 'home', label: 'Home' },
    { id: 'mirror', label: 'Mirror' },
    { id: 'interpreter', label: 'Interpret' },
    { id: 'converter', label: 'Studio' },
    { id: 'learn-path', label: 'Learn' },
    { id: 'form-bridge', label: 'Forms' },
    { id: 'crisis-sign', label: 'Crisis' },
    { id: 'evolution', label: 'Evolution' },
    { id: 'transcriber', label: 'Audit' }
  ];

  const handleTabClick = (tabId: AppTab) => {
    onTabChange(tabId);
    setIsMobileMenuOpen(false);
  };

  return (
    <>
      <motion.header 
        initial={{ y: -100 }} 
        animate={{ y: 0 }}
        className="fixed top-0 inset-x-0 z-[5000] px-4 md:px-8 py-3 flex items-center justify-between backdrop-blur-2xl bg-black/60 border-b border-white/10 shadow-2xl"
      >
        <div className="flex items-center gap-6 lg:gap-10">
          <div 
            className="flex items-center gap-3 cursor-pointer group shrink-0" 
            onClick={() => onTabChange('home')}
          >
            <div className="w-10 h-10 rounded-lg bg-cyan-500 flex items-center justify-center shadow-[0_0_20px_rgba(6,182,212,0.4)] group-hover:scale-105 transition-transform duration-300">
              <svg className="w-6 h-6 text-black" fill="currentColor" viewBox="0 0 24 24">
                <path d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                <path d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
              </svg>
            </div>
            <div className="hidden lg:flex flex-col">
              <h1 className="text-lg font-black italic tracking-tighter uppercase text-white leading-none">
                Meta-Cognitive <span className="text-cyan-400">Mirror</span>
              </h1>
              <span className="text-[8px] font-mono text-white/20 tracking-[0.4em] uppercase">NEURAL_OS v7.4.2</span>
            </div>
          </div>

          <nav className="hidden xl:flex gap-1.5 bg-white/5 p-1 rounded-full border border-white/5 shadow-inner">
            {navItems.map((tab) => (
              <button 
                key={tab.id} 
                onClick={() => onTabChange(tab.id as AppTab)}
                className={`relative px-3.5 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest transition-all duration-300 whitespace-nowrap overflow-hidden ${
                  currentTab === tab.id 
                    ? 'text-black' 
                    : 'text-white/40 hover:text-white hover:bg-white/5'
                }`}
              >
                {currentTab === tab.id && (
                  <motion.div 
                    layoutId="active-nav-bg"
                    className="absolute inset-0 bg-cyan-400 shadow-[0_0_12px_#06b6d4]"
                    transition={{ type: "spring", stiffness: 400, damping: 35 }}
                  />
                )}
                <span className="relative z-10">{tab.label}</span>
              </button>
            ))}
          </nav>
        </div>

        <div className="flex items-center gap-4 shrink-0">
          <button 
            onClick={toggleFullScreen} 
            className={`hidden sm:flex p-2 rounded-lg border border-white/5 text-white/30 hover:text-white hover:border-cyan-500/30 transition-all ${isFullScreen ? 'text-cyan-400 border-cyan-500/20' : ''}`}
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" />
            </svg>
          </button>

          <div className="flex gap-1.5 bg-white/5 p-1 rounded-xl border border-white/5">
            <button 
              onClick={onToggleVitality} 
              className="hidden md:block px-4 py-1.5 rounded-lg bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-400 text-[9px] font-black uppercase tracking-widest transition-all border border-cyan-500/10"
            >
              Vitality
            </button>
            <button 
              onClick={onToggleAbout} 
              className="hidden md:block px-4 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 text-white/40 text-[9px] font-black uppercase tracking-widest transition-all"
            >
              Mission
            </button>
          </div>

          <button 
            onClick={() => setIsMobileMenuOpen(true)}
            className="xl:hidden p-2 rounded-lg bg-white/5 border border-white/10 text-white/40 hover:text-cyan-400 transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16m-7 6h7" />
            </svg>
          </button>
        </div>
      </motion.header>

      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[6000] bg-black/95 backdrop-blur-3xl xl:hidden flex flex-col p-6 overflow-hidden"
          >
            <div className="flex justify-between items-center mb-12">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-cyan-500 flex items-center justify-center">
                  <svg className="w-5 h-5 text-black" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                  </svg>
                </div>
                <h2 className="text-xl font-black italic text-white uppercase tracking-tighter">NEURAL<span className="text-cyan-400">HUB</span></h2>
              </div>
              <button 
                onClick={() => setIsMobileMenuOpen(false)}
                className="p-3 rounded-full bg-white/5 text-white/40 hover:text-white"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <nav className="flex-1 flex flex-col gap-4 overflow-y-auto custom-scrollbar pb-12">
              {navItems.map((tab, idx) => (
                <motion.button
                  key={tab.id}
                  initial={{ x: -20, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  transition={{ delay: idx * 0.05 }}
                  onClick={() => handleTabClick(tab.id as AppTab)}
                  className={`w-full text-left py-4 px-6 rounded-2xl border transition-all flex items-center justify-between group ${
                    currentTab === tab.id 
                      ? 'bg-cyan-500 border-cyan-400 text-black' 
                      : 'bg-white/5 border-white/5 text-white/60 hover:bg-white/10'
                  }`}
                >
                  <span className="text-sm font-black uppercase tracking-[0.2em]">{tab.label}</span>
                  {currentTab === tab.id ? (
                    <div className="w-1.5 h-1.5 rounded-full bg-black animate-pulse" />
                  ) : (
                    <svg className="w-4 h-4 text-white/20 group-hover:text-cyan-400 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" />
                    </svg>
                  )}
                </motion.button>
              ))}
            </nav>

            <div className="mt-auto grid grid-cols-2 gap-3 pt-6 border-t border-white/10">
              <button 
                onClick={() => { onToggleVitality(); setIsMobileMenuOpen(false); }}
                className="flex-1 py-4 rounded-2xl bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 text-[10px] font-black uppercase tracking-widest"
              >
                Vitality
              </button>
              <button 
                onClick={() => { onToggleAbout(); setIsMobileMenuOpen(false); }}
                className="flex-1 py-4 rounded-2xl bg-white/5 border border-white/10 text-white/60 text-[10px] font-black uppercase tracking-widest"
              >
                Mission
              </button>
            </div>
            
            <div className="mt-8 text-center">
               <span className="text-[8px] font-mono text-white/20 uppercase tracking-[0.4em]">SYSTEM_STANDBY: NEURAL_LINK_STABLE</span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default Navbar;