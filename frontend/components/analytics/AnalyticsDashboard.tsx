import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { TrendingUp, TrendingDown, Target, Clock, MessageCircle, Award } from 'lucide-react';

interface AnalyticsData {
  overallScore: number;
  sessionsCompleted: number;
  averageResponseTime: number;
  improvementTrend: 'up' | 'down' | 'stable';
  strongestSkills: string[];
  areasForImprovement: string[];
  recentScores: number[];
  favoriteScenarios: string[];
}

interface AnalyticsDashboardProps {
  data: AnalyticsData;
}

export function AnalyticsDashboard({ data }: AnalyticsDashboardProps) {
  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'up':
        return <TrendingUp className="h-4 w-4 text-green-600" />;
      case 'down':
        return <TrendingDown className="h-4 w-4 text-red-600" />;
      default:
        return <Target className="h-4 w-4 text-gray-600" />;
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600';
    if (score >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  return (
    <div className="space-y-6">
      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Overall Score</CardTitle>
            <Award className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${getScoreColor(data.overallScore)}`}>
              {data.overallScore}%
            </div>
            <div className="flex items-center space-x-1 text-xs text-muted-foreground">
              {getTrendIcon(data.improvementTrend)}
              <span>vs last week</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Sessions Completed</CardTitle>
            <MessageCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data.sessionsCompleted}</div>
            <p className="text-xs text-muted-foreground">
              Training sessions completed
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg Response Time</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data.averageResponseTime}s</div>
            <p className="text-xs text-muted-foreground">
              Average thinking time
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Progress</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <Progress value={data.overallScore} className="w-full" />
            <p className="text-xs text-muted-foreground mt-2">
              Goal: 85% proficiency
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Skills Analysis */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Strongest Skills</CardTitle>
            <CardDescription>Areas where you excel</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {data.strongestSkills.map((skill, index) => (
                <div key={index} className="flex items-center justify-between">
                  <span className="text-sm">{skill}</span>
                  <Badge variant="default">Strong</Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Areas for Improvement</CardTitle>
            <CardDescription>Focus areas for next sessions</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {data.areasForImprovement.map((area, index) => (
                <div key={index} className="flex items-center justify-between">
                  <span className="text-sm">{area}</span>
                  <Badge variant="outline">Practice</Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Performance */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Performance</CardTitle>
          <CardDescription>Your last 7 training sessions</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-end space-x-2 h-40">
            {data.recentScores.map((score, index) => (
              <div key={index} className="flex-1 flex flex-col items-center">
                <div 
                  className={`w-full rounded-t ${
                    score >= 80 ? 'bg-green-500' : 
                    score >= 60 ? 'bg-yellow-500' : 'bg-red-500'
                  }`}
                  style={{ height: `${(score / 100) * 120}px` }}
                />
                <span className="text-xs mt-2">{score}%</span>
                <span className="text-xs text-muted-foreground">S{index + 1}</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Favorite Scenarios */}
      <Card>
        <CardHeader>
          <CardTitle>Favorite Training Scenarios</CardTitle>
          <CardDescription>Most practiced scenario types</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
            {data.favoriteScenarios.map((scenario, index) => (
              <Badge key={index} variant="secondary" className="justify-center p-2">
                {scenario}
              </Badge>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
