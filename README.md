"# TRIPI" 
------
Ollama corre en Ngrok --> el backend corre en Vercel --> el frontend corre en expo
Ollama corre en Ngrok porque Vercel no lo puede correr ya que corre de manera local.

// CMD //
--> deshabilitar que ollama se inicie automaticamente 
- instalar ollama
- npm i ngrok

ejecutar: 
$env:OLLAMA_HOST="0.0.0.0"
ollama serve
ngrok http 11434
- poner el link que te da en el backend en donde este configurado el link de ngrok, tmb como enviroment variable en vercel


--> si hay que eliminar puertos que ollama usa previamente
netstat -aon | findstr :11434
taskkill /PID [PID Q TE DA SIN CORCHETES] /F

// BACKEND //
Instalar:
npm i
npm i cors
npm i express
Correr:
npm run start 

// FRONTEND //
Instalar:
npm i
npm install --global @expo/ngrok@^4.1.0
Correr: 
npx expo start --tunnel