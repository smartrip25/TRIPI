# TRIPI Troubleshooting Guide

## Common Issues and Solutions

### 1. "Server connection test failed" Error

**Problem**: Frontend can't connect to backend server.

**Solutions**:
1. Make sure the backend is running:
   ```bash
   cd backend
   npm start
   ```

2. Check if the server is running on the correct port (default: 3000)

3. If using Expo, make sure you're using the correct IP address for your device/emulator

### 2. "Network request failed" Error

**Problem**: Backend can't connect to Ollama.

**Solutions**:
1. Install Ollama from https://ollama.ai
2. Start Ollama:
   ```bash
   ollama serve
   ```
3. Download the required model:
   ```bash
   ollama pull llama3
   ```
4. Verify Ollama is running:
   ```bash
   curl http://localhost:11434/api/tags
   ```

### 3. "Text strings must be rendered within a <Text> component" Error

**Problem**: React Native text rendering issue.

**Solution**: This has been fixed in the code. Make sure you're using the latest version of the components.

### 4. Frontend Connection Issues

**Problem**: Frontend can't reach the backend.

**Solutions**:
1. Check if backend is running on port 3000
2. For physical devices, use your computer's IP address instead of localhost
3. For Expo, try using `10.0.2.2:3000` (Android emulator) or `localhost:3000` (iOS simulator)

### 5. Ollama Model Issues

**Problem**: Backend can't find the llama3 model.

**Solutions**:
1. Check available models:
   ```bash
   ollama list
   ```
2. If llama3 is not available, pull it:
   ```bash
   ollama pull llama3
   ```
3. You can also use other models by setting the `OLLAMA_MODEL` environment variable

## Environment Variables

You can configure the backend using these environment variables:

- `OLLAMA_BASE_URL`: URL of Ollama server (default: `http://localhost:11434`)
- `OLLAMA_MODEL`: Model to use (default: `llama3`)
- `DEBUG`: Enable detailed logs (default: `false`)
- `PORT`: Server port (default: `3000`)

## Quick Start

1. **Start Ollama** (optional, for AI responses):
   ```bash
   ollama serve
   ollama pull llama3
   ```

2. **Start Backend**:
   ```bash
   cd backend
   npm start
   ```

3. **Start Frontend**:
   ```bash
   cd frontend
   npm start
   ```

## Testing

Test the backend connection:
```bash
cd backend
npm run test-ollama
```

Test the API directly:
```bash
curl -X POST http://localhost:3000/api/chat \
  -H "Content-Type: application/json" \
  -d '{"message": "Hola, ¿cómo funciona SmarTrip?"}'
``` 