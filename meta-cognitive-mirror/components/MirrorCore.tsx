
import React, { useEffect, useMemo } from 'react';
import NeuralTimeline from './NeuralTimeline';
import InteractiveTimeline from './InteractiveTimeline';
import GhostOverlay from './GhostOverlay';
import ReasoningCard from './ReasoningCard';
import SentimentGauge from './SentimentGauge';
import AgenticPulse from './AgenticPulse';
import TabBriefing from './TabBriefing';
import { AnalysisEntry, SessionHistory, AppMode } from '../types';
import { motion, AnimatePresence } from 'framer-motion';

interface MirrorCoreProps {
  history: AnalysisEntry[];
  isAnalyzing: boolean;
  isProcessing: boolean;
  activeMode: AppMode;
  onModeChange: (mode: AppMode) => void;
  isPrivacyShieldActive: boolean;
  videoRef: React.RefObject<HTMLVideoElement | null>;
  videoFileUrl: string | null;
  activeStream?: MediaStream | null;
  isLiveLink: boolean;
  duration: number;
  currentTime: number;
  acousticLog: any[];
  previousSessions: SessionHistory[];
  onSeek: (t: number) => void;
  onToggleScan: () => void;
  onManualSynthesis: () => void;
  onFileUploadClick: () => void;
  onLiveCameraClick: () => void;
  onSpeak: (t: string, id: string) => void;
  onRemoveVideo: () => void;
  currentlySpeakingId: string | null;
}

const ResonanceTile: React.FC<{ label: string; value: number; color: string }> = ({ label, value, color }) => (
  <div className="bg-black/60 border border-white/5 p-6 rounded-[24px] flex flex-col justify-between h-[120px] group hover:border-white/10 transition-all relative overflow-hidden">
    {/* Top status bar animation */}
    <div className="absolute top-0 left-0 right-0 h-[1px] overflow-hidden">
      <motion.div 
        animate={{ x: ['-100%', '100%'] }}
        transition={{ repeat: Infinity, duration: 2, ease: "linear" }}
        className="w-1/2 h-full opacity-30"
        style={{ background: `linear-gradient(90deg, transparent, ${color}, transparent)` }}
      />
    </div>
    
    <div className="flex justify-between items-start relative z-10">
      <span className="text-[10px] font-black uppercase tracking-[0.2em] text-cyan-400">{label}</span>
      <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: color, boxShadow: `0 0 10px ${color}` }} />
    </div>
    <div className="flex items-baseline gap-1 relative z-10">
      <span className="text-3xl font-black text-white tabular-nums">{value}</span>
      <span className="text-[10px] font-black text-white/20">%</span>
    </div>
    <div className="h-[2px] w-full bg-white/5 rounded-full overflow-hidden mt-2 relative z-10">
      <motion.div 
        initial={{ width: 0 }} 
        animate={{ width: `${value}%` }} 
        className="h-full" 
        style={{ backgroundColor: color }} 
      />
    </div>
  </div>
);

const SectionHeader: React.FC<{ title: string; subtitle: string; color: string }> = ({ title, subtitle, color }) => (
  <div className="mb-12 space-y-4">
    <div className="flex items-center gap-4">
      <span className="px-4 py-1 rounded-full border text-[10px] font-mono font-black uppercase tracking-widest" style={{ borderColor: `${color}44`, color, backgroundColor: `${color}11` }}>
        FORENSIC_AUDIT_ACTIVE
      </span>
      <div className="flex-1 h-px bg-white/10" />
    </div>
    <h2 className="text-4xl md:text-6xl font-black italic tracking-tighter uppercase text-white leading-none">
      {title} <span style={{ color }}>{subtitle}</span>
    </h2>
  </div>
);

