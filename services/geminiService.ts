import { GoogleGenAI, Type, Modality } from "@google/genai";
import { 
  AnalysisEntry, SignInterpretation, SignSymbol, StudioSettings, 
  TranscriptionData, AppMode, 
  ReportData, EvolutionLog, WeakLink, EvolutionMetrics,
  BridgeData, CommunicationBrief, DocumentAnalysis,
  EmergencyAlert, SigningScriptSegment, TriageCard,
  GestureFeedback, TrainingLesson,
  SocialSyncData, SocialAlert 
} from "../types";

const TEXT_MODEL = 'gemini-3-flash-preview';
const PRO_MODEL = 'gemini-3-pro-preview';
const IMAGE_MODEL = 'gemini-2.5-flash-image'; 
const TTS_MODEL = 'gemini-2.5-flash-preview-tts';
const LIVE_MODEL = 'gemini-2.5-flash-native-audio-preview-12-2025';

export class GeminiService {
  private ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  private isQuotaThrottled = false;
  private throttleResetTime = 0;

  private async request<T>(fn: () => Promise<T>, retries = 3, delay = 10000): Promise<T> {
    const now = Date.now();
    if (this.isQuotaThrottled && now < this.throttleResetTime) {
      const waitTime = this.throttleResetTime - now;
      console.warn(`Mirror Core: Quota active. Waiting ${waitTime}ms`);
      await new Promise(resolve => setTimeout(resolve, Math.min(waitTime, 5000)));
    } else if (this.isQuotaThrottled) {
      this.isQuotaThrottled = false;
    }

    try {
      const result = await fn();
      this.isQuotaThrottled = false;
      return result;
    } catch (error: any) {
      const errorMessage = error?.message?.toLowerCase() || "";
      const isQuotaError = 
        errorMessage.includes('429') || 
        errorMessage.includes('resource_exhausted') ||
        errorMessage.includes('quota') ||
        error?.status === 429;

      if (isQuotaError) {
        this.isQuotaThrottled = true;
        this.throttleResetTime = Date.now() + 60000;
        if (retries > 0) {
          console.warn(`Mirror Core: Quota exceeded. Retrying in ${delay}ms... (${retries} retries left)`);
          await new Promise(resolve => setTimeout(resolve, delay));
          return this.request(fn, retries - 1, delay * 1.5);
        }
      }
      throw error;
    }
  }

  private extractText(response: any): string {
    return response.text || "";
  }

  private repairJson(jsonStr: string): string {
    if (!jsonStr) return "{}";
    let cleaned = jsonStr.trim();
    cleaned = cleaned.replace(/```json/gi, '').replace(/```/g, '').trim();
    const firstBrace = cleaned.indexOf('{');
    const firstBracket = cleaned.indexOf('[');
    let start = -1;
    if (firstBrace !== -1 && (firstBracket === -1 || (firstBrace < firstBracket))) start = firstBrace;
    else if (firstBracket !== -1) start = firstBracket;
    
    if (start !== -1) {
      const lastBrace = cleaned.lastIndexOf('}');
      const lastBracket = cleaned.lastIndexOf(']');
      const end = Math.max(lastBrace, lastBracket);
      if (end !== -1) cleaned = cleaned.substring(start, end + 1);
    }
    return cleaned;
  }

  private safeParse<T>(jsonStr: string | undefined, fallback: T): T {
    try {
      if (!jsonStr) return fallback;
      const repaired = this.repairJson(jsonStr);
      const parsed = JSON.parse(repaired);
      if (Array.isArray(fallback)) return (Array.isArray(parsed) ? parsed : fallback) as T;
      if (typeof fallback === 'object' && fallback !== null) return { ...fallback, ...parsed };
      return parsed;
    } catch (e: any) {
      console.warn("JSON Parse Failed, using fallback", e);
      return fallback;
    }
  }

