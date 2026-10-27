# Etapa 6: Ejecución de Pruebas y Resultados

**Asignatura:** Verificación y Validación de Software (3° Año TSDS - UPC)  
**Proyecto:** Sistema de Reservas para Resto-Bar  
**Tester Técnico:** Fabrizio Magnelli  
**Fecha de Ejecución:** 27 de Octubre de 2026  
**Entorno de Ejecución:** Node.js v22.18.0 / Windows 11 (Runner nativo `node:test`)  

---

## 1. Resumen General de la Ejecución

| Métrica | Valor |
| :--- | :--- |
| **Total de Casos Ejecutados** | 25 |
| **Casos Aprobados (Pass)** | 25 |
| **Casos Fallidos (Fail)** | 0 |
| **Casos Cancelados / Salteados** | 0 |
| **Tasa de Éxito** | **100%** |
| **Tiempo de Ejecución** | 126.96 ms |

---

## 2. Registro Detallado por Caso de Prueba Formal

| ID | Funcionalidad | Tipo de Caso | Entrada de Prueba | Resultado Esperado | Resultado Obtenido | Estado |
| :--- | :--- | :--- | :--- | :--- | :--- | :---: |
| **CP-01** | RF02 | Nominal | 2 personas, Miércoles (2026-10-28) | Total: \$4.000 (sin recargo) | Total: \$4.000 | **Aprobado** |
| **CP-02** | RF02 | Límite sup. sin recargo | 4 personas, Jueves (2026-10-29) | Total: \$8.000 (sin recargo) | Total: \$8.000 | **Aprobado** |
| **CP-03** | RF02 | Límite inf. con recargo | 5 personas, Miércoles (2026-10-28) | Base \$10.000 + 10% = \$11.000 | Total: \$11.000 | **Aprobado** |
| **CP-04** | RF02 | Límite sup. doble recargo | 12 personas, Viernes (2026-10-30) | Base \$24k + 10% + 15% = \$30.360 | Total: \$30.360 | **Aprobado** |
| **CP-05** | RF02 | Límite inferior inválido | 0 comensales | Excepción `RangeError` | Lanza `RangeError` | **Aprobado** |
| **CP-06** | RF02 | Límite superior inválido | 13 comensales | Excepción `RangeError` | Lanza `RangeError` | **Aprobado** |
| **CP-07** | RF01 | Registro nominal | 4 personas, Turno 1, fecha válida | Estado `pendiente`, seña \$8.000 | Creada en `pendiente` | **Aprobado** |
| **CP-08** | RF03 | Confirmación normal | Pago exacto de \$4.000 para seña \$4.000 | Estado `confirmada` | Estado `confirmada` | **Aprobado** |
| **CP-09** | RF04 | Cancelación a tiempo | Solicitud con 49 hs de anticipación | Estado `cancelada` y cupo restaurado | Cancelada, aforo 50/50 | **Aprobado** |
| **CP-10** | RF04 | Cancelación fuera de plazo| Solicitud con 3 hs de anticipación | Excepción `RangeError` | Lanza `RangeError` | **Aprobado** |
| **CP-11** | RF05 | Aforo máximo (50 pers.) | Ocupar 48 y solicitar 4 | Excepción `RangeError` por aforo | Rechazada por aforo | **Aprobado** |

---

## 3. Pruebas Adicionales Ejecutadas (Robustez y Defensivas)

- Validación de fin de semana (`isWeekend`):
  - Miércoles $\rightarrow$ `false` (Aprobado).
  - Viernes $\rightarrow$ `true` (Aprobado).
  - Sábado $\rightarrow$ `true` (Aprobado).
  - Domingo $\rightarrow$ `false` (Aprobado).
  - Fecha vacía o inválida $\rightarrow$ Excepción controlada (Aprobado).
- Protección contra tipos erróneos:
  - Comensales con decimales (`2.5`) $\rightarrow$ Rechazado con `TypeError` (Aprobado).
  - Comensales negativos (`-3`) $\rightarrow$ Rechazado con `RangeError` (Aprobado).
  - Valores `null` o cadenas $\rightarrow$ Rechazados con `TypeError` (Aprobado).
- Reglas de agenda:
  - Fechas pasadas $\rightarrow$ Rechazadas con `RangeError` (Aprobado).
  - Fechas con anticipación mayor a 30 días $\rightarrow$ Rechazadas con `RangeError` (Aprobado).
  - Turnos inválidos (distintos de 1 o 2) $\rightarrow$ Rechazados con `RangeError` (Aprobado).

---

## 4. Evidencia de Ejecución (Consola de Test Runner)

```bash
> sistema-restaurante-reservas@1.0.0 test
> node --test tests/**/*.test.js

TAP version 13
# Subtest: RF02: Motor de Cálculo de Señas y Recargos
    # Subtest: Función auxiliar: isWeekend (6 tests) -> ok
    # Subtest: Caja Negra: Partición en Clases de Equivalencia y Valores Límite (5 tests) -> ok
    # Subtest: Pruebas Defensivas y de Excepción (Datos Inválidos) (5 tests) -> ok
ok 1 - RF02: Motor de Cálculo de Señas y Recargos (11.5 ms)

# Subtest: Servicio de Gestión de Reservas y Cupos (RF01, RF03, RF04, RF05)
    # Subtest: RF01: Registro de Reserva (4 tests) -> ok
    # Subtest: RF03: Confirmación de Reserva (2 tests) -> ok
    # Subtest: RF04: Cancelación y Plazo de 24 hs (2 tests) -> ok
    # Subtest: RF05: Control de Capacidad y Prevención de Overbooking (1 test) -> ok
ok 2 - Servicio de Gestión de Reservas y Cupos (RF01, RF03, RF04, RF05) (10.5 ms)

1..2
# tests 25
# suites 9
# pass 25
# fail 0
# duration_ms 126.96
```
