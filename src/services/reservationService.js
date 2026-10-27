/**
 * services/reservationService.js
 * Lógica de Negocio y Ciclo de Vida de Reservas (RF01, RF03, RF04, RF05)
 * 
 * Reglas de negocio:
 * 1. Capacidad máxima por turno: 50 comensales.
 * 2. Turnos válidos: Turno 1 (11:00 a 14:00) y Turno 2 (20:00 a 00:30).
 * 3. Grupo: Mínimo 1, máximo 12 personas.
 * 4. Fechas: No permitir fechas pasadas ni con más de 30 días de anticipación.
 * 5. Cancelación (RF04): Permitida sin penalización hasta 24 hs antes del turno.
 * 6. Estados: 'pendiente' -> 'confirmada' -> 'cancelada' | 'finalizada'.
 */

import { calculateDepositFee } from './feeCalculator.js';

export const MAX_CAPACITY_PER_SHIFT = 50;
export const MAX_ADVANCE_DAYS = 30;

export const SHIFTS = {
  TURNO_1: {
    id: 1,
    name: 'Turno 1',
    startHour: 11,
    startMinute: 0,
    endHour: 14,
    endMinute: 0,
    timeRange: '11:00 - 14:00'
  },
  TURNO_2: {
    id: 2,
    name: 'Turno 2',
    startHour: 20,
    startMinute: 0,
    endHour: 0,
    endMinute: 30,
    timeRange: '20:00 - 00:30'
  }
};

export class ReservationService {
  constructor() {
    this.reservations = [];
  }

  /**
   * Valida si un turno es 1 o 2.
   * @param {number|string} shift 
   * @returns {number} 1 o 2
   */
  validateShift(shift) {
    const shiftNum = Number(shift);
    if (![1, 2].includes(shiftNum)) {
      throw new RangeError('El turno debe ser 1 (11:00 a 14:00) o 2 (20:00 a 00:30).');
    }
    return shiftNum;
  }

  /**
   * Valida la antelación de la fecha:
   * - No fechas pasadas.
   * - No fechas con más de 30 días posteriores.
   * @param {string} dateString 'YYYY-MM-DD'
   * @param {Date} [referenceDate] Fecha contra la cual evaluar (por defecto ahora)
   */
  validateDate(dateString, referenceDate = new Date()) {
    if (!dateString || typeof dateString !== 'string') {
      throw new TypeError('La fecha debe ser una cadena en formato YYYY-MM-DD.');
    }

    const match = dateString.match(/^(\d{4})-(\d{2})-(\d{2})$/);
    if (!match) {
      throw new TypeError('Formato de fecha inválido. Debe ser YYYY-MM-DD.');
    }

    const [year, month, day] = dateString.split('-').map(Number);
    const targetDate = new Date(year, month - 1, day);

    if (
      targetDate.getFullYear() !== year ||
      targetDate.getMonth() !== month - 1 ||
      targetDate.getDate() !== day
    ) {
      throw new RangeError('La fecha especificada no existe en el calendario.');
    }

    // Normalizar a medianoche (sin horas)
    const targetMidnight = new Date(year, month - 1, day).getTime();
    const todayMidnight = new Date(
      referenceDate.getFullYear(),
      referenceDate.getMonth(),
      referenceDate.getDate()
    ).getTime();

    const diffDays = Math.round((targetMidnight - todayMidnight) / (1000 * 60 * 60 * 24));

    if (diffDays < 0) {
      throw new RangeError('No se permiten reservas para fechas pasadas.');
    }

    if (diffDays > MAX_ADVANCE_DAYS) {
      throw new RangeError(`No se permiten reservas con más de ${MAX_ADVANCE_DAYS} días de anticipación.`);
    }

    return dateString;
  }

  /**
   * RF05 - Consulta la capacidad disponible de un turno específico en una fecha.
   * @param {string} date 'YYYY-MM-DD'
   * @param {number|string} shift 1 o 2
   * @returns {{ totalCapacity: number, bookedGuests: number, availableCapacity: number }}
   */
  getAvailability(date, shift) {
    const shiftNum = this.validateShift(shift);

    // Sumar comensales de reservas activas (pendientes y confirmadas)
    const bookedGuests = this.reservations
      .filter(r => r.date === date && r.shift === shiftNum && (r.status === 'pendiente' || r.status === 'confirmada'))
      .reduce((sum, r) => sum + r.guests, 0);

    const availableCapacity = Math.max(0, MAX_CAPACITY_PER_SHIFT - bookedGuests);

    return {
      totalCapacity: MAX_CAPACITY_PER_SHIFT,
      bookedGuests,
      availableCapacity
    };
  }

