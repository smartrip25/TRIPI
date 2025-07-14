import { FAQManager } from "./faq-manager.js";

// Configuración desde variables de entorno
const DEBUG = process.env.DEBUG === 'true' || true; // Forzar debug para testing
const OLLAMA_BASE_URL = process.env.OLLAMA_BASE_URL || 'https://8c26a2dde666.ngrok-free.app';
const OLLAMA_MODEL = process.env.OLLAMA_MODEL || 'gemma3:1b';

// Instancia de preguntas frecuentes
const faq = new FAQManager();

// Prompt del sistema para Ollama
const systemPrompt = `
Sos Tripi, asistente de SmarTrip. REGLAS IMPORTANTES:

1. SOLO usa información de las FAQ proporcionadas
2. NO inventes NUNCA información que no esté en las FAQ
3. Puedes ser carismático y amigable, pero siempre basado en datos reales
4. Responde de manera natural y conversacional
5. Si no tienes información específica, di "No tengo información sobre eso"
6. NO sugieras funciones que no estén en las FAQ

SmarTrip es una app que compara precios de Uber, Cabify, DiDi y permite elegir la mejor opción.

IMPORTANTE: Solo responde con información de las FAQ. Nada más.
`.trim();

// Función para hacer request a Ollama usando fetch
async function callOllamaAPI(prompt) {
  try {
    if (DEBUG) {
      console.log(`Attempting to connect to Ollama at: ${OLLAMA_BASE_URL}`);
    }

    const response = await fetch(`${OLLAMA_BASE_URL}/api/generate`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: OLLAMA_MODEL,
        prompt: prompt,
        stream: false
      }),
      // Add timeout for better error handling
      signal: AbortSignal.timeout(10000) // 10 second timeout
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`HTTP error! status: ${response.status}, message: ${errorText}`);
    }

    const data = await response.json();
    return data.response;
  } catch (error) {
    console.error('Error calling Ollama API:', error.message);
    
    // Provide more specific error messages
    if (error.name === 'AbortError') {
      throw new Error('Ollama request timed out. Make sure Ollama is running and accessible.');
    } else if (error.code === 'ECONNREFUSED') {
      throw new Error('Cannot connect to Ollama. Make sure Ollama is running and accessible via ngrok.');
    } else if (error.message.includes('fetch')) {
      throw new Error('Network error connecting to Ollama. Check if Ollama is running and ngrok is properly configured.');
    }
    
    throw error;
  }
}

// Función para generar el menú principal
function generarMenuPrincipal() {
  const opciones = [
    { letra: 'A', pantalla: 'Inicio', descripcion: 'Pantalla principal y navegación' },
    { letra: 'B', pantalla: 'Comparar precios', descripcion: 'Comparar tarifas entre apps' },
    { letra: 'C', pantalla: 'Reservar', descripcion: 'Reservar viajes' },
    { letra: 'D', pantalla: 'Cuenta', descripcion: 'Gestionar perfil y configuración' },
    { letra: 'E', pantalla: 'Actividad', descripcion: 'Historial de viajes' },
    { letra: 'F', pantalla: 'Método de pago', descripcion: 'Gestionar métodos de pago' },
    { letra: 'G', pantalla: 'Premium', descripcion: 'Funciones avanzadas' },
    { letra: 'H', pantalla: 'General', descripcion: 'Información general sobre SmarTrip' },
    { letra: 'I', pantalla: 'Personalizada', descripcion: 'Hacer una pregunta personalizada' }

  ];

  const menu = opciones.map(op => 
    `${op.letra}. ${op.pantalla} - ${op.descripcion}`
  ).join('\n');

  return {
    mensaje: `¡Hola! Soy Tripi, tu asistente de SmarTrip 🚗

Te ayudo a navegar la app y resolver todas tus dudas. Decime qué querés saber:

${menu}

Escribí la letra de la opción que te interesa o hacé tu pregunta directamente.`,
    opciones: opciones
  };
}

