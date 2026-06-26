
import React from 'react';
import { motion } from 'framer-motion';

interface TabBriefingProps {
  title: string;
  description: string;
  steps: string[];
  color: string;
}

const TabBriefing: React.FC<TabBriefingProps> = ({ title, description, steps, color }) => {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="p-8 md:p-12 rounded-[48px] md:rounded-[56px] bg-black/40 border border-white/5 liquid-glass flex flex-col gap-10 md:gap-16 items-start"
    >
      <div className="w-full space-y-6">
        <div className="flex items-center gap-4">
          <div className="w-2 h-2 rounded-full animate-pulse" style={{ backgroundColor: color }} />
          <h3 className="text-[10px] md:text-xs font-black uppercase tracking-[0.4em]" style={{ color }}>{title}</h3>
        </div>
        <p className="text-xl md:text-4xl font-light text-white/90 leading-[1.1] italic max-w-5xl">{description}</p>
      </div>
      
      <div className="w-full pt-10 border-t border-white/5">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-12">
          {steps.map((step, i) => (
            <div key={i} className="flex flex-col gap-4 items-start group">
              <div className="flex items-center gap-3">
                <div 
                  className="w-10 h-10 md:w-12 md:h-12 rounded-2xl border flex items-center justify-center text-xs font-black transition-all group-hover:scale-110" 
                  style={{ borderColor: `${color}33`, color, backgroundColor: `${color}08` }}
                >
                  0{i + 1}
                </div>
                <div className="h-px flex-1 bg-white/5 hidden md:block" />
              </div>
              <span className="text-[9px] md:text-[10px] font-black uppercase tracking-[0.2em] text-white/40 group-hover:text-white transition-colors leading-relaxed">
                {step}
              </span>
            </div>
          ))}
        </div>
      </div>
    </motion.div>
  );
};

export default TabBriefing;
