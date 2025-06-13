'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';

interface BossEmotionalAnalyzerProps {
  bossType: string;
  stressLevel: number; // 0-100
  userConfidence: number; // 0-100
  lastUserMessage?: string;
  lastBossMessage?: string;
  conversationTurn: number;
  responseTime?: number; // milliseconds
  sessionDuration: number;
}

interface MoodState {
  emoji: string;
  description: string;
  color: string;
  bgColor: string;
  intensity: number; // 0-100
}

interface EmotionalState {
  primary: string;
  secondary: string;
  intensity: number;
  stability: number;
}

interface VisualizationData {
  timestamp: number;
  emotion: string;
  intensity: number;
  trigger: string;
}

interface BossPersonality {
  name: string;
  baseEmoji: string;
  moods: {
    [key: string]: MoodState;
  };
}

const BOSS_PERSONALITIES: Record<string, BossPersonality> = {
  supportive: {
    name: '支援的な上司',
    baseEmoji: '😊',
    moods: {
      pleased: { emoji: '😊', description: '満足', color: 'text-green-600', bgColor: 'bg-green-50', intensity: 20 },
      encouraging: { emoji: '👍', description: '励まし', color: 'text-blue-600', bgColor: 'bg-blue-50', intensity: 40 },
      concerned: { emoji: '🤔', description: '心配', color: 'text-yellow-600', bgColor: 'bg-yellow-50', intensity: 60 },
      disappointed: { emoji: '😔', description: 'がっかり', color: 'text-orange-600', bgColor: 'bg-orange-50', intensity: 80 },
    }
  },
  demanding: {
    name: '要求の厳しい上司',
    baseEmoji: '😤',
    moods: {
      satisfied: { emoji: '😌', description: '満足', color: 'text-green-600', bgColor: 'bg-green-50', intensity: 20 },
      expectant: { emoji: '🤨', description: '期待', color: 'text-blue-600', bgColor: 'bg-blue-50', intensity: 40 },
      impatient: { emoji: '😤', description: 'いらいら', color: 'text-yellow-600', bgColor: 'bg-yellow-50', intensity: 60 },
      angry: { emoji: '😠', description: '怒り', color: 'text-red-600', bgColor: 'bg-red-50', intensity: 80 },
    }
  },
  micromanager: {
    name: 'マイクロマネージャー',
    baseEmoji: '🔍',
    moods: {
      focused: { emoji: '🔍', description: '集中', color: 'text-blue-600', bgColor: 'bg-blue-50', intensity: 30 },
      analyzing: { emoji: '🤓', description: '分析中', color: 'text-purple-600', bgColor: 'bg-purple-50', intensity: 50 },
      nitpicking: { emoji: '😒', description: 'あら探し', color: 'text-yellow-600', bgColor: 'bg-yellow-50', intensity: 70 },
      frustrated: { emoji: '😤', description: '苛立ち', color: 'text-red-600', bgColor: 'bg-red-50', intensity: 85 },
    }
  },
  'passive-aggressive': {
    name: '受動攻撃的な上司',
    baseEmoji: '😏',
    moods: {
      neutral: { emoji: '😐', description: '中立', color: 'text-gray-600', bgColor: 'bg-gray-50', intensity: 25 },
      sarcastic: { emoji: '😏', description: '皮肉', color: 'text-purple-600', bgColor: 'bg-purple-50', intensity: 45 },
      passive: { emoji: '🙄', description: '消極的', color: 'text-yellow-600', bgColor: 'bg-yellow-50', intensity: 65 },
      aggressive: { emoji: '😤', description: '攻撃的', color: 'text-red-600', bgColor: 'bg-red-50', intensity: 85 },
    }
  },
  volatile: {
    name: '気分の激しい上司',
    baseEmoji: '🌪️',
    moods: {
      calm: { emoji: '😌', description: '穏やか', color: 'text-green-600', bgColor: 'bg-green-50', intensity: 20 },
      excited: { emoji: '🤩', description: '興奮', color: 'text-blue-600', bgColor: 'bg-blue-50', intensity: 60 },
      irritated: { emoji: '😠', description: '苛立ち', color: 'text-orange-600', bgColor: 'bg-orange-50', intensity: 80 },
      explosive: { emoji: '🤬', description: '爆発', color: 'text-red-600', bgColor: 'bg-red-50', intensity: 95 },
    }
  },
  analytical: {
    name: '分析的な上司',
    baseEmoji: '📊',
    moods: {
      thoughtful: { emoji: '🤔', description: '思慮深い', color: 'text-blue-600', bgColor: 'bg-blue-50', intensity: 30 },
      engaged: { emoji: '💡', description: '関心', color: 'text-green-600', bgColor: 'bg-green-50', intensity: 45 },
      skeptical: { emoji: '🧐', description: '懐疑的', color: 'text-yellow-600', bgColor: 'bg-yellow-50', intensity: 65 },
      dismissive: { emoji: '😑', description: '軽視', color: 'text-red-600', bgColor: 'bg-red-50', intensity: 80 },
    }
  }
};