  // --- SIGN CONVERTER ---
  async interpretSign(base64Image: string, timestamp: string, variant: string): Promise<SignInterpretation> {
    return this.request(async () => {
      const response = await this.ai.models.generateContent({
        model: TEXT_MODEL,
        contents: { parts: [
          { inlineData: { mimeType: 'image/jpeg', data: base64Image } },
          { text: `ROLE: High-Precision Sign Language Forensic Interpreter.
          TASK: Identify the sign language gesture performed in this frame using ${variant} standards.
          RULES:
          1. Analyze handshape, palm orientation, location, and movement markers.
          2. Identify the "Gloss" (the standard linguistic label).
          3. Provide a natural meaning/translation of that gloss.
          4. Detect the bounding box [ymin, xmin, ymax, xmax] of the hands.
          5. If no sign is clearly performed, return "None" for recognizedSign.
          OUTPUT STRICT JSON:
          {
            "recognizedSign": string,
            "gloss": "SINGLE_WORD_GLOSS",
            "meaning": "Brief definition",
            "confidence": 0-100,
            "contextHint": "Usage context",
            "intensity": 0-100,
            "velocity": 0-100,
            "sentiment": "Neutral" | "Positive" | "Urgent" | "Negative",
            "handBox": [number, number, number, number]
          }` }
        ]},
        config: { 
          responseMimeType: "application/json",
          thinkingConfig: { thinkingBudget: 0 }
        }
      });
      const text = this.extractText(response);
      return this.safeParse<SignInterpretation>(text, {
        recognizedSign: "None", gloss: "", meaning: "", confidence: 0, contextHint: "",
        timestamp, intensity: 50, velocity: 50, sentiment: "Neutral"
      });
    });
  }

  async synthesizeTranscript(glosses: string[], variant: string): Promise<string> {
    if (glosses.length === 0) return "";
    return this.request(async () => {
      const response = await this.ai.models.generateContent({
        model: TEXT_MODEL,
        contents: `ROLE: Sign Language Narrative Reconstructor.
        TASK: Convert the following sequence of ${variant} GLOSSES into a single fluent, grammatically correct English sentence.
        GLOSS SEQUENCE: ${glosses.join(' -> ')}
        CRITICAL RULES:
        1. Handle sign-order (Topic-Comment, Time-Object-Verb, etc.) and convert to natural English prose.
        2. Do NOT include any meta-commentary, technical prefixes, or JSON.
        3. Maintain the intensity and sentiment implied by the sequence.
        OUTPUT ONLY THE FINAL ENGLISH SENTENCE.`,
        config: {
          thinkingConfig: { thinkingBudget: 0 }
        }
      });
      return this.extractText(response).trim() || "";
    });
  }

  // --- MIRROR CORE ---
  async analyzeMirrorFrame(base64Frame: string, base64Audio: string | null, mode: AppMode, timestamp: string, timestampSeconds: number): Promise<AnalysisEntry> {
    return this.request(async () => {
      const parts: any[] = [
        { text: `ROLE: Forensic Behavioral Auditor. Mode: ${mode}.
          TASK: Execute simultaneous VISUAL and ACOUSTIC audit of subject.
          
          MANDATORY MODAL INSTRUCTIONS:
          1. AUDIO ANALYTICS (Live_Link): If an audio part is present, analyze the 16kHz PCM stream for environmental markers. Detect typing (KEYBOARD), speech (SPEECH), background fans (ENVIRONMENTAL), or sudden alerts (ALARM). 
          2. YOU MUST prioritize identifying what is heard in the Live_Link. If any sound is present, "acoustic_alert" MUST NOT be "NONE".
          3. VISUAL ANALYTICS: Track gaze persistence, focus nodes, and objects.
          
          OUTPUT STRICT JSON:
          {
            "action": "Description of behavior",
            "thinking": "Neural monologue regarding focus/acoustic findings",
            "chainOfThought": "Trace of evidence integration",
            "focusLevel": 0-100,
            "isDistracted": boolean,
            "emotion_score": 0.0-1.0,
            "emotion_label": "Flow" | "Stressed" | "Neutral" | "Focused" | "Fatigue",
            "detected_objects": [{ "label": "Name", "box_2d": [ymin, xmin, ymax, xmax] }],
            "acoustic_alert": "ALARM" | "SPEECH" | "KEYBOARD" | "ENVIRONMENTAL" | "HUMAN_NOISE" | "NONE",
            "acoustic_transcript": "Summary of environmental sounds detected in the audio buffer"
          }` }
      ];

      parts.push({ inlineData: { mimeType: 'image/jpeg', data: base64Frame } });

      if (base64Audio) {
        parts.push({ inlineData: { mimeType: 'audio/pcm;rate=16000', data: base64Audio } });
      }

      const response = await this.ai.models.generateContent({
        model: PRO_MODEL, 
        contents: { parts },
        config: { 
          responseMimeType: "application/json",
          // Increased thinking budget for better modality fusion
          thinkingConfig: { thinkingBudget: 16384 } 
        }
      });
      const text = this.extractText(response);
      const data = this.safeParse(text, { 
        action: 'Uplink established', 
        thinking: 'Modality buffer active.', 
        chainOfThought: 'Awaiting data integration.', 
        focusLevel: 50, 
        isDistracted: false, 
        emotion_score: 0.5, 
        emotion_label: 'Neutral', 
        detected_objects: [],
        acoustic_alert: 'NONE',
        acoustic_transcript: ''
      });
      return { ...data, timestamp, timestampSeconds, forensic_evidence: [] };
    });
  }

