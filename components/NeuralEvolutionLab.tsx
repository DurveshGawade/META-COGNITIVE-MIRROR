
import { AnimatePresence, motion } from 'framer-motion';
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { GeminiService } from '../services/geminiService';
import { EvolutionLog, EvolutionMetrics, WeakLink } from '../types';
import TabBriefing from './TabBriefing';

interface NeuralEvolutionLabProps {
  onAriaToast: (m: string) => void;
  history: any[];
}

const SectionHeader: React.FC<{ title: string; subtitle: string; color: string }> = ({ title, subtitle, color }) => (
  <div className="mb-12 space-y-4">
    <div className="flex items-center gap-4">
      <span className="px-4 py-1 rounded-full border text-[10px] font-mono font-black uppercase tracking-widest" style={{ borderColor: `${color}44`, color, backgroundColor: `${color}11` }}>
        MARATHON_AGENT_UPLINK
      </span>
      <div className="flex-1 h-px bg-white/10" />
    </div>
    <h2 className="text-4xl md:text-6xl font-black italic tracking-tighter uppercase text-white leading-none">
      {title} <span style={{ color }}>{subtitle}</span>
    </h2>
  </div>
);

const SynapticBrain: React.FC<{ activeNodes: number }> = ({ activeNodes }) => {
  return (
    <div className="relative w-full h-[500px] flex items-center justify-center group">
       <div className="absolute inset-0 bg-cyan-500/5 blur-[120px] rounded-full pointer-events-none group-hover:bg-cyan-500/10 transition-all duration-1000" />
       
       <svg viewBox="0 0 400 400" className="w-full h-full drop-shadow-[0_0_80px_rgba(6,182,212,0.4)]">
          <motion.path 
            d="M200,50 Q280,50 320,130 Q360,210 320,290 Q280,370 200,370 Q120,370 80,290 Q40,210 80,130 Q120,50 200,50"
            fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="0.5" 
          />
          {[...Array(24)].map((_, i) => {
            const angle = (i / 24) * Math.PI * 2;
            const r = 120 + Math.sin(i) * 20;
            const x = 200 + Math.cos(angle) * r;
            const y = 200 + Math.sin(angle) * r;
            const isActive = i < activeNodes;
            
            return (
              <g key={i}>
                <motion.circle 
                  cx={x} cy={y} r={isActive ? 3 : 1.5}
                  fill={isActive ? "#06b6d4" : "rgba(255,255,255,0.1)"}
                  animate={isActive ? { scale: [1, 1.5, 1], opacity: [0.5, 1, 0.5] } : {}}
                  transition={{ repeat: Infinity, duration: 2, delay: i * 0.1 }}
                />
                {isActive && (
                  <motion.line 
                    x1="200" y1="200" x2={x} y2={y}
                    stroke="rgba(6,182,212,0.1)" strokeWidth="0.5"
                    initial={{ pathLength: 0 }} animate={{ pathLength: 1 }}
                  />
                )}
              </g>
            );
          })}
          <motion.circle 
            cx="200" cy="200" r="40" 
            fill="none" stroke="#06b6d4" strokeWidth="2" strokeDasharray="10 5"
            animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 20, ease: "linear" }}
          />
       </svg>
       <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
          <span className="text-[10px] font-black text-cyan-400 uppercase tracking-[1em] mb-2">Neural Core</span>
          <span className="text-4xl font-black text-white italic tracking-tighter tabular-nums">{activeNodes * 4}%</span>
       </div>
    </div>
  );
};

