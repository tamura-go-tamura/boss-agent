import { createSupabaseServerClient } from '@/lib/supabase-server';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import Link from 'next/link';
import { 
  BarChart3, 
  TrendingUp, 
  Target, 
  Clock, 
  Award,
  Calendar,
  User,
  Brain,
  ArrowUpRight,
  ArrowDownRight,
  Minus
} from 'lucide-react';
import { BOSS_PERSONAS, SCENARIOS } from '@/constants';

async function getUserSessions(userId: string) {
  const supabase = createSupabaseServerClient();
  
  const { data: sessions, error } = await supabase
    .from('training_sessions')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching sessions:', error);
    return [];
  }

  return sessions || [];
}

async function getDetailedStats(userId: string) {
  const supabase = createSupabaseServerClient();
  
  const { data: sessions, error } = await supabase
    .from('training_sessions')
    .select('*')
    .eq('user_id', userId);

  if (error || !sessions) {
    return {
      totalSessions: 0,
      completedSessions: 0,
      totalTime: 0,
      averageScore: 0,
      bossStats: {},
      scenarioStats: {},
      difficultyStats: {},
      recentTrend: 0,
      topSkills: [],
      improvementAreas: [],
    };
  }

  const completed = sessions.filter(s => s.completed_at && s.score !== null);
  const totalTime = sessions.reduce((sum, s) => sum + (s.duration_minutes || 0), 0);
  const averageScore = completed.length > 0 
    ? completed.reduce((sum, s) => sum + (s.score || 0), 0) / completed.length 
    : 0;

  // Boss statistics
  const bossStats = sessions.reduce((acc, session) => {
    const boss = session.boss_persona;
    if (!acc[boss]) {
      acc[boss] = { count: 0, totalScore: 0, completedCount: 0 };
    }
    acc[boss].count++;
    if (session.score !== null) {
      acc[boss].totalScore += session.score;
      acc[boss].completedCount++;
    }
    return acc;
  }, {} as Record<string, { count: number; totalScore: number; completedCount: number }>);

  // Scenario statistics  
  const scenarioStats = sessions.reduce((acc, session) => {
    const scenario = session.scenario_id;
    if (!acc[scenario]) {
      acc[scenario] = { count: 0, totalScore: 0, completedCount: 0 };
    }
    acc[scenario].count++;
    if (session.score !== null) {
      acc[scenario].totalScore += session.score;
      acc[scenario].completedCount++;
    }
    return acc;
  }, {} as Record<string, { count: number; totalScore: number; completedCount: number }>);

  // Calculate recent trend
  const recentSessions = completed.slice(0, 5);
  const olderSessions = completed.slice(5, 10);
  const recentAvg = recentSessions.length > 0 
    ? recentSessions.reduce((sum, s) => sum + (s.score || 0), 0) / recentSessions.length 
    : 0;
  const olderAvg = olderSessions.length > 0 
    ? olderSessions.reduce((sum, s) => sum + (s.score || 0), 0) / olderSessions.length 
    : 0;
  const recentTrend = olderAvg > 0 ? ((recentAvg - olderAvg) / olderAvg) * 100 : 0;

  return {
    totalSessions: sessions.length,
    completedSessions: completed.length,
    totalTime,
    averageScore: Math.round(averageScore),
    bossStats,
    scenarioStats,
    recentTrend: Math.round(recentTrend),
    topSkills: getTopSkills(bossStats, scenarioStats),
    improvementAreas: getImprovementAreas(bossStats, scenarioStats),
  };
}

function getTopSkills(bossStats: any, scenarioStats: any) {
  const skills: Array<{skill: string, score: number, type: string}> = [];
  
  // Analyze boss performance
  Object.entries(bossStats).forEach(([bossId, stats]: [string, any]) => {
    if (stats.completedCount > 0) {
      const avgScore = stats.totalScore / stats.completedCount;
      const boss = BOSS_PERSONAS.find(b => b.id === bossId);
      if (boss && avgScore >= 80) {
        skills.push({
          skill: `Communication with ${boss.name}`,
          score: Math.round(avgScore),
          type: 'boss'
        });
      }
    }
  });

  // Analyze scenario performance
  Object.entries(scenarioStats).forEach(([scenarioId, stats]: [string, any]) => {
    if (stats.completedCount > 0) {
      const avgScore = stats.totalScore / stats.completedCount;
      const scenario = SCENARIOS.find(s => s.id === scenarioId);
      if (scenario && avgScore >= 80) {
        skills.push({
          skill: scenario.title,
          score: Math.round(avgScore),
          type: 'scenario'
        });
      }
    }
  });

  return skills.sort((a, b) => b.score - a.score).slice(0, 5);
}