  async generateFinalMirrorReport(history: AnalysisEntry[], mode: AppMode): Promise<ReportData> {
    return this.request(async () => {
      const response = await this.ai.models.generateContent({
        model: PRO_MODEL,
        contents: `ROLE: Senior Forensic Behavioral Analyst.
        TASK: Generate a High-Level Cognitive Synthesis from the following session history: ${JSON.stringify(history)}.
        MODE: ${mode}.
        
        REQUIREMENT: Reconstruct the session trajectory. Identify the "Peak Flow" moments and the "Drift Zones".
        
        OUTPUT STRICT JSON:
        {
          "focusScore": number (0-100),
          "performanceVerdict": "Defินitive clinical conclusion (e.g., SUSTAINED FLOW CONFIRMED)",
          "executiveSummary": "1-2 sentence high-level analytical synthesis",
          "coreMetrics": { "focusPersistence": number, "stressVariability": number, "acousticClarity": number, "synapticFlow": number },
          "visualAuditNarrative": "Detailed visual performance synthesis",
          "acousticAuditNarrative": "Deep dive into acoustic patterns and environmental impacts",
          "correlationInsightNarrative": "Complex correlation between visual focus and acoustic markers",
          "strategicRoadmap": [{ "title": "Step Name", "recommendation": "Highly actionable professional advice" }]
        }`,
        config: { 
          responseMimeType: "application/json",
          thinkingConfig: { thinkingBudget: 4096 } 
        }
      });
      const text = this.extractText(response);
      return this.safeParse(text, {
        focusScore: 75, performanceVerdict: "Audit Synthesis Complete", executiveSummary: "Neural history processed.",
        coreMetrics: { focusPersistence: 70, stressVariability: 40, acousticClarity: 85, synapticFlow: 65 },
        visualAuditNarrative: "Visual metrics stable.", acousticAuditNarrative: "Acoustic link nominal.", 
        correlationInsightNarrative: "Multimodal streams aligned.", strategicRoadmap: []
      });
    });
  }

  async analyzeBridgeFrame(base64Frame: string, history: string[]): Promise<BridgeData> {
    return this.request(async () => {
      const response = await this.ai.models.generateContent({
        model: TEXT_MODEL,
        contents: { parts: [
          { inlineData: { mimeType: 'image/jpeg', data: base64Frame } },
          { text: `ROLE: Neural Bridge Mediator.
          TASK: Detect intent and potential linguistic conflicts between speech and visual cues.
          OUTPUT STRICT JSON:
          {
            "transcriptChunk": "Translated segment",
            "sentiment": { "intensity": 0-100, "label": "Vibe", "color": "hex" },
            "conflictDetected": boolean,
            "conflictReason": "Why visual cues differ from expected intent",
            "isRewrite": boolean,
            "signs": ["GLOSS1", "GLOSS2"],
            "objects": [{ "label": "name", "box_2d": [ymin, xmin, ymax, xmax] }],
            "predictions": ["Next likely intent"]
          }` }
        ]},
        config: { 
          responseMimeType: "application/json",
          thinkingConfig: { thinkingBudget: 0 }
        }
      });
      const text = this.extractText(response);
      return this.safeParse(text, { transcriptChunk: '', sentiment: { intensity: 50, label: 'Neutral', color: '#00ffff' }, conflictDetected: false, predictions: [] });
    });
  }

