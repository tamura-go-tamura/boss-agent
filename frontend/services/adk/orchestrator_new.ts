// services/adk/orchestrator.ts
import type { 
  SessionContext, 
  OrchestrationResult,
  GuidanceAction,
  SessionAnalysis,
  TextAnalysis
} from '@/types/adk.types';
import type { BossPersona, UserState } from '@/types/ai.types';
import { adkClient, type ADKTrainingRequest } from './client';

/**
 * ADK Backend Orchestrator
 * 
 * This orchestrator integrates with Google ADK-Python backend
 * and provides fallback to local processing when backend is unavailable
 */
class ADKBackendOrchestrator {
  private fallbackEnabled = true;

  async orchestrate(userInput: string, context: SessionContext): Promise<OrchestrationResult> {
    try {
      // Try to use Google ADK backend first
      const backendAvailable = await adkClient.isAvailable();
      
      if (backendAvailable) {
        return await this.processWithADKBackend(userInput, context);
      } else if (this.fallbackEnabled) {
        console.warn('ADK backend not available, falling back to local processing');
        return await this.processWithLocalFallback(userInput, context);
      } else {
        throw new Error('ADK backend not available and fallback disabled');
      }
    } catch (error) {
      console.error('Error in ADK orchestration:', error);
      
      if (this.fallbackEnabled) {
        return await this.processWithLocalFallback(userInput, context);
      }
      
      throw error;
    }
  }

  private async processWithADKBackend(userInput: string, context: SessionContext): Promise<OrchestrationResult> {
    const { bossPersona, userState } = context;
    
    // Convert context to ADK request format
    const request: ADKTrainingRequest = {
      boss_persona: {
        id: bossPersona.id,
        name: bossPersona.name,
        description: bossPersona.description,
        difficulty: bossPersona.difficulty,
        stress_triggers: bossPersona.stressTriggers || [],
        communication_style: bossPersona.communicationStyle || 'Professional',
        avatar_url: bossPersona.avatarUrl || undefined
      },
      user_state: {
        stress_level: this.mapStressLevel(userState.stressLevel),
        confidence: userState.confidence,
        engagement: userState.engagement,
        last_response_quality: userState.lastResponseQuality || undefined
      },
      user_message: userInput,
      context: this.buildContextString(context)
    };

    // Call ADK backend
    const adkResponse = await adkClient.processTrainingInteraction(request);

    // Convert ADK response to our format
    return {
      bossResponse: adkResponse.boss_response.message,
      guidance: this.convertSuggestionsToGuidance(adkResponse.analysis.suggestions),
      analysis: {
        currentStressLevel: this.mapBackStressLevel(adkResponse.updated_user_state.stress_level),
        currentConfidenceLevel: adkResponse.updated_user_state.confidence,
        averageStressLevel: userState.stressLevel, // Use current as average for now
        averageConfidenceLevel: userState.confidence,
        improvementAreas: adkResponse.analysis.improvement_areas,
        strengths: [], // ADK doesn't provide strengths yet
        sessionProgress: Math.min(100, context.conversationHistory.length * 10)
      },
      textAnalysis: this.createBasicTextAnalysis(userInput, adkResponse.analysis)
    };
  }

  private async processWithLocalFallback(userInput: string, context: SessionContext): Promise<OrchestrationResult> {
    // Simple fallback implementation
    const { bossPersona } = context;
    
    const bossResponse = this.generateFallbackBossResponse(userInput, bossPersona);
    const guidance = this.generateFallbackGuidance(userInput);
    const analysis = this.generateFallbackAnalysis(context);
    const textAnalysis = this.generateFallbackTextAnalysis(userInput);

    return {
      bossResponse,
      guidance,
      analysis,
      textAnalysis
    };
  }

  private mapStressLevel(level: number): 'LOW' | 'MEDIUM' | 'HIGH' {
    if (level <= 30) return 'LOW';
    if (level <= 70) return 'MEDIUM';
    return 'HIGH';
  }

  private mapBackStressLevel(level: 'LOW' | 'MEDIUM' | 'HIGH'): number {
    switch (level) {
      case 'LOW': return 20;
      case 'MEDIUM': return 50;
      case 'HIGH': return 80;
      default: return 50;
    }
  }

  private buildContextString(context: SessionContext): string {
    const recentHistory = context.conversationHistory
      .slice(-3)
      .map(msg => `${msg.speaker}: ${msg.text}`)
      .join('\n');
    
    return `Recent conversation:\n${recentHistory}`;
  }

