# ✨ バーチャル上司シミュレーター 要件定義書 ✨

## 📜 1. はじめに

### 1.1. プロジェクトの目的とゴール
本プロジェクト「VirtualBoss Trainer」は、AIマルチエージェントシステムを活用し、職場における上司とのコミュニケーションスキルを訓練するシミュレーターを開発することを目的とします。
これにより、ユーザーのメンタルヘルス向上、離職率の低下、そして健全な職場環境の実現に貢献します。

**ゴール:**
-   新入社員や管理職候補者が、様々なタイプの上司との対話を通じて、効果的なコミュニケーション戦略を習得できるリアルタイム訓練システムを提供する。
-   企業が従業員の対人スキル向上とメンタルヘルスケアを目的として導入できるソリューションを提供する。
-   **本ハッカソンでのプロトタイプ発表と、その後の事業化を目指す。**

### 1.2. プロジェクトの背景と課題
現代の職場環境において、パワーハラスメントや理不尽な上司とのコミュニケーションは、従業員のメンタルヘルス悪化や離職の大きな要因となっています。特に経験の浅い新入社員や転職者、あるいは新たに管理職となる人々にとって、これらの状況への適切な対応スキルを事前に習得する機会は限られています。
本プロジェクトは、この課題に対し、安全かつ効果的な訓練環境を提供することで解決を目指します。

### 1.3. 対象ユーザー
-   新入社員
-   転職者
-   管理職候補
-   企業人事部・研修担当者

### 1.4. 本書の位置づけ
本書は、「バーチャル上司シミュレーター」プロジェクトの開発における要件を定義するものです。開発チーム、関係者間の共通認識を形成し、プロジェクトを円滑に推進することを目的とします。**Next.jsの開発原則およびハッカソンルールを遵守します。**

### 1.5. 用語定義
| 用語                      | 説明                                                                                                                               |
| :------------------------ | :--------------------------------------------------------------------------------------------------------------------------------- |
| ADK                       | **Agent Development Kit**。Google Cloud のマルチエージェント協調システム構築のためのキット。**本ハッカソンでのAgent開発に必須。**                     |
| Gemini API                | Google の大規模言語モデル Gemini を利用するためのAPI。Vertex AI経由での利用を推奨。                                                              |
| MVP                       | Minimum Viable Product。最小実行可能プロダクト。                                                                                       |
| Next.js App Router        | Next.js 13以降で導入された新しいルーティングシステム。サーバーコンポーネント (RSC) を活用。                                                              |
| Server Actions            | Next.js の機能。クライアントから直接呼び出せるサーバーサイド関数。API Routesの代替。                                                                  |
| RSC                       | React Server Components。サーバー側でレンダリングされるReactコンポーネント。                                                                     |
| shadcn/ui                 | 再利用可能なコンポーネント群を提供するUIライブラリ。本プロジェクトのUI構築の標準。                                                                       |
| lucide-react              | 本プロジェクトで標準使用するアイコンライブラリ。                                                                                             |
| nuqs                      | Next.js App Router向けのURL状態管理ライブラリ。                                                                                        |
| useSWR                    | データ取得のためのReact Hooksライブラリ。リアルタイム更新や楽観的更新に利用。                                                                        |
| react-hook-form           | React用のフォーム状態管理・バリデーションライブラリ。                                                                                          |
| Zod                       | TypeScriptファーストのスキーマ宣言・検証ライブラリ。フォームバリデーション等に利用。                                                                  |
| Supabase                  | オープンソースの Firebase 代替サービス。PostgreSQLデータベース、認証、ストレージなどを提供。RLS (Row Level Security) を活用。                         |
| Cloud Run                 | Google Cloudのフルマネージドなコンテナ実行環境。Next.jsアプリケーションのホスティングに利用。**ハッカソン必須技術。**                                          |
| Firebase Realtime Database | GoogleのNoSQLクラウドデータベース。リアルタイムでのデータ同期に優れる。**Firebase賞狙いで利用。**                                                        |

---

## 🚀 2. プロジェクト概要

