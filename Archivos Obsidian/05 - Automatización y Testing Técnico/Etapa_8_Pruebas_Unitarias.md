# Etapa 8: Pruebas Unitarias Automatizadas

**Asignatura:** Verificación y Validación de Software (3° Año TSDS - UPC)  
**Proyecto:** Sistema de Reservas para Resto-Bar  
**Tester Técnico:** Fabrizio Magnelli  
**Fecha:** 27 de Octubre de 2026  
**Herramienta:** `node:test` y `node:assert/strict`  

---

## 1. Alcance de las Pruebas Unitarias

Se seleccionaron funciones críticas e independientes del sistema para someterlas a pruebas unitarias rigurosas y aisladas:
1. `calculateDepositFee(guests, date)` - Motor de cálculo financiero de seña.
2. `isWeekend(dateInput)` - Determinación de recargo por día de semana.
3. `ReservationService.prototype.validateDate(dateString, referenceDate)` - Validación de rango temporal y calendario.
4. `ReservationService.prototype.validateShift(shift)` - Validación de turnos operativos.

Archivo de pruebas: [`tests/feeCalculator.test.js`](file:///c:/Users/Fabri/OneDrive/Desktop/VyV-RestoBar/tests/feeCalculator.test.js).

---

## 2. Casos Evaluados en la Suite Unitaria

| Caso Unitario | Función Evaluada | Entrada | Resultado Esperado | Resultado Real |
| :--- | :--- | :--- | :--- | :---: |
| Test 1 | `isWeekend()` | `'2026-10-28'` (Miércoles) | `false` | `false` (Pass) |
| Test 2 | `isWeekend()` | `'2026-10-30'` (Viernes) | `true` | `true` (Pass) |
| Test 3 | `isWeekend()` | `'2026-10-31'` (Sábado) | `true` | `true` (Pass) |
| Test 4 | `isWeekend()` | `'2026-11-01'` (Domingo) | `false` | `false` (Pass) |
| Test 5 | `isWeekend()` | `""` (vacío) | `TypeError` | Lanza `TypeError` (Pass) |
| Test 6 | `isWeekend()` | `'fecha-invalida'` | `RangeError` | Lanza `RangeError` (Pass) |
| Test 7 | `calculateDepositFee()` | 2 comensales, Miércoles | Base \$4.000, Total \$4.000 | Total \$4.000 (Pass) |
| Test 8 | `calculateDepositFee()` | 4 comensales, Jueves | Base \$8.000, Total \$8.000 | Total \$8.000 (Pass) |
| Test 9 | `calculateDepositFee()` | 5 comensales, Miércoles | Base \$10.000, Recargo \$1.000, Total \$11.000 | Total \$11.000 (Pass) |
| Test 10 | `calculateDepositFee()` | 12 comensales, Viernes | Base \$24.000, Recargo 10% + 15% = \$30.360 | Total \$30.360 (Pass) |
| Test 11 | `calculateDepositFee()` | 0 comensales | `RangeError` (mínimo 1) | Lanza `RangeError` (Pass) |
| Test 12 | `calculateDepositFee()` | 13 comensales | `RangeError` (máximo 12) | Lanza `RangeError` (Pass) |
| Test 13 | `calculateDepositFee()` | Decimal `2.5` | `TypeError` (debe ser entero) | Lanza `TypeError` (Pass) |
| Test 14 | `calculateDepositFee()` | Valor no numérico (`"cuatro"`) | `TypeError` | Lanza `TypeError` (Pass) |

---

## 3. Extracto de Código de las Pruebas Unitarias

```javascript
// Validación de cálculo con recargo de grupo y fin de semana
test('CP-04: Grupo máximo en fin de semana (12 personas un Viernes)', () => {
  const res = calculateDepositFee(12, '2026-10-30');
  assert.strictEqual(res.baseSubtotal, 24000);
  assert.strictEqual(res.groupSurcharge, 2400); // 10%
  assert.strictEqual(res.subtotalWithGroup, 26400);
  assert.strictEqual(res.weekendSurcharge, 3960); // 15% sobre 26400
  assert.strictEqual(res.totalFee, 30360);
});

// Validación defensiva de tipos de datos
test('Rechaza número decimal de comensales (2.5)', () => {
  assert.throws(() => calculateDepositFee(2.5, '2026-10-28'), {
    name: 'TypeError',
    message: 'La cantidad de comensales no puede ser decimal.'
  });
});
```

---

## 4. Evidencia de Ejecución

- Todas las pruebas unitarias pasan en **0.011 segundos**.
- La suite garantiza un comportamiento completamente predecible ante entradas correctas, bordes y datos maliciosos o corruptos.
