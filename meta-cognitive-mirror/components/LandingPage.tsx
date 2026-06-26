import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence, useScroll, useSpring } from 'framer-motion';

interface FeaturePoint {
  label: string;
  description: string;
}

interface BentoCardProps {
  title: string;
  subtitle: string;
  points: FeaturePoint[];
  color: string;
  icon: string;
}

const FuturisticEye: React.FC = () => {
  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 1.5, ease: "easeOut" }}
      className="relative w-48 h-48 md:w-64 md:h-64 mx-auto mb-8 flex items-center justify-center pointer-events-none"
    >
      <motion.div 
        animate={{ 
          scale: [1, 1.1, 1],
          opacity: [0.3, 0.6, 0.3],
          rotate: 360
        }}
        transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
        className="absolute inset-0 rounded-full border border-cyan-500/20 blur-md shadow-[0_0_50px_rgba(6,182,212,0.2)]"
      />
      <motion.div 
        animate={{ rotate: 360 }}
        transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
        className="absolute inset-4 rounded-full border-t-2 border-r-2 border-transparent border-t-cyan-500/40 border-r-cyan-500/40"
      />
      <motion.div 
        animate={{ rotate: -360 }}
        transition={{ duration: 12, repeat: Infinity, ease: "linear" }}
        className="absolute inset-8 rounded-full border-b-2 border-l-2 border-transparent border-b-violet-500/40 border-l-violet-500/40"
      />
      <div className="relative w-32 h-32 md:w-40 md:h-40 rounded-full bg-black/60 backdrop-blur-xl border border-white/10 flex items-center justify-center overflow-hidden shadow-2xl">
        <motion.div 
          animate={{ scale: [1, 1.05, 1] }}
          transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
          className="absolute inset-2 rounded-full border border-cyan-500/10 forensic-grid opacity-30" 
        />
        <motion.div 
          animate={{ top: ['-10%', '110%'] }}
          transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
          className="absolute left-0 right-0 h-px bg-gradient-to-r from-transparent via-cyan-400 to-transparent z-20 shadow-[0_0_15px_#06b6d4]"
        />
        <motion.div 
          className="relative w-12 h-12 md:w-16 md:h-16 rounded-full bg-white flex items-center justify-center shadow-[0_0_30px_white]"
        >
          <div className="w-4 h-4 md:w-6 md:h-6 rounded-full bg-black" />
          <motion.div 
            animate={{ 
              x: [-4, 4, -4],
              y: [-2, 2, -2]
            }}
            transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
            className="absolute inset-0 rounded-full bg-cyan-500/40 blur-sm"
          />
        </motion.div>
        <motion.div 
          animate={{ height: ['0%', '0%', '51%', '0%', '0%'] }}
          transition={{ 
            duration: 0.25, 
            repeat: Infinity, 
            repeatDelay: 4,
            times: [0, 0.4, 0.5, 0.6, 1]
          }}
          className="absolute inset-x-0 top-0 bg-[#050505] border-b border-cyan-500/40 z-30 origin-top shadow-[0_5px_15px_rgba(6,182,212,0.1)]"
        />
        <motion.div 
          animate={{ height: ['0%', '0%', '51%', '0%', '0%'] }}
          transition={{ 
            duration: 0.25, 
            repeat: Infinity, 
            repeatDelay: 4,
            times: [0, 0.4, 0.5, 0.6, 1]
          }}
          className="absolute inset-x-0 bottom-0 bg-[#050505] border-t border-cyan-500/40 z-30 origin-bottom shadow-[0_-5px_15px_rgba(6,182,212,0.1)]"
        />
      </div>
      <div className="absolute -left-12 top-1/2 -translate-y-1/2 flex flex-col items-end gap-1 opacity-40">
        <span className="text-[7px] font-mono text-cyan-400 uppercase tracking-widest">SCAN_STB</span>
        <div className="w-8 h-px bg-cyan-500/40" />
      </div>
      <div className="absolute -right-12 top-1/2 -translate-y-1/2 flex flex-col items-start gap-1 opacity-40">
        <span className="text-[7px] font-mono text-violet-400 uppercase tracking-widest">LOCK_VRF</span>
        <div className="w-8 h-px bg-violet-500/40" />
      </div>
    </motion.div>
  );
};

const CardStatusFlux: React.FC<{ color: string }> = ({ color }) => (
  <div className="absolute top-0 left-0 right-0 h-[2px] overflow-hidden bg-white/5">
    <motion.div 
      animate={{ x: ['-100%', '100%'] }}
      transition={{ repeat: Infinity, duration: 3, ease: "linear" }}
      className="w-1/2 h-full opacity-50"
      style={{ background: `linear-gradient(90deg, transparent, ${color}, transparent)` }}
    />
  </div>
);

