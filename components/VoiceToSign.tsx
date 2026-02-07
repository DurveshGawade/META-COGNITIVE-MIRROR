import React, { useState, useEffect, useMemo, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { SignSymbol, StudioSettings } from '../types';
import { GeminiService } from '../services/geminiService';
import AgenticPulse from './AgenticPulse';
import TabBriefing from './TabBriefing';

interface VoiceToSignProps {
  onConvert: (input: string, settings: StudioSettings) => Promise<void>;
  symbols: SignSymbol[];
  isConverting: boolean;
  onAriaToast: (m: string) => void;
  onNewPerformance: () => void;
}

const KINETIC_STYLE = "Clinical 8k resolution. Orthopedic medical photography style. Translucent dark obsidian glass humanoid figure. Internal bright cyan skeletal filaments. HIGH CONTRAST hand-to-body interaction. Clear finger-to-body contact points. Sharp articulation. Neutral black studio background. Medium close-up framing (waist-up).";

const SectionHeader: React.FC<{ title: string; subtitle: string; color: string }> = ({ title, subtitle, color }) => (
  <div className="mb-12 space-y-4">
    <div className="flex items-center gap-4">
      <span className="px-4 py-1 rounded-full border text-[10px] font-mono font-black uppercase tracking-widest" style={{ borderColor: `${color}44`, color, backgroundColor: `${color}11` }}>
        KINETIC_PERFORMANCE_v4.3
      </span>
      <div className="flex-1 h-px bg-white/10" />
    </div>
    <h2 className="text-4xl md:text-6xl font-black italic tracking-tighter uppercase text-white leading-none">
      {title} <span style={{ color }}>{subtitle}</span>
    </h2>
  </div>
);

const AvatarStage: React.FC<{ 
  sym: SignSymbol; 
  isActive: boolean;
  index: number;
}> = ({ sym, isActive, index }) => {
  return (
    <motion.div 
      key={`${sym?.word || 'unknown'}-${index}`}
      initial={{ opacity: 0, scale: 0.95, y: 10 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      exit={{ opacity: 0, scale: 1.05, y: -10 }}
      className="absolute inset-0 flex flex-col items-center justify-center p-4 md:p-8"
    >
      <div className="absolute inset-0 pointer-events-none forensic-grid opacity-[0.05]" />
      
      {sym?.imageUrl ? (
        <div className="relative group w-full h-full flex flex-col items-center justify-center">
           <div className="absolute inset-0 bg-cyan-500/[0.04] blur-[120px] rounded-full pointer-events-none" />
           <motion.img 
             initial={{ filter: 'blur(20px)', opacity: 0 }}
             animate={{ filter: 'blur(0px)', opacity: 1 }}
             src={sym.imageUrl} 
             className="max-w-full max-h-full object-contain drop-shadow-[0_0_100px_rgba(6,182,212,0.4)] brightness-110 z-10" 
             alt={sym.word}
           />
           
           <div className="absolute bottom-8 inset-x-0 flex flex-col items-center gap-6 z-20">
              <motion.div 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex items-center gap-6 px-10 py-5 bg-black/90 backdrop-blur-3xl border border-white/10 rounded-[32px] shadow-2xl"
              >
                 <div className="flex flex-col">
                    <span className="text-[8px] font-black text-cyan-400 uppercase tracking-[0.4em] font-mono mb-1">NEURAL_TOKEN</span>
                    <h4 className="text-3xl font-black text-white italic uppercase tracking-tighter leading-none">"{sym.word}"</h4>
                 </div>
                 <div className="w-px h-10 bg-white/10" />
                 <div className="flex flex-col text-right">
                    <span className="text-[8px] font-black text-white/30 uppercase tracking-[0.4em] font-mono mb-1">KINETIC_ID</span>
                    <span className="text-xs font-bold text-cyan-400/90 font-mono uppercase tracking-widest">{sym.gloss}</span>
                 </div>
              </motion.div>
           </div>
        </div>
      ) : (
        <div className="flex flex-col items-center gap-12">
          <div className="relative w-32 h-32">
             <div className="absolute inset-0 rounded-full border-4 border-white/5 border-t-cyan-500 animate-spin" />
             <div className="absolute inset-4 rounded-full border-2 border-white/5 border-b-violet-500 animate-spin-slow" />
          </div>
          <div className="text-center space-y-4">
             <span className="text-[10px] font-black uppercase text-cyan-400 tracking-[1.2em] animate-pulse font-mono block">Synthesizing_Performance</span>
             <p className="text-[10px] text-white/20 uppercase tracking-widest italic font-bold">Target Token: {sym?.word || 'Initializing'}</p>
          </div>
        </div>
      )}
    </motion.div>
  );
};

const LinguisticBlueprint: React.FC<{ sym: SignSymbol; onClose: () => void }> = ({ sym, onClose }) => {
  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[10000] bg-black/90 backdrop-blur-2xl flex items-center justify-center p-4 md:p-12"
    >
      <motion.div 
        initial={{ scale: 0.9, y: 50 }}
        animate={{ scale: 1, y: 0 }}
        className="w-full max-w-5xl h-full max-h-[800px] liquid-glass rounded-[56px] border border-cyan-500/20 flex flex-col relative overflow-hidden shadow-3xl"
      >
        <div className="flex-1 flex flex-col md:flex-row h-full overflow-hidden">
          <div className="flex-1 bg-black/40 flex items-center justify-center relative p-12 border-b md:border-b-0 md:border-r border-white/10">
             <div className="absolute inset-0 forensic-grid opacity-10 pointer-events-none" />
             {sym?.imageUrl && (
                <img 
                  src={sym.imageUrl} 
                  className="max-w-full max-h-full object-contain brightness-125 drop-shadow-[0_0_80px_rgba(6,182,212,0.4)]" 
                />
             )}
          </div>

          <div className="flex-1 flex flex-col p-12 md:p-16 overflow-y-auto custom-scrollbar gap-10 bg-black/20">
             <div className="flex justify-between items-start">
               <div>
                  <h2 className="text-[10px] font-black text-cyan-400 uppercase tracking-[0.5em] mb-3">Linguistic Blueprint</h2>
                  <h3 className="text-5xl font-black italic uppercase text-white tracking-tighter leading-none">"{sym?.word || 'Unknown'}"</h3>
               </div>
               <button onClick={onClose} className="p-4 rounded-full border border-white/10 text-white hover:bg-white/10 transition-all">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" /></svg>
               </button>
             </div>

             <div className="space-y-8">
                <div className="space-y-3">
                  <h4 className="text-[10px] font-black uppercase text-white/30 tracking-[0.4em] font-mono">Movement Trajectory</h4>
                  <p className="text-lg font-light text-white/90 italic leading-relaxed">{sym?.trajectoryDescription || 'No trajectory data.'}</p>
                </div>

                <div className="grid grid-cols-2 gap-6">
                  <div className="space-y-2 p-6 rounded-[32px] bg-white/5 border border-white/5">
                    <span className="text-[8px] font-black text-cyan-400 uppercase tracking-widest font-mono">Handshape</span>
                    <p className="text-sm font-bold text-white uppercase">{sym?.technicalTutorial?.handShape || 'Neutral'}</p>
                  </div>
                  <div className="space-y-2 p-6 rounded-[32px] bg-white/5 border border-white/5">
                    <span className="text-[8px] font-black text-cyan-400 uppercase tracking-widest font-mono">Location</span>
                    <p className="text-sm font-bold text-white uppercase">{sym?.anatomicalLocation || 'Center'}</p>
                  </div>
                </div>

                <div className="space-y-3 p-8 rounded-[40px] bg-cyan-500/5 border border-cyan-500/10">
                   <h4 className="text-[8px] font-black uppercase text-cyan-400 tracking-widest font-mono">Archetypal Definition</h4>
                   <p className="text-sm text-white/60 leading-relaxed font-light italic">{sym?.definition || 'No definition available.'}</p>
                </div>
             </div>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
};

const VoiceToSign: React.FC<VoiceToSignProps> = ({ onConvert, symbols, isConverting, onAriaToast, onNewPerformance }) => {
  const [inputText, setInputText] = useState("");
  const [activeIdx, setActiveIdx] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [sessionSearchTerm, setSessionSearchTerm] = useState("");
  const [selectedSym, setSelectedSym] = useState<SignSymbol | null>(null);
  
  const [settings, setSettings] = useState<StudioSettings>({
    speed: 1, handedness: 'right', visualStyle: 'cyber', variant: 'ASL'
  });

  const [enrichedSymbols, setEnrichedSymbols] = useState<SignSymbol[]>([]);
  const gemini = useMemo(() => new GeminiService(), []);
  const synthesisControllerRef = useRef<AbortController | null>(null);

  useEffect(() => {
    if (symbols && symbols.length > 0) {
      if (synthesisControllerRef.current) {
        synthesisControllerRef.current.abort();
      }
      synthesisControllerRef.current = new AbortController();
      
      setEnrichedSymbols(symbols);
      setActiveIdx(0);
      setIsPlaying(false);
      
      const synthesizeSequentially = async (signal: AbortSignal) => {
        for (let i = 0; i < symbols.length; i++) {
          if (signal.aborted) return;
          
          const s = symbols[i];
          if (!s) continue;

          try {
            const targetWord = s.word || 'unknown';
            // We now use the enriched imagePrompt provided by Gemini Pro in the service layer
            const anatomicalInstruction = s.imagePrompt || `Linguistically perfect sign for ${targetWord}.`;

            const physicalConstraint = `SIGN LANGUAGE ACCURACY: ${settings.variant} sign for "${targetWord}". 
            POSE DESCRIPTION: ${anatomicalInstruction}. 
            CORE REQUIREMENT: HANDS MUST BE ANCHORED AT ${s.anatomicalLocation || 'NEUTRAL SPACE'}. 
            STYLE OVERRIDE: ${KINETIC_STYLE}`;
            
            const url = await gemini.generateSignImage(physicalConstraint);
            
            if (signal.aborted) return;

            setEnrichedSymbols(prev => {
              const next = [...prev];
              if (next[i]) {
                next[i] = { ...next[i], imageUrl: url };
              }
              return next;
            });

            if (i === 0) setIsPlaying(true);
            
          } catch (e) { 
            console.error(`Synthesis failed for token: ${s?.word || 'undefined'}`, e);
          }
          
          await new Promise(r => setTimeout(r, 600));
        }
      };

      synthesizeSequentially(synthesisControllerRef.current.signal);
    } else {
      setEnrichedSymbols([]);
      setActiveIdx(0);
      setIsPlaying(false);
    }

    return () => {
      if (synthesisControllerRef.current) synthesisControllerRef.current.abort();
    };
  }, [symbols, gemini, settings.variant]);

  useEffect(() => {
    let interval: number;
    if (isPlaying && enrichedSymbols.length > 1) {
      const pace = 2000 / settings.speed;
      interval = window.setInterval(() => {
        setActiveIdx(prev => (prev >= enrichedSymbols.length - 1 ? 0 : prev + 1));
      }, pace);
    }
    return () => clearInterval(interval);
  }, [isPlaying, enrichedSymbols.length, settings.speed]);

  const handleTranslate = async () => {
    if (!inputText.trim()) return;
    onAriaToast(`CALIBRATING_KINETIC_ANCHORS: ${inputText.split(' ').length} TOKENS`);
    onConvert(inputText, settings);
  };

  const handleReset = () => {
    if (synthesisControllerRef.current) synthesisControllerRef.current.abort();
    setInputText("");
    setActiveIdx(0);
    setIsPlaying(false);
    onNewPerformance();
  };

  const filteredSessionSymbols = useMemo(() => {
    return enrichedSymbols.filter(sym => 
      sym?.word?.toLowerCase().includes(sessionSearchTerm.toLowerCase()) || 
      sym?.gloss?.toLowerCase().includes(sessionSearchTerm.toLowerCase())
    );
  }, [enrichedSymbols, sessionSearchTerm]);

  const currentActiveSym = enrichedSymbols[activeIdx];

  return (
    <div className="max-w-[1700px] mx-auto px-8 flex flex-col gap-32">
      <TabBriefing 
        title="MODEL: 3D SIGN STUDIO"
        description="The 3D Sign Studio maps linguistic input to anatomically accurate 3D obsidian avatars, preserving semantic clarity through clinical kinetic performance."
        steps={["INPUT TEXT", "MAP ANATOMY", "SYNTHESIZE FRAME", "PLAY PERFORMANCE"]}
        color="#f97316"
      />

      {/* 1. PERFORMANCE STAGE */}
      <section className="flex flex-col gap-12">
        <div className="flex justify-between items-end">
          <SectionHeader title="KINETIC STUDIO:" subtitle="Avatar Performance Rig" color="#f97316" />
          <div className="flex gap-4 mb-12 bg-white/5 p-2 rounded-2xl border border-white/5 backdrop-blur-xl">
             <div className="px-4 py-2 flex items-center gap-3">
                <span className="text-[10px] font-black uppercase text-white/30 tracking-widest:">Sign Variant:</span>
                <select 
                  value={settings.variant} 
                  onChange={(e) => setSettings({...settings, variant: e.target.value as any})}
                  className="bg-transparent text-orange-500 text-[11px] font-black uppercase tracking-widest outline-none cursor-pointer"
                >
                  <option value="ASL" className="bg-black">ASL (US)</option>
                  <option value="BSL" className="bg-black">BSL (UK)</option>
                  <option value="ISL" className="bg-black">ISL (IN)</option>
                </select>
             </div>
          </div>
        </div>

        <div className="grid lg:grid-cols-12 gap-10">
          <div className="lg:col-span-5 liquid-glass rounded-[64px] p-12 bg-black/40 border-white/5 flex flex-col gap-10 min-h-[600px]">
             <div className="flex justify-between items-center">
                <h3 className="text-[12px] font-black uppercase text-orange-500 tracking-[0.4em]">Linguistic Input</h3>
                <span className="text-[9px] font-mono text-white/20 uppercase tracking-widest">v4.3_STABLE_UPLINK</span>
             </div>
             <textarea 
                value={inputText} onChange={e => setInputText(e.target.value)}
                placeholder="Input text for anatomically correct avatar performance..."
                className="flex-1 bg-transparent text-2xl md:text-4xl font-light leading-relaxed text-white/90 placeholder:text-white/5 focus:outline-none resize-none italic"
             />
             <div className="flex flex-col gap-4">
                <button 
                  onClick={handleTranslate} disabled={isConverting || !inputText.trim()}
                  className={`w-full h-24 rounded-[48px] bg-gradient-to-r ${isConverting ? 'from-slate-700 to-slate-900 opacity-50' : 'from-orange-600 to-red-700'} font-black italic uppercase tracking-[1em] text-xl shadow-3xl transition-all hover:scale-[1.02] active:scale-95`}
                >
                  {isConverting ? "Mapping Anatomy..." : "Initialize Performance"}
                </button>
                {!isConverting && enrichedSymbols.length > 0 && (
                   <button 
                     onClick={handleReset}
                     className="w-full h-16 rounded-[32px] bg-white/5 border border-white/10 text-cyan-400 font-black uppercase tracking-[0.3em] text-xs hover:bg-white/10 transition-all flex items-center justify-center gap-3 group"
                   >
                     <svg className="w-4 h-4 group-hover:rotate-180 transition-transform duration-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /></svg>
                     New Performance Session
                   </button>
                )}
             </div>
          </div>

          <div className="lg:col-span-7 liquid-glass rounded-[64px] overflow-hidden bg-black/60 border border-white/5 flex flex-col shadow-3xl min-h-[600px] relative">
            <div className="flex-1 flex items-center justify-center relative z-10">
               <AnimatePresence mode="wait">
                 {currentActiveSym ? (
                   <AvatarStage key={activeIdx} sym={currentActiveSym} isActive={true} index={activeIdx} />
                 ) : (
                   <div className="text-center space-y-12 opacity-10 uppercase text-xs tracking-[2em] italic p-20">
                     <div className="w-48 h-48 rounded-full border-[6px] border-dashed border-white mx-auto animate-spin-slow mb-8" />
                     {isConverting ? "Calibrating Joints..." : "Awaiting Lexicon..."}
                   </div>
                 )}
               </AnimatePresence>
            </div>
            
            {enrichedSymbols.length > 0 && (
               <div className="p-10 bg-black/40 border-t border-white/5 backdrop-blur-xl relative z-20">
                  <div className="flex items-center gap-10">
                     <button 
                        onClick={() => setIsPlaying(!isPlaying)}
                        className={`w-20 h-20 rounded-[28px] flex items-center justify-center transition-all ${isPlaying ? 'bg-white text-black' : 'bg-orange-500 text-black shadow-lg shadow-orange-500/20'}`}
                     >
                        {isPlaying ? <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 24 24"><rect x="6" y="6" width="12" height="12" rx="2" /></svg> : <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 24 24"><path d="M8 5v14l11-7z" /></svg>}
                     </button>
                     <div className="flex-1 space-y-4">
                        <div className="flex justify-between text-[10px] font-black text-white/30 uppercase tracking-[0.4em]">
                           <span>Timeline Progress</span>
                           <span className="text-orange-500">[{activeIdx + 1} / {enrichedSymbols.length}]</span>
                        </div>
                        <div className="h-2 w-full bg-white/5 rounded-full overflow-hidden border border-white/10 p-[1px]">
                           <motion.div 
                              className="h-full bg-orange-500 shadow-[0_0_15px_#f97316] rounded-full"
                              animate={{ width: `${((activeIdx + 1) / enrichedSymbols.length) * 100}%` }}
                           />
                        </div>
                     </div>
                  </div>
               </div>
            )}
          </div>
        </div>
      </section>

      {/* 2. GLOSS BUFFER TRACK */}
      <section className="flex flex-col gap-12">
        <SectionHeader title="KINETIC BUFFER:" subtitle="Neural Token Stream" color="#06b6d4" />
        <div className="flex gap-8 overflow-x-auto pb-10 custom-scrollbar-horizontal scroll-smooth snap-x">
          {enrichedSymbols.length > 0 ? enrichedSymbols.map((sym, i) => (
            <motion.div 
               key={i} onClick={() => { setActiveIdx(i); setIsPlaying(false); }}
               whileHover={{ y: -10, scale: 1.02 }}
               className={`flex-shrink-0 w-64 snap-center p-8 rounded-[48px] liquid-glass border transition-all cursor-pointer ${activeIdx === i ? 'border-cyan-500 bg-cyan-500/10' : 'border-white/5 hover:border-white/20'}`}
            >
               <div className="aspect-square rounded-[36px] bg-black overflow-hidden mb-6 border border-white/5 relative">
                  {sym?.imageUrl ? <img src={sym.imageUrl} className="w-full h-full object-cover opacity-80" alt={sym.word} /> : <div className="w-full h-full flex items-center justify-center bg-white/[0.02]"><div className="w-6 h-6 border-2 border-cyan-500 border-t-transparent animate-spin rounded-full" /></div>}
                  <div className="absolute top-3 right-3 text-[7px] font-mono text-cyan-400">0{i+1}</div>
                  {sym && !sym.imageUrl && (
                    <div className="absolute inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center">
                       <span className="text-[8px] font-black text-cyan-400 uppercase animate-pulse">Syncing...</span>
                    </div>
                  )}
               </div>
               <h4 className="text-xl font-black italic uppercase text-white tracking-tighter truncate text-center">"{sym?.word || '...'}"</h4>
            </motion.div>
          )) : <div className="w-full p-40 text-center text-white/10 uppercase tracking-[2em] text-[10px] italic">Awaiting Tokens...</div>}
        </div>
      </section>

      {/* 3. GLYPH REPOSITORY */}
      <section className="flex flex-col gap-12 mb-32">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-10">
          <SectionHeader title="GLYPH REPOSITORY:" subtitle="Historical Archetype Bank" color="#8b5cf6" />
          <div className="relative mb-12 w-full max-w-md">
            <input 
              type="text" value={sessionSearchTerm} onChange={e => setSessionSearchTerm(e.target.value)}
              placeholder="Search historical tokens..." 
              className="w-full bg-white/5 border border-white/10 rounded-2xl px-12 py-4 text-xs text-white focus:outline-none focus:border-purple-500 transition-all placeholder:text-white/20"
            />
            <svg className="w-4 h-4 text-white/20 absolute left-5 top-1/2 -translate-y-1/2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-8">
          <AnimatePresence mode="popLayout">
            {filteredSessionSymbols.map((sym, i) => (
              <motion.div 
                layout key={`${sym?.gloss || 'gloss'}-${i}`} initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.9 }}
                whileHover={{ y: -20, scale: 1.05 }}
                onClick={() => sym && setSelectedSym(sym)}
                className="liquid-glass rounded-[48px] p-10 border-white/5 bg-black/40 group cursor-pointer hover:border-purple-500/50 transition-all flex flex-col gap-8 shadow-2xl relative overflow-hidden"
              >
                <div className="aspect-square rounded-[36px] bg-black overflow-hidden relative border border-white/5">
                   {sym?.imageUrl ? <img src={sym.imageUrl} className="w-full h-full object-cover group-hover:scale-125 transition-transform duration-[3000ms] opacity-60" alt={sym.word} /> : <div className="w-full h-full animate-pulse bg-white/[0.03]" />}
                   <div className="absolute inset-0 forensic-grid opacity-[0.1] pointer-events-none" />
                </div>
                <div className="space-y-4 text-center relative z-10">
                   <h4 className="text-2xl font-black uppercase text-white tracking-tighter italic truncate">"{sym?.word || '...'}"</h4>
                   <span className="text-[10px] font-black text-purple-400 bg-purple-400/10 px-3 py-1 rounded-full uppercase tracking-widest group-hover:bg-purple-500 group-hover:text-white transition-all">Audit</span>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      </section>

      <AnimatePresence>
        {selectedSym && <LinguisticBlueprint sym={selectedSym} onClose={() => setSelectedSym(null)} />}
      </AnimatePresence>

      <AgenticPulse isAnalyzing={isConverting || isPlaying || enrichedSymbols.some(s => !s.imageUrl)} intensity={isConverting ? 4 : 2} />
    </div>
  );
};

export default VoiceToSign;