import { tool, agent } from "llamaindex";
import { Ollama } from "@llamaindex/ollama";
import { z } from "zod";
import { FAQManager } from "./lib/faq-manager.js";

// Configuración
const DEBUG = true;

// Instancia de preguntas frecuentes
const faq = new FAQManager();

// Nuevo system prompt
const systemPrompt = `
Sos Tripi, un asistente virtual que ayuda a los usuarios a entender cómo usar la app SmarTrip: una app que compara los precios de servicios de transporte privado como uber, Cabify y DiDi y te mdeja elegir el que quieras.
Tu tarea es responder preguntas frecuentes sobre funciones como: comparar precios, reservar viajes, gestionar la cuenta, métodos de pago, etc.
Respondé con claridad, usando respuestas sugeridas, y sin explicar el proceso interno.
`.trim();

const ollamaLLM = new Ollama({
    model: "qwen3:1.7b",
    temperature: 0.05,
    timeout: 2 * 60 * 1000,
});

// Tool: buscar una pregunta específica del usuario
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

// Tool: listar preguntas frecuentes por sección/pantalla
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

// Tool: mostrar todas las secciones disponibles
const listarPantallasTool = tool({
    name: "listarPantallas",
    description: "Devuelve todas las secciones/pantallas de la app con preguntas frecuentes",
    parameters: z.object({}),
    execute: () => {
        return JSON.stringify(faq.listarTodasLasPantallas());
    },
});

// Configuración del agente LLM
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