  async performMarathonAudit(history: any[]): Promise<{ logs: EvolutionLog[], metrics: EvolutionMetrics, weakLinks: WeakLink[] }> {
    return this.request(async () => {
      const response = await this.ai.models.generateContent({
        model: TEXT_MODEL,
        contents: `ROLE: Marathon Evolution Agent.
        TASK: Process long-form behavioral history to identify systematic kinematic weak links and optimization paths.
        HISTORY: ${JSON.stringify(history)}
        OUTPUT STRICT JSON:
        {
          "logs": [{ "timestamp": "time", "id": "id", "type": "AUDIT", "message": "str", "status": "SUCCESS" }],
          "metrics": { "optimizedSignsCount": number, "weakLinksDetected": number, "antigravityPassRate": number, "autonmousHours": number },
          "weakLinks": [{ "gloss": "SIGN", "confidenceHistory": [number], "correctionStatus": "IDENTIFIED", "anatomicalFix": "Clinical correction description" }]
        }`,
        config: { 
          responseMimeType: "application/json",
          thinkingConfig: { thinkingBudget: 2048 }
        }
      });
      const text = this.extractText(response);
      return this.safeParse(text, { logs: [], metrics: { optimizedSignsCount: 0, weakLinksDetected: 0, antigravityPassRate: 0, autonmousHours: 0 }, weakLinks: [] });
    });
  }

  async convertToSignSymbols(text: string, settings: StudioSettings): Promise<SignSymbol[]> {
    return this.request(async () => {
      const response = await this.ai.models.generateContent({
        model: PRO_MODEL,
        contents: `ROLE: High-Precision Linguistic-Kinetic Interpreter.
        TASK: Convert the text "${text}" into a sequence of ${settings.variant} (Sign Language) symbols.
        OUTPUT JSON ARRAY OF SignSymbol:
        {
          "word": string,
          "gloss": string,
          "symbolDescription": string,
          "definition": string,
          "imagePrompt": "Detailed physical pose for 3D rendering",
          "trajectoryDescription": string,
          "anatomicalLocation": "Specific body anchor part",
          "kinematicSpecs": { "palmOrientation": string, "fingerArticulation": string, "contactPoint": string, "motionVector": string },
          "technicalTutorial": { "handShape": string, "movement": string, "meaning": string },
          "movementCategory": "circular" | "linear" | "arc" | "static" | "complex"
        }`,
        config: { 
          responseMimeType: "application/json",
          thinkingConfig: { thinkingBudget: 4096 } 
        }
      });
      const resText = this.extractText(response);
      return this.safeParse<SignSymbol[]>(resText, []);
    });
  }

  async evaluateGesture(base64Frame: string, targetGloss: string, variant: string): Promise<GestureFeedback> {
    return this.request(async () => {
      const response = await this.ai.models.generateContent({
        model: PRO_MODEL,
        contents: { parts: [
          { inlineData: { mimeType: 'image/jpeg', data: base64Frame } },
          { text: `ROLE: Clinical Gesture Diagnostic Unit.
          TASK: Compare this frame against the ideal ${variant} sign for "${targetGloss}".
          OUTPUT STRICT JSON:
          {
            "accuracy_score": 0-100,
            "error_type": "POSITION" | "TRAJECTORY" | "EXPRESSION" | "NONE",
            "anatomical_fix": "Clinical anatomical correction instructions",
            "is_match": boolean,
            "detected_gloss": "The sign actually detected"
          }` }
        ]},
        config: { 
          responseMimeType: "application/json",
          thinkingConfig: { thinkingBudget: 4096 } 
        }
      });
      const text = this.extractText(response);
      return this.safeParse(text, { accuracy_score: 0, error_type: 'NONE', anatomical_fix: 'Unable to scan.', is_match: false, detected_gloss: '' });
    });
  }

  async generateDynamicLesson(history: string[]): Promise<TrainingLesson> {
    return this.request(async () => {
      const response = await this.ai.models.generateContent({
        model: TEXT_MODEL,
        contents: `ROLE: AI Neural Tutor.
        TASK: Generate a custom training lesson focusing on improving these weak signs: ${JSON.stringify(history)}.
        OUTPUT STRICT JSON:
        { "title": "Lesson Title", "objective": "Goal", "target_glosses": ["SIGN"] }`,
        config: { 
          responseMimeType: "application/json",
          thinkingConfig: { thinkingBudget: 0 }
        }
      });
      const text = this.extractText(response);
      return this.safeParse(text, { title: 'General Practice', objective: 'Mastering basics', target_glosses: ['HELLO'] });
    });
  }

