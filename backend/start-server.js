import { spawn } from 'child_process';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

console.log('🚀 Starting TRIPI Backend Server...');
console.log('📋 Checking requirements...');

// Check if Ollama is running
async function checkOllama() {
  try {
    const response = await fetch('https://8327ea41aae6.ngrok-free.app/api/tags');
    if (response.ok) {
      console.log('✅ Ollama is running');
      const data = await response.json();
      console.log('📦 Available models:', data.models?.map(m => m.name).join(', ') || 'None');
      return true;
    }
  } catch (error) {
    console.log('❌ Ollama is not running or not accessible');
    console.log('💡 To start Ollama:');
    console.log('   1. Download from https://ollama.ai');
    console.log('   2. Run: ollama serve');
    console.log('   3. Run: ollama pull llama3');
    console.log('   4. Make sure ngrok is running and pointing to localhost:11434');
    return false;
  }
}

// Start the server
async function startServer() {
  const ollamaRunning = await checkOllama();
  
  if (!ollamaRunning) {
    console.log('\n⚠️  Warning: Ollama is not running');
    console.log('   The server will still start but will use FAQ fallback only');
    console.log('   To enable AI responses, start Ollama first\n');
  }

  console.log('🌐 Starting Express server...');
  
  const server = spawn('node', ['src/app.js'], {
    cwd: __dirname,
    stdio: 'inherit',
    env: {
      ...process.env,
      DEBUG: 'true',
      PORT: process.env.PORT || '3000'
    }
  });

  server.on('error', (error) => {
    console.error('❌ Failed to start server:', error);
  });

  server.on('exit', (code) => {
    console.log(`\n🛑 Server exited with code ${code}`);
  });

  // Handle graceful shutdown
  process.on('SIGINT', () => {
    console.log('\n🛑 Shutting down server...');
    server.kill('SIGINT');
  });
}

startServer().catch(console.error); 