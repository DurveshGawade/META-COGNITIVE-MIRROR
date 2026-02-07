
import React, { useState, useRef, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { GeminiService } from '../services/geminiService';
import { BridgeData, CommunicationBrief } from '../types';
import GhostOverlay from './GhostOverlay';
import AgenticPulse from './AgenticPulse';
import SentimentGauge from './SentimentGauge';

interface BridgeMediatorProps {
  onAriaToast: (m: string) => void;
  videoRef: React.RefObject<HTMLVideoElement | null>;
  videoFileUrl: string | null;
  activeStream: MediaStream | null;
  isLiveLink: boolean;
  isAnalyzing: boolean;
  bridgeHistory: BridgeData[];
  onUpdateHistory: (data: BridgeData) => void;
  onToggleScan: () => void;
  onFileUploadClick: () => void;
  onLiveCameraClick: () => void;
  onRemoveVideo: () => void;
  onNewBridgeLink: () => void;
}

const SectionHeader: React.FC<{ title: string; subtitle: string; color: string }> = ({ title, subtitle, color }) => (
  <div className="mb-12 space-y-4">
    <div className="flex items-center gap-4">
      <span className="px-4 py-1 rounded-full border text-[10px] font-mono font-black uppercase tracking-widest" style={{ borderColor: `${color}44`, color, backgroundColor: `${color}11` }}>
        BRIDGE_LAYER_PROTOCOL
      </span>
      <div className="flex-1 h-px bg-white/10" />
    </div>
    <h2 className="text-4xl md:text-6xl font-black italic tracking-tighter uppercase text-white leading-none">
      {title} <span style={{ color }}>{subtitle}</span>
    </h2>
  </div>
);

const BridgeMediator: React.FC<BridgeMediatorProps> = ({ 
  onAriaToast, videoRef, videoFileUrl, activeStream, isLiveLink, isAnalyzing, bridgeHistory, onUpdateHistory, onToggleScan, onFileUploadClick, onLiveCameraClick, onRemoveVideo, onNewBridgeLink
}) => {
  const [currentData, setCurrentData] = useState<BridgeData | null>(null);
  const [isBriefOpen, setIsBriefOpen] = useState(false);
  const [brief, setBrief] = useState<CommunicationBrief | null>(null);

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const sparklineRef = useRef<HTMLCanvasElement>(null);
  const gemini = useMemo(() => new GeminiService(), []);
  const analysisInterval = useRef<number | null>(null);

  const typographyStyle = useMemo(() => {
    if (!currentData?.sentiment) return {};
    const { intensity } = currentData.sentiment;
    return {
      fontWeight: 300 + (intensity * 6),
      letterSpacing: `${(intensity / 100) * 0.5}em`,
      transition: 'all 0.5s ease'
    };
  }, [currentData?.sentiment]);

  const renderTranscript = (text: string, isConflict?: boolean) => {
    if (!text) return "Awaiting intent tokens...";
    const parts = text.split(/(\[Pointing at: [^\]]+\])/g);
    return parts.map((part, i) => {
      if (part.startsWith('[Pointing at:')) {
        return (
          <motion.span 
            key={i}
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="inline-block px-3 py-1 mx-1 bg-cyan-500/20 border border-cyan-500/40 rounded-xl text-cyan-400 font-black text-sm md:text-xl lg:text-3xl italic tracking-widest shadow-[0_0_20px_rgba(6,182,212,0.3)]"
          >
            {part}
          </motion.span>
        );
      }
      return <span key={i} className={isConflict ? 'text-amber-200' : ''}>{part}</span>;
    });
  };

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    if (isLiveLink && activeStream) {
      if (video.srcObject !== activeStream) {
        video.srcObject = activeStream;
        video.onloadedmetadata = () => video.play().catch(() => {});
      }
    } else if (!videoFileUrl) {
      video.srcObject = null;
    }

    if (videoFileUrl || isLiveLink) {
      if (isAnalyzing) {
        video.play().catch(() => {});
      } else {
        video.pause();
      }
    }

    const handleEnded = () => {
      if (isAnalyzing) onToggleScan();
    };

    video.addEventListener('ended', handleEnded);
    return () => video.removeEventListener('ended', handleEnded);
  }, [isAnalyzing, isLiveLink, activeStream, videoFileUrl, videoRef, onToggleScan]);

  useEffect(() => {
    const canvas = sparklineRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    const render = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.beginPath();
      ctx.strokeStyle = currentData?.sentiment?.color || '#00ffff';
      ctx.lineWidth = 2;
      const points = bridgeHistory.slice(-40);
      points.forEach((p, i) => {
        const x = (i / 39) * canvas.width;
        const y = canvas.height - (p.sentiment.intensity / 100) * canvas.height;
        if (i === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
      });
      ctx.stroke();
      requestAnimationFrame(render);
    };
    const anim = requestAnimationFrame(render);
    return () => cancelAnimationFrame(anim);
  }, [bridgeHistory, currentData]);

  useEffect(() => {
    if (isAnalyzing) {
      analysisInterval.current = window.setInterval(async () => {
        const v = videoRef.current;
        const c = canvasRef.current;
        if (!v || !c || (v.readyState < 2 && !activeStream)) return;
        c.width = v.videoWidth || 1280; 
        c.height = v.videoHeight || 720;
        const ctx = c.getContext('2d'); if (!ctx) return;
        ctx.drawImage(v, 0, 0, c.width, c.height);
        const frame = c.toDataURL('image/jpeg', 0.5).split(',')[1];
        const historyChunks = bridgeHistory.slice(-5).map(h => h.transcriptChunk);
        try {
          const data = await gemini.analyzeBridgeFrame(frame, historyChunks);
          setCurrentData(data);
          onUpdateHistory(data);
          if (data.conflictDetected) {
            onAriaToast("DISCREPANCY_DETECTED");
          }
        } catch (e) { console.error(e); }
      }, 4000);
    } else {
      if (analysisInterval.current) clearInterval(analysisInterval.current);
      if (bridgeHistory.length > 3) {
        onAriaToast("SYNTHESIZING_BRIEF");
        gemini.generateCommunicationBrief(bridgeHistory)
          .then(b => { setBrief(b); setIsBriefOpen(true); })
          .catch(() => onAriaToast("FAILED"));
      }
    }
    return () => { if (analysisInterval.current) clearInterval(analysisInterval.current); };
  }, [isAnalyzing]);

  const hasMedia = !!videoFileUrl || isLiveLink;

  const handleNewLink = () => {
    setCurrentData(null);
    setBrief(null);
    setIsBriefOpen(false);
    onNewBridgeLink();
  };

  return (
    <div className="max-w-[1700px] mx-auto px-8 flex flex-col gap-32">
      <canvas ref={canvasRef} className="hidden" />

      {/* 1. UPLINK STREAMS */}
      <section className="flex flex-col gap-12">
        <div className="flex justify-between items-end">
          <SectionHeader title="INTENT ARCS:" subtitle="Linguistic Fusion" color="#a855f7" />
          {hasMedia && (
            <div className="flex gap-3 mb-12">
              <button 
                onClick={onFileUploadClick}
                className="px-4 py-2 rounded-xl bg-white/5 border border-white/10 text-[9px] font-black uppercase text-white/40 hover:text-white hover:border-purple-500/50 transition-all"
              >
                Change Video
              </button>
              <button 
                onClick={isLiveLink ? onFileUploadClick : onLiveCameraClick}
                className="px-4 py-2 rounded-xl bg-white/5 border border-white/10 text-[9px] font-black uppercase text-white/40 hover:text-white hover:border-purple-500/50 transition-all"
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
        </div>
        <div className="relative aspect-video liquid-glass rounded-[64px] overflow-hidden bg-black/40 border border-white/10 shadow-3xl flex flex-col items-center justify-center">
          {hasMedia ? (
            <>
              <video 
                ref={videoRef} 
                src={videoFileUrl || undefined} 
                className={`w-full h-full object-contain ${isAnalyzing ? 'opacity-100' : 'opacity-40 blur-md'}`} 
                playsInline 
                muted={isLiveLink} 
              />
              <GhostOverlay objects={currentData?.objects?.map(o => ({ label: o.label, box_2d: o.box_2d }))} visible={isAnalyzing} videoRef={videoRef} />
              <div className="absolute bottom-20 inset-x-0 flex flex-col items-center px-12 z-50">
                 <AnimatePresence mode="wait">
                   <motion.div 
                     key={currentData?.transcriptChunk} 
                     initial={{ opacity: 0, y: 20 }} 
                     animate={{ 
                       opacity: 1, 
                       y: 0,
                       scale: currentData?.conflictDetected ? 1.05 : 1
                     }} 
                     exit={{ opacity: 0, y: -20 }} 
                     style={typographyStyle} 
                     className={`text-center p-8 rounded-[40px] transition-all duration-500 ${currentData?.conflictDetected ? 'bg-amber-500/20 border-2 border-amber-500/50 shadow-[0_0_50px_rgba(245,158,11,0.3)]' : 'drop-shadow-2xl'}`}
                   >
                     {currentData?.conflictDetected && (
                       <motion.div 
                         initial={{ opacity: 0, scale: 0.8 }}
                         animate={{ opacity: 1, scale: 1 }}
                         className="mb-6 inline-block px-4 py-2 rounded-full bg-amber-500 text-black text-[10px] font-black uppercase tracking-[0.2em] shadow-[0_0_20px_rgba(245,158,11,0.5)]"
                       >
                         [DISCREPANCY DETECTED: Visual Affect vs. Linguistic Content]
                       </motion.div>
                     )}
                     <div className="text-2xl md:text-5xl lg:text-8xl text-white uppercase italic tracking-tighter">
                        {renderTranscript(currentData?.transcriptChunk || "", currentData?.conflictDetected)}
                     </div>
                   </motion.div>
                 </AnimatePresence>
              </div>
            </>
          ) : (
            <div className="flex flex-col items-center gap-12 text-center p-20">
               <h2 className="text-4xl md:text-7xl font-black italic uppercase text-white tracking-tighter">Bridge <span className="text-purple-400">Standby</span></h2>
               <div className="flex gap-6 w-full max-w-xl">
                 <button onClick={onFileUploadClick} className="flex-1 py-6 rounded-[32px] bg-white/5 border border-purple-500/30 text-purple-400 font-black uppercase text-sm hover:bg-purple-500/10 transition-all">Upload Archive</button>
                 <button onClick={onLiveCameraClick} className="flex-1 py-6 rounded-[32px] bg-white text-black font-black uppercase text-sm hover:scale-105 transition-all">Live Sensor</button>
               </div>
            </div>
          )}
        </div>
      </section>

      {/* INTERMEDIATE ACTION ZONE: LINK BRIDGE */}
      <div className="flex flex-col items-center gap-4 -my-12 relative z-50">
        <button 
          onClick={onToggleScan} disabled={!hasMedia} 
          className={`w-full max-w-3xl h-24 rounded-[48px] bg-gradient-to-r ${isAnalyzing ? 'from-red-600 to-red-800' : 'from-emerald-600 to-teal-700'} font-black italic uppercase tracking-[1em] text-xl shadow-[0_0_80px_rgba(0,0,0,0.5)] hover:scale-[1.02] transition-all`}
        >
          {isAnalyzing ? "Terminate Bridge" : "Link Bridge"}
        </button>
        
        {!isAnalyzing && (hasMedia || bridgeHistory.length > 0) && (
          <button 
            onClick={handleNewLink}
            className="w-full max-w-xl h-16 rounded-[32px] bg-white/5 border border-white/10 text-cyan-400 font-black uppercase tracking-[0.3em] text-xs hover:bg-white/10 hover:border-cyan-500/50 transition-all flex items-center justify-center gap-3 group shadow-2xl"
          >
            <svg className="w-4 h-4 group-hover:rotate-180 transition-transform duration-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /></svg>
            New Bridge Link
          </button>
        )}
      </div>

      {/* 2. NEURAL TELEMETRY */}
      <section className="flex flex-col gap-12">
        <SectionHeader title="RESONANCE FLOW:" subtitle="Semantic Pulse" color="#06b6d4" />
        <div className="grid lg:grid-cols-12 gap-10">
          <div className="lg:col-span-8 liquid-glass p-12 rounded-[56px] border-white/5 bg-black/40 flex flex-col gap-10">
             <div className="flex justify-between items-center">
                <span className="text-[12px] font-black uppercase text-cyan-400 tracking-[0.4em]">Historical Pulse</span>
                <span className="text-[10px] font-mono text-white/20 uppercase tracking-widest">v6.2_STABLE_LINK</span>
             </div>
             <canvas ref={sparklineRef} width={800} height={150} className="w-full h-48 opacity-80" />
          </div>
          <div className="lg:col-span-4 flex flex-col gap-10">
             <div className="flex-1 liquid-glass p-12 rounded-[56px] border-white/5 flex flex-col items-center justify-center gap-8">
               <SentimentGauge score={(currentData?.sentiment?.intensity || 50) / 100} label={currentData?.sentiment?.label || 'Stable'} />
               <span className="text-[10px] font-black uppercase tracking-[0.4em] text-white/30 text-center">Resonance Balance</span>
             </div>
             <div className="liquid-glass p-10 rounded-[48px] border-white/5 flex flex-col gap-4">
                <h4 className="text-[10px] font-black uppercase text-purple-400 tracking-[0.4em]">Intent Chip</h4>
                <div className="space-y-2">
                   {currentData?.predictions?.map((p, i) => (
                     <div key={i} className="text-xs text-white/60 font-bold uppercase tracking-widest flex items-center gap-3">
                       <span className="w-1.5 h-1.5 rounded-full bg-purple-500" /> {p}
                     </div>
                   ))}
                </div>
             </div>
          </div>
        </div>
      </section>

      {/* 3. LOG BUFFER */}
      <section className="flex flex-col gap-12 mb-20">
        <SectionHeader title="NEURAL BUFFER:" subtitle="Sequence Chain" color="#f97316" />
        <div className="grid lg:grid-cols-3 gap-10">
          {bridgeHistory.length ? bridgeHistory.slice().reverse().map((h, i) => (
            <div key={i} className={`p-10 rounded-[48px] liquid-glass border transition-all ${h.conflictDetected ? 'border-amber-500/50 bg-amber-500/5' : h.isRewrite ? 'border-purple-500/50 bg-purple-500/5' : 'border-white/5'}`}>
               <div className="flex justify-between items-start mb-4">
                  <span className="text-[8px] font-mono text-white/20 uppercase">Sequence_{bridgeHistory.length - i}</span>
                  {h.conflictDetected && <span className="text-[7px] font-black bg-amber-500 text-black px-2 py-0.5 rounded-full uppercase tracking-widest animate-pulse">CONFLICT</span>}
               </div>
               <div className="text-xl font-black text-white/90 uppercase tracking-tight italic mb-6">
                 {renderTranscript(h.transcriptChunk, h.conflictDetected)}
               </div>
               <div className="flex flex-wrap gap-2">
                 {h.signs?.map(s => <span key={s} className="text-[9px] bg-cyan-500/10 text-cyan-400 px-3 py-1 rounded-full border border-cyan-500/20">{s}</span>)}
               </div>
               {h.conflictDetected && <p className="mt-4 text-[9px] text-amber-500/60 font-medium italic border-t border-amber-500/10 pt-3">{h.conflictReason}</p>}
            </div>
          )) : <div className="lg:col-span-3 p-40 text-center text-white/10 uppercase tracking-[2em] text-xs italic">Awaiting Tokens...</div>}
        </div>
      </section>

      <AgenticPulse isAnalyzing={isAnalyzing} intensity={3} />
      
      <AnimatePresence>
        {isBriefOpen && brief && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[10000] bg-black/95 backdrop-blur-3xl flex items-center justify-center p-8">
            <div className="w-full max-w-5xl liquid-glass rounded-[72px] border border-cyan-500/20 p-24 flex flex-col gap-16 relative overflow-hidden shadow-3xl">
               <div className="absolute inset-0 forensic-grid opacity-10 pointer-events-none" />
               <div className="flex justify-between items-start">
                  <h2 className="text-5xl font-black italic uppercase text-white tracking-tighter">Communication <span className="text-cyan-400">Brief</span></h2>
                  <button onClick={() => setIsBriefOpen(false)} className="p-6 rounded-full border border-white/10 text-white hover:bg-white/10 transition-all"><svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg></button>
               </div>
               <div className="grid md:grid-cols-2 gap-16">
                  <div className="space-y-6">
                     <h3 className="text-[12px] font-black text-cyan-400 uppercase tracking-[0.4em]">Synthesis Verdict</h3>
                     <p className="text-2xl font-light text-white italic leading-relaxed">{brief.primaryGoal}</p>
                  </div>
                  <div className="space-y-6">
                     <h3 className="text-[12px] font-black text-purple-400 uppercase tracking-[0.4em]">Friction Logs</h3>
                     <ul className="space-y-4">
                        {(brief.misunderstandings || []).map((m, i) => <li key={i} className="text-lg text-white/60 flex gap-4"><span className="text-purple-500">0{i+1}</span>{m}</li>)}
                     </ul>
                  </div>
               </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default BridgeMediator;
