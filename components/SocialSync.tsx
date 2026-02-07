import React, { useState, useRef, useEffect, useMemo, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { GeminiService } from '../services/geminiService';
import { SocialSyncData, SocialAlert } from '../types';
import GhostOverlay from './GhostOverlay';
import AgenticPulse from './AgenticPulse';
import TabBriefing from './TabBriefing';

interface SocialSyncProps {
  onAriaToast: (m: string) => void;
  videoRef: React.RefObject<HTMLVideoElement | null>;
  videoFileUrl: string | null;
  activeStream: MediaStream | null;
  isLiveLink: boolean;
  isAnalyzing: boolean;
  onToggleScan: () => void;
  onFileUploadClick: () => void;
  onLiveCameraClick: () => void;
  onRemoveVideo: () => void;
  onNewSession: () => void;
}

const SectionHeader: React.FC<{ title: string; subtitle: string; color: string }> = ({ title, subtitle, color }) => (
  <div className="mb-12 space-y-4">
    <div className="flex items-center gap-4">
      <span className="px-4 py-1 rounded-full border text-[10px] font-mono font-black uppercase tracking-widest" style={{ borderColor: `${color}44`, color, backgroundColor: `${color}11` }}>
        SOCIAL_SYNC_ORCHESTRATION
      </span>
      <div className="flex-1 h-px bg-white/10" />
    </div>
    <h2 className="text-4xl md:text-6xl font-black italic tracking-tighter uppercase text-white leading-none">
      {title} <span style={{ color }}>{subtitle}</span>
    </h2>
  </div>
);

const SocialSync: React.FC<SocialSyncProps> = ({ 
  onAriaToast, videoRef, videoFileUrl, activeStream, isLiveLink, isAnalyzing, onToggleScan, onFileUploadClick, onLiveCameraClick, onRemoveVideo, onNewSession
}) => {
  const [data, setData] = useState<SocialSyncData | null>(null);
  const [transcriptHistory, setTranscriptHistory] = useState<string[]>([]);
  const [playbackRate, setPlaybackRate] = useState(1);
  
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const gemini = useMemo(() => new GeminiService(), []);
  const analysisInterval = useRef<number | null>(null);
  const isRequestInProgress = useRef(false);

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
      video.playbackRate = playbackRate;
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
  }, [isAnalyzing, isLiveLink, activeStream, videoFileUrl, videoRef, onToggleScan, playbackRate]);

  // Main capture and analysis function - Finalized Logic
  const captureAndAnalyze = useCallback(async () => {
    if (isRequestInProgress.current) return;
    
    const v = videoRef.current;
    const c = canvasRef.current;
    // Check if video is actually ready for frame capture
    if (!v || !c || (v.readyState < 2 && !activeStream)) return;
    
    c.width = v.videoWidth || 1280; 
    c.height = v.videoHeight || 720;
    const ctx = c.getContext('2d'); if (!ctx) return;
    ctx.drawImage(v, 0, 0, c.width, c.height);
    const frame = c.toDataURL('image/jpeg', 0.5).split(',')[1];
    
    isRequestInProgress.current = true;
    try {
      // Provide history to model to ensure continuity
      const res = await gemini.analyzeSocialSyncFrame(frame, transcriptHistory);
      setData(res);
      
      if (res.activeTranscript && res.activeTranscript.trim().length > 0) {
        setTranscriptHistory(prev => {
          const lastEntry = prev[prev.length - 1];
          // Robust turn-based logging: only append if this turn is unique or an evolution
          if (lastEntry === res.activeTranscript) return prev;
          
          // Heuristic to prevent duplicate partial turns or redundant identity labels
          if (lastEntry && res.activeTranscript.startsWith(lastEntry)) {
             const updated = [...prev];
             updated[updated.length - 1] = res.activeTranscript;
             return updated;
          }
          
          return [...prev, res.activeTranscript].slice(-100);
        });
      }
      
      if (res.alerts.length > 0) {
        onAriaToast(`ATTENTION: ${res.alerts[0].message}`);
      }
    } catch (e) { 
      console.error("SocialSync Error:", e); 
    } finally {
      isRequestInProgress.current = false;
    }
  }, [gemini, transcriptHistory, activeStream, onAriaToast, videoRef]);

  useEffect(() => {
    if (isAnalyzing) {
      // INSTANT CAPTURE: Do not wait for interval. Capture Frame 0 immediately.
      captureAndAnalyze();
      
      // Establish high-frequency sampling for rapid kinetic turns (2.5s)
      analysisInterval.current = window.setInterval(captureAndAnalyze, 2500);
    } else {
      if (analysisInterval.current) clearInterval(analysisInterval.current);
    }
    return () => { if (analysisInterval.current) clearInterval(analysisInterval.current); };
  }, [isAnalyzing, captureAndAnalyze]);

  const handleResetSession = () => {
    setData(null);
    setTranscriptHistory([]);
    onNewSession();
  };

  const hasMedia = !!videoFileUrl || isLiveLink;

  return (
    <div className="max-w-[1700px] mx-auto px-8 flex flex-col gap-32">
      <TabBriefing 
        title="MODEL: MULTI-PARTY SYNC"
        description="SocialSync identifies and tracks multiple signers independently, assigning spatial tags to map group intent and sentiment across simultaneous feeds."
        steps={["LINK SENSORS", "IDENTIFY SIGNERS", "TRACK TRANSCRIPT", "RESOLVE CONFLICTS"]}
        color="#10b981"
      />

      <canvas ref={canvasRef} className="hidden" />

      <section className="flex flex-col gap-12">
        <div className="flex justify-between items-end">
          <SectionHeader title="SOCIAL SYNC:" subtitle="Multi-Party Intent Tracking" color="#10b981" />
          <div className="flex flex-col items-end gap-6 mb-12">
            {hasMedia && (
              <div className="flex gap-3">
                <button onClick={onFileUploadClick} className="px-4 py-2 rounded-xl bg-white/5 border border-white/10 text-[9px] font-black uppercase text-white/40 hover:text-white hover:border-emerald-500/50 transition-all">Change Archive</button>
                <button onClick={isLiveLink ? onFileUploadClick : onLiveCameraClick} className="px-4 py-2 rounded-xl bg-white/5 border border-white/10 text-[9px] font-black uppercase text-white/40 hover:text-white hover:border-emerald-500/50 transition-all">{isLiveLink ? 'Archive Mode' : 'Sensor Mode'}</button>
                <button onClick={onRemoveVideo} className="px-4 py-2 rounded-xl bg-red-500/10 border border-red-500/30 text-[9px] font-black uppercase text-red-400 hover:bg-red-500 hover:text-white transition-all">Remove</button>
              </div>
            )}
            
            {hasMedia && !isLiveLink && (
              <div className="flex gap-4 bg-white/5 p-2 rounded-2xl border border-white/5 backdrop-blur-xl">
                 <div className="px-4 py-2 flex items-center gap-3">
                    <span className="text-[10px] font-black uppercase text-white/30 tracking-widest:">Speed:</span>
                    <select 
                      value={playbackRate} 
                      onChange={(e) => setPlaybackRate(parseFloat(e.target.value))}
                      className="bg-transparent text-emerald-500 text-[11px] font-black uppercase tracking-widest outline-none cursor-pointer"
                    >
                      <option value="0.5" className="bg-black">0.5x</option>
                      <option value="1" className="bg-black">1.0x</option>
                      <option value="1.5" className="bg-black">1.5x</option>
                      <option value="2" className="bg-black">2.0x</option>
                    </select>
                 </div>
              </div>
            )}
          </div>
        </div>

        <div className="grid lg:grid-cols-12 gap-10">
          <div className="lg:col-span-8 relative aspect-video liquid-glass rounded-[64px] overflow-hidden bg-black/60 border border-white/10 shadow-3xl flex flex-col items-center justify-center">
            {hasMedia ? (
              <>
                <video ref={videoRef} src={videoFileUrl || undefined} className={`w-full h-full object-contain ${isAnalyzing ? 'opacity-100' : 'opacity-40 blur-md'}`} playsInline muted={isLiveLink} />
                <GhostOverlay objects={data?.signers?.map(s => ({ label: `${s?.name || 'User'} (${Math.round((s?.confidence || 0)*100)}%)`, box_2d: s.box_2d, sentiment: s.isSigning ? 'ACTIVE_SIGNING' : 'IDLE' }))} visible={isAnalyzing} videoRef={videoRef} />
                
                <div className="absolute top-10 left-10 z-[60] flex flex-col gap-4">
                   <AnimatePresence>
                     {data?.alerts.map(alert => (
                       <motion.div 
                         key={alert.id} initial={{ opacity: 0, x: -50 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -50 }}
                         className="px-6 py-4 bg-emerald-500 text-black rounded-3xl border border-emerald-400 font-black uppercase text-xs tracking-widest shadow-[0_0_30px_rgba(16,185,129,0.5)] flex items-center gap-4"
                       >
                         <div className="w-8 h-8 rounded-full bg-black/10 flex items-center justify-center">
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
                         </div>
                         {alert.message}
                       </motion.div>
                     ))}
                   </AnimatePresence>
                </div>
              </>
            ) : (
              <div className="flex flex-col items-center gap-12 text-center p-20">
                 <h2 className="text-4xl md:text-7xl font-black italic uppercase text-white tracking-tighter">Social <span className="text-emerald-400">Hub</span></h2>
                 <div className="flex gap-6 w-full max-w-xl">
                   <button onClick={onFileUploadClick} className="flex-1 py-6 rounded-[32px] bg-white/5 border border-emerald-500/30 text-emerald-400 font-black uppercase text-sm hover:bg-emerald-500/10 transition-all">Load Group Video</button>
                   <button onClick={onLiveCameraClick} className="flex-1 py-6 rounded-[32px] bg-white text-black font-black uppercase text-sm hover:scale-105 transition-all">Open Multi-Sensor</button>
                 </div>
              </div>
            )}
          </div>

          <div className="lg:col-span-4 flex flex-col gap-8">
             <div className="flex-1 liquid-glass rounded-[56px] border-white/5 p-12 bg-black/40 flex flex-col gap-8">
                <h3 className="text-[12px] font-black uppercase text-emerald-400 tracking-[0.4em]">Active Signers</h3>
                <div className="flex-1 overflow-y-auto space-y-4 custom-scrollbar">
                   {data?.signers.map(signer => (
                     <div key={signer.id} className="flex items-center justify-between p-4 rounded-3xl bg-white/5 border border-white/5">
                        <div className="flex items-center gap-4">
                           <div className="w-4 h-4 rounded-full" style={{ backgroundColor: signer.color }} />
                           <span className="text-sm font-black text-white">{signer.name}</span>
                        </div>
                        <div className="flex items-center gap-2">
                           {signer.isSigning && <motion.div animate={{ scale: [1, 1.2, 1] }} transition={{ repeat: Infinity }} className="w-1.5 h-1.5 rounded-full bg-emerald-500" />}
                           <span className={`text-[9px] font-black uppercase ${signer.isSigning ? 'text-emerald-400' : 'text-white/20'}`}>
                             {signer.isSigning ? 'SIGNING' : 'IDLE'}
                           </span>
                        </div>
                     </div>
                   ))}
                   {(!data || data.signers.length === 0) && <div className="p-20 text-center text-white/10 uppercase tracking-widest text-xs italic">Awaiting Detections...</div>}
                </div>
             </div>
             
             <div className="flex flex-col gap-4">
               <button 
                 onClick={onToggleScan} disabled={!hasMedia}
                 className={`w-full h-24 rounded-[48px] bg-gradient-to-r ${isAnalyzing ? 'from-red-600 to-red-800' : 'from-emerald-600 to-teal-700'} font-black italic uppercase tracking-[1em] text-xl shadow-3xl hover:scale-[1.02] transition-all`}
               >
                 {isAnalyzing ? "End Session" : "Start SocialSync"}
               </button>

               {!isAnalyzing && (hasMedia || transcriptHistory.length > 0) && (
                 <button 
                   onClick={handleResetSession}
                   className="w-full h-16 rounded-[32px] bg-white/5 border border-white/10 text-cyan-400 font-black uppercase tracking-[0.3em] text-xs hover:bg-white/10 hover:border-cyan-500/50 transition-all flex items-center justify-center gap-3 group"
                 >
                   <svg className="w-4 h-4 group-hover:rotate-180 transition-transform duration-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /></svg>
                   New Sync Session
                 </button>
               )}
             </div>
          </div>
        </div>
      </section>

      {/* 2. GROUP TRANSCRIPT */}
      <section className="flex flex-col gap-12">
        <SectionHeader title="GROUP TRANSCRIPT:" subtitle="Multimodal Dialogue Log" color="#a855f7" />
        <div className="liquid-glass p-12 md:p-20 rounded-[72px] border-white/10 bg-black/40 shadow-3xl h-[600px] flex flex-col">
           <div className="flex-1 overflow-y-auto custom-scrollbar space-y-8 pr-8">
              {transcriptHistory.length > 0 ? transcriptHistory.map((text, i) => {
                const parts = (text || "").split(':');
                const speakerName = parts[0];
                const signer = data?.signers.find(s => s.name === speakerName);
                return (
                  <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} key={i} className="flex gap-6">
                     <span className="text-[10px] font-mono text-white/20 pt-2 shrink-0">[{i+1}]</span>
                     <div className="flex flex-col gap-2 flex-1">
                        <p className="text-2xl md:text-4xl font-light leading-relaxed italic text-white/80" style={{ borderLeft: `4px solid ${signer?.color || 'rgba(255,255,255,0.05)'}`, paddingLeft: '2rem' }}>
                          {text}
                        </p>
                     </div>
                  </motion.div>
                );
              }) : (
                <div className="h-full flex flex-col items-center justify-center opacity-10 uppercase text-xs tracking-[2em] text-center p-20 italic">
                   Awaiting Conversation Flow...
                </div>
              )}
           </div>
           
           <div className="pt-12 border-t border-white/5 flex justify-between items-center text-[10px] font-mono text-white/20 uppercase tracking-[0.4em]">
              <span>Latency: Nominal</span>
              <span>Tokens: {transcriptHistory.join(' ').split(' ').length}</span>
              <span>Resonance: High</span>
           </div>
        </div>
      </section>

      <AgenticPulse isAnalyzing={isAnalyzing} intensity={3} />
    </div>
  );
};

export default SocialSync;