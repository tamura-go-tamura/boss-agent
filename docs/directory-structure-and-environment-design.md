# 📂 ディレクトリ構成と環境設計

本ドキュメントは、「VirtualBoss Trainer」プロジェクトにおけるディレクトリ構成と環境設定の指針を定義します。Next.jsの標準的なプラクティスと、`prompt:code-style.prompt.md` に記載された開発原則に基づいています。

## 1. 基本ディレクトリ構造

プロジェクトルート直下の主要なディレクトリとファイルは以下の通りです。

```
.
├── app/                  # Next.js App Router (ルーティング、ページ、レイアウト、Server Actions)
├── components/           # 汎用UIコンポーネント (shadcn/ui ベース、独自コンポーネント)
├── lib/                  # ユーティリティ関数、ヘルパー関数
├── hooks/                # カスタムReactフック
├── types/                # グローバルな型定義 (TypeScript)
├── constants/            # プロジェクト全体で利用する定数
├── config/               # 環境変数ラッパー、設定値管理
├── services/             # 外部APIクライアント、ビジネスロジック (ADKエージェント連携など)
├── demo/                 # 手動テスト用ページ (Server Actions、クライアント機能の検証)
├── public/               # 静的ファイル (画像、フォントなど)
├── styles/               # グローバルCSS、TailwindCSSのベース設定
├── supabase/             # Supabase関連ファイル (マイグレーション、シードデータ、ローカル設定)
├── .github/              # GitHub関連設定 (ワークフロー、Issueテンプレートなど)
│   ├── workflows/        # CI/CDパイプライン (GitHub Actions)
│   └── prompts/          # Copilot向けプロンプトなど
├── .env.local            # ローカル環境変数 (Git管理外)
├── .env.development.local # 開発環境用ローカル環境変数 (Git管理外、.env.developmentより優先)
├── .env.test.local       # テスト環境用ローカル環境変数 (Git管理外、.env.testより優先)
├── .env.production.local # 本番環境用ローカル環境変数 (Git管理外、.env.productionより優先)
├── .env.example          # 環境変数のテンプレート (Git管理)
├── next.config.mjs       # Next.js設定ファイル
├── tsconfig.json         # TypeScript設定ファイル
├── tailwind.config.ts    # TailwindCSS設定ファイル
├── postcss.config.js     # PostCSS設定ファイル
├── .eslintrc.json        # ESLint設定ファイル
├── prettier.config.js    # Prettier設定ファイル
├── pnpm-lock.yaml        # pnpmロックファイル
└── package.json          # プロジェクト定義、依存関係
```

## 2. 詳細なディレクトリ構成

### 2.1. `app/` ディレクトリ

Next.js App Routerの規約に従います。

-   **ルーティング**: ディレクトリ構造がそのままURLパスに対応します。
    -   例: `app/training/[sessionId]/page.tsx` -> `/training/:sessionId`
-   **レイアウト**: `layout.tsx` (共有UI)
-   **ページ**: `page.tsx` (各ルートのUI)
-   **ローディングUI**: `loading.tsx`
-   **エラーUI**: `error.tsx` (クライアントコンポーネントである必要あり)
-   **Not Found UI**: `not-found.tsx`
-   **Server Actions**:
    -   機能単位で `actions.ts` ファイルを作成し、関連するページのディレクトリ内に配置することを推奨します。
        -   例: `app/training/[sessionId]/actions.ts`
    -   または、グローバルなものは `app/actions/` ディレクトリにまとめることも検討可能です。
-   **機能固有コンポーネント**:
    -   特定のページやレイアウトでのみ使用されるコンポーネントは、その `page.tsx` や `layout.tsx` と同じ階層に配置します。
        -   例: `app/training/[sessionId]/components/ChatInput.tsx`
-   **ルートグループ**: `(groupName)` 形式のディレクトリで、URLに影響を与えずにルートを整理できます。
    -   例: `app/(auth)/login/page.tsx`
-   **API Routesは使用しません。** すべてのサーバー処理はServer Actionsで実装します。

### 2.2. `components/` ディレクトリ

再利用可能な汎用UIコンポーネントを配置します。

-   `components/ui/`: `shadcn/ui` によって自動生成・カスタマイズされたコンポーネント。
-   `components/common/`: プロジェクト全体で使われる汎用的なコンポーネント (例: `Button.tsx`, `Modal.tsx` など、`shadcn/ui` をラップしたものや独自実装)。
-   `components/layouts/`: ページ全体の構造を定義するレイアウトコンポーネント (例: `Header.tsx`, `Sidebar.tsx`, `Footer.tsx`)。
-   `components/icons/`: カスタムSVGアイコンや、`lucide-react` を拡張するコンポーネント。

### 2.3. `lib/` ディレクトリ

特定のフレームワークやUIに依存しないユーティリティ関数を配置します。

-   例: `lib/utils.ts` (共通ヘルパー), `lib/dateUtils.ts`, `lib/stringUtils.ts`
-   Supabaseクライアントの初期化などもここに配置できます (`lib/supabase/client.ts`, `lib/supabase/server.ts`)。