  async translateEmergencyAlert(alert: EmergencyAlert, signLanguage: string): Promise<{ urgency_level: string, signing_script: SigningScriptSegment[] }> {
    return this.request(async () => {
      const response = await this.ai.models.generateContent({
        model: PRO_MODEL,
        contents: `ROLE: Emergency Protocol Translator.
        TASK: Deconstruct alert into signing script.
        ALERT: ${JSON.stringify(alert)}
        OUTPUT STRICT JSON:
        { "urgency_level": "CRITICAL" | "ADVISORY", "signing_script": [{ "segment_id": number, "sign_text": "GLOSS", "emphasis": "CRITICAL", "pacing": "FAST", "facial_expression": "Intense" }] }`,
        config: { 
          responseMimeType: "application/json",
          thinkingConfig: { thinkingBudget: 4096 } 
        }
      });
      const text = this.extractText(response);
      return this.safeParse(text, { urgency_level: 'ADVISORY', signing_script: [] });
    });
  }

  // --- FORMBRIDGE ---
  async analyzeDocument(base64Data: string, mimeType: string): Promise<DocumentAnalysis> {
    return this.request(async () => {
      const response = await this.ai.models.generateContent({
        model: PRO_MODEL,
        contents: { parts: [
          { inlineData: { mimeType, data: base64Data } },
          { text: `ROLE: Forensic Document Parity Auditor.
          TASK: Extract the most critical obligations, rights, and clauses from this document.
          OUTPUT STRICT JSON:
          {
            "obligations": [{
              "title": "Clear Clause Title",
              "simplifiedMeaning": "Plain English summary",
              "originalText": "Verbatim clause text",
              "riskLevel": "LOW" | "MEDIUM" | "HIGH",
              "glosses": ["TOKENS"]
            }],
            "ambiguityLevel": 1-10,
            "professionalAdviceNeeded": boolean
          }` }
        ]},
        config: { 
          responseMimeType: "application/json",
          thinkingConfig: { thinkingBudget: 2048 }
        }
      });
      const text = this.extractText(response);
      return this.safeParse(text, { obligations: [], ambiguityLevel: 1, professionalAdviceNeeded: false });
    });
  }

  async generateSignImage(prompt: string): Promise<string> {
    return this.request(async () => {
      const response = await this.ai.models.generateContent({
        model: IMAGE_MODEL,
        contents: { parts: [{ text: prompt }] },
        config: { 
          imageConfig: { aspectRatio: "1:1" }
        }
      });
      const parts = response.candidates?.[0]?.content?.parts;
      if (parts) {
        for (const part of parts) {
          if (part.inlineData) return `data:image/png;base64,${part.inlineData.data}`;
        }
      }
      throw new Error("No image data found.");
    });
  }

  async generateTacticalSVG(location: string, zoomLevel: string): Promise<string> {
    return this.request(async () => {
      const response = await this.ai.models.generateContent({
        model: TEXT_MODEL,
        contents: `ROLE: Forensic Map Architect.
        TASK: Create a minimalist, futuristic SVG map for the region: ${location}. 
        ZOOM_LEVEL: ${zoomLevel}.
        
        AESTHETIC RULES:
        1. Use dark mode palette: background="transparent".
        2. Drawing layers:
           - A hexagonal grid overlay (stroke="rgba(6, 182, 212, 0.1)").
           - Primary road vectors as simplified cyan lines (stroke="#06b6d4", stroke-width="2").
           - A central pulsing red marker for 'SOS_ORIGIN' (circle with radial gradient).
           - Small cyan dots for tactical nodes.
        3. Dimensions: 800x600 viewBox.
        4. No text labels except "SOS_ORIGIN" near the red marker.
        5. Output ONLY the raw SVG string. No Markdown, no preamble.`,
        config: {
          thinkingConfig: { thinkingBudget: 0 }
        }
      });
      return this.extractText(response).trim() || "";
    });
  }