const AdvancedBentoCard: React.FC<BentoCardProps> = ({ title, subtitle, points, color, icon }) => (
  <motion.div 
    whileHover={{ y: -10, scale: 1.01 }}
    className="liquid-glass p-8 md:p-10 rounded-[48px] border border-white/10 group relative overflow-hidden flex flex-col gap-8 bg-black/40 h-full"
  >
    <CardStatusFlux color={color} />
    <div className="absolute inset-0 opacity-0 group-hover:opacity-10 transition-opacity duration-1000" 
         style={{ background: `radial-gradient(circle at 0% 0%, ${color}, transparent 70%)` }} />
    <div className="relative z-10 flex justify-between items-start">
      <div className="space-y-2">
        <div className="flex items-center gap-4">
          <div className="p-3 rounded-xl bg-white/5 border border-white/10 text-white group-hover:scale-110 transition-transform" style={{ color }}>
            <span className="text-xl">{icon}</span>
          </div>
          <h4 className="text-xl md:text-2xl font-black uppercase tracking-tighter text-white">{title}</h4>
        </div>
        <p className="text-[10px] font-mono uppercase tracking-[0.4em] text-white/30 italic">{subtitle}</p>
      </div>
    </div>
    <div className="relative z-10 space-y-4 flex-1">
      {points.map((point, i) => (
        <div key={i} className="flex flex-col gap-1 p-4 rounded-[24px] bg-white/[0.03] border border-white/5 group-hover:border-white/10 transition-all">
          <div className="flex items-center gap-2">
            <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: color }} />
            <span className="text-xs font-black uppercase tracking-widest text-white/90">{point.label}</span>
          </div>
          <p className="text-xs text-white/40 leading-relaxed font-normal italic">{point.description}</p>
        </div>
      ))}
    </div>
  </motion.div>
);

const LogicBento: React.FC<{ 
  title: string; 
  problem: string; 
  solution: string; 
  hook: string; 
  color: string;
}> = ({ title, problem, solution, hook, color }) => (
  <motion.div 
    whileHover={{ y: -5 }}
    className="liquid-glass rounded-[48px] border border-white/10 overflow-hidden flex flex-col h-full bg-black/40 group transition-all duration-500 hover:border-white/20 relative"
  >
    <CardStatusFlux color={color} />
    <div className="p-8 border-b border-white/5 bg-white/[0.02]">
       <div className="flex items-center gap-4 mb-2">
          <div className="w-2 h-2 rounded-full shadow-[0_0_10px_currentcolor] animate-pulse" style={{ color }} />
          <h3 className="text-lg font-black uppercase tracking-widest text-white">{title}: System Logic</h3>
       </div>
    </div>
    <div className="p-8 flex-1 flex flex-col gap-6">
       <div className="space-y-2">
          <span className="text-[8px] font-black uppercase text-red-500/60 border border-red-500/20 px-2 py-0.5 rounded-full">Problem</span>
          <p className="text-sm text-white/50 italic leading-relaxed">{problem}</p>
       </div>
       <div className="space-y-2">
          <span className="text-[8px] font-black uppercase text-cyan-400/60 border border-cyan-400/20 px-2 py-0.5 rounded-full">Solution</span>
          <p className="text-sm text-white/80 font-medium leading-relaxed uppercase tracking-tight">{solution}</p>
       </div>
       <div className="mt-auto pt-6 border-t border-white/5">
          <span className="text-[8px] font-black uppercase text-purple-400 bg-purple-400/10 px-3 py-1 rounded-full mb-2 inline-block">Gemini 3 Flash Hook</span>
          <p className="text-xs text-purple-200/60 leading-relaxed font-mono italic">{hook}</p>
       </div>
    </div>
  </motion.div>
);

const SectionHeader: React.FC<{ title: string; subtitle: string; color: string }> = ({ title, subtitle, color }) => (
  <div className="mb-16 space-y-6">
    <div className="flex items-center gap-6">
      <motion.span initial={{ x: -20, opacity: 0 }} whileInView={{ x: 0, opacity: 1 }} className="px-6 py-2 rounded-full border text-[10px] font-mono font-black uppercase tracking-[0.6em]" style={{ borderColor: `${color}44`, color, backgroundColor: `${color}11` }}>
        ACTIVE_MODULE_v9.5
      </motion.span>
      <div className="flex-1 h-px bg-white/5" />
    </div>
    <h2 className="text-5xl md:text-8xl font-black italic uppercase tracking-tighter text-white leading-[0.8]">
      {title} <br /> <span style={{ color }}>{subtitle}</span>
    </h2>
  </div>
);

