# 📋 バーチャル上司シミュレーター 機能要件書

## 🎯 プロジェクト概要

**プロジェクト名**: VirtualBoss Trainer  
**対象ユーザー**: 新入社員・転職者・管理職候補・企業人事部  
**課題**: 職場でのパワハラ・理不尽な上司対応スキル不足によるメンタルヘルス悪化・離職率増加  
**ソリューション**: AIマルチエージェントによるリアルタイム上司対応訓練システム

---

## 🏗️ システムアーキテクチャ（ハッカソン必須サービス準拠）

### Google Cloud アプリケーション関連サービス
- **Cloud Run**: Next.js アプリケーションのホスティング
- **Cloud Run Functions**: リアルタイム分析処理の軽量実行

### Google Cloud AI サービス
- **Agent Development Kit (ADK)** ⭐️: マルチエージェント協調システムの中核
- **Gemini API in Vertex AI**: 上司ペルソナ生成・会話処理
- **Natural Language AI**: テキスト感情分析・ストレス検知
- **Vision AI**: ユーザーの表情・身振り分析（カメラ使用時）

### 特別賞狙いサービス
- **Firebase Realtime Database**: リアルタイムストレス値同期（Firebase賞狙い）
- **Cloud Storage**: セッション録画・分析データ保存（Deep Dive賞狙い）
- **BigQuery**: 学習効果分析・企業向けレポート（Deep Dive賞狙い）

---

## 🤖 ADKマルチエージェント設計

### 1. 上司ペルソナ生成エージェント
```typescript
// 役割: 様々な上司タイプを動的生成
interface BossPersona {
  type: 'perfectionist' | 'unreasonable' | 'micromanager' | 'hands-off' | 'emotional';
  severity: 1-10; // 理不尽度
  triggers: string[]; // 怒りポイント
  speechPattern: string; // 話し方の特徴
  background: string; // 背景設定
}
```

### 2. リアルタイム分析エージェント
```typescript
// 役割: ユーザーの状態をリアルタイム監視
interface UserState {
  stressLevel: number; // 0-100
  confidenceLevel: number; // 0-100
  textPattern: {
    responseTime: number; // 応答時間（ミリ秒）
    textLength: number; // 文章の長さ
    hesitationMarkers: string[]; // 「えー」「うーん」などの迷いの表現
    formalityLevel: number; // 敬語使用度 0-100
  };
  facialExpression?: { // カメラ使用時のみ
    anxiety: number;
    confidence: number;
  };
}
```

### 3. 指導エージェント
```typescript
// 役割: 最適な対応方法をリアルタイム提案
interface GuidanceAction {
  urgency: 'immediate' | 'suggestion' | 'post-session';
  type: 'text_strategy' | 'tone_adjustment' | 'content_suggestion' | 'timing_advice';
  message: string;
  timing: number; // いつ表示するか
  examples?: string[]; // 具体的な回答例
}
```

### 4. 評価・学習エージェント
```typescript
// 役割: セッション後の詳細分析・改善提案
interface SessionAnalysis {
  overallScore: number;
  improvements: string[];
  strongPoints: string[];
  nextLevelRecommendation: BossPersona;
  skillGaps: string[];
}
```

### 5. アバター感情制御エージェント
```typescript
// 役割: 上司アバターの表情・態度をリアルタイム制御
interface BossAvatarState {
  currentMood: 'satisfied' | 'neutral' | 'irritated' | 'angry' | 'furious';
  moodProgression: number; // -100(激怒) ~ +100(満足)
  triggers: {
    positiveResponses: string[]; // 機嫌が良くなる回答
    negativeResponses: string[]; // 機嫌が悪くなる回答
    moodRecoveryTime: number; // 機嫌回復までの時間
  };
  visualExpression: {
    facialAnimation: string; // アニメーション名
    bodyLanguage: 'open' | 'closed' | 'aggressive'; // ボディランゲージ
    voiceTone: 'warm' | 'cold' | 'harsh' | 'condescending';
  };
}

// リアルタイム機嫌変化ロジック
interface MoodChangeEvent {
  trigger: 'user_response' | 'time_elapsed' | 'scenario_event';
  impact: number; // -50 ~ +50
  reason: string; // 変化の理由
  newExpression: AvatarExpression;
}
```

