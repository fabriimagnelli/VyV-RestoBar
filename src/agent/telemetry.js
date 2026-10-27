import axios from 'axios';
import { performance } from 'perf_hooks';

/**
 * Colector de telemetría y wrapper de ejecución para la API de gestión de turnos.
 * Mide latencias exactas, captura respuestas/errores HTTP (400, 404, 409, 500)
 * y audita activamente anomalías de concurrencia e integridad (overbooking, solapamiento, etc.).
 */
export class TelemetryCollector {
  constructor(baseUrl, timeoutMs = 8000) {
    this.baseUrl = baseUrl.replace(/\/+$/, '');
    this.timeoutMs = timeoutMs;
    this.records = [];
    this.activeReservations = new Map(); // key: turno_id -> { id, profesional_id, fecha, hora, cliente, estado }
    this.slotAllocations = new Map();    // key: "profesional_id|fecha|hora" -> Array of turno_ids
    this.concurrencyBugs = [];           // Array of detected concurrency/integrity violations
    this.unhandled500Errors = [];        // Array of 500 server errors
  }

  /**
   * Ejecuta una herramienta de API con medición de telemetría y captura resiliente de errores.
   * @param {string} toolName Nombre de la función invocada por el modelo
   * @param {object} args Argumentos provistos por Function Calling
   * @returns {Promise<object>} Objeto estructurado para el modelo con telemetría
   */
  async executeTool(toolName, args) {
    const startTime = performance.now();
    let status = 0;
    let success = false;
    let data = null;
    let errorDetails = null;
    let method = 'GET';
    let path = '';

    try {
      const callResult = await this._dispatchHttp(toolName, args);
      status = callResult.status;
      data = callResult.data;
      method = callResult.method;
      path = callResult.path;
      success = status >= 200 && status < 300;
    } catch (err) {
      if (err.response) {
        status = err.response.status;
        data = err.response.data;
        errorDetails = {
          status,
          statusText: err.response.statusText,
          message: typeof data === 'object' && data?.error ? data.error : (data?.message || err.message),
          serverData: data,
        };
      } else {
        status = 0; // Error de red / timeout / ECONNREFUSED
        errorDetails = {
          status: 0,
          statusText: 'NETWORK_OR_TIMEOUT',
          message: err.message,
          code: err.code,
        };
      }
      method = err.config?.method?.toUpperCase() || method;
      path = err.config?.url || path;
      success = false;
    }

    const endTime = performance.now();
    const latency_ms = parseFloat((endTime - startTime).toFixed(2));

    // Registro de telemetría
    const record = {
      id: `tel_${this.records.length + 1}`,
      timestamp: new Date().toISOString(),
      endpoint: toolName,
      method,
      path,
      args,
      status,
      latency_ms,
      success,
      data,
      error: errorDetails,
    };

    this.records.push(record);

    // Auditoría de integridad y concurrencia post-ejecución
    this._auditState(toolName, args, record);

    // Retorno amigable estructurado para el modelo LLM
    return {
      success,
      status,
      latency_ms,
      data: success ? data : null,
      error: errorDetails ? errorDetails.message : null,
      server_response: data,
    };
  }

