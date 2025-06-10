import { envConfig } from '@/config/env';
import { BossPersona, UserState, GuidanceAction, SessionAnalysis } from '@/types/ai.types';

/**
 * ADK Agent base interface
 */
interface ADKAgent {
  id: string;
  name: string;
  type: string;
  execute(input: string, context: any): Promise<any>;
}

/**
 * Session context for agents
 */
interface SessionContext {
  bossPersona: BossPersona;
  scenario: any;
  userState: UserState;
  conversationHistory: any[];
  textAnalysis: any;
}

/**
 * Orchestration result
 */
interface OrchestrationResult {
  bossResponse: string;
  guidance: GuidanceAction[];
  analysis: SessionAnalysis;
}

/**
 * Boss Response Agent - generates boss responses using Gemini
 */
class BossResponseAgent implements ADKAgent {
  id = 'boss-response';
  name = 'Boss Response Generator';
  type = 'response';

  async execute(userInput: string, context: SessionContext): Promise<string> {
    const { generateResponse } = await import('@/services/gcp/gemini');
    
    const prompt = this.buildBossPrompt(userInput, context);
    const response = await generateResponse(prompt, {
      maxTokens: 200,
      temperature: 0.7,
    });
    
    return response;
  }

  private buildBossPrompt(userInput: string, context: SessionContext): string {
    const { bossPersona, scenario, conversationHistory } = context;
    
    const recentHistory = conversationHistory.slice(-3).map(msg => 
      `${msg.sender}: ${msg.content}`
    ).join('\n');

    return `You are roleplaying as ${bossPersona.name}, ${bossPersona.description}.

SCENARIO: ${scenario.description}
BOSS PERSONALITY: ${bossPersona.personality}
DIFFICULTY: ${bossPersona.difficulty}/10

CONVERSATION HISTORY:
${recentHistory}

USER JUST SAID: "${userInput}"

Respond as this boss character would in this scenario. Keep responses realistic and challenging but fair. Match the difficulty level. Be direct and professional.

BOSS RESPONSE:`;
  }
}

/**
 * Guidance Agent - provides coaching suggestions
 */
class GuidanceAgent implements ADKAgent {
  id = 'guidance';
  name = 'Communication Coach';
  type = 'guidance';

  async execute(userInput: string, context: SessionContext): Promise<GuidanceAction[]> {
    const analysis = context.textAnalysis;
    const suggestions: GuidanceAction[] = [];

    // Stress-based guidance
    if (analysis.stressIndicators.hesitationMarkers.length > 2) {
      suggestions.push({
        type: 'stress_management',
        message: 'Take a deep breath. You seem hesitant. Try stating your main point directly.',
        priority: 'medium',
      });
    }

    // Confidence-based guidance
    if (analysis.confidenceMarkers.uncertaintyWords.length > 1) {
      suggestions.push({
        type: 'confidence_building',
        message: 'Use more decisive language. Replace "maybe" and "I think" with confident statements.',
        priority: 'medium',
      });
    }

    // Professionalism guidance
    if (analysis.textQuality.professionalism < 60) {
      suggestions.push({
        type: 'professionalism',
        message: 'Consider using more formal language for this workplace scenario.',
        priority: 'low',
      });
    }

    // Response time guidance
    if (analysis.responseTime > 10000) {
      suggestions.push({
        type: 'response_time',
        message: 'Try to respond more quickly. In real situations, long pauses can seem uncertain.',
        priority: 'high',
      });
    }

    return suggestions;
  }
}

/**
 * Analytics Agent - tracks user progress and patterns
 */
class AnalyticsAgent implements ADKAgent {
  id = 'analytics';
  name = 'Performance Analyzer';
  type = 'analytics';

  async execute(userInput: string, context: SessionContext): Promise<SessionAnalysis> {
    const { textAnalysis, conversationHistory } = context;
    
    // Calculate trends from conversation history
    const recentMessages = conversationHistory.slice(-5);
    const stressLevels = recentMessages.map(msg => this.calculateStressLevel(msg.analysis));
    const confidenceLevels = recentMessages.map(msg => this.calculateConfidenceLevel(msg.analysis));
    
    const avgStress = stressLevels.reduce((sum, level) => sum + level, 0) / stressLevels.length;
    const avgConfidence = confidenceLevels.reduce((sum, level) => sum + level, 0) / confidenceLevels.length;
    
    return {
      currentStressLevel: this.calculateStressLevel(textAnalysis),
      currentConfidenceLevel: this.calculateConfidenceLevel(textAnalysis),
      averageStressLevel: avgStress || 50,
      averageConfidenceLevel: avgConfidence || 50,
      improvementAreas: this.identifyImprovementAreas(textAnalysis),
      strengths: this.identifyStrengths(textAnalysis),
      sessionProgress: this.calculateProgress(conversationHistory),
    };
  }

