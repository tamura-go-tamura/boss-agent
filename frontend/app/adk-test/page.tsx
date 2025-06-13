'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { adkClient } from '@/services/adk/client';
import { AlertTriangle, CheckCircle, Wifi, WifiOff } from 'lucide-react';

interface ConnectionStatus {
  isConnected: boolean;
  adkVersion: string | null;
  lastChecked: Date | null;
  error: string | null;
}

export default function ADKTestPage() {
  const [status, setStatus] = useState<ConnectionStatus>({
    isConnected: false,
    adkVersion: null,
    lastChecked: null,
    error: null
  });
  const [isLoading, setIsLoading] = useState(false);
  const [testMessage, setTestMessage] = useState('Hello from frontend test!');

  const checkConnection = async () => {
    setIsLoading(true);
    try {
      const health = await adkClient.healthCheck();
      const testResult = await adkClient.testConnection(testMessage);
      
      setStatus({
        isConnected: health.status === 'healthy' && health.adk_status !== 'not_initialized',
        adkVersion: testResult.adk_version,
        lastChecked: new Date(),
        error: null
      });
    } catch (error) {
      setStatus({
        isConnected: false,
        adkVersion: null,
        lastChecked: new Date(),
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    } finally {
      setIsLoading(false);
    }
  };

  const testTrainingInteraction = async () => {
    setIsLoading(true);
    try {
      const testRequest = {
        boss_persona: {
          id: 'test_boss',
          name: 'テスト上司',
          description: 'テスト用の上司ペルソナ',
          difficulty: 5,
          stress_triggers: ['遅刻', 'ミス'],
          communication_style: 'Direct but supportive',
          avatar_url: undefined
        },
        user_state: {
          stress_level: 'MEDIUM' as const,
          confidence: 70,
          engagement: 80
        },
        user_message: 'すみません、プロジェクトの進捗が少し遅れています。',
        context: 'Testing Google ADK integration'
      };

      const response = await adkClient.processTrainingInteraction(testRequest);
      console.log('ADK Training Response:', response);
      
      alert(`ADK Response received!\nBoss: ${response.boss_response.message}\nScore: ${response.analysis.user_performance_score}/100`);
    } catch (error) {
      console.error('Training test failed:', error);
      alert(`Training test failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    checkConnection();
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="text-center space-y-2">
          <h1 className="text-3xl font-bold text-gray-900">
            Google ADK Backend Test
          </h1>
          <p className="text-gray-600">
            Test connection and functionality with Google Agent Development Kit backend
          </p>
        </div>

        {/* Connection Status */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              {status.isConnected ? (
                <>
                  <CheckCircle className="h-5 w-5 text-green-600" />
                  <span>ADK Backend Connected</span>
                </>
              ) : (
                <>
                  <AlertTriangle className="h-5 w-5 text-red-600" />
                  <span>ADK Backend Not Available</span>
                </>
              )}
            </CardTitle>
            <CardDescription>
              Current status of Google ADK-Python backend connection
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <div className="text-sm font-medium text-gray-600">Status</div>
                <Badge variant={status.isConnected ? 'default' : 'destructive'}>
                  {status.isConnected ? 'Connected' : 'Disconnected'}
                </Badge>
              </div>
              
              <div>
                <div className="text-sm font-medium text-gray-600">ADK Version</div>
                <div className="text-sm">
                  {status.adkVersion || 'Unknown'}
                </div>
              </div>
              
              <div>
                <div className="text-sm font-medium text-gray-600">Last Checked</div>
                <div className="text-sm">
                  {status.lastChecked?.toLocaleTimeString() || 'Never'}
                </div>
              </div>
            </div>

            {status.error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                <div className="text-sm font-medium text-red-800">Error:</div>
                <div className="text-sm text-red-700">{status.error}</div>
              </div>
            )}

            <div className="flex space-x-3">
              <Button 
                onClick={checkConnection} 
                disabled={isLoading}
                variant="outline"
              >
                <Wifi className="mr-2 h-4 w-4" />
                {isLoading ? 'Checking...' : 'Check Connection'}
              </Button>
              
              {status.isConnected && (
                <Button 
                  onClick={testTrainingInteraction} 
                  disabled={isLoading}
                >
                  Test Training Interaction
                </Button>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Test Parameters */}
        <Card>
          <CardHeader>
            <CardTitle>Test Parameters</CardTitle>
            <CardDescription>
              Configure test message for connection testing
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Test Message
                </label>
                <input
                  type="text"
                  value={testMessage}
                  onChange={(e) => setTestMessage(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter test message..."
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Setup Instructions */}
        <Card>
          <CardHeader>
            <CardTitle>Setup Instructions</CardTitle>
            <CardDescription>
              How to start the Google ADK backend
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="bg-gray-50 rounded-lg p-4">
              <h4 className="font-medium text-gray-900 mb-2">1. Start ADK Backend</h4>
              <code className="block bg-gray-100 p-2 rounded text-sm">
                cd adk-backend && python main.py
              </code>
            </div>
            
            <div className="bg-gray-50 rounded-lg p-4">
              <h4 className="font-medium text-gray-900 mb-2">2. Configure Environment</h4>
              <div className="text-sm text-gray-700 space-y-1">
                <div>• Set GOOGLE_CLOUD_PROJECT in .env</div>
                <div>• Set GOOGLE_APPLICATION_CREDENTIALS path</div>
                <div>• Enable Vertex AI API in Google Cloud</div>
              </div>
            </div>

            <div className="bg-gray-50 rounded-lg p-4">
              <h4 className="font-medium text-gray-900 mb-2">3. Verify Connection</h4>
              <div className="text-sm text-gray-700">
                Backend should be available at: <code>http://localhost:8000</code>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* API Endpoints */}
        <Card>
          <CardHeader>
            <CardTitle>Available API Endpoints</CardTitle>
            <CardDescription>
              Google ADK backend API reference
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex justify-between items-center py-2 border-b">
                <code className="text-sm">GET /health</code>
                <Badge variant="outline">Health Check</Badge>
              </div>
              <div className="flex justify-between items-center py-2 border-b">
                <code className="text-sm">POST /api/training/process</code>
                <Badge variant="outline">Training Interaction</Badge>
              </div>
              <div className="flex justify-between items-center py-2 border-b">
                <code className="text-sm">POST /api/training/test</code>
                <Badge variant="outline">Connection Test</Badge>
              </div>
              <div className="flex justify-between items-center py-2 border-b">
                <code className="text-sm">GET /api/boss-personas</code>
                <Badge variant="outline">Available Personas</Badge>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
