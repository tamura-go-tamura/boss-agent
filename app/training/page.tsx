'use client';

import { useState, useEffect, useRef, useCallback, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { BOSS_PERSONAS, SCENARIOS, QUICK_RESPONSES } from '@/constants';
import { createSupabaseClient } from '@/lib/supabase-client';
import { ResponseSuggestions } from '@/components/training/ResponseSuggestions';
import { RealTimeAnalytics } from '@/components/training/RealTimeAnalytics';
import { KeyboardShortcuts } from '@/components/training/KeyboardShortcuts';
import { BossEmotionalAnalyzer } from '@/components/training/BossEmotionalAnalyzer';
import {
  MessageCircle,
  Send,
  RotateCcw,
  Pause,
  Play,
  Square,
  ArrowLeft,
  Lightbulb,
  TrendingUp,
  BarChart3,
  Keyboard,
  HelpCircle
} from 'lucide-react';

interface Message {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: Date;
}

function TrainingContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const supabase = createSupabaseClient();
  
  // URL Parameters
  const bossId = searchParams.get('boss');
  const scenarioId = searchParams.get('scenario');
  const stressLevel = Number(searchParams.get('stress')) || 3;
  const duration = Number(searchParams.get('duration')) || 15;

  // Find the selected boss and scenario
  const selectedBoss = BOSS_PERSONAS.find(boss => boss.id === bossId);
  const selectedScenario = SCENARIOS.find(scenario => scenario.id === scenarioId);

  // State
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [sessionStarted, setSessionStarted] = useState(false);
  const [timeRemaining, setTimeRemaining] = useState(duration * 60);
  const [isPaused, setIsPaused] = useState(false);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [showQuickResponses, setShowQuickResponses] = useState(false);
  const [showAnalytics, setShowAnalytics] = useState(false);
  const [showKeyboardHelp, setShowKeyboardHelp] = useState(false);
  const [showBossMood, setShowBossMood] = useState(true);
  
  // Real-time metrics
  const [currentStressLevel, setCurrentStressLevel] = useState(stressLevel * 10);
  const [currentConfidenceLevel, setCurrentConfidenceLevel] = useState(100 - stressLevel * 8);
  const [responseTimeStart, setResponseTimeStart] = useState<number | null>(null);
  const [lastBossMessage, setLastBossMessage] = useState<string>('');
  const [lastUserMessage, setLastUserMessage] = useState<string>('');
  const [currentBossEmotion, setCurrentBossEmotion] = useState<string>('落ち着き');
  const [bossEmotionIntensity, setBossEmotionIntensity] = useState<number>(30);
  const [strengths, setStrengths] = useState<string[]>(['明確なコミュニケーション', 'プロフェッショナルな口調']);
  const [improvements, setImprovements] = useState<string[]>(['より具体的に説明する', 'フォローアップの質問をする']);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Function declarations
  const endSession = useCallback(async () => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
    }

    const messageCount = messages.filter(m => m.role === 'user').length;
    const score = Math.min(100, messageCount * 10 + (duration * 60 - timeRemaining) / 10);
    const skipAuth = process.env.NODE_ENV === 'development' && process.env.NEXT_PUBLIC_SKIP_AUTH === 'true';

    try {
      if (!skipAuth && supabase && sessionId) {
        await supabase.from('training_sessions').insert({
          id: sessionId,
          user_id: 'demo-user',
          boss_persona: selectedBoss?.name,
          scenario: selectedScenario?.title,
          duration_seconds: duration * 60 - timeRemaining,
          message_count: messageCount,
          score: score,
          stress_level: currentStressLevel,
          confidence_level: currentConfidenceLevel,
          completed_at: new Date().toISOString(),
        });
      }
    } catch (error) {
      console.warn('Error saving session (expected in development):', error);
    }

    router.push(`/results?session=${sessionId}&score=${score}`);
  }, [messages, duration, timeRemaining, currentStressLevel, currentConfidenceLevel, sessionId, supabase, router]);

  const updateAnalytics = (userInput: string) => {
    const inputLength = userInput.length;
    const hasQuestionMarks = (userInput.match(/？/g) || []).length;
    const hasConfidentWords = /\b(絶対に|確実に|自信を持って|間違いなく|必ず|できます)\b/i.test(userInput);
    const hasUncertainWords = /\b(たぶん|おそらく|かもしれません|よく分からない|思います|多分)\b/i.test(userInput);
    
    if (hasConfidentWords && inputLength > 20) {
      setCurrentConfidenceLevel(prev => Math.min(100, prev + 5));
      setCurrentStressLevel(prev => Math.max(0, prev - 3));
    } else if (hasUncertainWords || inputLength < 10) {
      setCurrentConfidenceLevel(prev => Math.max(0, prev - 3));
      setCurrentStressLevel(prev => Math.min(100, prev + 5));
    }

    if (hasQuestionMarks > 0) {
      setStrengths(prev => Array.from(new Set([...prev, '明確化のための質問をする'])));
    }

    if (inputLength > 50) {
      setStrengths(prev => Array.from(new Set([...prev, '詳細な回答を提供する'])));
    }

    if (hasUncertainWords) {
      setImprovements(prev => Array.from(new Set([...prev, 'より自信のある言葉遣いを使う'])));
    }
  };

  const handleSuggestionSelect = (suggestionText: string) => {
    setInputMessage(suggestionText);
    setShowQuickResponses(false);
    inputRef.current?.focus();
  };

  const handleQuickResponse = (response: string) => {
    setInputMessage(response);
    setShowQuickResponses(false);
    inputRef.current?.focus();
  };

  // Keyboard shortcuts handler
  const handleKeyboardShortcut = (e: KeyboardEvent) => {
    // Only handle shortcuts when not typing in input
    if (e.target === inputRef.current) return;

    switch (e.key) {
      case 'Escape':
        setInputMessage('');
        setShowQuickResponses(false);
        setShowKeyboardHelp(false);
        break;
      case '?':
        if (e.shiftKey) {
          e.preventDefault();
          setShowKeyboardHelp(!showKeyboardHelp);
        }
        break;
      case 's':
        if (e.ctrlKey || e.metaKey) {
          e.preventDefault();
          setShowQuickResponses(!showQuickResponses);
        }
        break;
      case 'a':
        if (e.ctrlKey || e.metaKey) {
          e.preventDefault();
          setShowAnalytics(!showAnalytics);
        }
        break;
      case 'm':
        if (e.ctrlKey || e.metaKey) {
          e.preventDefault();
          setShowBossMood(!showBossMood);
        }
        break;
      case ' ':
        if (!sessionStarted) {
          e.preventDefault();
          startSession();
        } else {
          e.preventDefault();
          pauseSession();
        }
        break;
    }
  };

  // Effects
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  useEffect(() => {
    document.addEventListener('keydown', handleKeyboardShortcut);
    return () => document.removeEventListener('keydown', handleKeyboardShortcut);
  }, [sessionStarted, showQuickResponses, showAnalytics, showKeyboardHelp, showBossMood, handleKeyboardShortcut]);

  useEffect(() => {
    if (sessionStarted && !isPaused && timeRemaining > 0) {
      timerRef.current = setInterval(() => {
        setTimeRemaining(prev => {
          if (prev <= 1) {
            endSession();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } else {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    }

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [sessionStarted, isPaused, timeRemaining, endSession]);

  useEffect(() => {
    if (selectedBoss && selectedScenario) {
      initializeSession();
    }
  }, [selectedBoss, selectedScenario]);

  const initializeSession = useCallback(async () => {
    if (!selectedBoss || !selectedScenario) return;

    try {
      const skipAuth = process.env.NODE_ENV === 'development' && process.env.NEXT_PUBLIC_SKIP_AUTH === 'true';
      let userId = 'demo-user';
      
      if (!skipAuth) {
        const { data: { session } } = await supabase.auth.getSession();
        if (!session) {
          router.push('/auth/signin');
          return;
        }
        userId = session.user.id;
      }

      let newSession;
      if (!skipAuth) {
        const { data, error } = await supabase
          .from('training_sessions')
          .insert({
            user_id: userId,
            boss_persona: selectedBoss.id,
            scenario_id: selectedScenario.id,
            stress_level: stressLevel,
            duration_minutes: duration,
          })
          .select()
          .single();

        if (error) {
          console.error('Error creating session:', error);
          return;
        }
        newSession = data;
      } else {
        newSession = {
          id: `demo-session-${Date.now()}`,
          user_id: userId,
          boss_persona: selectedBoss.id,
          scenario_id: selectedScenario.id,
          stress_level: stressLevel,
          duration_minutes: duration,
        };
      }

      setSessionId(newSession.id);

      const systemMessage: Message = {
        id: 'system-init',
        role: 'system',
        content: `Training session initialized. You will be communicating with ${selectedBoss.name} about: ${selectedScenario.title}. Stress level: ${stressLevel}/10. Good luck!`,
        timestamp: new Date(),
      };

      const bossMessage: Message = {
        id: 'boss-init',
        role: 'assistant',
        content: getInitialBossMessage(),
        timestamp: new Date(),
      };

      setMessages([systemMessage, bossMessage]);
      setLastBossMessage(bossMessage.content);
      
    } catch (error) {
      console.error('Error initializing session:', error);
    }
  }, [selectedBoss, selectedScenario, stressLevel, duration, supabase, router]);

  const getInitialBossMessage = () => {
    if (!selectedBoss || !selectedScenario) return "Let's begin our conversation.";

    const greetings = {
      supportive: "Hi there! I'm looking forward to our discussion about ",
      demanding: "Alright, let's get straight to the point about ",
      micromanager: "I need to go over every detail regarding ",
      'passive-aggressive': "Oh, so we're finally going to talk about ",
      volatile: "We need to discuss this immediately - ",
      analytical: "I've reviewed the data and we need to discuss ",
    };

    const greeting = greetings[selectedBoss.id as keyof typeof greetings] || "Let's discuss ";
    return greeting + selectedScenario.title.toLowerCase() + ". What's your take on the current situation?";
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const sendMessage = async () => {
    if (!inputMessage.trim() || isLoading || !sessionId) return;

    setResponseTimeStart(null);

    const userMessage: Message = {
      id: `user-${Date.now()}`,
      role: 'user',
      content: inputMessage.trim(),
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    setLastUserMessage(inputMessage.trim());
    setInputMessage('');
    setIsLoading(true);

    try {
      const bossResponse = await generateBossResponse(userMessage.content);
      
      const assistantMessage: Message = {
        id: `assistant-${Date.now()}`,
        role: 'assistant',
        content: bossResponse,
        timestamp: new Date(),
      };

      setMessages(prev => [...prev, assistantMessage]);
      setLastBossMessage(assistantMessage.content);
      updateAnalytics(userMessage.content);
      setResponseTimeStart(Date.now());
    } catch (error) {
      console.error('Error sending message:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const generateBossResponse = async (userInput: string): Promise<string> => {
    if (!selectedBoss || !sessionId) return "I see.";

    try {
      const { generateBossResponse } = await import('@/services/gcp/gemini');
      
      const conversationHistory = messages
        .filter(m => m.role !== 'system')
        .map(m => ({ 
          role: m.role as 'user' | 'assistant',
          content: m.content
        }));

      const userState = {
        stressLevel: currentStressLevel,
        confidenceLevel: currentConfidenceLevel,
        responseTime: responseTimeStart ? Date.now() - responseTimeStart : 0
      };

      return await generateBossResponse(userInput, selectedBoss, conversationHistory, userState);
    } catch (error) {
      console.error('Error generating AI response:', error);
      
      const fallbackResponses = {
        supportive: "I appreciate your perspective. How can I help you with this?",
        demanding: "I need more specifics. What's your action plan?",
        micromanager: "Walk me through your process step by step.",
        'passive-aggressive': "Interesting approach... if that's what you think is best.",
        volatile: "This isn't acceptable! What are you going to do about it?",
        analytical: "Show me the data that supports this conclusion."
      };
      
      return fallbackResponses[selectedBoss.id as keyof typeof fallbackResponses] || "Please continue.";
    }
  };

  const startSession = () => {
    setSessionStarted(true);
  };

  const pauseSession = () => {
    setIsPaused(!isPaused);
  };

  if (!selectedBoss || !selectedScenario) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle>無効なセッション</CardTitle>
            <CardDescription>
              訓練を開始するには上司とシナリオを選択してください。
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button asChild className="w-full">
              <Link href="/boss-select">訓練設定を選択</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto space-y-4">
      {/* Header */}
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Button variant="ghost" size="sm" onClick={() => router.push('/boss-select')}>
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back
              </Button>
              <div>
                <h1 className="text-xl font-bold">{selectedScenario.title}</h1>
                <p className="text-sm text-muted-foreground">
                  with {selectedBoss.name} • Stress Level {stressLevel}/10
                </p>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <div className="text-center">
                <div className="text-lg font-mono font-bold">
                  {formatTime(timeRemaining)}
                </div>
                <div className="text-xs text-muted-foreground">残り時間</div>
              </div>
              
              {!sessionStarted ? (
                <Button onClick={startSession} className="bg-green-600 hover:bg-green-700">
                  <Play className="h-4 w-4 mr-2" />
                  開始
                </Button>
              ) : (
                <div className="flex space-x-2">
                  <Button variant="outline" size="sm" onClick={pauseSession}>
                    {isPaused ? <Play className="h-4 w-4" /> : <Pause className="h-4 w-4" />}
                  </Button>
                  <Button variant="destructive" size="sm" onClick={endSession}>
                    <Square className="h-4 w-4" />
                  </Button>
                  <Button 
                    variant="ghost" 
                    size="sm"
                    onClick={() => setShowAnalytics(!showAnalytics)}
                  >
                    <BarChart3 className="h-4 w-4" />
                  </Button>
                  <Button 
                    variant="ghost" 
                    size="sm"
                    onClick={() => setShowKeyboardHelp(!showKeyboardHelp)}
                  >
                    <HelpCircle className="h-4 w-4" />
                  </Button>
                </div>
              )}
            </div>
          </div>
          
          <div className="mt-4">
            <Progress value={(1 - timeRemaining / (duration * 60)) * 100} className="h-2" />
          </div>
        </CardContent>
      </Card>

      {/* Keyboard Shortcuts Help */}
      {showKeyboardHelp && (
        <div className="fixed inset-0 z-30">
          <KeyboardShortcuts onClose={() => setShowKeyboardHelp(false)} />
        </div>
      )}

      {/* Main Content - Single Screen Layout */}
      <div className="grid grid-cols-12 gap-4 h-[calc(100vh-280px)]">
        {/* Left Side - Boss Mood & Analytics */}
        <div className="col-span-4 space-y-4 max-h-[calc(100vh-280px)] flex flex-col">
          {/* Boss Emotional Analysis - Always Visible */}
          {showBossMood && (
            <div className="flex-shrink-0">
              <BossEmotionalAnalyzer
                bossType={selectedBoss?.id || 'supportive'}
                stressLevel={currentStressLevel}
                userConfidence={currentConfidenceLevel}
                lastUserMessage={lastUserMessage}
                lastBossMessage={lastBossMessage}
                conversationTurn={messages.filter(m => m.role === 'user').length}
                responseTime={responseTimeStart ? Date.now() - responseTimeStart : 0}
                sessionDuration={duration * 60 - timeRemaining}
              />
            </div>
          )}

          {/* Analytics Panel - Scrollable */}
          {showAnalytics && (
            <div className="flex-1 overflow-y-auto">
              <RealTimeAnalytics
                stressLevel={currentStressLevel}
                confidenceLevel={currentConfidenceLevel}
                responseTime={responseTimeStart ? Date.now() - responseTimeStart : 0}
                messageCount={messages.filter(m => m.role === 'user').length}
                sessionDuration={duration * 60 - timeRemaining}
                improvements={improvements}
                strengths={strengths}
              />
            </div>
          )}

          {/* If both mood and analytics are hidden, show placeholder */}
          {!showBossMood && !showAnalytics && (
            <div className="flex-1">
              <Card className="backdrop-blur-sm bg-white/90 border-0 shadow-lg h-full">
                <CardContent className="p-6 text-center">
                  <div className="text-gray-500">
                    <BarChart3 className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p className="text-sm">分析パネルまたは上司の感情分析を有効にしてください</p>
                    <div className="mt-4 space-x-2">
                      <Button variant="outline" size="sm" onClick={() => setShowAnalytics(true)}>
                        分析表示
                      </Button>
                      <Button variant="outline" size="sm" onClick={() => setShowBossMood(true)}>
                        感情分析表示
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </div>

        {/* Right Side - Chat Interface */}
        <div className="col-span-8">
          <Card className="h-full max-h-[calc(100vh-280px)] flex flex-col backdrop-blur-sm bg-white/90 border-0 shadow-xl">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <MessageCircle className="h-5 w-5" />
                  <span className="font-medium">会話</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Badge variant="outline">
                    {selectedBoss.difficulty}
                  </Badge>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowQuickResponses(!showQuickResponses)}
                  >
                    <Lightbulb className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowBossMood(!showBossMood)}
                    className={`transition-all duration-200 ${
                      showBossMood ? 'bg-purple-100 text-purple-700' : 'hover:bg-purple-50'
                    }`}
                    title="上司の感情分析"
                  >
                    🧠
                  </Button>
                </div>
              </div>
            </CardHeader>
            
            <CardContent className="flex-1 flex flex-col space-y-4 p-4 min-h-0">
              {/* Messages */}
              <div className="flex-1 overflow-y-auto space-y-3 p-3 bg-gradient-to-br from-slate-50 to-blue-50 rounded-lg border min-h-0 max-h-[55vh]" style={{scrollbarWidth: 'thin'}}>
                {messages.map((message) => (
                  <div
                    key={message.id}
                    className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div
                      className={`max-w-[75%] rounded-xl px-4 py-3 shadow-sm transition-all duration-200 hover:shadow-md ${
                        message.role === 'user'
                          ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white'
                          : message.role === 'system'
                          ? 'bg-gradient-to-r from-gray-100 to-slate-100 text-gray-800 text-sm'
                          : 'bg-white border border-slate-200 backdrop-blur-sm'
                      }`}
                    >
                      <p className="text-sm leading-relaxed">{message.content}</p>
                      <p className="text-xs mt-2 opacity-70">
                        {message.timestamp.toLocaleTimeString()}
                      </p>
                    </div>
                  </div>
                ))}
                {isLoading && (
                  <div className="flex justify-start">
                    <div className="bg-white border border-slate-200 shadow-sm rounded-xl px-4 py-3 backdrop-blur-sm">
                      <div className="flex items-center space-x-3">
                        <div className="animate-pulse flex space-x-1">
                          <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce"></div>
                          <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce" style={{animationDelay: '0.1s'}}></div>
                          <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
                        </div>
                        <span className="text-xs text-slate-500">入力中...</span>
                      </div>
                    </div>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* Response Suggestions */}
              {showQuickResponses && lastBossMessage && (
                <ResponseSuggestions
                  bossMessage={lastBossMessage}
                  bossType={selectedBoss.id}
                  userStressLevel={currentStressLevel}
                  onSuggestionSelect={handleSuggestionSelect}
                  isVisible={showQuickResponses && lastBossMessage !== ''}
                />
              )}

              {/* Quick Responses */}
              {showQuickResponses && (
                <div className="p-3 bg-blue-50 rounded-lg flex-shrink-0">
                  <h4 className="text-sm font-medium mb-2">クイック返答:</h4>
                  <div className="grid grid-cols-2 gap-2">
                    {QUICK_RESPONSES.slice(0, 4).map((response, index) => (
                      <Button
                        key={index}
                        variant="ghost"
                        size="sm"
                        className="justify-start text-left h-auto p-2 text-xs"
                        onClick={() => handleQuickResponse(response)}
                      >
                        {response}
                      </Button>
                    ))}
                  </div>
                </div>
              )}

              {/* Message Input */}
              <div className="space-y-2 flex-shrink-0">
                <div className="flex items-center justify-between p-2 bg-gray-50 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <div className="flex items-center space-x-2">
                      <MessageCircle className="h-4 w-4 text-gray-600" />
                      <span className="text-sm font-medium">チャット訓練</span>
                      <Badge variant="default" className="text-xs">
                        {messages.filter(m => m.role === 'user').length}
                      </Badge>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <TrendingUp className="h-4 w-4 text-gray-600" />
                      <Badge variant="secondary" className="text-xs">
                        {Math.round((currentConfidenceLevel + (100 - currentStressLevel)) / 2)}%
                      </Badge>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-1">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setShowQuickResponses(!showQuickResponses)}
                      className="h-8 w-8 p-0"
                    >
                      <Lightbulb className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setShowKeyboardHelp(!showKeyboardHelp)}
                      className="h-8 w-8 p-0"
                    >
                      <Keyboard className="h-4 w-4" />
                    </Button>
                  </div>
                </div>

                <div className="flex space-x-2">
                  <div className="flex-1 relative">
                    <Input
                      ref={inputRef}
                      value={inputMessage}
                      onChange={(e) => setInputMessage(e.target.value)}
                      placeholder={
                        !sessionStarted 
                          ? "スペースキーでセッション開始、または上の開始ボタンをクリック" 
                          : isPaused 
                          ? "セッション一時停止中 - 再開してチャットを続ける"
                          : "返答を入力... (Enterで送信、Escでクリア)"
                      }
                      disabled={!sessionStarted || isPaused || isLoading}
                      onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
                      className="pr-12"
                    />
                    <div className="absolute right-2 top-1/2 transform -translate-y-1/2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setInputMessage('')}
                        disabled={!inputMessage.trim()}
                      >
                        <RotateCcw className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                  <Button
                    onClick={sendMessage}
                    disabled={!sessionStarted || isPaused || isLoading || !inputMessage.trim()}
                  >
                    <Send className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

export default function TrainingPage() {
  return (
    <Suspense fallback={<div className="flex items-center justify-center min-h-screen">Loading...</div>}>
      <TrainingContent />
    </Suspense>
  );
}