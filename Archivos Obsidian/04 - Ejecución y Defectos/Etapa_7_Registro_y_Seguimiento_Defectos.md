# Etapa 7: Registro y Seguimiento de Defectos (Bugs)

**Asignatura:** Verificación y Validación de Software (3° Año TSDS - UPC)  
**Proyecto:** Sistema de Reservas para Resto-Bar  
**Responsable de Registro:** Fabrizio Magnelli (QA Lead)  
**Responsable de Corrección:** Alex Combina (Desarrollo)  
**Fecha:** 27 de Octubre de 2026  

---

## 1. Flujo de Vida de Defectos

```
[ Abierto / Detectado ] ──> [ En Análisis ] ──> [ Corregido ] ──> [ Verificado por Pruebas ] ──> [ Cerrado ]
```

---

## 2. Registro Histórico de Defectos

### Reporte de Defecto: BUG-001 (Resuelto)
* **ID:** `BUG-001`
* **Fecha:** 2026-10-27
* **Funcionalidad afectada:** RF02 - Cálculo de Seña
* **Severidad:** Alta | **Prioridad:** Alta | **Estado:** **Cerrado (Resuelto)**
* **Descripción:** En la implementación inicial del motor de señas, el recargo del 15% de fin de semana no se aplicaba a los días viernes, evaluando erróneamente solo sábados y domingos.
* **Pasos para reproducir:**
  1. Solicitar reserva para un día Viernes (`2026-10-30`) en Turno 1.
  2. Ingresar 2 comensales.
  3. Ejecutar `calculateDepositFee(2, '2026-10-30')`.
* **Resultado Esperado:** Seña base \$4.000 + 15% recargo = **\$4.600**.
* **Resultado Obtenido Original:** El sistema devolvía \$4.000 (omitiendo el recargo de fin de semana del viernes).
* **Evidencia:** Fallo en aserción de prueba `assert.strictEqual(res.totalFee, 4600)`.
* **Causa Raíz:** En la función `isWeekend`, la condición original verificaba `dayOfWeek === 6 || dayOfWeek === 0` (sábado/domingo) en lugar de viernes (5) y sábado (6) conforme al requerimiento del resto-bar.
* **Solución aplicada por Alex Combina:** Se actualizó `isWeekend` para evaluar estrictamente `dayOfWeek === 5 || dayOfWeek === 6`.
* **Verificación de cierre:** Test `CP-04` y test unitario de `isWeekend` ejecutados con éxito. Estado promovido a **Cerrado**.

---

### Reporte de Defecto: BUG-002 (Resuelto)
* **ID:** `BUG-002`
* **Fecha:** 2026-10-27
* **Funcionalidad afectada:** RF04 - Cancelación de Reservas
* **Severidad:** Media | **Prioridad:** Alta | **Estado:** **Cerrado (Resuelto)**
* **Descripción:** La validación de 24 horas previas para cancelación evaluaba únicamente la diferencia de días calendario (`diffDays < 1`) en lugar de calcular la diferencia exacta de horas respecto a la hora de inicio del turno reservado (11:00 hs para Turno 1 o 20:00 hs para Turno 2).
* **Pasos para reproducir:**
  1. Registrar una reserva para mañana en Turno 2 (inicia a las 20:00 hs).
  2. Hoy a las 21:00 hs intentar cancelar (faltan 23 horas, incumpliendo el margen).
  3. El comparador de días calendario consideraba 1 día de diferencia y autorizaba la cancelación.
* **Resultado Esperado:** Lanzar `RangeError` por no cumplir con las 24 horas exactas de anticipación.
* **Resultado Obtenido Original:** Cancelación permitida erróneamente a menos de 24 hs.
* **Solución aplicada por Alex Combina:** Se refactorizó `cancelReservation` para reconstruir la estampa de tiempo precisa `shiftStartTime = new Date(year, month - 1, day, shiftInfo.startHour, shiftInfo.startMinute)` y contrastar la diferencia en horas `(shiftStartTime - currentTimestamp) / (1000 * 60 * 60) >= 24`.
* **Verificación de cierre:** Caso de prueba `CP-10` validado y aprobado exitosamente. Estado promovido a **Cerrado**.
