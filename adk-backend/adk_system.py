import os
import asyncio
import json
import random
from typing import List, Dict, Any
from models import (
    BossPersona, UserState, BossResponse, AnalysisResult, 
    TrainingResponse, StressLevel
)

class MockLlmAgent:
    """Mock implementation of LlmAgent for testing without Google ADK"""
    
    def __init__(self, agent_id: str, model_name: str, system_instruction: str):
        self.agent_id = agent_id
        self.model_name = model_name
        self.system_instruction = system_instruction
    
    async def agenerate(self, prompt: str) -> str:
        """Mock response generation"""
        # シンプルなルールベースの応答
        if "boss-response" in self.agent_id:
            return self._generate_boss_response(prompt)
        elif "analysis" in self.agent_id:
            return self._generate_analysis_response(prompt)
        else:
            return "モックシステムからの応答です。"
    
    def _generate_boss_response(self, prompt: str) -> str:
        """Generate mock boss response"""
        # プロンプトから難易度やペルソナ情報を抽出
        if "難易度レベル: 7" in prompt or "難易度レベル: 8" in prompt:
            responses = [
                "その程度の対応では不十分ですね。もっと具体的な改善策を考えてください。",
                "なぜそのような判断に至ったのか、論理的に説明してもらえますか？",
                "期待していたレベルに達していません。再検討が必要です。",
                "詳細な分析が不足しています。データに基づいた提案をしてください。"
            ]
        elif "難易度レベル: 1" in prompt or "難易度レベル: 2" in prompt or "難易度レベル: 3" in prompt:
            responses = [
                "なるほど、いい視点ですね。その方向で進めてみましょう。",
                "理解しました。何かサポートが必要でしたらお声がけください。",
                "良い提案ですね。実行に向けて計画を立ててみてください。",
                "順調に進んでいますね。この調子で頑張ってください。"
            ]
        else:
            responses = [
                "なるほど、その件についてもう少し詳しく説明してもらえますか？",
                "わかりました。では、具体的にどのような対策を考えていますか？",
                "そうですね。今後はより注意深く進めてください。",
                "理解しました。次回はもう少し早めに相談してくださいね。"
            ]
        
        return random.choice(responses)
    
    def _generate_analysis_response(self, prompt: str) -> str:
        """Generate mock analysis response"""
        # ユーザーメッセージの長さや内容に基づいてスコアを調整
        user_message = ""
        if "部下の発言:" in prompt:
            start = prompt.find("部下の発言:") + len("部下の発言:")
            end = prompt.find("上司の応答:")
            if end != -1:
                user_message = prompt[start:end].strip().strip('"')
        
        # メッセージの特徴に基づいてスコア調整
        base_score = random.randint(60, 85)
        
        # 敬語の使用をチェック
        if any(word in user_message for word in ["ます", "です", "ございます", "いたします"]):
            politeness_bonus = 10
        else:
            politeness_bonus = -5
            
        # 具体性をチェック
        if len(user_message) > 30 and any(word in user_message for word in ["具体的", "詳細", "計画", "対策"]):
            detail_bonus = 8
        else:
            detail_bonus = -3
            
        # 自信の表現をチェック
        if any(word in user_message for word in ["と思います", "かもしれません", "たぶん"]):
            confidence_penalty = -5
        else:
            confidence_penalty = 2
        
        final_score = max(30, min(95, base_score + politeness_bonus + detail_bonus + confidence_penalty))
        
        analysis = {
            "user_performance_score": final_score,
            "communication_effectiveness": max(40, min(90, final_score + random.randint(-10, 10))),
            "stress_management": max(35, min(85, final_score + random.randint(-15, 15))),
            "suggestions": [
                "より具体的な説明を心がけてください",
                "自信を持って発言しましょう",
                "適切な敬語の使用を意識してください"
            ],
            "improvement_areas": ["コミュニケーション技術", "自信の向上"]
        }
        
        # スコアに基づいて提案を調整
        if final_score > 80:
            analysis["suggestions"] = [
                "素晴らしいコミュニケーションです",
                "この調子で継続してください",
                "リーダーシップの発揮も検討してみてください"
            ]
            analysis["improvement_areas"] = ["更なる向上", "リーダーシップ"]
        elif final_score < 50:
            analysis["suggestions"] = [
                "もう少し詳しく説明してみてください",
                "相手の立場を考慮した表現を心がけてください",
                "事前準備をより丁寧に行ってください"
            ]
            analysis["improvement_areas"] = ["基本的なコミュニケーション", "準備力"]
        
        return json.dumps(analysis, ensure_ascii=False)

