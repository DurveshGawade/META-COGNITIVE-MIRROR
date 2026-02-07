import React from 'react';
import { motion } from 'framer-motion';

interface AboutOverlayProps {
  onClose: () => void;
}

const FeatureCard: React.FC<{ title: string; desc: string; icon: React.ReactNode }> = ({ title, desc, icon }) => (
  <motion.div 
    whileHover={{ y: -5, scale: 1.02 }}
    className="liquid-glass p-6 rounded-[32px] border border-white/5 flex flex-col gap-4 group h-full"
  >
    <div className="w-12 h-12 rounded-2xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-cyan-400 group-hover:bg-cyan-500 group-hover:text-black transition-all shadow-[0_0_15px_rgba(6,182,212,0.1)]">
      {icon}
    </div>
    <div className="space-y-2">
      <h4 className="text-[11px] font-black uppercase tracking-widest text-white group-hover:text-cyan-400 transition-colors">{title}</h4>
      <p className="text-[10px] text-white/40 leading-relaxed italic">{desc}</p>
    </div>
  </motion.div>
);

const AboutOverlay: React.FC<AboutOverlayProps> = ({ onClose }) => {
  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[10005] bg-black/95 backdrop-blur-3xl flex items-center justify-center p-4 md:p-8"
    >
      <div className="w-full max-w-7xl h-full max-h-[900px] flex flex-col liquid-glass rounded-[48px] md:rounded-[64px] border border-cyan-500/20 overflow-hidden shadow-[0_0_100px_rgba(0,0,0,1)]">
        <div className="p-8 md:p-12 border-b border-white/5 flex justify-between items-start shrink-0">
          <div className="space-y-2">
            <div className="flex items-center gap-3">
              <span className="w-1.5 h-1.5 rounded-full bg-cyan-500 animate-ping" />
              <h2 className="text-[10px] md:text-xs font-black uppercase tracking-[0.4em] text-cyan-400 font-mono">NEURAL_FORENSIC_LINK: v7.0.4</h2>
            </div>
            <h1 className="text-3xl md:text-6xl font-black italic tracking-tighter uppercase text-white leading-none">THE <span className="text-cyan-400">MISSION MANIFEST</span></h1>
          </div>
          <button 
            onClick={onClose}
            className="group p-4 md:p-5 rounded-full border border-cyan-500/30 text-cyan-400 hover:bg-cyan-500 hover:text-black transition-all shadow-[0_0_20px_rgba(6,182,212,0.2)]"
          >
            <svg className="w-6 h-6 md:w-8 md:h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" /></svg>
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-8 md:p-12 space-y-16 custom-scrollbar">
          <section className="max-w-5xl space-y-6">
            <p className="text-lg md:text-3xl text-white font-light leading-relaxed italic">
              Meta-Cognitive Mirror is a high-precision <span className="text-cyan-400 font-bold uppercase tracking-widest text-shadow-glow">Neural Forensic Pipeline</span> engineered to establish absolute parity across human expression. We leverage the Gemini 3 Pro backbone to achieve sub-millimeter kinetic auditing and total linguistic transparency.
            </p>
            <div className="flex gap-4">
               <span className="px-4 py-2 rounded-full border border-white/10 text-[9px] font-black uppercase tracking-[0.3em] text-white/30">Latency: 12ms</span>
               <span className="px-4 py-2 rounded-full border border-cyan-500/30 text-[9px] font-black uppercase tracking-[0.3em] text-cyan-400 bg-cyan-500/5">G3_PRO_CORE: ACTIVE</span>
            </div>
          </section>

          <section className="space-y-10">
            <div className="flex items-center gap-6">
              <h3 className="text-xs md:text-sm font-black uppercase tracking-[0.4em] text-cyan-400">CORE_FORENSIC_MANIFEST</h3>
              <div className="flex-1 h-px bg-white/5" />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <FeatureCard 
                title="Mirror Core" 
                desc="High-precision behavioral auditing isolating neural-kinetic nodes to track focus, stress, and professional flow with forensic accuracy." 
                icon={<svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>}
              />
              <FeatureCard 
                title="Sign Converter" 
                desc="Real-time translation of kinetic gestures into fluent narrative text using high-speed reasoning buffers." 
                icon={<svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" /></svg>}
              />
              <FeatureCard 
                title="3D Studio" 
                desc="Kinematic performance synthesis mapping raw linguistic tokens to high-fidelity obsidian avatar archetypes." 
                icon={<svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 10l-2 1m0 0l-2-1m2 1v2.5M20 7l-2 1m2-1l-2-1m2 1v2.5M14 4l-2-1-2 1M4 7l2-1M4 7l2 1M4 7v2.5M12 21l-2-1m2 1l2-1m-2 1v-2.5M6 18l-2-1v-2.5M18 18l2-1v-2.5" /></svg>}
              />
              <FeatureCard 
                title="FormBridge" 
                desc="Document parity deconstructing complex administrative and legal forms into kinetic performance summaries." 
                icon={<svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>}
              />
              <FeatureCard 
                title="CrisisSign" 
                desc="Bidirectional emergency SOS uplink providing real-time situational awareness and parity during extreme protocols." 
                icon={<svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>}
              />
              <FeatureCard 
                title="LearnPath" 
                desc="Dynamic neural curriculum utilizing sub-millimeter evaluation to master professional linguistic kinetic patterns." 
                icon={<svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" /></svg>}
              />
              <FeatureCard 
                title="Evolution Lab" 
                desc="Autonomous R&D engine auditing history to identify weak links and optimize unique professional signatures." 
                icon={<svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.675.27a6 6 0 01-3.86.517l-3.158-.632a2 2 0 01-1.405-2.617l1.045-3.134a2 2 0 012.617-1.405l3.158.632a6 6 0 003.86-.517l.675-.27a6 6 0 013.86-.517l2.387.477a2 2 0 011.022.547l3.485 3.485a2 2 0 010 2.828l-3.485 3.485z" /></svg>}
              />
              <FeatureCard 
                title="Audit Lexicon" 
                desc="Deep-dive forensic transcription isolating dialogue and environmental acoustic markers from high-fidelity archives." 
                icon={<svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" /></svg>}
              />
            </div>
          </section>

          <footer className="pt-12 flex flex-col items-center gap-6 text-center">
            <div className="px-10 py-8 rounded-[40px] bg-cyan-500/5 border border-cyan-500/20 max-w-2xl relative overflow-hidden group">
               <div className="absolute inset-0 bg-cyan-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-1000" />
               <p className="text-[13px] md:text-[15px] text-white leading-relaxed italic uppercase tracking-wider font-medium relative z-10">
                 "In an era of deep-fake noise, the Mirror provides the only definitive forensic audit of Human Intent. We are the bridge to the next epoch of parity."
               </p>
            </div>
            <div className="flex gap-8 mt-4 opacity-30 hover:opacity-100 transition-opacity">
               <span className="text-[9px] font-mono text-white uppercase tracking-[0.5em]">PROTOCOL_STABLE_v7.0.4</span>
               <span className="text-[9px] font-mono text-cyan-400 uppercase tracking-[0.5em]">CERTIFIED_NEURAL_LINK</span>
            </div>
          </footer>
        </div>

        <div className="p-8 md:p-12 border-t border-white/5 bg-black/40 shrink-0">
          <button 
            onClick={onClose}
            className="w-full py-6 rounded-[32px] md:rounded-[40px] bg-cyan-500 text-black font-black italic uppercase tracking-[0.4em] text-[11px] md:text-sm hover:scale-[1.01] active:scale-95 transition-all shadow-2xl shadow-cyan-500/30"
          >
            ACKNOWLEDGE_MANIFEST
          </button>
        </div>
      </div>
    </motion.div>
  );
};

export default AboutOverlay;