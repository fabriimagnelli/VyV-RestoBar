#!/usr/bin/env node

import { config } from './config.js';
import { AutonomousTestRunner } from './runner.js';
import { MockBookingServer } from '../mock-server/server.js';
import http from 'http';

/**
 * Punto de entrada principal para el Agente Autónomo de Pruebas de Estrés y Concurrencia
 */
async function main() {
  console.log(`
================================================================================
  AGENTE AUTÓNOMO DE TESTING & ESTRÉS DE CONCURRENCIA PARA GESTIÓN DE TURNOS
  Motor: Google Gen AI (@google/genai) | Telemetría: Axios
================================================================================
`);

  // 1. Verificación de API Key de Gemini
  if (!config.geminiApiKey) {
    console.error(`❌ ERROR: No se encontró la variable de entorno GEMINI_API_KEY.`);
    console.error(`   Por favor configúrala en tu archivo .env o en el entorno:`);
    console.error(`   export GEMINI_API_KEY="tu_api_key_de_gemini"`);
    console.error(`   o crea un archivo .env con: GEMINI_API_KEY=tu_clave`);
    process.exit(1);
  }

  // 2. Detección de servidor mock o flags
  const args = process.argv.slice(2);
  const forceMock = args.includes('--mock') || process.env.USE_MOCK_SERVER === 'true';
  let mockServerInstance = null;

  // Chequear si el backend de destino está disponible o si debemos iniciar el mock server
  const isTargetReachable = await checkEndpointReachable(config.apiBaseUrl);

  if (!isTargetReachable) {
    if (config.apiBaseUrl.includes('localhost') || config.apiBaseUrl.includes('127.0.0.1') || forceMock) {
      console.log(`ℹ️  Backend objetivo (${config.apiBaseUrl}) no está respondiendo.`);
      console.log(`🚀 Iniciando Mock Booking Server integrado en puerto ${config.mockPort}...`);
      
      const simulateVulnerability = !args.includes('--secure');
      mockServerInstance = new MockBookingServer({
        port: config.mockPort,
        simulateVulnerability,
      });
      await mockServerInstance.start();
    } else {
      console.warn(`⚠️ ADVERTENCIA: No se pudo contactar a ${config.apiBaseUrl}. El agente intentará continuar.`);
    }
  } else if (forceMock) {
    console.log(`ℹ️  Flag --mock especificado, pero ya hay un servidor respondiendo en ${config.apiBaseUrl}.`);
  }

  // 3. Ejecutar el Agente Autónomo
  try {
    const runner = new AutonomousTestRunner(config);
    await runner.run();
  } catch (err) {
    console.error(`\n🚨 Error crítico durante la ejecución del agente:`, err);
  } finally {
    if (mockServerInstance) {
      console.log(`🛑 Deteniendo Mock Booking Server...`);
      await mockServerInstance.stop();
    }
  }
}

/**
 * Comprueba si la URL del backend responde a un sondeo básico
 */
function checkEndpointReachable(targetUrl) {
  return new Promise((resolve) => {
    try {
      const parsed = new URL(targetUrl);
      const req = http.request(
        {
          hostname: parsed.hostname,
          port: parsed.port || 80,
          path: parsed.pathname + '/health',
          method: 'GET',
          timeout: 1000,
        },
        (res) => {
          resolve(res.statusCode < 500);
        }
      );
      req.on('error', () => resolve(false));
      req.on('timeout', () => {
        req.destroy();
        resolve(false);
      });
      req.end();
    } catch {
      resolve(false);
    }
  });
}

main().catch((err) => {
  console.error('Fatal:', err);
  process.exit(1);
});
