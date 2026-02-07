
import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { DetectedObject } from '../types';

interface GhostOverlayProps {
  objects?: DetectedObject[];
  visible: boolean;
  isDistracted?: boolean;
  videoRef: React.RefObject<HTMLVideoElement | null>;
}

const GhostOverlay: React.FC<GhostOverlayProps> = ({ objects = [], visible, isDistracted, videoRef }) => {
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });
  const observerRef = useRef<ResizeObserver | null>(null);

  useEffect(() => {
    if (visible && videoRef.current) {
      const updateDimensions = () => {
        if (videoRef.current) {
          setDimensions({
            width: videoRef.current.clientWidth,
            height: videoRef.current.clientHeight
          });
        }
      };

      updateDimensions();
      
      observerRef.current = new ResizeObserver(() => {
        requestAnimationFrame(updateDimensions);
      });
      
      observerRef.current.observe(videoRef.current);
    }

    return () => {
      observerRef.current?.disconnect();
    };
  }, [visible, videoRef]);

  if (!visible || !dimensions.width) return null;

  return (
    <div className="absolute inset-0 pointer-events-none z-10 overflow-hidden">
      <AnimatePresence>
        {objects.map((obj, index) => {
          if (!obj.box_2d) return null;
          const [ymin, xmin, ymax, xmax] = obj.box_2d;
          const top = (ymin / 1000) * dimensions.height;
          const left = (xmin / 1000) * dimensions.width;
          const width = ((xmax - xmin) / 1000) * dimensions.width;
          const height = ((ymax - ymin) / 1000) * dimensions.height;
          
          const color = isDistracted && obj.label?.toLowerCase()?.includes('distract') ? '#ef4444' : '#00ffff';

          return (
            <motion.div 
              key={`${obj.label}-${index}`}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1, top, left, width, height }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.4, ease: "easeOut" }}
              className="absolute border-[1.5px] backdrop-blur-[1px] transition-all duration-300 ease-in-out" 
              style={{ 
                borderColor: color, 
                boxShadow: `0 0 15px ${color}44`, 
                backgroundColor: `${color}05` 
              }}
            >
              <div className="absolute -top-5 left-0 px-2 py-0.5 whitespace-nowrap" style={{ backgroundColor: color }}>
                <span className="text-[7px] md:text-[9px] font-black uppercase tracking-widest text-black italic">{obj.label || 'Artifact'}</span>
              </div>
              {obj.sentiment && (
                <div className="absolute top-2 left-2 flex flex-col gap-1">
                   <div className="px-2 py-0.5 bg-black/80 border border-white/10 rounded-sm text-[7px] text-cyan-400 uppercase font-mono">TRACE: {obj.sentiment}</div>
                </div>
              )}
            </motion.div>
          );
        })}
      </AnimatePresence>
    </div>
  );
};

export default GhostOverlay;
