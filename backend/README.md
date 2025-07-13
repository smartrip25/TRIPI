# Backend Tripi - Modificado para usar Ollama via ngrok

Este backend ha sido modificado para usar fetch en lugar de ejecutar Ollama directamente. Ahora hace requests POST a `https://8327ea41aae6.ngrok-free.app/api/generate` usando el modelo "llama3".

## Cambios realizados

1. **Eliminadas dependencias innecesarias:**
   - `llamaindex`
   - `@llamaindex/ollama`
   - `zod`

2. **Nueva implementación:**
   - Usa `fetch` nativo para hacer requests a Ollama a través de ngrok
   - Función asíncrona `callOllamaAPI()` que hace POST a `/api/generate`
   - Modelo configurado como "llama3" por defecto
   - Devuelve solo el campo `response` del JSON de Ollama

3. **Funcionalidad:**
   - Primero busca en el sistema de FAQ
   - Si no encuentra respuesta, usa Ollama via HTTP a través de ngrok
   - Fallback a FAQ si Ollama no está disponible

## Configuración

### Variables de entorno (opcionales):
- `OLLAMA_BASE_URL`: URL del servidor Ollama (default: `https://8327ea41aae6.ngrok-free.app`)
- `OLLAMA_MODEL`: Modelo a usar (default: `llama3`)
- `DEBUG`: Habilitar logs detallados (default: `false`)

### Requisitos:
- Ollama corriendo en `localhost:11434`
- ngrok corriendo y apuntando a `localhost:11434`
- Modelo "llama3" descargado en Ollama

## Uso

### Instalar dependencias:
```bash
npm install
```

### Ejecutar el servidor:
```bash
npm start
```

### Probar la conexión con Ollama:
```bash
npm run test-ollama
```

### Probar la conexión con ngrok:
```bash
npm run test-ngrok
```

### Endpoint de chat:
```
POST /api/chat
Content-Type: application/json

{
  "message": "Hola, ¿cómo funciona SmarTrip?"
}
```

## Estructura del código

- `src/lib/agent.js`: Nueva implementación con fetch usando ngrok
- `src/controllers/api.controllers.js`: Controlador simplificado
- `test-ollama.js`: Script de prueba original
- `test-ngrok-connection.js`: Script de prueba para ngrok

El endpoint `/api/chat` ahora actúa como proxy, enviando el prompt a Ollama a través de ngrok y devolviendo solo la respuesta. 