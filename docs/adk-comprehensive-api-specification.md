# ADK (AI Development Kit) - 包括的API仕様書

## 概要

ADK（AI Development Kit）は、上司とのコミュニケーショントレーニングシステムにおける多エージェントAIシステムの中核となるAPIセットです。本システムは、ユーザーの入力を分析し、上司の応答生成、ガイダンス提供、セッション分析を統合的に処理します。

## アーキテクチャ概要

### マルチエージェント構成

```
┌─────────────────┐    ┌─────────────────┐
│   User Input    │───▶│  ADK Orchestr.  │
└─────────────────┘    └─────────────────┘
                                │
          ┌─────────────────────┼─────────────────────┐
          │                     │                     │
          ▼                     ▼                     ▼
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│ Boss Response   │    │   Guidance      │    │   Analytics     │
│     Agent       │    │     Agent       │    │     Agent       │
└─────────────────┘    └─────────────────┘    └─────────────────┘
          │                     │                     │
          └─────────────────────┼─────────────────────┘
                                ▼
                   ┌─────────────────────┐
                   │ Text Analysis Agent │
                   └─────────────────────┘
```

## コアインターフェース

### 1. ADKAgent基底インターフェース

```typescript
interface ADKAgent {
  id: string;
  name: string;
  type: string;
  execute(input: string, context: SessionContext): Promise<string | GuidanceAction[] | SessionAnalysis | TextAnalysis>;
}
```

### 2. セッションコンテキスト

```typescript
interface SessionContext {
  bossPersona: BossPersona;
  scenario: Scenario;
  userState: UserState;
  conversationHistory: ChatMessage[];
  textAnalysis?: TextAnalysis;
}
```

### 3. オーケストレーション結果

```typescript
interface OrchestrationResult {
  bossResponse: string;
  guidance: GuidanceAction[];
  analysis: SessionAnalysis;
}
```

## エージェント詳細仕様

### 1. BossResponseAgent

**目的**: Gemini AIを使用して、ボスペルソナに基づいた適切な応答を生成

**入力**:
- `userInput`: ユーザーの発言内容
- `context`: セッションコンテキスト

**出力**:
- `string`: ボスキャラクターとしての応答メッセージ

**プロンプト構造**:
```
You are roleplaying as {bossPersona.name}, {bossPersona.description}.

SCENARIO: {scenario.description}
BOSS PERSONALITY: {bossPersona.personality}
DIFFICULTY: {bossPersona.difficulty}/10

CONVERSATION HISTORY:
{recentHistory}

USER JUST SAID: "{userInput}"

Respond as this boss character would in this scenario.
```

**設定パラメータ**:
- `maxTokens`: 200
- `temperature`: 0.7

### 2. GuidanceAgent

**目的**: テキスト分析結果に基づいてユーザーにコーチング提案を提供

**入力**:
- `userInput`: ユーザーの発言内容
- `context`: セッションコンテキスト（特にtextAnalysis）

**出力**:
- `GuidanceAction[]`: ガイダンス提案の配列

**ガイダンスロジック**:

| 条件 | ガイダンスタイプ | メッセージ | 優先度 |
|------|------------------|------------|--------|
| hesitationMarkers > 2 | stress_management | "Take a deep breath. You seem hesitant. Try stating your main point directly." | medium |
| uncertaintyWords > 1 | confidence_building | "Use more decisive language. Replace 'maybe' and 'I think' with confident statements." | medium |
| professionalism < 60 | professionalism | "Consider using more formal language for this workplace scenario." | low |
| responseTime > 10000ms | response_time | "Try to respond more quickly. In real situations, long pauses can seem uncertain." | high |

### 3. AnalyticsAgent

**目的**: ユーザーの進捗状況とパフォーマンスパターンを分析

**入力**:
- `userInput`: ユーザーの発言内容
- `context`: セッションコンテキスト

**出力**:
- `SessionAnalysis`: セッション分析結果

**分析項目**:

#### ストレスレベル計算
```typescript
基準値: 30
+ hesitationMarkers数 × 10
+ punctuationDensity > 0.1 → +15
+ responseTime > 8000ms → +20 (5000-8000ms → +10)
+ sentiment < -0.3 → +15
範囲: 0-100
```

#### 自信レベル計算
```typescript
基準値: 60
+ assertiveWords数 × 8
- uncertaintyWords数 × 10
+ (assertiveness - 50) × 0.5
+ professionalism > 70 → +10
範囲: 0-100
```

#### 改善エリア特定
- `professionalism < 60` → "Professional Communication"
- `assertiveness < 50` → "Assertiveness"
- `uncertaintyWords > 1` → "Confident Language"
- `hesitationMarkers > 2` → "Clear Expression"
- `responseTime > 8000ms` → "Response Speed"

### 4. TextAnalysisAgent

**目的**: ユーザー入力の詳細なテキスト分析を実行

**入力**:
- `userInput`: ユーザーの発言内容
- `context`: セッションコンテキスト

**出力**:
- `TextAnalysis`: テキスト分析結果

**分析コンポーネント**:

