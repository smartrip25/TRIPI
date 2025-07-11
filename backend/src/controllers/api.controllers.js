import elAgente from '../lib/agent.js';

// Función simple del agente (fallback)
async function elAgenteSimple(message) {
  return {
    data: {
      result: `Hola! Recibí tu mensaje: "${message}". Soy Tripi, tu asistente virtual. ¿En qué puedo ayudarte?`
    }
  };
}

export const chatController = async (req, res) => {
  console.log('Received POST request to /api/chat');
  console.log('Request body:', req.body);
  
  const { message } = req.body;

  if (!message) {
    return res.status(400).json({ error: 'Message is required' });
  }

  try {
    // Intentar usar el agente principal, si falla usar el simple
    let response;
    if (elAgente && typeof elAgente.chat === 'function') {
      try {
        response = await elAgente.chat({ message });
        console.log('Using main agent');
      } catch (error) {
        console.log('Error with main agent, using simple agent:', error.message);
        response = await elAgenteSimple(message);
      }
    } else {
      console.log('Main agent not available, using simple agent');
      response = await elAgenteSimple(message);
    }

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
};