### 2.1. システム概要
AIマルチエージェントシステムを活用したリアルタイム上司対応訓練システムです。ユーザーは様々なペルソナを持つAI上司とテキストベースで対話し、その応答や態度に基づいてリアルタイムでフィードバックや指導を受けます。セッション後には詳細な分析結果が提供され、スキルの改善を促します。
**Next.js App Routerを全面的に採用し、モダンなWebアプリケーションとして構築します。**

### 2.2. システム構成図 (アーキテクチャ)
（元のドキュメント「🏗️ システムアーキテクチャ（ハッカソン必須サービス準拠）」セクションを参照しつつ、以下を強調）

-   **Google Cloud アプリケーション関連サービス (ハッカソン必須)**
    -   **Cloud Run**: Next.js アプリケーションのホスティング
    -   Cloud Run Functions: リアルタイム分析処理の軽量実行 (検討)
-   **Google Cloud AI サービス (ハッカソン必須)**
    -   **Agent Development Kit (ADK) ⭐️**: マルチエージェント協調システムの中核 (**最重要**)
    -   **Gemini API in Vertex AI**: 上司ペルソナ生成・会話処理
    -   Natural Language AI: テキスト感情分析・ストレス検知
    -   Vision AI: ユーザーの表情・身振り分析（カメラ使用時、Phase 2以降）
-   **特別賞狙いサービス**
    -   **Firebase Realtime Database**: リアルタイムストレス値同期 (**Firebase賞狙い**)
    -   Cloud Storage: セッション録画・分析データ保存 (Deep Dive賞狙い)
    -   BigQuery: 学習効果分析・企業向けレポート (Deep Dive賞狙い)
-   **データベース・認証**
    -   Supabase (PostgreSQL, Auth): ユーザー情報、セッションデータ管理

### 2.3. 利用技術スタック (Next.js開発原則準拠)

#### フロントエンド (`app/`, `components/`, `hooks/`, `lib/`, `types/`, `constants/`, `config/`)
```json
{
  "framework": "Next.js 14 (App Router)",
  "language": "TypeScript",
  "ui": "shadcn/ui",
  "icons": "lucide-react",
  "forms": "react-hook-form + Zod",
  "stateManagement": {
    "urlState": "nuqs",
    "dataFetching": "useSWR (for client-side data)",
    "globalState": "React Context + useReducer (minimal use)"
  },
  "realtime": "useSWR, Firebase Realtime Database"
}
```

#### バックエンド・インフラ (`services/`, Server Actions in `app/`)
```json
{
  "hosting": "Cloud Run",
  "serverLogic": "Server Actions (Next.js)",
  "database": "Supabase (PostgreSQL)",
  "auth": "Supabase Auth",
  "storage": "Cloud Storage (GCP)",
  "ai": [
    "Agent Development Kit (ADK)",
    "Gemini API in Vertex AI",
    "Vision AI (GCP, Phase 2)"
  ]
}
```

#### 開発ツール
```json
{
  "package_manager": "pnpm",
  "linting": "ESLint + Prettier (TypeScript strict mode, no errors)",
  "testing": "Jest + React Testing Library (Unit/Integration), Manual testing via `demo/` pages",
  "deployment": "Cloud Run (CI/CD via GitHub Actions)",
  "monitoring": "Google Cloud Monitoring"
}
```

---

## 🧩 3. 機能要件

### 3.1. ユーザー向け機能 (Next.js App Routerベース)

#### 3.1.1. 訓練セッション機能 (`app/training/[sessionId]/page.tsx`)
-   **チャットインターフェース (RSC + Client Components)**:
    -   ユーザーテキスト入力フィールド (`react-hook-form`, `zod`でバリデーション)
    -   上司アバター表示 (`shadcn/ui`コンポーネント, `next/image`。Phase 1は静的または簡易アニメーション)
        -   リアルタイム感情変化反映 (Phase 1はテキストベース、Phase 2で視覚的変化)
    -   会話履歴表示 (Server Actions経由で取得、`useSWR`でリアルタイム性も検討)
    -   上司タイピングインジケーター
    -   リアルタイムオーバーレイ (ストレス値など、Firebase連携)
