/**
 * tests/feeCalculator.test.js
 * Pruebas Unitarias Automatizadas (Etapa 8) y TDD (Etapa 12)
 * Framework: node:test y node:assert/strict
 */

import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import {
  calculateDepositFee,
  isWeekend,
  BASE_FEE_PER_PERSON,
  GROUP_SURCHARGE_RATE,
  WEEKEND_SURCHARGE_RATE
} from '../src/services/feeCalculator.js';

describe('RF02: Motor de Cálculo de Señas y Recargos', () => {

  describe('Función auxiliar: isWeekend', () => {
    test('Identifica correctamente que Miércoles no es fin de semana', () => {
      assert.strictEqual(isWeekend('2026-10-28'), false);
    });

    test('Identifica correctamente que Viernes es fin de semana', () => {
      assert.strictEqual(isWeekend('2026-10-30'), true);
    });

    test('Identifica correctamente que Sábado es fin de semana', () => {
      assert.strictEqual(isWeekend('2026-10-31'), true);
    });

    test('Identifica correctamente que Domingo no aplica recargo de finde', () => {
      assert.strictEqual(isWeekend('2026-11-01'), false);
    });

    test('Lanza TypeError si la fecha está vacía', () => {
      assert.throws(() => isWeekend(''), {
        name: 'TypeError',
        message: 'La fecha es obligatoria.'
      });
    });

    test('Lanza RangeError si la fecha es inválida', () => {
      assert.throws(() => isWeekend('fecha-invalida'), {
        name: 'RangeError',
        message: 'Fecha inválida.'
      });
    });
  });

  describe('Caja Negra: Partición en Clases de Equivalencia y Valores Límite', () => {
    test('CP-01: 2 personas en día hábil (Tarifa base $4.000 sin recargos)', () => {
      const res = calculateDepositFee(2, '2026-10-28');
      assert.strictEqual(res.baseSubtotal, 4000);
      assert.strictEqual(res.groupSurcharge, 0);
      assert.strictEqual(res.weekendSurcharge, 0);
      assert.strictEqual(res.totalFee, 4000);
    });

    test('CP-02: Límite superior sin recargo (4 comensales en día hábil)', () => {
      const res = calculateDepositFee(4, '2026-10-29');
      assert.strictEqual(res.baseSubtotal, 8000);
      assert.strictEqual(res.groupSurcharge, 0);
      assert.strictEqual(res.weekendSurcharge, 0);
      assert.strictEqual(res.totalFee, 8000);
    });

    test('CP-03: Límite inferior con recargo de grupo (5 comensales en día hábil)', () => {
      const res = calculateDepositFee(5, '2026-10-28');
      assert.strictEqual(res.baseSubtotal, 10000);
      assert.strictEqual(res.groupSurcharge, 1000); // 10% de 10000
      assert.strictEqual(res.weekendSurcharge, 0);
      assert.strictEqual(res.totalFee, 11000);
    });

    test('CP-04: Grupo máximo en fin de semana (12 personas un Viernes)', () => {
      const res = calculateDepositFee(12, '2026-10-30');
      assert.strictEqual(res.baseSubtotal, 24000);
      assert.strictEqual(res.groupSurcharge, 2400); // 10%
      assert.strictEqual(res.subtotalWithGroup, 26400);
      assert.strictEqual(res.weekendSurcharge, 3960); // 15% sobre 26400
      assert.strictEqual(res.totalFee, 30360);
    });

    test('Caso adicional: Grupo de 2 personas un Sábado (Sólo recargo finde)', () => {
      const res = calculateDepositFee(2, '2026-10-31');
      assert.strictEqual(res.baseSubtotal, 4000);
      assert.strictEqual(res.groupSurcharge, 0);
      assert.strictEqual(res.weekendSurcharge, 600); // 15% de 4000
      assert.strictEqual(res.totalFee, 4600);
    });
  });

  describe('Pruebas Defensivas y de Excepción (Datos Inválidos)', () => {
    test('CP-05: Rechaza 0 comensales (Valor límite inferior inválido)', () => {
      assert.throws(() => calculateDepositFee(0, '2026-10-28'), {
        name: 'RangeError',
        message: /La cantidad de comensales debe estar entre 1 y 12/
      });
    });

    test('CP-06: Rechaza 13 comensales (Valor límite superior inválido)', () => {
      assert.throws(() => calculateDepositFee(13, '2026-10-28'), {
        name: 'RangeError',
        message: /La cantidad de comensales debe estar entre 1 y 12/
      });
    });

    test('Rechaza comensales negativos (-3)', () => {
      assert.throws(() => calculateDepositFee(-3, '2026-10-28'), {
        name: 'RangeError'
      });
    });

    test('Rechaza número decimal de comensales (2.5)', () => {
      assert.throws(() => calculateDepositFee(2.5, '2026-10-28'), {
        name: 'TypeError',
        message: 'La cantidad de comensales no puede ser decimal.'
      });
    });

    test('Rechaza comensales nulos o no numéricos', () => {
      assert.throws(() => calculateDepositFee(null, '2026-10-28'), {
        name: 'TypeError'
      });
      assert.throws(() => calculateDepositFee('cuatro', '2026-10-28'), {
        name: 'TypeError'
      });
    });
  });
});
