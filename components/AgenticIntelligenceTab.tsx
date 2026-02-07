
import React from 'react';
import { motion } from 'framer-motion';
import { SessionHistory, ActionItem } from '../types';

interface AgenticIntelligenceTabProps {
  history: SessionHistory[];
  currentDetected?: ActionItem[];
}

const AgenticIntelligenceTab: React.FC<AgenticIntelligenceTabProps> = ({ history, currentDetected = [] }) => {
  return (
    <div className="flex flex-col gap-6 h-full animate-in slide-in-from-right duration-500">
      {/* Current Intent Monitoring */}
      <div className="space-y-3">
        <h4 className="text-[9px] font-black uppercase tracking-widest text-cyan-400">Live Intent Monitor</h4>
        <div className="p-4 rounded-2xl bg-cyan-500/5 border border-cyan-500/10 min-h-[80px] flex flex-col justify-center">
          {currentDetected.length > 0 ? (
            currentDetected.map((act, i) => (
              <div key={i} className="flex items-center gap-3 text-xs text-white/80">
                <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse" />
                {act.title}
              </div>
            ))
          ) : (
            <span className="text-[10px] text-white/20 italic">Awaiting commitment signals...</span>
          )}
        </div>
      </div>

      {/* Neural Context Buffer */}
      <div className="space-y-3 flex-1 overflow-hidden flex flex-col">
        <h4 className="text-[9px] font-black uppercase tracking-widest text-violet-400">Neural Context Buffer</h4>
        <div className="flex-1 overflow-y-auto space-y-2 pr-2">
          {history.length > 0 ? (
            history.map((session, i) => (
              <motion.div 
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.1 }}
                key={i} 
                className="p-3 rounded-xl bg-white/5 border border-white/5 hover:border-violet-500/30 transition-colors"
              >
                <div className="flex justify-between items-center mb-1">
                  <span className="text-[8px] font-mono text-white/30">{session.date}</span>
                  <span className="text-[10px] font-black text-violet-400">{session.focusScore}%</span>
                </div>
                <p className="text-[10px] text-white/60 line-clamp-2 leading-relaxed">
                  {session.summary}
                </p>
              </motion.div>
            ))
          ) : (
            <div className="p-8 text-center text-[10px] text-white/10 uppercase font-black tracking-widest">
              Context Buffer Empty
            </div>
          )}
        </div>
      </div>

      {/* Logic Core Status */}
      <div className="pt-4 border-t border-white/5">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-violet-500/20 flex items-center justify-center text-violet-400 border border-violet-500/30">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
            </svg>
          </div>
          <div>
            <div className="text-[8px] text-violet-400 font-black uppercase">Adaptive Learning</div>
            <div className="text-[10px] text-white/40">Active Optimization Core</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AgenticIntelligenceTab;
