
import React from 'react';

interface AgenticPulseProps {
  isAnalyzing: boolean;
  intensity: number; // 1 to 5
}

const AgenticPulse: React.FC<AgenticPulseProps> = ({ isAnalyzing, intensity }) => {
  const duration = isAnalyzing ? `${2 / intensity}s` : '3s';
  const color = isAnalyzing ? 'bg-cyan-500' : 'bg-white/20';

  return (
    <div className="flex items-center gap-3 glass px-4 py-2 rounded-full border border-white/10">
      <div className="relative flex items-center justify-center">
        <div 
          className={`absolute w-4 h-4 rounded-full ${color} opacity-30 animate-ping`}
          style={{ animationDuration: duration }}
        />
        <div className={`w-2 h-2 rounded-full ${color}`} />
      </div>
      <span className="text-[10px] font-mono tracking-tighter text-white/40">
        {isAnalyzing ? `AGENT_INTENSITY_L${intensity}` : 'AGENT_DORMANT'}
      </span>
    </div>
  );
};

export default AgenticPulse;
