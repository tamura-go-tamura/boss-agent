// services/adk/orchestrator.ts
import type { 
  SessionContext, 
  OrchestrationResult, 
  ChatMessage
} from '@/types/adk.types';
import type { BossPersona, UserState } from '@/types/ai.types';
import { adkClient, type ADKTrainingRequest } from './client';

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
      maxTokens: ADKConfig.gemini.maxTokens,
      temperature: ADKConfig.gemini.temperature,
    });
    
    return response;
  }

  private buildBossPrompt(userInput: string, context: SessionContext): string {
    const { bossPersona, scenario, conversationHistory } = context;
    
    const recentHistory = conversationHistory.slice(-3).map(msg => 
      `${msg.speaker}: ${msg.text}`
    ).join('\n');

    return `You are roleplaying as ${bossPersona.name}, ${bossPersona.description}.

SCENARIO: ${scenario.description}
BOSS PERSONALITY: ${bossPersona.personality || 'Professional and direct'}
DIFFICULTY: ${bossPersona.difficulty}

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

    if (!analysis) {
      return [{
        type: 'general',
        message: 'Continue practicing your communication skills.',
        priority: 'low',
      }];
    }

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
    const avgStress = 50; // Simplified for now
    const avgConfidence = 50; // Simplified for now
    
    return {
      currentStressLevel: this.calculateStressLevel(textAnalysis),
      currentConfidenceLevel: this.calculateConfidenceLevel(textAnalysis),
      averageStressLevel: avgStress,
      averageConfidenceLevel: avgConfidence,
      improvementAreas: this.identifyImprovementAreas(textAnalysis),
      strengths: this.identifyStrengths(textAnalysis),
      sessionProgress: this.calculateProgress(conversationHistory),
    };
  }

  private calculateStressLevel(analysis?: TextAnalysis): number {
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

  private calculateConfidenceLevel(analysis?: TextAnalysis): number {
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

  private identifyImprovementAreas(analysis?: TextAnalysis): string[] {
    if (!analysis) return [];
    
    const areas: string[] = [];
    
    if (analysis.textQuality.professionalism < 60) areas.push('Professional Communication');
    if (analysis.textQuality.assertiveness < 50) areas.push('Assertiveness');
    if (analysis.confidenceMarkers.uncertaintyWords.length > 1) areas.push('Confident Language');
    if (analysis.stressIndicators.hesitationMarkers.length > 2) areas.push('Clear Expression');
    if (analysis.responseTime > 8000) areas.push('Response Speed');
    
    return areas;
  }

  private identifyStrengths(analysis?: TextAnalysis): string[] {
    if (!analysis) return [];
    
    const strengths: string[] = [];
    
    if (analysis.textQuality.politeness > 70) strengths.push('Politeness');
    if (analysis.textQuality.clarity > 70) strengths.push('Clear Communication');
    if (analysis.textQuality.professionalism > 70) strengths.push('Professional Tone');
    if (analysis.confidenceMarkers.assertiveWords.length > 1) strengths.push('Assertive Language');
    if (analysis.responseTime < 5000) strengths.push('Quick Response');
    
    return strengths;
  }

  private calculateProgress(history: ChatMessage[]): number {
    if (history.length < 2) return 0;
    
    // For now, return a simple progress calculation
    // This would be enhanced with actual historical analysis
    return Math.min(100, history.length * 10);
  }
}

/**
 * Text Analysis Agent - analyzes user input for various metrics
 */
class TextAnalysisAgent implements ADKAgent {
  id = 'text-analysis';
  name = 'Text Analyzer';
  type = 'analysis';

  async execute(userInput: string, context: SessionContext): Promise<TextAnalysis> {
    const analysis: TextAnalysis = {
      sentiment: this.analyzeSentiment(userInput),
      textQuality: this.analyzeTextQuality(userInput),
      stressIndicators: this.detectStressIndicators(userInput),
      confidenceMarkers: this.detectConfidenceMarkers(userInput),
      responseTime: context.userState.responseTime || 0,
    };

    return analysis;
  }

  private analyzeSentiment(text: string): SentimentAnalysis {
    // Simple sentiment analysis - can be replaced with more sophisticated ML models
    const positiveWords = ADKConfig.vocabulary.english.positive.concat(ADKConfig.vocabulary.japanese.positive);
    const negativeWords = ADKConfig.vocabulary.english.negative.concat(ADKConfig.vocabulary.japanese.negative);
    
    const words = text.toLowerCase().split(/\s+/);
    let positiveCount = 0;
    let negativeCount = 0;
    
    words.forEach(word => {
      if (positiveWords.some(pw => word.includes(pw))) positiveCount++;
      if (negativeWords.some(nw => word.includes(nw))) negativeCount++;
    });
    
    const totalSentimentWords = positiveCount + negativeCount;
    const score = totalSentimentWords > 0 ? (positiveCount - negativeCount) / totalSentimentWords : 0;
    
    return {
      score: Math.max(-1, Math.min(1, score)),
      magnitude: totalSentimentWords / words.length,
      confidence: totalSentimentWords > 0 ? 0.7 : 0.3,
    };
  }

  private analyzeTextQuality(text: string): TextQuality {
    const words = text.split(/\s+/);
    const sentences = text.split(/[.!?]/).filter(s => s.trim().length > 0);
    
    // Clarity - based on sentence length and word choice
    const avgWordsPerSentence = words.length / Math.max(1, sentences.length);
    const clarity = Math.max(0, Math.min(100, 100 - (avgWordsPerSentence - 15) * 2));
    
    // Professionalism - based on formal language markers
    const formalWords = ADKConfig.vocabulary.english.formal.concat(ADKConfig.vocabulary.japanese.formal);
    const casualWords = ADKConfig.vocabulary.english.casual || [];
    
    const formalCount = formalWords.reduce((count, word) => count + (text.toLowerCase().includes(word) ? 1 : 0), 0);
    const casualCount = casualWords.reduce((count, word) => count + (text.toLowerCase().includes(word) ? 1 : 0), 0);
    
    const professionalism = Math.max(0, Math.min(100, 50 + (formalCount * 10) - (casualCount * 15)));
    
    // Politeness - based on polite markers
    const politeMarkers = ADKConfig.vocabulary.english.polite.concat(ADKConfig.vocabulary.japanese.formal);
    const politeCount = politeMarkers.reduce((count, marker) => count + (text.toLowerCase().includes(marker) ? 1 : 0), 0);
    const politeness = Math.min(100, 40 + politeCount * 20);
    
    // Assertiveness - based on confident language
    const assertiveWords = ADKConfig.vocabulary.english.assertive.concat(ADKConfig.vocabulary.japanese.assertive);
    const tentativeWords = ADKConfig.vocabulary.english.tentative.concat(ADKConfig.vocabulary.japanese.tentative);
    
    const assertiveCount = assertiveWords.reduce((count, word) => count + (text.toLowerCase().includes(word) ? 1 : 0), 0);
    const tentativeCount = tentativeWords.reduce((count, word) => count + (text.toLowerCase().includes(word) ? 1 : 0), 0);
    
    const assertiveness = Math.max(0, Math.min(100, 50 + (assertiveCount * 15) - (tentativeCount * 10)));
    
    return {
      clarity,
      professionalism,
      politeness,
      assertiveness,
    };
  }

  private detectStressIndicators(text: string): StressIndicators {
    // Hesitation markers
    const hesitationPattern = new RegExp(`\\b(${ADKConfig.vocabulary.english.hesitation.concat(ADKConfig.vocabulary.japanese.hesitation).join('|')})\\b`, 'gi');
    const hesitationMarkers = text.match(hesitationPattern) || [];
    
    // Punctuation density (excessive use might indicate stress)
    const punctuationCount = (text.match(/[!?.,;:]/g) || []).length;
    const punctuationDensity = punctuationCount / Math.max(1, text.length);
    
    // Word repetition (sign of nervous speech)
    const words = text.toLowerCase().split(/\s+/);
    const wordCounts = words.reduce((counts, word) => {
      counts[word] = (counts[word] || 0) + 1;
      return counts;
    }, {} as Record<string, number>);
    
    const repeatedWords = Object.values(wordCounts).filter(count => count > 1);
    const wordRepetition = repeatedWords.length / Math.max(1, words.length);
    
    return {
      hesitationMarkers,
      punctuationDensity,
      wordRepetition,
    };
  }

  private detectConfidenceMarkers(text: string): ConfidenceMarkers {
    // Assertive words
    const assertivePattern = new RegExp(`\\b(${ADKConfig.vocabulary.english.assertive.concat(ADKConfig.vocabulary.japanese.assertive).join('|')})\\b`, 'gi');
    const assertiveWords = text.match(assertivePattern) || [];
    
    // Uncertainty words
    const uncertaintyPattern = new RegExp(`\\b(${ADKConfig.vocabulary.english.tentative.concat(ADKConfig.vocabulary.japanese.tentative).join('|')})\\b`, 'gi');
    const uncertaintyWords = text.match(uncertaintyPattern) || [];
    
    // Question marks (too many might indicate uncertainty)
    const questionMarks = (text.match(/\?/g) || []).length;
    
    return {
      assertiveWords,
      uncertaintyWords,
      questionMarks,
    };
  }
}

/**
 * ADK Multi-Agent Orchestrator
 */
class ADKOrchestrator {
  private agents: ADKAgent[] = [
    new BossResponseAgent(),
    new GuidanceAgent(),
    new AnalyticsAgent(),
    new TextAnalysisAgent(),
  ];

  async orchestrate(userInput: string, context: SessionContext): Promise<OrchestrationResult> {
    try {
      // First, analyze the text
      const textAnalysisAgent = this.agents.find(agent => agent.id === 'text-analysis') as TextAnalysisAgent;
      const textAnalysis = await textAnalysisAgent.execute(userInput, context);
      
      // Update context with text analysis
      const updatedContext = { ...context, textAnalysis };
      
      // Execute remaining agents in parallel for efficiency
      const [bossResponse, guidance, analysis] = await Promise.all([
        this.agents[0].execute(userInput, updatedContext) as Promise<string>,
        this.agents[1].execute(userInput, updatedContext) as Promise<GuidanceAction[]>,
        this.agents[2].execute(userInput, updatedContext) as Promise<SessionAnalysis>,
      ]);

      return {
        bossResponse,
        guidance,
        analysis,
        textAnalysis,
      };
    } catch (error) {
      console.error('Error in ADK orchestration:', error);
      
      // Fallback responses
      const fallbackTextAnalysis: TextAnalysis = {
        sentiment: { score: 0, magnitude: 0, confidence: 0.3 },
        textQuality: { clarity: 50, professionalism: 50, politeness: 50, assertiveness: 50 },
        stressIndicators: { hesitationMarkers: [], punctuationDensity: 0, wordRepetition: 0 },
        confidenceMarkers: { assertiveWords: [], uncertaintyWords: [], questionMarks: 0 },
        responseTime: 0,
      };
      
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
        textAnalysis: fallbackTextAnalysis,
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
