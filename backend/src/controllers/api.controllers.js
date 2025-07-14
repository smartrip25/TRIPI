import elAgente from '../lib/agent.js';

// Almacenar el estado de la conversación (en producción usar una base de datos)
const conversationStates = new Map();

export const chatController = async (req, res) => {
  console.log('Received POST request to /api/chat');
  console.log('Request body:', req.body);
  
  const { message, conversationHistory = [], sessionId = 'default' } = req.body;

  if (!message) {
    return res.status(400).json({ error: 'Message is required' });
  }

  try {
    // Obtener el estado de la conversación para esta sesión
    let currentState = conversationStates.get(sessionId) || {
      history: [],
      currentMenu: null,
      currentSubmenu: null
    };

    // Usar el agente asíncrono con contexto
    const response = await elAgente.chat(message, currentState.history);
    
    let textResponse = "";
    let menuData = null;
    let submenuData = null;
    
    if (response && response.data) {
      textResponse = response.data.result || "";
      
      // Guardar información del menú si está presente
      if (response.data.menu) {
        menuData = response.data.menu;
        currentState.currentMenu = menuData;
        currentState.currentSubmenu = null;
      }
      
      // Guardar información del submenú si está presente
      if (response.data.submenu) {
        submenuData = response.data.submenu;
        currentState.currentSubmenu = submenuData;
      }
    } else if (typeof response === "string") {
      textResponse = response;
    } else {
      textResponse = JSON.stringify(response);
    }

    // Limpiar respuesta (sacar etiquetas <think>)
    textResponse = textResponse.replace(/<think>[\s\S]*?<\/think>/g, '').trim();

    // Agregar el mensaje del usuario al historial
    currentState.history.push({
      message: message,
      sender: 'user',
      timestamp: new Date().toISOString()
    });

    // Agregar la respuesta del asistente al historial
    currentState.history.push({
      response: textResponse,
      menu: menuData,
      submenu: submenuData,
      sender: 'assistant',
      timestamp: new Date().toISOString()
    });

    // Mantener solo los últimos 10 mensajes para evitar que crezca demasiado
    if (currentState.history.length > 10) {
      currentState.history = currentState.history.slice(-10);
    }

    // Guardar el estado actualizado
    conversationStates.set(sessionId, currentState);

    console.log('Sending response:', { 
      response: textResponse,
      hasMenu: !!menuData,
      hasSubmenu: !!submenuData,
      historyLength: currentState.history.length
    });

    res.json({ 
      response: textResponse,
      menu: menuData,
      submenu: submenuData,
      sessionId: sessionId
    });
  } catch (error) {
    console.error('Error processing message:', error);
    res.status(500).json({ error: 'Failed to process message' });
  }
};

export const resetChatController = async (req, res) => {
  console.log('Received POST request to /api/reset-chat');
  
  const { sessionId = 'default' } = req.body;
  
  try {
    // Limpiar el estado de la conversación
    conversationStates.delete(sessionId);
    
    // Generar mensaje de bienvenida con menú
    const welcomeResponse = await elAgente.chat('hola', []);
    
    let textResponse = "";
    let menuData = null;
    
    if (welcomeResponse && welcomeResponse.data) {
      textResponse = welcomeResponse.data.result || "";
      menuData = welcomeResponse.data.menu;
    } else {
      textResponse = "¡Hola! Soy Tripi, tu asistente de SmarTrip 🚗\n\nTe ayudo a navegar la app y resolver todas tus dudas. ¿Qué querés saber?";
    }
    
    console.log('Sending reset response:', { response: textResponse });
    res.json({ 
      response: textResponse,
      menu: menuData,
      reset: true,
      sessionId: sessionId
    });
  } catch (error) {
    console.error('Error resetting chat:', error);
    res.status(500).json({ error: 'Failed to reset chat' });
  }
};