  /**
   * RF01 - Registrar una nueva reserva.
   * @param {{
   *   customerName: string,
   *   customerPhone: string,
   *   date: string,
   *   shift: number,
   *   guests: number,
   *   notes?: string
   * }} reservationData 
   * @returns {Object} Reserva creada en estado 'pendiente'
   */
  createReservation(reservationData, referenceDate = new Date()) {
    const { customerName, customerPhone, date, shift, guests, notes = '' } = reservationData;

    if (!customerName || typeof customerName !== 'string' || customerName.trim().length < 3) {
      throw new TypeError('El nombre del cliente es obligatorio y debe tener al menos 3 caracteres.');
    }

    if (!customerPhone || typeof customerPhone !== 'string' || customerPhone.trim().length < 6) {
      throw new TypeError('El teléfono de contacto es obligatorio y debe ser válido.');
    }

    // Validar fecha y turno
    this.validateDate(date, referenceDate);
    const shiftNum = this.validateShift(shift);

    // Validar y calcular seña (RF02 valida guests de 1 a 12)
    const feeDetails = calculateDepositFee(guests, date);

    // Validar disponibilidad de aforo (RF05)
    const { availableCapacity } = this.getAvailability(date, shiftNum);
    if (guests > availableCapacity) {
      throw new RangeError(
        `Capacidad insuficiente para el turno seleccionado. Cupos disponibles: ${availableCapacity}, solicitados: ${guests}.`
      );
    }

    // Crear objeto de reserva
    const code = `RES-${Date.now().toString(36).toUpperCase()}-${Math.floor(Math.random() * 1000)}`;
    const newReservation = {
      id: `res_${Date.now()}_${Math.floor(Math.random() * 1000)}`,
      code,
      customerName: customerName.trim(),
      customerPhone: customerPhone.trim(),
      date,
      shift: shiftNum,
      shiftLabel: shiftNum === 1 ? 'Turno 1 (11:00 a 14:00)' : 'Turno 2 (20:00 a 00:30)',
      guests,
      depositFee: feeDetails.totalFee,
      depositDetails: feeDetails,
      status: 'pendiente',
      notes: notes.trim(),
      createdAt: referenceDate.toISOString(),
      paidAt: null,
      cancelledAt: null
    };

    this.reservations.push(newReservation);
    return newReservation;
  }

  /**
   * RF03 - Confirmar la reserva tras abonar la seña.
   * @param {string} code Código único de reserva
   * @param {number} paidAmount Monto exacto abonado
   * @returns {Object} Reserva actualizada
   */
  confirmReservation(code, paidAmount) {
    if (!code) {
      throw new TypeError('El código de reserva es obligatorio.');
    }

    const reservation = this.reservations.find(r => r.code === code);
    if (!reservation) {
      throw new Error(`No se encontró ninguna reserva con el código: ${code}`);
    }

    if (reservation.status !== 'pendiente') {
      throw new Error(`La reserva no puede confirmarse porque se encuentra en estado: ${reservation.status}`);
    }

    if (typeof paidAmount !== 'number' || paidAmount < reservation.depositFee) {
      throw new RangeError(
        `El monto abonado ($${paidAmount}) es insuficiente. El importe de seña requerido es $${reservation.depositFee}.`
      );
    }

    reservation.status = 'confirmada';
    reservation.paidAt = new Date().toISOString();
    reservation.paidAmount = paidAmount;

    return reservation;
  }

  /**
   * RF04 - Cancelar reserva.
   * Permitida sin penalización hasta 24 hs antes del inicio del turno.
   * @param {string} code Código único de reserva
   * @param {Date} [currentTimestamp] Momento de la solicitud de cancelación
   * @returns {{ cancelled: boolean, reservation: Object, message: string }}
   */
  cancelReservation(code, currentTimestamp = new Date()) {
    if (!code) {
      throw new TypeError('El código de reserva es obligatorio.');
    }

    const reservation = this.reservations.find(r => r.code === code);
    if (!reservation) {
      throw new Error(`No se encontró ninguna reserva con el código: ${code}`);
    }

    if (reservation.status === 'cancelada') {
      throw new Error('La reserva ya ha sido cancelada con anterioridad.');
    }

    if (reservation.status === 'finalizada') {
      throw new Error('No se puede cancelar una reserva que ya ha finalizado.');
    }

    // Calcular inicio exacto del turno
    const [year, month, day] = reservation.date.split('-').map(Number);
    const shiftInfo = reservation.shift === 1 ? SHIFTS.TURNO_1 : SHIFTS.TURNO_2;
    const shiftStartTime = new Date(year, month - 1, day, shiftInfo.startHour, shiftInfo.startMinute, 0);

    const hoursDifference = (shiftStartTime.getTime() - currentTimestamp.getTime()) / (1000 * 60 * 60);

    if (hoursDifference < 24) {
      throw new RangeError(
        `No se permite cancelar con menos de 24 horas de anticipación. Faltan ${hoursDifference.toFixed(1)} horas para el turno.`
      );
    }

    reservation.status = 'cancelada';
    reservation.cancelledAt = currentTimestamp.toISOString();

    return {
      cancelled: true,
      reservation,
      message: 'Reserva cancelada con éxito. Cupo liberado correctamente.'
    };
  }

  /**
   * Limpia el almacenamiento de reservas (útil para pruebas unitarias).
   */
  clear() {
    this.reservations = [];
  }
}
