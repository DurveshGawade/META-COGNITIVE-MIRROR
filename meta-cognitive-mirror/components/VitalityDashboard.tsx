
import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface VitalityDashboardProps {
  isAnalyzing: boolean;
  isProcessing: boolean;
  onClose: () => void;
}

const VitalityDashboard: React.FC<VitalityDashboardProps> = ({ isAnalyzing, isProcessing, onClose }) => {
  const [latency, setLatency] = useState(150);
  const [throughput, setThroughput] = useState(0);
  const [cpuUsage, setCpuUsage] = useState(34);
  const [ramUsage, setRamUsage] = useState(2.4);
  const [logs, setLogs] = useState<string[]>([]);
  const logEndRef = useRef<HTMLDivElement>(null);

  // Live Simulation logic
  useEffect(() => {
    const interval = setInterval(() => {
      // Latency simulation
      setLatency(Math.floor(Math.random() * (250 - 120 + 1) + 120));
      
      // Throughput simulation based on analysis state
      if (isProcessing) {
        setThroughput(prev => Math.min(prev + Math.floor(Math.random() * 50), 4500));
      } else {
        setThroughput(prev => Math.max(prev - 100, 0));
      }

      // Resource simulation
      setCpuUsage(prev => {
        const target = isAnalyzing ? 60 + Math.random() * 20 : 20 + Math.random() * 10;
        return Math.floor(prev + (target - prev) * 0.1);
      });
      
      setRamUsage(prev => {
        const target = isAnalyzing ? 4.2 : 2.1;
        return Number((prev + (target - prev) * 0.05).toFixed(1));
      });

      // Kernel Log Simulation
      const logTemplates = [
        `[PING: Gemini-API-v3] [STATUS: 200 OK] [LATENCY: ${latency}ms]`,
        `[FRAME_BUFFER] Flushing stack 0x${Math.random().toString(16).slice(2, 8).toUpperCase()}`,
        `[ACOUSTIC_LINK] Sampling at 16000Hz - Channels: 1`,
        `[NEURAL_GATE] Commitment confirmed - Syncing...`,
        `[AUDIT_KERNEL] Forensic analysis thread ${Math.floor(Math.random() * 8)} heartbeat: ACTIVE`,
        `[STORAGE] Buffering to volatile mirror cache...`
      ];
      
      if (Math.random() > 0.4) {
        const newLog = `[${new Date().toLocaleTimeString()}] ${logTemplates[Math.floor(Math.random() * logTemplates.length)]}`;
        setLogs(prev => [...prev, newLog].slice(-25));
      }
    }, 1500);

    return () => clearInterval(interval);
  }, [isAnalyzing, isProcessing, latency]);

  // Auto-scroll logs
  useEffect(() => {
    logEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [logs]);

  const StatItem = ({ label, value, unit, color = "text-white" }: { label: string, value: any, unit?: string, color?: string }) => (
    <div className="flex flex-col gap-1">
      <span className="text-[10px] font-black uppercase tracking-widest text-white/30">{label}</span>
      <div className={`text-2xl md:text-3xl font-black tabular-nums ${color}`}>
        {value}<span className="text-[10px] ml-1 opacity-50">{unit}</span>
      </div>
    </div>
  );

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[10002] bg-black/60 backdrop-blur-3xl flex items-center justify-center p-4 md:p-12 overflow-hidden"
    >
      <div className="w-full max-w-6xl h-full max-h-[850px] liquid-glass rounded-[40px] md:rounded-[64px] border border-cyan-500/20 flex flex-col relative shadow-2xl overflow-hidden">
        
        {/* Top Header */}
        <div className="p-8 md:p-12 border-b border-white/5 flex justify-between items-start">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <div className="w-3 h-3 rounded-full bg-cyan-500 animate-pulse shadow-[0_0_15px_#06b6d4]" />
              <h2 className="text-3xl md:text-5xl font-black italic tracking-tighter uppercase text-white">SYSTEM <span className="text-cyan-400">VITALITY</span></h2>
            </div>
            <p className="text-[10px] md:text-xs font-mono text-white/30 uppercase tracking-[0.4em] ml-1">KERNEL_DIAGNOSTICS_LIVE_UPLINK</p>
          </div>
          <button 
            onClick={onClose}
            className="group flex flex-col items-center gap-2 text-white/40 hover:text-white transition-all"
          >
            <div className="w-12 h-12 rounded-full border border-white/10 flex items-center justify-center group-hover:border-cyan-500/50 group-hover:bg-cyan-500/10 transition-all">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" /></svg>
            </div>
            <span className="text-[8px] font-black uppercase tracking-widest">Back to HUD</span>
          </button>
        </div>

        {/* Dashboard Sections */}
        <div className="flex-1 overflow-y-auto p-8 md:p-12 grid grid-cols-1 lg:grid-cols-3 gap-8 md:gap-12 custom-scrollbar">
          
          {/* Section A: AI API Health */}
          <div className="space-y-8">
            <h3 className="text-xs font-black uppercase tracking-[0.3em] text-cyan-400 border-l-2 border-cyan-500 pl-4">AI API Health</h3>
            <div className="grid gap-6">
              <StatItem label="Token Throughput" value={throughput.toLocaleString()} unit="tokens/sec" color="text-cyan-100" />
              <StatItem label="API Latency" value={latency} unit="ms" color={latency > 200 ? "text-amber-400" : "text-white"} />
              <div className="flex flex-col gap-1">
                <span className="text-[10px] font-black uppercase tracking-widest text-white/30">Model Engine</span>
                <div className="text-xl font-black text-white italic uppercase tracking-tighter">Gemini 3 Flash</div>
              </div>
            </div>
          </div>

          {/* Section B: Multimodal Sync */}
          <div className="space-y-8">
            <h3 className="text-xs font-black uppercase tracking-[0.3em] text-violet-400 border-l-2 border-violet-500 pl-4">Multimodal Sync</h3>
            <div className="grid gap-6">
              <div className="flex items-center gap-4 p-4 rounded-3xl bg-white/5 border border-white/5">
                <div className={`w-3 h-3 rounded-full ${isAnalyzing ? 'bg-emerald-500 animate-pulse' : 'bg-white/10'}`} />
                <div className="flex flex-col">
                   <span className="text-[11px] font-black text-white uppercase">Visual Frame Analysis</span>
                   <span className="text-[8px] text-white/40 uppercase tracking-widest">{isAnalyzing ? 'Uplink Established' : 'Awaiting initialization'}</span>
                </div>
              </div>
              <div className="flex items-center gap-4 p-4 rounded-3xl bg-white/5 border border-white/5">
                <div className={`w-3 h-3 rounded-full ${isAnalyzing ? 'bg-emerald-500 animate-pulse' : 'bg-white/10'}`} />
                <div className="flex flex-col">
                   <span className="text-[11px] font-black text-white uppercase">Acoustic Stream</span>
                   <span className="text-[8px] text-white/40 uppercase tracking-widest">{isAnalyzing ? 'Transcribing (16kHz)' : 'Awaiting initialization'}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Section C: Resource Audit */}
          <div className="space-y-8">
            <h3 className="text-xs font-black uppercase tracking-[0.3em] text-amber-400 border-l-2 border-amber-500 pl-4">Resource Audit</h3>
            <div className="grid gap-6">
              <StatItem label="Device CPU Usage" value={cpuUsage} unit="%" />
              <StatItem label="RAM Allocation" value={ramUsage} unit="GB" />
              <div className="flex flex-col gap-1">
                <span className="text-[10px] font-black uppercase tracking-widest text-white/30">Neural Buffer Status</span>
                <div className="flex items-center gap-2">
                   <div className="flex-1 h-2 bg-white/5 rounded-full overflow-hidden border border-white/5">
                      <motion.div 
                        animate={{ width: isAnalyzing ? '92%' : '4%' }}
                        className="h-full bg-cyan-500 shadow-[0_0_8px_#06b6d4]"
                      />
                   </div>
                   <span className="text-[10px] font-mono text-cyan-400">{isAnalyzing ? '92%' : '4%'}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* System Kernel Log */}
        <div className="h-40 md:h-52 bg-black/40 border-t border-white/10 p-6 md:p-8 font-mono text-[9px] md:text-[11px] flex flex-col gap-1 overflow-y-auto custom-scrollbar">
           {logs.map((log, i) => (
             <div key={i} className="flex gap-4">
               <span className="text-cyan-500/40 shrink-0">MIRROR_CORE:</span>
               <span className="text-white/60">{log}</span>
             </div>
           ))}
           <div ref={logEndRef} />
        </div>
      </div>
    </motion.div>
  );
};

export default VitalityDashboard;