  private convertSuggestionsToGuidance(suggestions: string[]): GuidanceAction[] {
    return suggestions.map((suggestion, index) => ({
      type: 'general',
      message: suggestion,
      priority: index === 0 ? 'high' : 'medium'
    }));
  }

  private createBasicTextAnalysis(userInput: string, analysis: any): TextAnalysis {
    return {
      sentiment: {
        score: 0,
        magnitude: 0.5,
        confidence: 0.7
      },
      textQuality: {
        clarity: Math.max(30, Math.min(100, analysis.communication_effectiveness)),
        professionalism: Math.max(30, Math.min(100, analysis.user_performance_score)),
        politeness: 70,
        assertiveness: Math.max(30, Math.min(100, analysis.stress_management))
      },
      stressIndicators: {
        hesitationMarkers: [],
        punctuationDensity: 0.05,
        wordRepetition: 0.1
      },
      confidenceMarkers: {
        assertiveWords: [],
        uncertaintyWords: [],
        questionMarks: (userInput.match(/\?/g) || []).length
      },
      responseTime: 0
    };
  }

  private generateFallbackBossResponse(userInput: string, bossPersona: BossPersona): string {
    const responses = [
      "I see your point. Can you elaborate on that?",
      "That's interesting. What's your next step?",
      "I understand. How do you plan to handle this?",
      "Tell me more about your thinking on this.",
      "What do you think would be the best approach here?"
    ];
    
    const randomIndex = Math.floor(Math.random() * responses.length);
    return responses[randomIndex];
  }

  private generateFallbackGuidance(userInput: string): GuidanceAction[] {
    const guidance: GuidanceAction[] = [];
    
    if (userInput.length < 20) {
      guidance.push({
        type: 'general',
        message: 'Try to provide more detailed responses to show your thinking.',
        priority: 'medium'
      });
    }
    
    if (userInput.includes('um') || userInput.includes('uh')) {
      guidance.push({
        type: 'confidence_building',
        message: 'Avoid filler words like "um" and "uh" to sound more confident.',
        priority: 'high'
      });
    }
    
    if (!guidance.length) {
      guidance.push({
        type: 'general',
        message: 'Keep practicing clear and confident communication.',
        priority: 'low'
      });
    }
    
    return guidance;
  }

  private generateFallbackAnalysis(context: SessionContext): SessionAnalysis {
    return {
      currentStressLevel: context.userState.stressLevel,
      currentConfidenceLevel: context.userState.confidence,
      averageStressLevel: context.userState.stressLevel,
      averageConfidenceLevel: context.userState.confidence,
      improvementAreas: ['Communication clarity', 'Confidence building'],
      strengths: ['Engagement', 'Willingness to practice'],
      sessionProgress: Math.min(100, context.conversationHistory.length * 15)
    };
  }

  private generateFallbackTextAnalysis(userInput: string): TextAnalysis {
    const words = userInput.split(/\s+/);
    const questionMarks = (userInput.match(/\?/g) || []).length;
    
    return {
      sentiment: {
        score: 0.1,
        magnitude: 0.5,
        confidence: 0.6
      },
      textQuality: {
        clarity: Math.min(100, Math.max(30, 100 - words.length * 2)),
        professionalism: 60,
        politeness: 70,
        assertiveness: questionMarks > 1 ? 40 : 60
      },
      stressIndicators: {
        hesitationMarkers: (userInput.match(/\b(um|uh|well|like)\b/gi) || []),
        punctuationDensity: (userInput.match(/[!?.,;:]/g) || []).length / userInput.length,
        wordRepetition: 0.1
      },
      confidenceMarkers: {
        assertiveWords: (userInput.match(/\b(will|should|must|definitely)\b/gi) || []),
        uncertaintyWords: (userInput.match(/\b(maybe|perhaps|might|possibly)\b/gi) || []),
        questionMarks
      },
      responseTime: 0
    };
  }

  enableFallback(enabled: boolean): void {
    this.fallbackEnabled = enabled;
  }
}

// Export the main orchestration function
const orchestrator = new ADKBackendOrchestrator();

export async function orchestrateAgents(
  userInput: string,
  context: SessionContext
): Promise<OrchestrationResult> {
  return orchestrator.orchestrate(userInput, context);
}

export { orchestrator as adkOrchestrator };