-   **オプションカメラ機能** (Phase 2以降):
    -   Client Component内で制御、Vision AI連携
-   **コントロール (`shadcn/ui` Buttons)**:
    -   セッション開始/終了ボタン (Server Actions呼び出し)
    -   緊急停止ボタン
    -   ヒント要求ボタン (Server Actions呼び出し)
    -   クイック返答ボタン
-   **リアルタイムメトリクス表示 (`shadcn/ui` Progress, Badges)**:
    -   ストレスゲージ (Firebase連携)
    -   自信度バー
    -   AIからの推奨アクション表示
    -   上司の機嫌メーター
    -   応答時間トラッカー

#### 3.1.2. 上司ペルソナ選択・カスタマイズ機能 (`app/boss-select/page.tsx`)
-   **プリセットペルソナ (RSC)**:
    -   複数の定義済み上司ペルソナをカード形式で表示 (`shadcn/ui Card`)
-   **カスタム作成** (Phase 2以降, Client Component + Server Actions):
    -   性格スライダー (`shadcn/ui Slider`)
    -   シナリオ選択 (`shadcn/ui Select`)
-   **エンタープライズモード** (Phase 2以降)

#### 3.1.3. 分析・レポート機能 (`app/analytics/page.tsx`, `app/analytics/[sessionId]/page.tsx`)
-   **セッション履歴 (RSC, `useSWR`でクライアントでのソート等)**:
    -   過去セッション一覧 (`shadcn/ui Table`)
-   **進捗トラッキング (RSC, `shadcn/ui` Charts or Recharts)**:
    -   スキル向上度グラフ
-   **スキルレーダーチャート** (Phase 2以降)
-   **企業向け集計レポート** (Phase 2以降)

#### 3.1.4. 企業向け管理機能 (`app/enterprise/...`) (Phase 2以降)
-   従業員管理、訓練プログラム作成など (Server Actions, `shadcn/ui Table, Forms`)

#### 3.1.5. 認証機能 (`app/auth/login/page.tsx`, `app/auth/signup/page.tsx`, etc.)
-   Supabase Auth を利用したユーザー登録・ログイン・ログアウト (Server Actionsでラップ)
-   プロフィール管理 (`app/settings/profile/page.tsx`)

#### 3.1.6. ゲーミフィケーション要素
-   **個人向け**: レベル、バッジ (`shadcn/ui Badge`), ストリーク
-   **企業向け** (Phase 2以降): チーム対抗戦、ランキング

### 3.2. AIエージェント機能 (ADKマルチエージェント設計)
_(インターフェース定義は既存のものを踏襲しつつ、役割を明確化)_

#### 3.2.1. 上司ペルソナ生成エージェント
-   **役割**: 様々な上司タイプを動的に生成・管理。Gemini APIを活用。
-   **インターフェース**: `BossPersona` (既存定義)

#### 3.2.2. リアルタイム分析エージェント
-   **役割**: ユーザーの状態をリアルタイムで監視・分析。Natural Language AI, Firebase等を活用。
-   **インターフェース**: `UserState` (既存定義)

#### 3.2.3. 指導エージェント
-   **役割**: 最適な対応方法をリアルタイムで提案。Gemini API, ADKロジック。
-   **インターフェース**: `GuidanceAction` (既存定義)

#### 3.2.4. 評価・学習エージェント
-   **役割**: セッション後の詳細分析と改善提案。Gemini API, ADKロジック。
-   **インターフェース**: `SessionAnalysis` (既存定義)

#### 3.2.5. アバター感情制御エージェント
-   **役割**: 上司アバターの感情状態を管理し、テキストや視覚的変化に反映。ADKロジック。
-   **インターフェース**: `BossAvatarState`, `MoodChangeEvent` (既存定義)
    -   `[解決済み] AvatarExpressionの型定義が必要` -> `types/ai.types.ts` に定義

