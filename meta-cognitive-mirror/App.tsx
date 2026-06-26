import React, { useState, useRef, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import LandingPage from './components/LandingPage';
import MirrorCore from './components/MirrorCore';
import SignSpeak from './components/SignSpeak';
import VoiceToSign from './components/VoiceToSign';
import VideoTranscriber from './components/VideoTranscriber';
import FormBridge from './components/FormBridge';
import CrisisSign from './components/CrisisSign';
import LearnPath from './components/LearnPath';
import NeuralEvolutionLab from './components/NeuralEvolutionLab';
import Navbar from './components/Navbar';
import ARIA from './components/ARIA';
import VitalityDashboard from './components/VitalityDashboard';
import AboutOverlay from './components/AboutOverlay';
import ReportModal from './components/ReportModal';
import PostSessionDashboard from './components/PostSessionDashboard';
import { GeminiService } from './services/geminiService';
import { SIMULATION_INSIGHTS } from './services/simulationData';
import { AppTab, AppMode, AnalysisEntry, SessionHistory, SignInterpretation, SignSymbol, VoiceIdentity, StudioSettings, ReportData } from './types';

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<AppTab>('home');
  const [activeMode, setActiveMode] = useState<AppMode>('focus');
  const [selectedVoice, setSelectedVoice] = useState<VoiceIdentity>('Kore');
  
  // Mirror Core State
  const [mirrorHistory, setMirrorHistory] = useState<AnalysisEntry[]>([]);
  const [mirrorVideoUrl, setMirrorVideoUrl] = useState<string | null>(null);
  const [mirrorStream, setMirrorStream] = useState<MediaStream | null>(null);
  const [isMirrorAnalyzing, setIsMirrorAnalyzing] = useState(false);
  const [isMirrorLive, setIsMirrorLive] = useState(false);
  const [isCoolDownActive, setIsCoolDownActive] = useState(false);

  // SignSpeak State
  const [interpretations, setInterpretations] = useState<SignInterpretation[]>([]);
  const [signSpeakVideoUrl, setSignSpeakVideoUrl] = useState<string | null>(null);
  const [signSpeakStream, setSignSpeakStream] = useState<MediaStream | null>(null);
  const [isSignSpeakAnalyzing, setIsSignSpeakAnalyzing] = useState(false);
  const [isSignSpeakLive, setIsSignSpeakLive] = useState(false);
  const [isInterpreting, setIsInterpreting] = useState(false);
  const [selectedSignLanguage, setSelectedSignLanguage] = useState("ASL");

  // VoiceToSign State
  const [signSymbols, setSignSymbols] = useState<SignSymbol[]>([]);
  const [isConverting, setIsConverting] = useState(false);
  
  // UI State
  const [isPrivacyShieldActive, setIsPrivacyShieldActive] = useState(false);
  const [isVitalityOpen, setIsVitalityOpen] = useState(false);
  const [isAboutOpen, setIsAboutOpen] = useState(false);
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);
  const [reportData, setReportData] = useState<ReportData | null>(null);
  const [isLoadingReport, setIsLoadingReport] = useState(false);
  const [ariaToast, setAriaToast] = useState<string | null>(null);
  const [acousticLog, setAcousticLog] = useState<any[]>([]);
  const [currentlySpeakingId, setCurrentlySpeakingId] = useState<string | null>(null);
  const [previousSessions, setPreviousSessions] = useState<SessionHistory[]>([]);

  // Locking mechanism for real-time analysis to prevent stutter
  const isRequestInProgress = useRef(false);
  const isMirrorAnalyzingRef = useRef(false);

  useEffect(() => {
    isMirrorAnalyzingRef.current = isMirrorAnalyzing;
  }, [isMirrorAnalyzing]);

  // Refs
  const mirrorVideoRef = useRef<HTMLVideoElement>(null);
  const signSpeakVideoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const gemini = useRef(new GeminiService());
  const mirrorIntervalRef = useRef<number | null>(null);
  const interpreterIntervalRef = useRef<number | null>(null);
  
  // Audio Refs for capturing input for model
  const audioContextRef = useRef<AudioContext | null>(null);
  const audioBufferRef = useRef<Float32Array[]>([]);
  const scriptProcessorRef = useRef<ScriptProcessorNode | null>(null);
  
  // Speech Playback Optimization Refs
  const currentAudioSourceRef = useRef<AudioBufferSourceNode | null>(null);
  const speechCacheRef = useRef<Map<string, AudioBuffer>>(new Map());
  const speechAbortControllerRef = useRef<AbortController | null>(null);

  const captureFrame = useCallback((vRef: React.RefObject<HTMLVideoElement | null>): string | null => {
    const v = vRef.current;
    const c = canvasRef.current;
    if (!v || !c || (v.readyState < 2 && !v.srcObject)) return null;
    try {
      c.width = 640;
      c.height = 360;
      const ctx = c.getContext('2d', { alpha: false, desynchronized: true });
      if (!ctx) return null;
      ctx.drawImage(v, 0, 0, c.width, c.height);
      return c.toDataURL('image/jpeg', 0.4).split(',')[1];
    } catch (e) { return null; }
  }, []);

  const getAudioBase64 = useCallback((): string | null => {
    if (audioBufferRef.current.length === 0) return null;
    
    // Combine all buffered Float32 chunks
    const totalLength = audioBufferRef.current.reduce((acc, curr) => acc + curr.length, 0);
    if (totalLength === 0) return null;
    
    const result = new Int16Array(totalLength);
    let offset = 0;
    for (const chunk of audioBufferRef.current) {
      for (let i = 0; i < chunk.length; i++) {
        // Convert Float32 to Int16
        result[offset + i] = Math.max(-32768, Math.min(32767, chunk[i] * 32768));
      }
      offset += chunk.length;
    }

    // Clear buffer for next cycle
    audioBufferRef.current = [];

    // Encode to base64 using a loop to avoid stack limits
    const bytes = new Uint8Array(result.buffer);
    let binary = '';
    const len = bytes.byteLength;
    for (let i = 0; i < len; i++) {
      binary += String.fromCharCode(bytes[i]);
    }
    return btoa(binary);
  }, []);

  const handleQuotaError = useCallback(() => {
    setIsMirrorAnalyzing(false);
    setIsSignSpeakAnalyzing(false);
    setAriaToast("ERROR: QUOTA_EXCEEDED - SYSTEM STANDBY 60S");
    if (mirrorIntervalRef.current) { clearInterval(mirrorIntervalRef.current); mirrorIntervalRef.current = null; }
    if (interpreterIntervalRef.current) { clearInterval(interpreterIntervalRef.current); interpreterIntervalRef.current = null; }
  }, []);

  const handleSpeak = useCallback(async (text: string, id: string) => {
    if (currentlySpeakingId === id) {
      if (speechAbortControllerRef.current) {
        speechAbortControllerRef.current.abort();
        speechAbortControllerRef.current = null;
      }
      if (currentAudioSourceRef.current) {
        try { currentAudioSourceRef.current.stop(); } catch(e){}
        currentAudioSourceRef.current = null;
      }
      setCurrentlySpeakingId(null);
      return;
    }
    
    if (speechAbortControllerRef.current) speechAbortControllerRef.current.abort();
    if (currentAudioSourceRef.current) {
      try { currentAudioSourceRef.current.stop(); } catch(e){}
      currentAudioSourceRef.current = null;
    }
    
    setCurrentlySpeakingId(id);
    const cacheKey = `${selectedVoice}_${text.substring(0, 100)}`;
    
    try {
      let buffer = speechCacheRef.current.get(cacheKey);
      
      if (!buffer) {
        const controller = new AbortController();
        speechAbortControllerRef.current = controller;
        const audioBytes = await gemini.current.generateSpeech(text, selectedVoice);
        
        if (controller.signal.aborted) return;
        if (!audioBytes) throw new Error("No audio generated");
        
        if (!audioContextRef.current) {
          audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
        }
        
        const ctx = audioContextRef.current;
        const dataInt16 = new Int16Array(audioBytes.buffer, audioBytes.byteOffset, audioBytes.byteLength / 2);
        const frameCount = dataInt16.length;
        buffer = ctx.createBuffer(1, frameCount, 24000);
        const channelData = buffer.getChannelData(0);
        for (let i = 0; i < frameCount; i++) {
          channelData[i] = dataInt16[i] / 32768.0;
        }
        
        speechCacheRef.current.set(cacheKey, buffer);
        speechAbortControllerRef.current = null;
      }

      const ctx = audioContextRef.current!;
      if (ctx.state === 'suspended') await ctx.resume();

      const source = ctx.createBufferSource();
      source.buffer = buffer;
      source.loop = false;
      source.connect(ctx.destination);
      source.onended = () => {
        setCurrentlySpeakingId(prev => prev === id ? null : prev);
        if (currentAudioSourceRef.current === source) currentAudioSourceRef.current = null;
      };
      
      currentAudioSourceRef.current = source;
      source.start(0);
      
    } catch (e: any) {
      if (e.name === 'AbortError') return;
      console.error("TTS Synthesis Error:", e);
      setCurrentlySpeakingId(null);
      if (e.message?.includes('429') || e.message?.includes('quota')) {
        handleQuotaError();
      } else {
        setAriaToast("SPEECH_SYNTHESIS_FAILED");
      }
    }
  }, [selectedVoice, currentlySpeakingId, handleQuotaError]);

  const handleMirrorAnalysis = useCallback(async () => {
    if (!isMirrorAnalyzingRef.current || isRequestInProgress.current) return;
    const frame = captureFrame(mirrorVideoRef);
    if (!frame) return;

    // Ensure audio context is running to capture final chunks
    if (audioContextRef.current?.state === 'suspended') {
      await audioContextRef.current.resume();
    }

    const audio = isMirrorLive ? getAudioBase64() : null;

    isRequestInProgress.current = true;
    try {
      const v = mirrorVideoRef.current;
      const curTime = v ? v.currentTime : 0;
      const ts = isMirrorLive ? new Date().toLocaleTimeString() : new Date(curTime * 1000).toISOString().substr(11, 8);
      
      const res = await gemini.current.analyzeMirrorFrame(frame, audio, activeMode, ts, curTime);
      
      if (res) {
        setMirrorHistory(prev => [...prev, res]);
        if (res.acoustic_alert && res.acoustic_alert !== 'NONE') {
          setAcousticLog(prev => [...prev, { timestamp: ts, text: `Live_Link: ${res.acoustic_alert} - ${res.acoustic_transcript || 'Pattern matched'}` }].slice(-50));
        }
      }
    } catch (e: any) { 
      console.error("Mirror Core Analysis Error:", e);
      if (e.message?.includes('429') || e.message?.includes('quota')) {
        handleQuotaError();
      }
    } finally {
      isRequestInProgress.current = false;
    }
  }, [captureFrame, getAudioBase64, isMirrorLive, activeMode, handleQuotaError]);

  const handleGenerateReport = async () => {
    if (mirrorHistory.length === 0) {
      setAriaToast("ERROR: NO_SESSION_DATA");
      return;
    }
    setIsLoadingReport(true);
    setIsReportModalOpen(true);
    setAriaToast("SYNTHESIZING_FINAL_AUDIT...");
    try {
      const report = await gemini.current.generateFinalMirrorReport(mirrorHistory, activeMode);
      setReportData(report);
      setAriaToast("AUDIT_SYNTHESIS: COMPLETE");
      const newSession: SessionHistory = {
        date: new Date().toLocaleDateString(),
        summary: report.executiveSummary,
        focusScore: report.focusScore
      };
      setPreviousSessions(prev => [newSession, ...prev]);
    } catch (e: any) { 
      console.error("Report Generation Error:", e);
      if (e.message?.includes('429') || e.message?.includes('quota')) {
        handleQuotaError();
      } else {
        setAriaToast("AUDIT_SYNTHESIS: FAILED");
      }
      setReportData(null);
    }
    finally { setIsLoadingReport(false); }
  };

  const handleInterpret = useCallback(async () => {
    if (!isSignSpeakAnalyzing || isInterpreting) return;
    const frame = captureFrame(signSpeakVideoRef);
    if (!frame) return;
    setIsInterpreting(true);
    try {
      const v = signSpeakVideoRef.current;
      const curTime = v ? v.currentTime : 0;
      const ts = new Date(curTime * 1000).toISOString().substr(11, 8);
      const res = await gemini.current.interpretSign(frame, ts, selectedSignLanguage);
      if (res && res.recognizedSign && res.recognizedSign.toLowerCase() !== 'none') {
        setInterpretations(prev => [...prev, res]);
      }
    } catch (e: any) { 
      console.error("Interpret Error:", e);
      if (e.message?.includes('429') || e.message?.includes('quota')) {
        handleQuotaError();
      }
    } finally { setIsInterpreting(false); }
  }, [captureFrame, isSignSpeakAnalyzing, isInterpreting, selectedSignLanguage, handleQuotaError]);

  useEffect(() => {
    if (isMirrorAnalyzing && activeTab === 'mirror') {
      mirrorIntervalRef.current = window.setInterval(handleMirrorAnalysis, 3500); 
    } else { if (mirrorIntervalRef.current) { clearInterval(mirrorIntervalRef.current); mirrorIntervalRef.current = null; } }
    return () => { if (mirrorIntervalRef.current) clearInterval(mirrorIntervalRef.current); };
  }, [isMirrorAnalyzing, activeTab, handleMirrorAnalysis]);

  useEffect(() => {
    if (isSignSpeakAnalyzing && activeTab === 'interpreter') {
      interpreterIntervalRef.current = window.setInterval(handleInterpret, 3000);
    } else { if (interpreterIntervalRef.current) { clearInterval(interpreterIntervalRef.current); interpreterIntervalRef.current = null; } }
    return () => { if (interpreterIntervalRef.current) clearInterval(interpreterIntervalRef.current); };
  }, [isSignSpeakAnalyzing, activeTab, handleInterpret]);

  const toggleScan = async () => {
    if (activeTab === 'mirror') {
      if (!isMirrorAnalyzing) {
        if (!audioContextRef.current) {
          audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 16000 });
        }
        if (audioContextRef.current?.state === 'suspended') {
          await audioContextRef.current.resume();
        }
        setIsMirrorAnalyzing(true);
        setReportData(null);
        setAriaToast("MIRROR_SCAN: INITIALIZING...");
        mirrorVideoRef.current?.play().catch(() => {});
      } else {
        setIsMirrorAnalyzing(false);
        setAriaToast("MIRROR_SCAN: HALTED");
      }
    } else if (activeTab === 'interpreter') {
      if (!isSignSpeakAnalyzing) {
        setIsSignSpeakAnalyzing(true);
        setAriaToast("SIGNSPEAK_SYNC: ACTIVE");
        signSpeakVideoRef.current?.play().catch(() => {});
      } else {
        setIsSignSpeakAnalyzing(false);
        setAriaToast("SIGNSPEAK_SYNC: STANDBY");
      }
    }
  };

  const handleMirrorUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (mirrorVideoUrl) URL.revokeObjectURL(mirrorVideoUrl);
      setMirrorVideoUrl(URL.createObjectURL(file));
      setMirrorStream(null); setIsMirrorLive(false); setIsMirrorAnalyzing(false);
      if (SIMULATION_INSIGHTS[file.name]) {
        setMirrorHistory(SIMULATION_INSIGHTS[file.name]);
        setAriaToast("MIRROR_SIMULATION: LOADED");
      } else { setAriaToast("MIRROR_SOURCE: UPLOADED"); }
    }
  };

  const handleSignSpeakUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (signSpeakVideoUrl) URL.revokeObjectURL(signSpeakVideoUrl);
      setSignSpeakVideoUrl(URL.createObjectURL(file));
      setSignSpeakStream(null); setIsSignSpeakLive(false); setInterpretations([]); setIsSignSpeakAnalyzing(false);
      setAriaToast("SIGNSPEAK_SOURCE: UPLOADED");
    }
  };

  const handleLiveCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { 
          width: { ideal: 1280 },
          height: { ideal: 720 },
          facingMode: "user"
        }, 
        audio: true 
      });

      if (activeTab === 'mirror') {
        if (!audioContextRef.current) {
          audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 16000 });
        }
        const ctx = audioContextRef.current;
        if (ctx.state === 'suspended') await ctx.resume();

        const source = ctx.createMediaStreamSource(stream);
        const processor = ctx.createScriptProcessor(4096, 1, 1);
        
        processor.onaudioprocess = (e) => {
          // BUFFER ALWAYS: Keep final seconds warm regardless of Ref status
          const input = e.inputBuffer.getChannelData(0);
          audioBufferRef.current.push(new Float32Array(input));
          const currentLength = audioBufferRef.current.reduce((acc, curr) => acc + curr.length, 0);
          if (currentLength > 64000) {
            let removed = 0;
            const targetRemoval = input.length;
            while (removed < targetRemoval && audioBufferRef.current.length > 0) {
               removed += audioBufferRef.current[0].length;
               audioBufferRef.current.shift();
            }
          }
        };

        source.connect(processor);
        processor.connect(ctx.destination);
        scriptProcessorRef.current = processor;
      }

      if (activeTab === 'mirror') {
        setMirrorStream(stream); setIsMirrorLive(true); setMirrorVideoUrl(null); setIsMirrorAnalyzing(false);
        setAriaToast("MIRROR_SENSOR: WIDE_ANGLE_LINKED");
      } else if (activeTab === 'interpreter') {
        setSignSpeakStream(stream); setIsSignSpeakLive(true); setSignSpeakVideoUrl(null); setIsSignSpeakAnalyzing(false);
        setAriaToast("SIGNSPEAK_SENSOR: LINKED");
      }
    } catch (e) { 
      setAriaToast("Camera Link Failed"); 
    }
  };

  const handleTabSelection = (tab: AppTab) => {
    setIsMirrorAnalyzing(false);
    setIsSignSpeakAnalyzing(false);
    setActiveTab(tab);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const resetMirrorSession = () => {
    setMirrorHistory([]); setReportData(null); setAcousticLog([]); setIsMirrorAnalyzing(false);
    setIsCoolDownActive(false); setMirrorVideoUrl(null); setMirrorStream(null); setIsMirrorLive(false);
    setAriaToast("MIRROR_CORE: SESSION_RESET");
  };

  const removeMirrorMedia = () => {
    if (mirrorVideoUrl) URL.revokeObjectURL(mirrorVideoUrl);
    setMirrorVideoUrl(null); setMirrorStream(null); setIsMirrorLive(false); setIsMirrorAnalyzing(false);
  };

  const removeSignSpeakMedia = () => {
    if (signSpeakVideoUrl) URL.revokeObjectURL(signSpeakVideoUrl);
    setSignSpeakVideoUrl(null); setSignSpeakStream(null); setIsSignSpeakLive(false); setIsSignSpeakAnalyzing(false);
  };

  return (
    <div className="relative min-h-screen w-full flex flex-col bg-[#050505] text-white selection:bg-cyan-500 selection:text-black">
      <canvas ref={canvasRef} className="hidden" />
      <Navbar 
        isAnalyzing={activeTab === 'mirror' ? isMirrorAnalyzing : isSignSpeakAnalyzing} onEndScan={() => {
          if (activeTab === 'mirror') setIsMirrorAnalyzing(false);
          else setIsSignSpeakAnalyzing(false);
        }} 
        onFileUpload={() => {}} hasVideo={activeTab === 'mirror' ? (!!mirrorVideoUrl || isMirrorLive) : (!!signSpeakVideoUrl || isSignSpeakLive)}
        isPrivacyShieldActive={isPrivacyShieldActive} onTogglePrivacy={() => setIsPrivacyShieldActive(!isPrivacyShieldActive)}
        onStartScan={toggleScan} onToggleVitality={() => setIsVitalityOpen(true)} onToggleAbout={() => setIsAboutOpen(true)}
        onToggleLanding={() => handleTabSelection('home')} 
        currentTab={activeTab} onTabChange={handleTabSelection}
      />
      <motion.main className="flex-1">
        <AnimatePresence mode="wait">
          {activeTab === 'home' && <motion.div key="home" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}><LandingPage onLaunch={(t) => handleTabSelection(t as AppTab)} onOpenMission={() => setIsAboutOpen(true)} /></motion.div>}
          {activeTab === 'evolution' && <motion.div key="evolution" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="pt-24 pb-32"><NeuralEvolutionLab onAriaToast={setAriaToast} history={mirrorHistory} /></motion.div>}
          {activeTab === 'form-bridge' && (
            <motion.div key="form-bridge" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="pt-24 pb-32">
              <FormBridge onAriaToast={setAriaToast} />
            </motion.div>
          )}
          {activeTab === 'crisis-sign' && (
            <motion.div key="crisis-sign" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="pt-24 pb-32">
              <CrisisSign onAriaToast={setAriaToast} />
            </motion.div>
          )}
          {activeTab === 'learn-path' && (
            <motion.div key="learn-path" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="pt-24 pb-32">
              <LearnPath onAriaToast={setAriaToast} />
            </motion.div>
          )}
          {activeTab === 'mirror' && (
            <motion.div key="mirror" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="pt-24 pb-32">
              {isCoolDownActive ? <PostSessionDashboard history={mirrorHistory} reportData={reportData} onPrepareNextMission={resetMirrorSession} onSpeak={(text) => handleSpeak(text, 'post-session-audio')} onAriaToast={setAriaToast} /> :
              <MirrorCore 
                history={mirrorHistory} isAnalyzing={isMirrorAnalyzing} isProcessing={isLoadingReport} 
                activeMode={activeMode} onModeChange={setActiveMode}
                isPrivacyShieldActive={isPrivacyShieldActive} videoRef={mirrorVideoRef} videoFileUrl={mirrorVideoUrl} isLiveLink={isMirrorLive} activeStream={mirrorStream} duration={mirrorVideoRef.current?.duration || 0} currentTime={mirrorVideoRef.current?.currentTime || 0} acousticLog={acousticLog} previousSessions={previousSessions} onSeek={(t) => mirrorVideoRef.current && (mirrorVideoRef.current.currentTime = t)} onToggleScan={toggleScan} onManualSynthesis={handleGenerateReport} onFileUploadClick={() => { const i = document.createElement('input'); i.type = 'file'; i.accept = 'video/*'; i.onchange = (e: any) => handleMirrorUpload(e); i.click(); }} onLiveCameraClick={handleLiveCamera} onSpeak={handleSpeak} onRemoveVideo={removeMirrorMedia} currentlySpeakingId={currentlySpeakingId} 
              />}
            </motion.div>
          )}
          {activeTab === 'interpreter' && <motion.div key="interpreter" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="pt-24 pb-32"><SignSpeak interpretations={interpretations} isInterpreting={isInterpreting} videoRef={signSpeakVideoRef} videoFileUrl={signSpeakVideoUrl} onFileUploadClick={() => { const i = document.createElement('input'); i.type = 'file'; i.accept = 'video/*'; i.onchange = (e: any) => handleSignSpeakUpload(e); i.click(); }} onLiveCameraClick={handleLiveCamera} isLiveLink={isSignSpeakLive} activeStream={signSpeakStream} isScanning={isSignSpeakAnalyzing} onToggleScan={toggleScan} onInterpret={handleInterpret} selectedSignLanguage={selectedSignLanguage} onLanguageChange={setSelectedSignLanguage} onNewKineticStage={() => { removeSignSpeakMedia(); setInterpretations([]); }} onRemoveVideo={removeSignSpeakMedia} /></motion.div>}
          {activeTab === 'converter' && <motion.div key="converter" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="pt-24 pb-32"><VoiceToSign onConvert={async (t, s) => { setIsConverting(true); try { const res = await gemini.current.convertToSignSymbols(t, s); setSignSymbols(res); } catch (e: any) { if (e.message?.includes('429')) handleQuotaError(); else setAriaToast("Conversion Failed"); } finally { setIsConverting(false); } }} symbols={signSymbols} isConverting={isConverting} onAriaToast={setAriaToast} onNewPerformance={() => setSignSymbols([])} /></motion.div>}
          {activeTab === 'transcriber' && <motion.div key="transcriber" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="pt-24 pb-32"><VideoTranscriber onAriaToast={setAriaToast} /></motion.div>}
        </AnimatePresence>
      </motion.main>
      <ARIA history={mirrorHistory} onCommand={() => {}} isAnalyzing={isMirrorAnalyzing || isSignSpeakAnalyzing} currentVibe="Neutral" selectedVoice={selectedVoice} toast={ariaToast} onClearToast={() => setAriaToast(null)} />
      <AnimatePresence>{isVitalityOpen && <VitalityDashboard isAnalyzing={isMirrorAnalyzing} isProcessing={isLoadingReport} onClose={() => setIsVitalityOpen(false)} />}</AnimatePresence>
      <AnimatePresence>{isAboutOpen && <AboutOverlay onClose={() => setIsAboutOpen(false)} />}</AnimatePresence>
      {isReportModalOpen && <ReportModal data={reportData} mode={activeMode} history={mirrorHistory} currentlySpeakingId={currentlySpeakingId} onClose={() => { setIsReportModalOpen(false); if (reportData) setIsCoolDownActive(true); }} onSpeak={handleSpeak} onGenerateManual={handleGenerateReport} isLoadingManual={isLoadingReport} />}
    </div>
  );
};

export default App;