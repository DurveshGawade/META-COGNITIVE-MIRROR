
import React from 'react';
import { motion } from 'framer-motion';

interface SentimentGaugeProps {
  score: number; // 0 to 1
  label: string | undefined;
}

const SentimentGauge: React.FC<SentimentGaugeProps> = ({ score, label }) => {
  const getVibeColor = (labelName: string | undefined) => {
    if (!labelName) return '#06b6d4';
    try {
      switch (labelName.toLowerCase()) {
        case 'flow': return '#8b5cf6';
        case 'frustration': return '#f97316';
        case 'fatigue': return '#3b82f6';
        case 'excited': return '#ec4899';
        case 'stressed': return '#ef4444';
        default: return '#06b6d4';
      }
    } catch (e) { return '#06b6d4'; }
  };

  const color = getVibeColor(label);

  return (
    <div className="relative flex flex-col items-center">
      <div className="relative w-32 h-32 flex items-center justify-center">
        <svg className="absolute inset-0 w-full h-full transform -rotate-90">
          <circle cx="50%" cy="50%" r="40%" fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="8" />
          <motion.circle cx="50%" cy="50%" r="40%" fill="none" stroke={color} strokeWidth="8" strokeLinecap="round" strokeDasharray="251" initial={{ strokeDashoffset: 251 }} animate={{ strokeDashoffset: 251 - (score * 251) }} transition={{ type: "spring", stiffness: 50, damping: 20 }} style={{ filter: `drop-shadow(0 0 8px ${color})` }} />
        </svg>
        <motion.div animate={{ scale: [1, 1.1, 1], opacity: [0.3, 0.6, 0.3] }} transition={{ duration: 2, repeat: Infinity }} className="absolute w-16 h-16 rounded-full" style={{ backgroundColor: color, filter: 'blur(20px)' }} />
        <div className="z-10 text-center">
          <motion.div key={label} initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} className="text-[10px] font-black uppercase tracking-tighter text-white">
            {label || 'Stable'}
          </motion.div>
          <div className="text-[8px] font-bold text-white/40 uppercase tracking-widest mt-1">Sentiment</div>
        </div>
      </div>
    </div>
  );
};

export default SentimentGauge;
