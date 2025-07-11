# Backend Tripi - API para Vercel

## Configuración de Variables de Entorno

### Variables Locales (.env)

Crea un archivo `.env` en la raíz del backend con las siguientes variables:

```env
# Configuración del servidor


# Configuración de Ollama


# Configuración de CORS


# Configuración de debug

```

### Variables para Vercel

En el dashboard de Vercel, agrega estas variables de entorno:

```env
NODE_ENV=production
OLLAMA_BASE_URL=https://tu-servidor-ollama.com
OLLAMA_MODEL=qwen3:1.7b
CORS_ORIGIN=https://tu-frontend.vercel.app
DEBUG=false
```

## Instalación

```bash
npm install
```

## Desarrollo Local

```bash
npm run dev
```

## Despliegue en Vercel

1. Conecta tu repositorio a Vercel
2. Configura las variables de entorno en el dashboard
3. El archivo `api/index.js` será el punto de entrada

## Estructura del Proyecto

```
backend/
├── api/
│   └── index.js          # Punto de entrada para Vercel
├── src/
│   ├── app.js            # Aplicación Express
│   ├── routes/
│   │   └── api.routes.js # Rutas de la API
│   ├── controllers/
│   │   └── api.controllers.js # Controladores
│   └── lib/
│       ├── agent.js      # Agente IA
│       ├── faq-manager.js # Gestor de FAQ
│       └── cli-chat.js   # Chat CLI
├── vercel.json           # Configuración de Vercel
└── package.json          # Dependencias
```

## Endpoints

- `GET /api/test` - Test endpoint
- `POST /api/chat` - Chat con el agente IA

## Notas Importantes

- El agente IA requiere Ollama corriendo localmente o en un servidor
- Si Ollama no está disponible, se usa un agente simple como fallback
- Las variables de entorno permiten configurar diferentes entornos 