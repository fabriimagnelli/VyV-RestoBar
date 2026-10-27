import fs from 'fs';

/**
 * Generador de Reporte Técnico Final
 * Produce un resumen visual en la consola y genera un artefacto Markdown
 * con métricas de latencia, fallos de concurrencia, errores 500 y recomendaciones SQL/DB.
 */
export class TechnicalReporter {
  /**
   * Imprime en consola y guarda en disco el reporte técnico completo
   */
  static printAndSaveReport({
    telemetrySummary,
    modelAnalysis,
    durationSeconds,
    modelName,
    baseUrl,
    outputPath = './reporte_pruebas_turnos.md',
  }) {
    const divider = '='.repeat(80);
    const subDivider = '-'.repeat(80);

    console.log('\n' + divider);
    console.log('       REPORTE TÉCNICO DE TESTING AUTÓNOMO & ESTRÉS DE CONCURRENCIA');
    console.log('       Sistema de Gestión de Turnos (Booking / Appointments API)');
    console.log(divider);

    console.log(`\n⏱️  Duración de la prueba: ${durationSeconds.toFixed(2)}s`);
    console.log(`🤖 Agente LLM: ${modelName}`);
    console.log(`🎯 URL Base del Backend: ${baseUrl}`);
    console.log(`📊 Peticiones Totales Ejecutadas: ${telemetrySummary.total_requests}`);
    console.log(`🚨 Errores 500 Detectados: ${telemetrySummary.unhandled_500_count}`);
    console.log(`💥 Fallos de Concurrencia / Integridad: ${telemetrySummary.concurrency_bug_count}`);

    // 1. Tabla de Latencias
    console.log('\n' + subDivider);
    console.log('1. MÉTRICAS DE LATENCIA Y RENDIMIENTO POR ENDPOINT');
    console.log(subDivider);

    const headers = [
      'Endpoint'.padEnd(25),
      'Llamadas'.padStart(9),
      'Éxito %'.padStart(9),
      'Mín(ms)'.padStart(9),
      'Prom(ms)'.padStart(10),
      'Máx(ms)'.padStart(9),
      'P95(ms)'.padStart(9),
    ];
    console.log(headers.join(' | '));
    console.log('-'.repeat(headers.join(' | ').length));

    for (const m of telemetrySummary.endpoint_metrics) {
      const statusBreakdown = Object.entries(m.status_codes)
        .map(([code, count]) => `${code}:${count}`)
        .join(', ');

      const row = [
        m.endpoint.padEnd(25),
        String(m.total_calls).padStart(9),
        `${m.success_rate_pct}%`.padStart(9),
        String(m.min_latency_ms).padStart(9),
        String(m.avg_latency_ms).padStart(10),
        String(m.max_latency_ms).padStart(9),
        String(m.p95_latency_ms).padStart(9),
      ];
      console.log(row.join(' | ') + `  [Status: ${statusBreakdown}]`);
    }

    // 2. Fallos de Concurrencia
    console.log('\n' + subDivider);
    console.log('2. AUDITORÍA DE CONCURRENCIA Y CONDICIONES DE CARRERA');
    console.log(subDivider);

    if (telemetrySummary.concurrency_bugs.length === 0) {
      console.log('✅ No se detectaron colisiones de overbooking ni solapamientos no controlados.');
      console.log('   El backend rechazó colisiones de forma consistente (ej. con HTTP 409 Conflict).');
    } else {
      console.log(`🚨 SE DETECTARON ${telemetrySummary.concurrency_bugs.length} FALLOS CRÍTICOS DE CONCURRENCIA:`);
      telemetrySummary.concurrency_bugs.forEach((bug, idx) => {
        console.log(`\n   [Fallo #${idx + 1}] Tipo: ${bug.type} | Severidad: ${bug.severity}`);
        console.log(`   - Descripción: ${bug.description}`);
        if (bug.slot) console.log(`   - Slot Afectado: ${JSON.stringify(bug.slot)}`);
        if (bug.turnos_colisionados) console.log(`   - Turnos Colisionados: ${bug.turnos_colisionados.join(', ')}`);
        if (bug.detalle) console.log(`   - Detalle Técnico: ${bug.detalle}`);
      });
    }

    // 3. Errores 500 no controlados
    console.log('\n' + subDivider);
    console.log('3. ERRORES 500 NO CONTROLADOS (SERVER CRASH / EXCEPTIONS)');
    console.log(subDivider);

    if (telemetrySummary.unhandled_500_errors.length === 0) {
      console.log('✅ Cero errores 500 detectados. El backend gestionó excepciones adecuadamente.');
    } else {
      console.log(`⚠️ Se registraron ${telemetrySummary.unhandled_500_errors.length} respuestas con código HTTP 500+:`);
      telemetrySummary.unhandled_500_errors.forEach((err, idx) => {
        console.log(`   [#${idx + 1}] Endpoint: ${err.endpoint} (Latencia: ${err.latency_ms}ms)`);
        console.log(`       Argumentos: ${JSON.stringify(err.args)}`);
        console.log(`       Error Devuelto: ${JSON.stringify(err.error?.message || err.server_response)}`);
      });
    }

    // 4. Recomendaciones de Base de Datos y Arquitectura
    console.log('\n' + subDivider);
    console.log('4. RECOMENDACIONES DE BASE DE DATOS Y OPTIMIZACIÓN TRANSACCIONAL');
    console.log(subDivider);
    console.log(`
  A. BLOQUEO TRANSACCIONAL PESIMISTA (Prevención de Overbooking):
     - Para reservas concurrentes en motores relacionales (PostgreSQL, MySQL, SQL Server):
       BEGIN;
       SELECT id, estado FROM turnos_slots 
       WHERE profesional_id = $1 AND fecha = $2 AND hora = $3 
       FOR UPDATE; -- Bloquea la fila del slot a nivel de transacción
       
       -- Verificar si está ocupado, sino:
       INSERT INTO reservas (turno_id, profesional_id, fecha, hora, cliente_id, estado)
       VALUES (...);
       COMMIT;

  B. ÍNDICE ÚNICO CONDICIONAL / COMPUESTO (Integridad Estricta en DB):
     - Evita que dos hilos inserten reservas para el mismo horario incluso si falla la aplicación:
       CREATE UNIQUE INDEX uq_turnos_slot_activo 
       ON reservas (profesional_id, fecha, hora) 
       WHERE estado NOT IN ('CANCELADO');

  C. CONTROL DE CONCURRENCIA OPTIMISTA (Reprogramaciones y Cancelaciones):
     - Agregar columna 'version' (INTEGER DEFAULT 1):
       UPDATE reservas 
       SET fecha = $1, hora = $2, version = version + 1 
       WHERE id = $3 AND version = $current_version;
       -- Si rowsAffected == 0, lanzar 409 Conflict (el turno fue modificado en simultáneo).

  D. DISTRIBUTED LOCKS (Sistemas Distribuidos / Microservicios):
     - Utilizar Redis con Redlock o SETNX key: "lock:slot:{profesional_id}:{fecha}:{hora}" con TTL (ej: 3000ms).
`);

    // 5. Diagnóstico del Agente Autónomo
    if (modelAnalysis) {
      console.log('\n' + subDivider);
      console.log('5. ANÁLISIS Y CONCLUSIONES DEL AGENTE AUTÓNOMO (LLM)');
      console.log(subDivider);
      console.log(modelAnalysis.trim());
    }

    console.log('\n' + divider + '\n');

    // Generar archivo Markdown
    this._writeMarkdownFile({
      telemetrySummary,
      modelAnalysis,
      durationSeconds,
      modelName,
      baseUrl,
      outputPath,
    });
  }

