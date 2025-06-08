// types/ai.types.ts

/**
 * Represents the emotional state or visual cue of the AI Boss avatar.
 */
export type Emotion = 'neutral' | 'happy' | 'angry' | 'sad' | 'surprised' | 'thinking';

export interface AvatarExpression {
  emotion: Emotion;
  intensity?: number; // Optional: 0.0 to 1.0, for nuanced expression
  visualCue?: string; // Optional: e.g., 'raised_eyebrow', 'nodding'
}

/**
 * Event data for when the boss's mood changes.
 */
export interface MoodChangeEvent {
  newEmotion: Emotion;
  reason?: string; // Optional: Explanation for the mood change
}

/**
 * Represents a single message in the chat.
 */
export interface ChatMessage {
  speaker: 'user' | 'boss';
  text: string;
  timestamp: string; // ISO 8601 date-time string
  // Optional fields for richer context
  emotionAnalysis?: any; // Result from Natural Language AI for the user's message
  responseTimeMs?: number; // User's response time for this message
}

/**
 * Context for generating boss responses or suggestions.
 * This should be built and passed by the backend orchestrator (ADK agent).
 */
export interface ConversationContext {
  sessionId: string;
  currentTurnNumber: number;
  history: ChatMessage[]; // Chronological order, oldest to newest
  currentUserState?: any; // UserState type, representing current user metrics (stress, confidence, etc.)
  currentBossPersona?: any; // BossPersona type, details of the current boss AI
  // Additional context relevant for the AI's decision making
  sessionGoals?: string[]; // e.g., ["practice negotiation", "handle criticism"]
  recentUserPerformance?: any; // e.g., { politenessScore: 0.8, clarityScore: 0.7 }
}

/**
 * Represents the AI Boss's response in a conversation turn.
 */
export interface BossResponse {
  message: string; // The text spoken by the boss
  newAvatarExpression?: AvatarExpression; // Optional: If the response triggers a specific avatar change
  suggestedUserQuickReplies?: string[]; // Optional: Pre-defined replies for the user to choose from
  // internalBossThought?: string; // For debugging or advanced feedback, not directly shown to user
  // accompanyingAction?: string; // e.g., 'stands_up', 'leans_forward' (for future animation)
}

// Assuming BossPersona and UserState are defined elsewhere (as per "既存定義")
// If not, they should be defined here or imported. For example:
//
// export interface BossPersona {
//   id: string;
//   name: string;
//   personalityTraits: string[]; // e.g., ["impatient", "micromanager", "supportive"]
//   communicationStyle: string; // e.g., "direct", "passive-aggressive"
//   // ... other relevant persona details
// }
//
// export interface UserState {
//   stressLevel: number; // e.g., 0-100
//   confidenceLevel: number; // e.g., 0-100
//   engagementLevel: number; // e.g., 0-100
//   detectedEmotions?: string[]; // From Natural Language AI
//   // ... other relevant user metrics
// }
