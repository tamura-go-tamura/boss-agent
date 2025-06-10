import { database } from '@/config/firebase';
import { ref, set, onValue, off, push, serverTimestamp } from 'firebase/database';

/**
 * Real-time user state tracking for training sessions
 */
export interface RealtimeUserState {
  sessionId: string;
  userId: string;
  stressLevel: number; // 0-100
  confidenceLevel: number; // 0-100
  responseTime: number; // milliseconds
  textLength: number;
  formalityLevel: number; // 0-100
  timestamp: number;
}

/**
 * Real-time session metrics
 */
export interface SessionMetrics {
  sessionId: string;
  averageStressLevel: number;
  averageConfidenceLevel: number;
  averageResponseTime: number;
  messagesCount: number;
  lastUpdate: number;
}

/**
 * Update user state in real-time
 */
export async function updateUserState(sessionId: string, userState: Partial<RealtimeUserState>) {
  try {
    const userStateRef = ref(database, `sessions/${sessionId}/userState`);
    await set(userStateRef, {
      ...userState,
      timestamp: serverTimestamp(),
    });
  } catch (error) {
    console.error('Error updating user state:', error);
    throw error;
  }
}

/**
 * Subscribe to real-time user state updates
 */
export function subscribeToUserState(
  sessionId: string,
  callback: (userState: RealtimeUserState | null) => void
) {
  const userStateRef = ref(database, `sessions/${sessionId}/userState`);
  
  onValue(userStateRef, (snapshot) => {
    const data = snapshot.val();
    callback(data);
  });

  // Return unsubscribe function
  return () => off(userStateRef);
}

/**
 * Update session metrics
 */
export async function updateSessionMetrics(sessionId: string, metrics: Partial<SessionMetrics>) {
  try {
    const metricsRef = ref(database, `sessions/${sessionId}/metrics`);
    await set(metricsRef, {
      ...metrics,
      lastUpdate: serverTimestamp(),
    });
  } catch (error) {
    console.error('Error updating session metrics:', error);
    throw error;
  }
}

/**
 * Subscribe to real-time session metrics
 */
export function subscribeToSessionMetrics(
  sessionId: string,
  callback: (metrics: SessionMetrics | null) => void
) {
  const metricsRef = ref(database, `sessions/${sessionId}/metrics`);
  
  onValue(metricsRef, (snapshot) => {
    const data = snapshot.val();
    callback(data);
  });

  // Return unsubscribe function
  return () => off(metricsRef);
}

/**
 * Log real-time events for analytics
 */
export async function logSessionEvent(sessionId: string, event: {
  type: 'message_sent' | 'stress_spike' | 'confidence_drop' | 'guidance_shown';
  data: any;
  timestamp?: number;
}) {
  try {
    const eventsRef = ref(database, `sessions/${sessionId}/events`);
    await push(eventsRef, {
      ...event,
      timestamp: serverTimestamp(),
    });
  } catch (error) {
    console.error('Error logging session event:', error);
    throw error;
  }
}

/**
 * Subscribe to real-time session events
 */
export function subscribeToSessionEvents(
  sessionId: string,
  callback: (events: any[]) => void
) {
  const eventsRef = ref(database, `sessions/${sessionId}/events`);
  
  onValue(eventsRef, (snapshot) => {
    const data = snapshot.val();
    if (data) {
      const eventsArray = Object.entries(data).map(([key, value]) => ({
        id: key,
        ...(value as object),
      }));
      callback(eventsArray);
    } else {
      callback([]);
    }
  });

  // Return unsubscribe function
  return () => off(eventsRef);
}

/**
 * Calculate stress level based on text analysis
 */
export function calculateStressLevel(textMetrics: {
  responseTime: number;
  textLength: number;
  hesitationMarkers: string[];
  punctuationDensity: number;
}): number {
  let stressLevel = 0;

  // Response time factor (longer response = higher stress)
  if (textMetrics.responseTime > 10000) stressLevel += 30; // 10+ seconds
  else if (textMetrics.responseTime > 5000) stressLevel += 20; // 5-10 seconds
  else if (textMetrics.responseTime > 3000) stressLevel += 10; // 3-5 seconds

  // Text length factor (very short or very long = stress)
  if (textMetrics.textLength < 10 || textMetrics.textLength > 200) stressLevel += 15;

  // Hesitation markers
  stressLevel += Math.min(textMetrics.hesitationMarkers.length * 10, 30);

  // Punctuation density (excessive punctuation = stress)
  if (textMetrics.punctuationDensity > 0.3) stressLevel += 15;

  return Math.min(stressLevel, 100);
}

/**
 * Initialize real-time tracking for a new session
 */
export async function initializeRealtimeTracking(sessionId: string, userState: Partial<RealtimeUserState>) {
  try {
    // Initialize session with starting state
    const sessionRef = ref(database, `sessions/${sessionId}`);
    await set(sessionRef, {
      userState: {
        ...userState,
        sessionId,
        timestamp: serverTimestamp(),
      },
      metrics: {
        sessionId,
        averageStressLevel: userState.stressLevel || 50,
        averageConfidenceLevel: userState.confidenceLevel || 50,
        averageResponseTime: 0,
        messagesCount: 0,
        lastUpdate: serverTimestamp(),
      },
      events: {},
      startTime: serverTimestamp(),
    });
  } catch (error) {
    console.error('Error initializing real-time tracking:', error);
    throw error;
  }
}

/**
 * Calculate confidence level based on text analysis
 */
export function calculateConfidenceLevel(textMetrics: {
  textLength: number;
  formalityLevel: number;
  assertiveWords: string[];
  uncertaintyWords: string[];
}): number {
  let confidenceLevel = 50; // Base confidence

  // Text length factor (appropriate length = confidence)
  if (textMetrics.textLength >= 20 && textMetrics.textLength <= 150) {
    confidenceLevel += 20;
  } else {
    confidenceLevel -= 10;
  }

  // Formality level (appropriate formality = confidence)
  if (textMetrics.formalityLevel >= 60 && textMetrics.formalityLevel <= 90) {
    confidenceLevel += 15;
  }

  // Assertive words boost confidence
  confidenceLevel += Math.min(textMetrics.assertiveWords.length * 5, 20);

  // Uncertainty words reduce confidence
  confidenceLevel -= Math.min(textMetrics.uncertaintyWords.length * 8, 30);

  return Math.max(0, Math.min(confidenceLevel, 100));
}
