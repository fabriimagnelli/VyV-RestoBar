# Reporte Técnico: Pruebas de Estrés y Concurrencia en Sistema de Turnos

> **Fecha y Hora:** 2026-10-16T14:21:13.366Z  
> **Motor LLM:** `gemini-3.5-flash`  
> **API Objetivo:** `http://localhost:3001/api`  
> **Duración de la Simulación:** 152.62 segundos  

---

## 1. Resumen Ejecutivo de Telemetría

| Métrica | Valor |
| :--- | :--- |
| **Total de Peticiones** | `12` |
| **Fallos de Concurrencia (Overbooking)** | `1` |
| **Errores 500 no controlados** | `0` |

---

## 2. Latencias y Desempeño por Endpoint

| Endpoint | Invocaciones | Tasa Éxito | Mín (ms) | Prom (ms) | Máx (ms) | P95 (ms) | Códigos HTTP |
| :--- | :---: | :---: | :---: | :---: | :---: | :---: | :--- |
| `consultar_disponibilidad` | 2 | 100% | 38.23 | 50.49 | 62.75 | 62.75 | `200`: 2 |
| `obtener_agenda_diaria` | 2 | 100% | 46.93 | 51.59 | 56.26 | 56.26 | `200`: 2 |
| `reservar_turno` | 5 | 100% | 94.57 | 105.3 | 112.44 | 112.44 | `201`: 5 |
| `reprogramar_turno` | 1 | 0% | 60.17 | 60.17 | 60.17 | 60.17 | `409`: 1 |
| `cancelar_turno` | 1 | 100% | 39.86 | 39.86 | 39.86 | 39.86 | `200`: 1 |
| `cierre_jornada` | 1 | 100% | 67.64 | 67.64 | 67.64 | 67.64 | `200`: 1 |

---

## 3. Auditoría de Concurrencia y Condiciones de Carrera

🚨 **Se detectaron 1 fallos críticos de integridad:**

### Caso #1: CRITICAL_OVERBOOKING_RACE_CONDITION (Severidad: ALTA)
- **Descripción:** Se detectó doble asignación del mismo slot horario (2026-10-25 a las 11:00 con profesional prof_101).
- **Slot:** `{"profesional_id":"prof_101","fecha":"2026-10-25","hora":"11:00"}`
- **Turnos Colisionados:** `trn_1001, trn_1003`
- **Detalle:** El sistema confirmó 2 reservas simultáneas sin rechazar con 409 Conflict ni bloquear la fila.


---

## 4. Errores 500 No Controlados

✅ **Cero errores internos (500) registrados.**

---

## 5. Recomendaciones de Optimización de Base de Datos

```sql
-- 1. Índice único condicional para evitar overbooking a nivel de motor DB:
CREATE UNIQUE INDEX uq_turnos_slot_activo 
ON reservas (profesional_id, fecha, hora) 
WHERE estado NOT IN ('CANCELADO');

-- 2. Bloqueo pesimista en la transacción de reserva:
BEGIN;
SELECT id, estado FROM turnos_slots 
WHERE profesional_id = $1 AND fecha = $2 AND hora = $3 
FOR UPDATE;

INSERT INTO reservas (profesional_id, fecha, hora, cliente_id, estado)
VALUES ($1, $2, $3, $4, 'CONFIRMADO');
COMMIT;

-- 3. Control optimista de concurrencia para reprogramación:
UPDATE reservas 
SET fecha = $1, hora = $2, version = version + 1 
WHERE id = $3 AND version = $current_version;
```

---

## 6. Dictamen del Agente Autónomo

# Informe de Auditoría y Diagnóstico de Estrés, Concurrencia e Integridad de API

**Fecha de Auditoría:** 2026-10-16  
**Objetivo Evaluado:** `prof_101` | Servicio: `consulta_general` | Fecha de operaciones: `2026-10-25`  
**Nivel de Severidad General:** 🔴 **CRÍTICO (Vulnerabilidad de Integridad y Concurrencia detectada)**

---

### 1. Resumen Ejecutivo de Hallazgos

