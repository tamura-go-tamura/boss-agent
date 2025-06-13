import os
import asyncio
from typing import List, Dict, Any
from adk import Agent, LlmAgent
from models import (
    BossPersona,
    UserState,
    BossResponse,
    AnalysisResult,
    TrainingResponse,
    StressLevel,
)


class VirtualBossADKSystem:
    """Google ADK-Python powered virtual boss training system"""

    def __init__(self):
        self.project_id = os.getenv("GOOGLE_CLOUD_PROJECT")
        self.region = os.getenv("GEMINI_REGION", "us-central1")
        self.model_name = os.getenv("GEMINI_MODEL", "gemini-2.0-flash-exp")

        # Initialize ADK agents
        self._initialize_agents()

    def _initialize_agents(self):
        """Initialize Google ADK agents for different purposes"""

        # Boss Response Agent - Main conversation agent
        self.boss_agent = LlmAgent(
            agent_id="boss-response-agent",
            model_name=f"projects/{self.project_id}/locations/{self.region}/publishers/google/models/{self.model_name}",
            system_instruction="""
            あなたは日本の会社の上司役を演じるAIです。与えられたペルソナに基づいて、
            リアルな上司として部下と対話してください。
            
            重要な指針：
            1. ペルソナの性格特性を一貫して維持する
            2. 部下のストレス状態に応じて反応を調整する
            3. 日本のビジネス文化に適した言葉遣いを使用する
            4. 建設的な指導を心がける
            5. 感情的な状態を明確に表現する
            
            応答形式：
            - message: 上司としての返答
            - emotional_state: 現在の感情状態
            - stress_level: ストレスレベル
            """,
        )

        # Analysis Agent - Performance evaluation
        self.analysis_agent = LlmAgent(
            agent_id="analysis-agent",
            model_name=f"projects/{self.project_id}/locations/{self.region}/publishers/google/models/{self.model_name}",
            system_instruction="""
            あなたは上司との会話における部下のパフォーマンスを分析する専門家です。
            
            分析項目：
            1. コミュニケーション効果 (1-100)
            2. ストレス管理能力 (1-100) 
            3. 総合パフォーマンス (1-100)
            4. 改善提案
            5. 改善すべき領域
            
            客観的で建設的な評価を提供してください。
            """,
        )

        # Guidance Agent - Provides suggestions
        self.guidance_agent = LlmAgent(
            agent_id="guidance-agent",
            model_name=f"projects/{self.project_id}/locations/{self.region}/publishers/google/models/{self.model_name}",
            system_instruction="""
            あなたは上司とのコミュニケーション改善のアドバイザーです。
            部下が効果的に上司と対話できるよう、具体的で実用的な提案を提供してください。
            
            フォーカス領域：
            - 適切な敬語の使用
            - 感情的な自己制御
            - 建設的な対話技術
            - ストレス管理方法
            """,
        )

        # Session Analytics Agent - Session-level insights
        self.session_agent = LlmAgent(
            agent_id="session-analytics-agent",
            model_name=f"projects/{self.project_id}/locations/{self.region}/publishers/google/models/{self.model_name}",
            system_instruction="""
            トレーニングセッション全体を分析し、学習者の成長を追跡します。
            長期的な改善パターンと次のセッションへの推奨事項を提供してください。
            """,
        )

    async def process_training_interaction(
        self,
        boss_persona: BossPersona,
        user_state: UserState,
        user_message: str,
        context: str = None,
    ) -> TrainingResponse:
        """Process a training interaction using Google ADK agents"""

        try:
            # Prepare context for boss agent
            boss_context = self._build_boss_context(
                boss_persona, user_state, user_message, context
            )

            # Get boss response using ADK agent
            boss_response_data = await self._get_boss_response(boss_context)

            # Analyze user performance
            analysis_context = self._build_analysis_context(
                boss_persona,
                user_state,
                user_message,
                boss_response_data,
                context,
            )
            analysis_data = await self._analyze_performance(analysis_context)

            # Update user state based on interaction
            updated_user_state = self._update_user_state(
                user_state, analysis_data
            )

            return TrainingResponse(
                boss_response=boss_response_data,
                analysis=analysis_data,
                updated_user_state=updated_user_state,
            )

        except Exception as e:
            # Fallback response
            return self._create_fallback_response(
                boss_persona, user_state, str(e)
            )

    def _build_boss_context(
        self,
        persona: BossPersona,
        user_state: UserState,
        message: str,
        context: str,
    ) -> str:
        """Build context string for boss agent"""
        return f"""
        ペルソナ情報:
        - 名前: {persona.name}
        - 特徴: {persona.description}
        - 難易度レベル: {persona.difficulty}/10
        - ストレス要因: {', '.join(persona.stress_triggers)}
        - コミュニケーションスタイル: {persona.communication_style}
        
        部下の現在状態:
        - ストレスレベル: {user_state.stress_level}
        - 自信度: {user_state.confidence}/100
        - エンゲージメント: {user_state.engagement}/100
        
        会話の文脈: {context or '新しい会話の開始'}
        
        部下からのメッセージ: "{message}"
        
        この情報に基づいて、上司として適切に応答してください。
        レスポンスは以下のJSON形式で返してください：
        {{
            "message": "上司としての返答",
            "emotional_state": "感情状態",
            "stress_level": "低|中|高"
        }}
        """

    def _build_analysis_context(
        self,
        persona: BossPersona,
        user_state: UserState,
        user_message: str,
        boss_response: BossResponse,
        context: str,
    ) -> str:
        """Build context for performance analysis"""
        return f"""
        分析対象の会話:
        
        上司ペルソナ: {persona.name} (難易度: {persona.difficulty}/10)
        部下の状態: ストレス{user_state.stress_level}, 自信{user_state.confidence}/100
        
        部下の発言: "{user_message}"
        上司の応答: "{boss_response.message}"
        上司の感情状態: {boss_response.emotional_state}
        
        この会話における部下のパフォーマンスを分析してください。
        以下のJSON形式で評価を返してください：
        {{
            "user_performance_score": 数値(1-100),
            "communication_effectiveness": 数値(1-100),
            "stress_management": 数値(1-100),
            "suggestions": ["提案1", "提案2", "提案3"],
            "improvement_areas": ["改善領域1", "改善領域2"]
        }}
        """

    async def _get_boss_response(self, context: str) -> BossResponse:
        """Get boss response using ADK agent"""
        try:
            response = await self.boss_agent.agenerate(context)

            # Parse JSON response or create structured response
            if hasattr(response, "text"):
                response_text = response.text
            else:
                response_text = str(response)

            # Try to parse JSON, fallback to simple parsing
            try:
                import json

                parsed = json.loads(response_text)
                return BossResponse(
                    message=parsed.get("message", response_text),
                    emotional_state=parsed.get("emotional_state", "普通"),
                    stress_level=StressLevel(
                        parsed.get("stress_level", "中")
                    ),
                )
            except:
                # Fallback parsing
                return BossResponse(
                    message=response_text,
                    emotional_state="普通",
                    stress_level=StressLevel.MEDIUM,
                )

        except Exception as e:
            return BossResponse(
                message=f"すみません、システムに問題が発生しました。もう一度お試しください。",
                emotional_state="困惑",
                stress_level=StressLevel.LOW,
            )

    async def _analyze_performance(self, context: str) -> AnalysisResult:
        """Analyze user performance using ADK agent"""
        try:
            response = await self.analysis_agent.agenerate(context)

            if hasattr(response, "text"):
                response_text = response.text
            else:
                response_text = str(response)

            # Try to parse JSON response
            try:
                import json

                parsed = json.loads(response_text)
                return AnalysisResult(
                    user_performance_score=parsed.get(
                        "user_performance_score", 70
                    ),
                    communication_effectiveness=parsed.get(
                        "communication_effectiveness", 70
                    ),
                    stress_management=parsed.get("stress_management", 70),
                    suggestions=parsed.get(
                        "suggestions", ["継続的な練習を心がけてください"]
                    ),
                    improvement_areas=parsed.get(
                        "improvement_areas", ["コミュニケーション"]
                    ),
                )
            except:
                # Fallback analysis
                return AnalysisResult(
                    user_performance_score=70,
                    communication_effectiveness=70,
                    stress_management=70,
                    suggestions=["継続的な練習を心がけてください"],
                    improvement_areas=["コミュニケーション技術"],
                )

        except Exception as e:
            return AnalysisResult(
                user_performance_score=50,
                communication_effectiveness=50,
                stress_management=50,
                suggestions=[f"システムエラーが発生しました: {str(e)}"],
                improvement_areas=["技術的な問題の解決"],
            )

    def _update_user_state(
        self, current_state: UserState, analysis: AnalysisResult
    ) -> UserState:
        """Update user state based on performance analysis"""

        # Simple state update logic - can be made more sophisticated
        new_confidence = min(
            100,
            max(
                1,
                current_state.confidence
                + (analysis.user_performance_score - 70) // 10,
            ),
        )

        new_engagement = min(
            100,
            max(
                1,
                current_state.engagement
                + (analysis.communication_effectiveness - 70) // 15,
            ),
        )

        # Stress level adjustment based on performance
        current_stress = current_state.stress_level
        if analysis.stress_management > 80:
            if current_stress == StressLevel.HIGH:
                new_stress = StressLevel.MEDIUM
            elif current_stress == StressLevel.MEDIUM:
                new_stress = StressLevel.LOW
            else:
                new_stress = current_stress
        elif analysis.stress_management < 40:
            if current_stress == StressLevel.LOW:
                new_stress = StressLevel.MEDIUM
            elif current_stress == StressLevel.MEDIUM:
                new_stress = StressLevel.HIGH
            else:
                new_stress = current_stress
        else:
            new_stress = current_stress

        return UserState(
            stress_level=new_stress,
            confidence=new_confidence,
            engagement=new_engagement,
            last_response_quality=analysis.user_performance_score,
        )

    def _create_fallback_response(
        self, persona: BossPersona, user_state: UserState, error: str
    ) -> TrainingResponse:
        """Create fallback response when ADK agents fail"""

        boss_response = BossResponse(
            message="申し訳ございませんが、少し考える時間をください。もう一度お聞かせいただけますか？",
            emotional_state="困惑",
            stress_level=StressLevel.LOW,
            next_scenario_hint="システムの問題により、会話を続行してください",
        )

        analysis = AnalysisResult(
            user_performance_score=60,
            communication_effectiveness=60,
            stress_management=60,
            suggestions=[
                "システムの問題が発生しました。再試行してください。"
            ],
            improvement_areas=["技術的な問題"],
        )

        return TrainingResponse(
            boss_response=boss_response,
            analysis=analysis,
            updated_user_state=user_state,
        )

    async def get_session_analytics(
        self, session_data: List[Dict[str, Any]]
    ) -> Dict[str, Any]:
        """Get analytics for a complete training session"""
        try:
            context = f"""
            セッション全体のデータ分析:
            セッション詳細: {session_data}
            
            以下の分析を提供してください：
            1. 全体的なパフォーマンス傾向
            2. 改善が見られた領域
            3. 継続的な課題
            4. 次回セッションの推奨事項
            """

            response = await self.session_agent.agenerate(context)
            return {"analysis": str(response), "status": "success"}

        except Exception as e:
            return {
                "analysis": f"セッション分析でエラーが発生しました: {str(e)}",
                "status": "error",
            }

    async def test_connection(self) -> Dict[str, Any]:
        """Test ADK system connectivity"""
        try:
            test_response = await self.boss_agent.agenerate(
                "接続テストです。「OK」と応答してください。"
            )
            return {
                "status": "success",
                "message": "Google ADK connection successful",
                "adk_response": str(test_response),
            }
        except Exception as e:
            return {
                "status": "error",
                "message": f"ADK connection failed: {str(e)}",
                "adk_response": None,
            }
