import { FAQManager } from "./faq-manager.js";

// Configuración desde variables de entorno
const DEBUG = process.env.DEBUG === 'true' || false;
const OLLAMA_BASE_URL = process.env.OLLAMA_BASE_URL || 'http://localhost:11434';
const OLLAMA_MODEL = process.env.OLLAMA_MODEL || 'llama3';

// Instancia de preguntas frecuentes
const faq = new FAQManager();

// Prompt del sistema
const systemPrompt = `
Sos Tripi, un asistente virtual que ayuda a los usuarios a entender cómo usar la app SmarTrip: una app que compara los precios de servicios de transporte privado como Uber, Cabify y DiDi y te deja elegir el que quieras.
Tu tarea es responder preguntas frecuentes sobre funciones como: comparar precios, reservar viajes, gestionar la cuenta, métodos de pago, etc.
Respondé con claridad, usando respuestas sugeridas, y sin explicar el proceso interno.
`.trim();

// Función para hacer request a Ollama usando fetch
async function callOllamaAPI(prompt) {
  try {
    const response = await fetch(`${OLLAMA_BASE_URL}/api/generate`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: OLLAMA_MODEL,
        prompt: prompt,
        stream: false
      })
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return data.response;
  } catch (error) {
    console.error('Error calling Ollama API:', error);
    throw error;
  }
}

// Función para buscar en FAQ y generar respuesta
async function buscarEnFAQ(pregunta) {
  const resultados = faq.buscarPorPregunta(pregunta);
  
  if (resultados && resultados.length > 0) {
    const mejorRespuesta = resultados[0];
    return mejorRespuesta.respuesta || "No encontré una respuesta específica para tu pregunta. ¿Podrías reformularla?";
  }
  
  return null;
}

// Función principal del agente
async function chatWithAgent(message) {
  try {
    // Primero intentar buscar en FAQ
    const faqResponse = await buscarEnFAQ(message);
    
    if (faqResponse) {
      return {
        data: {
          result: faqResponse
        }
      };
    }

    // Si no hay respuesta en FAQ, usar Ollama
    const fullPrompt = `${systemPrompt}\n\nUsuario: ${message}\n\nTripi:`;
    
    if (DEBUG) {
      console.log('Calling Ollama with prompt:', fullPrompt);
    }
    
    const ollamaResponse = await callOllamaAPI(fullPrompt);
    
    return {
      data: {
        result: ollamaResponse
      }
    };
  } catch (error) {
    console.error('Error in chatWithAgent:', error);
    
    // Fallback: buscar en FAQ sin Ollama
    const fallbackResponse = await buscarEnFAQ(message);
    
    if (fallbackResponse) {
      return {
        data: {
          result: fallbackResponse
        }
      };
    }
    
    return {
      data: {
        result: "Hola! Soy Tripi, tu asistente virtual para la app SmarTrip. ¿En qué puedo ayudarte? Podés preguntarme sobre comparar precios, reservar viajes, gestionar tu cuenta, métodos de pago y más."
      }
    };
  }
}

// Export the agent
export default {
  chat: chatWithAgent
}; 