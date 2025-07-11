import { chatController } from './src/controllers/api.controllers.js';

// Mock request and response objects for testing
const mockReq = {
  body: {
    message: "Hola, ¿cómo funciona SmarTrip?"
  }
};

const mockRes = {
  json: (data) => {
    console.log('Response:', data);
  },
  status: (code) => {
    console.log('Status:', code);
    return mockRes;
  }
};

// Test the chat controller
async function testChat() {
  console.log('Testing chat controller...');
  console.log('Request:', mockReq.body);
  
  try {
    await chatController(mockReq, mockRes);
  } catch (error) {
    console.error('Error in test:', error);
  }
}

testChat(); 