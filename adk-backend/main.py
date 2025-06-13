import os
import asyncio
from typing import Dict, Any
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv

from models import (
    TrainingRequest,
    TrainingResponse,
    TestRequest,
    TestResponse,
    BossPersona,
    UserState,
)
from adk_system import VirtualBossADKSystem

# Load environment variables
load_dotenv()

# Initialize FastAPI app
app = FastAPI(
    title="Virtual Boss Training - Google ADK Backend",
    description="Google Agent Development Kit powered virtual boss training system",
    version="1.0.0",
)

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",  # Next.js frontend
        os.getenv("FRONTEND_URL", "http://localhost:3000"),
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize ADK system
adk_system = None


@app.on_event("startup")
async def startup_event():
    """Initialize the ADK system on startup"""
    global adk_system
    try:
        adk_system = VirtualBossADKSystem()
        print("✅ Google ADK system initialized successfully")
    except Exception as e:
        print(f"❌ Failed to initialize ADK system: {e}")
        # Continue without ADK for graceful degradation


@app.get("/")
async def root():
    """Health check endpoint"""
    return {
        "status": "healthy",
        "service": "Virtual Boss Training - Google ADK Backend",
        "version": "1.0.0",
        "adk_status": "initialized" if adk_system else "not_initialized",
    }


@app.get("/health")
async def health_check():
    """Detailed health check"""
    return {
        "status": "healthy",
        "google_adk": "available" if adk_system else "unavailable",
        "timestamp": asyncio.get_event_loop().time(),
        "environment": {
            "project_id": os.getenv("GOOGLE_CLOUD_PROJECT", "not_set"),
            "region": os.getenv("GEMINI_REGION", "us-central1"),
            "model": os.getenv("GEMINI_MODEL", "gemini-2.0-flash-exp"),
        },
    }


@app.post("/api/training/process", response_model=TrainingResponse)
async def process_training_interaction(request: TrainingRequest):
    """Process a training interaction using Google ADK"""

    if not adk_system:
        raise HTTPException(
            status_code=503,
            detail="Google ADK system not available. Please check configuration.",
        )

    try:
        response = await adk_system.process_training_interaction(
            boss_persona=request.boss_persona,
            user_state=request.user_state,
            user_message=request.user_message,
            context=request.context,
        )
        return response

    except Exception as e:
        raise HTTPException(
            status_code=500, detail=f"Training processing failed: {str(e)}"
        )


@app.post("/api/training/analyze")
async def analyze_session(session_data: Dict[str, Any]):
    """Analyze a complete training session"""

    if not adk_system:
        raise HTTPException(
            status_code=503, detail="Google ADK system not available"
        )

    try:
        analysis = await adk_system.get_session_analytics(
            session_data.get("interactions", [])
        )
        return analysis

    except Exception as e:
        raise HTTPException(
            status_code=500, detail=f"Session analysis failed: {str(e)}"
        )


@app.post("/api/training/test", response_model=TestResponse)
async def test_adk_connection(request: TestRequest):
    """Test Google ADK connection"""

    if not adk_system:
        return TestResponse(
            status="error",
            message="ADK system not initialized",
            adk_version="unavailable",
        )

    try:
        test_result = await adk_system.test_connection()

        return TestResponse(
            status=test_result["status"],
            message=test_result["message"],
            adk_version="1.3.0",
        )

    except Exception as e:
        return TestResponse(
            status="error",
            message=f"Connection test failed: {str(e)}",
            adk_version="1.3.0",
        )


@app.get("/api/boss-personas")
async def get_available_boss_personas():
    """Get available boss personas for training"""

    # Sample personas - in production, these might come from a database
    personas = [
        {
            "id": "supportive_mentor",
            "name": "佐藤部長",
            "description": "サポート的で理解のある上司。新人の成長を重視する。",
            "difficulty": 3,
            "stress_triggers": ["遅刻", "準備不足"],
            "communication_style": "優しく指導的",
            "avatar_url": None,
        },
        {
            "id": "demanding_perfectionist",
            "name": "田中課長",
            "description": "完璧主義で要求が厳しい上司。高い成果を期待する。",
            "difficulty": 7,
            "stress_triggers": ["ミス", "効率の悪さ", "言い訳"],
            "communication_style": "直接的で厳格",
            "avatar_url": None,
        },
        {
            "id": "micromanager",
            "name": "山田マネージャー",
            "description": "細かいことまで管理したがるマイクロマネージャー。",
            "difficulty": 8,
            "stress_triggers": ["自主性", "報告の遅れ", "独断行動"],
            "communication_style": "詳細指向で管理的",
            "avatar_url": None,
        },
        {
            "id": "visionary_leader",
            "name": "鈴木役員",
            "description": "ビジョナリーなリーダー。大局的な視点を重視する。",
            "difficulty": 5,
            "stress_triggers": ["短期思考", "創造性の欠如"],
            "communication_style": "戦略的で鼓舞的",
            "avatar_url": None,
        },
    ]

    return {"personas": personas}


if __name__ == "__main__":
    import uvicorn

    port = int(os.getenv("PORT", 8000))
    host = os.getenv("HOST", "0.0.0.0")
    debug = os.getenv("DEBUG", "true").lower() == "true"

    print(f"🚀 Starting Google ADK Backend Server on {host}:{port}")
    print(f"📖 API Documentation: http://{host}:{port}/docs")

    uvicorn.run(
        "main:app",
        host=host,
        port=port,
        reload=debug,
        log_level="info" if debug else "warning",
    )
