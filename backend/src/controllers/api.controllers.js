import elAgente from '../lib/agent.js';

export const chatController = async (req, res) => {
  console.log('Received POST request to /api/chat');
  console.log('Request body:', req.body);
  
  const { message } = req.body;

  if (!message) {
    return res.status(400).json({ error: 'Message is required' });
  }

  try {
    // Usar el agente asíncrono
    const response = await elAgente.chat(message);
    
    let textResponse = "";
    
    if (response && response.data && typeof response.data.result === "string") {
      textResponse = response.data.result;
    } else if (typeof response === "string") {
      textResponse = response;
    } else {
      textResponse = JSON.stringify(response);
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
