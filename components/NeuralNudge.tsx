
import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface NeuralNudgeProps {
  visible: boolean;
  message: string;
  onDismiss: () => void;
}

const NeuralNudge: React.FC<NeuralNudgeProps> = ({ visible, message, onDismiss }) => {
  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ opacity: 0, x: 100, scale: 0.9 }}
          animate={{ opacity: 1, x: 0, scale: 1 }}
          exit={{ opacity: 0, x: 100, scale: 0.9 }}
          className="fixed bottom-24 right-8 z-[200] w-80"
        >
          <div className="liquid-glass p-6 rounded-[32px] border border-amber-500/40 neon-glow-gold relative overflow-hidden">
            {/* Animated Background Pulse */}
            <div className="absolute inset-0 bg-amber-500/5 animate-pulse" />
            
            <div className="relative z-10">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-2xl bg-amber-500/20 flex items-center justify-center text-amber-400 border border-amber-500/30">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                </div>
                <div>
                  <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-amber-400">Neural Nudge</h4>
                  <p className="text-[8px] text-amber-200/50 uppercase font-bold">Resonance Reset Triggered</p>
                </div>
              </div>

              <p className="text-xs text-white/90 leading-relaxed italic mb-6">
                "{message}"
              </p>

              <div className="flex gap-2">
                <button 
                  onClick={onDismiss}
                  className="flex-1 py-2 rounded-xl bg-amber-500 text-black text-[9px] font-black uppercase tracking-widest hover:bg-amber-400 transition-colors"
                >
                  Initiate Reset
                </button>
                <button 
                  onClick={onDismiss}
                  className="px-4 py-2 rounded-xl bg-white/5 border border-white/10 text-white/60 text-[9px] font-bold uppercase hover:bg-white/10 transition-colors"
                >
                  Skip
                </button>
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default NeuralNudge;