### 2.4. `hooks/` ディレクトリ

カスタムReactフックを配置します。

-   例: `hooks/useMediaQuery.ts`, `hooks/useAuth.ts` (Supabaseの認証状態を扱うフックなど)

### 2.5. `types/` ディレクトリ

プロジェクト全体で使用するTypeScriptの型定義を配置します。

-   `types/database.types.ts`: Supabase CLIによって自動生成されるデータベースの型定義。**手動で編集しません。**
-   `types/ai.types.ts`: `BossPersona`, `UserState` など、AIエージェント関連の型定義。
-   `types/next-env.d.ts`: Next.js環境の型定義。
-   その他、APIレスポンスの型や共通のデータ構造など。

### 2.6. `constants/` ディレクトリ

アプリケーション全体で使用する定数を定義します。

-   例: `constants/paths.ts` (URLパス), `constants/config.ts` (固定設定値), `constants/messages.ts` (表示メッセージ)

### 2.7. `config/` ディレクトリ

環境変数や外部サービスの設定値を安全に管理・提供します。

-   `config/env.ts`: 環境変数を型安全に読み込み、アプリケーション内で使用できるようにするラッパー。Zodなどでのバリデーションも推奨。
-   `config/firebase.ts`: Firebaseの初期化設定 (もしクライアントサイドでの初期化が必要な場合)。
-   `config/gcp.ts`: GCPサービス関連の設定。

### 2.8. `services/` ディレクトリ

外部APIとの通信や、複雑なビジネスロジックをカプセル化します。

-   `services/bossTrainerAPI.ts`: (もしバックエンドAPIを別途構築する場合。本プロジェクトではServer Actionsが主)
-   `services/gcp/gemini.ts`: Gemini APIを呼び出す関数群。
-   `services/gcp/naturalLanguage.ts`: Natural Language AIを呼び出す関数群。
-   `services/adk/`: ADKエージェントの初期化や連携ロジック。
    -   ADKエージェントの具体的な実装は、ADKのプロジェクト構造に依存する可能性があります。このディレクトリは、Next.jsアプリケーションとADKエージェント間のインターフェースとなる部分を配置するイメージです。

### 2.9. `supabase/` ディレクトリ

Supabase関連のファイルを管理します。

-   `supabase/migrations/`: Supabase CLIで生成・管理されるデータベースマイグレーションファイル。
-   `supabase/seed.sql`: ローカル開発環境やテスト環境で使用する初期データ。
-   `supabase/config.toml`: Supabase CLIのプロジェクト設定ファイル。
-   `supabase/functions/`: Supabase Edge Functions (もし利用する場合)。

## 3. 環境変数管理

Next.jsの標準的な環境変数管理方法に従います。

-   **`.env.local`**: ローカルでの開発時に使用する環境変数。**Gitリポジトリにはコミットしません。**
-   **`.env.development.local`, `.env.test.local`, `.env.production.local`**: 各環境固有のローカル上書き用。**Gitリポジトリにはコミットしません。**
-   **Vercel, Cloud Runなどのホスティング環境**: 各プラットフォームの環境変数設定機能を利用します。
-   **プレフィックス**:
    -   クライアントサイドで利用可能な環境変数は `NEXT_PUBLIC_` プレフィックスを付けます。
    -   サーバーサイドのみで利用する環境変数にはプレフィックスは不要です。
-   **型安全なアクセス**: `config/env.ts` でZodなどを用いて環境変数をパースし、型安全にアクセスできるようにすることを強く推奨します。

```typescript
// filepath: config/env.ts
import { z } from 'zod';

const envSchema = z.object({
  DATABASE_URL: z.string().url(),
  NEXT_PUBLIC_SUPABASE_URL: z.string().url(),
  NEXT_PUBLIC_SUPABASE_ANON_KEY: z.string(),
  GEMINI_API_KEY: z.string(),
  // ... 他の環境変数
});

export const env = envSchema.parse(process.env);
```

## 4. 設定ファイル

主要な設定ファイルはプロジェクトルートに配置されます。

-   `next.config.mjs`: Next.jsのビルド設定、リダイレクト、ヘッダー設定など。
-   `tsconfig.json`: TypeScriptのコンパイラオプション。`paths`エイリアス（例: `@/*`）を設定し、モジュール解決を簡潔にします。
-   `tailwind.config.ts`: TailwindCSSのテーマ、プラグイン、`content`パスの設定。
-   `.eslintrc.json`: ESLintのルール設定。TypeScriptとの連携、Next.js用プラグイン、Prettierとの競合回避設定。
-   `prettier.config.js`: Prettierのフォーマットルール設定。

## 5. CI/CD

-   `.github/workflows/` ディレクトリにGitHub Actionsのワークフローファイルを配置します。
-   主なワークフロー:
    -   Lint, Type Check, Test (Pull Request時)
    -   Build & Deploy to Cloud Run (mainブランチへのマージ時)

このディレクトリ構成と環境設計は、プロジェクトの成長に合わせて柔軟に見直すことが可能です。重要なのは、一貫性を保ち、チームメンバー全員が理解しやすい構造を維持することです。
