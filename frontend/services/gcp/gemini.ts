import { GoogleGenerativeAI } from '@google/generative-ai';
import { envConfig } from '@/config/env';
import { BossPersona } from '@/types/ai.types';

// Initialize Gemini AI with fallback handling
const isValidApiKey = envConfig.GEMINI_API_KEY && !envConfig.GEMINI_API_KEY.startsWith('dummy');
const genAI = isValidApiKey ? new GoogleGenerativeAI(envConfig.GEMINI_API_KEY) : null;

/**
 * Generate boss response using Gemini API or fallback responses
 */
export async function generateBossResponse(
  userMessage: string,
  bossPersona: BossPersona,
  conversationHistory: Array<{ role: 'user' | 'assistant'; content: string }>,
  userState?: {
    stressLevel: number;
    confidenceLevel: number;
    responseTime: number;
  }
): Promise<string> {
  // Use fallback responses if API key is not valid (development mode)
  if (!genAI || !isValidApiKey) {
    return generateFallbackResponse(userMessage, bossPersona, userState);
  }

  try {
    const model = genAI.getGenerativeModel({ model: 'gemini-pro' });

    // Build context-aware prompt
    const systemPrompt = `あなたは${bossPersona.name}として振る舞ってください。${bossPersona.description}という人物です。以下があなたの特徴です：
- 性格：${bossPersona.personality || '専門的'}
- コミュニケーションスタイル：${bossPersona.communicationStyle}
- 難易度レベル：${bossPersona.difficulty}
- ストレス要因：${bossPersona.stressTriggers?.join(', ') || '特になし'}
- 好む対応：${bossPersona.preferredResponses?.join(', ') || '専門的な対応'}

状況：これはコミュニケーション訓練のシミュレーションです。職場でのこの上司キャラクターとして返答してください。全ての応答は日本語で行ってください。

${userState ? `現在のユーザー状態：
- ストレスレベル：${userState.stressLevel}/100
- 自信レベル：${userState.confidenceLevel}/100
- 応答時間：${userState.responseTime}ms

ユーザーの現在の状態に基づいて応答を調整してください。ストレスが高い場合（>70）は少しサポート的に、過度に自信がある場合（ストレス<30、自信>80）は適切に挑戦的に対応してください。` : ''}

会話履歴：
${conversationHistory.map(msg => `${msg.role === 'user' ? 'ユーザー' : '上司'}: ${msg.content}`).join('\n')}

ユーザー：${userMessage}

${bossPersona.name}として応答してください。現実的で職場に適した、キャラクターに忠実な応答をしてください。応答は2-3文に制限してください。必ず日本語で応答してください。`;

    const result = await model.generateContent(systemPrompt);
    const response = await result.response;
    return response.text();

  } catch (error) {
    console.error('Error generating boss response, using fallback:', error);
    return generateFallbackResponse(userMessage, bossPersona, userState);
  }
}

/**
 * Generate fallback response when API is unavailable (development mode)
 */
