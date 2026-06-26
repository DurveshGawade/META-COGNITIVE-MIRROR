
import React, { useEffect, useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const Splash: React.FC = () => {
  const [bootProgress, setBootProgress] = useState(0);
  const [flash, setFlash] = useState(false);
  const [glitchActive, setGlitchActive] = useState(false);

  // Generate some random binary data for the background
  const binaryData = useMemo(() => {
    return Array.from({ length: 40 }).map(() => 
      Math.random().toString(2).slice(2, 20)
    );
  }, []);

  useEffect(() => {
    // Audio synthesis for boot sound
    const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
    const playBootSound = () => {
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(40, audioCtx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(800, audioCtx.currentTime + 3);
      gain.gain.setValueAtTime(0, audioCtx.currentTime);
      gain.gain.linearRampToValueAtTime(0.1, audioCtx.currentTime + 0.1);
      gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 3.5);
      osc.connect(gain);
      gain.connect(audioCtx.destination);
      osc.start();
      osc.stop(audioCtx.currentTime + 3.5);

      // Chime at the end
      setTimeout(() => {
        const chime = audioCtx.createOscillator();
        const chimeGain = audioCtx.createGain();
        chime.type = 'triangle';
        chime.frequency.setValueAtTime(880, audioCtx.currentTime);
        chimeGain.gain.setValueAtTime(0.2, audioCtx.currentTime);
        chimeGain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 1);
        chime.connect(chimeGain);
        chimeGain.connect(audioCtx.destination);
        chime.start();
        chime.stop(audioCtx.currentTime + 1);
      }, 3000);
    };

    // Delay start slightly to allow interaction if needed, or just play
    const startTimeout = setTimeout(() => {
      try { playBootSound(); } catch (e) {}
    }, 500);

    const interval = setInterval(() => {
      setBootProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          setFlash(true);
          setGlitchActive(true);
          return 100;
        }
        return prev + 1;
      });
    }, 30);

    return () => {
      clearInterval(interval);
      clearTimeout(startTimeout);
      audioCtx.close();
    };
  }, []);

  return (
    <motion.div 
      initial={{ opacity: 1 }}
      exit={{ 
        opacity: 0, 
        scale: 1.1,
        transition: { duration: 1, ease: [0.19, 1, 0.22, 1] }
      }}
      className={`fixed inset-0 z-[10000] bg-[#010103] flex flex-col items-center justify-center overflow-hidden ${glitchActive ? 'crt-glitch active' : ''}`}
    >
      <div className="scanline" />

      {/* Background Data Stream */}
      <div className="absolute inset-0 flex flex-col gap-4 p-8 opacity-10 pointer-events-none overflow-hidden select-none">
        {binaryData.map((line, i) => (
          <motion.div
            key={i}
            initial={{ x: "-100%" }}
            animate={{ x: "100%" }}
            transition={{ 
              duration: 10 + Math.random() * 20, 
              repeat: Infinity, 
              ease: "linear",
              delay: Math.random() * -20
            }}
            className="text-[10px] font-mono text-cyan-500 whitespace-nowrap"
          >
            {line.repeat(10)}
          </motion.div>
        ))}
      </div>

      {/* Assembly Container */}
      <motion.div
        layoutId="mainLogoContainer"
        className="relative w-64 h-64 flex items-center justify-center mb-12"
      >
        {/* Cyan Flash glow pulse */}
        <AnimatePresence>
          {flash && (
            <motion.div
              initial={{ scale: 0.5, opacity: 0 }}
              animate={{ scale: 4, opacity: [0.8, 0] }}
              transition={{ duration: 1 }}
              className="absolute inset-0 rounded-full bg-cyan-400 blur-[80px]"
            />
          )}
        </AnimatePresence>

        {/* Circular Progress Ring */}
        <svg className="absolute inset-0 w-full h-full -rotate-90">
          <motion.circle
            cx="50%" cy="50%" r="48%"
            stroke="rgba(6, 182, 212, 0.1)"
            strokeWidth="1"
            fill="none"
          />
          <motion.circle
            cx="50%" cy="50%" r="48%"
            stroke="#06b6d4"
            strokeWidth="2"
            fill="none"
            strokeDasharray="200 100"
            animate={{ rotate: 360 }}
            transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
            style={{ 
              pathLength: bootProgress / 100,
              filter: "drop-shadow(0 0 8px #06b6d4)" 
            }}
          />
        </svg>

        {/* Logo Assembly Segments */}
        <div className="relative w-40 h-40">
          {/* Top-Left Segment */}
          <motion.div
            initial={{ x: -100, y: -100, opacity: 0 }}
            animate={{ x: 0, y: 0, opacity: 1 }}
            transition={{ type: "spring", stiffness: 100, damping: 15, delay: 0.2 }}
            className="absolute top-0 left-0 w-1/2 h-1/2 border-t-4 border-l-4 border-cyan-500 rounded-tl-3xl"
          />
          {/* Top-Right Segment */}
          <motion.div
            initial={{ x: 100, y: -100, opacity: 0 }}
            animate={{ x: 0, y: 0, opacity: 1 }}
            transition={{ type: "spring", stiffness: 100, damping: 15, delay: 0.4 }}
            className="absolute top-0 right-0 w-1/2 h-1/2 border-t-4 border-r-4 border-cyan-500 rounded-tr-3xl"
          />
          {/* Bottom-Left Segment */}
          <motion.div
            initial={{ x: -100, y: 100, opacity: 0 }}
            animate={{ x: 0, y: 0, opacity: 1 }}
            transition={{ type: "spring", stiffness: 100, damping: 15, delay: 0.6 }}
            className="absolute bottom-0 left-0 w-1/2 h-1/2 border-b-4 border-l-4 border-cyan-500 rounded-bl-3xl"
          />
          {/* Bottom-Right Segment */}
          <motion.div
            initial={{ x: 100, y: 100, opacity: 0 }}
            animate={{ x: 0, y: 0, opacity: 1 }}
            transition={{ type: "spring", stiffness: 100, damping: 15, delay: 0.8 }}
            className="absolute bottom-0 right-0 w-1/2 h-1/2 border-b-4 border-r-4 border-cyan-500 rounded-br-3xl"
          />

          {/* Central Iris & Core */}
          <div className="absolute inset-4 flex items-center justify-center">
            <svg width="100%" height="100%" viewBox="0 0 100 100">
              <motion.path
                layoutId="mainLogoIris"
                initial={{ pathLength: 0, opacity: 0 }}
                animate={{ pathLength: 1, opacity: 1 }}
                transition={{ duration: 1.5, delay: 1.2 }}
                d="M 25 50 C 25 25, 75 25, 75 50 C 75 75, 25 75, 25 50"
                stroke="#06b6d4"
                strokeWidth="2"
                fill="none"
              />
              <motion.circle 
                layoutId="mainLogoCore"
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ type: "spring", stiffness: 200, delay: 2.2 }}
                cx="50" cy="50" r="8" fill="#06b6d4" 
              />
            </svg>
          </div>
        </div>
      </motion.div>

      {/* Boot Status Text */}
      <div className="text-center relative">
        <motion.h1
          layoutId="mainLogoText"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 2.5 }}
          className="text-white text-3xl md:text-4xl font-black font-heading tracking-[0.4em] uppercase italic shimmer"
        >
          NEURAL MIRROR
        </motion.h1>
        
        <div className="mt-6 flex flex-col items-center gap-2">
          <div className="w-48 h-1 bg-white/5 rounded-full overflow-hidden border border-white/10">
            <motion.div 
              className="h-full bg-cyan-500 shadow-[0_0_10px_cyan]"
              style={{ width: `${bootProgress}%` }}
            />
          </div>
          <div className="flex gap-4">
            <span className="text-[9px] font-mono text-cyan-500/50 tracking-widest uppercase">
              BOOTING_SEQUENCE_{bootProgress}%
            </span>
            <span className="text-[9px] font-mono text-cyan-500/50 tracking-widest uppercase">
              RESONANCE_STABLE
            </span>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default Splash;