const EMOTION_COLORS = {
  喜び: '#10B981',
  満足: '#059669',
  落ち着き: '#3B82F6',
  期待: '#6366F1',
  疑問: '#8B5CF6',
  心配: '#F59E0B',
  失望: '#F97316',
  いらだち: '#EF4444',
  怒り: '#DC2626',
  激怒: '#991B1B',
  驚き: '#EC4899',
  混乱: '#6B7280',
};

const BOSS_EMOTION_PATTERNS = {
  supportive: {
    baseline: ['満足', '落ち着き', '期待'],
    triggers: {
      shortResponse: '心配',
      longResponse: '満足',
      quickResponse: '期待',
      slowResponse: '心配',
      highStress: '心配',
      lowConfidence: '期待'
    }
  },
  demanding: {
    baseline: ['期待', '疑問', 'いらだち'],
    triggers: {
      shortResponse: 'いらだち',
      longResponse: '満足',
      quickResponse: '満足',
      slowResponse: '怒り',
      highStress: 'いらだち',
      lowConfidence: '怒り'
    }
  },
  micromanager: {
    baseline: ['疑問', '心配', 'いらだち'],
    triggers: {
      shortResponse: '心配',
      longResponse: '満足',
      quickResponse: '疑問',
      slowResponse: 'いらだち',
      highStress: '心配',
      lowConfidence: 'いらだち'
    }
  },
  'passive-aggressive': {
    baseline: ['落ち着き', '疑問', '失望'],
    triggers: {
      shortResponse: '失望',
      longResponse: '疑問',
      quickResponse: '落ち着き',
      slowResponse: '失望',
      highStress: '失望',
      lowConfidence: '失望'
    }
  },
  volatile: {
    baseline: ['期待', 'いらだち', '怒り'],
    triggers: {
      shortResponse: 'いらだち',
      longResponse: '喜び',
      quickResponse: '驚き',
      slowResponse: '怒り',
      highStress: '怒り',
      lowConfidence: '激怒'
    }
  },
  analytical: {
    baseline: ['落ち着き', '疑問', '期待'],
    triggers: {
      shortResponse: '疑問',
      longResponse: '満足',
      quickResponse: '期待',
      slowResponse: '心配',
      highStress: '疑問',
      lowConfidence: '心配'
    }
  }
};