function getImprovementAreas(bossStats: any, scenarioStats: any) {
  const areas: Array<{area: string, score: number, type: string}> = [];
  
  // Find areas needing improvement
  Object.entries(bossStats).forEach(([bossId, stats]: [string, any]) => {
    if (stats.completedCount > 0) {
      const avgScore = stats.totalScore / stats.completedCount;
      const boss = BOSS_PERSONAS.find(b => b.id === bossId);
      if (boss && avgScore < 70) {
        areas.push({
          area: `Communication with ${boss.name}`,
          score: Math.round(avgScore),
          type: 'boss'
        });
      }
    }
  });

  Object.entries(scenarioStats).forEach(([scenarioId, stats]: [string, any]) => {
    if (stats.completedCount > 0) {
      const avgScore = stats.totalScore / stats.completedCount;
      const scenario = SCENARIOS.find(s => s.id === scenarioId);
      if (scenario && avgScore < 70) {
        areas.push({
          area: scenario.title,
          score: Math.round(avgScore),
          type: 'scenario'
        });
      }
    }
  });

  return areas.sort((a, b) => a.score - b.score).slice(0, 5);
}

export default async function AnalyticsPage() {
  const supabase = createSupabaseServerClient();
  const { data: { session } } = await supabase.auth.getSession();
  
  if (!session) {
    return null;
  }

  const [sessions, stats] = await Promise.all([
    getUserSessions(session.user.id),
    getDetailedStats(session.user.id),
  ]);

  const formatDuration = (minutes: number) => {
    if (minutes < 60) return `${minutes}m`;
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours}h ${mins}m`;
  };

  const getTrendIcon = (trend: number) => {
    if (trend > 5) return <ArrowUpRight className="h-4 w-4 text-green-600" />;
    if (trend < -5) return <ArrowDownRight className="h-4 w-4 text-red-600" />;
    return <Minus className="h-4 w-4 text-gray-600" />;
  };

  const getTrendColor = (trend: number) => {
    if (trend > 5) return 'text-green-600';
    if (trend < -5) return 'text-red-600';
    return 'text-gray-600';
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="space-y-2">
        <h1 className="text-3xl font-bold text-gray-900">訓練分析</h1>
        <p className="text-gray-600">
          コミュニケーションスキルの向上を追跡し、改善すべき分野を特定します。
        </p>
      </div>

      {/* Overview Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">総セッション数</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalSessions}</div>
            <p className="text-xs text-muted-foreground">
              {stats.completedSessions} completed
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Training Time</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatDuration(stats.totalTime)}</div>
            <p className="text-xs text-muted-foreground">
              Practice time invested
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Average Score</CardTitle>
            <Award className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.averageScore}/100</div>
            <p className="text-xs text-muted-foreground">
              Communication effectiveness
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Recent Trend</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold flex items-center ${getTrendColor(stats.recentTrend)}`}>
              {stats.recentTrend >= 0 ? '+' : ''}{stats.recentTrend}%
              {getTrendIcon(stats.recentTrend)}
            </div>
            <p className="text-xs text-muted-foreground">
              Performance change
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Skills and Areas for Improvement */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Award className="h-5 w-5 text-green-600" />
              <span>Top Skills</span>
            </CardTitle>
            <CardDescription>
              Areas where you excel in communication
            </CardDescription>
          </CardHeader>
          <CardContent>
            {stats.topSkills.length > 0 ? (
              <div className="space-y-4">
                {stats.topSkills.map((skill, index) => (
                  <div key={index} className="flex items-center justify-between">
                    <div>
                      <p className="font-medium text-sm">{skill.skill}</p>
                      <p className="text-xs text-muted-foreground capitalize">{skill.type}</p>
                    </div>
                    <Badge className="bg-green-100 text-green-800">
                      {skill.score}/100
                    </Badge>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <Award className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground mb-4">Complete more sessions to identify your strengths</p>
                <Button asChild size="sm">
                  <Link href="/boss-select">Start Training</Link>
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Target className="h-5 w-5 text-orange-600" />
              <span>Improvement Areas</span>
            </CardTitle>
            <CardDescription>
              Skills that need more practice
            </CardDescription>
          </CardHeader>
          <CardContent>
            {stats.improvementAreas.length > 0 ? (
              <div className="space-y-4">
                {stats.improvementAreas.map((area, index) => (
                  <div key={index} className="flex items-center justify-between">
                    <div>
                      <p className="font-medium text-sm">{area.area}</p>
                      <p className="text-xs text-muted-foreground capitalize">{area.type}</p>
                    </div>
                    <Badge className="bg-orange-100 text-orange-800">
                      {area.score}/100
                    </Badge>
                  </div>
                ))}
                <Button asChild variant="outline" className="w-full mt-4">
                  <Link href="/boss-select">Practice These Skills</Link>
                </Button>
              </div>
            ) : (
              <div className="text-center py-8">
                <Target className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">Great job! No major improvement areas identified.</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Boss Performance Breakdown */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <User className="h-5 w-5" />
            <span>Performance by Boss Type</span>
          </CardTitle>
          <CardDescription>
            How well you communicate with different boss personalities
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {Object.entries(stats.bossStats).map(([bossId, bossData]: [string, any]) => {
              const boss = BOSS_PERSONAS.find(b => b.id === bossId);
              if (!boss || bossData.completedCount === 0) return null;
              
              const avgScore = Math.round(bossData.totalScore / bossData.completedCount);
              
              return (
                <div key={bossId} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">{boss.name}</p>
                      <p className="text-sm text-muted-foreground">
                        {bossData.completedCount} sessions • {boss.difficulty} difficulty
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-bold">{avgScore}/100</p>
                      <Badge variant="outline" className={`text-xs ${
                        boss.difficulty === '初級' ? 'text-green-600' :
                        boss.difficulty === '中級' ? 'text-yellow-600' :
                        'text-red-600'
                      }`}>
                        {boss.difficulty}
                      </Badge>
                    </div>
                  </div>
                  <Progress value={avgScore} className="h-2" />
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Recent Sessions */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Calendar className="h-5 w-5" />
            <span>Recent Training Sessions</span>
          </CardTitle>
          <CardDescription>
            Your latest practice sessions and performance
          </CardDescription>
        </CardHeader>
        <CardContent>
          {sessions.length > 0 ? (
            <div className="space-y-4">
              {sessions.slice(0, 10).map((session) => {
                const boss = BOSS_PERSONAS.find(b => b.id === session.boss_persona);
                const scenario = SCENARIOS.find(s => s.id === session.scenario_id);
                
                return (
                  <div key={session.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="space-y-1">
                      <p className="font-medium">
                        {scenario?.title || 'Unknown Scenario'}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        with {boss?.name || 'Unknown Boss'} • 
                        Stress Level {session.stress_level}/10 •
                        {formatDuration(session.duration_minutes)}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {new Date(session.created_at).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="text-right">
                      {session.score !== null ? (
                        <Badge className={
                          session.score >= 80 ? 'bg-green-100 text-green-800' :
                          session.score >= 60 ? 'bg-yellow-100 text-yellow-800' :
                          'bg-red-100 text-red-800'
                        }>
                          {session.score}/100
                        </Badge>
                      ) : session.completed_at ? (
                        <Badge variant="outline">Completed</Badge>
                      ) : (
                        <Badge variant="outline">In Progress</Badge>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-8">
              <Brain className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground mb-4">No training sessions yet</p>
              <Button asChild>
                <Link href="/boss-select">Start Your First Session</Link>
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Action Items */}
      <Card>
        <CardHeader>
          <CardTitle>Recommended Next Steps</CardTitle>
          <CardDescription>
            Personalized recommendations to improve your communication skills
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Button asChild variant="outline" className="h-auto p-4 justify-start">
              <Link href="/boss-select?difficulty=beginner">
                <div className="text-left">
                  <div className="font-medium">Practice Basic Skills</div>
                  <div className="text-sm text-muted-foreground">
                    Start with supportive boss personalities
                  </div>
                </div>
              </Link>
            </Button>
            
            <Button asChild variant="outline" className="h-auto p-4 justify-start">
              <Link href="/boss-select?difficulty=advanced">
                <div className="text-left">
                  <div className="font-medium">Challenge Yourself</div>
                  <div className="text-sm text-muted-foreground">
                    Try difficult boss personalities
                  </div>
                </div>
              </Link>
            </Button>
          </div>

          {stats.improvementAreas.length > 0 && (
            <div className="pt-4 border-t">
              <h4 className="font-medium mb-2">Focus on improvement areas:</h4>
              <div className="flex flex-wrap gap-2">
                {stats.improvementAreas.slice(0, 3).map((area, index) => (
                  <Badge key={index} variant="outline">
                    {area.area}
                  </Badge>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