function generateFallbackResponse(
  userMessage: string,
  bossPersona: BossPersona,
  userState?: {
    stressLevel: number;
    confidenceLevel: number;
    responseTime: number;
  }
): string {
  const messageKeywords = userMessage.toLowerCase();
  
  // Boss personality-based responses
  const responses = {
    supportive: [
      "ご報告いただき、ありがとうございます。一緒に解決策を考えましょう。",
      "良い指摘ですね。どのように進めるのが良いと思いますか？",
      "よく考えてくれているのが分かります。次のステップは何でしょうか？",
      "アップデートありがとうございます。何かサポートが必要でしたら言ってください。"
    ],
    demanding: [
      "もっと詳細が必要です。具体的にどのような行動を取っているのですか？",
      "それでは不十分です。明日までにより良い結果を期待しています。",
      "時間はお金です。これを迅速に解決するつもりですか？",
      "これはもう終わっているべきでした。何が遅れの原因ですか？"
    ],
    micromanager: [
      "あなたのプロセスの各ステップを詳しく説明してください。",
      "マーケティングに確認しましたか？法務は？経理はどうですか？",
      "進捗について1時間ごとに報告を送ってください。",
      "進める前に、すべて私が確認したいと思います。"
    ],
    'passive-aggressive': [
      "へぇ、それは...面白いですね。そういう対処法もあるのですね。",
      "あなたが何をしているかよく分かっていると思いますが、こんなことは考えませんでしたか...？",
      "まあ、それがベストだと思うなら。結果を見てみましょう。",
      "前回よりうまくいくことを願います。"
    ],
    volatile: [
      "本気で言っているのですか？これは完全に受け入れられません！",
      "何回説明すれば分かるのですか？！",
      "こういうことが私をイライラさせるんです！",
      "今すぐ、しっかりしてください！"
    ],
    analytical: [
      "この決定を支持するデータを見せてください。",
      "成功を測定するためにどのような指標を使っていますか？",
      "進める前に詳細なコストベネフィット分析が必要です。",
      "数値を見せてください。そうすれば次のステップを議論できます。"
    ]
  };

  const bossResponses = responses[bossPersona.id as keyof typeof responses] || responses.supportive;
  
  // Select response based on message content and user state
  let selectedResponse;
  
  if (messageKeywords.includes('問題') || messageKeywords.includes('課題') || messageKeywords.includes('トラブル')) {
    selectedResponse = bossResponses[Math.floor(Math.random() * bossResponses.length)];
  } else if (messageKeywords.includes('完了') || messageKeywords.includes('終了') || messageKeywords.includes('できました')) {
    selectedResponse = bossPersona.id === 'supportive' 
      ? "素晴らしい仕事です！次のアジェンダは何ですか？"
      : "やっとですね。なぜこんなに時間がかかったのですか？";
  } else {
    selectedResponse = bossResponses[Math.floor(Math.random() * bossResponses.length)];
  }

  // Add stress-based modifications
  if (userState && userState.stressLevel > 70) {
    if (bossPersona.id === 'demanding' || bossPersona.id === 'volatile') {
      selectedResponse += " それから、冷静になってください。";
    }
  }

  return selectedResponse;
}

/**
 * Generate dynamic boss persona using Gemini API
 */
export async function generateBossPersona(
  type: 'supportive' | 'demanding' | 'micromanager' | 'visionary' | 'analytical',
  difficultyLevel: '初級' | '中級' | '上級',
  industry?: string
): Promise<Partial<BossPersona>> {
  if (!genAI || !isValidApiKey) {
    // Return fallback persona for development
    return {
      name: `Demo ${type.charAt(0).toUpperCase() + type.slice(1)} Boss`,
      personality: `A ${type} manager for training purposes`,
      communicationStyle: `${type} communication style`,
      description: `A ${difficultyLevel} level ${type} boss for communication training`
    };
  }

  try {
    const model = genAI.getGenerativeModel({ model: 'gemini-pro' });

    const prompt = `Generate a realistic boss persona for communication training with the following specifications:
- Type: ${type}
- Difficulty Level: ${difficultyLevel}
- Industry: ${industry || 'general business'}

Please provide a JSON response with the following structure:
{
  "name": "Boss name (e.g., 'Sarah Chen', 'Marcus Thompson')",
  "personality": "Brief personality description",
  "communicationStyle": "How they communicate",
  "stressTriggers": ["list", "of", "things", "that", "stress", "them"],
  "preferredResponses": ["types", "of", "responses", "they", "appreciate"],
  "commonScenarios": ["typical", "workplace", "situations", "they", "create"],
  "challengeLevel": "Description of what makes this boss challenging"
}

Make it realistic and appropriate for ${difficultyLevel} level training.`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();
    
    // Extract JSON from response
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      return JSON.parse(jsonMatch[0]);
    }
    
    throw new Error('Failed to parse generated persona');

  } catch (error) {
    console.error('Error generating boss persona:', error);
    throw new Error('Failed to generate boss persona');
  }
}

/**
 * Analyze conversation for insights using Gemini API
 */