const MirrorCore: React.FC<MirrorCoreProps> = ({ 
  history, isAnalyzing, isProcessing, activeMode, onModeChange, isPrivacyShieldActive, videoRef, videoFileUrl, activeStream, isLiveLink, duration, currentTime, acousticLog, onSeek, onToggleScan, onManualSynthesis, onFileUploadClick, onLiveCameraClick, onSpeak, onRemoveVideo, currentlySpeakingId
}) => {
  const lastEntry = history[history.length - 1];
  const hasMedia = !!videoFileUrl || isLiveLink;

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;
    
    if (isLiveLink && activeStream && video.srcObject !== activeStream) {
      video.srcObject = activeStream;
    }

    if (hasMedia) {
      if (isAnalyzing) {
        video.play().catch(() => {});
      } else {
        video.pause();
      }
    }

    const handleEnded = () => {
      if (isAnalyzing) {
        onToggleScan();
      }
    };

    video.addEventListener('ended', handleEnded);
    return () => video.removeEventListener('ended', handleEnded);
  }, [isAnalyzing, isLiveLink, activeStream, hasMedia, videoRef, onToggleScan]);

  const resonanceData = useMemo(() => {
    if (history.length === 0) {
      const modeColor = activeMode === 'focus' ? '#06b6d4' : activeMode === 'interview' ? '#8b5cf6' : '#f59e0b';
      const labels = activeMode === 'focus' 
        ? ['Attention', 'Blink Rate', 'Cognitive Load', 'Posture Symmetry']
        : activeMode === 'interview'
          ? ['Self-Confidence', 'Vocal Clarity', 'Linguistic Stability', 'Micro-Expressions']
          : ['Empathy Resonance', 'Active Listening', 'Sync Frequency', 'Turn Pacing'];
      
      return labels.map(label => ({ label, value: 0, color: modeColor }));
    }

    const focusVal = lastEntry?.focusLevel || 0;
    const emotionVal = lastEntry?.emotion_score ? Math.round(lastEntry.emotion_score * 100) : 0;
    
    if (activeMode === 'focus') {
      return [
        { label: 'Attention', value: focusVal, color: '#06b6d4' },
        { label: 'Blink Rate', value: Math.max(0, 100 - focusVal), color: '#06b6d4' },
        { label: 'Cognitive Load', value: emotionVal, color: '#06b6d4' },
        { label: 'Posture Symmetry', value: Math.round(focusVal * 0.9), color: '#06b6d4' }
      ];
    } else if (activeMode === 'interview') {
      return [
        { label: 'Self-Confidence', value: emotionVal, color: '#8b5cf6' },
        { label: 'Vocal Clarity', value: focusVal, color: '#8b5cf6' },
        { label: 'Linguistic Stability', value: 100 - Math.abs(50 - emotionVal) * 2, color: '#8b5cf6' },
        { label: 'Micro-Expressions', value: Math.round(emotionVal / 1.5), color: '#8b5cf6' }
      ];
    } else {
      return [
        { label: 'Empathy Resonance', value: emotionVal, color: '#f59e0b' },
        { label: 'Active Listening', value: focusVal, color: '#f59e0b' },
        { label: 'Sync Frequency', value: Math.round((focusVal + emotionVal) / 2), color: '#f59e0b' },
        { label: 'Turn Pacing', value: 85, color: '#f59e0b' }
      ];
    }
  }, [history, lastEntry, activeMode]);

  return (
    <div className="max-w-[1700px] mx-auto px-8 flex flex-col gap-32">
      <TabBriefing 
        title="MODEL: BEHAVIORAL FORENSICS"
        description="Mirror Core executes industrial-grade behavioral auditing by isolating neural-kinetic nodes to track deep-work engagement and professional flow."
        steps={["UPLINK ARCHIVE", "INITIALIZE AUDIT", "TRACK RESONANCE", "SYNTHESIZE DOSSIER"]}
        color="#06b6d4"
      />

      {/* MODE HUD SWITCHER */}
      <div className="flex flex-col items-center gap-6 -mb-16">
        <span className="text-[10px] font-black uppercase text-white/30 tracking-[0.6em] font-mono">NEURAL_MODALITY_CALIBRATION</span>
        <div className="flex bg-white/5 p-2 rounded-[40px] border border-white/10 shadow-3xl backdrop-blur-3xl">
          {(['focus', 'synergy', 'interview'] as AppMode[]).map(mode => (
            <button
              key={mode}
              onClick={() => onModeChange(mode)}
              className={`px-12 py-4 rounded-[32px] text-[11px] font-black uppercase tracking-[0.2em] transition-all duration-700 relative group overflow-hidden ${
                activeMode === mode 
                  ? 'text-black' 
                  : 'text-white/40 hover:text-white hover:bg-white/5'
              }`}
            >
              {activeMode === mode && (
                <motion.div 
                  layoutId="active-mode-bg"
                  className="absolute inset-0 bg-cyan-500 shadow-[0_0_30px_rgba(6,182,212,0.6)]"
                  transition={{ type: "spring", stiffness: 300, damping: 30 }}
                />
              )}
              <span className="relative z-10">{mode}</span>
            </button>
          ))}
        </div>
      </div>

      <section className="flex flex-col gap-12">
        <div className="flex justify-between items-end">
          <SectionHeader title="AUDIT STAGE:" subtitle="Kinetic Input Buffer" color="#06b6d4" />
          {hasMedia && (
            <div className="flex gap-3 mb-12 bg-white/5 p-2 rounded-2xl border border-white/10 backdrop-blur-xl">
              <button 
                onClick={onFileUploadClick}
                className="px-5 py-2 rounded-xl bg-white/5 border border-white/10 text-[9px] font-black uppercase text-white/40 hover:text-white hover:border-cyan-500/50 transition-all"
              >
                Change Archive
              </button>
              <button 
                onClick={isLiveLink ? onFileUploadClick : onLiveCameraClick}
                className="px-5 py-2 rounded-xl bg-white/5 border border-white/10 text-[9px] font-black uppercase text-white/40 hover:text-white hover:border-cyan-500/50 transition-all"
              >
                {isLiveLink ? 'Archive Mode' : 'Sensor Mode'}
              </button>
              <button 
                onClick={onRemoveVideo}
                className="px-5 py-2 rounded-xl bg-red-500/10 border border-red-500/30 text-[9px] font-black uppercase text-red-400 hover:bg-red-500 hover:text-white transition-all"
              >
                Remove
              </button>
            </div>
          )}
        </div>

        <div className="relative max-w-7xl mx-auto w-full aspect-video liquid-glass rounded-[64px] overflow-hidden bg-black/60 border border-white/10 shadow-[0_40px_100px_rgba(0,0,0,0.8)]">
          <div className="absolute inset-0 forensic-grid opacity-[0.05] pointer-events-none" />
          {hasMedia ? (
            <>
              <video 
                ref={videoRef} src={videoFileUrl || undefined} 
                className={`w-full h-full object-contain transition-all duration-1000 ${isPrivacyShieldActive ? 'blur-[80px] opacity-20' : 'opacity-100'}`} 
                playsInline
                muted={isLiveLink}
              />
              <GhostOverlay objects={lastEntry?.detected_objects} visible={isAnalyzing && !isPrivacyShieldActive} isDistracted={lastEntry?.isDistracted} videoRef={videoRef} />
              
              {/* Internal HUD Elements */}
              <div className="absolute top-12 left-12 flex flex-col gap-4 z-50">
                 <div className="px-4 py-2 rounded-full bg-black/60 backdrop-blur-md border border-white/10 flex items-center gap-3">
                    <div className={`w-2 h-2 rounded-full ${isAnalyzing ? 'bg-cyan-500 animate-pulse' : 'bg-white/20'}`} />
                    <span className="text-[10px] font-black uppercase tracking-[0.2em] text-white/80">LINK_STATUS: {isAnalyzing ? 'UPLINK_LIVE' : 'STANDBY'}</span>
                 </div>
                 {isAnalyzing && (
                   <div className="flex gap-2">
                     <div className="px-4 py-2 rounded-full bg-cyan-500/10 backdrop-blur-md border border-cyan-500/40 flex items-center gap-3">
                        <span className="text-[10px] font-black uppercase tracking-[0.2em] text-cyan-400">FPS: 24.0 | BUF: 12ms</span>
                     </div>
                     {isLiveLink && (
                       <div className="px-4 py-2 rounded-full bg-red-500/10 backdrop-blur-md border border-red-500/40 flex items-center gap-3">
                          <div className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />
                          <span className="text-[10px] font-black uppercase tracking-[0.2em] text-red-400">MIC: ACTIVE</span>
                       </div>
                     )}
                   </div>
                 )}
              </div>
            </>
          ) : (
            <div className="h-full flex flex-col items-center justify-center text-center gap-12 p-16 relative z-10">
              <div className="w-32 h-32 rounded-[56px] border-4 border-dashed border-cyan-500/20 flex items-center justify-center animate-spin-slow">
                 <svg className="w-16 h-16 text-cyan-500/30" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
              </div>
              <div className="space-y-4">
                <h2 className="text-4xl md:text-7xl font-black italic uppercase text-white tracking-tighter leading-none">Sensor <span className="text-cyan-400">Offline</span></h2>
                <p className="text-xl text-white/20 font-light italic max-w-2xl mx-auto leading-relaxed">Establish a high-precision neural link via archive upload or live sensor hardware integration.</p>
              </div>
              <div className="flex flex-col sm:flex-row gap-6 w-full max-w-2xl">
                <button onClick={onFileUploadClick} className="flex-1 py-8 rounded-[40px] bg-white/5 border border-cyan-500/30 text-cyan-400 font-black uppercase text-[12px] tracking-[0.2em] hover:bg-cyan-500/10 transition-all shadow-2xl">Upload Archive</button>
                <button onClick={onLiveCameraClick} className="flex-1 py-8 rounded-[40px] bg-white text-black font-black uppercase text-[12px] tracking-[0.2em] hover:scale-[1.03] transition-all shadow-2xl">Connect Sensor</button>
              </div>
            </div>
          )}
        </div>
        
        <div className="liquid-glass p-10 rounded-[56px] border-white/5 bg-black/40 shadow-inner max-w-7xl mx-auto w-full">
          <InteractiveTimeline history={history} duration={duration} currentTime={currentTime} onSeek={onSeek} />
        </div>
      </section>

      {/* CORE ACTION TRIGGER */}
      <div className="flex justify-center -my-16 relative z-50">
        <button 
          onClick={onToggleScan} disabled={!hasMedia || isProcessing} 
          className={`w-full max-w-4xl h-28 rounded-[56px] font-black italic uppercase tracking-[1em] text-2xl shadow-[0_0_100px_rgba(0,0,0,1)] transition-all active:scale-95 flex items-center justify-center gap-6 ${isAnalyzing ? 'bg-gradient-to-r from-red-600 to-red-900 border-2 border-red-500/50' : 'bg-gradient-to-r from-cyan-600 to-violet-800 border-2 border-cyan-400/50'}`}
        >
          {isAnalyzing && <div className="w-4 h-4 rounded-full bg-white animate-ping" />}
          {isAnalyzing ? "Terminate Audit" : "Initialize Forensic Audit"}
        </button>
      </div>

      <section className="flex flex-col gap-12">
        <SectionHeader title="NEURAL RESONANCE:" subtitle="Biometric Matrix" color="#8b5cf6" />
        <div className="grid lg:grid-cols-12 gap-12">
          <div className="lg:col-span-8 h-[650px]">
            <NeuralTimeline entries={history} />
          </div>
          <div className="lg:col-span-4 flex flex-col gap-8">
            <div className="flex-1 liquid-glass p-10 rounded-[56px] border-white/5 bg-black/40 flex flex-col gap-10 relative overflow-hidden shadow-2xl">
              <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-cyan-400/20 to-transparent" />
              <div className="flex justify-between border-b border-white/5 pb-6">
                <span className="text-[12px] font-black uppercase text-cyan-400 tracking-[0.4em]">Audit Resonance</span>
                <span className="text-[10px] font-mono text-white/20 uppercase">v7.4_STABLE</span>
              </div>
              
              <div className="grid grid-cols-2 gap-6">
                {resonanceData.map((res, i) => (
                  <ResonanceTile key={i} label={res.label} value={res.value} color={res.color} />
                ))}
              </div>

              <div className="flex-1 flex flex-col items-center justify-center gap-10">
                 <SentimentGauge 
                   score={history.length ? history.reduce((a,b)=>a+b.emotion_score,0)/history.length : 0} 
                   label={lastEntry?.emotion_label || 'Standby'} 
                 />
                 <span className="text-[10px] font-black uppercase tracking-[0.6em] text-white/20 text-center">Resonance Balance Index</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="flex flex-col gap-12 mb-20">
        <SectionHeader title="FORENSIC CHAIN:" subtitle="Logical Trace Archive" color="#f59e0b" />
        <div className="grid lg:grid-cols-12 gap-12">
          {/* ACOUSTIC WAVEFORM COLUMN */}
          <div className="lg:col-span-4 liquid-glass rounded-[64px] p-12 bg-black/40 border-white/10 flex flex-col gap-10 h-[750px] relative overflow-hidden shadow-3xl">
             <div className="absolute top-0 left-0 right-0 h-[2px] bg-amber-500/20 overflow-hidden">
               <motion.div 
                 animate={{ x: ['-100%', '100%'] }}
                 transition={{ repeat: Infinity, duration: 4, ease: "linear" }}
                 className="w-1/2 h-full bg-amber-500/40 shadow-[0_0_15px_#f59e0b]"
               />
             </div>
             <div className="flex justify-between items-center border-b border-white/5 pb-6">
                <h3 className="text-[14px] font-black uppercase text-amber-500 tracking-[0.4em]">Acoustic Events</h3>
                <span className="text-[10px] font-mono text-white/20 uppercase tracking-widest">Live_Link</span>
             </div>
             <div className="flex-1 overflow-y-auto custom-scrollbar space-y-6 pr-6">
                {acousticLog.length > 0 ? acousticLog.slice().reverse().map((log, idx) => (
                  <motion.div 
                    initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }}
                    key={idx} className="p-6 rounded-[32px] bg-white/5 border border-white/5 text-[13px] text-amber-200/50 italic leading-relaxed group hover:bg-white/[0.08] hover:border-amber-500/20 transition-all"
                  >
                    <span className="text-[9px] font-mono text-amber-500/40 block mb-2">[{log.timestamp}]</span>
                    {log.text}
                  </motion.div>
                )) : <div className="h-full flex flex-col items-center justify-center opacity-10 text-center gap-8">
                    <div className="w-1 h-20 bg-amber-500/40 animate-pulse" />
                    <span className="text-[10px] uppercase font-black tracking-[2em]">Awaiting Acoustic Trigger</span>
                </div>}
             </div>
          </div>

          {/* COGNITIVE TRACE COLUMN */}
          <div className="lg:col-span-8 liquid-glass rounded-[64px] p-12 bg-black/40 border-white/10 flex flex-col gap-10 h-[750px] relative overflow-hidden shadow-3xl">
             <div className="absolute top-0 left-0 right-0 h-[2px] bg-violet-500/20 overflow-hidden">
               <motion.div 
                 animate={{ x: ['100%', '-100%'] }}
                 transition={{ repeat: Infinity, duration: 6, ease: "linear" }}
                 className="w-1/4 h-full bg-violet-500/40 shadow-[0_0_20px_#8b5cf6]"
               />
             </div>
             <div className="flex justify-between items-center border-b border-white/5 pb-6">
                <h3 className="text-[14px] font-black uppercase text-violet-500 tracking-[0.4em]">Reasoning chain history</h3>
                <span className="text-[10px] font-mono text-white/20 uppercase tracking-widest">Neural_Buffer</span>
             </div>
             <div className="flex-1 overflow-y-auto custom-scrollbar space-y-10 pr-8">
                {history.length ? history.slice().reverse().map((entry, i) => (
                  <ReasoningCard 
                    key={i} entry={entry} showMonologue={true} isActive={entry === lastEntry} 
                    isSpeaking={currentlySpeakingId === `alert-${entry.timestamp}`} 
                    onPlayTTS={() => onSpeak(entry.thinking, `alert-${entry.timestamp}`)} 
                    onClick={() => onSeek(entry.timestampSeconds)} 
                  />
                )) : <div className="h-full flex flex-col items-center justify-center opacity-10 text-center gap-12">
                   <div className="w-40 h-40 rounded-[64px] border-4 border-dashed border-violet-500/40 animate-spin-slow" />
                   <span className="text-xl uppercase font-black tracking-[1em] italic">Initializing Neural Uplink...</span>
                </div>}
             </div>
          </div>
        </div>

        {/* FINAL DOSSIER BUTTON */}
        {!isAnalyzing && history.length > 0 && (
          <div className="mt-20 flex justify-center">
            <button 
              onClick={onManualSynthesis} disabled={isProcessing}
              className="w-full h-28 rounded-[56px] bg-white text-black font-black uppercase tracking-[1em] italic text-sm shadow-[0_0_80px_rgba(255,255,255,0.2)] hover:scale-[1.01] hover:bg-cyan-50 transition-all flex items-center justify-center gap-6"
            >
              {isProcessing ? <div className="w-6 h-6 border-4 border-black/10 border-t-black rounded-full animate-spin" /> : <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24"><path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm0 16H5V5h14v14zM7 10h10v2H7zm0-3h10v2H7zm0 6h7v2H7z"/></svg>}
              {isProcessing ? "SYNTHESIZING..." : "GENERATE FINAL DOSSIER"}
            </button>
          </div>
        )}
      </section>

      <AgenticPulse isAnalyzing={isAnalyzing || isProcessing} intensity={isProcessing ? 5 : 2} />
    </div>
  );
};

export default MirrorCore;
