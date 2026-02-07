
import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { EmergencyAlert, SigningScriptSegment, DetectedObject, SignInterpretation } from '../types';
import { GeminiService } from '../services/geminiService';
import AgenticPulse from './AgenticPulse';
import TabBriefing from './TabBriefing';
import GhostOverlay from './GhostOverlay';

interface CrisisSignProps {
  onAriaToast: (m: string) => void;
}

interface ThreadMessage {
  id: string;
  text: string;
  sender: 'user' | 'responder' | 'system';
  timestamp: string;
}

type CrisisProtocol = 'NONE' | 'ALPHA_SYNC' | 'BETA_BRIDGE';

const MOCK_IPAWS_ALERTS: EmergencyAlert[] = [
  {
    id: 'fema-123-tornado',
    event: 'Tornado Warning',
    severity: 'Extreme',
    urgency: 'Immediate',
    areaDesc: 'Cook County, IL',
    description: 'A large and extremely dangerous tornado was located over Northbrook, moving east at 45 mph. This is a PARTICULARLY DANGEROUS SITUATION.',
    instruction: 'TAKE COVER NOW! Move to a basement or an interior room on the lowest floor of a sturdy building.',
    sent: new Date().toISOString()
  }
];

const EXAMPLE_LOCATION = {
  label: "Northbrook Sector-7",
  coords: "42.1275° N, 87.8289° W",
  area: "Northbrook, IL"
};

const TacticalMap: React.FC<{ area: string; mini?: boolean }> = ({ area, mini }) => {
  const [zoomScale, setZoomScale] = useState(1); // 1 = Wide, 2 = Mid, 3 = Deep
  const [mapSvg, setMapSvg] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const gemini = useMemo(() => new GeminiService(), []);

  const zoomLabels = ["WIDE_SCAN", "SECTOR_SYNC", "DEEP_FORENSIC"];

  const generateMap = useCallback(async (scale: number) => {
    setIsLoading(true);
    try {
      const svg = await gemini.generateTacticalSVG(area, zoomLabels[scale - 1]);
      setMapSvg(svg);
    } catch (e) {
      console.error("Vector Map Generation Failed", e);
    } finally {
      setIsLoading(false);
    }
  }, [area, gemini]);

  useEffect(() => {
    generateMap(zoomScale);
  }, [zoomScale, generateMap]);

  const handleZoom = (type: 'in' | 'out') => {
    setZoomScale(prev => {
      if (type === 'in') return Math.min(3, prev + 1);
      return Math.max(1, prev - 1);
    });
  };

  return (
    <div className={`relative w-full rounded-[32px] overflow-hidden border border-red-500/30 bg-black shadow-inner flex items-center justify-center ${mini ? 'h-48' : 'h-full min-h-[400px]'}`}>
      <div className="absolute inset-0 forensic-grid opacity-10 pointer-events-none z-10" />
      
      <AnimatePresence mode="wait">
        {isLoading ? (
          <motion.div 
            key="loading"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="flex flex-col items-center gap-4 z-20"
          >
            <div className="w-12 h-12 rounded-full border-2 border-dashed border-red-500 animate-spin" />
            <span className="text-[8px] font-black uppercase text-red-500 tracking-[0.4em] animate-pulse">Neural_Vector_Scan...</span>
          </motion.div>
        ) : mapSvg ? (
          <motion.div 
            key={zoomScale}
            initial={{ opacity: 0, scale: 1.1 }}
            animate={{ opacity: 1, scale: 1 }}
            className="w-full h-full flex items-center justify-center p-4"
            dangerouslySetInnerHTML={{ __html: mapSvg }}
            style={{ 
              filter: 'drop-shadow(0 0 15px rgba(6,182,212,0.3))',
            }}
          />
        ) : (
          <div className="text-[10px] text-white/20 uppercase font-black">Awaiting Vector Link</div>
        )}
      </AnimatePresence>

      <div className="absolute top-4 right-4 flex flex-col gap-2 z-40">
        <button 
          onClick={() => handleZoom('in')}
          disabled={zoomScale >= 3 || isLoading}
          className="w-10 h-10 rounded-xl bg-black/80 backdrop-blur-md border border-red-500/40 text-red-500 flex items-center justify-center font-black hover:bg-red-500 hover:text-black transition-all active:scale-90 shadow-xl disabled:opacity-20"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M12 4v16m8-8H4" /></svg>
        </button>
        <button 
          onClick={() => handleZoom('out')}
          disabled={zoomScale <= 1 || isLoading}
          className="w-10 h-10 rounded-xl bg-black/80 backdrop-blur-md border border-red-500/40 text-red-500 flex items-center justify-center font-black hover:bg-red-500 hover:text-black transition-all active:scale-90 shadow-xl disabled:opacity-20"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M20 12H4" /></svg>
        </button>
      </div>

      <div className="absolute bottom-4 right-4 pointer-events-none flex flex-col items-end gap-1 z-30">
         <div className="w-16 h-px bg-red-500/40" />
         <span className="text-[7px] font-mono text-red-500/60 uppercase">Vector_Parity: {zoomLabels[zoomScale - 1]}</span>
      </div>

      <div className="absolute bottom-4 left-4 flex flex-col gap-1 z-30">
        <div className="px-3 py-1 bg-black/80 backdrop-blur-md rounded-lg border border-red-500/30 shadow-2xl">
          <span className="text-[7px] font-mono text-red-500 font-black uppercase tracking-widest">LOC: {area}</span>
        </div>
      </div>
    </div>
  );
};

