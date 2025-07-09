import { tool, agent } from "llamaindex";
import { Ollama } from "@llamaindex/ollama";
import { z } from "zod";
import { FAQManager } from "./lib/faq-manager.js";

const DEBUG = true;

// Instancia de preguntas frecuentes
const faq = new FAQManager();

// Prompt del sistema
const systemPrompt = `
Sos Tripi, un asistente virtual que ayuda a los usuarios a entender cómo usar la app SmarTrip: una app que compara los precios de servicios de transporte privado como Uber, Cabify y DiDi y te deja elegir el que quieras.
Tu tarea es responder preguntas frecuentes sobre funciones como: comparar precios, reservar viajes, gestionar la cuenta, métodos de pago, etc.
Respondé con claridad, usando respuestas sugeridas, y sin explicar el proceso interno.
`.trim();

const ollamaLLM = new Ollama({
  model: "qwen3:1.7b",
  temperature: 0.05,
  timeout: 2 * 60 * 1000,
});

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

const elAgente = agent({
  tools: [
    buscarPorPreguntaTool,
    listarPreguntasPorPantallaTool,
    listarPantallasTool,
  ],
  llm: ollamaLLM,
  verbose: DEBUG,
  systemPrompt: systemPrompt,
});

export default elAgente;
