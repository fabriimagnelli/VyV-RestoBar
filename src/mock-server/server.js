import http from 'http';
import url from 'url';

/**
 * Servidor Mock de Sistema de Turnos y Reservas
 * Implementa los endpoints solicitados con simulación de latencias reales y
 * soporte para simular condiciones de carrera (Overbooking / Race Conditions)
 * cuando dos hilos intentan reservar el mismo slot simultáneamente sin transacción aislada.
 */
export class MockBookingServer {
  constructor(options = {}) {
    this.port = options.port || 3001;
    this.simulateRaceConditionVulnerability = options.simulateVulnerability !== false;
    this.baseLatencyMs = options.baseLatencyMs || 25;

    // Base de datos en memoria
    this.slots = [
      '09:00', '09:30', '10:00', '10:30', '11:00', '11:30',
      '14:00', '14:30', '15:00', '15:30', '16:00', '16:30'
    ];

    // Mapa de reservas: turno_id -> { id, profesional_id, fecha, hora, cliente, servicio_id, estado, creado_en }
    this.reservations = new Map();
    this.counter = 1000;
    this.server = null;
  }

  start() {
    return new Promise((resolve, reject) => {
      this.server = http.createServer((req, res) => {
        this._handleRequest(req, res).catch(err => {
          res.writeHead(500, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ error: 'Internal Server Error', message: err.message }));
        });
      });

      this.server.listen(this.port, () => {
        console.log(`🏥 [Mock Booking Server] Escuchando en http://localhost:${this.port}/api`);
        console.log(`   Modo Vulnerabilidad Concurrencia: ${this.simulateRaceConditionVulnerability ? '🔴 ACTIVA (permite detectar Overbooking en ráfagas)' : '🟢 PROTEGIDA'}`);
        resolve(this.port);
      });

      this.server.on('error', reject);
    });
  }

  stop() {
    return new Promise((resolve) => {
      if (this.server) {
        this.server.close(() => resolve());
      } else {
        resolve();
      }
    });
  }

  async _handleRequest(req, res) {
    const parsedUrl = url.parse(req.url, true);
    const pathname = parsedUrl.pathname.replace(/\/+$/, '');
    const method = req.method.toUpperCase();

    // CORS Headers
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, X-Testing-Agent');

    if (method === 'OPTIONS') {
      res.writeHead(204);
      res.end();
      return;
    }

    // Parse Body para POST / PUT
    let body = {};
    if (['POST', 'PUT', 'PATCH'].includes(method)) {
      body = await this._parseJsonBody(req);
    }

    // Simulación de latencia de red / I/O de base de datos (20 - 60ms)
    const jitter = Math.floor(Math.random() * 35);
    await new Promise(r => setTimeout(r, this.baseLatencyMs + jitter));

    // Rutas
    if (pathname === '/api/disponibilidad' && method === 'GET') {
      return this._handleDisponibilidad(parsedUrl.query, res);
    }

    if (pathname === '/api/reservar' && method === 'POST') {
      return this._handleReservar(body, res);
    }

    if (pathname === '/api/reprogramar' && method === 'POST') {
      return this._handleReprogramar(body, res);
    }

    if (pathname === '/api/cancelar' && method === 'POST') {
      return this._handleCancelar(body, res);
    }

    if (pathname === '/api/agenda' && method === 'GET') {
      return this._handleAgenda(parsedUrl.query, res);
    }

    if (pathname === '/api/cierre-jornada' && method === 'POST') {
      return this._handleCierreJornada(body, res);
    }

    if (pathname === '/health' || pathname === '/api/health') {
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ status: 'ok', server: 'MockBookingServer/1.0' }));
      return;
    }

    // 404 para cualquier ruta no mapeada
    res.writeHead(404, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ error: 'Endpoint no encontrado', path: pathname }));
  }

  // 1. GET /api/disponibilidad
  _handleDisponibilidad(query, res) {
    const { fecha, profesional_id, servicio_id } = query;
    if (!fecha || !profesional_id) {
      res.writeHead(400, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: 'Parámetros requeridos: fecha, profesional_id' }));
      return;
    }

    // Encontrar slots ocupados para este profesional y fecha
    const occupied = new Set();
    for (const r of this.reservations.values()) {
      if (r.profesional_id === profesional_id && r.fecha === fecha && r.estado === 'CONFIRMADO') {
        occupied.add(r.hora);
      }
    }

    const availableSlots = this.slots.filter(s => !occupied.has(s));

    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({
      fecha,
      profesional_id,
      servicio_id: servicio_id || 'general',
      slots_libres: availableSlots,
      slots_ocupados: Array.from(occupied),
      total_libres: availableSlots.length,
    }));
  }

  // 2. POST /api/reservar
  async _handleReservar(body, res) {
    const { fecha, hora, cliente, profesional_id, servicio_id } = body;

    if (!fecha || !hora || !cliente || !profesional_id) {
      res.writeHead(400, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: 'Campos requeridos: fecha, hora, cliente, profesional_id' }));
      return;
    }

    // Verificación preliminar de ocupación
    const isAlreadyBooked = () => {
      for (const r of this.reservations.values()) {
        if (r.profesional_id === profesional_id && r.fecha === fecha && r.hora === hora && r.estado === 'CONFIRMADO') {
          return true;
        }
      }
      return false;
    };

    if (this.simulateRaceConditionVulnerability) {
      // Simula un backend típico con race condition:
      // Hace un SELECT sin lock (SELECT ... WHERE slot = ...), tarda 35ms procesando antes de hacer el INSERT.
      // Si llegan dos peticiones concurrentes, ambas pasan el chequeo y ambas confirman el turno (Overbooking).
      const slotTakenBefore = isAlreadyBooked();
      
      // Delay artificial entre lectura y escritura (sin mutex / FOR UPDATE)
      await new Promise(r => setTimeout(r, 40));

      if (slotTakenBefore && Math.random() < 0.2) {
        // En algunos casos el backend rechaza, pero en otros entra el bug de concurrencia
        res.writeHead(409, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: 'El slot ya se encuentra reservado.', slot: `${fecha} ${hora}` }));
        return;
      }
    } else {
      // Backend debidamente protegido
      if (isAlreadyBooked()) {
        res.writeHead(409, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: 'El slot ya se encuentra reservado.', slot: `${fecha} ${hora}` }));
        return;
      }
    }

    // Crear la reserva
    this.counter++;
    const turnoId = `trn_${this.counter}`;
    const newReservation = {
      id: turnoId,
      profesional_id,
      servicio_id: servicio_id || 'consulta_general',
      fecha,
      hora,
      cliente,
      estado: 'CONFIRMADO',
      creado_en: new Date().toISOString(),
    };

    this.reservations.set(turnoId, newReservation);

    res.writeHead(201, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({
      mensaje: 'Turno reservado exitosamente',
      turno_id: turnoId,
      turno: newReservation,
    }));
  }

  // 3. POST /api/reprogramar
  async _handleReprogramar(body, res) {
    const { turno_id, nueva_fecha, nueva_hora } = body;

    if (!turno_id || !nueva_fecha || !nueva_hora) {
      res.writeHead(400, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: 'Campos requeridos: turno_id, nueva_fecha, nueva_hora' }));
      return;
    }

    const currentTurno = this.reservations.get(turno_id);
    if (!currentTurno) {
      res.writeHead(404, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: `Turno ${turno_id} no encontrado` }));
      return;
    }

    if (currentTurno.estado === 'CANCELADO') {
      res.writeHead(400, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: 'No se puede reprogramar un turno ya cancelado' }));
      return;
    }

    // Verificar si el slot destino está ocupado
    for (const [id, r] of this.reservations.entries()) {
      if (id !== turno_id && r.profesional_id === currentTurno.profesional_id && r.fecha === nueva_fecha && r.hora === nueva_hora && r.estado === 'CONFIRMADO') {
        res.writeHead(409, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({
          error: 'Conflicto de solapamiento: el horario destino ya está ocupado por otro turno.',
          slot: `${nueva_fecha} ${nueva_hora}`,
          turno_ocupante: id,
        }));
        return;
      }
    }

    currentTurno.fecha = nueva_fecha;
    currentTurno.hora = nueva_hora;
    currentTurno.reprogramado_en = new Date().toISOString();

    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({
      mensaje: 'Turno reprogramado exitosamente',
      turno: currentTurno,
    }));
  }

  // 4. POST /api/cancelar
  async _handleCancelar(body, res) {
    const { turno_id, motivo } = body;

    if (!turno_id) {
      res.writeHead(400, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: 'Campo requerido: turno_id' }));
      return;
    }

    const currentTurno = this.reservations.get(turno_id);
    if (!currentTurno) {
      res.writeHead(404, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: `Turno ${turno_id} no encontrado` }));
      return;
    }

    currentTurno.estado = 'CANCELADO';
    currentTurno.motivo_cancelacion = motivo || 'Sin motivo especificado';
    currentTurno.cancelado_en = new Date().toISOString();

    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({
      mensaje: 'Turno cancelado y cupo liberado exitosamente',
      turno_id,
      slot_liberado: `${currentTurno.fecha} ${currentTurno.hora}`,
    }));
  }

  // 5. GET /api/agenda
  _handleAgenda(query, res) {
    const { fecha, profesional_id } = query;

    if (!fecha) {
      res.writeHead(400, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: 'Parámetro requerido: fecha' }));
      return;
    }

    const agenda = [];
    for (const r of this.reservations.values()) {
      if (r.fecha === fecha && (!profesional_id || r.profesional_id === profesional_id)) {
        agenda.push(r);
      }
    }

    // Ordenar por hora
    agenda.sort((a, b) => a.hora.localeCompare(b.hora));

    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({
      fecha,
      profesional_id: profesional_id || 'todos',
      total_turnos: agenda.length,
      turnos_confirmados: agenda.filter(t => t.estado === 'CONFIRMADO').length,
      turnos_cancelados: agenda.filter(t => t.estado === 'CANCELADO').length,
      turnos: agenda,
    }));
  }

  // 6. POST /api/cierre-jornada
  _handleCierreJornada(body, res) {
    const { fecha } = body;

    if (!fecha) {
      res.writeHead(400, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: 'Campo requerido: fecha' }));
      return;
    }

    const turnosDelDia = Array.from(this.reservations.values()).filter(r => r.fecha === fecha);
    const confirmados = turnosDelDia.filter(t => t.estado === 'CONFIRMADO').length;
    const cancelados = turnosDelDia.filter(t => t.estado === 'CANCELADO').length;

    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({
      mensaje: 'Cierre de jornada ejecutado correctamente',
      fecha,
      total_turnos: turnosDelDia.length,
      balance: {
        confirmados,
        cancelados,
        ausentes: 0,
        atendidos: confirmados,
      },
      audit_timestamp: new Date().toISOString(),
    }));
  }

  _parseJsonBody(req) {
    return new Promise((resolve) => {
      let body = '';
      req.on('data', chunk => { body += chunk; });
      req.on('end', () => {
        try {
          resolve(body ? JSON.parse(body) : {});
        } catch {
          resolve({});
        }
      });
    });
  }
}

// Ejecución directa de servidor mock en CLI (ej: node src/mock-server/server.js)
if (process.argv[1] && process.argv[1].endsWith('server.js')) {
  const server = new MockBookingServer({ port: 3001 });
  server.start();
}
