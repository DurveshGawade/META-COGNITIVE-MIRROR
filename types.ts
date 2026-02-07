export type AppTab = 'home' | 'mirror' | 'interpreter' | 'converter' | 'transcriber' | 'evolution' | 'form-bridge' | 'crisis-sign' | 'learn-path';
export type AppMode = 'focus' | 'synergy' | 'interview';
export type VoiceIdentity = 'Puck' | 'Charon' | 'Fenrir' | 'Zephyr' | 'Kore';

export interface GestureFeedback {
  accuracy_score: number;
  error_type: 'POSITION' | 'TRAJECTORY' | 'EXPRESSION' | 'NONE';
  anatomical_fix: string;
  is_match: boolean;
  detected_gloss: string;
}

export interface MasteryProfile {
  level: number;
  exp: number;
  fluency_score: number;
  precision_score: number;
  weak_signs: string[];
  streak_days: number;
}

export interface TrainingLesson {
  title: string;
  objective: string;
  target_glosses: string[];
  context_scenario?: string;
}

export interface EmergencyAlert {
  id: string;
  event: string;
  severity: 'Extreme' | 'Severe' | 'Moderate' | 'Minor';
  urgency: 'Immediate' | 'Expected' | 'Future' | 'Past' | 'Unknown';
  areaDesc: string;
  description: string;
  instruction: string;
  sent: string;
}

export interface SigningScriptSegment {
  segment_id: number;
  sign_text: string;
  emphasis: 'CRITICAL' | 'STRONG' | 'MODERATE' | 'NEUTRAL';
  pacing: 'FAST' | 'MODERATE' | 'SLOW';
  facial_expression: string;
}

export interface TriageCard {
  chief_complaint: string;
  severity_self_reported: 'CRITICAL' | 'SEVERE' | 'MODERATE' | 'MINOR';
  pain_level: string;
  symptoms: string[];
  allergies: string;
  current_medications: string[];
  relevant_medical_history: string;
  time_of_onset: string;
}

export interface ActionItem {
  title: string;
}

export interface TranscriptionSegment {
  timestamp: string;
  startTime: number;
  text: string;
  speaker?: string;
}

export interface ForensicEntity {
  type: 'PERSON' | 'LOCATION' | 'DATE' | 'OBJECT' | 'ORGANIZATION';
  value: string;
}

export interface TranscriptionData {
  fullText: string;
  segments: TranscriptionSegment[];
  summary: string;
  keywords: string[];
  sentiment: string;
  entities?: ForensicEntity[];
}

export interface ARTag {
  id: string;
  label: string;
  box_2d: [number, number, number, number];
  description?: string;
}

export interface SignInterpretation {
  timestamp: string;
  recognizedSign: string;
  gloss: string; 
  meaning: string; 
  confidence: number;
  contextHint: string;
  intensity: number;
  velocity: number;
  sentiment: string;
  handBox?: [number, number, number, number];
}

export interface SignSymbol {
  word: string;
  gloss: string;
  symbolDescription: string;
  definition: string;
  imagePrompt: string;
  imageUrl?: string;
  trajectoryDescription: string; 
  anatomicalLocation: string; 
  kinematicSpecs: {
    palmOrientation: string;
    fingerArticulation: string;
    contactPoint: string;
    motionVector: string;
  };
  technicalTutorial: {
    handShape: string;
    movement: string;
    meaning: string;
  };
  movementCategory: 'circular' | 'linear' | 'arc' | 'static' | 'complex';
}

export interface StudioSettings {
  speed: 0.5 | 1 | 1.5;
  handedness: 'right' | 'left';
  visualStyle: 'cyber' | 'organic';
  variant: 'ASL' | 'BSL' | 'LSF' | 'ISL';
}

export interface DetectedObject {
  label: string;
  box_2d: [number, number, number, number];
  sentiment?: string;
}

export interface ResonanceMetric {
  label: string;
  value: number;
}

export interface AnalysisEntry {
  timestamp: string;
  timestampSeconds: number;
  action: string;
  thinking: string;
  chainOfThought: string;
  focusLevel: number;
  isDistracted: boolean;
  detected_objects: DetectedObject[];
  forensic_evidence: any[];
  emotion_score: number;
  emotion_label: string;
  acoustic_transcript?: string;
  acoustic_alert?: string;
  resonanceMetrics?: ResonanceMetric[];
  suggestedActions?: ActionItem[];
}

export interface ReportData {
  focusScore: number;
  performanceVerdict: string;
  executiveSummary: string;
  coreMetrics: {
    focusPersistence: number;
    stressVariability: number;
    acousticClarity: number;
    synapticFlow: number;
  };
  visualAuditNarrative: string;
  acousticAuditNarrative: string;
  correlationInsightNarrative: string;
  strategicRoadmap: { title: string; recommendation: string }[];
}

export interface SessionHistory {
  date: string;
  summary: string;
  focusScore: number;
}

export interface EvolutionLog {
  timestamp: string;
  id: string;
  type: 'AUDIT' | 'CORRECTION' | 'VERIFICATION' | 'AUTOPILOT';
  message: string;
  status: 'PENDING' | 'SUCCESS' | 'WARNING';
  thoughtSignature?: string;
}

export interface EvolutionMetrics {
  optimizedSignsCount: number;
  weakLinksDetected: number;
  antigravityPassRate: number;
  autonmousHours: number;
}

export interface WeakLink {
  gloss: string;
  confidenceHistory: number[];
  correctionStatus: 'IDENTIFIED' | 'RELEARNING' | 'STABLE';
  tutorialUrl?: string;
  anatomicalFix: string;
}

// Data model for neural bridge mediation analysis
export interface BridgeData {
  transcriptChunk: string;
  sentiment: {
    intensity: number;
    label: string;
    color: string;
  };
  conflictDetected: boolean;
  conflictReason?: string;
  isRewrite?: boolean;
  signs?: string[];
  objects?: { label: string; box_2d: [number, number, number, number] }[];
  predictions?: string[];
}

// Summary brief for communication strategic roadmap
export interface CommunicationBrief {
  primaryGoal: string;
  misunderstandings: string[];
}

export interface FormObligation {
  title: string;
  simplifiedMeaning: string;
  originalText: string;
  riskLevel: 'LOW' | 'MEDIUM' | 'HIGH';
  glosses: string[];
}

export interface DocumentAnalysis {
  obligations: FormObligation[];
  ambiguityLevel: number; // 1-10
  professionalAdviceNeeded: boolean;
}

// FIX: Added SocialAlert and SocialSyncData interfaces for Multi-Party Sync features
export interface SocialAlert {
  id: string;
  message: string;
}

export interface SignerData {
  id: string;
  name: string;
  confidence: number;
  box_2d: [number, number, number, number];
  isSigning: boolean;
  color: string;
}

export interface SocialSyncData {
  signers: SignerData[];
  alerts: SocialAlert[];
  activeTranscript: string;
}