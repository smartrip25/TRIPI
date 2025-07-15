"# TRIPI" 
------
# Flujo
Ollama corre en Ngrok --> el backend corre en Vercel --> el frontend corre en expo.
(Ollama corre en Ngrok porque Vercel no lo puede correr ya que corre de manera local, y Expo desde celu tampoco puede acceder).

# EJECUCIÓN
// Configuración // 
--> Deshabilitar que Ollama se inicie automáticamente.

// CMD //
--> Instalar Ollama (ollama run gemma3:1b)
--> Instalar Ngrok (npm i ngrok)
--> Ejecutar: 
    $env/set:OLLAMA_HOST="0.0.0.0" (hace que cualquier usuario pueda acceder a la conexión)
    ollama serve (ejecuta Ollama localmente)
    ngrok http 11434 (expone Ollama a Ngrok)
      --> Poner el link que te da en el backend en donde este configurado el link de ngrok (archivo .env, donde dice OLLAMA_BASE_URL), y también como environment variable en Vercel.
      
* Si hay que eliminar puertos que ollama usa previamente, ejecutar:
netstat -aon | findstr :11434 (esto te da info del proceso que te da ejecutando, la última columna es el PID)
taskkill /PID [PID Q TE DA SIN CORCHETES] /F (elimina todos los procesos con ese PID)

// BACKEND //
--> Instalar:
npm i
npm i cors
npm i express
--> Correr:
npm run start 
* Opcional: antes del npm run start, hace npm run test-nrgok para ver si la conexión al Ollama online anda bien

// FRONTEND //
--> Instalar:
npm i
npm install --global @expo/ngrok@^4.1.0
--> Correr: 
npx expo start --tunnel
