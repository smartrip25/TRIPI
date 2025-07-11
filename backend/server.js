
import express from 'express';
import cors from 'cors';

const app = express();
const port = 3000;

app.use(cors({ origin: '*', credentials: true }));
app.use(express.json());

// Test endpoint to verify server is working
app.get('/api/test', (req, res) => {
  res.json({ message: 'Server is running correctly!' });
});

// Función simple del agente
async function elAgente(message) {
  // Por ahora, una respuesta simple
  return {
    data: {
      result: `Hola! Recibí tu mensaje: "${message}". Soy Tripi, tu asistente virtual. ¿En qué puedo ayudarte?`
    }
  };
}

app.post('/api/chat', async (req, res) => {
  console.log('Received POST request to /api/chat');
  console.log('Request body:', req.body);
  
  const { message } = req.body;

  if (!message) {
    return res.status(400).json({ error: 'Message is required' });
  }

  try {
    const response = await elAgente(message);
    let textResponse = "";
    let parsedResponse = response;

    if (typeof response === "string") {
      try {
        parsedResponse = JSON.parse(response);
      } catch {
        parsedResponse = response;
      }
    }

    if (parsedResponse && parsedResponse.data && typeof parsedResponse.data.result === "string") {
      textResponse = parsedResponse.data.result;
    } else if (typeof parsedResponse === "string") {
      textResponse = parsedResponse;
    } else {
      textResponse = JSON.stringify(parsedResponse);
    }

    // Limpiar respuesta (sacar etiquetas <think>)
    textResponse = textResponse.replace(/<think>[\s\S]*?<\/think>/g, '').trim();

    console.log('Sending response:', { response: textResponse });
    res.json({ response: textResponse });
  } catch (error) {
    console.error('Error processing message:', error);
    res.status(500).json({ error: 'Failed to process message' });
  }
});

// Catch all other routes
app.use('*', (req, res) => {
  console.log(`404 - Route not found: ${req.method} ${req.originalUrl}`);
  res.status(404).json({ error: 'Route not found' });
});

app.listen(port, () => {
  console.log(`✅ Server corriendo en http://localhost:${port}`);
  console.log(`📝 Test endpoint: http://localhost:${port}/api/test`);
  console.log(`💬 Chat endpoint: http://localhost:${port}/api/chat`);
});
