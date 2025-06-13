# Google Cloud Platform Services

このディレクトリには、Google Cloud Platform（GCP）のAIサービスとの統合コードが含まれています。

## 現在使用中のサービス

### `gemini.ts`
- **用途**: Gemini APIを使用した上司ペルソナとの会話生成
- **機能**: 
  - `generateBossResponse()`: ユーザーの入力に基づいて上司の応答を生成
- **使用箇所**: `app/training/page.tsx`

## 非使用ファイル

### `naturalLanguage.ts` 
- **状態**: ❌ **削除済み**
- **理由**: Agent Development Kit (ADK) のみを使用する方針のため
- **削除日**: 2025年6月13日
- **旧機能**: Google Cloud Natural Language APIを使用したテキスト分析

## アーキテクチャ方針

現在のプロジェクトでは以下の方針を採用しています：

1. **ADK中心**: Agent Development Kitを主要なAI機能として使用
2. **Gemini API**: 会話生成にのみ使用
3. **チャット特化**: 音声機能を削除し、テキストベースの対話に集中
4. **シンプル化**: 不要なサービス統合を避け、必要最小限の構成

## 削除された機能

- ❌ **Natural Language AI**: ADKで統合的に処理するため削除
- ❌ **Speech-to-Text**: 音声機能削除により不要
- ❌ **Text-to-Speech**: 音声機能削除により不要

## 今後の拡張予定

- Phase 2以降でVision AI（表情認識）の追加を検討
- ADKのマルチエージェント機能をより活用
- 企業向け管理機能の追加