const ModuleSection: React.FC<{
  id: string;
  title: string;
  subtitle: string;
  description: string;
  color: string;
  problem: string;
  solution: string;
  hook: string;
  features: { title: string; subtitle: string; icon: string; points: FeaturePoint[] }[];
  onLaunch: () => void;
}> = ({ id, title, subtitle, description, color, problem, solution, hook, features, onLaunch }) => (
  <section id={id} className="min-h-screen snap-start py-40 px-8 bg-black relative border-b border-white/5">
    <div className="max-w-[1700px] mx-auto space-y-20">
      <div className="grid lg:grid-cols-12 gap-20 items-center">
        <div className="lg:col-span-7">
          <SectionHeader title={title} subtitle={subtitle} color={color} />
          <p className="text-xl md:text-3xl font-light text-white/60 italic leading-relaxed max-w-4xl">{description}</p>
        </div>
        <div className="lg:col-span-5">
           <LogicBento title={title} color={color} problem={problem} solution={solution} hook={hook} />
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
        {features.map((f, i) => (
          <AdvancedBentoCard key={i} title={f.title} subtitle={f.subtitle} color={color} icon={f.icon} points={f.points} />
        ))}
      </div>
      <button onClick={onLaunch} className="w-full h-24 rounded-[48px] bg-white/5 border border-white/10 text-white font-black uppercase tracking-[1em] italic text-sm hover:bg-white hover:text-black transition-all shadow-2xl">
        Launch {title} Protocol
      </button>
    </div>
  </section>
);

const ImpactCard: React.FC<{ title: string; category: string; description: string; color: string; icon: string }> = ({ title, category, description, color, icon }) => (
  <motion.div whileHover={{ scale: 1.02 }} className="liquid-glass p-12 rounded-[64px] border border-white/10 relative overflow-hidden flex flex-col gap-8 bg-black/40 h-full group">
    <CardStatusFlux color={color} />
    <div className="absolute top-0 right-0 p-12 opacity-5 text-9xl font-black italic select-none group-hover:opacity-10 transition-opacity" style={{ color }}>{icon}</div>
    <div className="relative z-10 space-y-4">
      <div className="px-4 py-1 rounded-full border text-[10px] font-black uppercase tracking-widest inline-block" style={{ borderColor: `${color}44`, color, backgroundColor: `${color}11` }}>{category}</div>
      <h3 className="text-3xl md:text-5xl font-black italic uppercase text-white tracking-tighter leading-tight">{title}</h3>
    </div>
    <p className="relative z-10 text-lg md:text-xl font-light text-white/50 italic leading-relaxed">{description}</p>
  </motion.div>
);

