/**
 * services/feeCalculator.js
 * RF02 - Motor de Cálculo de Seña y Recargos
 * 
 * Reglas de negocio:
 * 1. Base: $2.000 por persona (1 a 4 comensales).
 * 2. Grupo: Si son 5 a 12 comensales, +10% de recargo sobre el subtotal base.
 * 3. Fin de semana: Si el día de la reserva es Viernes o Sábado, +15% de recargo sobre el total de la seña.
 * 
 * Programación defensiva estricta:
 * - Valida cantidad de personas (entero entre 1 y 12).
 * - Valida fecha válida y en formato parseable.
 */

export const BASE_FEE_PER_PERSON = 2000;
export const GROUP_SURCHARGE_RATE = 0.10;
export const WEEKEND_SURCHARGE_RATE = 0.15;
export const MIN_GUESTS = 1;
export const MAX_GUESTS = 12;

/**
 * Determina si una fecha corresponde a fin de semana (Viernes o Sábado).
 * @param {string|Date} dateInput 
 * @returns {boolean}
 */
export function isWeekend(dateInput) {
  if (!dateInput) {
    throw new TypeError('La fecha es obligatoria.');
  }

  let dateObj;
  if (dateInput instanceof Date) {
    dateObj = dateInput;
  } else if (typeof dateInput === 'string') {
    // Si viene en formato YYYY-MM-DD
    const parts = dateInput.trim().split('-');
    if (parts.length === 3) {
      const year = parseInt(parts[0], 10);
      const month = parseInt(parts[1], 10) - 1;
      const day = parseInt(parts[2], 10);
      dateObj = new Date(year, month, day);
    } else {
      dateObj = new Date(dateInput);
    }
  } else {
    throw new TypeError('Formato de fecha inválido. Se esperaba string ISO o Date.');
  }

  if (isNaN(dateObj.getTime())) {
    throw new RangeError('Fecha inválida.');
  }

  // 0 = Domingo, 5 = Viernes, 6 = Sábado
  const dayOfWeek = dateObj.getDay();
  return dayOfWeek === 5 || dayOfWeek === 6;
}

/**
 * Calcula el importe total de la seña para una reserva.
 * 
 * @param {number} guests Cantidad de personas (1 a 12)
 * @param {string|Date} date Fecha de la reserva
 * @returns {{
 *   guests: number,
 *   baseSubtotal: number,
 *   groupSurcharge: number,
 *   subtotalWithGroup: number,
 *   weekendSurcharge: number,
 *   totalFee: number,
 *   isWeekend: boolean,
 *   hasGroupSurcharge: boolean
 * }}
 */
export function calculateDepositFee(guests, date) {
  // 1. Validaciones defensivas de comensales
  if (guests === undefined || guests === null || typeof guests !== 'number') {
    throw new TypeError('La cantidad de comensales debe ser un número entero.');
  }

  if (!Number.isInteger(guests)) {
    throw new TypeError('La cantidad de comensales no puede ser decimal.');
  }

  if (guests < MIN_GUESTS || guests > MAX_GUESTS) {
    throw new RangeError(`La cantidad de comensales debe estar entre ${MIN_GUESTS} y ${MAX_GUESTS}. Se recibió: ${guests}`);
  }

  // 2. Validación de fecha
  const weekend = isWeekend(date);

  // 3. Subtotal Base
  const baseSubtotal = guests * BASE_FEE_PER_PERSON;

  // 4. Recargo de Grupo (5 a 12 comensales: +10%)
  const hasGroupSurcharge = guests >= 5;
  const groupSurcharge = hasGroupSurcharge ? Math.round(baseSubtotal * GROUP_SURCHARGE_RATE) : 0;
  const subtotalWithGroup = baseSubtotal + groupSurcharge;

  // 5. Recargo de Fin de Semana (Viernes o Sábado: +15% sobre el total)
  const weekendSurcharge = weekend ? Math.round(subtotalWithGroup * WEEKEND_SURCHARGE_RATE) : 0;
  const totalFee = subtotalWithGroup + weekendSurcharge;

  return {
    guests,
    baseSubtotal,
    groupSurcharge,
    subtotalWithGroup,
    weekendSurcharge,
    totalFee,
    isWeekend: weekend,
    hasGroupSurcharge
  };
}
