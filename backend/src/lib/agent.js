import { tool, agent } from "llamaindex";
import { Ollama } from "@llamaindex/ollama";
import { z } from "zod";
import { FAQManager } from "./faq-manager.js";

// Configuración desde variables de entorno
const DEBUG = process.env.DEBUG === 'true' || false;
const OLLAMA_BASE_URL = process.env.OLLAMA_BASE_URL || 'http://localhost:11434';
const OLLAMA_MODEL = process.env.OLLAMA_MODEL || 'qwen3:1.7b';

// Instancia de preguntas frecuentes
const faq = new FAQManager();

// Prompt del sistema
const systemPrompt = `
Sos Tripi, un asistente virtual que ayuda a los usuarios a entender cómo usar la app SmarTrip: una app que compara los precios de servicios de transporte privado como Uber, Cabify y DiDi y te deja elegir el que quieras.
Tu tarea es responder preguntas frecuentes sobre funciones como: comparar precios, reservar viajes, gestionar la cuenta, métodos de pago, etc.
Respondé con claridad, usando respuestas sugeridas, y sin explicar el proceso interno.
`.trim();

// Configuración de Ollama con manejo de errores
let ollamaLLM = null;
// Disable Ollama in serverless environment
if (process.env.NODE_ENV !== 'production' && !process.env.VERCEL) {
  try {
    ollamaLLM = new Ollama({
      model: OLLAMA_MODEL,
      temperature: 0.05,
      timeout: 2 * 60 * 1000,
      baseUrl: OLLAMA_BASE_URL,
    });
  } catch (error) {
    console.warn('Error initializing Ollama LLM:', error.message);
    ollamaLLM = null;
  }
}

const buscarPorPreguntaTool = tool({
  name: "buscarPorPregunta",
  description: "Usa esta herramienta para encontrar respuestas sugeridas a preguntas de usuarios",
  parameters: z.object({
    pregunta: z.string().describe("La pregunta del usuario"),
  }),
  execute: ({ pregunta }) => {
    const resultados = faq.buscarPorPregunta(pregunta);
    return JSON.stringify(resultados);
  },
});

const listarPreguntasPorPantallaTool = tool({
  name: "listarPreguntasPorPantalla",
  description: "Devuelve preguntas y respuestas frecuentes de una pantalla específica",
  parameters: z.object({
    pantalla: z.string().describe("El nombre de la pantalla (ej: Cuenta, Inicio, Comparar precios)"),
  }),
  execute: ({ pantalla }) => {
    const preguntas = faq.listarPreguntasPorPantalla(pantalla);
    return JSON.stringify(preguntas);
  },
});

const listarPantallasTool = tool({
  name: "listarPantallas",
  description: "Devuelve todas las secciones/pantallas de la app con preguntas frecuentes",
  parameters: z.object({}),
  execute: () => {
    return JSON.stringify(faq.listarTodasLasPantallas());
  },
});

// Crear agente solo si Ollama está disponible
let elAgente = null;
if (ollamaLLM) {
  try {
    elAgente = agent({
      tools: [
        buscarPorPreguntaTool,
        listarPreguntasPorPantallaTool,
        listarPantallasTool,
      ],
      llm: ollamaLLM,
      verbose: DEBUG,
      systemPrompt: systemPrompt,
    });
  } catch (error) {
    console.warn('Error creating agent:', error.message);
  }
}

export default elAgente; 