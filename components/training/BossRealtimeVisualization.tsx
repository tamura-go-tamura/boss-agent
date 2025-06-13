'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

interface BossRealtimeVisualizationProps {
  bossType: string;
  stressLevel: number;
  userConfidence: number;
  lastUserMessage?: string;
  lastBossMessage?: string;
  conversationTurn: number;
  responseTime?: number;
  sessionDuration: number;
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

const EMOTION_COLORS = {
  喜び: '#10B981', // green
  満足: '#059669', // emerald
  落ち着き: '#3B82F6', // blue
  期待: '#6366F1', // indigo
  疑問: '#8B5CF6', // violet
  心配: '#F59E0B', // amber
  失望: '#F97316', // orange
  いらだち: '#EF4444', // red
  怒り: '#DC2626', // red-600
  激怒: '#991B1B', // red-800
  驚き: '#EC4899', // pink
  混乱: '#6B7280', // gray
};

const BOSS_EMOTION_PATTERNS = {
  supportive: {
    baseline: ['満足', '落ち着き', '期待'],
    triggers: {
      shortResponse: '心配',
      longResponse: '期待',
      uncertainty: '心配',
      confidence: '喜び',
      delay: '心配'
    }
  },
  demanding: {
    baseline: ['期待', '疑問', 'いらだち'],
    triggers: {
      shortResponse: 'いらだち',
      longResponse: 'いらだち',
      uncertainty: '怒り',
      confidence: '満足',
      delay: '激怒'
    }
  },
  micromanager: {
    baseline: ['疑問', '心配', '期待'],
    triggers: {
      shortResponse: '疑問',
      longResponse: '混乱',
      uncertainty: '心配',
      confidence: '満足',
      delay: 'いらだち'
    }
  },
  'passive-aggressive': {
    baseline: ['落ち着き', '疑問', 'いらだち'],
    triggers: {
      shortResponse: 'いらだち',
      longResponse: '混乱',
      uncertainty: 'いらだち',
      confidence: '驚き',
      delay: '怒り'
    }
  },
  volatile: {
    baseline: ['期待', '驚き', 'いらだち'],
    triggers: {
      shortResponse: '怒り',
      longResponse: '混乱',
      uncertainty: '激怒',
      confidence: '喜び',
      delay: '激怒'
    }
  },
  analytical: {
    baseline: ['落ち着き', '期待', '疑問'],
    triggers: {
      shortResponse: '疑問',
      longResponse: '満足',
      uncertainty: '心配',
      confidence: '満足',
      delay: 'いらだち'
    }
  }
};

export function BossRealtimeVisualization({
  bossType,
  stressLevel,
  userConfidence,
  lastUserMessage = '',
  conversationTurn,
  responseTime = 0,
  sessionDuration
}: BossRealtimeVisualizationProps) {
  const [currentEmotion, setCurrentEmotion] = useState<EmotionalState>({
    primary: '落ち着き',
    secondary: '期待',
    intensity: 30,
    stability: 80
  });
  
  const [emotionHistory, setEmotionHistory] = useState<VisualizationData[]>([]);
  const [animationTrigger, setAnimationTrigger] = useState(0);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const bossPatterns = BOSS_EMOTION_PATTERNS[bossType as keyof typeof BOSS_EMOTION_PATTERNS] || BOSS_EMOTION_PATTERNS.supportive;

  // 感情分析とトリガー検出
  const analyzeEmotion = React.useCallback((): EmotionalState => {
    let primaryEmotion = bossPatterns.baseline[0];
    let intensity = 30;
    let stability = 80;
    let trigger = 'baseline';

    // メッセージ長による分析
    const messageLength = lastUserMessage.length;
    if (messageLength < 10 && messageLength > 0) {
      primaryEmotion = bossPatterns.triggers.shortResponse;
      trigger = 'shortResponse';
      intensity += 20;
      stability -= 15;
    } else if (messageLength > 150) {
      primaryEmotion = bossPatterns.triggers.longResponse;
      trigger = 'longResponse';
      intensity += 15;
      stability -= 10;
    }

    // 不確実性の検出
    const uncertaintyWords = /\b(たぶん|おそらく|かもしれません|よく分からない|思います|多分)\b/i;
    if (uncertaintyWords.test(lastUserMessage)) {
      primaryEmotion = bossPatterns.triggers.uncertainty;
      trigger = 'uncertainty';
      intensity += 25;
      stability -= 20;
    }

    // 自信のある表現の検出
    const confidenceWords = /\b(絶対に|確実に|自信を持って|間違いなく|必ず|できます)\b/i;
    if (confidenceWords.test(lastUserMessage)) {
      primaryEmotion = bossPatterns.triggers.confidence;
      trigger = 'confidence';
      intensity = Math.max(10, intensity - 15);
      stability += 10;
    }

    // 応答時間による影響
    if (responseTime > 8000) {
      primaryEmotion = bossPatterns.triggers.delay;
      trigger = 'delay';
      intensity += 30;
      stability -= 25;
    }

    // ストレスレベルとユーザー自信度による調整
    const stressImpact = stressLevel * 0.5;
    const confidenceImpact = (100 - userConfidence) * 0.3;
    
    intensity = Math.min(100, intensity + stressImpact + confidenceImpact);
    stability = Math.max(0, stability - stressImpact * 0.5);

    // 会話ターン数による疲労効果
    const fatigueEffect = Math.min(conversationTurn * 2, 20);
    intensity += fatigueEffect;
    stability -= fatigueEffect * 0.5;

    // 上司タイプ別の調整
    switch (bossType) {
      case 'volatile':
        intensity *= 1.4;
        stability *= 0.6;
        break;
      case 'demanding':
        intensity *= 1.2;
        stability *= 0.8;
        break;
      case 'supportive':
        intensity *= 0.7;
        stability *= 1.2;
        break;
    }

    // 履歴に追加
    if (trigger !== 'baseline') {
      setEmotionHistory(prev => [
        ...prev.slice(-9), // 最新10個まで保持
        {
          timestamp: Date.now(),
          emotion: primaryEmotion,
          intensity: Math.round(intensity),
          trigger
        }
      ]);
    }

    return {
      primary: primaryEmotion,
      secondary: bossPatterns.baseline[Math.floor(Math.random() * bossPatterns.baseline.length)],
      intensity: Math.min(100, Math.max(0, intensity)),
      stability: Math.min(100, Math.max(0, stability))
    };
  }, [bossPatterns, bossType, conversationTurn, lastUserMessage, responseTime, stressLevel, userConfidence]);

  // キャンバスでの感情可視化
  const drawEmotionVisualization = React.useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;
    const baseRadius = 40;

    // キャンバスをクリア
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // 感情の強度に基づく円を描画
    const emotionColor = EMOTION_COLORS[currentEmotion.primary as keyof typeof EMOTION_COLORS] || '#6B7280';
    const radius = baseRadius + (currentEmotion.intensity / 100) * 20;
    const stability = currentEmotion.stability / 100;

    // 不安定さを表現するランダムな振動
    const vibrationX = stability < 0.5 ? (Math.random() - 0.5) * (1 - stability) * 10 : 0;
    const vibrationY = stability < 0.5 ? (Math.random() - 0.5) * (1 - stability) * 10 : 0;

    // グラデーション作成
    const gradient = ctx.createRadialGradient(
      centerX + vibrationX, centerY + vibrationY, 0,
      centerX + vibrationX, centerY + vibrationY, radius
    );
    gradient.addColorStop(0, emotionColor + '80');
    gradient.addColorStop(0.7, emotionColor + '40');
    gradient.addColorStop(1, emotionColor + '10');

    // メイン円を描画
    ctx.beginPath();
    ctx.arc(centerX + vibrationX, centerY + vibrationY, radius, 0, 2 * Math.PI);
    ctx.fillStyle = gradient;
    ctx.fill();

    // 強度に応じたパルス効果
    if (currentEmotion.intensity > 70) {
      const pulseRadius = radius + Math.sin(animationTrigger * 0.1) * 10;
      ctx.beginPath();
      ctx.arc(centerX + vibrationX, centerY + vibrationY, pulseRadius, 0, 2 * Math.PI);
      ctx.strokeStyle = emotionColor + '30';
      ctx.lineWidth = 3;
      ctx.stroke();
    }

    // 安定性を表すリング
    ctx.beginPath();
    ctx.arc(centerX, centerY, radius + 15, 0, 2 * Math.PI * stability);
    ctx.strokeStyle = emotionColor;
    ctx.lineWidth = 2;
    ctx.stroke();
  }, [currentEmotion, animationTrigger]);

  useEffect(() => {
    const newEmotion = analyzeEmotion();
    setCurrentEmotion(newEmotion);
    setAnimationTrigger(prev => prev + 1);
  }, [analyzeEmotion]);

  useEffect(() => {
    const animationFrame = () => {
      drawEmotionVisualization();
      setAnimationTrigger(prev => prev + 1);
    };

    const intervalId = setInterval(animationFrame, 100);
    return () => clearInterval(intervalId);
  }, [drawEmotionVisualization]);

  const getEmotionEmoji = (emotion: string): string => {
    const emojiMap: Record<string, string> = {
      喜び: '😊',
      満足: '😌',
      落ち着き: '😐',
      期待: '🤔',
      疑問: '❓',
      心配: '😟',
      失望: '😞',
      いらだち: '😤',
      怒り: '😠',
      激怒: '🤬',
      驚き: '😲',
      混乱: '😵‍💫'
    };
    return emojiMap[emotion] || '😐';
  };

  return (
    <Card className="backdrop-blur-sm bg-white/90 border-0 shadow-lg">
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <span className="text-2xl">{getEmotionEmoji(currentEmotion.primary)}</span>
          <span>上司の感情状態</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* リアルタイム可視化 */}
        <div className="flex items-center justify-center">
          <div className="relative">
            <canvas
              ref={canvasRef}
              width={200}
              height={200}
              className="border rounded-lg bg-gradient-to-br from-slate-50 to-blue-50"
            />
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-4xl" role="img" aria-label={currentEmotion.primary}>
                {getEmotionEmoji(currentEmotion.primary)}
              </span>
            </div>
          </div>
        </div>

        {/* 感情データ */}
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-slate-50 rounded-lg p-3">
            <div className="text-sm text-gray-600 mb-1">主要感情</div>
            <div className="font-semibold text-lg" style={{ color: EMOTION_COLORS[currentEmotion.primary as keyof typeof EMOTION_COLORS] }}>
              {currentEmotion.primary}
            </div>
          </div>
          
          <div className="bg-slate-50 rounded-lg p-3">
            <div className="text-sm text-gray-600 mb-1">感情強度</div>
            <div className="font-semibold text-lg">
              {Math.round(currentEmotion.intensity)}%
            </div>
          </div>
          
          <div className="bg-slate-50 rounded-lg p-3">
            <div className="text-sm text-gray-600 mb-1">安定性</div>
            <div className="font-semibold text-lg">
              {Math.round(currentEmotion.stability)}%
            </div>
          </div>
          
          <div className="bg-slate-50 rounded-lg p-3">
            <div className="text-sm text-gray-600 mb-1">セッション時間</div>
            <div className="font-semibold text-lg">
              {Math.floor(sessionDuration / 60)}:{(sessionDuration % 60).toString().padStart(2, '0')}
            </div>
          </div>
        </div>

        {/* 感情履歴 */}
        {emotionHistory.length > 0 && (
          <div className="space-y-2">
            <h4 className="text-sm font-medium text-gray-700">感情変化の履歴</h4>
            <div className="space-y-2 max-h-32 overflow-y-auto">
              {emotionHistory.slice(-5).reverse().map((entry) => (
                <div key={entry.timestamp} className="flex items-center justify-between text-sm bg-gray-50 rounded p-2">
                  <div className="flex items-center space-x-2">
                    <span>{getEmotionEmoji(entry.emotion)}</span>
                    <span className="font-medium">{entry.emotion}</span>
                    <Badge variant="outline">
                      {entry.intensity}%
                    </Badge>
                  </div>
                  <div className="text-xs text-gray-500">
                    {new Date(entry.timestamp).toLocaleTimeString()}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 現在の状況分析 */}
        <div className="bg-blue-50 rounded-lg p-3">
          <div className="flex items-start space-x-2">
            <span className="text-blue-600 mt-0.5">🔍</span>
            <div className="text-sm text-blue-800">
              <strong>状況分析:</strong>{' '}
              {getEmotionAnalysis(currentEmotion, bossType, conversationTurn)}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function getEmotionAnalysis(emotion: EmotionalState, bossType: string, turn: number): string {
  const analysisMap: Record<string, Record<string, string>> = {
    supportive: {
      喜び: '上司は非常に満足しています。このペースを維持しましょう。',
      満足: '良い方向に進んでいます。さらに具体的な提案をしてみましょう。',
      心配: '上司が心配しています。より詳細な説明が必要かもしれません。',
      失望: '期待に応えられていません。アプローチを変えてみましょう。',
    },
    demanding: {
      満足: '一時的に満足していますが、継続的な成果が必要です。',
      いらだち: '要求に応えられていません。より迅速で具体的な対応が必要です。',
      怒り: '深刻な問題です。即座に改善策を示す必要があります。',
      激怒: '緊急事態です。最優先で対処し、責任を明確にしましょう。',
    },
    micromanager: {
      疑問: '詳細な説明を求めています。段階的なプロセスを示しましょう。',
      心配: '完璧性を求めています。チェックリストや詳細計画を提示しましょう。',
      混乱: '情報過多の状態です。要点を整理して簡潔に伝えましょう。',
    },
    'passive-aggressive': {
      いらだち: '隠れた不満があります。直接的なコミュニケーションを心がけましょう。',
      怒り: '受動攻撃的な行動が見られます。冷静に対応しましょう。',
    },
    volatile: {
      喜び: '一時的に機嫌が良い状態です。このタイミングを活用しましょう。',
      怒り: '感情的になっています。クールダウンの時間が必要かもしれません。',
      激怒: '感情が爆発しています。一旦距離を置くことを検討しましょう。',
      予測不能: '感情が不安定です。慎重に言葉を選んで対応しましょう。',
    },
    analytical: {
      満足: 'データに基づく論理的な説明に満足しています。',
      疑問: 'より多くの情報やデータを求めています。',
      情報過多: '情報量が多すぎます。要点を絞って説明しましょう。',
    }
  };

  const baseAnalysis = analysisMap[bossType]?.[emotion.primary] || '状況を注意深く観察して対応しましょう。';
  
  if (turn > 10) {
    return baseAnalysis + ' 長時間の会話により疲労が見られます。';
  }
  
  if (emotion.stability < 50) {
    return baseAnalysis + ' 感情が不安定になっています。';
  }

  return baseAnalysis;
}