  private calculateStressLevel(analysis: any): number {
    if (!analysis) return 50;
    
    let stress = 30; // Base stress level
    
    // Hesitation markers increase stress
    stress += analysis.stressIndicators.hesitationMarkers.length * 10;
    
    // High punctuation density indicates stress
    if (analysis.stressIndicators.punctuationDensity > 0.1) stress += 15;
    
    // Response time affects stress
    if (analysis.responseTime > 8000) stress += 20;
    else if (analysis.responseTime > 5000) stress += 10;
    
    // Negative sentiment increases stress
    if (analysis.sentiment.score < -0.3) stress += 15;
    
    return Math.min(100, Math.max(0, stress));
  }

  private calculateConfidenceLevel(analysis: any): number {
    if (!analysis) return 50;
    
    let confidence = 60; // Base confidence level
    
    // Assertive words boost confidence
    confidence += analysis.confidenceMarkers.assertiveWords.length * 8;
    
    // Uncertainty words reduce confidence
    confidence -= analysis.confidenceMarkers.uncertaintyWords.length * 10;
    
    // Text quality affects confidence
    confidence += (analysis.textQuality.assertiveness - 50) * 0.5;
    
    // Professional language boosts confidence
    if (analysis.textQuality.professionalism > 70) confidence += 10;
    
    return Math.min(100, Math.max(0, confidence));
  }

  private identifyImprovementAreas(analysis: any): string[] {
    const areas: string[] = [];
    
    if (analysis.textQuality.professionalism < 60) areas.push('Professional Communication');
    if (analysis.textQuality.assertiveness < 50) areas.push('Assertiveness');
    if (analysis.confidenceMarkers.uncertaintyWords.length > 1) areas.push('Confident Language');
    if (analysis.stressIndicators.hesitationMarkers.length > 2) areas.push('Clear Expression');
    if (analysis.responseTime > 8000) areas.push('Response Speed');
    
    return areas;
  }

  private identifyStrengths(analysis: any): string[] {
    const strengths: string[] = [];
    
    if (analysis.textQuality.politeness > 70) strengths.push('Politeness');
    if (analysis.textQuality.clarity > 70) strengths.push('Clear Communication');
    if (analysis.textQuality.professionalism > 70) strengths.push('Professional Tone');
    if (analysis.confidenceMarkers.assertiveWords.length > 1) strengths.push('Assertive Language');
    if (analysis.responseTime < 5000) strengths.push('Quick Response');
    
    return strengths;
  }

  private calculateProgress(history: any[]): number {
    if (history.length < 2) return 0;
    
    const recent = history.slice(-3);
    const earlier = history.slice(0, Math.max(1, history.length - 3));
    
    const recentAvgQuality = recent.reduce((sum, msg) => {
      if (!msg.analysis) return sum;
      return sum + (msg.analysis.textQuality.professionalism + msg.analysis.textQuality.assertiveness) / 2;
    }, 0) / recent.length;
    
    const earlierAvgQuality = earlier.reduce((sum, msg) => {
      if (!msg.analysis) return sum;
      return sum + (msg.analysis.textQuality.professionalism + msg.analysis.textQuality.assertiveness) / 2;
    }, 0) / earlier.length;
    
    return Math.max(0, Math.min(100, recentAvgQuality - earlierAvgQuality + 50));
  }
}

/**
 * Session context for agents
 */
interface SessionContext {
  bossPersona: BossPersona;
  scenario: any;
  userState: UserState;
  conversationHistory: any[];
  textAnalysis: any;
}

/**
 * Orchestration result
 */
interface OrchestrationResult {
  bossResponse: string;
  guidance: GuidanceAction[];
  analysis: SessionAnalysis;
}

/**
 * ADK Multi-Agent Orchestrator
 */
class ADKOrchestrator {
  private agents: ADKAgent[] = [
    new BossResponseAgent(),
    new GuidanceAgent(),
    new AnalyticsAgent(),
  ];

  async orchestrate(userInput: string, context: SessionContext): Promise<OrchestrationResult> {
    try {
      // Execute all agents in parallel for efficiency
      const [bossResponse, guidance, analysis] = await Promise.all([
        this.agents[0].execute(userInput, context) as Promise<string>,
        this.agents[1].execute(userInput, context) as Promise<GuidanceAction[]>,
        this.agents[2].execute(userInput, context) as Promise<SessionAnalysis>,
      ]);

      return {
        bossResponse,
        guidance,
        analysis,
      };
    } catch (error) {
      console.error('Error in ADK orchestration:', error);
      
      // Fallback responses
      return {
        bossResponse: "I see. Please continue with your point.",
        guidance: [{
          type: 'general',
          message: 'Keep practicing your communication skills.',
          priority: 'low',
        }],
        analysis: {
          currentStressLevel: 50,
          currentConfidenceLevel: 50,
          averageStressLevel: 50,
          averageConfidenceLevel: 50,
          improvementAreas: [],
          strengths: [],
          sessionProgress: 0,
        },
      };
    }
  }
}

// Export the main orchestration function
const orchestrator = new ADKOrchestrator();

export async function orchestrateAgents(
  userInput: string,
  context: SessionContext
): Promise<OrchestrationResult> {
  return orchestrator.orchestrate(userInput, context);
}