### 3.3. バックエンド機能 (Server Actions - 主に `app/actions/*.ts` または各機能ディレクトリ内の `actions.ts`)
-   `export async function startTrainingSession(bossPersona: BossPersona): Promise<SessionId>`
-   `export async function analyzeUserText(sessionId: SessionId, message: string, responseTime: number): Promise<UserState>`
-   `export async function generateBossResponse(sessionId: SessionId, context: ConversationContext): Promise<BossResponse>`
    -   `[解決済み] ConversationContext, BossResponse の型定義が必要 (types/ ディレクトリに配置)` -> `types/ai.types.ts` に定義
-   `export async function endSession(sessionId: string): Promise<SessionAnalysis>`
-   `export async function getResponseSuggestions(sessionId: SessionId, context: ConversationContext): Promise<string[]>`
-   **セキュリティ**: Server Actionsはユーザー認証(Supabase `auth.uid()`)とRLSを前提とし、最小権限の原則を遵守。

### 3.4. テキストベース特化機能 (ADKエージェント群で実現)
_(インターフェース定義は既存のものを踏襲)_

#### 3.4.1. 応答時間分析システム: `ResponseTimeAnalysis`
#### 3.4.2. 文章品質評価システム: `TextQualityMetrics`
#### 3.4.3. スマート回答提案システム: `SmartSuggestions`

---

## ⚙️ 4. 非機能要件

### 4.1. パフォーマンス・拡張性
-   **応答速度**: Next.js App Router (RSC) と Server Actions を活用し、最適化。クライアントコンポーネントは `Suspense` でフォールバック。動的 `import()`、`next/image`, `next/link` を使用。
    -   ユーザー操作に対するUI応答: 1秒以内。
    -   AI上司の応答生成: 5秒以内目標。[確認事項] 負荷試験で調整。
-   **同時アクセス数**: MVP段階で数十人。Cloud Runの自動スケーリング。
-   **スケーラビリティ**: Cloud Run, Supabase, GCP AIサービスのスケーラビリティを活用。

### 4.2. セキュリティ
-   **認証**: Supabase Auth (RLS連携)。
-   **データ保護**: GCP/Supabaseのセキュリティ機能活用。個人情報保護法規準拠。
-   **脆弱性対策**: Next.jsの標準セキュリティ機能に加え、Server Actionsの入力バリデーション (Zod)、出力エスケープ。
-   **Server Actionsのセキュリティ指針**: ユーザーが許可された操作のみを実装。汎用的な関数は避ける。

### 4.3. 可用性と信頼性
-   **稼働率**: 99.5%目標 (ハッカソン期間中はベストエフォート)。[確認事項] SLA定義。
-   **障害復旧**: Google Cloud Monitoring, Supabaseのログ監視。

### 4.4. 保守性と運用性
-   **コード品質**: TypeScript (strict mode)、ESLint, Prettier。型エラーゼロ。ガード節による早期return。
-   **テスト**:
    -   単体/結合テスト: Jest, React Testing Library。
    -   **手動E2Eテスト**: `demo/` ディレクトリに主要なServer Actionsやクライアント機能をブラウザ経由でテストできるページを配置。
-   **デプロイ**: Cloud RunへGitHub Actions経由でCI/CD。
-   **監視**: Google Cloud Monitoring。

### 4.5. UI/UX (ユーザーインターフェース・ユーザーエクスペリエンス)
-   **デザイン**: **モダンで洗練されたUIを目指し、`shadcn/ui` を全面的に採用。**
-   **アイコン**: **`lucide-react` を用いた統一感のあるアイコンシステムを導入。**
-   **直感性**: 初めてのユーザーでも容易に操作可能。
-   **アクセシビリティ (A11y)**: セマンティックHTML, ARIA属性、キーボード操作サポート。WCAG準拠を目指す。[確認事項] 対応レベル定義。
-   **状態管理**: URLの状態は `nuqs` に統一。

### 4.6. データ管理
-   **データ整合性**: Supabaseの制約、Zodによるバリデーション。
-   **データバックアップ**: Supabaseの自動バックアップ。[確認事項] バックアップ頻度、リストア手順。

---

## 💾 5. データ要件

### 5.1. データベース設計 (Supabase PostgreSQL - `types/database.types.ts` で型定義を生成・利用)

