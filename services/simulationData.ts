
import { AnalysisEntry } from '../types';

export const SIMULATION_INSIGHTS: Record<string, AnalysisEntry[]> = {
  'paraphrasing.mp4': [
    {
      timestamp: '00:00:02',
      timestampSeconds: 2.1,
      action: 'Troubleshooting Interface',
      thinking: 'Neural sync mismatch. Subject is attempting to re-establish optic link with main monitor.',
      chainOfThought: 'Gaze analysis shows local attention on primary hardware interface. Micro-expressions of frustration detected.',
      focusLevel: 42,
      isDistracted: true,
      emotion_score: 0.3,
      emotion_label: 'Frustration',
      detected_objects: [{ label: 'Monitor', box_2d: [550, 20, 950, 400] }],
      forensic_evidence: [{ item: 'Hardware Interface', impact: 'Medium', coordinates: [550, 20, 950, 400], reasoning: 'Obstacle detected in data presentation flow.' }]
    },
    {
      timestamp: '00:00:13',
      timestampSeconds: 13.5,
      action: 'Human Synergy Event',
      thinking: 'Collaboration pulse detected. Subject receiving external technical support.',
      chainOfThought: 'Social interaction detected. Focus shifting from frustration to solution-oriented dialogue.',
      focusLevel: 65,
      isDistracted: false,
      emotion_score: 0.6,
      emotion_label: 'Neutral',
      detected_objects: [{ label: 'Collaborator', box_2d: [100, 600, 900, 990] }],
      forensic_evidence: [{ item: 'Peer Support', impact: 'Low', coordinates: [100, 600, 900, 990], reasoning: 'Efficiency bottleneck resolved through synergy.' }]
    },
    {
      timestamp: '00:00:17',
      timestampSeconds: 17.2,
      action: 'Biometric Rehydration',
      thinking: 'Vitality reset. Subject utilizing hydration window before full cognitive load.',
      chainOfThought: 'Non-work object detected but impact is low due to reset nature of the action.',
      focusLevel: 75,
      isDistracted: false,
      emotion_score: 0.7,
      emotion_label: 'Neutral',
      detected_objects: [{ label: 'Water Bottle', box_2d: [300, 300, 600, 500] }],
      forensic_evidence: [{ item: 'Hydration Vector', impact: 'Low', coordinates: [300, 300, 600, 500], reasoning: 'Self-regulation of cognitive temperature.' }]
    },
    {
      timestamp: '00:00:25',
      timestampSeconds: 25.4,
      action: 'Deep Work Flow State',
      thinking: 'Peak flow initialization. Subject has established authoritative engagement with the projection feed.',
      chainOfThought: 'Gaze lock confirmed. Vocal frequency indicates high-confidence academic delivery.',
      focusLevel: 98,
      isDistracted: false,
      emotion_score: 0.9,
      emotion_label: 'Flow',
      detected_objects: [{ label: 'Projector', box_2d: [100, 100, 400, 900] }],
      forensic_evidence: [{ item: 'Projected Feed', impact: 'High', coordinates: [100, 100, 400, 900], reasoning: 'Primary focal point established.' }]
    },
    {
      timestamp: '00:00:45',
      timestampSeconds: 45.1,
      action: 'Analytical Presentation',
      thinking: 'Cognitive load balanced. Subject maintaining high-resonance interaction with archival text.',
      chainOfThought: 'Sustained focus on semantic reconstruction (paraphrasing). Efficient neural resource allocation.',
      focusLevel: 94,
      isDistracted: false,
      emotion_score: 0.85,
      emotion_label: 'Flow',
      detected_objects: [{ label: 'Text Interface', box_2d: [300, 100, 600, 900] }],
      forensic_evidence: []
    }
  ]
};
