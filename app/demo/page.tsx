'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { BOSS_PERSONAS, SCENARIOS } from '@/constants';
import { BossPersona } from '@/types/ai.types';

type Scenario = (typeof SCENARIOS)[number];

import {
  Bot,
  MessageCircle,
  TrendingUp,
  Clock,
  Users,
  Target,
  Play,
  ArrowRight,
  CheckCircle,
  BarChart3,
  Lightbulb,
  Keyboard
} from 'lucide-react';

export default function DemoPage() {
  const [selectedBoss, setSelectedBoss] = useState<BossPersona>(BOSS_PERSONAS[0]);
  const [selectedScenario, setSelectedScenario] = useState<Scenario>(SCENARIOS[0]);
  const [showFeatures, setShowFeatures] = useState(false);

  const demoFeatures = [
    {
      icon: MessageCircle,
      title: 'リアルタイム会話',
      description: 'AIボスとの自然な対話でコミュニケーションスキルを向上',
      color: 'text-blue-600'
    },
    {
      icon: TrendingUp,
      title: 'パフォーマンス分析',
      description: 'ストレスレベルと自信度をリアルタイムで追跡・分析',
      color: 'text-green-600'
    },
    {
      icon: Lightbulb,
      title: '応答提案機能',
      description: 'シチュエーションに最適な返答を知的に提案',
      color: 'text-yellow-600'
    },
    {
      icon: BarChart3,
      title: '詳細レポート',
      description: '強みと改善点を具体的にフィードバック',
      color: 'text-purple-600'
    },
    {
      icon: Keyboard,
      title: 'キーボードショートカット',
      description: '効率的な操作のための豊富なショートカット機能',
      color: 'text-gray-600'
    },
    {
      icon: Target,
      title: 'カスタマイズ可能',
      description: 'ストレスレベルや時間設定を自由に調整',
      color: 'text-red-600'
    }
  ];

  const startDemo = () => {
    const params = new URLSearchParams({
      boss: selectedBoss.id,
      scenario: selectedScenario.id,
      stress: '3',
      duration: '5' // 5分のデモ
    });
    window.location.href = `/training?${params.toString()}`;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Header */}
      <header className="px-4 lg:px-6 h-14 flex items-center border-b bg-white/80 backdrop-blur">
        <Link className="flex items-center justify-center" href="/">
          <Bot className="h-6 w-6 mr-2" />
          <span className="font-bold">VirtualBoss Trainer</span>
        </Link>
        <nav className="ml-auto flex gap-4 sm:gap-6">
          <Link className="text-sm font-medium hover:underline underline-offset-4" href="/">
            ホーム
          </Link>
          <Link className="text-sm font-medium hover:underline underline-offset-4" href="/auth/signin">
            ログイン
          </Link>
        </nav>
      </header>

      <div className="container mx-auto px-4 py-8 max-w-6xl">
        {/* Hero Section */}
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            VirtualBoss Trainer
          </h1>
          <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
            AIを活用した革新的なコミュニケーション訓練ツール。様々なタイプの上司との対話を通じて、職場でのコミュニケーションスキルを向上させましょう。
          </p>
          <div className="flex justify-center space-x-4 mb-8">
            <Badge variant="secondary" className="text-sm">
              <CheckCircle className="h-4 w-4 mr-1" />
              完全無料
            </Badge>
            <Badge variant="secondary" className="text-sm">
              <CheckCircle className="h-4 w-4 mr-1" />
              登録不要でお試し
            </Badge>
            <Badge variant="secondary" className="text-sm">
              <CheckCircle className="h-4 w-4 mr-1" />
              リアルタイム分析
            </Badge>
          </div>
        </div>

        {/* Demo Configuration */}
        <Card className="mb-8 shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center">
              <Play className="h-5 w-5 mr-2" />
              デモを始める
            </CardTitle>
            <CardDescription>
              以下の設定でトレーニングを体験してください（約5分間）
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Boss Selection */}
            <div>
              <h3 className="text-lg font-semibold mb-3">上司タイプを選択</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {BOSS_PERSONAS.slice(0, 6).map((boss) => (
                  <Card
                    key={boss.id}
                    className={`cursor-pointer transition-all hover:shadow-md ${
                      selectedBoss.id === boss.id 
                        ? 'ring-2 ring-blue-500 bg-blue-50' 
                        : 'hover:bg-gray-50'
                    }`}
                    onClick={() => setSelectedBoss(boss)}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-medium">{boss.name}</h4>
                        <Badge variant={boss.difficulty === '初級' ? 'secondary' : boss.difficulty === '中級' ? 'default' : 'destructive'}>
                          {boss.difficulty}
                        </Badge>
                      </div>
                      <p className="text-sm text-gray-600">{boss.description}</p>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>

            {/* Scenario Selection */}
            <div>
              <h3 className="text-lg font-semibold mb-3">シナリオを選択</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {SCENARIOS.slice(0, 4).map((scenario) => (
                  <Card
                    key={scenario.id}
                    className={`cursor-pointer transition-all hover:shadow-md ${
                      selectedScenario.id === scenario.id 
                        ? 'ring-2 ring-blue-500 bg-blue-50' 
                        : 'hover:bg-gray-50'
                    }`}
                    onClick={() => setSelectedScenario(scenario)}
                  >
                    <CardContent className="p-4">
                      <h4 className="font-medium mb-2">{scenario.title}</h4>
                      <p className="text-sm text-gray-600">{scenario.description}</p>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>

            {/* Demo Start Button */}
            <div className="flex justify-center pt-4">
              <Button onClick={startDemo} size="lg" className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700">
                <Play className="h-5 w-5 mr-2" />
                デモを開始する（5分間）
                <ArrowRight className="h-5 w-5 ml-2" />
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Features Section */}
        <Card className="mb-8 shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>主な機能</span>
              <Button 
                variant="ghost" 
                size="sm"
                onClick={() => setShowFeatures(!showFeatures)}
              >
                {showFeatures ? '閉じる' : '詳細を見る'}
              </Button>
            </CardTitle>
          </CardHeader>
          {showFeatures && (
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {demoFeatures.map((feature, index) => (
                  <div key={index} className="flex items-start space-x-3">
                    <feature.icon className={`h-6 w-6 mt-1 ${feature.color}`} />
                    <div>
                      <h4 className="font-medium mb-1">{feature.title}</h4>
                      <p className="text-sm text-gray-600">{feature.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          )}
        </Card>

        {/* How it Works */}
        <Card className="mb-8 shadow-lg">
          <CardHeader>
            <CardTitle>使い方</CardTitle>
            <CardDescription>
              3つの簡単なステップでコミュニケーションスキルを向上
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="text-center">
                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-blue-600 font-bold text-lg">1</span>
                </div>
                <h3 className="font-semibold mb-2">設定選択</h3>
                <p className="text-sm text-gray-600">上司のタイプとシナリオを選んで、ストレスレベルを設定</p>
              </div>
              <div className="text-center">
                <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-green-600 font-bold text-lg">2</span>
                </div>
                <h3 className="font-semibold mb-2">対話実践</h3>
                <p className="text-sm text-gray-600">AIボスとリアルタイムで会話し、様々なシチュエーションを体験</p>
              </div>
              <div className="text-center">
                <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-purple-600 font-bold text-lg">3</span>
                </div>
                <h3 className="font-semibold mb-2">分析・改善</h3>
                <p className="text-sm text-gray-600">パフォーマンス分析を確認し、具体的な改善点を把握</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <Card className="text-center p-6">
            <Users className="h-8 w-8 mx-auto mb-2 text-blue-600" />
            <div className="text-2xl font-bold">6種類</div>
            <div className="text-sm text-gray-600">上司タイプ</div>
          </Card>
          <Card className="text-center p-6">
            <Target className="h-8 w-8 mx-auto mb-2 text-green-600" />
            <div className="text-2xl font-bold">10+</div>
            <div className="text-sm text-gray-600">シナリオ</div>
          </Card>
          <Card className="text-center p-6">
            <TrendingUp className="h-8 w-8 mx-auto mb-2 text-purple-600" />
            <div className="text-2xl font-bold">リアルタイム</div>
            <div className="text-sm text-gray-600">分析機能</div>
          </Card>
          <Card className="text-center p-6">
            <Clock className="h-8 w-8 mx-auto mb-2 text-orange-600" />
            <div className="text-2xl font-bold">5-30分</div>
            <div className="text-sm text-gray-600">カスタム時間</div>
          </Card>
        </div>

        {/* Call to Action */}
        <div className="text-center">
          <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg p-8 text-white">
            <h2 className="text-3xl font-bold mb-4">今すぐ始めよう</h2>
            <p className="text-xl mb-6 opacity-90">
              あなたのコミュニケーションスキル向上の第一歩を踏み出しましょう
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button onClick={startDemo} size="lg" variant="secondary" className="bg-white text-blue-600 hover:bg-gray-100">
                <Play className="h-5 w-5 mr-2" />
                デモを体験
              </Button>
              <Button asChild size="lg" variant="outline" className="border-white text-white hover:bg-white hover:text-blue-600">
                <Link href="/boss-select">
                  本格的に始める
                  <ArrowRight className="h-5 w-5 ml-2" />
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