#### 5.1.1. `profiles` テーブル
```sql
-- ユーザープロフィール
CREATE TABLE profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(), -- Supabase auth.users.id と一致させることを推奨
  user_id UUID REFERENCES auth.users ON DELETE CASCADE NOT NULL UNIQUE,
  name TEXT NOT NULL,
  role TEXT CHECK (role IN ('individual', 'enterprise_admin', 'employee')) DEFAULT 'individual',
  company_id UUID REFERENCES companies(id) ON DELETE SET NULL,
  skill_level INTEGER DEFAULT 1,
  created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);
-- RLSポリシー: ユーザーは自身のプロフィールのみRW。管理者は関連従業員情報をR。
-- Supabaseの `auth.uid()` を利用し、Server Actions内で user_id を明示的に渡す必要を減らす。
```

#### 5.1.2. `training_sessions` テーブル
```sql
-- 訓練セッション
CREATE TABLE training_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users ON DELETE CASCADE NOT NULL,
  boss_persona JSONB NOT NULL,
  duration_seconds INTEGER,
  stress_levels JSONB, -- 例: [{timestamp: string, level: number}]
  analysis_result JSONB, -- SessionAnalysis型
  score INTEGER,
  created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);
-- RLSポリシー: ユーザーは自身のセッションデータのみRW。
```

#### 5.1.3. `companies` テーブル (Phase 2以降)
```sql
-- 企業管理
CREATE TABLE companies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  admin_user_id UUID REFERENCES auth.users ON DELETE SET NULL, -- 企業管理者のprofile.user_id
  custom_scenarios JSONB,
  created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);
-- RLSポリシー: 企業管理者は自社情報RW。
```
**[重要確認事項]**
-   **RLS (Row Level Security) ポリシー**: 各テーブルに対して、Next.js開発原則に基づき `auth.uid()` を活用した具体的なポリシーを設計・実装する。
-   **`updated_at` カラム**: 自動更新トリガーを設定する。
-   **型定義**: Supabase CLI を使用して `types/database.types.ts` を生成し、プロジェクト全体で型安全性を確保する。

### 5.2. データ保持期間・バックアップ方針
-   **データ保持期間**: [確認事項] ユーザーデータ、セッションデータの保持期間（例: 最終ログインからX年）。
-   **バックアップ方針**: [確認事項] Supabase自動バックアップに加え、必要に応じた手動バックアップ頻度・リストア手順。

---

## 🗺️ 6. 開発フェーズとスコープ (ハッカソンルール準拠)

### 6.1. Phase 1: MVP (ハッカソン提出版 - 提出期限: 2025年7月16日)

#### 6.1.1. スコープ
ハッカソン期間内に、コア訓練機能と基本分析機能を実装し、システムのコンセプトを実証する。**Google Cloud必須技術 (Cloud Run, ADK, Gemini API) を確実に利用する。Firebase Realtime Databaseも導入しFirebase賞を狙う。**

#### 6.1.2. 主要機能
1.  **基本訓練機能**:
    *   3種類の上司ペルソナ選択
    *   テキストチャット対話 (`shadcn/ui`, Server Actions)
    *   リアルタイムストレス値表示 (Firebase Realtime Database連携)
    *   応答時間・基本文章特徴分析
2.  **分析機能**:
    *   セッション後の基本分析表示 (スコア、フィードバック)
    *   改善提案表示 (AIからのアドバイス)
    *   進捗グラフ (簡易版)
3.  **認証・データ管理**:
    *   Supabase Auth (ユーザー登録・ログイン)
    *   セッション履歴保存 (Supabase DB)
    *   基本プロフィール管理
4.  **UI/UX**:
    *   主要画面のUI実装 (`shadcn/ui`, `lucide-react`)
    *   レスポンシブデザイン (モバイルフレンドリー)
5.  **テスト**:
    *   `demo/` ページでの主要機能の手動テストパス