---

## 🖥️ フロントエンド機能要件（Next.js App Router）

### 1. メイン訓練画面
```typescript
// app/training/page.tsx
interface TrainingPageFeatures {
  chatInterface: {
    userTextInput: boolean; // テキスト入力フィールド
    bossAvatar: {
      enabled: boolean;
      type: '2d_animated' | '3d_model' | 'ai_generated'; // アバター種類
      emotionTracking: boolean; // リアルタイム機嫌変化
      expressionIntensity: number; // 表情の強さ 0-100
    };
    conversationHistory: boolean; // 会話履歴表示
    typingIndicator: boolean; // 上司が入力中の表示
    realTimeOverlay: boolean; // ストレス値表示
  };
  optionalCamera: {
    enabled: boolean; // カメラは任意機能
    faceTracking: boolean; // 表情分析（オプション）
  };
  controls: {
    sessionStart: boolean;
    emergencyBreak: boolean; // パニック時の緊急停止
    hintRequest: boolean;
    quickResponses: boolean; // よく使う返答のボタン
  };
  realTimeMetrics: {
    stressGauge: boolean;
    confidenceBar: boolean;
    suggestedActions: boolean;
    bossEmotionMeter: boolean; // 上司の機嫌メーター
    responseTimeTracker: boolean; // 応答時間の表示
  };
}
```

### 2. 上司選択・カスタマイズ画面
```typescript
// app/boss-select/page.tsx
interface BossCustomization {
  presetPersonas: BossPersona[];
  customCreation: {
    personalitySliders: boolean;
    scenarioSelection: boolean;
    difficultyAdjustment: boolean;
  };
  enterpriseMode: {
    companySpecificScenarios: boolean;
    roleBasedTraining: boolean;
  };
}
```

### 3. 分析・レポート画面
```typescript
// app/analytics/page.tsx
interface AnalyticsFeatures {
  sessionHistory: boolean;
  progressTracking: boolean;
  skillRadarChart: boolean;
  enterpriseReporting: boolean; // 企業向け集計
  exportFunctionality: boolean;
}
```

### 4. 企業管理画面
```typescript
// app/enterprise/page.tsx
interface EnterpriseFeatures {
  employeeManagement: boolean;
  trainingPrograms: boolean;
  bulkAnalytics: boolean;
  customScenarios: boolean;
  complianceReporting: boolean;
}
```

---

## 🔧 技術的実装要件

### Server Actions（API Routes不使用）
```typescript
// app/actions/training.ts
export async function startTrainingSession(bossPersona: BossPersona): Promise<SessionId>
export async function analyzeUserText(message: string, responseTime: number): Promise<UserState>
export async function generateBossResponse(context: ConversationContext): Promise<BossResponse>
export async function endSession(sessionId: string): Promise<SessionAnalysis>
export async function getResponseSuggestions(context: ConversationContext): Promise<string[]>
```

### リアルタイムデータフロー
```typescript
// ADKエージェント協調フロー
const trainingPipeline = {
  input: 'ユーザーテキスト入力・（オプション）映像',
  agents: [
    'TextAnalysisAgent',      // テキスト内容分析
    'EmotionAnalysisAgent',   // 感情分析
    'StressDetectionAgent',   // ストレス検知
    'ResponseTimeAgent',      // 応答時間分析
    'BossResponseAgent',      // 上司応答生成
    'GuidanceAgent'          // 指導提案
  ],
  output: 'リアルタイムフィードバック + 上司テキスト応答'
};
```

