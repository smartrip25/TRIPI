import { readFileSync, writeFileSync } from 'fs';

import { readFileSync, writeFileSync } from 'fs';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const DATA_FILE = join(__dirname, '../data/faq.json');

class FAQManager {
  constructor() {
    this.pantallas = [];
    this.cargarDesdeJson();
  }

  cargarDesdeJson() {
    try {
      const data = JSON.parse(readFileSync(DATA_FILE, 'utf-8'));
      this.pantallas = data;
    } catch (e) {
      console.error("Error al leer el archivo de preguntas frecuentes:", e);
    }
  }

  guardarEnJson() {
    try {
      writeFileSync(DATA_FILE, JSON.stringify(this.pantallas, null, 2));
    } catch (e) {
      console.error("Error al guardar las preguntas frecuentes:", e);
      throw new Error("No se pudo guardar la información.");
    }
  }

  agregarPantalla(nuevaPantalla) {
    this.pantallas.push(nuevaPantalla);
    this.guardarEnJson();
  }

  buscarPorPregunta(preguntaUsuario) {
    const lower = preguntaUsuario.toLowerCase();
    let resultado = [];

    for (const p of this.pantallas) {
      p.preguntas_ejemplo.forEach((q, i) => {
        if (q.toLowerCase().includes(lower)) {
          resultado.push({
            pantalla: p.pantalla,
            pregunta: q,
            respuesta: p.respuestas_sugeridas[i] || "Respuesta no encontrada."
          });
        }
      });
    }

    return resultado.length > 0 ? resultado : [{ respuesta: "No encontré una respuesta exacta, ¿querés reformular la pregunta?" }];
  }

  listarPreguntasPorPantalla(nombrePantalla) {
    const pantalla = this.pantallas.find(p => p.pantalla.toLowerCase() === nombrePantalla.toLowerCase());
    if (!pantalla) return [];
    return pantalla.preguntas_ejemplo.map((p, i) => ({
      pregunta: p,
      respuesta: pantalla.respuestas_sugeridas[i] || "Respuesta no encontrada."
    }));
  }

  listarTodasLasPantallas() {
    return this.pantallas.map(p => p.pantalla);
  }
}

export { FAQManager };
