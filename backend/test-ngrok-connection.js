import { chatController } from './src/controllers/api.controllers.js';

// Mock request and response objects for testing
const mockReq = {
  body: {
    message: "Hola, ¿cómo funciona SmarTrip?"
  }
};

const mockRes = {
  json: (data) => {
    console.log('✅ Response received:');
    console.log('Response data:', data);
  },
  status: (code) => {
    console.log(`📊 Status code: ${code}`);
    return mockRes;
  }
};

// Test the chat controller with ngrok connection
async function testNgrokConnection() {
  const OLLAMA_BASE_URL = process.env.OLLAMA_BASE_URL ||  'https://8c26a2dde666.ngrok-free.app/';
  console.log('🧪 Testing ngrok connection to Ollama...');
  console.log('📡 Using URL:', `${OLLAMA_BASE_URL}/api/generate`);
  console.log('📝 Request:', mockReq.body);
  
  try {
    await chatController(mockReq, mockRes);
    console.log('✅ Test completed successfully!');
  } catch (error) {
    console.error('❌ Error in test:', error);
    console.log('💡 Make sure:');
    console.log('   1. Ollama is running locally on port 11434');
    console.log('   2. ngrok is running and pointing to localhost:11434');
    console.log('   3. The ngrok URL is correct and accessible');
  }
}

testNgrokConnection(); 