| Prueba | Vector Evaluado | Resultado | Código HTTP | Impacto |
| :--- | :--- | :---: | :---: | :--- |
| **P1. Reconocimiento Inicial** | Disponibilidad y Agenda vacía | ✅ Aprobado | 200 OK | 12 slots libres identificados. Latencia: ~60 ms. |
| **P2. Reservas Masivas** | Inserción en slots secuenciales | ✅ Aprobado | 201 Created | Creación correcta de turnos `trn_1002`, `trn_1004`, `trn_1005`. |
| **P3. Race Condition / Overbooking** | Colisión simultánea en `11:00` | ❌ **FALLO CRÍTICO** | 201 Created (ambos) | **Doble reserva confirmada** (`trn_1001` y `trn_1003`) en el mismo slot. |
| **P4. Solapamiento en Reprogramación**| Reprogramar `trn_1005` a slot ocupado (`09:00`) | ✅ Aprobado | 409 Conflict | Rechazó colisión con mensaje de solapamiento. |
| **P5. Cancelación y Liberación** | Cancelar `trn_1002` y verificar liberación | ✅ Aprobado | 200 OK | Slot `09:00` liberado y disponible de inmediato. |
| **P6. Cierre de Jornada y Auditoría** | Balance contable/operativo vs. DB | ⚠️ Advertencia | 200 OK | Balance matemático cuadra (5 turnos totales), pero arrastra el overbooking. |

---

### 2. Detalle Técnico de la Vulnerabilidad Crítica: Overbooking (Race Condition)

* **Descripción:** Al emitir reservas cuasi-simultáneas para el mismo profesional (`prof_101`), fecha (`2026-10-25`) y hora (`11:00`):
  * **Turno 1:** Cliente A Race (`trn_1001`), HTTP 201 Created, `CONFIRMADO` (Latencia: 94.57 ms).
  * **Turno 2:** Cliente B Race (`trn_1003`), HTTP 201 Created, `CONFIRMADO` (Latencia: 109.08 ms).
* **Causa Raíz:** Ausencia de control de concurrencia optimista/pesimista, bloqueos a nivel de fila (*pessimistic locking* / `SELECT FOR UPDATE`) o índice único compuesto a nivel de base de datos (`UNIQUE (profesional_id, fecha, hora)`).
* **Riesgo Operativo:** Sobreventa de citas, degradación de servicio al cliente y fallos logísticos en el consultorio.

---

### 3. Evaluación de Reprogramación, Cancelación y Cierre

1. **Reprogramación:**  
   Al intentar mover `trn_1005` (10:00) a `09:00` (ocupado por `trn_1002` antes de su cancelación), la API devolvió HTTP `409 Conflict`:  
   `"Conflicto de solapamiento: el horario destino ya está ocupado por otro turno."`  
   *La lógica de validación de solapamiento en reprogramación sí está implementada.*

2. **Cancelación y Liberación Inmediata:**  
   Al dar de baja el turno `trn_1002` (`09:00`), la disponibilidad se recalculó de forma síncrona y consistente: el slot `09:00` volvió a figurar en `slots_libres` (subiendo de 8 a 9 slots libres).

3. **Conciliación de Cierre de Jornada:**  
   * **Total turnos registrados en BD:** 5 (`trn_1001`, `trn_1002`, `trn_1003`, `trn_1004`, `trn_1005`).  
   * **Cancelados:** 1 (`trn_1002`).  
   * **Confirmados / Atendidos:** 4 (`trn_1001` [11:00], `trn_1003` [11:00], `trn_1004` [09:30], `trn_1005` [10:00]).  
   * **Resultado Cierre:** `total_turnos: 5, atendidos: 4, cancelados: 1, ausentes: 0`.  
   * **Diagnóstico:** El cierre concilia matemáticamente con los registros existentes, pero no emite alertas ante inconsistencias de slots duplicados.

---

### 4. Perfil de Rendimiento y Latencia

* **Consultas de disponibilidad y agenda:** 38.2 ms – 62.8 ms.
* **Operaciones de escritura (reservas):** 94.5 ms – 112.4 ms.
* **Operaciones de mutación/cancelación:** 39.8 ms – 67.6 ms.
* **Conclusión de latencia:** No se observaron cuellos de botella ni degradación por contención de I/O.

---

### 5. Recomendaciones de Remediación Obligatorias

1. **Restricción de Integridad en DB:**  
   Implementar una restricción única condicional para turnos activos:
   ```sql
   CREATE UNIQUE INDEX uq_profesional_fecha_hora_activo 
   ON turnos (profesional_id, fecha, hora) 
   WHERE estado NOT IN ('CANCELADO');
   ```
2. **Manejo de Transacciones y Aislamiento:**  
   Envolver la reserva en una transacción con nivel de aislamiento `SERIALIZABLE` o utilizar Redis/Redlock para un cerrojo distribuido por clave `lock:turno:{profesional_id}:{fecha}:{hora}` durante la verificación e inserción.
3. **Respuesta HTTP Estándar:**  
   Cuando ocurra una colisión en el endpoint de reservas, responder con código HTTP `409 Conflict` (idéntico al comportamiento observado en la reprogramación).
4. **Regla de Integridad en Cierre de Jornada:**  
   Agregar una verificación en `cierre_jornada` que audite y alerte en caso de detectar múltiples turnos activos compartiendo el mismo slot horario.
