# ADK (AI Development Kit) API仕様書

## 概要

ADK（AI Development Kit）は、Virtual Boss TrainerアプリケーションにおけるマルチエージェントAIシステムです。複数の専門AIエージェントを協調動作させ、リアルタイムでユーザーのコミュニケーション訓練をサポートします。

## システム構成

```
ADK Orchestrator
├── Boss Response Agent    (上司応答生成)
├── Guidance Agent        (ガイダンス提供)
├── Analytics Agent       (パフォーマンス分析)
└── Text Analysis Agent   (テキスト解析)
```

## Core Interfaces

### 1. ADKAgent (基底インターフェース)

```typescript
interface ADKAgent {
  id: string;           // エージェント識別子
  name: string;         // エージェント名
  type: string;         // エージェント種別
  execute(input: string, context: SessionContext): Promise<any>;
}
```

### 2. SessionContext (セッションコンテキスト)

```typescript
interface SessionContext {
  bossPersona: BossPersona;           // 上司ペルソナ情報
  scenario: Scenario;                 // シナリオ情報
  userState: UserState;               // ユーザー状態
  conversationHistory: ChatMessage[]; // 会話履歴
  textAnalysis: TextAnalysis;         // テキスト解析結果
}
```

### 3. OrchestrationResult (実行結果)

```typescript
interface OrchestrationResult {
  bossResponse: string;          // 上司の応答
  guidance: GuidanceAction[];    // ガイダンス情報
  analysis: SessionAnalysis;     // セッション分析結果
}
```

## エージェント仕様

### 1. Boss Response Agent

**目的**: 上司ペルソナに基づいたリアルな応答を生成

**入力**:
- `userInput`: ユーザーの発言内容
- `context`: セッションコンテキスト

**出力**:
- `string`: 上司の応答メッセージ

**主要機能**:
- ペルソナベースの応答生成
- シナリオに適した文脈考慮
- 感情的反応の調整

**API**:
```typescript
class BossResponseAgent implements ADKAgent {
  async execute(userInput: string, context: SessionContext): Promise<string>
}
```

**プロンプト構成要素**:
- ペルソナ特性（性格、コミュニケーションスタイル）
- シナリオ設定（状況、目標）
- 会話履歴（過去3-5回の交換）
- ユーザー状態（ストレス、自信レベル）

### 2. Guidance Agent

**目的**: ユーザーのパフォーマンス向上のためのガイダンス提供

**入力**:
- `userInput`: ユーザーの発言内容
- `context`: セッションコンテキスト

**出力**:
- `GuidanceAction[]`: ガイダンスアクション配列

**主要機能**:
- テキスト品質分析
- ストレス管理アドバイス
- 自信構築サポート
- プロフェッショナリズム向上
- レスポンス時間最適化

**API**:
```typescript
class GuidanceAgent implements ADKAgent {
  async execute(userInput: string, context: SessionContext): Promise<GuidanceAction[]>
}
```

**ガイダンス種別**:
```typescript
type GuidanceType = 
  | 'stress_management'     // ストレス管理
  | 'confidence_building'   // 自信構築
  | 'professionalism'       // プロフェッショナリズム
  | 'response_time'         // 応答時間
  | 'general';              // 一般的アドバイス
```

### 3. Analytics Agent

**目的**: ユーザーの進歩とパターンを追跡・分析

**入力**:
- `userInput`: ユーザーの発言内容
- `context`: セッションコンテキスト

**出力**:
- `SessionAnalysis`: セッション分析結果

**主要機能**:
- ストレスレベル算出
- 自信レベル測定
- 改善領域特定
- 強み識別
- 進歩測定

**API**:
```typescript
class AnalyticsAgent implements ADKAgent {
  async execute(userInput: string, context: SessionContext): Promise<SessionAnalysis>
}
```

**分析メトリクス**:
- 現在/平均ストレスレベル (0-100)
- 現在/平均自信レベル (0-100)
- 改善領域 (string[])
- 強み (string[])
- セッション進歩率 (0-100)

## データ型定義

### Core Types