const CrisisSign: React.FC<CrisisSignProps> = ({ onAriaToast }) => {
  const [activeAlert, setActiveAlert] = useState<EmergencyAlert | null>(null);
  const [activeProtocol, setActiveProtocol] = useState<CrisisProtocol>('NONE');
  const [signingScript, setSigningScript] = useState<SigningScriptSegment[]>([]);
  const [scriptIdx, setScriptIdx] = useState(0);
  const [glossImages, setGlossImages] = useState<Record<string, string>>({});
  const [isEmergencyMode, setIsEmergencyMode] = useState(false);
  
  // Protocol Beta States
  const [transcriptText, setTranscriptText] = useState("");
  const [currentGloss, setCurrentGloss] = useState("");
  const [glossHistory, setGlossHistory] = useState<string[]>([]);
  const [fullInterpretations, setFullInterpretations] = useState<SignInterpretation[]>([]);
  const [detectedObjects, setDetectedObjects] = useState<DetectedObject[]>([]);
  const [isSynthesizingText, setIsSynthesizingText] = useState(false);
  const [messageThread, setMessageThread] = useState<ThreadMessage[]>([]);
  
  // Interaction States
  const [isRecording, setIsRecording] = useState(false);
  const [recordedVideoUrl, setRecordedVideoUrl] = useState<string | null>(null);
  const [isLocationSent, setIsLocationSent] = useState(false);
  const [isLiveActive, setIsLiveActive] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isSynthesizing, setIsSynthesizing] = useState(false);
  const [isAvatarVisible, setIsAvatarVisible] = useState(false);
  const [acknowledgedAlertIds, setAcknowledgedAlertIds] = useState<Set<string>>(new Set());

  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const recordedChunksRef = useRef<Blob[]>([]);
  const gemini = useMemo(() => new GeminiService(), []);
  const neuralLoopRef = useRef<number | null>(null);
  const isRequestInProgress = useRef(false);
  const synthesisDebounceRef = useRef<number | null>(null);
  const threadEndRef = useRef<HTMLDivElement>(null);

  // 1. SOS Beacon Poll
  useEffect(() => {
    const poll = () => {
      const alert = MOCK_IPAWS_ALERTS[0];
      if (alert && !activeAlert && !acknowledgedAlertIds.has(alert.id)) {
        onAriaToast("CRITICAL_ALERT_RECEIVED");
        setActiveAlert(alert);
        generateAlertScript(alert);
      }
    };
    const pollInterval = setInterval(poll, 15000);
    poll();
    return () => clearInterval(pollInterval);
  }, [activeAlert, acknowledgedAlertIds, onAriaToast]);

  const generateAlertScript = async (alert: EmergencyAlert) => {
    const strictScript: SigningScriptSegment[] = [
      { segment_id: 1, sign_text: 'TORNADO', emphasis: 'CRITICAL', pacing: 'MODERATE', facial_expression: 'Intense' },
      { segment_id: 2, sign_text: 'WARNING', emphasis: 'CRITICAL', pacing: 'MODERATE', facial_expression: 'Alert' },
      { segment_id: 3, sign_text: 'DANGER', emphasis: 'CRITICAL', pacing: 'FAST', facial_expression: 'Serious' }
    ];
    setSigningScript(strictScript);
    setIsSynthesizing(true);
    for (const segment of strictScript) {
      try {
        const url = await gemini.generateSignImage(`Urgent ASL sign for "${segment.sign_text}". Obsidian glass avatar style.`);
        setGlossImages(prev => ({ ...prev, [segment.sign_text]: url }));
      } catch (e) { console.warn(e); }
    }
    setIsSynthesizing(false);
  };

  useEffect(() => {
    if (signingScript.length > 0 && activeAlert && isAvatarVisible) {
      const segment = signingScript[scriptIdx];
      const duration = segment.pacing === 'FAST' ? 1200 : 2000;
      const timer = setTimeout(() => {
        setScriptIdx(prev => (prev + 1) % signingScript.length);
      }, duration);
      return () => clearTimeout(timer);
    }
  }, [signingScript, scriptIdx, activeAlert, isAvatarVisible]);

  // 2. High-Precision Neural Narrative Synthesis
  useEffect(() => {
    if (activeProtocol !== 'BETA_BRIDGE' || glossHistory.length === 0) {
      setTranscriptText("");
      return;
    }
    if (synthesisDebounceRef.current) window.clearTimeout(synthesisDebounceRef.current);
    synthesisDebounceRef.current = window.setTimeout(async () => {
      const glosses = glossHistory.filter(g => g && g.toLowerCase() !== 'none' && g !== 'SEARCHING' && g !== 'SCANNING...');
      if (glosses.length === 0) return;
      setIsSynthesizingText(true);
      try {
        const text = await gemini.synthesizeTranscript(glosses, "ASL");
        if (text) setTranscriptText(text);
      } catch (e) { console.error(e); } finally { setIsSynthesizingText(false); }
    }, 1500);
    return () => { if (synthesisDebounceRef.current) window.clearTimeout(synthesisDebounceRef.current); };
  }, [glossHistory, gemini, activeProtocol]);

  // 3. Protocol Selection & Initialization
  const selectProtocol = async (protocol: CrisisProtocol) => {
    setActiveProtocol(protocol);
    setIsEmergencyMode(true);
    onAriaToast(`${protocol}_ACTIVATED`);
    startSensorFeed(protocol);
  };

  const startSensorFeed = async (protocol: CrisisProtocol) => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: { width: 1280, height: 720 }, audio: true });
      if (videoRef.current) videoRef.current.srcObject = stream;
      setIsLiveActive(true);
      onAriaToast("SENSOR_LINK_ESTABLISHED");
    } catch (e) { onAriaToast("SENSOR_LINK_FAILURE"); }
  };

  // 4. THE NEURAL LOOP (Protocol Beta Logic)
  const performNeuralInference = useCallback(async () => {
    if (isRequestInProgress.current || !videoRef.current || !canvasRef.current) return;
    const v = videoRef.current;
    if (v.readyState < 2) return;

    setIsAnalyzing(true);
    isRequestInProgress.current = true;

    const c = canvasRef.current;
    c.width = 1280;
    c.height = 720;
    const ctx = c.getContext('2d', { alpha: false });
    if (!ctx) return;

    ctx.drawImage(v, 0, 0, c.width, c.height);
    const frame = c.toDataURL('image/jpeg', 0.8).split(',')[1];
    const ts = new Date().toLocaleTimeString();

    try {
      const res = await gemini.interpretSign(frame, ts, "ASL");
      if (res && res.recognizedSign && res.recognizedSign.toLowerCase() !== 'none') {
        const glossLabel = res.gloss || res.recognizedSign;
        setCurrentGloss(glossLabel);
        
        setGlossHistory(prev => {
          const last = prev[prev.length - 1];
          if (last === glossLabel) return prev;
          return [...prev, glossLabel].slice(-15);
        });

        setFullInterpretations(prev => {
          const last = prev[prev.length - 1];
          if (last?.gloss === glossLabel) return prev;
          return [...prev, res].slice(-15);
        });
        
        if (res.handBox) {
          setDetectedObjects([{ 
            label: `SOS_INTENT: ${glossLabel}`, 
            box_2d: res.handBox, 
            sentiment: res.sentiment 
          }]);
        }
      } else { 
        setCurrentGloss("SCANNING..."); 
        setDetectedObjects([]);
      }
    } catch (e) { 
      console.error("SOS_NEURAL_ERROR", e); 
    } finally { 
      setIsAnalyzing(false); 
      isRequestInProgress.current = false; 
    }
  }, [gemini]);

  useEffect(() => {
    if (isEmergencyMode && activeProtocol === 'BETA_BRIDGE' && isLiveActive) {
      performNeuralInference();
      neuralLoopRef.current = window.setInterval(performNeuralInference, 2500);
    } else {
      if (neuralLoopRef.current) clearInterval(neuralLoopRef.current);
    }
    return () => { if (neuralLoopRef.current) clearInterval(neuralLoopRef.current); };
  }, [isEmergencyMode, activeProtocol, isLiveActive, performNeuralInference]);

  const stopCrisis = () => {
    if (neuralLoopRef.current) clearInterval(neuralLoopRef.current);
    if (isRecording) handleStopRecording();
    const stream = videoRef.current?.srcObject as MediaStream;
    stream?.getTracks().forEach(t => t.stop());
    if (videoRef.current) videoRef.current.srcObject = null;
    setIsEmergencyMode(false);
    setActiveProtocol('NONE');
    setGlossHistory([]);
    setFullInterpretations([]);
    setTranscriptText("");
    setMessageThread([]);
    setIsLocationSent(false);
    setCurrentGloss("");
    setDetectedObjects([]);
    setRecordedVideoUrl(null);
    onAriaToast("SOS_TERMINATED");
  };

  const transmitNarrative = () => {
    if (!transcriptText) return;
    onAriaToast("TRANSMITTING_NARRATIVE...");
    setMessageThread(prev => [...prev, {
      id: Date.now().toString(),
      text: transcriptText,
      sender: 'user',
      timestamp: new Date().toLocaleTimeString()
    }]);
    setTranscriptText("");
    setGlossHistory([]);
    setFullInterpretations([]);
    
    setTimeout(() => {
      setMessageThread(prev => [...prev, {
        id: (Date.now()+1).toString(),
        text: "PARITY CONFIRMED. RESPONDERS ARE MOVING TO YOUR POSITION. MAINTAIN STAGE VISIBILITY.",
        sender: 'responder',
        timestamp: new Date().toLocaleTimeString()
      }]);
    }, 3000);
  };

  const transmitLocation = () => {
    setIsLocationSent(true);
    onAriaToast("GPS_BROADCASTED");
    setMessageThread(prev => [...prev, {
      id: Date.now().toString(),
      text: `EMERGENCY COORDINATES SENT: ${EXAMPLE_LOCATION.coords}`,
      sender: 'system',
      timestamp: new Date().toLocaleTimeString()
    }]);
  };

  // Recording Logic
  const handleStartRecording = () => {
    const stream = videoRef.current?.srcObject as MediaStream;
    if (!stream) return;
    recordedChunksRef.current = [];
    const options = { mimeType: 'video/webm;codecs=vp9,opus' };
    try {
      const recorder = new MediaRecorder(stream, options);
      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) recordedChunksRef.current.push(e.data);
      };
      recorder.onstop = () => {
        const blob = new Blob(recordedChunksRef.current, { type: 'video/webm' });
        const url = URL.createObjectURL(blob);
        setRecordedVideoUrl(url);
        onAriaToast("RECORDING_BUFFERED");
      };
      recorder.start();
      mediaRecorderRef.current = recorder;
      setIsRecording(true);
      onAriaToast("RECORDING_START");
    } catch (e) {
      onAriaToast("RECORDING_FAILURE");
    }
  };

  const handleStopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      onAriaToast("RECORDING_STOP");
    }
  };

  const handleTransmitRecording = () => {
    if (!recordedVideoUrl) return;
    onAriaToast("TRANSMITTING_ARCHIVE...");
    setMessageThread(prev => [...prev, {
      id: Date.now().toString(),
      text: "SOS_ARCHIVE_TRANSMITTED: [VIDEO_UPLINK_ATTACHED]",
      sender: 'user',
      timestamp: new Date().toLocaleTimeString()
    }]);
    setRecordedVideoUrl(null);
  };

  const handleShowInterpretation = () => { setScriptIdx(0); setIsAvatarVisible(true); onAriaToast("INITIALIZING_BRIEFING"); };

  const handleAcknowledgeAndClear = useCallback(() => {
    if (activeAlert) {
      setAcknowledgedAlertIds(prev => {
        const next = new Set(prev);
        next.add(activeAlert.id);
        return next;
      });
      setActiveAlert(null);
      setSigningScript([]);
      setScriptIdx(0);
      setIsAvatarVisible(false);
      onAriaToast("ALERT_ACKNOWLEDGED");
    }
  }, [activeAlert, onAriaToast]);

  return (
    <div className="max-w-[1700px] mx-auto px-8 flex flex-col gap-24">
      <TabBriefing 
        title="MODEL: CRISIS SOS"
        description="CrisisSign provides bidirectional forensic parity during extreme environmental events, linking DHH users to first responders via high-precision kinetic channels."
        steps={["UPLINK SOS", "SELECT PROTOCOL", "CAPTURE INTENT", "TRANSMIT PARITY"]}
        color="#ef4444"
      />

      <canvas ref={canvasRef} className="hidden" />

      {/* Alert Overlay */}
      <AnimatePresence>
        {activeAlert && !isEmergencyMode && (
          <motion.section 
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, scale: 0.9 }}
            className="p-1 liquid-glass rounded-[64px] border-red-500 bg-red-500/10 overflow-hidden shadow-[0_0_150px_rgba(239,68,68,0.4)] relative z-[100]"
          >
            <div className="grid xl:grid-cols-3 gap-0">
               <div className="bg-black/80 flex flex-col items-center justify-center p-12 border-r border-white/5 min-h-[500px]">
                  <AnimatePresence mode="wait">
                    {isAvatarVisible ? (
                      <motion.div key={scriptIdx} initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="flex flex-col items-center gap-10 text-center w-full h-full justify-center">
                         {glossImages[signingScript[scriptIdx]?.sign_text] ? (
                           <img src={glossImages[signingScript[scriptIdx].sign_text]} className="max-w-full max-h-[450px] object-contain drop-shadow-[0_0_80px_rgba(239,68,68,0.6)] brightness-125" />
                         ) : (
                           <div className="w-24 h-24 border-4 border-red-500 border-t-transparent animate-spin rounded-full" />
                         )}
                         <div className="px-10 py-5 bg-red-600 rounded-full text-white font-black italic uppercase text-4xl tracking-tighter">"{signingScript[scriptIdx]?.sign_text}"</div>
                      </motion.div>
                    ) : (
                      <button onClick={handleShowInterpretation} className="px-12 py-8 rounded-[32px] bg-red-600 text-white font-black uppercase italic tracking-[0.3em] text-lg shadow-2xl hover:scale-105 transition-all">View Signed Briefing</button>
                    )}
                  </AnimatePresence>
               </div>
               <div className="p-12 md:p-16 flex flex-col gap-10 justify-center bg-black/40 border-r border-white/5">
                  <h2 className="text-5xl md:text-7xl font-black italic uppercase text-white tracking-tighter leading-none">{activeAlert.event}</h2>
                  <p className="text-xl md:text-2xl text-white/80 italic font-light leading-relaxed">"{activeAlert.description}"</p>
                  <div className="p-8 rounded-[40px] bg-red-600/20 border-2 border-red-500/50">
                    <span className="text-[10px] font-black text-red-400 uppercase tracking-widest mb-2 block">Protocol</span>
                    <p className="text-2xl font-black italic text-white uppercase leading-tight">{activeAlert.instruction}</p>
                  </div>
               </div>
               <div className="p-12 md:p-16 flex flex-col gap-8 bg-black/60 justify-center">
                  <TacticalMap area={activeAlert.areaDesc} />
                  <button onClick={handleAcknowledgeAndClear} className="w-full py-8 rounded-[32px] bg-white text-black font-black uppercase tracking-widest text-sm">Acknowledge Alert</button>
               </div>
            </div>
          </motion.section>
        )}
      </AnimatePresence>

      {!isEmergencyMode ? (
        <section className="flex flex-col items-center gap-16 py-20">
          <div className="text-center space-y-6">
            <h2 className="text-6xl md:text-9xl font-black italic uppercase tracking-tighter text-white leading-none">SOS <span className="text-red-600">BEACON</span></h2>
            <p className="text-2xl text-white/30 italic max-w-2xl mx-auto">Initialize bidirectional emergency parity. Select protocol after trigger.</p>
          </div>
          
          <div className="grid md:grid-cols-2 gap-12 w-full max-w-5xl">
            <motion.button 
              whileHover={{ scale: 1.02 }} onClick={() => selectProtocol('ALPHA_SYNC')}
              className="liquid-glass p-12 rounded-[56px] border-2 border-red-500/40 bg-red-500/5 flex flex-col items-center gap-8 group"
            >
               <div className="w-24 h-24 rounded-full bg-red-600/20 flex items-center justify-center text-red-500 group-hover:bg-red-600 group-hover:text-white transition-all">
                  <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" /></svg>
               </div>
               <div className="text-center space-y-2">
                 <h4 className="text-2xl font-black italic uppercase text-white tracking-widest">Protocol Alpha</h4>
                 <p className="text-xs text-white/40 font-bold uppercase tracking-widest leading-relaxed">Live Visual Sync & Recording</p>
               </div>
            </motion.button>

            <motion.button 
              whileHover={{ scale: 1.02 }} onClick={() => selectProtocol('BETA_BRIDGE')}
              className="liquid-glass p-12 rounded-[56px] border-2 border-cyan-500/40 bg-cyan-500/5 flex flex-col items-center gap-8 group"
            >
               <div className="w-24 h-24 rounded-full bg-cyan-600/20 flex items-center justify-center text-cyan-400 group-hover:bg-cyan-600 group-hover:text-white transition-all">
                  <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
               </div>
               <div className="text-center space-y-2">
                 <h4 className="text-2xl font-black italic uppercase text-white tracking-widest">Protocol Beta</h4>
                 <p className="text-xs text-white/40 font-bold uppercase tracking-widest leading-relaxed">Neural Bridge & Narrative Synth</p>
               </div>
            </motion.button>
          </div>
        </section>
      ) : (
        <section className="flex flex-col gap-16 pb-32">
          <div className="flex justify-between items-center border-b border-white/5 pb-8">
             <div className="flex items-center gap-6">
                <div className="w-4 h-4 rounded-full bg-red-600 animate-ping" />
                <h3 className="text-3xl font-black italic uppercase text-white tracking-tighter">
                   {activeProtocol === 'ALPHA_SYNC' ? 'PROTOCOL: ALPHA_SYNC_LIVE' : 'PROTOCOL: BETA_BRIDGE_NEURAL'}
                </h3>
             </div>
             <div className="flex gap-4">
                <button onClick={transmitLocation} className="px-6 py-3 rounded-2xl bg-white/5 border border-white/10 text-white/60 text-[10px] font-black uppercase hover:bg-white/10 transition-all">Broadcast Coordinates</button>
                <button onClick={stopCrisis} className="px-6 py-3 rounded-2xl bg-red-600 text-white text-[10px] font-black uppercase shadow-xl hover:bg-red-700 transition-all">Terminate SOS</button>
             </div>
          </div>

          <div className="grid lg:grid-cols-12 gap-10">
             <div className="lg:col-span-8 space-y-10">
                <div className="relative aspect-video liquid-glass rounded-[64px] border-2 border-red-500/50 bg-black/60 overflow-hidden shadow-3xl">
                   <video ref={videoRef} autoPlay muted playsInline className="w-full h-full object-cover" />
                   
                   {/* Protocol Alpha: Video-to-Video Simulation UI */}
                   {activeProtocol === 'ALPHA_SYNC' && (
                     <div className="absolute top-8 right-8 w-64 aspect-video liquid-glass rounded-2xl border border-cyan-500/40 overflow-hidden shadow-2xl z-50">
                        <div className="absolute inset-0 forensic-grid opacity-20 pointer-events-none" />
                        <div className="h-full w-full flex flex-col items-center justify-center gap-2 p-4 bg-black/60">
                           <div className="w-12 h-12 rounded-full border-2 border-cyan-500 flex items-center justify-center text-cyan-400">
                              <svg className="w-6 h-6 animate-pulse" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
                           </div>
                           <span className="text-[8px] font-black text-cyan-400 uppercase tracking-widest text-center">First_Responder_Feed: [LIVE]</span>
                        </div>
                     </div>
                   )}

                   {/* Protocol Alpha: Recording Overlay */}
                   {activeProtocol === 'ALPHA_SYNC' && isRecording && (
                     <div className="absolute top-8 left-8 flex items-center gap-3 px-4 py-2 bg-red-600/80 rounded-full border border-red-500 animate-pulse z-50">
                        <div className="w-2 h-2 rounded-full bg-white" />
                        <span className="text-[10px] font-black text-white uppercase tracking-widest">Recording_Active</span>
                     </div>
                   )}

                   <GhostOverlay objects={detectedObjects} visible={isEmergencyMode} videoRef={videoRef} />
                   
                   <div className="absolute bottom-8 left-8 right-8 flex justify-between items-end">
                      <div className="p-6 rounded-[32px] bg-black/80 border border-white/10 backdrop-blur-xl">
                         <span className="text-[8px] font-black text-red-500 uppercase tracking-widest block mb-2">Live Intent Trace</span>
                         <span className="text-3xl font-black italic text-white uppercase tracking-tighter">{currentGloss || "Establishing Link..."}</span>
                      </div>
                      
                      {isAnalyzing && (
                        <div className="mb-4 mr-4">
                          <div className="w-4 h-4 rounded-full border-2 border-red-500 border-t-transparent animate-spin" />
                        </div>
                      )}
                   </div>
                </div>

                {/* Protocol Alpha: Special Controls */}
                {activeProtocol === 'ALPHA_SYNC' && (
                  <div className="flex gap-4">
                    {!isRecording ? (
                      <button 
                        onClick={handleStartRecording}
                        className="flex-1 py-8 rounded-[40px] bg-white/5 border-2 border-red-500 text-red-500 font-black uppercase text-xs tracking-widest hover:bg-red-500/10 transition-all flex items-center justify-center gap-4"
                      >
                        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10" /></svg>
                        Initialize Local Archive Recording
                      </button>
                    ) : (
                      <button 
                        onClick={handleStopRecording}
                        className="flex-1 py-8 rounded-[40px] bg-red-600 text-white font-black uppercase text-xs tracking-widest animate-pulse flex items-center justify-center gap-4"
                      >
                        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><rect x="6" y="6" width="12" height="12" rx="2" /></svg>
                        Stop & Buffer Recording
                      </button>
                    )}
                    
                    {recordedVideoUrl && (
                      <motion.button 
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        onClick={handleTransmitRecording}
                        className="flex-1 py-8 rounded-[40px] bg-cyan-600 text-white font-black uppercase text-xs tracking-widest shadow-2xl flex items-center justify-center gap-4"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>
                        Transmit Buffered Archive
                      </motion.button>
                    )}
                  </div>
                )}

                {activeProtocol === 'BETA_BRIDGE' && (
                  <div className="space-y-4">
                    <div className="flex justify-between items-center px-4">
                       <span className="text-[10px] font-black text-cyan-400 uppercase tracking-[0.4em]">Neural Token Pipeline</span>
                       <span className="text-[8px] font-mono text-white/20 uppercase">Buffer: {glossHistory.length}/15</span>
                    </div>
                    <div className="flex gap-4 overflow-x-auto pb-4 custom-scrollbar-horizontal scroll-smooth snap-x">
                      {fullInterpretations.length > 0 ? fullInterpretations.slice().reverse().map((item, i) => (
                        <motion.div 
                          initial={{ opacity: 0, scale: 0.8, x: -20 }}
                          animate={{ opacity: 1, scale: 1, x: 0 }}
                          key={`${item.timestamp}-${i}`}
                          className="flex-shrink-0 w-48 snap-center p-6 rounded-[32px] liquid-glass border border-white/5 bg-black/40 flex flex-col gap-4 shadow-xl border-cyan-500/20"
                        >
                           <div className="flex justify-between items-center">
                              <span className="text-[7px] font-mono text-cyan-400">{item.timestamp}</span>
                              <div className={`w-1 h-1 rounded-full ${item.sentiment === 'Urgent' ? 'bg-red-500' : 'bg-cyan-500'} animate-pulse`} />
                           </div>
                           <h4 className="text-xl font-black italic uppercase text-white tracking-tighter truncate">"{item.gloss}"</h4>
                        </motion.div>
                      )) : <div className="w-full h-32 flex items-center justify-center text-white/10 uppercase tracking-[2em] text-[9px] italic border-2 border-dashed border-white/5 rounded-[32px]">Awaiting Tokens</div>}
                    </div>
                  </div>
                )}

                {activeProtocol === 'BETA_BRIDGE' && (
                  <div className="liquid-glass p-12 rounded-[64px] border-white/10 bg-black/40 shadow-3xl relative overflow-hidden">
                     <div className="flex justify-between items-center mb-8">
                        <span className="text-[10px] font-black text-cyan-400 uppercase tracking-[0.5em]">Neural Narrative Synthesis</span>
                        <AnimatePresence>
                          {transcriptText && (
                            <motion.button 
                              initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}
                              onClick={transmitNarrative} 
                              className="px-8 py-3 rounded-2xl bg-cyan-600 text-white font-black uppercase text-[10px] tracking-widest shadow-xl hover:scale-105 transition-all"
                            >
                              Transmit to Responders
                            </motion.button>
                          )}
                        </AnimatePresence>
                     </div>
                     <AnimatePresence mode="wait">
                        <motion.p 
                          key={transcriptText} initial={{ opacity: 0 }} animate={{ opacity: isSynthesizingText ? 0.3 : 1 }} 
                          className="text-4xl font-light italic text-white leading-relaxed tracking-tight"
                        >
                           {transcriptText || (isSynthesizingText ? "Reconstructing forensic narrative..." : "Perform emergency signs to synthesize intent...")}
                        </motion.p>
                     </AnimatePresence>
                  </div>
                )}

                <div className="liquid-glass p-10 rounded-[56px] border-white/5 bg-black/20 flex flex-col gap-8 h-[400px]">
                   <h3 className="text-[10px] font-black uppercase text-white/30 tracking-[0.4em]">Emergency Communication Channel</h3>
                   <div className="flex-1 overflow-y-auto custom-scrollbar space-y-6 pr-4">
                      {messageThread.length === 0 && (
                        <div className="h-full flex items-center justify-center opacity-10 uppercase text-xs tracking-[1em]">Awaiting Uplink Data</div>
                      )}
                      {messageThread.map(msg => (
                        <motion.div key={msg.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className={`flex flex-col gap-2 ${msg.sender === 'user' ? 'items-end' : 'items-start'}`}>
                           <div className="flex items-center gap-3">
                              <span className="text-[7px] font-mono text-white/20">{msg.timestamp}</span>
                              <span className={`text-[7px] font-black uppercase tracking-widest ${msg.sender === 'user' ? 'text-red-500' : msg.sender === 'system' ? 'text-white/40' : 'text-cyan-400'}`}>{msg.sender}</span>
                           </div>
                           <div className={`p-5 rounded-3xl text-[11px] leading-relaxed font-bold ${msg.sender === 'user' ? 'bg-red-500/10 border border-red-500/30 text-white' : msg.sender === 'system' ? 'bg-white/5 border border-white/10 text-white/40 italic' : 'bg-white text-black border-2 border-cyan-400'}`}>
                              {msg.text}
                           </div>
                        </motion.div>
                      ))}
                      <div ref={threadEndRef} />
                   </div>
                </div>
             </div>

             <div className="lg:col-span-4 flex flex-col gap-8">
                <div className="liquid-glass p-8 rounded-[48px] bg-red-600/10 border-2 border-red-500/50 flex flex-col gap-6">
                   <h3 className="text-[12px] font-black uppercase text-red-400 tracking-[0.4em]">Tactical Status</h3>
                   <div className="space-y-4">
                      <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-widest text-white/40">
                         <span>GPS Sector</span>
                         <span className="text-white">{EXAMPLE_LOCATION.label}</span>
                      </div>
                      <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-widest text-white/40">
                         <span>Parity_Link</span>
                         <span className="text-emerald-400">ENCRYPTED_OK</span>
                      </div>
                   </div>
                   <TacticalMap area={EXAMPLE_LOCATION.area} mini />
                </div>

                <div className="flex-1 liquid-glass p-8 rounded-[48px] border-white/5 bg-black/40 flex flex-col gap-6 h-full">
                   <h3 className="text-[12px] font-black uppercase text-cyan-400 tracking-[0.4em]">Neural Fidelity</h3>
                   <div className="p-6 rounded-3xl bg-white/5 border border-white/5 space-y-4">
                      <div className="flex justify-between items-center text-[9px] font-black text-white/30 uppercase tracking-widest">
                         <span>Node Sync</span>
                         <span className="text-cyan-400">98.2%</span>
                      </div>
                      <div className="h-1 w-full bg-white/5 rounded-full overflow-hidden">
                         <div className="h-full bg-cyan-500 w-[98%]" />
                      </div>
                   </div>
                </div>
             </div>
          </div>
        </section>
      )}

      <AgenticPulse isAnalyzing={isLiveActive || !!activeAlert || isAnalyzing || isSynthesizingText} intensity={isEmergencyMode ? 5 : 2} />
    </div>
  );
};

export default CrisisSign;
