# Google ADK Backend

Google Agent Development Kit (ADK) powered backend for the Virtual Boss Training system.

## セットアップ

### 1. Python環境の準備

```bash
cd adk-backend
python -m venv venv
source venv/bin/activate  # macOS/Linux
# または
venv\Scripts\activate     # Windows
```

### 2. 依存関係のインストール

```bash
pip install -r requirements.txt
```

### 3. Google Cloud設定

1. Google Cloud Projectを作成
2. Vertex AI APIを有効化
3. サービスアカウントを作成し、JSONキーをダウンロード
4. 環境変数を設定

```bash
cp .env.example .env
```

`.env`ファイルを編集：
```env
GOOGLE_CLOUD_PROJECT=your-project-id
GOOGLE_APPLICATION_CREDENTIALS=path/to/service-account.json
GEMINI_MODEL=gemini-2.0-flash-exp
GEMINI_REGION=us-central1
PORT=8000
FRONTEND_URL=http://localhost:3000
```

### 4. サーバー起動

```bash
python main.py
```

## API エンドポイント

- `GET /` - ヘルスチェック
- `GET /health` - 詳細ヘルスチェック
- `POST /api/training/process` - トレーニング処理
- `POST /api/training/analyze` - セッション分析
- `POST /api/training/test` - ADK接続テスト
- `GET /api/boss-personas` - 利用可能な上司ペルソナ

## Google ADK統合

このバックエンドは以下のGoogle ADKエージェントを使用：

1. **Boss Response Agent** - 上司の応答生成 (Gemini 2.0 Flash)
2. **Analysis Agent** - パフォーマンス分析
3. **Guidance Agent** - 改善提案
4. **Session Analytics Agent** - セッション分析

## 開発

API仕様書: http://localhost:8000/docs
