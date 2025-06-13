'use client';

import { useState, useEffect, useCallback } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';

interface BossMoodIndicatorProps {
  bossType: string;
  stressLevel: number; // 0-100
  userConfidence: number; // 0-100
  lastUserMessage?: string;
  conversationTurn: number;
  responseTime?: number; // milliseconds
}

interface MoodState {
  emoji: string;
  description: string;
  color: string;
  bgColor: string;
  intensity: number; // 0-100
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
      furious: { emoji: '🤬', description: '激怒', color: 'text-red-700', bgColor: 'bg-red-100', intensity: 100 },
    }
  },
  micromanager: {
    name: 'マイクロマネージャー',
    baseEmoji: '🔍',
    moods: {
      analyzing: { emoji: '🔍', description: '分析中', color: 'text-blue-600', bgColor: 'bg-blue-50', intensity: 30 },
      questioning: { emoji: '❓', description: '疑問', color: 'text-purple-600', bgColor: 'bg-purple-50', intensity: 50 },
      nitpicking: { emoji: '🤏', description: '細かい指摘', color: 'text-yellow-600', bgColor: 'bg-yellow-50', intensity: 70 },
      overwhelmed: { emoji: '😵‍💫', description: '混乱', color: 'text-red-600', bgColor: 'bg-red-50', intensity: 90 },
    }
  },
  'passive-aggressive': {
    name: '受動攻撃的な上司',
    baseEmoji: '😏',
    moods: {
      neutral: { emoji: '😐', description: '平静', color: 'text-gray-600', bgColor: 'bg-gray-50', intensity: 20 },
      sarcastic: { emoji: '😏', description: '皮肉', color: 'text-purple-600', bgColor: 'bg-purple-50', intensity: 50 },
      passive: { emoji: '🙄', description: 'あきれ', color: 'text-yellow-600', bgColor: 'bg-yellow-50', intensity: 70 },
      aggressive: { emoji: '😤', description: '攻撃的', color: 'text-red-600', bgColor: 'bg-red-50', intensity: 90 },
    }
  },
  volatile: {
    name: '感情的な上司',
    baseEmoji: '🌪️',
    moods: {
      calm: { emoji: '😌', description: '穏やか', color: 'text-green-600', bgColor: 'bg-green-50', intensity: 10 },
      excited: { emoji: '😄', description: '興奮', color: 'text-blue-600', bgColor: 'bg-blue-50', intensity: 40 },
      agitated: { emoji: '😰', description: '動揺', color: 'text-yellow-600', bgColor: 'bg-yellow-50', intensity: 60 },
      explosive: { emoji: '🤯', description: '爆発', color: 'text-red-600', bgColor: 'bg-red-50', intensity: 80 },
      unpredictable: { emoji: '🌪️', description: '予測不能', color: 'text-purple-600', bgColor: 'bg-purple-50', intensity: 100 },
    }
  },
  analytical: {
    name: '分析的な上司',
    baseEmoji: '📊',
    moods: {
      processing: { emoji: '🤖', description: '処理中', color: 'text-blue-600', bgColor: 'bg-blue-50', intensity: 20 },
      focused: { emoji: '🎯', description: '集中', color: 'text-green-600', bgColor: 'bg-green-50', intensity: 40 },
      calculating: { emoji: '📊', description: '計算中', color: 'text-purple-600', bgColor: 'bg-purple-50', intensity: 60 },
      overloaded: { emoji: '🤯', description: '情報過多', color: 'text-red-600', bgColor: 'bg-red-50', intensity: 80 },
    }
  },
};