// Función para generar menú con pregunta personalizada (para submenús)
function generarMenuConPersonalizada() {
  const opciones = [
    { letra: 'A', pantalla: 'Inicio', descripcion: 'Pantalla principal y navegación' },
    { letra: 'B', pantalla: 'Comparar precios', descripcion: 'Comparar tarifas entre apps' },
    { letra: 'C', pantalla: 'Reservar', descripcion: 'Reservar viajes' },
    { letra: 'D', pantalla: 'Cuenta', descripcion: 'Gestionar perfil y configuración' },
    { letra: 'E', pantalla: 'Actividad', descripcion: 'Historial de viajes' },
    { letra: 'F', pantalla: 'Método de pago', descripcion: 'Gestionar métodos de pago' },
    { letra: 'G', pantalla: 'Premium', descripcion: 'Funciones avanzadas' },
    { letra: 'H', pantalla: 'General', descripcion: 'Información general sobre SmarTrip' },
    { letra: 'I', pantalla: 'Personalizada', descripcion: 'Hacer una pregunta personalizada' }
  ];

  const menu = opciones.map(op => 
    `${op.letra}. ${op.pantalla} - ${op.descripcion}`
  ).join('\n');

  return {
    mensaje: `¿Qué más querés saber?

${menu}

Escribí la letra de la opción que te interesa o hacé tu pregunta directamente.`,
    opciones: opciones
  };
}

// Función para procesar selección de menú
function procesarSeleccionMenu(seleccion, opciones) {
  const letra = seleccion.toUpperCase().trim();
  
  // Buscar por letra
  const opcion = opciones.find(op => op.letra === letra);
  if (opcion) {
    return opcion.pantalla;
  }
  
  // Si no es una letra, buscar por nombre de pantalla
  const pantallaEncontrada = opciones.find(op => 
    seleccion.toLowerCase().includes(op.pantalla.toLowerCase()) ||
    op.pantalla.toLowerCase().includes(seleccion.toLowerCase())
  );
  
  if (pantallaEncontrada) {
    return pantallaEncontrada.pantalla;
  }
  
  return null;
}

// Función para generar submenú de una pantalla
function generarSubmenuPantalla(pantalla) {
  const pantallaData = faq.pantallas.find(p => p.pantalla === pantalla);
  if (!pantallaData) {
    return {
      mensaje: `No encontré información sobre ${pantalla}. ¿Querés que volvamos al menú principal?`,
      esSubmenu: false
    };
  }

  const preguntas = pantallaData.preguntas_ejemplo;
  const submenu = preguntas.map((pregunta, index) => 
    `${String.fromCharCode(65 + index)}. ${pregunta}`
  ).join('\n');

  // Obtener la última letra disponible
  const ultimaLetra = faq.getUltimaLetraSubmenu(pantalla);
  const siguienteLetra = String.fromCharCode(ultimaLetra.charCodeAt(0) + 1);

  return {
    mensaje: `${pantallaData.pantalla} 📱

${pantallaData.funcionalidad}

¿Qué querés saber sobre ${pantallaData.pantalla}?

${submenu}

${siguienteLetra}. Volver al menú principal

O escribí tu pregunta directamente.`,
    esSubmenu: true,
    pantalla: pantallaData.pantalla,
    preguntas: preguntas,
    respuestas: pantallaData.respuestas_sugeridas
  };
}

// Función para procesar selección de submenú
function procesarSeleccionSubmenu(seleccion, submenuData) {
  const letra = seleccion.toUpperCase().trim();
  const index = letra.charCodeAt(0) - 65; // A=0, B=1, etc.
  
  // Verificar si es la opción de volver (última letra + 1)
  const ultimaLetra = faq.getUltimaLetraSubmenu(submenuData.pantalla);
  const letraVolver = String.fromCharCode(ultimaLetra.charCodeAt(0) + 1);
  
  if (letra === letraVolver) {
    // Generar menú principal
    const menu = generarMenuConPersonalizada();
    return {
      pregunta: "Volver al menú principal",
      respuesta: menu.mensaje,
      esMenuPrincipal: true,
      menu: menu.opciones
    };
  }
  
  if (index >= 0 && index < submenuData.preguntas.length) {
    return {
      pregunta: submenuData.preguntas[index],
      respuesta: submenuData.respuestas[index]
    };
  }
  
  // Si no es una letra, buscar por texto
  for (let i = 0; i < submenuData.preguntas.length; i++) {
    if (submenuData.preguntas[i].toLowerCase().includes(seleccion.toLowerCase()) ||
        seleccion.toLowerCase().includes(submenuData.preguntas[i].toLowerCase())) {
      return {
        pregunta: submenuData.preguntas[i],
        respuesta: submenuData.respuestas[i]
      };
    }
  }
  
  return null;
}

