# Etapa 3: Desarrollo del Sistema - Sistema Resto-Bar

**Asignatura:** Verificación y Validación de Software (3° Año TSDS - UPC)  
**Proyecto:** Sistema de Reservas para Resto-Bar  
**Integrantes:** Alex Combina (Desarrollo) y Fabrizio Magnelli (QA y Gestión)  
**Fecha:** 27 de Octubre de 2026  

---

## 1. Arquitectura y Módulos Desarrollados

Para dar estricto cumplimiento a los requisitos académicos y de negocio, se diseñó una arquitectura desacoplada y modular con responsabilidades bien delimitadas:

```
src/
├── services/
│   ├── feeCalculator.js      # RF02: Motor de cálculo de seña, recargos y validación de fin de semana
│   └── reservationService.js # RF01, RF03, RF04, RF05: Lógica de negocio, cupos y transiciones de estado
├── store.js                  # Capa de persistencia reactiva en frontend (localStorage)
├── main.js                   # Controlador de vistas y eventos de usuario
└── style.css                 # Diseño visual y responsive del resto-bar
```

---

## 2. Implementación de Funcionalidades Principales

### 2.1 RF02 - Motor de Cálculo de Seña (`src/services/feeCalculator.js`)
- **Regla Base:** $2.000 por comensal para grupos de 1 a 4 personas.
- **Regla de Grupo:** Para 5 a 12 comensales, se adiciona un **10% de recargo** sobre el subtotal base.
- **Regla de Fin de Semana:** Si la fecha solicitada cae en **Viernes o Sábado**, se aplica un **15% de recargo adicional** sobre el total de la seña.
- **Validaciones Defensivas:**
  - Control de tipo numérico entero para `guests` (`Number.isInteger`).
  - Rango admisible estricto: mínimo 1 y máximo 12 comensales.
  - Formato de fecha verificado contra strings ISO (`YYYY-MM-DD`) o instancias de `Date`.

### 2.2 RF01, RF03, RF04 y RF05 - Servicio de Reservas (`src/services/reservationService.js`)
- **RF01 (Registro):** Valida turnos válidos (1: 11:00-14:00 | 2: 20:00-00:30), límites temporales (no pasadas, máx 30 días futuros) y disponibilidad de cupo antes de crear la reserva en estado `pendiente`.
- **RF03 (Confirmación):** Valida código único y que el monto abonado cubra el total de la seña requerida, actualizando el estado a `confirmada`.
- **RF04 (Cancelación):** Aplica la regla estricta de tiempo límite: permite cancelación sin penalización y libera el cupo solo si se solicita con al menos **24 horas de antelación** al inicio del turno.
- **RF05 (Disponibilidad):** Computa dinámicamente la suma de comensales reservados en el turno respecto al límite de 50 lugares.

---

## 3. Manejo de Errores y Programación Defensiva

El sistema contempla situaciones incorrectas mediante excepciones estándar de JavaScript:
- `TypeError`: Invocaciones con tipos de datos inválidos (strings en vez de números, fechas nulas o vacías).
- `RangeError`: Parámetros fuera de los límites de negocio (comensales < 1 o > 12, fechas pasadas, cancelaciones con menos de 24 hs, turno fuera de [1, 2]).
- `Error`: Errores de flujo de negocio (reservas no encontradas, transiciones de estado inválidas como cancelar reservas ya canceladas).

---

## 4. Control de Versiones

Todo el código y avance fue comiteado en el repositorio central de GitHub en la rama principal (`main`), garantizando la trazabilidad de los cambios realizados por el equipo.
