
import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AnalysisEntry } from '../types';

interface InteractiveTimelineProps {
  history: AnalysisEntry[];
  duration: number;
  currentTime: number;
  onSeek: (time: number) => void;
}

const InteractiveTimeline: React.FC<InteractiveTimelineProps> = ({ history, duration, currentTime, onSeek }) => {
  // Safety check for duration
  if (!duration || !isFinite(duration) || duration <= 0) return null;

  const handleTimelineClick = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const seekTime = (x / rect.width) * duration;
    onSeek(seekTime);
  };

  return (
    <div className="relative w-full h-8 mt-4 group cursor-pointer">
      {/* Background Track */}
      <div 
        className="absolute inset-0 bg-white/5 rounded-full border border-white/10 overflow-hidden"
        onClick={handleTimelineClick}
      >
        {/* Heatmap/Segments */}
        {history.map((entry, i) => {
          const nextEntry = history[i + 1];
          const startTime = entry.timestampSeconds;
          const endTime = nextEntry ? nextEntry.timestampSeconds : duration;
          const left = (startTime / duration) * 100;
          const width = ((endTime - startTime) / duration) * 100;

          return (
            <motion.div
              key={i}
              className="absolute top-0 bottom-0 group/segment"
              style={{
                left: `${left}%`,
                width: `${width}%`,
                backgroundColor: entry.isDistracted ? 'rgba(239, 68, 68, 0.4)' : 'rgba(6, 182, 212, 0.3)',
                boxShadow: entry.isDistracted ? 'inset 0 0 10px rgba(239, 68, 68, 0.2)' : 'inset 0 0 10px rgba(6, 182, 212, 0.1)',
              }}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
            >
              {/* Tooltip */}
              <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 opacity-0 group-hover/segment:opacity-100 pointer-events-none z-[100] transition-opacity duration-200">
                <div className="bg-black/90 backdrop-blur-xl border border-white/20 p-3 rounded-xl shadow-2xl w-48 text-[10px]">
                  <div className="flex justify-between items-center mb-1">
                    <span className={`font-black uppercase tracking-widest ${entry.isDistracted ? 'text-red-400' : 'text-cyan-400'}`}>
                      {entry.isDistracted ? 'Drift' : 'Flow'}
                    </span>
                    <span className="text-white/40 font-mono">{entry.timestamp}</span>
                  </div>
                  <p className="text-white/80 leading-tight line-clamp-2">{entry.thinking}</p>
                </div>
                <div className="w-2 h-2 bg-black border-r border-b border-white/20 rotate-45 absolute -bottom-1 left-1/2 -translate-x-1/2" />
              </div>

              {/* Gaze Heatmap Layer */}
              <div 
                className="absolute inset-0 opacity-50"
                style={{
                  background: `linear-gradient(to top, transparent, ${entry.isDistracted ? 'rgba(239, 68, 68, 0.4)' : 'rgba(6, 182, 212, 0.4)'})`,
                  height: `${(entry.focusLevel / 100) * 100}%`,
                  marginTop: 'auto'
                }}
              />
            </motion.div>
          );
        })}

        {/* Playback Indicator */}
        <motion.div 
          className="absolute top-0 bottom-0 w-[2px] bg-white z-10 shadow-[0_0_15px_white]"
          style={{ left: `${(currentTime / duration) * 100}%` }}
          animate={{ x: 0 }}
        />
      </div>

      {/* Pulsing Warning Red for Drift Zones */}
      <AnimatePresence>
        {history.filter(h => h.isDistracted).map((h, i) => (
          <motion.div
            key={`pulse-${i}`}
            className="absolute top-0 bottom-0 bg-red-500/10 pointer-events-none"
            initial={{ opacity: 0 }}
            animate={{ opacity: [0, 0.2, 0] }}
            transition={{ repeat: Infinity, duration: 2 }}
            style={{
              left: `${(h.timestampSeconds / duration) * 100}%`,
              width: `${(4 / duration) * 100}%` // Approx chunk width
            }}
          />
        ))}
      </AnimatePresence>

      <div className="flex justify-between mt-1 px-1">
        <span className="text-[8px] font-mono text-white/30">00:00:00</span>
        <span className="text-[8px] font-mono text-white/30">NEURAL TIMELINE</span>
        <span className="text-[8px] font-mono text-white/30">
          {new Date(duration * 1000).toISOString().substr(11, 8)}
        </span>
      </div>
    </div>
  );
};

export default InteractiveTimeline;