  /**
   * Mapeo y despacho de llamadas HTTP contra los endpoints del sistema de turnos
   */
  async _dispatchHttp(toolName, args) {
    const client = axios.create({
      baseURL: this.baseUrl,
      timeout: this.timeoutMs,
      headers: {
        'Content-Type': 'application/json',
        'X-Testing-Agent': 'Antigravity-QA-StressRunner/1.0',
      },
    });

    switch (toolName) {
      case 'consultar_disponibilidad': {
        const path = '/disponibilidad';
        const res = await client.get(path, {
          params: {
            fecha: args.fecha,
            profesional_id: args.profesional_id,
            servicio_id: args.servicio_id,
          },
        });
        return { status: res.status, data: res.data, method: 'GET', path };
      }

      case 'reservar_turno': {
        const path = '/reservar';
        const res = await client.post(path, {
          fecha: args.fecha,
          hora: args.hora,
          cliente: args.cliente,
          profesional_id: args.profesional_id,
          servicio_id: args.servicio_id,
        });
        return { status: res.status, data: res.data, method: 'POST', path };
      }

      case 'reprogramar_turno': {
        // Soporta /reprogramar o /turnos/:id/reprogramar
        const path = '/reprogramar';
        const res = await client.post(path, {
          turno_id: args.turno_id,
          nueva_fecha: args.nueva_fecha,
          nueva_hora: args.nueva_hora,
        });
        return { status: res.status, data: res.data, method: 'POST', path };
      }

      case 'cancelar_turno': {
        const path = '/cancelar';
        const res = await client.post(path, {
          turno_id: args.turno_id,
          motivo: args.motivo,
        });
        return { status: res.status, data: res.data, method: 'POST', path };
      }

      case 'obtener_agenda_diaria': {
        const path = '/agenda';
        const res = await client.get(path, {
          params: {
            fecha: args.fecha,
            profesional_id: args.profesional_id,
          },
        });
        return { status: res.status, data: res.data, method: 'GET', path };
      }

      case 'cierre_jornada': {
        const path = '/cierre-jornada';
        const res = await client.post(path, {
          fecha: args.fecha,
        });
        return { status: res.status, data: res.data, method: 'POST', path };
      }

      default:
        throw new Error(`Herramienta no implementada en el despachador: ${toolName}`);
    }
  }

