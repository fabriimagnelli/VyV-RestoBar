import { GoogleGenAI } from '@google/genai';
import { bookingToolDeclarations } from './tools.js';
import { TelemetryCollector } from './telemetry.js';
import { TechnicalReporter } from './reporter.js';
import { performance } from 'perf_hooks';

/**
 * Instrucciones de Sistema para el Agente Autónomo de Pruebas de Estrés y Concurrencia
 */
const SYSTEM_INSTRUCTION = `
Eres un Agente Autónomo de Testing de Caos, Estrés y Concurrencia especializado en sistemas de reserva y gestión de turnos (booking & appointment scheduling APIs).

Tu misión es auditar, forzar al límite y buscar vulnerabilidades de integridad, cuellos de botella de latencia y condiciones de carrera (Race Conditions / Overbooking) en los endpoints del sistema.
No requieres intervención humana: tú decides dinámicamente qué llamadas hacer según los resultados obtenidos.

DEBES SEGUIR ESTE PLAN DE PRUEBAS ESTRATÉGICO Y AGRESIVO:
1. RECONOCIMIENTO INICIAL:
   - Consulta disponibilidad y agenda diaria para una fecha de prueba (ej: 2026-10-25) y profesional (ej: 'prof_101', 'prof_102').
   - Identifica slots horarios disponibles (ej: '09:00', '10:00', '11:00').

2. RESERVAS MASIVAS:
   - Emite reservas de turnos en slots consecutivos para llenar parte de la agenda con clientes ficticios.

3. PRUEBA DE CONDICIÓN DE CARRERA (OVERBOOKING RACE CONDITION):
   - ¡VITAL! Intenta reservar EXACTAMENTE el mismo horario y profesional dos veces con diferentes clientes (ej: Cliente A y Cliente B para el día 2026-10-25 a las 11:00 con prof_101).
   - Observa si la API rechaza adecuadamente la segunda reserva con un error HTTP 409 Conflict, o si falla permitiendo una colisión de doble turno (Overbooking).

4. PRUEBA DE SOLAPAMIENTO EN REPROGRAMACIÓN:
   - Toma uno de los turnos ya confirmados e intenta reprogramarlo hacia un slot que YA ESTÁ OCUPADO por otro cliente.
   - Verifica si la API valida el solapamiento o si sobreescribe el horario indebidamente.

5. CICLO DE CANCELACIÓN Y RECUPERACIÓN INMEDIATA:
   - Cancela uno de los turnos previamente creados indicando un motivo.
   - Consulta INMEDIATAMENTE la disponibilidad del profesional en esa fecha para verificar si el slot cancelado vuelve a figurar como libre.

6. CIERRE DE JORNADA Y AUDITORÍA DE CONSISTENCIA:
   - Ejecuta 'cierre_jornada' para la fecha de prueba.
   - Consulta 'obtener_agenda_diaria' y coteja si el total de turnos (atendidos, cancelados, pendientes) cuadra perfectamente con las operaciones ejecutadas.

7. CONCLUSIÓN Y DIAGNÓSTICO FINAL:
   - Cuando hayas completado las fases y tengas suficiente evidencia empírica, NO emitas más function calls.
   - Responde con un resumen diagnóstico técnico en texto indicando si encontraste: overbooking, fallos de solapamiento, discrepancias en el cierre, o latencias anómalas.
`;

export class AutonomousTestRunner {
  constructor(config) {
    this.config = config;
    this.telemetry = new TelemetryCollector(config.apiBaseUrl, config.apiTimeoutMs);
    this.ai = new GoogleGenAI({ apiKey: config.geminiApiKey });
  }

