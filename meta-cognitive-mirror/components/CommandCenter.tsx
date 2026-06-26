import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { SessionHistory, VoiceIdentity } from '../types';

interface CommandCenterProps {
  history: SessionHistory[];
  selectedVoice: VoiceIdentity;
  isAcousticSync: boolean;
  isVisualSync: boolean;
  onVoiceChange: (voice: VoiceIdentity) => void;
  onToggleAcoustic: () => void;
  onToggleVisual: () => void;
  onInitiate: () => void;
  onAriaToast: (msg: string) => void;
}

const VOICE_IDENTITIES: { id: VoiceIdentity; label: string; desc: string; color: string }[] = [
  { id: 'Kore', label: 'Identity: Kore', desc: 'Balanced, analytical, clinical sync.', color: '#06b6d4' },
  { id: 'Puck', label: 'Identity: Puck', desc: 'Agile, youthful, high-cadence feed.', color: '#8b5cf6' },
  { id: 'Charon', label: 'Identity: Charon', desc: 'Deep, stoic, authoritative audit.', color: '#3b82f6' },
  { id: 'Fenrir', label: 'Identity: Fenrir', desc: 'Sharp, visceral, intense resonance.', color: '#ef4444' },
  { id: 'Zephyr', label: 'Identity: Zephyr', desc: 'Smooth, ethereal, calming recovery.', color: '#ec4899' },
];

const HeartbeatLine = () => {
  return (
    <div className="w-full h-8 overflow-hidden relative">
      <svg className="w-full h-full" viewBox="0 0 200 40" preserveAspectRatio="none">
        <motion.path
          d="M0 20 L20 20 L25 10 L30 30 L35 20 L50 20 L55 5 L60 35 L65 20 L80 20 L85 15 L90 25 L95 20 L110 20 L115 10 L120 30 L125 20 L140 20 L145 0 L150 40 L155 20 L170 20 L175 10 L180 30 L185 20 L200 20"
          fill="none"
          stroke="#06b6d4"
          strokeWidth="1.5"
          initial={{ pathOffset: 0 }}
          animate={{ pathOffset: -1 }}
          transition={{ repeat: Infinity, duration: 3, ease: "linear" }}
          strokeDasharray="10 5"
        />
      </svg>
    </div>
  );
};

