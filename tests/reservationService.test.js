/**
 * tests/reservationService.test.js
 * Pruebas de Integración y de Sistema (Etapas 9 y 10)
 * Valida la interacción completa entre Reserva, Seña y Cupos
 */

import { test, describe, beforeEach } from 'node:test';
import assert from 'node:assert/strict';
import { ReservationService, MAX_CAPACITY_PER_SHIFT } from '../src/services/reservationService.js';

describe('Servicio de Gestión de Reservas y Cupos (RF01, RF03, RF04, RF05)', () => {
  let service;
  const REF_DATE = new Date('2026-10-27T10:00:00Z');

  beforeEach(() => {
    service = new ReservationService();
  });

  describe('RF01: Registro de Reserva', () => {
    test('CP-07: Registra reserva válida en estado pendiente con seña calculada', () => {
      const res = service.createReservation({
        customerName: 'Juan Pérez',
        customerPhone: '3533400112',
        date: '2026-10-28',
        shift: 1,
        guests: 4
      }, REF_DATE);

      assert.strictEqual(res.customerName, 'Juan Pérez');
      assert.strictEqual(res.status, 'pendiente');
      assert.strictEqual(res.guests, 4);
      assert.strictEqual(res.depositFee, 8000);
      assert.ok(res.code.startsWith('RES-'));
    });

    test('Rechaza fechas pasadas', () => {
      assert.throws(() => {
        service.createReservation({
          customerName: 'Ana Gomez',
          customerPhone: '3533400112',
          date: '2026-10-25', // Pasada respecto al 27/10
          shift: 1,
          guests: 2
        }, REF_DATE);
      }, {
        name: 'RangeError',
        message: 'No se permiten reservas para fechas pasadas.'
      });
    });

    test('Rechaza reservas con más de 30 días de anticipación', () => {
      assert.throws(() => {
        service.createReservation({
          customerName: 'Carlos Ramos',
          customerPhone: '3533400112',
          date: '2026-12-05', // > 30 días
          shift: 1,
          guests: 2
        }, REF_DATE);
      }, {
        name: 'RangeError',
        message: 'No se permiten reservas con más de 30 días de anticipación.'
      });
    });

    test('Rechaza turnos inexistentes (ej. turno 3)', () => {
      assert.throws(() => {
        service.createReservation({
          customerName: 'Carlos Ramos',
          customerPhone: '3533400112',
          date: '2026-10-29',
          shift: 3,
          guests: 2
        }, REF_DATE);
      }, {
        name: 'RangeError'
      });
    });
  });

  describe('RF03: Confirmación de Reserva', () => {
    test('CP-08: Confirma reserva al abonar el monto exacto de la seña', () => {
      const created = service.createReservation({
        customerName: 'Marta Díaz',
        customerPhone: '3533400112',
        date: '2026-10-29',
        shift: 2,
        guests: 2
      }, REF_DATE);

      const confirmed = service.confirmReservation(created.code, 4000);
      assert.strictEqual(confirmed.status, 'confirmada');
      assert.strictEqual(confirmed.paidAmount, 4000);
      assert.ok(confirmed.paidAt);
    });

    test('Rechaza confirmación si el pago es insuficiente', () => {
      const created = service.createReservation({
        customerName: 'Marta Díaz',
        customerPhone: '3533400112',
        date: '2026-10-29',
        shift: 2,
        guests: 2
      }, REF_DATE);

      assert.throws(() => {
        service.confirmReservation(created.code, 3500); // Seña es 4000
      }, {
        name: 'RangeError',
        message: /El monto abonado.*es insuficiente/
      });
    });
  });

  describe('RF04: Cancelación y Plazo de 24 hs', () => {
    test('CP-09: Permite cancelar con más de 24 hs de antelación y libera el cupo', () => {
      const created = service.createReservation({
        customerName: 'Lucía Torres',
        customerPhone: '3533400112',
        date: '2026-10-30', // Viernes Turno 1 (inicio 11:00 hs)
        shift: 1,
        guests: 4
      }, REF_DATE);

      // Cancelar el día 28 a las 10:00 (quedan ~49 horas)
      const cancelTime = new Date('2026-10-28T10:00:00');
      const result = service.cancelReservation(created.code, cancelTime);

      assert.strictEqual(result.cancelled, true);
      assert.strictEqual(result.reservation.status, 'cancelada');

      // Verificar que el cupo volvió a estar disponible al 100%
      const avail = service.getAvailability('2026-10-30', 1);
      assert.strictEqual(avail.availableCapacity, MAX_CAPACITY_PER_SHIFT);
    });

    test('CP-10: Rechaza cancelación cuando faltan menos de 24 hs para el inicio del turno', () => {
      const created = service.createReservation({
        customerName: 'Pedro Rossi',
        customerPhone: '3533400112',
        date: '2026-10-28', // Miércoles Turno 1 (11:00 hs)
        shift: 1,
        guests: 4
      }, REF_DATE);

      // Intentar cancelar el mismo 28 a las 08:00 hs (faltan 3 horas)
      const lateTime = new Date('2026-10-28T08:00:00');
      assert.throws(() => {
        service.cancelReservation(created.code, lateTime);
      }, {
        name: 'RangeError',
        message: /No se permite cancelar con menos de 24 horas/
      });
    });
  });

  describe('RF05: Control de Capacidad y Prevención de Overbooking', () => {
    test('CP-11: Bloquea reserva si sobrepasa la capacidad máxima de 50 personas', () => {
      // Registrar 4 reservas de 12 personas = 48 personas
      for (let i = 0; i < 4; i++) {
        service.createReservation({
          customerName: `Grupo ${i + 1}`,
          customerPhone: '3533400112',
          date: '2026-10-29',
          shift: 1,
          guests: 12
        }, REF_DATE);
      }

      // Capacidad restante: 50 - 48 = 2
      const avail = service.getAvailability('2026-10-29', 1);
      assert.strictEqual(avail.bookedGuests, 48);
      assert.strictEqual(avail.availableCapacity, 2);

      // Intentar reservar para 4 personas (supera el cupo restante de 2)
      assert.throws(() => {
        service.createReservation({
          customerName: 'Grupo Excedente',
          customerPhone: '3533400112',
          date: '2026-10-29',
          shift: 1,
          guests: 4
        }, REF_DATE);
      }, {
        name: 'RangeError',
        message: /Capacidad insuficiente para el turno seleccionado/
      });

      // Pero sí permite reservar para 2 personas exactamente
      const exact = service.createReservation({
        customerName: 'Grupo Justo',
        customerPhone: '3533400112',
        date: '2026-10-29',
        shift: 1,
        guests: 2
      }, REF_DATE);

      assert.strictEqual(exact.guests, 2);
      const fullAvail = service.getAvailability('2026-10-29', 1);
      assert.strictEqual(fullAvail.availableCapacity, 0);
    });
  });
});
