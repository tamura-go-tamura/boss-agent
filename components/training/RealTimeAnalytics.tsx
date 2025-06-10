import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  TrendingUp, 
  TrendingDown, 
  Clock, 
  MessageCircle, 
  Target,
  Brain,
  Zap
} from 'lucide-react';

interface RealTimeAnalyticsProps {
  stressLevel: number;
  confidenceLevel: number;
  responseTime: number;
  messageCount: number;
  sessionDuration: number;
  improvements: string[];
  strengths: string[];
}

export function RealTimeAnalytics({
  stressLevel,
  confidenceLevel,
  responseTime,
  messageCount,
  sessionDuration,
  improvements,
  strengths
}: RealTimeAnalyticsProps) {
  const getStressColor = (level: number) => {
    if (level > 70) return 'text-red-600';
    if (level > 40) return 'text-yellow-600';
    return 'text-green-600';
  };

  const getConfidenceColor = (level: number) => {
    if (level > 70) return 'text-green-600';
    if (level > 40) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getResponseTimeColor = (time: number) => {
    if (time < 3000) return 'text-green-600'; // < 3 seconds
    if (time < 10000) return 'text-yellow-600'; // < 10 seconds
    return 'text-red-600'; // > 10 seconds
  };

  const formatTime = (ms: number) => {
    if (ms < 1000) return `${ms}ms`;
    return `${(ms / 1000).toFixed(1)}s`;
  };

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const overallScore = Math.round((confidenceLevel + (100 - stressLevel)) / 2);
  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600';
    if (score >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  return (
    <Card className="w-full">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg flex items-center space-x-2">
          <Brain className="h-5 w-5" />
          <span>リアルタイム分析</span>
        </CardTitle>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* Overall Score */}
        <div className="p-3 bg-gray-50 rounded-lg">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium">総合パフォーマンス</span>
            <span className={`text-lg font-bold ${getScoreColor(overallScore)}`}>
              {overallScore}%
            </span>
          </div>
          <Progress value={overallScore} className="h-2" />
        </div>

        {/* Key Metrics Grid */}
        <div className="grid grid-cols-2 gap-3">
          {/* Stress Level */}
          <div className="p-3 border rounded-lg">
            <div className="flex items-center space-x-2 mb-1">
              <Zap className="h-4 w-4 text-gray-600" />
              <span className="text-xs font-medium text-gray-600">ストレス</span>
            </div>
            <div className="flex items-center space-x-2">
              <span className={`text-lg font-bold ${getStressColor(stressLevel)}`}>
                {stressLevel}%
              </span>
              {stressLevel > 50 ? (
                <TrendingUp className="h-4 w-4 text-red-500" />
              ) : (
                <TrendingDown className="h-4 w-4 text-green-500" />
              )}
            </div>
            <Progress value={stressLevel} className="h-1 mt-1" />
          </div>

          {/* Confidence Level */}
          <div className="p-3 border rounded-lg">
            <div className="flex items-center space-x-2 mb-1">
              <Target className="h-4 w-4 text-gray-600" />
              <span className="text-xs font-medium text-gray-600">自信度</span>
            </div>
            <div className="flex items-center space-x-2">
              <span className={`text-lg font-bold ${getConfidenceColor(confidenceLevel)}`}>
                {confidenceLevel}%
              </span>
              {confidenceLevel > 50 ? (
                <TrendingUp className="h-4 w-4 text-green-500" />
              ) : (
                <TrendingDown className="h-4 w-4 text-red-500" />
              )}
            </div>
            <Progress value={confidenceLevel} className="h-1 mt-1" />
          </div>

          {/* Response Time */}
          <div className="p-3 border rounded-lg">
            <div className="flex items-center space-x-2 mb-1">
              <Clock className="h-4 w-4 text-gray-600" />
              <span className="text-xs font-medium text-gray-600">応答時間</span>
            </div>
            <span className={`text-lg font-bold ${getResponseTimeColor(responseTime)}`}>
              {formatTime(responseTime)}
            </span>
          </div>

          {/* Message Count */}
          <div className="p-3 border rounded-lg">
            <div className="flex items-center space-x-2 mb-1">
              <MessageCircle className="h-4 w-4 text-gray-600" />
              <span className="text-xs font-medium text-gray-600">メッセージ数</span>
            </div>
            <span className="text-lg font-bold text-blue-600">
              {messageCount}
            </span>
          </div>
        </div>

        {/* Session Info */}
        <div className="p-3 bg-blue-50 rounded-lg">
          <div className="flex items-center justify-between text-sm">
            <span className="text-blue-800 font-medium">セッション時間</span>
            <span className="text-blue-600 font-mono">{formatDuration(sessionDuration)}</span>
          </div>
        </div>

        {/* Quick Insights */}
        <div className="space-y-2">
          {strengths.length > 0 && (
            <div className="p-2 bg-green-50 rounded border-l-4 border-green-400">
              <div className="flex items-center space-x-2 mb-1">
                <span className="text-green-600 text-xs font-medium">✓ 強み</span>
              </div>
              <ul className="text-xs text-green-800 space-y-1">
                {strengths.slice(0, 2).map((strength, index) => (
                  <li key={index}>• {strength}</li>
                ))}
              </ul>
            </div>
          )}

          {improvements.length > 0 && (
            <div className="p-2 bg-yellow-50 rounded border-l-4 border-yellow-400">
              <div className="flex items-center space-x-2 mb-1">
                <span className="text-yellow-600 text-xs font-medium">⚡ 改善点</span>
              </div>
              <ul className="text-xs text-yellow-800 space-y-1">
                {improvements.slice(0, 2).map((improvement, index) => (
                  <li key={index}>• {improvement}</li>
                ))}
              </ul>
            </div>
          )}
        </div>

        {/* Performance Tips */}
        <div className="p-3 bg-gray-50 rounded-lg">
          <h5 className="text-xs font-medium text-gray-700 mb-2">💡 Quick Tips</h5>
          <div className="text-xs text-gray-600 space-y-1">
            {stressLevel > 70 && (
              <p>• Take a deep breath and think before responding</p>
            )}
            {confidenceLevel < 40 && (
              <p>• Be more assertive in your communication</p>
            )}
            {responseTime > 10000 && (
              <p>• Try to respond more quickly to show engagement</p>
            )}
            {messageCount < 3 && (
              <p>• Engage more actively in the conversation</p>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