### Supabaseデータベース設計
```sql
-- ユーザープロフィール
CREATE TABLE profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users NOT NULL,
  name TEXT NOT NULL,
  role TEXT, -- 'individual' | 'enterprise_admin' | 'employee'
  company_id UUID REFERENCES companies(id),
  skill_level INTEGER DEFAULT 1,
  created_at TIMESTAMP DEFAULT NOW()
);

-- 訓練セッション
CREATE TABLE training_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users NOT NULL,
  boss_persona JSONB NOT NULL,
  duration_seconds INTEGER,
  stress_levels JSONB, -- リアルタイムストレス値の配列
  analysis_result JSONB,
  score INTEGER,
  created_at TIMESTAMP DEFAULT NOW()
);

-- 企業管理
CREATE TABLE companies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  admin_user_id UUID REFERENCES auth.users NOT NULL,
  custom_scenarios JSONB,
  created_at TIMESTAMP DEFAULT NOW()
);
```

---

## 📱 ユーザーフロー設計

### 1. 新規ユーザー体験
1. サインアップ（Supabase Auth）
2. 初回アセスメント（現在のスキルレベル測定）
3. チュートリアル（優しい上司での練習）
4. 段階的レベルアップ

### 2. 訓練セッション
1. 上司タイプ選択
2. シナリオ設定（会議・査定・叱責など）
3. リアルタイム対話訓練
4. 即座のフィードバック・分析
5. 次回推奨設定の提案

### 3. 企業利用フロー
1. 管理者アカウント作成
2. 従業員一括登録
3. カスタムシナリオ作成
4. 集団訓練プログラム実施
5. 効果測定・レポート出力

---

## 🎮 ゲーミフィケーション要素

### 個人向け
- **レベルシステム**: 初級→上級→エキスパート
- **バッジシステム**: 「冷静対応マスター」「理不尽耐性MAX」
- **ストリーク**: 連続訓練日数
- **スキルツリー**: 交渉力・忍耐力・論理的思考力

### 企業向け
- **チーム対抗戦**: 部署間でのスコア競争
- **改善率ランキング**: 個人の成長度ランキング
- **企業全体ダッシュボード**: 組織のメンタルヘルス状況可視化

---

## 🎯 MVP（最小実行可能プロダクト）機能

### Phase 1: ハッカソン提出版
1. **基本訓練機能**
   - 3種類の上司ペルソナ（優しい・普通・理不尽）
   - テキストチャット形式での対話
   - リアルタイムストレス値表示
   - 応答時間・文章分析

2. **分析機能**
   - セッション後の基本分析
   - 改善提案の表示
   - 進捗グラフ
   - テキスト品質評価

3. **認証・データ管理**
   - Supabase認証
   - セッション履歴保存
   - 基本的なプロフィール管理

### Phase 2: ポストハッカソン拡張
1. **高度なAI機能**
   - オプション表情認識によるストレス検知
   - より複雑なマルチエージェント協調
   - カスタム上司ペルソナ生成
   - 音声入力・出力機能の追加

2. **企業機能**
   - 管理者ダッシュボード
   - 集団分析レポート
   - カスタムシナリオ作成

---

## 🛠️ 開発環境・技術スタック

### フロントエンド
```json
{
  "framework": "Next.js 14 (App Router)",
  "language": "TypeScript",
  "ui": "shadcn/ui",
  "icons": "lucide-react",
  "forms": "react-hook-form + zod",
  "state": "nuqs (URL state)",
  "realtime": "useSWR"
}
```

### バックエンド・インフラ
```json
{
  "hosting": "Cloud Run",
  "database": "Supabase (PostgreSQL)",
  "auth": "Supabase Auth",
  "storage": "Cloud Storage",
  "ai": [
    "Agent Development Kit",
    "Gemini API in Vertex AI",
    "Speech-to-Text",
    "Natural Language AI",
    "Vision AI"
  ]
}
```

### 開発ツール
```json
{
  "package_manager": "pnpm",
  "linting": "ESLint + Prettier",
  "testing": "Jest + Testing Library",
  "deployment": "Cloud Run",
  "monitoring": "Google Cloud Monitoring"
}
```

---

## 🎬 デモシナリオ（3分間）