#### 感情分析（SentimentAnalysis）
```typescript
interface SentimentAnalysis {
  score: number;        // -1.0 to 1.0 (negative to positive)
  magnitude: number;    // 0.0 to 1.0 (intensity)
  confidence: number;   // 0.0 to 1.0 (reliability)
}
```

**語彙ベース分析**:
- **ポジティブ語**: ['good', 'great', 'excellent', 'wonderful', 'fantastic', 'pleased', 'happy', 'successful', '良い', '素晴らしい', '素敵', '成功']
- **ネガティブ語**: ['bad', 'terrible', 'awful', 'disappointing', 'frustrated', 'worried', 'concerned', 'problem', '悪い', '問題', '心配', '困った']

#### テキスト品質分析（TextQuality）
```typescript
interface TextQuality {
  clarity: number;         // 0-100 (明確さ)
  professionalism: number; // 0-100 (専門性)
  politeness: number;      // 0-100 (丁寧さ)
  assertiveness: number;   // 0-100 (断言性)
}
```

**計算ロジック**:

1. **明確さ（Clarity）**:
   ```typescript
   avgWordsPerSentence = words.length / sentences.length
   clarity = 100 - (avgWordsPerSentence - 15) * 2
   範囲: 0-100
   ```

2. **専門性（Professionalism）**:
   ```typescript
   formalWords = ['please', 'would', 'could', 'thank', 'appreciate', 'understand', 'respect', 'いただ', 'ください', 'させて', 'お願い']
   casualWords = ['yeah', 'ok', 'sure', 'cool', 'awesome', 'まじ', 'やば']
   professionalism = 50 + (formalCount * 10) - (casualCount * 15)
   範囲: 0-100
   ```

3. **丁寧さ（Politeness）**:
   ```typescript
   politeMarkers = ['please', 'thank you', 'excuse me', 'sorry', 'appreciate', 'すみません', 'ありがとう', 'お疲れ様']
   politeness = 40 + politeCount * 20
   範囲: 0-100
   ```

4. **断言性（Assertiveness）**:
   ```typescript
   assertiveWords = ['will', 'can', 'believe', 'confident', 'certain', 'definite', 'します', 'できます', '確実']
   tentativeWords = ['might', 'maybe', 'perhaps', 'possibly', 'think', 'guess', 'かもしれ', '多分', 'たぶん']
   assertiveness = 50 + (assertiveCount * 15) - (tentativeCount * 10)
   範囲: 0-100
   ```

#### ストレス指標（StressIndicators）
```typescript
interface StressIndicators {
  hesitationMarkers: string[];    // 迷いのマーカー
  punctuationDensity: number;     // 句読点密度
  wordRepetition: number;         // 単語の繰り返し率
}
```

**検出パターン**:
- **迷いマーカー**: `/\b(um|uh|er|well|so|like|えー|あの|その)\b/gi`
- **句読点密度**: `punctuationCount / textLength`
- **単語繰り返し**: 重複単語数 / 総単語数

#### 自信マーカー（ConfidenceMarkers）
```typescript
interface ConfidenceMarkers {
  assertiveWords: string[];      // 断言的な単語
  uncertaintyWords: string[];    // 不確実性を示す単語
  questionMarks: number;         // 疑問符の数
}
```

## API使用例

### 基本的な使用方法

```typescript
import { orchestrateAgents } from '@/services/adk/orchestrator';

// セッションコンテキストの準備
const context: SessionContext = {
  bossPersona: {
    id: "boss-1",
    name: "田中部長",
    description: "厳格な上司",
    difficulty: "中級",
    personality: "直接的で結果重視",
    // ...その他のプロパティ
  },
  scenario: {
    id: "scenario-1",
    title: "進捗報告",
    description: "週次進捗報告の場面",
    difficulty: "中級"
  },
  userState: {
    stressLevel: 45,
    confidenceLevel: 60,
    responseTime: 3500
  },
  conversationHistory: [
    {
      speaker: "boss",
      text: "今週の進捗はいかがですか？",
      timestamp: "2025-06-13T10:00:00Z"
    }
  ]
};

// ユーザー入力の処理
const userInput = "えーっと、進捗は...まあまあです。";

// ADKオーケストレーションの実行
const result = await orchestrateAgents(userInput, context);

console.log(result);
// {
//   bossResponse: "具体的な数字で教えてください。",
//   guidance: [
//     {
//       type: "stress_management",
//       message: "Take a deep breath. You seem hesitant. Try stating your main point directly.",
//       priority: "medium"
//     }
//   ],
//   analysis: {
//     currentStressLevel: 65,
//     currentConfidenceLevel: 45,
//     // ...その他の分析結果
//   }
// }
```

### エラーハンドリング

```typescript
try {
  const result = await orchestrateAgents(userInput, context);
  // 成功時の処理
} catch (error) {
  console.error('ADK orchestration failed:', error);
  
  // フォールバック応答が自動的に返される
  // {
  //   bossResponse: "I see. Please continue with your point.",
  //   guidance: [{ type: 'general', message: 'Keep practicing your communication skills.', priority: 'low' }],
  //   analysis: { /* デフォルト値 */ }
  // }
}
```

