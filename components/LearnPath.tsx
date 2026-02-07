
import React, { useState, useMemo, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { SignSymbol, StudioSettings } from '../types';
import { GeminiService } from '../services/geminiService';
import AgenticPulse from './AgenticPulse';
import TabBriefing from './TabBriefing';

interface LearnPathProps {
  onAriaToast: (m: string) => void;
}

const CATEGORIES = [
  { 
    id: 'family', 
    label: 'Family', 
    icon: '🏠', 
    words: ['MOTHER', 'FATHER', 'BROTHER', 'SISTER', 'HOME', 'BABY', 'GRANDMOTHER', 'GRANDFATHER', 'UNCLE', 'AUNT', 'COUSIN', 'FAMILY'] 
  },
  { 
    id: 'social', 
    label: 'Social', 
    icon: '🤝', 
    words: ['HELLO', 'THANK_YOU', 'SORRY', 'FRIEND', 'PARTY', 'PLEASE', 'GOODBYE', 'NICE', 'WELCOME', 'CONGRATS', 'MEETING', 'SHARE'] 
  },
  { 
    id: 'emergency', 
    label: 'Emergency', 
    icon: '🚨', 
    words: ['HELP', 'DANGER', 'POLICE', 'FIRE', 'HOSPITAL', 'PAIN', 'AMBULANCE', 'DOCTOR', 'MEDICINE', 'ACCIDENT', 'URGENT', 'BLEEDING'] 
  },
  { 
    id: 'professional', 
    label: 'Professional', 
    icon: '💼', 
    words: ['BOSS', 'MEETING', 'CONTRACT', 'OFFICE', 'SALARY', 'WORK', 'EMAIL', 'INTERVIEW', 'PROJECT', 'DEADLINE', 'REPORT', 'TEAM'] 
  },
  { 
    id: 'casual', 
    label: 'Casual', 
    icon: '☕', 
    words: ['COOL', 'HAPPY', 'EAT', 'SLEEP', 'PLAY', 'COFFEE', 'MUSIC', 'MOVIE', 'GAME', 'JOKE', 'LAUGH', 'DANCE'] 
  },
  { 
    id: 'education', 
    label: 'Education', 
    icon: '🎓', 
    words: ['SCHOOL', 'TEACHER', 'STUDENT', 'BOOK', 'LEARN', 'STUDY', 'WRITE', 'READ', 'QUESTION', 'ANSWER', 'TEST', 'CLASS'] 
  },
  { 
    id: 'food', 
    label: 'Food & Health', 
    icon: '🍎', 
    words: ['HUNGRY', 'THIRSTY', 'WATER', 'BREAD', 'APPLE', 'DINNER', 'HEALTHY', 'SICK', 'FEVER', 'EXERCISE', 'FRUIT', 'VEGETABLE'] 
  },
  { 
    id: 'travel', 
    label: 'Travel', 
    icon: '✈️', 
    words: ['TRAVEL', 'AIRPLANE', 'CAR', 'TRAIN', 'HOTEL', 'CITY', 'MAP', 'WHERE', 'TICKET', 'BUS', 'AIRPORT', 'STATION'] 
  },
  { 
    id: 'emotions', 
    label: 'Emotions', 
    icon: '🧠', 
    words: ['HAPPY', 'SAD', 'ANGRY', 'SCARED', 'EXCITED', 'TIRED', 'CONFUSED', 'PROUD', 'SHY', 'BORED', 'SURPRISED', 'LOVE'] 
  },
  { 
    id: 'time', 
    label: 'Time & Nature', 
    icon: '🌍', 
    words: ['TODAY', 'TOMORROW', 'YESTERDAY', 'MORNING', 'NIGHT', 'WEEK', 'MONTH', 'YEAR', 'SUN', 'RAIN', 'SNOW', 'TREE'] 
  }
];

const KINETIC_STYLE = "Clinical 8k resolution. Orthopedic medical photography style. Translucent dark obsidian glass humanoid figure. Internal bright cyan skeletal filaments. HIGH CONTRAST hand-to-body interaction. Clear finger-to-body contact points. Sharp articulation. Neutral black studio background. Medium close-up framing (waist-up).";

const SectionHeader: React.FC<{ title: string; subtitle: string; color: string }> = ({ title, subtitle, color }) => (
  <div className="mb-12 space-y-4">
    <div className="flex items-center gap-4">
      <span className="px-4 py-1 rounded-full border text-[10px] font-mono font-black uppercase tracking-widest" style={{ borderColor: `${color}44`, color, backgroundColor: `${color}11` }}>
        KINETIC_CURRICULUM_v5.0
      </span>
      <div className="flex-1 h-px bg-white/10" />
    </div>
    <h2 className="text-4xl md:text-6xl font-black italic tracking-tighter uppercase text-white leading-none">
      {title} <span style={{ color }}>{subtitle}</span>
    </h2>
  </div>
);

const LearnPath: React.FC<LearnPathProps> = ({ onAriaToast }) => {
  const [activeCategory, setActiveCategory] = useState(CATEGORIES[0]);
  const [selectedWord, setSelectedWord] = useState<string | null>(null);
  const [currentSymbol, setCurrentSymbol] = useState<SignSymbol | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isSynthesizing, setIsSynthesizing] = useState(false);
  const [showAudit, setShowAudit] = useState(false);

  const gemini = useMemo(() => new GeminiService(), []);

  const handleWordSelect = async (word: string) => {
    setSelectedWord(word);
    setIsAnalyzing(true);
    setCurrentSymbol(null);
    setShowAudit(false);
    onAriaToast(`MAP_ANATOMY_INITIALIZED: ${word}`);

    try {
      // Step 1: Map Anatomy (Get Linguistic Data)
      const symbols = await gemini.convertToSignSymbols(word, { variant: 'ASL', speed: 1, handedness: 'right', visualStyle: 'cyber' });
      const symbol = symbols[0];
      
      if (!symbol) throw new Error("MAPPING_FAILURE");
      
      setIsAnalyzing(false);
      setIsSynthesizing(true);
      onAriaToast("SYNTHESIZE_FRAME_ACTIVE");

      // Step 2: Synthesize Frame (Get Image)
      const physicalConstraint = `SIGN LANGUAGE ACCURACY: ASL sign for "${word}". 
      POSE DESCRIPTION: ${symbol.imagePrompt}. 
      CORE REQUIREMENT: HANDS MUST BE ANCHORED AT ${symbol.anatomicalLocation || 'NEUTRAL SPACE'}. 
      STYLE OVERRIDE: ${KINETIC_STYLE}`;
      
      const imageUrl = await gemini.generateSignImage(physicalConstraint);
      setCurrentSymbol({ ...symbol, imageUrl });
      
      setIsSynthesizing(false);
      onAriaToast("PLAY_PERFORMANCE_READY");
    } catch (e) {
      console.error(e);
      onAriaToast("NEURAL_UPLINK_ERROR");
      setIsAnalyzing(false);
      setIsSynthesizing(false);
    }
  };

  return (
    <div className="max-w-[1700px] mx-auto px-8 flex flex-col gap-32">
      <TabBriefing 
        title="MODEL: NEURAL CURRICULUM"
        description="The LearnPath engine deconstructs linguistic categories into sub-millimeter kinetic performance frames, establishing absolute parity in educational signing."
        steps={["SELECT TEXT", "MAP ANATOMY", "SYNTHESIZE FRAME", "PLAY PERFORMANCE"]}
        color="#a855f7"
      />

      {/* 1. CATEGORY & WORD STAGE */}
      <section className="flex flex-col gap-12">
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-end gap-10">
          <SectionHeader title="KINETIC STAGE:" subtitle="Lexicon Selection" color="#a855f7" />
          
          <div className="flex gap-4 mb-12 overflow-x-auto pb-4 custom-scrollbar-horizontal w-full lg:w-auto">
            {CATEGORIES.map(cat => (
              <button
                key={cat.id}
                onClick={() => { setActiveCategory(cat); setSelectedWord(null); setCurrentSymbol(null); }}
                className={`flex items-center gap-3 px-8 py-4 rounded-[32px] border transition-all whitespace-nowrap ${
                  activeCategory.id === cat.id 
                    ? 'bg-purple-600 border-purple-400 text-white shadow-lg shadow-purple-600/20' 
                    : 'bg-white/5 border-white/10 text-white/40 hover:text-white hover:bg-white/10'
                }`}
              >
                <span className="text-xl">{cat.icon}</span>
                <span className="text-[11px] font-black uppercase tracking-widest">{cat.label}</span>
              </button>
            ))}
          </div>
        </div>

        <div className="grid lg:grid-cols-12 gap-12">
          {/* WORD SELECTION GRID */}
          <div className="lg:col-span-4 liquid-glass rounded-[64px] p-12 bg-black/40 border-white/5 flex flex-col gap-10 h-[700px] shadow-3xl">
             <div className="flex justify-between items-center border-b border-white/5 pb-8">
                <h3 className="text-[14px] font-black uppercase text-purple-500 tracking-[0.4em]">Curriculum Bank</h3>
                <span className="text-[10px] font-mono text-white/20 uppercase tracking-widest">{activeCategory.label}_v5.0</span>
             </div>
             
             <div className="flex-1 overflow-y-auto custom-scrollbar pr-4">
                <div className="grid grid-cols-2 gap-4">
                   {activeCategory.words.map(word => (
                     <motion.button
                       key={word}
                       whileHover={{ scale: 1.02 }}
                       whileTap={{ scale: 0.98 }}
                       onClick={() => handleWordSelect(word)}
                       className={`p-6 rounded-[32px] border text-center transition-all flex flex-col items-center justify-center gap-2 group ${
                         selectedWord === word 
                           ? 'bg-purple-500/20 border-purple-500 shadow-[0_0_30px_rgba(168,85,247,0.2)]' 
                           : 'bg-white/5 border-white/10 hover:border-white/20'
                       }`}
                     >
                        <span className={`text-xs font-black uppercase tracking-widest ${selectedWord === word ? 'text-white' : 'text-white/40 group-hover:text-white/70'}`}>{word}</span>
                        {selectedWord === word && <div className="w-1.5 h-1.5 rounded-full bg-purple-500 animate-pulse" />}
                     </motion.button>
                   ))}
                </div>
             </div>

             <div className="p-8 rounded-[32px] bg-purple-500/5 border border-purple-500/10">
                <p className="text-[10px] text-white/30 italic leading-relaxed uppercase tracking-wider">
                  Select a token to initialize the 4-step kinetic performance pipeline.
                </p>
             </div>
          </div>

          {/* PERFORMANCE HUD STAGE */}
          <div className="lg:col-span-8 liquid-glass rounded-[64px] bg-black/60 border border-white/5 flex flex-col shadow-3xl h-[700px] relative overflow-hidden">
             <div className="absolute inset-0 forensic-grid opacity-[0.05] pointer-events-none" />
             
             <div className="flex-1 flex flex-col items-center justify-center p-12">
                <AnimatePresence mode="wait">
                  {isAnalyzing || isSynthesizing ? (
                    <motion.div 
                      key="loading" 
                      initial={{ opacity: 0 }} 
                      animate={{ opacity: 1 }} 
                      exit={{ opacity: 0 }}
                      className="flex flex-col items-center gap-12 text-center"
                    >
                       <div className="relative w-48 h-48">
                          <div className="absolute inset-0 border-t-4 border-purple-500 rounded-full animate-spin" />
                          <div className="absolute inset-4 border-b-4 border-cyan-400 rounded-full animate-spin-slow opacity-40" />
                       </div>
                       <div className="space-y-4">
                          <span className="text-[14px] font-black text-purple-400 uppercase tracking-[1em] animate-pulse block">
                            {isAnalyzing ? "MAP_ANATOMY_ACTIVE" : "SYNTHESIZE_FRAME_ACTIVE"}
                          </span>
                          <p className="text-[10px] text-white/20 uppercase tracking-widest font-mono italic">
                            {isAnalyzing ? "Isolating kinetic joint vectors..." : "Rendering obsidian archetypes..."}
                          </p>
                       </div>
                    </motion.div>
                  ) : currentSymbol?.imageUrl ? (
                    <motion.div 
                      key="image" 
                      initial={{ opacity: 0, scale: 0.95 }} 
                      animate={{ opacity: 1, scale: 1 }}
                      className="w-full h-full flex flex-col items-center justify-center relative"
                    >
                       <img 
                         src={currentSymbol.imageUrl} 
                         className="max-w-full max-h-full object-contain drop-shadow-[0_0_120px_rgba(168,85,247,0.4)] brightness-110" 
                         alt={currentSymbol.word} 
                       />
                       
                       <div className="absolute bottom-4 inset-x-0 flex justify-center">
                          <div className="px-10 py-6 bg-black/80 backdrop-blur-3xl border-2 border-purple-500/40 rounded-[48px] shadow-2xl flex items-center gap-8">
                             <div className="flex flex-col">
                                <span className="text-[9px] font-black text-purple-400 uppercase tracking-[0.4em] mb-1">KINETIC_ID</span>
                                <h4 className="text-4xl font-black text-white italic uppercase tracking-tighter leading-none">"{currentSymbol.word}"</h4>
                             </div>
                             <div className="w-px h-12 bg-white/10" />
                             <button 
                               onClick={() => setShowAudit(!showAudit)}
                               className="px-6 py-2 rounded-2xl bg-white text-black font-black uppercase text-[10px] tracking-widest hover:bg-purple-500 hover:text-white transition-all shadow-lg"
                             >
                               {showAudit ? "CLOSE DOSSIER" : "OPEN AUDIT"}
                             </button>
                          </div>
                       </div>

                       <div className="absolute top-0 right-0 flex flex-col gap-4 items-end">
                          <div className="px-4 py-2 rounded-full bg-emerald-500 text-black text-[9px] font-black uppercase tracking-widest shadow-lg">PLAY_PERFORMANCE</div>
                          <div className="px-4 py-2 rounded-full bg-white/5 border border-white/10 text-white/40 text-[9px] font-black uppercase tracking-widest">FPS: 24.0 FIXED</div>
                       </div>
                    </motion.div>
                  ) : (
                    <motion.div 
                      key="idle" 
                      initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                      className="text-center space-y-12 opacity-10 uppercase text-xs tracking-[2.5em] italic p-20"
                    >
                       <div className="w-40 h-40 rounded-[64px] border-4 border-dashed border-white mx-auto animate-spin-slow mb-8" />
                       Awaiting Selection
                    </motion.div>
                  )}
                </AnimatePresence>
             </div>
          </div>
        </div>
      </section>

      {/* 2. AUDIT DOSSIER REPOSITORY */}
      <section className="flex flex-col gap-12 mb-32">
        <SectionHeader title="AUDIT DOSSIER:" subtitle="Kinetic Specification Buffer" color="#06b6d4" />
        <div className="grid lg:grid-cols-12 gap-12">
          <div className="lg:col-span-8">
             <div className="liquid-glass rounded-[64px] p-16 bg-black/40 border border-white/5 flex flex-col gap-12 relative overflow-hidden h-[600px]">
                <div className="absolute top-0 left-0 right-0 h-[2px] overflow-hidden">
                   <motion.div animate={{ x: ['-100%', '100%'] }} transition={{ repeat: Infinity, duration: 4 }} className="w-1/2 h-full bg-cyan-500 opacity-20 shadow-[0_0_20px_#06b6d4]" />
                </div>
                
                <AnimatePresence mode="wait">
                  {currentSymbol ? (
                    <motion.div 
                      key={currentSymbol.word}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      className="space-y-10"
                    >
                       <div className="space-y-4">
                          <h3 className="text-xs font-black uppercase text-cyan-400 tracking-[0.4em]">Movement Trajectory Trace</h3>
                          <p className="text-3xl md:text-5xl font-light text-white leading-[1.3] italic tracking-tight">"{currentSymbol.trajectoryDescription}"</p>
                       </div>
                       
                       <div className="grid grid-cols-2 md:grid-cols-4 gap-8 pt-10 border-t border-white/5">
                          {[
                            { l: 'Handshape', v: currentSymbol.technicalTutorial.handShape },
                            { l: 'Location', v: currentSymbol.anatomicalLocation },
                            { l: 'Velocity', v: 'Nominal' },
                            { l: 'Category', v: currentSymbol.movementCategory }
                          ].map((spec, i) => (
                            <div key={i} className="space-y-2">
                               <span className="text-[9px] font-black text-white/20 uppercase tracking-widest">{spec.l}</span>
                               <div className="text-sm font-bold text-cyan-400 uppercase font-mono">{spec.v}</div>
                            </div>
                          ))}
                       </div>

                       <div className="p-8 rounded-[40px] bg-white/[0.03] border border-white/10 space-y-4">
                          <span className="text-[9px] font-black text-white/30 uppercase tracking-widest">Linguistic Archetype Context</span>
                          <p className="text-sm text-white/60 leading-relaxed italic">{currentSymbol.definition}</p>
                       </div>
                    </motion.div>
                  ) : (
                    <div className="h-full flex flex-col items-center justify-center opacity-10 uppercase text-xs tracking-[2em] text-center italic p-20">
                       Awaiting Lexeme Sync...
                    </div>
                  )}
                </AnimatePresence>
             </div>
          </div>

          {/* GLYPH REPOSITORY SIMILAR COLUMN */}
          <div className="lg:col-span-4 flex flex-col gap-8">
             <div className="flex-1 liquid-glass rounded-[56px] border-white/5 p-12 bg-black/40 flex flex-col gap-10">
                <h3 className="text-[12px] font-black uppercase text-cyan-400 tracking-[0.4em]">Kinetic Performance Specs</h3>
                <div className="space-y-6">
                   <div className="p-6 rounded-[32px] bg-white/5 border border-white/5 space-y-4">
                      <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-widest text-white/30">
                         <span>Anatomy Sync</span>
                         <span className="text-cyan-400">{isAnalyzing || isSynthesizing ? 'ACTIVE' : 'READY'}</span>
                      </div>
                      <div className="h-1 w-full bg-white/5 rounded-full overflow-hidden">
                         <motion.div animate={{ width: (isAnalyzing || isSynthesizing) ? '100%' : '0%' }} transition={{ duration: 2 }} className="h-full bg-cyan-500" />
                      </div>
                   </div>

                   <div className="p-6 rounded-[32px] bg-white/5 border border-white/5 space-y-4">
                      <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-widest text-white/30">
                         <span>3D Mesh Frame</span>
                         <span className="text-cyan-400">{currentSymbol?.imageUrl ? 'LOCKED' : 'AWAITING'}</span>
                      </div>
                      <div className="h-1 w-full bg-white/5 rounded-full overflow-hidden">
                         <motion.div animate={{ width: currentSymbol?.imageUrl ? '100%' : '0%' }} className="h-full bg-cyan-500" />
                      </div>
                   </div>

                   <div className="p-6 rounded-[32px] bg-white/5 border border-white/5 space-y-4">
                      <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-widest text-white/30">
                         <span>Linguistic Parity</span>
                         <span className="text-cyan-400">100% v5.0</span>
                      </div>
                      <div className="h-1 w-full bg-white/5 rounded-full overflow-hidden">
                         <motion.div initial={{ width: '100%' }} className="h-full bg-cyan-500" />
                      </div>
                   </div>
                </div>

                <div className="mt-auto flex flex-col gap-4 pt-10 border-t border-white/5">
                   <button 
                     onClick={() => setShowAudit(true)} disabled={!currentSymbol}
                     className="w-full py-6 rounded-[32px] bg-cyan-500 text-black font-black uppercase italic tracking-[0.3em] text-[10px] shadow-2xl hover:scale-[1.02] disabled:opacity-20 transition-all"
                   >
                     GENERATE ARCHETYPE DOSSIER
                   </button>
                   <button 
                     onClick={() => { setSelectedWord(null); setCurrentSymbol(null); }}
                     className="w-full py-4 rounded-[28px] border border-white/10 text-white/30 font-black uppercase tracking-widest text-[9px] hover:text-white transition-all"
                   >
                     Reset Stage
                   </button>
                </div>
             </div>
          </div>
        </div>
      </section>

      <AgenticPulse isAnalyzing={isAnalyzing || isSynthesizing} intensity={isSynthesizing ? 4 : 2} />
    </div>
  );
};

export default LearnPath;
