import { envConfig } from '@/config/env';

// Natural Language AI client configuration
const API_KEY = envConfig.GOOGLE_API_KEY;
const BASE_URL = 'https://language.googleapis.com/v1';

/**
 * Sentiment analysis result
 */
export interface SentimentResult {
  score: number; // -1.0 to 1.0
  magnitude: number; // 0.0 to infinity
  label: string; // 'POSITIVE', 'NEGATIVE', or 'NEUTRAL'
}

/**
 * Text quality metrics
 */
export interface TextQualityMetrics {
  politeness: number; // 0-100
  clarity: number; // 0-100
  professionalism: number; // 0-100
  assertiveness: number; // 0-100
  politenessLevel: number; // 0-100
  clarityScore: number; // 0-100
  professionalismLevel: number; // 0-100
  emotionalTone: 'neutral' | 'confident' | 'defensive' | 'apologetic';
  keywordAnalysis: {
    positiveWords: string[];
    negativeWords: string[];
    weakenedLanguage: string[];
  };
}

/**
 * Stress indicators
 */
export interface StressIndicators {
  hesitationMarkers: string[];
  repetitivePatterns: string[];
  punctuationDensity: number;
  avgWordLength: number;
}

/**
 * Confidence markers
 */
export interface ConfidenceMarkers {
  assertiveWords: string[];
  uncertaintyWords: string[];
  questionMarks: number;
  exclamationMarks: number;
}

/**
 * Complete analysis result
 */
export interface TextAnalysisResult {
  sentiment: SentimentResult;
  textQuality: TextQualityMetrics;
  stressIndicators: StressIndicators;
  confidenceMarkers: ConfidenceMarkers;
  responseTime: number;
  textLength: number;
  entities: any[];
  formalityLevel: number;
  confidenceIndicators: string[];
  professionalismScore: number;
}

/**
 * User input analysis result for ADK integration
 */
export interface UserInputAnalysis {
  sentiment: SentimentResult;
  textQuality: TextQualityMetrics;
  stressIndicators: string[];
  confidenceMarkers: string[];
  responseTime: number;
  textLength: number;
  formalityLevel: number;
  entities: any[];
  overallConfidence: number;
  stressLevel: number;
}

/**
 * Analyze user input for sentiment, stress, and confidence
 */
export async function analyzeUserInput(
  text: string,
  responseTime: number = 0
): Promise<TextAnalysisResult> {
  try {
    // Get sentiment analysis from Google Cloud Natural Language API
    const sentiment = await getSentimentAnalysis(text);
    
    // Perform local text analysis
    const textQuality = analyzeTextQuality(text);
    const stressIndicators = detectStressIndicators(text, responseTime);
    const confidenceMarkers = detectConfidenceMarkers(text);

    return {
      sentiment,
      textQuality,
      stressIndicators,
      confidenceMarkers,
      responseTime,
      textLength: text.length,
      entities: [],
      formalityLevel: calculateFormalityLevel(text),
      confidenceIndicators: confidenceMarkers.assertiveWords,
      professionalismScore: textQuality.professionalism,
    };
  } catch (error) {
    console.error('Error analyzing user input:', error);
    
    // Fallback to local analysis if API fails
    const sentiment = getFallbackSentiment(text);
    const textQuality = analyzeTextQuality(text);
    const stressIndicators = detectStressIndicators(text, responseTime);
    const confidenceMarkers = detectConfidenceMarkers(text);

    return {
      sentiment,
      textQuality,
      stressIndicators,
      confidenceMarkers,
      responseTime,
      textLength: text.length,
      entities: [],
      formalityLevel: calculateFormalityLevel(text),
      confidenceIndicators: confidenceMarkers.assertiveWords,
      professionalismScore: textQuality.professionalism,
    };
  }
}

/**
 * Get sentiment analysis from Google Cloud Natural Language API
 */