export async function analyzeConversation(
  conversationHistory: Array<{ role: 'user' | 'assistant'; content: string; timestamp: Date }>,
  bossPersona: BossPersona
): Promise<{
  overallScore: number;
  strengths: string[];
  improvements: string[];
  communicationTone: 'professional' | 'casual' | 'formal' | 'inappropriate';
  responseQuality: number;
  suggestions: string[];
}> {
  if (!genAI || !isValidApiKey) {
    // Return fallback analysis for development
    return {
      overallScore: 75,
      strengths: ["Professional tone", "Clear communication"],
      improvements: ["Be more specific", "Ask follow-up questions"],
      communicationTone: 'professional',
      responseQuality: 75,
      suggestions: ["Try to be more specific in your responses", "Ask clarifying questions when needed"]
    };
  }

  try {
    const model = genAI.getGenerativeModel({ model: 'gemini-pro' });

    const conversationText = conversationHistory
      .map(msg => `${msg.role}: ${msg.content}`)
      .join('\n');

    const prompt = `Analyze this workplace communication training conversation between a user and ${bossPersona.name} (${bossPersona.description}).

Conversation:
${conversationText}

Boss Context:
- Description: ${bossPersona.description}
- Personality: ${bossPersona.personality || 'Professional'}
- Communication Style: ${bossPersona.communicationStyle}

Please provide a JSON analysis with:
{
  "overallScore": number (0-100),
  "strengths": ["list of things the user did well"],
  "improvements": ["specific areas for improvement"],
  "communicationTone": "professional|casual|formal|inappropriate",
  "responseQuality": number (0-100),
  "suggestions": ["specific actionable suggestions for better communication"]
}

Focus on workplace communication effectiveness, professionalism, and appropriateness for this type of boss.`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();
    
    // Extract JSON from response
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      return JSON.parse(jsonMatch[0]);
    }
    
    throw new Error('Failed to parse conversation analysis');

  } catch (error) {
    console.error('Error analyzing conversation:', error);
    throw new Error('Failed to analyze conversation');
  }
}

/**
 * Generate smart response suggestions using Gemini API
 */
export async function generateResponseSuggestions(
  userMessage: string,
  bossMessage: string,
  bossPersona: BossPersona,
  context: 'initial_response' | 'follow_up' | 'difficult_situation'
): Promise<string[]> {
  if (!genAI || !isValidApiKey) {
    // Return fallback suggestions for development
    return [
      "I understand and will work on that.",
      "Thank you for the feedback. I'll make sure to address this.",
      "I appreciate you bringing this to my attention. How would you like me to proceed?"
    ];
  }

  try {
    const model = genAI.getGenerativeModel({ model: 'gemini-pro' });

    const prompt = `Given this workplace communication scenario, suggest 3 appropriate response options for the user.

Boss (${bossPersona.name} - ${bossPersona.description}): "${bossMessage}"
User's previous message: "${userMessage}"

Boss characteristics:
- Personality: ${bossPersona.personality || 'Professional'}
- Communication Style: ${bossPersona.communicationStyle}
- Preferred Responses: ${bossPersona.preferredResponses?.join(', ') || 'Professional responses'}

Context: ${context}

Provide 3 response suggestions:
1. A professional and safe response
2. A more confident/assertive response
3. A diplomatic/relationship-building response

Format as JSON array: ["response1", "response2", "response3"]

Each response should be 1-2 sentences and workplace-appropriate.`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();
    
    // Extract JSON array from response
    const jsonMatch = text.match(/\[[\s\S]*\]/);
    if (jsonMatch) {
      return JSON.parse(jsonMatch[0]);
    }
    
    throw new Error('Failed to parse response suggestions');

  } catch (error) {
    console.error('Error generating response suggestions:', error);
    return [
      "I understand and will work on that.",
      "Thank you for the feedback. I'll make sure to address this.",
      "I appreciate you bringing this to my attention. How would you like me to proceed?"
    ];
  }
}

/**
 * Generic response generation function for orchestrator
 */
export async function generateResponse(
  prompt: string,
  options?: {
    maxTokens?: number;
    temperature?: number;
  }
): Promise<string> {
  if (!genAI || !isValidApiKey) {
    throw new Error('Gemini API not available in development mode');
  }

  try {
    const model = genAI.getGenerativeModel({ model: 'gemini-pro' });
    
    const result = await model.generateContent(prompt);
    const response = await result.response;
    return response.text();
  } catch (error) {
    console.error('Error generating response:', error);
    throw new Error('Failed to generate response');
  }
}
