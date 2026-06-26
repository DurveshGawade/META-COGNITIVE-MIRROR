import React, { useState } from 'react';
import { ReportData, AppMode, AnalysisEntry } from '../types';
import { motion } from 'framer-motion';

interface ReportModalProps {
  data: ReportData | null;
  mode: AppMode;
  history: AnalysisEntry[];
  currentlySpeakingId: string | null;
  onClose: () => void;
  onSpeak: (text: string, id: string) => void;
  onGenerateManual: () => Promise<void>;
  isLoadingManual: boolean;
}

const BentoMetric: React.FC<{ label: string; value: number; color: string; desc: string }> = ({ label, value, color, desc }) => {
  return (
    <div className="liquid-glass p-5 rounded-[24px] border border-white/5 flex flex-col justify-between min-h-[140px] group relative overflow-hidden">
      {/* Top flux animation */}
      <div className="absolute top-0 left-0 right-0 h-[1px] overflow-hidden opacity-30">
        <motion.div 
          animate={{ x: ['-100%', '100%'] }}
          transition={{ repeat: Infinity, duration: 2.5, ease: "linear" }}
          className="w-1/2 h-full"
          style={{ background: `linear-gradient(90deg, transparent, ${color}, transparent)` }}
        />
      </div>
      
      <div className="flex justify-between items-start relative z-10">
        <span className="text-[10px] font-black uppercase tracking-[0.2em] text-white/40">{label}</span>
        <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: color, boxShadow: `0 0 10px ${color}` }} />
      </div>
      <div className="flex flex-col gap-1 relative z-10">
        <span className="text-3xl font-black text-white tabular-nums">{value}%</span>
        <p className="text-[9px] text-white/30 leading-tight uppercase font-medium">{desc}</p>
      </div>
      <div className="mt-3 h-[2px] w-full bg-white/5 rounded-full overflow-hidden relative z-10">
        <motion.div 
          initial={{ width: 0 }}
          animate={{ width: `${value}%` }}
          className="h-full"
          style={{ backgroundColor: color }}
        />
      </div>
    </div>
  );
};

const NarrativeBlock: React.FC<{ title: string; content: string; icon: React.ReactNode; color: string }> = ({ title, content, icon, color }) => (
  <div className="liquid-glass p-6 rounded-[32px] border-white/5 space-y-4 relative overflow-hidden">
    <div className="absolute top-0 left-0 right-0 h-[1px] bg-white/5">
      <motion.div 
        animate={{ x: ['-100%', '100%'] }}
        transition={{ repeat: Infinity, duration: 4, ease: "linear" }}
        className="w-1/4 h-full"
        style={{ background: `linear-gradient(90deg, transparent, ${color}, transparent)` }}
      />
    </div>
    <div className="flex items-center gap-3 relative z-10">
      <div className="p-2 rounded-xl bg-white/5 border border-white/10" style={{ color }}>
        {icon}
      </div>
      <h3 className="text-xs font-black uppercase tracking-widest text-white/90">{title}</h3>
    </div>
    <div className="text-[11px] md:text-[13px] leading-relaxed text-white/60 font-light space-y-3 relative z-10">
      {(content || "").split('\n\n').map((p, i) => <p key={i}>{p}</p>)}
    </div>
  </div>
);

