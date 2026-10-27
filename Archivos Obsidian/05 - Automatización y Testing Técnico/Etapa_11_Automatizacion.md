# Etapa 11: Automatización de Pruebas

**Asignatura:** Verificación y Validación de Software (3° Año TSDS - UPC)  
**Proyecto:** Sistema de Reservas para Resto-Bar  
**Tester Técnico:** Fabrizio Magnelli  
**Fecha:** 27 de Octubre de 2026  

---

## 1. Herramienta Seleccionada y Motivo de Elección

- **Herramienta:** Node.js Test Runner nativo (`node:test`) junto con el módulo de aserciones estrictas (`node:assert/strict`).
- **Motivo de la Elección:**
  1. **Cero Dependencias Externas:** Viene integrado nativamente a partir de Node.js v18/v20+, eliminando riesgos de vulnerabilidades en librerías de terceros y reduciendo la complejidad del empaquetado.
  2. **Rendimiento y Ligereza:** Se ejecuta directamente sobre el motor V8 en milisegundos sin sobrecarga de transpilación ni procesos secundarios pesados.
  3. **Compatibilidad Estándar:** Soporte nativo para ES Modules (`import`/`export`) y reporte estandarizado TAP (Test Anything Protocol).
  4. **Facilidad de Integración Continua:** Se invoca de forma directa mediante `npm test` en cualquier pipeline o entorno sin configuraciones adicionales.

---

## 2. Casos de Prueba Automatizados Seleccionados

Para la automatización de la suite de regresión continua se seleccionaron 3 casos paradigmáticos:

### Caso Automatizado 1: Motor de cálculo con recargos combinados (RF02)
- **Caso:** `CP-04 - 12 comensales en día Viernes`.
- **Procedimiento:** Ejecución de `calculateDepositFee(12, '2026-10-30')` y aserción de cada subtotal y del total (\$30.360).
- **Resultado:** Aprobado en tiempo de ejecución menor a 1 ms.

### Caso Automatizado 2: Bloqueo de cancelación fuera de término (RF04)
- **Caso:** `CP-10 - Cancelación con menos de 24 hs de antelación`.
- **Procedimiento:** Invocación de `cancelReservation` con un timestamp a 3 hs del evento dentro de un bloque `assert.throws()`.
- **Resultado:** Aprobado, captura la excepción esperada `RangeError`.

### Caso Automatizado 3: Saturación y prevención estricta de Overbooking (RF05)
- **Caso:** `CP-11 - Límite de 50 lugares por turno`.
- **Procedimiento:** Bucle de creación de reservas acumulando 48 comensales; intento de añadir 4 lugares adicionales; aserción de rechazo; reserva de 2 lugares exactos; comprobación de aforo residual en 0.
- **Resultado:** Aprobado.

---

## 3. Ventajas y Limitaciones Encontradas

### Ventajas:
- **Ejecución instantánea:** La suite completa de 25 pruebas se ejecuta en menos de 130 milisegundos.
- **Determinismo y Repetibilidad:** Los tests son completamente reproducibles en cualquier máquina de desarrollo sin depender de un navegador o base de datos externa.
- **Claridad de fallas:** Si una aserción falla, el runner detalla exactamente el valor obtenido versus el esperado con su *diff* tipado.

### Limitaciones:
- Las pruebas de backend automatizadas con `node:test` no renderizan el DOM visual (para validar el árbol DOM visual se complementa con la maqueta y la skill `impeccable` en frontend).
- Requiere Node.js v18 o superior para disponer de la API nativa de testing.
