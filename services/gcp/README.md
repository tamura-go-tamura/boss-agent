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
- **状態**: ⚠️ 未使用
- **理由**: Agent Development Kit (ADK) のみを使用する方針のため
- **内容**: Google Cloud Natural Language APIを使用したテキスト分析機能
- **推奨**: 削除または将来的な拡張のために保持

## アーキテクチャ方針

現在のプロジェクトでは以下の方針を採用しています：

1. **ADK中心**: Agent Development Kitを主要なAI機能として使用
2. **Gemini API**: 会話生成にのみ使用
3. **シンプル化**: 不要なサービス統合を避け、チャットベースの機能に特化

## 今後の拡張予定

- Phase 2以降でVision AI（表情認識）の追加を検討
- Speech-to-Text/Text-to-Speechは音声機能が不要のため除外
- Natural Language AIは必要に応じて再検討