const NeuralEvolutionLab: React.FC<NeuralEvolutionLabProps> = ({ onAriaToast, history }) => {
  const [logs, setLogs] = useState<EvolutionLog[]>([]);
  const [metrics, setMetrics] = useState<EvolutionMetrics>({
    optimizedSignsCount: 0,
    weakLinksDetected: 0,
    antigravityPassRate: 0,
    autonmousHours: 0
  });
  const [weakLinks, setWeakLinks] = useState<WeakLink[]>([]);
  const [isAuditing, setIsAuditing] = useState(false);
  const [thinkingLevel, setThinkingLevel] = useState<'Minimal' | 'Deep Audit'>('Minimal');
  
  const terminalRef = useRef<HTMLDivElement>(null);
  const gemini = useMemo(() => new GeminiService(), []);

  useEffect(() => {
    if (terminalRef.current) {
      terminalRef.current.scrollTop = terminalRef.current.scrollHeight;
    }
  }, [logs]);

  const runAutonomousAudit = async () => {
    setIsAuditing(true);
    onAriaToast("MARATHON_AGENT: INITIALIZING_AUDIT");
    
    try {
      const result = await gemini.performMarathonAudit(history);
      
      // Simulate sequential log arrival
      for (const log of result.logs) {
        setLogs(prev => [...prev, log]);
        await new Promise(r => setTimeout(r, 600));
      }

      setMetrics(result.metrics);
      setWeakLinks(result.weakLinks);
      
      // For each weak link, trigger Creative Autopilot to generate a tutorial
      for (let i = 0; i < result.weakLinks.length; i++) {
        const link = result.weakLinks[i];
        const tutorialUrl = await gemini.generateEvolutionTutorial(link);
        setWeakLinks(prev => {
          const next = [...prev];
          next[i] = { ...next[i], tutorialUrl, correctionStatus: 'STABLE' };
          return next;
        });
        setLogs(prev => [...prev, {
          timestamp: new Date().toLocaleTimeString(),
          id: `tut-${Date.now()}`,
          type: 'AUTOPILOT',
          message: `Generated custom 3D infographic for: ${link.gloss}`,
          status: 'SUCCESS'
        }]);
      }

    } catch (e) {
      onAriaToast("AUDIT_ERROR: UPLINK_INTERRUPTED");
    } finally {
      setIsAuditing(false);
    }
  };

  const handleResetLab = useCallback(() => {
    setLogs([]);
    setWeakLinks([]);
    setMetrics({
      optimizedSignsCount: 0,
      weakLinksDetected: 0,
      antigravityPassRate: 0,
      autonmousHours: 0
    });
    setIsAuditing(false);
    onAriaToast("EVOLUTION_LAB: SYSTEM_STANDBY_REINITIALIZED");
  }, [onAriaToast]);

  return (
    <div className="max-w-[1700px] mx-auto px-8 flex flex-col gap-32">
      <TabBriefing 
        title="MODEL: AUTONOMOUS R&D"
        description="Evolution Lab audits long-form behavioral history to identify 'weak links' and optimize your unique kinetic signature via creative autopilot."
        steps={["MARATHON AUDIT", "DETECT WEAKNESS", "AUTOPILOT TUTOR", "OPTIMIZE LEXEMES"]}
        color="#06b6d4"
      />

      <section className="flex flex-col gap-12">
        <div className="flex justify-between items-end">
          <SectionHeader title="EVOLUTION LAB:" subtitle="Autonomous R&D" color="#06b6d4" />
          <div className="flex flex-col items-end gap-6 mb-12">
            <div className="flex gap-4 bg-white/5 p-2 rounded-2xl border border-white/5 backdrop-blur-xl">
               <div className="px-4 py-2 flex items-center gap-3">
                  <span className="text-[10px] font-black uppercase text-white/30 tracking-widest:">Thinking Level:</span>
                  <button 
                    onClick={() => setThinkingLevel(t => t === 'Minimal' ? 'Deep Audit' : 'Minimal')}
                    className="bg-transparent text-cyan-400 text-[11px] font-black uppercase tracking-widest outline-none cursor-pointer"
                  >
                    {thinkingLevel}
                  </button>
               </div>
               <div className="w-px h-6 bg-white/10 my-auto" />
               <button 
                 onClick={handleResetLab}
                 className="px-4 py-2 text-red-400 text-[10px] font-black uppercase tracking-widest hover:text-red-500 transition-colors flex items-center gap-2 group"
               >
                 <svg className="w-3 h-3 group-hover:rotate-180 transition-transform duration-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /></svg>
                 Restart Model to Standby
               </button>
            </div>
          </div>
        </div>

        <div className="grid lg:grid-cols-12 gap-10">
          {/* Left: Autonomous Activity Log */}
          <div className="lg:col-span-4 liquid-glass rounded-[64px] p-10 bg-black/40 border-white/5 flex flex-col gap-8 h-[750px]">
             <div className="flex justify-between items-center border-b border-white/5 pb-6">
                <h3 className="text-[12px] font-black uppercase text-cyan-400 tracking-[0.4em]">Agent Thought Stream</h3>
                <div className="flex items-center gap-2">
                   <div className={`w-2 h-2 rounded-full ${isAuditing ? 'bg-emerald-500 animate-pulse' : 'bg-white/10'}`} />
                   <span className="text-[10px] font-mono text-white/30 uppercase">Live_Audit</span>
                </div>
             </div>
             
             <div ref={terminalRef} className="flex-1 overflow-y-auto custom-scrollbar space-y-6 pr-4 font-mono">
                {logs.length > 0 ? logs.map((log, i) => (
                  <motion.div 
                    initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }}
                    key={log.id} className="space-y-2 group"
                  >
                    <div className="flex justify-between text-[10px]">
                       <span className="text-white/20">[{log.timestamp}]</span>
                       <span className={`font-black ${log.status === 'SUCCESS' ? 'text-emerald-400' : 'text-amber-400'}`}>{log.type}</span>
                    </div>
                    <p className="text-[11px] text-white/70 leading-relaxed italic group-hover:text-white transition-colors">{log.message}</p>
                    {log.thoughtSignature && (
                      <div className="p-2 rounded bg-cyan-500/5 border border-cyan-500/10 text-[9px] text-cyan-400/60 truncate">
                        SIG_TRACE: {log.thoughtSignature}
                      </div>
                    )}
                  </motion.div>
                )) : (
                  <div className="h-full flex flex-col items-center justify-center opacity-10 uppercase text-[10px] tracking-[2em] text-center p-20 italic">
                    Awaiting Marathon Trigger...
                  </div>
                )}
             </div>

             <div className="flex flex-col gap-4">
                <button 
                  onClick={runAutonomousAudit} disabled={isAuditing}
                  className={`w-full py-6 rounded-[32px] ${isAuditing ? 'bg-white/5 text-cyan-400/40 cursor-not-allowed' : 'bg-cyan-500 text-black hover:scale-[1.02]'} font-black italic uppercase tracking-[0.4em] text-xs shadow-3xl transition-all`}
                >
                  {isAuditing ? "Auditing History..." : "Initialize Marathon Audit"}
                </button>

                {(logs.length > 0 || weakLinks.length > 0) && !isAuditing && (
                  <button 
                    onClick={handleResetLab}
                    className="w-full py-4 rounded-[32px] bg-red-500/10 border border-red-500/30 text-red-400 font-black uppercase text-[10px] tracking-[0.4em] hover:bg-red-500 hover:text-white transition-all flex items-center justify-center gap-3 group"
                  >
                    <svg className="w-4 h-4 group-hover:rotate-180 transition-transform duration-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                    </svg>
                    SYSTEM_RESET_STANDBY
                  </button>
                )}
             </div>
          </div>

          {/* Center: Synaptic Brain Visualization */}
          <div className="lg:col-span-5 liquid-glass rounded-[64px] bg-black/60 border border-white/5 flex flex-col shadow-3xl min-h-[600px] relative overflow-hidden">
             <div className="absolute inset-0 forensic-grid opacity-10 pointer-events-none" />
             <SynapticBrain activeNodes={isAuditing ? 24 : 8} />
             
             <div className="p-10 border-t border-white/5 bg-black/40 backdrop-blur-xl">
                <div className="grid grid-cols-2 gap-10">
                   <div className="space-y-2">
                      <span className="text-[10px] font-black text-white/30 uppercase tracking-widest">Autonomous Hours</span>
                      <div className="text-3xl font-black text-white tabular-nums">{metrics.autonmousHours}</div>
                   </div>
                   <div className="space-y-2 text-right">
                      <span className="text-[10px] font-black text-white/30 uppercase tracking-widest">Google Antigravity Rate</span>
                      <div className="text-3xl font-black text-cyan-400 tabular-nums">{metrics.antigravityPassRate}%</div>
                   </div>
                </div>
             </div>
          </div>

          {/* Right: Bento Metrics */}
          <div className="lg:col-span-3 flex flex-col gap-10">
             <div className="liquid-glass p-8 rounded-[48px] border-white/5 bg-black/40 flex flex-col gap-6 group hover:border-cyan-500/30 transition-all">
                <h4 className="text-[10px] font-black uppercase text-cyan-400 tracking-[0.4em]">Self-Correction Hub</h4>
                <div className="space-y-1">
                   <div className="text-5xl font-black text-white italic tracking-tighter">{metrics.optimizedSignsCount}</div>
                   <p className="text-[10px] text-white/40 uppercase font-bold tracking-widest">Optimized Lexemes</p>
                </div>
                <div className="h-1 w-full bg-white/5 rounded-full overflow-hidden">
                   <motion.div animate={{ width: metrics.optimizedSignsCount > 0 ? '85%' : '0%' }} className="h-full bg-cyan-500" />
                </div>
                <p className="text-[10px] text-white/30 leading-relaxed italic">The Marathon Agent has optimized sign mappings based on your unique kinetic style.</p>
             </div>

             <div className="liquid-glass p-8 rounded-[48px] border-white/5 bg-black/40 flex flex-col gap-6 group hover:border-violet-500/30 transition-all">
                <h4 className="text-[10px] font-black uppercase text-violet-400 tracking-[0.4em]">Autonomous Tutor</h4>
                <div className="space-y-1">
                   <div className="text-5xl font-black text-white italic tracking-tighter">{metrics.weakLinksDetected}</div>
                   <p className="text-[10px] text-white/40 uppercase font-bold tracking-widest">Custom 3D Tutorials</p>
                </div>
                <div className="flex gap-2">
                   {[...Array(5)].map((_, i) => (
                     <div key={i} className={`w-1.5 h-6 rounded-full transition-all ${i < metrics.weakLinksDetected ? 'bg-violet-500' : 'bg-violet-500/20 group-hover:bg-violet-500'}`} style={{ transitionDelay: `${i * 100}ms` }} />
                   ))}
                </div>
                <p className="text-[10px] text-white/30 leading-relaxed italic">Generated tutorials for identified "Weak Links" verified via Creative Autopilot.</p>
             </div>
          </div>
        </div>
      </section>

      {/* Tutorial Hub */}
      <section className="flex flex-col gap-12 mb-32">
        <SectionHeader title="WEAK LINKS:" subtitle="Generated Performance Feedback" color="#a855f7" />
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-10">
          <AnimatePresence>
            {weakLinks.length > 0 ? weakLinks.map((link, i) => (
              <motion.div 
                initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
                key={link.gloss} 
                className="liquid-glass p-10 rounded-[48px] border border-white/5 bg-black/40 flex flex-col gap-8 group hover:border-purple-500/40 transition-all"
              >
                 <div className="aspect-square rounded-[36px] bg-black overflow-hidden relative border border-white/5">
                    {link.tutorialUrl ? (
                      <img src={link.tutorialUrl} className="w-full h-full object-cover" alt={link.gloss} />
                    ) : (
                      <div className="w-full h-full flex flex-col items-center justify-center gap-4">
                         <div className="w-12 h-12 rounded-full border-2 border-dashed border-white/10 animate-spin" />
                         <span className="text-[8px] font-black text-white/20 uppercase">Rendering 3D...</span>
                      </div>
                    )}
                    <div className="absolute top-4 right-4 px-2 py-1 rounded bg-purple-500 text-black text-[7px] font-black uppercase">{link.correctionStatus}</div>
                 </div>
                 <div className="space-y-4">
                    <h4 className="text-3xl font-black italic uppercase text-white tracking-tighter">"{link.gloss}"</h4>
                    <div className="p-4 rounded-2xl bg-white/5 border border-white/5">
                       <span className="text-[8px] font-black text-purple-400 uppercase tracking-widest block mb-2">Anatomical Fix</span>
                       <p className="text-[11px] text-white/60 italic leading-relaxed">{link.anatomicalFix}</p>
                    </div>
                 </div>
              </motion.div>
            )) : (
              <div className="lg:col-span-4 p-40 text-center text-white/10 uppercase tracking-[2em] text-xs italic">
                Awaiting Audit Extraction...
              </div>
            )}
          </AnimatePresence>
        </div>
      </section>

    </div>
  );
};

export default NeuralEvolutionLab;
