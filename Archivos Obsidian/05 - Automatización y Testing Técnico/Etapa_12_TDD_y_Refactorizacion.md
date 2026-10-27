# Etapa 12: TDD (Test-Driven Development) y Refactorización

**Asignatura:** Verificación y Validación de Software (3° Año TSDS - UPC)  
**Proyecto:** Sistema de Reservas para Resto-Bar  
**Desarrollador:** Alex Combina  
**Tester Técnico:** Fabrizio Magnelli  
**Fecha:** 27 de Octubre de 2026  

---

## 1. Metodología TDD Aplicada al Motor de Señas (RF02)

Para la implementación del cálculo de seña se siguió el ciclo clásico de **Test-Driven Development (TDD)** compuesto por tres fases:

```
[ RED ] Escribir prueba que falla
   │
   ▼
[ GREEN ] Escribir el código mínimo para que pase
   │
   ▼
[ REFACTOR ] Mejorar diseño, claridad y tipado sin alterar comportamiento
```

---

## 2. Demostración Paso a Paso del Ciclo TDD

### Paso 1: Fase RED (Prueba Inicial Fallida)
Antes de tener la lógica de recargos de grupo y fin de semana, se escribió el caso de prueba:

```javascript
test('CP-04: Grupo máximo en fin de semana (12 personas un Viernes)', () => {
  const res = calculateDepositFee(12, '2026-10-30');
  // Se espera base 24000 + 10% grupo (2400) + 15% finde (3960) = 30360
  assert.strictEqual(res.totalFee, 30360);
});
```

*Resultado en ejecución:* **FALLO (RED)**  
`AssertionError [ERR_ASSERTION]: Expected 24000 to strictly equal 30360`.

---

### Paso 2: Fase GREEN (Implementación Mínima)
Alex Combina implementó el cálculo directo y condicional para lograr que la prueba pasara:

```javascript
export function calculateDepositFee(guests, date) {
  let total = guests * 2000;
  if (guests >= 5) {
    total += total * 0.10;
  }
  const d = new Date(date).getDay();
  if (d === 5 || d === 6) {
    total += total * 0.15;
  }
  return { totalFee: Math.round(total) };
}
```

*Resultado en ejecución:* **ÉXITO (GREEN)**. Todos los tests pasan.

---

### Paso 3: Fase REFACTOR (Mejora Técnica y Refactorización)

#### ¿Qué problema presentaba el código original de la fase Green?
1. **Números Mágicos:** Valores como `2000`, `0.10`, `0.15`, `5` estaban *hardcodeados* dentro de la función sin constantes explicativas.
2. **Falta de Trazabilidad en la Salida:** La función sólo retornaba `totalFee`, impidiendo al frontend y al comensal auditar el desglose de lo cobrado (subtotal base, recargo de grupo discriminado y recargo de fin de semana discriminado).
3. **Fragilidad de Parsing de Fecha:** `new Date(date).getDay()` interpretaba strings en zona horaria UTC, provocando que reservas en ciertos husos horarios cambiaran de día.
4. **Falta de Programación Defensiva:** No se validaba si `guests` era null, negativo, con decimales o superior a 12.

#### ¿Qué modificación se realizó?
Se extrajeron constantes descriptivas (`BASE_FEE_PER_PERSON`, `GROUP_SURCHARGE_RATE`, `WEEKEND_SURCHARGE_RATE`), se desacopló el analizador `isWeekend` con parseo manual de año/mes/día, se incorporaron validaciones con `TypeError` y `RangeError`, y se amplió el objeto retornado con el detalle completo:

```javascript
export const BASE_FEE_PER_PERSON = 2000;
export const GROUP_SURCHARGE_RATE = 0.10;
export const WEEKEND_SURCHARGE_RATE = 0.15;
export const MIN_GUESTS = 1;
export const MAX_GUESTS = 12;

export function calculateDepositFee(guests, date) {
  // Validaciones defensivas estrictas
  if (typeof guests !== 'number' || !Number.isInteger(guests)) {
    throw new TypeError('La cantidad de comensales debe ser un número entero.');
  }
  if (guests < MIN_GUESTS || guests > MAX_GUESTS) {
    throw new RangeError(`La cantidad de comensales debe estar entre ${MIN_GUESTS} y ${MAX_GUESTS}.`);
  }

  const weekend = isWeekend(date);
  const baseSubtotal = guests * BASE_FEE_PER_PERSON;
  const hasGroupSurcharge = guests >= 5;
  const groupSurcharge = hasGroupSurcharge ? Math.round(baseSubtotal * GROUP_SURCHARGE_RATE) : 0;
  const subtotalWithGroup = baseSubtotal + groupSurcharge;
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
```

#### ¿Por qué la modificación mejora el código?
- **Mantenibilidad:** Si los precios o porcentajes varían, se ajustan en un único punto.
- **Robustez y Seguridad:** Evita inyecciones de datos corruptos antes de impactar el cálculo financiero.
- **Transparencia para el Usuario:** Proporciona un desglose detallado para emitir comprobantes claros al cliente.

#### ¿Qué pruebas se utilizaron para comprobar que continuó funcionando?
Se reejecutó toda la suite unitaria en `tests/feeCalculator.test.js` (casos `CP-01` a `CP-06` más tests defensivos), verificando que el 100% de las pruebas se mantuvieran en **Verde (Pass)**.
