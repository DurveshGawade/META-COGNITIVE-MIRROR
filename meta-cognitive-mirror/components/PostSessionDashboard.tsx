
import React, { useState, useEffect, useMemo, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AnalysisEntry, ReportData } from '../types';

interface PostSessionDashboardProps {
  history: AnalysisEntry[];
  reportData: ReportData | null;
  onPrepareNextMission: () => void;
  onSpeak: (text: string) => void;
  onAriaToast?: (message: string) => void;
}

const PostSessionDashboard: React.FC<PostSessionDashboardProps> = ({ history, reportData, onPrepareNextMission, onSpeak, onAriaToast }) => {
  const [breakTimer, setBreakTimer] = useState(300); // 5 minutes
  const [isTimerActive, setIsTimerActive] = useState(false);
  const [isGeneratingImage, setIsGeneratingImage] = useState(false);
  const [isSyncingWorkspace, setIsSyncingWorkspace] = useState(false);
  const [syncProgress, setSyncProgress] = useState(0);
  const [isResetting, setIsResetting] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    let interval: number;
    if (isTimerActive && breakTimer > 0) {
      interval = window.setInterval(() => {
        setBreakTimer(t => t - 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isTimerActive, breakTimer]);

  const formatTimer = (s: number) => {
    const mins = Math.floor(s / 60);
    const secs = s % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const heatmap = useMemo(() => {
    if (history.length === 0) return Array.from({ length: 5 }).fill('#06b6d4') as string[];
    // Take a selection of entries or repeat if too few
    const base = history.map(h => h.isDistracted ? '#ef4444' : '#06b6d4');
    if (base.length < 5) return [...base, ...Array(5 - base.length).fill('#06b6d4')] as string[];
    return base.slice(-10);
  }, [history]);

  const trajectoryPath = useMemo(() => {
    if (history.length < 2) return "M 0 140 L 600 140";
    const width = 600;
    const height = 150;
    const step = width / (history.length - 1);
    
    return history.reduce((path, h, i) => {
      const x = i * step;
      const y = height - (h.focusLevel / 100) * height;
      return path + (i === 0 ? `M ${x} ${y}` : ` L ${x} ${y}`);
    }, "");
  }, [history]);

  const playPowerUpSound = () => {
    try {
      const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(100, audioCtx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(1200, audioCtx.currentTime + 1.2);
      
      gain.gain.setValueAtTime(0, audioCtx.currentTime);
      gain.gain.linearRampToValueAtTime(0.15, audioCtx.currentTime + 0.1);
      gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 1.5);
      
      osc.connect(gain);
      gain.connect(audioCtx.destination);
      
      osc.start();
      osc.stop(audioCtx.currentTime + 1.5);

      // Secondary ping chime
      setTimeout(() => {
        const chime = audioCtx.createOscillator();
        const chimeGain = audioCtx.createGain();
        chime.type = 'sine';
        chime.frequency.setValueAtTime(880, audioCtx.currentTime);
        chimeGain.gain.setValueAtTime(0.1, audioCtx.currentTime);
        chimeGain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.8);
        chime.connect(chimeGain);
        chimeGain.connect(audioCtx.destination);
        chime.start();
        chime.stop(audioCtx.currentTime + 0.8);
      }, 1200);
    } catch (e) {
      console.warn("Audio Context failed to initialize:", e);
    }
  };

  const handleResetInitiation = () => {
    if (isResetting) return;
    
    setIsResetting(true);
    playPowerUpSound();

    // 1.5 second buffer for cinematic effect
    setTimeout(() => {
      onPrepareNextMission();
    }, 1500);
  };

  const handleEvolveArchitecture = async () => {
    setIsSyncingWorkspace(true);
    setSyncProgress(0);

    const interval = setInterval(() => {
      setSyncProgress(p => {
        if (p >= 100) {
          clearInterval(interval);
          return 100;
        }
        return p + 5;
      });
    }, 75);

    setTimeout(() => {
      setIsSyncingWorkspace(false);
      if (onAriaToast) {
        onAriaToast(`External Uplink established. Redirecting to Google AI Studio...`);
      }
      setTimeout(() => {
        window.open("https://aistudio.google.com/", '_blank');
      }, 800);
    }, 1500);
  };

  const handleShareToX = async () => {
    setIsGeneratingImage(true);
    const score = reportData?.focusScore || 0;
    
    const canvas = document.createElement('canvas');
    canvas.width = 1200;
    canvas.height = 630;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const grad = ctx.createRadialGradient(600, 315, 0, 600, 315, 800);
    grad.addColorStop(0, '#0a0a1a');
    grad.addColorStop(1, '#010103');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, 1200, 630);

    ctx.fillStyle = '#06b6d4';
    ctx.font = '900 180px Space Grotesk, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(`${score}%`, 600, 380);

    const dataUrl = canvas.toDataURL('image/png');
    const link = document.createElement('a');
    link.download = `mirror-core-audit-${score}.png`;
    link.href = dataUrl;
    link.click();

    const text = encodeURIComponent(`Audit Complete via Mirror Core. Efficiency: ${score}%. #MirrorCore #NeuralProductivity`);
    window.open(`https://twitter.com/intent/tweet?text=${text}`, '_blank');
    
    setIsGeneratingImage(false);
  };

  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ 
        opacity: isResetting ? 0 : 1, 
        scale: isResetting ? 1.05 : 1,
        x: isResetting ? -20 : 0
      }}
      transition={{ duration: 0.8, ease: [0.19, 1, 0.22, 1] }}
      className="max-w-[1200px] mx-auto w-full flex flex-col gap-12 p-12 bg-black/90 min-h-[80vh] rounded-[64px] border border-white/5 shadow-3xl relative"
    >
      <AnimatePresence>
        {isResetting && (
          <motion.div
            initial={{ opacity: 0, x: '100%' }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] bg-cyan-500 flex items-center justify-center pointer-events-none"
          >
            <div className="flex flex-col items-center gap-6">
               <motion.div 
                 animate={{ scale: [1, 1.5, 1], opacity: [1, 0.5, 1] }}
                 transition={{ repeat: Infinity, duration: 0.5 }}
                 className="w-24 h-24 rounded-full border-8 border-white"
               />
               <h3 className="text-4xl md:text-6xl font-black italic text-white uppercase tracking-[0.5em]">RELOADING</h3>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="flex flex-col items-center text-center gap-4">
        <h2 className="text-6xl md:text-8xl font-black italic tracking-tighter text-white uppercase leading-none">Neural Cool-Down</h2>
        <p className="text-sm md:text-lg font-black font-mono text-cyan-400 tracking-[0.5em] uppercase">Syncing cognitive history</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
        <div className="p-10 rounded-[48px] bg-white/[0.02] border border-white/5 space-y-6 flex flex-col h-[400px]">
          <h3 className="text-xs font-black uppercase text-cyan-400 tracking-[0.4em]">Deep Work Trajectory</h3>
          <div className="flex-1 w-full bg-black/40 rounded-[32px] border border-white/5 p-8 flex items-center justify-center overflow-hidden">
             <svg width="100%" height="100%" viewBox="0 0 600 150" preserveAspectRatio="none">
               <motion.path d={trajectoryPath} fill="none" stroke="#06b6d4" strokeWidth="4" initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: 2 }} />
               <line x1="0" y1="140" x2="600" y2="140" stroke="rgba(6,182,212,0.3)" strokeWidth="2" strokeDasharray="10 5" />
             </svg>
          </div>
        </div>

        <div className="p-10 rounded-[48px] bg-white/[0.02] border border-white/5 space-y-6 flex flex-col h-[400px]">
          <h3 className="text-xs font-black uppercase text-violet-400 tracking-[0.4em]">Efficiency Heatmap</h3>
          <div className="flex-1 flex flex-wrap gap-4 content-start">
            {heatmap.map((color, i) => (
              <motion.div 
                key={i} 
                initial={{ scale: 0 }} 
                animate={{ scale: 1 }} 
                transition={{ delay: i * 0.1 }}
                className="w-16 h-16 rounded-xl shadow-[0_0_20px_rgba(6,182,212,0.2)]" 
                style={{ backgroundColor: color }} 
              />
            ))}
          </div>
        </div>
      </div>

      <div className="space-y-10">
        <h3 className="text-xs font-black uppercase tracking-[0.5em] text-cyan-400 text-center">Action Hub</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          
          <div className="p-10 rounded-[48px] bg-white/[0.02] border border-white/10 flex flex-col gap-6 relative overflow-hidden group">
            <h4 className="text-lg font-black text-white uppercase tracking-tighter italic">EVOLVE ARCHITECTURE</h4>
            <div className="space-y-4">
              <p className="text-sm text-cyan-400 font-black uppercase leading-tight">
                Build your own Neural Forensic tools via Google AI Studio.
              </p>
              <p className="text-[11px] text-white/50 italic leading-relaxed">
                Resonance calibration detected high potential. Access the Gemini 3 API to scale this vector.
              </p>
            </div>
            <div className="mt-auto pt-6">
              {isSyncingWorkspace ? (
                <div className="w-full space-y-3">
                   <div className="flex justify-between text-[10px] font-black text-cyan-400 uppercase tracking-widest">
                     <span>Uplink in Progress</span>
                     <span>{syncProgress}%</span>
                   </div>
                   <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden border border-white/10">
                     <motion.div 
                        className="h-full bg-cyan-500 shadow-[0_0_20px_#06b6d4]"
                        initial={{ width: 0 }}
                        animate={{ width: `${syncProgress}%` }}
                     />
                   </div>
                </div>
              ) : (
                <button 
                  onClick={handleEvolveArchitecture}
                  className="w-full py-5 rounded-2xl bg-cyan-500 text-black text-xs font-black uppercase tracking-[0.3em] shadow-2xl shadow-cyan-500/30 hover:scale-105 active:scale-95 transition-all"
                >
                  OPEN AI STUDIO
                </button>
              )}
            </div>
          </div>

          <div className="p-10 rounded-[48px] bg-white/[0.02] border border-white/10 flex flex-col gap-8">
            <h4 className="text-lg font-black text-white uppercase tracking-tighter italic">RECOVERY BREAK</h4>
            <div className="flex-1 flex flex-col justify-center gap-8">
               <div className="text-6xl font-black font-mono text-violet-400 tabular-nums">{formatTimer(breakTimer)}</div>
               <button 
                 onClick={() => setIsTimerActive(!isTimerActive)} 
                 className={`w-full py-5 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all ${isTimerActive ? 'bg-red-500 text-white shadow-2xl shadow-red-500/30' : 'bg-violet-600 text-white shadow-2xl shadow-violet-600/30'}`}
               >
                 {isTimerActive ? 'STOP BREAK' : 'START BREAK'}
               </button>
            </div>
          </div>

          <div className="p-10 rounded-[48px] bg-white/[0.02] border border-white/10 flex flex-col gap-8">
            <h4 className="text-lg font-black text-white uppercase tracking-tighter italic">BROADCAST RESULTS</h4>
            <div className="flex-1 flex flex-col justify-end">
              <button 
                onClick={handleShareToX} 
                disabled={isGeneratingImage} 
                className="w-full py-5 rounded-2xl bg-white text-black font-black uppercase tracking-[0.2em] text-[10px] flex items-center justify-center gap-3 shadow-2xl hover:scale-105 active:scale-95 transition-all"
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm1.161 17.52h1.833L7.045 4.126H5.078z"/></svg>
                {isGeneratingImage ? 'PREPARING...' : 'SHARE TO X'}
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="pt-12 flex justify-center">
        <motion.button 
          whileHover={!isResetting ? { scale: 1.05 } : {}}
          whileTap={!isResetting ? { scale: 0.95 } : {}}
          onClick={handleResetInitiation} 
          disabled={isResetting}
          className={`w-full max-w-2xl h-24 rounded-[48px] bg-cyan-500 text-black font-black italic uppercase tracking-[0.4em] text-xl shadow-[0_30px_100px_rgba(6,182,212,0.4)] transition-all ${isResetting ? 'opacity-0 scale-95' : 'opacity-100'}`}
        >
          {isResetting ? 'NEURAL SYNC...' : 'NEW NEURAL LINK'}
        </motion.button>
      </div>
      <canvas ref={canvasRef} style={{ display: 'none' }} />
    </motion.div>
  );
};

export default PostSessionDashboard;