// Función para generar respuesta con Ollama para preguntas personalizadas
async function generarRespuestaPersonalizada(pregunta) {
  try {
    // Construir contexto con TODAS las FAQ
        console.log("ingtentando");
    const todasLasFaqs = faq.pantallas
      .map(p => {
        return p.preguntas_ejemplo.map((q, i) =>
          `Q: ${q}\nA: ${p.respuestas_sugeridas[i] || ''}`
        ).join('\n');
      })
      .join('\n');

    const prompt = `
Respondé SOLO usando la siguiente información de las FAQ. Si no hay información, decí: "No tengo información sobre eso".

${todasLasFaqs}

Pregunta del usuario: ${pregunta}
Respuesta:
    `.trim();

    const response = await callOllamaAPI(prompt);
    return {
      respuesta: cleanResponse(response),
      fuente: 'Ollama'
    };
  } catch (error) {
    console.error('Error generating personal response:', error);
    return {
      respuesta: "No tengo información sobre eso." + error,
      fuente: 'Error'
    };
  }
}

// Función para buscar en FAQ (mantenida para compatibilidad)
async function buscarEnFAQ(pregunta) {
  const resultados = faq.buscarPorPregunta(pregunta);
  
  if (resultados && resultados.length > 0) {
    return resultados;
  }
  
  return null;
}

// Función para limpiar respuestas de Ollama
function cleanResponse(response) {
  if (!response) return "No tengo información sobre eso.";
  
  let cleaned = response.trim();
  
  // Remover saludos al inicio
  cleaned = cleaned.replace(/^(Hola|¡Hola|Hola!|¡Hola!)\s*/i, '');
  
  // Remover preguntas innecesarias al final
  cleaned = cleaned.replace(/\s*\?$/, '');
  cleaned = cleaned.replace(/\s*¿[^?]*\?$/, '');
  
  // Remover sugerencias de cosas que no existen
  cleaned = cleaned.replace(/\s*¿[^?]*(puedo ayudarte|te ayudo|necesitas ayuda)[^?]*\?/gi, '');
  
  // Si la respuesta está vacía después de limpiar, usar fallback
  if (cleaned.trim().length < 10) {
    return "No tengo información específica sobre eso.";
  }
  
  return cleaned;
}

// Función para generar respuesta con opción de volver
function generarRespuestaConVolver(respuesta, esPrimeraRespuesta = false) {
  if (esPrimeraRespuesta) {
    return respuesta;
  }
  
  return `${respuesta}

¿Querés saber algo más? Escribí tu pregunta o elegí una opción del menú.`;
}

// Función para generar menú de solo volver
function generarMenuVolver() {
  return [{ letra: 'A', pantalla: 'Volver', descripcion: 'Volver' }];
}

// Función para obtener el mensaje anterior
function obtenerMensajeAnterior(conversationHistory) {
  if (!conversationHistory || conversationHistory.length < 2) {
    return null;
  }
  
  // Buscar el último mensaje del usuario (excluyendo el actual)
  for (let i = conversationHistory.length - 2; i >= 0; i--) {
    const mensaje = conversationHistory[i];
    if (mensaje.message) {
      return mensaje.message;
    }
  }
  
  return null;
}

// Función para obtener el contexto actual de la conversación
function obtenerContextoActual(conversationHistory) {
  if (!conversationHistory || conversationHistory.length === 0) {
    return { tipo: 'menu_principal', data: null };
  }

  // Buscar el último mensaje del asistente que tenga submenú
  for (let i = conversationHistory.length - 1; i >= 0; i--) {
    const mensaje = conversationHistory[i];
    // Verificar si es un mensaje del asistente (tiene submenu o menu)
    if (mensaje.submenu) {
      return { tipo: 'submenu', data: mensaje.submenu };
    }
    if (mensaje.menu) {
      return { tipo: 'menu_principal', data: mensaje.menu };
    }
  }

  return { tipo: 'menu_principal', data: null };
}