export function BossMoodIndicator({
  bossType,
  stressLevel,
  userConfidence,
  lastUserMessage = '',
  conversationTurn,
  responseTime = 0,
}: BossMoodIndicatorProps) {
  const [currentMood, setCurrentMood] = useState<MoodState | null>(null);
  const [moodHistory, setMoodHistory] = useState<Array<{ mood: MoodState; timestamp: number }>>([]);
  const [pulseAnimation, setPulseAnimation] = useState(false);

  const bossPersonality = BOSS_PERSONALITIES[bossType] || BOSS_PERSONALITIES.supportive;

  // 気分の計算ロジック
  const calculateMood = useCallback((): MoodState => {
    const moods = Object.values(bossPersonality.moods);
    
    // 各要因による気分への影響を計算
    let moodIntensity = 0;
    
    // ストレスレベルの影響 (0-40点)
    moodIntensity += (stressLevel / 100) * 40;
    
    // ユーザーの自信レベルの逆影響 (0-30点)
    moodIntensity += ((100 - userConfidence) / 100) * 30;
    
    // 会話のターン数による影響 (0-20点)
    const turnImpact = Math.min(conversationTurn * 2, 20);
    moodIntensity += turnImpact;
    
    // 応答時間による影響 (0-10点)
    if (responseTime > 10000) { // 10秒以上
      moodIntensity += 10;
    } else if (responseTime > 5000) { // 5秒以上
      moodIntensity += 5;
    }

    // 上司タイプ別の調整
    switch (bossType) {
      case 'demanding':
      case 'volatile':
        moodIntensity *= 1.3; // より激しい反応
        break;
      case 'supportive':
        moodIntensity *= 0.7; // より穏やかな反応
        break;
      case 'analytical':
        moodIntensity *= 0.9; // やや抑制された反応
        break;
    }

    // メッセージ内容による調整
    const messageLength = lastUserMessage.length;
    if (messageLength < 10) {
      moodIntensity += 15; // 短すぎる回答
    } else if (messageLength > 200) {
      moodIntensity += 5; // 長すぎる回答
    }

    // 不確実な表現のチェック
    const uncertainWords = /\b(たぶん|おそらく|かもしれません|よく分からない|思います|多分)\b/i;
    if (uncertainWords.test(lastUserMessage)) {
      moodIntensity += 10;
    }

    // 適切な気分を選択
    moodIntensity = Math.min(moodIntensity, 100);
    
    for (const mood of moods.sort((a, b) => a.intensity - b.intensity)) {
      if (moodIntensity <= mood.intensity) {
        return mood;
      }
    }
    
    return moods[moods.length - 1]; // 最も強い気分
  }, [bossPersonality.moods, stressLevel, userConfidence, conversationTurn, responseTime, bossType, lastUserMessage]);

  // 気分の更新
  useEffect(() => {
    const newMood = calculateMood();
    
    if (!currentMood || currentMood.emoji !== newMood.emoji) {
      setCurrentMood(newMood);
      setPulseAnimation(true);
      
      // 気分履歴に追加
      setMoodHistory(prev => [
        ...prev.slice(-4), // 最新5個まで保持
        { mood: newMood, timestamp: Date.now() }
      ]);

      // アニメーションをリセット
      setTimeout(() => setPulseAnimation(false), 600);
    }
  }, [calculateMood, currentMood]);

  if (!currentMood) return null;

  return (
    <Card className="backdrop-blur-sm bg-white/90 border-0 shadow-lg">
      <CardContent className="p-4">
        <div className="space-y-4">
          {/* メイン気分表示 */}
          <div className="flex items-center space-x-4">
            <div className={`relative transition-all duration-500 ${currentMood.bgColor} rounded-full p-4 ${pulseAnimation ? 'animate-pulse scale-110' : ''}`}>
              <span className="text-4xl" role="img" aria-label={currentMood.description}>
                {currentMood.emoji}
              </span>
              {pulseAnimation && (
                <div className="absolute inset-0 rounded-full bg-current opacity-20 animate-ping"></div>
              )}
            </div>
            
            <div className="flex-1">
              <div className="flex items-center justify-between mb-2">
                <h3 className="font-semibold text-lg">{bossPersonality.name}</h3>
                <Badge variant="outline" className={`${currentMood.color} border-current`}>
                  {currentMood.description}
                </Badge>
              </div>
              
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">気分レベル</span>
                  <span className={`font-medium ${currentMood.color}`}>{currentMood.intensity}%</span>
                </div>
                <Progress 
                  value={currentMood.intensity} 
                  className="h-2"
                />
              </div>
            </div>
          </div>

          {/* 詳細メトリクス */}
          <div className="grid grid-cols-2 gap-3 text-sm">
            <div className="bg-slate-50 rounded-lg p-3">
              <div className="flex items-center justify-between">
                <span className="text-gray-600">反応強度</span>
                <span className="font-medium">{Math.round((stressLevel + (100 - userConfidence)) / 2)}%</span>
              </div>
            </div>
            
            <div className="bg-slate-50 rounded-lg p-3">
              <div className="flex items-center justify-between">
                <span className="text-gray-600">会話ターン</span>
                <span className="font-medium">{conversationTurn}</span>
              </div>
            </div>
          </div>

          {/* 気分履歴 */}
          {moodHistory.length > 0 && (
            <div className="space-y-2">
              <h4 className="text-sm font-medium text-gray-700">気分の変化</h4>
              <div className="flex space-x-2 overflow-x-auto pb-2">
                {moodHistory.map((entry, index) => (
                  <div
                    key={entry.timestamp}
                    className={`flex-shrink-0 text-2xl transition-all duration-300 ${
                      index === moodHistory.length - 1 ? 'scale-110' : 'scale-90 opacity-60'
                    }`}
                    title={`${entry.mood.description} - ${new Date(entry.timestamp).toLocaleTimeString()}`}
                  >
                    {entry.mood.emoji}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* アドバイス */}
          <div className="bg-blue-50 rounded-lg p-3">
            <div className="flex items-start space-x-2">
              <span className="text-blue-600 mt-0.5">💡</span>
              <div className="text-sm text-blue-800">
                <strong>アドバイス:</strong>{' '}
                {getAdviceForMood(currentMood, bossType)}
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function getAdviceForMood(mood: MoodState, bossType: string): string {
  const adviceMap: Record<string, Record<string, string>> = {
    supportive: {
      満足: 'いい調子です！この調子で続けてください。',
      励まし: '上司は応援しています。自信を持って発言しましょう。',
      心配: '上司が心配しています。もう少し詳しく説明してみてください。',
      がっかり: '期待に応えられていません。具体的な解決策を提案してみましょう。',
    },
    demanding: {
      満足: '上司の要求を満たしています。このレベルを維持しましょう。',
      期待: 'より具体的で実行可能な提案が必要です。',
      いらいら: '上司がいらいらしています。要点を簡潔にまとめて答えましょう。',
      怒り: '上司の怒りを和らげるために、謝罪と改善策を示しましょう。',
      激怒: '緊急事態です。即座に具体的な解決策と責任を示してください。',
    },
    micromanager: {
      分析中: '上司は詳細を求めています。段階的なプロセスを説明しましょう。',
      疑問: '疑問に丁寧に答え、根拠を示してください。',
      '細かい指摘': '細かい点への配慮を示し、完璧性をアピールしましょう。',
      混乱: '情報を整理して、優先順位を明確にしましょう。',
    },
    'passive-aggressive': {
      平静: '表面的には平静ですが、真意を探る質問をしてみましょう。',
      皮肉: '皮肉に真正面から対応せず、建設的な方向に導きましょう。',
      あきれ: '隠れた不満があります。直接的な質問で本音を引き出しましょう。',
      攻撃的: '攻撃的になっています。冷静さを保ち、事実に基づいて対応しましょう。',
    },
    volatile: {
      穏やか: '穏やかな状態です。この機会に重要な議論を進めましょう。',
      興奮: '興奮状態です。エネルギーを建設的な方向に向けましょう。',
      動揺: '動揺しています。落ち着かせるような言葉をかけましょう。',
      爆発: '爆発寸前です。一歩下がって冷却期間を設けましょう。',
      予測不能: '予測不能な状態です。慎重に言葉を選んで対応しましょう。',
    },
    analytical: {
      処理中: 'データを処理中です。追加の情報を整理して提供しましょう。',
      集中: '集中しています。論理的で構造化された説明を心がけましょう。',
      計算中: '分析中です。数値やデータで裏付けを示しましょう。',
      情報過多: '情報過多です。要点を絞って簡潔に説明しましょう。',
    },
  };

  return adviceMap[bossType]?.[mood.description] || 
         '上司の気分に注意して、適切に対応しましょう。';
}