const CommandCenter: React.FC<CommandCenterProps> = ({ 
  history, 
  selectedVoice, 
  isAcousticSync, 
  isVisualSync, 
  onVoiceChange, 
  onToggleAcoustic, 
  onToggleVisual, 
  onInitiate,
  onAriaToast
}) => {
  const [isDataShredEnabled, setIsDataShredEnabled] = useState(false);
  const [quota, setQuota] = useState(84);

  useEffect(() => {
    // Simulate quota fluctuations
    const timer = setInterval(() => {
      setQuota(prev => Math.max(0, Math.min(100, prev + (Math.random() > 0.5 ? 0.5 : -0.5))));
    }, 5000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="relative w-full h-full flex flex-col p-4 md:p-8 overflow-y-auto overflow-x-hidden box-border custom-scrollbar font-mono bg-black selection:bg-cyan-500 selection:text-black">
      <div className="flex flex-col min-h-full pb-20 max-w-[1200px] mx-auto w-full gap-8 md:gap-12">
        
        {/* Header Terminal Style */}
        <div className="border-l-4 border-cyan-500 pl-4 md:pl-6 py-2">
          <h2 className="text-2xl md:text-5xl font-black italic tracking-tighter uppercase text-white leading-none">
            MIRROR <span className="text-cyan-400">COMMAND_HUB</span>
          </h2>
          <div className="flex items-center gap-4 mt-2">
             <span className="text-[10px] md:text-xs text-white/30 uppercase tracking-[0.2em]">ACCESS_LVL: FORENSIC_ADMIN</span>
             <span className="text-[10px] md:text-xs text-cyan-500/50">|</span>
             <span className="text-[10px] md:text-xs text-white/30 uppercase tracking-[0.2em]">UPLINK: STABLE</span>
          </div>
        </div>

        {/* 4 Core App Utility Modules Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
          
          {/* Module 1: Persistence & Encryption */}
          <div className="liquid-glass rounded-[24px] p-6 border-white/10 bg-black/40 flex flex-col gap-6">
            <div className="flex justify-between items-center">
               <h3 className="text-[10px] font-black uppercase text-cyan-400 tracking-[0.2em]">01_PERSISTENCE_CORE</h3>
               <div className="flex items-center gap-2">
                  <motion.div 
                    animate={{ opacity: [0.2, 1, 0.2] }}
                    transition={{ repeat: Infinity, duration: 2 }}
                    className="w-2 h-2 rounded-full bg-cyan-400 shadow-[0_0_8px_#06b6d4]" 
                  />
                  <span className="text-[9px] text-cyan-400 font-bold">SECURE_BUFFER_v3.2</span>
               </div>
            </div>
            
            <div className="space-y-4">
              <div className="p-3 bg-white/5 border border-white/5 rounded-xl flex justify-between items-center group cursor-pointer hover:border-cyan-500/30 transition-all" onClick={() => setIsDataShredEnabled(!isDataShredEnabled)}>
                <div className="flex flex-col gap-1">
                  <span className="text-[10px] font-black text-white uppercase">Data Shred Protocol</span>
                  <span className="text-[8px] text-white/30 uppercase leading-none">Immediate Volatile Wipe on Exit</span>
                </div>
                <div className={`w-10 h-5 rounded-full border transition-all flex items-center p-1 ${isDataShredEnabled ? 'bg-cyan-500 border-cyan-400' : 'bg-black/40 border-white/20'}`}>
                   <motion.div 
                     animate={{ x: isDataShredEnabled ? 20 : 0 }}
                     className={`w-3 h-3 rounded-full ${isDataShredEnabled ? 'bg-black' : 'bg-white/40'}`} 
                   />
                </div>
              </div>
              <div className="text-[9px] text-white/20 leading-relaxed italic">
                * SYSTEM ADVISORY: Encryption keys are rotated every 300 seconds. Forensic logs are immutable until session termination.
              </div>
            </div>
          </div>

          {/* Module 2: Vitality & API Tracker */}
          <div className="liquid-glass rounded-[24px] p-6 border-white/10 bg-black/40 flex flex-col gap-6">
            <h3 className="text-[10px] font-black uppercase text-violet-400 tracking-[0.2em]">02_VITALITY_KERNEL</h3>
            
            <div className="space-y-6">
               <div className="space-y-2">
                 <div className="flex justify-between text-[9px] font-black text-white/40 uppercase">
                    <span>Backbone Heartbeat</span>
                    <span className="text-cyan-400">GEMINI_3_LINK_OK</span>
                 </div>
                 <HeartbeatLine />
               </div>

               <div className="space-y-2">
                 <div className="flex justify-between text-[9px] font-black text-white/40 uppercase">
                    <span>Neural Credits Remaining</span>
                    <span className="text-violet-400">{quota.toFixed(1)}%</span>
                 </div>
                 <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden border border-white/10">
                   <motion.div 
                     initial={{ width: 0 }}
                     animate={{ width: `${quota}%` }}
                     className="h-full bg-gradient-to-r from-violet-600 to-cyan-500" 
                   />
                 </div>
               </div>
            </div>
          </div>

          {/* Module 3: Multimodal Sync Controls */}
          <div className="liquid-glass rounded-[24px] p-6 border-white/10 bg-black/40 flex flex-col gap-6">
            <h3 className="text-[10px] font-black uppercase text-white/40 tracking-[0.2em]">03_SENSOR_UPLINK</h3>
            
            <div className="grid grid-cols-2 gap-4">
              <button 
                onClick={onToggleAcoustic}
                className={`flex flex-col items-center gap-3 p-4 rounded-2xl border transition-all ${isAcousticSync ? 'border-cyan-500 bg-cyan-500/10' : 'border-white/10 bg-white/5 opacity-40'}`}
              >
                <svg className={`w-6 h-6 ${isAcousticSync ? 'text-cyan-400' : 'text-white/20'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" /></svg>
                <span className="text-[9px] font-black uppercase">Acoustic Override</span>
              </button>
              <button 
                onClick={onToggleVisual}
                className={`flex flex-col items-center gap-3 p-4 rounded-2xl border transition-all ${isVisualSync ? 'border-cyan-500 bg-cyan-500/10' : 'border-white/10 bg-white/5 opacity-40'}`}
              >
                <svg className={`w-6 h-6 ${isVisualSync ? 'text-cyan-400' : 'text-white/20'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
                <span className="text-[9px] font-black uppercase">Visual Uplink</span>
              </button>
            </div>
            <p className="text-[8px] text-white/30 text-center uppercase tracking-widest">Toggle adaptive modalities for forensic precision.</p>
          </div>

          {/* Module 4: Export & Relay Hub */}
          <div className="liquid-glass rounded-[24px] p-6 border-white/10 bg-black/40 flex flex-col gap-6">
            <h3 className="text-[10px] font-black uppercase text-white/40 tracking-[0.2em]">04_RELAY_INTERFACE</h3>
            
            <div className="flex-1 flex items-center justify-between px-2">
              <button 
                onClick={() => onAriaToast("PDF Audit Initialized")}
                className="group flex flex-col items-center gap-3"
              >
                <div className="w-12 h-12 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center group-hover:border-cyan-500 group-hover:bg-cyan-500/20 group-hover:shadow-[0_0_20px_rgba(6,182,212,0.3)] transition-all">
                  <svg className="w-5 h-5 text-white/40 group-hover:text-cyan-400 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" /></svg>
                </div>
                <span className="text-[8px] font-bold text-white/20 group-hover:text-cyan-400 transition-colors uppercase">PDF_Audit</span>
              </button>

              <div className="w-px h-10 bg-white/5" />

              <button 
                onClick={() => onAriaToast("Broadcast Signal Prepared")}
                className="group flex flex-col items-center gap-3"
              >
                <div className="w-12 h-12 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center group-hover:border-violet-500 group-hover:bg-violet-500/20 group-hover:shadow-[0_0_20px_rgba(139,92,246,0.3)] transition-all">
                   <svg className="w-5 h-5 text-white/40 group-hover:text-violet-400 transition-colors" fill="currentColor" viewBox="0 0 24 24"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm1.161 17.52h1.833L7.045 4.126H5.078z"/></svg>
                </div>
                <span className="text-[8px] font-bold text-white/20 group-hover:text-violet-400 transition-colors uppercase">X-Relay</span>
              </button>

              <div className="w-px h-10 bg-white/5" />

              <button 
                onClick={() => onAriaToast("Cloud Matrix Synced")}
                className="group flex flex-col items-center gap-3"
              >
                <div className="w-12 h-12 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center group-hover:border-amber-500 group-hover:bg-amber-500/20 group-hover:shadow-[0_0_20px_rgba(245,158,11,0.3)] transition-all">
                  <svg className="w-5 h-5 text-white/40 group-hover:text-amber-400 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 15a4 4 0 004 4h9a5 5 0 10-.1-9.999 5.002 5.002 0 10-9.78 2.096A4.001 4.001 0 003 15z" /></svg>
                </div>
                <span className="text-[8px] font-bold text-white/20 group-hover:text-amber-400 transition-colors uppercase">Cloud_Sync</span>
              </button>
            </div>
            
            <div className="bg-cyan-500/10 border border-cyan-500/20 rounded-xl p-2 text-center">
               <span className="text-[8px] font-black text-cyan-400 uppercase animate-pulse">Relay_Node: Standby for Uplink</span>
            </div>
          </div>
        </div>

        {/* Voice Identity Selector - Terminal Refined */}
        <div className="space-y-6 pb-10">
          <div className="flex justify-between items-end border-b border-white/5 pb-2">
            <div>
              <h3 className="text-[10px] font-black uppercase text-white/40 tracking-[0.3em]">ACOUSTIC_PERSONALITY_MATRIX</h3>
              <p className="text-[8px] text-cyan-500/50 font-mono uppercase mt-1">Select synaptic voice identity</p>
            </div>
            <button 
              onClick={onInitiate}
              className="px-6 py-2 rounded-full bg-cyan-500 text-black text-[10px] font-black uppercase tracking-widest shadow-[0_0_20px_rgba(6,182,212,0.4)] active:scale-95 transition-all"
            >
              Initialize Link
            </button>
          </div>
          
          <div className="flex flex-nowrap md:grid md:grid-cols-5 gap-4 overflow-x-auto pb-4 custom-scrollbar">
            {VOICE_IDENTITIES.map((voice) => (
              <button
                key={voice.id}
                onClick={() => onVoiceChange(voice.id)}
                className={`relative flex-shrink-0 w-[200px] md:w-auto p-4 rounded-2xl border transition-all text-left flex flex-col gap-3 group ${
                  selectedVoice === voice.id 
                    ? 'bg-cyan-500/5 border-cyan-500/50 shadow-[0_10px_30px_rgba(6,182,212,0.1)]' 
                    : 'border-white/5 bg-black/40 hover:border-white/20'
                }`}
              >
                <div className="flex justify-between items-start">
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center bg-black border ${selectedVoice === voice.id ? 'border-cyan-500' : 'border-white/10'}`}>
                    <svg className="w-4 h-4" style={{ color: selectedVoice === voice.id ? voice.color : '#666' }} fill="currentColor" viewBox="0 0 24 24">
                      <path d="M12 14c1.66 0 3-1.34 3-3V5c0-1.66-1.34-3-3-3S9 3.34 9 5v6c0 1.66 1.34 3 3 3z"/>
                      <path d="M17 11c0 2.76-2.24 5-5 5s-5-2.24-5-5H5c0 3.53 2.61 6.43 6 6.92V21h2v-3.08c3.39-.49 6-3.39 6-6.92h-2z"/>
                    </svg>
                  </div>
                  {selectedVoice === voice.id && <div className="text-[7px] font-black bg-cyan-500 text-black px-1.5 rounded uppercase">Active</div>}
                </div>
                <div>
                  <div className={`text-[10px] font-black uppercase ${selectedVoice === voice.id ? 'text-cyan-400' : 'text-white/60'}`}>{voice.id}</div>
                  <div className="text-[8px] text-white/30 leading-tight mt-1 line-clamp-2 italic">{voice.desc}</div>
                </div>
                <div className="flex gap-1 h-4 items-end opacity-20 group-hover:opacity-100 transition-all">
                   {[...Array(8)].map((_, i) => (
                     <motion.div 
                       key={i}
                       animate={selectedVoice === voice.id ? { height: [2, 12, 2] } : { height: 2 }}
                       transition={{ repeat: Infinity, duration: 0.5 + Math.random(), delay: i * 0.1 }}
                       className="flex-1 rounded-full"
                       style={{ backgroundColor: voice.color }}
                     />
                   ))}
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CommandCenter;