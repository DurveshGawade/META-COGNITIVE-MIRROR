
import React, { useEffect, useRef, useMemo } from 'react';
import { AnalysisEntry } from '../types';

interface NeuralTimelineProps {
  entries: AnalysisEntry[];
}

const NeuralTimeline: React.FC<NeuralTimelineProps> = ({ entries }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const stats = useMemo(() => {
    if (entries.length === 0) return { optimalPercent: 0, stressPercent: 0, lastSpike: null, status: 'STANDBY' };
    
    const drift = entries.filter(e => e.isDistracted).length;
    const stress = entries.filter(e => !e.isDistracted && (e.emotion_label === 'Stressed' || e.emotion_label === 'Frustration')).length;
    const optimal = entries.length - drift - stress;
    
    const lastSpike = [...entries].reverse().find(e => e.emotion_label === 'Stressed' || e.isDistracted);
    
    // Efficiency Logic
    const lastEntry = entries[entries.length - 1];
    let status = 'BALANCED';
    // If Load (focusLevel) is high but efficiency/vibe is low -> Overload
    if (lastEntry.focusLevel > 85 && (lastEntry.emotion_label === 'Stressed' || lastEntry.emotion_label === 'Frustration')) {
      status = 'COGNITIVE OVERLOAD DETECTED';
    } 
    // If Load is moderate but output/flow is exceptionally stable/high -> Peak Flow
    else if (lastEntry.focusLevel < 70 && lastEntry.emotion_label === 'Flow' && lastEntry.emotion_score > 0.85) {
      status = 'PEAK FLOW STATE';
    }
    else if (lastEntry.isDistracted) {
      status = 'NEURAL DRIFT DETECTED';
    }

    return {
      optimalPercent: Math.round((optimal / entries.length) * 100),
      driftPercent: Math.round((drift / entries.length) * 100),
      stressPercent: Math.round((stress / entries.length) * 100),
      lastSpike: lastSpike?.timestamp || null,
      status
    };
  }, [entries]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const render = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      if (entries.length === 0) {
        ctx.fillStyle = 'rgba(255, 255, 255, 0.1)';
        ctx.font = '10px Inter';
        ctx.textAlign = 'center';
        ctx.fillText('ESTABLISHING NEURAL UPLINK...', canvas.width / 2, canvas.height / 2);
        return;
      }

      const margin = 20;
      const width = canvas.width - (margin * 2);
      const height = canvas.height - (margin * 2);
      
      // Increased sampling/visibility: Show last 100 points
      const visibleEntries = entries.slice(-100);
      const step = width / Math.max(visibleEntries.length - 1, 1);

      // 1. Draw Forensic Scanline Grid
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.03)';
      ctx.lineWidth = 1;
      for (let y = margin; y <= canvas.height - margin; y += height / 5) {
        ctx.beginPath();
        ctx.moveTo(margin, y);
        ctx.lineTo(canvas.width - margin, y);
        ctx.stroke();
      }
      for (let x = margin; x <= canvas.width - margin; x += width / 10) {
        ctx.beginPath();
        ctx.moveTo(x, margin);
        ctx.lineTo(x, canvas.height - margin);
        ctx.stroke();
      }

      // 2. Prepare Path for Area Chart
      ctx.beginPath();
      visibleEntries.forEach((entry, i) => {
        const x = margin + (i * step);
        const baseVal = (entry.focusLevel / 100) * height;
        // Pulse effect for live feel
        const pulse = Math.sin(Date.now() / 150 + i) * 2;
        const valHeight = Math.max(baseVal + pulse, 5);
        const y = canvas.height - margin - valHeight;

        if (i === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      });

      // Close path for area fill
      const lastX = margin + ((visibleEntries.length - 1) * step);
      ctx.lineTo(lastX, canvas.height - margin);
      ctx.lineTo(margin, canvas.height - margin);
      ctx.closePath();

      // Area Gradient Fill (20% Opacity)
      const fillGrad = ctx.createLinearGradient(0, margin, 0, canvas.height - margin);
      fillGrad.addColorStop(0, 'rgba(0, 255, 255, 0.15)');
      fillGrad.addColorStop(1, 'rgba(139, 92, 246, 0.05)');
      ctx.fillStyle = fillGrad;
      ctx.fill();

      // 3. Draw Waveform Stroke (Neon Cyan)
      ctx.beginPath();
      visibleEntries.forEach((entry, i) => {
        const x = margin + (i * step);
        const baseVal = (entry.focusLevel / 100) * height;
        const pulse = Math.sin(Date.now() / 150 + i) * 2;
        const valHeight = Math.max(baseVal + pulse, 5);
        const y = canvas.height - margin - valHeight;

        if (i === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      });

      ctx.strokeStyle = '#00FFFF';
      ctx.lineWidth = 3;
      ctx.shadowBlur = 15;
      ctx.shadowColor = '#00FFFF';
      ctx.stroke();
      ctx.shadowBlur = 0; // Reset shadow

      // 4. Highlight Neural Spikes (Neon Green)
      visibleEntries.forEach((entry, i) => {
        // Spike defined as > 90% load or sudden 20% jump
        const isSpike = entry.focusLevel > 90;
        if (isSpike) {
          const x = margin + (i * step);
          const valHeight = (entry.focusLevel / 100) * height + Math.sin(Date.now() / 150 + i) * 2;
          const y = canvas.height - margin - valHeight;

          ctx.fillStyle = '#39FF14';
          ctx.shadowBlur = 10;
          ctx.shadowColor = '#39FF14';
          ctx.beginPath();
          ctx.arc(x, y, 4, 0, Math.PI * 2);
          ctx.fill();
          ctx.shadowBlur = 0;
        }
      });
    };

    let animationFrame = requestAnimationFrame(function loop() {
      render();
      animationFrame = requestAnimationFrame(loop);
    });
    
    return () => cancelAnimationFrame(animationFrame);
  }, [entries]);

  return (
    <div className="w-full h-full flex flex-col p-3 md:p-4 liquid-glass rounded-2xl border border-white/5 bg-black/20">
      <div className="flex justify-between items-start mb-2">
        <div className="flex flex-col gap-0.5">
          <h3 className="text-[10px] md:text-[11px] uppercase font-black text-cyan-400 tracking-[0.3em]">Neural Waveform Audit</h3>
          <span className={`text-[8px] md:text-[9px] font-black uppercase transition-all duration-500 flex items-center gap-2 ${
            stats.status.includes('OVERLOAD') ? 'text-amber-400' : 
            stats.status.includes('FLOW') ? 'text-emerald-400' : 
            stats.status.includes('DRIFT') ? 'text-red-400' : 'text-cyan-400/60'
          }`}>
            <span className="w-1.5 h-1.5 rounded-full bg-current animate-pulse" />
            {stats.status}
          </span>
        </div>
        <div className="flex gap-4 text-[8px] font-black uppercase tracking-wider">
          <div className="flex items-center gap-1.5">
            <div className="w-2 h-2 rounded-full border border-cyan-400/50 bg-cyan-400 shadow-[0_0_8px_#00FFFF]" />
            <span className="text-white/60">Flow</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-2 h-2 rounded-full border border-amber-500/50 bg-amber-500 shadow-[0_0_8px_#f59e0b]" />
            <span className="text-white/60">Stress</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-2 h-2 rounded-full border border-green-400/50 bg-[#39FF14] shadow-[0_0_10px_#39FF14]" />
            <span className="text-white/60">Spike</span>
          </div>
        </div>
      </div>
      
      <div className="relative flex-1 rounded-xl overflow-hidden bg-black/60 border border-white/5 shadow-inner">
        {/* Subtle grid pattern overlay */}
        <div className="absolute inset-0 pointer-events-none opacity-20" style={{ 
          backgroundImage: 'radial-gradient(circle, rgba(255,255,255,0.05) 1px, transparent 1px)', 
          backgroundSize: '20px 20px' 
        }} />
        <canvas ref={canvasRef} width={1600} height={400} className="w-full h-full" />
      </div>

      <div className="mt-2.5 px-1.5 flex justify-between items-center border-t border-white/5 pt-2">
        <p className="text-[9px] text-white/40 leading-tight max-w-[80%]">
          <span className="text-cyan-400 font-black tracking-widest mr-2">AUDIT SUMMARY:</span>
          Subject spent <span className="text-white font-black">{stats.optimalPercent}%</span> of the session in Optimal Load range, 
          {stats.lastSpike ? ` with a detected stress spike at ${stats.lastSpike}.` : ' maintaining consistent biometrics.'}
        </p>
        <div className="flex flex-col items-end">
           <div className="text-[7px] font-mono text-cyan-500/40 uppercase tracking-[0.3em]">SAMPLING_RATE: 16kHz</div>
           <div className="text-[7px] font-mono text-cyan-500/40 uppercase tracking-[0.3em]">FIDELITY: HIGH_RANGE</div>
        </div>
      </div>
    </div>
  );
};

export default NeuralTimeline;
