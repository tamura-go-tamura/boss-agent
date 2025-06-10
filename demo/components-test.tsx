'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ResponseSuggestions } from '@/components/training/ResponseSuggestions';
import { RealTimeAnalytics } from '@/components/training/RealTimeAnalytics';
import { BOSS_PERSONAS } from '@/constants';
import {
  MessageCircle,
  TrendingUp,
  Clock,
  RotateCcw,
  Lightbulb
} from 'lucide-react';

export default function ComponentsTestPage() {
  const [stressLevel, setStressLevel] = useState(30);
  const [confidenceLevel, setConfidenceLevel] = useState(70);
  const [messageCount, setMessageCount] = useState(5);
  const [showSuggestions, setShowSuggestions] = useState(true);
  const [showAnalytics, setShowAnalytics] = useState(true);

  const demoMessage = "プロジェクトの進捗はどうなっているの？期限まであと少ししかないよ。";
  const selectedBoss = BOSS_PERSONAS[1]; // demanding boss

  const improvements = ['より具体的な回答をしましょう', 'もっと自信を持って答えましょう'];
  const strengths = ['明確なコミュニケーション', 'プロフェッショナルな口調'];

  const handleSuggestionSelect = (suggestion: string) => {
    alert(`選択された提案: ${suggestion}`);
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-4">コンポーネントテストページ</h1>
        <p className="text-gray-600">VirtualBoss Trainerの個別コンポーネントをテストできます。</p>
      </div>

      {/* Controls */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle>テスト設定</CardTitle>
          <CardDescription>以下のパラメータを調整してコンポーネントの動作を確認</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">ストレスレベル: {stressLevel}%</label>
              <input
                type="range"
                min="0"
                max="100"
                value={stressLevel}
                onChange={(e) => setStressLevel(Number(e.target.value))}
                className="w-full"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">自信レベル: {confidenceLevel}%</label>
              <input
                type="range"
                min="0"
                max="100"
                value={confidenceLevel}
                onChange={(e) => setConfidenceLevel(Number(e.target.value))}
                className="w-full"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">メッセージ数: {messageCount}</label>
              <input
                type="range"
                min="1"
                max="20"
                value={messageCount}
                onChange={(e) => setMessageCount(Number(e.target.value))}
                className="w-full"
              />
            </div>
          </div>
          <div className="flex space-x-4">
            <Button
              variant={showSuggestions ? "default" : "outline"}
              onClick={() => setShowSuggestions(!showSuggestions)}
            >
              <Lightbulb className="h-4 w-4 mr-2" />
              応答提案
            </Button>
            <Button
              variant={showAnalytics ? "default" : "outline"}
              onClick={() => setShowAnalytics(!showAnalytics)}
            >
              <TrendingUp className="h-4 w-4 mr-2" />
              リアルタイム分析
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Components Demo */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Response Suggestions Demo */}
        {showSuggestions && (
          <div>
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Lightbulb className="h-5 w-5 mr-2" />
                  応答提案コンポーネント
                </CardTitle>
                <CardDescription>
                  上司のメッセージに対する適切な応答を提案
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="mb-4 p-3 bg-gray-100 rounded-lg">
                  <p className="text-sm font-medium text-gray-700">上司からのメッセージ:</p>
                  <p className="text-sm mt-1">"{demoMessage}"</p>
                  <div className="mt-2">
                    <Badge variant="outline">{selectedBoss.name}</Badge>
                    <Badge variant="secondary" className="ml-2">Demanding</Badge>
                  </div>
                </div>
                <ResponseSuggestions
                  bossMessage={demoMessage}
                  bossType={selectedBoss.id}
                  userStressLevel={stressLevel}
                  onSuggestionSelect={handleSuggestionSelect}
                  isVisible={true}
                />
              </CardContent>
            </Card>
          </div>
        )}

        {/* Real-time Analytics Demo */}
        {showAnalytics && (
          <div>
            <RealTimeAnalytics
              stressLevel={stressLevel}
              confidenceLevel={confidenceLevel}
              responseTime={2500}
              messageCount={messageCount}
              sessionDuration={180}
              improvements={improvements}
              strengths={strengths}
            />
          </div>
        )}
      </div>

      {/* Component Info */}
      <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>応答提案システム</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="flex items-center space-x-2">
              <MessageCircle className="h-4 w-4 text-blue-600" />
              <span className="text-sm">上司のタイプに応じた提案生成</span>
            </div>
            <div className="flex items-center space-x-2">
              <TrendingUp className="h-4 w-4 text-green-600" />
              <span className="text-sm">ユーザーのストレスレベルを考慮</span>
            </div>
            <div className="flex items-center space-x-2">
              <Clock className="h-4 w-4 text-purple-600" />
              <span className="text-sm">リアルタイムで動的に更新</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>リアルタイム分析</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="flex items-center space-x-2">
              <TrendingUp className="h-4 w-4 text-blue-600" />
              <span className="text-sm">ストレス・自信レベルの追跡</span>
            </div>
            <div className="flex items-center space-x-2">
              <MessageCircle className="h-4 w-4 text-green-600" />
              <span className="text-sm">応答時間とメッセージ数の分析</span>
            </div>
            <div className="flex items-center space-x-2">
              <RotateCcw className="h-4 w-4 text-purple-600" />
              <span className="text-sm">継続的なフィードバック提供</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Back to Demo */}
      <div className="mt-8 text-center">
        <Button asChild size="lg">
          <a href="/demo">メインデモページに戻る</a>
        </Button>
      </div>
    </div>
  );
}
