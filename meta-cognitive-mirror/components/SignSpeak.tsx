import React, { useState, useEffect, useMemo, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { SignInterpretation } from '../types';
import { GeminiService } from '../services/geminiService';
import GhostOverlay from './GhostOverlay';
import AgenticPulse from './AgenticPulse';
import TabBriefing from './TabBriefing';

interface SignSpeakProps {
  onInterpret: () => Promise<void>;
  interpretations: SignInterpretation[];
  isInterpreting: boolean;
  videoRef: React.RefObject<HTMLVideoElement | null>;
  videoFileUrl: string | null;
  activeStream?: MediaStream | null;
  onFileUploadClick: () => void;
  onLiveCameraClick: () => void;
  onRemoveVideo: () => void;
  isLiveLink: boolean;
  isScanning?: boolean;
  onToggleScan?: () => void;
  selectedSignLanguage: string;
  onLanguageChange: (l: string) => void;
  onNewKineticStage: () => void;
}

const SIGN_LANGUAGES = ["ASL", "ISL", "BSL", "LSF", "DGS", "Auslan"];

const SectionHeader: React.FC<{ title: string; subtitle: string; color: string }> = ({ title, subtitle, color }) => (
  <div className="mb-12 space-y-4">
    <div className="flex items-center gap-4">
      <span className="px-4 py-1 rounded-full border text-[10px] font-mono font-black uppercase tracking-widest" style={{ borderColor: `${color}44`, color, backgroundColor: `${color}11` }}>
        KINETIC_LAYER_PROMPT
      </span>
      <div className="flex-1 h-px bg-white/10" />
    </div>
    <h2 className="text-4xl md:text-6xl font-black italic tracking-tighter uppercase text-white leading-none">
      {title} <span style={{ color }}>{subtitle}</span>
    </h2>
  </div>
);

const SignSpeak: React.FC<SignSpeakProps> = ({ 
  interpretations, videoRef, videoFileUrl, activeStream,
  onFileUploadClick, onLiveCameraClick, onRemoveVideo, isScanning, onToggleScan,
  isLiveLink, isInterpreting, selectedSignLanguage, onLanguageChange, onNewKineticStage
}) => {
  const [transcriptText, setTranscriptText] = useState("");
  const [isSynthesizingText, setIsSynthesizingText] = useState(false);
  const [playbackRate, setPlaybackRate] = useState(1);
  const gemini = useMemo(() => new GeminiService(), []);
  const currentInterpretation = interpretations[interpretations.length - 1];
  const synthesisDebounceRef = useRef<number | null>(null);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;
    if (isScanning) { 
      video.playbackRate = playbackRate; 
      video.play().catch(() => {}); 
    } else {
      video.pause();
    }
  }, [isScanning, playbackRate, videoRef]);

  // Reactive and debounced transcript synthesis
  useEffect(() => {
    if (interpretations.length === 0) {
      setTranscriptText("");
      return;
    }

    if (synthesisDebounceRef.current) {
      window.clearTimeout(synthesisDebounceRef.current);
    }

    synthesisDebounceRef.current = window.setTimeout(async () => {
      const glosses = interpretations
        .map(i => i.gloss || i.recognizedSign)
        .filter(g => g && g.toLowerCase() !== 'none');
      
      if (glosses.length === 0) return;
      
      setIsSynthesizingText(true);
      try {
        const text = await gemini.synthesizeTranscript(glosses, selectedSignLanguage);
        if (text) setTranscriptText(text);
      } catch (e) {
        console.error("Narrative synthesis failed", e);
      } finally {
        setIsSynthesizingText(false);
      }
    }, 1500); // 1.5s debounce to allow sequence gathering

    return () => {
      if (synthesisDebounceRef.current) window.clearTimeout(synthesisDebounceRef.current);
    };
  }, [interpretations.length, selectedSignLanguage, gemini]);

  useEffect(() => {
    const v = videoRef.current;
    if (!v) return;

    if (isLiveLink && activeStream) {
      if (v.srcObject !== activeStream) {
        v.srcObject = activeStream;
      }
    } else if (!videoFileUrl) {
      v.srcObject = null;
    }
  }, [isLiveLink, activeStream, videoFileUrl, videoRef]);

  const hasMedia = !!videoFileUrl || isLiveLink;

  return (
    <div className="max-w-[1700px] mx-auto px-8 flex flex-col gap-32">
      <TabBriefing 
        title="MODEL: SIGN CONVERTER"
        description="The Sign Converter utilizes high-speed gesture buffers to translate signed performances into fluent grammatical narratives in real-time."
        steps={["CALIBRATE STAGE", "CAPTURE GESTURES", "BUFFER GLOSSES", "SYNTHESIZE TEXT"]}
        color="#f59e0b"
      />
      
      {/* 1. KINETIC STAGE */}
      <section className="flex flex-col gap-12">
        <div className="flex justify-between items-end">
          <SectionHeader title="KINETIC STAGE:" subtitle="Visual Gesture Capture" color="#f59e0b" />
          <div className="flex gap-4 mb-12 items-center">
            {hasMedia && (
                <div className="flex gap-3 bg-white/5 p-2 rounded-2xl border border-white/5 backdrop-blur-xl">
                  <button 
                    onClick={onFileUploadClick}
                    className="px-4 py-2 rounded-xl bg-white/5 border border-white/10 text-[9px] font-black uppercase text-white/40 hover:text-white hover:border-amber-500/50 transition-all"
                  >
                    Change Video
                  </button>
                  <button 
                    onClick={isLiveLink ? onFileUploadClick : onLiveCameraClick}
                    className="px-4 py-2 rounded-xl bg-white/5 border border-white/10 text-[9px] font-black uppercase text-white/40 hover:text-white hover:border-amber-500/50 transition-all"
                  >
                    {isLiveLink ? 'Switch to Archive' : 'Switch to Sensor'}
                  </button>
                  <button 
                    onClick={onRemoveVideo}
                    className="px-4 py-2 rounded-xl bg-red-500/10 border border-red-500/30 text-[9px] font-black uppercase text-red-400 hover:bg-red-500 hover:text-white transition-all"
                  >
                    Remove
                  </button>
                </div>
            )}
            <div className="flex gap-4 bg-white/5 p-2 rounded-2xl border border-white/5 backdrop-blur-xl">
               <div className="px-4 py-2 flex items-center gap-3">
                  <span className="text-[10px] font-black uppercase text-white/30 tracking-widest:">Sign Variant:</span>
                  <select 
                    value={selectedSignLanguage} 
                    onChange={(e) => onLanguageChange(e.target.value)}
                    className="bg-transparent text-amber-500 text-[11px] font-black uppercase tracking-widest outline-none cursor-pointer"
                  >
                    {SIGN_LANGUAGES.map(lang => <option key={lang} value={lang} className="bg-black">{lang}</option>)}
                  </select>
               </div>
            </div>
          </div>
        </div>

        <div className="grid lg:grid-cols-12 gap-10">
          <div className="lg:col-span-8 relative aspect-video liquid-glass rounded-[64px] overflow-hidden bg-black/60 border border-white/10 shadow-3xl">
            <div className="absolute inset-0 forensic-grid opacity-10 pointer-events-none" />
            {hasMedia ? (
              <>
                <video 
                  ref={videoRef} 
                  src={videoFileUrl || undefined} 
                  className={`w-full h-full object-contain ${isScanning ? 'opacity-100' : 'opacity-40 blur-md'}`} 
                  playsInline 
                  muted={isLiveLink} 
                />
                <GhostOverlay objects={currentInterpretation?.handBox ? [{ label: `${currentInterpretation.gloss || 'GESTURE'}`, box_2d: currentInterpretation.handBox }] : []} visible={isScanning || false} videoRef={videoRef} />
                
                {isInterpreting && (
                  <div className="absolute top-10 right-10 flex items-center gap-4">
                     <span className="text-[10px] font-black text-amber-500 uppercase tracking-widest animate-pulse">Capturing Intent...</span>
                     <div className="w-4 h-4 border-2 border-amber-500 border-t-transparent rounded-full animate-spin" />
                  </div>
                )}
              </>
            ) : (
              <div className="h-full flex flex-col items-center justify-center p-16 text-center gap-12 relative z-10">
                <h2 className="text-4xl md:text-7xl font-black italic uppercase text-white tracking-tighter">Stage <span className="text-amber-500">Standby</span></h2>
                <div className="flex gap-6 w-full max-w-xl">
                  <button onClick={onFileUploadClick} className="flex-1 py-6 rounded-[32px] bg-white/5 border border-amber-500/30 text-amber-500 font-black uppercase text-sm hover:bg-amber-500/10 transition-all">Upload Archive</button>
                  <button onClick={onLiveCameraClick} className="flex-1 py-6 rounded-[32px] bg-white text-black font-black uppercase text-sm hover:scale-105 transition-all">Live Camera</button>
                </div>
              </div>
            )}
          </div>
          <div className="lg:col-span-4 flex flex-col gap-10">
             <div className="flex-1 liquid-glass rounded-[56px] border-white/5 p-12 flex flex-col justify-between relative overflow-hidden bg-black/40">
                <div className="absolute top-0 left-0 right-0 h-[2px] overflow-hidden">
                   <motion.div animate={{ x: ['-100%', '100%'] }} transition={{ repeat: Infinity, duration: 4 }} className="w-1/2 h-full bg-amber-500 opacity-20" />
                </div>
                <div className="space-y-6 relative z-10">
                   <h3 className="text-[12px] font-black uppercase text-amber-500 tracking-[0.4em]">Current Gloss</h3>
                   <AnimatePresence mode="wait">
                     <motion.p 
                        key={currentInterpretation?.gloss || 'idle'} 
                        initial={{ opacity: 0, x: 20, filter: 'blur(10px)' }} 
                        animate={{ opacity: 1, x: 0, filter: 'blur(0px)' }} 
                        className="text-5xl md:text-6xl font-black italic uppercase text-white tracking-tighter leading-none"
                      >
                       {currentInterpretation?.gloss || "Awaiting..."}
                     </motion.p>
                   </AnimatePresence>
                </div>
                <div className="grid grid-cols-2 gap-6 relative z-10 border-t border-white/5 pt-8">
                   <div className="space-y-1">
                      <span className="text-[10px] text-white/30 uppercase font-bold tracking-widest">Confidence</span>
                      <div className="flex items-center gap-2">
                        <span className="text-2xl font-black text-white">{currentInterpretation?.confidence || 0}%</span>
                        <div className="h-1.5 flex-1 bg-white/5 rounded-full overflow-hidden">
                           <motion.div animate={{ width: `${currentInterpretation?.confidence || 0}%` }} className="h-full bg-amber-500" />
                        </div>
                      </div>
                   </div>
                   <div className="space-y-1 text-right">
                      <span className="text-[10px] text-white/30 uppercase font-bold tracking-widest">Velocity</span>
                      <span className="text-2xl font-black text-white">{currentInterpretation?.velocity || 0}</span>
                   </div>
                </div>
             </div>
             
             <div className="flex flex-col gap-4">
                <button 
                  onClick={onToggleScan} 
                  disabled={!hasMedia} 
                  className={`w-full h-24 rounded-[48px] bg-gradient-to-r ${isScanning ? 'from-red-600 to-red-800' : 'from-amber-600 to-orange-700'} font-black italic uppercase tracking-[1em] text-xl shadow-3xl transition-all hover:scale-[1.02] active:scale-95`}
                >
                  {isScanning ? "Stop Converter" : "Start Converter"}
                </button>

                {!isScanning && (hasMedia || interpretations.length > 0) && (
                  <button 
                    onClick={onNewKineticStage}
                    className="w-full h-16 rounded-[32px] bg-white/5 border border-white/10 text-cyan-400 font-black uppercase tracking-[0.3em] text-xs hover:bg-white/10 hover:border-cyan-500/50 transition-all flex items-center justify-center gap-3 group"
                  >
                    <svg className="w-4 h-4 group-hover:rotate-180 transition-transform duration-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /></svg>
                    New Kinetic Stage
                  </button>
                )}
             </div>
          </div>
        </div>
      </section>

      {/* 2. GLOSS BUFFER */}
      <section className="flex flex-col gap-12">
        <SectionHeader title="GLOSS BUFFER:" subtitle="Neural Token Chain" color="#06b6d4" />
        <div className="grid lg:grid-cols-4 gap-10">
          <AnimatePresence>
            {interpretations.length > 0 ? interpretations.slice().reverse().map((item, i) => (
              <motion.div 
                layout key={`${item.timestamp}-${i}`}
                initial={{ opacity: 0, scale: 0.9, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                className="p-10 rounded-[48px] liquid-glass border border-white/5 bg-black/40 flex flex-col gap-6 group hover:border-cyan-500/40 transition-all shadow-xl"
              >
                 <div className="flex justify-between items-center">
                    <span className="text-[9px] font-mono text-white/20 uppercase tracking-widest">Token_{interpretations.length - i}</span>
                    <span className="text-[8px] font-mono text-cyan-400">{item.timestamp}</span>
                 </div>
                 <h4 className="text-3xl font-black italic uppercase text-white tracking-tighter group-hover:text-cyan-400 transition-colors">"{item.gloss}"</h4>
                 <p className="text-xs text-white/40 leading-relaxed font-light italic line-clamp-2">"{item.meaning}"</p>
                 <div className="mt-auto pt-4 border-t border-white/5 flex justify-between items-center">
                    <span className="text-[7px] font-black text-white/20 uppercase tracking-[0.3em]">Affect: {item.sentiment}</span>
                    <div className={`w-1.5 h-1.5 rounded-full ${item.sentiment === 'Urgent' ? 'bg-red-500' : 'bg-cyan-500'} animate-pulse`} />
                 </div>
              </motion.div>
            )) : <div className="lg:col-span-4 p-40 text-center text-white/10 uppercase tracking-[2em] text-xs italic">Awaiting Tokens...</div>}
          </AnimatePresence>
        </div>
      </section>

      {/* 3. LINGUISTIC MAPPING */}
      <section className="flex flex-col gap-12 mb-32">
        <SectionHeader title="LINGUISTIC MAPPING:" subtitle="Natural Narrative Synthesis" color="#8b5cf6" />
        <div className={`liquid-glass p-20 rounded-[72px] border-white/10 bg-black/40 shadow-3xl relative overflow-hidden transition-all duration-700 ${isSynthesizingText ? 'border-purple-500/40' : ''}`}>
           <div className="absolute inset-0 forensic-grid opacity-[0.05] pointer-events-none" />
           {isSynthesizingText && (
              <div className="absolute top-0 left-0 right-0 h-1 overflow-hidden">
                <motion.div 
                  initial={{ x: '-100%' }}
                  animate={{ x: '100%' }}
                  transition={{ repeat: Infinity, duration: 1.5, ease: "linear" }}
                  className="w-1/3 h-full bg-purple-500 shadow-[0_0_15px_#a855f7]"
                />
              </div>
           )}
           <AnimatePresence mode="wait">
              <motion.p 
                key={transcriptText || 'empty'}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: isSynthesizingText ? 0.4 : 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="text-3xl md:text-5xl font-light text-white leading-relaxed italic tracking-tight relative z-10"
              >
                {transcriptText || (isSynthesizingText ? "Initializing linguistic mapping..." : "Awaiting kinetic token sequence for natural narrative reconstruction...")}
              </motion.p>
           </AnimatePresence>
           
           <div className="mt-20 pt-10 border-t border-white/5 flex justify-between items-center relative z-10">
              <div className="flex items-center gap-4">
                 <div className={`w-10 h-10 rounded-xl bg-purple-500/10 border border-purple-500/30 flex items-center justify-center text-purple-400 ${isSynthesizingText ? 'animate-pulse' : ''}`}>
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" /></svg>
                 </div>
                 <span className="text-[10px] font-black text-white/30 uppercase tracking-[0.5em]">Neural Grammar Engine v2.1</span>
              </div>
              <div className="flex items-center gap-2">
                 <span className="text-[10px] font-mono text-purple-400/50 uppercase tracking-widest">
                   {isSynthesizingText ? 'SYNTHESIZING_NARRATIVE...' : 'Syntax_Fidelity_High'}
                 </span>
                 {isSynthesizingText && <div className="w-2 h-2 rounded-full bg-purple-500 animate-ping" />}
              </div>
           </div>
        </div>
      </section>

      <AgenticPulse isAnalyzing={isScanning || isInterpreting || isSynthesizingText} intensity={isSynthesizingText ? 4 : 3} />
    </div>
  );
};

export default SignSpeak;