## パフォーマンス考慮事項

### 並列処理

ADKオーケストレーターは効率性のため、すべてのエージェントを並列実行します：

```typescript
const [bossResponse, guidance, analysis, textAnalysis] = await Promise.all([
  bossResponseAgent.execute(userInput, context),
  guidanceAgent.execute(userInput, context),
  analyticsAgent.execute(userInput, context),
  textAnalysisAgent.execute(userInput, context),
]);
```

### キャッシング戦略

- **テキスト分析結果**: セッション内でキャッシュ
- **ボスペルソナ設定**: メモリ内キャッシュ
- **ユーザー状態**: リアルタイム更新

## セキュリティ考慮事項

### 入力検証

- **最大入力長**: 1000文字
- **XSS防止**: HTMLエスケープ処理
- **インジェクション攻撃**: プロンプトインジェクション対策

### データプライバシー

- **個人情報**: 会話ログの暗号化
- **一時的保存**: セッション終了時の自動削除
- **匿名化**: 分析データの個人特定情報除去

## 拡張性

### 新しいエージェントの追加

```typescript
class CustomAgent implements ADKAgent {
  id = 'custom-agent';
  name = 'Custom Analysis Agent';
  type = 'custom';

  async execute(input: string, context: SessionContext): Promise<any> {
    // カスタムロジックの実装
    return customResult;
  }
}

// オーケストレーターに追加
orchestrator.addAgent(new CustomAgent());
```

### 多言語サポート

- **言語検出**: 自動言語判定
- **語彙セット**: 言語別キーワードセット
- **文化的適応**: 地域別コミュニケーションスタイル

## テスト戦略

### 単体テスト

```typescript
describe('TextAnalysisAgent', () => {
  it('should analyze sentiment correctly', async () => {
    const agent = new TextAnalysisAgent();
    const result = await agent.execute('I am very happy today!', mockContext);
    
    expect(result.sentiment.score).toBeGreaterThan(0.5);
    expect(result.sentiment.confidence).toBeGreaterThan(0.6);
  });
});
```

### 統合テスト

```typescript
describe('ADK Orchestrator', () => {
  it('should handle complete workflow', async () => {
    const result = await orchestrateAgents(testInput, testContext);
    
    expect(result.bossResponse).toBeTruthy();
    expect(result.guidance).toBeInstanceOf(Array);
    expect(result.analysis.currentStressLevel).toBeGreaterThanOrEqual(0);
  });
});
```

## モニタリングとログ

### パフォーマンスメトリクス

- **応答時間**: エージェント別実行時間
- **成功率**: API呼び出し成功率
- **エラー率**: 処理失敗率

### ログレベル

- **ERROR**: 処理失敗、例外発生
- **WARN**: フォールバック使用、閾値超過
- **INFO**: 正常処理、セッション開始/終了
- **DEBUG**: 詳細な分析結果、内部状態

## バージョニング

### APIバージョン管理

- **メジャーバージョン**: 破壊的変更
- **マイナーバージョン**: 新機能追加
- **パッチバージョン**: バグ修正

### 後方互換性

- **v1.x**: 現在のAPI仕様
- **v2.x**: 将来の拡張（ML強化、リアルタイム処理等）

---

## 付録

### A. 完全な型定義

```typescript
// types/adk.types.ts
export interface TextAnalysis {
  sentiment: SentimentAnalysis;
  textQuality: TextQuality;
  stressIndicators: StressIndicators;
  confidenceMarkers: ConfidenceMarkers;
  responseTime: number;
}

export interface SentimentAnalysis {
  score: number;        // -1.0 to 1.0
  magnitude: number;    // 0.0 to 1.0
  confidence: number;   // 0.0 to 1.0
}

export interface TextQuality {
  clarity: number;         // 0-100
  professionalism: number; // 0-100
  politeness: number;      // 0-100
  assertiveness: number;   // 0-100
}

export interface StressIndicators {
  hesitationMarkers: string[];
  punctuationDensity: number;
  wordRepetition: number;
}

export interface ConfidenceMarkers {
  assertiveWords: string[];
  uncertaintyWords: string[];
  questionMarks: number;
}

export interface Scenario {
  id: string;
  title: string;
  description: string;
  difficulty: string;
}
```

### B. 設定ファイル例

```typescript
// config/adk.config.ts
export const ADKConfig = {
  gemini: {
    maxTokens: 200,
    temperature: 0.7,
    model: 'gemini-pro'
  },
  analysis: {
    maxInputLength: 1000,
    stressThresholds: {
      low: 30,
      medium: 60,
      high: 80
    },
    confidenceThresholds: {
      low: 30,
      medium: 60,
      high: 80
    }
  },
  performance: {
    maxResponseTime: 5000,
    parallelExecution: true,
    cacheEnabled: true
  }
};
```

---

*本仕様書は ADK v1.0 に基づいています。最新の仕様については、GitHubリポジトリを参照してください。*