  async transcribeVideo(parts: any[], configPrompt: string): Promise<TranscriptionData> {
    return this.request(async () => {
      const response = await this.ai.models.generateContent({
        model: PRO_MODEL,
        contents: { parts: [...parts, { text: configPrompt }] },
        config: { 
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              fullText: { type: Type.STRING, description: "EXHAUSTIVE verbatim reconstruction of ALL extracted text from the START to the ABSOLUTE END of the video duration." },
              segments: {
                type: Type.ARRAY,
                description: "MANDATORY chronological dialogue segments. Must cover the ENTIRE duration. Do not truncate the end.",
                items: {
                  type: Type.OBJECT,
                  properties: {
                    timestamp: { type: Type.STRING, description: "Format [MM:SS]. Must be continuous." },
                    startTime: { type: Type.NUMBER },
                    text: { type: Type.STRING, description: "Verbatim words spoken. Use [Silence] if no dialogue in this block." },
                    speaker: { type: Type.STRING },
                  },
                  required: ["timestamp", "text"]
                }
              },
              summary: { type: Type.STRING },
              keywords: { type: Type.ARRAY, items: { type: Type.STRING } },
              sentiment: { type: Type.STRING },
              entities: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    type: { type: Type.STRING, enum: ["PERSON", "LOCATION", "DATE", "OBJECT", "ORGANIZATION"] },
                    value: { type: Type.STRING },
                  },
                  required: ["type", "value"]
                }
              }
            },
            required: ["fullText", "segments", "summary", "keywords", "sentiment"]
          },
          thinkingConfig: { thinkingBudget: 32768 } 
        }
      });
      const text = this.extractText(response);
      return this.safeParse<TranscriptionData>(text, {
        fullText: "", 
        segments: [], 
        summary: "CRITICAL_ERROR: Synthesis failed to generate structured data.", 
        keywords: [], 
        sentiment: "Neutral"
      });
    });
  }

  async interactWithAria(query: string, history: AnalysisEntry[]): Promise<{ text: string; command?: any }> {
    return this.request(async () => {
      const response = await this.ai.models.generateContent({
        model: TEXT_MODEL,
        contents: `ROLE: Neural Forensic Link Agent (ARIA).
        USER_QUERY: ${query}
        SESSION_HISTORY: ${JSON.stringify(history.slice(-10))}
        TASK: Respond as an advanced forensic intelligence unit. Be concise and authoritative.`,
        config: {
          thinkingConfig: { thinkingBudget: 0 }
        }
      });
      const text = this.extractText(response);
      return { text: text || "No response." };
    });
  }

  async generateCommunicationBrief(history: BridgeData[]): Promise<CommunicationBrief> {
    return this.request(async () => {
      const response = await this.ai.models.generateContent({
        model: TEXT_MODEL,
        contents: `ROLE: Communication Strategic Analyst. Summarize interaction intent.
        DATA: ${JSON.stringify(history)}
        OUTPUT STRICT JSON:
        { "primaryGoal": "str", "misunderstandings": ["str"] }`,
        config: { 
          responseMimeType: "application/json",
          thinkingConfig: { thinkingBudget: 0 }
        }
      });
      const text = this.extractText(response);
      return this.safeParse(text, { primaryGoal: 'Brief synthesis failed.', misunderstandings: [] });
    });
  }

  async generateSpeech(text: string, voiceName: string = 'Kore'): Promise<Uint8Array | null> {
    return this.request(async () => {
      const response = await this.ai.models.generateContent({
        model: TTS_MODEL,
        contents: [{ parts: [{ text }] }],
        config: {
          responseModalities: [Modality.AUDIO],
          speechConfig: {
            voiceConfig: { prebuiltVoiceConfig: { voiceName } },
          },
        },
      });
      const base64Audio = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
      if (base64Audio) return this.decodeBase64(base64Audio);
      return null;
    });
  }

  async connectCrisisLive(callbacks: any) {
    return this.ai.live.connect({
      model: LIVE_MODEL,
      callbacks,
      config: {
        responseModalities: [Modality.AUDIO],
        systemInstruction: `ROLE: Crisis Emergency Assistant. Focus on high-speed sign-to-speech translation.`,
      }
    });
  }

  async connectLiveTranscription(callbacks: any) {
    return this.ai.live.connect({
      model: LIVE_MODEL,
      callbacks,
      config: {
        responseModalities: [Modality.AUDIO],
        inputAudioTranscription: {},
        systemInstruction: `ROLE: Senior Acoustic Forensic Auditor. 
        TASK: Perform real-time verbatim transcription of user speech. 
        MANDATORY: Maintain absolute accuracy. Focus on professional context.`,
      }
    });
  }

  async analyzeCrisisTriage(base64Frames: string[], history: string[]): Promise<{ translation_text: string, gloss: string, detected_objects: any[] }> {
    return this.request(async () => {
      const imageParts = base64Frames.map(f => ({ inlineData: { mimeType: 'image/jpeg', data: f } }));
      
      const response = await this.ai.models.generateContent({
        model: PRO_MODEL,
        contents: { parts: [
          ...imageParts,
          { text: `ROLE: SOS EMERGENCY KINETIC CONVERTER (SIGN-TO-TEXT ONLY).
          TASK: Identify specific ASL emergency gestures by analyzing movement across the frame sequence.
          CONTEXT: User is in life-safety peril. SOS Protocol Beta is active.
          PREVIOUS_GLOSSES: ${JSON.stringify(history.slice(-10))}
          
          URGENCY GUIDELINES:
          1. PRIMARY TARGET: "HELP" sign. Kinetic path: Dominant hand (thumb-up fist) rests on open palm of non-dominant hand, and both move UPWARD together.
          2. OTHER TARGETS: "DANGER", "PAIN", "MEDICAL", "HURT", "FIRE", "POLICE".
          3. CRITICAL: This is a SIGN-TO-TEXT converter. Do not assume any audio modality.
          4. MANDATORY: If the user is performing the "HELP" sign, you MUST return "HELP" in the gloss field and a translation like "USER REQUESTS IMMEDIATE EMERGENCY ASSISTANCE".
          5. If confidence is even moderate, prioritize the emergency sign over "SEARCHING".
          
          OUTPUT STRICT JSON:
          {
            "translation_text": "verbatim_translation_string",
            "gloss": "HELP" | "DANGER" | "PAIN" | "NONE" | "SEARCHING",
            "detected_objects": [
              { "label": "KINETIC_EMERGENCY_INTENT", "box_2d": [ymin, xmin, ymax, xmax] }
            ]
          }
          `}
        ]},
        config: { 
          responseMimeType: "application/json",
          thinkingConfig: { thinkingBudget: 8192 } 
        }
      });
      const text = this.extractText(response);
      return this.safeParse(text, { translation_text: "SCANNING_GESTURES...", gloss: "SEARCHING", detected_objects: [] });
    });
  }

  async analyzeSocialSyncFrame(base64Frame: string, history: string[]): Promise<SocialSyncData> {
    return this.request(async () => {
      const response = await this.ai.models.generateContent({
        model: TEXT_MODEL,
        contents: { parts: [
          { inlineData: { mimeType: 'image/jpeg', data: base64Frame } },
          { text: `ROLE: Multi-Party Social Sync Orchestrator.
          TASK: Identify all signers in the frame, track their activity, and generate a live group transcript.
          CONTEXT: Group communication setting. Identify individual signers spatially and linguistically.
          PREVIOUS TRANSCRIPT HISTORY: ${JSON.stringify(history.slice(-5))}
          
          REQUIRED ANALYTICS:
          1. SENSOR_TAGGING: Detect bounding boxes [ymin, xmin, ymax, xmax] for all visible humans.
          2. INTENT_MAPPING: Determine if each person is currently performing signs (isSigning).
          3. DIALOGUE_SYNTHESIS: Generate a verbatim transcript prefixed with the person's name (e.g., "Alice: Hello").
          4. CONFLICT_DETECTION: Return alerts if communication overlaps or friction occurs.
          
          OUTPUT STRICT JSON:
          {
            "signers": [{
              "id": "unique_signer_id",
              "name": "Signer Label",
              "confidence": 0.0-1.0,
              "box_2d": [ymin, xmin, ymax, xmax],
              "isSigning": boolean,
              "color": "hex_color_string"
            }],
            "alerts": [{ "id": "alert_id", "message": "Reason for alert" }],
            "activeTranscript": "Speaker Name: Verbatim transcription of signs"
          }` }
        ]},
        config: { 
          responseMimeType: "application/json",
          thinkingConfig: { thinkingBudget: 0 }
        }
      });
      const text = this.extractText(response);
      return this.safeParse<SocialSyncData>(text, { 
        signers: [], 
        alerts: [], 
        activeTranscript: "" 
      });
    });
  }

  async generateEvolutionTutorial(link: WeakLink): Promise<string> {
    const prompt = `Forensic performance render showing perfect sign for "${link.gloss}". Style: Dark obsidian glass humanoid.`;
    return this.generateSignImage(prompt);
  }

  private decodeBase64(base64: string): Uint8Array {
    const binaryString = atob(base64);
    const len = binaryString.length;
    const bytes = new Uint8Array(len);
    for (let i = 0; i < len; i++) {
      bytes[i] = binaryString.charCodeAt(i);
    }
    return bytes;
  }
}