// Función principal del agente reestructurada
async function chatWithAgent(message, conversationHistory = []) {
  try {
    if (DEBUG) {
      console.log('Mensaje recibido:', message);
      console.log('Contexto actual:', obtenerContextoActual(conversationHistory));
    }

    // Si es el primer mensaje o es un saludo mostrar menú principal SOLO si no es repetido
    if (
      conversationHistory.length === 0 ||
      message.toLowerCase().includes('hola') ||
      message.toLowerCase().includes('menu') ||
      message.toLowerCase().includes('opciones')
    ) {
      // Evitar duplicados: solo mostrar si el último mensaje no es el menú principal
      const lastMsg = conversationHistory[conversationHistory.length - 1];
      if (!lastMsg || !lastMsg.menu || !Array.isArray(lastMsg.menu) || lastMsg.menu.length !== 8) {
        const menu = generarMenuPrincipal();
        return {
          data: {
            result: menu.mensaje,
            menu: menu.opciones
          }
        };
      } else {
        // Si ya se mostró, no repetir
        return { data: {} };
      }
    }

    // Manejar comando "volver"
    if (message.toLowerCase().includes('volver') || message.toLowerCase() === 'a') {
      // Si el último menú era solo "Volver", mostrar menú principal
      const contexto = obtenerContextoActual(conversationHistory);
      if (
        contexto.tipo === 'submenu' &&
        contexto.data && contexto.data.menu &&
        contexto.data.menu.length === 1 &&
        contexto.data.menu[0].pantalla === 'Volver'
      ) {
        const menu = generarMenuConPersonalizada();
        return {
          data: {
            result: menu.mensaje,
            menu: menu.opciones
          }
        };
      }
    }

    // Obtener el contexto actual
    const contexto = obtenerContextoActual(conversationHistory);

    // Si estamos en un submenú y el mensaje es exactamente una letra, procesar como selección de submenú
    if (contexto.tipo === 'submenu' && /^[A-Z]$/i.test(message.trim())) {
      const resultado = procesarSeleccionSubmenu(message, contexto.data);
      if (resultado) {
        // Si es volver al menú principal
        if (resultado.esMenuPrincipal) {
          return {
            data: {
              result: resultado.respuesta,
              menu: resultado.menu
            }
          };
        }
        // Si es una respuesta normal del submenú, incluir solo la opción de volver y mostrarlo en el texto
        const respuestaConVolver = `${resultado.respuesta}\n\nA. Volver`;
        const menuVolver = generarMenuVolver();
        return {
          data: {
            result: respuestaConVolver,
            menu: menuVolver
          }
        };
      }
    }

    // Si el mensaje es exactamente una letra de menú principal
    if (/^[A-I]$/i.test(message.trim())) {
      // Si no es la primera conversación, usar menú con pregunta personalizada
      const menu = conversationHistory.length > 0 ? generarMenuConPersonalizada() : generarMenuPrincipal();
      const pantallaSeleccionada = procesarSeleccionMenu(message, menu.opciones);
      
      // --- CAMBIO: Si elige la opción personalizada ---
      if (pantallaSeleccionada === 'Personalizada') {
        return {
          data: {
            result: '¡Elegiste hacer una pregunta personalizada!\n\nPor favor, escribí tu pregunta sobre SmarTrip en el cuadro de abajo y presioná enviar.\n\nA. Volver',
            menu: generarMenuVolver()
          }
        };
      }
      // --- FIN CAMBIO ---

      if (pantallaSeleccionada) {
        const submenu = generarSubmenuPantalla(pantallaSeleccionada);
        return {
          data: {
            result: submenu.mensaje,
            submenu: submenu
          }
        };
      }
    }

    // Si no es una selección de menú ni submenú, procesar como pregunta personalizada
    const respuestaPersonalizada = await generarRespuestaPersonalizada(message);
    const respuestaConVolver = generarRespuestaConVolver(respuestaPersonalizada.respuesta, false);
    const menuConPersonalizada = generarMenuConPersonalizada();
    
    return {
      data: {
        result: respuestaConVolver,
        menu: menuConPersonalizada.opciones
      }
    };

  } catch (error) {
    console.error('Error in chatWithAgent:', error);
    
    return {
      data: {
        result: "Ups, algo salió mal. ¿Querés que volvamos al menú principal? Escribí 'menu' para empezar de nuevo."
      }
    };
  }
}

// Export the agent
export default {
  chat: chatWithAgent
}; 