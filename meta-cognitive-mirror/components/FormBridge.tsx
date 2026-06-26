import React, { useState, useMemo, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { DocumentAnalysis, FormObligation } from '../types';
import { GeminiService } from '../services/geminiService';
import AgenticPulse from './AgenticPulse';
import TabBriefing from './TabBriefing';

interface FormBridgeProps {
  onAriaToast: (m: string) => void;
}

const SectionHeader: React.FC<{ title: string; subtitle: string; color: string }> = ({ title, subtitle, color }) => (
  <div className="mb-12 space-y-4">
    <div className="flex items-center gap-4">
      <span className="px-4 py-1 rounded-full border text-[10px] font-mono font-black uppercase tracking-widest" style={{ borderColor: `${color}44`, color, backgroundColor: `${color}11` }}>
        BRIDGE_LAYER_PROTOCOL_vFINAL
      </span>
      <div className="flex-1 h-px bg-white/10" />
    </div>
    <h2 className="text-4xl md:text-6xl font-black italic tracking-tighter uppercase text-white leading-none">
      {title} <span style={{ color }}>{subtitle}</span>
    </h2>
  </div>
);

const FormBridge: React.FC<FormBridgeProps> = ({ onAriaToast }) => {
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysis, setAnalysis] = useState<DocumentAnalysis | null>(null);
  const [selectedObligation, setSelectedObligation] = useState<FormObligation | null>(null);
  const [activeGlossIdx, setActiveGlossIdx] = useState(0);
  const [glossImages, setGlossImages] = useState<Record<string, string>>({});
  const [glossErrors, setGlossErrors] = useState<Record<string, boolean>>({});
  const [isPlaying, setIsPlaying] = useState(false);
  const [acknowledgedClauses, setAcknowledgedClauses] = useState<Set<string>>(new Set());

  const gemini = useMemo(() => new GeminiService(), []);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const analysisSessionRef = useRef(0);
  const synthesisSessionRef = useRef(0);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const session = ++analysisSessionRef.current;
    setIsAnalyzing(true);
    onAriaToast("INGESTING_DOCUMENT_STREAM");
    
    try {
      const reader = new FileReader();
      reader.onload = async () => {
        if (session !== analysisSessionRef.current) return;
        const base64 = (reader.result as string).split(',')[1];
        try {
          const res = await gemini.analyzeDocument(base64, file.type);
          if (session !== analysisSessionRef.current) return;
          setAnalysis(res);
          setIsAnalyzing(false);
          onAriaToast("DOCUMENT_PARITY_ESTABLISHED");
        } catch (err: any) {
          if (session !== analysisSessionRef.current) return;
          onAriaToast(err?.message?.includes('429') ? "QUOTA_EXCEEDED" : "INGESTION_FAILED");
          setIsAnalyzing(false);
        }
      };
      reader.readAsDataURL(file);
    } catch (e: any) {
      if (session !== analysisSessionRef.current) return;
      onAriaToast("READ_FAILURE");
      setIsAnalyzing(false);
    }
  };

  const handleRemove = useCallback(() => {
    analysisSessionRef.current++;
    synthesisSessionRef.current++;
    setIsAnalyzing(false);
    setAnalysis(null);
    setSelectedObligation(null);
    setGlossImages({});
    setGlossErrors({});
    setIsPlaying(false);
    setActiveGlossIdx(0);
    setAcknowledgedClauses(new Set());
    if (fileInputRef.current) fileInputRef.current.value = '';
    onAriaToast("DOCUMENT_REMOVED");
  }, [onAriaToast]);

  const handleRestart = useCallback(() => {
    handleRemove();
    onAriaToast("FORMBRIDGE_REINITIALIZED");
  }, [handleRemove, onAriaToast]);

  useEffect(() => {
    let interval: number;
    if (isPlaying && selectedObligation && selectedObligation.glosses.length > 0) {
      interval = window.setInterval(() => {
        setActiveGlossIdx(prev => {
          if (prev >= selectedObligation.glosses.length - 1) {
            setIsPlaying(false);
            return prev;
          }
          return prev + 1;
        });
      }, 2400); // Terminal tuned for maximum clarity
    }
    return () => clearInterval(interval);
  }, [isPlaying, selectedObligation]);

  const loadGloss = useCallback(async (gloss: string, session: number) => {
    if (session !== synthesisSessionRef.current) return;
    setGlossErrors(prev => ({ ...prev, [gloss]: false }));
    try {
      const url = await gemini.generateSignImage(`Linguistically perfect sign for "${gloss}". Style: High-end 3D render, dark obsidian glass humanoid with cyan internal filaments, clear hand articulation, waist-up framing.`);
      if (session !== synthesisSessionRef.current) return;
      setGlossImages(prev => ({ ...prev, [gloss]: url }));
    } catch (e) {
      if (session !== synthesisSessionRef.current) return;
      setGlossErrors(prev => ({ ...prev, [gloss]: true }));
      console.error(`Failed to load gloss: ${gloss}`, e);
    }
  }, [gemini]);

  useEffect(() => {
    if (selectedObligation) {
      const currentSession = ++synthesisSessionRef.current;
      setActiveGlossIdx(0);
      setIsPlaying(false);
      
      const loadGlosses = async () => {
        onAriaToast(`SYNCING_TOKENS: ${selectedObligation.glosses.length} WORDS`);
        for (const gloss of selectedObligation.glosses) {
          if (currentSession !== synthesisSessionRef.current) return;
          if (!glossImages[gloss]) {
            await loadGloss(gloss, currentSession);
          }
        }
        if (currentSession === synthesisSessionRef.current) {
          setIsPlaying(true);
        }
      };
      loadGlosses();
    }
  }, [selectedObligation, loadGloss, onAriaToast]);

  const toggleAcknowledge = (title: string) => {
    setAcknowledgedClauses(prev => {
      const next = new Set(prev);
      if (next.has(title)) next.delete(title);
      else next.add(title);
      return next;
    });
    if (!acknowledgedClauses.has(title)) {
      onAriaToast("COMPREHENSION_STAMPED_VERIFIED");
    }
  };

  const activeGloss = selectedObligation?.glosses[activeGlossIdx];
  const hasActiveGlossError = activeGloss ? glossErrors[activeGloss] : false;

  return (
    <div className="max-w-[1700px] mx-auto px-8 flex flex-col gap-32">
      <TabBriefing 
        title="MODEL: DOCUMENT PARITY"
        description="FormBridge deconstructs complex regulatory text into word-by-word kinetic performances, enabling DHH users to audit and acknowledge intent with absolute parity."
        steps={["INGEST ARCHIVE", "ISOLATE CLAUSES", "WORD-BY-WORD SYNC", "ACKNOWLEDGE PARITY"]}
        color="#8b5cf6"
      />

      <section className="flex flex-col gap-12">
        <div className="flex justify-between items-end">
          <SectionHeader title="SOURCE DOCUMENT:" subtitle="Neural Ingestion Stream" color="#8b5cf6" />
          <div className="flex items-center gap-4 mb-12">
            <input 
              ref={fileInputRef}
              type="file" 
              accept="image/*,application/pdf" 
              onChange={handleFileUpload} 
              className="hidden" 
            />
            
            <AnimatePresence mode="wait">
              {!analysis && !isAnalyzing ? (
                <motion.button 
                  key="upload-btn"
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  onClick={() => fileInputRef.current?.click()}
                  className="px-12 py-6 rounded-[32px] bg-white text-black font-black uppercase tracking-[0.3em] text-sm hover:scale-105 transition-all shadow-[0_0_50px_rgba(255,255,255,0.1)]"
                >
                  UPLOAD FOR FORENSIC PARITY
                </motion.button>
              ) : (
                <motion.div 
                  key="active-controls"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  className="flex items-center gap-3 bg-white/5 p-2 rounded-[32px] border border-white/10 backdrop-blur-xl"
                >
                  <button 
                    onClick={() => fileInputRef.current?.click()}
                    className="px-6 py-3 rounded-2xl bg-white/5 border border-white/10 text-[10px] font-black uppercase text-white/60 hover:text-white hover:border-violet-500/50 transition-all tracking-widest"
                  >
                    Load New Archive
                  </button>
                  <button 
                    onClick={handleRemove}
                    className="px-6 py-3 rounded-2xl bg-red-500/10 border border-red-500/30 text-[10px] font-black uppercase text-red-400 hover:bg-red-500 hover:text-white transition-all tracking-widest"
                  >
                    Shred Session
                  </button>
                  <div className="w-px h-8 bg-white/10 mx-1" />
                  <button 
                    onClick={handleRestart}
                    className="px-8 py-3 rounded-2xl bg-violet-600 text-white font-black uppercase text-[10px] tracking-widest shadow-lg shadow-violet-600/20 hover:scale-105 transition-all flex items-center gap-2"
                  >
                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /></svg>
                    Reset Bridge
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        <div className="grid lg:grid-cols-12 gap-12">
          {/* CLAUSE ANALYSIS MODULE */}
          <div className="lg:col-span-7 flex flex-col gap-8">
             <div className="liquid-glass rounded-[56px] p-12 border-white/5 bg-black/40 flex flex-col gap-10 min-h-[850px] shadow-3xl">
                <div className="flex justify-between items-center border-b border-white/5 pb-8">
                   <h3 className="text-[14px] font-black uppercase text-violet-500 tracking-[0.4em]">Forensic Audit: Key Obligations</h3>
                   <div className="flex items-center gap-4">
                      <span className="text-[10px] font-mono text-white/20 uppercase tracking-widest">Parity achieved: {acknowledgedClauses.size}/{analysis?.obligations.length || 0}</span>
                      <div className="w-40 h-1.5 bg-white/5 rounded-full overflow-hidden">
                        <motion.div 
                          className="h-full bg-violet-500"
                          animate={{ width: `${(acknowledgedClauses.size / (analysis?.obligations.length || 1)) * 100}%` }}
                        />
                      </div>
                   </div>
                </div>
                
                <div className="flex-1 overflow-y-auto custom-scrollbar space-y-8 pr-6">
                  {isAnalyzing ? (
                    <div className="h-full flex flex-col items-center justify-center gap-10">
                      <div className="w-24 h-24 rounded-full border-[6px] border-dashed border-violet-500 animate-spin" />
                      <div className="text-center space-y-4">
                        <span className="text-sm font-black uppercase tracking-[0.6em] text-violet-400 animate-pulse block">Reconstructing Document Logic</span>
                        <p className="text-[10px] text-white/20 uppercase font-bold tracking-widest">Acoustic-Visual Tokenization: Active</p>
                      </div>
                    </div>
                  ) : analysis ? (
                    analysis.obligations.map((ob, idx) => (
                      <motion.div 
                        key={idx}
                        initial={{ opacity: 0, x: -30 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: idx * 0.1 }}
                        onClick={() => setSelectedObligation(ob)}
                        className={`p-10 rounded-[48px] border cursor-pointer transition-all duration-500 group relative overflow-hidden ${selectedObligation === ob ? 'bg-violet-500/20 border-violet-500/60 shadow-[0_0_50px_rgba(139,92,246,0.2)]' : 'bg-white/5 border-white/10 hover:border-violet-500/40 hover:bg-white/[0.08]'} ${acknowledgedClauses.has(ob.title) ? 'opacity-60' : ''}`}
                      >
                        <div className="absolute top-0 right-0 p-8 flex items-center gap-4">
                           {acknowledgedClauses.has(ob.title) && (
                             <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} className="px-4 py-1 rounded-full bg-emerald-500 text-black text-[10px] font-black uppercase tracking-widest shadow-[0_0_20px_rgba(16,185,129,0.5)]">
                               VERIFIED_COMPREHENSION
                             </motion.div>
                           )}
                           <svg className={`w-5 h-5 transition-all ${selectedObligation === ob ? 'text-violet-500 rotate-90 scale-125' : 'text-white/20 group-hover:text-white group-hover:translate-x-1'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M14 5l7 7m0 0l-7 7m7-7H3" /></svg>
                        </div>
                        <div className="flex justify-between items-start mb-6">
                          <h4 className="text-2xl font-black italic uppercase text-white tracking-tighter leading-none group-hover:text-violet-400 transition-colors max-w-[70%]">{ob.title}</h4>
                          <span className={`text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-widest ${ob.riskLevel === 'HIGH' ? 'bg-red-500 text-white shadow-[0_0_15px_rgba(239,68,68,0.4)]' : ob.riskLevel === 'MEDIUM' ? 'bg-amber-500 text-black shadow-[0_0_15px_rgba(245,158,11,0.3)]' : 'bg-emerald-500 text-black shadow-[0_0_15px_rgba(16,185,129,0.3)]'}`}>
                            {ob.riskLevel} IMPACT
                          </span>
                        </div>
                        <p className="text-lg text-white/70 leading-relaxed italic mb-8 font-light max-w-[90%]">"{ob.simplifiedMeaning}"</p>
                        <div className="flex flex-wrap gap-3">
                          {ob.glosses.map(g => (
                            <span key={g} className={`text-[10px] font-mono px-4 py-1.5 rounded-full border uppercase tracking-widest transition-all ${glossErrors[g] ? 'text-red-400 bg-red-400/10 border-red-400/30' : 'text-violet-400 bg-violet-400/10 border-violet-400/30 group-hover:bg-violet-500 group-hover:text-white'}`}>
                              {g}
                            </span>
                          ))}
                        </div>
                      </motion.div>
                    ))
                  ) : (
                    <div className="h-full flex flex-col items-center justify-center p-20 text-center gap-12 opacity-10">
                       <div className="w-40 h-40 rounded-[64px] border-4 border-dashed border-white mx-auto animate-spin-slow mb-6" />
                       <h2 className="text-2xl font-black uppercase tracking-[2em] italic">Awaiting Buffer</h2>
                    </div>
                  )}
                </div>

                {analysis && (
                  <div className="p-10 rounded-[48px] bg-white/[0.03] border border-white/10 flex items-center justify-between backdrop-blur-2xl">
                     <div className="space-y-4">
                        <span className="text-[11px] text-white/30 uppercase font-black tracking-[0.4em]">Document Ambiguity Rating</span>
                        <div className="flex gap-2">
                          {[...Array(10)].map((_, i) => (
                            <motion.div 
                              key={i} 
                              initial={{ scale: 0 }}
                              animate={{ scale: 1 }}
                              transition={{ delay: i * 0.05 }}
                              className={`h-5 w-8 rounded-md transition-all duration-1000 ${i < analysis.ambiguityLevel ? 'bg-violet-500 shadow-[0_0_15px_rgba(139,92,246,0.5)]' : 'bg-white/5'}`} 
                            />
                          ))}
                        </div>
                     </div>
                     {analysis.professionalAdviceNeeded && (
                       <div className="px-8 py-4 rounded-[32px] bg-amber-500/10 border-2 border-amber-500/40 text-amber-500 text-[11px] font-black uppercase tracking-widest animate-pulse flex items-center gap-3">
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
                          Counsel Advised
                       </div>
                     )}
                  </div>
                )}
             </div>
          </div>

          {/* AVATAR PERFORMANCE MODULE */}
          <div className="lg:col-span-5 flex flex-col gap-10">
             <div className="relative aspect-square liquid-glass rounded-[72px] overflow-hidden bg-black/60 border border-white/10 shadow-3xl flex flex-col items-center justify-center">
                <div className="absolute inset-0 forensic-grid opacity-[0.1] pointer-events-none" />
                {selectedObligation ? (
                  <div className="relative w-full h-full flex flex-col items-center justify-center p-16">
                     <div className="absolute top-12 left-12 flex items-center gap-4">
                        <div className={`w-3 h-3 rounded-full ${isPlaying ? 'bg-violet-500 animate-ping' : 'bg-white/20'}`} />
                        <span className="text-[11px] font-black text-violet-400 uppercase tracking-[0.4em] font-mono">Performance_Uplink: Word-by-Word</span>
                     </div>
                     
                     <AnimatePresence mode="wait">
                       <motion.div 
                         key={activeGlossIdx}
                         initial={{ opacity: 0, scale: 0.9, rotate: -2, filter: 'blur(15px)' }}
                         animate={{ opacity: 1, scale: 1, rotate: 0, filter: 'blur(0px)' }}
                         exit={{ opacity: 0, scale: 1.1, rotate: 2, filter: 'blur(15px)' }}
                         transition={{ duration: 0.8, ease: [0.19, 1, 0.22, 1] }}
                         className="relative w-full h-full flex items-center justify-center"
                       >
                         {activeGloss && glossImages[activeGloss] ? (
                           <img 
                             src={glossImages[activeGloss]} 
                             className="max-w-full max-h-full object-contain drop-shadow-[0_0_120px_rgba(139,92,246,0.5)] brightness-125" 
                             alt={activeGloss}
                           />
                         ) : hasActiveGlossError ? (
                           <div className="flex flex-col items-center gap-6 text-center p-16">
                             <div className="w-20 h-20 rounded-3xl bg-red-500/10 border border-red-500/20 flex items-center justify-center text-red-500 mb-4">
                               <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
                             </div>
                             <span className="text-xs font-black uppercase tracking-[0.6em] text-red-400 opacity-60">Synthesis_Error</span>
                             <button 
                               onClick={() => activeGloss && loadGloss(activeGloss, synthesisSessionRef.current)}
                               className="px-8 py-3 rounded-2xl bg-white/5 border border-white/10 text-[10px] font-black uppercase tracking-widest text-white/40 hover:text-white hover:border-violet-500/50 transition-all"
                             >
                               Retry_Frame_Capture
                             </button>
                           </div>
                         ) : (
                           <div className="flex flex-col items-center gap-8">
                             <div className="w-24 h-24 rounded-full border-[6px] border-dashed border-violet-500 animate-spin" />
                             <span className="text-[11px] font-black text-white/20 uppercase tracking-[1em] animate-pulse">Syncing_Joint_Frames</span>
                           </div>
                         )}
                       </motion.div>
                     </AnimatePresence>

                     <div className="absolute bottom-12 inset-x-12 flex flex-col gap-6">
                        <div className="flex justify-center gap-2">
                           {selectedObligation.glosses.map((_, i) => (
                             <div 
                               key={i} 
                               className={`h-1 flex-1 rounded-full transition-all duration-700 ${i === activeGlossIdx ? 'bg-violet-500 shadow-[0_0_10px_#8b5cf6]' : i < activeGlossIdx ? 'bg-violet-500/40' : 'bg-white/5'}`} 
                             />
                           ))}
                        </div>

                        <motion.div 
                          layout
                          className="p-10 rounded-[48px] bg-black/80 backdrop-blur-3xl border-2 border-violet-500/40 text-center shadow-[0_0_50px_rgba(139,92,246,0.2)]"
                        >
                           <span className="text-[12px] font-black text-violet-500/60 uppercase tracking-[0.5em] block mb-4">Linguistic Token {activeGlossIdx + 1}/{selectedObligation.glosses.length}</span>
                           <h4 className="text-6xl font-black italic uppercase text-white tracking-tighter leading-none drop-shadow-[0_0_20px_rgba(255,255,255,0.3)]">"{activeGloss || "..."}"</h4>
                        </motion.div>
                     </div>
                  </div>
                ) : (
                  <div className="text-center p-24 opacity-10 uppercase text-xs tracking-[2.5em] italic">
                     Awaiting Neural Trigger
                  </div>
                )}
             </div>

             {selectedObligation && (
               <div className="p-12 rounded-[56px] bg-white/[0.02] border border-white/10 space-y-8 backdrop-blur-xl flex flex-col">
                  <div className="flex justify-between items-center">
                    <h4 className="text-[12px] font-black uppercase text-white/30 tracking-[0.5em]">Forensic Parity Trace</h4>
                    {acknowledgedClauses.has(selectedObligation.title) && (
                      <span className="text-[9px] font-black text-emerald-400 uppercase tracking-widest flex items-center gap-2">
                        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/></svg>
                        ACKNOWLEDGED
                      </span>
                    )}
                  </div>
                  <div className="p-8 rounded-[32px] bg-black/40 border border-white/5 flex-1">
                    <p className="text-sm text-white/50 leading-relaxed italic line-clamp-8">"{selectedObligation.originalText}"</p>
                  </div>
                  <div className="flex flex-col gap-4">
                     <button 
                        onClick={() => setIsPlaying(!isPlaying)} 
                        className={`w-full py-6 rounded-[32px] font-black uppercase text-xs tracking-[0.3em] transition-all duration-700 shadow-2xl flex items-center justify-center gap-4 ${isPlaying ? 'bg-white text-black' : 'bg-violet-600 text-white shadow-violet-600/30'}`}
                      >
                       {isPlaying ? <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><rect x="6" y="6" width="12" height="12" rx="2" /></svg> : <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M8 5v14l11-7z" /></svg>}
                       {isPlaying ? 'Pause Performance' : 'Replay Performance'}
                     </button>
                     
                     <button 
                        onClick={() => toggleAcknowledge(selectedObligation.title)}
                        className={`w-full py-6 rounded-[32px] font-black uppercase text-xs tracking-[0.3em] transition-all border-2 flex items-center justify-center gap-4 ${acknowledgedClauses.has(selectedObligation.title) ? 'bg-emerald-500/10 border-emerald-500 text-emerald-400' : 'bg-white text-black border-white hover:bg-emerald-50 hover:border-emerald-500 transition-colors'}`}
                      >
                       {acknowledgedClauses.has(selectedObligation.title) ? (
                         <>
                           <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/></svg>
                           COMPREHENSION VERIFIED
                         </>
                       ) : (
                         'ACKNOWLEDGE CLAUSE'
                       )}
                     </button>

                     <button 
                        onClick={() => setSelectedObligation(null)} 
                        className="w-full py-4 rounded-[32px] border border-white/10 text-white/40 hover:text-white hover:border-red-500/50 hover:bg-red-500/10 transition-all text-[9px] font-black uppercase tracking-widest"
                      >
                       Deselect Trace
                     </button>
                  </div>
               </div>
             )}
          </div>
        </div>
      </section>

      <AgenticPulse isAnalyzing={isAnalyzing || isPlaying} intensity={isAnalyzing ? 5 : 2} />
    </div>
  );
};

export default FormBridge;
