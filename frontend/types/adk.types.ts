// types/adk.types.ts

import type { 
  BossPersona, 
  UserState, 
  GuidanceAction, 
  SessionAnalysis, 
  ChatMessage 
} from './ai.types';

export interface TextAnalysis {
  sentiment: SentimentAnalysis;
  textQuality: TextQuality;
  stressIndicators: StressIndicators;
  confidenceMarkers: ConfidenceMarkers;
  responseTime: number;
}

export interface SentimentAnalysis {
  score: number;        // -1.0 to 1.0
  magnitude: number;    // 0.0 to 1.0
  confidence: number;   // 0.0 to 1.0
}

export interface TextQuality {
  clarity: number;         // 0-100
  professionalism: number; // 0-100
  politeness: number;      // 0-100
  assertiveness: number;   // 0-100
}

export interface StressIndicators {
  hesitationMarkers: string[];
  punctuationDensity: number;
  wordRepetition: number;
}

export interface ConfidenceMarkers {
  assertiveWords: string[];
  uncertaintyWords: string[];
  questionMarks: number;
}

export interface Scenario {
  id: string;
  title: string;
  description: string;
  difficulty: string;
}

export interface ADKAgent {
  id: string;
  name: string;
  type: string;
  execute(input: string, context: SessionContext): Promise<string | GuidanceAction[] | SessionAnalysis | TextAnalysis>;
}

export interface SessionContext {
  bossPersona: BossPersona;
  scenario: Scenario;
  userState: UserState;
  conversationHistory: ChatMessage[];
  textAnalysis?: TextAnalysis;
}

export interface OrchestrationResult {
  bossResponse: string;
  guidance: GuidanceAction[];
  analysis: SessionAnalysis;
  textAnalysis: TextAnalysis;
}

// Re-export types for external use
export type { 
  BossPersona, 
  UserState, 
  GuidanceAction, 
  SessionAnalysis, 
  ChatMessage 
};