  /**
   * Ejecuta el ciclo autónomo de pruebas
   */
  async run() {
    console.log('\n🚀 Iniciando Agente Autónomo de Testing de Turnos...');
    console.log(`📡 URL Objetivo: ${this.config.apiBaseUrl}`);
    console.log(`🤖 Modelo Base: ${this.config.geminiModel}`);
    console.log(`🔄 Límite de Seguridad: ${this.config.maxIterations} iteraciones máximas\n`);

    const overallStartTime = performance.now();
    let activeModel = this.config.geminiModel;

    // Historial de conversación multi-turn
    const contents = [
      {
        role: 'user',
        parts: [
          {
            text: `Inicia la batería de pruebas de estrés, concurrencia y límites en la API de turnos para la fecha 2026-10-25 con el profesional 'prof_101' y servicio 'consulta_general'.
Ejecuta el plan completo: reconocimiento de slots, reservas masivas, forzar colisión de overbooking en el mismo slot horario, reprogramación con solapamiento, cancelación con chequeo de liberación inmediata, y cierre de jornada con conciliación de consistencia.`,
          },
        ],
      },
    ];

    // Llamada inicial al modelo con manejo resiliente de fallback
    let response = await this._callGeminiWithFallback(activeModel, contents);
    activeModel = response.modelUsed;

    let iteration = 0;

    // Bucle autónomo controlado por Function Calling
    while (response.functionCalls && response.functionCalls.length > 0 && iteration < this.config.maxIterations) {
      iteration++;
      const calls = response.functionCalls;

      console.log(`\n--------------------------------------------------------------------------------`);
      console.log(`📍 [Iteración ${iteration}/${this.config.maxIterations}] El modelo solicitó ${calls.length} llamada(s) a función:`);

      // Ejecución en paralelo o ráfaga de las funciones emitidas en este turno
      const toolPromises = calls.map(async (call) => {
        console.log(`   ⚡ Ejecutando: ${call.name}(${JSON.stringify(call.args)})`);
        const result = await this.telemetry.executeTool(call.name, call.args);
        const icon = result.success ? '✅' : (result.status === 409 ? '🛡️ [409 Conflict]' : '⚠️');
        console.log(`      ${icon} Status: ${result.status} | Latencia: ${result.latency_ms}ms`);
        return { call, result };
      });

      const executed = await Promise.all(toolPromises);

      // 1. Guardar la respuesta del modelo en el historial
      contents.push(response.candidates[0].content);

      // 2. Formatear y adjuntar las respuestas de cada función ejecutada
      const functionResponseParts = executed.map(({ call, result }) => ({
        functionResponse: {
          id: call.id,
          name: call.name,
          response: {
            success: result.success,
            status: result.status,
            latency_ms: result.latency_ms,
            data: result.data,
            error: result.error,
          },
        },
      }));

      contents.push({
        role: 'user',
        parts: functionResponseParts,
      });

      // Solicitar el siguiente turno al modelo
      try {
        response = await this._callGeminiWithFallback(activeModel, contents);
      } catch (err) {
        console.error(`🚨 Error al invocar el modelo Gemini en la iteración ${iteration}: ${err.message}`);
        break;
      }
    }

    const overallEndTime = performance.now();
    const durationSeconds = (overallEndTime - overallStartTime) / 1000;

    console.log(`\n🏁 Bucle autónomo finalizado tras ${iteration} iteraciones.`);

    // Obtener análisis y resumen final del modelo
    const modelFinalText = response?.text || '';

    // Compilar resumen métrico de telemetría
    const metricsSummary = this.telemetry.getMetricsSummary();

    // Imprimir y generar reporte técnico
    TechnicalReporter.printAndSaveReport({
      telemetrySummary: metricsSummary,
      modelAnalysis: modelFinalText,
      durationSeconds,
      modelName: activeModel,
      baseUrl: this.config.apiBaseUrl,
      outputPath: this.config.reportFilePath,
    });

    return {
      durationSeconds,
      iterations: iteration,
      metricsSummary,
      modelAnalysis: modelFinalText,
    };
  }

  /**
   * Intenta llamar a Gemini con el modelo preferido y realiza fallback automático si el modelo fue depreciado o no está disponible
   */
  async _callGeminiWithFallback(preferredModel, contents) {
    const candidateModels = [
      preferredModel,
      ...this.config.geminiFallbackModels.filter((m) => m !== preferredModel),
    ];

    let lastError = null;

    for (const model of candidateModels) {
      // Intentar hasta 3 veces por modelo si hay un pico de demanda temporal (503)
      for (let attempt = 1; attempt <= 3; attempt++) {
        try {
          const res = await this.ai.models.generateContent({
            model,
            contents,
            config: {
              systemInstruction: SYSTEM_INSTRUCTION,
              tools: [{ functionDeclarations: bookingToolDeclarations }],
              temperature: this.config.temperature,
            },
          });
          res.modelUsed = model;
          return res;
        } catch (err) {
          lastError = err;
          const msg = err.message || '';

          // Si el modelo está deprecado/404, no tiene sentido reintentar con el mismo modelo
          if (msg.includes('no longer available') || msg.includes('404')) {
            console.warn(`⚠️ Modelo ${model} no disponible (404/deprecado). Saltando a siguiente modelo...`);
            break;
          }

          // Si es 503 o 429, reintentamos con backoff exponencial
          if (msg.includes('503') || msg.includes('429') || msg.includes('high demand') || msg.includes('RESOURCE_EXHAUSTED')) {
            if (attempt < 3) {
              const delayMs = attempt * 1800;
              console.warn(`⏳ [Intento ${attempt}/3] ${model} experimenta alta demanda. Reintentando en ${delayMs}ms...`);
              await new Promise((r) => setTimeout(r, delayMs));
              continue;
            } else {
              console.warn(`⚠️ ${model} no respondió tras 3 intentos. Probando modelo alternativo...`);
              break;
            }
          }

          throw err;
        }
      }
    }

    throw lastError;
  }
}
