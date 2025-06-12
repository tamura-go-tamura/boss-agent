# 🎯 バーチャル上司トレーニング - チャット特化版

AIを活用したチャットベースの上司コミュニケーション訓練システム

## 🚀 概要

このプロジェクトは、様々なタイプの上司との対話シミュレーションを通じて、職場でのコミュニケーションスキルを向上させるためのWebアプリケーションです。音声機能を排除し、**チャット（テキスト）での会話に特化**した設計になっています。

## ✨ 主要機能

- 🤖 **AIボスとのリアルタイムチャット** - 複数の上司ペルソナから選択
- 📊 **リアルタイム分析** - ストレスレベルと自信度の可視化
- 💡 **応答提案システム** - 状況に応じた適切な返答の提案
- ⌨️ **キーボードショートカット** - 効率的な操作
- 📈 **セッション分析** - 訓練後の詳細なフィードバック

## 🛠️ 技術スタック

### フロントエンド
- **Next.js 14** (App Router)
- **TypeScript**
- **Tailwind CSS** + **shadcn/ui**
- **React Hook Form** + **Zod**

### バックエンド・インフラ
- **Cloud Run** (ホスティング)
- **Supabase** (データベース・認証)
- **Firebase Realtime Database** (リアルタイム同期)

### AI・機械学習
- **Agent Development Kit (ADK)** ⭐️ - マルチエージェント協調システム
- **Gemini API in Vertex AI** - 会話生成
- **Vision AI** (Phase 2予定) - 表情認識

## 🏗️ プロジェクト構造

```
boss-agent/
├── app/                    # Next.js App Router
├── components/             # Reactコンポーネント
├── services/
│   ├── adk/               # Agent Development Kit
│   ├── firebase/          # Firebase統合
│   └── gcp/               # Google Cloud Platform
├── hooks/                 # カスタムReact Hooks
├── lib/                   # ユーティリティ
├── types/                 # TypeScript型定義
└── docs/                  # プロジェクトドキュメント
```

## 📋 設計方針

### チャット特化
- 音声機能は完全に削除
- テキストベースの自然な対話に集中
- キーボード操作の最適化

### ADK中心アーキテクチャ
- Agent Development Kitをコア技術として採用
- Natural Language AIは使用せず、ADKで統合的に処理
- シンプルで効率的なAI機能

## 🚧 開発状況

- ✅ **Phase 1 (MVP)** - チャットベース訓練システム
- 🔄 **Phase 2 (予定)** - Vision AI統合、高度な分析機能

## 📝 ライセンス

このプロジェクトはハッカソン提出用のプロトタイプです。