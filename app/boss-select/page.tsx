'use client';

import { useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { BOSS_PERSONAS, SCENARIOS, STRESS_LEVELS } from '@/constants';
import { 
  User, 
  Zap, 
  Shield, 
  Target, 
  Clock, 
  PlayCircle,
  ArrowLeft,
  Settings
} from 'lucide-react';

interface BossPersona {
  id: string;
  name: string;
  description: string;
  difficulty: '初級' | '中級' | '上級';
  traits: string[];
  scenario_types: string[];
}

function BossSelectContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const difficultyFilter = searchParams.get('difficulty') as '初級' | '中級' | '上級' | null;
  
  const [selectedBoss, setSelectedBoss] = useState<string | null>(null);
  const [selectedScenario, setSelectedScenario] = useState<string | null>(null);
  const [stressLevel, setStressLevel] = useState<number>(3);
  const [sessionDuration, setSessionDuration] = useState<number>(15);

  // Filter boss personas based on difficulty
  const filteredPersonas = difficultyFilter 
    ? BOSS_PERSONAS.filter(boss => boss.difficulty === difficultyFilter)
    : BOSS_PERSONAS;

  // Get available scenarios for selected boss
  const availableScenarios = selectedBoss 
    ? SCENARIOS.filter(scenario => {
        const boss = BOSS_PERSONAS.find(b => b.id === selectedBoss);
        if (!boss) return false;
        return (boss.scenario_types as readonly string[]).includes(scenario.category);
      })
    : SCENARIOS;

  const handleStartTraining = () => {
    if (!selectedBoss || !selectedScenario) {
      return;
    }

    const params = new URLSearchParams({
      boss: selectedBoss,
      scenario: selectedScenario,
      stress: stressLevel.toString(),
      duration: sessionDuration.toString(),
    });

    router.push(`/training?${params.toString()}`);
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case '初級': return 'bg-green-100 text-green-800';
      case '中級': return 'bg-yellow-100 text-yellow-800';
      case '上級': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getDifficultyIcon = (difficulty: string) => {
    switch (difficulty) {
      case '初級': return Shield;
      case '中級': return Target;
      case '上級': return Zap;
      default: return User;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="space-y-2">
          <div className="flex items-center space-x-2">
            <Button variant="ghost" size="sm" onClick={() => router.back()}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              戻る
            </Button>
          </div>
          <h1 className="text-3xl font-bold text-gray-900">訓練設定を選択</h1>
          <p className="text-gray-600">
            上司のパーソナリティ、シナリオ、難易度レベルを選択して訓練セッションを開始してください。
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Boss Selection */}
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <User className="h-5 w-5" />
                <span>上司のパーソナリティを選択</span>
              </CardTitle>
              <CardDescription>
                コミュニケーション訓練をする上司のタイプを選択してください
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {filteredPersonas.map((boss) => {
                  const DifficultyIcon = getDifficultyIcon(boss.difficulty);
                  return (
                    <Card 
                      key={boss.id}
                      className={`cursor-pointer transition-all hover:shadow-md ${
                        selectedBoss === boss.id ? 'ring-2 ring-blue-500 bg-blue-50' : ''
                      }`}
                      onClick={() => setSelectedBoss(boss.id)}
                    >
                      <CardContent className="p-4">
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex items-center space-x-2">
                            <DifficultyIcon className="h-5 w-5 text-gray-600" />
                            <h3 className="font-semibold">{boss.name}</h3>
                          </div>
                          <Badge className={getDifficultyColor(boss.difficulty)}>
                            {boss.difficulty}
                          </Badge>
                        </div>
                        <p className="text-sm text-gray-600 mb-3">{boss.description}</p>
                        <div className="flex flex-wrap gap-1">
                          {boss.traits.slice(0, 3).map((trait) => (
                            <Badge key={trait} variant="outline" className="text-xs">
                              {trait}
                            </Badge>
                          ))}
                          {boss.traits.length > 3 && (
                            <Badge variant="outline" className="text-xs">
                              +{boss.traits.length - 3} more
                            </Badge>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            </CardContent>
          </Card>

          {/* Scenario Selection */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Target className="h-5 w-5" />
                <span>シナリオを選択</span>
              </CardTitle>
              <CardDescription>
                練習したい状況のタイプを選択してください
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {availableScenarios.map((scenario) => (
                  <Card 
                    key={scenario.id}
                    className={`cursor-pointer transition-all hover:shadow-md ${
                      selectedScenario === scenario.id ? 'ring-2 ring-blue-500 bg-blue-50' : ''
                    }`}
                    onClick={() => setSelectedScenario(scenario.id)}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between mb-2">
                        <h3 className="font-semibold">{scenario.title}</h3>
                        <Badge variant="outline">{scenario.category}</Badge>
                      </div>
                      <p className="text-sm text-gray-600 mb-3">{scenario.description}</p>
                      <div className="flex items-center space-x-4 text-xs text-gray-500">
                        <span>難易度: {scenario.difficulty}/10</span>
                        <span>時間: ~{scenario.estimated_duration}分</span>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Configuration Panel */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Settings className="h-5 w-5" />
                <span>セッション設定</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Stress Level */}
              <div>
                <label className="text-sm font-medium mb-3 block">
                  ストレスレベル: {stressLevel}/10
                </label>
                <div className="space-y-2">
                  <input
                    type="range"
                    min="1"
                    max="10"
                    value={stressLevel}
                    onChange={(e) => setStressLevel(Number(e.target.value))}
                    className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                  />
                  <div className="flex justify-between text-xs text-gray-500">
                    <span>穏やか</span>
                    <span>激しい</span>
                  </div>
                </div>
                <p className="text-xs text-gray-600 mt-2">
                  {STRESS_LEVELS.find(level => level.value === stressLevel)?.description}
                </p>
              </div>

              {/* Session Duration */}
              <div>
                <label className="text-sm font-medium mb-3 block">
                  セッション時間
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {[10, 15, 30].map((duration) => (
                    <Button
                      key={duration}
                      variant={sessionDuration === duration ? "default" : "outline"}
                      size="sm"
                      onClick={() => setSessionDuration(duration)}
                    >
                      {duration}m
                    </Button>
                  ))}
                </div>
              </div>

              {/* Selected Configuration Summary */}
              {(selectedBoss || selectedScenario) && (
                <div className="p-4 bg-gray-50 rounded-lg space-y-2">
                  <h4 className="font-medium text-sm">訓練設定:</h4>
                  {selectedBoss && (
                    <p className="text-xs text-gray-600">
                      上司: {BOSS_PERSONAS.find(b => b.id === selectedBoss)?.name}
                    </p>
                  )}
                  {selectedScenario && (
                    <p className="text-xs text-gray-600">
                      シナリオ: {SCENARIOS.find(s => s.id === selectedScenario)?.title}
                    </p>
                  )}
                  <p className="text-xs text-gray-600">
                    ストレスレベル: {stressLevel}/10 • 時間: {sessionDuration}分
                  </p>
                </div>
              )}

              {/* Start Button */}
              <Button 
                onClick={handleStartTraining}
                disabled={!selectedBoss || !selectedScenario}
                className="w-full"
                size="lg"
              >
                <PlayCircle className="mr-2 h-5 w-5" />
                訓練セッションを開始
              </Button>

              {(!selectedBoss || !selectedScenario) && (
                <p className="text-xs text-gray-500 text-center">
                  開始するには上司とシナリオの両方を選択してください
                </p>
              )}
            </CardContent>
          </Card>

          {/* Quick Tips */}
          <Card>
            <CardHeader>
              <CardTitle className="text-sm">訓練のコツ</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-xs text-gray-600">
              <div className="flex items-start space-x-2">
                <div className="w-2 h-2 bg-blue-500 rounded-full mt-1.5 flex-shrink-0"></div>
                <p>新しい上司タイプの場合は、低いストレスレベルから始めましょう</p>
              </div>
              <div className="flex items-start space-x-2">
                <div className="w-2 h-2 bg-blue-500 rounded-full mt-1.5 flex-shrink-0"></div>
                <p>バリエーションを増やすため、同じシナリオを異なる上司で練習してみましょう</p>
              </div>
              <div className="flex items-start space-x-2">
                <div className="w-2 h-2 bg-blue-500 rounded-full mt-1.5 flex-shrink-0"></div>
                <p>複雑なシナリオにはより長いセッション時間を使用しましょう</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

export default function BossSelectPage() {
  return (
    <Suspense fallback={<div className="flex items-center justify-center min-h-screen">Loading...</div>}>
      <BossSelectContent />
    </Suspense>
  );
}
