import { readFileSync, writeFileSync } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// Para obtener __dirname en ES Modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const DATA_FILE = path.join(__dirname, '../data/faq.json');

export class FAQManager {
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

    console.log('Buscando:', lower); // Debug

    // Búsqueda mejorada y más flexible
    for (const p of this.pantallas) {
      // 1. Buscar en preguntas exactas con mayor flexibilidad
      p.preguntas_ejemplo.forEach((q, i) => {
        const lowerQ = q.toLowerCase();
        if (lowerQ.includes(lower) || lower.includes(lowerQ) || 
            this.palabrasComunes(lower, lowerQ) || 
            this.coincidenciaParcial(lower, lowerQ)) {
          resultado.push({
            pantalla: p.pantalla,
            pregunta: q,
            respuesta: p.respuestas_sugeridas[i] || "Respuesta no encontrada.",
            funcionalidad: p.funcionalidad
          });
        }
      });

      // 2. Buscar en nombre de pantalla con sinónimos
      const sinonimosPantalla = this.getSinonimosPantalla(p.pantalla);
      if (sinonimosPantalla.some(s => lower.includes(s)) || 
          lower.includes(p.pantalla.toLowerCase()) || 
          p.pantalla.toLowerCase().includes(lower)) {
        resultado.push({
          pantalla: p.pantalla,
          pregunta: `Información sobre ${p.pantalla}`,
          respuesta: p.respuestas_sugeridas[0] || `Información sobre ${p.pantalla}.`,
          funcionalidad: p.funcionalidad
        });
      }

      // 3. Buscar en funcionalidad con palabras clave
      const lowerFuncionalidad = p.funcionalidad.toLowerCase();
      if (lowerFuncionalidad.includes(lower) || lower.includes(lowerFuncionalidad) ||
          this.palabrasComunes(lower, lowerFuncionalidad)) {
        resultado.push({
          pantalla: p.pantalla,
          pregunta: "Información general",
          respuesta: p.respuestas_sugeridas[0] || "Información disponible sobre esta funcionalidad.",
          funcionalidad: p.funcionalidad
        });
      }

      // 4. Buscar en respuestas sugeridas
      p.respuestas_sugeridas.forEach((respuesta, i) => {
        const lowerRespuesta = respuesta.toLowerCase();
        if (this.palabrasComunes(lower, lowerRespuesta) || 
            lower.includes(lowerRespuesta.substring(0, 20))) {
          resultado.push({
            pantalla: p.pantalla,
            pregunta: p.preguntas_ejemplo[i] || "Información relacionada",
            respuesta: respuesta,
            funcionalidad: p.funcionalidad
          });
        }
      });

      // 5. Búsqueda por palabras clave expandidas
      const palabrasClave = {
        'inicio': ['pantalla principal', 'home', 'principal', 'menú', 'dashboard'],
        'comparar': ['precios', 'comparación', 'tarifas', 'costos', 'precio'],
        'reservar': ['viaje', 'reserva', 'booking', 'agendar', 'programar'],
        'cuenta': ['perfil', 'usuario', 'datos', 'configuración', 'ajustes'],
        'actividad': ['historial', 'viajes anteriores', 'reciente', 'historial'],
        'pago': ['tarjeta', 'método de pago', 'facturación', 'efectivo', 'pagar'],
        'premium': ['versión premium', 'funciones avanzadas', 'pro', 'plus']
      };

      for (const [clave, sinonimos] of Object.entries(palabrasClave)) {
        if (lower.includes(clave) || sinonimos.some(s => lower.includes(s))) {
          if (p.pantalla.toLowerCase().includes(clave) || 
              p.funcionalidad.toLowerCase().includes(clave) ||
              sinonimos.some(s => p.pantalla.toLowerCase().includes(s))) {
            resultado.push({
              pantalla: p.pantalla,
              pregunta: `Información sobre ${clave}`,
              respuesta: p.respuestas_sugeridas[0] || `Información sobre ${p.pantalla}.`,
              funcionalidad: p.funcionalidad
            });
          }
        }
      }
    }

    // 6. Búsqueda por palabras individuales más inteligente
    if (resultado.length === 0) {
      const palabras = lower.split(' ').filter(p => p.length > 2);
      for (const palabra of palabras) {
        for (const p of this.pantallas) {
          if (p.pantalla.toLowerCase().includes(palabra) || 
              p.funcionalidad.toLowerCase().includes(palabra) ||
              p.preguntas_ejemplo.some(q => q.toLowerCase().includes(palabra)) ||
              p.respuestas_sugeridas.some(r => r.toLowerCase().includes(palabra))) {
            resultado.push({
              pantalla: p.pantalla,
              pregunta: `Información relacionada con ${palabra}`,
              respuesta: p.respuestas_sugeridas[0] || `Información sobre ${p.pantalla}.`,
              funcionalidad: p.funcionalidad
            });
          }
        }
      }
    }

