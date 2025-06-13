import { createSupabaseServerClient } from '@/lib/supabase-server';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import Link from 'next/link';
import { 
  Brain, 
  TrendingUp, 
  Clock, 
  Target, 
  PlayCircle, 
  BarChart3,
  Award,
  Calendar
} from 'lucide-react';

async function getRecentSessions(userId: string) {
  const supabase = createSupabaseServerClient();
  
  const { data: sessions, error } = await supabase
    .from('training_sessions')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .limit(5);

  if (error) {
    console.error('Error fetching sessions:', error);
    return [];
  }

  return sessions || [];
}

async function getUserStats(userId: string) {
  const supabase = createSupabaseServerClient();
  
  const { data: sessions, error } = await supabase
    .from('training_sessions')
    .select('*')
    .eq('user_id', userId);

  if (error) {
    console.error('Error fetching user stats:', error);
    return {
      totalSessions: 0,
      totalMinutes: 0,
      averageScore: 0,
      improvementRate: 0,
    };
  }

  const totalSessions = sessions?.length || 0;
  const totalMinutes = sessions?.reduce((sum, session) => sum + (session.duration_minutes || 0), 0) || 0;
  const completedSessions = sessions?.filter(s => s.score !== null) || [];
  const averageScore = completedSessions.length > 0 
    ? completedSessions.reduce((sum, session) => sum + (session.score || 0), 0) / completedSessions.length 
    : 0;

  // Calculate improvement rate (simplified)
  const recentSessions = completedSessions.slice(0, 5);
  const olderSessions = completedSessions.slice(5, 10);
  const recentAvg = recentSessions.length > 0 
    ? recentSessions.reduce((sum, s) => sum + (s.score || 0), 0) / recentSessions.length 
    : 0;
  const olderAvg = olderSessions.length > 0 
    ? olderSessions.reduce((sum, s) => sum + (s.score || 0), 0) / olderSessions.length 
    : 0;
  const improvementRate = olderAvg > 0 ? ((recentAvg - olderAvg) / olderAvg) * 100 : 0;

  return {
    totalSessions,
    totalMinutes,
    averageScore: Math.round(averageScore),
    improvementRate: Math.round(improvementRate),
  };
}

export default async function DashboardPage() {
  const supabase = createSupabaseServerClient();
  const { data: { session } } = await supabase.auth.getSession();
  
  if (!session) {
    return null; // This should be handled by middleware
  }

  const [recentSessions, userStats] = await Promise.all([
    getRecentSessions(session.user.id),
    getUserStats(session.user.id),
  ]);

  const formatDuration = (minutes: number) => {
    if (minutes < 60) return `${minutes}m`;
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours}h ${mins}m`;
  };

  const formatScore = (score: number | null) => {
    if (score === null) return 'In Progress';
    return `${score}/100`;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="space-y-2">
        <h1 className="text-3xl font-bold text-gray-900">
          Welcome back, {session.user.user_metadata?.full_name || 'Trainee'}!
        </h1>
        <p className="text-gray-600">
          Ready to improve your boss communication skills? Let&apos;s continue your training journey.
        </p>
      </div>

      {/* Quick Action */}
      <Card className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-semibold mb-2">Start a New Training Session</h2>
              <p className="text-blue-100 mb-4">
                Practice with different boss personalities and challenging scenarios
              </p>
              <Button asChild className="bg-white text-blue-600 hover:bg-blue-50">
                <Link href="/boss-select">
                  <PlayCircle className="mr-2 h-4 w-4" />
                  Start Training
                </Link>
              </Button>
            </div>
            <Brain className="h-16 w-16 text-blue-200" />
          </div>
        </CardContent>
      </Card>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Sessions</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{userStats.totalSessions}</div>
            <p className="text-xs text-muted-foreground">
              Training sessions completed
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Training Time</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatDuration(userStats.totalMinutes)}</div>
            <p className="text-xs text-muted-foreground">
              Total practice time
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Average Score</CardTitle>
            <Award className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{userStats.averageScore}/100</div>
            <p className="text-xs text-muted-foreground">
              Communication effectiveness
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Improvement</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${userStats.improvementRate >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              {userStats.improvementRate >= 0 ? '+' : ''}{userStats.improvementRate}%
            </div>
            <p className="text-xs text-muted-foreground">
              Recent performance trend
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Recent Sessions and Quick Links */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
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
            {recentSessions.length > 0 ? (
              <div className="space-y-4">
                {recentSessions.map((session) => (
                  <div key={session.id} className="flex items-center justify-between p-3 border rounded-lg">
                    <div>
                      <p className="font-medium capitalize">{session.boss_persona.replace('_', ' ')}</p>
                      <p className="text-sm text-muted-foreground">
                        {formatDuration(session.duration_minutes)} • Stress Level {session.stress_level}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-medium">{formatScore(session.score)}</p>
                      <p className="text-xs text-muted-foreground">
                        {new Date(session.created_at).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                ))}
                <Button asChild variant="outline" className="w-full">
                  <Link href="/analytics">
                    <BarChart3 className="mr-2 h-4 w-4" />
                    View All Sessions
                  </Link>
                </Button>
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

        {/* Quick Links */}
        <Card>
          <CardHeader>
            <CardTitle>Training Options</CardTitle>
            <CardDescription>
              Choose your training focus and difficulty level
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 gap-3">
              <Button asChild variant="outline" className="h-auto p-4 justify-start">
                <Link href="/boss-select?difficulty=初級">
                  <div className="text-left">
                    <div className="font-medium">初級レベル</div>
                    <div className="text-sm text-muted-foreground">
                      サポート的な上司でスタート
                    </div>
                  </div>
                </Link>
              </Button>
              
              <Button asChild variant="outline" className="h-auto p-4 justify-start">
                <Link href="/boss-select?difficulty=中級">
                  <div className="text-left">
                    <div className="font-medium">中級レベル</div>
                    <div className="text-sm text-muted-foreground">
                      要求の厳しいシナリオで練習
                    </div>
                  </div>
                </Link>
              </Button>
              
              <Button asChild variant="outline" className="h-auto p-4 justify-start">
                <Link href="/boss-select?difficulty=上級">
                  <div className="text-left">
                    <div className="font-medium">上級レベル</div>
                    <div className="text-sm text-muted-foreground">
                      難しい上司のパーソナリティに挑戦
                    </div>
                  </div>
                </Link>
              </Button>
            </div>

            <div className="pt-4 border-t">
              <Button asChild variant="ghost" className="w-full">
                <Link href="/analytics">
                  <BarChart3 className="mr-2 h-4 w-4" />
                  View Detailed Analytics
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Progress Section */}
      <Card>
        <CardHeader>
          <CardTitle>Your Progress Journey</CardTitle>
          <CardDescription>
            Track your communication skill development over time
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <div className="flex justify-between text-sm mb-2">
                <span>Overall Communication Skills</span>
                <span>{userStats.averageScore}%</span>
              </div>
              <Progress value={userStats.averageScore} className="h-2" />
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">{userStats.totalSessions}</div>
                <div className="text-sm text-muted-foreground">Sessions Completed</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">{Math.ceil(userStats.totalMinutes / 60)}h</div>
                <div className="text-sm text-muted-foreground">Training Hours</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-purple-600">
                  {userStats.averageScore >= 80 ? 'Expert' : userStats.averageScore >= 60 ? 'Intermediate' : 'Beginner'}
                </div>
                <div className="text-sm text-muted-foreground">Skill Level</div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