#### 6.1.3. デモシナリオ (3分間 - Zenn記事用動画)
_(既存のシナリオを踏襲し、技術的実現性を強調)_
-   **実演内容**:
    -   `shadcn/ui` を用いたモダンなUIでの上司ペルソナ選択
    -   Cloud Run上で動作するNext.jsアプリでのリアルタイムチャット
    -   ADKとGemini APIによるAI上司の自然な応答
    -   Firebase Realtime Databaseによるストレス値のリアルタイム同期表示
    -   セッション後の分析結果表示

### 6.2. Phase 2: ポストハッカソン拡張

#### 6.2.1. スコープ
MVPのフィードバックを元に機能を洗練。高度なAI機能、企業向け機能を追加。

#### 6.2.2. 主要機能
1.  **高度なAI機能**: Vision AI (表情認識), Speech-to-Text/Text-to-Speech, カスタムペルソナ生成
2.  **企業機能**: 管理者ダッシュボード, 集団分析 (BigQuery連携検討)
3.  **UX向上**: 詳細ゲーミフィケーション, 多言語対応

### 6.3. 将来的な拡張構想
-   業界特化版, VR対応, 最新AIモデル統合

---

## 🌊 7. ユーザーフロー (Next.js App Routerベース)

### 7.1. 新規ユーザー体験フロー
1.  サインアップページ (`app/auth/signup/page.tsx`)
2.  (Phase 2) 初回アセスメント
3.  チュートリアル (優しい上司との練習セッション in `app/training/...`)
4.  ダッシュボード (`app/dashboard/page.tsx`) へ

### 7.2. 訓練セッションフロー
1.  上司選択画面 (`app/boss-select/page.tsx`)
2.  (Phase 2) シナリオ設定
3.  訓練画面 (`app/training/[sessionId]/page.tsx`) でリアルタイム対話
4.  セッション終了後、分析画面 (`app/analytics/[sessionId]/page.tsx`) へ

### 7.3. 企業利用フロー (Phase 2以降)
_(既存のフローを踏襲)_

---

## 🛡️ 8. リスクと対策

### 8.1. 技術的リスクと対策
-   **ADK複雑性**:
    -   **対策**: 段階的実装。シンプルなエージェントから開始。Google Cloudのドキュメント・サポート活用。
-   **リアルタイム処理負荷**:
    -   **対策**: Cloud Run自動スケーリング。Firebase Realtime Databaseの効率的利用。`useSWR`によるクライアント側最適化。
-   **APIコスト**:
    -   **対策**: 各AIサービスの無料枠・効率的利用。キャッシュ戦略。

### 8.2. ビジネスリスクと対策
_(既存の対策を踏襲)_

### 8.3. 社会的リスクと対策
_(既存の対策を踏襲)_

---

## 📈 9. 期待される効果とKPI

_(既存のKPIを踏襲しつつ、測定方法を具体化)_
-   **[確認事項] 各KPIの具体的な測定方法と目標値を明確にする。**
    -   例: ストレス耐性向上 → セッション中の平均ストレスレベルの推移、特定シナリオでの最大ストレスレベルの低減率。

---

## 📚 10. Appendix (付録)

### 10.1. 参考資料
-   元の機能要件書: `virtual-boss-simulator-requirements.md`
-   Next.js開発原則: `prompt:code-style.prompt.md`
-   ハッカソンルール: `prompt:code-style.prompt.md`

### 10.2. 📝 未確定事項・確認事項一覧 (優先度順に整理)
1.  **最重要**:
    *   **DB**: 各テーブルのRLSポリシー詳細設計と実装。`updated_at`トリガー。Supabase `types/database.types.ts`生成と利用。
    *   ~~**型定義**: `AvatarExpression`, `ConversationContext`, `BossResponse` の型定義 (`types/`ディレクトリ)。~~ (`types/ai.types.ts` に作成済み)
2.  **重要**:
    *   **非機能要件**: 応答速度目標値の負荷試験による最終調整。SLA定義。アクセシビリティ対応レベル。データ保持期間・バックアップ方針。
    *   **KPI**: 各KPIの具体的な測定方法と目標値。
3.  **その他**:
    *   Phase 2以降の詳細機能の優先順位付け。

---
