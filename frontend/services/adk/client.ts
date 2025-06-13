import { BossPersona, UserState } from '@/types/ai.types';

// ADK Backend API Client

export interface ADKTrainingRequest {
  boss_persona: BossPersona;
  user_state: UserState;
  user_message: string;
  context?: string;
}

export interface ADKBossResponse {
  message: string;
  emotional_state: string;
  stress_level: '低' | '中' | '高';
  next_scenario_hint?: string;
}

export interface ADKAnalysisResult {
  user_performance_score: number;
  communication_effectiveness: number;
  stress_management: number;
  suggestions: string[];
  improvement_areas: string[];
}

export interface ADKTrainingResponse {
  boss_response: ADKBossResponse;
  analysis: ADKAnalysisResult;
  updated_user_state: UserState;
}

export interface ADKTestResponse {
  status: string;
  message: string;
  adk_version: string;
}

export class ADKClient {
  private baseUrl: string;

  constructor() {
    this.baseUrl = process.env.NEXT_PUBLIC_ADK_API_URL || 'http://localhost:8000';
  }

  private async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const url = `${this.baseUrl}${endpoint}`;
    
    const config: RequestInit = {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    };

    try {
      const response = await fetch(url, config);
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ detail: 'Unknown error' }));
        throw new Error(`ADK API Error (${response.status}): ${errorData.detail || response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      if (error instanceof Error) {
        throw error;
      }
      throw new Error(`Network error: ${String(error)}`);
    }
  }

  async healthCheck(): Promise<{ status: string; adk_status: string }> {
    return this.request('/health');
  }

  async processTrainingInteraction(request: ADKTrainingRequest): Promise<ADKTrainingResponse> {
    return this.request('/api/training/process', {
      method: 'POST',
      body: JSON.stringify(request),
    });
  }

  async analyzeSession(sessionData: any): Promise<any> {
    return this.request('/api/training/analyze', {
      method: 'POST',
      body: JSON.stringify({ interactions: sessionData }),
    });
  }

  async testConnection(message: string = 'Test connection'): Promise<ADKTestResponse> {
    return this.request('/api/training/test', {
      method: 'POST',
      body: JSON.stringify({ message }),
    });
  }

  async getBossPersonas(): Promise<{ personas: BossPersona[] }> {
    return this.request('/api/boss-personas');
  }

  async isAvailable(): Promise<boolean> {
    try {
      const health = await this.healthCheck();
      return health.status === 'healthy' && health.adk_status !== 'not_initialized';
    } catch {
      return false;
    }
  }
}

// Singleton instance
export const adkClient = new ADKClient();