const FAQItem: React.FC<{ question: string; answer: string; index: number }> = ({ question, answer, index }) => {
  const [isOpen, setIsOpen] = useState(false);
  return (
    <motion.div className={`liquid-glass rounded-[40px] border border-white/5 overflow-hidden transition-all duration-500 ${isOpen ? 'border-cyan-500/30 bg-white/[0.02]' : 'hover:border-white/20'}`}>
      <button onClick={() => setIsOpen(!isOpen)} className="w-full p-10 md:p-14 flex items-center justify-between gap-8 text-left">
        <div className="flex items-center gap-8">
           <span className="text-2xl md:text-3xl font-black font-mono text-white/10 uppercase italic">0{index + 1}</span>
           <h4 className="text-xl md:text-3xl font-black uppercase tracking-tighter text-white/90">{question}</h4>
        </div>
        <div className={`p-4 rounded-full border border-white/10 transition-all duration-500 ${isOpen ? 'rotate-180 bg-cyan-500 text-black' : 'text-white/40'}`}>
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M19 9l-7 7-7-7" /></svg>
        </div>
      </button>
      <AnimatePresence>
        {isOpen && (
          <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.5 }}>
            <div className="px-10 pb-10 md:px-14 md:pb-14 md:ml-20 border-t border-white/5 pt-10">
               <p className="text-lg md:text-2xl font-light text-white/60 leading-relaxed italic max-w-4xl">{answer}</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

const LandingPage: React.FC<{ onLaunch: (tab: any) => void, onOpenMission: () => void }> = ({ onLaunch, onOpenMission }) => {
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, { stiffness: 100, damping: 30 });
  const [showScrollTop, setShowScrollTop] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setShowScrollTop(window.scrollY > 800);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="relative w-full bg-[#010103] text-white font-inter selection:bg-cyan-500 selection:text-black snap-y snap-proximity scroll-smooth">
      <motion.div className="fixed top-0 left-0 right-0 h-2 bg-cyan-500 z-[6000] origin-left shadow-[0_0_30px_#06b6d4]" style={{ scaleX }} />

      <section className="min-h-screen snap-start flex flex-col items-center justify-center relative px-8 overflow-hidden">
        <div className="absolute top-28 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 z-[100]">
          <h1 className="text-2xl font-black italic tracking-[0.5em] text-white uppercase leading-none drop-shadow-[0_0_15px_rgba(255,255,255,0.3)]">META-COGNITIVE MIRROR</h1>
          <div className="h-px w-64 bg-cyan-500/40 shadow-[0_0_10px_#06b6d4]" />
        </div>
        <div className="absolute inset-0 forensic-grid opacity-30 pointer-events-none" />
        <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }} className="text-center space-y-8 z-20 mt-20 flex flex-col items-center">
          <FuturisticEye />
          <div className="space-y-4">
            <h1 className="text-6xl md:text-[10.5rem] font-black italic tracking-tighter uppercase leading-[0.8] shimmer">NEURAL HUD.</h1>
            <p className="text-2xl md:text-4xl text-white/80 font-light italic tracking-tight max-w-5xl mx-auto leading-tight">
              A high-precision behavioral pipeline establishing absolute parity across human intent, industrial focus, and linguistic kinetic streams.
            </p>
          </div>
          <div className="flex flex-col md:flex-row gap-8 justify-center items-center mt-12">
            <button 
              onClick={onOpenMission}
              className="px-20 py-8 rounded-full border-2 border-cyan-500 text-cyan-400 font-black uppercase tracking-[0.5em] italic text-sm hover:bg-cyan-500 hover:text-black transition-all shadow-[0_0_50px_rgba(6,182,212,0.2)]"
            >
              MISSION_MANIFEST
            </button>
          </div>
        </motion.div>
      </section>

      <section id="deep-explanation" className="min-h-screen snap-start py-60 px-8 bg-[#020204]">
        <div className="max-w-[1700px] mx-auto space-y-32">
          <div className="text-center space-y-8">
            <span className="text-[10px] font-black text-cyan-400 uppercase tracking-[1em] mb-4 block">SYSTEM_ARCHITECTURE_v9.5</span>
            <h2 className="text-5xl md:text-8xl font-black italic tracking-tighter uppercase text-white leading-none">THE TOTALITY OF <span className="text-cyan-400">THE MIRROR</span></h2>
            <p className="text-xl md:text-3xl text-white/40 italic font-light max-w-6xl mx-auto leading-relaxed">
              Meta-Cognitive Mirror is an integrated neural environment. From real-time industrial focus auditing and multi-signer group orchestration to forensic document reconstruction and sub-millimeter kinetic education, our pipeline utilizes Gemini 3 Flash to ensure no professional intent remains invisible.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
             <div className="liquid-glass p-12 rounded-[56px] border-white/10 space-y-8 relative overflow-hidden">
                <CardStatusFlux color="#06b6d4" />
                <h3 className="text-3xl font-black italic text-white uppercase">AUDIT STACK</h3>
                <p className="text-lg text-white/50 italic leading-relaxed">Isolates focus indicators, posture geometry, and acoustic markers to generate an immutable record of professional engagement and deep-work depth.</p>
             </div>
             <div className="liquid-glass p-12 rounded-[56px] border-white/10 space-y-8 bg-cyan-500/5 relative overflow-hidden">
                <CardStatusFlux color="#06b6d4" />
                <h3 className="text-3xl font-black italic text-white uppercase">KINETIC STACK</h3>
                <p className="text-lg text-white/50 italic leading-relaxed">Deconstructs signing performance into neural tokens, enabling real-time translation, 3D kinematic studio rendering, and adaptive skill curriculum.</p>
             </div>
             <div className="liquid-glass p-12 rounded-[56px] border-white/10 space-y-8 relative overflow-hidden">
                <CardStatusFlux color="#06b6d4" />
                <h3 className="text-3xl font-black italic text-white uppercase">PARITY STACK</h3>
                <p className="text-lg text-white/50 italic leading-relaxed">Reconstructs complex regulatory and legal intent into accessible kinetic performance, bridging the gap between technical jargon and comprehension.</p>
             </div>
          </div>
        </div>
      </section>

      <section className="min-h-screen snap-start py-60 px-8 bg-black relative border-y border-white/5">
        <div className="max-w-[1700px] mx-auto space-y-24">
          <div className="grid lg:grid-cols-12 gap-20 items-center">
            <div className="lg:col-span-7">
               <div className="mb-12 space-y-6">
                 <div className="flex items-center gap-6">
                   <span className="px-6 py-2 rounded-full border border-purple-500/40 bg-purple-500/11 text-[10px] font-mono font-black uppercase tracking-[0.6em] text-purple-400">
                     NEURAL_LINK_AGENT_v2.0
                   </span>
                   <div className="flex-1 h-px bg-white/5" />
                 </div>
                 <h2 className="text-5xl md:text-8xl font-black italic uppercase tracking-tighter text-white leading-[0.8]">
                   MEET <span className="text-purple-400">ARIA</span>
                 </h2>
               </div>
               <p className="text-xl md:text-3xl font-light text-white/60 italic leading-relaxed max-w-4xl">
                 ARIA is our integrated Neural Forensic Link Agent. Available across every module, ARIA provides real-time logical audits, voice-synthesized insights, and autonomous trajectory corrections during live professional engagement.
               </p>
            </div>
            <div className="lg:col-span-5">
               <LogicBento 
                 title="ARIA AGENT" 
                 color="#a855f7" 
                 problem="Disconnected data streams require constant manual interpretation, leading to critical cognitive oversight." 
                 solution="A persistent forensic dialogue unit that links multi-modal sensors into a singular conversational intent buffer." 
                 hook="Utilizes G3-Pro's advanced reasoning to provide sub-100ms conversational audits of visual and acoustic performance data."
               />
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
            <AdvancedBentoCard 
              title="Synaptic Link" subtitle="conversational_hub" icon="💬" color="#a855f7" 
              points={[{ label: "Natural Inquiry", description: "Query live neural links via standard dialogue" }, { label: "Context Buffer", description: "Remembers previous session trajectories" }]} 
            />
            <AdvancedBentoCard 
              title="Logic Trace" subtitle="forensic_reasoning" icon="🧠" color="#a855f7" 
              points={[{ label: "Audit Output", description: "Verbalizes why focus drifted or peaked" }, { label: "Discrepancy Flag", description: "Calls out intent-action mismatches" }]} 
            />
            <AdvancedBentoCard 
              title="Voice Matrix" subtitle="synaptic_speech" icon="🎙️" color="#a855f7" 
              points={[{ label: "Multi-Identity", description: "Select from 5 synaptic voice profiles" }, { label: "Emotional Pacing", description: "Speech cadence matches session intensity" }]} 
            />
            <AdvancedBentoCard 
              title="Command Hub" subtitle="autonomous_ops" icon="⚙️" color="#a855f7" 
              points={[{ label: "Auto-Nav", description: "Navigate system protocols via voice" }, { label: "Crisis Sync", description: "Automates SOS relay during emergencies" }]} 
            />
          </div>
        </div>
      </section>

      <ModuleSection 
        id="mirror-core" title="MIRROR CORE:" subtitle="Focus HUD" color="#06b6d4"
        description="Audits posture and focus nodes to track work depth, stress, and professional flow with high precision."
        problem="Remote output is compromised by micro-distractions and autonomic load spikes that remain unmeasured by standard tools."
        solution="Real-time behavioral overlays that visualize cognitive engagement depth directly over active video feeds for objective auditing."
        hook="Gemini 3 Flash's multimodal tokens analyze posture geometry and facial intensity to detect focus-drift in under 100ms."
        onLaunch={() => onLaunch('mirror')}
        features={[
          { title: "Waveform", subtitle: "focus_flux", icon: "📈", points: [{ label: "Live Pulse", description: "Real-time attention tracking" }, { label: "Drift Alert", description: "Detects focus interruption" }] },
          { title: "Optic Link", subtitle: "gaze_sync", icon: "👁️", points: [{ label: "Zonal Path", description: "Tracks visual engagement" }, { label: "Attention Map", description: "Quantifies work depth" }] },
          { title: "Stress Log", subtitle: "autonomic", icon: "🧠", points: [{ label: "Resonance", description: "Biometric load calculation" }, { label: "Limit Flag", description: "Warns of persistent load spikes" }] },
          { title: "Dossier", subtitle: "audit_gen", icon: "📋", points: [{ label: "Logic Trace", description: "Reasoning logs of performance" }, { label: "Next Steps", description: "Improvement roadmap" }] }
        ]}
      />

      <ModuleSection 
        id="interpreter" title="CONVERTER:" subtitle="Kinetic Text" color="#f59e0b"
        description="Real-time translation of kinetic gestures into fluent narrative text using high-speed reasoning buffers."
        problem="Linguistic intensity and movement velocity markers are often lost in basic gesture-to-text models, leading to loss of context."
        solution="A high-fidelity conversion engine that treats gesture as primary multimodal tokens for narrative synthesis."
        hook="Gemini 3 Flash's 1M context window buffers gesture sequences to reconstruct grammatical structures instantly."
        onLaunch={() => onLaunch('interpreter')}
        features={[
          { title: "Capture Rig", subtitle: "kinetic", icon: "🎭", points: [{ label: "Gesture Sync", description: "High-cadence frame ingestion" }, { label: "Velocity Map", description: "Tracks performance intensity" }] },
          { title: "Token Chain", subtitle: "gloss", icon: "🔗", points: [{ label: "Glossing", description: "Identifies core lexical units" }, { label: "Logic Chain", description: "Sequence verification engine" }] },
          { title: "Synthesis", subtitle: "narrative", icon: "✍️", points: [{ label: "Fluent Recon", description: "Natural language reconstruction" }, { label: "Context Lock", description: "Adaptive domain tuning" }] },
          { title: "Global Hub", subtitle: "variants", icon: "🌐", points: [{ label: "Variant Support", description: "ASL, BSL, ISL, and more" }, { label: "Dialect Scan", description: "Detects regional sign nuances" }] }
        ]}
      />

      <ModuleSection 
        id="converter" title="3D STUDIO:" subtitle="Kinematic Rig" color="#f97316"
        description="Synthesizes kinematic obsidian avatar archetypes from raw linguistic input tokens for performance auditing."
        problem="Static dictionaries lack the 3D spatial clarity required for learning complex kinematic movement and articulation."
        solution="A generative 3D stage that renders perfect linguistic archetypes using high-contrast humanoid filaments."
        hook="Gemini 3 Flash's prompts are refined via 3D skeletal reasoning to ensure kinematic sign precision."
        onLaunch={() => onLaunch('converter')}
        features={[
          { title: "Avatar Rig", subtitle: "humanoid", icon: "🦴", points: [{ label: "Skeletal View", description: "Internal joint visualization" }, { label: "High Contrast", description: "Obsidian glass artistic style" }] },
          { title: "Calibration", subtitle: "joints", icon: "🔧", points: [{ label: "Contact Points", description: "Visualizes hand-to-body touch" }, { label: "Plane Map", description: "Ensures 3D spatial accuracy" }] },
          { title: "Token Play", subtitle: "playback", icon: "⏯️", points: [{ label: "Slow Motion", description: "Slow-motion performance audit" }, { label: "Loop Mode", description: "Repetitive movement mastery" }] },
          { title: "Blueprint", subtitle: "specs", icon: "📄", points: [{ label: "Motion Data", description: "Raw kinematic data export" }, { label: "Gloss Bind", description: "Linguistic archetype binding" }] }
        ]}
      />

      <ModuleSection 
        id="form-bridge" title="FORMBRIDGE:" subtitle="Parity Link" color="#8b5cf6"
        description="Deconstructs complex regulatory and legal documents into simplified kinetic performance summaries."
        problem="Dense jargon in legal and administrative forms creates a systemic barrier for accessibility during professional life events."
        solution="A document ingestion engine that extracts primary obligations and synthesizes simplified kinetic explanations."
        hook="Gemini 3 Flash's huge context processes entire multi-page contracts for holistic understanding."
        onLaunch={() => onLaunch('form-bridge')}
        features={[
          { title: "Clause Audit", subtitle: "regulatory", icon: "⚖️", points: [{ label: "Risk Map", description: "Identifies binding obligations" }, { label: "Simplifier", description: "Deconstructs complex language" }] },
          { title: "Parity Engine", subtitle: "summary", icon: "🌉", points: [{ label: "Signed Brief", description: "Generates ASL video summary" }, { label: "Meaning Map", description: "Visualizes logic connections" }] },
          { title: "Ambiguity", subtitle: "forensic", icon: "🔍", points: [{ label: "Conflict Flag", description: "Flags vague document clauses" }, { label: "Legal Buffer", description: "Verified against case law" }] },
          { title: "Safe Uplink", subtitle: "secure", icon: "🛡️", points: [{ label: "Secure Link", description: "Encrypted document handling" }, { label: "Log Export", description: "Traceable audit history" }] }
        ]}
      />

      <ModuleSection 
        id="crisis-sign" title="CRISIS SIGN:" subtitle="Safety SOS" color="#ef4444"
        description="Bidirectional emergency SOS uplink featuring video-to-video parity, local archive recording, and high-priority situational briefing."
        problem="Standard emergency broadcasts are often inaccessible during critical environmental events."
        solution="A high-priority safety bridge that automates situational data and live signed situational awareness."
        hook="Gemini 3 Flash provides real-time multimodal transcription of emergency signals during live feeds."
        onLaunch={() => onLaunch('crisis-sign')}
        features={[
          { title: "Protocol Alpha", subtitle: "visual_sync", icon: "📹", points: [{ label: "Video Parity", description: "Live video-to-video responder simulation" }, { label: "Sensor Link", description: "High-cadence 720p emergency feed" }] },
          { title: "Local Archive", subtitle: "forensic_rec", icon: "💾", points: [{ label: "Rec & Buffer", description: "Encrypted local recording of events" }, { label: "Transmission", description: "Post-event archive uplink for audit" }] },
          { title: "SOS Beacon", subtitle: "ipaws_sync", icon: "📡", points: [{ label: "Public Alerts", description: "Translates official FEMA/IPAWS alerts" }, { label: "Signed Brief", description: "Urgent ASL instructions via Avatar" }] },
          { title: "Protocol Beta", subtitle: "neural_bridge", icon: "🧠", points: [{ label: "Intent Trace", description: "Real-time kinetic SOS detection" }, { label: "Narrative Synth", description: "Auto-generates situational text" }] }
        ]}
      />

      <ModuleSection 
        id="learn-path" title="LEARN PATH:" subtitle="Curriculum" color="#a855f7"
        description="Dynamic neural curriculum utilizing forensic evaluation to master linguistic kinetic patterns."
        problem="Skill mastery in kinetic languages lacks the sub-millimeter feedback loop required for professional precision."
        solution="An interactive diagnostic stage that compares performance against a standardized 'Progenitor' archetype."
        hook="Gemini 3 Flash performs frame-by-frame kinematic comparison to provide correction feedback."
        onLaunch={() => onLaunch('learn-path')}
        features={[
          { title: "Neural Tutor", subtitle: "learning", icon: "🎓", points: [{ label: "Prep Flow", description: "Tailored lesson synthesis" }, { label: "Mastery Log", description: "Tracks fluency and EXP" }] },
          { title: "Diagnostic", subtitle: "kinetic", icon: "📐", points: [{ label: "Auto Scan", description: "Real-time gesture auditing" }, { label: "Match Logic", description: "Linguistic precision verify" }] },
          { title: "Reference", subtitle: "progenitor", icon: "💎", points: [{ label: "Archetypes", description: "Standardized 3D sign models" }, { label: "Correction", description: "Feedback on movement arcs" }] },
          { title: "Retention", subtitle: "loop", icon: "🔥", points: [{ label: "Goal Tracker", description: "Daily performance targets" }, { label: "Weak Focus", description: "Repeats difficult patterns" }] }
        ]}
      />

      <ModuleSection 
        id="evolution" title="EVOLUTION LAB:" subtitle="Skill R&D" color="#06b6d4"
        description="Autonomous R&D engine auditing history to identify weak links and optimize unique professional signatures."
        problem="Learners hit performance plateaus when they cannot visualize recurring kinematic errors across long-form history."
        solution="A marathon agent that processes months of data to discover systemic kinetic weak links."
        hook="Gemini 3 Flash's reasoning engine identifies multi-session patterns that are often missed by human observation."
        onLaunch={() => onLaunch('evolution')}
        features={[
          { title: "Audit Hub", subtitle: "marathon", icon: "🏃", points: [{ label: "History Log", description: "Autonomous auditing stream" }, { label: "Pattern ID", description: "Finds recurring errors" }] },
          { title: "Optimization", subtitle: "weak_link", icon: "🔗", points: [{ label: "Lexeme Fix", description: "Targeted sign optimization" }, { label: "Tutoring", description: "Auto-generates remedial aids" }] },
          { title: "Core Sync", subtitle: "brain", icon: "🌌", points: [{ label: "Active Node", description: "Visualizes audit intensity" }, { label: "Hours Track", description: "Autonomous study tracking" }] },
          { title: "Self Correct", subtitle: "autopilot", icon: "🛠️", points: [{ label: "Movement", description: "Refines movement signatures" }, { label: "Antigravity", description: "Optimizes frame-rate usage" }] }
        ]}
      />

      <ModuleSection 
        id="transcriber" title="AUDIT LEXICON:" subtitle="Acoustic" color="#10b981"
        description="Deep-dive forensic transcription isolating dialogue and ambient markers from high-fidelity archives."
        problem="Standard industrial transcripts lack spatial and acoustic context required for forensic record accuracy."
        solution="A forensic acoustic pipeline that maps dialogue to spatial entities and semantic sentiment markers."
        hook="Gemini 3 Flash extracts 100% of dialogue and ambient markers from high-fidelity 4k archives."
        onLaunch={() => onLaunch('transcriber')}
        features={[
          { title: "Extraction", subtitle: "acoustic", icon: "🎙️", points: [{ label: "Verbatim", description: "High-fidelity audio-to-text" }, { label: "Ambience", description: "Detects non-speech noises" }] },
          { title: "Entity Bank", subtitle: "forensic", icon: "🏦", points: [{ label: "Object Link", description: "Links mentions to visuals" }, { label: "Identity", description: "Tracks speakers across frames" }] },
          { title: "Audit Log", subtitle: "timeline", icon: "📅", points: [{ label: "Timestamp", description: "Seekable neural tokens" }, { label: "Semantic", description: "Automated semantic tagging" }] },
          { title: "Synthesis", subtitle: "summary", icon: "📜", points: [{ label: "Dossier", description: "One-click audit export" }, { label: "Sentiment", description: "Overall acoustic vibe report" }] }
        ]}
      />

      <section className="min-h-screen snap-start py-60 px-8 bg-[#010103]">
        <div className="max-w-[1700px] mx-auto">
          <SectionHeader title="REAL-WORLD IMPACT:" subtitle="Forensic Case Studies" color="#06b6d4" />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
             <ImpactCard title="Deep-Work Neuro Audit" category="Individual Performance" color="#06b6d4" icon="💻" description="Industrial engineers use Mirror Core to identify specific architectural tasks that trigger cognitive burnout versus peak flow states." />
             <ImpactCard title="Public Safety Briefing" category="Public Safety" color="#ef4444" icon="📡" description="Officials activate CrisisSign to communicate vital instructions to DHH citizens during extreme environmental events." />
             <ImpactCard title="Regulatory Parity Audit" category="Legal Compliance" color="#8b5cf6" icon="⚖️" description="Legal counsel uses FormBridge to ensure DHH clients have absolute comprehension parity for complex arbitration contracts." />
          </div>
        </div>
      </section>

      <section id="faq" className="min-h-screen snap-start py-60 px-8 bg-black relative border-t border-white/5">
        <div className="max-w-[1200px] mx-auto">
          <SectionHeader title="INTELLIGENCE DEBRIEF:" subtitle="Frequently Asked Questions" color="#8b5cf6" />
          <div className="flex flex-col gap-6">
            <FAQItem index={0} question="What exactly is a 'Forensic Audit' in this system?" answer="It refers to a high-precision reconstruction of human intent and professional behavior. We track kinematic geometry and focus indicators to create an immutable data log of performance or group communication." />
            <FAQItem index={1} question="How secure is my behavioral and document data?" answer="Mirror Core uses AES-256 encryption. Forensic logs are shredded immediately upon session exit. We do not store biometric or kinematic signatures on external servers." />
            <FAQItem index={2} question="Can FormBridge be used for legal representation?" answer="No. FormBridge is an accessibility tool designed for comprehension parity. It is intended to supplement professional legal advice, not replace it." />
            <FAQItem index={3} question="Why Gemini 3 Flash for this application?" answer="It offers high-speed multimodal processing essential for sub-100ms kinetic analysis and a 1M context window for complex industrial document reasoning." />
            <FAQItem index={4} question="Who is ARIA and how does the agent interact with my session?" answer="ARIA is our persistent Neural Forensic Link Agent. It functions as a conversational interface for the system's reasoning core, providing real-time audits of your performance. ARIA only accesses the multimodal tokens generated during your active session to provide contextual feedback and does not store personal behavioral history beyond the session duration." />
          </div>
        </div>
      </section>

      <footer className="py-60 border-t border-white/5 bg-black relative z-10 snap-start">
        <div className="max-w-[1700px] mx-auto px-8">
          <h1 className="text-7xl font-black italic tracking-tighter uppercase text-white leading-none">Meta-Cognitive <span className="text-cyan-400">Mirror</span></h1>
          <p className="mt-8 text-white/20 uppercase font-black tracking-[0.5em] text-xs">Powered by Gemini 3 Flash Pipeline</p>
        </div>
      </footer>

      <AnimatePresence>
        {showScrollTop && (
          <motion.button
            initial={{ opacity: 0, scale: 0.5, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.5, y: 20 }}
            whileHover={{ scale: 1.1, backgroundColor: 'rgba(6,182,212,0.1)' }} whileTap={{ scale: 0.9 }} onClick={scrollToTop}
            className="fixed bottom-12 right-12 z-[5000] w-16 h-16 rounded-full liquid-glass border-2 border-cyan-500/50 text-cyan-400 flex items-center justify-center shadow-[0_0_30px_rgba(6,182,212,0.3)] backdrop-blur-xl"
            aria-label="Scroll to top"
          >
            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 10l7-7m0 0l7 7m-7-7v18" /></svg>
          </motion.button>
        )}
      </AnimatePresence>
    </div>
  );
};

export default LandingPage;