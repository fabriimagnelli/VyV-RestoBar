# Etapa 13: Pruebas de Regresión

**Asignatura:** Verificación y Validación de Software (3° Año TSDS - UPC)  
**Proyecto:** Sistema de Reservas para Resto-Bar  
**Tester Técnico:** Fabrizio Magnelli  
**Fecha:** 27 de Octubre de 2026  

---

## 1. Concepto y Necesidad de las Pruebas de Regresión

Las pruebas de regresión tienen como propósito confirmar que las correcciones de defectos (por ejemplo, BUG-001 y BUG-002) o las refactorizaciones de código (Fase Refactor de TDD) no hayan introducido efectos secundarios no deseados ni degradado funcionalidades que previamente operaban de forma correcta.

---

## 2. Eventos que Dispararon la Regresión

1. **Corrección de BUG-001:** Modificación de `isWeekend` para incorporar el día Viernes.
2. **Corrección de BUG-002:** Refactorización de `cancelReservation` para cálculo milimétrico de horas previas.
3. **Refactorización TDD:** Incorporación de validaciones defensivas y constantes en `calculateDepositFee`.

---

## 3. Matriz de Pruebas de Regresión

| Prueba Original | Funcionalidad | Modificación Realizada | Resultado Previo | Resultado de Regresión | ¿Regresión Detectada? |
| :--- | :--- | :--- | :---: | :---: | :---: |
| **CP-01** (2 pers. Miércoles) | RF02 | Refactorización de constantes | Pass | **Pass** (Total: \$4.000) | No |
| **CP-02** (4 pers. Jueves) | RF02 | Agregado de defensas de tipo | Pass | **Pass** (Total: \$8.000) | No |
| **CP-03** (5 pers. Miércoles) | RF02 | Lógica de recargo de grupo | Pass | **Pass** (Total: \$11.000) | No |
| **CP-04** (12 pers. Viernes) | RF02 | Corrección de BUG-001 (Viernes) | Fail | **Pass** (Total: \$30.360) | No (Bug resuelto) |
| **CP-07** (Registro normal) | RF01 | Integración con seña refactorizada | Pass | **Pass** (Estado pendiente) | No |
| **CP-08** (Confirmación de seña) | RF03 | Chequeo de monto exacto | Pass | **Pass** (Estado confirmada) | No |
| **CP-09** (Cancelación a tiempo) | RF04 | Corrección BUG-002 (24 horas) | Pass | **Pass** (Cancelada y cupo libre) | No |
| **CP-10** (Cancelación <24 hs) | RF04 | Corrección BUG-002 (24 horas) | Fail | **Pass** (Lanza RangeError) | No (Bug resuelto) |
| **CP-11** (Límite 50 cupos) | RF05 | Flujo de múltiples reservas | Pass | **Pass** (Overbooking bloqueado) | No |

---

## 4. Resultados Obtenidos

- **Total de pruebas en suite de regresión:** 25 casos.
- **Tasa de aprobación:** 100%.
- **Impacto colateral detectado:** Cero efectos secundarios.
- **Conclusión:** El sistema se encuentra en un estado sumamente estable y listo para la fase de auditoría de artefactos y entrega.