    // 7. Búsqueda de emergencia - buscar en toda la información disponible
    if (resultado.length === 0) {
      for (const p of this.pantallas) {
        const todaInfo = `${p.pantalla} ${p.funcionalidad} ${p.preguntas_ejemplo.join(' ')} ${p.respuestas_sugeridas.join(' ')}`.toLowerCase();
        if (todaInfo.includes(lower) || lower.split(' ').some(palabra => palabra.length > 2 && todaInfo.includes(palabra))) {
          resultado.push({
            pantalla: p.pantalla,
            pregunta: "Información relacionada",
            respuesta: p.respuestas_sugeridas[0] || `Información sobre ${p.pantalla}.`,
            funcionalidad: p.funcionalidad
          });
        }
      }
    }

    // Eliminar duplicados y ordenar por relevancia
    resultado = this.eliminarDuplicados(resultado);
    resultado = this.ordenarPorRelevancia(resultado, lower);

    console.log('Resultados encontrados:', resultado.length); // Debug
    if (resultado.length > 0) {
      console.log('Primer resultado:', resultado[0].pantalla, '-', resultado[0].respuesta.substring(0, 50) + '...');
    }
    return resultado;
  }

  // Función para verificar palabras comunes
  palabrasComunes(texto1, texto2) {
    const palabras1 = texto1.split(' ').filter(p => p.length > 2);
    const palabras2 = texto2.split(' ').filter(p => p.length > 2);
    return palabras1.some(p1 => palabras2.some(p2 => p1.includes(p2) || p2.includes(p1)));
  }

  // Función para coincidencia parcial
  coincidenciaParcial(texto1, texto2) {
    const palabras1 = texto1.split(' ').filter(p => p.length > 3);
    const palabras2 = texto2.split(' ').filter(p => p.length > 3);
    return palabras1.some(p1 => palabras2.some(p2 => p1.substring(0, 4) === p2.substring(0, 4)));
  }

  // Función para obtener sinónimos de pantalla
  getSinonimosPantalla(pantalla) {
    const sinonimos = {
      'Inicio': ['home', 'principal', 'menú', 'dashboard'],
      'Comparar precios': ['comparar', 'precios', 'comparación', 'tarifas'],
      'Reservar': ['reserva', 'viaje', 'booking', 'agendar'],
      'Cuenta': ['perfil', 'usuario', 'configuración'],
      'Actividad': ['historial', 'reciente', 'viajes'],
      'Método de pago': ['pago', 'tarjeta', 'facturación'],
      'Premium': ['premium', 'pro', 'plus', 'avanzado']
    };
    return sinonimos[pantalla] || [];
  }

  // Función para obtener la última letra disponible en un submenú
  getUltimaLetraSubmenu(pantalla) {
    const pantallaData = this.pantallas.find(p => p.pantalla === pantalla);
    if (!pantallaData) return 'A';
    
    const cantidadPreguntas = pantallaData.preguntas_ejemplo.length;
    if (cantidadPreguntas === 0) return 'A';
    
    return String.fromCharCode(65 + cantidadPreguntas - 1); // A=0, B=1, etc.
  }

  // Función para eliminar duplicados
  eliminarDuplicados(resultados) {
    const unicos = [];
    const vistos = new Set();
    
    for (const resultado of resultados) {
      const clave = `${resultado.pantalla}-${resultado.pregunta}`;
      if (!vistos.has(clave)) {
        vistos.add(clave);
        unicos.push(resultado);
      }
    }
    
    return unicos;
  }

  // Función para ordenar por relevancia
  ordenarPorRelevancia(resultados, consulta) {
    return resultados.sort((a, b) => {
      const scoreA = this.calcularScore(a, consulta);
      const scoreB = this.calcularScore(b, consulta);
      return scoreB - scoreA;
    });
  }

  // Función para calcular score de relevancia
  calcularScore(resultado, consulta) {
    let score = 0;
    const lowerConsulta = consulta.toLowerCase();
    
    // Coincidencia exacta en pregunta
    if (resultado.pregunta.toLowerCase().includes(lowerConsulta)) score += 10;
    
    // Coincidencia en pantalla
    if (resultado.pantalla.toLowerCase().includes(lowerConsulta)) score += 8;
    
    // Coincidencia en funcionalidad
    if (resultado.funcionalidad.toLowerCase().includes(lowerConsulta)) score += 6;
    
    // Coincidencia en respuesta
    if (resultado.respuesta.toLowerCase().includes(lowerConsulta)) score += 4;
    
    // Coincidencia parcial
    const palabrasConsulta = lowerConsulta.split(' ').filter(p => p.length > 2);
    palabrasConsulta.forEach(palabra => {
      if (resultado.pregunta.toLowerCase().includes(palabra)) score += 3;
      if (resultado.pantalla.toLowerCase().includes(palabra)) score += 2;
      if (resultado.funcionalidad.toLowerCase().includes(palabra)) score += 1;
    });
    
    return score;
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
