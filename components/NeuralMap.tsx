
import React from 'react';
import { motion } from 'framer-motion';

const Node = ({ label, sub, color, delay }: { label: string, sub: string, color: string, delay: number }) => (
  <motion.div 
    initial={{ opacity: 0, y: 50 }}
    whileInView={{ opacity: 1, y: 0 }}
    transition={{ delay, duration: 0.8 }}
    className="relative flex flex-col items-center gap-4 group perspective-1000"
  >
    <motion.div 
      whileHover={{ rotateY: 20, rotateX: 20, translateZ: 50 }}
      className={`w-32 h-32 md:w-48 md:h-48 rounded-[32px] liquid-glass border-2 border-white/5 flex items-center justify-center relative overflow-hidden group-hover:border-${color}-500/50 transition-all`}
      style={{ boxShadow: `0 0 40px rgba(0,0,0,0.4)` }}
    >
      <div className={`absolute inset-0 bg-gradient-to-br from-${color}-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity`} />
      <div className={`text-2xl md:text-4xl font-black text-${color}-400 group-hover:scale-110 transition-transform`}>
        {label.charAt(0)}
      </div>
    </motion.div>
    <div className="text-center space-y-1">
      <h4 className="text-[10px] md:text-xs font-black uppercase tracking-[0.3em] text-white">{label}</h4>
      <p className="text-[8px] md:text-[9px] text-white/30 uppercase tracking-widest">{sub}</p>
    </div>
  </motion.div>
);

const Connection = ({ delay }: { delay: number }) => (
  <div className="hidden md:flex flex-1 items-center justify-center px-4">
    <motion.div 
      initial={{ width: 0 }}
      whileInView={{ width: '100%' }}
      transition={{ delay, duration: 1 }}
      className="h-px bg-gradient-to-r from-transparent via-white/20 to-transparent relative"
    >
      <motion.div 
        animate={{ left: ['-10%', '110%'] }}
        transition={{ repeat: Infinity, duration: 2, ease: "linear", delay }}
        className="absolute top-1/2 -translate-y-1/2 w-4 h-4 rounded-full bg-cyan-400 blur-sm"
      />
    </motion.div>
  </div>
);

const NeuralMap: React.FC = () => {
  return (
    <section className="py-32 px-8 max-w-7xl mx-auto space-y-24">
      <div className="text-center space-y-4">
        <span className="text-[10px] font-black text-cyan-400 uppercase tracking-[0.4em]">Proprietary Matrix</span>
        <h2 className="text-4xl md:text-7xl font-black italic uppercase tracking-tighter text-white">Neural <span className="text-cyan-400">Pipeline</span></h2>
      </div>

      <div className="flex flex-col md:flex-row items-center justify-between gap-8">
        <Node label="Ingestion" sub="Multimodal Stream" color="cyan" delay={0.1} />
        <Connection delay={0.3} />
        <Node label="Fusion" sub="Gemini 3 Tensor" color="violet" delay={0.5} />
        <Connection delay={0.7} />
        <Node label="Extraction" sub="Feature Mapping" color="amber" delay={0.9} />
        <Connection delay={1.1} />
        <Node label="Output" sub="Immutable Audit" color="emerald" delay={1.3} />
      </div>

      <div className="bg-white/5 border border-white/10 rounded-[40px] p-8 grid md:grid-cols-4 gap-8">
        {[
          { l: 'Latency', v: '12ms' },
          { l: 'Neural Link', v: 'Active' },
          { l: 'Security', v: 'AES-256' },
          { l: 'Model', v: 'G3-Flash' }
        ].map((item, i) => (
          <div key={i} className="flex flex-col gap-1 border-r border-white/5 last:border-0">
             <span className="text-[9px] font-black text-white/20 uppercase tracking-widest">{item.l}</span>
             <span className="text-xs font-mono text-cyan-400 font-bold uppercase tracking-widest">[{item.v}]</span>
          </div>
        ))}
      </div>
    </section>
  );
};

export default NeuralMap;