export function BossEmotionalAnalyzer({
  bossType,
  stressLevel,
  userConfidence,
  lastUserMessage = '',
  lastBossMessage = '',
  conversationTurn,
  responseTime = 0,
  sessionDuration
}: BossEmotionalAnalyzerProps) {
  const [currentMood, setCurrentMood] = useState<MoodState | null>(null);
  const [emotionalHistory, setEmotionalHistory] = useState<VisualizationData[]>([]);
  const [emotionalState, setEmotionalState] = useState<EmotionalState>({
    primary: '落ち着き',
    secondary: '期待',
    intensity: 30,
    stability: 70
  });
  const [advice, setAdvice] = useState<string>('');
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationFrameRef = useRef<number>();

  const personality = BOSS_PERSONALITIES[bossType] || BOSS_PERSONALITIES.supportive;

  // Mood analysis logic
  const analyzeMood = useCallback(() => {
    if (!lastUserMessage) return;

    const messageLength = lastUserMessage.length;
    const isQuick = responseTime < 3000;
    const isSlow = responseTime > 10000;
    const isShort = messageLength < 20;
    const isLong = messageLength > 100;
    const hasQuestions = lastUserMessage.includes('？') || lastUserMessage.includes('?');
    const hasConfidentWords = /\b(絶対に|確実に|自信を持って|間違いなく|必ず|できます)\b/i.test(lastUserMessage);
    const hasUncertainWords = /\b(たぶん|おそらく|かもしれません|よく分からない|思います|多分)\b/i.test(lastUserMessage);

    let moodKey = '';
    let intensity = 50;
    let trigger = '';

    // Determine mood based on boss type and user behavior
    const patterns = BOSS_EMOTION_PATTERNS[bossType] || BOSS_EMOTION_PATTERNS.supportive;
    
    if (isShort && !hasQuestions) {
      moodKey = Object.keys(personality.moods).find(key => personality.moods[key].intensity > 60) || 'concerned';
      trigger = 'shortResponse';
      intensity = 70;
    } else if (isLong && hasConfidentWords) {
      moodKey = Object.keys(personality.moods).find(key => personality.moods[key].intensity < 40) || 'pleased';
      trigger = 'longResponse';
      intensity = 30;
    } else if (isQuick && hasConfidentWords) {
      moodKey = Object.keys(personality.moods)[1] || 'encouraging';
      trigger = 'quickResponse';
      intensity = 40;
    } else if (isSlow || hasUncertainWords) {
      moodKey = Object.keys(personality.moods).find(key => personality.moods[key].intensity > 70) || 'disappointed';
      trigger = 'slowResponse';
      intensity = 80;
    } else {
      moodKey = Object.keys(personality.moods)[0] || 'pleased';
      trigger = 'baseline';
      intensity = 50;
    }

    // Adjust based on stress and confidence levels
    if (stressLevel > 70) {
      intensity += 20;
      trigger += '+highStress';
    }
    if (userConfidence < 30) {
      intensity += 15;
      trigger += '+lowConfidence';
    }

    intensity = Math.min(100, Math.max(0, intensity));

    const selectedMood = personality.moods[moodKey];
    if (selectedMood) {
      setCurrentMood({ ...selectedMood, intensity });
      
      // Update emotional state
      const emotionKey = patterns.triggers[trigger as keyof typeof patterns.triggers] || patterns.baseline[0];
      setEmotionalState(prev => ({
        primary: emotionKey,
        secondary: patterns.baseline[Math.floor(Math.random() * patterns.baseline.length)],
        intensity,
        stability: Math.max(20, 100 - intensity)
      }));

      // Add to history
      setEmotionalHistory(prev => [
        ...prev.slice(-9),
        {
          timestamp: Date.now(),
          emotion: emotionKey,
          intensity,
          trigger
        }
      ]);

      // Generate advice
      generateAdvice(selectedMood, intensity, trigger);
    }
  }, [bossType, lastUserMessage, responseTime, stressLevel, userConfidence, personality]);

  const generateAdvice = (mood: MoodState, intensity: number, trigger: string) => {
    const adviceMap = {
      pleased: ['素晴らしい回答です！', 'このペースを維持してください', '上司は満足しています'],
      encouraging: ['良い方向に進んでいます', '自信を持って続けてください', '積極的な姿勢が評価されています'],
      concerned: ['もう少し詳しく説明してみてください', '具体例を加えると良いでしょう', '質問があれば遠慮なくどうぞ'],
      disappointed: ['より具体的な回答が求められています', '準備時間を取って考えてください', '相手の期待を理解しましょう'],
      satisfied: ['期待通りの回答です', 'プロフェッショナルな対応です', '継続してください'],
      expectant: ['詳細な説明を用意してください', '数字やデータがあると効果的です', '結論を明確にしましょう'],
      impatient: ['簡潔で要点を押さえた回答を', '時間を意識してください', '準備不足が目立ちます'],
      angry: ['冷静に対応してください', '謝罪から始めることを検討', '改善案を具体的に提示しましょう']
    };

    const moodAdvice = adviceMap[mood.description as keyof typeof adviceMap] || ['適切に対応してください'];
    const randomAdvice = moodAdvice[Math.floor(Math.random() * moodAdvice.length)];
    setAdvice(randomAdvice);
  };

  // Canvas animation
  const drawVisualization = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const { width, height } = canvas;
    ctx.clearRect(0, 0, width, height);

    // Background
    ctx.fillStyle = '#f8fafc';
    ctx.fillRect(0, 0, width, height);

    // Emotional intensity visualization
    const centerX = width / 2;
    const centerY = height / 2;
    const baseRadius = Math.min(width, height) / 4;

    // Draw stability ring
    ctx.beginPath();
    ctx.arc(centerX, centerY, baseRadius + 20, 0, 2 * Math.PI);
    ctx.strokeStyle = emotionalState.stability > 50 ? '#10B981' : '#EF4444';
    ctx.lineWidth = 3;
    ctx.setLineDash([5, 5]);
    ctx.stroke();

    // Draw main emotion circle
    const emotionColor = EMOTION_COLORS[emotionalState.primary] || '#6B7280';
    const radius = baseRadius * (emotionalState.intensity / 100);
    
    ctx.beginPath();
    ctx.arc(centerX, centerY, radius, 0, 2 * Math.PI);
    ctx.fillStyle = emotionColor + '40';
    ctx.fill();
    ctx.strokeStyle = emotionColor;
    ctx.lineWidth = 2;
    ctx.setLineDash([]);
    ctx.stroke();

    // Vibration effect for high intensity
    if (emotionalState.intensity > 70) {
      const vibration = Math.sin(Date.now() / 100) * 2;
      ctx.save();
      ctx.translate(vibration, vibration);
      ctx.beginPath();
      ctx.arc(centerX, centerY, radius + 5, 0, 2 * Math.PI);
      ctx.strokeStyle = emotionColor + '80';
      ctx.lineWidth = 1;
      ctx.stroke();
      ctx.restore();
    }

    // Draw emotion text
    ctx.fillStyle = emotionColor;
    ctx.font = 'bold 14px system-ui';
    ctx.textAlign = 'center';
    ctx.fillText(emotionalState.primary, centerX, centerY + 5);

    animationFrameRef.current = requestAnimationFrame(drawVisualization);
  }, [emotionalState]);

  useEffect(() => {
    analyzeMood();
  }, [analyzeMood]);

  useEffect(() => {
    drawVisualization();
    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [drawVisualization]);

  if (!currentMood) {
    return (
      <Card className="backdrop-blur-sm bg-white/90 border-0 shadow-lg">
        <CardContent className="p-6">
          <div className="text-center">
            <div className="text-4xl mb-2">{personality.baseEmoji}</div>
            <div className="text-sm text-gray-600">分析待機中...</div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="backdrop-blur-sm bg-white/90 border-0 shadow-lg">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg">上司の感情状態</CardTitle>
          <Badge variant="outline" className="text-xs">
            {personality.name}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Current Mood Display */}
        <div className={`p-4 rounded-lg ${currentMood.bgColor} border border-opacity-20`}>
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center space-x-2">
              <span className="text-2xl">{currentMood.emoji}</span>
              <span className={`font-medium ${currentMood.color}`}>
                {currentMood.description}
              </span>
            </div>
            <Badge variant="secondary" className="text-xs">
              強度: {Math.round(currentMood.intensity)}%
            </Badge>
          </div>
          <Progress 
            value={currentMood.intensity} 
            className="h-2"
          />
        </div>

        {/* Real-time Visualization */}
        <div className="relative">
          <canvas
            ref={canvasRef}
            width={280}
            height={120}
            className="w-full border rounded-lg bg-slate-50"
          />
          <div className="absolute top-2 left-2">
            <Badge variant="outline" className="text-xs bg-white/80">
              感情: {emotionalState.primary}
            </Badge>
          </div>
          <div className="absolute top-2 right-2">
            <Badge variant="outline" className="text-xs bg-white/80">
              安定度: {Math.round(emotionalState.stability)}%
            </Badge>
          </div>
        </div>

        {/* Advice */}
        {advice && (
          <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
            <div className="flex items-start space-x-2">
              <span className="text-blue-600 text-sm">💡</span>
              <p className="text-sm text-blue-800">{advice}</p>
            </div>
          </div>
        )}

        {/* Quick Stats */}
        <div className="grid grid-cols-2 gap-3 text-xs">
          <div className="text-center">
            <div className="text-gray-600">会話ターン</div>
            <div className="font-bold text-lg">{conversationTurn}</div>
          </div>
          <div className="text-center">
            <div className="text-gray-600">反応時間</div>
            <div className="font-bold text-lg">
              {responseTime ? `${(responseTime / 1000).toFixed(1)}s` : '-'}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
