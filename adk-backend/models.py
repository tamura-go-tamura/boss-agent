from pydantic import BaseModel
from typing import List, Optional, Union
from enum import Enum


class StressLevel(str, Enum):
    LOW = "低"
    MEDIUM = "中"
    HIGH = "高"


class Difficulty(str, Enum):
    BEGINNER = "初級"
    INTERMEDIATE = "中級"
    ADVANCED = "上級"


class BossPersona(BaseModel):
    id: str
    name: str
    description: str
    difficulty: Union[str, int]  # Accept both "中級" and numeric
    stressTriggers: Optional[List[str]] = []  # Frontend uses camelCase
    stress_triggers: Optional[List[str]] = []  # Keep backend snake_case for compatibility
    communicationStyle: Optional[str] = "Professional"  # Frontend uses camelCase
    communication_style: Optional[str] = "Professional"  # Keep backend snake_case
    avatar_url: Optional[str] = None

    class Config:
        # Allow both camelCase and snake_case
        populate_by_name = True


class UserState(BaseModel):
    # Frontend format (camelCase)
    stressLevel: Optional[int] = None  # 0-100
    confidenceLevel: Optional[int] = None  # 0-100
    engagementLevel: Optional[int] = None  # 0-100
    
    # Backend format (snake_case) 
    stress_level: Optional[Union[StressLevel, int]] = None
    confidence: Optional[int] = None  # 1-100
    engagement: Optional[int] = None  # 1-100
    last_response_quality: Optional[int] = None  # 1-100

    class Config:
        populate_by_name = True


class TrainingRequest(BaseModel):
    boss_persona: BossPersona
    user_state: UserState
    user_message: str
    context: Optional[str] = None


class BossResponse(BaseModel):
    message: str
    emotional_state: str
    stress_level: StressLevel
    next_scenario_hint: Optional[str] = None


class AnalysisResult(BaseModel):
    user_performance_score: int  # 1-100
    communication_effectiveness: int  # 1-100
    stress_management: int  # 1-100
    suggestions: List[str]
    improvement_areas: List[str]


class TrainingResponse(BaseModel):
    boss_response: BossResponse
    analysis: AnalysisResult
    updated_user_state: UserState


class TestRequest(BaseModel):
    message: str


class TestResponse(BaseModel):
    status: str
    message: str
    adk_version: str