const ReportModal: React.FC<ReportModalProps> = ({ data, mode, history, currentlySpeakingId, onClose, onSpeak, onGenerateManual, isLoadingManual }) => {
  const [isDownloading, setIsDownloading] = useState(false);
  const isSpeakingSummary = currentlySpeakingId === 'executive-audit';

  const handleSpeakSummary = () => {
    if (data) {
      onSpeak(`Neural Forensic Audit Finalized. Cognitive Resonance: ${data.performanceVerdict}. ${data.executiveSummary}`, 'executive-audit');
    }
  };

  const generateForensicHash = () => {
    return '0x' + Array.from({length: 12}, () => Math.floor(Math.random() * 16).toString(16)).join('').toUpperCase();
  };

  const handleDownload = () => {
    setIsDownloading(true);
    const hash = generateForensicHash();
    
    const content = `
MIRROR CORE: FULL NEURAL FORENSIC AUDIT
UPLINK HASH: ${hash}
GEN TIMESTAMP: ${new Date().toISOString()}
--------------------------------------------------
VERDICT: ${data?.performanceVerdict}
EXECUTIVE SUMMARY: ${data?.executiveSummary}

CORE METRICS:
- Focus Persistence: ${data?.coreMetrics?.focusPersistence}%
- Stress Variability: ${data?.coreMetrics?.stressVariability}%
- Acoustic Clarity: ${data?.coreMetrics?.acousticClarity}%
- Synaptic Flow: ${data?.coreMetrics?.synapticFlow}%

DEEP-DIVE ANALYSIS:

1. VISUAL AUDIT:
${data?.visualAuditNarrative}

2. ACOUSTIC AUDIT:
${data?.acousticAuditNarrative}

3. CORRELATION INSIGHT:
${data?.correlationInsightNarrative}

STRATEGIC ROADMAP:
${(data?.strategicRoadmap || []).map((r, i) => `${i+1}. ${r.title}: ${r.recommendation}`).join('\n\n')}

END OF DOSSIER
    `;
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `neural-forensic-audit-${hash}.pdf.txt`; 
    link.click();
    setTimeout(() => setIsDownloading(false), 1000);
  };

  return (
    <div className="fixed inset-0 z-[10000] flex items-center justify-center p-4 md:p-8 bg-black/90 backdrop-blur-2xl overflow-hidden print:p-0">
      <motion.div 
        initial={{ opacity: 0, scale: 0.9, y: 30 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        className="w-full max-w-7xl h-full liquid-glass rounded-[40px] md:rounded-[60px] border border-cyan-500/20 shadow-[0_0_100px_rgba(0,0,0,1)] flex flex-col overflow-hidden print:rounded-none print:border-none print:h-auto print:overflow-visible"
      >
        <div className="px-8 py-10 md:px-12 md:py-12 border-b border-white/5 flex flex-col md:flex-row justify-between items-start md:items-end gap-6 shrink-0 print:py-6">
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <span className="text-[10px] font-black text-cyan-400 bg-cyan-500/10 border border-cyan-500/30 px-3 py-1 rounded-full uppercase tracking-[0.3em]">Neural Forensic Output</span>
              <div className="w-1.5 h-1.5 rounded-full bg-cyan-500 animate-pulse print:hidden" />
            </div>
            <h1 className="text-3xl md:text-6xl font-black italic tracking-tighter text-white uppercase leading-none">
              FINAL <span className="text-cyan-400">SYNTHESIS</span>
            </h1>
          </div>
          <div className="flex items-center gap-4 w-full md:w-auto print:hidden">
             <div className="hidden lg:flex flex-col items-end gap-1 px-6 py-2 border-r border-white/10">
                <span className="text-[10px] font-black uppercase text-white/30 tracking-widest">Cognitive Resonance</span>
                <span className="text-xl font-black text-emerald-400 uppercase italic">Optimal</span>
             </div>
             <div className="flex gap-3 ml-auto">
                <button 
                  onClick={handleDownload} 
                  disabled={!data || isDownloading}
                  className="flex items-center gap-2 px-6 py-3 rounded-2xl bg-white/5 border border-white/10 text-white hover:bg-white/10 transition-all text-[11px] font-black uppercase tracking-widest disabled:opacity-30"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" /></svg>
                  {isDownloading ? 'Syncing...' : 'Download PDF Report'}
                </button>
                <button 
                  onClick={onClose} 
                  className="p-3 rounded-2xl bg-red-500/10 border border-red-500/30 text-red-400 hover:bg-red-500 hover:text-white transition-all"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" /></svg>
                </button>
             </div>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-8 md:p-12 custom-scrollbar print:overflow-visible">
          {!data ? (
            <div className="h-full flex flex-col items-center justify-center gap-6">
              {isLoadingManual ? (
                <div className="flex flex-col items-center gap-4">
                   <div className="w-16 h-16 rounded-full border-2 border-dashed border-cyan-500 animate-spin" />
                   <p className="text-[10px] font-black uppercase tracking-widest text-white/40">Synthesizing Neural Dossier...</p>
                </div>
              ) : (
                <button onClick={onGenerateManual} className="px-12 py-5 rounded-full bg-cyan-500 text-black font-black uppercase text-xs tracking-[0.3em] shadow-2xl shadow-cyan-500/20">Initialize Final Audit</button>
              )}
            </div>
          ) : (
            <div className="space-y-12 max-w-6xl mx-auto">
              <div className="liquid-glass p-8 rounded-[40px] border-cyan-500/30 bg-cyan-500/5 flex flex-col md:flex-row items-center justify-between gap-8 relative overflow-hidden">
                <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-cyan-400 to-transparent opacity-20" />
                <div className="space-y-4 text-center md:text-left relative z-10">
                  <h3 className="text-[10px] font-black uppercase text-cyan-400 tracking-widest">Analytical Verdict</h3>
                  <p className="text-xl md:text-3xl font-light italic text-white/90 leading-relaxed">"{data.performanceVerdict}"</p>
                </div>
                <button 
                  onClick={handleSpeakSummary}
                  className={`p-6 rounded-3xl border transition-all print:hidden relative z-10 ${isSpeakingSummary ? 'bg-amber-500 text-black border-amber-400' : 'bg-white/5 border-white/10 text-cyan-400'}`}
                >
                  {isSpeakingSummary ? (
                    <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 24 24"><rect x="6" y="6" width="12" height="12" rx="2" /></svg>
                  ) : (
                    <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 24 24"><path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02z"/></svg>
                  )}
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <BentoMetric label="Focus Persistence" value={data.coreMetrics?.focusPersistence || 0} color="#06b6d4" desc="Deep work commitment" />
                <BentoMetric label="Stress Variability" value={data.coreMetrics?.stressVariability || 0} color="#f97316" desc="Nervous system stability" />
                <BentoMetric label="Acoustic Clarity" value={data.coreMetrics?.acousticClarity || 0} color="#8b5cf6" desc="Communication precision" />
                <BentoMetric label="Synaptic Flow" value={data.coreMetrics?.synapticFlow || 0} color="#ec4899" desc="Cognitive resonance" />
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div className="space-y-8">
                  <NarrativeBlock 
                    title="Visual Forensic Audit" 
                    content={data.visualAuditNarrative} 
                    color="#06b6d4"
                    icon={<svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>}
                  />
                  <NarrativeBlock 
                    title="Correlation Insight" 
                    content={data.correlationInsightNarrative} 
                    color="#f59e0b"
                    icon={<svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>}
                  />
                </div>
                <div className="space-y-8">
                  <NarrativeBlock 
                    title="Acoustic Forensic Audit" 
                    content={data.acousticAuditNarrative} 
                    color="#8b5cf6"
                    icon={<svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" /></svg>}
                  />
                  <div className="liquid-glass p-8 rounded-[32px] border-white/10 bg-white/5 space-y-6 relative overflow-hidden">
                    <div className="absolute top-0 left-0 right-0 h-[1px] bg-cyan-500/10" />
                    <h3 className="text-xs font-black uppercase tracking-widest text-white/40 relative z-10">Executive Summary</h3>
                    <p className="text-[13px] md:text-[15px] leading-relaxed text-white/80 font-medium italic relative z-10">
                      {data.executiveSummary}
                    </p>
                  </div>
                </div>
              </div>

              <div className="space-y-8">
                 <div className="flex items-center gap-4">
                    <h2 className="text-xl md:text-3xl font-black italic uppercase text-white tracking-tighter">Strategic <span className="text-cyan-400">Roadmap</span></h2>
                    <div className="flex-1 h-px bg-white/10" />
                 </div>
                 <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {(data.strategicRoadmap || []).map((item, i) => (
                      <div key={i} className="liquid-glass p-6 rounded-[32px] border border-cyan-500/10 hover:border-cyan-500/40 transition-all space-y-4 group relative overflow-hidden">
                         <div className="absolute top-0 left-0 right-0 h-[1px] bg-cyan-500/10 group-hover:bg-cyan-500/40 transition-colors" />
                         <div className="flex items-center gap-3 relative z-10">
                            <span className="text-2xl font-black text-cyan-400/20 group-hover:text-cyan-400 transition-colors tabular-nums">0{i+1}</span>
                            <h4 className="text-[11px] font-black uppercase tracking-widest text-white">{item.title}</h4>
                         </div>
                         <p className="text-[11px] text-white/50 leading-relaxed font-light relative z-10">{item.recommendation}</p>
                      </div>
                    ))}
                 </div>
              </div>

              <div className="flex flex-col items-center gap-2 pt-12 pb-6 border-t border-white/5">
                <span className="text-[8px] font-mono text-white/10 uppercase tracking-[0.5em]">Neural Trace ID: {generateForensicHash()}</span>
                <span className="text-[8px] font-mono text-white/10 uppercase tracking-[0.5em]">Processed by Mirror Core v3.0</span>
              </div>
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
};

export default ReportModal;
