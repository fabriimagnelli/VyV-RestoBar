# Etapa 1: Análisis del Problema - Sistema de Reservas Resto-Bar

## 1. Problema o necesidad
El resto-bar gestiona actualmente sus reservas de forma manual, telefónica o por mensajería, lo que genera sobreventa de mesas en horarios pico, falta de validación en la capacidad física del local, reservas duplicadas y ausencia de confirmaciones automáticas de señas.

## 2. Usuarios del sistema
- **Cliente / Comensal:** Realiza la solicitud de reserva indicando fecha, turno (11:00 a 14:00 y 20:00 a 00:30) y cantidad de personas.
- **Encargado / Administrador:** Visualiza, confirma o cancela reservas y controla la capacidad del turno.

## 3. Objetivo
Desarrollar un sistema de software confiable y testeable que automatice el registro, cálculo de señas/cupos y gestión de estados de reservas, garantizando consistencia de datos y cumplimiento de políticas del local.

## 4. Funcionalidades Principales
1. **Gestión y Registro de Reservas:** Alta validando turnos y aforo disponible.
2. **Motor de Cálculo de Seña y Descuentos:** Cálculo automático basado en grupo, día y recargos (módulo central para TDD y Caja Blanca).
3. **Control de Estados y Cancelaciones:** Transición controlada (Pendiente, Confirmada, Cancelada, Finalizada) y validación de tiempos límite.

## 5. Reglas de Negocio y Restricciones
- **Turnos:** Turno 1 (11:00 a 14:00 hs) | Turno 2 (20:00 a 00:30 hs).
- **Capacidad máxima por turno:** 50 comensales.
- **Tamaño del grupo:** Mínimo 1, máximo 12 comensales por reserva.
- **Antelación:** Entre hoy y máximo 30 días posteriores. Fechas pasadas bloqueadas.
- **Cálculo de Seña:**
  - Base: $2.000 por persona (1 a 4 comensales).
  - Grupos (5 a 12 comensales): Base ($2.000 c/u) + 10% de recargo sobre el subtotal.
  - Fin de semana (Viernes y Sábados): 15% adicional sobre el total de la seña.
- **Cancelaciones:** Hasta 24 horas antes del turno de reserva sin penalización.

## 6. Requisitos Funcionales Formales
| ID       | Nombre                   | Entrada                                            | Salida / Resultado                                           |
| :------- | :----------------------- | :------------------------------------------------- | :----------------------------------------------------------- |
| **RF01** | Registrar Reserva        | Nombre, teléfono, fecha, turno (1 o 2), comensales | Reserva en estado `Pendiente` + código único                 |
| **RF02** | Calcular Importe de Seña | Cantidad de personas, fecha (día)                  | Monto exacto calculado según fórmulas                        |
| **RF03** | Confirmar Reserva        | Código de reserva, monto abonado                   | Estado a `Confirmada` y descuento definitivo de cupo         |
| **RF04** | Cancelar Reserva         | Código de reserva, timestamp actual                | Estado `Cancelada` + cupo liberado o rechazo si expiró plazo |
| **RF05** | Consultar Disponibilidad | Fecha, turno                                       | Lugares disponibles (0 a 50)                                 |