async function getSentimentAnalysis(text: string): Promise<SentimentResult> {
  if (!API_KEY) {
    throw new Error('Google API key not configured');
  }

  const response = await fetch(`${BASE_URL}/documents:analyzeSentiment?key=${API_KEY}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      document: {
        type: 'PLAIN_TEXT',
        content: text,
      },
      encodingType: 'UTF8',
    }),
  });

  if (!response.ok) {
    throw new Error(`API request failed: ${response.statusText}`);
  }

  const data = await response.json();
  const score = data.documentSentiment.score;
  
  let label = 'NEUTRAL';
  if (score > 0.1) label = 'POSITIVE';
  else if (score < -0.1) label = 'NEGATIVE';

  return {
    score: data.documentSentiment.score,
    magnitude: data.documentSentiment.magnitude,
    label,
  };
}

/**
 * Fallback sentiment analysis using keyword matching
 */
function getFallbackSentiment(text: string): SentimentResult {
  const lowerText = text.toLowerCase();
  
  const positiveWords = ['good', 'great', 'excellent', 'wonderful', 'amazing', 'fantastic', 'perfect', 'love', 'like', 'appreciate', 'thank'];
  const negativeWords = ['bad', 'terrible', 'awful', 'horrible', 'hate', 'dislike', 'wrong', 'problem', 'issue', 'difficult', 'hard'];
  
  let positiveCount = 0;
  let negativeCount = 0;
  
  positiveWords.forEach(word => {
    if (lowerText.includes(word)) positiveCount++;
  });
  
  negativeWords.forEach(word => {
    if (lowerText.includes(word)) negativeCount++;
  });
  
  const totalWords = text.split(' ').length;
  const score = (positiveCount - negativeCount) / Math.max(totalWords / 10, 1);
  const magnitude = (positiveCount + negativeCount) / Math.max(totalWords / 10, 1);
  
  let label = 'NEUTRAL';
  if (score > 0.1) label = 'POSITIVE';
  else if (score < -0.1) label = 'NEGATIVE';

  return {
    score: Math.max(-1, Math.min(1, score)),
    magnitude: Math.max(0, magnitude),
    label,
  };
}

/**
 * Analyze text quality metrics
 */
function analyzeTextQuality(text: string): TextQualityMetrics {
  const lowerText = text.toLowerCase();
  
  // Politeness indicators
  const politeWords = ['please', 'thank you', 'sorry', 'excuse me', 'could you', 'would you', 'may i'];
  const politeCount = politeWords.filter(word => lowerText.includes(word)).length;
  const politeness = Math.min(100, (politeCount / politeWords.length) * 100 + 40);
  
  // Clarity indicators (sentence structure, grammar approximation)
  const sentences = text.split(/[.!?]/).filter(s => s.trim().length > 0);
  const avgSentenceLength = sentences.reduce((sum, s) => sum + s.split(' ').length, 0) / sentences.length;
  const clarity = Math.max(0, Math.min(100, 100 - Math.abs(avgSentenceLength - 15) * 3));
  
  // Professionalism indicators
  const professionalWords = ['regarding', 'concerning', 'furthermore', 'however', 'therefore', 'consequently'];
  const casualWords = ['yeah', 'ok', 'cool', 'awesome', 'stuff', 'things', 'kinda', 'sorta'];
  const professionalCount = professionalWords.filter(word => lowerText.includes(word)).length;
  const casualCount = casualWords.filter(word => lowerText.includes(word)).length;
  const professionalism = Math.max(0, Math.min(100, 60 + (professionalCount * 10) - (casualCount * 15)));
  
  // Assertiveness indicators
  const assertiveWords = ['will', 'must', 'should', 'need', 'require', 'expect', 'demand'];
  const tentativeWords = ['maybe', 'perhaps', 'might', 'could', 'possibly', 'probably'];
  const assertiveCount = assertiveWords.filter(word => lowerText.includes(word)).length;
  const tentativeCount = tentativeWords.filter(word => lowerText.includes(word)).length;
  const assertiveness = Math.max(0, Math.min(100, 50 + (assertiveCount * 15) - (tentativeCount * 10)));

  // Keyword analysis
  const positiveWords = ['excellent', 'great', 'wonderful', 'perfect', 'outstanding'];
  const negativeWords = ['terrible', 'awful', 'horrible', 'bad', 'worst'];
  const weakWords = ['maybe', 'perhaps', 'sort of', 'kind of', 'i think'];

  const keywordAnalysis = {
    positiveWords: positiveWords.filter(word => lowerText.includes(word)),
    negativeWords: negativeWords.filter(word => lowerText.includes(word)),
    weakenedLanguage: weakWords.filter(word => lowerText.includes(word)),
  };

  // Emotional tone detection
  let emotionalTone: 'neutral' | 'confident' | 'defensive' | 'apologetic' = 'neutral';
  if (lowerText.includes('sorry') || lowerText.includes('apologize')) {
    emotionalTone = 'apologetic';
  } else if (assertiveness > 70) {
    emotionalTone = 'confident';
  } else if (lowerText.includes('but') || lowerText.includes('however')) {
    emotionalTone = 'defensive';
  }
  
  return {
    politeness,
    clarity,
    professionalism,
    assertiveness,
    politenessLevel: politeness,
    clarityScore: clarity,
    professionalismLevel: professionalism,
    emotionalTone,
    keywordAnalysis,
  };
}

/**
 * Detect stress indicators in text
 */
function detectStressIndicators(text: string, responseTime: number): StressIndicators {
  const lowerText = text.toLowerCase();
  
  // Hesitation markers
  const hesitationPatterns = ['um', 'uh', 'er', 'ah', 'well', '...', 'i mean', 'you know', 'like'];
  const hesitationMarkers = hesitationPatterns.filter(pattern => lowerText.includes(pattern));
  
  // Repetitive patterns (simple detection)
  const words = text.split(/\s+/);
  const wordCounts: { [key: string]: number } = {};
  words.forEach(word => {
    const cleanWord = word.toLowerCase().replace(/[^a-z]/g, '');
    if (cleanWord.length > 2) {
      wordCounts[cleanWord] = (wordCounts[cleanWord] || 0) + 1;
    }
  });
  
  const repetitivePatterns = Object.entries(wordCounts)
    .filter(([_, count]) => count > 2)
    .map(([word, _]) => word);
  
  // Punctuation density
  const punctuationCount = (text.match(/[!@#$%^&*(),.?":{}|<>]/g) || []).length;
  const punctuationDensity = punctuationCount / text.length;
  
  // Average word length (stress can lead to shorter or longer words)
  const avgWordLength = words.reduce((sum, word) => sum + word.length, 0) / words.length;
  
  return {
    hesitationMarkers,
    repetitivePatterns,
    punctuationDensity,
    avgWordLength,
  };
}

/**
 * Detect confidence markers in text
 */
function detectConfidenceMarkers(text: string): ConfidenceMarkers {
  const lowerText = text.toLowerCase();
  
  // Assertive words that indicate confidence
  const assertivePatterns = ['definitely', 'certainly', 'absolutely', 'confident', 'sure', 'positive', 'know', 'understand', 'clear'];
  const assertiveWords = assertivePatterns.filter(word => lowerText.includes(word));
  
  // Uncertainty words that indicate lack of confidence
  const uncertaintyPatterns = ['maybe', 'perhaps', 'not sure', 'think', 'guess', 'probably', 'might', 'possibly', 'unsure'];
  const uncertaintyWords = uncertaintyPatterns.filter(word => lowerText.includes(word));
  
  // Count question marks and exclamation marks
  const questionMarks = (text.match(/\?/g) || []).length;
  const exclamationMarks = (text.match(/!/g) || []).length;
  
  return {
    assertiveWords,
    uncertaintyWords,
    questionMarks,
    exclamationMarks,
  };
}

/**
 * Calculate formality level of text
 */
function calculateFormalityLevel(text: string): number {
  const lowerText = text.toLowerCase();
  
  const formalWords = ['furthermore', 'however', 'consequently', 'therefore', 'regarding', 'concerning'];
  const informalWords = ['yeah', 'nah', 'cool', 'awesome', 'stuff', 'things'];
  
  const formalCount = formalWords.filter(word => lowerText.includes(word)).length;
  const informalCount = informalWords.filter(word => lowerText.includes(word)).length;
  
  const baseScore = 50;
  const formalityScore = baseScore + (formalCount * 15) - (informalCount * 15);
  
  return Math.max(0, Math.min(100, formalityScore));
}
