# Reporte de Defecto: BUG-001
(Esto es la plantilla de ejemplo para el registro de defectos/bugs)

* **Fecha:** 2026-10-27
* **Funcionalidad afectada:** RF02 - Cálculo de Seña
* **Severidad:** Alta | **Prioridad:** Alta | **Estado:** Abierto
* **Descripción:** El sistema no aplica el recargo del 15% en reservas para días viernes.
* **Pasos para reproducir:**
  1. Solicitar reserva para el próximo viernes en Turno 1.
  2. Ingresar 2 comensales.
  3. Ejecutar el cálculo de seña.
* **Resultado Esperado:** Seña base $4.000 + 15% recargo = $4.600.
* **Resultado Obtenido:** El sistema devolvió $4.000 (omitió el recargo de fin de semana).
* **Evidencia:** `AssertionError: expected 4000 to be 4600` en `tests/seña.test.js`.