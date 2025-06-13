// config/adk.config.ts

export const ADKConfig = {
  gemini: {
    maxTokens: 200,
    temperature: 0.7,
    model: 'gemini-pro'
  },
  analysis: {
    maxInputLength: 1000,
    stressThresholds: {
      low: 30,
      medium: 60,
      high: 80
    },
    confidenceThresholds: {
      low: 30,
      medium: 60,
      high: 80
    }
  },
  performance: {
    maxResponseTime: 5000,
    parallelExecution: true,
    cacheEnabled: true
  },
  vocabulary: {
    japanese: {
      positive: ['良い', '素晴らしい', '素敵', '成功', '満足', '嬉しい', '順調'] as string[],
      negative: ['悪い', '問題', '心配', '困った', '失敗', '不満', '厳しい'] as string[],
      formal: ['いただ', 'ください', 'させて', 'お願い', 'ありがとう', 'すみません', 'お疲れ様'] as string[],
      hesitation: ['えー', 'あの', 'その', 'まあ', 'ちょっと'] as string[],
      assertive: ['します', 'できます', '確実に', '間違いなく', '必ず'] as string[],
      tentative: ['かもしれ', '多分', 'たぶん', '思います', 'のような'] as string[]
    },
    english: {
      positive: ['good', 'great', 'excellent', 'wonderful', 'fantastic', 'pleased', 'happy', 'successful'] as string[],
      negative: ['bad', 'terrible', 'awful', 'disappointing', 'frustrated', 'worried', 'concerned', 'problem'] as string[],
      formal: ['please', 'would', 'could', 'thank', 'appreciate', 'understand', 'respect'] as string[],
      casual: ['yeah', 'ok', 'sure', 'cool', 'awesome'] as string[],
      hesitation: ['um', 'uh', 'er', 'well', 'so', 'like'] as string[],
      assertive: ['will', 'can', 'believe', 'confident', 'certain', 'definite', 'absolutely', 'definitely'] as string[],
      tentative: ['might', 'maybe', 'perhaps', 'possibly', 'think', 'guess', 'suppose', 'probably'] as string[],
      polite: ['please', 'thank you', 'excuse me', 'sorry', 'appreciate'] as string[]
    }
  }
};