  /**
   * Auditoría en tiempo real para detectar colisiones de concurrencia y anomalías
   */
  _auditState(toolName, args, record) {
    // 1. Detección de errores 500 no controlados
    if (record.status >= 500) {
      this.unhandled500Errors.push({
        id: record.id,
        endpoint: toolName,
        status: record.status,
        timestamp: record.timestamp,
        latency_ms: record.latency_ms,
        args,
        error: record.error,
        server_response: record.data,
      });
    }

    // 2. Detección de Overbooking (Doble reserva del mismo slot horario)
    if (toolName === 'reservar_turno' && record.success) {
      const turnoId = record.data?.turno?.id || record.data?.turno_id || record.data?.id || `turno_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
      const slotKey = `${args.profesional_id}|${args.fecha}|${args.hora}`;

      const existingSlotAllocations = this.slotAllocations.get(slotKey) || [];
      existingSlotAllocations.push({
        turnoId,
        cliente: args.cliente,
        recordId: record.id,
        timestamp: record.timestamp,
      });
      this.slotAllocations.set(slotKey, existingSlotAllocations);

      this.activeReservations.set(turnoId, {
        id: turnoId,
        profesional_id: args.profesional_id,
        fecha: args.fecha,
        hora: args.hora,
        cliente: args.cliente,
        servicio_id: args.servicio_id,
        estado: 'CONFIRMADO',
      });

      // Si hay más de una reserva confirmada para exactamente el mismo slot -> ¡OVERBOOKING / RACE CONDITION!
      if (existingSlotAllocations.length > 1) {
        this.concurrencyBugs.push({
          type: 'CRITICAL_OVERBOOKING_RACE_CONDITION',
          severity: 'ALTA',
          description: `Se detectó doble asignación del mismo slot horario (${args.fecha} a las ${args.hora} con profesional ${args.profesional_id}).`,
          slot: {
            profesional_id: args.profesional_id,
            fecha: args.fecha,
            hora: args.hora,
          },
          turnos_colisionados: existingSlotAllocations.map(a => a.turnoId),
          detalle: `El sistema confirmó ${existingSlotAllocations.length} reservas simultáneas sin rechazar con 409 Conflict ni bloquear la fila.`,
        });
      }
    }

    // 3. Detección de solapamiento en reprogramación
    if (toolName === 'reprogramar_turno' && record.success) {
      const turnoId = args.turno_id;
      const targetSlotKey = `${args.nueva_fecha}|${args.nueva_hora}`;
      
      // Verificar si el slot destino ya estaba ocupado por OTRA reserva activa
      let collidingTurno = null;
      for (const [id, res] of this.activeReservations.entries()) {
        if (id !== turnoId && res.estado === 'CONFIRMADO' && `${res.fecha}|${res.hora}` === targetSlotKey) {
          collidingTurno = res;
          break;
        }
      }

      if (collidingTurno) {
        this.concurrencyBugs.push({
          type: 'OVERLAP_ON_RESCHEDULE',
          severity: 'ALTA',
          description: `Se permitió reprogramar el turno ${turnoId} hacia un slot ya ocupado (${args.nueva_fecha} ${args.nueva_hora}) por el turno ${collidingTurno.id}.`,
          slot: {
            fecha: args.nueva_fecha,
            hora: args.nueva_hora,
          },
          turno_reprogramado: turnoId,
          turno_existente: collidingTurno.id,
        });
      }

      // Actualizar registro interno
      const current = this.activeReservations.get(turnoId);
      if (current) {
        current.fecha = args.nueva_fecha;
        current.hora = args.nueva_hora;
        current.estado = 'REPROGRAMADO';
      }
    }

    // 4. Auditoría de cancelación y liberación de cupo
    if (toolName === 'cancelar_turno' && record.success) {
      const turnoId = args.turno_id;
      const current = this.activeReservations.get(turnoId);
      if (current) {
        current.estado = 'CANCELADO';
        // Quitar de asignaciones activas de slot
        const slotKey = `${current.profesional_id}|${current.fecha}|${current.hora}`;
        const allocs = this.slotAllocations.get(slotKey) || [];
        this.slotAllocations.set(slotKey, allocs.filter(a => a.turnoId !== turnoId));
      }
    }
  }

  /**
   * Genera estadísticas consolidadas de latencia y estado por endpoint
   */
  getMetricsSummary() {
    const summary = {};

    for (const rec of this.records) {
      if (!summary[rec.endpoint]) {
        summary[rec.endpoint] = {
          endpoint: rec.endpoint,
          total_calls: 0,
          success_count: 0,
          error_count: 0,
          status_codes: {},
          latencies: [],
        };
      }

      const item = summary[rec.endpoint];
      item.total_calls++;
      if (rec.success) {
        item.success_count++;
      } else {
        item.error_count++;
      }

      const st = rec.status || 'ERROR_RED';
      item.status_codes[st] = (item.status_codes[st] || 0) + 1;
      item.latencies.push(rec.latency_ms);
    }

    // Calcular min, max, avg, p95 por endpoint
    const endpointMetrics = Object.values(summary).map(item => {
      const sorted = [...item.latencies].sort((a, b) => a - b);
      const min = sorted.length > 0 ? sorted[0] : 0;
      const max = sorted.length > 0 ? sorted[sorted.length - 1] : 0;
      const sum = sorted.reduce((acc, val) => acc + val, 0);
      const avg = sorted.length > 0 ? parseFloat((sum / sorted.length).toFixed(2)) : 0;
      const p95Index = Math.floor(sorted.length * 0.95);
      const p95 = sorted.length > 0 ? sorted[Math.min(p95Index, sorted.length - 1)] : 0;

      return {
        endpoint: item.endpoint,
        total_calls: item.total_calls,
        success_count: item.success_count,
        error_count: item.error_count,
        success_rate_pct: parseFloat(((item.success_count / item.total_calls) * 100).toFixed(1)),
        min_latency_ms: min,
        avg_latency_ms: avg,
        max_latency_ms: max,
        p95_latency_ms: p95,
        status_codes: item.status_codes,
      };
    });

    return {
      total_requests: this.records.length,
      unhandled_500_count: this.unhandled500Errors.length,
      concurrency_bug_count: this.concurrencyBugs.length,
      endpoint_metrics: endpointMetrics,
      concurrency_bugs: this.concurrencyBugs,
      unhandled_500_errors: this.unhandled500Errors,
    };
  }
}
