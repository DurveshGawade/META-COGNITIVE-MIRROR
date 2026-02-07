
import React, { useState, useRef, useMemo, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { GeminiService } from '../services/geminiService';
import { TranscriptionData, TranscriptionSegment, ForensicEntity } from '../types';
import AgenticPulse from './AgenticPulse';
import TabBriefing from './TabBriefing';

interface VideoTranscriberProps {
  onAriaToast: (m: string) => void;
}

const SectionHeader: React.FC<{ title: string; subtitle: string; color: string }> = ({ title, subtitle, color }) => (
  <div className="mb-12 space-y-4">
    <div className="flex items-center gap-4">
      <span className="px-4 py-1 rounded-full border text-[10px] font-mono font-black uppercase tracking-widest" style={{ borderColor: `${color}44`, color, backgroundColor: `${color}11` }}>
        AUDIT_LEXICON_v5.0_LIVE_LINK
      </span>
      <div className="flex-1 h-px bg-white/10" />
    </div>
    <h2 className="text-4xl md:text-6xl font-black italic tracking-tighter uppercase text-white leading-none">
      {title} <span style={{ color }}>{subtitle}</span>
    </h2>
  </div>
);

const VideoTranscriber: React.FC<VideoTranscriberProps> = ({ onAriaToast }) => {
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isLiveMode, setIsLiveMode] = useState(false);
  const [isLiveActive, setIsLiveActive] = useState(false);
  const [transcription, setTranscription] = useState<TranscriptionData | null>(null);
  const [selectedLanguage, setSelectedLanguage] = useState('English');
  const [transcriptionStyle, setTranscriptionStyle] = useState('Verbatim');
  const [searchQuery, setSearchQuery] = useState('');
  const [captureProgress, setCaptureProgress] = useState(0);
  const [liveInterimText, setLiveInterimText] = useState("");
  
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const gemini = useMemo(() => new GeminiService(), []);
  
  // Live Streaming Refs
  const sessionPromiseRef = useRef<Promise<any> | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const liveStreamRef = useRef<MediaStream | null>(null);
  const frameIntervalRef = useRef<number | null>(null);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (videoUrl) URL.revokeObjectURL(videoUrl);
      setVideoFile(file);
      setVideoUrl(URL.createObjectURL(file));
      setTranscription(null);
      setIsLiveMode(false);
      onAriaToast("ARCHIVE_BUFFERED");
    }
  };

  const handleRemoveVideo = () => {
    if (videoUrl) URL.revokeObjectURL(videoUrl);
    setVideoFile(null);
    setVideoUrl(null);
    setTranscription(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
    onAriaToast("ARCHIVE_REMOVED");
  };

  const captureFrames = async (): Promise<{ frames: string[], duration: number }> => {
    if (!videoRef.current || !canvasRef.current) return { frames: [], duration: 0 };
    const v = videoRef.current;
    const c = canvasRef.current;
    const ctx = c.getContext('2d');
    if (!ctx) return { frames: [], duration: 0 };

    if (v.readyState < 1) {
      await new Promise((resolve) => {
        v.addEventListener('loadedmetadata', resolve, { once: true });
      });
    }

    const duration = v.duration;
    if (!duration || isNaN(duration)) return { frames: [], duration: 0 };

    const frameCount = Math.min(100, Math.ceil(duration));
    const sampleRate = duration / frameCount;

    const frames: string[] = [];
    const originalTime = v.currentTime;
    setCaptureProgress(0);

    for (let i = 0; i < frameCount; i++) {
      const time = i * sampleRate;
      v.currentTime = time;
      
      await new Promise((resolve) => {
        const onSeeked = () => {
          v.removeEventListener('seeked', onSeeked);
          resolve(true);
        };
        v.addEventListener('seeked', onSeeked);
        setTimeout(resolve, 2000); 
      });
      
      c.width = 1280;
      c.height = 720;
      ctx.drawImage(v, 0, 0, c.width, c.height);
      const data = c.toDataURL('image/jpeg', 0.75).split(',')[1];
      if (data) frames.push(data);
      
      setCaptureProgress(Math.round(((i + 1) / frameCount) * 100));
    }
    
    v.currentTime = originalTime;
    return { frames, duration };
  };

  // Live Mode Toggle
  const toggleLiveMode = () => {
    if (isLiveActive) {
      stopLiveAudit();
    } else {
      setIsLiveMode(true);
      handleRemoveVideo();
    }
  };

  const startLiveAudit = async () => {
    if (isProcessing) return;
    setIsProcessing(true);
    setIsLiveActive(true);
    onAriaToast("NEURAL_LIVE_UPLINK_START");

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true, video: { width: 1280, height: 720 } });
      liveStreamRef.current = stream;
      if (videoRef.current) videoRef.current.srcObject = stream;

      audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 16000 });
      const ctx = audioContextRef.current;

      sessionPromiseRef.current = gemini.connectLiveTranscription({
        onopen: () => {
          const source = ctx.createMediaStreamSource(stream);
          const processor = ctx.createScriptProcessor(4096, 1, 1);
          processor.onaudioprocess = (e) => {
            const input = e.inputBuffer.getChannelData(0);
            const l = input.length;
            const int16 = new Int16Array(l);
            for (let i = 0; i < l; i++) int16[i] = input[i] * 32768;
            const base64 = btoa(String.fromCharCode(...new Uint8Array(int16.buffer)));
            sessionPromiseRef.current?.then(s => s.sendRealtimeInput({ 
              media: { data: base64, mimeType: 'audio/pcm;rate=16000' } 
            }));
          };
          source.connect(processor);
          processor.connect(ctx.destination);

          // Video frames for live context
          frameIntervalRef.current = window.setInterval(() => {
            if (!videoRef.current || !canvasRef.current) return;
            const c = canvasRef.current;
            c.width = 640; c.height = 360;
            const vctx = c.getContext('2d');
            if (vctx) {
              vctx.drawImage(videoRef.current, 0, 0, c.width, c.height);
              const b64 = c.toDataURL('image/jpeg', 0.4).split(',')[1];
              sessionPromiseRef.current?.then(s => s.sendRealtimeInput({
                media: { data: b64, mimeType: 'image/jpeg' }
              }));
            }
          }, 1000);
        },
        onmessage: (msg: any) => {
          if (msg.serverContent?.inputTranscription) {
            const text = msg.serverContent.inputTranscription.text;
            setLiveInterimText(prev => prev + text);
          }
          if (msg.serverContent?.turnComplete) {
            setTranscription(prev => {
              const newSeg: TranscriptionSegment = {
                timestamp: `[LIVE:${new Date().toLocaleTimeString([], { hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' })}]`,
                startTime: Date.now(),
                text: liveInterimText,
                speaker: "USER"
              };
              const updatedSegments = [...(prev?.segments || []), newSeg];
              return {
                fullText: (prev?.fullText || "") + " " + liveInterimText,
                segments: updatedSegments,
                summary: prev?.summary || "Live audit in progress...",
                keywords: prev?.keywords || [],
                sentiment: "Active"
              };
            });
            setLiveInterimText("");
          }
        },
        onerror: (e: any) => onAriaToast("LIVE_LINK_ERROR"),
        onclose: () => stopLiveAudit()
      });

    } catch (e) {
      console.error(e);
      onAriaToast("SENSOR_PERMISSION_DENIED");
      stopLiveAudit();
    }
  };

  const stopLiveAudit = () => {
    setIsProcessing(false);
    setIsLiveActive(false);
    setLiveInterimText("");
    if (frameIntervalRef.current) clearInterval(frameIntervalRef.current);
    if (audioContextRef.current) audioContextRef.current.close();
    if (liveStreamRef.current) {
      liveStreamRef.current.getTracks().forEach(t => t.stop());
      liveStreamRef.current = null;
    }
    if (videoRef.current) videoRef.current.srcObject = null;
    sessionPromiseRef.current?.then(s => s.close());
    onAriaToast("LIVE_LINK_TERMINATED");
  };

  const handleTranscribe = async () => {
    if (isLiveMode) {
      if (isLiveActive) stopLiveAudit();
      else startLiveAudit();
      return;
    }

    if (!videoFile || isProcessing) return;
    setIsProcessing(true);
    setTranscription(null);
    onAriaToast("NEURAL_SYNTHESIS_INITIALIZED");

    try {
      const { frames, duration } = await captureFrames();
      if (frames.length === 0) throw new Error("CAPTURE_ZERO_FRAMES_FAILURE");

      const parts = frames.map(data => ({
        inlineData: { mimeType: 'image/jpeg', data }
      }));

      const isSummaryOnly = transcriptionStyle === 'Summary Only';
      const isClean = transcriptionStyle === 'Clean';
      const endTimeFormatted = `${Math.floor(duration / 60)}:${Math.floor(duration % 60).toString().padStart(2, '0')}`;

      let prompt = "";
      if (isSummaryOnly) {
        prompt = `EXECUTIVE SUMMARY PROTOCOL (STRICT):
        Provide a high-level semantic synthesis of this ${Math.round(duration)}s video archive in ${selectedLanguage}. 
        CRITICAL: Focus 100% on the 'summary' and 'keywords'. Do NOT provide a line-by-line log. Return exactly one dummy segment in 'segments' covering the whole time.`;
      } else if (isClean) {
        prompt = `CLEAN DIALOGUE PROTOCOL (STRICT):
        Provide a readable, "clean" dialogue transcript of this ${Math.round(duration)}s video in ${selectedLanguage}. 
        CRITICAL: Remove all fillers (um, ah, like). Focus 100% on the 'segments' field. Ensure segments cover the absolute START (00:00) to absolute END (approx. ${endTimeFormatted}).`;
      } else {
        prompt = `EXHAUSTIVE FORENSIC AUDIT PROTOCOL:
        Perform a word-for-word, line-by-line verbatim reconstruction of ALL dialogue in this ${Math.round(duration)}s video in ${selectedLanguage}.
        CRITICAL COMPLETENESS: Map segments from 00:00 to the absolute END. Use [Ambient] for gaps. Do not truncate the end.`;
      }

      const result = await gemini.transcribeVideo(parts, prompt);
      setTranscription(result);
      
      if (result.summary.includes("CRITICAL_ERROR")) {
        onAriaToast("SYNTHESIS_MALFORMED");
      } else {
        onAriaToast(isSummaryOnly ? "EXECUTIVE_BRIEF_READY" : isClean ? "CLEAN_TRANSCRIPT_SYNCED" : "FULL_FORENSIC_AUDIT_COMPLETE");
      }
    } catch (e: any) {
      console.error(e);
      onAriaToast(`ERROR: ${e.message || 'PROCESS_HALTED'}`);
    } finally {
      setIsProcessing(false);
      setCaptureProgress(0);
    }
  };

  const seekToTimestamp = (timestamp: string) => {
    if (!videoRef.current || isLiveMode) return;
    const cleanTs = timestamp.replace(/[\[\]]/g, '').trim();
    if (cleanTs.includes('LIVE')) return;
    
    const parts = cleanTs.split(':').map(Number);
    let totalSeconds = 0;
    if (parts.length === 3) {
      totalSeconds = parts[0] * 3600 + parts[1] * 60 + parts[2];
    } else if (parts.length === 2) {
      totalSeconds = parts[0] * 60 + parts[1];
    }
    videoRef.current.currentTime = totalSeconds;
    videoRef.current.play().catch(() => {});
  };

  const filteredSegments = useMemo(() => {
    const segments = transcription?.segments || [];
    if (!searchQuery) return segments;
    return segments.filter(s => 
      (s.text || "").toLowerCase().includes(searchQuery.toLowerCase()) || 
      (s.speaker && s.speaker.toLowerCase().includes(searchQuery.toLowerCase()))
    );
  }, [transcription, searchQuery]);

  const downloadTranscription = () => {
    if (!transcription) return;
    const content = `VIDEO_FORENSIC_TRANSCRIPT\nSOURCE: ${isLiveMode ? 'LIVE_SENSOR_UPLINK' : videoFile?.name}\nDATE: ${new Date().toISOString()}\n\nVERDICT: ${transcription.sentiment}\nSUMMARY: ${transcription.summary}\n\nLOGS:\n` + 
      (transcription.segments || []).map(s => `[${s.timestamp}] ${s.speaker ? s.speaker + ': ' : ''}${s.text}`).join('\n');
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `neural-audit-${Date.now()}.txt`;
    a.click();
  };

  const showSummary = !isLiveMode && (transcriptionStyle === 'Summary Only' || transcriptionStyle === 'Verbatim');
  const showLog = isLiveMode || (transcriptionStyle === 'Clean' || transcriptionStyle === 'Verbatim');

  return (
    <div className="max-w-[1700px] mx-auto px-8 flex flex-col gap-32">
      <TabBriefing 
        title="MODEL: ACOUSTIC EXTRACTION"
        description="Audit Lexicon performs deep-dive forensic transcription, isolating environmental acoustic markers and entity banks from high-fidelity video archives or live sensor hardware."
        steps={["LOAD SOURCE", "INITIATE AUDIT", "EXTRACT ENTITIES", "EXPORT LOGS"]}
        color="#10b981"
      />

      <canvas ref={canvasRef} className="hidden" />
      
      <section className="flex flex-col gap-12">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-10">
          <SectionHeader title="VIDEO LEXICON:" subtitle={isLiveMode ? "Live Sensor Audit" : "Forensic Audio Extraction"} color="#10b981" />
          
          <div className="flex flex-col items-end gap-6 mb-12">
            <div className="flex gap-3 bg-white/5 p-2 rounded-2xl border border-white/10 backdrop-blur-xl">
               <button 
                 onClick={() => setIsLiveMode(false)}
                 className={`px-6 py-2 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all ${!isLiveMode ? 'bg-emerald-500 text-black shadow-lg shadow-emerald-500/20' : 'text-white/40 hover:text-white'}`}
               >
                 Archive Mode
               </button>
               <button 
                 onClick={toggleLiveMode}
                 className={`px-6 py-2 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all ${isLiveMode ? 'bg-emerald-500 text-black shadow-lg shadow-emerald-500/20' : 'text-white/40 hover:text-white'}`}
               >
                 Live Sensor Mode
               </button>
            </div>

            <AnimatePresence>
              {videoUrl && !isLiveMode && (
                <motion.div 
                  initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}
                  className="flex gap-3 bg-white/5 p-2 rounded-2xl border border-white/5 backdrop-blur-xl"
                >
                  <button 
                    onClick={() => fileInputRef.current?.click()}
                    className="px-4 py-2 rounded-xl bg-white/5 border border-white/10 text-[9px] font-black uppercase text-white/40 hover:text-white hover:border-emerald-500/50 transition-all"
                  >
                    Change Video
                  </button>
                  <button 
                    onClick={handleRemoveVideo}
                    className="px-4 py-2 rounded-xl bg-red-500/10 border border-red-500/30 text-[9px] font-black uppercase text-red-400 hover:bg-red-500 hover:text-white transition-all"
                  >
                    Remove
                  </button>
                </motion.div>
              )}
            </AnimatePresence>

            {!isLiveMode && (
              <div className="flex gap-4 bg-white/5 p-2 rounded-2xl border border-white/5 backdrop-blur-xl">
                <select 
                  value={selectedLanguage} 
                  onChange={e => setSelectedLanguage(e.target.value)} 
                  className="bg-black border border-white/10 rounded-xl px-4 py-2 text-[10px] font-black uppercase text-white outline-none focus:border-emerald-500 transition-all cursor-pointer"
                >
                  <option>English</option>
                  <option>Spanish</option>
                  <option>French</option>
                  <option>German</option>
                  <option>Japanese</option>
                </select>
                <select 
                  value={transcriptionStyle} 
                  onChange={e => setTranscriptionStyle(e.target.value)} 
                  className="bg-black border border-white/10 rounded-xl px-4 py-2 text-[10px] font-black uppercase text-white outline-none focus:border-emerald-500 transition-all cursor-pointer"
                >
                  <option>Verbatim</option>
                  <option>Clean</option>
                  <option>Summary Only</option>
                </select>
              </div>
            )}
          </div>
        </div>

        <div className="grid lg:grid-cols-12 gap-10 items-stretch">
          <div className="lg:col-span-4 flex flex-col gap-8">
            <div className="relative aspect-video liquid-glass rounded-[48px] overflow-hidden bg-black/60 border border-white/10 shadow-3xl">
              <div className="absolute inset-0 forensic-grid opacity-10 pointer-events-none" />
              {(videoUrl || isLiveMode) ? (
                <video ref={videoRef} src={videoUrl || undefined} autoPlay={isLiveMode} controls={!isLiveMode} muted={isLiveMode} className="w-full h-full object-contain relative z-10" />
              ) : (
                <div className="h-full flex flex-col items-center justify-center p-12 text-center gap-8 relative z-10">
                   <div className="w-20 h-20 rounded-3xl bg-white/5 border border-white/10 flex items-center justify-center text-emerald-500/20">
                      <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" /></svg>
                   </div>
                   <h3 className="text-xl font-black italic uppercase text-white/20 tracking-widest">Awaiting Archive</h3>
                </div>
              )}
              {isLiveActive && (
                <div className="absolute top-8 left-8 flex items-center gap-3 px-4 py-2 bg-red-600/80 rounded-full border border-red-500 animate-pulse z-50">
                  <div className="w-2 h-2 rounded-full bg-white" />
                  <span className="text-[10px] font-black text-white uppercase tracking-widest">LIVE_AUDIT_ACTIVE</span>
                </div>
              )}
            </div>

            <div className="flex flex-col gap-4">
               <button 
                 onClick={handleTranscribe} disabled={(!videoFile && !isLiveMode) || (isProcessing && !isLiveMode)} 
                 className={`w-full h-24 rounded-[48px] ${isProcessing ? 'bg-white/5 text-emerald-500/50' : 'bg-emerald-500 text-black'} font-black italic uppercase tracking-[1em] text-xl shadow-[0_0_60px_rgba(16,185,129,0.3)] hover:scale-[1.01] transition-all relative overflow-hidden`}
               >
                 {isProcessing ? (
                    <div className="flex flex-col items-center gap-2">
                       <span className="animate-pulse">{isLiveActive ? "TERMINATE LIVE AUDIT" : "SYNTHESIZING..."}</span>
                       {captureProgress > 0 && !isLiveMode && <span className="text-[10px] tracking-[0.2em] font-mono">INGESTION: {captureProgress}%</span>}
                    </div>
                 ) : isLiveMode ? "INITIALIZE LIVE SENSOR" : "INITIATE ARCHIVE AUDIT"}
               </button>
               
               {!isLiveMode && (
                <label className="group cursor-pointer">
                  <input ref={fileInputRef} type="file" accept="video/*" onChange={handleFileUpload} className="hidden" />
                  <div className="w-full py-4 rounded-2xl bg-white/5 border border-white/5 text-center text-[10px] font-black uppercase tracking-[0.4em] text-white/40 group-hover:text-emerald-400 group-hover:border-emerald-500/20 transition-all">
                      {videoUrl ? "Load Different Archive" : "Load Archive"}
                  </div>
                </label>
               )}
            </div>

            <AnimatePresence>
              {transcription && transcription.entities && transcription.entities.length > 0 && (
                <motion.div 
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="liquid-glass rounded-[40px] p-8 border border-white/5 bg-white/[0.02]"
                >
                  <h3 className="text-[10px] font-black uppercase text-emerald-500 tracking-[0.4em] mb-6">Forensic Entity Bank</h3>
                  <div className="flex flex-wrap gap-2 max-h-[250px] overflow-y-auto custom-scrollbar">
                    {transcription.entities.map((entity, i) => (
                      <div 
                        key={i} 
                        className="px-4 py-2 rounded-xl bg-black/40 border border-white/5 flex flex-col gap-0.5"
                      >
                        <span className="text-[7px] font-black text-white/30 uppercase tracking-widest">{entity.type}</span>
                        <span className="text-[10px] font-bold text-emerald-400">{entity.value}</span>
                      </div>
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <div className="lg:col-span-8 h-full">
            <div className="liquid-glass rounded-[56px] bg-black/40 border border-white/5 flex flex-col h-[850px] shadow-3xl relative overflow-hidden">
               <div className="absolute inset-0 forensic-grid opacity-[0.05] pointer-events-none" />
               
               <div className="p-8 border-b border-white/5 flex flex-col gap-6 relative z-10 shrink-0">
                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-4">
                      <span className={`w-2 h-2 rounded-full ${isProcessing ? 'bg-emerald-500 shadow-[0_0_10px_#10b981] animate-pulse' : 'bg-white/20'}`} />
                      <h3 className="text-xs font-black text-white uppercase tracking-[0.3em]">Neural Transcript Feed</h3>
                    </div>
                    <div className="flex gap-4">
                      {transcription && (
                        <button 
                          onClick={downloadTranscription} 
                          className="px-6 py-2 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-[9px] font-black uppercase tracking-widest hover:bg-emerald-500 hover:text-black transition-all"
                        >
                          Download Audit
                        </button>
                      )}
                    </div>
                  </div>

                  <div className="relative">
                    <input 
                      type="text"
                      value={searchQuery}
                      onChange={e => setSearchQuery(e.target.value)}
                      placeholder="Search neural tokens..."
                      className="w-full bg-white/5 border border-white/10 rounded-2xl px-12 py-3 text-xs text-white focus:outline-none focus:border-emerald-500/50 transition-all placeholder:text-white/20"
                    />
                    <svg className="w-4 h-4 text-white/20 absolute left-5 top-1/2 -translate-y-1/2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                  </div>
               </div>

               <div className="flex-1 overflow-y-auto custom-scrollbar p-10 relative z-10 scroll-smooth">
                  {transcription || liveInterimText ? (
                    <div className="space-y-12">
                      {showSummary && (
                        <div className="grid md:grid-cols-2 gap-8">
                          <div className={`p-8 rounded-[32px] border space-y-4 ${transcription?.summary.includes("CRITICAL_ERROR") ? 'bg-red-500/10 border-red-500/30' : 'bg-white/[0.02] border-white/5'}`}>
                            <h4 className={`text-[10px] font-black uppercase tracking-widest ${transcription?.summary.includes("CRITICAL_ERROR") ? 'text-red-400' : 'text-emerald-500'}`}>Executive Synthesis</h4>
                            <p className={`text-lg font-light italic leading-relaxed ${transcription?.summary.includes("CRITICAL_ERROR") ? 'text-red-200' : 'text-white/80'}`}>"{transcription?.summary}"</p>
                          </div>
                          <div className="p-8 rounded-[32px] bg-white/[0.02] border border-white/5 flex flex-col justify-between">
                            <div>
                                <h4 className="text-[10px] font-black text-white/30 uppercase tracking-widest mb-4">Semantic Keywords</h4>
                                <div className="flex flex-wrap gap-2">
                                  {transcription?.keywords && transcription.keywords.length > 0 ? transcription.keywords.map((kw, i) => (
                                    <span key={i} className="px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-400 text-[9px] font-bold border border-emerald-500/20">#{kw}</span>
                                  )) : <span className="text-[9px] text-white/20 italic">No keywords extracted</span>}
                                </div>
                            </div>
                            <div className="mt-8 flex items-center justify-between border-t border-white/5 pt-6">
                                <span className="text-[10px] font-black text-white/30 uppercase tracking-widest">Sentiment Verdict</span>
                                <span className="text-xl font-black text-emerald-400 italic uppercase">{transcription?.sentiment}</span>
                            </div>
                          </div>
                        </div>
                      )}

                      {showLog && (
                        <div className="space-y-4">
                          <h4 className="text-[10px] font-black text-white/20 uppercase tracking-[0.5em] ml-2">Dialogue Log</h4>
                          <div className="flex flex-col gap-4">
                            {filteredSegments.map((seg, i) => (
                              <motion.div 
                                initial={{ opacity: 0, x: -10 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: i * 0.02 }}
                                key={i} 
                                onClick={() => seekToTimestamp(seg.timestamp)}
                                className="flex gap-6 group cursor-pointer"
                              >
                                 <div className="w-24 shrink-0 flex flex-col gap-2 pt-1">
                                    <span className="text-[11px] font-mono text-emerald-500/40 font-bold uppercase tracking-widest group-hover:text-emerald-400 transition-colors">[{seg.timestamp}]</span>
                                    {seg.speaker && (
                                      <span className="text-[8px] font-black text-white/20 uppercase group-hover:text-white/40">{seg.speaker}</span>
                                    )}
                                 </div>
                                 <div className="flex-1 p-5 rounded-2xl bg-white/[0.01] border border-transparent group-hover:border-white/5 group-hover:bg-white/[0.03] transition-all">
                                    <p className="text-sm text-white/70 leading-relaxed group-hover:text-white transition-colors">{seg.text}</p>
                                 </div>
                              </motion.div>
                            ))}
                            {liveInterimText && (
                              <div className="flex gap-6 animate-pulse">
                                <div className="w-24 shrink-0 flex flex-col gap-2 pt-1">
                                  <span className="text-[11px] font-mono text-emerald-400 font-bold uppercase tracking-widest">[LIVE]</span>
                                  <span className="text-[8px] font-black text-white/40 uppercase">USER</span>
                                </div>
                                <div className="flex-1 p-5 rounded-2xl bg-emerald-500/5 border border-emerald-500/20">
                                  <p className="text-sm text-emerald-100 leading-relaxed">{liveInterimText}</p>
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="h-full flex flex-col items-center justify-center opacity-10 uppercase text-[10px] tracking-[2em] text-center p-20 italic">
                       Awaiting Input Tokens...
                    </div>
                  )}
               </div>

               <div className="p-8 border-t border-white/5 bg-black/40 relative z-10 shrink-0">
                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-6">
                       <div className="h-4 w-64 bg-white/5 rounded-full overflow-hidden flex items-end">
                          {[...Array(20)].map((_, i) => (
                            <motion.div 
                              key={i} 
                              animate={isProcessing ? { height: [2, Math.random() * 14 + 2, 2] } : { height: 2 }}
                              transition={{ repeat: Infinity, duration: 0.5 + Math.random() }}
                              className="flex-1 bg-emerald-500/40"
                            />
                          ))}
                       </div>
                       <span className="text-[9px] font-mono text-white/20 uppercase tracking-widest">Acoustic_Density_Feed</span>
                    </div>
                    <div className="text-[8px] font-mono text-white/10 uppercase tracking-[0.5em]">Forensic_Node_v6.2_ACTIVE</div>
                  </div>
               </div>
            </div>
          </div>
        </div>
      </section>

      <AgenticPulse isAnalyzing={isProcessing} intensity={isLiveActive ? 5 : 4} />
    </div>
  );
};

export default VideoTranscriber;