```typescript
// ユーザー状態
interface UserState {
  stressLevel: number;        // ストレスレベル (0-100)
  confidenceLevel: number;    // 自信レベル (0-100)
  engagementLevel?: number;   // 関与レベル (0-100)
  responseTime?: number;      // 応答時間 (ミリ秒)
  textLength?: number;        // テキスト長
  formalityLevel?: number;    // 形式レベル (0-100)
  detectedEmotions?: string[]; // 検出された感情
}

// 上司ペルソナ
interface BossPersona {
  id: string;                           // ペルソナID
  name: string;                         // 名前
  description: string;                  // 説明
  difficulty: '初級' | '中級' | '上級'; // 難易度
  traits: readonly string[];            // 特性
  scenario_types: readonly string[];    // 適用シナリオ
  communicationStyle: string;           // コミュニケーションスタイル
  personality?: string;                 // 性格
  stressTriggers?: readonly string[];   // ストレス要因
  preferredResponses?: readonly string[]; // 好ましい応答
}

// チャットメッセージ
interface ChatMessage {
  speaker: 'user' | 'boss';     // 発言者
  text: string;                 // メッセージ内容
  timestamp: string;            // タイムスタンプ (ISO 8601)
  sentimentAnalysis?: any;      // センチメント分析結果
  responseTimeMs?: number;      // 応答時間
}

// ガイダンスアクション
interface GuidanceAction {
  type: GuidanceType;           // ガイダンス種別
  message: string;              // メッセージ
  priority: 'low' | 'medium' | 'high'; // 優先度
}

// セッション分析
interface SessionAnalysis {
  currentStressLevel: number;      // 現在ストレスレベル
  currentConfidenceLevel: number;  // 現在自信レベル
  averageStressLevel: number;      // 平均ストレスレベル
  averageConfidenceLevel: number;  // 平均自信レベル
  improvementAreas: string[];      // 改善領域
  strengths: string[];             // 強み
  sessionProgress: number;         // セッション進歩率
}
```

### Text Analysis Types

```typescript
// テキスト解析結果
interface TextAnalysis {
  sentiment: SentimentAnalysis;
  textQuality: TextQuality;
  stressIndicators: StressIndicators;
  confidenceMarkers: ConfidenceMarkers;
  responseTime: number;
}

// センチメント分析
interface SentimentAnalysis {
  score: number;        // センチメントスコア (-1.0 to 1.0)
  magnitude: number;    // 感情の強度
  confidence: number;   // 分析信頼度
}

// テキスト品質
interface TextQuality {
  clarity: number;          // 明瞭性 (0-100)
  professionalism: number;  // プロフェッショナリズム (0-100)
  politeness: number;       // 丁寧さ (0-100)
  assertiveness: number;    // 主張性 (0-100)
}

// ストレス指標
interface StressIndicators {
  hesitationMarkers: string[];    // 躊躇マーカー
  punctuationDensity: number;     // 句読点密度
  wordRepetition: number;         // 単語繰り返し
}

// 自信マーカー
interface ConfidenceMarkers {
  assertiveWords: string[];       // 断定的な語句
  uncertaintyWords: string[];     // 不確実性を示す語句
  questionMarks: number;          // 疑問符の数
}
```

## メイン API

### orchestrateAgents

ADKシステムのメインエントリーポイント

```typescript
async function orchestrateAgents(
  userInput: string,
  context: SessionContext
): Promise<OrchestrationResult>
```

**パラメータ**:
- `userInput`: ユーザーの入力テキスト
- `context`: セッションコンテキスト

**戻り値**:
- `OrchestrationResult`: 統合された実行結果

**実行フロー**:
1. 全エージェントを並列実行
2. 結果を統合
3. エラーハンドリング（フォールバック応答）

**使用例**:
```typescript
import { orchestrateAgents } from '@/services/adk/orchestrator';

const result = await orchestrateAgents(
  "プロジェクトの進捗について報告します。",
  {
    bossPersona: demandingBoss,
    scenario: projectUpdateScenario,
    userState: currentUserState,
    conversationHistory: messages,
    textAnalysis: analysisResult
  }
);

console.log(result.bossResponse);  // "具体的な数字で報告してください。"
console.log(result.guidance);      // [{ type: 'professionalism', message: '...' }]
console.log(result.analysis);      // { currentStressLevel: 65, ... }
```

## パフォーマンス指標

### レスポンス時間目標
- Boss Response Agent: < 2秒
- Guidance Agent: < 500ms
- Analytics Agent: < 300ms
- 全体オーケストレーション: < 3秒

### 並列処理
- エージェント実行は並列化済み
- 外部API依存は Boss Response Agent のみ

### エラーハンドリング
- 各エージェントは独立してフォールバック可能
- 全体失敗時は安全なデフォルト応答を提供

## 設定・環境

### 必要な環境変数
```
GEMINI_API_KEY=your_gemini_api_key
```

### 依存関係
- `@/services/gcp/gemini`: Gemini API連携
- `@/types/ai.types`: 型定義
- `@/config/env`: 環境設定

## 拡張性

### 新しいエージェントの追加
1. `ADKAgent`インターフェースを実装
2. `ADKOrchestrator.agents`配列に追加
3. 必要に応じて戻り値型を拡張

### カスタムロジックの追加
- 各エージェントは独立してカスタマイズ可能
- プロンプト調整による動作変更
- 新しい分析指標の追加

## 今後の拡張予定

### Phase 2 機能
- リアルタイム感情認識
- 音声入力対応
- 多言語サポート

### Phase 3 機能
- カスタムエージェント作成
- 機械学習モデル統合
- 高度な行動分析

---

**更新日**: 2025年6月13日  
**バージョン**: 1.0.0  
**メンテナー**: ADK Development Team