  /**
   * Genera el archivo Markdown formal
   */
  static _writeMarkdownFile({
    telemetrySummary,
    modelAnalysis,
    durationSeconds,
    modelName,
    baseUrl,
    outputPath,
  }) {
    let md = `# Reporte Técnico: Pruebas de Estrés y Concurrencia en Sistema de Turnos

> **Fecha y Hora:** ${new Date().toISOString()}  
> **Motor LLM:** \`${modelName}\`  
> **API Objetivo:** \`${baseUrl}\`  
> **Duración de la Simulación:** ${durationSeconds.toFixed(2)} segundos  

---

## 1. Resumen Ejecutivo de Telemetría

| Métrica | Valor |
| :--- | :--- |
| **Total de Peticiones** | \`${telemetrySummary.total_requests}\` |
| **Fallos de Concurrencia (Overbooking)** | \`${telemetrySummary.concurrency_bug_count}\` |
| **Errores 500 no controlados** | \`${telemetrySummary.unhandled_500_count}\` |

---

## 2. Latencias y Desempeño por Endpoint

| Endpoint | Invocaciones | Tasa Éxito | Mín (ms) | Prom (ms) | Máx (ms) | P95 (ms) | Códigos HTTP |
| :--- | :---: | :---: | :---: | :---: | :---: | :---: | :--- |
`;

    for (const m of telemetrySummary.endpoint_metrics) {
      const statusBreakdown = Object.entries(m.status_codes)
        .map(([code, count]) => `\`${code}\`: ${count}`)
        .join(', ');

      md += `| \`${m.endpoint}\` | ${m.total_calls} | ${m.success_rate_pct}% | ${m.min_latency_ms} | ${m.avg_latency_ms} | ${m.max_latency_ms} | ${m.p95_latency_ms} | ${statusBreakdown} |\n`;
    }

    md += `\n---

## 3. Auditoría de Concurrencia y Condiciones de Carrera

`;

    if (telemetrySummary.concurrency_bugs.length === 0) {
      md += `✅ **Sin incidentes de concurrencia detectados.** El sistema gestionó adecuadamente la exclusión mutua de slots con códigos \`409 Conflict\`.\n`;
    } else {
      md += `🚨 **Se detectaron ${telemetrySummary.concurrency_bugs.length} fallos críticos de integridad:**\n\n`;
      telemetrySummary.concurrency_bugs.forEach((bug, idx) => {
        md += `### Caso #${idx + 1}: ${bug.type} (Severidad: ${bug.severity})\n`;
        md += `- **Descripción:** ${bug.description}\n`;
        if (bug.slot) md += `- **Slot:** \`${JSON.stringify(bug.slot)}\`\n`;
        if (bug.turnos_colisionados) md += `- **Turnos Colisionados:** \`${bug.turnos_colisionados.join(', ')}\`\n`;
        if (bug.detalle) md += `- **Detalle:** ${bug.detalle}\n\n`;
      });
    }

    md += `\n---

## 4. Errores 500 No Controlados

`;

    if (telemetrySummary.unhandled_500_errors.length === 0) {
      md += `✅ **Cero errores internos (500) registrados.**\n`;
    } else {
      md += `| # | Endpoint | Latencia | Argumentos | Detalle del Error |\n| :---: | :--- | :---: | :--- | :--- |\n`;
      telemetrySummary.unhandled_500_errors.forEach((err, idx) => {
        md += `| ${idx + 1} | \`${err.endpoint}\` | ${err.latency_ms}ms | \`${JSON.stringify(err.args)}\` | \`${JSON.stringify(err.error?.message || err.server_response)}\` |\n`;
      });
    }

    md += `\n---

## 5. Recomendaciones de Optimización de Base de Datos

\`\`\`sql
-- 1. Índice único condicional para evitar overbooking a nivel de motor DB:
CREATE UNIQUE INDEX uq_turnos_slot_activo 
ON reservas (profesional_id, fecha, hora) 
WHERE estado NOT IN ('CANCELADO');

-- 2. Bloqueo pesimista en la transacción de reserva:
BEGIN;
SELECT id, estado FROM turnos_slots 
WHERE profesional_id = $1 AND fecha = $2 AND hora = $3 
FOR UPDATE;

INSERT INTO reservas (profesional_id, fecha, hora, cliente_id, estado)
VALUES ($1, $2, $3, $4, 'CONFIRMADO');
COMMIT;

-- 3. Control optimista de concurrencia para reprogramación:
UPDATE reservas 
SET fecha = $1, hora = $2, version = version + 1 
WHERE id = $3 AND version = $current_version;
\`\`\`

---

## 6. Dictamen del Agente Autónomo

${modelAnalysis || '_El agente completó la serie de pruebas sin emitir texto adicional._'}
`;

    try {
      fs.writeFileSync(outputPath, md, 'utf-8');
      console.log(`📄 Reporte Markdown guardado exitosamente en: ${outputPath}`);
    } catch (err) {
      console.error(`⚠️ No se pudo guardar el archivo Markdown: ${err.message}`);
    }
  }
}
