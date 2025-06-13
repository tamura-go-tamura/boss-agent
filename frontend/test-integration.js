// Simple test script to verify ADK integration
const { spawn } = require('child_process');

async function testIntegration() {
  console.log('🧪 Testing ADK Integration...');
  
  // Test backend health
  console.log('\n1. Testing backend health...');
  const healthTest = spawn('curl', ['-s', 'http://localhost:8000/health']);
  
  healthTest.stdout.on('data', (data) => {
    try {
      const health = JSON.parse(data.toString());
      console.log('✅ Backend health:', health.status);
      console.log('✅ Google ADK status:', health.google_adk);
    } catch (e) {
      console.log('❌ Backend health check failed');
    }
  });
  
  healthTest.stderr.on('data', (data) => {
    console.log('❌ Backend error:', data.toString());
  });

  // Test training interaction
  setTimeout(() => {
    console.log('\n2. Testing training interaction...');
    const testData = JSON.stringify({
      boss_persona: {
        id: "tough-manager",
        name: "Test Boss",
        description: "A demanding manager",
        difficulty: "中級",
        stressTriggers: ["late deliveries"],
        communicationStyle: "Direct"
      },
      user_state: {
        stressLevel: 30,
        confidenceLevel: 60
      },
      user_message: "こんにちは、プロジェクトの進捗についてご報告があります。"
    });

    const trainingTest = spawn('curl', [
      '-s',
      '-X', 'POST',
      'http://localhost:8000/api/training/process',
      '-H', 'Content-Type: application/json',
      '-d', testData
    ]);

    trainingTest.stdout.on('data', (data) => {
      try {
        const response = JSON.parse(data.toString());
        console.log('✅ Training interaction successful!');
        console.log('   Boss response:', response.boss_response.message);
        console.log('   User stress level updated:', response.updated_user_state.stressLevel);
        console.log('   Suggestions:', response.analysis.suggestions.length, 'provided');
      } catch (e) {
        console.log('❌ Training interaction failed:', data.toString());
      }
    });

    trainingTest.stderr.on('data', (data) => {
      console.log('❌ Training error:', data.toString());
    });
  }, 1000);

  setTimeout(() => {
    console.log('\n✨ Integration test completed!');
    console.log('🌐 Frontend: http://localhost:3000/training');
    console.log('🧪 ADK Test: http://localhost:3000/adk-test'); 
    console.log('🔧 Backend: http://localhost:8000/health');
  }, 3000);
}

testIntegration().catch(console.error);
