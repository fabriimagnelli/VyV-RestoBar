# Etapa 4: Verificación del Software - Inspección y Revisiones

**Asignatura:** Verificación y Validación de Software (3° Año TSDS - UPC)  
**Proyecto:** Sistema de Reservas para Resto-Bar  
**Integrantes:** Alex Combina (Desarrollo) y Fabrizio Magnelli (QA y Gestión)  
**Fecha:** 27 de Octubre de 2026  

---

## 1. Objetivo de la Verificación

Realizar un análisis estático, inspección de código y revisión cruzada de la arquitectura desarrollada frente a los requisitos formales (Etapa 1 y directivas de la cátedra), identificando discrepancias antes de la fase de pruebas dinámicas.

---

## 2. Matriz de Trazabilidad: Requisitos vs. Código Implementado

| Requisito | Descripción | Componente / Archivo | Método / Función | Estado de Verificación |
| :--- | :--- | :--- | :--- | :---: |
| **RF01** | Registrar Reserva | `src/services/reservationService.js` | `createReservation()` | **Conforme** |
| **RF02** | Calcular Seña y Recargos | `src/services/feeCalculator.js` | `calculateDepositFee()` | **Conforme** |
| **RF03** | Confirmar Reserva | `src/services/reservationService.js` | `confirmReservation()` | **Conforme** |
| **RF04** | Cancelar Reserva (<24hs) | `src/services/reservationService.js` | `cancelReservation()` | **Conforme** |
| **RF05** | Consultar Disponibilidad | `src/services/reservationService.js` | `getAvailability()` | **Conforme** |

---

## 3. Revisión Estática e Inspección de Código

Se aplicaron técnicas de inspección técnica basada en listas de control (*Checklists*):

### Checklist de Calidad Técnica:
1. **Validación de Parámetros:**
   - ¿Se verifican tipos de datos (`typeof`, `Number.isInteger`)? **Sí.**
   - ¿Se comprueban valores nulos, indefinidos y cadenas vacías? **Sí.**
   - ¿Se lanzan excepciones específicas (`TypeError`, `RangeError`)? **Sí.**
2. **Consistencia de Reglas de Negocio:**
   - ¿El cálculo de seña aplica el 10% únicamente a grupos de 5 a 12? **Sí**, implementado con `guests >= 5`.
   - ¿El cálculo de fin de semana aplica el 15% sobre el total acumulado en viernes y sábados? **Sí**, evaluado con `isWeekend(date)`.
   - ¿El cupo máximo por turno respeta los 50 comensales? **Sí**, constante `MAX_CAPACITY_PER_SHIFT = 50`.
   - ¿El margen de cancelación exige 24 horas exactas respecto al inicio del turno? **Sí**, calculando la diferencia horaria estricta.

---

## 4. Hallazgos y Acciones Correctivas Registradas

Durante la revisión estática y cruzada realizada por Fabrizio Magnelli sobre el código provisto por Alex Combina, se detectó el siguiente punto:

- **Hallazgo 1 (Cálculo de fin de semana en zonas horarias):**
  - *Problema:* Al parsear una fecha string con `new Date("2026-10-30")`, en ciertos motores de JavaScript puede interpretarse como UTC medianoche, lo que desplaza el día local si no se parsean los componentes año, mes y día de forma manual.
  - *Acción realizada:* Se implementó un extractor específico con `.split('-')` y `new Date(year, month - 1, day)` en `isWeekend()` para asegurar consistencia absoluta independientemente del timezone de ejecución.

- **Conclusión de la Verificación:**
  El diseño y código cumplen con las especificaciones y están listos para someterse al diseño y ejecución exhaustiva de casos de prueba de caja negra y caja blanca.