### タイムライン
```
0:00-0:30 問題提起・システム紹介
0:30-1:30 実際の訓練セッション実演
          - 理不尽上司との対話
          - リアルタイムストレス値表示
          - AIからの指導提案
1:30-2:00 分析結果・改善提案表示
2:00-2:30 企業向け機能紹介
2:30-3:00 社会的インパクト・今後の展望
```

### 実演内容
1. **上司ペルソナ選択**: 「理不尽・完璧主義上司」を選択
2. **シナリオ**: 「納期遅れについての叱責」
3. **チャット開始**: 審査員が実際にテキストで上司と対話
4. **リアルタイム表示**: ストレス値の変化・AIからの提案・応答時間
5. **結果分析**: 対応スキルの評価・具体的改善点

---

## 📊 期待される効果・KPI

### 個人レベル
- **ストレス耐性向上**: 訓練前後でのストレス値20%改善
- **対応スキル向上**: 適切な応答率の30%向上
- **自信度向上**: 職場での自信度スコア25%向上

### 企業レベル
- **離職率削減**: 新入社員の早期離職率15%削減
- **メンタルヘルス改善**: 職場ストレス関連の休職率10%減少
- **生産性向上**: チーム内コミュニケーション効率20%改善

### 社会レベル
- **パワハラ問題の予防**: 職場いじめ・パワハラ事案の減少
- **メンタルヘルス向上**: 働く人の精神的健康状態改善
- **人材育成効率化**: 企業の人材育成コスト削減

---

## 🚀 今後の展開・マネタイズ

### ビジネスモデル
1. **B2C**: 個人向けサブスクリプション（月額1,980円）
2. **B2B**: 企業向けライセンス（従業員数×月額500円）
3. **Premium**: 1on1コーチング機能（月額9,800円）

### 拡張可能性
1. **他言語対応**: 英語・中国語での展開
2. **業界特化**: 医療・教育・サービス業特化版
3. **VR対応**: より没入感の高い訓練環境
4. **AI進化**: GPT-5等の最新AIモデル統合

---

## ⚠️ リスクと対策

### 技術的リスク
- **ADK複雑性**: → 段階的実装、シンプルなエージェントから開始
- **リアルタイム処理負荷**: → Cloud Runの自動スケーリング活用
- **API コスト**: → 無料枠の効率的利用、バッチ処理の活用

### ビジネスリスク
- **競合参入**: → 特許出願、技術的差別化の維持
- **プライバシー懸念**: → 厳格なデータ管理、GDPR準拠
- **効果の実証**: → 学術機関との連携、効果測定の科学的検証

### 社会的リスク
- **依存性**: → 適切な利用ガイドライン、専門家監修
- **悪用の可能性**: → 倫理的AI利用の徹底、監査体制

---

## 💬 テキストベース特有の機能強化

### 応答時間分析システム
```typescript
interface ResponseTimeAnalysis {
  thinkingTime: number; // 考える時間（ミリ秒）
  typingSpeed: number; // 入力速度（文字/分）
  hesitationPattern: {
    deletions: number; // 削除回数
    pauses: number; // 長い停止回数
    revisions: number; // 修正回数
  };
  stressIndicators: string[]; // ストレスを示すテキストパターン
}
```

### 文章品質評価システム
```typescript
interface TextQualityMetrics {
  politenessLevel: number; // 丁寧さ 0-100
  clarityScore: number; // 明確さ 0-100
  professionalismLevel: number; // プロフェショナル度 0-100
  emotionalTone: 'defensive' | 'apologetic' | 'confident' | 'neutral';
  keywordAnalysis: {
    positiveWords: string[];
    negativeWords: string[];
    weakenedLanguage: string[]; // 「たぶん」「もしかして」等
  };
}
```

### スマート回答提案システム
```typescript
interface SmartSuggestions {
  quickReplies: string[]; // 状況に応じた定型返答
  toneAdjustments: {
    current: string;
    suggested: string;
    reason: string;
  }[];
  escalationOptions: string[]; // より良い対応の選択肢
  avoidanceWarnings: string[]; // 避けるべき表現
}
```

---
