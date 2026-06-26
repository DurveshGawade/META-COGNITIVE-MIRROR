
import React from 'react';
import { motion } from 'framer-motion';

interface ConfidenceMeterProps {
  label: string;
  value: number;
  color: string;
}

const ConfidenceMeter: React.FC<ConfidenceMeterProps> = ({ label, value, color }) => {
  return (
    <div className="space-y-2">
      <div className="flex justify-between items-end">
        <span className="text-[9px] font-bold uppercase tracking-widest text-white/40">{label}</span>
        <span className="text-xs font-black" style={{ color }}>{value}%</span>
      </div>
      <div className="h-2 w-full bg-white/5 rounded-full overflow-hidden border border-white/10 p-[1px]">
        <motion.div 
          initial={{ width: 0 }}
          animate={{ width: `${value}%` }}
          transition={{ duration: 1, ease: "easeOut" }}
          className="h-full rounded-full shadow-[0_0_10px_rgba(255,255,255,0.2)]"
          style={{ backgroundColor: color }}
        />
      </div>
    </div>
  );
};

export default ConfidenceMeter;
