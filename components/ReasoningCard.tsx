
import React from 'react';
import { motion } from 'framer-motion';
import { AnalysisEntry } from '../types';

interface ReasoningCardProps {
  entry: AnalysisEntry;
  showMonologue: boolean;
  isActive?: boolean;
  isSpeaking?: boolean;
  onPlayTTS?: () => void;
  onClick?: () => void;
}

const ReasoningCard: React.FC<ReasoningCardProps> = ({ entry, showMonologue, isActive, isSpeaking, onPlayTTS, onClick }) => {
  const handlePlay = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onPlayTTS) {
      onPlayTTS();
    }
  };

  // Helper to parse split chainOfThought if possible
  const traceLines = entry.chainOfThought.split(/\[(VISUAL_AUDIT|ACOUSTIC_AUDIT)\]:/g).filter(s => s.trim().length > 0);

  return (
    <motion.div
      whileHover={{ 
        scale: 1.01, 
        transition: { type: "spring", stiffness: 300, damping: 20 }
      }}
      onClick={onClick}
      className={`p-6 rounded-[32px] liquid-glass transition-all duration-300 relative group cursor-pointer overflow-visible ${
        isActive 
          ? 'border-cyan-400/60 bg-cyan-400/10 shadow-[0_0_40px_rgba(6,182,212,0.3)]' 
          : entry.isDistracted 
            ? 'border-red-500/40 bg-red-500/5 shadow-[0_15px_50px_rgba(239,68,68,0.2)]' 
            : 'border-white/10 hover:border-cyan-500/40 hover:shadow-[0_25px_80px_rgba(6,182,212,0.25)]'
      }`}
    >
      {(isActive || isSpeaking) && (
        <div className={`absolute -inset-[2px] rounded-[34px] border animate-pulse pointer-events-none ${isSpeaking ? 'border-amber-400 shadow-[0_0_15px_rgba(245,158,11,0.5)]' : 'border-cyan-400'}`} />
      )}

      <div className="flex justify-between items-center mb-4">
        <div className="flex items-center gap-3">
          <span className="text-[10px] font-mono text-cyan-400/80 bg-cyan-400/5 px-2 py-0.5 rounded-full border border-cyan-400/10">
            {entry.timestamp}
          </span>
        </div>
        <div className="flex items-center gap-2">
          {entry.acoustic_alert && entry.acoustic_alert !== 'NONE' && (
             <span className="text-[7px] font-black uppercase px-2 py-1 rounded bg-amber-500/20 text-amber-400 border border-amber-500/30">
               Acoustic: {entry.acoustic_alert}
             </span>
          )}
          <button 
            onClick={handlePlay}
            title={isSpeaking ? "Stop AI Speech" : "Read Forensic Insight"}
            className={`p-1.5 rounded-full border transition-all relative ${
              isSpeaking 
                ? 'bg-amber-500 border-amber-400 text-black shadow-[0_0_15px_rgba(245,158,11,0.8)]' 
                : 'bg-white/5 border-white/10 text-cyan-400 hover:bg-cyan-500/20'
            }`}
          >
            {isSpeaking && (
              <div className="absolute inset-0 rounded-full bg-amber-400 animate-ping opacity-30" />
            )}
            {isSpeaking ? (
              <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 24 24">
                <rect x="6" y="6" width="12" height="12" rx="2" />
              </svg>
            ) : (
              <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 24 24">
                <path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02zM14 3.23v2.06c2.89.86 5 3.54 5 6.71s-2.11 5.85-5 6.71v2.06c4.01-.91 7-4.49 7-8.77s-2.99-7.86-7-8.77z"/>
              </svg>
            )}
          </button>
          <span className={`text-[8px] font-bold uppercase px-3 py-1 rounded-full ${entry.isDistracted ? 'bg-red-500/20 text-red-400' : 'bg-cyan-500/20 text-cyan-400'}`}>
            {entry.isDistracted ? 'DRIFT' : 'FLOW'}
          </span>
        </div>
      </div>
      
      <p className={`text-sm font-black mb-2 uppercase tracking-tight leading-tight transition-colors duration-300 ${isSpeaking ? 'text-amber-400 drop-shadow-[0_0_8px_rgba(245,158,11,0.5)]' : 'text-white/90'}`}>
        {entry.action}
      </p>
      
      <p className={`text-xs leading-relaxed italic transition-colors duration-300 ${isSpeaking ? 'text-white font-medium' : 'text-white/50'}`}>
        "{entry.thinking}"
      </p>

      {showMonologue && (
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="mt-4 pt-4 border-t border-white/5" 
        >
          <label className="text-[8px] uppercase font-black text-violet-400 mb-3 block tracking-[0.3em]">Logical Audit Trace</label>
          <div className="space-y-3">
             {traceLines.length > 1 ? (
               traceLines.map((line, idx) => {
                 const isLabel = idx % 2 === 0;
                 if (isLabel) return <span key={idx} className="text-[7px] font-black text-white/20 uppercase tracking-widest block">{line.replace('_AUDIT', '')} ANALYTICS:</span>;
                 return <p key={idx} className="text-[10px] font-mono text-violet-200/40 leading-relaxed pl-2 border-l border-white/5">{line.trim()}</p>;
               })
             ) : (
               <p className="text-[10px] font-mono text-violet-200/40 leading-relaxed">
                 {entry.chainOfThought}
               </p>
             )}
          </div>
        </motion.div>
      )}
    </motion.div>
  );
};

export default ReasoningCard;
