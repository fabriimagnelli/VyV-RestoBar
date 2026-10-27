import dotenv from 'dotenv';
dotenv.config();

export const config = {
  // Gemini API Configuration
  geminiApiKey: process.env.GEMINI_API_KEY || '',
  geminiModel: process.env.GEMINI_MODEL || 'gemini-2.5-flash',
  geminiFallbackModels: [
    'gemini-3.5-flash',
    'gemini-3.7-flash',
    'gemini-3.8-flash',
    'gemini-3.5-flash-lite',
    'gemini-flash-latest',
  ],

  // Target Booking API Configuration
  apiBaseUrl: (process.env.API_BASE_URL || 'http://localhost:3001/api').replace(/\/+$/, ''),
  apiTimeoutMs: parseInt(process.env.API_TIMEOUT_MS || '8000', 10),

  // Autonomous Test Runner Limits
  maxIterations: Math.min(Math.max(parseInt(process.env.MAX_ITERATIONS || '40', 10), 30), 50),
  temperature: parseFloat(process.env.AGENT_TEMPERATURE || '0.15'),

  // Mock server default port if auto-spawned
  mockPort: parseInt(process.env.MOCK_PORT || '3001', 10),

  // File paths
  reportFilePath: process.env.REPORT_FILE_PATH || './reporte_pruebas_turnos.md',
};
