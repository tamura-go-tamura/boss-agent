import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Bot, Users, TrendingUp, Shield } from "lucide-react";

export default function LandingPage() {
  return (
    <div className="flex flex-col min-h-screen">
      {/* Header */}
      <header className="px-4 lg:px-6 h-14 flex items-center border-b">
        <Link className="flex items-center justify-center" href="/">
          <Bot className="h-6 w-6 mr-2" />
          <span className="font-bold">VirtualBoss Trainer</span>
        </Link>
        <nav className="ml-auto flex gap-4 sm:gap-6">
          <Link className="text-sm font-medium hover:underline underline-offset-4" href="/demo">
            デモ
          </Link>
          <Link className="text-sm font-medium hover:underline underline-offset-4" href="/auth/signin">
            ログイン
          </Link>
          <Link className="text-sm font-medium hover:underline underline-offset-4" href="/auth/signup">
            新規登録
          </Link>
        </nav>
      </header>

      {/* Hero Section */}
      <section className="w-full py-12 md:py-24 lg:py-32 xl:py-48">
        <div className="container px-4 md:px-6">
          <div className="flex flex-col items-center space-y-4 text-center">
            <div className="space-y-2">
              <h1 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl lg:text-6xl/none">
                AI上司との対話で
                <br />
                コミュニケーションスキルを向上
              </h1>
              <p className="mx-auto max-w-[700px] text-gray-500 md:text-xl dark:text-gray-400">
                Google CloudのADK技術を活用したリアルタイム訓練システムで、
                様々なタイプの上司との対話スキルを安全に練習できます。
              </p>
            </div>
            <div className="space-x-4">
              <Button asChild size="lg">
                <Link href="/auth/signup">今すぐ始める</Link>
              </Button>
              <Button variant="outline" size="lg" asChild>
                <Link href="/demo">デモを見る</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="w-full py-12 md:py-24 lg:py-32 bg-gray-50 dark:bg-gray-900">
        <div className="container px-4 md:px-6">
          <div className="grid gap-6 lg:grid-cols-3 lg:gap-12">
            <Card>
              <CardHeader>
                <Users className="h-10 w-10 mb-2 text-primary" />
                <CardTitle>リアルな上司ペルソナ</CardTitle>
                <CardDescription>
                  様々なタイプの上司AIと対話練習
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p>マイクロマネージャー、皮肉屋、サポーティブなど、実際の職場で遭遇する様々な上司タイプとの対話を練習できます。</p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <TrendingUp className="h-10 w-10 mb-2 text-primary" />
                <CardTitle>リアルタイム分析</CardTitle>
                <CardDescription>
                  ストレス値と応答品質の即座フィードバック
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p>Firebase Realtime Databaseを活用し、会話中のストレス値や応答時間をリアルタイムで分析・表示します。</p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <Shield className="h-10 w-10 mb-2 text-primary" />
                <CardTitle>安全な練習環境</CardTitle>
                <CardDescription>
                  実際の職場に影響のない訓練空間
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p>実際の上司との関係に影響することなく、失敗を恐れずに様々な対応方法を試すことができます。</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="flex flex-col gap-2 sm:flex-row py-6 w-full shrink-0 items-center px-4 md:px-6 border-t">
        <p className="text-xs text-gray-500 dark:text-gray-400">
          © 2025 VirtualBoss Trainer. All rights reserved.
        </p>
        <nav className="sm:ml-auto flex gap-4 sm:gap-6">
          <Link className="text-xs hover:underline underline-offset-4" href="#">
            利用規約
          </Link>
          <Link className="text-xs hover:underline underline-offset-4" href="#">
            プライバシーポリシー
          </Link>
        </nav>
      </footer>
    </div>
  );
}