class VirtualBossADKSystem:
    """Virtual Boss Training System (Mock Version)"""
    
    def __init__(self):
        self.project_id = os.getenv('GOOGLE_CLOUD_PROJECT', 'mock-project')
        self.region = os.getenv('GEMINI_REGION', 'us-central1')
        self.model_name = os.getenv('GEMINI_MODEL', 'gemini-2.0-flash-exp')
        self.use_mock = os.getenv('USE_MOCK_ADK', 'true').lower() == 'true'
        
        # Initialize agents
        self._initialize_agents()
    
    def _initialize_agents(self):
        """Initialize agents for different purposes"""
        
        # Boss Response Agent - Main conversation agent
        self.boss_agent = MockLlmAgent(
            agent_id="boss-response-agent",
            model_name=f"projects/{self.project_id}/locations/{self.region}/publishers/google/models/{self.model_name}",
            system_instruction="""
            あなたは日本の会社の上司役を演じるAIです。与えられたペルソナに基づいて、
            リアルな上司として部下と対話してください。
            """
        )
        
        # Analysis Agent - Performance evaluation
        self.analysis_agent = MockLlmAgent(
            agent_id="analysis-agent", 
            model_name=f"projects/{self.project_id}/locations/{self.region}/publishers/google/models/{self.model_name}",
            system_instruction="""
            あなたは上司との会話における部下のパフォーマンスを分析する専門家です。
            """
        )
        
        # Guidance Agent - Provides suggestions
        self.guidance_agent = MockLlmAgent(
            agent_id="guidance-agent",
            model_name=f"projects/{self.project_id}/locations/{self.region}/publishers/google/models/{self.model_name}",
            system_instruction="""
            あなたは上司とのコミュニケーション改善のアドバイザーです。
            """
        )
        
        # Session Analytics Agent - Session-level insights
        self.session_agent = MockLlmAgent(
            agent_id="session-analytics-agent",
            model_name=f"projects/{self.project_id}/locations/{self.region}/publishers/google/models/{self.model_name}",
            system_instruction="""
            トレーニングセッション全体を分析し、学習者の成長を追跡します。
            """
        )

    def _normalize_user_state(self, user_state: UserState) -> UserState:
        """Normalize user state to handle both frontend and backend formats"""
        normalized = UserState()
        
        # Handle stress level
        if user_state.stressLevel is not None:
            # Convert frontend numeric (0-100) to backend format
            if user_state.stressLevel <= 30:
                normalized.stress_level = StressLevel.LOW
            elif user_state.stressLevel <= 70:
                normalized.stress_level = StressLevel.MEDIUM
            else:
                normalized.stress_level = StressLevel.HIGH
        elif user_state.stress_level is not None:
            normalized.stress_level = user_state.stress_level
        else:
            normalized.stress_level = StressLevel.MEDIUM
            
        # Handle confidence
        normalized.confidence = (user_state.confidenceLevel or 
                               user_state.confidence or 50)
        
        # Handle engagement  
        normalized.engagement = (user_state.engagementLevel or
                               user_state.engagement or 50)
                               
        # Handle response quality
        normalized.last_response_quality = user_state.last_response_quality
        
        return normalized

    async def process_training_interaction(
        self, 
        boss_persona: BossPersona,
        user_state: UserState, 
        user_message: str,
        context: str = None
    ) -> TrainingResponse:
        """Process a training interaction using agents"""
        
        try:
            # Normalize user state to handle frontend/backend format differences
            normalized_user_state = self._normalize_user_state(user_state)
            # Prepare context for boss agent
            boss_context = self._build_boss_context(boss_persona, normalized_user_state, user_message, context)
            
            # Get boss response using agent
            boss_response_data = await self._get_boss_response(boss_context)
            
            # Analyze user performance
            analysis_context = self._build_analysis_context(
                boss_persona, normalized_user_state, user_message, boss_response_data, context
            )
            analysis_data = await self._analyze_performance(analysis_context)
            
            # Update user state based on interaction - return in frontend format
            updated_user_state = self._update_user_state_frontend_format(user_state, analysis_data)
            
            return TrainingResponse(
                boss_response=boss_response_data,
                analysis=analysis_data,
                updated_user_state=updated_user_state
            )
            
        except Exception as e:
            # Fallback response
            return self._create_fallback_response(boss_persona, user_state, str(e))

    def _build_boss_context(self, persona: BossPersona, user_state: UserState, message: str, context: str) -> str:
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
        """

    def _build_analysis_context(self, persona: BossPersona, user_state: UserState, 
                               user_message: str, boss_response: BossResponse, context: str) -> str:
        """Build context for performance analysis"""
        return f"""
        分析対象の会話:
        
        上司ペルソナ: {persona.name} (難易度: {persona.difficulty}/10)
        部下の状態: ストレス{user_state.stress_level}, 自信{user_state.confidence}/100
        
        部下の発言: "{user_message}"
        上司の応答: "{boss_response.message}"
        上司の感情状態: {boss_response.emotional_state}
        
        この会話における部下のパフォーマンスを分析してください。
        """

    async def _get_boss_response(self, context: str) -> BossResponse:
        """Get boss response using agent"""
        try:
            response = await self.boss_agent.agenerate(context)
            response_text = str(response)
            
            # 感情状態を文脈から推測
            emotional_state = "普通"
            if any(word in response_text for word in ["不十分", "期待していた", "再検討"]):
                emotional_state = "厳格"
            elif any(word in response_text for word in ["いいですね", "順調", "良い"]):
                emotional_state = "満足"
            elif any(word in response_text for word in ["理解しました", "なるほど"]):
                emotional_state = "理解"
            
            # ストレスレベルを応答の厳しさから推測
            stress_level = StressLevel.MEDIUM
            if any(word in response_text for word in ["不十分", "期待していた", "論理的に説明"]):
                stress_level = StressLevel.HIGH
            elif any(word in response_text for word in ["いいですね", "順調", "この調子"]):
                stress_level = StressLevel.LOW
            
            return BossResponse(
                message=response_text,
                emotional_state=emotional_state,
                stress_level=stress_level
            )
                
        except Exception as e:
            return BossResponse(
                message=f"すみません、システムに問題が発生しました。もう一度お試しください。",
                emotional_state="困惑",
                stress_level=StressLevel.LOW
            )

    async def _analyze_performance(self, context: str) -> AnalysisResult:
        """Analyze user performance using agent"""
        try:
            response = await self.analysis_agent.agenerate(context)
            response_text = str(response)
            
            # Try to parse JSON response
            try:
                parsed = json.loads(response_text)
                return AnalysisResult(
                    user_performance_score=parsed.get('user_performance_score', 70),
                    communication_effectiveness=parsed.get('communication_effectiveness', 70),
                    stress_management=parsed.get('stress_management', 70),
                    suggestions=parsed.get('suggestions', ['継続的な練習を心がけてください']),
                    improvement_areas=parsed.get('improvement_areas', ['コミュニケーション'])
                )
            except:
                # Fallback analysis
                return AnalysisResult(
                    user_performance_score=70,
                    communication_effectiveness=70,
                    stress_management=70,
                    suggestions=['継続的な練習を心がけてください'],
                    improvement_areas=['コミュニケーション技術']
                )
                
        except Exception as e:
            return AnalysisResult(
                user_performance_score=50,
                communication_effectiveness=50,
                stress_management=50,
                suggestions=[f'システムエラーが発生しました: {str(e)}'],
                improvement_areas=['技術的な問題の解決']
            )

    def _update_user_state(self, current_state: UserState, analysis: AnalysisResult) -> UserState:
        """Update user state based on performance analysis"""
        
        # Simple state update logic
        new_confidence = min(100, max(1, 
            current_state.confidence + (analysis.user_performance_score - 70) // 10
        ))
        
        new_engagement = min(100, max(1,
            current_state.engagement + (analysis.communication_effectiveness - 70) // 15
        ))
        
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
            last_response_quality=analysis.user_performance_score
        )

    def _update_user_state_frontend_format(self, original_state: UserState, analysis: AnalysisResult) -> UserState:
        """Update user state and return in frontend format (camelCase)"""
        # Use the existing backend update logic
        updated_backend = self._update_user_state(self._normalize_user_state(original_state), analysis)
        
        # Convert stress level back to numeric for frontend
        stress_numeric = 50  # default
        if updated_backend.stress_level == StressLevel.LOW:
            stress_numeric = 20
        elif updated_backend.stress_level == StressLevel.MEDIUM:
            stress_numeric = 50
        elif updated_backend.stress_level == StressLevel.HIGH:
            stress_numeric = 80
            
        # Return in frontend format
        return UserState(
            stressLevel=stress_numeric,
            confidenceLevel=updated_backend.confidence,
            engagementLevel=updated_backend.engagement
        )

    def _create_fallback_response(self, persona: BossPersona, user_state: UserState, error: str) -> TrainingResponse:
        """Create fallback response when agents fail"""
        
        boss_response = BossResponse(
            message="申し訳ございませんが、少し考える時間をください。もう一度お聞かせいただけますか？",
            emotional_state="困惑",
            stress_level=StressLevel.LOW,
            next_scenario_hint="システムの問題により、会話を続行してください"
        )
        
        analysis = AnalysisResult(
            user_performance_score=60,
            communication_effectiveness=60,
            stress_management=60,
            suggestions=["システムの問題が発生しました。再試行してください。"],
            improvement_areas=["技術的な問題"]
        )
        
        return TrainingResponse(
            boss_response=boss_response,
            analysis=analysis,
            updated_user_state=user_state
        )

    async def get_session_analytics(self, session_data: List[Dict[str, Any]]) -> Dict[str, Any]:
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
            return {"analysis": f"セッション分析でエラーが発生しました: {str(e)}", "status": "error"}

    async def test_connection(self) -> Dict[str, Any]:
        """Test system connectivity"""
        try:
            test_response = await self.boss_agent.agenerate("接続テストです。「OK」と応答してください。")
            return {
                "status": "success",
                "message": "Mock ADK system connection successful",
                "adk_response": str(test_response)
            }
        except Exception as e:
            return {
                "status": "error", 
                "message": f"System connection failed: {str(e)}",
                "adk_response": None
            }